# 小数マスター

小学3-4年生向けの小数学習教材。視覚的・体験的に小数の概念を理解できる総合学習システムです。

## 教材の特徴

### 1. 段階的学習プログラム
- **概念理解**: 10×10グリッドで小数の視覚的理解
- **位取り学習**: インタラクティブな位取り板で数の構造を理解
- **計算練習**: 筆算形式でたし算・ひき算を練習
- **実生活応用**: 買い物、測定、料理などの実例で学習

### 2. 視覚的学習ツール
- **小数グリッド**: 1を100分割したグリッドで0.01と0.1を理解
- **位取り板**: 百の位から百分の一の位まで操作可能
- **筆算アニメーション**: 計算過程を1ステップずつ表示

### 3. 個別最適化機能
- 誤答パターン分析による適応的ヒント生成
- 学習進度の自動追跡
- 難易度の段階的調整

## 技術的特徴

### コンポーネント構成
```
DecimalMaster/
├── components/
│   ├── DecimalGrid.tsx        # 10×10グリッド表示
│   ├── PlaceValueBoard.tsx    # 位取り板
│   ├── DecimalCalculator.tsx  # 計算練習
│   └── RealWorldExamples.tsx  # 実生活例題
├── hooks/
│   └── useDecimalLogic.ts     # 計算ロジックと状態管理
├── data/
│   └── decimalProblems.ts     # 問題データベース
└── types.ts                   # 型定義
```

### 主要機能
1. **小数の精密計算**: 浮動小数点誤差を回避する実装
2. **アニメーション**: Framer Motionによる滑らかな動作
3. **レスポンシブ対応**: モバイルからデスクトップまで対応
4. **学習履歴保存**: 進捗をLocalStorageに保存

## 教育的配慮

### 学習指導要領との整合性
- 小学3年生: 小数の概念、0.1の理解
- 小学4年生: 小数の計算、日常生活での活用

### つまずきポイントへの対策
1. **位取りの混乱**: 視覚的な位取り板で解決
2. **小数点の位置**: 筆算での縦揃えを強調
3. **概念理解不足**: 具体物（グリッド）での表現

## 使用方法

```typescript
import DecimalMaster from '@materials/elementary/grade3/math/DecimalMaster';

// 教材の使用
<DecimalMaster />
```

## 今後の拡張予定

1. **音声ガイダンス**: 問題文の読み上げ機能
2. **成績レポート**: 学習分析レポートの生成
3. **追加問題**: かけ算・わり算モードの実装
4. **ゲーミフィケーション**: バッジやポイントシステム

## 開発者向け情報

### 問題追加方法
```typescript
// decimalProblems.ts に新しい問題を追加
export const newProblems: DecimalProblem[] = [
  createProblem('addition', 1.5, 2.3, 2, 'ヒント文'),
  // ...
];
```

### カスタマイズ
- 色設定: 各モードの color プロパティを変更
- アニメーション速度: DecimalMasterConfig で調整
- 難易度: difficulty レベルで問題を分類