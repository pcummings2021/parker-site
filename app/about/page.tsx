import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About me",
  description: "About Parker, a software engineer turning technical ideas into useful products.",
};

export default function AboutPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="grid min-h-[65vh] content-end pb-10 pt-24 sm:min-h-[72vh] sm:pb-14">
        <p className="mb-6 max-w-md text-xs leading-relaxed uppercase tracking-[0.08em] sm:text-sm">
          Software engineer working on ideas that need to exist in the real world.
        </p>
        <h1 className="hero-title max-w-6xl text-[21vw] font-black uppercase leading-[0.78] tracking-[-0.1em] sm:text-[18vw]">
          Parker
        </h1>
      </section>

      <section className="grid gap-8 border-t border-black py-4 sm:grid-cols-2 sm:gap-12">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">About me</h2>
        <div className="max-w-xl space-y-6 text-lg font-bold uppercase leading-tight tracking-[-0.04em] sm:text-2xl">
          <p>I build software that makes complex ideas useful in the real world.</p>
          <p>My work spans data encryption, partner integrations, flight avionics, and security research.</p>
          <p>Currently available for selected collaborations.</p>
        </div>
      </section>
    </main>
  );
}
