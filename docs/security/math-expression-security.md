# 数式評価のセキュリティ実装ガイド

## 概要

ウゴウゴラボの教育プラットフォームにおいて、ユーザーが入力する数式を安全に評価するためのセキュリティ実装について説明します。

## 脅威分析

### 1. コード実行脆弱性（XSS）

**リスク**: eval()関数の使用によるリモートコード実行
- 攻撃例: `alert("XSS")`, `window.location="evil.com"`
- 影響: セッションハイジャック、データ漏洩、サイト改ざん

### 2. DoS攻撃

**リスク**: 計算量の多い数式による過負荷
- 攻撃例: 極端に長い数式、無限ループを引き起こす式
- 影響: サーバーリソースの枯渇、応答不能

### 3. データ漏洩

**リスク**: グローバル変数へのアクセス
- 攻撃例: `document.cookie`, `localStorage`
- 影響: 機密情報の漏洩

## 実装されたセキュリティ対策

### 1. eval()の完全排除

**実装方法**:
- math.jsライブラリの`evaluate`関数を使用
- 安全なサンドボックス環境での数式評価

```typescript
// ❌ 危険な実装（使用禁止）
const result = eval(userInput);

// ✅ 安全な実装
const result = evaluate(userInput, { x });
```

### 2. 入力検証（ホワイトリスト方式）

**実装内容**:
- 許可される関数のホワイトリスト定義
- 禁止パターンの検出（JavaScriptキーワード、HTML、etc）
- 入力長制限（200文字）

```typescript
const ALLOWED_FUNCTIONS = [
  'sin', 'cos', 'tan', 'exp', 'log', 'sqrt', 'abs', // etc
];

const FORBIDDEN_PATTERNS = [
  /\b(eval|function|constructor|window|document)\b/gi,
  /[`${}]/g,
  /<[^>]*>/g,
];
```

### 3. エラーハンドリング

**実装内容**:
- すべての例外を捕捉
- エラー時は安全なデフォルト値（0）を返す
- 教育的なエラーメッセージの提供

### 4. スコープ制限

**実装内容**:
- 評価コンテキストを最小限に制限
- 変数は`x`のみアクセス可能
- グローバルオブジェクトへのアクセス不可

## セキュリティユーティリティAPI

### validateMathExpression

数式の安全性を検証します。

```typescript
const result = validateMathExpression("sin(x) + cos(x)");
// result: { isValid: true, sanitized: "sin(x) + cos(x)" }

const dangerous = validateMathExpression("eval('alert(1)')");
// result: { isValid: false, error: "使用できない文字またはキーワードが含まれています" }
```

### createSafeMathFunction

安全な評価関数を生成します。

```typescript
const func = createSafeMathFunction("x^2 + 2*x + 1");
if (func.isValid) {
  const y = func.evaluate(3); // y = 16
}
```

### getEducationalErrorMessage

ユーザーフレンドリーなエラーメッセージを生成します。

```typescript
const message = getEducationalErrorMessage("関数 'foo' は使用できません");
// "関数 'foo' は使用できません。使える関数: sin, cos, exp, log, sqrt など"
```

## テストカバレッジ

### セキュリティテスト

1. **インジェクション攻撃テスト**
   - XSS攻撃パターン
   - コード実行試行
   - HTMLインジェクション

2. **境界値テスト**
   - 最大文字数（200文字）
   - 空入力
   - 特殊文字

3. **関数ホワイトリストテスト**
   - 許可された関数の動作確認
   - 禁止関数の拒否確認

### パフォーマンステスト

- 複雑な数式の評価時間
- メモリ使用量の監視
- 同時実行時の安定性

## 使用例

### CalculusVisualizerでの実装

```typescript
import { createSafeMathFunction } from '../utils/mathSecurity';

const parseFunction = (expr: string) => {
  const safeFunctionResult = createSafeMathFunction(expr);
  
  if (!safeFunctionResult.isValid) {
    setFunctionError(getEducationalErrorMessage(safeFunctionResult.error));
    return (x: number) => 0;
  }
  
  return safeFunctionResult.evaluate;
};
```

## ベストプラクティス

### 1. 常に検証を実施
- ユーザー入力は必ず検証
- 信頼できない入力として扱う

### 2. エラーの適切な処理
- セキュリティエラーの詳細を露出しない
- 教育的なフィードバックを提供

### 3. 定期的な更新
- math.jsライブラリの最新版を使用
- セキュリティパッチの適用

### 4. ログ記録
- 不正な入力の記録（個人情報は除く）
- 攻撃パターンの分析

## 監査チェックリスト

- [ ] eval()関数が使用されていないことを確認
- [ ] すべての数式入力が検証されている
- [ ] エラーハンドリングが適切に実装されている
- [ ] テストカバレッジが80%以上
- [ ] ドキュメントが最新状態
- [ ] セキュリティ更新が適用されている

## 今後の改善案

1. **CSP（Content Security Policy）の強化**
   - `'unsafe-eval'`の完全排除
   - より厳格なポリシー設定

2. **レート制限**
   - 短時間での大量リクエスト防止
   - ユーザーごとの制限

3. **監視強化**
   - 異常なパターンの検出
   - リアルタイムアラート

## 関連ドキュメント

- [技術スタック定義書](../../technologystack.md)
- [セキュリティガイドライン](./security-guidelines.md)
- [math.js公式ドキュメント](https://mathjs.org/docs/expressions/security.html)