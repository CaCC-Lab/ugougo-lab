# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「動く教材」 - 小学生から高校生向けのインタラクティブな学習教材プラットフォーム。視覚的・動的な表現で抽象的な概念の理解を促進する教育ツール。

## 開発コマンド

```bash
# 開発サーバー起動
pnpm run dev

# プロダクションビルド
pnpm run build

# コード検査
pnpm run lint

# ビルドプレビュー
pnpm run preview
```

## アーキテクチャ概要

### コア技術
- **フロントエンド**: React 18.2.0 + TypeScript 5.0.4
- **UIライブラリ**: MUI 7.1.1 (Material-UI)
- **アニメーション**: Framer Motion 10.12.16, Konva.js 9.2.0
- **状態管理**: Zustand 4.3.8

### ディレクトリ構成
```
src/
├── materials/       # 教材本体（学年別・教科別に整理）
│   ├── elementary/  # 小学生向け
│   ├── junior-high/ # 中学生向け
│   └── high-school/ # 高校生向け
├── components/      # 共通コンポーネント
│   ├── common/      # 汎用UI部品
│   ├── educational/ # 教育用共通部品
│   └── layout/      # レイアウト関連
├── stores/          # Zustand状態管理
├── styles/themes/   # 学年別テーマ定義
└── types/           # TypeScript型定義
```

### 教材の標準構造
```
materials/[学年区分]/[学年]/[教科]/[教材名]/
├── index.tsx            # エントリーポイント
├── [教材名].tsx         # メインコンポーネント
├── components/          # 教材固有コンポーネント
├── hooks/               # 教材固有フック
└── README.md            # 教材説明
```

## 重要な制約事項

1. **技術スタック厳守**: `technologystack.md`記載のバージョンは変更禁止
2. **ディレクトリ構造厳守**: `directorystructure.md`の構造に従う
3. **UI/UXデザイン変更禁止**: レイアウト・色・フォント等の変更は事前承認必須
4. **新規ファイルより既存ファイル編集を優先**

## インポートパス

TypeScriptパスマッピング使用:
```typescript
import { Button } from '@components/common/Button';
import { useAuth } from '@hooks/useAuth';
import { NumberBlocks } from '@materials/elementary/grade1/math/NumberBlocks';
```

## 開発フロー

1. **TODO.md確認**: 優先度順にタスクを確認
2. **既存コード調査**: 類似機能や共通処理の確認
3. **実装**: 命名規則とディレクトリ構造に従う
4. **動作確認**: `pnpm run dev`で動作確認
5. **Lint実行**: `pnpm run lint`でコード品質確保

## 学年別テーマシステム

- **elementary.ts**: 小学生向け（明るく親しみやすい配色）
- **juniorHigh.ts**: 中学生向け（落ち着いた学習環境）
- **highSchool.ts**: 高校生向け（プロフェッショナルな雰囲気）

## 教材開発の指針

1. **インタラクティブ性**: ドラッグ、クリック、アニメーションを活用
2. **視覚的理解**: 抽象概念を具体的な動きで表現
3. **段階的学習**: 易しいレベルから徐々に難易度上昇
4. **即時フィードバック**: 操作結果をリアルタイムで表示

## 現在の実装状況

- **完成教材数**: 29教材
- **対応学年**: 小学1年〜高校1年
- **対応教科**: 算数・数学・理科・国語・生活科・情報
- **フェーズ**: Phase 1 MVP完了、優先度高の教材開発中