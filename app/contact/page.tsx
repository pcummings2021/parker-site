import type { Metadata } from "next";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Parker about a collaboration or project.",
};

export default function ContactPage() {
  return (
    <main id="main-content" className="page">
      <h1 className="sr-only">Contact</h1>
      <div className="page-content">
        <p>Get in touch about opportunities, projects, or questions.</p>
        <p>You can write to <a href="mailto:me@parkerparkerparker.com">me@parkerparkerparker.com</a> or use the form below.</p>
        <ContactForm />
      </div>
    </main>
  );
}
