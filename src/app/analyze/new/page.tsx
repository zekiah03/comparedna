"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SEED_ENTRIES } from "@/lib/seed-data";
import { authHeaders } from "@/lib/client-storage";

type Status = "seed-redirect" | "analyzing" | "error" | "done";

function NewAnalyzeInner() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";

  const [status, setStatus] = useState<Status>("analyzing");
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorHelp, setErrorHelp] = useState<{ label: string; url: string } | null>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!q.trim()) {
      router.replace("/");
      return;
    }
    // If exact match in seed library, redirect to that
    const seedHit = SEED_ENTRIES.find(e => e.name === q);
    if (seedHit) {
      setStatus("seed-redirect");
      router.replace(`/analyze/${seedHit.id}`);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setStatus("analyzing");
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ target: q }),
        });
        if (cancelled) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: "リクエスト失敗" }));
          if (cancelled) return;
          setStatus("error");
          setError(body.error ?? `HTTP ${res.status}`);
          setErrorCode(body.code ?? null);
          setErrorHelp(body.help ?? null);
          return;
        }
        const { entry } = await res.json();
        router.replace(`/analyze/${entry.id}`);
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setError(e instanceof Error ? e.message : "不明なエラー");
      }
    })();
    return () => { cancelled = true; };
  }, [q, router]);

  useEffect(() => {
    if (status !== "analyzing") return;
    const t = setInterval(() => setPhase(p => (p + 1) % PHASES.length), 1800);
    return () => clearInterval(t);
  }, [status]);

  if (status === "seed-redirect") return null;

  if (status === "error") {
    const title =
      errorCode === "low_credit" ? "クレジットが足りません" :
      errorCode === "auth" ? "APIキーが無効です" :
      errorCode === "rate_limit" ? "レートリミットに達しました" :
      errorCode === "overloaded" ? "API が混雑中です" :
      "分析に失敗しました";

    return (
      <div className="max-w-xl mx-auto px-6 pt-24 pb-24 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 badge badge-rose mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-rose)]" />
          エラー
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-3">{title}</h1>
        <p className="text-[12.5px] text-[var(--text-dim)] mb-2">対象: 「{q}」</p>
        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-8 max-w-lg mx-auto">
          {error}
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {errorHelp && (
            <a
              href={errorHelp.url}
              target={errorHelp.url.startsWith("http") ? "_blank" : undefined}
              rel={errorHelp.url.startsWith("http") ? "noreferrer" : undefined}
              className="btn btn-primary h-10"
            >
              {errorHelp.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </a>
          )}
          <Link
            href={`/analyze/new?q=${encodeURIComponent(q)}`}
            className={errorHelp ? "btn btn-ghost h-10" : "btn btn-primary h-10"}
          >
            もう一度試す
          </Link>
          <Link href="/" className="btn btn-ghost h-10">
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 pt-24 pb-24 text-center animate-fade-in">
      <div className="inline-flex items-center gap-2 badge badge-teal mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] animate-pulse" />
        AI分析中
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-3">「{q}」</h1>
      <p className="text-[14px] text-[var(--text-secondary)] mb-12 leading-relaxed">
        7層の枠組みで分析しています。30〜60秒ほどかかります。
      </p>

      <div className="relative w-32 h-32 mx-auto mb-8">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r="56" fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
          <circle
            cx="64" cy="64" r="56"
            fill="none"
            stroke="url(#spinG)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="20 380"
            className="animate-[spin_1.8s_linear_infinite]"
            style={{ transformOrigin: "64px 64px" }}
          />
          <defs>
            <linearGradient id="spinG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5EEAD4" />
              <stop offset="100%" stopColor="#F5B454" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
            {String(phase + 1).padStart(2, "0")}/07
          </span>
        </div>
      </div>

      <div className="text-[13px] text-[var(--text-secondary)] h-5 transition-all">
        {PHASES[phase]}
      </div>
    </div>
  );
}

const PHASES = [
  "対象タイプを判定中...",
  "12軸のスコアを算出中...",
  "由来 (環境DNA) を掘り起こし中...",
  "挙動と軌跡を分析中...",
  "意味と象徴を読み取り中...",
  "感情の源泉を推定中...",
  "キャッチを生成中...",
];

export default function NewAnalyzePage() {
  return (
    <Suspense fallback={<div className="p-24 text-center text-[var(--text-muted)]">読込中...</div>}>
      <NewAnalyzeInner />
    </Suspense>
  );
}
