"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SEED_ENTRIES } from "@/lib/seed-data";
import { RadarFull } from "@/components/radar-chart";
import { METRIC_LABELS, TYPE_META } from "@/lib/types";
import type { Entry, Metrics } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatMetric, ratioLabel } from "@/lib/format-metric";
import { loadLibrary, addToLibrary, authHeaders } from "@/lib/client-storage";

type ModType = "削除" | "追加" | "強化/弱化" | "環境変更" | "スケール" | "融合" | "反転" | "時間軸";

const MOD_TYPES: { id: ModType; hint: string; placeholder: string }[] = [
  { id: "削除", hint: "特定の機能や部位を取り除く", placeholder: "例: 手足を全部削除 / 脳なし / 記憶なし" },
  { id: "追加", hint: "新しい能力や部位を足す", placeholder: "例: 翼を追加 / 光合成能力 / 2つ目の頭" },
  { id: "強化/弱化", hint: "ある性質を極端にする", placeholder: "例: 知能10倍 / 寿命1日 / エネルギー効率最大" },
  { id: "環境変更", hint: "住む場所や条件を変える", placeholder: "例: 深海に住む / 無重力 / 火星の気候" },
  { id: "スケール", hint: "大きさ・速さを変える", placeholder: "例: 100倍サイズ / 1cm / 寿命1000年" },
  { id: "融合", hint: "他の対象と混ぜる", placeholder: "例: カラス×猫 / Google×宗教 / ウイルス+AI" },
  { id: "反転", hint: "性質を逆にする", placeholder: "例: 捕食↔被食を逆転 / 集団→単独 / 明→闇" },
  { id: "時間軸", hint: "過去や未来の姿を見る", placeholder: "例: 10万年後の人類 / 古代の会社 / 原始の姿" },
];

type LabResult = {
  entry: Entry;
  modificationSummary: string;
  base: { id: string; name: string; axes12: Entry["axes12"]; catchphrase: string };
};

function LabInner() {
  const params = useSearchParams();
  const [baseId, setBaseId] = useState(params.get("base") ?? "crow");
  const [mod, setMod] = useState<ModType>("削除");
  const [text, setText] = useState("");
  const [allEntries, setAllEntries] = useState<Entry[]>(SEED_ENTRIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LabResult | null>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const b = params.get("base"); if (b) setBaseId(b);
  }, [params]);

  useEffect(() => {
    setAllEntries([...loadLibrary(), ...SEED_ENTRIES]);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setPhase(p => (p + 1) % LAB_PHASES.length), 1800);
    return () => clearInterval(t);
  }, [loading]);

  const base = allEntries.find(e => e.id === baseId);
  const modMeta = MOD_TYPES.find(m => m.id === mod)!;

  async function handleModify() {
    if (!base) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ base, modType: mod, modText: text }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "リクエスト失敗" }));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as LabResult;
      setResult(data);
      addToLibrary(data.entry);
    } catch (e) {
      setError(e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 animate-fade-in">
      <header className="mb-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-violet">もしもラボ</span>
            <span className="badge">仮想種ライブラリ</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">もしもラボ</h1>
          <p className="text-[14px] text-[var(--text-muted)] max-w-2xl">
            「もし手足がなかったら?」「もし深海に住んでたら?」
            既存の対象を改造して、AIに仮想種を生成させます。
          </p>
        </div>
      </header>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Left: controls */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">改造元</div>
            <select
              value={baseId}
              onChange={e => { setBaseId(e.target.value); setResult(null); }}
              className="input-field h-10 text-[13px]"
            >
              {allEntries.filter(e => !e.isVirtual).map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            {base && (
              <p className="text-[12px] text-[var(--text-secondary)] italic mt-3 leading-relaxed">
                {base.catchphrase}
              </p>
            )}
          </div>

          <div className="card p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">改造タイプ</div>
            <div className="grid grid-cols-2 gap-1.5">
              {MOD_TYPES.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMod(m.id); setResult(null); }}
                  className={cn(
                    "px-2.5 py-2 rounded-[var(--radius-sm)] text-[12px] transition-all border",
                    mod === m.id
                      ? "bg-[var(--accent-violet)]/15 border-[var(--accent-violet)]/40 text-[var(--accent-violet)]"
                      : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {m.id}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-3 leading-relaxed">
              {modMeta.hint}
            </p>
          </div>

          <div className="card p-5">
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">改造の内容</div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={modMeta.placeholder}
              rows={3}
              className="input-field text-[13px] resize-none"
              disabled={loading}
            />
            <button
              className="btn btn-primary h-10 w-full mt-3 disabled:opacity-50"
              disabled={loading || !base}
              onClick={handleModify}
            >
              {loading ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-[#1A1000] border-t-transparent rounded-full animate-spin" />
                  改造中...
                </>
              ) : (
                <>
                  改造する
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
            {loading && (
              <p className="text-[11px] text-[var(--text-muted)] mt-2 text-center">
                {LAB_PHASES[phase]}
              </p>
            )}
            {error && (
              <p className="text-[11px] text-[var(--accent-rose)] mt-2 leading-relaxed">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Right: before/after */}
        <div className="space-y-4">
          {base && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-teal">BEFORE · 実在</span>
                  <span className="text-[11px] text-[var(--text-muted)]">{base.name}</span>
                </div>
                <RadarFull axes={base.axes12} />
                <p className="text-[12px] text-[var(--text-secondary)] italic mt-3 text-center">
                  {base.catchphrase}
                </p>
              </div>

              <div className={cn(
                "card p-5 relative",
                result ? "border-[var(--accent-violet)]/30" : "",
                loading && "shimmer"
              )}>
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-violet">AFTER · 仮想種</span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {result?.entry.name ?? `${mod} された${base.name}`}
                  </span>
                </div>
                {result ? (
                  <>
                    <RadarFull axes={result.entry.axes12} color="#A78BFA" />
                    <p className="text-[12px] text-[var(--accent-violet)] italic mt-3 text-center">
                      {result.entry.catchphrase}
                    </p>
                  </>
                ) : (
                  <div className="aspect-square flex items-center justify-center text-[12px] text-[var(--text-dim)] text-center px-6">
                    {loading
                      ? "AIが7層を再構築中..."
                      : "左のパネルで改造を実行すると\nここに結果が表示されます"}
                  </div>
                )}
              </div>
            </div>
          )}

          {result && (
            <>
              <div className="card p-5">
                <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">改造の効果</div>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                  {result.modificationSummary}
                </p>
              </div>

              {base && result.entry.metrics && (
                <MetricsDiffCard
                  before={base.metrics}
                  after={result.entry.metrics}
                  beforeName={base.name}
                  afterName={result.entry.name}
                />
              )}

              {result.entry.layers && (
                <div className="card p-5">
                  <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-3">
                    新しい7層 (サマリー)
                  </div>
                  <div className="space-y-3">
                    <LayerRow label="由来" text={result.entry.layers.origin} accent="teal" />
                    <LayerRow label="挙動" text={result.entry.layers.behavior} accent="amber" />
                    <LayerRow label="軌跡" text={result.entry.layers.trajectory} accent="rose" />
                    <LayerRow label="意味" text={result.entry.layers.meaning} accent="violet" />
                    <LayerRow label="スケール" text={result.entry.layers.scale} accent="teal" />
                    <LayerRow label="宿主" text={result.entry.layers.host} accent="amber" />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Link href={`/analyze/${result.entry.id}`} className="btn btn-primary h-10">
                  仮想種の詳細を見る
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link
                  href={`/compare?a=${result.base.id}&b=${result.entry.id}`}
                  className="btn btn-ghost h-10"
                >
                  元と比較
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const LAB_PHASES = [
  "改造の影響を推論中...",
  "12軸を再計算中...",
  "由来・環境DNAを書き換え中...",
  "挙動と軌跡を再構築中...",
  "新しい意味を読み取り中...",
  "感情の源泉を再推定中...",
  "仮想種を命名中...",
];

function MetricsDiffCard({
  before, after, beforeName, afterName,
}: {
  before?: Metrics;
  after: Metrics;
  beforeName: string;
  afterName: string;
}) {
  const keys = Object.keys(METRIC_LABELS) as (keyof Metrics)[];
  const rows = keys
    .map(k => ({
      key: k,
      label: METRIC_LABELS[k],
      before: before?.[k] ?? null,
      after: after?.[k] ?? null,
      ratio: ratioLabel(before?.[k], after?.[k]),
    }))
    .filter(r => r.before != null || r.after != null);

  if (rows.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] uppercase tracking-wider text-[var(--text-dim)]">数値の変化</div>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)]" /> 改造前</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-violet)]" /> 改造後</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {rows.map(r => (
          <div key={r.key} className="grid grid-cols-[90px_1fr_1fr_auto] gap-3 items-baseline text-[12px] py-1">
            <span className="text-[var(--text-muted)]">{r.label}</span>
            <span className="font-mono text-[var(--accent-teal)] truncate">{formatMetric(r.key, r.before)}</span>
            <span className="font-mono text-[var(--accent-violet)] truncate">{formatMetric(r.key, r.after)}</span>
            <span className="font-mono text-right whitespace-nowrap">
              {r.ratio.dominant === "a" || r.ratio.dominant === "b" ? (
                <>
                  <span className={r.ratio.dominant === "a" ? "text-[var(--accent-teal)]" : "text-[var(--accent-violet)]"}>
                    {r.ratio.dominant === "a" ? beforeName : afterName}
                  </span>
                  <span className="text-[var(--text-muted)] mx-1">が</span>
                  <span className="text-[var(--text-primary)]">{r.ratio.magnitude}</span>
                </>
              ) : (
                <span className="text-[var(--text-dim)]">{r.ratio.magnitude}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LayerRow({ label, text, accent }: { label: string; text: string; accent: "amber"|"teal"|"violet"|"rose" }) {
  return (
    <div className="flex items-start gap-3">
      <span className={cn(
        "badge flex-shrink-0 mt-0.5",
        accent === "amber" && "badge-amber",
        accent === "teal" && "badge-teal",
        accent === "violet" && "badge-violet",
        accent === "rose" && "badge-rose",
      )}>{label}</span>
      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed flex-1">{text}</p>
    </div>
  );
}

export default function LabPage() {
  return (
    <Suspense fallback={<div className="p-24 text-center text-[var(--text-muted)]">読込中...</div>}>
      <LabInner />
    </Suspense>
  );
}
