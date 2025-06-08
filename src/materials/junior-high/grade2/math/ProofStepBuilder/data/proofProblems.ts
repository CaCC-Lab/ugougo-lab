// 証明問題のデータ
import type { ProofProblem } from '../types';

export const proofProblems: ProofProblem[] = [
  // 初級問題
  {
    id: 'congruence-basic-1',
    title: '二等辺三角形の底角の証明',
    difficulty: 'beginner',
    category: 'congruence',
    given: [
      '△ABCにおいて、AB = AC'
    ],
    toProve: '∠B = ∠C',
    figure: {
      type: 'triangle',
      labels: ['A', 'B', 'C'],
      special: ['isosceles']
    },
    correctSteps: [
      '頂点Aから底辺BCに垂線ADを引く',
      '△ABDと△ACDにおいて',
      'AB = AC（仮定）',
      'AD = AD（共通）',
      '∠ADB = ∠ADC = 90°（垂線の定義）',
      '直角三角形の合同条件（斜辺と他の一辺）より、△ABD ≡ △ACD',
      '合同な三角形の対応する角は等しいので、∠B = ∠C'
    ],
    hints: [
      '二等辺三角形の性質を使うために、頂点から底辺に補助線を引いてみましょう',
      '垂線を引くと、どのような三角形ができるでしょうか？',
      '合同な三角形を見つけることができれば、対応する角が等しいことが示せます'
    ],
    commonMistakes: [
      '補助線を引かずに直接証明しようとする',
      '合同条件を正しく述べない',
      '対応する角を間違える'
    ]
  },
  {
    id: 'parallel-basic-1',
    title: '平行線と錯角',
    difficulty: 'beginner',
    category: 'parallel',
    given: [
      '直線l // 直線m',
      '直線nが直線lとmを横切る'
    ],
    toProve: '錯角が等しい（∠1 = ∠2）',
    figure: {
      type: 'parallel',
      labels: ['l', 'm', 'n', '1', '2'],
      special: ['parallel']
    },
    correctSteps: [
      '直線lと直線mは平行（仮定）',
      '直線nが平行線l, mを横切っている',
      '∠1と∠2は錯角の位置にある',
      '平行線の性質より、錯角は等しい',
      'したがって、∠1 = ∠2'
    ],
    hints: [
      '平行線の性質を思い出しましょう',
      '錯角、同位角、同側内角の関係を確認しましょう',
      '平行線の定理を直接適用できます'
    ],
    commonMistakes: [
      '錯角と同位角を混同する',
      '平行線の性質を正しく述べない',
      '角の位置関係を正確に示さない'
    ]
  },
  // 中級問題
  {
    id: 'congruence-intermediate-1',
    title: '三角形の合同証明（SAS）',
    difficulty: 'intermediate',
    category: 'congruence',
    given: [
      '△ABCと△DEFにおいて',
      'AB = DE',
      '∠A = ∠D',
      'AC = DF'
    ],
    toProve: '△ABC ≡ △DEF',
    figure: {
      type: 'triangle',
      labels: ['A', 'B', 'C', 'D', 'E', 'F'],
      special: []
    },
    correctSteps: [
      '△ABCと△DEFにおいて',
      'AB = DE（仮定）',
      '∠A = ∠D（仮定）',
      'AC = DF（仮定）',
      '二辺とその間の角がそれぞれ等しい（SAS合同条件）',
      'したがって、△ABC ≡ △DEF'
    ],
    hints: [
      '与えられた条件を整理してみましょう',
      'どの合同条件が使えるか考えてみましょう',
      'SAS（二辺とその間の角）の条件を確認しましょう'
    ],
    commonMistakes: [
      '合同条件を正確に述べない',
      '対応する頂点の順序を間違える',
      '「その間の角」であることを確認しない'
    ]
  },
  {
    id: 'parallel-intermediate-1',
    title: '平行四辺形の対角の証明',
    difficulty: 'intermediate',
    category: 'parallel',
    given: [
      '四角形ABCDは平行四辺形'
    ],
    toProve: '∠A = ∠C、∠B = ∠D',
    figure: {
      type: 'quadrilateral',
      labels: ['A', 'B', 'C', 'D'],
      special: ['parallelogram']
    },
    correctSteps: [
      '四角形ABCDは平行四辺形（仮定）',
      'AB // DC、AD // BC（平行四辺形の定義）',
      '対角線ACを引く',
      'AB // DCより、∠BAC = ∠DCA（錯角）',
      'AD // BCより、∠DAC = ∠BCA（錯角）',
      '∠A = ∠BAC + ∠DAC、∠C = ∠BCA + ∠DCA',
      'したがって、∠A = ∠C',
      '同様にして、∠B = ∠D'
    ],
    hints: [
      '平行四辺形の定義を思い出しましょう',
      '対角線を引いて、できる角を分析してみましょう',
      '平行線の性質（錯角）を使いましょう'
    ],
    commonMistakes: [
      '補助線（対角線）を引かない',
      '平行線の性質を正しく適用しない',
      '角の分解を正確に行わない'
    ]
  },
  // 上級問題
  {
    id: 'congruence-advanced-1',
    title: '円周角の定理を用いた証明',
    difficulty: 'advanced',
    category: 'circle',
    given: [
      '円Oの周上に点A, B, C, Dがある',
      '弦ACと弦BDが点Pで交わる'
    ],
    toProve: 'AP・PC = BP・PD',
    figure: {
      type: 'circle',
      labels: ['O', 'A', 'B', 'C', 'D', 'P'],
      special: ['circle']
    },
    correctSteps: [
      '△APBと△DPCにおいて',
      '∠PAB = ∠PDC（弧BCに対する円周角）',
      '∠PBA = ∠PCD（弧ADに対する円周角）',
      '二角が等しいので、△APB ∽ △DPC',
      '相似な三角形の対応する辺の比は等しいので',
      'AP : DP = BP : CP',
      'AP・PC = BP・PD'
    ],
    hints: [
      '円周角の定理を思い出しましょう',
      '同じ弧に対する円周角は等しいです',
      '相似な三角形を見つけることができますか？',
      '相似比から等式を導けます'
    ],
    commonMistakes: [
      '円周角の定理を正しく適用しない',
      '相似な三角形を見つけられない',
      '対応する辺の比を間違える'
    ]
  }
];