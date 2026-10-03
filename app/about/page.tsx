import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About me",
  description: "Parker is a Software Engineer working in Melbourne, Florida.",
};

export default function AboutPage() {
  return (
    <main id="main-content" className="page">
      <h1 className="page-title">About me</h1>
      <div className="page-content">
        <p>I&apos;m Parker, a Software Engineer working in Melbourne, Florida. I enjoy versatile startups with dynamic projects, seeing things end-to-end, and producing high-quality standardized software.</p>
      </div>
    </main>
  );
}
