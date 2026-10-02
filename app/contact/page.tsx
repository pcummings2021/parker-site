import type { Metadata } from "next";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Parker about a collaboration or project.",
};

export default function ContactPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="grid min-h-[42vh] content-end pb-10 pt-24 sm:min-h-[52vh] sm:pb-14">
        <p className="mb-6 text-xs uppercase tracking-[0.08em] sm:text-sm">Currently available for selected collaborations.</p>
        <h1 className="hero-title text-[18vw] font-black uppercase leading-[0.78] tracking-[-0.1em] sm:text-[17vw]">
          Contact
        </h1>
      </section>

      <section className="grid gap-10 border-t border-black py-4 sm:grid-cols-2 sm:gap-16">
        <div>
          <h2 className="mb-10 text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">Get in touch</h2>
          <a className="inline-block border-b border-black pb-1 text-sm font-bold uppercase tracking-tight transition-opacity hover:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-4" href="mailto:me@parkerparkerparker.com">
            me@parkerparkerparker.com ↗
          </a>
        </div>
        <ContactForm />
      </section>
    </main>
  );
}
