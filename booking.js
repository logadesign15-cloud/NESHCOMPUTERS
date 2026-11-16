const MAX_LENGTHS = {
  name: 80,
  phone: 30,
  service: 80,
  device: 60,
  date: 10,
  slot: 50,
  location: 100,
  details: 300,
};

function readBooking(body) {
  const booking = {};
  for (const [field, maxLength] of Object.entries(MAX_LENGTHS)) {
    const value = typeof body[field] === "string" ? body[field].trim() : "";
    if (value.length > maxLength) {
      throw new Error(`${field} is too long.`);
    }
    booking[field] = value;
  }

  for (const field of ["name", "phone", "service", "date", "slot", "location"]) {
    if (!booking[field]) {
      throw new Error(`${field} is required.`);
    }
  }
  return booking;
}

function formatBooking(booking) {
  return [
    "New NESH Computer Services booking",
    `Name: ${booking.name}`,
    `Phone: ${booking.phone}`,
    `Service: ${booking.service}`,
    `Device: ${booking.device || "Not specified"}`,
    `Preferred date: ${booking.date}`,
    `Preferred time: ${booking.slot}`,
    `Location: ${booking.location}`,
    `Job details: ${booking.details || "Not provided"}`,
  ].join("\n");
}

function getServiceDate() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${date.year}-${date.month}-${date.day}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  let booking;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Invalid booking details.");
    }
    booking = readBooking(body);
    const date = new Date(`${booking.date}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(booking.date) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== booking.date
    ) {
      throw new Error("date must be a valid calendar date.");
    }
    if (booking.date < getServiceDate()) {
      throw new Error("date cannot be in the past.");
    }
  } catch (error) {
    return res.status(400).json({ error: error.message || "Invalid booking details." });
  }

  const {
    WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_RECIPIENT_PHONE,
    WHATSAPP_API_VERSION,
    WHATSAPP_TEMPLATE_NAME,
    WHATSAPP_TEMPLATE_LANGUAGE,
  } = process.env;
  if (
    !WHATSAPP_ACCESS_TOKEN ||
    !WHATSAPP_PHONE_NUMBER_ID ||
    !WHATSAPP_RECIPIENT_PHONE ||
    !WHATSAPP_API_VERSION ||
    !WHATSAPP_TEMPLATE_NAME ||
    !WHATSAPP_TEMPLATE_LANGUAGE
  ) {
    return res.status(503).json({ error: "Booking notifications are not configured yet." });
  }

  const message = formatBooking(booking);
  try {
    const apiResponse = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: WHATSAPP_RECIPIENT_PHONE,
          type: "template",
          template: {
            name: WHATSAPP_TEMPLATE_NAME,
            language: { code: WHATSAPP_TEMPLATE_LANGUAGE },
            components: [{
              type: "body",
              parameters: [{ type: "text", text: message }],
            }],
          },
        }),
      },
    );

    if (!apiResponse.ok) {
      console.error("WhatsApp booking notification failed with status", apiResponse.status);
      return res.status(502).json({ error: "We couldn't send your request. Please try again or contact NESH." });
    }
  } catch (error) {
    console.error("WhatsApp booking notification request failed.");
    return res.status(502).json({ error: "We couldn't send your request. Please try again or contact NESH." });
  }

  return res.status(200).json({ ok: true });
};