/**
 * 分数学習進捗管理フック
 */

import { useState, useCallback, useEffect } from 'react';

interface ProgressData {
  completedModules: string[];
  moduleScores: Record<string, number>;
  totalScore: number;
  currentLevel: number;
  lastActivity: string;
  studyTime: number; // 秒単位
}

const STORAGE_KEY = 'fraction-master-lab-progress';

const initialProgress: ProgressData = {
  completedModules: [],
  moduleScores: {},
  totalScore: 0,
  currentLevel: 1,
  lastActivity: new Date().toISOString(),
  studyTime: 0
};

export const useFractionProgress = () => {
  const [progress, setProgress] = useState<ProgressData>(initialProgress);
  const [sessionStartTime] = useState<number>(Date.now());

  // ローカルストレージから進捗データを読み込み
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Failed to load progress data:', error);
      }
    }
  }, []);

  // 進捗データをローカルストレージに保存
  const saveProgress = useCallback((newProgress: ProgressData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.error('Failed to save progress data:', error);
    }
  }, []);

  // 学習時間を更新
  const updateStudyTime = useCallback(() => {
    const currentTime = Date.now();
    const sessionTime = Math.floor((currentTime - sessionStartTime) / 1000);
    return sessionTime;
  }, [sessionStartTime]);

  // 進捗更新
  const updateProgress = useCallback((moduleId: string, partialScore: number) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        moduleScores: {
          ...prev.moduleScores,
          [moduleId]: Math.max(prev.moduleScores[moduleId] || 0, partialScore)
        },
        lastActivity: new Date().toISOString(),
        studyTime: prev.studyTime + updateStudyTime()
      };
      
      // 総スコア計算
      newProgress.totalScore = Object.values(newProgress.moduleScores).reduce((sum, score) => sum + score, 0);
      
      // レベル計算（100点で1レベルアップ）
      newProgress.currentLevel = Math.floor(newProgress.totalScore / 100) + 1;
      
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress, updateStudyTime]);

  // モジュール完了
  const completeModule = useCallback((moduleId: string, score: number) => {
    setProgress(prev => {
      if (prev.completedModules.includes(moduleId)) {
        // すでに完了している場合はスコアのみ更新
        return updateProgress(moduleId, score) as any;
      }

      const newProgress = {
        ...prev,
        completedModules: [...prev.completedModules, moduleId],
        moduleScores: {
          ...prev.moduleScores,
          [moduleId]: score
        },
        lastActivity: new Date().toISOString(),
        studyTime: prev.studyTime + updateStudyTime()
      };
      
      // 総スコア計算
      newProgress.totalScore = Object.values(newProgress.moduleScores).reduce((sum, score) => sum + score, 0);
      
      // レベル計算
      newProgress.currentLevel = Math.floor(newProgress.totalScore / 100) + 1;
      
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress, updateStudyTime, updateProgress]);

  // 進捗リセット
  const resetProgress = useCallback(() => {
    const resetData = {
      ...initialProgress,
      lastActivity: new Date().toISOString()
    };
    setProgress(resetData);
    saveProgress(resetData);
  }, [saveProgress]);

  // 完了率計算
  const calculateCompletionRate = useCallback((totalModules: number) => {
    return totalModules > 0 ? (progress.completedModules.length / totalModules) * 100 : 0;
  }, [progress.completedModules]);

  // 推奨学習時間の判定
  const getStudyTimeRecommendation = useCallback(() => {
    const studyMinutes = progress.studyTime / 60;
    
    if (studyMinutes < 5) {
      return { level: 'start', message: '学習を始めましょう！' };
    } else if (studyMinutes < 15) {
      return { level: 'good', message: '順調に学習中です' };
    } else if (studyMinutes < 30) {
      return { level: 'excellent', message: '素晴らしい集中力です！' };
    } else {
      return { level: 'break', message: '少し休憩しませんか？' };
    }
  }, [progress.studyTime]);

  // 学習統計の計算
  const getStatistics = useCallback(() => {
    const moduleCount = Object.keys(progress.moduleScores).length;
    const averageScore = moduleCount > 0 
      ? progress.totalScore / moduleCount 
      : 0;
    
    const highestScore = Math.max(...Object.values(progress.moduleScores), 0);
    const studyHours = Math.floor(progress.studyTime / 3600);
    const studyMinutes = Math.floor((progress.studyTime % 3600) / 60);
    
    return {
      averageScore: Math.round(averageScore),
      highestScore,
      studyTime: {
        hours: studyHours,
        minutes: studyMinutes,
        total: progress.studyTime
      },
      completionRate: calculateCompletionRate(4), // 4つのモジュール想定
      consecutiveDays: calculateConsecutiveDays()
    };
  }, [progress, calculateCompletionRate]);

  // 連続学習日数の計算
  const calculateConsecutiveDays = useCallback(() => {
    // 簡易実装：実際にはより詳細な日付管理が必要
    const lastActivity = new Date(progress.lastActivity);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays <= 1 ? 1 : 0; // 簡易実装
  }, [progress.lastActivity]);

  // マイルストーンの判定
  const checkMilestones = useCallback(() => {
    const milestones = [];
    
    if (progress.completedModules.length === 1) {
      milestones.push({ id: 'first_module', message: '初めてのモジュール完了！' });
    }
    
    if (progress.completedModules.length === 4) {
      milestones.push({ id: 'all_modules', message: 'すべてのモジュール完了！分数マスターです！' });
    }
    
    if (progress.totalScore >= 300) {
      milestones.push({ id: 'high_score', message: '300点達成！素晴らしい理解力です！' });
    }
    
    if (progress.currentLevel >= 5) {
      milestones.push({ id: 'high_level', message: 'レベル5達成！分数の達人です！' });
    }
    
    return milestones;
  }, [progress]);

  return {
    // 進捗データ
    progress,
    completedModules: progress.completedModules,
    currentLevel: progress.currentLevel,
    totalScore: progress.totalScore,
    
    // アクション
    updateProgress,
    completeModule,
    resetProgress,
    
    // 計算結果
    calculateCompletionRate,
    getStudyTimeRecommendation,
    getStatistics,
    checkMilestones
  };
};