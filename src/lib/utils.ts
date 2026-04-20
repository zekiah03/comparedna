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
  return ["A","B","C","D","E","F","G","H","I","J","K","L"].map(k => axes[k] ?? 0);
}
