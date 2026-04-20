// Client-side localStorage wrappers. Safe to call from "use client" components.
// All data is per-browser; nothing is sent to server except on explicit API calls.

"use client";

import type { Entry } from "./types";
import type { HumanProfile } from "./analogy-schema";

const KEYS = {
  library:   "morpho:library:v1",
  analogies: "morpho:analogies:v1",
  apiKey:    "morpho:apiKey:v1",
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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {/* quota / private mode */}
}

function del(key: string): void {
  if (!isBrowser()) return;
  try { localStorage.removeItem(key); } catch {/* ignore */}
}

// ---------- Library (user entries) ----------

export function loadLibrary(): Entry[] {
  return read<Entry[]>(KEYS.library, []);
}

export function saveLibrary(entries: Entry[]): void {
  write(KEYS.library, entries);
}

export function addToLibrary(entry: Entry): void {
  const entries = loadLibrary();
  const idx = entries.findIndex(e => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry;
  else entries.unshift(entry);
  saveLibrary(entries);
}

export function removeFromLibrary(id: string): boolean {
  const entries = loadLibrary();
  const next = entries.filter(e => e.id !== id);
  if (next.length === entries.length) return false;
  saveLibrary(next);
  return true;
}

export function updateInLibrary(
  id: string,
  patch: Partial<Pick<Entry, "name" | "catchphrase" | "summary" | "category">>
): Entry | null {
  const entries = loadLibrary();
  const idx = entries.findIndex(e => e.id === id);
  if (idx < 0) return null;
  const next = { ...entries[idx], ...patch };
  entries[idx] = next;
  saveLibrary(entries);
  return next;
}

export function findEntry(id: string): Entry | null {
  return loadLibrary().find(e => e.id === id) ?? null;
}

// ---------- Analogies cache ----------

export function loadAnalogy(entryId: string): HumanProfile | null {
  const all = read<Record<string, HumanProfile>>(KEYS.analogies, {});
  return all[entryId] ?? null;
}

export function saveAnalogy(entryId: string, profile: HumanProfile): void {
  const all = read<Record<string, HumanProfile>>(KEYS.analogies, {});
  all[entryId] = profile;
  write(KEYS.analogies, all);
}

export function deleteAnalogy(entryId: string): void {
  const all = read<Record<string, HumanProfile>>(KEYS.analogies, {});
  delete all[entryId];
  write(KEYS.analogies, all);
}

// ---------- API key ----------

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

// ---------- Helper for API calls ----------

export function authHeaders(): HeadersInit {
  const key = loadApiKey();
  return key ? { "x-api-key": key } : {};
}
