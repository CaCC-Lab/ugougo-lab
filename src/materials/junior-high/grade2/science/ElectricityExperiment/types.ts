// 電気回路実験の型定義

// 回路部品の種類
export type ComponentType = 'battery' | 'resistor' | 'ammeter' | 'voltmeter' | 'wire';

// 回路の接続タイプ
export type CircuitType = 'series' | 'parallel' | 'mixed';

// 座標情報
export interface Position {
  x: number;
  y: number;
}

// 回路部品
export interface CircuitComponent {
  id: string;
  type: ComponentType;
  position: Position;
  rotation: number;
  value?: number; // 電池の電圧、抵抗の値など
  connections: string[]; // 接続されている部品のID
}

// 接続線
export interface Wire {
  id: string;
  from: string; // 部品ID
  to: string; // 部品ID
  fromPort: 'positive' | 'negative' | 'left' | 'right';
  toPort: 'positive' | 'negative' | 'left' | 'right';
}

// 回路全体
export interface Circuit {
  components: CircuitComponent[];
  wires: Wire[];
  type: CircuitType;
}

// 測定値
export interface Measurement {
  voltage: number; // 電圧 (V)
  current: number; // 電流 (A)
  resistance: number; // 抵抗 (Ω)
}

// 測定ポイント
export interface MeasurementPoint {
  id: string;
  componentId: string;
  measurement: Measurement;
  predicted?: Measurement; // 予測値（仮想実験モード用）
}

// グラフデータポイント
export interface GraphDataPoint {
  x: number;
  y: number;
  label?: string;
}

// 実験データ
export interface ExperimentData {
  circuit: Circuit;
  measurements: MeasurementPoint[];
  graphData: {
    voltageCurrent: GraphDataPoint[];
    resistanceCurrent: GraphDataPoint[];
  };
  timestamp: Date;
}

// 学習進捗
export interface LearningProgress {
  circuitsCompleted: number;
  conceptsUnderstood: {
    ohmsLaw: boolean;
    seriesCircuit: boolean;
    parallelCircuit: boolean;
    voltageDistribution: boolean;
    currentDistribution: boolean;
  };
  experimentsPerformed: number;
  accuracy: number; // 予測精度
}

// 部品のプロパティ
export interface ComponentProperties {
  battery: {
    voltage: number; // 電圧 (V)
    internalResistance?: number; // 内部抵抗 (Ω)
  };
  resistor: {
    resistance: number; // 抵抗 (Ω)
    tolerance?: number; // 許容差 (%)
    powerRating?: number; // 定格電力 (W)
  };
  ammeter: {
    range: number; // 測定範囲 (A)
    internalResistance?: number; // 内部抵抗 (Ω)
  };
  voltmeter: {
    range: number; // 測定範囲 (V)
    internalResistance?: number; // 内部抵抗 (Ω)
  };
}

// 実験モード
export type ExperimentMode = 'build' | 'measure' | 'predict' | 'analyze';

// ヒント情報
export interface Hint {
  id: string;
  type: 'concept' | 'procedure' | 'calculation';
  content: string;
  condition?: () => boolean;
}

// エラー情報
export interface CircuitError {
  type: 'open_circuit' | 'short_circuit' | 'invalid_connection' | 'missing_component';
  message: string;
  componentIds?: string[];
}