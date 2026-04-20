// Client-side localStorage wrappers.
// In shared-library mode we only keep the user's own API key here —
// entries and analogies are stored server-side (Upstash Redis via /api/*).

"use client";

const KEYS = {
  apiKey: "morpho:apiKey:v1",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {/* ignore */}
}

function del(key: string): void {
  if (!isBrowser()) return;
  try { localStorage.removeItem(key); } catch {/* ignore */}
}

// ---------- API key (per-browser) ----------

export function loadApiKey(): string | null {
  const v = read<string>(KEYS.apiKey, "");
  return v ? v : null;
}

export function saveApiKey(key: string): void {
  write(KEYS.apiKey, key.trim());
}

export function clearApiKey(): void {
  del(KEYS.apiKey);
}

export function maskApiKey(key: string): string {
  if (!key || key.length <= 10) return "***";
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

export function authHeaders(): HeadersInit {
  const key = loadApiKey();
  return key ? { "x-api-key": key } : {};
}
