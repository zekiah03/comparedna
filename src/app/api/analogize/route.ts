import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getClientFromRequest, MODEL_ID } from "@/lib/anthropic";
import { HumanProfileSchema, type HumanProfile } from "@/lib/analogy-schema";
import { ANALOGY_SYSTEM_PROMPT, analogyUserPrompt } from "@/lib/analogy-prompt";
import type { Entry } from "@/lib/types";
import { apiErrorBody, apiErrorStatus } from "@/lib/api-error";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let entry: Entry;
  try {
    const body = await req.json();
    entry = body?.entry as Entry;
    if (!entry?.id || !entry?.name || !entry?.axes12) {
      return NextResponse.json({ error: "Entry データが必要です" }, { status: 400 });
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

  let parsed: HumanProfile;
  try {
    const runner = client.messages.stream({
      model: MODEL_ID,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: [
        { type: "text", text: ANALOGY_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: analogyUserPrompt(entry) }],
      output_config: { format: zodOutputFormat(HumanProfileSchema) },
    });
    const msg = await runner.finalMessage();
    const text = msg.content.find((b): b is Anthropic.TextBlock => b.type === "text")?.text;
    if (!text) return NextResponse.json({ error: "履歴書の生成に失敗しました。" }, { status: 502 });
    parsed = HumanProfileSchema.parse(JSON.parse(text));
  } catch (e) {
    return NextResponse.json(apiErrorBody(e), { status: apiErrorStatus(e) });
  }

  return NextResponse.json({ result: parsed });
}
