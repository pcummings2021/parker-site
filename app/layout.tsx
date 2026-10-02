import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import SiteHeader from "./components/site-header";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Parker", template: "%s — Parker" },
  description: "Software engineering and selected work by Parker Cummings.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={ibmPlexMono.variable}>
        <div className="flex min-h-screen flex-col px-5 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <SiteHeader />
          {children}
          <footer className="mt-24 flex justify-between border-t border-black pt-3 text-[10px] font-bold uppercase tracking-[0.16em]">
            <span>© 2026</span>
            <span>New York / Everywhere</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
