
const WA_NUMBER = "601130842771";
function waLink(message){return "https://wa.me/"+WA_NUMBER+"?text="+encodeURIComponent(message);}
document.querySelectorAll("[data-wa]").forEach(el=>el.addEventListener("click",()=>window.open(waLink(el.dataset.wa||"Hello NESH Computer Services, I would like to enquire about your services."),"_blank","noopener")));
const menuBtn=document.querySelector(".menu-btn"),navLinks=document.querySelector(".navlinks");
if(menuBtn&&navLinks){menuBtn.addEventListener("click",()=>{const open=navLinks.classList.toggle("open");menuBtn.setAttribute("aria-expanded",String(open));});}
const dateInput=document.querySelector("#booking-date");
if(dateInput){const parts=new Intl.DateTimeFormat("en",{timeZone:"Asia/Kuala_Lumpur",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());const date=Object.fromEntries(parts.map(({type,value})=>[type,value]));dateInput.min=`${date.year}-${date.month}-${date.day}`;}
const bookingForm=document.querySelector("#booking-form");
if(bookingForm){bookingForm.addEventListener("submit",async e=>{
e.preventDefault();
if(!bookingForm.reportValidity())return;
const status=document.querySelector("#form-status");
const submitButton=bookingForm.querySelector('button[type="submit"]');
const data=Object.fromEntries(new FormData(bookingForm).entries());
submitButton.disabled=true;
if(status)status.textContent="Sending your booking request...";
try{
const response=await fetch("/api/booking",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
const result=await response.json().catch(()=>({}));
if(!response.ok)throw new Error(result.error||"We couldn't send your request. Please try again.");
bookingForm.reset();
if(status)status.textContent="Your request was sent to NESH. We will contact you to confirm the appointment.";
}catch(error){
if(status)status.textContent=error.message||"We couldn't send your request. Please try again.";
}finally{
submitButton.disabled=false;
}
});}
