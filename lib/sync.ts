"use client";

// Presidency sync: encrypted cloud copy keyed by a shared presidency code.
// The cloud only ever stores ciphertext (GOSPEL.md principle 9). Local
// storage remains the source of truth; sync is best-effort when online.
//
// Transport: MantleDB anonymous JSON store. Access control is the
// presidency code (encryption key) — treat it like a shared secret.

import {
  decryptJson,
  deriveKey,
  encryptJson,
  isLockedBlob,
  randomSaltB64,
  unb64,
  type LockedBlob,
} from "./crypto";
import type { AppData } from "./store";

const CODE_KEY = "ss-sync-code";
const SPACE_KEY = "ss-sync-space";
const REMOTE_AT_KEY = "ss-sync-remote-at";
const LOCAL_AT_KEY = "ss-sync-local-at";

const PUSH_DEBOUNCE_MS = 1500;
const POLL_MS = 8000;

// Easy to speak aloud — no 0/O, 1/I/L confusion.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

// Public bucket credentials (ciphertext only — join code is the real key).
const MANTLE_NS =
  process.env.NEXT_PUBLIC_MANTLE_NS ?? "ss-3110c6ff";
const MANTLE_KEY =
  process.env.NEXT_PUBLIC_MANTLE_KEY ??
  "1212399d7a020b7bc15c7c5e46a1fcc239af4bf9d95e0bb61365fc7ffab02ba3";
const MANTLE_BASE = `https://mantledb.sh/v2/${MANTLE_NS}`;

export type SyncEnvelope = {
  v: 1;
  updatedAt: string;
  blob: LockedBlob;
};

export type SyncStatus = "synced" | "syncing" | "offline" | "not-connected";

type SyncHandlers = {
  getData: () => AppData | null;
  applyRemote: (data: AppData, updatedAt: string) => void;
  onStatus: (status: SyncStatus) => void;
};

let handlers: SyncHandlers | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let pushing = false;
let pulling = false;
let visibilityBound = false;

export function isSyncAvailable(): boolean {
  return Boolean(MANTLE_NS && MANTLE_KEY);
}

export function isConfigured(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(CODE_KEY) && localStorage.getItem(SPACE_KEY));
}

export function getJoinCode(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(CODE_KEY) ?? "";
}

function saveConfig(code: string, spaceId: string) {
  localStorage.setItem(CODE_KEY, code);
  localStorage.setItem(SPACE_KEY, spaceId);
}

function clearConfig() {
  localStorage.removeItem(CODE_KEY);
  localStorage.removeItem(SPACE_KEY);
  localStorage.removeItem(REMOTE_AT_KEY);
  localStorage.removeItem(LOCAL_AT_KEY);
}

function setRemoteAt(iso: string) {
  localStorage.setItem(REMOTE_AT_KEY, iso);
}

export function markLocalWrite() {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_AT_KEY, new Date().toISOString());
}

function getLocalAt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LOCAL_AT_KEY);
}

function generateJoinCode(): string {
  const len = 6 + Math.floor(Math.random() * 3);
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join(
    ""
  );
}

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function spaceUrl(spaceId: string): string {
  return `${MANTLE_BASE}/spaces/${encodeURIComponent(spaceId)}`;
}

async function mantleGet(spaceId: string): Promise<SyncEnvelope | null> {
  const res = await fetch(spaceUrl(spaceId), {
    headers: { "X-Mantle-Key": MANTLE_KEY },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Sync store said ${res.status}.`);
  const json = (await res.json()) as SyncEnvelope;
  if (!json?.blob || !json.updatedAt) return null;
  return json;
}

async function mantlePut(spaceId: string, envelope: SyncEnvelope): Promise<void> {
  const res = await fetch(spaceUrl(spaceId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Mantle-Key": MANTLE_KEY,
    },
    body: JSON.stringify(envelope),
  });
  if (!res.ok) throw new Error(`Couldn't save sync data (${res.status}).`);
}

function computeStatus(): SyncStatus {
  if (!isSyncAvailable()) return "not-connected";
  if (!isConfigured()) return "not-connected";
  if (typeof navigator !== "undefined" && !navigator.onLine) return "offline";
  if (pushing || pulling) return "syncing";
  return "synced";
}

function emitStatus() {
  handlers?.onStatus(computeStatus());
}

async function encryptForSync(data: AppData, code: string): Promise<SyncEnvelope> {
  const salt = randomSaltB64();
  const key = await deriveKey(code, unb64(salt));
  const blob = await encryptJson(key, salt, data);
  return { v: 1, updatedAt: new Date().toISOString(), blob };
}

async function decryptFromSync(
  envelope: SyncEnvelope,
  code: string
): Promise<AppData> {
  if (!isLockedBlob(envelope.blob)) throw new Error("Sync data is malformed.");
  const key = await deriveKey(code, unb64(envelope.blob.salt));
  try {
    return (await decryptJson(key, envelope.blob)) as AppData;
  } catch {
    throw new Error("That presidency code didn't decrypt the data.");
  }
}

export async function createSpace(data: AppData): Promise<string> {
  if (!isSyncAvailable())
    throw new Error("Cloud sync isn't connected on this deployment.");

  const code = generateJoinCode();
  const envelope = await encryptForSync(data, code);
  await mantlePut(code, envelope);

  saveConfig(code, code);
  setRemoteAt(envelope.updatedAt);
  markLocalWrite();
  onSyncConfigured();
  return code;
}

export async function joinSpace(rawCode: string): Promise<void> {
  if (!isSyncAvailable())
    throw new Error("Cloud sync isn't connected on this deployment.");

  const code = normalizeCode(rawCode);
  if (code.length < 6 || code.length > 8) {
    throw new Error("Enter the 6–8 character presidency code.");
  }

  const envelope = await mantleGet(code);
  if (!envelope) throw new Error("No presidency found with that code.");
  await decryptFromSync(envelope, code);

  saveConfig(code, code);
  setRemoteAt(envelope.updatedAt);
  onSyncConfigured();
}

export function disconnectSpace() {
  clearConfig();
  stopPolling();
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  emitStatus();
}

export async function pushEncrypted(data: AppData): Promise<string | null> {
  const code = getJoinCode();
  const spaceId = localStorage.getItem(SPACE_KEY);
  if (!code || !spaceId) return null;
  if (!navigator.onLine) {
    emitStatus();
    return null;
  }

  pushing = true;
  emitStatus();
  try {
    const envelope = await encryptForSync(data, code);
    await mantlePut(spaceId, envelope);
    setRemoteAt(envelope.updatedAt);
    return envelope.updatedAt;
  } finally {
    pushing = false;
    emitStatus();
  }
}

export async function pullEncrypted(): Promise<{
  data: AppData;
  updatedAt: string;
} | null> {
  const code = getJoinCode();
  const spaceId = localStorage.getItem(SPACE_KEY);
  if (!code || !spaceId) return null;
  if (!navigator.onLine) {
    emitStatus();
    return null;
  }

  pulling = true;
  emitStatus();
  try {
    const envelope = await mantleGet(spaceId);
    if (!envelope) return null;
    const data = await decryptFromSync(envelope, code);
    setRemoteAt(envelope.updatedAt);
    return { data, updatedAt: envelope.updatedAt };
  } finally {
    pulling = false;
    emitStatus();
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function startPolling() {
  stopPolling();
  if (!isConfigured()) return;
  pollTimer = setInterval(() => {
    if (document.visibilityState === "visible" && isConfigured()) {
      void pullIfNewer();
    }
  }, POLL_MS);
}

export function onSyncConfigured() {
  emitStatus();
  startPolling();
}

export function schedulePush() {
  if (!isConfigured() || !handlers) return;
  markLocalWrite();
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    const data = handlers?.getData();
    if (data) void pushEncrypted(data);
  }, PUSH_DEBOUNCE_MS);
}

export async function pullAndApply(force = false): Promise<boolean> {
  if (!handlers || !isConfigured()) return false;
  const pulled = await pullEncrypted();
  if (!pulled) return false;
  const localAt = getLocalAt();
  if (force || !localAt || pulled.updatedAt > localAt) {
    handlers.applyRemote(pulled.data, pulled.updatedAt);
    return true;
  }
  return false;
}

async function pullIfNewer() {
  await pullAndApply(false);
}

function bindVisibility() {
  if (visibilityBound || typeof document === "undefined") return;
  visibilityBound = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && isConfigured()) {
      void pullIfNewer();
    }
  });
  window.addEventListener("online", () => {
    emitStatus();
    if (isConfigured()) void pullIfNewer();
  });
  window.addEventListener("offline", () => emitStatus());
}

/** Wire sync into the app after local data is ready. */
export function initSync(h: SyncHandlers): () => void {
  handlers = h;
  bindVisibility();
  emitStatus();

  if (!isConfigured()) return () => {};

  void (async () => {
    await pullIfNewer();
    startPolling();
  })();

  return () => {
    handlers = null;
    stopPolling();
    if (pushTimer) {
      clearTimeout(pushTimer);
      pushTimer = null;
    }
  };
}

export function syncStatusLabel(status: SyncStatus): string {
  switch (status) {
    case "synced":
      return "Synced";
    case "syncing":
      return "Syncing…";
    case "offline":
      return "Offline";
    default:
      return "Not connected";
  }
}
