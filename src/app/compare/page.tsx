"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SEED_ENTRIES } from "@/lib/seed-data";
import { RadarFull } from "@/components/radar-chart";
import { AXIS_META, METRIC_LABELS, TYPE_META } from "@/lib/types";
import type { AxisKey, Entry, Metrics } from "@/lib/types";
import { cn, axesSimilarity, axesToVector } from "@/lib/utils";
import { ratioLabel } from "@/lib/format-metric";
import type { CompareResult } from "@/lib/compare-schema";
import { loadLibrary, authHeaders } from "@/lib/client-storage";

const AXIS_ORDER: AxisKey[] = ["A","B","C","D","E","F","G","H","I","J","K","L"];

function CompareInner() {
  const params = useSearchParams();
  const [aId, setAId] = useState<string>(params.get("a") ?? "crow");
  const [bId, setBId] = useState<string>(params.get("b") ?? "google");
  const [userEntries, setUserEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const a = params.get("a"); if (a) setAId(a);
    const b = params.get("b"); if (b) setBId(b);
  }, [params]);

  useEffect(() => {
    setUserEntries(loadLibrary());
  }, []);

  const allEntries = useMemo(() => {
    const seen = new Set<string>();
    const out: Entry[] = [];
    for (const e of [...userEntries, ...SEED_ENTRIES]) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      out.push(e);
    }
    return out;
  }, [userEntries]);

  const a = allEntries.find(e => e.id === aId);
  const b = allEntries.find(e => e.id === bId);

  const similarity = useMemo(() => {
    if (!a || !b) return 0;
    return axesSimilarity(axesToVector(a.axes12), axesToVector(b.axes12));
  }, [a, b]);

  const diffByAxis = useMemo(() => {
    if (!a || !b) return [];
    return AXIS_ORDER.map(k => ({
      key: k,
      label: AXIS_META[k].label,
      a: a.axes12[k],
      b: b.axes12[k],
      diff: Math.abs(a.axes12[k] - b.axes12[k]),
    })).sort((x, y) => y.diff - x.diff);
  }, [a, b]);

  // AI insight state (cleared when pair changes)
  const [insight, setInsight] = useState<CompareResult | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [insightPhase, setInsightPhase] = useState(0);

  useEffect(() => {
    setInsight(null);
    setInsightError(null);
  }, [aId, bId]);

  useEffect(() => {
    if (!insightLoading) return;
    const t = setInterval(() => setInsightPhase(p => (p + 1) % INSIGHT_PHASES.length), 1800);
    return () => clearInterval(t);
  }, [insightLoading]);

  async function requestInsight() {
    if (!a || !b) return;
    setInsightLoading(true);
    setInsightError(null);
    setInsight(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ a, b }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "リクエスト失敗" }));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const { result } = await res.json();
      setInsight(result);
    } catch (e) {
      setInsightError(e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setInsightLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">比較</h1>
        <p className="text-[14px] text-[var(--text-muted)]">
          2つの対象を12軸で並べて、どこが似ていてどこが違うかを見る。
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 mb-10 items-start">
        <EntrySlot entry={a} entries={allEntries} onChange={setAId} colorClass="text-[var(--accent-teal)]" label="A" />

        {/* Similarity bubble */}
        <div className="lg:w-48 flex flex-col items-center justify-center py-6">
          <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-2">類似度</div>
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
              <circle cx="70" cy="70" r="60" fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
              <circle
                cx="70" cy="70" r="60"
                fill="none"
                stroke="url(#simG)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 60 * similarity} ${2 * Math.PI * 60}`}
              />
              <defs>
                <linearGradient id="simG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5EEAD4" />
                  <stop offset="100%" stopColor="#F5B454" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold tracking-tight">
                {Math.round(similarity * 100)}<span className="text-lg text-[var(--text-muted)]">%</span>
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-2 text-center">
            {similarity > 0.9 ? "ほぼ双子" : similarity > 0.7 ? "かなり似てる" : similarity > 0.5 ? "共通点あり" : "けっこう違う"}
          </div>
        </div>

        <EntrySlot entry={b} entries={allEntries} onChange={setBId} colorClass="text-[var(--accent-amber)]" label="B" />
      </div>

      {/* Overlaid radar */}
      {a && b && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] uppercase tracking-wider text-[var(--text-dim)]">12軸オーバーレイ</h3>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--accent-teal)]" />{a.name}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--accent-amber)]" />{b.name}</span>
              </div>
            </div>
            <RadarFull axes={a.axes12} overlayAxes={b.axes12} />
          </div>

          <div className="card p-6">
            <h3 className="text-[13px] uppercase tracking-wider text-[var(--text-dim)] mb-4">12軸の差分</h3>
            <div className="space-y-2">
              {diffByAxis.map(d => (
                <div key={d.key} className="flex items-center gap-3 py-1">
                  <span className="text-[11px] font-mono text-[var(--text-muted)] w-5">{d.key}</span>
                  <span className="text-[12.5px] text-[var(--text-secondary)] min-w-[72px]">{d.label}</span>
                  <div className="flex-1 relative h-4 bg-[var(--bg-overlay)] rounded">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--border-default)]" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-[var(--accent-teal)]/70"
                      style={{ left: 0, width: `${d.a * 10}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-[var(--accent-amber)]/70"
                      style={{ left: 0, width: `${d.b * 10}%`, mixBlendMode: "screen" }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-dim)] w-10 text-right">
                    Δ{d.diff.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>

            <ScaleDiffText a={a} b={b} />
          </div>
        </div>
      )}

      {/* AI insight */}
      {a && b && (
        <section className="mt-6">
          {!insight && !insightLoading && (
            <div className="card p-6 text-center">
              <div className="text-[13px] uppercase tracking-wider text-[var(--text-dim)] mb-2">
                AIによる比較解説
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4 max-w-xl mx-auto">
                数値では見えない「なぜ似て、なぜ違うのか」を<br />
                AIが自然言語で解き明かします。
              </p>
              <button
                onClick={requestInsight}
                className="btn btn-primary h-10"
                disabled={insightLoading}
              >
                AIに解説してもらう
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </button>
            </div>
          )}

          {insightLoading && (
            <div className="card p-6 shimmer text-center">
              <div className="inline-flex items-center gap-3 text-[13px] text-[var(--text-secondary)]">
                <span className="w-3 h-3 border-2 border-[var(--accent-amber)] border-t-transparent rounded-full animate-spin" />
                {INSIGHT_PHASES[insightPhase]}
              </div>
            </div>
          )}

          {insightError && (
            <div className="card p-5 border-[var(--accent-rose)]/30">
              <div className="flex items-start gap-3">
                <span className="badge badge-rose flex-shrink-0 mt-0.5">エラー</span>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed flex-1">
                  {insightError}
                </p>
                <button onClick={requestInsight} className="btn btn-ghost h-8 text-[12px] flex-shrink-0">
                  再試行
                </button>
              </div>
            </div>
          )}

          {insight && !insightLoading && <InsightCard insight={insight} aName={a.name} bName={b.name} onRefresh={requestInsight} />}
        </section>
      )}
    </div>
  );
}

const INSIGHT_PHASES = [
  "2対象の12軸を対比中...",
  "スケールの差を読み取り中...",
  "由来・役割を比較中...",
  "意外な共通点を探索中...",
  "言葉を選んでいます...",
];

function InsightCard({ insight, aName, bName, onRefresh }: {
  insight: CompareResult;
  aName: string;
  bName: string;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Theme hero */}
      <div className="card p-6 border-[var(--accent-amber)]/25 bg-gradient-to-br from-[rgba(245,180,84,0.03)] to-transparent">
        <div className="flex items-center justify-between mb-3">
          <span className="badge badge-amber">テーマ</span>
          <button onClick={onRefresh} className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            ↻ もう一度
          </button>
        </div>
        <p className="text-[17px] md:text-[18px] leading-relaxed text-[var(--text-primary)] italic">
          {insight.theme}
        </p>
      </div>

      {/* Similarities & Differences side-by-side */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--accent-teal)] mb-3">似ている点</div>
          <ul className="space-y-2.5">
            {insight.similarities.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-[var(--accent-teal)] mt-2 flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--accent-rose)] mb-3">違う点</div>
          <ul className="space-y-2.5">
            {insight.differences.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-[var(--accent-rose)] mt-2 flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Insight + Overall */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5 border-[var(--accent-violet)]/25">
          <div className="text-[11px] uppercase tracking-wider text-[var(--accent-violet)] mb-3">意外な発見</div>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            {insight.surprising_insight}
          </p>
        </div>
        <div className="card p-5">
          <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">
            {aName} と {bName} ― 全体の印象
          </div>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            {insight.overall}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScaleDiffText({ a, b }: { a: Entry | undefined; b: Entry | undefined }) {
  if (!a || !b) return null;
  const metricKeys = Object.keys(METRIC_LABELS) as (keyof Metrics)[];
  const am = a.metrics ?? {};
  const bm = b.metrics ?? {};
  const rows = metricKeys
    .map(k => ({ key: k, label: METRIC_LABELS[k], ratio: ratioLabel(am[k], bm[k]) }))
    .filter(r => r.ratio.dominant === "a" || r.ratio.dominant === "b" || r.ratio.dominant === "equal");

  if (rows.length === 0) {
    return (
      <div className="mt-5 pt-5 border-t border-[var(--border-subtle)]">
        <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-2">スケール差分</div>
        <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
          両対象に共通の数値プロファイルがないため、絶対値比較はできません。
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 pt-5 border-t border-[var(--border-subtle)]">
      <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">スケール差分</div>
      <div className="space-y-1.5">
        {rows.map(r => (
          <div key={r.key} className="flex items-baseline justify-between gap-3 text-[12.5px]">
            <span className="text-[var(--text-secondary)]">{r.label}</span>
            <span className="text-right">
              {r.ratio.dominant === "equal" ? (
                <span className="text-[var(--text-muted)]">{r.ratio.magnitude}</span>
              ) : (
                <>
                  <span className={r.ratio.dominant === "a" ? "text-[var(--accent-teal)]" : "text-[var(--accent-amber)]"}>
                    {r.ratio.dominant === "a" ? a.name : b.name}
                  </span>
                  <span className="text-[var(--text-muted)] mx-1">が</span>
                  <span className="font-mono text-[var(--text-primary)]">{r.ratio.magnitude}</span>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntrySlot({ entry, entries, onChange, colorClass, label }: {
  entry: Entry | undefined;
  entries: Entry[];
  onChange: (id: string) => void;
  colorClass: string;
  label: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("text-[11px] font-mono uppercase tracking-wider", colorClass)}>対象 {label}</span>
      </div>
      <select
        value={entry?.id ?? ""}
        onChange={e => onChange(e.target.value)}
        className="input-field h-10 text-[13px] mb-3"
      >
        {entries.map(e => (
          <option key={e.id} value={e.id}>{e.isVirtual ? `${e.name} (仮想)` : e.name}</option>
        ))}
      </select>
      {entry && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "badge",
              TYPE_META[entry.type].color === "amber" && "badge-amber",
              TYPE_META[entry.type].color === "teal" && "badge-teal",
              TYPE_META[entry.type].color === "rose" && "badge-rose",
              TYPE_META[entry.type].color === "violet" && "badge-violet",
            )}>
              {entry.type} · {TYPE_META[entry.type].label}
            </span>
            <span className="badge">{entry.category}</span>
          </div>
          <p className="text-[12.5px] text-[var(--text-secondary)] italic leading-relaxed">
            {entry.catchphrase}
          </p>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-24 text-center text-[var(--text-muted)]">読込中...</div>}>
      <CompareInner />
    </Suspense>
  );
}
