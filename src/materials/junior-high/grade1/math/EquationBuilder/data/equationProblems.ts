/**
 * 一次方程式ビルダーの問題データ
 * 
 * 設計方針：
 * - 中学1年生の学習指導要領に準拠
 * - 等式の性質から段階的に学習
 * - 実生活との関連を重視
 * - 視覚的理解を促進する問題設計
 */

import type {
  EquationProblem,
  Equation,
  EquationTerm,
  SolutionStep,
  Operation,
  LearningMode,
  RealWorldContext
} from '../types';

/**
 * 方程式を作成するヘルパー関数
 */
const createEquation = (
  leftTerms: { coef: number; var?: string; const?: number }[],
  rightTerms: { coef: number; var?: string; const?: number }[],
  solution: number
): Equation => {
  const id = `eq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const leftSide = leftTerms.map(term => ({
    coefficient: term.coef,
    variable: term.var,
    constant: term.const,
    isVisible: true,
    color: term.var ? '#3498DB' : '#2ECC71'
  }));
  
  const rightSide = rightTerms.map(term => ({
    coefficient: term.coef,
    variable: term.var,
    constant: term.const,
    isVisible: true,
    color: term.var ? '#E74C3C' : '#F39C12'
  }));
  
  // 元の形と標準形を生成
  const originalForm = formatEquation(leftSide, rightSide);
  const standardForm = toStandardForm(leftSide, rightSide);
  
  return {
    id,
    leftSide,
    rightSide,
    solution,
    originalForm,
    standardForm
  };
};

/**
 * 方程式を文字列形式に変換
 */
const formatEquation = (left: EquationTerm[], right: EquationTerm[]): string => {
  const formatSide = (terms: EquationTerm[]) => {
    return terms.map((term, index) => {
      if (term.variable) {
        const coef = term.coefficient === 1 ? '' : term.coefficient === -1 ? '-' : term.coefficient;
        return `${index > 0 && term.coefficient >= 0 ? '+' : ''}${coef}${term.variable}`;
      } else if (term.constant !== undefined) {
        return `${index > 0 && term.constant >= 0 ? '+' : ''}${term.constant}`;
      }
      return '';
    }).filter(s => s).join(' ');
  };
  
  return `${formatSide(left)} = ${formatSide(right)}`;
};

/**
 * 標準形に変換
 */
const toStandardForm = (left: EquationTerm[], right: EquationTerm[]): string => {
  // 実装は省略（すべての項を左辺に移項してax + b = 0の形にする）
  return 'ax + b = 0';
};

/**
 * レベル1: 概念理解（天秤でバランスを学ぶ）
 */
export const conceptProblems: EquationProblem[] = [
  {
    id: 'concept-1',
    mode: 'concept',
    difficulty: 1,
    title: '天秤のバランス',
    description: '左右の重さを同じにしてバランスを取ろう',
    equation: createEquation(
      [{ coef: 1, var: 'x' }, { const: 3 }],
      [{ const: 7 }],
      4
    ),
    hints: [
      '天秤の左側にはxと3があります',
      '右側には7があります',
      'xがいくつなら左右が同じ重さになるかな？'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '元の式を確認',
        equation: createEquation(
          [{ coef: 1, var: 'x' }, { const: 3 }],
          [{ const: 7 }],
          4
        ),
        explanation: 'x + 3 = 7 という式は、左側の重さ(x + 3)と右側の重さ(7)が等しいことを表しています',
        visualHint: '天秤が水平になるようにxの値を見つけよう'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: '両辺から3を引く',
        equation: createEquation(
          [{ coef: 1, var: 'x' }],
          [{ const: 4 }],
          4
        ),
        operation: {
          type: 'subtract',
          value: 3,
          targetSide: 'both',
          description: '両辺から3を引く'
        },
        explanation: 'x + 3 - 3 = 7 - 3 → x = 4',
        isKeyStep: true
      }
    ],
    objectives: [
      '等式の性質を理解する',
      '天秤のバランスと方程式の関係を理解する',
      '両辺に同じ操作をすることの意味を理解する'
    ],
    tags: ['基礎', '天秤', '等式の性質']
  },
  
  {
    id: 'concept-2',
    mode: 'concept',
    difficulty: 1,
    title: '同じ重さの箱',
    description: '同じ重さの箱xが2つあります。全体の重さから1つの箱の重さを求めよう',
    equation: createEquation(
      [{ coef: 2, var: 'x' }],
      [{ const: 10 }],
      5
    ),
    hints: [
      '同じ重さの箱が2つで10kgです',
      '1つの箱の重さはいくらでしょう？',
      '10を2で割ってみよう'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '元の式を確認',
        equation: createEquation(
          [{ coef: 2, var: 'x' }],
          [{ const: 10 }],
          5
        ),
        explanation: '2x = 10 は、同じ重さxの箱が2つで合計10kgという意味です'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: '両辺を2で割る',
        equation: createEquation(
          [{ coef: 1, var: 'x' }],
          [{ const: 5 }],
          5
        ),
        operation: {
          type: 'divide',
          value: 2,
          targetSide: 'both',
          description: '両辺を2で割る'
        },
        explanation: '2x ÷ 2 = 10 ÷ 2 → x = 5',
        isKeyStep: true
      }
    ],
    objectives: [
      '係数の意味を理解する',
      '両辺を同じ数で割ることができることを理解する'
    ],
    tags: ['基礎', '係数', '除法']
  }
];

/**
 * レベル2: 基本形（ax = b）
 */
export const basicProblems: EquationProblem[] = [
  {
    id: 'basic-1',
    mode: 'basic',
    difficulty: 1,
    title: '基本の方程式',
    description: '3x = 12 を解こう',
    equation: createEquation(
      [{ coef: 3, var: 'x' }],
      [{ const: 12 }],
      4
    ),
    hints: [
      '3x = 12 は「3倍すると12になる数」を求める式です',
      '両辺を3で割ってみよう'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '両辺を3で割る',
        equation: createEquation(
          [{ coef: 1, var: 'x' }],
          [{ const: 4 }],
          4
        ),
        operation: {
          type: 'divide',
          value: 3,
          targetSide: 'both',
          description: '両辺を3で割る'
        },
        explanation: '3x ÷ 3 = 12 ÷ 3 → x = 4',
        isKeyStep: true
      }
    ],
    objectives: ['基本的な一次方程式を解く'],
    tags: ['基本形', '除法']
  },
  
  {
    id: 'basic-2',
    mode: 'basic',
    difficulty: 2,
    title: '負の係数',
    description: '-2x = 8 を解こう',
    equation: createEquation(
      [{ coef: -2, var: 'x' }],
      [{ const: 8 }],
      -4
    ),
    hints: [
      '-2x = 8 は「-2倍すると8になる数」を求める式です',
      '両辺を-2で割ってみよう',
      '負の数で割るときは符号に注意！'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '両辺を-2で割る',
        equation: createEquation(
          [{ coef: 1, var: 'x' }],
          [{ const: -4 }],
          -4
        ),
        operation: {
          type: 'divide',
          value: -2,
          targetSide: 'both',
          description: '両辺を-2で割る'
        },
        explanation: '-2x ÷ (-2) = 8 ÷ (-2) → x = -4',
        visualHint: '負の数で割ると符号が変わることに注意',
        isKeyStep: true
      }
    ],
    objectives: ['負の係数を含む方程式を解く'],
    tags: ['基本形', '負の数']
  }
];

/**
 * レベル3: 中級（ax + b = c）
 */
export const intermediateProblems: EquationProblem[] = [
  {
    id: 'intermediate-1',
    mode: 'intermediate',
    difficulty: 2,
    title: '移項の基本',
    description: '2x + 5 = 13 を解こう',
    equation: createEquation(
      [{ coef: 2, var: 'x' }, { const: 5 }],
      [{ const: 13 }],
      4
    ),
    hints: [
      'まず定数項を移項してみよう',
      '両辺から5を引くと...',
      '最後に係数で割ろう'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '両辺から5を引く',
        equation: createEquation(
          [{ coef: 2, var: 'x' }],
          [{ const: 8 }],
          4
        ),
        operation: {
          type: 'subtract',
          value: 5,
          targetSide: 'both',
          description: '両辺から5を引く（5を移項）'
        },
        explanation: '2x + 5 - 5 = 13 - 5 → 2x = 8',
        isKeyStep: true
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: '両辺を2で割る',
        equation: createEquation(
          [{ coef: 1, var: 'x' }],
          [{ const: 4 }],
          4
        ),
        operation: {
          type: 'divide',
          value: 2,
          targetSide: 'both',
          description: '両辺を2で割る'
        },
        explanation: '2x ÷ 2 = 8 ÷ 2 → x = 4'
      }
    ],
    objectives: [
      '移項の概念を理解する',
      '複数のステップで方程式を解く'
    ],
    tags: ['中級', '移項', '2ステップ']
  },
  
  {
    id: 'intermediate-2',
    mode: 'intermediate',
    difficulty: 3,
    title: '負の数を含む方程式',
    description: '3x - 7 = 5 を解こう',
    equation: createEquation(
      [{ coef: 3, var: 'x' }, { const: -7 }],
      [{ const: 5 }],
      4
    ),
    hints: [
      '-7を移項すると符号が変わります',
      '両辺に7を足すと...',
      '3x = 12になったら、両辺を3で割ろう'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '両辺に7を足す',
        equation: createEquation(
          [{ coef: 3, var: 'x' }],
          [{ const: 12 }],
          4
        ),
        operation: {
          type: 'add',
          value: 7,
          targetSide: 'both',
          description: '両辺に7を足す（-7を移項）'
        },
        explanation: '3x - 7 + 7 = 5 + 7 → 3x = 12',
        visualHint: '移項すると符号が変わる',
        isKeyStep: true
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: '両辺を3で割る',
        equation: createEquation(
          [{ coef: 1, var: 'x' }],
          [{ const: 4 }],
          4
        ),
        operation: {
          type: 'divide',
          value: 3,
          targetSide: 'both',
          description: '両辺を3で割る'
        },
        explanation: '3x ÷ 3 = 12 ÷ 3 → x = 4'
      }
    ],
    objectives: [
      '負の数の移項を理解する',
      '符号の変化に注意する'
    ],
    tags: ['中級', '負の数', '移項']
  }
];

/**
 * レベル4: 上級（ax + b = cx + d）
 */
export const advancedProblems: EquationProblem[] = [
  {
    id: 'advanced-1',
    mode: 'advanced',
    difficulty: 3,
    title: '両辺に変数がある方程式',
    description: '5x + 3 = 2x + 12 を解こう',
    equation: createEquation(
      [{ coef: 5, var: 'x' }, { const: 3 }],
      [{ coef: 2, var: 'x' }, { const: 12 }],
      3
    ),
    hints: [
      'xの項を片側に集めよう',
      '2xを左辺に移項すると...',
      '定数項も片側に集めよう'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '両辺から2xを引く',
        equation: createEquation(
          [{ coef: 3, var: 'x' }, { const: 3 }],
          [{ const: 12 }],
          3
        ),
        operation: {
          type: 'subtract',
          value: 2,
          targetSide: 'both',
          description: '両辺から2xを引く（xの項をまとめる）'
        },
        explanation: '5x - 2x + 3 = 2x - 2x + 12 → 3x + 3 = 12',
        isKeyStep: true
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: '両辺から3を引く',
        equation: createEquation(
          [{ coef: 3, var: 'x' }],
          [{ const: 9 }],
          3
        ),
        operation: {
          type: 'subtract',
          value: 3,
          targetSide: 'both',
          description: '両辺から3を引く'
        },
        explanation: '3x + 3 - 3 = 12 - 3 → 3x = 9'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        description: '両辺を3で割る',
        equation: createEquation(
          [{ coef: 1, var: 'x' }],
          [{ const: 3 }],
          3
        ),
        operation: {
          type: 'divide',
          value: 3,
          targetSide: 'both',
          description: '両辺を3で割る'
        },
        explanation: '3x ÷ 3 = 9 ÷ 3 → x = 3'
      }
    ],
    objectives: [
      '両辺に変数がある方程式を解く',
      '同類項をまとめる'
    ],
    tags: ['上級', '両辺に変数', '3ステップ']
  }
];

/**
 * 文章題
 */
export const wordProblems: EquationProblem[] = [
  {
    id: 'word-1',
    mode: 'wordProblem',
    difficulty: 3,
    title: 'りんごの値段',
    description: 'りんごを何個か買って、50円のレジ袋と合わせて350円でした。りんご1個が100円のとき、何個買いましたか？',
    equation: createEquation(
      [{ coef: 100, var: 'x' }, { const: 50 }],
      [{ const: 350 }],
      3
    ),
    wordProblem: {
      context: 'スーパーでの買い物',
      question: 'りんごを何個買いましたか？',
      variables: {
        x: 'りんごの個数'
      },
      answer: {
        value: 3,
        unit: '個'
      }
    },
    hints: [
      'りんごx個の値段は100x円です',
      'レジ袋代50円を足すと全体の値段になります',
      '式は 100x + 50 = 350 となります'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '文章から式を作る',
        equation: createEquation(
          [{ coef: 100, var: 'x' }, { const: 50 }],
          [{ const: 350 }],
          3
        ),
        explanation: 'りんごx個の値段(100x円) + レジ袋(50円) = 合計(350円)',
        visualHint: '文章の情報を整理して式にしよう'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: '両辺から50を引く',
        equation: createEquation(
          [{ coef: 100, var: 'x' }],
          [{ const: 300 }],
          3
        ),
        operation: {
          type: 'subtract',
          value: 50,
          targetSide: 'both',
          description: '両辺から50を引く'
        },
        explanation: '100x + 50 - 50 = 350 - 50 → 100x = 300'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        description: '両辺を100で割る',
        equation: createEquation(
          [{ coef: 1, var: 'x' }],
          [{ const: 3 }],
          3
        ),
        operation: {
          type: 'divide',
          value: 100,
          targetSide: 'both',
          description: '両辺を100で割る'
        },
        explanation: '100x ÷ 100 = 300 ÷ 100 → x = 3'
      }
    ],
    objectives: [
      '文章から方程式を立てる',
      '実生活の問題を数式で表現する'
    ],
    tags: ['文章題', '買い物', '実生活']
  },
  
  {
    id: 'word-2',
    mode: 'wordProblem',
    difficulty: 4,
    title: '年齢の問題',
    description: '父の年齢は子どもの年齢の3倍より2歳若いです。父が34歳のとき、子どもは何歳ですか？',
    equation: createEquation(
      [{ coef: 3, var: 'x' }, { const: -2 }],
      [{ const: 34 }],
      12
    ),
    wordProblem: {
      context: '家族の年齢',
      question: '子どもは何歳ですか？',
      variables: {
        x: '子どもの年齢'
      },
      answer: {
        value: 12,
        unit: '歳'
      }
    },
    hints: [
      '子どもの年齢をx歳とします',
      '「3倍より2歳若い」は「3x - 2」と表せます',
      '父の年齢 = 3x - 2 = 34'
    ],
    solutionSteps: [
      {
        id: 'step-1',
        stepNumber: 1,
        description: '文章から式を作る',
        equation: createEquation(
          [{ coef: 3, var: 'x' }, { const: -2 }],
          [{ const: 34 }],
          12
        ),
        explanation: '子どもの年齢をx歳とすると、父の年齢 = 3x - 2 = 34'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        description: '両辺に2を足す',
        equation: createEquation(
          [{ coef: 3, var: 'x' }],
          [{ const: 36 }],
          12
        ),
        operation: {
          type: 'add',
          value: 2,
          targetSide: 'both',
          description: '両辺に2を足す'
        },
        explanation: '3x - 2 + 2 = 34 + 2 → 3x = 36'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        description: '両辺を3で割る',
        equation: createEquation(
          [{ coef: 1, var: 'x' }],
          [{ const: 12 }],
          12
        ),
        operation: {
          type: 'divide',
          value: 3,
          targetSide: 'both',
          description: '両辺を3で割る'
        },
        explanation: '3x ÷ 3 = 36 ÷ 3 → x = 12'
      }
    ],
    objectives: [
      '複雑な文章から方程式を立てる',
      '「〜倍より〜多い/少ない」の表現を理解する'
    ],
    tags: ['文章題', '年齢', '応用']
  }
];

/**
 * 実生活の文脈
 */
export const realWorldContexts: RealWorldContext[] = [
  {
    id: 'shopping-context',
    category: 'shopping',
    title: '買い物での計算',
    description: '商品の値段、おつり、割引などの計算',
    relatedProblems: ['word-1']
  },
  {
    id: 'sports-context',
    category: 'sports',
    title: 'スポーツの記録',
    description: '得点、タイム、距離などの計算',
    relatedProblems: []
  },
  {
    id: 'travel-context',
    category: 'travel',
    title: '旅行の計画',
    description: '距離、時間、費用などの計算',
    relatedProblems: []
  }
];

/**
 * 難易度別に問題を取得
 */
export const getProblemsByDifficulty = (difficulty: number): EquationProblem[] => {
  const allProblems = [
    ...conceptProblems,
    ...basicProblems,
    ...intermediateProblems,
    ...advancedProblems,
    ...wordProblems
  ];
  
  return allProblems.filter(problem => problem.difficulty === difficulty);
};

/**
 * モード別に問題を取得
 */
export const getProblemsByMode = (mode: LearningMode): EquationProblem[] => {
  const allProblems = [
    ...conceptProblems,
    ...basicProblems,
    ...intermediateProblems,
    ...advancedProblems,
    ...wordProblems
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
    excludeTags?: string[];
  }
): EquationProblem => {
  let problems = [
    ...conceptProblems,
    ...basicProblems,
    ...intermediateProblems,
    ...advancedProblems,
    ...wordProblems
  ];
  
  // フィルタリング
  if (options?.mode) {
    problems = problems.filter(p => p.mode === options.mode);
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