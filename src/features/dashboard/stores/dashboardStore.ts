import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  type LearningAnalytics, 
  type TimeRange, 
  type UserRole, 
  type DashboardViewConfig,
  type LearningGoal,
  type ComparisonData 
} from '../types';
import { analyticsService } from '../services/analyticsService';
import { type LearningRecord, type LearningProgress } from '../../../stores/learningStore';

interface DashboardState {
  // UI State
  selectedRole: UserRole;
  timeRange: TimeRange;
  comparisonTarget: 'self' | 'gradeAverage' | 'schoolAverage';
  isLoading: boolean;
  error: string | null;
  
  // View Configuration
  viewConfig: DashboardViewConfig;
  
  // Cached Data
  analyticsData: LearningAnalytics | null;
  comparisonData: ComparisonData[] | null;
  goals: LearningGoal[];
  lastFetchTime: Date | null;
  
  // Actions - UI
  setRole: (role: UserRole) => void;
  setTimeRange: (timeRange: TimeRange) => void;
  setComparisonTarget: (target: DashboardState['comparisonTarget']) => void;
  toggleComponent: (component: keyof DashboardViewConfig['visibleComponents']) => void;
  
  // Actions - Data
  fetchAnalyticsData: (learningData: {
    records: LearningRecord[];
    progress: LearningProgress[];
    streakDays: number;
  }, force?: boolean) => Promise<void>;
  fetchComparisonData: () => Promise<void>;
  
  // Actions - Goals
  addGoal: (goal: Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateGoal: (id: string, updates: Partial<LearningGoal>) => void;
  deleteGoal: (id: string) => void;
  
  // Actions - Utility
  clearError: () => void;
  resetDashboard: () => void;
}

// 初期状態
const initialState = {
  selectedRole: 'student' as UserRole,
  timeRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 過去1週間
    end: new Date(),
    preset: 'week' as const
  },
  comparisonTarget: 'self' as const,
  isLoading: false,
  error: null,
  viewConfig: {
    role: 'student' as UserRole,
    visibleComponents: {
      learningTime: true,
      accuracy: true,
      proficiency: true,
      insights: true,
      goals: true,
      comparison: true
    },
    defaultTimeRange: 'week' as const
  },
  analyticsData: null,
  comparisonData: null,
  goals: [],
  lastFetchTime: null
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // UI Actions
        setRole: (role) => 
          set((state) => ({ 
            selectedRole: role,
            viewConfig: { ...state.viewConfig, role }
          })),
        
        setTimeRange: (timeRange) => 
          set({ timeRange }),
        
        setComparisonTarget: (target) => 
          set({ comparisonTarget: target }),
        
        toggleComponent: (component) =>
          set((state) => ({
            viewConfig: {
              ...state.viewConfig,
              visibleComponents: {
                ...state.viewConfig.visibleComponents,
                [component]: !state.viewConfig.visibleComponents[component]
              }
            }
          })),
        
        // Data Actions
        fetchAnalyticsData: async (learningData, force = false) => {
          const state = get();
          
          // キャッシュチェック（5分以内のデータは再取得しない）
          if (!force && state.lastFetchTime && state.analyticsData) {
            const timeDiff = Date.now() - state.lastFetchTime.getTime();
            if (timeDiff < 5 * 60 * 1000) {
              return;
            }
          }
          
          set({ isLoading: true, error: null });
          
          try {
            const data = await analyticsService.fetchAnalytics({
              timeRange: state.timeRange,
              role: state.selectedRole,
              records: learningData.records,
              progress: learningData.progress,
              streakDays: learningData.streakDays
            });
            
            set({ 
              analyticsData: data,
              lastFetchTime: new Date(),
              isLoading: false
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'データの取得に失敗しました',
              isLoading: false 
            });
          }
        },
        
        fetchComparisonData: async () => {
          const state = get();
          set({ isLoading: true, error: null });
          
          try {
            const data = await analyticsService.fetchComparisonData({
              target: state.comparisonTarget,
              timeRange: state.timeRange
            });
            
            set({ 
              comparisonData: data,
              isLoading: false
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : '比較データの取得に失敗しました',
              isLoading: false 
            });
          }
        },
        
        // Goal Actions
        addGoal: (goal) => {
          const newGoal: LearningGoal = {
            ...goal,
            id: `goal-${Date.now()}`,
            status: 'not-started',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          set((state) => ({
            goals: [...state.goals, newGoal]
          }));
        },
        
        updateGoal: (id, updates) => {
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === id
                ? { ...goal, ...updates, updatedAt: new Date() }
                : goal
            )
          }));
        },
        
        deleteGoal: (id) => {
          set((state) => ({
            goals: state.goals.filter((goal) => goal.id !== id)
          }));
        },
        
        // Utility Actions
        clearError: () => set({ error: null }),
        
        resetDashboard: () => set(initialState)
      }),
      {
        name: 'dashboard-storage',
        // 永続化するプロパティを選択
        partialize: (state) => ({
          selectedRole: state.selectedRole,
          timeRange: state.timeRange,
          comparisonTarget: state.comparisonTarget,
          viewConfig: state.viewConfig,
          goals: state.goals
        })
      }
    )
  )
);