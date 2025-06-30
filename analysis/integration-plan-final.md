# 教材統合・削除実施計画（最終版）

更新日: 2025年6月29日

## エグゼクティブサマリー

現在56個の教材を44個に削減（21%削減）することで、ユーザビリティの向上と保守性の改善を実現します。

### 主な成果
- **分数教材**: 4教材→1教材（75%削減）
- **関数グラフ**: 5教材→1教材（80%削減）
- **英語学習**: 2教材→1教材（50%削減）
- **削除教材**: 3教材（ゲーム要素の強い教材を除外）

## 詳細統合計画

### 1. 分数マスターラボ（最優先）

#### 統合対象教材
```
- fraction-visualization（視覚化）
- fraction-pizza（インタラクティブ）
- fraction-master（練習）
- fraction-trainer（総合）
```

#### 新教材構成
```typescript
// FractionMasterLab の構成
{
  id: 'fraction-master-lab',
  modules: {
    basic: 'まなぶモード', // fraction-visualization の機能
    interactive: 'つかうモード', // fraction-pizza の機能
    practice: 'とっくんモード', // fraction-master の機能
    comprehensive: '総合学習モード' // fraction-trainer の機能
  }
}
```

#### 実装方針
- FractionMasterLab（すでにファイルが存在）を活用
- 各旧教材の機能をモジュールとして統合
- 学習進度に応じた段階的な機能解放

### 2. 統合グラフツール

#### 統合対象教材
```
- proportion-graph（小6）
- linear-function（中2）
- quadratic-function（中3）
- function-graph（高1）
- trigonometric-function（高1）
```

#### 新教材構成
```typescript
// UnifiedGraphTool の構成
{
  id: 'unified-graph-tool',
  modes: {
    elementary: '比例・反比例モード',
    linear: '一次関数モード',
    quadratic: '二次関数モード',
    advanced: '高度な関数モード',
    trigonometric: '三角関数モード'
  },
  features: {
    progressiveUnlock: true, // 学年に応じた機能解放
    unifiedInterface: true, // 統一されたUI
    crossGradeComparison: true // 学年を超えた比較機能
  }
}
```

### 3. 英語スピーキングジム

#### 統合対象教材
```
- english-speaking-practice
- pronunciation-practice
```

#### 新教材構成
```typescript
// EnglishSpeakingGym の構成
{
  id: 'english-speaking-gym',
  modules: {
    phonetics: '発音基礎トレーニング',
    words: '単語練習',
    phrases: 'フレーズ練習',
    conversation: '会話シミュレーション'
  }
}
```

### 4. 電気回路ラボ

#### 統合対象教材
```
- electric-circuit（小4）
- electricity-experiment（中2）
```

#### 新教材構成
```typescript
// ElectricCircuitLab の構成
{
  id: 'electric-circuit-lab',
  levels: {
    elementary: {
      name: '小学生モード',
      features: ['基本回路', '豆電球', '直列・並列']
    },
    juniorHigh: {
      name: '中学生モード',
      features: ['オームの法則', '電流・電圧・抵抗', 'データ分析']
    }
  }
}
```

### 5. 算数計算マスター

#### 統合対象教材
```
- addition-subtraction（小1）
- number-blocks（小1）
- multiplication（小2）
```

#### 新教材構成
```typescript
// MathCalculationMaster の構成
{
  id: 'math-calculation-master',
  stages: {
    addition: 'たし算ステージ',
    subtraction: 'ひき算ステージ',
    composition: '数の合成・分解ステージ',
    multiplication: 'かけ算九九ステージ',
    comprehensive: '総合練習ステージ'
  }
}
```

## 削除教材リスト

### 1. picture-word-matching（小1）
- **理由**: ひらがな学習教材で代替可能
- **移行先**: hiragana-stroke に語彙機能を追加

### 2. sorting-algorithm（中3）
- **理由**: 情報科目として独立性が低い
- **対応**: 必要に応じて将来的に情報科目パッケージとして再構築

### 3. typing-puyo（高1）
- **理由**: ゲーム要素が強く、教育効果が限定的
- **対応**: 削除（タイピング練習は別途専門ツールを推奨）

## 実装スケジュール

### Week 1: 分数関連統合
- [ ] FractionMasterLab の現状確認
- [ ] 各教材のコア機能の抽出
- [ ] モジュール化と統合
- [ ] テスト実装

### Week 2: グラフ・英語統合
- [ ] UnifiedGraphTool の設計
- [ ] EnglishSpeakingGym の設計
- [ ] 基本機能の実装
- [ ] UI統一

### Week 3: その他統合・削除処理
- [ ] ElectricCircuitLab の実装
- [ ] MathCalculationMaster の実装
- [ ] 削除教材の処理
- [ ] 全体テスト

### Week 4: 最終調整
- [ ] ナビゲーション改善
- [ ] 連携機能の実装
- [ ] ドキュメント更新
- [ ] リリース準備

## 期待される効果

### ユーザビリティ向上
- 教材選択の迷いが減少（56→44教材）
- 関連機能が1つの教材に集約
- 学習パスが明確化

### 開発効率向上
- コードの重複削減
- 保守対象の減少
- 共通機能の一元管理

### 学習効果向上
- 段階的学習の実現
- 総合的な理解の促進
- 学年を超えた継続的学習

## リスクと対策

### リスク1: 既存ユーザーの混乱
**対策**: 
- 移行ガイドの作成
- 旧教材へのリダイレクト設定
- 段階的な移行期間の設定

### リスク2: 機能の複雑化
**対策**: 
- プログレッシブディスクロージャーの採用
- シンプルなデフォルトモード
- 高度な機能は選択式

### リスク3: パフォーマンスの低下
**対策**: 
- 動的インポートの活用
- モジュール単位での遅延読み込み
- キャッシュ戦略の最適化

## 成功指標

- **教材数削減率**: 21%達成
- **コード重複率**: 30%→10%以下
- **ユーザー満足度**: 移行後アンケートで80%以上
- **パフォーマンス**: 初期ロード時間の維持または改善

## 次のアクション

1. **即座に実行**: FractionMasterLab の現状確認と評価
2. **今週中**: 統合計画の技術的実現可能性の検証
3. **来週**: Phase 1（分数統合）の実装開始