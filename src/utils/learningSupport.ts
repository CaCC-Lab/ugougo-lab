// 学習支援ユーティリティ
// 認知科学的アプローチに基づく段階的学習支援機能

export interface LearningHint {
  level: 'beginner' | 'intermediate' | 'advanced';
  hint: string;
  example?: string;
  visualAid?: string;
}

export interface ConceptExplanation {
  concept: string;
  difficulty: number; // 1-5
  prerequisites: string[];
  explanations: {
    concrete: string; // 具体的な説明
    abstract: string; // 抽象的な説明
    visual: string; // 視覚的な説明
  };
  commonMistakes: string[];
  practiceProblems: {
    problem: string;
    answer: string;
    explanation: string;
  }[];
}

// 文字式の段階的説明
export const algebraicExpressionConcepts: ConceptExplanation[] = [
  {
    concept: '文字の導入',
    difficulty: 1,
    prerequisites: [],
    explanations: {
      concrete: '文字は「わからない数」や「いろいろな数」を表します。例えば、りんごがx個あるとき、xは1個かもしれないし、5個かもしれません。',
      abstract: '文字は変数として、任意の数値を代入可能な記号です。',
      visual: '□ + 3 = 5 の □ が文字 x になったイメージです。'
    },
    commonMistakes: [
      '文字を特定の数だと思い込む',
      '文字と数字を混同する'
    ],
    practiceProblems: [
      {
        problem: 'x + 3 で、x = 2 のとき',
        answer: '5',
        explanation: 'x に 2 を代入すると、2 + 3 = 5'
      }
    ]
  },
  {
    concept: '同類項',
    difficulty: 2,
    prerequisites: ['文字の導入'],
    explanations: {
      concrete: '同じ文字の項は、まとめることができます。りんご3個とりんご2個を合わせると、りんご5個になるのと同じです。',
      abstract: '同じ文字の累乗を持つ項は、係数を加減して整理できます。',
      visual: '3x + 2x = (3 + 2)x = 5x （りんごの例と同じ）'
    },
    commonMistakes: [
      '異なる文字の項をまとめてしまう（3x + 2y = 5xy は間違い）',
      '定数項と文字の項をまとめてしまう'
    ],
    practiceProblems: [
      {
        problem: '3x + 5x を簡単にせよ',
        answer: '8x',
        explanation: '同じ文字 x の項なので、係数 3 と 5 を足して 8x'
      }
    ]
  },
  {
    concept: '分配法則',
    difficulty: 3,
    prerequisites: ['文字の導入', '同類項'],
    explanations: {
      concrete: '2(x + 3) は「x + 3 を2セット」という意味。2セットのりんご(x個)とみかん(3個)があるイメージです。',
      abstract: 'a(b + c) = ab + ac という分配法則を適用します。',
      visual: '2(x + 3) = 2×x + 2×3 = 2x + 6'
    },
    commonMistakes: [
      '括弧内の一部だけに分配する（2(x + 3) = 2x + 3 は間違い）',
      '符号を間違える（-2(x - 3) = -2x - 6 は間違い）'
    ],
    practiceProblems: [
      {
        problem: '3(x + 4) を展開せよ',
        answer: '3x + 12',
        explanation: '3 を x と 4 の両方にかけて、3x + 12'
      }
    ]
  }
];

// 分数の段階的説明
export const fractionConcepts: ConceptExplanation[] = [
  {
    concept: '分数の意味',
    difficulty: 1,
    prerequisites: [],
    explanations: {
      concrete: '1個のピザを3等分したうちの2切れが 2/3 です。',
      abstract: '分数は部分と全体の関係を表す数です。',
      visual: '○○● → 3つのうち2つが○ → 2/3'
    },
    commonMistakes: [
      '分子と分母を逆にする',
      '分数を小数と混同する'
    ],
    practiceProblems: [
      {
        problem: '4個のりんごのうち3個を食べました。食べた分を分数で表すと？',
        answer: '3/4',
        explanation: '全体4個のうち3個なので、3/4'
      }
    ]
  }
];

// 化学反応の段階的説明
export const chemicalReactionConcepts: ConceptExplanation[] = [
  {
    concept: '原子と分子',
    difficulty: 2,
    prerequisites: [],
    explanations: {
      concrete: '原子はレゴブロックの1つ1つ、分子はそれらを組み合わせて作った作品のようなものです。',
      abstract: '原子は物質の最小単位、分子は原子が結合してできた粒子です。',
      visual: 'H + H → H₂ （水素原子2個が結合して水素分子）'
    },
    commonMistakes: [
      '原子と分子を同じものと考える',
      '化学式の数字の意味を誤解する'
    ],
    practiceProblems: [
      {
        problem: 'H₂O は何原子からできているか？',
        answer: '水素原子2個と酸素原子1個',
        explanation: 'H₂ は水素2個、O は酸素1個を表す'
      }
    ]
  }
];

// 学習困難度の評価
export function assessDifficulty(
  correctRate: number,
  timeSpent: number,
  hintsUsed: number
): 'easy' | 'medium' | 'hard' {
  const difficultyScore = 
    (1 - correctRate) * 0.5 + 
    (hintsUsed / 3) * 0.3 + 
    (timeSpent > 120 ? 0.2 : 0);
  
  if (difficultyScore < 0.3) return 'easy';
  if (difficultyScore < 0.6) return 'medium';
  return 'hard';
}

// 個別最適化された問題生成
export function generateAdaptiveProblem(
  concept: string,
  difficulty: 'easy' | 'medium' | 'hard'
): { problem: string; answer: string; hints: string[] } {
  // 概念と難易度に基づいて問題を生成
  const problems = {
    '文字式': {
      easy: {
        problem: 'x + 2 で x = 3 のとき',
        answer: '5',
        hints: ['x に 3 を代入します', '3 + 2 を計算します']
      },
      medium: {
        problem: '2x + 5 で x = 4 のとき',
        answer: '13',
        hints: ['まず 2 × 4 を計算', 'その結果に 5 を足す']
      },
      hard: {
        problem: '3(x + 2) - 2x で x = 5 のとき',
        answer: '11',
        hints: ['まず括弧を展開', '3x + 6 - 2x に整理', 'x + 6 に x = 5 を代入']
      }
    },
    '分数': {
      easy: {
        problem: '1/2 + 1/2',
        answer: '1',
        hints: ['同じ分母なので分子を足す', '2/2 = 1']
      },
      medium: {
        problem: '1/3 + 1/6',
        answer: '1/2',
        hints: ['通分が必要', '1/3 = 2/6', '2/6 + 1/6 = 3/6']
      },
      hard: {
        problem: '2/3 × 3/4',
        answer: '1/2',
        hints: ['分子同士、分母同士をかける', '6/12 を約分']
      }
    }
  };
  
  return problems[concept]?.[difficulty] || problems['文字式']['easy'];
}

// 視覚的説明の生成
export function generateVisualExplanation(
  concept: string,
  problem: string
): { type: 'animation' | 'diagram' | 'step-by-step'; data: any } {
  // 概念に応じた視覚的説明を生成
  if (concept.includes('分数')) {
    return {
      type: 'diagram',
      data: {
        shapes: ['circle', 'rectangle'],
        divisions: problem.includes('/') ? parseInt(problem.split('/')[1]) : 4,
        filled: problem.includes('/') ? parseInt(problem.split('/')[0]) : 1
      }
    };
  }
  
  if (concept.includes('文字式')) {
    return {
      type: 'step-by-step',
      data: {
        steps: [
          '文字を数値に置き換える',
          '計算を実行する',
          '答えを確認する'
        ]
      }
    };
  }
  
  return {
    type: 'animation',
    data: { duration: 3000 }
  };
}

// エラーパターンの分析
interface ErrorAnalysis {
  problem: string;
  userAnswer: string;
  correctAnswer: string;
}

export function analyzeErrorPattern(
  mistakes: ErrorAnalysis[]
): { pattern: string; suggestion: string }[] {
  const patterns: { pattern: string; suggestion: string }[] = [];
  
  // 符号ミスのチェック
  const signErrors = mistakes.filter(m => 
    Math.abs(parseFloat(m.userAnswer)) === Math.abs(parseFloat(m.correctAnswer)) &&
    m.userAnswer !== m.correctAnswer
  );
  if (signErrors.length > mistakes.length * 0.3) {
    patterns.push({
      pattern: '符号ミスが多い',
      suggestion: '正負の符号に注意して、特にマイナス×マイナスはプラスになることを確認しましょう'
    });
  }
  
  // 計算ミスのチェック
  const calculationErrors = mistakes.filter(m => {
    const diff = Math.abs(parseFloat(m.userAnswer) - parseFloat(m.correctAnswer));
    return diff > 0 && diff < 10;
  });
  if (calculationErrors.length > mistakes.length * 0.4) {
    patterns.push({
      pattern: '計算ミスが多い',
      suggestion: '一つ一つの計算を丁寧に行い、途中式を書くようにしましょう'
    });
  }
  
  return patterns;
}

// 励ましメッセージの生成
export function generateEncouragement(
  progress: number,
  recentSuccess: boolean,
  streakCount: number
): string {
  if (recentSuccess && streakCount >= 3) {
    return '素晴らしい！連続正解です！この調子で頑張りましょう！🎉';
  }
  
  if (progress > 80) {
    return 'もう少しでマスターです！あと一息！💪';
  }
  
  if (progress > 50) {
    return '半分以上できています！順調に進んでいますね！👍';
  }
  
  if (recentSuccess) {
    return '正解です！一歩ずつ確実に進んでいます！😊';
  }
  
  return '間違えても大丈夫！失敗から学ぶことが大切です。もう一度チャレンジ！🌟';
}