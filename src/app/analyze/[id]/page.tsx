"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { SEED_ENTRIES } from "@/lib/seed-data";
import { RadarFull } from "@/components/radar-chart";
import {
  TYPE_META, AXIS_META, METRIC_LABELS,
  PRESSURE_AXIS_META, ORIGIN_LAYER_META, RELATIONSHIP_META,
  TIME_RHYTHM_META, TABOO_META, INTERNAL_META, CONSTRAINT_META,
} from "@/lib/types";
import type {
  AxisKey, Entry, Metrics, EnvDNA,
  PressureAxisKey, OriginLayerKey, RelationshipKey,
  TimeRhythmKey, TabooAspirationKey, InternalKey, ConstraintKey,
} from "@/lib/types";
import { cn, cosineSimilarity, axesToVector } from "@/lib/utils";
import { formatMetric } from "@/lib/format-metric";
import type { HumanProfile } from "@/lib/analogy-schema";
import {
  loadLibrary, findEntry,
  removeFromLibrary, updateInLibrary,
  loadAnalogy, saveAnalogy,
  authHeaders,
} from "@/lib/client-storage";

const AXIS_ORDER: AxisKey[] = ["A","B","C","D","E","F","G","H","I","J","K","L"];

const LAYER_META = [
  { key: "origin",       label: "由来",          desc: "なぜそうなったか — 環境DNA" },
  { key: "behavior",     label: "挙動",          desc: "今、何をしているか" },
  { key: "trajectory",   label: "軌跡",          desc: "これからどうなるか" },
  { key: "meaning",      label: "意味",          desc: "他者にとって何か" },
  { key: "scale",        label: "スケール",      desc: "大きさ・時間・影響範囲 (物語)" },
  { key: "emotions",     label: "感情の源泉",    desc: "恐怖・喜び・愛など" },
  { key: "host",         label: "宿主・観測者",  desc: "誰の中に存在するか" },
] as const;

export default function AnalyzePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(() => SEED_ENTRIES.find(e => e.id === id) ?? null);
  const [loading, setLoading] = useState(!entry);
  const [userEntries, setUserEntries] = useState<Entry[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (entry) return;
    const found = findEntry(id);
    if (found) setEntry(found);
    setLoading(false);
  }, [id, entry]);

  useEffect(() => {
    setUserEntries(loadLibrary());
  }, []);

  const similar = useMemo(() => {
    if (!entry) return [];
    const myVec = axesToVector(entry.axes12);
    const pool = [...userEntries, ...SEED_ENTRIES];
    const seen = new Set<string>();
    return pool
      .filter(e => {
        if (e.id === entry.id) return false;
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      })
      .map(e => ({ entry: e, score: cosineSimilarity(myVec, axesToVector(e.axes12)) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [entry, userEntries]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 pt-32 pb-24 text-center text-[var(--text-muted)]">
        読込中...
      </div>
    );
  }
  if (!entry) notFound();

  const typeColor = TYPE_META[entry.type].color;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-32 animate-fade-in">
      <nav className="text-[12px] text-[var(--text-muted)] mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-[var(--text-primary)]">ホーム</Link>
        <span className="text-[var(--text-dim)]">/</span>
        <Link href="/library" className="hover:text-[var(--text-primary)]">ライブラリ</Link>
        <span className="text-[var(--text-dim)]">/</span>
        <span className="text-[var(--text-secondary)]">{entry.name}</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
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
          {entry.isVirtual && <span className="badge badge-violet">仮想種</span>}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">{entry.name}</h1>
        <p className="text-[16px] text-[var(--accent-amber)] italic mb-2">
          {entry.catchphrase}
        </p>
        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
          {entry.summary}
        </p>
        {entry.isVirtual && entry.basedOn && (
          <div className="mt-4 card p-3 inline-flex items-center gap-3 text-[12px]">
            <span className="text-[var(--text-dim)] uppercase tracking-wider text-[10px]">改造元</span>
            <Link
              href={`/analyze/${entry.basedOn}`}
              className="text-[var(--accent-teal)] hover:underline"
            >
              {entry.basedOn}
            </Link>
            {entry.modification && (
              <span className="text-[var(--text-muted)] border-l border-[var(--border-default)] pl-3">
                {entry.modification}
              </span>
            )}
          </div>
        )}
      </header>

      <div className="grid lg:grid-cols-5 gap-6 mb-12">
        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-20 self-start">
          <AxesCard entry={entry} />

          {entry.metrics && <MetricsCard metrics={entry.metrics} />}

          {entry.envDNA?.pressure_axes && <PressureAxesCard axes={entry.envDNA.pressure_axes} />}
        </div>

        <div className="lg:col-span-3 space-y-3">
          {LAYER_META.map((layer, i) => (
            <LayerAccordion
              key={layer.key}
              number={i + 1}
              label={layer.label}
              desc={layer.desc}
              defaultOpen={i === 0}
              layerKey={layer.key}
              entry={entry}
            />
          ))}
        </div>
      </div>

      <AnalogySection entry={entry} />

      {/* Similar */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">似てるTop 3</h2>
            <p className="text-[12px] text-[var(--text-muted)]">12軸のコサイン類似度で計算</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {similar.map(({ entry: e, score }) => (
            <Link
              key={e.id}
              href={`/analyze/${e.id}`}
              className="card card-interactive p-5 block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="badge badge-teal">類似度 {(score * 100).toFixed(0)}%</span>
                <span className="badge">{e.category}</span>
              </div>
              <h3 className="text-[17px] font-semibold mb-1.5">{e.name}</h3>
              <p className="text-[12px] text-[var(--text-secondary)] italic line-clamp-2">
                {e.catchphrase}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="sticky bottom-6 z-30 flex justify-center">
        <div className="card px-3 py-2 flex items-center gap-2 bg-[var(--bg-overlay)]/90 backdrop-blur-xl">
          <Link href={`/compare?a=${entry.id}`} className="btn btn-subtle h-9 text-[13px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3v18M15 3v18"/>
            </svg>
            比較に追加
          </Link>
          <Link href={`/lab?base=${entry.id}`} className="btn btn-subtle h-9 text-[13px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
              <path d="M8.5 2h7"/>
            </svg>
            もしもラボで改造
          </Link>
          {!isSeed(entry.id) && (
            <>
              <span className="w-px h-5 bg-[var(--border-subtle)] mx-0.5" aria-hidden />
              <button
                onClick={() => setEditOpen(true)}
                className="btn btn-subtle h-9 text-[13px]"
                aria-label="編集"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
                編集
              </button>
              <button
                onClick={() => {
                  if (!confirm(`「${entry.name}」を削除します。本当に削除しますか?`)) return;
                  const removed = removeFromLibrary(entry.id);
                  if (removed) router.push("/library");
                  else alert("削除に失敗しました (シードエントリは削除できません)");
                }}
                className="btn btn-subtle h-9 text-[13px] text-[var(--accent-rose)] hover:bg-[rgba(244,114,182,0.1)]"
                aria-label="削除"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                </svg>
                削除
              </button>
            </>
          )}
        </div>
      </div>

      {editOpen && (
        <EditModal
          entry={entry}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => { setEntry(updated); setEditOpen(false); }}
        />
      )}
    </div>
  );
}

function isSeed(id: string): boolean {
  return SEED_ENTRIES.some(e => e.id === id);
}

function EditModal({
  entry, onClose, onSaved,
}: {
  entry: Entry;
  onClose: () => void;
  onSaved: (e: Entry) => void;
}) {
  const [name, setName] = useState(entry.name);
  const [catchphrase, setCatchphrase] = useState(entry.catchphrase);
  const [summary, setSummary] = useState(entry.summary);
  const [category, setCategory] = useState(entry.category);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function save() {
    setSaving(true); setErr(null);
    try {
      const updated = updateInLibrary(entry.id, { name, catchphrase, summary, category });
      if (!updated) throw new Error("エントリーが見つかりません (シードは編集不可)");
      onSaved(updated);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(11,15,26,0.75)] backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="card p-6 w-full max-w-lg animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">エントリーを編集</h2>
          <button onClick={onClose} aria-label="閉じる" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <EditField label="名前" value={name} onChange={setName} />
          <EditField label="カテゴリ" value={category} onChange={setCategory} />
          <EditField label="キャッチ" value={catchphrase} onChange={setCatchphrase} />
          <EditField label="要約" value={summary} onChange={setSummary} multiline />
        </div>

        <p className="text-[11px] text-[var(--text-dim)] mt-4 leading-relaxed">
          名前・カテゴリ・キャッチ・要約のみ編集できます。12軸や7層を変えたい場合は「もしもラボ」を使ってください。
        </p>

        {err && (
          <div className="mt-3 p-3 rounded-[var(--radius-md)] bg-[rgba(244,114,182,0.08)] border border-[rgba(244,114,182,0.3)] text-[12px] text-[var(--accent-rose)]">
            {err}
          </div>
        )}

        <div className="flex items-center gap-2 mt-5 justify-end">
          <button onClick={onClose} className="btn btn-ghost h-10 text-[13px]" disabled={saving}>キャンセル</button>
          <button onClick={save} className="btn btn-primary h-10 text-[13px]" disabled={saving || !name.trim()}>
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AnalogySection({ entry }: { entry: Entry }) {
  const [result, setResult] = useState<HumanProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const cached = loadAnalogy(entry.id);
    if (cached) setResult(cached);
    setChecked(true);
  }, [entry.id]);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setPhase(p => (p + 1) % PROFILE_PHASES.length), 1800);
    return () => clearInterval(t);
  }, [loading]);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analogize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ entry }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "リクエスト失敗" }));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const { result } = await res.json();
      setResult(result);
      saveAnalogy(entry.id, result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setLoading(false);
    }
  }

  if (!checked) return null;

  return (
    <section className="mb-12">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold mb-1">もし一人の人間なら</h2>
          <p className="text-[12px] text-[var(--text-muted)]">
            この対象を一人の人間に翻訳して、履歴書として眺める。
          </p>
        </div>
        {result && (
          <button
            onClick={generate}
            disabled={loading}
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent-teal)] transition-colors"
          >
            ↻ 別の人物で生成
          </button>
        )}
      </div>

      {!result && !loading && !error && (
        <div className="card p-8 text-center">
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-5 max-w-xl mx-auto">
            もしこの対象が一人の人間だったら。<br />
            何歳で、どんな家で育ち、何をしてきた人か ― を履歴書で描きます。
          </p>
          <button onClick={generate} className="btn btn-primary h-10">
            履歴書を作成する
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </button>
        </div>
      )}

      {loading && (
        <div className="card p-8 shimmer text-center">
          <div className="inline-flex items-center gap-3 text-[13px] text-[var(--text-secondary)]">
            <span className="w-3 h-3 border-2 border-[var(--accent-amber)] border-t-transparent rounded-full animate-spin" />
            {PROFILE_PHASES[phase]}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="card p-5 border-[var(--accent-rose)]/30">
          <div className="flex items-start gap-3">
            <span className="badge badge-rose flex-shrink-0 mt-0.5">エラー</span>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed flex-1">{error}</p>
            <button onClick={generate} className="btn btn-ghost h-8 text-[12px] flex-shrink-0">再試行</button>
          </div>
        </div>
      )}

      {result && !loading && <ProfileCard data={result} />}
    </section>
  );
}

const PROFILE_PHASES = [
  "年齢と寿命ステージを見定め中...",
  "氏名と出身を決めています...",
  "学歴と職歴を編んでいます...",
  "趣味と家族構成を吟味中...",
  "口調を定めて自己PRを書いています...",
];

function ProfileCard({ data }: { data: HumanProfile }) {
  return (
    <article className="card p-0 overflow-hidden animate-fade-in">
      {/* Document header */}
      <header className="flex items-center justify-between px-7 md:px-10 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-baseline gap-3">
          <span className="text-[17px] font-bold tracking-wider text-[var(--text-primary)]">履歴書</span>
          <span className="text-[11px] font-mono text-[var(--text-dim)] tracking-[0.2em] uppercase">Résumé</span>
        </div>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          人間換算 · 満 {data.age} 歳
        </span>
      </header>

      {/* Identity */}
      <section className="px-7 md:px-10 py-6 flex items-center gap-5 md:gap-7 border-b border-[var(--border-subtle)]">
        <div className="w-14 h-[72px] md:w-16 md:h-20 border border-[var(--border-default)] rounded-[var(--radius-sm)] bg-[var(--bg-overlay)] flex items-center justify-center flex-shrink-0">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] text-[var(--text-dim)] font-mono tracking-wider uppercase mb-0.5">ふりがな · {data.furigana}</div>
          <div className="text-[22px] md:text-[26px] font-bold text-[var(--text-primary)] tracking-tight leading-tight">
            {data.name}
          </div>
          <div className="text-[12.5px] text-[var(--text-muted)] mt-1.5">
            {data.age}歳 · {data.gender} · {data.location}
          </div>
        </div>
      </section>

      {/* Current status */}
      <section className="px-7 md:px-10 py-4 border-b border-[var(--border-subtle)]">
        <div className="text-[10px] font-mono tracking-[0.2em] text-[var(--text-dim)] uppercase mb-1.5">現在の所属</div>
        <div className="text-[15px] text-[var(--accent-amber)] font-medium leading-relaxed">{data.current}</div>
      </section>

      {/* Education + Career as two-column compact summary */}
      <section className="px-7 md:px-10 py-5 border-b border-[var(--border-subtle)] grid gap-5 md:grid-cols-2">
        <SummaryRow label="学歴" kicker="Education" value={data.education} />
        <SummaryRow label="職歴" kicker="Career"    value={data.career} />
      </section>

      {/* Family + Hobbies */}
      <section className="px-7 md:px-10 py-5 border-b border-[var(--border-subtle)] grid gap-5 md:grid-cols-2">
        <SummaryRow label="家族構成" kicker="Family"    value={data.family} />
        <SummaryRow label="趣味・特技" kicker="Interests" value={data.hobbies} />
      </section>

      {/* Self PR - main attraction */}
      <section className="px-7 md:px-10 py-7">
        <div className="flex items-baseline gap-3 mb-3">
          <div className="text-[13px] font-semibold text-[var(--text-primary)]">自己PR</div>
          <div className="text-[10px] font-mono tracking-[0.2em] text-[var(--text-dim)] uppercase">Self-Introduction</div>
        </div>
        <p className="text-[14.5px] md:text-[15px] text-[var(--text-primary)] leading-[2]">
          {data.self_pr}
        </p>
      </section>

      {/* Motto */}
      {data.motto && data.motto.trim() && (
        <section className="px-7 md:px-10 py-5 border-t border-[var(--border-subtle)] bg-gradient-to-br from-[rgba(245,180,84,0.05)] to-transparent">
          <blockquote className="border-l-2 border-[var(--accent-amber)]/60 pl-4 py-0.5 flex items-center gap-5 flex-wrap">
            <div className="text-[10px] font-mono tracking-[0.2em] text-[var(--text-dim)] uppercase flex-shrink-0">座右の銘</div>
            <p className="text-[16px] md:text-[17px] text-[var(--accent-amber)] italic leading-relaxed">
              「{data.motto}」
            </p>
          </blockquote>
        </section>
      )}
    </article>
  );
}

function SummaryRow({ label, kicker, value }: { label: string; kicker: string; value: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">{label}</div>
        <div className="text-[9.5px] font-mono tracking-[0.2em] text-[var(--text-dim)] uppercase">{kicker}</div>
      </div>
      <div className="text-[13px] text-[var(--text-secondary)] leading-[1.8]">{value}</div>
    </div>
  );
}

function EditField({ label, value, onChange, multiline }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] block mb-1.5">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="input-field text-[13px] resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input-field h-10 text-[13px]"
        />
      )}
    </label>
  );
}

function AxesCard({ entry }: { entry: Entry }) {
  const [showRationale, setShowRationale] = useState(false);
  const hasRationale = Boolean(entry.axes12Rationale);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] uppercase tracking-wider text-[var(--text-dim)]">12軸プロファイル</h3>
        <span className="text-[11px] text-[var(--text-muted)]">0 → 10</span>
      </div>
      <RadarFull axes={entry.axes12} />

      <div className="mt-5 pt-5 border-t border-[var(--border-subtle)]">
        {!showRationale ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {AXIS_ORDER.map(k => (
              <div key={k} className="flex items-center gap-2 text-[11.5px] py-0.5">
                <span className="w-4 h-4 rounded-sm bg-[var(--bg-overlay)] flex items-center justify-center text-[9px] font-mono text-[var(--accent-teal)] flex-shrink-0">{k}</span>
                <span className="text-[var(--text-muted)] truncate flex-1">{AXIS_META[k].label}</span>
                <span className="font-mono text-[var(--text-secondary)]">{entry.axes12[k]}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {AXIS_ORDER.map(k => {
              const v = entry.axes12[k];
              const rationale = entry.axes12Rationale?.[k];
              return (
                <div key={k} className="group">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded bg-[var(--bg-overlay)] flex items-center justify-center text-[10px] font-mono text-[var(--accent-teal)] flex-shrink-0">{k}</span>
                    <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">{AXIS_META[k].label}</span>
                    <span className="flex-1 h-1 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
                      <span
                        className="block h-full"
                        style={{
                          width: `${v * 10}%`,
                          background: "linear-gradient(to right, var(--accent-teal), var(--accent-amber))",
                        }}
                      />
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)] w-6 text-right">{v}</span>
                  </div>
                  {rationale ? (
                    <p className="text-[11.5px] text-[var(--text-secondary)] leading-[1.7] pl-7">
                      {rationale}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[var(--text-dim)] leading-relaxed pl-7 italic">
                      根拠テキストはこのエントリーにはありません (シードまたは旧形式)。
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => setShowRationale(v => !v)}
          className="w-full mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11.5px] text-[var(--text-muted)] hover:text-[var(--accent-teal)] transition-colors flex items-center justify-center gap-2"
        >
          {showRationale ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              数値だけを見る
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              なぜこの値? {hasRationale ? "" : "(根拠なし)"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function MetricsCard({ metrics }: { metrics: Metrics }) {
  const keys = Object.keys(METRIC_LABELS) as (keyof Metrics)[];
  const hasAny = keys.some(k => metrics[k] != null);
  if (!hasAny) {
    return (
      <div className="card p-6">
        <h3 className="text-[13px] uppercase tracking-wider text-[var(--text-dim)] mb-3">数値プロファイル</h3>
        <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
          この対象は物理量では記述できません (純粋な抽象概念など)。
        </p>
      </div>
    );
  }
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] uppercase tracking-wider text-[var(--text-dim)]">数値プロファイル</h3>
        <span className="text-[11px] text-[var(--text-muted)]">SI単位 / 対数目盛</span>
      </div>
      <div className="space-y-2.5">
        {keys.map(k => {
          const v = metrics[k];
          if (v == null) return null;
          return (
            <div key={k} className="flex items-baseline justify-between gap-3">
              <span className="text-[12px] text-[var(--text-muted)]">{METRIC_LABELS[k]}</span>
              <span className="text-[13px] font-mono text-[var(--text-primary)] text-right">
                {formatMetric(k, v)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-dim)] leading-relaxed">
        数値はAIによる概算。桁オーダーの比較に使ってください。
      </div>
    </div>
  );
}

type LayerKey = typeof LAYER_META[number]["key"];

function LayerAccordion({
  number, label, desc, defaultOpen, layerKey, entry
}: {
  number: number; label: string; desc: string; defaultOpen?: boolean;
  layerKey: LayerKey; entry: Entry;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <div className={cn("card overflow-hidden", open && "border-[var(--border-default)]")}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 flex items-center gap-4 text-left"
      >
        <div className="w-8 h-8 flex-shrink-0 rounded-[var(--radius-md)] bg-[var(--bg-overlay)] border border-[var(--border-default)] flex items-center justify-center text-[12px] font-mono text-[var(--accent-teal)]">
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold">{label}</div>
          <div className="text-[12px] text-[var(--text-muted)]">{desc}</div>
        </div>
        <svg
          className={cn("text-[var(--text-muted)] transition-transform", open && "rotate-180")}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-[var(--border-subtle)] animate-fade-in">
          <LayerBody layerKey={layerKey} entry={entry} />
        </div>
      )}
    </div>
  );
}

function LayerBody({ layerKey, entry }: { layerKey: LayerKey; entry: Entry }) {
  const layers = entry.layers;
  const env = entry.envDNA;

  if (!layers) {
    return (
      <div className="pt-4 text-[13px] text-[var(--text-muted)] leading-relaxed">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 rounded bg-[var(--bg-overlay)] mt-0.5 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[var(--accent-amber)]" />
          </div>
          <div>
            このエントリーはシードライブラリの初期データです。
            新規に対象を分析するとAIが全層を生成します。
            <Link href="/" className="text-[var(--accent-teal)] hover:underline ml-1">新しく分析する →</Link>
          </div>
        </div>
      </div>
    );
  }

  if (layerKey === "emotions") {
    const em = layers.emotions;
    const items: { label: string; text: string; color: "rose"|"amber"|"violet"|"teal" }[] = [
      { label: "恐怖",   text: em.fear,    color: "rose"   },
      { label: "喜び",   text: em.joy,     color: "amber"  },
      { label: "怒り",   text: em.anger,   color: "rose"   },
      { label: "愛",     text: em.love,    color: "amber"  },
      { label: "悲しみ", text: em.sadness, color: "violet" },
    ];
    return (
      <div className="pt-4 space-y-2">
        {items.map(it => (
          <div key={it.label} className="flex items-start gap-3">
            <span className={cn(
              "badge flex-shrink-0 mt-0.5",
              it.color === "amber" && "badge-amber",
              it.color === "rose" && "badge-rose",
              it.color === "violet" && "badge-violet",
              it.color === "teal" && "badge-teal",
            )}>{it.label}</span>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed flex-1">{it.text}</p>
          </div>
        ))}
      </div>
    );
  }

  const text = (
    layerKey === "origin"     ? layers.origin :
    layerKey === "behavior"   ? layers.behavior :
    layerKey === "trajectory" ? layers.trajectory :
    layerKey === "meaning"    ? layers.meaning :
    layerKey === "scale"      ? layers.scale :
    layerKey === "host"       ? layers.host :
    ""
  );

  return (
    <div className="pt-4 space-y-5">
      <p className="text-[13.5px] text-[var(--text-secondary)] leading-[1.75]">{text}</p>

      {/* 環境DNA 深層分析 (layer毎に関連するブロック) */}
      {env && layerKey === "origin" && env.origin_layers && (
        <DeepList
          title="起源12層"
          entries={(Object.keys(ORIGIN_LAYER_META) as OriginLayerKey[]).map(k => ({
            label: ORIGIN_LAYER_META[k],
            value: env.origin_layers[k],
          }))}
        />
      )}

      {env && layerKey === "behavior" && (
        <>
          {env.relationships && (
            <DeepList
              title="関係性ネットワーク"
              entries={(Object.keys(RELATIONSHIP_META) as RelationshipKey[]).map(k => ({
                label: RELATIONSHIP_META[k],
                value: env.relationships[k],
              }))}
            />
          )}
          {env.internal && (
            <DeepList
              title="内部ダイナミクス"
              entries={(Object.keys(INTERNAL_META) as InternalKey[]).map(k => ({
                label: INTERNAL_META[k],
                value: env.internal[k],
              }))}
            />
          )}
        </>
      )}

      {env && layerKey === "trajectory" && env.time_rhythm && (
        <DeepList
          title="時間リズム"
          entries={(Object.keys(TIME_RHYTHM_META) as TimeRhythmKey[]).map(k => ({
            label: TIME_RHYTHM_META[k],
            value: env.time_rhythm[k],
          }))}
        />
      )}

      {env && layerKey === "meaning" && env.taboo_aspiration && (
        <DeepList
          title="禁忌と憧れ"
          entries={(Object.keys(TABOO_META) as TabooAspirationKey[]).map(k => ({
            label: TABOO_META[k],
            value: env.taboo_aspiration[k],
          }))}
        />
      )}

      {env && layerKey === "scale" && env.constraints && (
        <DeepList
          title="物理・論理制約"
          entries={(Object.keys(CONSTRAINT_META) as ConstraintKey[]).map(k => ({
            label: CONSTRAINT_META[k],
            value: env.constraints[k],
          }))}
        />
      )}
    </div>
  );
}

function DeepList({ title, entries }: { title: string; entries: { label: string; value: string }[] }) {
  const items = entries.filter(e => e.value && e.value.trim());
  if (items.length === 0) return null;
  return (
    <div className="pt-4 border-t border-[var(--border-subtle)]">
      <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">{title}</div>
      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[11px] text-[var(--accent-teal)] font-mono flex-shrink-0 min-w-[72px]">{it.label}</span>
            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed flex-1">{it.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PressureAxesCard({ axes }: { axes: EnvDNA["pressure_axes"] }) {
  const keys = Object.keys(PRESSURE_AXIS_META) as PressureAxisKey[];
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] uppercase tracking-wider text-[var(--text-dim)]">環境プレッシャー軸</h3>
        <span className="text-[11px] text-[var(--text-muted)]">0 ↔ 10</span>
      </div>
      <div className="space-y-2">
        {keys.map(k => {
          const v = axes[k] ?? 0;
          const meta = PRESSURE_AXIS_META[k];
          return (
            <div key={k} className="grid grid-cols-[52px_1fr_28px] gap-2.5 items-center">
              <span className="text-[11.5px] text-[var(--text-secondary)] text-right">{meta.label}</span>
              <div className="relative h-3 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full"
                  style={{
                    width: `${v * 10}%`,
                    background: "linear-gradient(to right, var(--accent-teal), var(--accent-amber))",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-1 text-[9px] font-mono text-[var(--text-dim)]">
                  <span>{meta.low}</span>
                  <span>{meta.high}</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-muted)] text-right">{v}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-dim)] leading-relaxed">
        対象が置かれている環境の12次元プレッシャー。&ldquo;なぜそういう進化をしたのか&rdquo;の材料。
      </div>
    </div>
  );
}
