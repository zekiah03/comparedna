# デジタルツイン統合理論

> このファイルは統合ロジックの論文として継続的に更新される。
> 4アプリ (AIrobot / Morpho / how-feelings-work / Resonance) の融合設計を記録する。

---

## 1. 概要

デジタルツインとは、あるエンティティ（AIロボット・生物・概念・人間）の**現在の内部状態**を
4層のパイプラインで推定し、感情とナラティブパターンとして可視化するフレームワークである。

```
[Layer 1] AIrobot スペック (ハードウェア計測値)
    ↓  specsToAxes()
[Layer 2] Morpho 12軸 (0–10 スコア、抽象的な特性ベクトル)
    ↓  axesToEmotionCoords()
[Layer 3] 感情空間 (valence × arousal 座標 → 最近傍感情)
    ↓  deriveTransitions() + EMOTION_TO_PATTERN
[Layer 4] Resonance ナラティブパターン (物語類型 I〜VIII)
```

---

## 2. 各アプリの役割

### 2-1. AIrobot

ハードウェアスペックをスコア化し `ScoreMap` として出力する。
各コンポーネントの `base` 値 (0–100) がLayer 1の入力となる。

| コンポーネントID | 意味 |
|---|---|
| CPU / GPU / NPU | 演算・推論能力 |
| PSU / EFF | 電源容量・変換効率 |
| THM / EXH | 熱管理・排熱 |
| FRM | フレーム耐久性 |
| RAM / SSD / HDD | メモリ・ストレージ帯域 |
| NET / SPK | ネットワーク・スピーカー（社交・出力） |
| CAM / MIC / TCH | カメラ・マイク・タッチ（入力・感覚） |
| FW / LAT | ファームウェア成熟度・レイテンシ |

### 2-2. Morpho (comparedna)

12軸プロファイリングエンジン。あらゆるエンティティを共通ベクトル空間に投影する。
Claude Opus 4.7 + adaptive thinking により `axes12` を生成。
デジタルツインでは **Layer 2 の直接入力**として使用可能（`entryToDigitalTwin()`）。

軸定義:

| 軸 | デジタルツイン上の意味 | valence/arousal への寄与 |
|---|---|---|
| A 構造複雑性 | 認知・思考の多層性 | arousal +25% |
| B エネルギー代謝 | 持続力・活力 | valence +25% |
| C 入出力 | センサーと表現力 | arousal +20% |
| D 制御・自律性 | 意思決定力 | arousal +20% |
| E 健康・耐久 | ストレス耐性 | valence +20% |
| F 環境依存度 | 外部依存レベル | valence −10%（逆寄与） |
| G 社交性 | 対人接続力 | valence +20% |
| H 重力・影響力 | 存在感・吸引力 | arousal +20% |
| I 排除・免疫 | ノイズ除去力 | arousal +15% |
| J 流動性 | 情報処理速度 | valence +10% |
| K プライド | 自己イメージ | 遷移条件に使用 |
| L 生命力 | 持続性・不滅度 | valence +15% |

### 2-3. how-feelings-work

27種の感情を臨床心理学的に定義したデータセット。各感情は以下を持つ:

- `valence` (-2〜2)・`arousal` (-2〜2): 感情空間上の座標
- `transitions`: 他感情への遷移エッジ（ラベル付き）
- `triggers` / `process` / `bodyReactions` / `function`: 感情の詳細メカニズム

デジタルツインでは:
1. `TWIN_EMOTIONS` のベースデータとして使用
2. `deriveTransitions()` のエッジラベルソースとして使用

### 2-4. Resonance

物語パターン（ナラティブ構造）を I〜VIII の軌跡タイプで分類するエンジン。
デジタルツインではLayer 3の感情から `trajectoryType` と `pattern id` を導出する。

| trajectoryType | ナラティブの性質 |
|---|---|
| I | 上昇一直線（笑い・達成） |
| II | 伏線→回収（謎・期待） |
| III | 突発的転換（驚き） |
| IV | 山型・カタルシス（感動・涙） |
| V | 緊張の持続（サスペンス・恐怖・気まずさ） |
| VI | （予約） |
| VII | ハイテンション持続（ノリ・フロー） |
| VIII | フラット（退屈・安心・解決） |

---

## 3. 数学的定義

### 3-1. specsToAxes (Layer 1 → Layer 2)

```
A = mean(CPU, GPU, NPU) / 10
B = mean(PSU, EFF) / 10
C = mean(CAM, MIC, SPK, TCH) / 10
D = mean(FW, LAT) / 10
E = mean(PSU, EFF, THM) / 10
F = (100 − mean(EFF, FW)) / 10
G = mean(NET, SPK) / 10
H = mean(NET, SPK, GPU) / 10
I = mean(THM, EXH) / 10
J = mean(RAM, SSD, HDD) / 10
K = mean(CPU, HDD, NPU) / 10
L = mean(PSU, EFF, FRM) / 10
```

各軸は 0–10 にクランプ・丸め処理。
`mean` は null・NaN を除いた値の算術平均。欠損時は 50 を使用。

### 3-2. axesToEmotionCoords (Layer 2 → Layer 3)

重み付き線形結合により valence・arousal を算出:

```
valenceRaw  = B×0.25 + G×0.20 + E×0.20 + L×0.15 + J×0.10 + (10−F)×0.10
arousalRaw  = A×0.25 + C×0.20 + D×0.20 + H×0.20 + I×0.15

valence = valenceRaw / 10 × 4 − 2   → [-2, 2]
arousal = arousalRaw / 10 × 4 − 2   → [-2, 2]
```

**設計根拠:**
- valence は「良い状態で動いているか」→ エネルギー効率(B)・社交性(G)・健康(E)・寿命(L)が正寄与
- arousal は「どれだけ活発・反応的か」→ 複雑性(A)・入出力(C)・制御(D)・影響力(H)が正寄与
- F（環境依存）は自律性の逆なので valence に逆寄与

### 3-3. coordsToEmotion (Layer 3)

ユークリッド距離で最近傍感情を選択:

```
closestId = argmin_{id} √((e.valence − valence)² + (e.arousal − arousal)²)
```

感情空間上の分布（主要感情）:

```
  arousal
    2 |  fear  anger/frustration  excitement
    1 |  anxiety  pride/joy       curiosity/hope
    0 |  shame/disgust  empathy   gratitude/awe/love
   -1 |  sadness/grief/loneliness  nostalgia  relief
   -2 |  boredom                   contentment
      +------------------------------------------→ valence
        -2          0              2
```

### 3-4. deriveTransitions (条件付き状態遷移)

現在の感情と12軸の値から「今アクセス可能な遷移」を抽出する:

```
activeTo = { to | conditions[currentEmotion][to] === true }
```

遷移条件の設計原則:

| 軸 | 高値時の意味 | 低値時の意味 |
|---|---|---|
| K(プライド) 高 | 自己帰属・誇りへ遷移しやすい | 恥・罪悪感へ落ちやすい |
| G(社交性) 高 | 感謝・愛情・高揚へ向かう | 孤独・悲しみに落ちやすい |
| E(健康) 高 | 回復・安心・静謐を保てる | 不安が悪化しやすい |
| D(制御) 低 | 恐怖・不安が具体化する | — |
| A(複雑性) 高 | 好奇心・畏敬へ向かう | 退屈に落ちやすい |
| J(流動性) 高 | フロー・ノスタルジアへ | — |
| I(免疫) 高 | 怒り・排除的反応が出やすい | — |
| L(生命力) 高 | 静謐・不滅の安心感 | 愛情→悲嘆に落ちやすい |

ラベル（日本語）は how-feelings-work の臨床遷移グラフから取得し、
感情IDが一致しない場合は感情名をフォールバックとして使用する。

---

## 4. 完全遷移マップ

### ポジティブ感情

```
joy ──[自己帰属 K>6]──→ pride
    ──[他者帰属 G>6]──→ gratitude
    ──[活動没入 J>6]──→ flow
    ──[強度減衰 B<5]──→ contentment
    ──[次への不安 E<4]→ anxiety

excitement ──[共有 G>6]──────────→ joy
           ──[没入 J>7,D>6]───→ flow
           ──[疲弊 E<4]──────→ anxiety
           ──[自己認識 K>7]──→ pride

pride ──[共有 G>6]──→ joy
      ──[達成 E>6]──→ contentment
      ──[地位不安 D<4]→ anxiety
      ──[過剰 K>8]──→ contempt
      ──[崩壊 K<3]──→ shame

flow ──[完了 B>6]──→ joy
     ──[充実 E>6]──→ contentment
     ──[成長認識 K>6]→ pride
     ──[次の謎 A>7]──→ curiosity

curiosity ──[スケール A>7]──→ awe
          ──[完全没入 J>7,D>6]→ flow
          ──[停滞 A<4]──────→ boredom
          ──[共鳴 H>6]──────→ joy

awe ──[探索 A>6]──→ curiosity
    ──[美 H>7]────→ joy
    ──[不滅感 L>7]─→ contentment
    ──[つながり G>6]→ gratitude

gratitude ──[共有 G>6]──→ joy
          ──[絆深化 G>8]→ love
          ──[静化 B<6]──→ contentment
          ──[感動 H>7]──→ elevation

contentment ──[刺激 B>7]──→ joy
            ──[退屈 A<4]──→ boredom

relief ──[共有 G>6]──→ joy
       ──[回復 E>6]──→ contentment
       ──[感謝 G>7]──→ gratitude

elevation ──[感謝 G>6]──→ gratitude
          ──[崇高 H>7]──→ awe
          ──[活性 B>6]──→ joy

hope ──[実現 L>7]──→ joy
     ──[無力 D<4]──→ anxiety
     ──[消失 B<3]──→ sadness
     ──[探索 A>6]──→ curiosity

love ──[共有 G>6]────────→ joy
     ──[心配 E<4]────────→ anxiety
     ──[脅威 I>6,G>5]────→ jealousy
     ──[喪失 L<3]────────→ grief
     ──[感謝 G>7]────────→ gratitude
```

### ネガティブ感情

```
anxiety ──[脅威具体化 D<4]──→ fear
        ──[攻撃 I>6]────────→ anger
        ──[探索 A>6]────────→ curiosity
        ──[解除 E>7]────────→ contentment
        ──[消耗 B<3]────────→ sadness

fear ──[持続 D<4]──→ anxiety
     ──[反撃 I>6]──→ anger
     ──[安全確認 A>7]→ curiosity
     ──[消耗 B<4]──→ sadness
     ──[解除 E>7]──→ relief

anger ──[消耗 B<4]──────────→ sadness
      ──[自己正当化 K>7]────→ pride
      ──[解放 I>6]──────────→ contentment
      ──[後悔 G>6,K<5]───→ guilt
      ──[見下し K>7,I>6]─→ contempt

sadness ──[記憶美化 J>5]──→ nostalgia
        ──[孤立 G<4]──────→ loneliness
        ──[支援認識 G>7]──→ gratitude
        ──[長期化 E<3]────→ grief
        ──[不当性 I>6]────→ anger

grief ──[急性化 E>4]──→ sadness
      ──[不当性 I>6]──→ anger
      ──[自責 K<4]────→ guilt
      ──[記憶 J>5]────→ nostalgia
      ──[受容 L>7]────→ contentment

loneliness ──[孤立深化 G<3]──→ sadness
           ──[無力 D<4]──────→ anxiety
           ──[探索 A>6]──────→ curiosity
           ──[回復 G>7]──────→ love

boredom ──[洞察 A>7]──→ curiosity
        ──[外圧 F>7]──→ anxiety
        ──[受容 E>6]──→ contentment
        ──[焦り D<4]──→ frustration

frustration ──[爆発 I>6]──→ anger
            ──[無力 D<4]──→ anxiety
            ──[投げやり B<4]→ boredom
            ──[解決 E>7]──→ contentment

nostalgia ──[喪失強調 J<4]──→ sadness
          ──[温かい記憶 G>6]→ joy
          ──[感謝 G>7]──────→ gratitude
          ──[受容 E>6]──────→ contentment

disappointment ──[受容 E<5]──→ sadness
              ──[他責 I>6]──→ anger
              ──[自責 K<4]──→ shame
              ──[再挑戦 L>6]→ hope

regret ──[喪失 J>5]──→ sadness
       ──[自責 K<4]──→ shame
       ──[行為 G>5]──→ guilt
       ──[学習 D>6]──→ hope
```

### 社会的感情

```
jealousy ──[確信 I>7]──→ anger
         ──[不安 D<4]──→ anxiety
         ──[喪失 G<4]──→ sadness
         ──[自己嫌悪 K<4]→ shame

envy ──[破壊 I>7,K>6]──→ anger
     ──[不足感 E<4]────→ sadness
     ──[動機 L>6,D>5]──→ hope
     ──[嫌悪 K<3]──────→ shame

shame ──[投影 I>7]──→ anger
      ──[抑うつ K<4]→ sadness
      ──[回避 D<4]──→ anxiety
      ──[行為化 G>5]→ guilt

guilt ──[消耗 E<4]──→ sadness
      ──[自己化 K<3]→ shame
      ──[修復 G>7]──→ relief
      ──[赦し G>8]──→ gratitude

empathy ──[共鳴消耗 E<4]──→ sadness
        ──[絆深化 G>7]────→ love
        ──[感動 H>7]──────→ elevation
        ──[燃え尽き E<3]──→ frustration

compassion ──[絆 G>7]──→ love
           ──[感動 H>7]→ elevation
           ──[無力 E<3]→ sadness

surprise ──[肯定評価 H>6]──→ joy
         ──[否定評価 D<4]──→ fear
         ──[興味 A>6]──────→ curiosity
         ──[不快 I>7]──────→ disgust

disgust ──[怒り I>6]──→ anger
        ──[見下し K>7]→ contempt
        ──[恐怖 D<4]──→ fear

contempt ──[深化 I>7]──→ disgust
         ──[攻撃 I>8]──→ anger

embarrassment ──[深化 K<4]──→ shame
              ──[笑い G>7]──→ joy
              ──[怒り I>7]──→ anger
```

---

## 5. Morpho エントリからの派生 (entryToDigitalTwin)

Morpho の `Entry` は Claude が生成した `axes12` を持つため、Layer 1 をスキップできる:

```
Entry.axes12  →  axesToEmotionCoords()  →  coordsToEmotion()  →  deriveTransitions()
                                                                 →  EMOTION_TO_PATTERN
```

追加出力として `Entry.layers`（7層ナラティブ）と `Entry.envDNA`（60要素環境DNA）が
デジタルツインに付加され、感情状態に文脈を与える。

`Entry.layers.emotions`（fear/joy/anger/love/sadness の文章）は
Morpho 側の「対象が感じる感情の語り」であり、デジタルツインの `emotionState` と
比較することで**自己イメージと実際の状態のズレ（Kプライド軸）**を検出できる。

---

## 6. 将来の拡張

### 6-1. 時系列デジタルツイン

過去のスコアスナップショットを保持し、感情状態の時系列変化を追跡する。
`trajectory` として Resonance の軌跡タイプ遷移も記録可能。

```typescript
type TwinSnapshot = { timestamp: number; twin: DigitalTwin };
type TwinHistory  = TwinSnapshot[];
```

### 6-2. 感情予測

現在の軸値と遷移確率から、次の感情状態を予測する:

```
P(next | current, axes) ∝ conditionScore(axes, transition)
```

### 6-3. Morpho 比較 × デジタルツイン

複数エンティティの `axes12` を比較することで、感情状態の類似性を直接比較できる:

```
entityA.emotionState.valence ≈ entityB.emotionState.valence  →  共感しやすいペア
```

### 6-4. Resonance リアルタイム演出

`affectivePattern.trajectoryType` を使ってリアルタイムに会話・演出の構造を制御する:

- Type V (サスペンス) 中は情報を出し惜しむ
- Type IV (カタルシス) 到達時に感動シーンを挿入
- Type VII (ノリ) 中はテンポを上げる

---

## 7. 変更履歴

| 日付 | 内容 |
|---|---|
| 2026-05-01 | 初版作成。4アプリ統合・27感情・全遷移マップ定義 |

---

*この文書は統合ロジックの進化とともに更新される。*
