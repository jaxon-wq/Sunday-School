"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <path d="M3 10.5 12 3l9 7.5M5.5 8.8V20a1 1 0 0 0 1 1H9.8v-6h4.4v6h3.3a1 1 0 0 0 1-1V8.8" />
    ),
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: (
      <>
        <rect x="3.5" y="5" width="17" height="16" rx="2" />
        <path d="M3.5 9.5h17M8 2.8v4M16 2.8v4M7.5 13.5h3M13.5 13.5h3M7.5 17h3" />
      </>
    ),
  },
  {
    href: "/teachers",
    label: "Teachers",
    icon: (
      <>
        <circle cx="9" cy="8.5" r="3.2" />
        <path d="M3.5 20c.6-3.4 2.8-5.2 5.5-5.2s4.9 1.8 5.5 5.2M16 5.6a3.2 3.2 0 0 1 0 5.8M17.6 14.9c1.6.7 2.6 2.4 2.9 5.1" />
      </>
    ),
  },
  {
    href: "/presidency",
    label: "Presidency",
    icon: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5V3h6v1.5M8.5 10.5l2 2 4.5-4.5M8.5 16.5h7" />
      </>
    ),
  },
  {
    href: "/councils",
    label: "Councils",
    icon: (
      <>
        <path d="M4 5.5h12a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5v-3.5H4A1.5 1.5 0 0 1 2.5 13V7A1.5 1.5 0 0 1 4 5.5Z" />
        <path d="M19.5 9.5h.5A1.5 1.5 0 0 1 21.5 11v5a1.5 1.5 0 0 1-1.5 1.5h-.5V21l-3.2-2.8" />
      </>
    ),
  },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <>
      {/* Slim top brand bar */}
      <header className="border-b border-line bg-white print:hidden">
        <div className="mx-auto flex max-w-5xl items-baseline gap-2.5 px-4 py-3">
          <Link href="/" className="font-serif text-lg font-bold tracking-tight text-ink">
            Sunday School
          </Link>
          <span className="text-xs text-ink-3">Old Testament · 2026</span>
        </div>
      </header>

      {/* Liquid-glass pill navigation */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 z-20 flex justify-center px-4 print:hidden"
        style={{ bottom: "calc(0.9rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-center rounded-full border border-white/60 bg-white/65 px-1 py-1.5 shadow-[0_10px_36px_rgba(16,24,40,0.16),inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-black/5 backdrop-blur-xl backdrop-saturate-150 sm:gap-0.5 sm:px-1.5">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname === `${l.href}/`;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-full px-2.5 py-1.5 transition-colors sm:px-4 ${
                  active
                    ? "bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                    : "text-ink-2 hover:bg-white/70 hover:text-ink"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {l.icon}
                </svg>
                <span className="text-[10px] font-semibold leading-none">
                  {l.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
