import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getClientFromRequest, MODEL_ID } from "@/lib/anthropic";
import {
  AnalyzeCoreSchema, EnvDNASchema,
  type AnalyzeCore, type EnvDNAResult,
} from "@/lib/analyze-schema";
import {
  ANALYZE_CORE_SYSTEM_PROMPT, analyzeCoreUserPrompt,
  ANALYZE_ENV_DNA_SYSTEM_PROMPT, analyzeEnvDNAUserPrompt,
} from "@/lib/analyze-prompt";
import type { Entry } from "@/lib/types";
import { apiErrorBody, apiErrorStatus } from "@/lib/api-error";

export const runtime = "nodejs";
export const maxDuration = 60;

function slug(name: string): string {
  const base = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff\-]/g, "");
  return base + "-" + Math.random().toString(36).slice(2, 6);
}

export async function POST(req: NextRequest) {
  let target: string;
  try {
    const body = await req.json();
    target = String(body?.target ?? "").trim();
    if (!target || target.length > 200) {
      return NextResponse.json({ error: "対象名を200字以内で入力してください" }, { status: 400 });
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

  let core: AnalyzeCore;
  let envDNA: EnvDNAResult | null = null;
  try {
    const [coreResult, envResult] = await Promise.all([
      runCore(client, target),
      runEnvDNA(client, target),
    ]);
    core = coreResult;
    envDNA = envResult;
  } catch (e) {
    return NextResponse.json(apiErrorBody(e), { status: apiErrorStatus(e) });
  }

  const entry: Entry = {
    id: slug(core.name),
    name: core.name,
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
    createdAt: new Date().toISOString().slice(0, 10),
  };

  return NextResponse.json({ entry });
}

async function runCore(client: Anthropic, target: string): Promise<AnalyzeCore> {
  const runner = client.messages.stream({
    model: MODEL_ID,
    max_tokens: 12000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: ANALYZE_CORE_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: analyzeCoreUserPrompt(target) }],
    output_config: { format: zodOutputFormat(AnalyzeCoreSchema) },
  });
  const msg = await runner.finalMessage();
  const text = extractText(msg);
  if (!text) throw new Error("コア分析の生成に失敗しました。");
  return AnalyzeCoreSchema.parse(JSON.parse(text));
}

async function runEnvDNA(client: Anthropic, target: string): Promise<EnvDNAResult | null> {
  const runner = client.messages.stream({
    model: MODEL_ID,
    max_tokens: 12000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: ANALYZE_ENV_DNA_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: analyzeEnvDNAUserPrompt(target) }],
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
