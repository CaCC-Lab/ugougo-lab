import { useState, useCallback, useEffect } from 'react';
import type {
  Circuit,
  CircuitComponent,
  Wire,
  Measurement,
  MeasurementPoint,
  ExperimentMode,
  CircuitError
} from '../types';
import {
  validateCircuit,
  analyzeCircuit,
  calculateOhmsLaw,
  generateGraphData
} from '../utils/circuitCalculations';

interface UseCircuitSimulationReturn {
  // 状態
  circuit: Circuit;
  measurements: MeasurementPoint[];
  mode: ExperimentMode;
  selectedComponent: CircuitComponent | null;
  error: CircuitError | null;
  graphData: {
    voltageCurrent: Array<{ x: number; y: number }>;
    resistanceCurrent: Array<{ x: number; y: number }>;
  };
  
  // 回路編集
  addComponent: (type: CircuitComponent['type'], position: { x: number; y: number }) => void;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, position: { x: number; y: number }) => void;
  updateComponentValue: (id: string, value: number) => void;
  selectComponent: (component: CircuitComponent | null) => void;
  
  // 接続管理
  addWire: (from: string, to: string, fromPort: string, toPort: string) => void;
  removeWire: (id: string) => void;
  
  // モード切り替え
  setMode: (mode: ExperimentMode) => void;
  
  // シミュレーション
  runSimulation: () => void;
  resetCircuit: () => void;
  loadTemplate: (templateName: string) => void;
  
  // 予測モード
  setPrediction: (componentId: string, measurement: Measurement) => void;
  checkPredictions: () => { accuracy: number; feedback: string[] };
}

export const useCircuitSimulation = (): UseCircuitSimulationReturn => {
  // 基本状態
  const [circuit, setCircuit] = useState<Circuit>({
    components: [],
    wires: [],
    type: 'series'
  });
  
  const [measurements, setMeasurements] = useState<MeasurementPoint[]>([]);
  const [mode, setMode] = useState<ExperimentMode>('build');
  const [selectedComponent, setSelectedComponent] = useState<CircuitComponent | null>(null);
  const [error, setError] = useState<CircuitError | null>(null);
  const [graphData, setGraphData] = useState({
    voltageCurrent: [] as Array<{ x: number; y: number }>,
    resistanceCurrent: [] as Array<{ x: number; y: number }>
  });
  
  // 部品の追加
  const addComponent = useCallback((
    type: CircuitComponent['type'],
    position: { x: number; y: number }
  ) => {
    const newComponent: CircuitComponent = {
      id: `${type}_${Date.now()}`,
      type,
      position,
      rotation: 0,
      value: type === 'battery' ? 3.0 : type === 'resistor' ? 10 : 0,
      connections: []
    };
    
    setCircuit(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  }, []);
  
  // 部品の削除
  const removeComponent = useCallback((id: string) => {
    setCircuit(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== id),
      wires: prev.wires.filter(w => w.from !== id && w.to !== id)
    }));
    
    setMeasurements(prev => prev.filter(m => m.componentId !== id));
  }, []);
  
  // 部品の移動
  const moveComponent = useCallback((id: string, position: { x: number; y: number }) => {
    setCircuit(prev => ({
      ...prev,
      components: prev.components.map(c =>
        c.id === id ? { ...c, position } : c
      )
    }));
  }, []);
  
  // 部品の値更新
  const updateComponentValue = useCallback((id: string, value: number) => {
    setCircuit(prev => ({
      ...prev,
      components: prev.components.map(c =>
        c.id === id ? { ...c, value } : c
      )
    }));
    
    // 値が変更されたら自動的に再シミュレーション
    if (mode === 'measure') {
      setTimeout(() => runSimulation(), 100);
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // 部品の選択
  const selectComponent = useCallback((component: CircuitComponent | null) => {
    setSelectedComponent(component);
  }, []);
  
  // ワイヤーの追加
  const addWire = useCallback((
    from: string,
    to: string,
    fromPort: string,
    toPort: string
  ) => {
    const newWire: Wire = {
      id: `wire_${Date.now()}`,
      from,
      to,
      fromPort: fromPort as Wire['fromPort'],
      toPort: toPort as Wire['toPort']
    };
    
    setCircuit(prev => ({
      ...prev,
      wires: [...prev.wires, newWire]
    }));
    
    // 接続情報を更新
    setCircuit(prev => ({
      ...prev,
      components: prev.components.map(c => {
        if (c.id === from) {
          return { ...c, connections: [...c.connections, to] };
        }
        if (c.id === to) {
          return { ...c, connections: [...c.connections, from] };
        }
        return c;
      })
    }));
  }, []);
  
  // ワイヤーの削除
  const removeWire = useCallback((id: string) => {
    setCircuit(prev => {
      const wire = prev.wires.find(w => w.id === id);
      if (!wire) return prev;
      
      return {
        ...prev,
        wires: prev.wires.filter(w => w.id !== id),
        components: prev.components.map(c => {
          if (c.id === wire.from) {
            return { ...c, connections: c.connections.filter(conn => conn !== wire.to) };
          }
          if (c.id === wire.to) {
            return { ...c, connections: c.connections.filter(conn => conn !== wire.from) };
          }
          return c;
        })
      };
    });
  }, []);
  
  // シミュレーション実行
  const runSimulation = useCallback(() => {
    // 回路の検証
    const validationError = validateCircuit(circuit);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    
    // 回路解析
    const analysis = analyzeCircuit(circuit);
    if (!analysis) {
      setError({
        type: 'invalid_connection',
        message: '回路の解析に失敗しました'
      });
      return;
    }
    
    // 測定値の更新
    const newMeasurements: MeasurementPoint[] = [];
    
    circuit.components.forEach(component => {
      if (component.type === 'resistor' || component.type === 'ammeter' || component.type === 'voltmeter') {
        const measurement = analysis.componentMeasurements.get(component.id);
        if (measurement) {
          newMeasurements.push({
            id: `measurement_${component.id}`,
            componentId: component.id,
            measurement
          });
        }
      }
    });
    
    // 電池の測定値
    const batteries = circuit.components.filter(c => c.type === 'battery');
    batteries.forEach(battery => {
      newMeasurements.push({
        id: `measurement_${battery.id}`,
        componentId: battery.id,
        measurement: {
          voltage: battery.value || 0,
          current: analysis.totalCurrent,
          resistance: 0 // 電池の内部抵抗は0と仮定
        }
      });
    });
    
    setMeasurements(newMeasurements);
    
    // グラフデータの生成
    const voltageData = generateGraphData('voltage', { min: 0, max: 12, step: 0.5 }, analysis.totalResistance);
    const resistanceData = generateGraphData('resistance', { min: 1, max: 100, step: 5 }, analysis.totalVoltage);
    
    setGraphData({
      voltageCurrent: voltageData.voltageCurrent,
      resistanceCurrent: resistanceData.voltageCurrent
    });
  }, [circuit]);
  
  // 回路のリセット
  const resetCircuit = useCallback(() => {
    setCircuit({
      components: [],
      wires: [],
      type: 'series'
    });
    setMeasurements([]);
    setSelectedComponent(null);
    setError(null);
    setGraphData({
      voltageCurrent: [],
      resistanceCurrent: []
    });
  }, []);
  
  // テンプレートの読み込み
  const loadTemplate = useCallback((templateName: string) => {
    // テンプレートデータの読み込みロジック
    // ここでは簡略化
    resetCircuit();
    
    // テンプレートに応じた初期配置
    if (templateName === 'simple') {
      addComponent('battery', { x: 100, y: 200 });
      addComponent('resistor', { x: 300, y: 200 });
      addComponent('ammeter', { x: 200, y: 100 });
    } else if (templateName === 'series') {
      addComponent('battery', { x: 100, y: 200 });
      addComponent('resistor', { x: 250, y: 200 });
      addComponent('resistor', { x: 400, y: 200 });
    } else if (templateName === 'parallel') {
      addComponent('battery', { x: 100, y: 250 });
      addComponent('resistor', { x: 300, y: 150 });
      addComponent('resistor', { x: 300, y: 350 });
    }
  }, [resetCircuit, addComponent]);
  
  // 予測値の設定
  const setPrediction = useCallback((componentId: string, measurement: Measurement) => {
    setMeasurements(prev => {
      const existing = prev.find(m => m.componentId === componentId);
      if (existing) {
        return prev.map(m =>
          m.componentId === componentId
            ? { ...m, predicted: measurement }
            : m
        );
      } else {
        return [...prev, {
          id: `prediction_${componentId}`,
          componentId,
          measurement: { voltage: 0, current: 0, resistance: 0 },
          predicted: measurement
        }];
      }
    });
  }, []);
  
  // 予測の確認
  const checkPredictions = useCallback((): { accuracy: number; feedback: string[] } => {
    const feedback: string[] = [];
    let correctPredictions = 0;
    let totalPredictions = 0;
    
    measurements.forEach(m => {
      if (m.predicted) {
        totalPredictions++;
        const tolerance = 0.1; // 10%の誤差を許容
        
        const voltageAccurate = Math.abs(m.measurement.voltage - m.predicted.voltage) / m.measurement.voltage < tolerance;
        const currentAccurate = Math.abs(m.measurement.current - m.predicted.current) / m.measurement.current < tolerance;
        
        if (voltageAccurate && currentAccurate) {
          correctPredictions++;
          feedback.push(`✓ ${m.componentId}: 予測が正確です！`);
        } else {
          feedback.push(`✗ ${m.componentId}: 予測値を見直してみましょう`);
        }
      }
    });
    
    const accuracy = totalPredictions > 0 ? correctPredictions / totalPredictions : 0;
    
    return { accuracy, feedback };
  }, [measurements]);
  
  // モード変更時の自動実行
  useEffect(() => {
    if (mode === 'measure' && circuit.components.length > 0) {
      runSimulation();
    }
  }, [mode, circuit.components.length, runSimulation]);
  
  return {
    circuit,
    measurements,
    mode,
    selectedComponent,
    error,
    graphData,
    addComponent,
    removeComponent,
    moveComponent,
    updateComponentValue,
    selectComponent,
    addWire,
    removeWire,
    setMode,
    runSimulation,
    resetCircuit,
    loadTemplate,
    setPrediction,
    checkPredictions
  };
};