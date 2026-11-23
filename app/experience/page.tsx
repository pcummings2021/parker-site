import type { Metadata } from "next";

const roles = [
  {
    title: "Forward Deployed Engineer",
    organization: "Tonic AI",
    period: "November 2026 — Present",
    summary: "Coming soon.",
    details: [],
  },
  {
    title: "Field Engineer",
    organization: "ALTR Solutions, Inc.",
    period: "May 2024 — November 2026",
    summary: "R&D and customer-facing engineering. Promoted from intern to full-time in May 2025.",
    details: [
      "Expanded encryption support from one cloud source to multiple cloud and on-premises databases. reduced latency with local container compute and caching.",
      "Introduced structured claude code workflows, shifting developer effort to reviewing prepared merge requests. cut delivery time for two projects from months to weeks.",
      "Built and delivered an open-source model context protocol (MCP) server.",
      "Built a facial-authentication SDK delivering secure, sub-second matching using recognition models and a partner’s stochastic transformation technology, without retaining biometric data.",
      "Integrated ALTR APIs with partner platforms to support data classification. two integrations launched in partner marketplaces.",
      "Led customer and prospect demos, implementations, and proofs of concept. automated migrations of thousands of customer items to reduce manual work and support smoother implementations.",
      "Independently traced customer issues through logs and shipped fixes and enhancements to the core SaaS product, with several changes reaching production.",
    ],
  },
  {
    title: "Software Engineering Intern",
    organization: "Avidyne Corporation",
    period: "May 2023 — April 2024",
    details: [
      "Built repeatable avionics verification tests with systems and support engineers, covering OS interfaces through display layers.",
      "Used visual basic libraries and emulated C++ components to validate behavior and support FAA compliance.",
    ],
  },
];

const projects = [
  {
    title: "AI Workflow Control Tool",
    details: [
      "Built a react/typescript dashboard and python execution engine with workflow graphs, tracing, replay, model usage tracking, and role-based team access for controlled, budgeted, and auditable AI workflows.",
      "Added automated prompt optimization with approval controls and rollback.",
    ],
  },
  {
    title: "Completely Reasonable Auto-Pwner",
    details: [
      "Built a python binary exploitation tool with three teammates using pwntools, rizin, angr, and ropper. exploited all 120 benchmark binaries in about 50 seconds.",
    ],
  },
];

const leadership = [
  {
    title: "President",
    organization: "Pi Kappa Alpha Fraternity",
    period: "February 2023 — December 2023",
    summary: "Elected as a sophomore. Led 70+ members and managed six-figure finances and external relationships.",
  },
  {
    title: "Member",
    organization: "Florida Tech Cybersecurity Club (FITSEC)",
    period: "August 2024 — Present",
    summary: "Compete in NCL and other CTFs. Contributed challenges to a FITSEC-hosted CTF.",
  },
];

export const metadata: Metadata = {
  title: "Experience",
  description: "Parker Cummings's engineering experience at Tonic AI, ALTR, and Avidyne, software projects, and leadership at Florida Tech.",
};

export default function ExperiencePage() {
  return (
    <main id="main-content" className="page">
      <h1 className="sr-only">Experience</h1>
      <div className="page-content">
        <section className="experience-group" aria-label="Work experience">
          {roles.map((role) => (
            <article key={role.organization} className="experience-item">
              <h3>{role.title}</h3>
              <p className="experience-meta">{role.organization} / {role.period}</p>
              {role.summary && <p>{role.summary}</p>}
              {role.details.length > 0 && <ul>
                {role.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>}
            </article>
          ))}
        </section>
        <section className="experience-group" aria-labelledby="projects-heading">
          <h2 id="projects-heading">Software projects</h2>
          {projects.map((project) => (
            <article key={project.title} className="experience-item">
              <h3>{project.title}</h3>
              <ul>
                {project.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            </article>
          ))}
        </section>
        <section className="experience-group" aria-labelledby="leadership-heading">
          <h2 id="leadership-heading">Leadership</h2>
          {leadership.map((role) => (
            <article key={role.organization} className="experience-item">
              <h3>{role.title}</h3>
              <p className="experience-meta">{role.organization} / {role.period}</p>
              <p>{role.summary}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
