import { NextRequest, NextResponse } from "next/server";
import { SEED_ENTRIES } from "@/lib/seed-data";
import {
  deleteEntry as kvDelete,
  getEntry as kvGet,
  isKvConfigured,
  updateEntry as kvUpdate,
} from "@/lib/kv-storage";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const seed = SEED_ENTRIES.find(e => e.id === id);
  if (seed) return NextResponse.json({ entry: seed, source: "seed" });

  if (!isKvConfigured()) {
    return NextResponse.json({ error: "エントリーが見つかりません" }, { status: 404 });
  }
  try {
    const e = await kvGet(id);
    if (e) return NextResponse.json({ entry: e, source: "user" });
  } catch {/* ignore */}
  return NextResponse.json({ error: "エントリーが見つかりません" }, { status: 404 });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (SEED_ENTRIES.some(e => e.id === id)) {
    return NextResponse.json({ error: "シードエントリは削除できません" }, { status: 400 });
  }
  if (!isKvConfigured()) {
    return NextResponse.json({ error: "KV 未設定" }, { status: 500 });
  }
  const removed = await kvDelete(id);
  if (!removed) return NextResponse.json({ error: "エントリーが見つかりません" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (SEED_ENTRIES.some(e => e.id === id)) {
    return NextResponse.json({ error: "シードエントリは編集できません" }, { status: 400 });
  }
  if (!isKvConfigured()) {
    return NextResponse.json({ error: "KV 未設定" }, { status: 500 });
  }
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 }); }

  const patch: { name?: string; catchphrase?: string; summary?: string; category?: string } = {};
  for (const k of ["name","catchphrase","summary","category"] as const) {
    const v = body[k];
    if (typeof v === "string") {
      const s = v.trim();
      if (!s) continue;
      if (s.length > 2000) return NextResponse.json({ error: `${k} が長すぎます` }, { status: 400 });
      patch[k] = s;
    }
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "更新項目がありません" }, { status: 400 });
  }
  const updated = await kvUpdate(id, patch);
  if (!updated) return NextResponse.json({ error: "エントリーが見つかりません" }, { status: 404 });
  return NextResponse.json({ entry: updated });
}
