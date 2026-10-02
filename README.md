# parkerparkerparker.com

Minimal portfolio POC built with Next.js, React, TypeScript, and Tailwind CSS v4.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Vercel is the recommended deployment target. Import this repository in Vercel, then add `parkerparkerparker.com` to the project and use the DNS records Vercel supplies in the existing Route 53 hosted zone.

## Contact form

The Contact page sends messages to `me@parkerparkerparker.com` through Resend. Verify `parkerparkerparker.com` (or a sending subdomain) in Resend, then set these server-side environment variables locally in `.env.local` and in the Vercel project:

- `RESEND_API_KEY`: a Resend API key with permission to send email.
- `CONTACT_FROM_EMAIL`: a sender on the verified domain, for example `Parker Website <contact@parkerparkerparker.com>`.

The visitor's address is used as the message's reply-to address. Until both variables are configured, submitting the form opens the visitor's email app with a prepared message to the same recipient. The form does not claim the message was sent until the API confirms delivery.
