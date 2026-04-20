import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getClientFromRequest, MODEL_ID } from "@/lib/anthropic";
import { ModifyCoreSchema, EnvDNASchema, type ModifyCore, type EnvDNAResult } from "@/lib/modify-schema";
import {
  MODIFY_CORE_SYSTEM_PROMPT, modifyCoreUserPrompt,
  MODIFY_ENV_DNA_SYSTEM_PROMPT, modifyEnvDNAUserPrompt,
} from "@/lib/modify-prompt";
import type { Entry } from "@/lib/types";
import { apiErrorBody, apiErrorStatus } from "@/lib/api-error";
import { isKvConfigured, saveEntry } from "@/lib/kv-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_MOD_TYPES = ["削除","追加","強化/弱化","環境変更","スケール","融合","反転","時間軸"];

function slug(name: string): string {
  const base = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff\-]/g, "");
  return base + "-" + Math.random().toString(36).slice(2, 6);
}

export async function POST(req: NextRequest) {
  let base: Entry;
  let modType: string;
  let modText: string;
  try {
    const body = await req.json();
    base = body?.base as Entry;
    modType = String(body?.modType ?? "").trim();
    modText = String(body?.modText ?? "").trim();
    if (!base || !base.id || !base.name || !base.axes12) {
      return NextResponse.json({ error: "改造元のエントリーデータが不正です" }, { status: 400 });
    }
    if (!VALID_MOD_TYPES.includes(modType)) {
      return NextResponse.json({ error: "不正な改造タイプ" }, { status: 400 });
    }
    if (modText.length > 500) {
      return NextResponse.json({ error: "改造内容は500字以内で" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
  }

  let client: Anthropic;
  try {
    client = getClientFromRequest(req);
  } catch (e) {
    const message = e instanceof Error ? e.message : "APIキー未設定";
    return NextResponse.json({ error: message, code: "auth" }, { status: 500 });
  }

  let core: ModifyCore;
  let envDNA: EnvDNAResult | null = null;
  try {
    const [coreResult, envResult] = await Promise.all([
      runModifyCore(client, base, modType, modText),
      runModifyEnvDNA(client, base, modType, modText),
    ]);
    core = coreResult;
    envDNA = envResult;
  } catch (e) {
    return NextResponse.json(apiErrorBody(e), { status: apiErrorStatus(e) });
  }

  const entry: Entry = {
    id: slug(core.virtual_name || core.name),
    name: core.virtual_name || core.name,
    type: core.type,
    category: core.category,
    catchphrase: core.catchphrase,
    summary: core.summary,
    axes12: core.axes12,
    axes12Rationale: envDNA?.axes12_rationale,
    layers: {
      origin: core.origin,
      behavior: core.behavior,
      trajectory: core.trajectory,
      meaning: core.meaning,
      scale: core.scale,
      host: core.host,
      emotions: core.emotions,
    },
    metrics: core.metrics,
    envDNA: envDNA ?? undefined,
    isVirtual: true,
    basedOn: base.id,
    modification: `${modType}: ${modText}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  if (isKvConfigured()) {
    try { await saveEntry(entry); }
    catch {/* non-fatal */}
  }

  return NextResponse.json({
    entry,
    modificationSummary: core.modification_summary,
    base: { id: base.id, name: base.name, axes12: base.axes12, catchphrase: base.catchphrase },
  });
}

async function runModifyCore(client: Anthropic, base: Entry, modType: string, modText: string): Promise<ModifyCore> {
  const runner = client.messages.stream({
    model: MODEL_ID,
    max_tokens: 12000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: MODIFY_CORE_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: modifyCoreUserPrompt(base, modType, modText) }],
    output_config: { format: zodOutputFormat(ModifyCoreSchema) },
  });
  const msg = await runner.finalMessage();
  const text = extractText(msg);
  if (!text) throw new Error("改造コアの生成に失敗しました。");
  return ModifyCoreSchema.parse(JSON.parse(text));
}

async function runModifyEnvDNA(client: Anthropic, base: Entry, modType: string, modText: string): Promise<EnvDNAResult | null> {
  const runner = client.messages.stream({
    model: MODEL_ID,
    max_tokens: 12000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: MODIFY_ENV_DNA_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: modifyEnvDNAUserPrompt(base, modType, modText) }],
  });
  const msg = await runner.finalMessage();
  const text = extractText(msg);
  if (!text) return null;
  try {
    return EnvDNASchema.parse(JSON.parse(stripFences(text)));
  } catch {
    return null;
  }
}

function extractText(msg: Anthropic.Message): string | null {
  const block = msg.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  return block?.text ?? null;
}

function stripFences(raw: string): string {
  return raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}
