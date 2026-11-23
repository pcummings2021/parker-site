"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/about", label: "About me" },
  { href: "/experience", label: "Experience" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }

    const desktop = window.matchMedia("(min-width: 601px)");
    function onResize() {
      if (desktop.matches) setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="site-header">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <button
        ref={toggleRef}
        type="button"
        className="menu-toggle"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="site-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d={menuOpen ? "M5 5 19 19M5 19 19 5" : "M3 6h18M3 12h18M3 18h18"} />
        </svg>
      </button>
      <nav id="site-navigation" aria-label="Main navigation" className="site-nav" data-open={menuOpen} onClick={() => setMenuOpen(false)}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
            {link.label}
          </Link>
        ))}
        <a href="https://www.linkedin.com/in/parker-cummings1/" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href="https://github.com/pcummings2021" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </nav>
    </header>
  );
}
