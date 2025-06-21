/**
 * 小数マスター教材の型定義
 * 
 * 設計思想：
 * - 小数の概念を段階的に理解できるよう、複数のモードを用意
 * - 視覚的表現と数値表現を常に連携させる
 * - 誤答パターンを分析し、適切なフィードバックを提供
 */

/**
 * 学習モード
 * 段階的に難易度を上げていく設計
 */
export type LearningMode = 
  | 'concept'      // 概念理解：小数とは何か
  | 'placeValue'   // 位取り：0.1, 0.01の理解
  | 'comparison'   // 大小比較：数直線での理解
  | 'addition'     // たし算
  | 'subtraction'  // ひき算
  | 'multiplication' // かけ算（応用）
  | 'division'     // わり算（応用）
  | 'realWorld';   // 実生活での応用

/**
 * 小数の視覚的表現方法
 */
export type VisualizationType = 
  | 'grid'        // 10×10グリッド
  | 'blocks'      // ブロック表現
  | 'numberLine'  // 数直線
  | 'money';      // お金（実生活）

/**
 * 小数の内部表現
 * 整数部と小数部を分けて管理し、計算誤差を防ぐ
 */
export interface DecimalNumber {
  integerPart: number;      // 整数部分
  decimalPart: number;      // 小数部分（0.99まで）
  value: number;            // 実際の値
  displayString: string;    // 表示用文字列
}

/**
 * グリッド上のセル情報
 */
export interface GridCell {
  row: number;
  col: number;
  value: number;      // 0.01 or 0.1 or 1
  isHighlighted: boolean;
  color?: string;
}

/**
 * 位取り板の状態
 */
export interface PlaceValueState {
  hundreds: number;   // 百の位
  tens: number;       // 十の位
  ones: number;       // 一の位
  tenths: number;     // 十分の一の位（0.1）
  hundredths: number; // 百分の一の位（0.01）
}

/**
 * 計算問題の型
 */
export interface DecimalProblem {
  id: string;
  type: 'addition' | 'subtraction' | 'multiplication' | 'division';
  operand1: DecimalNumber;
  operand2: DecimalNumber;
  answer: DecimalNumber;
  difficulty: 1 | 2 | 3 | 4 | 5;
  hint?: string;
  realWorldContext?: string; // 実生活での文脈
}

/**
 * 学習進捗の詳細情報
 */
export interface DecimalLearningProgress {
  currentMode: LearningMode;
  completedModes: LearningMode[];
  totalProblems: number;
  correctAnswers: number;
  commonMistakes: MistakePattern[];
  timeSpent: number; // 秒
  lastAccessed: string; // ISO日付
}

/**
 * よくある間違いパターン
 * これを記録することで、個別最適化されたヒントを提供
 */
export interface MistakePattern {
  type: 'placeValue' | 'alignment' | 'carryOver' | 'conceptual';
  count: number;
  lastOccurred: string;
  description: string;
}

/**
 * アニメーション設定
 */
export interface AnimationConfig {
  duration: number;      // ミリ秒
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  delay?: number;
}

/**
 * 実生活の例題設定
 */
export interface RealWorldExample {
  id: string;
  title: string;
  description: string;
  scenario: 'shopping' | 'measurement' | 'money' | 'cooking';
  problems: DecimalProblem[];
  images?: string[];
}

/**
 * フィードバックメッセージ
 */
export interface FeedbackMessage {
  type: 'success' | 'error' | 'hint' | 'encouragement';
  message: string;
  detailedExplanation?: string;
  nextStep?: string;
}

/**
 * 教材全体の設定
 */
export interface DecimalMasterConfig {
  showGrid: boolean;
  showNumberLine: boolean;
  enableSound: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}