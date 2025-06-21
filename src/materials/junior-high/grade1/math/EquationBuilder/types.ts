/**
 * 一次方程式ビルダーの型定義
 * 
 * 設計思想：
 * - 等式の性質を天秤のメタファーで視覚的に理解
 * - 移項の概念を動的アニメーションで表現
 * - 段階的な解法プロセスの可視化
 * - 実生活での応用を重視した問題設計
 */

/**
 * 学習モード
 */
export type LearningMode = 
  | 'concept'       // 概念理解：等式の性質、天秤のバランス
  | 'basic'         // 基本：ax = b の形
  | 'intermediate'  // 中級：ax + b = c の形
  | 'advanced'      // 上級：ax + b = cx + d の形
  | 'fraction'      // 分数を含む方程式
  | 'negative'      // 負の数を含む方程式
  | 'wordProblem'   // 文章題
  | 'challenge';    // チャレンジ問題

/**
 * 方程式の項（term）
 */
export interface EquationTerm {
  coefficient: number;  // 係数
  variable?: string;    // 変数（xなど）
  constant?: number;    // 定数項
  isVisible: boolean;   // 表示するかどうか
  color?: string;       // 視覚的識別用の色
}

/**
 * 方程式の表現
 */
export interface Equation {
  id: string;
  leftSide: EquationTerm[];   // 左辺の項
  rightSide: EquationTerm[];  // 右辺の項
  solution: number;           // 解
  originalForm: string;       // 元の式の文字列表現
  standardForm: string;       // 標準形（ax + b = 0）の文字列表現
}

/**
 * 解法のステップ
 */
export interface SolutionStep {
  id: string;
  stepNumber: number;
  description: string;        // このステップの説明
  equation: Equation;         // この段階での方程式
  operation?: Operation;      // 実行した操作
  explanation: string;        // 詳細な説明
  visualHint?: string;        // 視覚的ヒント
  isKeyStep?: boolean;        // 重要なステップかどうか
}

/**
 * 方程式への操作
 */
export interface Operation {
  type: 'add' | 'subtract' | 'multiply' | 'divide' | 'transpose' | 'simplify';
  value?: number;             // 加減乗除の値
  targetSide: 'both' | 'left' | 'right';  // 操作対象
  description: string;        // 操作の説明
}

/**
 * 天秤の状態
 */
export interface BalanceState {
  leftWeight: number;         // 左側の重さ
  rightWeight: number;        // 右側の重さ
  isBalanced: boolean;        // バランスが取れているか
  tiltAngle: number;          // 傾き角度（-45〜45度）
  items: BalanceItem[];       // 天秤に乗っているアイテム
}

/**
 * 天秤のアイテム
 */
export interface BalanceItem {
  id: string;
  side: 'left' | 'right';
  type: 'variable' | 'constant' | 'weight';
  value: number;              // 重さまたは係数
  label: string;              // 表示ラベル（"x", "3x", "5"など）
  position: { x: number; y: number };  // 天秤上の位置
  color: string;
  isDragging?: boolean;
}

/**
 * 問題データ
 */
export interface EquationProblem {
  id: string;
  mode: LearningMode;
  difficulty: 1 | 2 | 3 | 4 | 5;
  
  // 問題情報
  title: string;
  description: string;
  equation: Equation;
  
  // 文章題の場合
  wordProblem?: {
    context: string;          // 文脈
    question: string;         // 質問
    variables: {              // 変数の意味
      [key: string]: string;
    };
    answer: {
      value: number;
      unit: string;
    };
  };
  
  // ヒントと解説
  hints: string[];
  solutionSteps: SolutionStep[];
  
  // 学習目標
  objectives: string[];
  
  // タグ
  tags: string[];
}

/**
 * 学習進捗
 */
export interface EquationProgress {
  currentMode: LearningMode;
  completedModes: LearningMode[];
  
  // 問題統計
  problemStats: {
    total: number;
    correct: number;
    byMode: Record<LearningMode, { total: number; correct: number }>;
    byDifficulty: Record<number, { total: number; correct: number }>;
  };
  
  // よくある間違い
  commonMistakes: {
    type: MistakeType;
    description: string;
    count: number;
    lastOccurred: string;
    suggestedReview?: string;
  }[];
  
  // 習熟度
  mastery: {
    conceptUnderstanding: number;    // 概念理解（0-100）
    calculationAccuracy: number;     // 計算精度（0-100）
    problemSolving: number;          // 問題解決力（0-100）
    overall: number;                 // 総合（0-100）
  };
  
  // 解法スキル
  skills: {
    transpose: boolean;              // 移項ができる
    combineTerms: boolean;           // 同類項をまとめられる
    distributive: boolean;           // 分配法則を使える
    fractions: boolean;              // 分数の処理ができる
    negativeNumbers: boolean;        // 負の数を扱える
    wordProblems: boolean;           // 文章題を式にできる
  };
  
  timeSpent: number;  // 秒
  lastAccessed: string;
}

/**
 * 間違いのタイプ
 */
export type MistakeType = 
  | 'signError'           // 符号の間違い
  | 'transpositionError'  // 移項の間違い
  | 'calculationError'    // 計算ミス
  | 'conceptualError'     // 概念的な誤解
  | 'orderError'          // 手順の間違い
  | 'interpretationError'; // 文章題の解釈ミス

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
  type: 'success' | 'error' | 'hint' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  nextAction?: string;
  visualFeedback?: {
    type: 'balance' | 'checkmark' | 'arrows' | 'sparkles';
    duration: number;
  };
}

/**
 * ドラッグ＆ドロップの状態
 */
export interface DragDropState {
  isDragging: boolean;
  draggedItem: BalanceItem | null;
  dropTarget: 'left' | 'right' | null;
  isValidDrop: boolean;
}

/**
 * 方程式ビルダーの設定
 */
export interface EquationBuilderConfig {
  // 表示設定
  showBalance: boolean;         // 天秤を表示
  showSteps: boolean;           // 解法ステップを表示
  showHints: boolean;           // ヒントを表示
  
  // アニメーション設定
  animationSpeed: 'slow' | 'normal' | 'fast';
  enableEffects: boolean;
  
  // 学習設定
  difficulty: 'easy' | 'normal' | 'hard';
  allowUndo: boolean;           // 操作の取り消しを許可
  autoCheck: boolean;           // 自動答え合わせ
  
  // 音声設定
  enableSound: boolean;
  readProblems: boolean;
}

/**
 * 実生活の文脈
 */
export interface RealWorldContext {
  id: string;
  category: 'shopping' | 'sports' | 'travel' | 'cooking' | 'science' | 'finance';
  title: string;
  description: string;
  image?: string;
  relatedProblems: string[];  // 関連する問題のID
}

/**
 * チャレンジモードの設定
 */
export interface ChallengeConfig {
  timeLimit?: number;         // 制限時間（秒）
  problemCount: number;       // 問題数
  difficultyProgression: boolean;  // 難易度を徐々に上げる
  allowSkip: boolean;         // スキップを許可
  showLeaderboard: boolean;   // ランキング表示
}

/**
 * 解法の検証結果
 */
export interface ValidationResult {
  isCorrect: boolean;
  userAnswer: number;
  correctAnswer: number;
  feedback: FeedbackMessage;
  mistakeType?: MistakeType;
  partialCredit?: number;     // 部分点（0-1）
}

/**
 * 方程式の変形履歴
 */
export interface TransformationHistory {
  steps: SolutionStep[];
  currentStepIndex: number;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * インタラクティブツール
 */
export interface InteractiveTool {
  type: 'balance' | 'numberLine' | 'tiles' | 'calculator';
  isActive: boolean;
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
    type: 'problemsSolved' | 'accuracy' | 'streak' | 'speed' | 'mastery';
    value: number;
  };
  unlockedAt?: string;
  progress: number;  // 0-100
}