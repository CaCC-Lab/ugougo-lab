/**
 * マウス練習機能の型定義
 */

/**
 * マウススキルメトリクス
 */
export interface MouseMetrics {
  accuracy: number;         // クリック精度 (0-100)
  speed: number;           // 移動速度 (px/秒)
  smoothness: number;      // 動きの滑らかさ (0-100)
  dragControl: number;     // ドラッグ操作の正確性 (0-100)
  clickTiming: number;     // クリックタイミング (0-100)
  doubleClickRate: number; // ダブルクリック成功率 (0-100)
}

/**
 * マウススキルレベル
 */
export enum MouseSkillLevel {
  BEGINNER = 'beginner',       // 初心者
  INTERMEDIATE = 'intermediate', // 中級者
  ADVANCED = 'advanced',       // 上級者
  EXPERT = 'expert'           // エキスパート
}

/**
 * マウス位置データ
 */
export interface MousePosition {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * マウストラッキングデータ
 */
export interface MouseTrackingData {
  positions: MousePosition[];
  clicks: MousePosition[];
  dragPaths: MousePosition[][];
  metrics: MouseMetrics;
  skillLevel: MouseSkillLevel;
}

/**
 * アダプティブUI設定
 */
export interface AdaptiveUIConfig {
  buttonSize: 'small' | 'medium' | 'large';
  clickAreaPadding: number;
  dragSensitivity: number;
  visualHints: boolean;
  hapticFeedback?: boolean;
  snapToGrid?: boolean;
  showTrajectory?: boolean;
}

/**
 * マウス練習セッションデータ
 */
export interface MousePracticeSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  taskType: 'click' | 'drag' | 'trace' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  metrics: MouseMetrics;
  improvements: string[];
}

/**
 * マウス練習タスク
 */
export interface MousePracticeTask {
  id: string;
  type: 'click' | 'drag' | 'trace' | 'hover';
  difficulty: 'easy' | 'medium' | 'hard';
  instruction: string;
  targetCount?: number;
  timeLimit?: number;
  successCriteria: {
    minAccuracy?: number;
    maxTime?: number;
    minSpeed?: number;
  };
}

/**
 * マウスバッジ
 */
export interface MouseBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: Partial<MouseMetrics>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

/**
 * マウススキル進捗
 */
export interface MouseSkillProgress {
  userId: string;
  currentLevel: MouseSkillLevel;
  totalSessions: number;
  totalPracticeTime: number; // 分
  metrics: MouseMetrics;
  badges: MouseBadge[];
  recentSessions: MousePracticeSession[];
  dailyStreak: number;
  lastPracticeDate: Date;
}

/**
 * 年齢別スキル基準
 */
export interface AgeBasedSkillCriteria {
  ageGroup: '6-8' | '9-11' | '12-14' | '15+';
  beginnerThreshold: Partial<MouseMetrics>;
  intermediateThreshold: Partial<MouseMetrics>;
  advancedThreshold: Partial<MouseMetrics>;
  expertThreshold: Partial<MouseMetrics>;
}

/**
 * マウス練習コンポーネントのProps
 */
export interface MousePracticeProps {
  taskType?: 'click' | 'drag' | 'trace' | 'mixed';
  difficulty?: 'easy' | 'medium' | 'hard';
  onComplete?: (session: MousePracticeSession) => void;
  onProgress?: (metrics: MouseMetrics) => void;
  showMetrics?: boolean;
  adaptiveUI?: boolean;
  gamificationEnabled?: boolean;
}

/**
 * MouseTrackerフックの戻り値
 */
export interface UseMouseTrackerReturn {
  startTracking: () => void;
  stopTracking: () => void;
  resetTracking: () => void;
  isTracking: boolean;
  metrics: MouseMetrics;
  skillLevel: MouseSkillLevel;
  trackingData: MouseTrackingData;
  updateMetrics: () => void;
}