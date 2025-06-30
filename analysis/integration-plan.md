# 教材統合・削除実施計画

## 基本方針（Geminiとの協議結果）

1. **テーマによる統合**: 関連性の高い教材は統合教材にまとめる
2. **レベル/モード選択の導入**: 統合教材内部に学年レベルや学習モードを設ける
3. **学習パスの提示**: 教材間の連携を強化し、自然な誘導を設計

## 統合計画詳細

### A. 最優先統合グループ（実装必須）

#### 1. 分数マスターラボ（新規統合教材）
**統合対象**:
- fraction-visualization
- fraction-pizza  
- fraction-master
- fraction-trainer

**構成**:
- まなぶモード（概念理解）
- つかうモード（具体操作）
- とっくんモード（計算練習）

**削除**: 上記4教材

#### 2. 統合グラフツール（新規統合教材）
**統合対象**:
- proportion-graph（小6）
- linear-function（中2）  
- quadratic-function（中3）
- trigonometric-function（高1）
- function-graph（高1）

**構成**:
- 学年別モード選択（初期画面）
- 各関数専用UI
- 探求モード（横断的学習）

**削除**: 上記5教材

#### 3. 英語スピーキングジム（新規統合教材）
**統合対象**:
- english-speaking-practice
- pronunciation-practice

**構成**:
- 基礎トレーニング（発音）
- 単語・短文チャレンジ
- 会話シミュレーション

**削除**: 上記2教材

#### 4. 電気回路ラボ（新規統合教材）
**統合対象**:
- electric-circuit（小4）
- electricity-experiment（中2）

**構成**:
- 小学校モード（定性的理解）
- 中学校モード（定量的理解・オームの法則）

**削除**: 上記2教材

### B. 第二優先統合グループ

#### 5. 算数計算マスター（新規統合教材）
**統合対象**:
- addition-subtraction（小1）
- number-blocks（小1）
- multiplication（小2）

**構成**:
- たし算・ひき算モード
- 数の合成・分解モード
- かけ算九九モード
- 総合練習モード

**削除**: 上記3教材

#### 6. 理科実験ラボ（新規統合教材）
**統合対象を物理現象に限定**:
- pendulum-experiment（小5）
- lever-principle（小6）
- light-refraction（中1）
- inertia-simulation（中3）

**個別維持（学習目標が異なるため）**:
- magnet-experiment（小3）→ 電磁気の独立性
- water-state（小4）→ 化学変化の要素

**構成**:
- 学年別実験選択
- 共通の実験記録機能
- データ分析ツール

**削除**: 統合対象の4教材

### C. 連携強化グループ（統合せず）

#### 7. 化学探求シリーズ
**維持教材**:
- element-puzzle（中2）
- atom-molecule（中2）
- chemical-reaction（中2）

**連携設計**:
- 教材間の誘導バナー設置
- 共通の進捗管理
- シリーズとしてグループ表示

#### 8. 地理・社会学習シリーズ  
**維持教材**（学年差が大きいため個別維持）:
- town-exploration-map（小2）
- compass-simulator（小3）
- prefecture-puzzle（小4）
- industrial-zone-map（小5）
- time-zone-calculator（中1）

**連携設計**:
- 学年進行に応じた推薦表示
- 地理系としてグループ化

#### 9. 生命科学シリーズ
**維持教材**:
- plant-growth（小2）
- insect-metamorphosis（小3）
- human-body-animation（小6）

**連携設計**:
- 「生き物の観察」シリーズとして表示

### D. 削除候補教材

以下は類似機能が他にあるか、学習効果が限定的と判断：

1. **picture-word-matching（小1）** → ひらがな学習に統合可能
2. **sorting-algorithm（中3）** → 情報科目の整理時に再検討
3. **typing-puyo（高1）** → ゲーム要素が強く、教育効果が限定的

### E. 単独維持教材（重要度高）

以下は独自性が高く、削除・統合すべきでない：

- clock-learning（小1）
- hiragana-stroke（小1）
- unit-conversion（小2）
- area-calculator（小4）
- angle-measurement（小4）
- speed-time-distance（小5）
- weather-change-simulator（小5）
- combination-simulator（小6）
- algebraic-expression（中1）
- moving-point-p（中1）
- abstract-thinking-bridge（小4）※10歳の壁対策の重要教材
- decimal-master（小3）
- percentage-trainer（小5）
- algebra-introduction（中1）
- earthquake-wave-simulator（中1）
- proof-step-builder（中2）
- calculus-visualizer（高2）

## 実装優先順位

### Phase 1（最優先・1週間以内）
1. 分数マスターラボ
2. 統合グラフツール
3. 英語スピーキングジム
4. 電気回路ラボ

### Phase 2（2週間以内）
5. 算数計算マスター
6. 理科実験ラボ
7. 化学探求シリーズの連携実装

### Phase 3（3週間以内）
8. 削除教材の処理
9. UIの統一とナビゲーション改善
10. プログレッシブ・ディスクロージャーの実装

## 統合後の教材数

- 現在: 51教材
- 統合による削減: -18教材
- 新規統合教材: +6教材
- 削除: -3教材
- **最終: 36教材**（約30%削減）

## UI/UX改善ポイント

1. **ダッシュボードの改善**
   - カード形式で統合教材を大きく表示
   - 対象学年とテーマを明確に表記

2. **段階的表示（プログレッシブ・ディスクロージャー）**
   - 初期画面は基本モードのみ
   - 「もっと詳しく」で高度な機能へ

3. **一貫性のあるデザイン言語**
   - 操作方法の統一
   - 視覚的な一貫性

## 期待される効果

1. **認知負荷の軽減**: 教材選択が簡単に
2. **学習効果の向上**: 段階的学習の実現
3. **探求的学習の促進**: 教材間の自然な連携
4. **10歳の壁対策**: 統合教材による段階的理解