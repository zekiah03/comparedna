"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { loadApiKey, saveApiKey, clearApiKey, maskApiKey } from "@/lib/client-storage";

export default function SettingsPage() {
  const [saved, setSaved] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    setSaved(loadApiKey());
  }, []);

  async function handleSave(withTest: boolean) {
    const key = input.trim();
    if (!key) { setMsg({ type: "error", text: "キーを入力してください" }); return; }
    setMsg(null);
    if (withTest) setTesting(true); else setSaving(true);
    try {
      if (withTest) {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": key },
          body: JSON.stringify({ target: "テスト" }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: "HTTP " + res.status }));
          throw new Error(body.error ?? "検証に失敗");
        }
      }
      saveApiKey(key);
      setSaved(key);
      setInput("");
      setMsg({ type: "ok", text: withTest ? "テスト成功・保存しました" : "保存しました" });
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "不明なエラー" });
    } finally {
      setTesting(false); setSaving(false);
    }
  }

  function handleClear() {
    if (!confirm("保存中のキーを削除します。")) return;
    clearApiKey();
    setSaved(null);
    setMsg({ type: "ok", text: "削除しました" });
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-12 pb-24 animate-fade-in">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge">Settings</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">設定</h1>
        <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">
          Claude API キーはあなたのブラウザ (localStorage) にのみ保存されます。
          サーバーには送信時のみヘッダーで渡され、永続化されません。
        </p>
      </header>

      {/* Status */}
      <div className="card p-6 mb-6">
        <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">現在のステータス</div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              saved ? "bg-[var(--accent-teal)]" : "bg-[var(--accent-rose)]"
            )} />
            <span className="text-[13px] text-[var(--text-primary)]">
              {saved ? "設定済み" : "未設定 — 分析・比較・改造・履歴書 が使えません"}
            </span>
            {saved && <code className="text-[11px] font-mono text-[var(--text-muted)]">{maskApiKey(saved)}</code>}
          </div>
          {saved && (
            <button onClick={handleClear} className="btn btn-ghost h-8 text-[12px]">
              削除
            </button>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="card p-6 mb-6">
        <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">
          {saved ? "キーを上書き" : "APIキーを登録"}
        </div>
        <input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="sk-ant-api03-..."
          className="input-field h-11 text-[13px] font-mono"
          autoComplete="off"
          spellCheck={false}
          onKeyDown={e => { if (e.key === "Enter") handleSave(true); }}
        />
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => handleSave(true)}
            disabled={testing || saving || !input.trim()}
            className="btn btn-primary h-10 text-[13px] disabled:opacity-40"
          >
            {testing ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-[#1A1000] border-t-transparent rounded-full animate-spin" />
                テスト中...
              </>
            ) : "テストして保存"}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving || testing || !input.trim()}
            className="btn btn-ghost h-10 text-[13px] disabled:opacity-40"
          >
            {saving ? "保存中..." : "テストせず保存"}
          </button>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] mt-3 leading-relaxed">
          「テストして保存」は1回の小さなAPI呼び出し(数円以下)でキーを検証してから保存します。
        </p>

        {msg && (
          <div className={cn(
            "mt-4 p-3 rounded-[var(--radius-md)] text-[13px] leading-relaxed border",
            msg.type === "ok"
              ? "bg-[rgba(94,234,212,0.08)] border-[rgba(94,234,212,0.3)] text-[var(--accent-teal)]"
              : "bg-[rgba(244,114,182,0.08)] border-[rgba(244,114,182,0.3)] text-[var(--accent-rose)]"
          )}>
            {msg.text}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card p-6">
        <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">APIキーの取得</div>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-3">
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent-teal)] hover:underline"
          >
            Anthropic Console
          </a>
          {" "}からAPIキーを作成してこのアプリに登録してください。
          キーは <code className="px-1 py-0.5 rounded bg-[var(--bg-elevated)] text-[11px] font-mono">sk-ant-</code> で始まります。
          事前にクレジットを購入しておく必要があります (目安: 分析1回あたり 約$0.3-0.6)。
        </p>
        <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
          キーはあなたの端末の localStorage にのみ保存され、サーバーには永続化されません。
          他の端末では別途登録が必要です。
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          ← ホームに戻る
        </Link>
      </div>
    </div>
  );
}
