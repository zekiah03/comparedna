import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getClientFromRequest, MODEL_ID } from "@/lib/anthropic";
import { CompareResultSchema, type CompareResult } from "@/lib/compare-schema";
import { COMPARE_SYSTEM_PROMPT, comparePromptFor } from "@/lib/compare-prompt";
import type { Entry } from "@/lib/types";
import { apiErrorBody, apiErrorStatus } from "@/lib/api-error";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let a: Entry;
  let b: Entry;
  try {
    const body = await req.json();
    a = body?.a as Entry;
    b = body?.b as Entry;
    if (!a?.id || !b?.id) return NextResponse.json({ error: "a / b の Entry が必要です" }, { status: 400 });
    if (a.id === b.id) return NextResponse.json({ error: "同じ対象は比較できません" }, { status: 400 });
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

  let parsed: CompareResult;
  try {
    const runner = client.messages.stream({
      model: MODEL_ID,
      max_tokens: 12000,
      thinking: { type: "adaptive" },
      system: [
        { type: "text", text: COMPARE_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: comparePromptFor(a, b) }],
      output_config: { format: zodOutputFormat(CompareResultSchema) },
    });
    const msg = await runner.finalMessage();
    const textBlock = msg.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    if (!textBlock?.text) {
      return NextResponse.json({ error: "解説の生成に失敗しました。" }, { status: 502 });
    }
    try {
      parsed = CompareResultSchema.parse(JSON.parse(textBlock.text));
    } catch (ve) {
      const m = ve instanceof Error ? ve.message : "JSON解析エラー";
      return NextResponse.json({ error: `出力の解析に失敗: ${m}` }, { status: 502 });
    }
  } catch (e) {
    return NextResponse.json(apiErrorBody(e), { status: apiErrorStatus(e) });
  }

  return NextResponse.json({ result: parsed, aName: a.name, bName: b.name });
}
