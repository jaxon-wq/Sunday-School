"use client";

import { useState } from "react";
import { useAppData } from "@/lib/store";

export default function LockGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lockState, unlock, wipe } = useAppData();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  if (lockState === "loading") return null;
  if (lockState !== "locked") return <>{children}</>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin || busy) return;
    setBusy(true);
    setError(false);
    const ok = await unlock(pin);
    setBusy(false);
    if (!ok) {
      setError(true);
      setPin("");
    }
  }

  function reset() {
    if (
      window.confirm(
        "Erase all Sunday School data on this device? Without the passcode the data cannot be recovered. You can Import a backup afterward."
      )
    ) {
      wipe();
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-8 text-center">
        <svg
          viewBox="0 0 24 24"
          className="mx-auto h-10 w-10 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <h1 className="mt-4 font-serif text-2xl font-bold">Sunday School</h1>
        <p className="mt-1 text-sm text-ink-2">
          Enter your passcode to unlock ward data on this device.
        </p>
        <form onSubmit={submit} className="mt-5">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
            placeholder="Passcode"
            className="w-full rounded-md border border-line px-3 py-2 text-center text-lg tracking-widest placeholder:text-ink-3"
          />
          {error && (
            <p className="mt-2 text-sm font-semibold text-danger">
              That passcode didn&apos;t work.
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !pin}
            className="mt-3 w-full rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {busy ? "Unlocking…" : "Unlock"}
          </button>
        </form>
        <button
          onClick={reset}
          className="mt-4 text-xs text-ink-3 underline hover:text-danger"
        >
          Forgot passcode? Erase this device&apos;s data
        </button>
      </div>
    </div>
  );
}
