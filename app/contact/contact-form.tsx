"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "email-app" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          message,
          website: data.get("website"),
        }),
      });

      if (response.status === 502 || response.status === 503) {
        const subject = encodeURIComponent("Message from parkerparkerparker.com");
        const body = encodeURIComponent(`From: ${email}\n\n${message}`);
        window.location.href = `mailto:me@parkerparkerparker.com?subject=${subject}&body=${body}`;
        setStatus("email-app");
        return;
      }
      if (!response.ok) throw new Error("Send failed");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8" aria-label="Contact form">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label htmlFor="email" className="mb-3 block text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">Your email</label>
        <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" className="contact-field" />
      </div>
      <div>
        <label htmlFor="message" className="mb-3 block text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">Message</label>
        <textarea id="message" name="message" required minLength={1} maxLength={5000} rows={5} placeholder="Tell me what you have in mind..." className="contact-field resize-y" />
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" disabled={status === "sending"} className="border border-black bg-black px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--paper)] transition-colors hover:bg-transparent hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60 sm:text-xs">
          {status === "sending" ? "Sending..." : "Send message ↗"}
        </button>
        <p role="status" aria-live="polite" className="max-w-xs text-xs leading-relaxed">
          {status === "sent" && "Message sent. Thank you for reaching out."}
          {status === "email-app" && "Your email app should open with the message ready. Press Send there to finish."}
          {status === "error" && "Could not send your message. Please try again or email me directly."}
        </p>
      </div>
    </form>
  );
}
