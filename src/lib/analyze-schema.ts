import { z } from "zod";

const axisScore = z.number().min(0).max(10);

export const AnalyzeCoreSchema = z.object({
  name: z.string().describe("正規化された対象名 (ユーザー入力をそのまま/微修正)"),
  type: z.enum(["T1","T2","T3","T4","T5","T6","T7"]).describe("対象タイプ: T1実体型/T2集合型/T3抽象型/T4事件型/T5現象型/T6状態型/T7永続抽象型"),
  category: z.string().describe("カテゴリ: 動物/植物/天体/大地形/微生物/群れ/組織/人工物/概念/状態/現象 のいずれかが推奨"),
  catchphrase: z.string().describe("1文のキャッチ(15-30字程度、カジュアル、やや詩的、“○○型”の比喩を含む)"),
  summary: z.string().describe("2-3文の要約。その対象が何であり、なぜそうなっているかを温かく語る。"),

  axes12: z.object({
    A: axisScore.describe("構造: ハードウェア構成/部位の複雑さ"),
    B: axisScore.describe("エネルギー: 燃料変換効率・熱"),
    C: axisScore.describe("入出力: 吸気排気/摂取排出の強さ"),
    D: axisScore.describe("制御: 意思決定/自律性"),
    E: axisScore.describe("健康・耐久: 壊れにくさ"),
    F: axisScore.describe("環境依存度: 外部条件への依存"),
    G: axisScore.describe("相互作用: 他者との関わりの強度"),
    H: axisScore.describe("重力(魅力): 他を引きつける力"),
    I: axisScore.describe("排除(免疫): 異物を拒む力"),
    J: axisScore.describe("流動性: 情報/人/血液の流れ"),
    K: axisScore.describe("プライド: 自己イメージと実態の差"),
    L: axisScore.describe("死との距離: 今どれくらい死に近いか(0=今すぐ死ぬ、10=ほぼ不滅)"),
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
