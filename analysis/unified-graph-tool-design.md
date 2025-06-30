# 統合関数グラフツール（UnifiedGraphTool）設計書

## 概要

UnifiedGraphToolは、小学生から高校生まで幅広い学年で使用できる統合型の関数グラフ学習教材です。
既存の3つのグラフツール（FunctionGraphTool、LinearFunctionGrapher、QuadraticFunctionGraph）を統合し、
段階的学習を可能にする設計となっています。

## 設計理念

### 1. 段階的学習の実現
- 学年に応じた機能の段階的開放
- 基礎から応用まで同一インターフェースで学習可能
- 前の学年の内容を復習しながら新しい概念を導入

### 2. 統一された操作体験
- 一貫した UI/UX デザイン
- 共通のグラフエンジンによる描画
- 学年が上がっても操作方法が変わらない安心感

### 3. 豊富な学習モード
- 自由探索モード
- ガイド付き学習モード
- 問題演習モード
- 実生活応用モード

## ディレクトリ構造

```
src/
├── materials/
│   └── unified/
│       └── graph/
│           ├── UnifiedGraphTool/
│           │   ├── index.tsx                 # メインコンポーネント
│           │   ├── UnifiedGraphTool.tsx      # 統合ツール本体
│           │   ├── types.ts                  # 型定義
│           │   ├── constants.ts              # 定数定義
│           │   ├── config/
│           │   │   ├── gradeConfigs.ts       # 学年別設定
│           │   │   ├── functionConfigs.ts    # 関数種別設定
│           │   │   └── modeConfigs.ts        # モード設定
│           │   ├── components/
│           │   │   ├── GraphCanvas.tsx       # グラフ描画キャンバス
│           │   │   ├── ControlPanel.tsx      # コントロールパネル
│           │   │   ├── FunctionSelector.tsx  # 関数選択UI
│           │   │   ├── ParameterControls.tsx # パラメータ調整UI
│           │   │   ├── ModeSelector.tsx      # モード選択UI
│           │   │   ├── GraphInfo.tsx         # グラフ情報表示
│           │   │   ├── QuizPanel.tsx         # クイズパネル
│           │   │   ├── RealLifePanel.tsx     # 実生活応用パネル
│           │   │   └── AnimationControls.tsx # アニメーション制御
│           │   ├── hooks/
│           │   │   ├── useGraphEngine.ts     # グラフエンジンフック
│           │   │   ├── useGradeLevel.ts      # 学年レベル管理
│           │   │   ├── useAnimation.ts       # アニメーション制御
│           │   │   └── useQuizLogic.ts       # クイズロジック
│           │   ├── utils/
│           │   │   ├── graphEngine.ts        # 共通グラフエンジン
│           │   │   ├── mathCalculations.ts   # 数学計算ユーティリティ
│           │   │   ├── coordinateTransform.ts # 座標変換
│           │   │   └── functionEvaluator.ts  # 関数評価器
│           │   └── styles/
│           │       ├── UnifiedGraphTool.module.css
│           │       └── themes.ts              # テーマ定義
│           └── README.md                      # 教材説明書
```

## 主要コンポーネント設計

### 1. UnifiedGraphTool（メインコンポーネント）

```typescript
interface UnifiedGraphToolProps {
  initialGradeLevel?: GradeLevel;
  onClose?: () => void;
}

interface UnifiedGraphToolState {
  gradeLevel: GradeLevel;
  selectedFunction: FunctionType;
  mode: LearningMode;
  parameters: FunctionParameters;
  displayOptions: DisplayOptions;
  quizState: QuizState;
  animationState: AnimationState;
}
```

### 2. 学年別モード

#### 小学5-6年生モード
- 比例・反比例の基礎
- 簡単な一次関数（y = ax）
- 実生活の例（速さと時間、買い物など）
- ビジュアル重視の説明

#### 中学1年生モード
- 一次関数（y = ax + b）
- 座標の概念
- 変化の割合
- グラフと式の関係

#### 中学2-3年生モード
- 二次関数（y = ax² + bx + c）
- 関数の変形
- 交点の計算
- 応用問題

#### 高校生モード
- 三次関数、指数関数、対数関数
- 三角関数
- 関数の合成
- 微分・積分の導入

### 3. 共通グラフエンジン

```typescript
interface GraphEngine {
  // 初期化
  initialize(canvas: HTMLCanvasElement, options: GraphOptions): void;
  
  // 描画
  drawAxes(): void;
  drawGrid(): void;
  drawFunction(func: MathFunction, style: DrawStyle): void;
  drawPoint(point: Point, style: PointStyle): void;
  drawLine(start: Point, end: Point, style: LineStyle): void;
  
  // 座標変換
  toCanvasCoords(mathCoords: Point): CanvasPoint;
  toMathCoords(canvasCoords: CanvasPoint): Point;
  
  // アニメーション
  animateFunction(from: MathFunction, to: MathFunction, duration: number): void;
  animateParameter(param: string, from: number, to: number, duration: number): void;
  
  // インタラクション
  enablePanning(): void;
  enableZooming(): void;
  getPointOnFunction(x: number, func: MathFunction): Point;
}
```

## 学習モードの詳細

### 1. 自由探索モード
- パラメータを自由に調整
- 複数の関数を同時に表示
- グラフ上の点をクリックして座標を確認
- アニメーションで変化を観察

### 2. ガイド付き学習モード
- ステップバイステップの学習
- 各ステップでのヒント表示
- 進捗の保存と復帰
- 理解度チェック

### 3. 問題演習モード
- グラフから式を求める
- 式からグラフを描く
- 交点や切片を求める
- 難易度自動調整

### 4. 実生活応用モード
- 学年に応じた実例
- シミュレーション機能
- データ入力とグラフ化
- 予測と検証

## 技術的詳細

### 使用技術
- React 18.x with TypeScript
- Material-UI v5
- Canvas API for graph rendering
- React Hooks for state management
- CSS Modules for styling

### パフォーマンス最適化
- Canvas の再描画最小化
- Web Worker での計算処理
- メモ化による計算結果のキャッシュ
- レスポンシブデザイン

## 移行計画

### フェーズ1：既存機能の統合（2週間）
1. 共通グラフエンジンの開発
2. 既存の3つのツールから機能を抽出
3. 統一UIの設計と実装
4. 学年別モードの実装

### フェーズ2：新機能の追加（1週間）
1. ガイド付き学習モードの実装
2. 実生活応用モードの拡充
3. アニメーション機能の強化
4. インタラクティブ機能の追加

### フェーズ3：テストとリリース（1週間）
1. 各学年モードのテスト
2. パフォーマンス最適化
3. アクセシビリティチェック
4. ドキュメント整備

### フェーズ4：旧教材の無効化（1日）
1. materialMetadata.ts の更新
2. 旧教材の enabled: false 設定
3. 新教材の登録
4. リダイレクト設定

## 統合対象教材

### 無効化予定
1. `function-graph`（高校1年）- 関数グラフ動的描画ツール
2. `linear-function`（中学2年）- 一次関数グラフ描画ツール
3. `quadratic-function`（中学3年）- 二次関数グラフ変形ツール

### 関連して統合検討
1. `proportion-graph`（小学6年）- 比例・反比例グラフツール
2. `trigonometric-function`（高校1年）- 三角関数グラフ描画ツール

## materialMetadata.ts への登録準備

```typescript
{
  id: 'unified-graph-tool',
  title: '統合関数グラフ学習ツール',
  description: '小学生から高校生まで使える統合型関数グラフツール。学年に応じた機能で比例から微積分まで段階的に学習できます。',
  gradeLevel: 'unified', // 新しいグレードレベル
  gradeJapanese: '全学年対応',
  subject: 'math',
  subjectJapanese: '数学',
  category: 'tool',
  status: 'development',
  enabled: false, // 完成後にtrueに
  tags: ['統合教材', '関数', 'グラフ', '段階的学習', '重要'],
  difficulty: 'adaptive', // 新しい難易度タイプ
  estimatedTime: 45,
  isPremium: false,
  createdAt: '2025-06-29T00:00:00.000Z',
  updatedAt: '2025-06-29T00:00:00.000Z',
  moduleType: 'material',
}
```

## 今後の拡張性

### 機能拡張
- マルチプレイヤー機能
- クラウド保存機能
- AIアシスタントの統合
- VR/AR対応

### コンテンツ拡張
- ベクトル、行列
- 複素数平面
- 統計グラフ
- 3Dグラフ

## まとめ

UnifiedGraphToolは、学習者の成長に寄り添う統合型教材として、
シームレスな学習体験を提供します。同じツールで小学生から高校生まで
継続的に学習できることで、数学の概念のつながりを深く理解できます。