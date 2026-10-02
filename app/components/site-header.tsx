"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/about", label: "About me" },
  { href: "/experience", label: "Experience" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-5 focus:z-10 focus:bg-black focus:p-3 focus:text-[var(--paper)]">Skip to content</a>
      <nav aria-label="Main navigation" className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">
        <Link href="/about" className="transition-opacity hover:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-4">Parker</Link>
        <div className="flex flex-wrap gap-x-5 gap-y-2 sm:gap-x-8">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className="border-b border-transparent pb-1 transition-opacity hover:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-4 aria-[current=page]:border-black">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
