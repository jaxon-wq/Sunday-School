"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/teachers", label: "Teachers & Classes" },
  { href: "/presidency", label: "Presidency" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-4">
        <Link href="/" className="flex items-baseline gap-2.5 py-3">
          <span className="font-serif text-lg font-bold tracking-tight text-ink">
            Sunday School
          </span>
          <span className="hidden text-xs text-ink-3 sm:inline">
            Old Testament · 2026
          </span>
        </Link>
        <nav className="ml-auto flex self-stretch">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center border-b-2 px-3 text-sm transition-colors sm:px-4 ${
                  active
                    ? "border-primary font-semibold text-primary"
                    : "border-transparent font-medium text-ink-2 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
