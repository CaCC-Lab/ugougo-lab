/**
 * 分数計算トレーナーの問題データ
 * 
 * 設計方針：
 * - 小学3年生から中学生まで段階的に学習
 * - 視覚的理解から抽象的理解へ
 * - 実生活との関連を重視
 * - スモールステップで確実な定着
 */

import type {
  FractionProblem,
  Fraction,
  LearningMode,
  ProblemType,
  VisualizationType,
  SolutionStep
} from '../types';

/**
 * 分数を作成するヘルパー関数
 */
const createFraction = (
  numerator: number,
  denominator: number,
  wholeNumber?: number,
  isNegative?: boolean
): Fraction => ({
  numerator,
  denominator,
  wholeNumber: wholeNumber || 0,
  isNegative: isNegative || false
});

/**
 * 分数を最簡形に約分
 */
const simplifyFraction = (fraction: Fraction): Fraction => {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(Math.abs(fraction.numerator), Math.abs(fraction.denominator));
  
  return {
    numerator: fraction.numerator / divisor,
    denominator: fraction.denominator / divisor,
    wholeNumber: fraction.wholeNumber,
    isNegative: fraction.isNegative
  };
};

/**
 * 帯分数を仮分数に変換
 */
const toImproperFraction = (fraction: Fraction): Fraction => {
  if (!fraction.wholeNumber) return fraction;
  
  return {
    numerator: fraction.wholeNumber * fraction.denominator + fraction.numerator,
    denominator: fraction.denominator,
    isNegative: fraction.isNegative
  };
};

/**
 * 仮分数を帯分数に変換
 */
const toMixedNumber = (fraction: Fraction): Fraction => {
  if (fraction.numerator < fraction.denominator) return fraction;
  
  const wholeNumber = Math.floor(fraction.numerator / fraction.denominator);
  const remainder = fraction.numerator % fraction.denominator;
  
  return {
    numerator: remainder,
    denominator: fraction.denominator,
    wholeNumber,
    isNegative: fraction.isNegative
  };
};

/**
 * レベル1: 概念理解
 */
export const conceptProblems: FractionProblem[] = [
  {
    id: 'concept-1',
    mode: 'concept',
    type: 'identify',
    difficulty: 1,
    title: '分数って何？',
    description: 'ピザを分けて分数を理解しよう',
    question: 'ピザを4等分して、そのうち3つを食べました。食べた部分を分数で表すと？',
    fractions: [createFraction(3, 4)],
    answer: {
      fraction: createFraction(3, 4)
    },
    visualization: {
      type: 'pizza',
      settings: {
        totalSlices: 4,
        eatenSlices: 3
      }
    },
    hints: [
      'ピザ全体を4つに分けました',
      '食べたのは3つ分です',
      '分母は全体の数、分子は選んだ数を表します'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '全体を等分する',
        visual: {
          type: 'pizza',
          highlight: ['全体']
        }
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: '食べた部分を数える',
        visual: {
          type: 'pizza',
          highlight: ['食べた部分']
        },
        isKeyStep: true
      }
    ],
    tags: ['基礎', '視覚的', 'ピザ']
  },
  
  {
    id: 'concept-2',
    mode: 'concept',
    type: 'create',
    difficulty: 1,
    title: '分数を作ろう',
    description: '図形から分数を作る練習',
    question: '色のついた部分を分数で表してください',
    fractions: [createFraction(2, 5)],
    answer: {
      fraction: createFraction(2, 5)
    },
    visualization: {
      type: 'rectangle',
      settings: {
        totalParts: 5,
        coloredParts: 2,
        color: '#3498DB'
      }
    },
    hints: [
      '全体はいくつに分かれていますか？',
      '色のついた部分はいくつありますか？',
      '分母に全体の数、分子に色のついた数を書きます'
    ],
    tags: ['基礎', '作成', '長方形']
  },
  
  {
    id: 'concept-3',
    mode: 'concept',
    type: 'identify',
    difficulty: 2,
    title: '分数と数直線',
    description: '数直線上の分数の位置を理解しよう',
    question: '数直線上の印の位置を分数で表すと？',
    fractions: [createFraction(3, 8)],
    answer: {
      fraction: createFraction(3, 8)
    },
    visualization: {
      type: 'numberLine',
      settings: {
        start: 0,
        end: 1,
        divisions: 8,
        markPosition: 3
      }
    },
    hints: [
      '0から1の間が8等分されています',
      '印は左から3つ目の位置にあります',
      '8分の3と表します'
    ],
    tags: ['数直線', '位置', '視覚的']
  }
];

/**
 * レベル2: 等しい分数（約分・通分）
 */
export const equivalentProblems: FractionProblem[] = [
  {
    id: 'equivalent-1',
    mode: 'equivalent',
    type: 'simplify',
    difficulty: 2,
    title: '約分しよう',
    description: '分数を最も簡単な形にしよう',
    question: '6/8 を約分すると？',
    fractions: [createFraction(6, 8)],
    answer: {
      fraction: createFraction(3, 4)
    },
    visualization: {
      type: 'circle',
      settings: {
        showDivision: true
      }
    },
    hints: [
      '分子と分母の最大公約数を見つけよう',
      '6と8の最大公約数は2です',
      '分子と分母を2で割ります'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '最大公約数を見つける',
        operation: {
          type: 'simplify',
          from: [createFraction(6, 8)],
          to: [createFraction(6, 8)],
          explanation: '6 = 2 × 3, 8 = 2 × 4, 最大公約数は2'
        }
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: '分子と分母を最大公約数で割る',
        operation: {
          type: 'simplify',
          from: [createFraction(6, 8)],
          to: [createFraction(3, 4)],
          explanation: '6 ÷ 2 = 3, 8 ÷ 2 = 4'
        },
        isKeyStep: true
      }
    ],
    tags: ['約分', '最大公約数', '基本']
  },
  
  {
    id: 'equivalent-2',
    mode: 'equivalent',
    type: 'expand',
    difficulty: 2,
    title: '通分しよう',
    description: '2つの分数の分母をそろえよう',
    question: '1/3 と 1/4 を通分すると？',
    fractions: [createFraction(1, 3), createFraction(1, 4)],
    answer: {
      fractions: [createFraction(4, 12), createFraction(3, 12)]
    },
    hints: [
      '最小公倍数を見つけよう',
      '3と4の最小公倍数は12です',
      '各分数の分子と分母に同じ数をかけます'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '最小公倍数を見つける',
        operation: {
          type: 'expand',
          from: [createFraction(1, 3), createFraction(1, 4)],
          to: [createFraction(1, 3), createFraction(1, 4)],
          explanation: '3と4の最小公倍数は12'
        }
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: '各分数を通分する',
        operation: {
          type: 'expand',
          from: [createFraction(1, 3), createFraction(1, 4)],
          to: [createFraction(4, 12), createFraction(3, 12)],
          explanation: '1/3 = 4/12（×4）、1/4 = 3/12（×3）'
        },
        isKeyStep: true
      }
    ],
    tags: ['通分', '最小公倍数', '基本']
  }
];

/**
 * レベル3: 大小比較
 */
export const comparisonProblems: FractionProblem[] = [
  {
    id: 'compare-1',
    mode: 'comparison',
    type: 'compare',
    difficulty: 2,
    title: '分数の大小',
    description: '2つの分数の大きさを比べよう',
    question: '2/3 と 3/5 のどちらが大きい？',
    fractions: [createFraction(2, 3), createFraction(3, 5)],
    answer: {
      comparison: '>'
    },
    visualization: {
      type: 'rectangle',
      settings: {
        showComparison: true
      }
    },
    hints: [
      '通分して比べてみよう',
      '3と5の最小公倍数は15です',
      '2/3 = 10/15、3/5 = 9/15'
    ],
    tags: ['比較', '通分', '大小']
  },
  
  {
    id: 'compare-2',
    mode: 'comparison',
    type: 'compare',
    difficulty: 3,
    title: '3つの分数を並べよう',
    description: '小さい順に並べる練習',
    question: '1/2、2/5、3/4 を小さい順に並べると？',
    fractions: [createFraction(1, 2), createFraction(2, 5), createFraction(3, 4)],
    answer: {
      fractions: [createFraction(2, 5), createFraction(1, 2), createFraction(3, 4)]
    },
    hints: [
      'すべて通分してみよう',
      '分母を20にそろえると...',
      '2/5 = 8/20、1/2 = 10/20、3/4 = 15/20'
    ],
    tags: ['比較', '順序', '応用']
  }
];

/**
 * レベル4: 足し算
 */
export const additionProblems: FractionProblem[] = [
  {
    id: 'add-1',
    mode: 'addition',
    type: 'calculate',
    difficulty: 2,
    title: '同じ分母の足し算',
    description: '分母が同じ分数の足し算',
    question: '1/5 + 2/5 = ?',
    fractions: [createFraction(1, 5), createFraction(2, 5)],
    answer: {
      fraction: createFraction(3, 5)
    },
    visualization: {
      type: 'blocks',
      settings: {
        totalBlocks: 5,
        operation: 'add'
      }
    },
    hints: [
      '分母が同じときは分子だけを足します',
      '1 + 2 = 3',
      '答えは 3/5 です'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '分子を足す',
        operation: {
          type: 'calculate',
          from: [createFraction(1, 5), createFraction(2, 5)],
          to: [createFraction(3, 5)],
          explanation: '1 + 2 = 3、分母は5のまま'
        },
        isKeyStep: true
      }
    ],
    tags: ['足し算', '同分母', '基本']
  },
  
  {
    id: 'add-2',
    mode: 'addition',
    type: 'calculate',
    difficulty: 3,
    title: '違う分母の足し算',
    description: '通分してから足し算',
    question: '1/3 + 1/4 = ?',
    fractions: [createFraction(1, 3), createFraction(1, 4)],
    answer: {
      fraction: createFraction(7, 12)
    },
    hints: [
      'まず通分しましょう',
      '3と4の最小公倍数は12',
      '4/12 + 3/12 = 7/12'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '通分する',
        operation: {
          type: 'expand',
          from: [createFraction(1, 3), createFraction(1, 4)],
          to: [createFraction(4, 12), createFraction(3, 12)],
          explanation: '1/3 = 4/12、1/4 = 3/12'
        }
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: '分子を足す',
        operation: {
          type: 'calculate',
          from: [createFraction(4, 12), createFraction(3, 12)],
          to: [createFraction(7, 12)],
          explanation: '4 + 3 = 7、分母は12'
        },
        isKeyStep: true
      }
    ],
    tags: ['足し算', '異分母', '通分']
  }
];

/**
 * レベル5: 引き算
 */
export const subtractionProblems: FractionProblem[] = [
  {
    id: 'subtract-1',
    mode: 'subtraction',
    type: 'calculate',
    difficulty: 2,
    title: '同じ分母の引き算',
    description: '分母が同じ分数の引き算',
    question: '4/7 - 2/7 = ?',
    fractions: [createFraction(4, 7), createFraction(2, 7)],
    answer: {
      fraction: createFraction(2, 7)
    },
    hints: [
      '分母が同じときは分子だけを引きます',
      '4 - 2 = 2',
      '答えは 2/7 です'
    ],
    tags: ['引き算', '同分母', '基本']
  },
  
  {
    id: 'subtract-2',
    mode: 'subtraction',
    type: 'calculate',
    difficulty: 4,
    title: '帯分数の引き算',
    description: '整数部分からの繰り下がり',
    question: '2と1/3 - 3/4 = ?',
    fractions: [createFraction(1, 3, 2), createFraction(3, 4)],
    answer: {
      fraction: createFraction(7, 12, 1)
    },
    hints: [
      '帯分数を仮分数に直してみよう',
      '2と1/3 = 7/3',
      '通分してから引き算します'
    ],
    tags: ['引き算', '帯分数', '応用']
  }
];

/**
 * レベル6: かけ算
 */
export const multiplicationProblems: FractionProblem[] = [
  {
    id: 'multiply-1',
    mode: 'multiplication',
    type: 'calculate',
    difficulty: 3,
    title: '分数のかけ算',
    description: '分子同士、分母同士をかける',
    question: '2/3 × 3/4 = ?',
    fractions: [createFraction(2, 3), createFraction(3, 4)],
    answer: {
      fraction: createFraction(1, 2)
    },
    visualization: {
      type: 'rectangle',
      settings: {
        showArea: true
      }
    },
    hints: [
      '分子同士、分母同士をかけます',
      '2 × 3 = 6、3 × 4 = 12',
      '6/12 を約分すると 1/2'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: 'かけ算を実行',
        operation: {
          type: 'calculate',
          from: [createFraction(2, 3), createFraction(3, 4)],
          to: [createFraction(6, 12)],
          explanation: '(2×3)/(3×4) = 6/12'
        }
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: '約分する',
        operation: {
          type: 'simplify',
          from: [createFraction(6, 12)],
          to: [createFraction(1, 2)],
          explanation: '6/12 = 1/2（÷6）'
        },
        isKeyStep: true
      }
    ],
    tags: ['かけ算', '約分', '基本']
  }
];

/**
 * レベル7: わり算
 */
export const divisionProblems: FractionProblem[] = [
  {
    id: 'divide-1',
    mode: 'division',
    type: 'calculate',
    difficulty: 4,
    title: '分数のわり算',
    description: '逆数をかける',
    question: '3/4 ÷ 1/2 = ?',
    fractions: [createFraction(3, 4), createFraction(1, 2)],
    answer: {
      fraction: createFraction(3, 2)
    },
    hints: [
      'わり算は逆数のかけ算に直します',
      '1/2 の逆数は 2/1',
      '3/4 × 2/1 = 6/4 = 3/2'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '逆数に変換',
        operation: {
          type: 'convert',
          from: [createFraction(3, 4), createFraction(1, 2)],
          to: [createFraction(3, 4), createFraction(2, 1)],
          explanation: '÷ 1/2 → × 2/1'
        }
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: 'かけ算を実行',
        operation: {
          type: 'calculate',
          from: [createFraction(3, 4), createFraction(2, 1)],
          to: [createFraction(6, 4)],
          explanation: '3/4 × 2/1 = 6/4'
        }
      },
      {
        id: 'step-3',
        stepNumber: 3,
        description: '約分する',
        operation: {
          type: 'simplify',
          from: [createFraction(6, 4)],
          to: [createFraction(3, 2)],
          explanation: '6/4 = 3/2（÷2）'
        },
        isKeyStep: true
      }
    ],
    tags: ['わり算', '逆数', '応用']
  }
];

/**
 * レベル8: 文章題
 */
export const applicationProblems: FractionProblem[] = [
  {
    id: 'word-1',
    mode: 'application',
    type: 'word',
    difficulty: 3,
    title: 'ケーキを分けよう',
    description: '実生活での分数の活用',
    question: 'ケーキの3/4が残っています。それを3人で等しく分けると、1人分は元のケーキの何分のいくつ？',
    fractions: [createFraction(3, 4)],
    answer: {
      fraction: createFraction(1, 4)
    },
    visualization: {
      type: 'circle',
      settings: {
        showDivision: true,
        pieces: 12
      }
    },
    hints: [
      '3/4 を 3 で割ります',
      '3/4 ÷ 3 = 3/4 × 1/3',
      '= 3/12 = 1/4'
    ],
    tags: ['文章題', 'わり算', '実生活']
  },
  
  {
    id: 'word-2',
    mode: 'application',
    type: 'word',
    difficulty: 4,
    title: '水そうの水',
    description: '複雑な文章題',
    question: '水そうに水が2/5入っています。その水の3/4を使いました。使った水は水そう全体の何分のいくつ？',
    fractions: [createFraction(2, 5), createFraction(3, 4)],
    answer: {
      fraction: createFraction(3, 10)
    },
    hints: [
      '「〜の〜」はかけ算です',
      '2/5 の 3/4 = 2/5 × 3/4',
      '= 6/20 = 3/10'
    ],
    tags: ['文章題', 'かけ算', '応用']
  }
];

/**
 * 実生活の文脈
 */
export const realWorldContexts = [
  {
    id: 'cooking',
    category: 'cooking' as const,
    title: '料理での分数',
    description: 'レシピの分量調整',
    relatedProblems: ['word-1']
  },
  {
    id: 'time',
    category: 'time' as const,
    title: '時間の分数',
    description: '時間の計算',
    relatedProblems: []
  },
  {
    id: 'construction',
    category: 'construction' as const,
    title: '工作での分数',
    description: '材料の長さや面積',
    relatedProblems: []
  }
];

/**
 * 難易度別に問題を取得
 */
export const getProblemsByDifficulty = (difficulty: number): FractionProblem[] => {
  const allProblems = [
    ...conceptProblems,
    ...equivalentProblems,
    ...comparisonProblems,
    ...additionProblems,
    ...subtractionProblems,
    ...multiplicationProblems,
    ...divisionProblems,
    ...applicationProblems
  ];
  
  return allProblems.filter(problem => problem.difficulty === difficulty);
};

/**
 * モード別に問題を取得
 */
export const getProblemsByMode = (mode: LearningMode): FractionProblem[] => {
  const allProblems = [
    ...conceptProblems,
    ...equivalentProblems,
    ...comparisonProblems,
    ...additionProblems,
    ...subtractionProblems,
    ...multiplicationProblems,
    ...divisionProblems,
    ...applicationProblems
  ];
  
  return allProblems.filter(problem => problem.mode === mode);
};

/**
 * ランダムに問題を選択
 */
let lastProblemId: string | null = null;

export const getRandomProblem = (
  options?: {
    mode?: LearningMode;
    difficulty?: number;
    excludeTypes?: ProblemType[];
  }
): FractionProblem => {
  let problems = [
    ...conceptProblems,
    ...equivalentProblems,
    ...comparisonProblems,
    ...additionProblems,
    ...subtractionProblems,
    ...multiplicationProblems,
    ...divisionProblems,
    ...applicationProblems
  ];
  
  // フィルタリング
  if (options?.mode) {
    problems = problems.filter(p => p.mode === options.mode);
  }
  if (options?.difficulty) {
    problems = problems.filter(p => p.difficulty === options.difficulty);
  }
  if (options?.excludeTypes) {
    problems = problems.filter(p => !options.excludeTypes!.includes(p.type));
  }
  
  // 前回と同じ問題を除外
  problems = problems.filter(p => p.id !== lastProblemId);
  
  if (problems.length === 0) {
    throw new Error('条件に合う問題が見つかりません');
  }
  
  const problem = problems[Math.floor(Math.random() * problems.length)];
  lastProblemId = problem.id;
  
  return problem;
};