"use client";

import { useState } from "react";
import SyncStatusChip from "@/components/SyncStatusChip";
import type { AppData } from "@/lib/store";
import {
  createSpace,
  disconnectSpace,
  getJoinCode,
  isConfigured,
  isSyncAvailable,
  joinSpace,
  pullAndApply,
  type SyncStatus,
} from "@/lib/sync";

export default function PresidencySync({
  data,
  syncStatus,
}: {
  data: AppData;
  syncStatus: SyncStatus;
}) {
  const [mode, setMode] = useState<"idle" | "join">("idle");
  const [joinInput, setJoinInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(isConfigured);

  const available = isSyncAvailable();
  const code = getJoinCode();

  async function startSync() {
    setBusy(true);
    setError("");
    try {
      await createSpace(data);
      setConnected(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start sync.");
    } finally {
      setBusy(false);
    }
  }

  async function submitJoin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await joinSpace(joinInput);
      await pullAndApply(true);
      setConnected(true);
      setMode("idle");
      setJoinInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't join.");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  function disconnect() {
    if (
      window.confirm(
        "Stop syncing on this device? Your local data stays — counselors won't receive updates from here until you join again."
      )
    ) {
      disconnectSpace();
      setConnected(false);
      setMode("idle");
      setError("");
    }
  }

  return (
    <section className="rounded-lg border border-line bg-white p-5 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-xl font-bold">Devices</h2>
        {connected && <SyncStatusChip status={syncStatus} />}
      </div>

      {!available && (
        <p className="mt-2 text-sm text-ink-2">
          Cloud sync isn&apos;t available in this build.
        </p>
      )}

      {available && !connected && (
        <>
          <p className="mt-2 text-sm text-ink-2">
            Start sync on one phone, then have counselors enter the same code.
            After that, edits show up on every device automatically — encrypted
            before they leave the phone.
          </p>
          {mode === "idle" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startSync}
                disabled={busy}
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {busy ? "Starting…" : "Start sync"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("join");
                  setError("");
                }}
                className="rounded-md border border-line-2 bg-white px-4 py-1.5 text-sm font-semibold text-ink hover:bg-surface"
              >
                Enter code
              </button>
            </div>
          ) : (
            <form onSubmit={submitJoin} className="mt-4 flex flex-wrap items-end gap-2">
              <div>
                <label className="block text-xs font-semibold text-ink-2">
                  Presidency code
                </label>
                <input
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                  placeholder="e.g. TREK42"
                  maxLength={8}
                  autoFocus
                  className="mt-1 w-40 rounded-md border border-line px-3 py-1.5 font-mono text-sm tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:text-ink-3"
                />
              </div>
              <button
                type="submit"
                disabled={busy || joinInput.trim().length < 6}
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {busy ? "Joining…" : "Join"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("idle");
                  setJoinInput("");
                  setError("");
                }}
                className="rounded-md border border-line-2 px-4 py-1.5 text-sm font-semibold text-ink-2 hover:bg-surface"
              >
                Cancel
              </button>
            </form>
          )}
        </>
      )}

      {available && connected && (
        <>
          <p className="mt-2 text-sm text-ink-2">
            Counselors enter this code on their devices. Changes sync
            automatically — no push or pull buttons.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-surface px-3 py-1.5 font-mono text-lg font-bold tracking-widest text-ink">
              {code}
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {copied ? "Copied ✓" : "Copy code"}
            </button>
            <button
              type="button"
              onClick={disconnect}
              className="ml-auto text-xs text-ink-3 hover:text-danger"
            >
              Disconnect
            </button>
          </div>
        </>
      )}

      {error && (
        <p className="mt-3 text-sm font-semibold text-danger">{error}</p>
      )}
    </section>
  );
}
