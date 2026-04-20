export type AxisKey = "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L";

export const AXIS_META: Record<AxisKey, { label: string; desc: string }> = {
  A: { label: "構造",       desc: "ハードウェア構成・部位" },
  B: { label: "エネルギー", desc: "燃料・変換効率・熱" },
  C: { label: "入出力",     desc: "吸気/排気・摂取/排出" },
  D: { label: "制御",       desc: "意思決定・ECU・OS" },
  E: { label: "健康",       desc: "耐久・故障率・劣化" },
  F: { label: "環境依存",   desc: "外部条件への依存度" },
  G: { label: "相互作用",   desc: "他者と関わる強度" },
  H: { label: "重力",       desc: "引きつける力・魅力" },
  I: { label: "排除",       desc: "異物免疫・拒絶" },
  J: { label: "流動性",     desc: "情報・人・血液の流れ" },
  K: { label: "プライド",   desc: "見せかけ・自己イメージ" },
  L: { label: "死との距離", desc: "寿命の残り/死生観" },
};

export type ObjectType = "T1" | "T2" | "T3" | "T4" | "T5" | "T6" | "T7";

export const TYPE_META: Record<ObjectType, { label: string; desc: string; color: "amber"|"teal"|"rose"|"violet" }> = {
  T1: { label: "実体型",       desc: "物理的に独立して存在",             color: "teal" },
  T2: { label: "集合型",       desc: "群れ・複数個体の総体",             color: "teal" },
  T3: { label: "抽象型",       desc: "論理構造を持つ概念",               color: "violet" },
  T4: { label: "事件型",       desc: "始まりと終わりのある出来事",       color: "rose" },
  T5: { label: "現象型",       desc: "一過性の自然/知覚現象",           color: "rose" },
  T6: { label: "状態型",       desc: "宿主の中に宿る感情・条件",         color: "amber" },
  T7: { label: "永続抽象型",   desc: "永遠に真な数学的真理・法則",       color: "violet" },
};

export type Axes12 = Record<AxisKey, number>;
export type Axes12Rationale = Record<AxisKey, string>;

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
