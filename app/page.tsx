const projects = [
  { number: "01", name: "Somewhere", type: "Brand / Digital", year: "2025" },
  { number: "02", name: "Off Grid", type: "Product / Strategy", year: "2024" },
  { number: "03", name: "Field Notes", type: "Editorial / Web", year: "2024" },
];

export default function Home() {
  return (
    <main className="min-h-screen px-5 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
      <nav className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">
        <a href="#top" className="transition-opacity hover:opacity-55">Parker</a>
        <a href="mailto:hello@parkerparkerparker.com" className="transition-opacity hover:opacity-55">Get in touch ↗</a>
      </nav>

      <section id="top" className="grid min-h-[66vh] content-end pb-10 pt-24 sm:min-h-[72vh] sm:pb-14">
        <p className="mb-6 max-w-md text-xs leading-relaxed uppercase tracking-[0.08em] sm:text-sm">
          An independent creative practice for ideas that need to exist in the real world.
        </p>
        <h1 className="max-w-6xl text-[14vw] font-black uppercase leading-[0.78] tracking-[-0.1em] sm:text-[13vw]">
          Parker<br />Parker<br />Parker
        </h1>
      </section>

      <section id="work" className="border-t border-black pt-3">
        <div className="mb-12 flex items-baseline justify-between text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">
          <span>Selected work</span>
          <span>(03)</span>
        </div>
        <div>
          {projects.map((project) => (
            <a
              href="#contact"
              key={project.number}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline border-t border-black py-4 transition-colors hover:bg-black hover:px-3 hover:text-[#b0a28c] sm:grid-cols-[4rem_1fr_9rem_4rem] sm:py-5"
            >
              <span className="text-[10px] font-bold tracking-wider">{project.number}</span>
              <span className="text-xl font-black uppercase tracking-[-0.07em] sm:text-4xl">{project.name}</span>
              <span className="hidden text-[10px] uppercase tracking-wider sm:block">{project.type}</span>
              <span className="text-[10px] font-bold tracking-wider">{project.year} ↗</span>
            </a>
          ))}
          <div className="border-t border-black" />
        </div>
      </section>

      <section id="contact" className="grid gap-10 py-24 sm:grid-cols-2 sm:py-36">
        <p className="max-w-sm text-lg font-bold uppercase leading-tight tracking-[-0.04em] sm:text-2xl">
          Currently available for selected collaborations.
        </p>
        <div className="sm:pt-1">
          <a className="block w-fit border-b border-black pb-1 text-sm font-bold uppercase tracking-tight transition-opacity hover:opacity-55" href="mailto:hello@parkerparkerparker.com">
            hello@parkerparkerparker.com ↗
          </a>
        </div>
      </section>

      <footer className="flex justify-between border-t border-black pt-3 text-[10px] font-bold uppercase tracking-[0.16em]">
        <span>© 2026</span>
        <span>New York / Everywhere</span>
      </footer>
    </main>
  );
}
