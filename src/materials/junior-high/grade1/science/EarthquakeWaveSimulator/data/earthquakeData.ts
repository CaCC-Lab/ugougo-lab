/**
 * 地震波シミュレーター用のデータ定義
 */

export interface EarthquakeWave {
  type: 'P' | 'S';
  speed: number; // km/s
  amplitude: number; // 振幅の相対値
  color: string;
  label: string;
  description: string;
}

export const waveData: Record<'P' | 'S', EarthquakeWave> = {
  P: {
    type: 'P',
    speed: 6.0, // 約6km/s
    amplitude: 0.3,
    color: '#2196F3',
    label: 'P波（初期微動）',
    description: '縦波・疎密波。岩盤を押し引きしながら伝わる。速度は速いが揺れは小さい。'
  },
  S: {
    type: 'S',
    speed: 3.5, // 約3.5km/s
    amplitude: 1.0,
    color: '#F44336',
    label: 'S波（主要動）',
    description: '横波・ねじれ波。岩盤を横に揺らしながら伝わる。速度は遅いが揺れは大きい。'
  }
};

export interface Epicenter {
  x: number;
  y: number;
  depth: number; // km
  magnitude: number;
  time: Date;
}

export interface ObservationPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  distance?: number; // 震源からの距離 (km)
  pArrivalTime?: number; // P波到達時間 (秒)
  sArrivalTime?: number; // S波到達時間 (秒)
}

// サンプル観測地点
export const sampleObservationPoints: ObservationPoint[] = [
  { id: 'point1', name: '観測点A', x: 200, y: 150 },
  { id: 'point2', name: '観測点B', x: 400, y: 200 },
  { id: 'point3', name: '観測点C', x: 300, y: 350 }
];

// 大森公式の定数
export const OMORI_CONSTANT = 7.42; // 初期微動継続時間から震源距離を求める定数

/**
 * 震源距離を計算
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number, depth: number = 0): number {
  const horizontalDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  // 画面上のピクセルを実際の距離(km)に変換（1px = 0.5km と仮定）
  const horizontalDistanceKm = horizontalDistance * 0.5;
  // 深さも考慮した実際の距離
  return Math.sqrt(Math.pow(horizontalDistanceKm, 2) + Math.pow(depth, 2));
}

/**
 * 到達時間を計算
 */
export function calculateArrivalTime(distance: number, waveSpeed: number): number {
  return distance / waveSpeed;
}

/**
 * 初期微動継続時間を計算
 */
export function calculatePSDuration(distance: number): number {
  // 初期微動継続時間 = 震源距離 / 大森定数
  return distance / OMORI_CONSTANT;
}

/**
 * 初期微動継続時間から震源距離を逆算
 */
export function calculateDistanceFromPSDuration(psDuration: number): number {
  return psDuration * OMORI_CONSTANT;
}

/**
 * 地震波の振幅を時間に応じて計算
 */
export function calculateWaveAmplitude(
  time: number,
  arrivalTime: number,
  waveType: 'P' | 'S',
  baseAmplitude: number
): number {
  if (time < arrivalTime) return 0;
  
  const elapsedTime = time - arrivalTime;
  const wave = waveData[waveType];
  
  // 減衰を考慮した振幅計算
  const decay = Math.exp(-elapsedTime * 0.1);
  const oscillation = Math.sin(elapsedTime * (waveType === 'P' ? 20 : 10));
  
  return baseAmplitude * wave.amplitude * decay * oscillation;
}

// 学習用の解説テキスト
export const explanations = {
  pWave: {
    title: 'P波（Primary wave）',
    content: [
      '最初に到達する地震波',
      '縦波（疎密波）として伝わる',
      '速度：約5〜8km/s',
      '揺れは小さいが速い振動'
    ]
  },
  sWave: {
    title: 'S波（Secondary wave）',
    content: [
      'P波の後に到達する地震波',
      '横波（ねじれ波）として伝わる',
      '速度：約3〜4km/s',
      '揺れは大きくゆっくりとした振動'
    ]
  },
  psDuration: {
    title: '初期微動継続時間',
    content: [
      'P波到達からS波到達までの時間',
      '震源が遠いほど長くなる',
      '大森公式：震源距離 = 7.42 × 初期微動継続時間',
      '地震の位置を特定する重要な手がかり'
    ]
  },
  calculation: {
    title: '震源距離の求め方',
    content: [
      '1. P波の到達時刻を記録',
      '2. S波の到達時刻を記録',
      '3. 初期微動継続時間 = S波到達時刻 - P波到達時刻',
      '4. 震源距離 = 7.42 × 初期微動継続時間'
    ]
  }
};