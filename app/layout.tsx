import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import SiteHeader from "./components/site-header";
import AsciiGlobe from "./components/ascii-globe";
import "./globals.css";

const courierPrime = Courier_Prime({
  variable: "--font-typewriter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: { default: "Parker", template: "%s — Parker" },
  description: "Software engineering and selected work by Parker Cummings.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={courierPrime.variable}>
        <div className="site-shell">
          <SiteHeader />
          <div className="site-globe"><AsciiGlobe /></div>
          {children}
        </div>
      </body>
    </html>
  );
}
