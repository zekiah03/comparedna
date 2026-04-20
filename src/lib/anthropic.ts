import Anthropic from "@anthropic-ai/sdk";

export const MODEL_ID = "claude-opus-4-7";

/**
 * Resolve API key in order of precedence:
 *   1. Explicit header (from request — user's own key via client-storage)
 *   2. Environment variable ANTHROPIC_API_KEY (host default)
 */
export function resolveApiKeyFromRequest(req: Request): string | undefined {
  const fromHeader = req.headers.get("x-api-key")?.trim();
  if (fromHeader) return fromHeader;
  const fromEnv = process.env.ANTHROPIC_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  return undefined;
}

export function getClientFromRequest(req: Request): Anthropic {
  const apiKey = resolveApiKeyFromRequest(req);
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY が未設定です。設定画面でキーを入力するか、デプロイ環境変数に設定してください。");
  }
  return new Anthropic({ apiKey });
}
