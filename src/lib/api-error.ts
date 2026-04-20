import Anthropic from "@anthropic-ai/sdk";

export type ApiErrorBody = {
  error: string;
  code?: "low_credit" | "auth" | "rate_limit" | "overloaded" | "bad_request" | "unknown";
  help?: { label: string; url: string };
};

export function apiErrorBody(e: unknown): ApiErrorBody {
  if (e instanceof Anthropic.AuthenticationError) {
    return {
      error: "APIキーが無効です。設定画面でキーを更新してください。",
      code: "auth",
      help: { label: "設定を開く", url: "/settings" },
    };
  }
  if (e instanceof Anthropic.RateLimitError) {
    return {
      error: "レートリミット超過。しばらく待ってから再試行してください。",
      code: "rate_limit",
    };
  }
  if (e instanceof Anthropic.APIError) {
    const raw = String(e.message ?? "");
    if (/credit balance is too low|insufficient credit|billing|purchase credits/i.test(raw)) {
      return {
        error: "Anthropic アカウントのクレジット残高が不足しています。クレジットを追加すると再開できます。",
        code: "low_credit",
        help: {
          label: "Anthropic Console で購入",
          url: "https://console.anthropic.com/settings/billing",
        },
      };
    }
    if (/overloaded/i.test(raw) || e.status === 529) {
      return {
        error: "API が混雑しています。少し待ってから再試行してください。",
        code: "overloaded",
      };
    }
    if (e.status === 400) {
      return { error: `リクエストが拒否されました: ${shortMessage(raw)}`, code: "bad_request" };
    }
    return { error: `API エラー (${e.status ?? "?"}): ${shortMessage(raw)}`, code: "unknown" };
  }
  const msg = e instanceof Error ? e.message : "不明なエラー";
  return { error: msg, code: "unknown" };
}

export function apiErrorStatus(e: unknown): number {
  if (e instanceof Anthropic.AuthenticationError) return 401;
  if (e instanceof Anthropic.RateLimitError) return 429;
  if (e instanceof Anthropic.APIError) {
    const raw = String(e.message ?? "");
    if (/credit balance is too low/i.test(raw)) return 402;
    return e.status ?? 500;
  }
  return 500;
}

function shortMessage(raw: string, limit = 240): string {
  // Trim long provider blobs, keep first useful sentence.
  const single = raw.replace(/\s+/g, " ").trim();
  if (single.length <= limit) return single;
  return single.slice(0, limit) + "…";
}
