NESH COMPUTER SERVICES WEBSITE
==============================

FILES
- index.html       Home page
- about.html       About Us page
- services.html    Services page
- booking.html     Booking Job page
- contact.html     Contact page
- styles.css       Responsive navy/blue/white design
- script.js        Mobile navigation and WhatsApp booking
- assets/          Your supplied NESH logo

HOW TO PUBLISH
Deploy the complete folder to Vercel. The booking notification uses the
serverless function in api/booking.js; opening the HTML directly or publishing
to static-only hosting will not send booking notifications.

VERCEL AND WHATSAPP CONFIGURATION
In the Vercel project settings, add these environment variables, then redeploy:
- WHATSAPP_ACCESS_TOKEN: Meta WhatsApp Cloud API access token
- WHATSAPP_PHONE_NUMBER_ID: ID of the WhatsApp Business sender number
- WHATSAPP_RECIPIENT_PHONE: notification recipient in international digits,
	without a plus sign (for example, 60123456789)
- WHATSAPP_API_VERSION: a currently supported Meta Graph API version (for
	example, vXX.X; replace with the version supported by your Meta app)
- WHATSAPP_TEMPLATE_NAME: name of an approved WhatsApp utility template
- WHATSAPP_TEMPLATE_LANGUAGE: language code configured for that template

The approved utility template must have one body text placeholder ({{1}}),
filled with the booking details. For example: "New NESH booking: {{1}} Please
contact the customer to confirm." The recipient must have opted in to receive
messages from the configured Business sender, and should be a separate number
that can receive WhatsApp messages from that sender. Do not put the access token
in HTML or JavaScript.

BOOKING FLOW
The customer submits the form on the website. The Vercel function sends the
booking details to the configured notification recipient through the WhatsApp
Business Cloud API. The customer does not need to open WhatsApp. NESH must still
confirm the requested appointment manually. This does not reserve calendar
slots or store bookings in a database.

CONTACT DETAILS USED
WhatsApp: 011-30842771
Email: computerservicesnesh@gmail.com
Service area: Kuala Lumpur & Selangor

To change the public WhatsApp contact number, update the wa.me links in the
HTML pages. Configure the notification recipient separately in Vercel.
