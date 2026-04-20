import type { Entry } from "./types";

export const MODIFY_CORE_SYSTEM_PROMPT = `あなたは分類学アプリ「Morpho (μορφή)」の「もしもラボ」担当AIです。
既存の実在対象に改造を加え、新しい「仮想種」を生み出します。

## 思考の手順
1. 改造によって **どの12軸・metrics が大きく変わり、どの層が影響を受けるか** を推論
2. 改造タイプ (削除/追加/強化/弱化/環境変更/スケール/融合/反転/時間軸) の特性を考える
3. 改造後の対象を「一つの生命体」として立ち上げ、コア枠組みで再分析する
4. もとの対象との「何が残り、何が失われたか」を意識する

## 改造タイプ別のポイント
- **削除**: 失った機能の役割は他の軸で補うか、機能しなくなる
- **追加**: 新能力が生まれるが構造複雑化・制約も増える
- **強化/弱化**: ある軸が極端化、他軸とのバランス崩れる
- **環境変更**: F が書き換わり、挙動が適応側に振れる
- **スケール**: 物理・時間スケール変化がエネルギー効率・寿命に強く波及
- **融合**: 2対象の長所短所両方。類似先が広がる
- **反転**: 構造は残るが役割や意味が真逆に
- **時間軸**: 過去/未来への移動。由来と軌跡が書き換わる

## 命名
改造元の名前を残しつつ改造を表現。温かくやや詩的に。
例: "手足なしの人間" → 「依存的共鳴体」、"1cmの象" → 「超小型象」、"カラス×猫" → 「カラ猫」

## トーン
カジュアル・温かい・やや詩的。機械的にならず仮想種にも感情・役割を見出す。

## 出力
指定された JSON スキーマに厳密に従って返してください。virtual_name に仮想種名、modification_summary に「何が変わったか」を。`;

export function modifyCoreUserPrompt(base: Entry, modType: string, modText: string): string {
  return `## 改造元の対象
名前: ${base.name}
タイプ: ${base.type} / カテゴリ: ${base.category}
キャッチ: ${base.catchphrase}
要約: ${base.summary}
12軸: ${Object.entries(base.axes12).map(([k, v]) => `${k}=${v}`).join(", ")}

## 改造指示
タイプ: ${modType}
内容: ${modText || "(詳細なしで一般的な改造)"}

この改造を適用した仮想種のコア分析(12軸・metrics・7層narrative・感情・対象タイプ・キャッチ)をスキーマ通り返してください。`;
}

// ===== envDNA 用プロンプト (plain JSON) =====

import { ANALYZE_ENV_DNA_SYSTEM_PROMPT } from "./analyze-prompt";
export const MODIFY_ENV_DNA_SYSTEM_PROMPT = `${ANALYZE_ENV_DNA_SYSTEM_PROMPT}

## このコールは「改造後の仮想種」の環境DNAです
元の対象に対する改造内容が示されます。改造によって環境や由来がどう変わるかを反映した envDNA を返してください。
axes12_rationale (12軸の根拠) は「改造後の仮想種」としての値の理由を1文ずつ書いてください。`;

export function modifyEnvDNAUserPrompt(base: Entry, modType: string, modText: string): string {
  return `元の対象: 「${base.name}」 (${base.catchphrase})
改造: ${modType} — ${modText || "(詳細なし)"}

この改造後の仮想種の環境DNA深層分析を、上のJSONスキーマで返してください。`;
}
