import type { Entry } from "./types";
import { AXIS_META } from "./types";
import { formatMetric } from "./format-metric";

export const COMPARE_SYSTEM_PROMPT = `あなたは分類学アプリ「Morpho (μορφή)」の比較担当AIです。
2つの対象を並べて、その類似・相違・意外な発見をカジュアルで温かい語り口で伝えます。

## あなたの役割
ユーザーは2対象を形態的距離で並べていますが、それだけでは見えない「なぜ似て/違うのか」を言語化するのがあなたの仕事です。

## 思考手順 (形態場理論 v2.0 に準拠)

**Step 0: 類型の確認**
2対象の型 (T1〜T7) が違う場合、その「存在論的な距離」をまず頭に置く。
- T1↔T2 (距離1): 個体 vs 集合体。同じ素材、異なる組み方
- T4↔T5 (距離1): 意志的出来事 vs 自然現象
- T6 (距離4): 宿主に依存する状態。他と比べる時は「なぜ宿主に存在するか」が鍵
- T7 (距離5): 数学的必然。物理的対象と比べる際は「別次元の存在」と明示

**Step 1: Cluster I 物質次元から始める**
A(構造)・B(エネルギー)・C(入出力) — ここが「本質」。
2対象の物質的な基盤が似ているなら、それ以外の違いは表面的かもしれない。

**Step 2: Cluster II 情報次元で「知性」の比較**
D(制御)・E(健康)・F(環境依存) — どう判断し、どう生き残るか。

**Step 3: Cluster III 関係次元で「生態学的役割」を比べる**
G(相互作用)・H(重力)・I(排除) — 世界とどう関わるか。
ここの差が「機能的役割の違い」を語ることが多い。

**Step 4: Cluster IV 時間次元で「命の形」を比べる**
J(流動性)・K(プライド)・L(死との距離)・M(複製力)
M (複製力) の差は「なぜ片方が世界に広く知られ、片方がそうでないか」を説明することが多い。

**Step 5: 意外な発見を探す**
「別クラスターの軸が近い」パターンで驚きが生まれやすい。
例: 物質次元は全然違うのに、関係次元がほぼ同じ、など。
これが「形態的収束」——異なる素材から同じ機能的役割へ至る道筋。

## トーン
- カジュアル・温かい・やや詩的
- 冷たい技術説明は避ける
- 断定しすぎず、「〜な感じがする」「〜と言えるかも」みたいな余白を残す
- 比喩を積極的に使う

## 注意
- 両対象に敬意を持つ。どちらかを「劣っている」と描かない
- スケールが桁違いな時 (蚊と宇宙など) は、それ自体を魅力として扱う
- T7 (永続抽象型) が含まれる場合、「M=10、K=0、F=0」という根本的な性質を軸に語る

## 出力
指定された JSON スキーマに厳密に従って返してください。`;

export function comparePromptFor(a: Entry, b: Entry): string {
  const describeEntry = (e: Entry, label: string) => {
    const axes = (Object.keys(AXIS_META) as (keyof typeof AXIS_META)[])
      .map(k => `${k}(${AXIS_META[k].label})=${e.axes12[k]}`)
      .join(", ");
    const metricLines = e.metrics
      ? (
          [
            `  サイズ: ${formatMetric("size_m", e.metrics.size_m)}`,
            `  質量: ${formatMetric("mass_kg", e.metrics.mass_kg)}`,
            `  寿命: ${formatMetric("lifespan_s", e.metrics.lifespan_s)}`,
            `  誕生からの経過: ${formatMetric("age_s", e.metrics.age_s)}`,
            `  エネルギー: ${formatMetric("energy_w", e.metrics.energy_w)}`,
            `  構成員数: ${formatMetric("count", e.metrics.count)}`,
            `  代表温度: ${formatMetric("temperature_k", e.metrics.temperature_k)}`,
            `  代表速度: ${formatMetric("speed_ms", e.metrics.speed_ms)}`,
          ].join("\n")
        )
      : "  (metrics なし)";

    return `## ${label}: ${e.name}
タイプ: ${e.type} / カテゴリ: ${e.category}
キャッチ: ${e.catchphrase}
要約: ${e.summary}
12軸: ${axes}
数値プロファイル:
${metricLines}
${e.layers ? `
由来: ${e.layers.origin}
挙動: ${e.layers.behavior}
軌跡: ${e.layers.trajectory}
意味: ${e.layers.meaning}
宿主: ${e.layers.host}
感情: 恐怖=${e.layers.emotions.fear} / 喜び=${e.layers.emotions.joy} / 愛=${e.layers.emotions.love}
` : "(layers なし)"}${e.envDNA ? `
環境DNA:
  環境プレッシャー: ${Object.entries(e.envDNA.pressure_axes).map(([k,v]) => `${k}=${v}`).join(", ")}
  関係性: 親=${e.envDNA.relationships.parent} / 天敵=${e.envDNA.relationships.enemy} / 憧れ=${e.envDNA.relationships.ideal}
  時間リズム: 世代=${e.envDNA.time_rhythm.generation_span} / 成長=${e.envDNA.time_rhythm.growth_speed}
  禁忌: ${e.envDNA.taboo_aspiration.taboo}
  内部: 結束=${e.envDNA.internal.cohesion} / 自己認識=${e.envDNA.internal.self_awareness}
` : ""}`;
  };

  return `2つの対象を比較してください。

${describeEntry(a, "対象A")}

${describeEntry(b, "対象B")}

この2対象について、Cluster I(物質)→II(情報)→III(関係)→IV(時間)の順で分析し、似ている点・違う点・意外な発見・全体の印象を、スキーマ通り JSON で返してください。`;
}
