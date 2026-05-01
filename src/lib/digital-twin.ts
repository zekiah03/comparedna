// Digital Twin Engine — Morpho Adapter
// Entry.axes12 (already computed by Claude) → Layer 3 (emotion) → Layer 4 (Resonance pattern)
// Theory: see DIGITAL_TWIN_THEORY.md

import type { Entry, Axes12 } from './types';

export const AXIS_META = {
  A: { name: '構造複雑性',    desc: '認知処理・思考の多層性' },
  B: { name: 'エネルギー代謝', desc: '持続力・効率・活力' },
  C: { name: '入出力',        desc: 'センサーと表現力の総量' },
  D: { name: '制御・自律性',  desc: '反射精度と意思決定力' },
  E: { name: '健康・耐久',    desc: 'ストレス耐性と回復速度' },
  F: { name: '環境依存度',    desc: '外部条件への依存レベル' },
  G: { name: '社交性',        desc: '対人接続・共鳴能力' },
  H: { name: '重力・影響力',  desc: '他者への吸引力・存在感' },
  I: { name: '排除・免疫',    desc: 'ノイズ除去・感情回復力' },
  J: { name: '流動性',        desc: '情報処理と記憶の流れ' },
  K: { name: 'プライド',      desc: '自己イメージ・誇り' },
  L: { name: '生命力',        desc: '持続性・死との距離（10=不滅）' },
} as const;

export type TwinEmotion = {
  nameJa: string;
  valence: number;
  arousal: number;
};

// Full emotion set (how-feelings-work 27 + excitement for AIrobot peak state)
export const TWIN_EMOTIONS: Record<string, TwinEmotion> = {
  joy:            { nameJa: '喜び',            valence:  2,  arousal:  1 },
  excitement:     { nameJa: '高揚',            valence:  2,  arousal:  2 },
  pride:          { nameJa: '誇り',            valence:  2,  arousal:  1 },
  flow:           { nameJa: 'フロー',          valence:  2,  arousal:  1 },
  curiosity:      { nameJa: '好奇心',          valence:  1,  arousal:  1 },
  gratitude:      { nameJa: '感謝',            valence:  2,  arousal:  0 },
  awe:            { nameJa: '畏敬',            valence:  2,  arousal:  0 },
  contentment:    { nameJa: '静謐',            valence:  2,  arousal: -2 },
  hope:           { nameJa: '希望',            valence:  1,  arousal:  1 },
  relief:         { nameJa: '安心',            valence:  2,  arousal: -1 },
  love:           { nameJa: '愛情',            valence:  2,  arousal:  0 },
  elevation:      { nameJa: '感動的高揚',      valence:  2,  arousal:  0 },
  compassion:     { nameJa: 'コンパッション',  valence:  1,  arousal:  0 },
  nostalgia:      { nameJa: 'ノスタルジア',    valence:  0,  arousal: -1 },
  surprise:       { nameJa: '驚き',            valence:  0,  arousal:  2 },
  empathy:        { nameJa: '共感',            valence:  0,  arousal:  0 },
  loneliness:     { nameJa: '寂しさ',          valence: -2,  arousal: -1 },
  boredom:        { nameJa: '退屈',            valence: -1,  arousal: -2 },
  sadness:        { nameJa: '悲しみ',          valence: -2,  arousal: -1 },
  anxiety:        { nameJa: '不安',            valence: -2,  arousal:  1 },
  fear:           { nameJa: '恐怖',            valence: -2,  arousal:  2 },
  anger:          { nameJa: '怒り',            valence: -1,  arousal:  2 },
  frustration:    { nameJa: '焦燥',            valence: -1,  arousal:  2 },
  grief:          { nameJa: '悲嘆',            valence: -2,  arousal: -1 },
  disappointment: { nameJa: '失望',            valence: -1,  arousal: -1 },
  regret:         { nameJa: '後悔',            valence: -1,  arousal: -1 },
  jealousy:       { nameJa: '嫉妬',            valence: -2,  arousal:  1 },
  envy:           { nameJa: '羨望',            valence: -1,  arousal:  0 },
  shame:          { nameJa: '恥',              valence: -2,  arousal:  0 },
  guilt:          { nameJa: '罪悪感',          valence: -1,  arousal:  0 },
  disgust:        { nameJa: '嫌悪',            valence: -2,  arousal:  0 },
  contempt:       { nameJa: '軽蔑',            valence: -1,  arousal:  0 },
  embarrassment:  { nameJa: '困惑',            valence: -1,  arousal:  1 },
};

// Layer 4: Resonance narrative patterns
export const EMOTION_TO_PATTERN: Record<string, { id: string; trajectoryType: string; label: string }> = {
  joy:            { id: 'laughter',       trajectoryType: 'I',    label: '笑い' },
  excitement:     { id: 'nori',           trajectoryType: 'VII',  label: 'ノリの良さ' },
  pride:          { id: 'catharsis',      trajectoryType: 'IV',   label: 'カタルシス' },
  flow:           { id: 'conv_pleasure',  trajectoryType: 'VII',  label: '会話の気持ちよさ' },
  curiosity:      { id: 'fukusen',        trajectoryType: 'II',   label: '伏線回収の快感' },
  gratitude:      { id: 'kandou',         trajectoryType: 'IV',   label: '感動' },
  awe:            { id: 'odoroki',        trajectoryType: 'III',  label: '驚き' },
  contentment:    { id: 'yoi_anshin',     trajectoryType: 'VIII', label: '予想通りの安心感' },
  nostalgia:      { id: 'nakeru',         trajectoryType: 'IV',   label: '泣けるドラマ' },
  loneliness:     { id: 'kimazui',        trajectoryType: 'V',    label: '気まずさ' },
  boredom:        { id: 'taikutsu',       trajectoryType: 'VIII', label: '退屈' },
  sadness:        { id: 'nakeru',         trajectoryType: 'IV',   label: '泣けるドラマ' },
  anxiety:        { id: 'suspense',       trajectoryType: 'V',    label: 'サスペンス' },
  fear:           { id: 'kowai_chinmoku', trajectoryType: 'V',    label: '怖い沈黙' },
  anger:          { id: 'catharsis',      trajectoryType: 'IV',   label: 'カタルシス' },
  love:           { id: 'kandou',         trajectoryType: 'IV',   label: '感動' },
  grief:          { id: 'nakeru',         trajectoryType: 'IV',   label: '泣けるドラマ' },
  disappointment: { id: 'kimazui',        trajectoryType: 'V',    label: '気まずさ' },
  regret:         { id: 'nakeru',         trajectoryType: 'IV',   label: '泣けるドラマ' },
  surprise:       { id: 'odoroki',        trajectoryType: 'III',  label: '驚き' },
  disgust:        { id: 'kowai_chinmoku', trajectoryType: 'V',    label: '怖い沈黙' },
  jealousy:       { id: 'suspense',       trajectoryType: 'V',    label: 'サスペンス' },
  envy:           { id: 'suspense',       trajectoryType: 'V',    label: 'サスペンス' },
  shame:          { id: 'kimazui',        trajectoryType: 'V',    label: '気まずさ' },
  guilt:          { id: 'kimazui',        trajectoryType: 'V',    label: '気まずさ' },
  empathy:        { id: 'kandou',         trajectoryType: 'IV',   label: '感動' },
  embarrassment:  { id: 'kimazui',        trajectoryType: 'V',    label: '気まずさ' },
  contempt:       { id: 'catharsis',      trajectoryType: 'IV',   label: 'カタルシス' },
  compassion:     { id: 'kandou',         trajectoryType: 'IV',   label: '感動' },
  hope:           { id: 'fukusen',        trajectoryType: 'II',   label: '伏線回収の快感' },
  relief:         { id: 'yoi_anshin',     trajectoryType: 'VIII', label: '予想通りの安心感' },
  elevation:      { id: 'kandou',         trajectoryType: 'IV',   label: '感動' },
  frustration:    { id: 'suspense',       trajectoryType: 'V',    label: 'サスペンス' },
};

// Layer 2 → Layer 3: 12 axes → valence/arousal (-2..2)
export function axesToEmotionCoords(axes: Axes12): { valence: number; arousal: number } {
  const valenceRaw =
    axes.B * 0.25 +
    axes.G * 0.20 +
    axes.E * 0.20 +
    axes.L * 0.15 +
    axes.J * 0.10 +
    (10 - axes.F) * 0.10;

  const arousalRaw =
    axes.A * 0.25 +
    axes.C * 0.20 +
    axes.D * 0.20 +
    axes.H * 0.20 +
    axes.I * 0.15;

  return {
    valence: Math.round((valenceRaw / 10 * 4 - 2) * 100) / 100,
    arousal: Math.round((arousalRaw / 10 * 4 - 2) * 100) / 100,
  };
}

// Layer 3: nearest emotion by Euclidean distance
export function coordsToEmotion(valence: number, arousal: number): TwinEmotion & { id: string } {
  let minDist = Infinity;
  let closestId = 'nostalgia';
  for (const [id, e] of Object.entries(TWIN_EMOTIONS)) {
    const d = Math.hypot(e.valence - valence, e.arousal - arousal);
    if (d < minDist) { minDist = d; closestId = id; }
  }
  return { id: closestId, ...TWIN_EMOTIONS[closestId] };
}

export type ActiveTransition = { to: string; label: string; targetNameJa: string };

export function deriveTransitions(emotionId: string, axes: Axes12): ActiveTransition[] {
  const conditions: Record<string, Record<string, boolean>> = {
    joy: {
      pride:       axes.K > 6,
      gratitude:   axes.G > 6,
      flow:        axes.J > 6,
      contentment: axes.B < 5,
      anxiety:     axes.E < 4,
    },
    excitement: {
      joy:         axes.G > 6,
      flow:        axes.J > 7 && axes.D > 6,
      anxiety:     axes.E < 4,
      pride:       axes.K > 7,
    },
    pride: {
      joy:         axes.G > 6,
      contentment: axes.E > 6,
      anxiety:     axes.D < 4,
      contempt:    axes.K > 8,
      shame:       axes.K < 3,
    },
    flow: {
      joy:         axes.B > 6,
      contentment: axes.E > 6,
      pride:       axes.K > 6,
      curiosity:   axes.A > 7,
    },
    gratitude: {
      joy:         axes.G > 6,
      love:        axes.G > 8,
      contentment: axes.B < 6,
      elevation:   axes.H > 7,
    },
    curiosity: {
      awe:         axes.A > 7,
      flow:        axes.J > 7 && axes.D > 6,
      boredom:     axes.A < 4,
      joy:         axes.H > 6,
    },
    awe: {
      curiosity:   axes.A > 6,
      joy:         axes.H > 7,
      contentment: axes.L > 7,
      gratitude:   axes.G > 6,
    },
    contentment: {
      joy:         axes.B > 7,
      boredom:     axes.A < 4,
    },
    nostalgia: {
      sadness:     axes.J < 4,
      joy:         axes.G > 6,
      gratitude:   axes.G > 7,
      contentment: axes.E > 6,
    },
    loneliness: {
      sadness:     axes.G < 3,
      anxiety:     axes.D < 4,
      curiosity:   axes.A > 6,
      love:        axes.G > 7,
    },
    boredom: {
      curiosity:   axes.A > 7,
      anxiety:     axes.F > 7,
      contentment: axes.E > 6,
      frustration: axes.D < 4,
    },
    sadness: {
      nostalgia:   axes.J > 5,
      loneliness:  axes.G < 4,
      gratitude:   axes.G > 7,
      grief:       axes.E < 3,
      anger:       axes.I > 6,
    },
    anxiety: {
      fear:        axes.D < 4,
      anger:       axes.I > 6,
      curiosity:   axes.A > 6,
      contentment: axes.E > 7,
      sadness:     axes.B < 3,
    },
    fear: {
      anxiety:     axes.D < 4,
      anger:       axes.I > 6,
      curiosity:   axes.A > 7,
      sadness:     axes.B < 4,
      relief:      axes.E > 7,
    },
    anger: {
      sadness:     axes.B < 4,
      pride:       axes.K > 7,
      contentment: axes.I > 6,
      guilt:       axes.G > 6 && axes.K < 5,
      contempt:    axes.K > 7 && axes.I > 6,
    },
    love: {
      joy:         axes.G > 6,
      anxiety:     axes.E < 4,
      jealousy:    axes.I > 6 && axes.G > 5,
      grief:       axes.L < 3,
      gratitude:   axes.G > 7,
    },
    grief: {
      sadness:     axes.E > 4,
      anger:       axes.I > 6,
      guilt:       axes.K < 4,
      nostalgia:   axes.J > 5,
      contentment: axes.L > 7,
    },
    shame: {
      anger:       axes.I > 7,
      sadness:     axes.K < 4,
      anxiety:     axes.D < 4,
      guilt:       axes.G > 5,
    },
    guilt: {
      sadness:     axes.E < 4,
      shame:       axes.K < 3,
      relief:      axes.G > 7,
      gratitude:   axes.G > 8,
    },
    disappointment: {
      sadness:     axes.E < 5,
      anger:       axes.I > 6,
      shame:       axes.K < 4,
      hope:        axes.L > 6,
    },
    regret: {
      sadness:     axes.J > 5,
      shame:       axes.K < 4,
      guilt:       axes.G > 5,
      hope:        axes.D > 6,
    },
    jealousy: {
      anger:       axes.I > 7,
      anxiety:     axes.D < 4,
      sadness:     axes.G < 4,
      shame:       axes.K < 4,
    },
    envy: {
      anger:       axes.I > 7 && axes.K > 6,
      sadness:     axes.E < 4,
      hope:        axes.L > 6 && axes.D > 5,
      shame:       axes.K < 3,
    },
    empathy: {
      sadness:     axes.E < 4,
      love:        axes.G > 7,
      elevation:   axes.H > 7,
      frustration: axes.E < 3,
    },
    compassion: {
      love:        axes.G > 7,
      elevation:   axes.H > 7,
      sadness:     axes.E < 3,
    },
    surprise: {
      joy:         axes.H > 6,
      fear:        axes.D < 4,
      curiosity:   axes.A > 6,
      disgust:     axes.I > 7,
    },
    disgust: {
      anger:       axes.I > 6,
      contempt:    axes.K > 7,
      fear:        axes.D < 4,
    },
    contempt: {
      disgust:     axes.I > 7,
      anger:       axes.I > 8,
    },
    embarrassment: {
      shame:       axes.K < 4,
      joy:         axes.G > 7,
      anger:       axes.I > 7,
    },
    hope: {
      joy:         axes.L > 7,
      anxiety:     axes.D < 4,
      sadness:     axes.B < 3,
      curiosity:   axes.A > 6,
    },
    relief: {
      joy:         axes.G > 6,
      contentment: axes.E > 6,
      gratitude:   axes.G > 7,
    },
    elevation: {
      gratitude:   axes.G > 6,
      awe:         axes.H > 7,
      joy:         axes.B > 6,
    },
    frustration: {
      anger:       axes.I > 6,
      anxiety:     axes.D < 4,
      boredom:     axes.B < 4,
      contentment: axes.E > 7,
    },
  };

  const activeTo = new Set(
    Object.entries(conditions[emotionId] ?? {})
      .filter(([, cond]) => cond)
      .map(([to]) => to)
  );

  return [...activeTo].map(to => ({
    to,
    label:        TWIN_EMOTIONS[to]?.nameJa ?? to,
    targetNameJa: TWIN_EMOTIONS[to]?.nameJa ?? to,
  }));
}

export type MorphoDigitalTwin = {
  axes: Axes12;
  emotionState: TwinEmotion & {
    id: string;
    valence: number;
    arousal: number;
    transitions: ActiveTransition[];
  };
  affectivePattern: { id: string; trajectoryType: string; label: string } | undefined;
  narrative:  Entry['layers'];
  envContext: Entry['envDNA'];
};

// Morpho Entry → Digital Twin
// Skips Layer 1 (no hardware specs); axes12 already computed by Claude analysis
export function entryToDigitalTwin(entry: Entry): MorphoDigitalTwin {
  const axes              = entry.axes12;
  const { valence, arousal } = axesToEmotionCoords(axes);
  const emotion           = coordsToEmotion(valence, arousal);
  const pattern           = EMOTION_TO_PATTERN[emotion.id];
  const transitions       = deriveTransitions(emotion.id, axes);

  return {
    axes,
    emotionState:     { ...emotion, valence, arousal, transitions },
    affectivePattern: pattern,
    narrative:        entry.layers,
    envContext:       entry.envDNA,
  };
}
