/**
 * 一次方程式ビルダーのロジックフック
 * 
 * 機能：
 * - 方程式の操作と変形管理
 * - 解法ステップの記録と検証
 * - 天秤のバランス状態管理
 * - 誤答パターンの分析
 * - 学習進捗の追跡
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLearningTracker } from '@hooks/useLearningTracker';
import type {
  Equation,
  EquationProblem,
  SolutionStep,
  Operation,
  BalanceState,
  BalanceItem,
  TransformationHistory,
  ValidationResult,
  EquationProgress,
  MistakeType,
  LearningMode,
  FeedbackMessage,
  DragDropState
} from '../types';

/**
 * 方程式ロジックのカスタムフック
 */
export const useEquationLogic = (initialProblem?: EquationProblem) => {
  const { recordActivity, updateProgress, getProgress } = useLearningTracker({
    materialId: 'equation-builder',
    materialName: '一次方程式ビルダー'
  });
  
  // 現在の問題と方程式の状態
  const [currentProblem, setCurrentProblem] = useState<EquationProblem | null>(initialProblem || null);
  const [currentEquation, setCurrentEquation] = useState<Equation | null>(
    initialProblem?.equation || null
  );
  
  // 解法履歴
  const [transformationHistory, setTransformationHistory] = useState<TransformationHistory>({
    steps: initialProblem ? [initialProblem.solutionSteps[0]] : [],
    currentStepIndex: 0,
    canUndo: false,
    canRedo: false
  });
  
  // 天秤の状態
  const [balanceState, setBalanceState] = useState<BalanceState>({
    leftWeight: 0,
    rightWeight: 0,
    isBalanced: true,
    tiltAngle: 0,
    items: []
  });
  
  // ドラッグ＆ドロップの状態
  const [dragDropState, setDragDropState] = useState<DragDropState>({
    isDragging: false,
    draggedItem: null,
    dropTarget: null,
    isValidDrop: false
  });
  
  // ユーザーの解答と検証
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [currentHintIndex, setCurrentHintIndex] = useState<number>(0);
  
  // 学習進捗のデフォルト値
  const defaultProgress: EquationProgress = {
    currentMode: 'concept',
    completedModes: [],
    problemStats: {
      total: 0,
      correct: 0,
      byMode: {} as Record<LearningMode, { total: number; correct: number }>,
      byDifficulty: {}
    },
    commonMistakes: [],
    mastery: {
      conceptUnderstanding: 0,
      calculationSkill: 0,
      applicationAbility: 0,
      overall: 0
    },
    timeSpent: 0,
    lastAccessed: new Date().toISOString()
  };

  // 学習進捗
  const [progress, setProgress] = useState<EquationProgress>(() => {
    try {
      const savedProgress = getProgress();
      return savedProgress || defaultProgress;
    } catch (error) {
      console.warn('Failed to load progress, using defaults:', error);
      return defaultProgress;
    }
  });
  
  // タイマー管理
  const startTimeRef = useRef<number>(Date.now());
  const totalTimeRef = useRef<number>(0);
  
  /**
   * 方程式から天秤の状態を更新
   */
  const updateBalanceFromEquation = useCallback((equation: Equation) => {
    const items: BalanceItem[] = [];
    let leftWeight = 0;
    let rightWeight = 0;
    
    // 左辺のアイテム
    equation.leftSide.forEach((term, index) => {
      if (term.variable) {
        items.push({
          id: `left-var-${index}`,
          side: 'left',
          type: 'variable',
          value: term.coefficient,
          label: term.coefficient === 1 ? 'x' : term.coefficient === -1 ? '-x' : `${term.coefficient}x`,
          position: { x: 100 + index * 60, y: 200 },
          color: term.color || '#3498DB'
        });
        // 変数の重さは解がわかっている場合のみ計算
        if (equation.solution !== undefined) {
          leftWeight += term.coefficient * equation.solution;
        }
      } else if (term.constant !== undefined) {
        items.push({
          id: `left-const-${index}`,
          side: 'left',
          type: 'constant',
          value: term.constant,
          label: term.constant.toString(),
          position: { x: 100 + index * 60, y: 200 },
          color: term.color || '#2ECC71'
        });
        leftWeight += term.constant;
      }
    });
    
    // 右辺のアイテム
    equation.rightSide.forEach((term, index) => {
      if (term.variable) {
        items.push({
          id: `right-var-${index}`,
          side: 'right',
          type: 'variable',
          value: term.coefficient,
          label: term.coefficient === 1 ? 'x' : term.coefficient === -1 ? '-x' : `${term.coefficient}x`,
          position: { x: 400 + index * 60, y: 200 },
          color: term.color || '#E74C3C'
        });
        if (equation.solution !== undefined) {
          rightWeight += term.coefficient * equation.solution;
        }
      } else if (term.constant !== undefined) {
        items.push({
          id: `right-const-${index}`,
          side: 'right',
          type: 'constant',
          value: term.constant,
          label: term.constant.toString(),
          position: { x: 400 + index * 60, y: 200 },
          color: term.color || '#F39C12'
        });
        rightWeight += term.constant;
      }
    });
    
    // バランス状態を計算
    const isBalanced = Math.abs(leftWeight - rightWeight) < 0.001;
    const tiltAngle = isBalanced ? 0 : 
      Math.max(-45, Math.min(45, (rightWeight - leftWeight) * 5));
    
    setBalanceState({
      leftWeight,
      rightWeight,
      isBalanced,
      tiltAngle,
      items
    });
  }, []);
  
  /**
   * 方程式に操作を適用
   */
  const applyOperation = useCallback((operation: Operation): boolean => {
    if (!currentEquation) return false;
    
    const newEquation: Equation = {
      ...currentEquation,
      leftSide: [...currentEquation.leftSide],
      rightSide: [...currentEquation.rightSide]
    };
    
    try {
      switch (operation.type) {
        case 'add':
        case 'subtract': {
          const addValue = operation.type === 'add' ? operation.value! : -operation.value!;
          
          if (operation.targetSide === 'both' || operation.targetSide === 'left') {
            // 定数項があるか確認
            const leftConstIndex = newEquation.leftSide.findIndex(term => term.constant !== undefined);
            if (leftConstIndex >= 0) {
              newEquation.leftSide[leftConstIndex].constant! += addValue;
            } else {
              newEquation.leftSide.push({
                coefficient: 0,
                constant: addValue,
                isVisible: true,
                color: '#2ECC71'
              });
            }
          }
          
          if (operation.targetSide === 'both' || operation.targetSide === 'right') {
            const rightConstIndex = newEquation.rightSide.findIndex(term => term.constant !== undefined);
            if (rightConstIndex >= 0) {
              newEquation.rightSide[rightConstIndex].constant! += addValue;
            } else {
              newEquation.rightSide.push({
                coefficient: 0,
                constant: addValue,
                isVisible: true,
                color: '#F39C12'
              });
            }
          }
          break;
        }
          
        case 'multiply':
        case 'divide': {
          const factor = operation.type === 'multiply' ? operation.value! : 1 / operation.value!;
          
          if (operation.targetSide === 'both' || operation.targetSide === 'left') {
            newEquation.leftSide = newEquation.leftSide.map(term => ({
              ...term,
              coefficient: term.variable ? term.coefficient * factor : term.coefficient,
              constant: term.constant !== undefined ? term.constant * factor : term.constant
            }));
          }
          
          if (operation.targetSide === 'both' || operation.targetSide === 'right') {
            newEquation.rightSide = newEquation.rightSide.map(term => ({
              ...term,
              coefficient: term.variable ? term.coefficient * factor : term.coefficient,
              constant: term.constant !== undefined ? term.constant * factor : term.constant
            }));
          }
          break;
        }
          
        case 'transpose':
          // 移項の実装（符号を変えて反対側に移動）
          // この実装は簡略化されています
          break;
          
        case 'simplify':
          // 同類項をまとめる
          newEquation.leftSide = simplifyTerms(newEquation.leftSide);
          newEquation.rightSide = simplifyTerms(newEquation.rightSide);
          break;
      }
      
      // 新しい方程式を設定
      setCurrentEquation(newEquation);
      updateBalanceFromEquation(newEquation);
      
      // 履歴に追加
      const newStep: SolutionStep = {
        id: `step-${Date.now()}`,
        stepNumber: transformationHistory.steps.length + 1,
        description: operation.description,
        equation: newEquation,
        operation,
        explanation: `${operation.description}を実行しました`
      };
      
      setTransformationHistory(prev => ({
        steps: [...prev.steps, newStep],
        currentStepIndex: prev.steps.length,
        canUndo: true,
        canRedo: false
      }));
      
      // アクティビティを記録
      recordActivity({
        action: 'apply_operation',
        value: operation.type,
        metadata: {
          description: operation.description,
          targetSide: operation.targetSide,
          value: operation.value
        }
      });
      
      return true;
    } catch (error) {
      console.error('操作の適用に失敗しました:', error);
      return false;
    }
  }, [currentEquation, transformationHistory, recordActivity, updateBalanceFromEquation]);
  
  /**
   * 同類項をまとめる
   */
  const simplifyTerms = (terms: typeof currentEquation.leftSide): typeof currentEquation.leftSide => {
    const simplified: typeof terms = [];
    let variableCoef = 0;
    let constantValue = 0;
    
    terms.forEach(term => {
      if (term.variable) {
        variableCoef += term.coefficient;
      } else if (term.constant !== undefined) {
        constantValue += term.constant;
      }
    });
    
    if (variableCoef !== 0) {
      simplified.push({
        coefficient: variableCoef,
        variable: 'x',
        isVisible: true,
        color: '#3498DB'
      });
    }
    
    if (constantValue !== 0) {
      simplified.push({
        coefficient: 0,
        constant: constantValue,
        isVisible: true,
        color: '#2ECC71'
      });
    }
    
    return simplified.length > 0 ? simplified : [{
      coefficient: 0,
      constant: 0,
      isVisible: true,
      color: '#95A5A6'
    }];
  };
  
  /**
   * 解答を検証
   */
  const validateAnswer = useCallback((answer: number): ValidationResult => {
    if (!currentProblem || !currentEquation) {
      return {
        isCorrect: false,
        userAnswer: answer,
        correctAnswer: 0,
        feedback: {
          type: 'error',
          title: 'エラー',
          message: '問題が選択されていません'
        }
      };
    }
    
    const correctAnswer = currentProblem.equation.solution;
    const isCorrect = Math.abs(answer - correctAnswer) < 0.001;
    
    // フィードバックメッセージを生成
    let feedback: FeedbackMessage;
    let mistakeType: MistakeType | undefined;
    
    if (isCorrect) {
      feedback = {
        type: 'success',
        title: '正解！',
        message: `x = ${answer} は正しい答えです！`,
        details: '素晴らしい！方程式を正しく解くことができました。',
        visualFeedback: {
          type: 'checkmark',
          duration: 2000
        }
      };
    } else {
      // 誤答パターンを分析
      if (Math.sign(answer) !== Math.sign(correctAnswer)) {
        mistakeType = 'signError';
        feedback = {
          type: 'error',
          title: '符号に注意',
          message: `答えは ${answer} ではありません`,
          details: '符号（プラス・マイナス）をもう一度確認してみましょう',
          nextAction: '移項するときは符号が変わることに注意してください'
        };
      } else if (Math.abs(answer - correctAnswer) > 10) {
        mistakeType = 'calculationError';
        feedback = {
          type: 'error',
          title: '計算を見直そう',
          message: `答えは ${answer} ではありません`,
          details: '計算過程をもう一度確認してみましょう',
          nextAction: '一つずつステップを確認しながら解いてみてください'
        };
      } else {
        mistakeType = 'conceptualError';
        feedback = {
          type: 'error',
          title: 'もう少し！',
          message: `答えは ${answer} ではありません`,
          details: '考え方は合っているようです。細かい部分を確認してみましょう',
          nextAction: 'ヒントを参考にして再挑戦してみてください'
        };
      }
    }
    
    const result: ValidationResult = {
      isCorrect,
      userAnswer: answer,
      correctAnswer,
      feedback,
      mistakeType,
      partialCredit: isCorrect ? 1 : Math.max(0, 1 - Math.abs(answer - correctAnswer) / Math.abs(correctAnswer))
    };
    
    setValidationResult(result);
    
    // 進捗を更新
    updateProblemStats(isCorrect, mistakeType);
    
    // アクティビティを記録
    recordActivity({
      action: 'validate_answer',
      value: isCorrect ? 1 : 0,
      metadata: {
        userAnswer: answer,
        correctAnswer,
        mistakeType,
        partialCredit: result.partialCredit
      }
    });
    
    return result;
  }, [currentProblem, currentEquation, recordActivity]);
  
  /**
   * 問題統計を更新
   */
  const updateProblemStats = useCallback((isCorrect: boolean, mistakeType?: MistakeType) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      
      // problemStatsが未定義の場合は初期化
      if (!newProgress.problemStats) {
        newProgress.problemStats = {
          total: 0,
          correct: 0,
          byMode: {} as Record<LearningMode, { total: number; correct: number }>,
          byDifficulty: {}
        };
      }
      
      // 全体統計
      newProgress.problemStats.total++;
      if (isCorrect) newProgress.problemStats.correct++;
      
      // モード別統計
      if (currentProblem) {
        const mode = currentProblem.mode;
        if (!newProgress.problemStats.byMode[mode]) {
          newProgress.problemStats.byMode[mode] = { total: 0, correct: 0 };
        }
        newProgress.problemStats.byMode[mode].total++;
        if (isCorrect) newProgress.problemStats.byMode[mode].correct++;
        
        // 難易度別統計
        const difficulty = currentProblem.difficulty;
        if (!newProgress.problemStats.byDifficulty[difficulty]) {
          newProgress.problemStats.byDifficulty[difficulty] = { total: 0, correct: 0 };
        }
        newProgress.problemStats.byDifficulty[difficulty].total++;
        if (isCorrect) newProgress.problemStats.byDifficulty[difficulty].correct++;
      }
      
      // 間違いパターンを記録
      if (!isCorrect && mistakeType) {
        // commonMistakesが未定義の場合は初期化
        if (!newProgress.commonMistakes) {
          newProgress.commonMistakes = [];
        }
        
        const existingMistake = newProgress.commonMistakes.find(m => m.type === mistakeType);
        if (existingMistake) {
          existingMistake.count++;
          existingMistake.lastOccurred = new Date().toISOString();
        } else {
          newProgress.commonMistakes.push({
            type: mistakeType,
            description: getMistakeDescription(mistakeType),
            count: 1,
            lastOccurred: new Date().toISOString(),
            suggestedReview: getMistakeSuggestion(mistakeType)
          });
        }
      }
      
      // 習熟度を計算
      const totalProblems = newProgress.problemStats.total;
      const correctProblems = newProgress.problemStats.correct;
      const accuracy = totalProblems > 0 ? (correctProblems / totalProblems) * 100 : 0;
      
      // masteryが未定義の場合は初期化
      if (!newProgress.mastery) {
        newProgress.mastery = {
          conceptUnderstanding: 0,
          calculationSkill: 0,
          applicationAbility: 0,
          overall: 0
        };
      }
      
      newProgress.mastery.calculationSkill = accuracy;
      newProgress.mastery.overall = (
        newProgress.mastery.conceptUnderstanding * 0.3 +
        newProgress.mastery.calculationSkill * 0.4 +
        newProgress.mastery.applicationAbility * 0.3
      );
      
      // スキルの更新
      if (isCorrect && currentProblem) {
        // skillsが未定義の場合は初期化
        if (!newProgress.skills) {
          newProgress.skills = {
            basicEquations: false,
            transpose: false,
            combineTerms: false,
            wordProblems: false
          };
        }
        
        if (currentProblem.mode === 'intermediate' || currentProblem.mode === 'advanced') {
          newProgress.skills.transpose = true;
        }
        if (currentProblem.mode === 'advanced') {
          newProgress.skills.combineTerms = true;
        }
        if (currentProblem.mode === 'wordProblem') {
          newProgress.skills.wordProblems = true;
        }
      }
      
      // 進捗を保存
      updateProgress(newProgress);
      
      return newProgress;
    });
  }, [currentProblem, updateProgress]);
  
  /**
   * 間違いの説明を取得
   */
  const getMistakeDescription = (type: MistakeType): string => {
    const descriptions: Record<MistakeType, string> = {
      signError: '符号（プラス・マイナス）の間違い',
      transpositionError: '移項時の符号変換ミス',
      calculationError: '計算ミス',
      conceptualError: '概念的な誤解',
      orderError: '解法手順の間違い',
      interpretationError: '文章題の解釈ミス'
    };
    return descriptions[type];
  };
  
  /**
   * 間違いへの対策を取得
   */
  const getMistakeSuggestion = (type: MistakeType): string => {
    const suggestions: Record<MistakeType, string> = {
      signError: '移項するときは必ず符号を変えることを意識しましょう',
      transpositionError: '両辺に同じ操作をすることを確認しましょう',
      calculationError: '一つずつ丁寧に計算を進めましょう',
      conceptualError: '等式の性質をもう一度確認しましょう',
      orderError: '解法の手順を整理してから取り組みましょう',
      interpretationError: '文章をよく読んで、何を求められているか確認しましょう'
    };
    return suggestions[type];
  };
  
  /**
   * ヒントを表示
   */
  const showNextHint = useCallback(() => {
    if (!currentProblem) return;
    
    const maxHints = currentProblem.hints.length;
    if (currentHintIndex < maxHints - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
    setShowHints(true);
    
    recordActivity({
      action: 'show_hint',
      value: currentHintIndex + 1,
      metadata: {
        totalHints: maxHints
      }
    });
  }, [currentProblem, currentHintIndex, recordActivity]);
  
  /**
   * 元に戻す
   */
  const undo = useCallback(() => {
    if (!transformationHistory.canUndo) return;
    
    const newIndex = Math.max(0, transformationHistory.currentStepIndex - 1);
    const previousStep = transformationHistory.steps[newIndex];
    
    if (previousStep) {
      setCurrentEquation(previousStep.equation);
      updateBalanceFromEquation(previousStep.equation);
      setTransformationHistory(prev => ({
        ...prev,
        currentStepIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true
      }));
    }
  }, [transformationHistory, updateBalanceFromEquation]);
  
  /**
   * やり直す
   */
  const redo = useCallback(() => {
    if (!transformationHistory.canRedo) return;
    
    const newIndex = Math.min(
      transformationHistory.steps.length - 1,
      transformationHistory.currentStepIndex + 1
    );
    const nextStep = transformationHistory.steps[newIndex];
    
    if (nextStep) {
      setCurrentEquation(nextStep.equation);
      updateBalanceFromEquation(nextStep.equation);
      setTransformationHistory(prev => ({
        ...prev,
        currentStepIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < prev.steps.length - 1
      }));
    }
  }, [transformationHistory, updateBalanceFromEquation]);
  
  /**
   * 新しい問題を設定
   */
  const setProblem = useCallback((problem: EquationProblem) => {
    setCurrentProblem(problem);
    setCurrentEquation(problem.equation);
    updateBalanceFromEquation(problem.equation);
    
    // 履歴をリセット
    setTransformationHistory({
      steps: [problem.solutionSteps[0]],
      currentStepIndex: 0,
      canUndo: false,
      canRedo: false
    });
    
    // その他の状態をリセット
    setUserAnswer(null);
    setValidationResult(null);
    setShowHints(false);
    setCurrentHintIndex(0);
    
    // タイマーをリセット
    startTimeRef.current = Date.now();
    
    recordActivity({
      action: 'start_problem',
      value: problem.id,
      metadata: {
        mode: problem.mode,
        difficulty: problem.difficulty,
        title: problem.title
      }
    });
  }, [recordActivity, updateBalanceFromEquation]);
  
  /**
   * ドラッグ開始
   */
  const startDrag = useCallback((item: BalanceItem) => {
    setDragDropState({
      isDragging: true,
      draggedItem: item,
      dropTarget: null,
      isValidDrop: false
    });
  }, []);
  
  /**
   * ドロップターゲット上でのホバー
   */
  const dragOver = useCallback((side: 'left' | 'right') => {
    setDragDropState(prev => ({
      ...prev,
      dropTarget: side,
      isValidDrop: true // 実際のバリデーションロジックはここに追加
    }));
  }, []);
  
  /**
   * ドロップ
   */
  const drop = useCallback((side: 'left' | 'right') => {
    if (!dragDropState.draggedItem || !dragDropState.isValidDrop) return;
    
    // ドロップ処理の実装
    // ここでは簡略化しています
    
    setDragDropState({
      isDragging: false,
      draggedItem: null,
      dropTarget: null,
      isValidDrop: false
    });
  }, [dragDropState]);
  
  /**
   * 時間追跡
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      totalTimeRef.current = elapsed;
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  /**
   * コンポーネントのアンマウント時に進捗を保存
   */
  useEffect(() => {
    return () => {
      if (progress) {
        const finalProgress = {
          ...progress,
          timeSpent: progress.timeSpent + Math.floor(totalTimeRef.current / 1000),
          lastAccessed: new Date().toISOString()
        };
        updateProgress(finalProgress);
      }
    };
  }, [progress, updateProgress]);
  
  return {
    // 状態
    currentProblem,
    currentEquation,
    balanceState,
    transformationHistory,
    validationResult,
    userAnswer,
    showHints,
    currentHintIndex,
    progress,
    dragDropState,
    
    // 操作
    setProblem,
    applyOperation,
    validateAnswer,
    setUserAnswer,
    showNextHint,
    undo,
    redo,
    startDrag,
    dragOver,
    drop,
    
    // 計算値
    canShowMoreHints: currentProblem ? currentHintIndex < currentProblem.hints.length - 1 : false,
    elapsedTime: Math.floor(totalTimeRef.current / 1000)
  };
};