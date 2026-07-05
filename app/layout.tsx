import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import LockGate from "@/components/LockGate";
import Nav from "@/components/Nav";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// The Church's public font service. When reachable it upgrades text to the
// real Ensign faces; otherwise the bundled Noto fallbacks render (the same
// fallback chain churchofjesuschrist.org itself uses).
const ENSIGN_STYLES = [
  "https://foundry.churchofjesuschrist.org/Foundry/v1/Ensign:Sans:400@en/css",
  "https://foundry.churchofjesuschrist.org/Foundry/v1/Ensign:Sans:600@en/css",
  "https://foundry.churchofjesuschrist.org/Foundry/v1/Ensign:Sans:700@en/css",
  "https://foundry.churchofjesuschrist.org/Foundry/v1/Ensign:Serif:400@en/css",
  "https://foundry.churchofjesuschrist.org/Foundry/v1/Ensign:Serif:700@en/css",
];

export const metadata: Metadata = {
  title: "Sunday School",
  description:
    "Ward Sunday School presidency tool — teachers, classes, substitutes, and the 2026 Come, Follow Me schedule.",
};

export const viewport = {
  themeColor: "#006184",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <head>
        {ENSIGN_STYLES.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body className="min-h-full">
        <Nav />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <LockGate>{children}</LockGate>
        </main>
      </body>
    </html>
  );
}
