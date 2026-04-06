## Contact form

The contact form now submits to `/api/contact` through the local Express server.

- The form now tries EmailJS first when the `VITE_EMAILJS_*` keys are present
- `RESEND_API_KEY` is used to send the email through Resend
- `CONTACT_TO_EMAIL` is the inbox that receives messages
- `CONTACT_FROM_EMAIL` must be a verified sender in Resend
- If email is not configured yet, submissions are still saved locally in `data/contact-submissions.ndjson`

For a production-style local check, run:
`npm run preview`
