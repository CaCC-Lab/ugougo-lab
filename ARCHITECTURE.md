# アーキテクチャ設計

## 🏗 技術スタック

### フロントエンド
- **React 18.2.0**: UIライブラリ
- **TypeScript 5.0.4**: 型安全性
- **MUI 7.1.1**: Material-UIコンポーネント
- **Framer Motion 10.12.16**: アニメーション
- **Konva.js 9.2.0**: 2D Canvas描画

### 状態管理
- **Zustand 4.3.8**: 軽量状態管理ライブラリ
- **学習記録**: LocalStorageによる永続化
- **設定管理**: ユーザー設定の保存

### ビルド・デプロイ
- **Vite 6.3.5**: 高速開発・ビルドツール
- **Vercel**: 本番環境デプロイ
- **GitHub Actions**: CI/CD（将来実装予定）

## 📁 ディレクトリ構造

```
src/
├── components/           # 共通コンポーネント
│   ├── common/          # 汎用UI部品
│   ├── educational/     # 教育用共通部品
│   ├── layout/          # レイアウト関連
│   └── wrappers/        # ラッパーコンポーネント
├── materials/           # 教材本体
│   ├── elementary/      # 小学生向け
│   ├── junior-high/     # 中学生向け
│   └── high-school/     # 高校生向け（将来拡張）
├── stores/              # Zustand状態管理
├── hooks/               # カスタムフック
├── styles/themes/       # 学年別テーマ
├── types/               # TypeScript型定義
└── utils/               # ユーティリティ
```

### 教材の標準構造
```
materials/[学年区分]/[学年]/[教科]/[教材名]/
├── [教材名].tsx         # メインコンポーネント
├── README.md            # 教材説明
├── components/          # 教材固有コンポーネント
├── hooks/               # 教材固有フック
├── data/                # 問題データ・定数
└── types.ts             # 型定義
```

## 🔧 設計パターン

### コンポーネント設計
- **Atomic Design**: 再利用可能なコンポーネント構造
- **Container/Presenter**: ロジックとUIの分離
- **Custom Hooks**: 状態管理とビジネスロジックの抽出

### 状態管理
- **Zustand Store**: グローバル状態（学習記録、設定）
- **Local State**: コンポーネント固有の状態
- **URL State**: ルーティング状態（将来実装予定）

### 型安全性
- **TypeScript**: 全ファイルで型定義
- **Interface-first**: API・データ構造の型定義優先
- **Strict Mode**: 厳格な型チェック（一部緩和中）

## 🎨 UI/UXアーキテクチャ

### テーマシステム
```typescript
// 学年別テーマ
elementary.ts    // 小学生: 明るく親しみやすい
juniorHigh.ts    // 中学生: 落ち着いた学習環境
highSchool.ts    // 高校生: プロフェッショナル
```

### レスポンシブ設計
- **Mobile First**: スマホ優先設計
- **ブレークポイント**: MUIの標準ブレークポイント使用
- **タッチ操作**: モバイルデバイス最適化

### アニメーション戦略
- **Framer Motion**: ページ遷移・UI要素アニメーション
- **Konva.js**: 教材内のCanvas描画・アニメーション
- **CSS Transitions**: 軽量なホバー・クリック効果

## 📊 パフォーマンス

### 最適化戦略
- **Code Splitting**: 教材の遅延読み込み（将来実装）
- **Image Optimization**: SVG使用、画像圧縮
- **Bundle Analysis**: 不要な依存関係の排除

### 現在の指標
- **Bundle Size**: 3.2MB（gzip: 806KB）
- **Build Time**: ~10秒
- **Lighthouse Score**: 未測定（改善予定）

## 🔐 セキュリティ

### データ保護
- **Local Storage**: 学習データのローカル保存
- **No PII**: 個人識別情報の非収集
- **Client-side Only**: サーバーサイド処理なし

### コードセキュリティ
- **ESLint**: 静的解析によるセキュリティチェック
- **Dependencies**: 定期的な依存関係アップデート
- **Input Validation**: ユーザー入力の検証

## 🚀 スケーラビリティ

### 拡張性設計
- **Modular Architecture**: 教材の独立性
- **Plugin System**: 新教材の簡単追加
- **Theme System**: 新しい学年・テーマの追加

### 将来の拡張計画
- **Backend Integration**: API連携（認証・分析）
- **PWA**: オフライン対応
- **Multi-language**: 国際化対応
- **Real-time**: リアルタイム協働学習