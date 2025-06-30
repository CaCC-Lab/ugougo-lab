/**
 * マウススキル管理Store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MouseSkillLevel } from '../types/mouse-practice';
import type {
  MouseMetrics,
  MouseSkillProgress,
  MousePracticeSession,
  MouseBadge,
  AgeBasedSkillCriteria,
  AdaptiveUIConfig,
} from '../types/mouse-practice';

/**
 * 年齢別スキル基準
 */
const ageBasedCriteria: Record<string, AgeBasedSkillCriteria> = {
  '6-8': {
    ageGroup: '6-8',
    beginnerThreshold: { accuracy: 30, speed: 50, smoothness: 30 },
    intermediateThreshold: { accuracy: 50, speed: 100, smoothness: 50 },
    advancedThreshold: { accuracy: 70, speed: 150, smoothness: 70 },
    expertThreshold: { accuracy: 85, speed: 200, smoothness: 85 },
  },
  '9-11': {
    ageGroup: '9-11',
    beginnerThreshold: { accuracy: 40, speed: 75, smoothness: 40 },
    intermediateThreshold: { accuracy: 60, speed: 150, smoothness: 60 },
    advancedThreshold: { accuracy: 75, speed: 200, smoothness: 75 },
    expertThreshold: { accuracy: 90, speed: 250, smoothness: 90 },
  },
  '12-14': {
    ageGroup: '12-14',
    beginnerThreshold: { accuracy: 50, speed: 100, smoothness: 50 },
    intermediateThreshold: { accuracy: 70, speed: 200, smoothness: 70 },
    advancedThreshold: { accuracy: 80, speed: 250, smoothness: 80 },
    expertThreshold: { accuracy: 95, speed: 300, smoothness: 95 },
  },
  '15+': {
    ageGroup: '15+',
    beginnerThreshold: { accuracy: 60, speed: 150, smoothness: 60 },
    intermediateThreshold: { accuracy: 75, speed: 250, smoothness: 75 },
    advancedThreshold: { accuracy: 85, speed: 300, smoothness: 85 },
    expertThreshold: { accuracy: 95, speed: 350, smoothness: 95 },
  },
};

/**
 * デフォルトバッジ定義
 */
const defaultBadges: MouseBadge[] = [
  {
    id: 'first-click',
    name: '初めてのクリック',
    description: '最初のクリック練習を完了',
    icon: '🖱️',
    requirement: {},
    rarity: 'common',
  },
  {
    id: 'click-master',
    name: 'クリックマスター',
    description: 'クリック精度90%以上を達成',
    icon: '🎯',
    requirement: { accuracy: 90 },
    rarity: 'rare',
  },
  {
    id: 'drag-expert',
    name: 'ドラッグの達人',
    description: 'ドラッグコントロール85%以上を達成',
    icon: '✋',
    requirement: { dragControl: 85 },
    rarity: 'rare',
  },
  {
    id: 'speed-demon',
    name: 'スピードデーモン',
    description: 'マウス速度300px/秒以上を達成',
    icon: '⚡',
    requirement: { speed: 300 },
    rarity: 'epic',
  },
  {
    id: 'smooth-operator',
    name: 'スムースオペレーター',
    description: '滑らかさ90%以上を達成',
    icon: '🌊',
    requirement: { smoothness: 90 },
    rarity: 'epic',
  },
  {
    id: 'perfect-timing',
    name: 'パーフェクトタイミング',
    description: 'クリックタイミング95%以上を達成',
    icon: '⏱️',
    requirement: { clickTiming: 95 },
    rarity: 'legendary',
  },
  {
    id: 'mouse-ninja',
    name: 'マウスニンジャ',
    description: '全メトリクス85%以上を達成',
    icon: '🥷',
    requirement: { accuracy: 85, smoothness: 85, dragControl: 85, clickTiming: 85 },
    rarity: 'legendary',
  },
  {
    id: 'week-warrior',
    name: '週間戦士',
    description: '7日連続で練習',
    icon: '📅',
    requirement: {},
    rarity: 'rare',
  },
  {
    id: 'month-master',
    name: '月間マスター',
    description: '30日連続で練習',
    icon: '📆',
    requirement: {},
    rarity: 'epic',
  },
  {
    id: 'practice-pro',
    name: '練習のプロ',
    description: '100回の練習セッションを完了',
    icon: '💯',
    requirement: {},
    rarity: 'epic',
  },
];

/**
 * デフォルトのアダプティブUI設定
 */
const defaultAdaptiveUIConfig: Record<MouseSkillLevel, AdaptiveUIConfig> = {
  [MouseSkillLevel.BEGINNER]: {
    buttonSize: 'large',
    clickAreaPadding: 20,
    dragSensitivity: 0.5,
    visualHints: true,
    hapticFeedback: true,
    snapToGrid: true,
    showTrajectory: true,
  },
  [MouseSkillLevel.INTERMEDIATE]: {
    buttonSize: 'medium',
    clickAreaPadding: 10,
    dragSensitivity: 0.75,
    visualHints: true,
    hapticFeedback: true,
    snapToGrid: false,
    showTrajectory: true,
  },
  [MouseSkillLevel.ADVANCED]: {
    buttonSize: 'medium',
    clickAreaPadding: 5,
    dragSensitivity: 0.9,
    visualHints: false,
    hapticFeedback: false,
    snapToGrid: false,
    showTrajectory: false,
  },
  [MouseSkillLevel.EXPERT]: {
    buttonSize: 'small',
    clickAreaPadding: 0,
    dragSensitivity: 1.0,
    visualHints: false,
    hapticFeedback: false,
    snapToGrid: false,
    showTrajectory: false,
  },
};

interface MouseSkillState {
  // ユーザー情報
  userId: string;
  ageGroup: '6-8' | '9-11' | '12-14' | '15+';
  
  // スキルデータ
  currentLevel: MouseSkillLevel;
  metrics: MouseMetrics;
  progress: MouseSkillProgress;
  
  // セッション管理
  sessions: MousePracticeSession[];
  currentSessionId: string | null;
  
  // バッジ管理
  badges: MouseBadge[];
  unlockedBadges: string[];
  
  // 設定
  adaptiveUIEnabled: boolean;
  gamificationEnabled: boolean;
  soundEnabled: boolean;
  
  // アクション
  updateMetrics: (metrics: MouseMetrics) => void;
  updateSkillLevel: (level: MouseSkillLevel) => void;
  startSession: (sessionId: string, taskType: MousePracticeSession['taskType']) => void;
  endSession: (metrics: MouseMetrics, score: number) => void;
  unlockBadge: (badgeId: string) => void;
  checkBadgeUnlocks: (metrics: MouseMetrics) => void;
  getAdaptiveUIConfig: () => AdaptiveUIConfig;
  getSkillCriteria: () => AgeBasedSkillCriteria;
  updateDailyStreak: () => void;
  setAgeGroup: (ageGroup: '6-8' | '9-11' | '12-14' | '15+') => void;
  toggleAdaptiveUI: () => void;
  toggleGamification: () => void;
  toggleSound: () => void;
  resetProgress: () => void;
  exportProgress: () => string;
  importProgress: (data: string) => void;
}

export const useMouseSkillStore = create<MouseSkillState>()(
  persist(
    (set, get) => ({
      // 初期状態
      userId: 'default-user',
      ageGroup: '9-11',
      currentLevel: MouseSkillLevel.BEGINNER,
      metrics: {
        accuracy: 0,
        speed: 0,
        smoothness: 0,
        dragControl: 0,
        clickTiming: 0,
        doubleClickRate: 0,
      },
      progress: {
        userId: 'default-user',
        currentLevel: MouseSkillLevel.BEGINNER,
        totalSessions: 0,
        totalPracticeTime: 0,
        metrics: {
          accuracy: 0,
          speed: 0,
          smoothness: 0,
          dragControl: 0,
          clickTiming: 0,
          doubleClickRate: 0,
        },
        badges: defaultBadges,
        recentSessions: [],
        dailyStreak: 0,
        lastPracticeDate: new Date(),
      },
      sessions: [],
      currentSessionId: null,
      badges: defaultBadges,
      unlockedBadges: [],
      adaptiveUIEnabled: true,
      gamificationEnabled: true,
      soundEnabled: true,

      // アクション実装
      updateMetrics: (metrics) => {
        set((state) => ({
          metrics,
          progress: {
            ...state.progress,
            metrics,
          },
        }));
        
        // バッジ解除チェック
        get().checkBadgeUnlocks(metrics);
      },

      updateSkillLevel: (level) => {
        set((state) => ({
          currentLevel: level,
          progress: {
            ...state.progress,
            currentLevel: level,
          },
        }));
      },

      startSession: (sessionId, taskType) => {
        const session: MousePracticeSession = {
          sessionId,
          startTime: new Date(),
          taskType,
          difficulty: 'easy',
          score: 0,
          metrics: get().metrics,
          improvements: [],
        };
        
        set((state) => ({
          currentSessionId: sessionId,
          sessions: [...state.sessions, session],
        }));
      },

      endSession: (metrics, score) => {
        const state = get();
        const currentSession = state.sessions.find(s => s.sessionId === state.currentSessionId);
        
        if (currentSession) {
          currentSession.endTime = new Date();
          currentSession.metrics = metrics;
          currentSession.score = score;
          
          // 改善点の分析
          const improvements: string[] = [];
          if (metrics.accuracy < 70) improvements.push('クリック精度を向上させましょう');
          if (metrics.smoothness < 70) improvements.push('マウスの動きをより滑らかにしましょう');
          if (metrics.dragControl < 70) improvements.push('ドラッグ操作の練習が必要です');
          
          currentSession.improvements = improvements;
          
          // 練習時間の更新
          const practiceTime = (currentSession.endTime.getTime() - currentSession.startTime.getTime()) / 60000;
          
          set((state) => ({
            currentSessionId: null,
            sessions: state.sessions.map(s => 
              s.sessionId === state.currentSessionId ? currentSession : s
            ),
            progress: {
              ...state.progress,
              totalSessions: state.progress.totalSessions + 1,
              totalPracticeTime: state.progress.totalPracticeTime + practiceTime,
              recentSessions: [currentSession, ...state.progress.recentSessions].slice(0, 10),
            },
          }));
          
          // デイリーストリーク更新
          state.updateDailyStreak();
        }
      },

      unlockBadge: (badgeId) => {
        set((state) => {
          if (state.unlockedBadges.indexOf(badgeId) === -1) {
            const badge = state.badges.find(b => b.id === badgeId);
            if (badge) {
              badge.unlockedAt = new Date();
            }
            
            return {
              unlockedBadges: [...state.unlockedBadges, badgeId],
              badges: state.badges,
            };
          }
          return state;
        });
      },

      checkBadgeUnlocks: (metrics) => {
        const state = get();
        
        state.badges.forEach(badge => {
          if (state.unlockedBadges.indexOf(badge.id) === -1) {
            let shouldUnlock = true;
            
            // メトリクス要件チェック
            Object.keys(badge.requirement).forEach(key => {
              const value = badge.requirement[key as keyof MouseMetrics];
              if (metrics[key as keyof MouseMetrics] < value) {
                shouldUnlock = false;
              }
            });
            
            // 特殊バッジのチェック
            if (badge.id === 'week-warrior' && state.progress.dailyStreak >= 7) {
              shouldUnlock = true;
            } else if (badge.id === 'month-master' && state.progress.dailyStreak >= 30) {
              shouldUnlock = true;
            } else if (badge.id === 'practice-pro' && state.progress.totalSessions >= 100) {
              shouldUnlock = true;
            } else if (badge.id === 'first-click' && state.progress.totalSessions >= 1) {
              shouldUnlock = true;
            }
            
            if (shouldUnlock) {
              state.unlockBadge(badge.id);
            }
          }
        });
      },

      getAdaptiveUIConfig: () => {
        const state = get();
        return state.adaptiveUIEnabled 
          ? defaultAdaptiveUIConfig[state.currentLevel]
          : defaultAdaptiveUIConfig[MouseSkillLevel.EXPERT];
      },

      getSkillCriteria: () => {
        const state = get();
        return ageBasedCriteria[state.ageGroup];
      },

      updateDailyStreak: () => {
        set((state) => {
          const today = new Date().toDateString();
          const lastPractice = new Date(state.progress.lastPracticeDate).toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          
          let newStreak = state.progress.dailyStreak;
          
          if (lastPractice === yesterday) {
            // 昨日練習していた場合はストリーク継続
            newStreak += 1;
          } else if (lastPractice !== today) {
            // 昨日練習していない場合はリセット
            newStreak = 1;
          }
          
          return {
            progress: {
              ...state.progress,
              dailyStreak: newStreak,
              lastPracticeDate: new Date(),
            },
          };
        });
      },

      setAgeGroup: (ageGroup) => {
        set({ ageGroup });
      },

      toggleAdaptiveUI: () => {
        set((state) => ({ adaptiveUIEnabled: !state.adaptiveUIEnabled }));
      },

      toggleGamification: () => {
        set((state) => ({ gamificationEnabled: !state.gamificationEnabled }));
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      resetProgress: () => {
        set({
          currentLevel: MouseSkillLevel.BEGINNER,
          metrics: {
            accuracy: 0,
            speed: 0,
            smoothness: 0,
            dragControl: 0,
            clickTiming: 0,
            doubleClickRate: 0,
          },
          progress: {
            userId: get().userId,
            currentLevel: MouseSkillLevel.BEGINNER,
            totalSessions: 0,
            totalPracticeTime: 0,
            metrics: {
              accuracy: 0,
              speed: 0,
              smoothness: 0,
              dragControl: 0,
              clickTiming: 0,
              doubleClickRate: 0,
            },
            badges: defaultBadges,
            recentSessions: [],
            dailyStreak: 0,
            lastPracticeDate: new Date(),
          },
          sessions: [],
          unlockedBadges: [],
        });
      },

      exportProgress: () => {
        const state = get();
        return JSON.stringify({
          userId: state.userId,
          ageGroup: state.ageGroup,
          progress: state.progress,
          unlockedBadges: state.unlockedBadges,
          sessions: state.sessions,
        });
      },

      importProgress: (data) => {
        try {
          const parsed = JSON.parse(data);
          set({
            userId: parsed.userId,
            ageGroup: parsed.ageGroup,
            progress: parsed.progress,
            unlockedBadges: parsed.unlockedBadges,
            sessions: parsed.sessions,
          });
        } catch (error) {
          console.error('Failed to import progress:', error);
        }
      },
    }),
    {
      name: 'mouse-skill-storage',
      version: 1,
    }
  )
);