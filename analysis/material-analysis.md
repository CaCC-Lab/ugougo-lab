# 教材分析レポート（2025年6月29日更新）

## 概要
現在システムには**56個**の教材が登録されています（materialMetadata.tsベース）。
※ materialRegistry.tsには88個の教材が登録されていますが、実際に実装されているのは56個です。

## 教材統計

### ステータス別
- **published（公開済み）**: 22教材
- **testing（テスト中）**: 34教材
- **development（開発中）**: 0教材

### 学年別分布
- 小学1年生: 5教材
- 小学2年生: 4教材
- 小学3年生: 8教材（分数関連が4教材）
- 小学4年生: 6教材
- 小学5年生: 5教材
- 小学6年生: 4教材
- 中学1年生: 10教材
- 中学2年生: 6教材
- 中学3年生: 4教材
- 高校1年生: 3教材
- 高校2年生: 1教材
- 高校3年生: 0教材

### 教科別分布
- 算数: 16教材
- 数学: 11教材
- 理科: 16教材
- 国語: 2教材
- 英語: 2教材
- 社会: 4教材
- 生活科: 2教材
- 情報: 2教材
- 総合: 1教材

### カテゴリー別
- **simulation（シミュレーション）**: 16教材
- **visualization（視覚化）**: 14教材
- **practice（練習）**: 9教材
- **tool（ツール）**: 8教材
- **interactive（インタラクティブ）**: 5教材
- **game（ゲーム）**: 4教材

### モジュールタイプ別
- **component**: 47教材（旧アーキテクチャ）
- **material**: 9教材（新アーキテクチャ）

## 重複・類似の可能性がある教材グループ

### 1. 分数関連教材（小学3年生）
- **fraction-visualization**: 分数の視覚化（component, testing）
- **fraction-pizza**: 分数ピザカッター（component, testing）
- **fraction-master**: 分数マスターツール（material, testing）
- **fraction-trainer**: 分数計算トレーナー（material, published）
- **fraction-master-lab**: 分数マスターラボ（新アーキテクチャ、ファイルは存在するがmaterialMetadata未登録）

これらはすべて分数を扱う教材で、機能に重複がある可能性が高いです。特にFractionMasterLabは統合計画で予定されていた統合教材のプロトタイプの可能性があります。

### 2. 電気回路関連教材
- **electric-circuit（小学4年生）**: 電気回路シミュレーター
- **electricity-experiment（中学2年生）**: 電流・電圧・抵抗の関係実験器

学年は異なりますが、電気回路を扱う点で関連性があります。

### 3. 関数グラフ関連教材
- **proportion-graph（小学6年生）**: 比例・反比例グラフツール（component, testing）
- **linear-function（中学2年生）**: 一次関数グラフ描画ツール（component, testing）
- **quadratic-function（中学3年生）**: 二次関数グラフ変形ツール（component, testing）
- **function-graph（高校1年生）**: 関数グラフ動的描画ツール（component, testing）
- **trigonometric-function（高校1年生）**: 三角関数グラフ描画ツール（component, testing）

これらはすべてグラフ描画機能を持つ教材で、学年進行に応じた統合が可能です。

### 4. 地理・地図関連教材
- **town-exploration-map（小学2年生）**: 町たんけんマップ
- **compass-simulator（小学3年生）**: 方位磁針シミュレーター
- **prefecture-puzzle（小学4年生）**: 都道府県パズル
- **industrial-zone-map（小学5年生）**: 工業地帯マップ
- **time-zone-calculator（中学1年生）**: 時差計算ツール

地理や地図に関連する教材グループです。

### 5. 英語学習関連教材（中学1年生）
- **english-speaking-practice**: 英語スピーキング練習システム（material, published）
- **pronunciation-practice**: 発音練習ツール（material, published）

両方とも英語の発音・スピーキングに関する教材で、統合の余地があります。

### 6. 計算・数値操作関連教材
- **addition-subtraction（小学1年生）**: たし算・ひき算ビジュアライザー（component, published）
- **number-blocks（小学1年生）**: 数の合成・分解ブロック（component, published）
- **multiplication（小学2年生）**: かけ算九九の視覚化（component, testing）

基本的な計算を扱う教材で、統合して段階的学習が可能です。

### 7. 理科実験シミュレーター群
- **magnet-experiment（小学3年生）**: 磁石の実験シミュレーター
- **water-state（小学4年生）**: 水の三態変化アニメーション
- **pendulum-experiment（小学5年生）**: 振り子の実験装置
- **lever-principle（小学6年生）**: てこの原理実験器
- **light-refraction（中学1年生）**: 光の屈折実験器
- **inertia-simulation（中学3年生）**: 慣性の法則シミュレーション

物理現象のシミュレーターグループです。

### 8. 化学関連教材（中学2年生）
- **atom-molecule**: 原子・分子構造シミュレーション（component, testing）
- **chemical-reaction**: 化学反応シミュレーター（component, testing）
- **element-puzzle**: 元素記号パズルゲーム（component, testing）

化学を扱う教材グループで、連携強化が有効です。

## 統合・削除の候補

### 高優先度の統合候補
1. **分数関連教材**: 
   - 統合対象: fraction-visualization, fraction-pizza, fraction-master, fraction-trainer
   - 方針: FractionMasterLabがすでに統合教材として存在している可能性があるため、現状を確認後、重複を解消
   - 期待効果: 4教材→1教材に統合

2. **英語学習教材**: 
   - 統合対象: english-speaking-practice, pronunciation-practice
   - 方針: スピーキングと発音を統合した総合的な英語音声学習システムに
   - 期待効果: 2教材→1教材に統合

3. **関数グラフツール**: 
   - 統合対象: proportion-graph, linear-function, quadratic-function, function-graph, trigonometric-function
   - 方針: 学年進行に応じて機能が解放される統一的なグラフツールに
   - 期待効果: 5教材→1教材に統合

### 中優先度の統合候補

4. **電気回路教材**: 
   - 統合対象: electric-circuit（小4）, electricity-experiment（中2）
   - 方針: 小学生向けと中学生向けの機能を統合し、難易度選択を実装
   - 期待効果: 2教材→1教材に統合

5. **計算・数値操作教材**: 
   - 統合対象: addition-subtraction, number-blocks, multiplication
   - 方針: 小学低学年向けの総合的な計算学習ツールに
   - 期待効果: 3教材→1教材に統合

### 低優先度の統合候補（連携強化を推奨）

6. **化学関連教材**: 
   - 対象: atom-molecule, chemical-reaction, element-puzzle
   - 方針: 各教材の特色を活かした連携強化
   - 教材間の相互誘導システムを実装

7. **地理・地図関連**: 
   - 対象: town-exploration-map, compass-simulator, prefecture-puzzle, industrial-zone-map, time-zone-calculator
   - 方針: 学年差が大きいため個別維持し、シリーズとしてグループ化

8. **理科実験シミュレーター**: 
   - 物理現象系（pendulum, lever-principle, light-refraction, inertia）のみ統合を検討
   - その他は各実験の特性が異なるため個別維持

### 削除候補教材

以下は類似機能が他にあるか、学習効果が限定的と判断：

1. **picture-word-matching（小1）**: ひらがな学習に統合可能
2. **sorting-algorithm（中3）**: 情報科目の整理時に再検討
3. **typing-puyo（高1）**: ゲーム要素が強く、教育効果が限定的

## 統合後の予想教材数

- 現在: 56教材
- 統合による削減: -14教材（分数-3, 英語-1, グラフ-4, 電気-1, 計算-2, 理科実験-3）
- 新規統合教材: +5教材
- 削除: -3教材
- **最終: 44教材**（約21%削減）

## 実装優先順位

### Phase 1（最優先・1週間以内）
1. 分数関連教材の統合（FractionMasterLabの現状確認と活用）
2. 英語学習教材の統合
3. 関数グラフツールの統合

### Phase 2（2週間以内）
4. 電気回路教材の統合
5. 計算・数値操作教材の統合
6. 理科実験ラボの部分統合

### Phase 3（3週間以内）
7. 削除教材の処理
8. 連携強化システムの実装
9. UIの統一とナビゲーション改善

## 次のステップ
1. FractionMasterLabの現状確認と他の分数教材との統合方法の決定
2. 各統合教材の詳細設計とモード分け
3. 削除教材の機能を他教材に統合する方法の検討