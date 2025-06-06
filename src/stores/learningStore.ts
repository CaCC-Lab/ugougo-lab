import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 学習記録の型定義
export interface LearningRecord {
  materialId: string;
  timestamp: number;
  duration: number; // 秒
  score: number; // 0-100
  mistakes: {
    problem: string;
    userAnswer: string;
    correctAnswer: string;
  }[];
  hintsUsed: number;
  completed: boolean;
}

// 学習進捗の型定義
export interface LearningProgress {
  materialId: string;
  concept: string;
  masteryLevel: number; // 0-100
  lastAccessed: number;
  totalTime: number;
  attemptCount: number;
  averageScore: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

// 個人化設定の型定義
export interface PersonalizationSettings {
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  showHints: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  fontSize: 'small' | 'medium' | 'large';
  colorBlindMode: boolean;
}

// ストアの型定義
interface LearningStore {
  // 学習記録
  records: LearningRecord[];
  addRecord: (record: LearningRecord) => void;
  getRecordsByMaterial: (materialId: string) => LearningRecord[];
  
  // 学習進捗
  progress: LearningProgress[];
  updateProgress: (materialId: string, updates: Partial<LearningProgress>) => void;
  getProgress: (materialId: string) => LearningProgress | undefined;
  
  // 個人化設定
  settings: PersonalizationSettings;
  updateSettings: (settings: Partial<PersonalizationSettings>) => void;
  
  // 統計情報
  getTotalLearningTime: () => number;
  getStreakDays: () => number;
  getWeeklyProgress: () => { day: string; time: number; score: number }[];
  
  // 推奨機能
  getRecommendedMaterials: () => string[];
  getDifficultyAdjustment: (materialId: string) => 'increase' | 'maintain' | 'decrease';
}

// 初期設定
const defaultSettings: PersonalizationSettings = {
  preferredDifficulty: 'medium',
  showHints: true,
  animationSpeed: 'normal',
  fontSize: 'medium',
  colorBlindMode: false,
};

// Zustandストアの作成
export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      // 学習記録
      records: [],
      
      addRecord: (record) => {
        set((state) => ({
          records: [...state.records, record],
        }));
        
        // 進捗も同時に更新
        get().getProgress(record.materialId);
        const allRecords = [...get().records, record].filter(
          (r) => r.materialId === record.materialId
        );
        
        const totalScore = allRecords.reduce((sum, r) => sum + r.score, 0);
        const averageScore = totalScore / allRecords.length;
        const totalTime = allRecords.reduce((sum, r) => sum + r.duration, 0);
        
        get().updateProgress(record.materialId, {
          lastAccessed: record.timestamp,
          totalTime,
          attemptCount: allRecords.length,
          averageScore,
          masteryLevel: calculateMasteryLevel(averageScore, allRecords.length),
        });
      },
      
      getRecordsByMaterial: (materialId) => {
        return get().records.filter((r) => r.materialId === materialId);
      },
      
      // 学習進捗
      progress: [],
      
      updateProgress: (materialId, updates) => {
        set((state) => {
          const existingIndex = state.progress.findIndex(
            (p) => p.materialId === materialId
          );
          
          if (existingIndex >= 0) {
            const newProgress = [...state.progress];
            newProgress[existingIndex] = {
              ...newProgress[existingIndex],
              ...updates,
            };
            return { progress: newProgress };
          } else {
            return {
              progress: [
                ...state.progress,
                {
                  materialId,
                  concept: '',
                  masteryLevel: 0,
                  lastAccessed: Date.now(),
                  totalTime: 0,
                  attemptCount: 0,
                  averageScore: 0,
                  difficultyLevel: 'medium',
                  ...updates,
                },
              ],
            };
          }
        });
      },
      
      getProgress: (materialId) => {
        return get().progress.find((p) => p.materialId === materialId);
      },
      
      // 個人化設定
      settings: defaultSettings,
      
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },
      
      // 統計情報
      getTotalLearningTime: () => {
        return get().records.reduce((sum, r) => sum + r.duration, 0);
      },
      
      getStreakDays: () => {
        const records = get().records.sort((a, b) => b.timestamp - a.timestamp);
        if (records.length === 0) return 0;
        
        let streak = 1;
        let currentDate = new Date(records[0].timestamp);
        currentDate.setHours(0, 0, 0, 0);
        
        for (let i = 1; i < records.length; i++) {
          const recordDate = new Date(records[i].timestamp);
          recordDate.setHours(0, 0, 0, 0);
          
          const dayDiff = Math.floor(
            (currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (dayDiff === 1) {
            streak++;
            currentDate = recordDate;
          } else if (dayDiff > 1) {
            break;
          }
        }
        
        return streak;
      },
      
      getWeeklyProgress: () => {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentRecords = get().records.filter((r) => r.timestamp > weekAgo);
        
        const dailyData: { [key: string]: { time: number; score: number; count: number } } = {};
        
        recentRecords.forEach((record) => {
          const date = new Date(record.timestamp);
          const dayKey = date.toLocaleDateString('ja-JP', { weekday: 'short' });
          
          if (!dailyData[dayKey]) {
            dailyData[dayKey] = { time: 0, score: 0, count: 0 };
          }
          
          dailyData[dayKey].time += record.duration;
          dailyData[dayKey].score += record.score;
          dailyData[dayKey].count += 1;
        });
        
        return Object.entries(dailyData).map(([day, data]) => ({
          day,
          time: data.time,
          score: data.count > 0 ? data.score / data.count : 0,
        }));
      },
      
      // 推奨機能
      getRecommendedMaterials: () => {
        const progress = get().progress;
        
        // 習熟度が低い教材を優先
        const lowMastery = progress
          .filter((p) => p.masteryLevel < 60)
          .sort((a, b) => a.masteryLevel - b.masteryLevel)
          .slice(0, 3)
          .map((p) => p.materialId);
        
        // 最近アクセスしていない教材
        const notRecent = progress
          .filter((p) => Date.now() - p.lastAccessed > 3 * 24 * 60 * 60 * 1000)
          .sort((a, b) => a.lastAccessed - b.lastAccessed)
          .slice(0, 2)
          .map((p) => p.materialId);
        
        return [...new Set([...lowMastery, ...notRecent])];
      },
      
      getDifficultyAdjustment: (materialId) => {
        const records = get().getRecordsByMaterial(materialId).slice(-5);
        if (records.length < 3) return 'maintain';
        
        const recentAverage = records.reduce((sum, r) => sum + r.score, 0) / records.length;
        const hintsAverage = records.reduce((sum, r) => sum + r.hintsUsed, 0) / records.length;
        
        if (recentAverage > 85 && hintsAverage < 1) {
          return 'increase';
        } else if (recentAverage < 60 || hintsAverage > 3) {
          return 'decrease';
        }
        
        return 'maintain';
      },
    }),
    {
      name: 'learning-storage',
      partialize: (state) => ({
        records: state.records.slice(-1000), // 最新1000件のみ保存
        progress: state.progress,
        settings: state.settings,
      }),
    }
  )
);

// ヘルパー関数
function calculateMasteryLevel(averageScore: number, attemptCount: number): number {
  // スコアと試行回数を考慮した習熟度計算
  const scoreFactor = averageScore * 0.7;
  const attemptFactor = Math.min(attemptCount * 5, 30); // 最大30点
  return Math.min(scoreFactor + attemptFactor, 100);
}