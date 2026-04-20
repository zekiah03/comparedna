import { Redis } from "@upstash/redis";
import type { Entry } from "./types";
import type { HumanProfile } from "./analogy-schema";

const ENTRIES_KEY = "morpho:entries:v1";
const ANALOGIES_KEY = "morpho:analogies:v1";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (_redis) return _redis;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Upstash Redis が未設定です。Vercel Storage で Upstash Redis を作成して、環境変数 (KV_REST_API_URL / KV_REST_API_TOKEN) を設定してください。"
    );
  }
  _redis = new Redis({ url, token });
  return _redis;
}

export function isKvConfigured(): boolean {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return Boolean(url && token);
}

// ---------- Entries (shared library) ----------

export async function listEntries(): Promise<Entry[]> {
  const map = await getRedis().hgetall<Record<string, Entry>>(ENTRIES_KEY);
  if (!map) return [];
  return Object.values(map).sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
  );
}

export async function getEntry(id: string): Promise<Entry | null> {
  const e = await getRedis().hget<Entry>(ENTRIES_KEY, id);
  return e ?? null;
}

export async function saveEntry(entry: Entry): Promise<void> {
  await getRedis().hset(ENTRIES_KEY, { [entry.id]: entry });
}

export async function deleteEntry(id: string): Promise<boolean> {
  const removed = await getRedis().hdel(ENTRIES_KEY, id);
  return removed > 0;
}

export async function updateEntry(
  id: string,
  patch: Partial<Pick<Entry, "name" | "catchphrase" | "summary" | "category">>
): Promise<Entry | null> {
  const current = await getEntry(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  await saveEntry(next);
  return next;
}

// ---------- Analogies cache (shared) ----------

export async function loadAnalogy(entryId: string): Promise<HumanProfile | null> {
  const p = await getRedis().hget<HumanProfile>(ANALOGIES_KEY, entryId);
  return p ?? null;
}

export async function saveAnalogy(entryId: string, profile: HumanProfile): Promise<void> {
  await getRedis().hset(ANALOGIES_KEY, { [entryId]: profile });
}

export async function deleteAnalogy(entryId: string): Promise<void> {
  await getRedis().hdel(ANALOGIES_KEY, entryId);
}
