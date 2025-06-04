# 技術スタック定義書

**重要**: このファイルに記載された技術スタックおよびバージョンは、プロジェクトの標準仕様です。
変更が必要な場合は、必ず事前に承認を得てください。

## フロントエンド

### コアフレームワーク
- **React**: 18.2.0
  - 理由: インタラクティブUIの構築に最適
- **TypeScript**: 5.0.4
  - 理由: 型安全性による開発効率向上
- **Vite**: 4.3.9
  - 理由: 高速な開発環境とビルド

### UIライブラリ
- **MUI (Material-UI)**: 5.13.1
  - 理由: 豊富なコンポーネントと学年別テーマ対応
- **Emotion**: 11.11.0
  - 理由: MUIとの統合、動的スタイリング

### アニメーション・グラフィックス
- **Framer Motion**: 10.12.16
  - 理由: 宣言的なアニメーション定義
- **Konva.js**: 9.2.0
  - 理由: Canvas操作の抽象化
- **Three.js**: 0.152.2
  - 理由: 3D表現が必要な教材用

### 状態管理
- **Zustand**: 4.3.8
  - 理由: シンプルで学習コストが低い
- **React Query (TanStack Query)**: 4.29.12
  - 理由: サーバー状態の効率的な管理

### ユーティリティ
- **Axios**: 1.4.0
  - 理由: HTTP通信の標準化
- **Day.js**: 1.11.8
  - 理由: 軽量な日付操作
- **Lodash-es**: 4.17.21
  - 理由: 汎用ユーティリティ関数

## バックエンド（将来実装）

### APIサーバー
- **Node.js**: 18.16.0 LTS
- **Express**: 4.18.2
- **TypeScript**: 5.0.4

### データベース
- **PostgreSQL**: 15.3
  - 理由: 複雑なクエリとJSONB対応
- **Redis**: 7.0.11
  - 理由: セッション管理とキャッシュ

### 認証
- **Firebase Auth** または **Auth0**
  - 理由: 既製の認証システム利用

## 開発ツール

### コード品質
- **ESLint**: 8.42.0
- **Prettier**: 2.8.8
- **Husky**: 8.0.3
- **lint-staged**: 13.2.2

### テスト
- **Vitest**: 0.31.4
  - 理由: Viteとの統合
- **React Testing Library**: 14.0.0
- **Playwright**: 1.34.3
  - 理由: E2Eテスト

### ビルド・デプロイ
- **GitHub Actions**: CI/CD
- **Vercel** または **Netlify**: ホスティング
  - 理由: 静的サイトの高速配信

## インフラストラクチャ

### CDN・アセット配信
- **Cloudflare**: CDNとDDoS対策
- **AWS S3**: 静的アセット保存

### モニタリング
- **Sentry**: エラートラッキング
- **Google Analytics 4**: 利用統計
- **Hotjar**: ユーザー行動分析（有料版のみ）

## 対応ブラウザ

### デスクトップ
- Chrome 110+
- Safari 16+
- Edge 110+
- Firefox 110+

### モバイル
- iOS Safari 15+
- Chrome for Android 110+

## パッケージマネージャー
- **pnpm**: 8.6.0
  - 理由: 効率的な依存関係管理

## 環境変数

```env
# .env.example
VITE_API_URL=https://api.example.com
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=your-sentry-dsn
```

## 更新履歴

| 日付 | 内容 | 承認者 |
|------|------|--------|
| 2024-01-xx | 初版作成 | - |

---

**注意事項**:
1. 新しいパッケージの追加は必ず相談してください
2. メジャーバージョンアップは計画的に実施します
3. セキュリティアップデートは優先的に適用します