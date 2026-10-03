import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const maxDuration = 30;

const recipient = "me@parkerparkerparker.com";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return Response.json({ error: "Message is too long." }, { status: 413 });
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, message, website } = payload as Record<string, unknown>;
  if (typeof website === "string" && website.trim()) return Response.json({ ok: true });
  if (typeof email !== "string" || email.length > 254 || !emailPattern.test(email) ||
      typeof message !== "string" || !message.trim() || message.length > 5000) {
    return Response.json({ error: "Enter a valid email and message." }, { status: 400 });
  }

  const user = process.env.ZOHO_SMTP_USER || recipient;
  const password = process.env.ZOHO_SMTP_PASSWORD;
  if (!password) {
    console.error("Contact email is not configured.");
    return Response.json({ error: "Email is unavailable." }, { status: 503 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST || "smtppro.zoho.com",
      port: 465,
      secure: true,
      auth: { user, pass: password },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
    });
    const result = await transporter.sendMail({
      from: { name: "Parker Website", address: user },
      to: recipient,
      replyTo: email,
      subject: "New message from parkerparkerparker.com",
      text: `From: ${email}\n\n${message.trim()}`,
    });
    if (!result.accepted.includes(recipient)) {
      throw new Error("Zoho did not accept the recipient.");
    }

    return Response.json({ ok: true });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : "SMTP_ERROR";
    console.error("Contact email delivery failed:", code);
    return Response.json({ error: "Email could not be sent." }, { status: 502 });
  }
}
