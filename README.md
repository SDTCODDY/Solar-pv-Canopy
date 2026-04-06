<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.


## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` from `.env.example`
3. Set the `GEMINI_API_KEY` in `.env.local` if you use Gemini features
4. Configure the contact form in `.env.local`:
   `VITE_EMAILJS_PUBLIC_KEY`, `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_CONTACT_TEMPLATE_ID`
5. Optional:
   Add `VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID` if you want a second EmailJS auto-reply send from the app
6. Optional backend fallback:
   `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL`
7. Run the app:
   `npm run dev`

## Contact form

The contact form now submits to `/api/contact` through the local Express server.

- The form now tries EmailJS first when the `VITE_EMAILJS_*` keys are present
- `RESEND_API_KEY` is used to send the email through Resend
- `CONTACT_TO_EMAIL` is the inbox that receives messages
- `CONTACT_FROM_EMAIL` must be a verified sender in Resend
- If email is not configured yet, submissions are still saved locally in `data/contact-submissions.ndjson`

For a production-style local check, run:
`npm run preview`
