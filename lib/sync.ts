"use client";

// Presidency sync (beta): manual push/pull of the app's data through a
// private GitHub Gist. The data is encrypted on-device with a passphrase
// the presidency shares (AES-GCM via lib/crypto) — GitHub only ever stores
// ciphertext (GOSPEL.md principle 9). The token is a fine-grained GitHub
// token with gist scope only, stored on this device and excluded from
// export files.

import {
  LockedBlob,
  decryptJson,
  deriveKey,
  encryptJson,
  isLockedBlob,
  randomSaltB64,
  unb64,
} from "./crypto";
import type { AppData } from "./store";

const TOKEN_KEY = "ss-sync-token";
const GIST_KEY = "ss-sync-gist";
const FILE_NAME = "sunday-school.enc.json";
const API = "https://api.github.com";

export type SyncEnvelope = {
  v: 1;
  updatedAt: string; // ISO
  blob: LockedBlob;
};

export function getSyncConfig() {
  return {
    token: localStorage.getItem(TOKEN_KEY) ?? "",
    gistId: localStorage.getItem(GIST_KEY) ?? "",
  };
}

export function saveSyncConfig(token: string, gistId: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token.trim());
  else localStorage.removeItem(TOKEN_KEY);
  if (gistId) localStorage.setItem(GIST_KEY, gistId.trim());
  else localStorage.removeItem(GIST_KEY);
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

// Encrypt and upload. Creates the private gist on first push; returns gistId.
export async function pushToCloud(
  data: AppData,
  passphrase: string
): Promise<{ gistId: string; updatedAt: string }> {
  const { token, gistId } = getSyncConfig();
  if (!token) throw new Error("No sync token saved.");
  const salt = randomSaltB64();
  const key = await deriveKey(passphrase, unb64(salt));
  const blob = await encryptJson(key, salt, data);
  const envelope: SyncEnvelope = {
    v: 1,
    updatedAt: new Date().toISOString(),
    blob,
  };
  const body = {
    description: "Sunday School presidency sync (encrypted)",
    public: false,
    files: { [FILE_NAME]: { content: JSON.stringify(envelope) } },
  };
  const res = await fetch(gistId ? `${API}/gists/${gistId}` : `${API}/gists`, {
    method: gistId ? "PATCH" : "POST",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Token was rejected — check it.");
    if (res.status === 404)
      throw new Error("Gist not found — clear the gist ID and push again.");
    throw new Error(`GitHub said ${res.status}.`);
  }
  const json = await res.json();
  saveSyncConfig(token, json.id);
  return { gistId: json.id, updatedAt: envelope.updatedAt };
}

// Download and decrypt. Returns the raw object for the caller to confirm
// and migrate before applying.
export async function pullFromCloud(
  passphrase: string
): Promise<{ data: unknown; updatedAt: string }> {
  const { token, gistId } = getSyncConfig();
  if (!token) throw new Error("No sync token saved.");
  if (!gistId) throw new Error("No gist ID — push once first, or paste the presidency's gist ID.");
  const res = await fetch(`${API}/gists/${gistId}`, {
    headers: headers(token),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Token was rejected — check it.");
    if (res.status === 404) throw new Error("Gist not found — check the gist ID.");
    throw new Error(`GitHub said ${res.status}.`);
  }
  const json = await res.json();
  const file = json.files?.[FILE_NAME];
  if (!file) throw new Error("No sync data in that gist yet.");
  const content: string = file.truncated
    ? await (await fetch(file.raw_url)).text()
    : file.content;
  const envelope = JSON.parse(content) as SyncEnvelope;
  if (!isLockedBlob(envelope.blob)) throw new Error("Sync data is malformed.");
  const key = await deriveKey(passphrase, unb64(envelope.blob.salt));
  let data: unknown;
  try {
    data = await decryptJson(key, envelope.blob);
  } catch {
    throw new Error("That passphrase didn't decrypt the data.");
  }
  return { data, updatedAt: envelope.updatedAt };
}
