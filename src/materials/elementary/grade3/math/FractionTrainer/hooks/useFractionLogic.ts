/**
 * 分数計算ロジックのカスタムフック
 * 
 * 機能：
 * - 分数の計算処理
 * - 約分・通分の自動処理
 * - 視覚的表現の状態管理
 * - 学習進捗の追跡
 * - 誤答パターンの分析
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLearningTracker } from '@hooks/useLearningTracker';
import type {
  Fraction,
  FractionProblem,
  FractionProgress,
  LearningMode,
  ProblemType,
  MistakeType,
  ValidationResult,
  FeedbackMessage,
  CalculationHistory,
  DragDropState,
  VisualElement,
  FractionOperation
} from '../types';

/**
 * 分数ロジックのカスタムフック
 */
export const useFractionLogic = (initialProblem?: FractionProblem) => {
  const { recordActivity, updateProgress, getProgress } = useLearningTracker({
    materialId: 'fraction-trainer',
    materialName: '分数計算トレーナー'
  });
  
  // 現在の問題と状態
  const [currentProblem, setCurrentProblem] = useState<FractionProblem | null>(initialProblem || null);
  const [userAnswer, setUserAnswer] = useState<Fraction | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [currentHintIndex, setCurrentHintIndex] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  // 計算履歴
  const [calculationHistory, setCalculationHistory] = useState<CalculationHistory[]>([]);
  
  // ドラッグ＆ドロップ状態
  const [dragDropState, setDragDropState] = useState<DragDropState>({
    isDragging: false,
    draggedItem: null,
    dropTarget: null,
    isValidDrop: false
  });
  
  // 視覚的要素
  const [visualElements, setVisualElements] = useState<VisualElement[]>([]);
  
  // 学習進捗のデフォルト値
  const defaultProgress: FractionProgress = {
    currentMode: 'concept',
    completedModes: [],
    skills: {
      basicConcept: false,
      visualization: false,
      simplification: false,
      commonDenominator: false,
      comparison: false,
      addition: false,
      subtraction: false,
      multiplication: false,
      division: false,
      mixedNumbers: false,
      wordProblems: false
    },
    statistics: {
      totalProblems: 0,
      correctAnswers: 0,
      byMode: {} as Record<LearningMode, { attempted: number; correct: number; averageTime: number }>,
      byDifficulty: {}
    },
    commonMistakes: [],
    mastery: {
      conceptUnderstanding: 0,
      calculationSkill: 0,
      applicationAbility: 0,
      overall: 0
    },
    achievements: [],
    studyTime: {
      total: 0,
      today: 0,
      streak: 0
    },
    recommendations: [],
    adaptiveDifficulty: 'normal',
    hintsUsed: 0,
    lastUpdated: Date.now(),
    timeSpent: 0,
    lastAccessed: new Date().toISOString()
  };

  // 学習進捗
  const [progress, setProgress] = useState<FractionProgress>(() => {
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
  const problemStartTimeRef = useRef<number>(Date.now());
  
  /**
   * 最大公約数を計算
   */
  const gcd = useCallback((a: number, b: number): number => {
    return b === 0 ? Math.abs(a) : gcd(b, a % b);
  }, []);
  
  /**
   * 最小公倍数を計算
   */
  const lcm = useCallback((a: number, b: number): number => {
    return Math.abs(a * b) / gcd(a, b);
  }, [gcd]);
  
  /**
   * 分数を約分
   */
  const simplifyFraction = useCallback((fraction: Fraction): Fraction => {
    const divisor = gcd(Math.abs(fraction.numerator), Math.abs(fraction.denominator));
    
    return {
      numerator: fraction.numerator / divisor,
      denominator: fraction.denominator / divisor,
      wholeNumber: fraction.wholeNumber,
      isNegative: fraction.isNegative
    };
  }, [gcd]);
  
  /**
   * 帯分数を仮分数に変換
   */
  const toImproperFraction = useCallback((fraction: Fraction): Fraction => {
    if (!fraction.wholeNumber) return fraction;
    
    const numerator = Math.abs(fraction.wholeNumber) * fraction.denominator + fraction.numerator;
    
    return {
      numerator,
      denominator: fraction.denominator,
      isNegative: fraction.isNegative || fraction.wholeNumber < 0
    };
  }, []);
  
  /**
   * 仮分数を帯分数に変換
   */
  const toMixedNumber = useCallback((fraction: Fraction): Fraction => {
    if (fraction.numerator < fraction.denominator) return fraction;
    
    const wholeNumber = Math.floor(fraction.numerator / fraction.denominator);
    const remainder = fraction.numerator % fraction.denominator;
    
    return {
      numerator: remainder,
      denominator: fraction.denominator,
      wholeNumber,
      isNegative: fraction.isNegative
    };
  }, []);
  
  /**
   * 分数を通分
   */
  const findCommonDenominator = useCallback((fractions: Fraction[]): Fraction[] => {
    if (fractions.length < 2) return fractions;
    
    // 最小公倍数を見つける
    const denominators = fractions.map(f => f.denominator);
    const commonDenominator = denominators.reduce((acc, den) => lcm(acc, den));
    
    // 各分数を通分
    return fractions.map(fraction => {
      const factor = commonDenominator / fraction.denominator;
      return {
        numerator: fraction.numerator * factor,
        denominator: commonDenominator,
        wholeNumber: fraction.wholeNumber,
        isNegative: fraction.isNegative
      };
    });
  }, [lcm]);
  
  /**
   * 分数の足し算
   */
  const addFractions = useCallback((f1: Fraction, f2: Fraction): FractionOperation => {
    const steps: { description: string; fractions: Fraction[] }[] = [];
    
    // 帯分数を仮分数に変換
    const improper1 = toImproperFraction(f1);
    const improper2 = toImproperFraction(f2);
    
    if (f1.wholeNumber || f2.wholeNumber) {
      steps.push({
        description: '帯分数を仮分数に変換',
        fractions: [improper1, improper2]
      });
    }
    
    let result: Fraction;
    
    if (improper1.denominator === improper2.denominator) {
      // 同分母の場合
      result = {
        numerator: improper1.numerator + improper2.numerator,
        denominator: improper1.denominator,
        isNegative: false
      };
      steps.push({
        description: '分子を足す',
        fractions: [result]
      });
    } else {
      // 異分母の場合
      const [common1, common2] = findCommonDenominator([improper1, improper2]);
      steps.push({
        description: '通分する',
        fractions: [common1, common2]
      });
      
      result = {
        numerator: common1.numerator + common2.numerator,
        denominator: common1.denominator,
        isNegative: false
      };
      steps.push({
        description: '分子を足す',
        fractions: [result]
      });
    }
    
    // 約分
    const simplified = simplifyFraction(result);
    if (simplified.numerator !== result.numerator) {
      steps.push({
        description: '約分する',
        fractions: [simplified]
      });
    }
    
    return {
      type: 'add',
      operand1: f1,
      operand2: f2,
      result: simplified,
      steps
    };
  }, [toImproperFraction, findCommonDenominator, simplifyFraction]);
  
  /**
   * 分数の引き算
   */
  const subtractFractions = useCallback((f1: Fraction, f2: Fraction): FractionOperation => {
    const steps: { description: string; fractions: Fraction[] }[] = [];
    
    // 帯分数を仮分数に変換
    const improper1 = toImproperFraction(f1);
    const improper2 = toImproperFraction(f2);
    
    if (f1.wholeNumber || f2.wholeNumber) {
      steps.push({
        description: '帯分数を仮分数に変換',
        fractions: [improper1, improper2]
      });
    }
    
    let result: Fraction;
    
    if (improper1.denominator === improper2.denominator) {
      // 同分母の場合
      const numeratorDiff = improper1.numerator - improper2.numerator;
      result = {
        numerator: Math.abs(numeratorDiff),
        denominator: improper1.denominator,
        isNegative: numeratorDiff < 0
      };
      steps.push({
        description: '分子を引く',
        fractions: [result]
      });
    } else {
      // 異分母の場合
      const [common1, common2] = findCommonDenominator([improper1, improper2]);
      steps.push({
        description: '通分する',
        fractions: [common1, common2]
      });
      
      const numeratorDiff = common1.numerator - common2.numerator;
      result = {
        numerator: Math.abs(numeratorDiff),
        denominator: common1.denominator,
        isNegative: numeratorDiff < 0
      };
      steps.push({
        description: '分子を引く',
        fractions: [result]
      });
    }
    
    // 約分
    const simplified = simplifyFraction(result);
    if (simplified.numerator !== result.numerator) {
      steps.push({
        description: '約分する',
        fractions: [simplified]
      });
    }
    
    return {
      type: 'subtract',
      operand1: f1,
      operand2: f2,
      result: simplified,
      steps
    };
  }, [toImproperFraction, findCommonDenominator, simplifyFraction]);
  
  /**
   * 分数のかけ算
   */
  const multiplyFractions = useCallback((f1: Fraction, f2: Fraction): FractionOperation => {
    const steps: { description: string; fractions: Fraction[] }[] = [];
    
    // 帯分数を仮分数に変換
    const improper1 = toImproperFraction(f1);
    const improper2 = toImproperFraction(f2);
    
    if (f1.wholeNumber || f2.wholeNumber) {
      steps.push({
        description: '帯分数を仮分数に変換',
        fractions: [improper1, improper2]
      });
    }
    
    // かけ算を実行
    const result = {
      numerator: improper1.numerator * improper2.numerator,
      denominator: improper1.denominator * improper2.denominator,
      isNegative: improper1.isNegative !== improper2.isNegative
    };
    steps.push({
      description: '分子同士、分母同士をかける',
      fractions: [result]
    });
    
    // 約分
    const simplified = simplifyFraction(result);
    if (simplified.numerator !== result.numerator) {
      steps.push({
        description: '約分する',
        fractions: [simplified]
      });
    }
    
    return {
      type: 'multiply',
      operand1: f1,
      operand2: f2,
      result: simplified,
      steps
    };
  }, [toImproperFraction, simplifyFraction]);
  
  /**
   * 分数のわり算
   */
  const divideFractions = useCallback((f1: Fraction, f2: Fraction): FractionOperation => {
    const steps: { description: string; fractions: Fraction[] }[] = [];
    
    // 帯分数を仮分数に変換
    const improper1 = toImproperFraction(f1);
    const improper2 = toImproperFraction(f2);
    
    if (f1.wholeNumber || f2.wholeNumber) {
      steps.push({
        description: '帯分数を仮分数に変換',
        fractions: [improper1, improper2]
      });
    }
    
    // 除数の逆数を作成
    const reciprocal = {
      numerator: improper2.denominator,
      denominator: improper2.numerator,
      isNegative: improper2.isNegative
    };
    steps.push({
      description: '除数の逆数を作る',
      fractions: [reciprocal]
    });
    
    // かけ算として実行
    const result = {
      numerator: improper1.numerator * reciprocal.numerator,
      denominator: improper1.denominator * reciprocal.denominator,
      isNegative: improper1.isNegative !== reciprocal.isNegative
    };
    steps.push({
      description: '逆数をかける',
      fractions: [result]
    });
    
    // 約分
    const simplified = simplifyFraction(result);
    if (simplified.numerator !== result.numerator) {
      steps.push({
        description: '約分する',
        fractions: [simplified]
      });
    }
    
    return {
      type: 'divide',
      operand1: f1,
      operand2: f2,
      result: simplified,
      steps
    };
  }, [toImproperFraction, simplifyFraction]);
  
  /**
   * 分数を比較
   */
  const compareFractions = useCallback((f1: Fraction, f2: Fraction): '<' | '>' | '=' => {
    // 帯分数を仮分数に変換
    const improper1 = toImproperFraction(f1);
    const improper2 = toImproperFraction(f2);
    
    // 通分して比較
    const [common1, common2] = findCommonDenominator([improper1, improper2]);
    
    const value1 = common1.numerator * (common1.isNegative ? -1 : 1);
    const value2 = common2.numerator * (common2.isNegative ? -1 : 1);
    
    if (value1 < value2) return '<';
    if (value1 > value2) return '>';
    return '=';
  }, [toImproperFraction, findCommonDenominator]);
  
  /**
   * 分数が等しいかチェック
   */
  const areFractionsEqual = useCallback((f1: Fraction, f2: Fraction): boolean => {
    const simplified1 = simplifyFraction(toImproperFraction(f1));
    const simplified2 = simplifyFraction(toImproperFraction(f2));
    
    return (
      simplified1.numerator === simplified2.numerator &&
      simplified1.denominator === simplified2.denominator &&
      simplified1.isNegative === simplified2.isNegative
    );
  }, [simplifyFraction, toImproperFraction]);
  
  /**
   * 答えを検証
   */
  const validateAnswer = useCallback((answer: Fraction | Fraction[] | string): ValidationResult => {
    if (!currentProblem) {
      return {
        isCorrect: false,
        userAnswer: answer,
        correctAnswer: '',
        feedback: {
          type: 'error',
          title: 'エラー',
          message: '問題が選択されていません'
        }
      };
    }
    
    let isCorrect = false;
    let mistakeType: MistakeType | undefined;
    let feedback: FeedbackMessage;
    
    // 問題タイプに応じて検証
    switch (currentProblem.type) {
      case 'identify':
      case 'create':
      case 'simplify':
      case 'calculate':
      case 'convert':
        if (typeof answer !== 'string' && !Array.isArray(answer)) {
          isCorrect = areFractionsEqual(
            answer as Fraction,
            currentProblem.answer.fraction!
          );
          
          if (!isCorrect) {
            // 約分忘れをチェック
            const simplified = simplifyFraction(answer as Fraction);
            if (areFractionsEqual(simplified, currentProblem.answer.fraction!)) {
              mistakeType = 'simplification';
            }
          }
        }
        break;
        
      case 'expand':
        if (Array.isArray(answer) && Array.isArray(currentProblem.answer.fractions)) {
          isCorrect = answer.every((f, i) => 
            areFractionsEqual(f, currentProblem.answer.fractions![i])
          );
        }
        break;
        
      case 'compare':
        if (typeof answer === 'string') {
          isCorrect = answer === currentProblem.answer.comparison;
        }
        break;
    }
    
    // フィードバックメッセージを生成
    if (isCorrect) {
      feedback = {
        type: 'success',
        title: '正解！',
        message: getSuccessMessage(),
        visual: {
          type: 'confetti',
          duration: 2000
        }
      };
    } else {
      feedback = {
        type: 'error',
        title: '惜しい！',
        message: getErrorMessage(mistakeType),
        suggestion: getMistakeSuggestion(mistakeType),
        details: '解答をもう一度確認してみましょう'
      };
    }
    
    const result: ValidationResult = {
      isCorrect,
      userAnswer: answer,
      correctAnswer: formatCorrectAnswer(currentProblem),
      feedback,
      mistakeType,
      partialCredit: calculatePartialCredit(answer, currentProblem)
    };
    
    setValidationResult(result);
    
    // 履歴に記録
    const history: CalculationHistory = {
      id: `history-${Date.now()}`,
      timestamp: new Date().toISOString(),
      problem: currentProblem,
      userAnswer: answer,
      isCorrect,
      timeSpent: Date.now() - problemStartTimeRef.current,
      hintsUsed: currentHintIndex,
      mistakes: mistakeType ? [mistakeType] : undefined
    };
    
    setCalculationHistory(prev => [...prev, history]);
    
    // 進捗を更新
    updateProblemStats(isCorrect, mistakeType);
    
    // アクティビティを記録
    recordActivity({
      action: 'validate_answer',
      value: isCorrect ? 1 : 0,
      metadata: {
        problemType: currentProblem.type,
        difficulty: currentProblem.difficulty,
        mistakeType,
        timeSpent: history.timeSpent,
        hintsUsed: history.hintsUsed
      }
    });
    
    return result;
  }, [currentProblem, areFractionsEqual, simplifyFraction, currentHintIndex, recordActivity]);
  
  /**
   * 成功メッセージを取得
   */
  const getSuccessMessage = (): string => {
    const messages = [
      'すばらしい！よくできました！',
      '完璧です！その調子！',
      '正解！分数マスターへの道を進んでいます！',
      'やったね！理解が深まっています！',
      'お見事！次の問題にも挑戦しましょう！'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  /**
   * エラーメッセージを取得
   */
  const getErrorMessage = (mistakeType?: MistakeType): string => {
    if (!mistakeType) return 'もう一度考えてみましょう';
    
    const messages: Record<MistakeType, string> = {
      commonDenominator: '分母をそろえる必要があります',
      simplification: '答えを約分してください',
      calculation: '計算をもう一度確認してみましょう',
      conceptual: '問題の意味をもう一度考えてみましょう',
      conversion: '変換の方法を確認してください',
      sign: '符号（プラス・マイナス）に注意しましょう',
      order: '操作の順序を確認してください',
      interpretation: '問題文をもう一度読んでみましょう'
    };
    
    return messages[mistakeType];
  };
  
  /**
   * 間違いへの提案を取得
   */
  const getMistakeSuggestion = (mistakeType?: MistakeType): string => {
    if (!mistakeType) return 'ヒントを参考にしてください';
    
    const suggestions: Record<MistakeType, string> = {
      commonDenominator: '最小公倍数を見つけて通分しましょう',
      simplification: '分子と分母の最大公約数で割りましょう',
      calculation: '一つずつ丁寧に計算しましょう',
      conceptual: '図を見ながら考えてみましょう',
      conversion: '帯分数と仮分数の関係を思い出しましょう',
      sign: '負の数のルールを確認しましょう',
      order: '計算の順序を整理してから解きましょう',
      interpretation: 'キーワードに注目してみましょう'
    };
    
    return suggestions[mistakeType];
  };
  
  /**
   * 正解を文字列形式で取得
   */
  const formatCorrectAnswer = (problem: FractionProblem): string => {
    if (problem.answer.fraction) {
      return formatFraction(problem.answer.fraction);
    }
    if (problem.answer.fractions) {
      return problem.answer.fractions.map(formatFraction).join(', ');
    }
    if (problem.answer.comparison) {
      return problem.answer.comparison;
    }
    return '';
  };
  
  /**
   * 分数を文字列形式に変換
   */
  const formatFraction = (fraction: Fraction): string => {
    let result = '';
    
    if (fraction.isNegative) result += '-';
    if (fraction.wholeNumber) {
      result += `${fraction.wholeNumber}と`;
    }
    
    result += `${fraction.numerator}/${fraction.denominator}`;
    
    return result;
  };
  
  /**
   * 部分点を計算
   */
  const calculatePartialCredit = (answer: any, problem: FractionProblem): number => {
    // 実装は問題タイプに応じて調整
    return 0;
  };
  
  /**
   * 問題統計を更新
   */
  const updateProblemStats = useCallback((isCorrect: boolean, mistakeType?: MistakeType) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      
      // statisticsが未定義の場合は初期化
      if (!newProgress.statistics) {
        newProgress.statistics = {
          totalProblems: 0,
          correctAnswers: 0,
          byMode: {} as Record<LearningMode, { attempted: number; correct: number; averageTime: number }>,
          byDifficulty: {}
        };
      }
      
      // 全体統計
      newProgress.statistics.totalProblems++;
      if (isCorrect) newProgress.statistics.correctAnswers++;
      
      // モード別統計
      if (currentProblem) {
        const mode = currentProblem.mode;
        if (!newProgress.statistics.byMode[mode]) {
          newProgress.statistics.byMode[mode] = {
            attempted: 0,
            correct: 0,
            averageTime: 0
          };
        }
        newProgress.statistics.byMode[mode].attempted++;
        if (isCorrect) newProgress.statistics.byMode[mode].correct++;
        
        // 難易度別統計
        const difficulty = currentProblem.difficulty;
        if (!newProgress.statistics.byDifficulty[difficulty]) {
          newProgress.statistics.byDifficulty[difficulty] = {
            attempted: 0,
            correct: 0
          };
        }
        newProgress.statistics.byDifficulty[difficulty].attempted++;
        if (isCorrect) newProgress.statistics.byDifficulty[difficulty].correct++;
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
            count: 1,
            lastOccurred: new Date().toISOString(),
            examples: [currentProblem?.id || '']
          });
        }
      }
      
      // スキルの更新
      if (isCorrect && currentProblem) {
        // skillsが未定義の場合は初期化
        if (!newProgress.skills) {
          newProgress.skills = {
            basicConcept: false,
            visualization: false,
            simplification: false,
            commonDenominator: false,
            comparison: false,
            addition: false,
            subtraction: false,
            multiplication: false,
            division: false,
            mixedNumbers: false,
            wordProblems: false
          };
        }
        
        switch (currentProblem.mode) {
          case 'concept':
            newProgress.skills.basicConcept = true;
            newProgress.skills.visualization = true;
            break;
          case 'equivalent':
            newProgress.skills.simplification = true;
            newProgress.skills.commonDenominator = true;
            break;
          case 'comparison':
            newProgress.skills.comparison = true;
            break;
          case 'addition':
            newProgress.skills.addition = true;
            break;
          case 'subtraction':
            newProgress.skills.subtraction = true;
            break;
          case 'multiplication':
            newProgress.skills.multiplication = true;
            break;
          case 'division':
            newProgress.skills.division = true;
            break;
          case 'mixed':
            newProgress.skills.mixedNumbers = true;
            break;
          case 'application':
            newProgress.skills.wordProblems = true;
            break;
        }
      }
      
      // 習熟度を計算
      const totalProblems = newProgress.statistics.totalProblems;
      const correctProblems = newProgress.statistics.correctAnswers;
      const accuracy = totalProblems > 0 ? (correctProblems / totalProblems) * 100 : 0;
      
      // スキル習得率
      const totalSkills = Object.keys(newProgress.skills).length;
      const acquiredSkills = Object.values(newProgress.skills).filter(s => s).length;
      const skillRate = (acquiredSkills / totalSkills) * 100;
      
      // masteryが未定義の場合は初期化
      if (!newProgress.mastery) {
        newProgress.mastery = {
          conceptUnderstanding: 0,
          calculationSkill: 0,
          applicationAbility: 0,
          overall: 0
        };
      }
      
      newProgress.mastery.conceptUnderstanding = skillRate * 0.4 + accuracy * 0.6;
      newProgress.mastery.calculationSkill = accuracy;
      newProgress.mastery.applicationAbility = newProgress.skills.wordProblems ? 80 : 20;
      newProgress.mastery.overall = (
        newProgress.mastery.conceptUnderstanding * 0.3 +
        newProgress.mastery.calculationSkill * 0.4 +
        newProgress.mastery.applicationAbility * 0.3
      );
      
      // 進捗を保存
      updateProgress(newProgress);
      
      return newProgress;
    });
  }, [currentProblem, updateProgress]);
  
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
   * 新しい問題を設定
   */
  const setProblem = useCallback((problem: FractionProblem) => {
    setCurrentProblem(problem);
    setUserAnswer(null);
    setValidationResult(null);
    setShowHints(false);
    setCurrentHintIndex(0);
    setCurrentStep(0);
    problemStartTimeRef.current = Date.now();
    
    // 視覚的要素を初期化
    initializeVisualElements(problem);
    
    recordActivity({
      action: 'start_problem',
      value: problem.id,
      metadata: {
        mode: problem.mode,
        type: problem.type,
        difficulty: problem.difficulty
      }
    });
  }, [recordActivity]);
  
  /**
   * 視覚的要素を初期化
   */
  const initializeVisualElements = (problem: FractionProblem) => {
    // 問題に応じて視覚的要素を生成
    const elements: VisualElement[] = [];
    
    // ここで問題タイプに応じた視覚的要素を作成
    
    setVisualElements(elements);
  };
  
  /**
   * ドラッグ開始
   */
  const startDrag = useCallback((element: VisualElement) => {
    setDragDropState({
      isDragging: true,
      draggedItem: element,
      dropTarget: null,
      isValidDrop: false
    });
  }, []);
  
  /**
   * ドロップ
   */
  const drop = useCallback((target: string) => {
    if (!dragDropState.draggedItem || !dragDropState.isValidDrop) return;
    
    // ドロップ処理
    
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
      // 必要に応じて時間を更新
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
          timeSpent: progress.timeSpent + Math.floor((Date.now() - startTimeRef.current) / 1000),
          lastAccessed: new Date().toISOString()
        };
        updateProgress(finalProgress);
      }
    };
  }, [progress, updateProgress]);
  
  return {
    // 状態
    currentProblem,
    userAnswer,
    validationResult,
    showHints,
    currentHintIndex,
    currentStep,
    calculationHistory,
    progress,
    visualElements,
    dragDropState,
    
    // 操作
    setProblem,
    setUserAnswer,
    validateAnswer,
    showNextHint,
    setCurrentStep,
    startDrag,
    drop,
    
    // 計算関数
    simplifyFraction,
    toImproperFraction,
    toMixedNumber,
    findCommonDenominator,
    addFractions,
    subtractFractions,
    multiplyFractions,
    divideFractions,
    compareFractions,
    areFractionsEqual,
    
    // ユーティリティ
    formatFraction,
    canShowMoreHints: currentProblem ? currentHintIndex < currentProblem.hints.length - 1 : false,
    elapsedTime: Math.floor((Date.now() - problemStartTimeRef.current) / 1000)
  };
};