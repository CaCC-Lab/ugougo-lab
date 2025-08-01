# 割合・百分率トレーナー

小学5-6年生・中学生向けの割合・百分率学習教材。視覚的・体験的に割合の概念を理解し、実生活で活用できる力を育成します。

## 教材の特徴

### 1. 5段階の学習プログラム
- **概念理解**: 視覚的表現で割合の意味を直感的に理解
- **計算練習**: 3要素（もとにする量、比べる量、割合）の相互計算
- **変換練習**: 百分率⇔小数⇔分数⇔歩合の変換マスター
- **グラフ表現**: 円グラフ、棒グラフ、帯グラフでデータ分析
- **実生活応用**: 買い物、統計、スポーツなど実際の場面で活用

### 2. 多様な視覚的学習ツール
- **インタラクティブスライダー**: 割合を動的に調整して理解
- **100マスグリッド**: 百分率を視覚的に表現
- **動的グラフ生成**: データを入力して即座にグラフ化
- **アニメーション**: 変化を滑らかに表示

### 3. 個別最適化機能
- 誤答パターン分析による適応的ヒント
- 習熟度に応じた問題の自動調整
- 段階的なヒント表示（最大3段階）
- 詳細な学習進捗トラッキング

## 技術的特徴

### コンポーネント構成
```
PercentageTrainer/
├── components/
│   ├── VisualPercentage.tsx      # 視覚的割合表現
│   ├── PercentageCalculator.tsx  # 計算練習
│   ├── GraphRepresentation.tsx   # グラフ表現
│   └── RealWorldScenarios.tsx    # 実生活応用
├── hooks/
│   └── usePercentageLogic.ts     # 計算ロジックと状態管理
├── data/
│   └── percentageProblems.ts     # 問題データベース
└── types.ts                      # 型定義
```

### 主要機能
1. **精密な計算処理**: 浮動小数点誤差を考慮した計算
2. **Canvas APIによるグラフ描画**: 高性能な描画処理
3. **レスポンシブ対応**: タブレット・スマートフォンでも快適
4. **プログレッシブ学習**: 段階的な難易度上昇

## 教育的配慮

### 学習指導要領との整合性
- 小学5年生: 百分率の意味と計算
- 小学6年生: 割合の応用、歩合
- 中学生: データ分析、比例関係

### つまずきポイントへの対策
1. **3要素の混同**: 視覚的に役割を明確化
2. **小数と百分率の変換**: 繰り返し練習で定着
3. **実生活との結びつき**: 身近な例題で興味喚起

## 使用方法

```typescript
import PercentageTrainer from '@materials/elementary/grade5/math/PercentageTrainer';

// 教材の使用
<PercentageTrainer />
```

## 学習の流れ

### Phase 1: 基礎理解（推奨: 3-5日）
1. 概念理解モードで割合の意味を理解
2. 簡単な計算問題で基本を定着
3. 視覚的ツールで直感的理解を深める

### Phase 2: 計算力向上（推奨: 5-7日）
1. 3要素の計算パターンを習得
2. 変換練習で表現の幅を広げる
3. 速度と正確性を向上

### Phase 3: 応用力育成（推奨: 7-10日）
1. グラフでデータを分析
2. 実生活の問題に挑戦
3. 複合的な問題を解決

## 実装済みの問題タイプ

### 概念理解問題
- 基本的な割合の意味（全体と部分）
- 視覚的表現との対応
- 日常的な例での理解

### 計算問題
- 割合を求める（比べる量 ÷ もとにする量）
- 比べる量を求める（もとにする量 × 割合）
- もとにする量を求める（比べる量 ÷ 割合）
- 増減率の計算

### 変換問題
- 小数 → 百分率
- 分数 → 百分率
- 歩合 → 百分率
- 相互変換

### 実生活問題
- 買い物（割引、税込み計算）
- 統計（アンケート結果の分析）
- スポーツ（勝率、成功率）
- 料理（分量の調整）

## カスタマイズオプション

### 設定可能項目
- 小数点以下の表示桁数
- グラフのアニメーション有無
- ヒントの表示レベル
- 問題の難易度
- 音声読み上げ機能

### 拡張可能な機能
- 新しい実生活シナリオの追加
- カスタム問題セットの作成
- 成績レポートの生成
- 他教科との連携問題

## 今後の拡張予定

1. **音声ガイダンス**: 問題文と解説の読み上げ
2. **AR機能**: 実物を使った割合学習
3. **協調学習モード**: クラスで結果を共有
4. **AI個別指導**: 学習パターンに基づく最適化

## 開発者向け情報

### 問題追加方法
```typescript
// percentageProblems.ts に新しい問題を追加
export const newProblems: PercentageProblem[] = [
  createProblem(
    'new-1',
    'findPercentage',
    '新しい問題文',
    { baseAmount: 100, compareAmount: 25 },
    25,
    2,
    ['ヒント1', 'ヒント2']
  )
];
```

### グラフタイプの追加
```typescript
// GraphRepresentation.tsx に新しいグラフ描画関数を追加
const drawNewChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  // カスタムグラフの描画ロジック
};
```