import { useState, useCallback, useEffect } from 'react';
import type { LearningProgress, LearningModule } from '../types';

const STORAGE_KEY = 'abstract-thinking-bridge-progress';

export const useLearningProgress = () => {
  const [progress, setProgress] = useState<LearningProgress>({});

  // ローカルストレージから進捗を読み込み
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    }
  }, []);

  // 進捗を更新
  const updateProgress = useCallback((moduleId: string, conceptId: string) => {
    setProgress(prev => {
      const updated = {
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          [conceptId]: true
        }
      };
      
      // ローカルストレージに保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  // 次に推奨されるモジュールを取得
  const getRecommendedModule = useCallback((modules: LearningModule[]) => {
    // 各モジュールの完了率を計算
    const moduleCompletions = modules.map(module => {
      const moduleProgress = progress[module.id] || {};
      const completedCount = Object.values(moduleProgress).filter(Boolean).length;
      const totalConcepts = 5; // 各モジュールの概念数（実際の実装に応じて調整）
      const completionRate = completedCount / totalConcepts;
      
      return {
        module,
        completionRate
      };
    });

    // 完了していないモジュールの中で最も進捗が進んでいるものを推奨
    const incomplete = moduleCompletions.filter(m => m.completionRate < 1);
    if (incomplete.length === 0) return null;

    // 進捗が0のモジュールがあれば最初のものを推奨
    const notStarted = incomplete.filter(m => m.completionRate === 0);
    if (notStarted.length > 0) return notStarted[0].module;

    // それ以外は最も進捗が進んでいるものを推奨
    return incomplete.reduce((prev, curr) => 
      curr.completionRate > prev.completionRate ? curr : prev
    ).module;
  }, [progress]);

  // 全体の進捗率を計算
  const getOverallProgress = useCallback(() => {
    const allModules = Object.keys(progress);
    if (allModules.length === 0) return 0;

    let totalConcepts = 0;
    let masteredConcepts = 0;

    allModules.forEach(moduleId => {
      const moduleProgress = progress[moduleId];
      const concepts = Object.keys(moduleProgress);
      totalConcepts += concepts.length;
      masteredConcepts += concepts.filter(conceptId => moduleProgress[conceptId]).length;
    });

    return totalConcepts > 0 ? (masteredConcepts / totalConcepts) * 100 : 0;
  }, [progress]);

  // 特定のモジュールの進捗率を取得
  const getModuleProgress = useCallback((moduleId: string) => {
    const moduleProgress = progress[moduleId] || {};
    const concepts = Object.keys(moduleProgress);
    if (concepts.length === 0) return 0;

    const masteredCount = concepts.filter(conceptId => moduleProgress[conceptId]).length;
    return (masteredCount / concepts.length) * 100;
  }, [progress]);

  // 進捗をリセット
  const resetProgress = useCallback(() => {
    setProgress({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    progress,
    updateProgress,
    getRecommendedModule,
    getOverallProgress,
    getModuleProgress,
    resetProgress
  };
};