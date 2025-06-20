import { useState, useCallback } from 'react';
import { useLearningStore } from '../../../../../../stores/learningStore';

// 分数を表す型定義
export interface Fraction {
  numerator: number;   // 分子
  denominator: number; // 分母
}

// 分数の視覚表現タイプ
export type VisualType = 'pizza' | 'cake' | 'chocolate' | 'circle' | 'rectangle';

// 学習モード
export type LearningMode = 'explore' | 'compare' | 'commonDenom' | 'operations';

// 演算タイプ
export type OperationType = 'add' | 'subtract' | 'multiply' | 'divide';

// 演算ステップ
export interface OperationStep {
  description: string;
  visual?: string;
  fractions: Fraction[];
  result?: Fraction;
}

// 学習ヒント
export interface LearningHint {
  text: string;
  visual?: string;
  level: 'basic' | 'intermediate' | 'advanced';
}

export const useFractionLogic = () => {
  // 学習ストアからデータを取得
  const { addRecord, getProgress, getDifficultyAdjustment, settings } = useLearningStore();
  const materialId = 'fraction-master-tool';
  const progress = getProgress(materialId);
  const difficultyAdjustment = getDifficultyAdjustment(materialId);

  // 状態管理
  const [mode, setMode] = useState<LearningMode>('explore');
  const [visualType, setVisualType] = useState<VisualType>('pizza');
  const [fractions, setFractions] = useState<Fraction[]>([
    { numerator: 1, denominator: 2 },
    { numerator: 1, denominator: 3 }
  ]);
  const [selectedOperation, setSelectedOperation] = useState<OperationType>('add');
  const [operationSteps, setOperationSteps] = useState<OperationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState<LearningHint | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [mistakes, setMistakes] = useState<Array<{
    problem: string;
    userAnswer: string;
    correctAnswer: string;
  }>>([]);

  // 最大公約数を計算
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  // 分数を既約分数に変換
  const simplifyFraction = (fraction: Fraction): Fraction => {
    const divisor = gcd(Math.abs(fraction.numerator), Math.abs(fraction.denominator));
    return {
      numerator: fraction.numerator / divisor,
      denominator: fraction.denominator / divisor
    };
  };

  // 最小公倍数を計算
  const lcm = (a: number, b: number): number => {
    return Math.abs(a * b) / gcd(a, b);
  };

  // 通分を実行
  const findCommonDenominator = (f1: Fraction, f2: Fraction): [Fraction, Fraction, number] => {
    const commonDenom = lcm(f1.denominator, f2.denominator);
    return [
      {
        numerator: f1.numerator * (commonDenom / f1.denominator),
        denominator: commonDenom
      },
      {
        numerator: f2.numerator * (commonDenom / f2.denominator),
        denominator: commonDenom
      },
      commonDenom
    ];
  };

  // 分数の大小比較
  const compareFractions = (f1: Fraction, f2: Fraction): -1 | 0 | 1 => {
    const value1 = f1.numerator / f1.denominator;
    const value2 = f2.numerator / f2.denominator;
    return value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
  };

  // 分数の加算
  const addFractions = (f1: Fraction, f2: Fraction): OperationStep[] => {
    const steps: OperationStep[] = [];
    
    // ステップ1: 元の分数を表示
    steps.push({
      description: `${f1.numerator}/${f1.denominator} と ${f2.numerator}/${f2.denominator} を足します`,
      fractions: [f1, f2]
    });

    // ステップ2: 通分が必要か確認
    if (f1.denominator !== f2.denominator) {
      const [common1, common2, commonDenom] = findCommonDenominator(f1, f2);
      steps.push({
        description: `分母を揃えます（通分）。最小公倍数は ${commonDenom} です`,
        fractions: [common1, common2],
        visual: 'common-denominator'
      });

      // ステップ3: 分子を足す
      const sum = {
        numerator: common1.numerator + common2.numerator,
        denominator: commonDenom
      };
      steps.push({
        description: `分子を足します: ${common1.numerator} + ${common2.numerator} = ${sum.numerator}`,
        fractions: [sum],
        visual: 'add-numerators'
      });

      // ステップ4: 約分
      const simplified = simplifyFraction(sum);
      if (simplified.numerator !== sum.numerator || simplified.denominator !== sum.denominator) {
        steps.push({
          description: `約分します: ${sum.numerator}/${sum.denominator} = ${simplified.numerator}/${simplified.denominator}`,
          fractions: [simplified],
          result: simplified
        });
      } else {
        steps[steps.length - 1].result = sum;
      }
    } else {
      // 分母が同じ場合
      const sum = {
        numerator: f1.numerator + f2.numerator,
        denominator: f1.denominator
      };
      steps.push({
        description: `分母が同じなので、分子を足します: ${f1.numerator} + ${f2.numerator} = ${sum.numerator}`,
        fractions: [sum]
      });

      const simplified = simplifyFraction(sum);
      if (simplified.numerator !== sum.numerator || simplified.denominator !== sum.denominator) {
        steps.push({
          description: `約分します: ${sum.numerator}/${sum.denominator} = ${simplified.numerator}/${simplified.denominator}`,
          fractions: [simplified],
          result: simplified
        });
      } else {
        steps[steps.length - 1].result = sum;
      }
    }

    return steps;
  };

  // 分数の減算
  const subtractFractions = (f1: Fraction, f2: Fraction): OperationStep[] => {
    const steps: OperationStep[] = [];
    
    steps.push({
      description: `${f1.numerator}/${f1.denominator} から ${f2.numerator}/${f2.denominator} を引きます`,
      fractions: [f1, f2]
    });

    if (f1.denominator !== f2.denominator) {
      const [common1, common2, commonDenom] = findCommonDenominator(f1, f2);
      steps.push({
        description: `分母を揃えます（通分）。最小公倍数は ${commonDenom} です`,
        fractions: [common1, common2]
      });

      const diff = {
        numerator: common1.numerator - common2.numerator,
        denominator: commonDenom
      };
      steps.push({
        description: `分子を引きます: ${common1.numerator} - ${common2.numerator} = ${diff.numerator}`,
        fractions: [diff]
      });

      const simplified = simplifyFraction(diff);
      if (simplified.numerator !== diff.numerator || simplified.denominator !== diff.denominator) {
        steps.push({
          description: `約分します: ${diff.numerator}/${diff.denominator} = ${simplified.numerator}/${simplified.denominator}`,
          fractions: [simplified],
          result: simplified
        });
      } else {
        steps[steps.length - 1].result = diff;
      }
    } else {
      const diff = {
        numerator: f1.numerator - f2.numerator,
        denominator: f1.denominator
      };
      steps.push({
        description: `分母が同じなので、分子を引きます: ${f1.numerator} - ${f2.numerator} = ${diff.numerator}`,
        fractions: [diff]
      });

      const simplified = simplifyFraction(diff);
      if (simplified.numerator !== diff.numerator || simplified.denominator !== diff.denominator) {
        steps.push({
          description: `約分します: ${diff.numerator}/${diff.denominator} = ${simplified.numerator}/${simplified.denominator}`,
          fractions: [simplified],
          result: simplified
        });
      } else {
        steps[steps.length - 1].result = diff;
      }
    }

    return steps;
  };

  // 分数の乗算
  const multiplyFractions = (f1: Fraction, f2: Fraction): OperationStep[] => {
    const steps: OperationStep[] = [];
    
    steps.push({
      description: `${f1.numerator}/${f1.denominator} × ${f2.numerator}/${f2.denominator} を計算します`,
      fractions: [f1, f2]
    });

    const product = {
      numerator: f1.numerator * f2.numerator,
      denominator: f1.denominator * f2.denominator
    };

    steps.push({
      description: `分子同士、分母同士をかけます: ${f1.numerator}×${f2.numerator}/${f1.denominator}×${f2.denominator} = ${product.numerator}/${product.denominator}`,
      fractions: [product]
    });

    const simplified = simplifyFraction(product);
    if (simplified.numerator !== product.numerator || simplified.denominator !== product.denominator) {
      steps.push({
        description: `約分します: ${product.numerator}/${product.denominator} = ${simplified.numerator}/${simplified.denominator}`,
        fractions: [simplified],
        result: simplified
      });
    } else {
      steps[steps.length - 1].result = product;
    }

    return steps;
  };

  // 分数の除算
  const divideFractions = (f1: Fraction, f2: Fraction): OperationStep[] => {
    const steps: OperationStep[] = [];
    
    steps.push({
      description: `${f1.numerator}/${f1.denominator} ÷ ${f2.numerator}/${f2.denominator} を計算します`,
      fractions: [f1, f2]
    });

    const reciprocal = {
      numerator: f2.denominator,
      denominator: f2.numerator
    };

    steps.push({
      description: `割る数の逆数をかけます: ${f1.numerator}/${f1.denominator} × ${reciprocal.numerator}/${reciprocal.denominator}`,
      fractions: [f1, reciprocal]
    });

    const product = {
      numerator: f1.numerator * reciprocal.numerator,
      denominator: f1.denominator * reciprocal.denominator
    };

    steps.push({
      description: `分子同士、分母同士をかけます: ${product.numerator}/${product.denominator}`,
      fractions: [product]
    });

    const simplified = simplifyFraction(product);
    if (simplified.numerator !== product.numerator || simplified.denominator !== product.denominator) {
      steps.push({
        description: `約分します: ${product.numerator}/${product.denominator} = ${simplified.numerator}/${simplified.denominator}`,
        fractions: [simplified],
        result: simplified
      });
    } else {
      steps[steps.length - 1].result = product;
    }

    return steps;
  };

  // 演算を実行
  const performOperation = useCallback(() => {
    let steps: OperationStep[] = [];
    
    switch (selectedOperation) {
      case 'add':
        steps = addFractions(fractions[0], fractions[1]);
        break;
      case 'subtract':
        steps = subtractFractions(fractions[0], fractions[1]);
        break;
      case 'multiply':
        steps = multiplyFractions(fractions[0], fractions[1]);
        break;
      case 'divide':
        steps = divideFractions(fractions[0], fractions[1]);
        break;
    }

    setOperationSteps(steps);
    setCurrentStep(0);

    // 学習記録を追加
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    addRecord({
      materialId,
      timestamp: Date.now(),
      duration,
      score: 85, // 仮のスコア（実際の実装では計算結果に基づいて決定）
      mistakes,
      hintsUsed,
      completed: true
    });
  }, [fractions, selectedOperation, addRecord, sessionStartTime, mistakes, hintsUsed, materialId]);

  // ヒントを生成
  const generateHint = useCallback(() => {
    const hints: LearningHint[] = [];
    const currentHintLevel = Math.min(hintsUsed + 1, 3); // 段階的ヒント

    switch (mode) {
      case 'explore':
        if (currentHintLevel === 1) {
          hints.push({
            text: 'スライダーを動かして、図がどう変わるか観察してみましょう',
            level: 'basic'
          });
        } else if (currentHintLevel === 2) {
          hints.push({
            text: '分母の数字に注目してください。それは何を表していますか？',
            level: 'basic'
          });
        } else {
          hints.push({
            text: '分母は「全体を何個に分けたか」、分子は「そのうちの何個か」を表します',
            level: 'intermediate'
          });
        }
        break;

      case 'compare':
        if (currentHintLevel === 1) {
          hints.push({
            text: '2つの分数の分母を比べてみましょう',
            level: 'basic'
          });
        } else if (currentHintLevel === 2) {
          hints.push({
            text: '分母が同じ場合と違う場合で、比べ方が変わります',
            level: 'basic'
          });
        } else {
          hints.push({
            text: '分母が違う分数を比べるときは、通分すると比べやすくなります',
            level: 'intermediate'
          });
        }
        break;

      case 'commonDenom':
        if (currentHintLevel === 1) {
          hints.push({
            text: '通分とは何をすることでしょうか？',
            level: 'basic'
          });
        } else if (currentHintLevel === 2) {
          hints.push({
            text: '2つの分数の分母を同じにする方法を考えましょう',
            level: 'basic'
          });
        } else {
          hints.push({
            text: '最小公倍数を使って通分すると、計算が簡単になります',
            level: 'advanced'
          });
        }
        break;

      case 'operations':
        if (selectedOperation === 'add' || selectedOperation === 'subtract') {
          if (currentHintLevel === 1) {
            hints.push({
              text: 'まず2つの分数の分母を確認しましょう',
              level: 'basic'
            });
          } else if (currentHintLevel === 2) {
            hints.push({
              text: '分母が違う場合、何かしなければいけません',
              level: 'basic'
            });
          } else {
            hints.push({
              text: '分数の足し算・引き算では、まず分母を揃える（通分）必要があります',
              level: 'basic'
            });
          }
        } else if (selectedOperation === 'multiply') {
          if (currentHintLevel === 1) {
            hints.push({
              text: '分数のかけ算には特別なルールがあります',
              level: 'basic'
            });
          } else if (currentHintLevel === 2) {
            hints.push({
              text: '分子同士、分母同士に注目してください',
              level: 'basic'
            });
          } else {
            hints.push({
              text: '分数のかけ算は、分子同士、分母同士をかけます',
              level: 'basic'
            });
          }
        } else {
          if (currentHintLevel === 1) {
            hints.push({
              text: '分数の割り算は特別な方法を使います',
              level: 'basic'
            });
          } else if (currentHintLevel === 2) {
            hints.push({
              text: '割る数を「ひっくり返す」ことがポイントです',
              level: 'basic'
            });
          } else {
            hints.push({
              text: '分数の割り算は、割る数を逆数にしてかけ算に変えます',
              level: 'basic'
            });
          }
        }
        break;
    }

    // 現在のヒントレベルに応じたヒントを選択
    const hint = hints[0] || {
      text: 'もう一度、問題をよく見てみましょう',
      level: 'basic'
    };
    
    setCurrentHint(hint);
    setShowHint(true);
    setHintsUsed(hintsUsed + 1);
  }, [mode, selectedOperation, hintsUsed]);

  // 分数を更新
  const updateFraction = (index: number, fraction: Fraction) => {
    const newFractions = [...fractions];
    newFractions[index] = fraction;
    setFractions(newFractions);
  };

  // 次のステップへ
  const nextStep = () => {
    if (currentStep < operationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 前のステップへ
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    // 状態
    mode,
    visualType,
    fractions,
    selectedOperation,
    operationSteps,
    currentStep,
    showHint,
    currentHint,

    // アクション
    setMode,
    setVisualType,
    updateFraction,
    setSelectedOperation,
    performOperation,
    nextStep,
    prevStep,
    generateHint,
    setShowHint,

    // ユーティリティ
    compareFractions,
    simplifyFraction,
    findCommonDenominator
  };
};