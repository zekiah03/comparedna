"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SEED_ENTRIES } from "@/lib/seed-data";
import { AXIS_META, METRIC_LABELS, TYPE_META } from "@/lib/types";
import type { Axes12, AxisKey, Entry, Metrics } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatMetric } from "@/lib/format-metric";
import { loadLibrary } from "@/lib/client-storage";

type MetricKey = keyof Metrics;
type Direction = "asc" | "desc";

const AXIS_KEYS = Object.keys(AXIS_META) as AxisKey[];
const METRIC_KEYS = Object.keys(METRIC_LABELS) as MetricKey[];

const CATEGORY_OPTS = ["すべて","動物","植物","天体","大地形","微生物","群れ","組織","人工物","概念","状態","現象"];

type Field =
  | { kind: "metric"; key: MetricKey }
  | { kind: "axis";   key: AxisKey };

export default function RankingsPage() {
  const [userEntries, setUserEntries] = useState<Entry[]>([]);
  const [category, setCategory] = useState("すべて");
  const [field, setField] = useState<Field>({ kind: "metric", key: "size_m" });
  const [direction, setDirection] = useState<Direction>("desc");

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

  const ranked = useMemo(() => {
    const pool = category === "すべて" ? allEntries : allEntries.filter(e => e.category === category);
    const withValue = pool
      .map(e => ({
        entry: e,
        value:
          field.kind === "metric"
            ? (e.metrics?.[field.key] ?? null)
            : (e.axes12[field.key] ?? null),
      }))
      .filter(r => r.value != null) as { entry: Entry; value: number }[];

    withValue.sort((a, b) => direction === "desc" ? b.value - a.value : a.value - b.value);
    return withValue;
  }, [allEntries, category, field, direction]);

  return (
    <div className="max-w-5xl mx-auto px-6 pt-12 pb-24 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">ランキング</h1>
        <p className="text-[14px] text-[var(--text-muted)]">
          数値プロファイル or 12軸スコアで並べ替えて、最大・最小を一気に見る。
        </p>
      </header>

      <div className="card p-5 mb-6">
        <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">並べ替え基準</div>

        {/* Metrics buttons */}
        <div className="mb-4">
          <div className="text-[11px] text-[var(--text-muted)] mb-2">数値プロファイル</div>
          <div className="flex flex-wrap gap-1.5">
            {METRIC_KEYS.map(k => (
              <button
                key={k}
                onClick={() => setField({ kind: "metric", key: k })}
                className={cn(
                  "badge transition-all",
                  field.kind === "metric" && field.key === k
                    ? "badge-amber"
                    : "hover:border-[var(--border-strong)]"
                )}
              >
                {METRIC_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        {/* Axes buttons */}
        <div className="mb-4">
          <div className="text-[11px] text-[var(--text-muted)] mb-2">12軸スコア</div>
          <div className="flex flex-wrap gap-1.5">
            {AXIS_KEYS.map(k => (
              <button
                key={k}
                onClick={() => setField({ kind: "axis", key: k })}
                className={cn(
                  "badge transition-all",
                  field.kind === "axis" && field.key === k
                    ? "badge-teal"
                    : "hover:border-[var(--border-strong)]"
                )}
              >
                {k} · {AXIS_META[k].label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter + direction */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] text-[var(--text-muted)] mb-2">カテゴリで絞る</div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTS.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "badge transition-all",
                    category === c
                      ? "bg-[var(--bg-overlay)] border-[var(--border-strong)] text-[var(--text-primary)]"
                      : "hover:border-[var(--border-strong)]"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] mb-2">並び順</div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setDirection("desc")}
                className={cn(
                  "badge transition-all",
                  direction === "desc" ? "badge-violet" : "hover:border-[var(--border-strong)]"
                )}
              >
                大きい順 ↓
              </button>
              <button
                onClick={() => setDirection("asc")}
                className={cn(
                  "badge transition-all",
                  direction === "asc" ? "badge-violet" : "hover:border-[var(--border-strong)]"
                )}
              >
                小さい順 ↑
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="text-[13px] font-semibold">
            {field.kind === "metric"
              ? `${METRIC_LABELS[field.key]} (${direction === "desc" ? "大きい順" : "小さい順"})`
              : `${AXIS_META[field.key].label} (${direction === "desc" ? "高い順" : "低い順"})`}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {ranked.length} 件
          </div>
        </div>

        {ranked.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-[13px] text-[var(--text-muted)] mb-1">データが不足しています</div>
            <div className="text-[11px] text-[var(--text-dim)]">この基準で並べられる対象がライブラリにありません</div>
          </div>
        ) : (
          <ol className="divide-y divide-[var(--border-subtle)]">
            {ranked.map((r, i) => (
              <li key={r.entry.id}>
                <Link href={`/analyze/${r.entry.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--bg-elevated)] transition-colors">
                  <span className="w-7 text-[13px] font-mono text-[var(--text-muted)] text-right flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[14.5px] font-semibold text-[var(--text-primary)] truncate">{r.entry.name}</span>
                      <span className={cn(
                        "badge",
                        TYPE_META[r.entry.type].color === "amber" && "badge-amber",
                        TYPE_META[r.entry.type].color === "teal" && "badge-teal",
                        TYPE_META[r.entry.type].color === "rose" && "badge-rose",
                        TYPE_META[r.entry.type].color === "violet" && "badge-violet",
                      )}>
                        {r.entry.type}
                      </span>
                      <span className="badge">{r.entry.category}</span>
                      {r.entry.isVirtual && <span className="badge badge-violet">仮想</span>}
                    </div>
                    <div className="text-[12px] text-[var(--text-muted)] italic line-clamp-1">{r.entry.catchphrase}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono text-[13.5px] text-[var(--accent-amber)]">
                      {field.kind === "metric"
                        ? formatMetric(field.key, r.value)
                        : `${r.value}/10`}
                    </div>
                    {field.kind === "metric" && <BarInline value={r.value} values={ranked.map(x => x.value)} />}
                    {field.kind === "axis" && <ScoreBar value={r.value} />}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function BarInline({ value, values }: { value: number; values: number[] }) {
  const max = Math.max(...values.map(Math.abs));
  const abs = Math.abs(value);
  const pct = max > 0 ? (Math.log10(abs + 1) / Math.log10(max + 1)) * 100 : 0;
  return (
    <div className="mt-1 w-24 h-1 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(3, pct)}%`,
          background: "linear-gradient(to right, var(--accent-teal), var(--accent-amber))",
        }}
      />
    </div>
  );
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="mt-1 w-24 h-1 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(3, value * 10)}%`,
          background: "linear-gradient(to right, var(--accent-teal), var(--accent-amber))",
        }}
      />
    </div>
  );
}
