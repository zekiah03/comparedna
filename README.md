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

1. このリポジトリを GitHub にプッシュ
2. [vercel.com](https://vercel.com) で New Project → GitHub リポジトリを選択
3. Framework Preset: Next.js (自動検出)
4. Environment Variables (任意):
   - `ANTHROPIC_API_KEY` — 設定すれば訪問者がキー未登録でもホストのキーで動く。公開デプロイでは**設定しない**ことを推奨 (訪問者が自分のキーを使う)
5. Deploy

デフォルトで Vercel Hobby (無料) で動きます。関数タイムアウトは 60 秒。

## データ保存

すべてブラウザの localStorage に保存されます。サーバー側のファイル書込はありません。

- `morpho:library:v1` — ユーザーが分析した対象
- `morpho:analogies:v1` — 履歴書キャッシュ
- `morpho:apiKey:v1` — Anthropic API キー

端末を変えるとデータは持ち越せません (export/import は未実装)。

## スタック

- Next.js 16 (App Router, Turbopack)
- TypeScript, Tailwind CSS v4
- Recharts, Framer Motion
- `@anthropic-ai/sdk` + Zod (structured outputs)
- Claude Opus 4.7 with adaptive thinking + prompt caching
