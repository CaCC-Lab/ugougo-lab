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

// Phase 2: 教材表示設定システムの追加型定義
// ===================================================

/**
 * 教材の開発状態
 * - development: 開発中（一般公開なし）
 * - testing: テスト中（限定公開）
 * - published: 公開中（全体公開）
 */
export type MaterialStatus = 'development' | 'testing' | 'published';

/**
 * 日本語表記の学年（UI表示用）
 */
export type MaterialGrade = 
  | '小学1年生' | '小学2年生' | '小学3年生' | '小学4年生' | '小学5年生' | '小学6年生'
  | '中学1年生' | '中学2年生' | '中学3年生'
  | '高校1年生' | '高校2年生' | '高校3年生';

/**
 * 日本語表記の教科（UI表示用）
 */
export type MaterialSubject = 
  | '算数' | '数学' 
  | '理科' | '物理' | '化学' | '生物'
  | '国語' | '英語'
  | '社会' | '地理' | '歴史' | '公民'
  | '生活科' | '情報' | '総合';

/**
 * 教材のカテゴリー（実装形式）
 */
export type MaterialCategory = 
  | 'visualization'    // 視覚化ツール
  | 'simulation'      // シミュレーション
  | 'game'           // ゲーム形式
  | 'practice'       // 練習問題
  | 'interactive'    // インタラクティブ教材
  | 'tool';         // 学習ツール

/**
 * 学年レベルと日本語表記の変換マップ
 */
export const gradeLevelToJapaneseMap: Record<GradeLevel, MaterialGrade> = {
  elementary1: '小学1年生',
  elementary2: '小学2年生',
  elementary3: '小学3年生',
  elementary4: '小学4年生',
  elementary5: '小学5年生',
  elementary6: '小学6年生',
  juniorHigh1: '中学1年生',
  juniorHigh2: '中学2年生',
  juniorHigh3: '中学3年生',
  highSchool1: '高校1年生',
  highSchool2: '高校2年生',
  highSchool3: '高校3年生',
};

/**
 * 教科と日本語表記の変換マップ
 */
export const subjectToJapaneseMap: Record<Subject, MaterialSubject> = {
  math: '数学',
  japanese: '国語',
  english: '英語',
  science: '理科',
  social: '社会',
  life: '生活科',
  physics: '物理',
  chemistry: '化学',
  biology: '生物',
};

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

// Phase 2: 追加インターフェース
// ===================================================

/**
 * 拡張版教材メタデータ（教材表示設定システム用）
 */
export interface MaterialMetadata extends Material {
  // 状態管理
  status: MaterialStatus;
  enabled: boolean;
  
  // 日本語表記（UI表示用）
  gradeJapanese: MaterialGrade;
  subjectJapanese: MaterialSubject;
  
  // カテゴリと追加情報
  category: MaterialCategory;
  
  // システム情報
  createdAt: string;
  updatedAt: string;
  version?: string;
  
  // 実装情報
  componentPath?: string;
  moduleType?: 'component' | 'material';
}

/**
 * 教材表示設定
 */
export interface MaterialDisplaySettings {
  // 個別設定
  byMaterial: Record<string, boolean>;
  
  // グループ設定
  byGrade: Record<MaterialGrade, boolean>;
  bySubject: Record<MaterialSubject, boolean>;
  byStatus: Record<MaterialStatus, boolean>;
  byCategory: Record<MaterialCategory, boolean>;
  
  // グローバル設定
  globalEnabled: boolean;
  showDevelopment: boolean;
  showDisabled: boolean;
}

/**
 * 教材フィルター条件
 */
export interface MaterialFilter {
  grades?: MaterialGrade[];
  subjects?: MaterialSubject[];
  categories?: MaterialCategory[];
  statuses?: MaterialStatus[];
  tags?: string[];
  searchText?: string;
  enabled?: boolean;
}

/**
 * 教材設定のプリセット
 */
export interface MaterialPreset {
  id: string;
  name: string;
  description: string;
  filter: MaterialFilter;
  displaySettings: Partial<MaterialDisplaySettings>;
}

/**
 * 設定ファイルのスキーマ
 */
export interface MaterialSettingsSchema {
  version: string;
  lastUpdated: string;
  materials: Record<string, {
    enabled: boolean;
    status: MaterialStatus;
    customSettings?: Record<string, unknown>;
  }>;
  displaySettings: MaterialDisplaySettings;
  presets?: Record<string, MaterialPreset>;
  metadata?: {
    createdBy?: string;
    environment?: 'development' | 'staging' | 'production';
    notes?: string;
  };
}

/**
 * 管理者用の統計情報
 */
export interface MaterialStatistics {
  totalMaterials: number;
  byStatus: Record<MaterialStatus, number>;
  byGrade: Record<MaterialGrade, number>;
  bySubject: Record<MaterialSubject, number>;
  enabledCount: number;
  disabledCount: number;
  lastUpdated: string;
}