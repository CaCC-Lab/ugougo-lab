/**
 * 割合・百分率トレーナーの型定義
 * 
 * 設計思想：
 * - 割合の3要素（もとにする量、比べる量、割合）を明確に
 * - 百分率、歩合、小数、分数の相互変換を考慮
 * - 実生活での応用を重視した問題設計
 * - 視覚的理解を促進するグラフ表現
 */

/**
 * 学習モード
 */
export type LearningMode = 
  | 'concept'          // 概念理解：割合とは何か
  | 'calculation'      // 計算練習：3要素の相互計算
  | 'conversion'       // 変換練習：百分率⇔小数⇔分数⇔歩合
  | 'graph'            // グラフ表現：円グラフ、棒グラフ、帯グラフ
  | 'comparison'       // 比較：複数の割合を比較
  | 'realWorld'        // 実生活応用：割引、税込み、統計など
  | 'advanced';        // 発展：増減率、前年比など

/**
 * 割合の表現形式
 */
export type PercentageFormat = 
  | 'decimal'     // 小数（0.25）
  | 'percentage'  // 百分率（25%）
  | 'fraction'    // 分数（1/4）
  | 'ratio'       // 比（1:3）
  | 'waribun';    // 歩合（2割5分）

/**
 * グラフの種類
 */
export type GraphType = 
  | 'pie'         // 円グラフ
  | 'bar'         // 棒グラフ
  | 'stacked'     // 積み上げ棒グラフ
  | 'line'        // 折れ線グラフ（変化率用）
  | 'donut';      // ドーナツグラフ

/**
 * 割合の基本要素
 */
export interface PercentageElements {
  baseAmount: number;        // もとにする量（基準量）
  compareAmount: number;     // 比べる量
  percentage: number;        // 割合（小数）
  percentageValue: number;   // 百分率（%）
}

/**
 * 割合の問題タイプ
 */
export type ProblemType = 
  | 'findPercentage'    // 割合を求める（比べる量 ÷ もとにする量）
  | 'findCompareAmount' // 比べる量を求める（もとにする量 × 割合）
  | 'findBaseAmount'    // もとにする量を求める（比べる量 ÷ 割合）
  | 'increase'          // 増加率
  | 'decrease'          // 減少率
  | 'compound';         // 複合問題

/**
 * 問題データ
 */
export interface PercentageProblem {
  id: string;
  type: ProblemType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  
  // 問題文
  question: string;
  context?: string;  // 実生活の文脈
  
  // 問題の要素
  given: {
    baseAmount?: number;
    compareAmount?: number;
    percentage?: number;
  };
  
  // 答え
  answer: {
    value: number;
    format: PercentageFormat;
    unit?: string;
  };
  
  // ヒントと解説
  hints: string[];
  explanation: string;
  
  // 視覚的要素
  visualAid?: {
    type: 'image' | 'graph' | 'animation';
    data: unknown;
  };
  
  // タグ
  tags: string[];
}

/**
 * 実生活シナリオ
 */
export interface RealWorldScenario {
  id: string;
  title: string;
  description: string;
  category: 'shopping' | 'statistics' | 'sports' | 'cooking' | 'finance' | 'science';
  
  // シナリオ固有のデータ
  data: {
    items?: ShoppingItem[];
    stats?: StatisticsData[];
    changes?: ChangeData[];
  };
  
  // 関連する問題
  problems: PercentageProblem[];
  
  // 学習目標
  objectives: string[];
}

/**
 * 買い物アイテム（実生活応用用）
 */
export interface ShoppingItem {
  id: string;
  name: string;
  originalPrice: number;
  discountPercentage?: number;
  taxRate?: number;
  quantity?: number;
  icon?: string;
}

/**
 * 統計データ
 */
export interface StatisticsData {
  label: string;
  value: number;
  percentage?: number;
  color: string;
}

/**
 * 変化データ（増減率用）
 */
export interface ChangeData {
  period: string;
  previousValue: number;
  currentValue: number;
  changeRate?: number;
}

/**
 * グラフデータ
 */
export interface GraphData {
  type: GraphType;
  title: string;
  data: StatisticsData[];
  options?: {
    showLegend?: boolean;
    showValues?: boolean;
    showPercentages?: boolean;
    animate?: boolean;
    interactive?: boolean;
  };
}

/**
 * 学習進捗
 */
export interface PercentageProgress {
  currentMode: LearningMode;
  completedModes: LearningMode[];
  
  // 問題別の統計
  problemStats: {
    total: number;
    correct: number;
    byType: Record<ProblemType, { total: number; correct: number }>;
    byDifficulty: Record<number, { total: number; correct: number }>;
  };
  
  // よくある間違い
  commonMistakes: {
    type: 'calculation' | 'concept' | 'conversion' | 'interpretation';
    description: string;
    count: number;
    lastOccurred: string;
  }[];
  
  // 習熟度
  mastery: {
    concept: number;      // 0-100
    calculation: number;  // 0-100
    application: number;  // 0-100
    overall: number;      // 0-100
  };
  
  timeSpent: number; // 秒
  lastAccessed: string;
}

/**
 * アニメーション設定
 */
export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring';
  delay?: number;
  stagger?: number;
}

/**
 * フィードバックメッセージ
 */
export interface FeedbackMessage {
  type: 'success' | 'error' | 'hint' | 'explanation';
  title: string;
  message: string;
  details?: string;
  nextAction?: string;
  visualFeedback?: {
    type: 'confetti' | 'stars' | 'checkmark' | 'graph';
    duration: number;
  };
}

/**
 * 歩合の単位
 */
export interface WaribunUnits {
  wari: number;  // 割（10%）
  bu: number;    // 分（1%）
  rin: number;   // 厘（0.1%）
  mou?: number;  // 毛（0.01%）- 通常は使わない
}

/**
 * 変換ユーティリティの型
 */
export interface ConversionUtils {
  decimalToPercentage: (decimal: number) => number;
  percentageToDecimal: (percentage: number) => number;
  decimalToFraction: (decimal: number) => { numerator: number; denominator: number };
  fractionToDecimal: (numerator: number, denominator: number) => number;
  percentageToWaribun: (percentage: number) => WaribunUnits;
  waribunToPercentage: (waribun: WaribunUnits) => number;
}

/**
 * 設定
 */
export interface PercentageTrainerConfig {
  // 表示設定
  showDecimals: boolean;
  decimalPlaces: number;
  
  // グラフ設定
  defaultGraphType: GraphType;
  animateGraphs: boolean;
  
  // 学習設定
  difficulty: 'easy' | 'normal' | 'hard';
  enableHints: boolean;
  showStepByStep: boolean;
  
  // 音声設定
  enableSound: boolean;
  readProblems: boolean;
}