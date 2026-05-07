import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Pearson correlation: same shape as cosine but each vector is centered first.
// Result in [-1, 1]. Captures "which axes are above/below the entry's own mean",
// so two entries that are both "uniformly high" don't look identical anymore.
export function pearsonCorrelation(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  const n = a.length;
  const meanA = a.reduce((s, x) => s + x, 0) / n;
  const meanB = b.reduce((s, x) => s + x, 0) / n;
  let num = 0, ssA = 0, ssB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    ssA += da * da;
    ssB += db * db;
  }
  if (ssA === 0 || ssB === 0) return 0;
  return num / Math.sqrt(ssA * ssB);
}

// 12軸の類似度 — UI 用の 0..1 スコア。
// Pearson [-1, 1] を (1+r)/2 で 0..1 にマップ:
//   1.0 (100%) = 形が完全一致
//   0.5 (50%)  = パターンは無相関
//   0.0 (0%)   = 形が完全に逆
export function axesSimilarity(a: number[], b: number[]): number {
  const r = pearsonCorrelation(a, b);
  return (1 + r) / 2;
}

export function axesToVector(axes: Record<string, number>): number[] {
  return ["A","B","C","D","E","F","G","H","I","J","K","L","M"].map(k => axes[k] ?? 0);
}

// 型認識型形態距離 (形態場理論 v2.0)
// 4クラスター重み付き軸距離 + 存在論的型ペナルティ
// クラスター重み: I(物質)=1.5, II(情報)=1.2, III(関係)=1.0, IV(時間)=0.8
// 型ペナルティ重み: TYPE_DIST値 × 5
import type { ObjectType } from "./types";
import { TYPE_DIST } from "./types";

const CLUSTER_WEIGHTS: Record<string, number> = {
  A: 1.5, B: 1.5, C: 1.5,  // Cluster I 物質
  D: 1.2, E: 1.2, F: 1.2,  // Cluster II 情報
  G: 1.0, H: 1.0, I: 1.0,  // Cluster III 関係
  J: 0.8, K: 0.8, L: 0.8, M: 0.8,  // Cluster IV 時間
};
const AXIS_ORDER = ["A","B","C","D","E","F","G","H","I","J","K","L","M"] as const;
const TYPE_DIST_WEIGHT = 5;

export function morphoDist(
  axesA: Record<string, number>,
  typeA: ObjectType,
  axesB: Record<string, number>,
  typeB: ObjectType,
): number {
  let weightedSq = 0;
  for (const k of AXIS_ORDER) {
    const diff = (axesA[k] ?? 0) - (axesB[k] ?? 0);
    weightedSq += CLUSTER_WEIGHTS[k] * diff * diff;
  }
  const typePenalty = TYPE_DIST[typeA][typeB] * TYPE_DIST_WEIGHT;
  return Math.sqrt(weightedSq + typePenalty * typePenalty);
}

// 形態距離を 0..1 の類似度に変換 (参考値)
// 最大距離を約 130 と仮定 (全軸差10 + 最大型距離5×5)
export function morphoSimilarity(
  axesA: Record<string, number>,
  typeA: ObjectType,
  axesB: Record<string, number>,
  typeB: ObjectType,
): number {
  const dist = morphoDist(axesA, typeA, axesB, typeB);
  return Math.max(0, 1 - dist / 130);
}
