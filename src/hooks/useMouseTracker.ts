/**
 * マウストラッキングフック
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { MouseSkillLevel } from '../types/mouse-practice';
import type {
  MouseMetrics,
  MousePosition,
  MouseTrackingData,
  UseMouseTrackerReturn,
} from '../types/mouse-practice';

/**
 * デフォルトのメトリクス
 */
const defaultMetrics: MouseMetrics = {
  accuracy: 0,
  speed: 0,
  smoothness: 0,
  dragControl: 0,
  clickTiming: 0,
  doubleClickRate: 0,
};

/**
 * スキルレベル判定基準
 */
const skillLevelCriteria = {
  expert: { accuracy: 90, speed: 300, smoothness: 85, dragControl: 85 },
  advanced: { accuracy: 75, speed: 200, smoothness: 70, dragControl: 70 },
  intermediate: { accuracy: 60, speed: 150, smoothness: 55, dragControl: 55 },
  beginner: { accuracy: 0, speed: 0, smoothness: 0, dragControl: 0 },
};

/**
 * マウストラッキングフック
 */
export const useMouseTracker = (): UseMouseTrackerReturn => {
  const [isTracking, setIsTracking] = useState(false);
  const [metrics, setMetrics] = useState<MouseMetrics>(defaultMetrics);
  const [skillLevel, setSkillLevel] = useState<MouseSkillLevel>(MouseSkillLevel.BEGINNER);
  
  const trackingDataRef = useRef<MouseTrackingData>({
    positions: [],
    clicks: [],
    dragPaths: [],
    metrics: defaultMetrics,
    skillLevel: MouseSkillLevel.BEGINNER,
  });

  const lastPositionRef = useRef<MousePosition | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  const doubleClickCountRef = useRef<number>(0);
  const totalClicksRef = useRef<number>(0);
  const currentDragPathRef = useRef<MousePosition[]>([]);
  const isDraggingRef = useRef<boolean>(false);

  /**
   * 距離計算
   */
  const calculateDistance = (p1: MousePosition, p2: MousePosition): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  /**
   * 速度計算（px/秒）
   */
  const calculateSpeed = (p1: MousePosition, p2: MousePosition): number => {
    const distance = calculateDistance(p1, p2);
    const timeDiff = (p2.timestamp - p1.timestamp) / 1000; // 秒に変換
    return timeDiff > 0 ? distance / timeDiff : 0;
  };

  /**
   * 滑らかさ計算（角度の変化率）
   */
  const calculateSmoothness = (positions: MousePosition[]): number => {
    if (positions.length < 3) return 100;

    let totalAngleChange = 0;
    let validAngles = 0;

    for (let i = 1; i < positions.length - 1; i++) {
      const p1 = positions[i - 1];
      const p2 = positions[i];
      const p3 = positions[i + 1];

      // 3点間の角度計算
      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
      let angleDiff = Math.abs(angle2 - angle1);

      // 角度差を0-πの範囲に正規化
      if (angleDiff > Math.PI) {
        angleDiff = 2 * Math.PI - angleDiff;
      }

      totalAngleChange += angleDiff;
      validAngles++;
    }

    // 滑らかさスコア（角度変化が少ないほど高スコア）
    const avgAngleChange = validAngles > 0 ? totalAngleChange / validAngles : 0;
    const smoothnessScore = Math.max(0, 100 - (avgAngleChange * 180 / Math.PI));
    
    return Math.round(smoothnessScore);
  };

  /**
   * クリック精度計算
   */
  const calculateClickAccuracy = (clicks: MousePosition[], targets?: MousePosition[]): number => {
    if (!targets || clicks.length === 0 || targets.length === 0) {
      return 0;
    }

    let totalAccuracy = 0;
    const maxDistance = 50; // 最大許容距離（ピクセル）

    clicks.forEach((click, index) => {
      if (index < targets.length) {
        const distance = calculateDistance(click, targets[index]);
        const accuracy = Math.max(0, 100 - (distance / maxDistance * 100));
        totalAccuracy += accuracy;
      }
    });

    return Math.round(totalAccuracy / Math.min(clicks.length, targets.length));
  };

  /**
   * ドラッグコントロール計算
   */
  const calculateDragControl = (dragPaths: MousePosition[][]): number => {
    if (dragPaths.length === 0) return 0;

    let totalControl = 0;

    dragPaths.forEach(path => {
      if (path.length < 2) return;

      // パスの滑らかさを評価
      const smoothness = calculateSmoothness(path);
      
      // 速度の一貫性を評価
      let speedVariance = 0;
      const speeds: number[] = [];
      
      for (let i = 1; i < path.length; i++) {
        const speed = calculateSpeed(path[i - 1], path[i]);
        speeds.push(speed);
      }

      if (speeds.length > 0) {
        const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        speedVariance = speeds.reduce((sum, speed) => {
          return sum + Math.pow(speed - avgSpeed, 2);
        }, 0) / speeds.length;
        
        // 速度の一貫性スコア（分散が小さいほど高スコア）
        const consistencyScore = Math.max(0, 100 - Math.sqrt(speedVariance) / 10);
        
        totalControl += (smoothness + consistencyScore) / 2;
      }
    });

    return Math.round(totalControl / dragPaths.length);
  };

  /**
   * スキルレベル判定
   */
  const determineSkillLevel = (metrics: MouseMetrics): MouseSkillLevel => {
    const avgScore = (metrics.accuracy + metrics.smoothness + metrics.dragControl) / 3;

    if (avgScore >= skillLevelCriteria.expert.accuracy && 
        metrics.speed >= skillLevelCriteria.expert.speed) {
      return MouseSkillLevel.EXPERT;
    } else if (avgScore >= skillLevelCriteria.advanced.accuracy && 
               metrics.speed >= skillLevelCriteria.advanced.speed) {
      return MouseSkillLevel.ADVANCED;
    } else if (avgScore >= skillLevelCriteria.intermediate.accuracy && 
               metrics.speed >= skillLevelCriteria.intermediate.speed) {
      return MouseSkillLevel.INTERMEDIATE;
    }
    
    return MouseSkillLevel.BEGINNER;
  };

  /**
   * マウス移動ハンドラー
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isTracking) return;

    const currentPosition: MousePosition = {
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
    };

    trackingDataRef.current.positions.push(currentPosition);

    // ドラッグ中の場合はドラッグパスに追加
    if (isDraggingRef.current) {
      currentDragPathRef.current.push(currentPosition);
    }

    // 速度計算
    if (lastPositionRef.current) {
      const speed = calculateSpeed(lastPositionRef.current, currentPosition);
      // 速度の移動平均を更新
      setMetrics(prev => ({
        ...prev,
        speed: Math.round((prev.speed * 0.9 + speed * 0.1)), // 指数移動平均
      }));
    }

    lastPositionRef.current = currentPosition;
  }, [isTracking]);

  /**
   * マウスクリックハンドラー
   */
  const handleMouseClick = useCallback((e: MouseEvent) => {
    if (!isTracking) return;

    const clickPosition: MousePosition = {
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
    };

    trackingDataRef.current.clicks.push(clickPosition);
    totalClicksRef.current++;

    // ダブルクリック判定
    const timeSinceLastClick = clickPosition.timestamp - lastClickTimeRef.current;
    if (timeSinceLastClick < 500) { // 500ms以内
      doubleClickCountRef.current++;
    }

    lastClickTimeRef.current = clickPosition.timestamp;

    // クリックタイミングの評価（一定間隔でクリックできているか）
    if (trackingDataRef.current.clicks.length > 1) {
      const clickIntervals: number[] = [];
      for (let i = 1; i < trackingDataRef.current.clicks.length; i++) {
        const interval = trackingDataRef.current.clicks[i].timestamp - 
                        trackingDataRef.current.clicks[i - 1].timestamp;
        clickIntervals.push(interval);
      }

      // 間隔の一貫性を評価
      if (clickIntervals.length > 0) {
        const avgInterval = clickIntervals.reduce((a, b) => a + b, 0) / clickIntervals.length;
        const variance = clickIntervals.reduce((sum, interval) => {
          return sum + Math.pow(interval - avgInterval, 2);
        }, 0) / clickIntervals.length;
        
        const timingScore = Math.max(0, 100 - Math.sqrt(variance) / 50);
        setMetrics(prev => ({ ...prev, clickTiming: Math.round(timingScore) }));
      }
    }
  }, [isTracking]);

  /**
   * マウスダウンハンドラー
   */
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!isTracking) return;

    isDraggingRef.current = true;
    currentDragPathRef.current = [{
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
    }];
  }, [isTracking]);

  /**
   * マウスアップハンドラー
   */
  const handleMouseUp = useCallback(() => {
    if (!isTracking || !isDraggingRef.current) return;

    isDraggingRef.current = false;
    
    if (currentDragPathRef.current.length > 1) {
      trackingDataRef.current.dragPaths.push([...currentDragPathRef.current]);
      currentDragPathRef.current = [];
    }
  }, [isTracking]);

  /**
   * メトリクス更新
   */
  const updateMetrics = useCallback(() => {
    const { positions, clicks, dragPaths } = trackingDataRef.current;

    // 滑らかさ計算
    const smoothness = calculateSmoothness(positions);

    // ドラッグコントロール計算
    const dragControl = calculateDragControl(dragPaths);

    // ダブルクリック成功率
    const doubleClickRate = totalClicksRef.current > 0
      ? Math.round((doubleClickCountRef.current / totalClicksRef.current) * 100)
      : 0;

    const updatedMetrics: MouseMetrics = {
      ...metrics,
      smoothness,
      dragControl,
      doubleClickRate,
      accuracy: calculateClickAccuracy(clicks), // ターゲットがない場合は0
    };

    setMetrics(updatedMetrics);
    
    // スキルレベル更新
    const newSkillLevel = determineSkillLevel(updatedMetrics);
    setSkillLevel(newSkillLevel);

    // トラッキングデータにも反映
    trackingDataRef.current.metrics = updatedMetrics;
    trackingDataRef.current.skillLevel = newSkillLevel;
  }, [metrics]);

  /**
   * トラッキング開始
   */
  const startTracking = useCallback(() => {
    setIsTracking(true);
    
    // イベントリスナー登録
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseClick);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseClick, handleMouseDown, handleMouseUp]);

  /**
   * トラッキング停止
   */
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    
    // イベントリスナー解除
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('click', handleMouseClick);
    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);

    // 最終メトリクス計算
    updateMetrics();
  }, [handleMouseMove, handleMouseClick, handleMouseDown, handleMouseUp, updateMetrics]);

  /**
   * トラッキングリセット
   */
  const resetTracking = useCallback(() => {
    trackingDataRef.current = {
      positions: [],
      clicks: [],
      dragPaths: [],
      metrics: defaultMetrics,
      skillLevel: MouseSkillLevel.BEGINNER,
    };
    
    lastPositionRef.current = null;
    lastClickTimeRef.current = 0;
    doubleClickCountRef.current = 0;
    totalClicksRef.current = 0;
    currentDragPathRef.current = [];
    isDraggingRef.current = false;
    
    setMetrics(defaultMetrics);
    setSkillLevel(MouseSkillLevel.BEGINNER);
  }, []);

  /**
   * クリーンアップ
   */
  useEffect(() => {
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [isTracking, stopTracking]);

  return {
    startTracking,
    stopTracking,
    resetTracking,
    isTracking,
    metrics,
    skillLevel,
    trackingData: trackingDataRef.current,
    updateMetrics,
  };
};