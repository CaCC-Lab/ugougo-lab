# 動く教材プロジェクト

小学生から高校生を対象とした、インタラクティブな学習教材プラットフォームです。

## 概要

このプロジェクトは、抽象的な概念を視覚的・動的に表現することで、学習者の理解を深めることを目的としています。

### 特徴

- 🎓 小学1年生から高校3年生まで幅広い学年に対応
- 📚 主要5教科（国語・算数/数学・理科・社会・英語）をカバー
- 🎨 学年別に最適化されたUI/UXデザイン
- 💡 インタラクティブな操作で概念を理解
- 📱 タブレット・PC・スマートフォンに対応

## 技術スタック

- **フロントエンド**: React 18.2.0 + TypeScript 5.0.4
- **UIライブラリ**: MUI (Material-UI) 5.13.1
- **アニメーション**: Framer Motion 10.12.16
- **状態管理**: Zustand 4.3.8
- **ビルドツール**: Vite 4.3.9

詳細は [technologystack.md](./technologystack.md) を参照してください。

## 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/CaCC-Lab/InteractiveLearningMaterialsForStudents.git
cd InteractiveLearningMaterialsForStudents

# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm run dev
```

## プロジェクト構造

```
src/
├── components/     # 共通コンポーネント
├── materials/      # 教材本体
├── features/       # 機能別モジュール
├── hooks/          # カスタムフック
├── stores/         # 状態管理
├── services/       # 外部サービス連携
├── utils/          # ユーティリティ
├── styles/         # スタイル定義
└── types/          # TypeScript型定義
```

詳細は [directorystructure.md](./directorystructure.md) を参照してください。

## 開発ロードマップ

### Phase 1: MVP開発（実装中）
- [x] 環境構築
- [x] 基本的なディレクトリ構造
- [ ] 小学1年算数：数の合成・分解ブロック
- [ ] 小学2年算数：かけ算九九の視覚化
- [ ] 中学1年数学：正負の数の数直線

### Phase 2: 基盤構築
- [ ] ユーザー認証システム
- [ ] 課金システム（フリーミアムモデル）
- [ ] 学習履歴保存機能

### Phase 3: コンテンツ拡充
- [ ] 各学年・教科の教材追加
- [ ] 月2-3教材のペースで継続的に追加

## ライセンス

このプロジェクトはプライベートリポジトリです。

## お問い合わせ

CaCC-Lab
