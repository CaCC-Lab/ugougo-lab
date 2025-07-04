# ディレクトリ構成定義書

## プロジェクト構造概要

```
InteractiveLearningMaterialsForStudents/
├── src/                          # メインソースコード
├── public/                       # 静的ファイル
├── tests/                       # テストファイル
├── docs/                        # ドキュメント
└── config/                      # 設定ファイル
```

## ソースコード構造 (src/)

### 1. エントリーポイント
```
src/
├── main.tsx                     # アプリケーションエントリーポイント
├── App.tsx                      # メインアプリケーションコンポーネント
├── App.css                      # グローバルスタイル
├── index.css                    # ベースCSS
├── vite-env.d.ts               # Vite型定義
└── setupTests.ts               # Jest設定
```

### 2. 教材ディレクトリ (materials/) 【最重要】

#### 2.1 学年別階層構造 【厳守】
```
materials/
├── elementary/                  # 小学校
│   ├── grade1/                 # 1年生
│   ├── grade3/                 # 3年生
│   ├── grade4/                 # 4年生
│   └── grade5/                 # 5年生
├── junior-high/                # 中学校
│   ├── grade1/                 # 中学1年生
│   └── grade2/                 # 中学2年生
└── unified/                    # 統合教材
    └── graph/                  # グラフツール群
```

#### 2.2 教科別分類 【厳守】
```
grade[X]/
├── math/                       # 算数・数学
├── science/                    # 理科
├── english/                    # 英語
├── social/                     # 社会
└── integrated/                 # 総合学習
```

#### 2.3 教材内部構造 【標準テンプレート】
```
[MaterialName]/
├── index.tsx                   # エクスポート用インデックス
├── [MaterialName].tsx          # メインコンポーネント
├── README.md                   # 教材説明・使用方法
├── components/                 # 子コンポーネント
│   ├── [Component1].tsx
│   ├── [Component2].tsx
│   └── index.ts               # コンポーネントエクスポート
├── hooks/                     # カスタムフック
│   ├── use[MaterialName].ts
│   └── index.ts
├── data/                      # 静的データ
│   └── [materialName]Data.ts
├── types.ts                   # 型定義
└── utils/                     # ユーティリティ関数
    └── [utility].ts
```

### 3. 共通コンポーネント (components/) 【汎用】

#### 3.1 UI基本コンポーネント
```
components/
├── common/                     # 基本UIコンポーネント
│   ├── Button/
│   ├── Card/
│   ├── GradeSelector/
│   ├── LearningAssistant/
│   ├── LearningMetrics/
│   ├── ThemeProvider/
│   └── index.ts
├── layout/                     # レイアウトコンポーネント
│   ├── Header/
│   ├── Layout/
│   └── index.ts
└── educational/               # 教育特化コンポーネント
    ├── Canvas/
    ├── DraggableObject/
    ├── KonvaCanvas/
    ├── MaterialBase/
    └── index.ts
```

#### 3.2 機能別コンポーネント
```
components/
├── admin/                      # 管理者用
│   └── MaterialSettingsPanel.tsx
├── dashboard/                  # ダッシュボード
│   └── ProgressDashboard.tsx
├── gamification/              # ゲーミフィケーション
│   └── GamificationDashboard.tsx
├── mouse-practice/            # マウス練習機能
│   ├── MouseTracker.tsx
│   ├── MouseSkillDashboard.tsx
│   ├── withMousePractice.tsx
│   └── __tests__/
└── wrappers/                  # ラッパーコンポーネント
    └── MaterialWrapper.tsx
```

### 4. フック (hooks/) 【状態管理】
```
hooks/
├── useInteractive.ts          # インタラクション管理
├── useLearningTracker.ts      # 学習記録
├── useMouseTracker.ts         # マウス操作追跡
├── useTheme.ts               # テーマ管理
└── __tests__/                # フックテスト
    └── useMouseTracker.test.ts
```

### 5. 状態管理 (stores/) 【Zustand】
```
stores/
├── learningStore.ts           # 学習データ
├── materialSettingsStore.ts   # 教材設定
├── mouseSkillStore.ts         # マウススキル
└── __tests__/                # ストアテスト
    └── mouseSkillStore.test.ts
```

### 6. 型定義 (types/) 【TypeScript】
```
types/
├── index.ts                   # メイン型エクスポート
├── material.ts               # 教材関連型
├── user.ts                   # ユーザー関連型
├── api.ts                    # API関連型
└── mouse-practice.ts         # マウス練習型
```

### 7. ユーティリティ (utils/) 【共通関数】
```
utils/
├── constants.ts              # 定数定義
├── materialRegistry.ts       # 教材登録
├── materialMetadata.ts       # 教材メタデータ
└── learningSupport.ts        # 学習支援関数
```

### 8. スタイル (styles/) 【テーマ】
```
styles/
└── themes/
    ├── elementary.ts         # 小学校テーマ
    ├── juniorHigh.ts        # 中学校テーマ
    └── highSchool.ts        # 高校テーマ
```

### 9. アセット (assets/) 【静的ファイル】
```
assets/
├── images/                   # 画像ファイル
├── icons/                   # アイコンファイル
├── sounds/                  # 音声ファイル
└── react.svg               # React logo
```

## ファイル命名規則

### 1. コンポーネントファイル
- **React コンポーネント**: `PascalCase.tsx`
- **フック**: `use[Name].ts`
- **ストア**: `[name]Store.ts`
- **型定義**: `types.ts` または `[name].types.ts`

### 2. ディレクトリ命名
- **コンポーネント**: `PascalCase/`
- **教材**: `PascalCase/`
- **ユーティリティ**: `kebab-case/`
- **一般**: `camelCase/`

### 3. ファイル内容別規則
```
# React コンポーネント
ComponentName.tsx
ComponentName.test.tsx
ComponentName.stories.tsx

# カスタムフック  
useHookName.ts
useHookName.test.ts

# 型定義
types.ts
interfaces.ts

# ユーティリティ
utils.ts
helpers.ts
constants.ts

# データ
data.ts
config.ts
```

## インポート・エクスポート規則

### 1. インポート順序 【厳守】
```typescript
// 1. React関連
import React, { useState, useEffect } from 'react';

// 2. 外部ライブラリ
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

// 3. 内部コンポーネント
import { MaterialWrapper } from '@components/wrappers/MaterialWrapper';

// 4. フック
import { useLearningTracker } from '@hooks/useLearningTracker';

// 5. 型定義
import type { MaterialProps } from '@types/material';

// 6. ユーティリティ
import { calculateProgress } from '@utils/learningSupport';
```

### 2. エクスポート規則
```typescript
// Named export (推奨)
export const MaterialComponent: React.FC<Props> = () => { ... };

// Default export (メインコンポーネントのみ)
const MaterialComponent: React.FC<Props> = () => { ... };
export default MaterialComponent;

// インデックスファイル
export { MaterialComponent } from './MaterialComponent';
export { default } from './MaterialComponent';
```

## テストファイル配置

### 1. テストディレクトリ構造
```
src/
├── components/
│   └── __tests__/             # コンポーネントテスト
├── hooks/
│   └── __tests__/             # フックテスト
├── stores/
│   └── __tests__/             # ストアテスト
└── materials/
    └── [grade]/[subject]/[Material]/
        └── __tests__/         # 教材テスト
```

### 2. テストファイル命名
```
Component.test.tsx            # コンポーネントテスト
useHook.test.ts              # フックテスト
store.test.ts                # ストアテスト
Component.stories.tsx         # Storybook（将来対応）
```

## 設定ファイル配置

### 1. ルート設定ファイル
```
├── package.json             # 依存関係
├── tsconfig.json           # TypeScript設定
├── tsconfig.app.json       # アプリ用TS設定
├── vite.config.ts          # Vite設定
├── jest.config.js          # Jest設定
├── .eslintrc.js           # ESLint設定
├── .prettierrc            # Prettier設定
└── .gitignore             # Git除外設定
```

### 2. 環境設定
```
├── .env                    # 環境変数（除外）
├── .env.example           # 環境変数例
├── .env.local             # ローカル環境変数（除外）
└── .env.production        # 本番環境変数（除外）
```

## パス設定 (tsconfig.json)

### 1. パスマッピング 【必須】
```typescript
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@materials/*": ["src/materials/*"],
      "@hooks/*": ["src/hooks/*"],
      "@stores/*": ["src/stores/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

### 2. 使用例
```typescript
// ❌ 相対パス（禁止）
import { MaterialWrapper } from '../../../components/wrappers/MaterialWrapper';

// ✅ 絶対パス（推奨）
import { MaterialWrapper } from '@components/wrappers/MaterialWrapper';
```

## 新規教材作成手順

### 1. ディレクトリ作成
```bash
# 例: 小学4年生の算数教材
mkdir -p src/materials/elementary/grade4/math/NewMaterial
```

### 2. 必須ファイル作成
```bash
touch src/materials/elementary/grade4/math/NewMaterial/index.tsx
touch src/materials/elementary/grade4/math/NewMaterial/NewMaterial.tsx
touch src/materials/elementary/grade4/math/NewMaterial/README.md
mkdir src/materials/elementary/grade4/math/NewMaterial/components
mkdir src/materials/elementary/grade4/math/NewMaterial/hooks
mkdir src/materials/elementary/grade4/math/NewMaterial/__tests__
```

### 3. テンプレート適用
- MaterialWrapper統合必須
- TDDテスト作成必須
- README.md記載必須
- 型安全性確保必須

## 禁止事項 【厳守】

### 1. 構造変更禁止
- 学年・教科の階層構造変更禁止
- パスマッピング変更禁止
- materials/以下の構造変更禁止

### 2. 命名規則違反禁止
- 小文字ディレクトリ名禁止
- アンダースコア使用禁止（except: __tests__）
- 日本語ディレクトリ名禁止

### 3. ファイル配置違反禁止
- src/以外への実装ファイル配置禁止
- 直接src/への教材配置禁止
- components/への教材特化コンポーネント配置禁止

## バージョン管理

### 1. 対象ファイル
- 全ソースコード (.tsx, .ts, .css)
- 設定ファイル (.json, .js, .md)
- ドキュメント (.md)

### 2. 除外ファイル (.gitignore)
```
node_modules/
dist/
.env
.env.local
coverage/
*.log
.DS_Store
```

---

**重要**: この構造定義は絶対的な制約です。記載された構造・命名規則・配置ルールは、事前承認なしに変更してはいけません。新規教材・機能追加時も、必ずこの定義に従って実装してください。