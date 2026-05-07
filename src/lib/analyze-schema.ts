import { z } from "zod";

const axisScore = z.number().min(0).max(10);

export const AnalyzeCoreSchema = z.object({
  name: z.string().describe("正規化された対象名 (ユーザー入力をそのまま/微修正)"),
  type: z.enum(["T1","T2","T3","T4","T5","T6","T7"]).describe("対象タイプ: T1実体型/T2集合型/T3抽象型/T4事件型/T5現象型/T6状態型/T7永続抽象型"),
  category: z.string().describe("カテゴリ: 動物/植物/天体/大地形/微生物/群れ/組織/人工物/概念/状態/現象 のいずれかが推奨"),
  catchphrase: z.string().describe("1文のキャッチ(15-30字程度、カジュアル、やや詩的、“○○型”の比喩を含む)"),
  summary: z.string().describe("2-3文の要約。その対象が何であり、なぜそうなっているかを温かく語る。"),

  axes12: z.object({
    // Cluster I 物質次元
    A: axisScore.describe("構造[物質I]: 部位・要素の数と結合の複雑さ"),
    B: axisScore.describe("エネルギー[物質I]: 単位時間あたりのエネルギー変換強度"),
    C: axisScore.describe("入出力[物質I]: 物質・情報の摂取/排出の強度と速度"),
    // Cluster II 情報次元
    D: axisScore.describe("制御[情報II]: 自律的意思決定の精度・深さ"),
    E: axisScore.describe("健康[情報II]: ノイズ・攻撃・劣化への耐性"),
    F: axisScore.describe("環境依存[情報II]: 外部条件への依存度(0=独立,10=完全依存)"),
    // Cluster III 関係次元
    G: axisScore.describe("相互作用[関係III]: 他者と接触する頻度と強度"),
    H: axisScore.describe("重力[関係III]: 他を引きつける力・影響の磁場"),
    I: axisScore.describe("排除[関係III]: 異物を拒絶する力・境界の固さ"),
    // Cluster IV 時間次元
    J: axisScore.describe("流動性[時間IV]: 内部の情報・構成員の流れの速さ"),
    K: axisScore.describe("プライド[時間IV]: 自己イメージと実態のズレ(自己モデルの歪み)"),
    L: axisScore.describe("死との距離[時間IV]: 消滅への抵抗力(0=今すぐ死滅,10=ほぼ不滅)"),
    M: axisScore.describe("複製力[時間IV]: 自己パターンを他に転写・伝播する能力(0=複製不可,10=完全複製/T7は10固定)"),
  }),

  origin: z.string().describe("由来: なぜそうなったか、時代・先祖・舞台・転機・代償などを2-3文で物語的に."),
  behavior: z.string().describe("挙動: 今何をしているか。活動性・社交性・攻撃性などの行動特徴を1-2文で."),
  trajectory: z.string().describe("軌跡: これからどうなるか。成長フェーズ・勢い・崩壊リスクを1-2文で."),
  meaning: z.string().describe("意味: 他者にとって何か。使命・象徴・美的価値を1-2文で."),
  scale: z.string().describe("スケール: 大きさ・時間・影響範囲を1文で."),
  host: z.string().describe("宿主・観測者: 誰の中に存在/観測されるか。T1実体型なら“単独で存在”でOK. 1文で."),

  emotions: z.object({
    fear: z.string().describe("恐怖の源"),
    joy: z.string().describe("喜びの源"),
    anger: z.string().describe("怒りの引き金"),
    love: z.string().describe("愛するもの"),
    sadness: z.string().describe("悲しみの対象"),
  }).describe("感情の源泉。人間以外でも擬人化して埋める。"),

  metrics: z.object({
    size_m:        z.number().nullable().describe("代表長さ(m)。蚊=0.003、人間=1.7、太陽=1.4e9、宇宙=8.8e26。不明なら null。"),
    mass_kg:       z.number().nullable().describe("代表質量(kg)。"),
    lifespan_s:    z.number().nullable().describe("典型寿命(秒)。"),
    age_s:         z.number().nullable().describe("誕生してからの経過時間(秒)。"),
    energy_w:      z.number().nullable().describe("エネルギー消費or出力(W)。"),
    count:         z.number().nullable().describe("構成員・細胞・個体数。"),
    temperature_k: z.number().nullable().describe("代表温度(K)。"),
    speed_ms:      z.number().nullable().describe("代表速度(m/s)。"),
  }).describe("物理的な数値パラメータ。SI単位で、極端に大/小さくてもOK。不明・非該当の場合は null。"),
});

export type AnalyzeCore = z.infer<typeof AnalyzeCoreSchema>;

// envDNAは別スキーマで別途生成 (grammar size limit回避)
export const EnvDNASchema = z.object({
  axes12_rationale: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
    E: z.string(),
    F: z.string(),
    G: z.string(),
    H: z.string(),
    I: z.string(),
    J: z.string(),
    K: z.string(),
    L: z.string(),
    M: z.string(),
  }),
  pressure_axes: z.object({
    resource:      axisScore,
    predation:     axisScore,
    stability:     axisScore,
    density:       axisScore,
    time_pressure: axisScore,
    openness:      axisScore,
    temperature:   axisScore,
    light:         axisScore,
    toxicity:      axisScore,
    info_density:  axisScore,
    visibility:    axisScore,
    selection:     axisScore,
  }),
  origin_layers: z.object({
    era:           z.string(),
    ancestors:     z.string(),
    stage:         z.string(),
    cast:          z.string(),
    turning_point: z.string(),
    constraint:    z.string(),
    cost:          z.string(),
    role:          z.string(),
    legacy:        z.string(),
    lost_branch:   z.string(),
    savior:        z.string(),
    pride_shame:   z.string(),
  }),
  relationships: z.object({
    parent:   z.string(),
    child:    z.string(),
    enemy:    z.string(),
    symbiont: z.string(),
    ideal:    z.string(),
    rival:    z.string(),
    inferior: z.string(),
  }),
  time_rhythm: z.object({
    generation_span: z.string(),
    cycle:           z.string(),
    memory_span:     z.string(),
    growth_speed:    z.string(),
    aging_pattern:   z.string(),
  }),
  taboo_aspiration: z.object({
    taboo:      z.string(),
    aspiration: z.string(),
    shame:      z.string(),
    oath:       z.string(),
  }),
  internal: z.object({
    conflict:       z.string(),
    cohesion:       z.string(),
    self_awareness: z.string(),
    self_deception: z.string(),
    decision_style: z.string(),
  }),
  constraints: z.object({
    size_limit:       z.string(),
    speed_limit:      z.string(),
    efficiency_limit: z.string(),
    info_limit:       z.string(),
    lifespan_limit:   z.string(),
  }),
});

export type EnvDNAResult = z.infer<typeof EnvDNASchema>;

// 統合結果 (core + env_dna)
export type AnalyzeResult = AnalyzeCore & { env_dna: EnvDNAResult };
