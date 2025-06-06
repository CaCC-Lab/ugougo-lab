import React, { useState, useEffect, useCallback } from 'react';

interface Problem {
  id: string;
  equation?: string;
  expression?: string;
  answer: number | string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface LearningProgress {
  completedStages: number[];
  totalProblems: number;
  correctAnswers: number;
  timeSpent: number;
  misconceptionCount: Record<string, number>;
}

const useAlgebraLearning = () => {
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [progress, setProgress] = useState<LearningProgress>({
    completedStages: [],
    totalProblems: 0,
    correctAnswers: 0,
    timeSpent: 0,
    misconceptionCount: {}
  });
  const [misconceptions, setMisconceptions] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // 問題のデータベース（useCallbackの外で定義してメモ化）
  const problemDatabase = React.useMemo<Problem[]>(() => [
    // Stage 3の問題
    { id: 'eq1', equation: 'x + 3 = 8', answer: 5, difficulty: 'easy' },
    { id: 'eq2', equation: '2x + 1 = 7', answer: 3, difficulty: 'easy' },
    { id: 'eq3', equation: '3x - 2 = 10', answer: 4, difficulty: 'medium' },
    { id: 'eq4', equation: '4x + 5 = 21', answer: 4, difficulty: 'medium' },
    { id: 'eq5', equation: '5x - 3 = 17', answer: 4, difficulty: 'hard' },
    // 式の操作問題
    { id: 'expr1', expression: '2x + 3', answer: 'simplified', difficulty: 'easy' },
    { id: 'expr2', expression: '3x + 2x', answer: '5x', difficulty: 'easy' },
    { id: 'expr3', expression: '4x + 3 - x', answer: '3x + 3', difficulty: 'medium' }
  ], []);

  // 時間経過を記録
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setProgress(prev => ({ ...prev, timeSpent: elapsed }));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // ローカルストレージから進捗を読み込み
  useEffect(() => {
    const savedProgress = localStorage.getItem('algebraIntroductionProgress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);

  // 進捗をローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('algebraIntroductionProgress', JSON.stringify(progress));
  }, [progress]);

  // 答えを記録
  const recordAnswer = useCallback((correct: boolean) => {
    setProgress(prev => ({
      ...prev,
      totalProblems: prev.totalProblems + 1,
      correctAnswers: prev.correctAnswers + (correct ? 1 : 0)
    }));
  }, []);

  // 誤解パターンを記録
  const recordMisconception = useCallback((type: string) => {
    setMisconceptions(prev => [...prev, type]);
    setProgress(prev => ({
      ...prev,
      misconceptionCount: {
        ...prev.misconceptionCount,
        [type]: (prev.misconceptionCount[type] || 0) + 1
      }
    }));
  }, []);

  // ステージ完了を記録
  const completeStage = useCallback((stageId: number) => {
    setProgress(prev => ({
      ...prev,
      completedStages: [...new Set([...prev.completedStages, stageId])]
    }));
  }, []);

  // 次の問題を取得
  const getNextProblem = useCallback(() => {
    // 完了していない問題を探す
    const availableProblems = problemDatabase.filter(() => {
      // ここで既に解いた問題を除外するロジックを追加可能
      return true;
    });

    if (availableProblems.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableProblems.length);
      setCurrentProblem(availableProblems[randomIndex]);
    }
  }, [problemDatabase]);

  // 進捗をリセット
  const resetProgress = useCallback(() => {
    setProgress({
      completedStages: [],
      totalProblems: 0,
      correctAnswers: 0,
      timeSpent: 0,
      misconceptionCount: {}
    });
    setMisconceptions([]);
    setStartTime(Date.now());
    localStorage.removeItem('algebraIntroductionProgress');
  }, []);

  // 初回は最初の問題を設定
  useEffect(() => {
    if (!currentProblem) {
      getNextProblem();
    }
  }, [currentProblem, getNextProblem]);

  return {
    currentProblem,
    progress,
    misconceptions,
    recordAnswer,
    recordMisconception,
    completeStage,
    getNextProblem,
    resetProgress
  };
};

export default useAlgebraLearning;