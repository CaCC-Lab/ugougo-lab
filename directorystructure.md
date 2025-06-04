# ディレクトリ構造定義書

このドキュメントは、プロジェクトのディレクトリ構造と各ディレクトリの役割を定義します。
新しいファイルを作成する際は、必ずこの構造に従ってください。

## ルート構造

```
InteractiveLearningMaterialsForStudents/
├── src/                        # ソースコード
├── public/                     # 静的ファイル
├── tests/                      # テストファイル
├── docs/                       # ドキュメント
├── scripts/                    # ビルド・デプロイスクリプト
├── .github/                    # GitHub Actions設定
├── requirements.md             # 要件定義書
├── technologystack.md          # 技術スタック定義書
├── directorystructure.md       # 本ファイル
└── TODO.md                     # タスク管理

```

## src/ 詳細構造

```
src/
├── components/                 # 共通コンポーネント
│   ├── common/                # 汎用UI部品
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── Navigation/
│   ├── educational/           # 教育用共通部品
│   │   ├── Canvas/           # キャンバス操作
│   │   ├── Graph/            # グラフ描画
│   │   ├── Animation/        # アニメーション制御
│   │   └── Interactive/      # インタラクション
│   └── layout/               # レイアウト関連
│       ├── Header/
│       ├── Footer/
│       └── Sidebar/
│
├── materials/                 # 教材本体
│   ├── elementary/           # 小学生向け
│   │   ├── grade1/          # 1年生
│   │   │   ├── math/        # 算数
│   │   │   ├── japanese/    # 国語
│   │   │   └── life/        # 生活
│   │   ├── grade2/
│   │   └── ...
│   ├── junior-high/          # 中学生向け
│   │   ├── grade1/
│   │   │   ├── math/
│   │   │   ├── science/
│   │   │   ├── english/
│   │   │   └── social/
│   │   └── ...
│   └── high-school/          # 高校生向け
│       ├── grade1/
│       │   ├── math/
│       │   ├── physics/
│       │   ├── chemistry/
│       │   ├── biology/
│       │   └── english/
│       └── ...
│
├── features/                  # 機能別モジュール
│   ├── auth/                 # 認証
│   ├── user/                 # ユーザー管理
│   ├── payment/              # 課金
│   ├── analytics/            # 分析
│   └── settings/             # 設定
│
├── hooks/                     # カスタムフック
│   ├── useAuth.ts
│   ├── usePayment.ts
│   ├── useAnalytics.ts
│   └── useMaterial.ts
│
├── stores/                    # 状態管理（Zustand）
│   ├── authStore.ts
│   ├── userStore.ts
│   ├── materialStore.ts
│   └── settingsStore.ts
│
├── services/                  # 外部サービス連携
│   ├── api/                  # API通信
│   ├── firebase/             # Firebase
│   ├── analytics/            # 分析サービス
│   └── payment/              # 決済サービス
│
├── utils/                     # ユーティリティ
│   ├── constants.ts          # 定数定義
│   ├── helpers.ts            # ヘルパー関数
│   ├── validators.ts         # バリデーション
│   └── formatters.ts         # フォーマッター
│
├── styles/                    # グローバルスタイル
│   ├── themes/               # テーマ定義
│   │   ├── elementary.ts     # 小学生向け
│   │   ├── juniorHigh.ts     # 中学生向け
│   │   └── highSchool.ts     # 高校生向け
│   ├── globals.css
│   └── variables.css
│
├── types/                     # TypeScript型定義
│   ├── material.ts
│   ├── user.ts
│   ├── api.ts
│   └── index.ts
│
├── App.tsx                    # ルートコンポーネント
├── main.tsx                   # エントリーポイント
└── vite-env.d.ts             # Vite型定義
```

## 命名規則

### ディレクトリ
- **kebab-case**: 複数単語の場合（例: `junior-high`）
- **小文字のみ**: 単一単語の場合（例: `math`）

### ファイル
- **コンポーネント**: PascalCase（例: `MathBlock.tsx`）
- **フック**: camelCase（例: `useAuth.ts`）
- **ユーティリティ**: camelCase（例: `formatters.ts`）
- **定数**: camelCase（例: `constants.ts`）

### 教材ファイル構造

各教材ディレクトリ内の標準構造：

```
materials/elementary/grade1/math/
├── NumberBlocks/              # 教材名（PascalCase）
│   ├── index.tsx             # エントリーポイント
│   ├── NumberBlocks.tsx      # メインコンポーネント
│   ├── components/           # 教材固有のコンポーネント
│   ├── hooks/                # 教材固有のフック
│   ├── utils/                # 教材固有のユーティリティ
│   ├── styles.module.css     # スタイル
│   └── README.md             # 教材の説明
```

## インポートパス

TypeScriptのパスマッピングを使用：

```typescript
// tsconfig.json のパス設定
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@materials/*": ["src/materials/*"],
      "@features/*": ["src/features/*"],
      "@hooks/*": ["src/hooks/*"],
      "@stores/*": ["src/stores/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

使用例：
```typescript
import { Button } from '@components/common/Button';
import { useAuth } from '@hooks/useAuth';
import { NumberBlocks } from '@materials/elementary/grade1/math/NumberBlocks';
```

## 新規ファイル作成時のチェックリスト

1. [ ] 適切なディレクトリに配置されているか
2. [ ] 命名規則に従っているか
3. [ ] 必要なREADME.mdが含まれているか
4. [ ] インポートパスが正しく設定されているか
5. [ ] 関連するテストファイルが作成されているか

## 禁止事項

1. **ルートディレクトリへの直接配置禁止**
2. **ディレクトリ構造の独自変更禁止**
3. **命名規則の無視禁止**
4. **循環参照の作成禁止**

---

このドキュメントは、プロジェクトの成長に応じて更新されます。
変更が必要な場合は、必ず承認を得てから更新してください。