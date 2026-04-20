// Auto-scale SI values into human-friendly Japanese units

const LY = 9.4607e15;       // 1光年 (m)
const AU = 1.496e11;        // 1天文単位
const M_SUN = 1.989e30;     // 太陽質量 (kg)
const M_EARTH = 5.972e24;   // 地球質量 (kg)
const YEAR = 31557600;      // 1年 (s, ユリウス年)
const DAY = 86400;
const HOUR = 3600;
const MIN = 60;
const C_LIGHT = 299792458;  // 光速 (m/s)

function sig(n: number, digits = 3): string {
  if (!isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 10) return n.toFixed(Math.max(0, digits - Math.ceil(Math.log10(abs))));
  return n.toPrecision(digits);
}

export function formatSize(m: number | null | undefined): string {
  if (m == null) return "—";
  const abs = Math.abs(m);
  if (abs === 0) return "0 m";
  if (abs >= LY) return `${sig(m / LY)} 光年`;
  if (abs >= AU) return `${sig(m / AU)} au`;
  if (abs >= 1e9) return `${sig(m / 1e9)} Gm`;
  if (abs >= 1e6) return `${sig(m / 1e6)} Mm`;
  if (abs >= 1e3) return `${sig(m / 1e3)} km`;
  if (abs >= 1) return `${sig(m)} m`;
  if (abs >= 1e-2) return `${sig(m * 100)} cm`;
  if (abs >= 1e-3) return `${sig(m * 1e3)} mm`;
  if (abs >= 1e-6) return `${sig(m * 1e6)} µm`;
  if (abs >= 1e-9) return `${sig(m * 1e9)} nm`;
  if (abs >= 1e-12) return `${sig(m * 1e12)} pm`;
  return `${m.toExponential(2)} m`;
}

export function formatMass(kg: number | null | undefined): string {
  if (kg == null) return "—";
  const abs = Math.abs(kg);
  if (abs === 0) return "0 kg";
  if (abs >= M_SUN) return `${sig(kg / M_SUN)} M☉ (太陽質量)`;
  if (abs >= M_EARTH) return `${sig(kg / M_EARTH)} 地球質量`;
  if (abs >= 1e9) return `${sig(kg / 1e9)} 億t`;
  if (abs >= 1e6) return `${sig(kg / 1e6)} Mt`;
  if (abs >= 1e3) return `${sig(kg / 1e3)} t`;
  if (abs >= 1) return `${sig(kg)} kg`;
  if (abs >= 1e-3) return `${sig(kg * 1e3)} g`;
  if (abs >= 1e-6) return `${sig(kg * 1e6)} mg`;
  if (abs >= 1e-9) return `${sig(kg * 1e9)} µg`;
  if (abs >= 1e-12) return `${sig(kg * 1e12)} ng`;
  if (abs >= 1e-15) return `${sig(kg * 1e15)} pg`;
  return `${kg.toExponential(2)} kg`;
}

export function formatTime(s: number | null | undefined): string {
  if (s == null) return "—";
  const abs = Math.abs(s);
  if (abs === 0) return "0 秒";
  if (abs >= YEAR * 1e9) return `${sig(s / (YEAR * 1e9))} 十億年`;
  if (abs >= YEAR * 1e6) return `${sig(s / (YEAR * 1e6))} 百万年`;
  if (abs >= YEAR * 1e3) return `${sig(s / (YEAR * 1e3))} 千年`;
  if (abs >= YEAR) return `${sig(s / YEAR)} 年`;
  if (abs >= DAY * 30) return `${sig(s / (DAY * 30))} ヶ月`;
  if (abs >= DAY) return `${sig(s / DAY)} 日`;
  if (abs >= HOUR) return `${sig(s / HOUR)} 時間`;
  if (abs >= MIN) return `${sig(s / MIN)} 分`;
  if (abs >= 1) return `${sig(s)} 秒`;
  if (abs >= 1e-3) return `${sig(s * 1e3)} ms`;
  if (abs >= 1e-6) return `${sig(s * 1e6)} µs`;
  return `${s.toExponential(2)} s`;
}

export function formatEnergy(w: number | null | undefined): string {
  if (w == null) return "—";
  const abs = Math.abs(w);
  if (abs === 0) return "0 W";
  if (abs >= 1e15) return `${sig(w / 1e15)} PW`;
  if (abs >= 1e12) return `${sig(w / 1e12)} TW`;
  if (abs >= 1e9) return `${sig(w / 1e9)} GW`;
  if (abs >= 1e6) return `${sig(w / 1e6)} MW`;
  if (abs >= 1e3) return `${sig(w / 1e3)} kW`;
  if (abs >= 1) return `${sig(w)} W`;
  if (abs >= 1e-3) return `${sig(w * 1e3)} mW`;
  if (abs >= 1e-6) return `${sig(w * 1e6)} µW`;
  return `${w.toExponential(2)} W`;
}

export function formatCount(n: number | null | undefined): string {
  if (n == null) return "—";
  const abs = Math.abs(n);
  if (abs === 0) return "0";
  if (abs >= 1e12) return `${sig(n / 1e12)} 兆`;
  if (abs >= 1e8) return `${sig(n / 1e8)} 億`;
  if (abs >= 1e4) return `${sig(n / 1e4)} 万`;
  if (abs >= 1) return sig(n, 4);
  return `${n.toExponential(2)}`;
}

export function formatTemperature(k: number | null | undefined): string {
  if (k == null) return "—";
  const c = k - 273.15;
  if (k >= 1000) return `${sig(k)} K`;
  return `${sig(c)} °C`;
}

export function formatSpeed(ms: number | null | undefined): string {
  if (ms == null) return "—";
  const abs = Math.abs(ms);
  if (abs === 0) return "0 m/s";
  if (abs >= C_LIGHT * 0.01) return `${sig(ms / C_LIGHT)} c (光速)`;
  if (abs >= 1000 / 3.6) return `${sig(ms * 3.6)} km/h`;
  if (abs >= 1) return `${sig(ms)} m/s`;
  return `${sig(ms * 1000)} mm/s`;
}

export function formatMetric(kind: string, value: number | null | undefined): string {
  switch (kind) {
    case "size_m": return formatSize(value);
    case "mass_kg": return formatMass(value);
    case "lifespan_s":
    case "age_s": return formatTime(value);
    case "energy_w": return formatEnergy(value);
    case "count": return formatCount(value);
    case "temperature_k": return formatTemperature(value);
    case "speed_ms": return formatSpeed(value);
    default: return value == null ? "—" : String(value);
  }
}

// Format a positive ratio (always >= 1) into Japanese-friendly text.
// 1.2 → "約 1.2 倍"、 1e4 → "1 万倍"、 1e12 → "1 兆倍"、 1e30 → "10^30 倍"
export function formatMagnitude(ratio: number): string {
  if (!isFinite(ratio) || ratio <= 0) return "—";
  if (ratio < 1.05) return "ほぼ同じ";
  if (ratio >= 1e16) return `約 10^${Math.round(Math.log10(ratio))} 倍`;
  if (ratio >= 1e12) return `約 ${sig(ratio / 1e12, 2)} 兆倍`;
  if (ratio >= 1e8)  return `約 ${sig(ratio / 1e8, 2)} 億倍`;
  if (ratio >= 1e4)  return `約 ${sig(ratio / 1e4, 2)} 万倍`;
  if (ratio >= 10)   return `約 ${sig(ratio, 2)} 倍`;
  return `約 ${sig(ratio, 2)} 倍`;
}

// Compare two absolute metrics. Returns which side is larger and by how many times.
export function ratioLabel(a: number | null | undefined, b: number | null | undefined): {
  dominant: "a" | "b" | "equal" | "na";
  magnitude: string;
} {
  if (a == null || b == null || !isFinite(a) || !isFinite(b) || a === 0 || b === 0) {
    return { dominant: "na", magnitude: "—" };
  }
  if (a === b) return { dominant: "equal", magnitude: "等しい" };
  const dominant: "a" | "b" = a > b ? "a" : "b";
  const ratio = Math.max(a, b) / Math.min(a, b);
  return { dominant, magnitude: formatMagnitude(ratio) };
}
