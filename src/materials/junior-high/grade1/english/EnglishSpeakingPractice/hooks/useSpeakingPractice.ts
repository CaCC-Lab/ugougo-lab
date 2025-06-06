import { useState, useCallback, useEffect } from 'react';
import type { DialogueScenario, DialogueTurn } from '../data/dialogueScenarios';

interface PracticeState {
  currentScenario: DialogueScenario | null;
  currentTurnIndex: number;
  selectedOptions: Record<string, string>;
  arrangedWords: Record<string, string[]>;
  score: number;
  mistakes: number;
  completedScenarios: string[];
  feedbackMessages: Record<string, string>;
  showPronunciationHelp: boolean;
}

interface PracticeRecord {
  scenarioId: string;
  difficulty: string;
  score: number;
  mistakes: number;
  completedAt: Date;
  timeSpent: number;
}

export const useSpeakingPractice = () => {
  const [state, setState] = useState<PracticeState>({
    currentScenario: null,
    currentTurnIndex: 0,
    selectedOptions: {},
    arrangedWords: {},
    score: 0,
    mistakes: 0,
    completedScenarios: [],
    feedbackMessages: {},
    showPronunciationHelp: false
  });

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [practiceHistory, setPracticeHistory] = useState<PracticeRecord[]>([]);

  // ローカルストレージから学習履歴を読み込む
  useEffect(() => {
    const savedHistory = localStorage.getItem('englishSpeakingHistory');
    if (savedHistory) {
      setPracticeHistory(JSON.parse(savedHistory));
    }
  }, []);

  // シナリオを開始
  const startScenario = useCallback((scenario: DialogueScenario) => {
    setState({
      currentScenario: scenario,
      currentTurnIndex: 0,
      selectedOptions: {},
      arrangedWords: {},
      score: 0,
      mistakes: 0,
      completedScenarios: state.completedScenarios,
      feedbackMessages: {},
      showPronunciationHelp: false
    });
    setStartTime(new Date());
  }, [state.completedScenarios]);

  // 選択肢を選ぶ
  const selectOption = useCallback((turnId: string, optionId: string) => {
    const currentTurn = state.currentScenario?.dialogue[state.currentTurnIndex];
    if (!currentTurn || !currentTurn.options) return;

    const selectedOption = currentTurn.options.find(opt => opt.id === optionId);
    if (!selectedOption) return;

    setState(prev => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [turnId]: optionId
      },
      feedbackMessages: {
        ...prev.feedbackMessages,
        [turnId]: selectedOption.feedback || ''
      }
    }));

    // スコア計算
    if (selectedOption.isCorrect) {
      setState(prev => ({
        ...prev,
        score: prev.score + 10
      }));
    } else {
      setState(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1
      }));
    }
  }, [state.currentScenario, state.currentTurnIndex]);

  // 単語を並び替える
  const arrangeWords = useCallback((turnId: string, words: string[]) => {
    setState(prev => ({
      ...prev,
      arrangedWords: {
        ...prev.arrangedWords,
        [turnId]: words
      }
    }));
  }, []);

  // 並び替えの答え合わせ
  const checkArrangement = useCallback((turnId: string): boolean => {
    const currentTurn = state.currentScenario?.dialogue.find(turn => turn.id === turnId);
    if (!currentTurn || !currentTurn.correctOrder) return false;

    const arranged = state.arrangedWords[turnId] || [];
    const isCorrect = JSON.stringify(arranged) === JSON.stringify(currentTurn.correctOrder);

    if (isCorrect) {
      setState(prev => ({
        ...prev,
        score: prev.score + 15,
        feedbackMessages: {
          ...prev.feedbackMessages,
          [turnId]: '完璧です！正しい語順です。'
        }
      }));
    } else {
      setState(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1,
        feedbackMessages: {
          ...prev.feedbackMessages,
          [turnId]: `正解は: ${currentTurn.correctOrder.join(' ')}`
        }
      }));
    }

    return isCorrect;
  }, [state.currentScenario, state.arrangedWords]);

  // 次のターンへ進む
  const nextTurn = useCallback(() => {
    if (!state.currentScenario) return;

    const nextIndex = state.currentTurnIndex + 1;
    if (nextIndex < state.currentScenario.dialogue.length) {
      setState(prev => ({
        ...prev,
        currentTurnIndex: nextIndex
      }));
    } else {
      // シナリオ完了
      completeScenario();
    }
  }, [state.currentScenario, state.currentTurnIndex]);

  // シナリオを完了
  const completeScenario = useCallback(() => {
    if (!state.currentScenario || !startTime) return;

    const timeSpent = new Date().getTime() - startTime.getTime();
    const record: PracticeRecord = {
      scenarioId: state.currentScenario.id,
      difficulty: state.currentScenario.difficulty,
      score: state.score,
      mistakes: state.mistakes,
      completedAt: new Date(),
      timeSpent: Math.floor(timeSpent / 1000) // 秒単位
    };

    // 履歴に追加
    const newHistory = [...practiceHistory, record];
    setPracticeHistory(newHistory);
    localStorage.setItem('englishSpeakingHistory', JSON.stringify(newHistory));

    // 完了リストに追加
    setState(prev => ({
      ...prev,
      completedScenarios: [...prev.completedScenarios, state.currentScenario!.id]
    }));
  }, [state.currentScenario, state.score, state.mistakes, startTime, practiceHistory]);

  // 発音ヘルプの表示切り替え
  const togglePronunciationHelp = useCallback(() => {
    setState(prev => ({
      ...prev,
      showPronunciationHelp: !prev.showPronunciationHelp
    }));
  }, []);

  // 現在のターンを取得
  const getCurrentTurn = useCallback((): DialogueTurn | null => {
    if (!state.currentScenario) return null;
    return state.currentScenario.dialogue[state.currentTurnIndex];
  }, [state.currentScenario, state.currentTurnIndex]);

  // 進捗率を計算
  const getProgress = useCallback((): number => {
    if (!state.currentScenario) return 0;
    return ((state.currentTurnIndex + 1) / state.currentScenario.dialogue.length) * 100;
  }, [state.currentScenario, state.currentTurnIndex]);

  // スコア統計を取得
  const getStatistics = useCallback(() => {
    const scenarioStats = practiceHistory.reduce((acc, record) => {
      if (!acc[record.difficulty]) {
        acc[record.difficulty] = {
          totalScore: 0,
          totalMistakes: 0,
          count: 0,
          averageTime: 0
        };
      }
      acc[record.difficulty].totalScore += record.score;
      acc[record.difficulty].totalMistakes += record.mistakes;
      acc[record.difficulty].count += 1;
      acc[record.difficulty].averageTime += record.timeSpent;
      return acc;
    }, {} as Record<string, any>);

    // 平均を計算
    Object.keys(scenarioStats).forEach(difficulty => {
      const stats = scenarioStats[difficulty];
      stats.averageScore = Math.round(stats.totalScore / stats.count);
      stats.averageMistakes = Math.round(stats.totalMistakes / stats.count);
      stats.averageTime = Math.round(stats.averageTime / stats.count);
    });

    return scenarioStats;
  }, [practiceHistory]);

  // リセット
  const reset = useCallback(() => {
    setState({
      currentScenario: null,
      currentTurnIndex: 0,
      selectedOptions: {},
      arrangedWords: {},
      score: 0,
      mistakes: 0,
      completedScenarios: state.completedScenarios,
      feedbackMessages: {},
      showPronunciationHelp: false
    });
    setStartTime(null);
  }, [state.completedScenarios]);

  return {
    state,
    startScenario,
    selectOption,
    arrangeWords,
    checkArrangement,
    nextTurn,
    togglePronunciationHelp,
    getCurrentTurn,
    getProgress,
    getStatistics,
    reset,
    practiceHistory
  };
};