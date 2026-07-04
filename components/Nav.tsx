"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/teachers", label: "Teachers & Classes" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-10 border-b border-pp-border bg-pp-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3.5">
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="font-display text-xl font-semibold tracking-tight text-pp-text">
            Sunday School
          </span>
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-pp-gold sm:inline">
            Old Testament · 2026
          </span>
        </Link>
        <nav className="ml-auto flex gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                pathname === l.href
                  ? "bg-pp-gold text-pp-ink"
                  : "text-pp-muted hover:bg-white/5 hover:text-pp-text"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
