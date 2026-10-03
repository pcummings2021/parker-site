import type { Metadata } from "next";

const roles = [
  {
    number: "01",
    title: "Field Engineer",
    organization: "ALTR",
    period: "2024 — Present",
    details: [
      "Promoted from intern to full-time field engineer in 2025.",
      "Refactored an encryption suite for performance, usability, and product unification.",
      "Built partner integrations and helped clients evaluate technical solutions.",
    ],
  },
  {
    number: "02",
    title: "Software Engineering Intern",
    organization: "Avidyne Corporation",
    period: "2023 — 2024",
    details: [
      "Worked with systems and support engineers to test product requirements.",
      "Contributed to implementation and testing across avionics software layers.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Experience",
  description: "Parker's software engineering experience at ALTR and Avidyne, plus security research.",
};

export default function ExperiencePage() {
  return (
    <main id="main-content" className="page">
      <h1 className="page-title">Experience</h1>
      <div className="page-content">
        {roles.map((role) => (
          <section key={role.number} className="experience-item">
            <h2>{role.title}</h2>
            <p className="experience-meta">{role.organization} / {role.period}</p>
            <ul>
              {role.details.map((detail) => <li key={detail}>{detail}</li>)}
            </ul>
          </section>
        ))}
        <section className="experience-item">
          <h2>Automated binary exploitation</h2>
          <p>Built a Python tool with three other students to exploit multiple binary vulnerabilities automatically. It solved all 120 provided binaries in approximately 50 seconds.</p>
        </section>
      </div>
    </main>
  );
}
