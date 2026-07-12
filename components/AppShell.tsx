"use client";

import LockGate from "@/components/LockGate";
import Nav from "@/components/Nav";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const presentation =
    pathname === "/meeting" || pathname?.startsWith("/meeting/");

  return (
    <>
      {!presentation && <Nav />}
      <main
        className={
          presentation
            ? "min-h-full"
            : "mx-auto max-w-5xl px-4 pb-32 pt-8"
        }
      >
        <LockGate>{children}</LockGate>
      </main>
    </>
  );
}
