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
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight text-white">
            Sunday School<span className="text-pp-blue-light">+</span>
          </span>
          <span className="hidden text-xs font-medium text-pp-muted sm:inline">
            Old Testament · 2026
          </span>
        </Link>
        <nav className="ml-auto flex gap-1.5">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                pathname === l.href
                  ? "bg-pp-blue text-white shadow-[0_0_18px_rgba(0,100,255,0.45)]"
                  : "text-pp-muted hover:bg-white/10 hover:text-white"
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
