"use client";

import { useEffect, useMemo, useState } from "react";
import { SEED_ENTRIES } from "@/lib/seed-data";
import { EntryCard } from "@/components/entry-card";
import { TYPE_META } from "@/lib/types";
import type { Entry, ObjectType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { loadLibrary } from "@/lib/client-storage";

const CATEGORIES = ["すべて","動物","植物","天体","大地形","微生物","群れ","組織","人工物","概念","状態","現象"];

export default function LibraryPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("すべて");
  const [selectedTypes, setSelectedTypes] = useState<Set<ObjectType>>(new Set());
  const [userEntries, setUserEntries] = useState<Entry[]>([]);

  useEffect(() => {
    setUserEntries(loadLibrary());
  }, []);

  const allEntries = useMemo(() => [...userEntries, ...SEED_ENTRIES], [userEntries]);

  const filtered = useMemo(() => {
    return allEntries.filter(e => {
      if (q && !e.name.includes(q) && !e.catchphrase.includes(q)) return false;
      if (category !== "すべて" && e.category !== category) return false;
      if (selectedTypes.size > 0 && !selectedTypes.has(e.type)) return false;
      return true;
    });
  }, [allEntries, q, category, selectedTypes]);

  function toggleType(t: ObjectType) {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">ライブラリ</h1>
          <p className="text-[14px] text-[var(--text-muted)]">
            {allEntries.length} 個の分類 · 使うほど育ちます
            {userEntries.length > 0 && (
              <span className="ml-2 text-[var(--accent-teal)]">(うちユーザー追加 {userEntries.length})</span>
            )}
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="名前・キャッチで検索..."
            className="input-field h-10 text-[13px]"
            style={{ paddingLeft: "2.75rem" }}
          />
        </div>
      </div>

      {/* Type filter chips */}
      <div className="mb-3">
        <div className="text-[11px] text-[var(--text-dim)] mb-2 uppercase tracking-wider">対象タイプ</div>
        <div className="flex flex-wrap gap-2">
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
                {t} · {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filter chips */}
      <div className="mb-8">
        <div className="text-[11px] text-[var(--text-dim)] mb-2 uppercase tracking-wider">カテゴリ</div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
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

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-[15px] text-[var(--text-secondary)] mb-2">該当する分類はありません</div>
          <div className="text-[13px] text-[var(--text-muted)]">フィルタを変えてみてください</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(e => <EntryCard key={e.id} entry={e} />)}
        </div>
      )}
    </div>
  );
}
