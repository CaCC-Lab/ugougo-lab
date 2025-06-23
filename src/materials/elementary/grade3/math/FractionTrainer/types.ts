/**
 * 分数計算トレーナーの型定義
 * 
 * 設計思想：
 * - 分数を視覚的・直感的に理解できる表現
 * - 段階的な学習プロセスの構築
 * - 実生活との関連を重視
 * - 誤答パターンの分析と個別指導
 */

/**
 * 分数の表現
 */
export interface Fraction {
  numerator: number;    // 分子
  denominator: number;  // 分母
  isNegative?: boolean; // 負の分数
  wholeNumber?: number; // 帯分数の整数部分
}

/**
 * 学習モード
 */
export type LearningMode = 
  | 'concept'         // 概念理解：分数とは何か
  | 'representation'  // 表現：図形での表現、数直線上の位置
  | 'equivalent'      // 等しい分数：約分・通分
  | 'comparison'      // 大小比較
  | 'addition'        // 足し算
  | 'subtraction'     // 引き算
  | 'multiplication'  // かけ算
  | 'division'        // わり算
  | 'mixed'           // 帯分数と仮分数
  | 'application';    // 応用問題

/**
 * 視覚的表現タイプ
 */
export type VisualizationType = 
  | 'circle'          // 円グラフ
  | 'rectangle'       // 長方形
  | 'numberLine'      // 数直線
  | 'blocks'          // ブロック
  | 'liquid'          // 液体（ビーカー）
  | 'pizza';          // ピザ（日常的な例）

/**
 * 問題タイプ
 */
export type ProblemType = 
  | 'identify'        // 分数の識別
  | 'create'          // 分数の作成
  | 'simplify'        // 約分
  | 'expand'          // 通分
  | 'compare'         // 比較
  | 'calculate'       // 計算
  | 'convert'         // 変換（帯分数⇔仮分数）
  | 'word';           // 文章題

/**
 * 問題データ
 */
export interface FractionProblem {
  id: string;
  mode: LearningMode;
  type: ProblemType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  
  // 問題内容
  title: string;
  description: string;
  question: string;
  
  // 問題に含まれる分数
  fractions: Fraction[];
  
  // 正解
  answer: {
    fraction?: Fraction;
    fractions?: Fraction[];
    comparison?: '<' | '>' | '=';
    boolean?: boolean;
    number?: number;
  };
  
  // 視覚的表現
  visualization?: {
    type: VisualizationType;
    settings?: Record<string, unknown>;
  };
  
  // ヒント
  hints: string[];
  
  // 解法ステップ
  solutionSteps?: SolutionStep[];
  
  // タグ
  tags: string[];
}

/**
 * 解法ステップ
 */
export interface SolutionStep {
  id: string;
  stepNumber: number;
  description: string;
  
  // このステップでの操作
  operation?: {
    type: 'simplify' | 'expand' | 'calculate' | 'convert' | 'visualize';
    from: Fraction | Fraction[];
    to: Fraction | Fraction[];
    explanation: string;
  };
  
  // 視覚的説明
  visual?: {
    type: VisualizationType;
    highlight?: string[];
  };
  
  isKeyStep?: boolean;
}

/**
 * 計算履歴
 */
export interface CalculationHistory {
  id: string;
  timestamp: string;
  problem: FractionProblem;
  userAnswer: Fraction | Fraction[] | string;
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
  mistakes?: MistakeType[];
}

/**
 * 間違いのタイプ
 */
export type MistakeType = 
  | 'commonDenominator'    // 通分忘れ
  | 'simplification'       // 約分忘れ
  | 'calculation'          // 計算ミス
  | 'conceptual'           // 概念的誤解
  | 'conversion'           // 変換ミス
  | 'sign'                 // 符号ミス
  | 'order'                // 順序ミス
  | 'interpretation';      // 問題の解釈ミス

/**
 * 視覚的要素
 */
export interface VisualElement {
  id: string;
  type: 'shape' | 'number' | 'text' | 'line' | 'arrow';
  position: { x: number; y: number };
  size?: { width: number; height: number };
  color: string;
  content?: string | number;
  fraction?: Fraction;
  isHighlighted?: boolean;
  isDraggable?: boolean;
  animation?: {
    type: 'fade' | 'slide' | 'scale' | 'rotate';
    duration: number;
    delay?: number;
  };
}

/**
 * ドラッグ＆ドロップ状態
 */
export interface DragDropState {
  isDragging: boolean;
  draggedItem: VisualElement | null;
  dropTarget: string | null;
  isValidDrop: boolean;
  preview?: {
    fraction: Fraction;
    position: { x: number; y: number };
  };
}

/**
 * 学習進捗
 */
export interface FractionProgress {
  currentMode: LearningMode;
  completedModes: LearningMode[];
  
  // スキル習得状況
  skills: {
    basicConcept: boolean;        // 基本概念の理解
    visualization: boolean;       // 視覚的理解
    simplification: boolean;      // 約分
    commonDenominator: boolean;   // 通分
    comparison: boolean;          // 大小比較
    addition: boolean;            // 足し算
    subtraction: boolean;         // 引き算
    multiplication: boolean;      // かけ算
    division: boolean;            // わり算
    mixedNumbers: boolean;        // 帯分数
    wordProblems: boolean;        // 文章題
  };
  
  // 統計情報
  statistics: {
    totalProblems: number;
    correctAnswers: number;
    byMode: Record<LearningMode, {
      attempted: number;
      correct: number;
      averageTime: number;
    }>;
    byDifficulty: Record<number, {
      attempted: number;
      correct: number;
    }>;
  };
  
  // よくある間違い
  commonMistakes: {
    type: MistakeType;
    count: number;
    lastOccurred: string;
    examples: string[];
  }[];
  
  // 習熟度
  mastery: {
    conceptUnderstanding: number;  // 概念理解（0-100）
    calculationSkill: number;      // 計算技能（0-100）
    applicationAbility: number;    // 応用力（0-100）
    overall: number;              // 総合（0-100）
  };
  
  // 追加プロパティ
  achievements: Achievement[];
  studyTime: {
    total: number;
    today: number;
    streak: number;
  };
  recommendations: string[];
  adaptiveDifficulty: 'easy' | 'normal' | 'hard';
  hintsUsed: number;
  lastUpdated: number;
  
  timeSpent: number;
  lastAccessed: string;
}

/**
 * アニメーション設定
 */
export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';
  delay?: number;
  repeat?: number;
}

/**
 * フィードバック
 */
export interface FeedbackMessage {
  type: 'success' | 'error' | 'hint' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  suggestion?: string;
  visual?: {
    type: 'confetti' | 'stars' | 'checkmark' | 'arrow';
    duration: number;
  };
}

/**
 * 分数計算機の設定
 */
export interface CalculatorConfig {
  // 表示設定
  showSteps: boolean;           // 計算過程を表示
  showVisuals: boolean;         // 視覚的表現を表示
  autoSimplify: boolean;        // 自動約分
  
  // 入力設定
  allowMixedNumbers: boolean;   // 帯分数を許可
  allowNegatives: boolean;      // 負の分数を許可
  maxValue: number;            // 最大値
  
  // 学習設定
  difficulty: 'easy' | 'normal' | 'hard';
  hintLevel: 'none' | 'minimal' | 'detailed';
  
  // アニメーション
  animationSpeed: 'slow' | 'normal' | 'fast';
  enableEffects: boolean;
}

/**
 * 実生活の文脈
 */
export interface RealWorldContext {
  id: string;
  category: 'cooking' | 'construction' | 'time' | 'money' | 'sports' | 'art';
  title: string;
  description: string;
  image?: string;
  relatedProblems: string[];
}

/**
 * インタラクティブツール
 */
export interface InteractiveTool {
  type: 'ruler' | 'protractor' | 'calculator' | 'visualizer';
  isActive: boolean;
  position?: { x: number; y: number };
  settings: Record<string, unknown>;
}

/**
 * 達成バッジ
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: {
    type: 'problems' | 'accuracy' | 'streak' | 'mastery' | 'speed';
    target: number;
    mode?: LearningMode;
  };
  unlockedAt?: string;
  progress: number;
}

/**
 * ゲーミフィケーション要素
 */
export interface GameElement {
  points: number;
  level: number;
  streak: number;
  badges: Achievement[];
  dailyGoal: {
    target: number;
    current: number;
    completed: boolean;
  };
}

/**
 * 分数の操作結果
 */
export interface FractionOperation {
  type: 'add' | 'subtract' | 'multiply' | 'divide';
  operand1: Fraction;
  operand2: Fraction;
  result: Fraction;
  steps: {
    description: string;
    fractions: Fraction[];
  }[];
}

/**
 * 検証結果
 */
export interface ValidationResult {
  isCorrect: boolean;
  userAnswer: Fraction | string;
  correctAnswer: Fraction | string;
  feedback: FeedbackMessage;
  mistakeType?: MistakeType;
  partialCredit?: number;
  nextSteps?: string[];
}