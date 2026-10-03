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
        <p>I&apos;m Parker, a Software Engineer working in Melbourne, Florida.</p>
        <p>I enjoy versatile startups with dynamic projects, seeing things end-to-end, and producing high-quality standardized software.</p>
        <p>Recently I interact the most frequently with:</p>
        <ul className="list-disc">
          <li>AWS architectures</li>
          <li>encryption products</li>
          <li>databases (cloud + on-prem)</li>
          <li>Containerized applications (Docker/ECS)</li>
          <li>identity/privileged access management</li>
          <li>Golang, Node, and Terraform</li>
        </ul>
      </div>
    </main>
  );
}
