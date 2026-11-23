import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About me",
  description: "Parker Cummings is a Forward Deployed Engineer at Tonic AI in Melbourne, Florida.",
};

export default function AboutPage() {
  return (
    <main id="main-content" className="page">
      <h1 className="sr-only">About me</h1>
      <div className="page-content">
        <p>I&apos;m Parker Cummings, a software engineer working in Melbourne, Florida. My current role is Forward Deployed Engineer at Tonic AI.</p>
        <p>I enjoy versatile startups working projects start-to-end, deep technical customer interactions, and producing quality standardized software.</p>
        <p>Recently, I&apos;ve been working with:</p>
        <ul className="about-topics">
          <li>AWS infrastructure for standard, serverless, and containerized applications</li>
          <li>AI workflow tools bringing agent execution closer to a program</li>
          <li>Several model context protocol (MCP) servers/clients</li>
          <li>Encryption (format-preserving) tools for on-premise and cloud databases</li>
          <li>Biometric (facial) authentication applications</li>
          <li>Listening to music</li>
        </ul>
        <section className="about-section" aria-labelledby="education-heading">
          <h2 id="education-heading">Education</h2>
          <article className="education-school">
            <div className="education-school-heading">
              <h3>Florida Institute of Technology</h3>
              <span>Melbourne, FL</span>
            </div>
            <ul>
              <li>GPA: 3.89, B.S. computer science</li>
              <li>Graduated May 2025</li>
            </ul>
          </article>
          <article className="education-school">
            <div className="education-school-heading">
              <h3>Severna Park High School</h3>
              <span>Severna Park, MD</span>
            </div>
            <ul>
              <li>GPA: 3.78, summa cum laude</li>
              <li>Graduated June 2021</li>
            </ul>
          </article>
        </section>
        <section className="about-section" aria-labelledby="skills-heading">
          <h2 id="skills-heading">Software skills</h2>
          <ul className="skills-list">
            <li>
              <span className="skill-row">
                <span>Languages:</span>
                <span>Python, SQL, JavaScript/TypeScript, Go, Java, and Terraform.</span>
              </span>
            </li>
            <li>
              <span className="skill-row">
                <span>Tools:</span>
                <span>Git, GitHub, GitLab, Docker, AWS/Azure/GCP, OLTP Databases, Snowflake, Databricks, Hermes, Opencode, Claude Code, and Codex.</span>
              </span>
            </li>
            <li>
              <span className="skill-row">
                <span>Processes:</span>
                <span>Scrum, Agile, Waterfall, SDLC, CI/CD, and AWS Well-Architected Framework.</span>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
