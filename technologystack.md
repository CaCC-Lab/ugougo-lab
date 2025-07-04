# 技術スタック定義書

## プロジェクト概要
- **プロジェクト名**: ウゴウゴラボ (Interactive Learning Materials for Students)
- **目的**: 動く教材による抽象概念の視覚化
- **本番URL**: https://ugougo-lab.vercel.app/
- **リポジトリ**: https://github.com/user/InteractiveLearningMaterialsForStudents

## フロントエンド技術スタック

### コア技術 【変更禁止】
- **React**: 18.2.0 ✅
- **TypeScript**: 5.8.3 ✅
- **Node.js**: v18+ 推奨

### ビルドツール
- **Vite**: 6.3.5 ✅
- **ESLint**: 9.28.0 ✅  
- **Prettier**: 2.8.8 ✅
- **TypeScript ESLint**: 8.33.1 ✅

### UIフレームワーク 【変更禁止】
- **Material-UI (MUI)**: 5.16.7 ✅
- **MUI Icons**: 7.1.1 ✅
- **Emotion**: 11.14.0 ✅

### アニメーション・グラフィックス 【変更禁止】
- **Framer Motion**: 10.12.16 ✅
- **Three.js**: 0.152.2 ✅
- **Konva.js**: 9.2.0 ✅
- **React Konva**: 18.2.10 ✅

### データ可視化
- **Recharts**: 2.15.3 ✅

### 状態管理
- **Zustand**: 4.3.8 ✅

### HTTP通信
- **Axios**: 1.10.0 ✅ (セキュリティ修正済み)

### 数学・計算
- **math.js**: 14.5.3 ✅ (eval()脆弱性の安全な代替)

### 効果・フィードバック
- **Canvas Confetti**: 1.9.3 ✅

### 日時処理
- **Day.js**: 1.11.8 ✅

## テスト技術スタック

### テストフレームワーク
- **Jest**: 30.0.2 ✅
- **ts-jest**: 29.4.0 ✅
- **@testing-library/react**: 16.3.0 ✅
- **@testing-library/jest-dom**: 6.6.3 ✅
- **@testing-library/user-event**: 14.6.1 ✅

### テスト環境
- **jsdom**: 26.1.0 ✅

## 開発ツール

### パッケージマネージャー
- **pnpm**: 9.15.0+ ✅

### Git Hooks
- **Husky**: 8.0.3 ✅
- **lint-staged**: 13.2.2 ✅

### 最適化
- **Terser**: 5.43.1 ✅
- **Rollup Plugin Visualizer**: 6.0.3 ✅

## デプロイメント

### プラットフォーム
- **Vercel**: 本番環境 ✅
- **自動デプロイ**: GitHub連携 ✅

## バージョン制約

### 禁止事項 【厳守】
1. **React 19.x**: まだ安定版ではないため禁止
2. **MUI v6**: 破壊的変更があるため禁止  
3. **Node.js v20+**: Three.jsとの互換性問題のため禁止
4. **eval()の使用**: セキュリティ脆弱性のため絶対禁止

### 推奨アップグレード
1. **pnpm**: 最新stable版の使用を推奨
2. **TypeScript**: マイナーバージョンアップデートは可
3. **ESLint**: セキュリティパッチは適用可

## 環境変数

### 必須環境変数
```bash
# 基本設定
VITE_APP_NAME="ウゴウゴラボ"
VITE_APP_VERSION="0.1.0"

# 本番環境
NODE_ENV=production

# 開発環境
NODE_ENV=development
VITE_DEV_MODE=true
```

### オプション環境変数
```bash
# Gemini API (Phase5で追加予定)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Analytics (将来実装予定)
VITE_GA_TRACKING_ID=your_ga_id
```

## セキュリティ要件

### 必須セキュリティ対策
1. **XSS対策**: 全ての入力はエスケープ処理
2. **eval()禁止**: math.jsなど安全な代替を使用
3. **依存関係監査**: 定期的な`pnpm audit`実行
4. **Content Security Policy**: 適切なCSP設定

### 脆弱性対応履歴
- ✅ 2025-01-03: axios 1.4.0 → 1.10.0 (SSRF脆弱性修正)
- ✅ 2025-01-03: eval()使用停止、math.js導入

## パフォーマンス要件

### 目標指標
- **初期ロード時間**: 2秒以下
- **バンドルサイズ**: 3.0MB以下 (gzip: 762KB)
- **Lighthouse Score**: 90点以上
- **First Contentful Paint**: 1.5秒以下

### 最適化手法
- ✅ 動的インポート実装済み
- ✅ Tree Shaking設定済み
- ✅ 圧縮設定最適化済み
- ✅ MUIの個別インポート実装済み

## ブラウザサポート

### サポート対象
- **Chrome**: 90+
- **Firefox**: 88+  
- **Safari**: 14+
- **Edge**: 90+

### 非サポート
- **Internet Explorer**: 全バージョン
- **Chrome**: 89以下
- **Safari**: 13以下

## 技術選定理由

### React 18選定理由
- Concurrent Features活用
- 教育系アプリに最適なパフォーマンス
- 豊富なエコシステム

### Three.js選定理由  
- 3D教材の実装に必須
- WebXR対応の準備
- 豊富なドキュメント

### Zustand選定理由
- シンプルな状態管理
- TypeScriptとの親和性
- 小さなバンドルサイズ

### math.js選定理由
- eval()の安全な代替
- 豊富な数学関数
- エラーハンドリングの充実

## アップデート方針

### 月次アップデート
- セキュリティパッチの適用
- パッチバージョンの更新

### 四半期アップデート
- マイナーバージョンの検討
- 新機能の評価

### 年次アップデート
- メジャーバージョンの検討
- 技術スタック全体の見直し

---

**重要**: この技術スタック定義は絶対的な制約です。記載されたバージョンや技術選定は、事前承認なしに変更してはいけません。アップグレードが必要な場合は、必ず技術リーダーの承認を得てから実施してください。