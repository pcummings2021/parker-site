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

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("Contact email is not configured.");
    return Response.json({ error: "Email is unavailable." }, { status: 503 });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: email,
        subject: "New message from parkerparkerparker.com",
        text: `From: ${email}\n\n${message.trim()}`,
      }),
    });

    if (!response.ok) {
      console.error("Contact email provider rejected the request:", response.status);
      return Response.json({ error: "Email could not be sent." }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Contact email provider failed:", error);
    return Response.json({ error: "Email could not be sent." }, { status: 502 });
  }
}
