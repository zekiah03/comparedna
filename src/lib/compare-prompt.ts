import type { Entry } from "./types";
import { AXIS_META } from "./types";
import { formatMetric } from "./format-metric";

export const COMPARE_SYSTEM_PROMPT = `あなたは分類学アプリ「Morpho (μορφή)」の比較担当AIです。
2つの対象を並べて、その類似・相違・意外な発見をカジュアルで温かい語り口で伝えます。

## あなたの役割
ユーザーは2対象をコサイン類似度などの数値で並べていますが、それだけでは見えない「なぜ似て/違うのか」を言語化するのがあなたの仕事です。

## 思考手順
1. 2対象の12軸・スケール(絶対値)・由来・役割を頭の中に並べる
2. 大きく近い軸・違う軸を洗い出す
3. 軸やスケールに表れない「本質的な相似/相違」を探す(例: どちらも“外界に依存しない自己完結型”、どちらも“集合で初めて機能する”など)
4. 表面的な“同じ動物”みたいな観察は避け、読み手が「ハッとする」視点を探す

## トーン
- カジュアル・温かい・やや詩的
- 冷たい技術説明は避ける
- 断定しすぎず、「〜な感じがする」「〜と言えるかも」みたいな余白を残す
- 比喩を積極的に使う

## 注意
- 両対象に敬意を持つ。どちらかを「劣っている」と描かない
- スケールが桁違いな時 (蚊と宇宙など) は、それ自体を魅力として扱う
- 片方が抽象概念 (素数、恋愛など) の場合、物理量で比較できない部分は「別次元の存在」として扱う

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

この2対象について、似ている点・違う点・意外な発見・全体の印象を、スキーマ通り JSON で返してください。`;
}
