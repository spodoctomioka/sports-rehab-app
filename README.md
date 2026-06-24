# sports-rehab-app (monorepo)

2つの独立した Next.js アプリを含むモノレポ。

## 構成

```
sports-rehab-app/
├── rehab-app/     # リハビリ計画支援（Supabase不使用）
└── weight-app/    # 体重管理システム（Supabase使用）
```

## 起動方法

### rehab-app（localhost:3000）

```bash
cd rehab-app
npm install
npm run dev
```

### weight-app（localhost:3001）

```bash
cd weight-app
npm install
npm run dev
```

## 環境変数

### rehab-app
- 不要（Supabase非使用）

### weight-app
`weight-app/.env.local` に以下を設定：
```
NEXT_PUBLIC_APP_PIN=...
NEXT_PUBLIC_ADMIN_PASSWORD=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Vercel デプロイ

各アプリを別プロジェクトとして独立デプロイ。

### rehab-app
```bash
cd rehab-app
npx vercel --prod
```

### weight-app
```bash
cd weight-app
npx vercel --prod
```

## ルーティング

| アプリ | パス | 内容 |
|--------|------|------|
| rehab-app | /rehab | リハビリ計画 |
| rehab-app | /ankle-go | 足関節復帰評価 |
| weight-app | /weight | 体重管理 |
