import { useState, useCallback, useRef, useEffect } from 'react';
import {
  waveData,
  calculateDistance,
  calculateArrivalTime,
  calculatePSDuration,
  calculateDistanceFromPSDuration,
  calculateWaveAmplitude
} from '../data/earthquakeData';
import type { Epicenter, ObservationPoint } from '../data/earthquakeData';

interface SimulationState {
  isRunning: boolean;
  currentTime: number; // 秒
  epicenter: Epicenter;
  observationPoints: ObservationPoint[];
  selectedPointId: string | null;
  waveRadius: {
    P: number;
    S: number;
  };
  seismographData: {
    [pointId: string]: {
      time: number[];
      amplitude: number[];
    };
  };
}

export const useEarthquakeSimulation = () => {
  const [state, setState] = useState<SimulationState>({
    isRunning: false,
    currentTime: 0,
    epicenter: {
      x: 100,
      y: 250,
      depth: 10,
      magnitude: 5.0,
      time: new Date()
    },
    observationPoints: [
      { id: 'point1', name: '観測点A', x: 300, y: 250 },
      { id: 'point2', name: '観測点B', x: 500, y: 150 },
      { id: 'point3', name: '観測点C', x: 450, y: 350 }
    ],
    selectedPointId: 'point1',
    waveRadius: {
      P: 0,
      S: 0
    },
    seismographData: {}
  });

  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  // 観測点の距離と到達時間を計算
  const updateObservationPoints = useCallback(() => {
    setState(prev => {
      const updatedPoints = prev.observationPoints.map(point => {
        const distance = calculateDistance(
          prev.epicenter.x,
          prev.epicenter.y,
          point.x,
          point.y,
          prev.epicenter.depth
        );
        
        const pArrivalTime = calculateArrivalTime(distance, waveData.P.speed);
        const sArrivalTime = calculateArrivalTime(distance, waveData.S.speed);
        
        return {
          ...point,
          distance,
          pArrivalTime,
          sArrivalTime
        };
      });

      return {
        ...prev,
        observationPoints: updatedPoints
      };
    });
  }, []);

  // 震源を設定
  const setEpicenter = useCallback((x: number, y: number, depth?: number) => {
    setState(prev => ({
      ...prev,
      epicenter: {
        ...prev.epicenter,
        x,
        y,
        depth: depth || prev.epicenter.depth
      }
    }));
    updateObservationPoints();
  }, [updateObservationPoints]);

  // 観測点を追加
  const addObservationPoint = useCallback((x: number, y: number) => {
    const newPoint: ObservationPoint = {
      id: `point${Date.now()}`,
      name: `観測点${String.fromCharCode(65 + state.observationPoints.length)}`,
      x,
      y
    };

    setState(prev => ({
      ...prev,
      observationPoints: [...prev.observationPoints, newPoint]
    }));
    updateObservationPoints();
  }, [state.observationPoints.length, updateObservationPoints]);

  // 観測点を選択
  const selectObservationPoint = useCallback((pointId: string) => {
    setState(prev => ({
      ...prev,
      selectedPointId: pointId
    }));
  }, []);

  // アニメーションループ
  const animate = useCallback(() => {
    const currentTime = (Date.now() - startTimeRef.current) / 1000; // 秒に変換
    
    setState(prev => {
      // 波の半径を更新
      const pRadius = waveData.P.speed * currentTime * 100; // kmをピクセルに変換
      const sRadius = waveData.S.speed * currentTime * 100;
      
      // 地震計データを更新
      const newSeismographData = { ...prev.seismographData };
      
      prev.observationPoints.forEach(point => {
        if (!newSeismographData[point.id]) {
          newSeismographData[point.id] = {
            time: [],
            amplitude: []
          };
        }
        
        const data = newSeismographData[point.id];
        data.time.push(currentTime);
        
        // P波とS波の振幅を計算
        const pAmplitude = calculateWaveAmplitude(
          currentTime,
          point.pArrivalTime || 0,
          'P',
          1.0
        );
        const sAmplitude = calculateWaveAmplitude(
          currentTime,
          point.sArrivalTime || 0,
          'S',
          1.0
        );
        
        data.amplitude.push(pAmplitude + sAmplitude);
        
        // データが多くなりすぎたら古いものを削除
        if (data.time.length > 300) {
          data.time.shift();
          data.amplitude.shift();
        }
      });
      
      return {
        ...prev,
        currentTime,
        waveRadius: { P: pRadius, S: sRadius },
        seismographData: newSeismographData
      };
    });
    
    if (state.isRunning) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [state.isRunning]);

  // シミュレーションを開始
  const startSimulation = useCallback(() => {
    startTimeRef.current = Date.now();
    setState(prev => ({
      ...prev,
      isRunning: true,
      currentTime: 0,
      waveRadius: { P: 0, S: 0 },
      seismographData: {}
    }));
    updateObservationPoints();
  }, [updateObservationPoints]);

  // シミュレーションを停止
  const stopSimulation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false
    }));
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // リセット
  const resetSimulation = useCallback(() => {
    stopSimulation();
    setState(prev => ({
      ...prev,
      currentTime: 0,
      waveRadius: { P: 0, S: 0 },
      seismographData: {}
    }));
  }, [stopSimulation]);

  // 初期微動継続時間から震源距離を計算
  const calculateDistanceFromPS = useCallback((pointId: string): number | null => {
    const point = state.observationPoints.find(p => p.id === pointId);
    if (!point || !point.pArrivalTime || !point.sArrivalTime) return null;
    
    const psDuration = point.sArrivalTime - point.pArrivalTime;
    return calculateDistanceFromPSDuration(psDuration);
  }, [state.observationPoints]);

  // 初期設定
  useEffect(() => {
    updateObservationPoints();
  }, [updateObservationPoints]);

  // アニメーション管理
  useEffect(() => {
    if (state.isRunning) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isRunning, animate]);

  return {
    state,
    setEpicenter,
    addObservationPoint,
    selectObservationPoint,
    startSimulation,
    stopSimulation,
    resetSimulation,
    calculateDistanceFromPS
  };
};