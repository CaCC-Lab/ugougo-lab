import { useCallback, useRef, useEffect } from 'react';
import { useLearningStore } from '../stores/learningStore';
import type { LearningRecord } from '../stores/learningStore';

export interface UseLearningTrackerOptions {
  materialId: string;
  materialName?: string;
  minDuration?: number; // 最小記録時間（秒）
  autoSave?: boolean; // 自動保存の有効/無効
}

interface InteractionData {
  clicks: number;
  drags: number;
  keys: number;
  hints: number;
  answers: {
    correct: number;
    incorrect: number;
  };
}

interface MistakeData {
  problem: string;
  userAnswer: string;
  correctAnswer: string;
  timestamp: number;
}

/**
 * 学習追跡用のカスタムフック
 * 教材の使用時間、インタラクション、成績を自動的に記録します
 */
export const useLearningTracker = ({
  materialId,
  materialName,
  minDuration = 10, // デフォルト10秒以上で記録
  autoSave = true,
}: UseLearningTrackerOptions) => {
  // Zustandストアから必要な関数を取得
  const { addRecord, updateProgress, getProgress } = useLearningStore();
  
  // 学習セッションの開始時刻
  const startTimeRef = useRef<number>(Date.now());
  
  // インタラクションデータ
  const interactionsRef = useRef<InteractionData>({
    clicks: 0,
    drags: 0,
    keys: 0,
    hints: 0,
    answers: {
      correct: 0,
      incorrect: 0,
    },
  });
  
  // 間違いの記録
  const mistakesRef = useRef<MistakeData[]>([]);
  
  // セッションが保存されたかのフラグ
  const savedRef = useRef(false);
  
  // 現在の進捗を取得
  const currentProgress = getProgress(materialId);

  /**
   * インタラクションを記録
   */
  const recordInteraction = useCallback((type: 'click' | 'drag' | 'key' | 'hint' = 'click') => {
    switch (type) {
      case 'click':
        interactionsRef.current.clicks++;
        break;
      case 'drag':
        interactionsRef.current.drags++;
        break;
      case 'key':
        interactionsRef.current.keys++;
        break;
      case 'hint':
        interactionsRef.current.hints++;
        break;
    }
  }, []);

  /**
   * 回答を記録
   */
  const recordAnswer = useCallback((isCorrect: boolean, details?: {
    problem?: string;
    userAnswer?: string;
    correctAnswer?: string;
  }) => {
    if (isCorrect) {
      interactionsRef.current.answers.correct++;
    } else {
      interactionsRef.current.answers.incorrect++;
      
      // 間違いの詳細を記録
      if (details && details.problem) {
        mistakesRef.current.push({
          problem: details.problem || '',
          userAnswer: details.userAnswer || '',
          correctAnswer: details.correctAnswer || '',
          timestamp: Date.now(),
        });
      }
    }
  }, []);

  /**
   * ヒントの使用を記録
   */
  const recordHintUsed = useCallback(() => {
    interactionsRef.current.hints++;
  }, []);

  /**
   * セッションのスコアを計算
   */
  const calculateScore = useCallback((): number => {
    const { correct, incorrect } = interactionsRef.current.answers;
    const total = correct + incorrect;
    
    if (total === 0) {
      // 回答がない場合は、セッション時間に基づいてスコアを計算
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      return duration >= 60 ? 50 : Math.floor((duration / 60) * 50);
    }
    
    // 正答率をスコアとして使用
    const accuracy = (correct / total) * 100;
    
    // ヒントの使用によるペナルティ（最大10点減点）
    const hintPenalty = Math.min(interactionsRef.current.hints * 2, 10);
    
    return Math.max(0, Math.round(accuracy - hintPenalty));
  }, []);

  /**
   * セッションデータを保存
   */
  const saveSession = useCallback(() => {
    if (savedRef.current || !autoSave) return;
    
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    // 最小記録時間に満たない場合はスキップ
    if (duration < minDuration) return;
    
    const score = calculateScore();
    const { correct, incorrect } = interactionsRef.current.answers;
    const completed = correct + incorrect > 0 || duration > 60;
    
    // 学習記録を保存
    const record: LearningRecord = {
      materialId,
      timestamp: Date.now(),
      duration,
      score,
      mistakes: mistakesRef.current.slice(0, 10), // 最大10個の間違いを記録
      hintsUsed: interactionsRef.current.hints,
      completed,
    };
    
    addRecord(record);
    
    // 進捗を更新
    updateProgress(materialId, {
      concept: materialName || materialId,
      lastAccessed: Date.now(),
    });
    
    savedRef.current = true;
  }, [materialId, materialName, minDuration, autoSave, calculateScore, addRecord, updateProgress]);

  /**
   * セッションをリセット（新しいセッションを開始）
   */
  const resetSession = useCallback(() => {
    startTimeRef.current = Date.now();
    interactionsRef.current = {
      clicks: 0,
      drags: 0,
      keys: 0,
      hints: 0,
      answers: {
        correct: 0,
        incorrect: 0,
      },
    };
    mistakesRef.current = [];
    savedRef.current = false;
  }, []);

  /**
   * 現在のセッション情報を取得
   */
  const getSessionInfo = useCallback(() => {
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const score = calculateScore();
    const { correct, incorrect } = interactionsRef.current.answers;
    
    return {
      duration,
      score,
      totalInteractions: 
        interactionsRef.current.clicks +
        interactionsRef.current.drags +
        interactionsRef.current.keys,
      hintsUsed: interactionsRef.current.hints,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      accuracy: correct + incorrect > 0 ? (correct / (correct + incorrect)) * 100 : 0,
    };
  }, [calculateScore]);

  // コンポーネントのアンマウント時に自動保存
  useEffect(() => {
    return () => {
      if (autoSave && !savedRef.current) {
        saveSession();
      }
    };
  }, [autoSave, saveSession]);

  // グローバルなクリックイベントの追跡（オプション）
  useEffect(() => {
    const handleGlobalClick = () => {
      recordInteraction('click');
    };
    
    // パフォーマンスを考慮して、デフォルトでは無効
    // 必要に応じて有効化できます
    // document.addEventListener('click', handleGlobalClick);
    
    return () => {
      // document.removeEventListener('click', handleGlobalClick);
    };
  }, [recordInteraction]);

  return {
    // 記録関数
    recordInteraction,
    recordAnswer,
    recordHintUsed,
    recordActivity: recordInteraction, // エイリアス
    
    // セッション管理
    saveSession,
    resetSession,
    getSessionInfo,
    
    // 現在の進捗
    currentProgress,
    updateProgress: saveSession, // エイリアス（進捗更新として保存機能を使用）
    getProgress: () => currentProgress, // エイリアス
    
    // 生データへのアクセス（デバッグ用）
    _debug: {
      startTime: startTimeRef.current,
      interactions: interactionsRef.current,
      mistakes: mistakesRef.current,
    },
  };
};