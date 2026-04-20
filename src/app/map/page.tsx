"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SEED_ENTRIES } from "@/lib/seed-data";
import { TYPE_META } from "@/lib/types";
import type { Entry, ObjectType } from "@/lib/types";
import { axesToVector, cn } from "@/lib/utils";
import { pca2D } from "@/lib/pca";
import { loadLibrary } from "@/lib/client-storage";

const TYPE_COLORS: Record<ObjectType, string> = {
  T1: "#5EEAD4", // teal
  T2: "#5EEAD4",
  T3: "#A78BFA", // violet
  T4: "#F472B6", // rose
  T5: "#F472B6",
  T6: "#F5B454", // amber
  T7: "#A78BFA",
};

export default function MapPage() {
  const [userEntries, setUserEntries] = useState<Entry[]>([]);
  const [hover, setHover] = useState<Entry | null>(null);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<ObjectType>>(new Set());

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

  const filtered = useMemo(() => {
    if (selectedTypes.size === 0) return allEntries;
    return allEntries.filter(e => selectedTypes.has(e.type));
  }, [allEntries, selectedTypes]);

  const projection = useMemo(() => {
    const vecs = filtered.map(e => axesToVector(e.axes12));
    return pca2D(vecs);
  }, [filtered]);

  const scaled = useMemo(() => {
    const pts = projection.positions;
    if (pts.length === 0) return { points: [] as { x: number; y: number; entry: Entry }[], minX: 0, maxX: 0, minY: 0, maxY: 0 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of pts) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    const pad = 0.08;
    const width = Math.max(1e-6, maxX - minX);
    const height = Math.max(1e-6, maxY - minY);
    const scale = (v: number, min: number, span: number) =>
      pad + ((v - min) / span) * (1 - pad * 2);
    const points = filtered.map((entry, i) => ({
      x: scale(pts[i][0], minX, width),
      y: 1 - scale(pts[i][1], minY, height), // flip y so "up" is positive
      entry,
    }));
    return { points, minX, maxX, minY, maxY };
  }, [projection.positions, filtered]);

  function toggleType(t: ObjectType) {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">マップビュー</h1>
        <p className="text-[14px] text-[var(--text-muted)]">
          12軸空間を PCA で2次元に射影。近くにあるほど似ていて、離れるほど異質。
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider mr-1">タイプで絞る</span>
        {(Object.keys(TYPE_META) as ObjectType[]).map(t => {
          const active = selectedTypes.has(t);
          return (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={cn(
                "badge transition-all",
                active
                  ? (
                      TYPE_META[t].color === "amber" ? "badge-amber" :
                      TYPE_META[t].color === "teal" ? "badge-teal" :
                      TYPE_META[t].color === "rose" ? "badge-rose" :
                      "badge-violet"
                    )
                  : "hover:border-[var(--border-strong)]"
              )}
            >
              {t} · {TYPE_META[t].label}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Scatter plot */}
        <div className="card p-0 overflow-hidden">
          <div className="aspect-square relative grid-bg">
            {/* Origin cross */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--border-subtle)]" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--border-subtle)]" />

            {scaled.points.map(p => {
              const isSelected = selected?.id === p.entry.id;
              const isHover = hover?.id === p.entry.id;
              const color = TYPE_COLORS[p.entry.type];
              return (
                <button
                  key={p.entry.id}
                  onClick={() => setSelected(p.entry)}
                  onMouseEnter={() => setHover(p.entry)}
                  onMouseLeave={() => setHover(null)}
                  className="absolute"
                  style={{
                    left: `${p.x * 100}%`,
                    top: `${p.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  aria-label={p.entry.name}
                >
                  <div
                    className={cn(
                      "rounded-full transition-all",
                      isSelected || isHover ? "scale-150" : "scale-100",
                      p.entry.isVirtual ? "ring-2 ring-[var(--accent-violet)]" : ""
                    )}
                    style={{
                      width: isSelected ? 18 : 10,
                      height: isSelected ? 18 : 10,
                      background: color,
                      boxShadow: isSelected ? `0 0 24px ${color}` : `0 0 8px ${color}66`,
                    }}
                  />
                  {(isHover || isSelected) && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap px-2 py-1 rounded-md bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[11px] pointer-events-none z-10"
                    >
                      {p.entry.name}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Axes hint */}
            <div className="absolute bottom-2 left-2 text-[10px] font-mono text-[var(--text-dim)]">PC1 →</div>
            <div className="absolute top-2 left-2 text-[10px] font-mono text-[var(--text-dim)] rotate-[-90deg] origin-top-left translate-y-full">PC2 →</div>

            {scaled.points.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
                表示する対象がありません
              </div>
            )}
          </div>

          <div className="px-5 py-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>{filtered.length} 対象を描画</span>
            <span className="font-mono text-[var(--text-dim)]">
              寄与率: PC1={projection.explained[0].toFixed(2)} / PC2={projection.explained[1].toFixed(2)}
            </span>
          </div>
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <div className="card p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-2">選択中</div>
            {selected ? (
              <>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={cn(
                    "badge",
                    TYPE_META[selected.type].color === "amber" && "badge-amber",
                    TYPE_META[selected.type].color === "teal" && "badge-teal",
                    TYPE_META[selected.type].color === "rose" && "badge-rose",
                    TYPE_META[selected.type].color === "violet" && "badge-violet",
                  )}>{selected.type} · {TYPE_META[selected.type].label}</span>
                  <span className="badge">{selected.category}</span>
                </div>
                <h3 className="text-[18px] font-semibold mb-1">{selected.name}</h3>
                <p className="text-[12px] text-[var(--accent-amber)] italic mb-3 leading-relaxed">{selected.catchphrase}</p>
                <div className="flex gap-2">
                  <Link href={`/analyze/${selected.id}`} className="btn btn-primary h-9 text-[12px]">詳細を見る</Link>
                  <Link href={`/compare?a=${selected.id}`} className="btn btn-ghost h-9 text-[12px]">比較</Link>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                マップ上の点をクリックすると詳細が出ます。
              </p>
            )}
          </div>

          <div className="card p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">読み方</div>
            <ul className="space-y-2 text-[12px] text-[var(--text-secondary)] leading-relaxed">
              <li>・点の<strong>距離</strong>は12軸ベクトル上の距離の近似</li>
              <li>・<strong>色</strong>は対象タイプ (T1-T7)</li>
              <li>・<strong>紫のリング</strong>は仮想種 (もしもラボ産)</li>
              <li>・軸PC1/PC2は12軸の分散が最大になる方向、意味は固定ではない</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
