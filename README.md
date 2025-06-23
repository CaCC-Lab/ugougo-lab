# ウゴウゴラボ - 動く教材の実験室

> 小学生から高校生向けのインタラクティブ学習プラットフォーム  
> **🌐 本番サイト**: https://ugougo-lab.vercel.app/

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://ugougo-lab.vercel.app/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue)](https://www.typescriptlang.org/)
[![MUI](https://img.shields.io/badge/MUI-7.1.1-007FFF)](https://mui.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

## 🎯 プロジェクト概要

「動く教材」コンセプトに基づいた次世代の学習プラットフォーム。抽象的な概念を視覚的・動的に表現することで、学習者の理解を深めることを目的としています。

### ✨ 主な特徴

- 🎓 **幅広い対象年齢**: 小学1年生〜高校3年生
- 📚 **多教科対応**: 算数/数学・理科・国語・英語・社会・情報・生活科
- 🎨 **インタラクティブUI**: ドラッグ&ドロップ、リアルタイム計算、アニメーション
- 📱 **レスポンシブデザイン**: PC・タブレット・スマートフォン対応
- 🧠 **学習支援**: 段階的ヒント、進捗記録、個別最適化

## 📊 実装状況

- **総教材数**: 54教材
- **対応学年**: 小学1年〜高校2年
- **MaterialWrapper統合率**: 100%
- **モバイル対応**: TOP20教材で最適化済み

## 🛠 技術スタック

### フロントエンド
- **React 18.2.0** + **TypeScript 5.0.4**: モダンなUI開発
- **MUI 7.1.1**: Material Design コンポーネント
- **Framer Motion 10.12.16**: 滑らかなアニメーション
- **Konva.js 9.2.0**: 高性能2D Canvas描画

### 状態管理・ツール
- **Zustand 4.3.8**: 軽量状態管理
- **Vite 6.3.5**: 高速ビルドツール
- **ESLint + Prettier**: コード品質管理

### インフラ・デプロイ
- **Vercel**: 本番環境（Tokyo region）
- **GitHub**: ソースコード管理
- **自動デプロイ**: main ブランチ連携

## 🎮 主要教材例

### 小学生向け
- **数の合成・分解ブロック**: 1〜10のブロックを使った直感的な計算学習
- **かけ算九九の視覚化**: グリッド表示とアニメーションで九九を理解
- **ひらがな書き順**: なぞり書きとアニメーションで正しい書き順を習得

### 中学生向け
- **正負の数の数直線**: 数直線上でのアニメーション付き計算
- **原子・分子構造シミュレーション**: 3D描画による化学結合の可視化
- **一次関数グラフ描画**: パラメータ調整によるリアルタイムグラフ変化

### 高校生向け
- **三角関数グラフ**: 動的パラメータ調整と波形の視覚化
- **微積分の視覚化**: 関数の変化を直感的に理解

## 🚀 クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/CaCC-Lab/ugougo-lab.git
cd ugougo-lab

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm run dev
```

ブラウザで http://localhost:5173 を開いてアプリケーションを確認できます。

## 📁 プロジェクト構造

```
src/
├── components/          # 共通コンポーネント
│   ├── common/         # 汎用UI部品
│   ├── educational/    # 教育用共通部品
│   └── wrappers/       # MaterialWrapper（学習記録）
├── materials/          # 教材本体
│   ├── elementary/     # 小学生向け（学年・教科別）
│   └── junior-high/    # 中学生向け（学年・教科別）
├── stores/             # Zustand状態管理
├── hooks/              # カスタムフック
└── styles/themes/      # 学年別テーマ
```

## 🎨 デザインシステム

### 学年別テーマ
- **小学生**: 明るく親しみやすい配色、大きめのボタン
- **中学生**: 落ち着いた学習環境、適度なコントラスト
- **高校生**: プロフェッショナルな雰囲気、洗練されたUI

### レスポンシブデザイン
- **Mobile First**: スマートフォン優先設計
- **タッチ対応**: モバイルデバイスでの最適な操作性
- **アクセシビリティ**: キーボード操作・スクリーンリーダー対応

## 📈 開発ロードマップ

### Phase 1: MVP開発 ✅
- [x] 基本的な教材実装（54教材）
- [x] MaterialWrapper統合
- [x] モバイル対応
- [x] Vercelデプロイ

### Phase 2: 技術基盤強化 🚧
- [ ] TypeScript厳格モードの復活
- [ ] パフォーマンス最適化
- [ ] PWA対応
- [ ] 自動テスト拡充

### Phase 3: 機能拡張 📋
- [ ] ユーザー認証システム
- [ ] 学習分析ダッシュボード
- [ ] 教師向け管理機能
- [ ] 多言語対応

## 🤝 コントリビューション

コントリビューションを歓迎します！バグ報告、機能提案、プルリクエストをお待ちしています。

### 開発環境のセットアップ
1. Node.js 18+ をインストール
2. pnpm をインストール: `npm install -g pnpm`
3. 依存関係インストール: `pnpm install`
4. 開発サーバー起動: `pnpm run dev`

### コード規約
- TypeScript + React の最新ベストプラクティス
- ESLint + Prettier による自動フォーマット
- Conventional Commits によるコミットメッセージ

## 📄 ライセンス

このプロジェクトは [MIT License](./LICENSE) の下で公開されています。

## 👨‍💻 作成者

**開発者**: CaCC-Lab
**問い合わせ先**: https://cacc-lab.net/otoiawase/

---

## 📚 関連ドキュメント

- [📋 機能詳細](./FEATURES.md)
- [🏗 アーキテクチャ](./ARCHITECTURE.md)
- [🚀 デプロイメント](./DEPLOYMENT.md)
- [📊 分析レポート](./MATERIAL_WRAPPER_STATUS.md)
- [📱 モバイル対応](./MOBILE_TEST_CHECKLIST.md)

---

<p align="center">
  <strong>🎓 学習の未来を、動かしながら創る</strong>
</p>