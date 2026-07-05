"use client";

// Passcode encryption for data at rest (GOSPEL.md principle 9).
// AES-GCM with a key derived from the passcode via PBKDF2 — if a device
// falls into the wrong hands, the ward data is ciphertext without the code.

const enc = new TextEncoder();
const dec = new TextDecoder();

const b64 = (b: ArrayBuffer | Uint8Array): string =>
  btoa(String.fromCharCode(...new Uint8Array(b)));

export const unb64 = (s: string): Uint8Array =>
  Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export type LockedBlob = {
  __locked: true;
  v: 1;
  salt: string;
  iv: string;
  ct: string;
};

export function isLockedBlob(x: unknown): x is LockedBlob {
  return (
    typeof x === "object" &&
    x !== null &&
    (x as { __locked?: unknown }).__locked === true
  );
}

export function randomSaltB64(): string {
  return b64(crypto.getRandomValues(new Uint8Array(16)));
}

export async function deriveKey(
  pin: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 310_000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptJson(
  key: CryptoKey,
  saltB64: string,
  obj: unknown
): Promise<LockedBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(JSON.stringify(obj))
  );
  return { __locked: true, v: 1, salt: saltB64, iv: b64(iv), ct: b64(ct) };
}

export async function decryptJson(
  key: CryptoKey,
  blob: LockedBlob
): Promise<unknown> {
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: unb64(blob.iv) as BufferSource },
    key,
    unb64(blob.ct) as BufferSource
  );
  return JSON.parse(dec.decode(pt));
}
