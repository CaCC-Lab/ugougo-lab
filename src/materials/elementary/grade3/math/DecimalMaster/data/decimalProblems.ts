/**
 * 小数マスターの問題データ
 * 
 * 設計方針：
 * - 小学3-4年生の学習指導要領に準拠
 * - スモールステップで段階的に難易度上昇
 * - 実生活と関連付けた文脈を提供
 */

import type { DecimalProblem, RealWorldExample } from '../types';

/**
 * 問題生成用のヘルパー関数
 */
const createProblem = (
  type: DecimalProblem['type'],
  num1: number,
  num2: number,
  difficulty: DecimalProblem['difficulty'],
  hint?: string,
  context?: string
): DecimalProblem => {
  const operations = {
    addition: (a: number, b: number) => a + b,
    subtraction: (a: number, b: number) => a - b,
    multiplication: (a: number, b: number) => a * b,
    division: (a: number, b: number) => a / b
  };
  
  const answer = operations[type](num1, num2);
  
  return {
    id: `${type}-${num1}-${num2}`,
    type,
    operand1: {
      integerPart: Math.floor(num1),
      decimalPart: Math.round((num1 - Math.floor(num1)) * 100) / 100,
      value: num1,
      displayString: num1.toString()
    },
    operand2: {
      integerPart: Math.floor(num2),
      decimalPart: Math.round((num2 - Math.floor(num2)) * 100) / 100,
      value: num2,
      displayString: num2.toString()
    },
    answer: {
      integerPart: Math.floor(answer),
      decimalPart: Math.round((answer - Math.floor(answer)) * 100) / 100,
      value: answer,
      displayString: answer.toString()
    },
    difficulty,
    hint,
    realWorldContext: context
  };
};

/**
 * 概念理解用の基礎問題
 */
export const conceptProblems: DecimalProblem[] = [
  // 0.1の理解
  createProblem('addition', 0.1, 0.1, 1, '0.1が2つで0.2になるよ'),
  createProblem('addition', 0.1, 0.2, 1, '10分の1と10分の2を合わせると？'),
  createProblem('addition', 0.3, 0.1, 1),
  createProblem('addition', 0.5, 0.1, 1),
  
  // 0.01の理解
  createProblem('addition', 0.01, 0.01, 2, '0.01が2つで0.02になるよ'),
  createProblem('addition', 0.01, 0.02, 2),
  createProblem('addition', 0.05, 0.01, 2),
  
  // 0.1と0.01の組み合わせ
  createProblem('addition', 0.1, 0.01, 2, '10分の1と100分の1を合わせると？'),
  createProblem('addition', 0.2, 0.03, 2),
  createProblem('addition', 0.5, 0.05, 2)
];

/**
 * 位取り理解の問題
 */
export const placeValueProblems: DecimalProblem[] = [
  // 整数と小数の組み合わせ
  createProblem('addition', 1, 0.1, 1, '1と0.1を合わせると？'),
  createProblem('addition', 2, 0.3, 1),
  createProblem('addition', 5, 0.5, 1),
  
  // 位取りの移動
  createProblem('multiplication', 0.1, 10, 2, '0.1を10倍すると？'),
  createProblem('multiplication', 0.01, 10, 2, '0.01を10倍すると？'),
  createProblem('division', 1, 10, 2, '1を10で割ると？'),
  createProblem('division', 0.1, 10, 3, '0.1を10で割ると？')
];

/**
 * たし算の練習問題
 */
export const additionProblems: DecimalProblem[] = [
  // レベル1：小数第1位まで
  createProblem('addition', 0.3, 0.4, 1),
  createProblem('addition', 0.6, 0.2, 1),
  createProblem('addition', 0.5, 0.5, 1, '0.5 + 0.5 = 1.0になるよ'),
  createProblem('addition', 0.7, 0.4, 1, '繰り上がりに注意！'),
  
  // レベル2：小数第2位まで
  createProblem('addition', 0.25, 0.35, 2),
  createProblem('addition', 0.48, 0.27, 2),
  createProblem('addition', 0.65, 0.38, 2, '繰り上がりがあるよ'),
  
  // レベル3：整数部分あり
  createProblem('addition', 1.2, 0.5, 2),
  createProblem('addition', 2.4, 1.3, 2),
  createProblem('addition', 3.7, 2.6, 3, '整数部分も繰り上がるよ'),
  createProblem('addition', 5.85, 3.47, 3)
];

/**
 * ひき算の練習問題
 */
export const subtractionProblems: DecimalProblem[] = [
  // レベル1：繰り下がりなし
  createProblem('subtraction', 0.8, 0.3, 1),
  createProblem('subtraction', 0.7, 0.4, 1),
  createProblem('subtraction', 0.9, 0.2, 1),
  
  // レベル2：繰り下がりあり
  createProblem('subtraction', 1, 0.3, 2, '1.0 - 0.3として考えよう'),
  createProblem('subtraction', 1, 0.7, 2),
  createProblem('subtraction', 2.3, 0.8, 2, '繰り下がりに注意'),
  
  // レベル3：小数第2位まで
  createProblem('subtraction', 1.52, 0.38, 3),
  createProblem('subtraction', 3.45, 1.78, 3),
  createProblem('subtraction', 5.2, 2.85, 3, '5.20として考えよう')
];

/**
 * 実生活の例題
 */
export const realWorldExamples: RealWorldExample[] = [
  {
    id: 'shopping-1',
    title: 'お買い物の計算',
    description: '100円ショップでお買い物をしよう！消費税（10%）も計算してみよう。',
    scenario: 'shopping',
    problems: [
      createProblem(
        'addition', 
        1.1, 
        1.1, 
        2, 
        '100円の商品2つの税込み価格は？',
        '100円 × 1.1（税込み） × 2個'
      ),
      createProblem(
        'addition',
        1.1,
        2.2,
        2,
        '100円の商品1つと200円の商品1つの税込み合計は？',
        '110円 + 220円'
      ),
      createProblem(
        'subtraction',
        5.5,
        3.3,
        3,
        '550円持っていて、330円使ったら残りは？',
        'おつりの計算'
      )
    ]
  },
  {
    id: 'measurement-1',
    title: '長さの計算',
    description: 'リボンや紐の長さを測って計算しよう！',
    scenario: 'measurement',
    problems: [
      createProblem(
        'addition',
        1.5,
        0.8,
        2,
        '1.5mのリボンと0.8mのリボンを合わせると？',
        '単位はメートル（m）'
      ),
      createProblem(
        'subtraction',
        2.4,
        1.7,
        3,
        '2.4mの紐から1.7m切り取ったら残りは？',
        '工作で使う長さの計算'
      ),
      createProblem(
        'addition',
        0.45,
        0.65,
        3,
        '45cmと65cmを合わせると何m？',
        '1m = 100cm'
      )
    ]
  },
  {
    id: 'cooking-1',
    title: '料理の分量',
    description: '料理の材料を正確に量ろう！',
    scenario: 'cooking',
    problems: [
      createProblem(
        'addition',
        0.5,
        0.3,
        2,
        '0.5カップと0.3カップを合わせると？',
        '液体の計量'
      ),
      createProblem(
        'multiplication',
        0.25,
        4,
        3,
        '0.25リットルのジュースを4本買うと全部で何リットル？',
        '250ml × 4本'
      )
    ]
  }
];

/**
 * 難易度別に問題を取得
 */
export const getProblemsByDifficulty = (difficulty: number): DecimalProblem[] => {
  const allProblems = [
    ...conceptProblems,
    ...placeValueProblems,
    ...additionProblems,
    ...subtractionProblems
  ];
  
  return allProblems.filter(problem => problem.difficulty === difficulty);
};

/**
 * ランダムに問題を選択（同じ問題が連続しないように）
 */
let lastProblemId: string | null = null;

export const getRandomProblem = (
  type?: DecimalProblem['type'],
  difficulty?: number
): DecimalProblem => {
  let problems = [
    ...conceptProblems,
    ...placeValueProblems,
    ...additionProblems,
    ...subtractionProblems
  ];
  
  if (type) {
    problems = problems.filter(p => p.type === type);
  }
  
  if (difficulty) {
    problems = problems.filter(p => p.difficulty === difficulty);
  }
  
  // 前回と同じ問題を除外
  problems = problems.filter(p => p.id !== lastProblemId);
  
  const problem = problems[Math.floor(Math.random() * problems.length)];
  lastProblemId = problem.id;
  
  return problem;
};