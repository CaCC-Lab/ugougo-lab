/**
 * 割合・百分率トレーナーの問題データ
 * 
 * 設計方針：
 * - 小学5-6年生の学習指導要領に準拠
 * - 実生活での応用を重視
 * - スモールステップで段階的に難易度上昇
 * - 視覚的理解を促進する問題設計
 */

import type { 
  PercentageProblem, 
  RealWorldScenario,
  StatisticsData,
  ShoppingItem,
  WaribunUnits 
} from '../types';

/**
 * 問題生成ヘルパー関数
 */
const createProblem = (
  id: string,
  type: PercentageProblem['type'],
  question: string,
  given: PercentageProblem['given'],
  answerValue: number,
  difficulty: PercentageProblem['difficulty'] = 1,
  hints: string[] = [],
  context?: string
): PercentageProblem => ({
  id,
  type,
  difficulty,
  question,
  context,
  given,
  answer: {
    value: answerValue,
    format: 'percentage',
    unit: type === 'findCompareAmount' || type === 'findBaseAmount' ? '個' : '%'
  },
  hints,
  explanation: '',
  tags: []
});

/**
 * レベル1: 基本的な割合の概念理解
 */
export const conceptProblems: PercentageProblem[] = [
  {
    id: 'concept-1',
    type: 'findPercentage',
    difficulty: 1,
    question: '20個のりんごのうち、5個が赤いりんごです。赤いりんごの割合は何%ですか？',
    given: {
      baseAmount: 20,
      compareAmount: 5
    },
    answer: {
      value: 25,
      format: 'percentage',
      unit: '%'
    },
    hints: [
      '割合 = 比べる量 ÷ もとにする量',
      '5 ÷ 20 = 0.25',
      '0.25を百分率にすると...'
    ],
    explanation: '5 ÷ 20 = 0.25、0.25 × 100 = 25%',
    tags: ['基本', '果物']
  },
  
  {
    id: 'concept-2',
    type: 'findPercentage',
    difficulty: 1,
    question: '40人のクラスで、12人が眼鏡をかけています。眼鏡をかけている人の割合は何%ですか？',
    given: {
      baseAmount: 40,
      compareAmount: 12
    },
    answer: {
      value: 30,
      format: 'percentage',
      unit: '%'
    },
    hints: [
      '全体の人数がもとにする量',
      '眼鏡をかけている人数が比べる量',
      '12 ÷ 40を計算してみよう'
    ],
    explanation: '12 ÷ 40 = 0.3、0.3 × 100 = 30%',
    tags: ['基本', '学校']
  },
  
  {
    id: 'concept-3',
    type: 'findCompareAmount',
    difficulty: 1,
    question: '100円の20%はいくらですか？',
    given: {
      baseAmount: 100,
      percentage: 0.2
    },
    answer: {
      value: 20,
      format: 'decimal',
      unit: '円'
    },
    hints: [
      '比べる量 = もとにする量 × 割合',
      '100 × 0.2 = ?',
      '20%は0.2と同じ'
    ],
    explanation: '100 × 0.2 = 20円',
    tags: ['基本', 'お金']
  }
];

/**
 * レベル2: 計算練習（3要素の相互計算）
 */
export const calculationProblems: PercentageProblem[] = [
  {
    id: 'calc-1',
    type: 'findCompareAmount',
    difficulty: 2,
    question: '定価800円の商品が25%引きです。割引額はいくらですか？',
    context: 'セールで買い物をしています',
    given: {
      baseAmount: 800,
      percentage: 0.25
    },
    answer: {
      value: 200,
      format: 'decimal',
      unit: '円'
    },
    hints: [
      '25%引きということは、定価の25%が割引額',
      '800円の25%を求めよう',
      '800 × 0.25 = ?'
    ],
    explanation: '800 × 0.25 = 200円が割引額',
    tags: ['買い物', '割引']
  },
  
  {
    id: 'calc-2',
    type: 'findBaseAmount',
    difficulty: 3,
    question: 'ある数の30%が45です。もとの数はいくつですか？',
    given: {
      compareAmount: 45,
      percentage: 0.3
    },
    answer: {
      value: 150,
      format: 'decimal'
    },
    hints: [
      'もとにする量 = 比べる量 ÷ 割合',
      '? × 0.3 = 45',
      '45 ÷ 0.3 = ?'
    ],
    explanation: '45 ÷ 0.3 = 150',
    tags: ['逆算', '応用']
  },
  
  {
    id: 'calc-3',
    type: 'findPercentage',
    difficulty: 2,
    question: '昨日の気温は20度、今日は25度です。気温は何%上がりましたか？',
    context: '天気の変化を調べています',
    given: {
      baseAmount: 20,
      compareAmount: 5  // 増加分
    },
    answer: {
      value: 25,
      format: 'percentage',
      unit: '%'
    },
    hints: [
      '増加分 = 25 - 20 = 5度',
      '増加率 = 増加分 ÷ もとの値',
      '5 ÷ 20 = ?'
    ],
    explanation: '(25-20) ÷ 20 = 5 ÷ 20 = 0.25 = 25%',
    tags: ['増加率', '天気']
  }
];

/**
 * レベル3: 変換練習（百分率⇔小数⇔分数⇔歩合）
 */
export const conversionProblems: PercentageProblem[] = [
  {
    id: 'convert-1',
    type: 'findPercentage',
    difficulty: 2,
    question: '0.75を百分率で表すと何%ですか？',
    given: {
      percentage: 0.75
    },
    answer: {
      value: 75,
      format: 'percentage',
      unit: '%'
    },
    hints: [
      '小数を百分率にするには100をかける',
      '0.75 × 100 = ?'
    ],
    explanation: '0.75 × 100 = 75%',
    tags: ['変換', '小数→百分率']
  },
  
  {
    id: 'convert-2',
    type: 'findPercentage',
    difficulty: 2,
    question: '3/4を百分率で表すと何%ですか？',
    given: {
      percentage: 0.75  // 3/4
    },
    answer: {
      value: 75,
      format: 'percentage',
      unit: '%'
    },
    hints: [
      '分数を小数にしてから百分率に',
      '3 ÷ 4 = 0.75',
      '0.75 × 100 = ?'
    ],
    explanation: '3 ÷ 4 = 0.75、0.75 × 100 = 75%',
    tags: ['変換', '分数→百分率']
  },
  
  {
    id: 'convert-3',
    type: 'findPercentage',
    difficulty: 3,
    question: '2割5分を百分率で表すと何%ですか？',
    given: {
      percentage: 0.25
    },
    answer: {
      value: 25,
      format: 'percentage',
      unit: '%'
    },
    hints: [
      '1割 = 10%',
      '1分 = 1%',
      '2割5分 = 20% + 5% = ?'
    ],
    explanation: '2割 = 20%、5分 = 5%、合計25%',
    tags: ['変換', '歩合→百分率']
  }
];

/**
 * 実生活シナリオ: 買い物
 */
export const shoppingScenario: RealWorldScenario = {
  id: 'shopping-sale',
  title: 'スーパーのセール',
  description: '週末のスーパーでセールが開催されています。お得に買い物をしましょう！',
  category: 'shopping',
  data: {
    items: [
      {
        id: 'apple',
        name: 'りんご（1袋）',
        originalPrice: 500,
        discountPercentage: 20,
        icon: '🍎'
      },
      {
        id: 'milk',
        name: '牛乳（1L）',
        originalPrice: 250,
        discountPercentage: 15,
        icon: '🥛'
      },
      {
        id: 'bread',
        name: '食パン（1斤）',
        originalPrice: 180,
        discountPercentage: 30,
        icon: '🍞'
      },
      {
        id: 'eggs',
        name: '卵（10個入り）',
        originalPrice: 300,
        discountPercentage: 10,
        icon: '🥚'
      }
    ]
  },
  problems: [
    {
      id: 'shop-1',
      type: 'findCompareAmount',
      difficulty: 2,
      question: 'りんご（定価500円）が20%引きです。セール価格はいくらですか？',
      given: {
        baseAmount: 500,
        percentage: 0.8  // 80%の価格 = 20%引き
      },
      answer: {
        value: 400,
        format: 'decimal',
        unit: '円'
      },
      hints: [
        '20%引きということは、80%の価格で買える',
        '500円の80%を計算',
        '500 × 0.8 = ?'
      ],
      explanation: '20%引き = 80%の価格、500 × 0.8 = 400円',
      tags: ['買い物', '割引']
    },
    {
      id: 'shop-2',
      type: 'findCompareAmount',
      difficulty: 3,
      question: 'すべての商品を1つずつ買うと、割引前の合計金額はいくらですか？また、割引後の合計金額はいくらですか？',
      given: {
        baseAmount: 1230  // 500 + 250 + 180 + 300
      },
      answer: {
        value: 1037,  // 400 + 212.5 + 126 + 270
        format: 'decimal',
        unit: '円'
      },
      hints: [
        'まず割引前の合計を計算',
        '各商品の割引後の価格を計算',
        '割引後の価格を合計'
      ],
      explanation: '割引前: 1230円、割引後: 1037円（約193円お得）',
      tags: ['買い物', '複合計算']
    }
  ],
  objectives: [
    '割引計算の実践的な理解',
    '複数商品の割引計算',
    'お得度の比較'
  ]
};

/**
 * 実生活シナリオ: 統計データ
 */
export const statisticsScenario: RealWorldScenario = {
  id: 'class-survey',
  title: 'クラスアンケート',
  description: 'クラスで好きな教科についてアンケートを取りました。結果を分析してみましょう。',
  category: 'statistics',
  data: {
    stats: [
      { label: '算数', value: 12, percentage: 30, color: '#FF6B6B' },
      { label: '国語', value: 8, percentage: 20, color: '#4ECDC4' },
      { label: '理科', value: 10, percentage: 25, color: '#45B7D1' },
      { label: '社会', value: 6, percentage: 15, color: '#96CEB4' },
      { label: '体育', value: 4, percentage: 10, color: '#DDA0DD' }
    ]
  },
  problems: [
    {
      id: 'stat-1',
      type: 'findPercentage',
      difficulty: 2,
      question: 'クラス40人中、算数が好きな人は12人でした。算数が好きな人の割合は何%ですか？',
      given: {
        baseAmount: 40,
        compareAmount: 12
      },
      answer: {
        value: 30,
        format: 'percentage',
        unit: '%'
      },
      hints: [
        'クラス全体の人数がもとにする量',
        '算数が好きな人数が比べる量',
        '12 ÷ 40 = ?'
      ],
      explanation: '12 ÷ 40 = 0.3 = 30%',
      tags: ['統計', '学校']
    }
  ],
  objectives: [
    'データの割合計算',
    '円グラフの理解',
    '統計の基礎'
  ]
};

/**
 * 歩合変換ユーティリティ
 */
export const waribunConversion = {
  toPercentage: (waribun: WaribunUnits): number => {
    return waribun.wari * 10 + waribun.bu * 1 + waribun.rin * 0.1 + (waribun.mou || 0) * 0.01;
  },
  
  fromPercentage: (percentage: number): WaribunUnits => {
    const wari = Math.floor(percentage / 10);
    const bu = Math.floor((percentage % 10) / 1);
    const rin = Math.floor((percentage % 1) / 0.1);
    const mou = Math.round((percentage % 0.1) / 0.01);
    
    return { wari, bu, rin, mou: mou > 0 ? mou : undefined };
  }
};

/**
 * 難易度別問題取得
 */
export const getProblemsByDifficulty = (difficulty: number): PercentageProblem[] => {
  const allProblems = [
    ...conceptProblems,
    ...calculationProblems,
    ...conversionProblems,
    ...shoppingScenario.problems,
    ...statisticsScenario.problems
  ];
  
  return allProblems.filter(problem => problem.difficulty === difficulty);
};

/**
 * タイプ別問題取得
 */
export const getProblemsByType = (type: PercentageProblem['type']): PercentageProblem[] => {
  const allProblems = [
    ...conceptProblems,
    ...calculationProblems,
    ...conversionProblems,
    ...shoppingScenario.problems,
    ...statisticsScenario.problems
  ];
  
  return allProblems.filter(problem => problem.type === type);
};

/**
 * ランダム問題選択
 */
let lastProblemId: string | null = null;

export const getRandomProblem = (
  options?: {
    type?: PercentageProblem['type'];
    difficulty?: number;
    excludeTags?: string[];
  }
): PercentageProblem => {
  let problems = [
    ...conceptProblems,
    ...calculationProblems,
    ...conversionProblems,
    ...shoppingScenario.problems,
    ...statisticsScenario.problems
  ];
  
  // フィルタリング
  if (options?.type) {
    problems = problems.filter(p => p.type === options.type);
  }
  if (options?.difficulty) {
    problems = problems.filter(p => p.difficulty === options.difficulty);
  }
  if (options?.excludeTags) {
    problems = problems.filter(p => 
      !p.tags.some(tag => options.excludeTags!.includes(tag))
    );
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