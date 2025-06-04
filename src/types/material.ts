// 教材に関する型定義

// 学年レベル
export type GradeLevel = 
  | 'elementary1' | 'elementary2' | 'elementary3' 
  | 'elementary4' | 'elementary5' | 'elementary6'
  | 'juniorHigh1' | 'juniorHigh2' | 'juniorHigh3'
  | 'highSchool1' | 'highSchool2' | 'highSchool3';

// 教科
export type Subject = 
  | 'math'        // 算数・数学
  | 'japanese'    // 国語
  | 'english'     // 英語
  | 'science'     // 理科
  | 'social'      // 社会
  | 'life'        // 生活
  | 'physics'     // 物理
  | 'chemistry'   // 化学
  | 'biology';    // 生物

// 教材の基本情報
export interface Material {
  id: string;
  title: string;
  description: string;
  gradeLevel: GradeLevel;
  subject: Subject;
  thumbnail?: string;
  tags: string[];
  difficulty: 'easy' | 'normal' | 'hard';
  estimatedTime: number; // 分単位
  isPremium: boolean;
}

// 学習進捗
export interface LearningProgress {
  materialId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  timeSpent: number; // 秒単位
  attempts: number;
  data?: Record<string, unknown>; // 教材固有のデータ
}

// 教材コンポーネントの共通Props
export interface MaterialComponentProps {
  material: Material;
  onComplete?: (progress: Partial<LearningProgress>) => void;
  onProgress?: (data: Record<string, unknown>) => void;
  savedData?: Record<string, unknown>;
  isPreview?: boolean;
}