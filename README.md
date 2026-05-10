# 🐺 ワードウルフ × AI GM

AI ゲームマスター付きで二人 + AI または二人だけで遊べるワードウルフ。
Next.js (App Router) + TypeScript + Tailwind + OpenAI API。Vercel デプロイ前提。

## モード

- **3人モード**: AI が GM 兼プレイヤーとして参加。AI もウルフになりうる王道ルール。
- **2人モード**: 二人がそれぞれワードを引き、相手と同じワードかを当て合う変則ルール。AI は司会・合いの手のみ。

## ローカル開発

```bash
cp .env.example .env.local
# .env.local の OPENAI_API_KEY に sk-... をセット
npm install
npm run dev
# http://localhost:3000
```

`OPENAI_API_KEY` が未設定の場合、すべての AI 呼び出しが固定文言の fallback で動作する。

## Vercel デプロイ

1. このリポジトリを GitHub にプッシュ
2. [Vercel](https://vercel.com/new) で Import
3. Settings → Environment Variables に `OPENAI_API_KEY` を登録（Production / Preview）
4. Deploy

## 構成

- `src/app/page.tsx` — ゲームのエントリ
- `src/app/api/{topic,interjection,verdict,gm}/route.ts` — OpenAI 呼び出し（Node Runtime）
- `src/components/phases/*` — フェーズごとの画面
- `src/lib/game/*` — useReducer ベースの状態管理
- `src/lib/openai/*` — OpenAI クライアント・プロンプト・zod スキーマ
- `src/lib/fallback-topics.ts` — API 失敗時の固定お題

## 遊び方（3人モード）

1. プレイヤー 1 / 2 の名前を入れて「ゲームを始める」
2. AI GM がお題を配る → 順に端末を回して長押しでワード確認
3. 議論タイム（既定 3 分）。途中で「AI に一言もらう」も可
4. 投票 → AI GM が結果を解説
