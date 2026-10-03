import type { Metadata } from "next";

const roles = [
  {
    number: "01",
    title: "Field Engineer",
    organization: "ALTR",
    period: "2024 — Present",
    summary: "My work spans research and development, product engineering, and customer implementations.",
    details: [
      "Started as an intern in May 2024 and moved to a full-time role in May 2025.",
      "Led a database encryption refactor that expanded support from one cloud database platform to twelve and reduced latency on the original platform by 60%. Improved the backend, UI, and user experience.",
      "Turned a biometric authentication proof of concept into a full stack web application on AWS with a simple SDK. Designed the architecture around AWS best practices.",
      "Led demos and proofs of concept for prospects and customers, built custom integrations, and helped customers implement purchased software and new features.",
    ],
  },
  {
    number: "02",
    title: "Software Engineering Intern",
    organization: "Avidyne Corporation",
    period: "2023 — 2024",
    details: [
      "Worked with systems and support engineers to write software requirements for an upcoming avionics product. The requirements were reviewed and approved by the FAA.",
      "Wrote and ran tests against an emulated environment to verify that the software met those requirements.",
      "Used Visual Basic to test emulated C++ avionics software.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Experience",
  description: "Parker's software engineering experience at ALTR and Avidyne Corporation.",
};

export default function ExperiencePage() {
  return (
    <main id="main-content" className="page">
      <h1 className="sr-only">Experience</h1>
      <div className="page-content">
        {roles.map((role) => (
          <section key={role.number} className="experience-item">
            <h2>{role.title}</h2>
            <p className="experience-meta">{role.organization} / {role.period}</p>
            {role.summary && <p>{role.summary}</p>}
            <ul>
              {role.details.map((detail) => <li key={detail}>{detail}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
