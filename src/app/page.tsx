"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SEED_ENTRIES } from "@/lib/seed-data";
import { EntryCard } from "@/components/entry-card";
import type { Entry } from "@/lib/types";
import { loadApiKey } from "@/lib/client-storage";

export default function Home() {
  const [value, setValue] = useState("");
  const router = useRouter();
  const [userEntries, setUserEntries] = useState<Entry[]>([]);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    setHasKey(Boolean(loadApiKey()));
    (async () => {
      try {
        const res = await fetch("/api/library");
        if (!res.ok) return;
        const { entries } = await res.json();
        setUserEntries(entries ?? []);
      } catch {/* ignore */}
    })();
  }, []);

  const recent = [...userEntries, ...SEED_ENTRIES].slice(0, 5);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/analyze/new?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="grid-bg">
      {hasKey === false && (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <Link
            href="/settings"
            className="card card-interactive p-4 flex items-center gap-4 group"
          >
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[rgba(245,180,84,0.12)] border border-[rgba(245,180,84,0.3)] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <rect width="18" height="11" x="3" y="11" rx="2"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-[var(--text-primary)]">APIキーが未設定です</div>
              <div className="text-[12px] text-[var(--text-muted)]">Claude API キーを設定すると、対象を入力して分析できるようになります。</div>
            </div>
            <div className="btn btn-primary h-9 text-[13px] flex-shrink-0">
              設定する
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7"/>
              </svg>
            </div>
          </Link>
        </div>
      )}

      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 badge badge-teal mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] animate-pulse" />
          12軸 × 60要素 × 7層
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-3 bg-gradient-to-br from-[var(--text-primary)] via-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
          存在を、<br className="hidden md:inline" />プロファイリングする。
        </h1>

        <p className="text-[12px] md:text-[13px] tracking-[0.2em] text-[var(--text-dim)] uppercase font-mono mb-8">
          Morpho — 万物の分類学
        </p>

        <p className="text-[15px] md:text-[17px] text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed">
          あらゆる対象を12軸と環境DNAで解剖し、<br />
          ジャンルを越えた類似を炙り出すAI分類学。
        </p>

        <form onSubmit={submit} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="例: カラス、太陽、Google、恋愛、素数..."
            className="input-field text-[15px] h-14 pl-6 pr-32"
            aria-label="分析したいもの"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="btn btn-primary absolute right-2 top-2 h-10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            分析する
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <span className="text-[12px] text-[var(--text-dim)]">試しに:</span>
          {["シロアリコロニー", "富士山", "うつ病", "虹", "ChatGPT"].map(s => (
            <button
              key={s}
              onClick={() => { setValue(s); }}
              className="text-[12px] text-[var(--text-muted)] hover:text-[var(--accent-teal)] transition-colors underline-offset-2 hover:underline"
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">最近分析されたもの</h2>
            <p className="text-[13px] text-[var(--text-muted)]">
              ライブラリは使うほど育ちます。
            </p>
          </div>
          <Link href="/library" className="btn btn-ghost h-9 text-[13px]">
            全てを見る
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {recent.map(e => <EntryCard key={e.id} entry={e} />)}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-4">
          <Feature
            accent="teal"
            kicker="Measure"
            title="12次元のベクトル"
            desc="構造・エネルギー・制御・重力・排除。あらゆる存在に共通する12本の物差しで、対象をベクトル化する。"
          />
          <Feature
            accent="amber"
            kicker="Decode"
            title="進化圧の解読"
            desc="何に晒され、何を捨て、何に至ったか。環境DNA60要素が「なぜそうなったか」を炙り出す。"
          />
          <Feature
            accent="violet"
            kicker="Reflect"
            title="同型の発見"
            desc="ジャンルを越えた隣人を見つける。会社がシロアリに、太陽がクマムシに似る瞬間を可視化する。"
          />
        </div>
      </section>
    </div>
  );
}

function Feature({ kicker, title, desc, accent }: { kicker: string; title: string; desc: string; accent: "teal" | "amber" | "violet" }) {
  const colorMap = {
    teal: "var(--accent-teal)",
    amber: "var(--accent-amber)",
    violet: "var(--accent-violet)",
  };
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-6 h-6 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
          style={{ background: `${colorMap[accent]}20`, border: `1px solid ${colorMap[accent]}40` }}
        >
          <div className="w-1 h-1 rounded-full" style={{ background: colorMap[accent] }} />
        </div>
        <span
          className="text-[10px] font-mono uppercase tracking-[0.18em]"
          style={{ color: colorMap[accent] }}
        >
          {kicker}
        </span>
      </div>
      <h3 className="text-[15.5px] font-semibold mb-2 text-[var(--text-primary)] tracking-tight">{title}</h3>
      <p className="text-[12.5px] text-[var(--text-muted)] leading-[1.75]">{desc}</p>
    </div>
  );
}
