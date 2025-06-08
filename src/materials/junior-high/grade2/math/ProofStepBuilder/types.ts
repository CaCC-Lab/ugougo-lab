// 証明ステップビルダーの型定義

// 証明のステップを表す型
export interface ProofStep {
  id: string;
  content: string;
  reason?: string;
  reasonType?: 'definition' | 'theorem' | 'assumption' | 'given' | 'conclusion';
  isValid?: boolean;
  order: number;
}

// 定理・定義を表す型
export interface Theorem {
  id: string;
  name: string;
  content: string;
  category: 'congruence' | 'parallel' | 'angle' | 'triangle' | 'basic';
  keywords: string[];
}

// 証明問題を表す型
export interface ProofProblem {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  given: string[];
  toProve: string;
  figure?: {
    type: 'triangle' | 'parallel' | 'quadrilateral' | 'circle';
    labels: string[];
    special?: string[];
  };
  correctSteps: string[];
  hints: string[];
  commonMistakes: string[];
}

// 証明の状態を表す型
export interface ProofState {
  problem: ProofProblem | null;
  steps: ProofStep[];
  availableTheorems: Theorem[];
  isComplete: boolean;
  feedback: string;
  showHint: boolean;
  currentHintIndex: number;
}

// ドラッグ&ドロップのアイテム型
export interface DragItem {
  type: 'step' | 'theorem';
  id: string;
  content: string;
  sourceIndex?: number;
}

// フィードバックの型
export interface Feedback {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string[];
}

// 証明の検証結果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
  score: number;
}