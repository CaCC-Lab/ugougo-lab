# モバイル動作確認チェックリスト

作成日: 2025年1月22日
Phase 1 Week 1-2タスク

## 確認項目

### 基本動作確認
- [ ] 教材が正しく表示される
- [ ] タッチ操作が適切に反応する
- [ ] スクロールが正常に動作する
- [ ] 画面回転時にレイアウトが崩れない

### レスポンシブデザイン
- [ ] 小画面（スマートフォン）での表示
- [ ] 中画面（タブレット）での表示
- [ ] 文字サイズが適切
- [ ] ボタンが指で押しやすいサイズ

### インタラクション
- [ ] タップ/クリックの反応速度
- [ ] ドラッグ&ドロップ（該当する場合）
- [ ] ピンチズーム（必要な場合）
- [ ] スワイプ操作（該当する場合）

### パフォーマンス
- [ ] 初回読み込み時間（3秒以内）
- [ ] アニメーションの滑らかさ
- [ ] メモリ使用量が適切
- [ ] バッテリー消費が過度でない

### エラーハンドリング
- [ ] ネットワークエラー時の表示
- [ ] 操作エラー時の適切なフィードバック
- [ ] エラー状態からの復帰

## テスト環境
- iPhone Safari（iOS 15以上）
- Android Chrome（Android 10以上）
- iPad Safari
- Android Tablet Chrome

## 教材リスト（56教材）

### 小学1年生（5教材）
- [ ] number-blocks - 数の合成・分解ブロック
- [ ] addition-subtraction - たし算・ひき算ビジュアライザー
- [ ] clock-learning - 時計の読み方学習ツール
- [ ] hiragana-stroke - ひらがな書き順アニメーション
- [ ] picture-word-matching - 絵と言葉のマッチングゲーム

### 小学2年生（4教材）
- [ ] multiplication - かけ算九九の視覚化
- [ ] unit-converter - 長さ・かさの単位変換ツール
- [ ] plant-growth - 植物の成長シミュレーター
- [ ] town-exploration - 町たんけんマップ

### 小学3年生（6教材）
- [ ] fraction-visualizer - 分数の視覚化
- [ ] fraction-pizza - 分数ピザカッター
- [ ] fraction-master - 分数マスターツール
- [ ] fraction-trainer - 分数計算トレーナー
- [ ] magnet-simulator - 磁石の実験シミュレーター
- [ ] insect-metamorphosis - 昆虫の変態シミュレーター

### 小学4年生（6教材）
- [ ] area-calculator - 面積計算ツール
- [ ] angle-measurement - 角度測定器
- [ ] water-state - 水の三態変化アニメーション
- [ ] electric-circuit - 電気回路シミュレーター
- [ ] prefecture-puzzle - 都道府県パズル
- [ ] abstract-thinking - 抽象的思考への橋

### 小学5年生（5教材）
- [ ] speed-calculator - 速さ・時間・距離の関係シミュレーター
- [ ] pendulum-lab - 振り子の実験装置
- [ ] weather-simulator - 天気の変化シミュレーター
- [ ] industrial-map - 工業地帯マップ
- [ ] percentage-trainer - 割合・百分率トレーナー

### 小学6年生（4教材）
- [ ] proportion-graph - 比例・反比例グラフツール
- [ ] combination-counter - 場合の数シミュレーター
- [ ] lever-principle - てこの原理実験器
- [ ] human-body - 人体の仕組みアニメーション

### 中学1年生（11教材）
- [ ] number-line - 正負の数の数直線
- [ ] moving-point - 動く点P - 三角形の面積変化
- [ ] algebraic-expression - 文字式変形ツール
- [ ] algebra-intro - 代数入門システム
- [ ] equation-builder - 一次方程式ビルダー
- [ ] light-refraction - 光の屈折実験器
- [ ] seismic-wave - 地震波シミュレーター
- [ ] english-speaking-practice - 英語スピーキング練習システム
- [ ] pronunciation - 発音練習ツール
- [ ] time-difference - 時差計算ツール
- [ ] decimal-master - 小数マスター

### 中学2年生（6教材）
- [ ] linear-function - 一次関数グラフ描画ツール
- [ ] proof-builder - 証明ステップビルダー
- [ ] molecular-structure - 原子・分子構造シミュレーション
- [ ] chemical-reaction - 化学反応シミュレーター
- [ ] element-puzzle - 元素記号パズルゲーム
- [ ] circuit-ohm - 電流・電圧・抵抗の関係実験器

### 中学3年生（5教材）
- [ ] quadratic-function - 二次関数グラフ変形ツール
- [ ] sorting-algorithm - ソートアルゴリズム可視化
- [ ] inertia-simulation - 慣性の法則シミュレーション
- [ ] celestial-motion - 天体の動きシミュレーター
- [ ] compass-simulator - 方位磁針シミュレーター

### 高校1年生（3教材）
- [ ] function-graph - 関数グラフ動的描画ツール
- [ ] trigonometric-graph - 三角関数グラフ描画ツール
- [ ] typing-game - ぷよぷよ風タイピングゲーム

### 高校2年生（1教材）
- [ ] calculus-visualizer - 微分積分ビジュアライザー

## 問題の分類

### 🔴 重大な問題（Critical）
- 教材が全く表示されない
- 操作が全くできない
- アプリがクラッシュする

### 🟡 中程度の問題（Major）
- 一部の機能が動作しない
- レイアウトが大きく崩れる
- パフォーマンスが著しく低い

### 🟢 軽微な問題（Minor）
- 見た目の微調整が必要
- 一部のアニメーションが最適でない
- 改善の余地がある程度

## テスト結果記録フォーマット
```
教材ID: [ID]
教材名: [名前]
テスト環境: [iPhone/Android/iPad/Android Tablet]
問題レベル: [Critical/Major/Minor/None]
詳細: [具体的な問題の説明]
スクリーンショット: [必要に応じて]
推奨対応: [修正案]
```