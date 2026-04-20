# Morpho — 万物の分類学

存在を、プロファイリングする。あらゆる対象を12軸と環境DNAで解剖し、ジャンルを越えた類似を炙り出す AI 分類学アプリ。

- 12軸 × 60要素 × 7層の多次元プロファイリング
- AI 比較解説、もしもラボ (改造シミュレーション)
- 履歴書風の「もし一人の人間なら」
- Claude Opus 4.7 + adaptive thinking

## ローカル実行

```bash
npm install
npm run dev
# → http://localhost:3000
```

`/settings` で Anthropic API キーを登録すると分析が動きます。  
キーは **ブラウザの localStorage にのみ保存** され、サーバーには永続化されません。

## Vercel へのデプロイ

### 1. プロジェクトをインポート
1. [vercel.com/new](https://vercel.com/new) で GitHub リポジトリを選択
2. Framework Preset: Next.js (自動検出)、そのまま Deploy

### 2. Upstash Redis を追加 (共有ライブラリ必須)
1. Vercel プロジェクト → **Storage** タブ → **Create Database**
2. **Upstash Redis** を選択、無料プラン (256MB, 500k req/day) で OK
3. リージョンを選んで Create
4. 自動で環境変数が設定される:
   - `KV_REST_API_URL` (または `UPSTASH_REDIS_REST_URL`)
   - `KV_REST_API_TOKEN` (または `UPSTASH_REDIS_REST_TOKEN`)
5. **再デプロイ** で反映 (Deployments → 最新の "..." メニューから Redeploy)

### 3. APIキー (任意)
- **公開デプロイでは設定しない**ことを推奨 → 各訪問者が自分の Anthropic キーを持ち込む
- 自分専用で使うなら `ANTHROPIC_API_KEY` を env に設定すると設定画面不要で動く

Vercel Hobby 無料プランで動きます。関数タイムアウト 60 秒。

## データ保存

- **共有ライブラリ** (Upstash Redis): 全訪問者が同じ分析結果を見られる
  - `morpho:entries:v1` — ハッシュ key = entry id, value = Entry JSON
  - `morpho:analogies:v1` — 同様、履歴書キャッシュ
- **APIキー** (ブラウザ localStorage): `morpho:apiKey:v1` — 個人の端末に保存

誰かが分析した対象はすぐ他の人のライブラリにも出ます。API コストは分析した人の財布から出ます (自分のキーを使うので)。

## スタック

- Next.js 16 (App Router, Turbopack)
- TypeScript, Tailwind CSS v4
- Recharts, Framer Motion
- `@anthropic-ai/sdk` + Zod (structured outputs)
- Claude Opus 4.7 with adaptive thinking + prompt caching
