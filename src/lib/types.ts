export type AxisKey = "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M";

// 軸は4クラスターで構成される (形態場理論 v2.0)
// Cluster I  物質次元 (A, B, C): それは何からできているか
// Cluster II 情報次元 (D, E, F): どう判断・適応するか
// Cluster III 関係次元 (G, H, I): 他とどう結びつくか
// Cluster IV 時間次元 (J, K, L, M): どう変化・複製・消滅するか
export const AXIS_META: Record<AxisKey, { label: string; desc: string; cluster: "I"|"II"|"III"|"IV" }> = {
  A: { label: "構造",       desc: "部位・要素の数と結合の複雑さ",               cluster: "I"   },
  B: { label: "エネルギー", desc: "単位時間あたりのエネルギー変換強度",         cluster: "I"   },
  C: { label: "入出力",     desc: "物質・情報の摂取/排出の強度と速度",          cluster: "I"   },
  D: { label: "制御",       desc: "自律的意思決定の精度・深さ",                 cluster: "II"  },
  E: { label: "健康",       desc: "ノイズ・攻撃・劣化への耐性",                 cluster: "II"  },
  F: { label: "環境依存",   desc: "外部条件への依存度 (0=独立, 10=完全依存)",   cluster: "II"  },
  G: { label: "相互作用",   desc: "他者と接触する頻度と強度",                   cluster: "III" },
  H: { label: "重力",       desc: "他を引きつける力・影響の磁場",               cluster: "III" },
  I: { label: "排除",       desc: "異物を拒絶する力・境界の固さ",               cluster: "III" },
  J: { label: "流動性",     desc: "内部の情報・構成員の流れの速さ",             cluster: "IV"  },
  K: { label: "プライド",   desc: "自己イメージと実態のズレ (自己モデルの歪み)", cluster: "IV"  },
  L: { label: "死との距離", desc: "消滅への抵抗力 (0=今すぐ死滅, 10=ほぼ不滅)", cluster: "IV"  },
  M: { label: "複製力",     desc: "自己パターンを他に転写・伝播する能力",       cluster: "IV"  },
};

export type ObjectType = "T1" | "T2" | "T3" | "T4" | "T5" | "T6" | "T7";

// 存在論的二分木による判定:
// Q1 数学的必然か? → T7
// Q2 宿主依存か?   → T6
// Q3 時間有界か?   → T4(意志的), T5(自然的)
// Q4 空間占有か?   → T1(単体), T2(集合体), No→T3
export const TYPE_META: Record<ObjectType, { label: string; desc: string; color: "amber"|"teal"|"rose"|"violet"; treeDepth: number }> = {
  T1: { label: "実体型",     desc: "物理空間を占有する単一の独立した存在",           color: "teal",   treeDepth: 4 },
  T2: { label: "集合型",     desc: "複数の独立個体が成す総体・群れ・組織",           color: "teal",   treeDepth: 4 },
  T3: { label: "抽象型",     desc: "物理空間を占有しない持続的な概念・体系",         color: "violet", treeDepth: 3 },
  T4: { label: "事件型",     desc: "意志・行為によって生じる時間有界の出来事",       color: "rose",   treeDepth: 3 },
  T5: { label: "現象型",     desc: "自然・物理プロセスが生む時間有界の現象",         color: "rose",   treeDepth: 3 },
  T6: { label: "状態型",     desc: "宿主の内部にのみ存在する感情・条件・経験",       color: "amber",  treeDepth: 2 },
  T7: { label: "永続抽象型", desc: "数学的・論理的に必然であり反証不可能な真理",     color: "violet", treeDepth: 1 },
};

// 型認識型形態距離のための TypeDist テーブル (存在論的二分木の分岐深さ)
export const TYPE_DIST: Record<ObjectType, Record<ObjectType, number>> = {
  T1: { T1:0, T2:1, T3:2, T4:3, T5:3, T6:4, T7:5 },
  T2: { T1:1, T2:0, T3:2, T4:3, T5:3, T6:4, T7:5 },
  T3: { T1:2, T2:2, T3:0, T4:3, T5:3, T6:4, T7:5 },
  T4: { T1:3, T2:3, T3:3, T4:0, T5:1, T6:4, T7:5 },
  T5: { T1:3, T2:3, T3:3, T4:1, T5:0, T6:4, T7:5 },
  T6: { T1:4, T2:4, T3:4, T4:4, T5:4, T6:0, T7:5 },
  T7: { T1:5, T2:5, T3:5, T4:5, T5:5, T6:5, T7:0 },
};

export type Axes12 = Record<AxisKey, number>;
export type Axes12Rationale = Record<AxisKey, string>;

// クラスター別の軸リスト
export const AXIS_CLUSTERS: Record<"I"|"II"|"III"|"IV", { label: string; keys: AxisKey[] }> = {
  "I":   { label: "物質次元",   keys: ["A","B","C"] },
  "II":  { label: "情報次元",   keys: ["D","E","F"] },
  "III": { label: "関係次元",   keys: ["G","H","I"] },
  "IV":  { label: "時間次元",   keys: ["J","K","L","M"] },
};

// ---- 60要素フルバージョン (環境DNA 深層分析) ----

export type PressureAxisKey =
  | "resource" | "predation" | "stability" | "density"
  | "time_pressure" | "openness" | "temperature" | "light"
  | "toxicity" | "info_density" | "visibility" | "selection";

export const PRESSURE_AXIS_META: Record<PressureAxisKey, { label: string; low: string; high: string }> = {
  resource:      { label: "資源",       low: "欠乏",    high: "豊富" },
  predation:     { label: "捕食圧",     low: "低",      high: "高" },
  stability:     { label: "安定性",     low: "激変",    high: "安定" },
  density:       { label: "密度",       low: "疎",      high: "密" },
  time_pressure: { label: "時間圧",     low: "遅",      high: "速" },
  openness:      { label: "開放度",     low: "閉鎖",    high: "開放" },
  temperature:   { label: "温度",       low: "冷",      high: "灼熱" },
  light:         { label: "光量",       low: "暗闇",    high: "強光" },
  toxicity:      { label: "毒性",       low: "育む",    high: "蝕む" },
  info_density:  { label: "情報密度",   low: "静寂",    high: "洪水" },
  visibility:    { label: "可視性",     low: "隠れる",  high: "曝される" },
  selection:     { label: "選択圧",     low: "自然",    high: "人工" },
};

export type OriginLayerKey =
  | "era" | "ancestors" | "stage" | "cast" | "turning_point"
  | "constraint" | "cost" | "role" | "legacy"
  | "lost_branch" | "savior" | "pride_shame";

export const ORIGIN_LAYER_META: Record<OriginLayerKey, string> = {
  era:           "時代",
  ancestors:     "先祖",
  stage:         "舞台",
  cast:          "共演者",
  turning_point: "転機",
  constraint:    "制約",
  cost:          "代償",
  role:          "役割",
  legacy:        "継承",
  lost_branch:   "失った分岐",
  savior:        "救済者",
  pride_shame:   "恥と誇り",
};

export type RelationshipKey =
  | "parent" | "child" | "enemy" | "symbiont" | "ideal" | "rival" | "inferior";

export const RELATIONSHIP_META: Record<RelationshipKey, string> = {
  parent:   "親",
  child:    "子",
  enemy:    "天敵",
  symbiont: "共生相手",
  ideal:    "理想/憧れ",
  rival:    "ライバル",
  inferior: "見下す相手",
};

export type TimeRhythmKey =
  | "generation_span" | "cycle" | "memory_span" | "growth_speed" | "aging_pattern";

export const TIME_RHYTHM_META: Record<TimeRhythmKey, string> = {
  generation_span: "世代の長さ",
  cycle:           "活動周期",
  memory_span:     "記憶の長さ",
  growth_speed:    "成長速度",
  aging_pattern:   "老い方",
};

export type TabooAspirationKey = "taboo" | "aspiration" | "shame" | "oath";

export const TABOO_META: Record<TabooAspirationKey, string> = {
  taboo:      "タブー",
  aspiration: "憧れ",
  shame:      "恥",
  oath:       "誓い",
};

export type InternalKey =
  | "conflict" | "cohesion" | "self_awareness" | "self_deception" | "decision_style";

export const INTERNAL_META: Record<InternalKey, string> = {
  conflict:       "内部の対立",
  cohesion:       "内部の結束",
  self_awareness: "自己認識",
  self_deception: "自己欺瞞",
  decision_style: "意思決定",
};

export type ConstraintKey =
  | "size_limit" | "speed_limit" | "efficiency_limit" | "info_limit" | "lifespan_limit";

export const CONSTRAINT_META: Record<ConstraintKey, string> = {
  size_limit:       "大きさの限界",
  speed_limit:      "速度の限界",
  efficiency_limit: "効率の限界",
  info_limit:       "情報処理の限界",
  lifespan_limit:   "寿命の限界",
};

export type EnvDNA = {
  pressure_axes: Record<PressureAxisKey, number>;
  origin_layers: Record<OriginLayerKey, string>;
  relationships: Record<RelationshipKey, string>;
  time_rhythm: Record<TimeRhythmKey, string>;
  taboo_aspiration: Record<TabooAspirationKey, string>;
  internal: Record<InternalKey, string>;
  constraints: Record<ConstraintKey, string>;
};

export type EntryLayers = {
  origin: string;
  behavior: string;
  trajectory: string;
  meaning: string;
  scale: string;
  host: string;
  emotions: {
    fear: string;
    joy: string;
    anger: string;
    love: string;
    sadness: string;
  };
};

export type Metrics = {
  size_m?: number | null;         // 代表長さ (m)
  mass_kg?: number | null;        // 代表質量 (kg)
  lifespan_s?: number | null;     // 典型寿命 (秒)
  age_s?: number | null;          // 誕生してからの経過 (秒)
  energy_w?: number | null;       // エネルギー消費・出力 (W)
  count?: number | null;          // 構成員・細胞数・個体数
  temperature_k?: number | null;  // 代表温度 (K)
  speed_ms?: number | null;       // 代表速度 (m/s)
};

export const METRIC_LABELS: Record<keyof Metrics, string> = {
  size_m: "物理サイズ",
  mass_kg: "質量",
  lifespan_s: "寿命",
  age_s: "誕生からの経過",
  energy_w: "エネルギー出力",
  count: "構成員数",
  temperature_k: "代表温度",
  speed_ms: "代表速度",
};

export type Entry = {
  id: string;
  name: string;
  type: ObjectType;
  category: string;
  catchphrase: string;
  summary: string;
  axes12: Axes12;
  axes12Rationale?: Axes12Rationale;
  layers?: EntryLayers;
  metrics?: Metrics;
  envDNA?: EnvDNA;
  isVirtual?: boolean;
  basedOn?: string;
  modification?: string;
  createdAt: string;
};
