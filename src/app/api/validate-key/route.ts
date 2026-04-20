import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { MODEL_ID } from "@/lib/anthropic";
import { apiErrorBody, apiErrorStatus } from "@/lib/api-error";

export const runtime = "nodejs";
export const maxDuration = 30;

// Validates an API key with a minimal 1-token Claude call.
// Cost: negligible (a few yen at most). Does NOT touch the shared library.
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key")?.trim();
  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    return NextResponse.json({ error: "APIキーの形式が不正です" }, { status: 400 });
  }
  const client = new Anthropic({ apiKey });
  try {
    await client.messages.create({
      model: MODEL_ID,
      max_tokens: 1,
      messages: [{ role: "user", content: "hi" }],
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(apiErrorBody(e), { status: apiErrorStatus(e) });
  }
}
