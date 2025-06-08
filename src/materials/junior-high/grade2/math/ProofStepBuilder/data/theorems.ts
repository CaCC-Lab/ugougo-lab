// 定理・定義のデータ
import type { Theorem } from '../types';

export const theorems: Theorem[] = [
  // 合同に関する定理
  {
    id: 'congruence-sss',
    name: '三辺相等（SSS）',
    content: '三辺がそれぞれ等しい二つの三角形は合同である',
    category: 'congruence',
    keywords: ['合同', '三辺', 'SSS']
  },
  {
    id: 'congruence-sas',
    name: '二辺夾角相等（SAS）',
    content: '二辺とその間の角がそれぞれ等しい二つの三角形は合同である',
    category: 'congruence',
    keywords: ['合同', '二辺', '夾角', 'SAS']
  },
  {
    id: 'congruence-asa',
    name: '二角夾辺相等（ASA）',
    content: '二角とその間の辺がそれぞれ等しい二つの三角形は合同である',
    category: 'congruence',
    keywords: ['合同', '二角', '夾辺', 'ASA']
  },
  {
    id: 'congruence-rhs',
    name: '直角三角形の合同条件（RHS）',
    content: '斜辺と他の一辺がそれぞれ等しい二つの直角三角形は合同である',
    category: 'congruence',
    keywords: ['合同', '直角三角形', '斜辺', 'RHS']
  },
  {
    id: 'congruence-property',
    name: '合同な図形の性質',
    content: '合同な図形の対応する辺の長さ、対応する角の大きさはそれぞれ等しい',
    category: 'congruence',
    keywords: ['合同', '対応', '性質']
  },
  
  // 平行線に関する定理
  {
    id: 'parallel-corresponding',
    name: '平行線と同位角',
    content: '二直線が平行ならば、同位角は等しい',
    category: 'parallel',
    keywords: ['平行', '同位角']
  },
  {
    id: 'parallel-alternate',
    name: '平行線と錯角',
    content: '二直線が平行ならば、錯角は等しい',
    category: 'parallel',
    keywords: ['平行', '錯角']
  },
  {
    id: 'parallel-cointerior',
    name: '平行線と同側内角',
    content: '二直線が平行ならば、同側内角の和は180°',
    category: 'parallel',
    keywords: ['平行', '同側内角', '180度']
  },
  {
    id: 'parallel-converse',
    name: '平行線の逆定理',
    content: '錯角（または同位角）が等しければ、二直線は平行である',
    category: 'parallel',
    keywords: ['平行', '逆定理']
  },
  
  // 角度に関する定理
  {
    id: 'angle-vertical',
    name: '対頂角',
    content: '対頂角は等しい',
    category: 'angle',
    keywords: ['対頂角', '等しい']
  },
  {
    id: 'angle-supplementary',
    name: '補角',
    content: '一直線上の隣り合う二つの角の和は180°',
    category: 'angle',
    keywords: ['補角', '180度', '直線']
  },
  {
    id: 'angle-triangle-sum',
    name: '三角形の内角の和',
    content: '三角形の内角の和は180°',
    category: 'angle',
    keywords: ['三角形', '内角', '180度']
  },
  {
    id: 'angle-exterior',
    name: '三角形の外角',
    content: '三角形の外角は、隣り合わない二つの内角の和に等しい',
    category: 'angle',
    keywords: ['外角', '三角形', '内角の和']
  },
  
  // 三角形に関する定理
  {
    id: 'triangle-isosceles',
    name: '二等辺三角形の性質',
    content: '二等辺三角形の底角は等しい',
    category: 'triangle',
    keywords: ['二等辺三角形', '底角']
  },
  {
    id: 'triangle-isosceles-converse',
    name: '二等辺三角形の逆定理',
    content: '二つの角が等しい三角形は二等辺三角形である',
    category: 'triangle',
    keywords: ['二等辺三角形', '逆定理']
  },
  {
    id: 'triangle-equilateral',
    name: '正三角形の性質',
    content: '正三角形のすべての辺は等しく、すべての角は60°',
    category: 'triangle',
    keywords: ['正三角形', '60度']
  },
  
  // 基本的な定義
  {
    id: 'basic-perpendicular',
    name: '垂線の定義',
    content: '垂線とは、ある直線に90°で交わる直線',
    category: 'basic',
    keywords: ['垂線', '90度', '垂直']
  },
  {
    id: 'basic-midpoint',
    name: '中点の定義',
    content: '線分の中点は、その線分を二等分する点',
    category: 'basic',
    keywords: ['中点', '二等分']
  },
  {
    id: 'basic-bisector',
    name: '角の二等分線',
    content: '角の二等分線は、その角を二等分する直線',
    category: 'basic',
    keywords: ['二等分線', '角']
  }
];