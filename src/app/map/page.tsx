"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { SEED_ENTRIES } from "@/lib/seed-data";
import { TYPE_META } from "@/lib/types";
import type { Entry, ObjectType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RadarMini } from "@/components/radar-chart";

const Scene = dynamic(() => import("./_scene"), { ssr: false });

export default function MapPage() {
  const router = useRouter();
  const [userEntries, setUserEntries] = useState<Entry[]>([]);
  const [hovered, setHovered] = useState<Entry | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showLinks, setShowLinks] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<Set<ObjectType>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/library");
        if (!res.ok) return;
        const { entries } = await res.json();
        setUserEntries(entries ?? []);
      } catch {/* ignore */}
    })();
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

  function toggleType(t: ObjectType) {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }

  return (
    <div className="relative w-full h-[calc(100vh-56px)] overflow-hidden">
      {/* 3D scene fills the area */}
      <div className="absolute inset-0">
        <Scene
          entries={filtered}
          onHover={setHovered}
          onSelect={(e) => router.push(`/analyze/${e.id}`)}
          hoveredId={hovered?.id ?? null}
          autoRotate={autoRotate}
          showLinks={showLinks}
        />
      </div>

      {/* Top-left: title + filter */}
      <div className="absolute top-5 left-5 max-w-sm pointer-events-none">
        <div className="card p-4 bg-[rgba(11,15,26,0.85)] backdrop-blur-md pointer-events-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-teal">3D</span>
            <h1 className="text-[15px] font-semibold">星座ビュー</h1>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-3">
            12軸空間を3次元にPCA射影。対象は球として空間に浮かび、似ているほど近く、Pearson類似度 &gt; 0.6 は線で繋がる。
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(TYPE_META) as ObjectType[]).map(t => {
              const active = selectedTypes.has(t);
              const meta = TYPE_META[t];
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={cn(
                    "badge transition-all",
                    active ? (
                      meta.color === "amber" ? "badge-amber" :
                      meta.color === "teal" ? "badge-teal" :
                      meta.color === "rose" ? "badge-rose" :
                      "badge-violet"
                    ) : "hover:border-[var(--border-strong)]"
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top-right: detail panel (hover) */}
      {hovered && <DetailPanel entry={hovered} />}

      {/* Bottom-left: legend */}
      <div className="absolute bottom-5 left-5 card p-3.5 bg-[rgba(11,15,26,0.85)] backdrop-blur-md pointer-events-none max-w-[260px]">
        <div className="text-[10px] font-mono tracking-[0.2em] text-[var(--text-dim)] uppercase mb-2">
          視覚化の凡例
        </div>
        <ul className="space-y-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
          <LegendRow icon="◎" label="位置 (xyz)" value="12軸PCAの上位3主成分" />
          <LegendRow icon="●" label="色" value="対象タイプ (T1〜T7)" />
          <LegendRow icon="⬤" label="サイズ" value="軸H · 重力(影響力)" />
          <LegendRow icon="✧" label="発光" value="軸B · エネルギー" />
          <LegendRow icon="~" label="脈動" value="軸J · 流動性" />
          <LegendRow icon="○" label="紫の輪" value="仮想種" />
          <LegendRow icon="—" label="接続線" value="Pearson類似度 > 0.6" />
        </ul>
      </div>

      {/* Bottom-right: controls */}
      <div className="absolute bottom-5 right-5 card p-3 bg-[rgba(11,15,26,0.85)] backdrop-blur-md flex items-center gap-2">
        <ControlBtn active={autoRotate} onClick={() => setAutoRotate(v => !v)} label="自動回転" />
        <ControlBtn active={showLinks} onClick={() => setShowLinks(v => !v)} label="類似線" />
        <div className="text-[10px] text-[var(--text-dim)] ml-2 pl-2 border-l border-[var(--border-subtle)]">
          ドラッグで視点 · スクロールでズーム
        </div>
      </div>
    </div>
  );
}

function LegendRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-[var(--accent-teal)] font-mono w-3 flex-shrink-0">{icon}</span>
      <span className="text-[var(--text-muted)] w-[76px] flex-shrink-0">{label}</span>
      <span className="text-[var(--text-secondary)]">{value}</span>
    </li>
  );
}

function ControlBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 h-7 rounded-[var(--radius-sm)] text-[11px] transition-all border",
        active
          ? "bg-[var(--accent-teal)]/15 border-[var(--accent-teal)]/40 text-[var(--accent-teal)]"
          : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
      )}
    >
      {active ? "● " : "○ "}{label}
    </button>
  );
}

function DetailPanel({ entry }: { entry: Entry }) {
  const typeColor = TYPE_META[entry.type].color;
  return (
    <Link
      href={`/analyze/${entry.id}`}
      className="absolute top-5 right-5 card p-5 w-[300px] bg-[rgba(11,15,26,0.92)] backdrop-blur-md animate-fade-in block hover:border-[var(--accent-teal)]/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={cn(
              "badge",
              typeColor === "amber" && "badge-amber",
              typeColor === "teal" && "badge-teal",
              typeColor === "rose" && "badge-rose",
              typeColor === "violet" && "badge-violet",
            )}>
              {entry.type} · {TYPE_META[entry.type].label}
            </span>
            <span className="badge">{entry.category}</span>
            {entry.isVirtual && <span className="badge badge-violet">仮想</span>}
          </div>
          <h3 className="text-[18px] font-semibold text-[var(--text-primary)] truncate">
            {entry.name}
          </h3>
        </div>
        <RadarMini axes={entry.axes12} />
      </div>
      <p className="text-[12px] text-[var(--accent-amber)] italic leading-relaxed mb-3">
        {entry.catchphrase}
      </p>
      <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
        {entry.summary}
      </p>
      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] flex items-center justify-between">
        <span>クリックで詳細ページへ</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  );
}
