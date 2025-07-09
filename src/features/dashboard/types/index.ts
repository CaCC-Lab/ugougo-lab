// 学習分析ダッシュボードの型定義

// 時間範囲フィルターの型
export interface TimeRange {
  start: Date;
  end: Date;
  preset?: 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

// ユーザーロールの型
export type UserRole = 'student' | 'parent' | 'teacher';

// 学習時間データの型
export interface LearningTimeData {
  date: string; // YYYY-MM-DD
  duration: number; // 分単位
  materialId?: string;
  materialName?: string;
}

// 時間帯別学習パターンの型
export interface HourlyLearningPattern {
  hour: number; // 0-23
  avgDuration: number; // 平均学習時間（分）
  frequency: number; // 学習回数
}

// 正答率データの型
export interface AccuracyData {
  date: string;
  accuracy: number; // 0-100
  totalQuestions: number;
  correctAnswers: number;
  materialId?: string;
  concept?: string;
}

// 習熟度データの型
export interface ProficiencyData {
  concept: string;
  level: number; // 0-100
  subConcepts?: {
    name: string;
    level: number;
  }[];
}

// 教材別進捗データの型
export interface MaterialProgress {
  materialId: string;
  materialName: string;
  category: string;
  completionRate: number; // 0-100
  lastAccessed: Date;
  totalTime: number; // 分単位
  attemptCount: number;
  averageScore: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

// エラーパターン分析の型
export interface ErrorPattern {
  type: string;
  frequency: number;
  examples: {
    problem: string;
    userAnswer: string;
    correctAnswer: string;
    timestamp: Date;
  }[];
  suggestions: string[];
}

// 学習インサイトの型
export interface LearningInsight {
  type: 'weakness' | 'strength' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionItems?: string[];
  relatedMaterials?: string[];
}

// 学習ペース分析の型
export interface LearningPace {
  currentPace: 'too-fast' | 'optimal' | 'too-slow';
  averageSessionDuration: number; // 分
  recommendedSessionDuration: number; // 分
  optimalTimeSlots: {
    dayOfWeek: number; // 0-6
    hourRange: { start: number; end: number };
    effectiveness: number; // 0-100
  }[];
}

// 比較データの型
export interface ComparisonData {
  target: 'self' | 'gradeAverage' | 'schoolAverage';
  metric: string;
  currentValue: number;
  targetValue: number;
  difference: number;
  trend: 'improving' | 'stable' | 'declining';
}

// 学習目標の型
export interface LearningGoal {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

// 総合分析データの型
export interface LearningAnalytics {
  // 基本統計
  totalLearningTime: number; // 分単位
  streakDays: number;
  completedMaterials: number;
  averageAccuracy: number;
  
  // 時系列データ
  learningTimeHistory: LearningTimeData[];
  accuracyHistory: AccuracyData[];
  
  // パターン分析
  hourlyPatterns: HourlyLearningPattern[];
  weeklyPatterns: {
    dayOfWeek: number;
    avgDuration: number;
  }[];
  
  // 習熟度
  proficiencyMap: ProficiencyData[];
  
  // 教材進捗
  materialProgress: MaterialProgress[];
  
  // エラー分析
  errorPatterns: ErrorPattern[];
  
  // インサイト
  insights: LearningInsight[];
  
  // ペース分析
  learningPace: LearningPace;
  
  // 推奨教材
  recommendedMaterials: {
    materialId: string;
    reason: string;
    priority: number;
  }[];
}

// エクスポートデータの型
export interface ExportData {
  format: 'pdf' | 'csv' | 'json';
  dateRange: TimeRange;
  includeCharts: boolean;
  includeRawData: boolean;
  generatedAt: Date;
}

// ダッシュボードビューの設定型
export interface DashboardViewConfig {
  role: UserRole;
  visibleComponents: {
    learningTime: boolean;
    accuracy: boolean;
    proficiency: boolean;
    insights: boolean;
    goals: boolean;
    comparison: boolean;
  };
  defaultTimeRange: TimeRange['preset'];
}

// 学習目標の型
export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'time' | 'accuracy' | 'materials' | 'streak';
  deadline: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
}