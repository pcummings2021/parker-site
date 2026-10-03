import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About me",
  description: "About Parker, a software engineer turning technical ideas into useful products.",
};

export default function AboutPage() {
  return (
    <main id="main-content" className="page">
      <h1 className="page-title">About me</h1>
      <div className="page-content">
        <p>I&apos;m Parker, a software engineer working on ideas that need to exist in the real world.</p>
        <p>I build software that makes complex ideas useful. My work spans data encryption, partner integrations, flight avionics, and security research.</p>
        <p>I&apos;m currently available for selected collaborations.</p>
      </div>
    </main>
  );
}
