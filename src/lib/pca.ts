// Minimal 2D PCA via power iteration on the covariance matrix.
// Input: n vectors of the same dimension d.
// Output: { positions: [[x, y]...], explained: [λ1, λ2] }

type Vec = number[];

function mean(vecs: Vec[]): Vec {
  const d = vecs[0].length;
  const out = new Array(d).fill(0);
  for (const v of vecs) for (let i = 0; i < d; i++) out[i] += v[i];
  for (let i = 0; i < d; i++) out[i] /= vecs.length;
  return out;
}

function center(vecs: Vec[]): Vec[] {
  const m = mean(vecs);
  return vecs.map(v => v.map((x, i) => x - m[i]));
}

function covariance(vecs: Vec[]): number[][] {
  const d = vecs[0].length;
  const n = vecs.length;
  const cov = Array.from({ length: d }, () => new Array(d).fill(0));
  for (const v of vecs) {
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        cov[i][j] += v[i] * v[j];
      }
    }
  }
  const denom = Math.max(1, n - 1);
  for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) cov[i][j] /= denom;
  return cov;
}

function matMulVec(m: number[][], v: Vec): Vec {
  const d = m.length;
  const out = new Array(d).fill(0);
  for (let i = 0; i < d; i++) {
    let s = 0;
    for (let j = 0; j < d; j++) s += m[i][j] * v[j];
    out[i] = s;
  }
  return out;
}

function dot(a: Vec, b: Vec): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function normalize(v: Vec): Vec {
  const n = Math.sqrt(dot(v, v));
  if (n === 0) return v.slice();
  return v.map(x => x / n);
}

function powerIterate(m: number[][], iterations = 200): { vec: Vec; eig: number } {
  const d = m.length;
  let v = new Array(d).fill(0).map((_, i) => Math.sin(i + 1)); // deterministic seed
  v = normalize(v);
  for (let i = 0; i < iterations; i++) {
    const next = matMulVec(m, v);
    const norm = Math.sqrt(dot(next, next));
    if (norm === 0) break;
    v = next.map(x => x / norm);
  }
  const eig = dot(v, matMulVec(m, v));
  return { vec: v, eig };
}

function deflate(m: number[][], vec: Vec, eig: number): number[][] {
  const d = m.length;
  const out = Array.from({ length: d }, (_, i) => new Array(d).fill(0).map((_, j) => m[i][j] - eig * vec[i] * vec[j]));
  return out;
}

export function pca2D(vecs: Vec[]): { positions: [number, number][]; explained: [number, number] } {
  if (vecs.length === 0) return { positions: [], explained: [0, 0] };
  if (vecs.length === 1) return { positions: [[0, 0]], explained: [0, 0] };

  const centered = center(vecs);
  const cov = covariance(centered);
  const pc1 = powerIterate(cov);
  const deflated = deflate(cov, pc1.vec, pc1.eig);
  const pc2 = powerIterate(deflated);

  const positions = centered.map(v => [dot(v, pc1.vec), dot(v, pc2.vec)] as [number, number]);
  return { positions, explained: [pc1.eig, pc2.eig] };
}
