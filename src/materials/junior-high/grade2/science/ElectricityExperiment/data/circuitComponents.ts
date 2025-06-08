import type { ComponentType } from '../types';

// 回路部品の定義
export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  symbol: string; // 回路記号
  defaultValue?: number;
  valueRange?: {
    min: number;
    max: number;
    step: number;
  };
  unit?: string;
  description: string;
  svgPath?: string; // SVGパスデータ（カスタム描画用）
}

export const componentDefinitions: Record<ComponentType, ComponentDefinition> = {
  battery: {
    type: 'battery',
    name: '電池',
    symbol: 'E',
    defaultValue: 3.0,
    valueRange: {
      min: 1.5,
      max: 12.0,
      step: 0.5
    },
    unit: 'V',
    description: '電圧を供給する電源',
    svgPath: 'M20,30 L20,10 M30,35 L30,5 M20,20 L10,20 M30,20 L40,20'
  },
  resistor: {
    type: 'resistor',
    name: '抵抗',
    symbol: 'R',
    defaultValue: 10,
    valueRange: {
      min: 1,
      max: 100,
      step: 1
    },
    unit: 'Ω',
    description: '電流の流れを制限する素子',
    svgPath: 'M10,20 L15,20 L17.5,15 L22.5,25 L27.5,15 L32.5,25 L37.5,15 L40,20 L45,20'
  },
  ammeter: {
    type: 'ammeter',
    name: '電流計',
    symbol: 'A',
    defaultValue: 0,
    valueRange: {
      min: 0,
      max: 10,
      step: 0.1
    },
    unit: 'A',
    description: '電流を測定する計器',
    svgPath: 'M10,20 L15,20 M35,20 L40,20 M25,10 A10,10 0 0,1 25,30 A10,10 0 0,1 25,10 M25,20 L25,15 M22,17 L25,15 L28,17'
  },
  voltmeter: {
    type: 'voltmeter',
    name: '電圧計',
    symbol: 'V',
    defaultValue: 0,
    valueRange: {
      min: 0,
      max: 20,
      step: 0.1
    },
    unit: 'V',
    description: '電圧を測定する計器',
    svgPath: 'M25,10 A10,10 0 0,1 25,30 A10,10 0 0,1 25,10 M20,15 L25,20 L30,15 M20,20 L20,35 M30,20 L30,35'
  },
  wire: {
    type: 'wire',
    name: '導線',
    symbol: '—',
    description: '部品を接続する導線',
    svgPath: 'M10,20 L40,20'
  }
};

// 初期配置用のテンプレート
export const circuitTemplates = {
  simple: {
    name: '基本回路',
    description: '電池1個、抵抗1個の最も基本的な回路',
    components: [
      { type: 'battery', position: { x: 100, y: 200 }, value: 3.0 },
      { type: 'resistor', position: { x: 300, y: 200 }, value: 10 },
      { type: 'ammeter', position: { x: 200, y: 100 }, value: 0 },
      { type: 'voltmeter', position: { x: 300, y: 300 }, value: 0 }
    ]
  },
  series: {
    name: '直列回路',
    description: '抵抗を直列に接続した回路',
    components: [
      { type: 'battery', position: { x: 100, y: 200 }, value: 6.0 },
      { type: 'resistor', position: { x: 250, y: 200 }, value: 10 },
      { type: 'resistor', position: { x: 400, y: 200 }, value: 20 },
      { type: 'ammeter', position: { x: 175, y: 200 }, value: 0 }
    ]
  },
  parallel: {
    name: '並列回路',
    description: '抵抗を並列に接続した回路',
    components: [
      { type: 'battery', position: { x: 100, y: 250 }, value: 6.0 },
      { type: 'resistor', position: { x: 300, y: 150 }, value: 10 },
      { type: 'resistor', position: { x: 300, y: 350 }, value: 20 },
      { type: 'ammeter', position: { x: 200, y: 250 }, value: 0 }
    ]
  }
};

// 学習のヒント
export const learningHints = {
  ohmsLaw: {
    title: 'オームの法則',
    content: '電圧(V) = 電流(I) × 抵抗(R)の関係を表す基本法則です。',
    formula: 'V = I × R',
    example: '3V = 0.3A × 10Ω'
  },
  seriesResistance: {
    title: '直列抵抗の合成',
    content: '直列接続では、抵抗値は足し算になります。',
    formula: 'R_total = R1 + R2 + R3 + ...',
    example: '30Ω = 10Ω + 20Ω'
  },
  parallelResistance: {
    title: '並列抵抗の合成',
    content: '並列接続では、抵抗の逆数の和が全体の抵抗の逆数になります。',
    formula: '1/R_total = 1/R1 + 1/R2 + ...',
    example: '1/6.67Ω = 1/10Ω + 1/20Ω'
  },
  kirchhoffVoltage: {
    title: 'キルヒホッフの電圧則',
    content: '閉回路の電圧の和は0になります。',
    formula: 'ΣV = 0',
    example: '電池の電圧 = 各抵抗での電圧降下の和'
  },
  kirchhoffCurrent: {
    title: 'キルヒホッフの電流則',
    content: '接続点に流入する電流の和は流出する電流の和に等しくなります。',
    formula: 'ΣI_in = ΣI_out',
    example: '分岐前の電流 = 分岐後の電流の和'
  }
};

// エラーメッセージ
export const errorMessages = {
  open_circuit: '回路が閉じていません。すべての部品を正しく接続してください。',
  short_circuit: 'ショート回路が検出されました。電池の両端が直接接続されています。',
  invalid_connection: '無効な接続です。接続ポイントを確認してください。',
  missing_component: '必要な部品が不足しています。',
  no_power_source: '電源（電池）が回路に含まれていません。',
  measurement_out_of_range: '測定値が計器の範囲を超えています。'
};

// 実験の段階的な課題
export const experimentChallenges = [
  {
    id: 'basic_ohm',
    title: '基本のオームの法則',
    description: '電池と抵抗を使って、電圧・電流・抵抗の関係を確認しよう',
    objective: '3Vの電池と10Ωの抵抗で回路を作り、電流を測定する',
    successCriteria: {
      expectedCurrent: 0.3,
      tolerance: 0.05
    }
  },
  {
    id: 'series_circuit',
    title: '直列回路の理解',
    description: '2つの抵抗を直列につないで、合成抵抗を理解しよう',
    objective: '10Ωと20Ωの抵抗を直列につなぎ、全体の抵抗値を確認する',
    successCriteria: {
      expectedResistance: 30,
      tolerance: 1
    }
  },
  {
    id: 'parallel_circuit',
    title: '並列回路の理解',
    description: '2つの抵抗を並列につないで、電流の分岐を観察しよう',
    objective: '10Ωと20Ωの抵抗を並列につなぎ、各抵抗に流れる電流を測定する',
    successCriteria: {
      currentRatio: 2, // 10Ω側の電流は20Ω側の2倍
      tolerance: 0.1
    }
  }
];