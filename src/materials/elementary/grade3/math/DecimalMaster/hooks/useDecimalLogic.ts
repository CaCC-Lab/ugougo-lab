/**
 * 小数マスターのロジックを管理するカスタムフック
 * 
 * 責務：
 * - 小数の計算処理（精度を保った計算）
 * - 学習状態の管理
 * - 誤答パターンの分析
 * - 適応的ヒントの生成
 */

import { useState, useCallback, useEffect } from 'react';
import { useLearningStore } from '@/stores/learningStore';
import type {
  DecimalNumber,
  LearningMode,
  DecimalProblem,
  MistakePattern,
  DecimalLearningProgress,
  FeedbackMessage,
  PlaceValueState
} from '../types';

/**
 * 小数を安全に作成するヘルパー関数
 * JavaScriptの浮動小数点誤差を回避
 */
const createDecimalNumber = (value: number): DecimalNumber => {
  // 小数点以下2桁で丸める（小学生向けなので十分）
  const rounded = Math.round(value * 100) / 100;
  const integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100) / 100;
  
  return {
    integerPart,
    decimalPart,
    value: rounded,
    displayString: rounded.toFixed(2).replace(/\.?0+$/, '') // 末尾の0を削除
  };
};

/**
 * 位取り板から小数を作成
 */
const placeValueToDecimal = (placeValue: PlaceValueState): DecimalNumber => {
  const value = placeValue.hundreds * 100 +
                placeValue.tens * 10 +
                placeValue.ones * 1 +
                placeValue.tenths * 0.1 +
                placeValue.hundredths * 0.01;
  
  return createDecimalNumber(value);
};

/**
 * 小数から位取り板の状態を作成
 */
const decimalToPlaceValue = (decimal: DecimalNumber): PlaceValueState => {
  const hundreds = Math.floor(decimal.value / 100);
  const tens = Math.floor((decimal.value % 100) / 10);
  const ones = Math.floor(decimal.value % 10);
  const tenths = Math.floor((decimal.value * 10) % 10);
  const hundredths = Math.floor((decimal.value * 100) % 10);
  
  return { hundreds, tens, ones, tenths, hundredths };
};

export const useDecimalLogic = () => {
  // 学習状態
  const [currentMode, setCurrentMode] = useState<LearningMode>('concept');
  const [currentProblem, setCurrentProblem] = useState<DecimalProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  // 進捗管理
  const [progress, setProgress] = useState<DecimalLearningProgress>({
    currentMode: 'concept',
    completedModes: [],
    totalProblems: 0,
    correctAnswers: 0,
    commonMistakes: [],
    timeSpent: 0,
    lastAccessed: new Date().toISOString()
  });
  
  // 視覚的状態
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [placeValueState, setPlaceValueState] = useState<PlaceValueState>({
    hundreds: 0,
    tens: 0,
    ones: 0,
    tenths: 0,
    hundredths: 0
  });
  
  // Zustandストアとの連携
  const { recordActivity } = useLearningStore();
  
  /**
   * 小数の加算（筆算アルゴリズム）
   */
  const addDecimals = useCallback((a: DecimalNumber, b: DecimalNumber): DecimalNumber => {
    // 小数点を揃えて計算
    const result = a.value + b.value;
    return createDecimalNumber(result);
  }, []);
  
  /**
   * 小数の減算
   */
  const subtractDecimals = useCallback((a: DecimalNumber, b: DecimalNumber): DecimalNumber => {
    const result = a.value - b.value;
    return createDecimalNumber(result);
  }, []);
  
  /**
   * 答えの検証と誤答分析
   */
  const checkAnswer = useCallback((userInput: string): boolean => {
    if (!currentProblem) return false;
    
    const userValue = parseFloat(userInput);
    if (isNaN(userValue)) {
      setFeedback({
        type: 'error',
        message: '数字を入力してください',
        detailedExplanation: '小数点を使って答えを入力してね（例：1.5）'
      });
      return false;
    }
    
    const isCorrect = Math.abs(userValue - currentProblem.answer.value) < 0.001;
    
    if (isCorrect) {
      setFeedback({
        type: 'success',
        message: '正解！よくできました！',
        nextStep: '次の問題に進みましょう'
      });
      
      // 進捗を更新
      setProgress(prev => ({
        ...prev,
        totalProblems: prev.totalProblems + 1,
        correctAnswers: prev.correctAnswers + 1
      }));
      
      // 学習履歴に記録
      recordActivity({
        materialId: 'decimal-master',
        action: 'answered',
        data: {
          problem: currentProblem,
          userAnswer: userValue,
          correct: true,
          attempts: attempts + 1
        }
      });
      
      return true;
    } else {
      // 誤答パターンの分析
      analyzeMistake(userValue, currentProblem.answer.value);
      
      setAttempts(prev => prev + 1);
      
      if (attempts >= 2) {
        setShowHint(true);
      }
      
      return false;
    }
  }, [currentProblem, attempts, recordActivity]);
  
  /**
   * 誤答パターンの分析
   */
  const analyzeMistake = useCallback((userValue: number, correctValue: number) => {
    let mistakeType: MistakePattern['type'] = 'conceptual';
    let message = '惜しい！もう一度考えてみよう';
    let hint = '';
    
    // 位取りの間違い（10倍や1/10の誤差）
    if (Math.abs(userValue * 10 - correctValue) < 0.001 || 
        Math.abs(userValue / 10 - correctValue) < 0.001) {
      mistakeType = 'placeValue';
      message = '小数点の位置に注意しよう';
      hint = '0.1は「10分の1」、0.01は「100分の1」だよ';
    }
    
    // 小数点の位置合わせの間違い
    else if (currentProblem?.type === 'addition' || currentProblem?.type === 'subtraction') {
      const userDecimal = createDecimalNumber(userValue);
      const correctDecimal = createDecimalNumber(correctValue);
      
      if (userDecimal.integerPart === correctDecimal.integerPart) {
        mistakeType = 'alignment';
        message = '小数部分の計算を確認してみよう';
        hint = '小数点の位置を縦に揃えて計算することが大切だよ';
      }
    }
    
    setFeedback({
      type: 'error',
      message,
      detailedExplanation: hint
    });
    
    // 誤答パターンを記録
    setProgress(prev => {
      const mistakes = [...prev.commonMistakes];
      const existingMistake = mistakes.find(m => m.type === mistakeType);
      
      if (existingMistake) {
        existingMistake.count++;
        existingMistake.lastOccurred = new Date().toISOString();
      } else {
        mistakes.push({
          type: mistakeType,
          count: 1,
          lastOccurred: new Date().toISOString(),
          description: message
        });
      }
      
      return { ...prev, commonMistakes: mistakes };
    });
  }, [currentProblem]);
  
  /**
   * グリッドセルのハイライト切り替え
   */
  const toggleCellHighlight = useCallback((row: number, col: number) => {
    const key = `${row}-${col}`;
    setHighlightedCells(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);
  
  /**
   * 位取り板の値を更新
   */
  const updatePlaceValue = useCallback((place: keyof PlaceValueState, delta: number) => {
    setPlaceValueState(prev => {
      const newState = { ...prev };
      newState[place] = Math.max(0, Math.min(9, prev[place] + delta));
      return newState;
    });
  }, []);
  
  /**
   * 新しい問題を生成
   */
  const generateNewProblem = useCallback((mode: LearningMode) => {
    // ここで難易度に応じた問題を生成
    // 実装は問題データファイルと連携
    setAttempts(0);
    setShowHint(false);
    setUserAnswer('');
    setFeedback(null);
  }, []);
  
  /**
   * 学習モードの切り替え
   */
  const changeMode = useCallback((newMode: LearningMode) => {
    setCurrentMode(newMode);
    generateNewProblem(newMode);
    
    // モード完了の記録
    if (!progress.completedModes.includes(currentMode)) {
      setProgress(prev => ({
        ...prev,
        completedModes: [...prev.completedModes, currentMode],
        currentMode: newMode
      }));
    }
  }, [currentMode, progress.completedModes, generateNewProblem]);
  
  /**
   * ヒントの生成（個別最適化）
   */
  const generateHint = useCallback((): string => {
    if (!currentProblem) return '';
    
    // 誤答パターンに基づいてヒントを調整
    const mostCommonMistake = progress.commonMistakes
      .sort((a, b) => b.count - a.count)[0];
    
    if (mostCommonMistake?.type === 'placeValue') {
      return '位取り板を使って、それぞれの位の数字を確認してみよう';
    } else if (mostCommonMistake?.type === 'alignment') {
      return '小数点の位置を縦に揃えて、右端から計算を始めよう';
    }
    
    // デフォルトのヒント
    return currentProblem.hint || 'ゆっくり考えて、一つずつ確認してみよう';
  }, [currentProblem, progress.commonMistakes]);
  
  // 初期化
  useEffect(() => {
    generateNewProblem(currentMode);
  }, []);
  
  return {
    // 状態
    currentMode,
    currentProblem,
    userAnswer,
    feedback,
    showHint,
    progress,
    highlightedCells,
    placeValueState,
    
    // アクション
    setUserAnswer,
    checkAnswer,
    changeMode,
    generateNewProblem,
    toggleCellHighlight,
    updatePlaceValue,
    generateHint,
    
    // ユーティリティ
    createDecimalNumber,
    placeValueToDecimal,
    decimalToPlaceValue,
    addDecimals,
    subtractDecimals
  };
};