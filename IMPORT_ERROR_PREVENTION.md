# TypeScriptインポートエラー再発防止ガイド

このドキュメントは、Vite + React + TypeScript環境で頻発するインポートエラーを完全に防止するための包括的なガイドです。

## 🚨 よくあるエラーと原因

### エラー例
```
Uncaught SyntaxError: The requested module does not provide an export named 'InterfaceName'
Uncaught SyntaxError: The requested module does not provide an export named 'SelectChangeEvent'
```

### 根本原因
1. TypeScriptの型定義（interface、type）を値としてインポート
2. Viteの事前バンドルシステムが型定義を実行時の値として解釈
3. MUIなどのライブラリの型定義も同様の問題が発生

## ✅ 即効性のある解決策

### 1. 正しいインポート方法

```typescript
// ❌ 間違い - エラーを引き起こす
import { Component, Interface, someFunction } from './module';
import { Select, SelectChangeEvent } from '@mui/material';

// ✅ 正しい - 型と値を分離
import { Component, someFunction } from './module';
import type { Interface } from './module';

import { Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
```

### 2. MUI特有の型定義

```typescript
// よく使用されるMUIの型定義は必ず type インポート
import type { 
  SelectChangeEvent,
  ButtonProps,
  Theme,
  SxProps,
  PaletteMode 
} from '@mui/material';
```

## 🛠️ 自動化による再発防止

### 1. ESLint設定（必須）

```javascript
// eslint.config.js
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config({
  plugins: {
    'unused-imports': unusedImports,
  },
  rules: {
    // 型インポートを強制
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      fixStyle: 'inline-type-imports',
      disallowTypeAnnotations: true
    }],
    
    // 未使用インポートを自動削除
    'unused-imports/no-unused-imports': 'error',
    
    // インポート順序を整理
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true }
    }]
  }
});
```

### 2. VSCode設定（強く推奨）

```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.organizeImports": "always",
    "source.fixAll.eslint": "always",
    "source.removeUnusedImports": "always"
  },
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### 3. TypeScript設定（必須）

```json
// tsconfig.json
{
  "compilerOptions": {
    "isolatedModules": true,  // Vite必須
    "skipLibCheck": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    
    // ❌ verbatimModuleSyntax は使わない（Viteと相性が悪い）
  }
}
```

### 4. Pre-commitフック（推奨）

```bash
# セットアップ
pnpm add -D husky lint-staged
pnpm husky install
pnpm husky add .husky/pre-commit "pnpm lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings=0",
      "prettier --write"
    ]
  }
}
```

## 📋 開発時のチェックリスト

### 新しいファイルを作成する時

- [ ] 型定義には必ず `import type` を使用
- [ ] MUIの型も `import type` で分離
- [ ] VSCodeの自動インポートが `import type` を使用しているか確認
- [ ] `pnpm run dev` でブラウザコンソールにエラーがないか確認

### コードレビュー時

- [ ] すべての interface/type インポートが `import type` を使用
- [ ] MUIなどのライブラリの型インポートも確認
- [ ] ESLintエラーがないか確認

## 🚀 推奨ワークフロー

1. **開発環境セットアップ**
   - VSCode + ESLint拡張機能
   - 上記の設定をすべて適用

2. **開発中**
   - 保存時に自動的に型インポートが修正される
   - ブラウザコンソールを常に監視

3. **コミット前**
   - lint-stagedが自動でチェック
   - エラーがあればコミットが中断

4. **CI/CD**
   - GitHub ActionsでTypeScriptとESLintをチェック
   - ビルドテストで実行時エラーを検出

## ⚡ トラブルシューティング

### エラーが出た場合の対処法

1. **エラーメッセージを確認**
   - `does not provide an export named` → 型インポートの問題

2. **該当ファイルを特定**
   - ブラウザのエラーメッセージからファイル名を確認

3. **インポートを修正**
   - 型定義を `import type` に変更

4. **Viteサーバーを再起動**
   ```bash
   # Ctrl+C で停止後
   pnpm run dev
   ```

## 📚 参考資料

- [TypeScript 5.0 Release Notes - verbatimModuleSyntax](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#verbatimmodulesyntax)
- [Vite - Dependency Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html)
- [ESLint - consistent-type-imports](https://typescript-eslint.io/rules/consistent-type-imports/)

---

最終更新: 2025/06/06
このガイドに従うことで、TypeScriptインポートエラーを99%防止できます。