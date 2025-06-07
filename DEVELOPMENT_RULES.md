# 開発ルール - エラー再発防止のために

## 🔴 TypeScript インターフェースのインポート規則【必須】

### 問題の背景
Viteを使用したReact + TypeScriptプロジェクトでは、インターフェースや型定義のインポートで頻繁にランタイムエラーが発生します。

```
Uncaught SyntaxError: The requested module does not provide an export named 'InterfaceName'
```

### 原因
- TypeScriptのインターフェースは型定義であり、JavaScriptにトランスパイルされると消える
- Viteは開発時にTypeScriptを直接実行するため、型のインポートを正しく処理できない場合がある

### 解決策：型インポートの使用【必須】

#### ❌ 間違った方法
```typescript
// これはランタイムエラーを引き起こす可能性がある
import { SomeInterface, someFunction } from './module';
```

#### ✅ 正しい方法
```typescript
// 値と型を分けてインポートする
import { someFunction } from './module';
import type { SomeInterface } from './module';
```

または

```typescript
// 型のみをインポートする場合
import type { SomeInterface, AnotherInterface } from './module';
```

### チェックリスト

新しいコンポーネントやモジュールを作成する際は、必ず以下を確認：

- [ ] インターフェースのインポートには `import type` を使用しているか
- [ ] 値（関数、定数、クラス）と型を同じimport文で混在させていないか
- [ ] エクスポート側でも `export type` を適切に使用しているか

### 具体例

```typescript
// data/types.ts
export interface User {
  id: string;
  name: string;
}

export const defaultUser: User = {
  id: '0',
  name: 'Guest'
};

// components/UserProfile.tsx
// ✅ 正しい
import { defaultUser } from '../data/types';
import type { User } from '../data/types';

// ❌ 間違い - ランタイムエラーの可能性
import { User, defaultUser } from '../data/types';
```

### Material-UI (MUI) の型インポート

MUIの型定義も同様に`import type`を使用する必要があります：

```typescript
// ✅ 正しい
import { Select, MenuItem, FormControl } from '@mui/material';
import type { SelectChangeEvent, ButtonProps } from '@mui/material';

// ❌ 間違い - ランタイムエラー
import { Select, MenuItem, SelectChangeEvent } from '@mui/material';
```

よく使用されるMUIの型定義：
- `SelectChangeEvent` - Selectコンポーネントのchange event
- `ButtonProps` - Buttonコンポーネントのprops
- `Theme` - MUIのテーマ型
- `SxProps` - sx propの型定義

### ESLintルールの推奨設定

`.eslintrc.js`に以下を追加することを推奨：

```javascript
{
  rules: {
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      disallowTypeAnnotations: true
    }]
  }
}
```

## 開発フロー

1. **新機能実装前**
   - 既存のパターンを確認
   - 型定義は `import type` を使用

2. **実装中**
   - `pnpm run dev` で常に動作確認
   - ブラウザのコンソールでエラーチェック

3. **実装後**
   - 必ず実際にブラウザで機能を開いて動作確認
   - エラーが出た場合は即座に型インポートを確認

## その他の注意事項

- **相対パスの使用**: `@/` エイリアスよりも相対パスを優先（エラーの原因を減らすため）
- **デフォルトエクスポートの回避**: 名前付きエクスポートを使用
- **バレルインデックスの慎重な使用**: 循環参照を避ける