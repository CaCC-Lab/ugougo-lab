/**
 * 割合・百分率トレーナーのロジックを管理するカスタムフック
 * 
 * 責務：
 * - 割合の計算処理（精度を保った計算）
 * - 学習状態の管理
 * - 誤答パターンの分析
 * - 適応的ヒントの生成
 * - 進捗の追跡
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLearningStore } from '@stores/learningStore';
import type {
  LearningMode,
  PercentageProblem,
  PercentageProgress,
  FeedbackMessage,
  PercentageElements,
  ProblemType,
  PercentageFormat,
  ConversionUtils,
  GraphData,
  StatisticsData
} from '../types';

/**
 * 数値を指定した小数点以下の桁数で丸める
 */
const roundToDecimal = (value: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * 割合の要素を計算
 */
const calculatePercentageElements = (
  given: Partial<PercentageElements>
): PercentageElements => {
  let baseAmount = given.baseAmount || 0;
  let compareAmount = given.compareAmount || 0;
  let percentage = given.percentage || 0;
  let percentageValue = given.percentageValue || 0;
  
  // 2つの要素から残りを計算
  if (baseAmount && compareAmount && !percentage) {
    percentage = compareAmount / baseAmount;
    percentageValue = percentage * 100;
  } else if (baseAmount && percentage && !compareAmount) {
    compareAmount = baseAmount * percentage;
    percentageValue = percentage * 100;
  } else if (compareAmount && percentage && percentage !== 0 && !baseAmount) {
    baseAmount = compareAmount / percentage;
    percentageValue = percentage * 100;
  } else if (baseAmount && percentageValue && !compareAmount) {
    percentage = percentageValue / 100;
    compareAmount = baseAmount * percentage;
  }
  
  return {
    baseAmount: roundToDecimal(baseAmount),
    compareAmount: roundToDecimal(compareAmount),
    percentage: roundToDecimal(percentage, 4),
    percentageValue: roundToDecimal(percentageValue)
  };
};

/**
 * 変換ユーティリティの実装
 */
const conversionUtils: ConversionUtils = {
  decimalToPercentage: (decimal: number) => decimal * 100,
  percentageToDecimal: (percentage: number) => percentage / 100,
  
  decimalToFraction: (decimal: number) => {
    // 簡単な分数への変換（精度は限定的）
    const tolerance = 1e-6;
    let numerator = 1;
    let denominator = 1;
    let bestError = Math.abs(decimal);
    
    for (let d = 1; d <= 100; d++) {
      const n = Math.round(decimal * d);
      const error = Math.abs(decimal - n / d);
      if (error < bestError && error < tolerance) {
        numerator = n;
        denominator = d;
        bestError = error;
      }
    }
    
    // 約分
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const g = gcd(numerator, denominator);
    
    return {
      numerator: numerator / g,
      denominator: denominator / g
    };
  },
  
  fractionToDecimal: (numerator: number, denominator: number) => {
    return denominator !== 0 ? numerator / denominator : 0;
  },
  
  percentageToWaribun: (percentage: number) => {
    const wari = Math.floor(percentage / 10);
    const bu = Math.floor((percentage % 10) / 1);
    const rin = Math.floor(((percentage % 1) * 10)) / 10;
    
    return { wari, bu, rin };
  },
  
  waribunToPercentage: (waribun) => {
    return waribun.wari * 10 + waribun.bu * 1 + waribun.rin * 0.1;
  }
};

export const usePercentageLogic = () => {
  // 学習状態
  const [currentMode, setCurrentMode] = useState<LearningMode>('concept');
  const [currentProblem, setCurrentProblem] = useState<PercentageProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  // タイマーIDの管理用
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 進捗管理
  const [progress, setProgress] = useState<PercentageProgress>({
    currentMode: 'concept',
    completedModes: [],
    problemStats: {
      total: 0,
      correct: 0,
      byType: {
        findPercentage: { total: 0, correct: 0 },
        findCompareAmount: { total: 0, correct: 0 },
        findBaseAmount: { total: 0, correct: 0 },
        increase: { total: 0, correct: 0 },
        decrease: { total: 0, correct: 0 },
        compound: { total: 0, correct: 0 }
      },
      byDifficulty: {
        1: { total: 0, correct: 0 },
        2: { total: 0, correct: 0 },
        3: { total: 0, correct: 0 },
        4: { total: 0, correct: 0 },
        5: { total: 0, correct: 0 }
      }
    },
    commonMistakes: [],
    mastery: {
      concept: 0,
      calculation: 0,
      application: 0,
      overall: 0
    },
    timeSpent: 0,
    lastAccessed: new Date().toISOString()
  });
  
  // グラフデータ管理
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  
  // Zustandストアとの連携
  const { addRecord } = useLearningStore();
  
  // フィードバックの自動クリア関数
  const clearFeedbackAfter = useCallback((delay: number) => {
    // 既存のタイマーをクリア
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    
    // 新しいタイマーを設定
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
      feedbackTimerRef.current = null;
    }, delay);
  }, []);
  
  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);
  
  /**
   * 答えの検証
   */
  const checkAnswer = useCallback((userInput: string): boolean => {
    if (!currentProblem) return false;
    
    const userValue = parseFloat(userInput.replace(/[^\d.-]/g, ''));
    if (isNaN(userValue)) {
      setFeedback({
        type: 'error',
        title: '入力エラー',
        message: '数値を入力してください',
        details: '例: 25, 0.5, 100 など'
      });
      
      // 入力エラーフィードバックも3秒後に自動クリア
      clearFeedbackAfter(3000);
      
      return false;
    }
    
    // 答えの許容誤差（小数点以下の誤差を考慮）
    const tolerance = 0.01;
    const isCorrect = Math.abs(userValue - currentProblem.answer.value) < tolerance;
    
    if (isCorrect) {
      // 正解処理のフィードバック設定
      const successFeedback = {
        type: 'success' as const,
        title: '正解！',
        message: 'よくできました！',
        details: currentProblem.explanation,
        nextAction: '次の問題に進みましょう',
        visualFeedback: {
          type: 'confetti' as const,
          duration: 3000
        }
      };
      
      setFeedback(successFeedback);
      
      // visualFeedbackの自動クリア設定
      clearFeedbackAfter(successFeedback.visualFeedback.duration);
      
      // 進捗を更新（正解）
      setProgress(prev => {
        const newProgress = { ...prev };
        
        // 全体の統計
        newProgress.problemStats.total++;
        newProgress.problemStats.correct++;
        
        // タイプ別の統計
        newProgress.problemStats.byType[currentProblem.type].total++;
        newProgress.problemStats.byType[currentProblem.type].correct++;
        
        // 難易度別の統計
        newProgress.problemStats.byDifficulty[currentProblem.difficulty].total++;
        newProgress.problemStats.byDifficulty[currentProblem.difficulty].correct++;
        
        // 習熟度の更新
        const overallRate = newProgress.problemStats.correct / newProgress.problemStats.total;
        newProgress.mastery.overall = Math.round(overallRate * 100);
        
        return newProgress;
      });
      
      // 学習履歴に記録
      addRecord({
        materialId: 'percentage-trainer',
        timestamp: Date.now(),
        duration: Math.floor(progress.timeSpent), // 現在の学習時間（秒）
        score: 100, // 正解なので100点
        mistakes: [], // 正解なし
        hintsUsed: showHint ? currentHintIndex + 1 : 0,
        completed: true // 問題に答えたので完了とする
      });
      
      return true;
    } else {
      // 不正解処理
      analyzeMistake(userValue, currentProblem);
      setAttempts(prev => prev + 1);
      
      // 進捗を更新（不正解）
      setProgress(prev => {
        const newProgress = { ...prev };
        
        // 全体の統計
        newProgress.problemStats.total++;
        // 不正解なのでcorrectは増やさない
        
        // タイプ別の統計
        newProgress.problemStats.byType[currentProblem.type].total++;
        // 不正解なのでcorrectは増やさない
        
        // 難易度別の統計
        newProgress.problemStats.byDifficulty[currentProblem.difficulty].total++;
        // 不正解なのでcorrectは増やさない
        
        // 習熟度の更新
        const overallRate = newProgress.problemStats.correct / newProgress.problemStats.total;
        newProgress.mastery.overall = Math.round(overallRate * 100);
        
        return newProgress;
      });
      
      // 学習履歴に記録（不正解）
      addRecord({
        materialId: 'percentage-trainer',
        timestamp: Date.now(),
        duration: Math.floor(progress.timeSpent), // 現在の学習時間（秒）
        score: 0, // 不正解なので0点
        mistakes: [{
          problem: currentProblem.question,
          userAnswer: userValue.toString(),
          correctAnswer: currentProblem.answer.value.toString()
        }],
        hintsUsed: showHint ? currentHintIndex + 1 : 0,
        completed: false // 不正解なので未完了
      });
      
      // 3回間違えたらヒントを表示
      if (attempts >= 2) {
        setShowHint(true);
      }
      
      return false;
    }
  }, [currentProblem, attempts, addRecord, progress.timeSpent, showHint, currentHintIndex, clearFeedbackAfter]);
  
  /**
   * 誤答パターンの分析
   */
  const analyzeMistake = useCallback((userValue: number, problem: PercentageProblem) => {
    let mistakeType: PercentageProgress['commonMistakes'][0]['type'] = 'calculation';
    let message = '惜しい！もう一度計算してみよう';
    let details = '';
    
    const correctValue = problem.answer.value;
    
    // 計算ミスのパターン分析
    if (problem.type === 'findPercentage') {
      // 小数のまま答えた（100倍し忘れ）
      if (Math.abs(userValue * 100 - correctValue) < 0.01) {
        mistakeType = 'conversion';
        message = '小数を百分率に変換するのを忘れていませんか？';
        details = '小数に100をかけて%にしましょう';
      }
      // 逆の計算をした
      else if (problem.given.baseAmount && problem.given.compareAmount) {
        const reverse = problem.given.baseAmount / problem.given.compareAmount;
        if (Math.abs(userValue - reverse * 100) < 0.01) {
          mistakeType = 'concept';
          message = 'もとにする量と比べる量が逆になっていませんか？';
          details = '割合 = 比べる量 ÷ もとにする量';
        }
      }
    } else if (problem.type === 'findCompareAmount') {
      // 割合をそのまま使った（小数変換忘れ）
      if (problem.given.percentage && Math.abs(userValue - problem.given.baseAmount! * problem.given.percentage * 100) < 1) {
        mistakeType = 'conversion';
        message = '百分率を小数に変換しましたか？';
        details = '25%なら0.25として計算します';
      }
    }
    
    setFeedback({
      type: 'error',
      title: '残念...',
      message,
      details,
      nextAction: showHint ? 'ヒントを参考にしてみよう' : 'もう一度挑戦！'
    });
    
    // エラーフィードバックも5秒後に自動クリア
    clearFeedbackAfter(5000);
    
    // 誤答パターンを記録
    updateCommonMistakes(mistakeType, message);
  }, [showHint, clearFeedbackAfter]);
  
  
  /**
   * よくある間違いの更新
   */
  const updateCommonMistakes = useCallback((
    type: PercentageProgress['commonMistakes'][0]['type'],
    description: string
  ) => {
    setProgress(prev => {
      const mistakes = [...prev.commonMistakes];
      const existing = mistakes.find(m => m.type === type && m.description === description);
      
      if (existing) {
        existing.count++;
        existing.lastOccurred = new Date().toISOString();
      } else {
        mistakes.push({
          type,
          description,
          count: 1,
          lastOccurred: new Date().toISOString()
        });
      }
      
      // 最大10個まで保持（古いものから削除）
      if (mistakes.length > 10) {
        mistakes.sort((a, b) => new Date(b.lastOccurred).getTime() - new Date(a.lastOccurred).getTime());
        mistakes.splice(10);
      }
      
      return { ...prev, commonMistakes: mistakes };
    });
  }, []);
  
  /**
   * 次のヒントを表示
   */
  const showNextHint = useCallback(() => {
    if (!currentProblem || !currentProblem.hints) return;
    
    if (currentHintIndex < currentProblem.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
  }, [currentProblem, currentHintIndex]);
  
  /**
   * グラフデータの生成
   */
  const generateGraphData = useCallback((data: StatisticsData[], type: GraphData['type'] = 'pie'): GraphData => {
    return {
      type,
      title: 'データの割合',
      data,
      options: {
        showLegend: true,
        showValues: true,
        showPercentages: true,
        animate: true,
        interactive: true
      }
    };
  }, []);
  
  /**
   * 学習モードの変更
   */
  const changeMode = useCallback((newMode: LearningMode) => {
    setCurrentMode(newMode);
    setCurrentProblem(null);
    setUserAnswer('');
    setFeedback(null);
    setShowHint(false);
    setCurrentHintIndex(0);
    setAttempts(0);
    
    // モード完了の記録
    if (!progress.completedModes.includes(currentMode)) {
      setProgress(prev => ({
        ...prev,
        completedModes: [...prev.completedModes, currentMode],
        currentMode: newMode
      }));
    }
  }, [currentMode, progress.completedModes]);
  
  /**
   * 新しい問題を設定
   */
  const setNewProblem = useCallback((problem: PercentageProblem) => {
    setCurrentProblem(problem);
    setUserAnswer('');
    setFeedback(null);
    setShowHint(false);
    setCurrentHintIndex(0);
    setAttempts(0);
  }, []);
  
  /**
   * 時間経過の追跡（効率化版）
   */
  useEffect(() => {
    let startTime = Date.now();
    let timer: NodeJS.Timeout;
    
    // 10秒ごとに更新して無限レンダリングを防止
    const updateTime = () => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setProgress(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + elapsedSeconds,
        lastAccessed: new Date().toISOString()
      }));
      startTime = Date.now();
    };
    
    timer = setInterval(updateTime, 10000); // 10秒ごとに更新
    
    return () => {
      if (timer) clearInterval(timer);
      // コンポーネント終了時に最終時間を更新
      updateTime();
    };
  }, []);
  
  return {
    // 状態
    currentMode,
    currentProblem,
    userAnswer,
    feedback,
    showHint,
    currentHintIndex,
    attempts,
    progress,
    graphData,
    
    // アクション
    setUserAnswer,
    checkAnswer,
    changeMode,
    setNewProblem,
    showNextHint,
    generateGraphData,
    
    // ユーティリティ
    calculatePercentageElements,
    conversionUtils,
    roundToDecimal
  };
};