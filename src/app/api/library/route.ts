import { NextResponse } from "next/server";
import { isKvConfigured, listEntries } from "@/lib/kv-storage";

export const runtime = "nodejs";

export async function GET() {
  if (!isKvConfigured()) {
    // Graceful empty response in dev/no-KV environments
    return NextResponse.json({ entries: [], kv: false });
  }
  try {
    const entries = await listEntries();
    return NextResponse.json({ entries, kv: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "エラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
