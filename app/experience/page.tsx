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
    <main id="main-content" className="flex-1">
      <section className="grid min-h-[48vh] content-end pb-10 pt-24 sm:min-h-[58vh] sm:pb-14">
        <p className="mb-6 text-xs uppercase tracking-[0.08em] sm:text-sm">Work and selected projects.</p>
        <h1 className="hero-title break-words text-[13vw] font-black uppercase leading-[0.85] tracking-[-0.09em] sm:text-[12vw]">
          Experience
        </h1>
      </section>

      <section className="border-t border-black pt-3">
        <div className="mb-12 flex items-baseline justify-between text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">
          <h2>Work experience</h2>
          <span>(02)</span>
        </div>
        <div>
          {roles.map((role) => (
            <article key={role.number} className="grid gap-4 border-t border-black py-5 sm:grid-cols-[4rem_1fr_1fr] sm:gap-8 sm:py-7">
              <span className="text-[10px] font-bold tracking-wider">{role.number}</span>
              <div>
                <h3 className="text-xl font-black uppercase leading-none tracking-[-0.07em] sm:text-3xl">{role.title}</h3>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] sm:text-xs">{role.organization} / {role.period}</p>
              </div>
              <ul className="list-disc space-y-3 pl-4 text-xs leading-relaxed sm:text-sm">
                {role.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            </article>
          ))}
          <div className="border-t border-black" />
        </div>
      </section>

      <section className="grid gap-8 border-t border-black pt-3 sm:grid-cols-2 sm:gap-12">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">Selected project</h2>
        <div className="max-w-xl pb-10">
          <h3 className="mb-4 text-xl font-black uppercase tracking-[-0.07em] sm:text-3xl">Automated binary exploitation</h3>
          <p className="text-xs leading-relaxed sm:text-sm">
            Built a Python tool with three other students to exploit multiple binary vulnerabilities automatically. It solved all 120 provided binaries in approximately 50 seconds.
          </p>
        </div>
      </section>
    </main>
  );
}
