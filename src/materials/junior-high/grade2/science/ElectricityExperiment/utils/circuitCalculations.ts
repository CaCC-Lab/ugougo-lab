import type { Circuit, Measurement, CircuitError } from '../types';

// オームの法則による計算
export const calculateOhmsLaw = (
  voltage?: number,
  current?: number,
  resistance?: number
): Partial<Measurement> => {
  const result: Partial<Measurement> = {};
  
  // V = I × R の関係から、2つの値から残りの1つを計算
  if (voltage !== undefined && current !== undefined && current !== 0) {
    result.resistance = voltage / current;
  }
  if (voltage !== undefined && resistance !== undefined && resistance !== 0) {
    result.current = voltage / resistance;
  }
  if (current !== undefined && resistance !== undefined) {
    result.voltage = current * resistance;
  }
  
  return result;
};

// 直列抵抗の合成
export const calculateSeriesResistance = (resistances: number[]): number => {
  return resistances.reduce((sum, r) => sum + r, 0);
};

// 並列抵抗の合成
export const calculateParallelResistance = (resistances: number[]): number => {
  if (resistances.length === 0) return 0;
  
  const reciprocalSum = resistances.reduce((sum, r) => {
    if (r === 0) return sum; // 0Ωの抵抗は無視（ショート）
    return sum + 1 / r;
  }, 0);
  
  return reciprocalSum === 0 ? 0 : 1 / reciprocalSum;
};

// 回路の検証
export const validateCircuit = (circuit: Circuit): CircuitError | null => {
  const { components, wires } = circuit;
  
  // 電源の確認
  const batteries = components.filter(c => c.type === 'battery');
  if (batteries.length === 0) {
    return {
      type: 'missing_component',
      message: '回路に電源（電池）がありません'
    };
  }
  
  // 接続の確認（簡易的なチェック）
  const connectionCount = new Map<string, number>();
  wires.forEach(wire => {
    connectionCount.set(wire.from, (connectionCount.get(wire.from) || 0) + 1);
    connectionCount.set(wire.to, (connectionCount.get(wire.to) || 0) + 1);
  });
  
  // すべての部品が接続されているか確認
  const unconnectedComponents = components.filter(c => 
    c.type !== 'wire' && !connectionCount.has(c.id)
  );
  
  if (unconnectedComponents.length > 0) {
    return {
      type: 'open_circuit',
      message: '接続されていない部品があります',
      componentIds: unconnectedComponents.map(c => c.id)
    };
  }
  
  // ショート回路の検出（電池の両端が直接接続）
  // TODO: ショート回路検出の実装
  // batteries.map(b => {
  //   const connections = wires.filter(w => w.from === b.id || w.to === b.id);
  //   return connections;
  // });
  
  // より詳細な検証はここに追加
  
  return null;
};

// 回路タイプの判定
export const determineCircuitType = (circuit: Circuit): 'series' | 'parallel' | 'mixed' | 'unknown' => {
  const { components, wires } = circuit;
  const resistors = components.filter(c => c.type === 'resistor');
  
  if (resistors.length < 2) return 'unknown';
  
  // 接続パターンの分析
  const connectionMap = new Map<string, Set<string>>();
  wires.forEach(wire => {
    if (!connectionMap.has(wire.from)) connectionMap.set(wire.from, new Set());
    if (!connectionMap.has(wire.to)) connectionMap.set(wire.to, new Set());
    connectionMap.get(wire.from)!.add(wire.to);
    connectionMap.get(wire.to)!.add(wire.from);
  });
  
  // 直列判定：各抵抗が2つ以下の接続を持つ
  const isSeriesCandidate = resistors.every(r => {
    const connections = connectionMap.get(r.id);
    return connections && connections.size <= 2;
  });
  
  if (isSeriesCandidate) {
    // パスを辿って直列であることを確認
    return 'series';
  }
  
  // 並列判定：抵抗の両端が共通の接続点を持つ
  // この実装は簡略化されています
  return 'parallel';
};

// 回路全体の計算
export interface CircuitAnalysis {
  totalResistance: number;
  totalCurrent: number;
  totalVoltage: number;
  componentMeasurements: Map<string, Measurement>;
}

export const analyzeCircuit = (circuit: Circuit): CircuitAnalysis | null => {
  const error = validateCircuit(circuit);
  if (error) return null;
  
  const { components } = circuit;
  const batteries = components.filter(c => c.type === 'battery');
  const resistors = components.filter(c => c.type === 'resistor');
  
  // 電源の合計電圧（簡略化：直列接続と仮定）
  const totalVoltage = batteries.reduce((sum, b) => sum + (b.value || 0), 0);
  
  // 回路タイプに応じた抵抗計算
  const circuitType = determineCircuitType(circuit);
  let totalResistance = 0;
  
  if (circuitType === 'series') {
    totalResistance = calculateSeriesResistance(resistors.map(r => r.value || 0));
  } else if (circuitType === 'parallel') {
    totalResistance = calculateParallelResistance(resistors.map(r => r.value || 0));
  } else {
    // 混合回路の場合は、より複雑な計算が必要
    // ここでは簡略化
    totalResistance = resistors.reduce((sum, r) => sum + (r.value || 0), 0) / 2;
  }
  
  // 全体の電流
  const totalCurrent = totalResistance > 0 ? totalVoltage / totalResistance : 0;
  
  // 各部品の測定値
  const componentMeasurements = new Map<string, Measurement>();
  
  // 直列回路の場合
  if (circuitType === 'series') {
    resistors.forEach(r => {
      const voltage = totalCurrent * (r.value || 0);
      componentMeasurements.set(r.id, {
        voltage,
        current: totalCurrent,
        resistance: r.value || 0
      });
    });
  }
  // 並列回路の場合
  else if (circuitType === 'parallel') {
    resistors.forEach(r => {
      const current = totalVoltage / (r.value || 1);
      componentMeasurements.set(r.id, {
        voltage: totalVoltage,
        current,
        resistance: r.value || 0
      });
    });
  }
  
  return {
    totalResistance,
    totalCurrent,
    totalVoltage,
    componentMeasurements
  };
};

// 測定値のフォーマット
export const formatMeasurement = (value: number, unit: string, precision: number = 2): string => {
  if (Math.abs(value) < 0.001) {
    return `0 ${unit}`;
  }
  
  // 適切な単位プレフィックスを選択
  const prefixes = [
    { factor: 1e-3, prefix: 'm' },
    { factor: 1, prefix: '' },
    { factor: 1e3, prefix: 'k' },
    { factor: 1e6, prefix: 'M' }
  ];
  
  let selectedPrefix = prefixes[1]; // デフォルトは基本単位
  
  for (const prefix of prefixes) {
    if (Math.abs(value) >= prefix.factor && Math.abs(value) < prefix.factor * 1000) {
      selectedPrefix = prefix;
      break;
    }
  }
  
  const scaledValue = value / selectedPrefix.factor;
  return `${scaledValue.toFixed(precision)} ${selectedPrefix.prefix}${unit}`;
};

// 電力計算
export const calculatePower = (voltage: number, current: number): number => {
  return voltage * current;
};

// グラフデータの生成
export const generateGraphData = (
  variable: 'voltage' | 'resistance',
  range: { min: number; max: number; step: number },
  fixedValue: number
): { voltageCurrent: Array<{ x: number; y: number }> } => {
  const data: Array<{ x: number; y: number }> = [];
  
  if (variable === 'voltage') {
    // 電圧を変化させた場合の電流変化
    for (let v = range.min; v <= range.max; v += range.step) {
      const current = v / fixedValue; // I = V / R
      data.push({ x: v, y: current });
    }
  } else {
    // 抵抗を変化させた場合の電流変化
    for (let r = range.min; r <= range.max; r += range.step) {
      const current = fixedValue / r; // I = V / R
      data.push({ x: r, y: current });
    }
  }
  
  return { voltageCurrent: data };
};