# parkerparkerparker.com

Personal portfolio at [parkerparkerparker.com](https://parkerparkerparker.com), built with Next.js, React, TypeScript, and Tailwind CSS v4.

The site includes About, Experience, and Contact pages, plus an animated ASCII globe with five shaded ships. Animation pauses when offscreen or hidden and respects reduced-motion preferences.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run `npm run build` to check the production build and `npm run lint` to run ESLint. The build downloads Courier Prime through Google Fonts; the contact form requires outbound SMTP access at runtime.

## Deployment

Vercel is the recommended deployment target. Import this repository in Vercel, then add `parkerparkerparker.com` to the project and use the DNS records Vercel supplies in the existing Route 53 hosted zone.

## Contact form

The Contact page sends messages from your Zoho mailbox to `me@parkerparkerparker.com` through an encrypted SMTP connection. Set these server-side environment variables locally in `.env.local` and in the Vercel project's Production environment:

- `ZOHO_SMTP_PASSWORD`: a Zoho app-specific password. Generate it in Zoho Accounts → Security → App passwords. Keep it out of source control and chat.
- `ZOHO_SMTP_USER`: the mailbox used to authenticate and send. Defaults to `me@parkerparkerparker.com`.
- `ZOHO_SMTP_HOST`: the outgoing server shown in your Zoho Mail account settings. Defaults to `smtppro.zoho.com` for the current Mail Lite account. The connection uses port 465 with TLS.

Replies go to the visitor's email address. The form confirms success only after Zoho accepts the message. If sending is unavailable, it preserves the visitor's message and shows an error; it does not open their email app. Redeploy after adding or changing environment variables.

See [Zoho's SMTP settings](https://www.zoho.com/mail/help/zoho-smtp.html) and [app password instructions](https://www.zoho.com/mail/help/adminconsole/two-factor-authentication.html).
