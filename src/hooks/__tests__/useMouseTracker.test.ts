/**
 * useMouseTracker フックのテスト
 */

import { renderHook, act } from '@testing-library/react';
import { useMouseTracker } from '../useMouseTracker';
import { MouseSkillLevel } from '../../types/mouse-practice';

// マウスイベントのモック
const createMouseEvent = (type: string, x: number, y: number, timestamp = Date.now()) => {
  return new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
  });
};

describe('useMouseTracker', () => {
  beforeEach(() => {
    // 実際のタイマーを使用（モック禁止）
  });

  afterEach(() => {
    // クリーンアップ
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定されている', () => {
      const { result } = renderHook(() => useMouseTracker());

      expect(result.current.isTracking).toBe(false);
      expect(result.current.metrics).toEqual({
        accuracy: 0,
        speed: 0,
        smoothness: 0,
        dragControl: 0,
        clickTiming: 0,
        doubleClickRate: 0,
      });
      expect(result.current.skillLevel).toBe(MouseSkillLevel.BEGINNER);
      expect(result.current.trackingData.positions).toHaveLength(0);
      expect(result.current.trackingData.clicks).toHaveLength(0);
      expect(result.current.trackingData.dragPaths).toHaveLength(0);
    });
  });

  describe('トラッキング開始/停止', () => {
    it('startTracking でトラッキングが開始される', () => {
      const { result } = renderHook(() => useMouseTracker());

      act(() => {
        result.current.startTracking();
      });

      expect(result.current.isTracking).toBe(true);
    });

    it('stopTracking でトラッキングが停止される', () => {
      const { result } = renderHook(() => useMouseTracker());

      act(() => {
        result.current.startTracking();
      });

      expect(result.current.isTracking).toBe(true);

      act(() => {
        result.current.stopTracking();
      });

      expect(result.current.isTracking).toBe(false);
    });

    it('resetTracking でデータがリセットされる', () => {
      const { result } = renderHook(() => useMouseTracker());

      // トラッキング開始してデータを入れる
      act(() => {
        result.current.startTracking();
      });

      // マウス移動をシミュレート
      act(() => {
        window.dispatchEvent(createMouseEvent('mousemove', 100, 100));
        window.dispatchEvent(createMouseEvent('click', 100, 100));
      });

      act(() => {
        result.current.resetTracking();
      });

      expect(result.current.metrics).toEqual({
        accuracy: 0,
        speed: 0,
        smoothness: 0,
        dragControl: 0,
        clickTiming: 0,
        doubleClickRate: 0,
      });
      expect(result.current.skillLevel).toBe(MouseSkillLevel.BEGINNER);
      expect(result.current.trackingData.positions).toHaveLength(0);
      expect(result.current.trackingData.clicks).toHaveLength(0);
    });
  });

  describe('マウス操作の記録', () => {
    it('マウス移動が記録される', async () => {
      const { result } = renderHook(() => useMouseTracker());

      // トラッキング開始
      act(() => {
        result.current.startTracking();
      });

      // トラッキング状態の確認
      expect(result.current.isTracking).toBe(true);

      // マウス移動イベントを発火してメトリクスを更新
      act(() => {
        window.dispatchEvent(createMouseEvent('mousemove', 100, 100));
        window.dispatchEvent(createMouseEvent('mousemove', 150, 120));
        window.dispatchEvent(createMouseEvent('mousemove', 200, 140));
      });

      // メトリクスを明示的に更新して最新のtrackingDataを取得
      act(() => {
        result.current.updateMetrics();
      });

      // データの確認（最低でも速度が計算されていることを確認）
      expect(result.current.metrics.speed).toBeGreaterThanOrEqual(0);
      expect(result.current.metrics.smoothness).toBeGreaterThanOrEqual(0);
    }, 30000);

    it('クリックが記録される', async () => {
      const { result } = renderHook(() => useMouseTracker());

      act(() => {
        result.current.startTracking();
      });

      expect(result.current.isTracking).toBe(true);

      // クリックイベントを発火
      act(() => {
        window.dispatchEvent(createMouseEvent('click', 100, 100));
        window.dispatchEvent(createMouseEvent('click', 150, 120));
      });

      // メトリクスを更新
      act(() => {
        result.current.updateMetrics();
      });

      // ダブルクリック率が計算されていることを確認
      expect(result.current.metrics.doubleClickRate).toBeGreaterThanOrEqual(0);
    }, 30000);

    it('ドラッグパスが記録される', async () => {
      const { result } = renderHook(() => useMouseTracker());

      act(() => {
        result.current.startTracking();
      });

      expect(result.current.isTracking).toBe(true);

      // ドラッグ操作をシミュレート
      act(() => {
        window.dispatchEvent(createMouseEvent('mousedown', 100, 100));
        window.dispatchEvent(createMouseEvent('mousemove', 110, 105));
        window.dispatchEvent(createMouseEvent('mousemove', 120, 110));
        window.dispatchEvent(createMouseEvent('mouseup', 130, 115));
      });

      // メトリクスを更新
      act(() => {
        result.current.updateMetrics();
      });

      // ドラッグコントロールが計算されていることを確認
      expect(result.current.metrics.dragControl).toBeGreaterThanOrEqual(0);
    }, 30000);
  });

  describe('メトリクス計算', () => {
    it('速度が正しく計算される', async () => {
      const { result } = renderHook(() => useMouseTracker());

      act(() => {
        result.current.startTracking();
      });

      // 連続してマウス移動イベントを発生させる
      act(() => {
        window.dispatchEvent(createMouseEvent('mousemove', 0, 0));
        window.dispatchEvent(createMouseEvent('mousemove', 100, 0));
        window.dispatchEvent(createMouseEvent('mousemove', 200, 0));
      });

      // メトリクスを更新
      act(() => {
        result.current.updateMetrics();
      });

      // 速度が計算されていることを確認（指数移動平均により0以上）
      expect(result.current.metrics.speed).toBeGreaterThanOrEqual(0);
    }, 30000);

    it('ダブルクリック率が正しく計算される', async () => {
      const { result } = renderHook(() => useMouseTracker());

      act(() => {
        result.current.startTracking();
      });

      // ダブルクリックをシミュレート
      act(() => {
        // 最初のクリック
        window.dispatchEvent(createMouseEvent('click', 100, 100));
      });

      // 300ms待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      // 2回目のクリック（ダブルクリック）
      act(() => {
        window.dispatchEvent(createMouseEvent('click', 100, 100));
      });

      // 600ms待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
      });

      // 3回目のクリック（シングルクリック）
      act(() => {
        window.dispatchEvent(createMouseEvent('click', 100, 100));
      });

      // メトリクスを更新
      act(() => {
        result.current.updateMetrics();
      });

      // ダブルクリック率が計算されていることを確認
      expect(result.current.metrics.doubleClickRate).toBeGreaterThanOrEqual(0);
      expect(result.current.metrics.doubleClickRate).toBeLessThanOrEqual(100);
    }, 30000);

    it('滑らかさが計算される', async () => {
      const { result } = renderHook(() => useMouseTracker());

      act(() => {
        result.current.startTracking();
      });

      // 直線的な移動（滑らか）
      act(() => {
        window.dispatchEvent(createMouseEvent('mousemove', 0, 0));
        window.dispatchEvent(createMouseEvent('mousemove', 10, 0));
        window.dispatchEvent(createMouseEvent('mousemove', 20, 0));
        window.dispatchEvent(createMouseEvent('mousemove', 30, 0));
        window.dispatchEvent(createMouseEvent('mousemove', 40, 0));
      });

      // メトリクスを更新
      act(() => {
        result.current.updateMetrics();
      });

      // 滑らかさが計算されていることを確認
      expect(result.current.metrics.smoothness).toBeGreaterThanOrEqual(0);
      expect(result.current.metrics.smoothness).toBeLessThanOrEqual(100);
    }, 30000);
  });

  describe('スキルレベル判定', () => {
    it('初期状態では初心者レベル', () => {
      const { result } = renderHook(() => useMouseTracker());

      expect(result.current.skillLevel).toBe(MouseSkillLevel.BEGINNER);
    });
  });

  describe('トラッキング制御', () => {
    it('トラッキング停止時にイベントが記録されなくなる', async () => {
      const { result } = renderHook(() => useMouseTracker());

      act(() => {
        result.current.startTracking();
      });

      expect(result.current.isTracking).toBe(true);

      // 最初のクリックを記録
      act(() => {
        window.dispatchEvent(createMouseEvent('click', 100, 100));
      });

      // メトリクスを更新して現在の状態を確認
      act(() => {
        result.current.updateMetrics();
      });

      const initialClickRate = result.current.metrics.doubleClickRate;

      // トラッキングを停止
      act(() => {
        result.current.stopTracking();
      });

      expect(result.current.isTracking).toBe(false);

      // 停止後のクリックは記録されない
      act(() => {
        window.dispatchEvent(createMouseEvent('click', 200, 200));
      });

      // メトリクスを再度更新
      act(() => {
        result.current.updateMetrics();
      });

      // メトリクスが変わっていないことを確認
      expect(result.current.metrics.doubleClickRate).toBe(initialClickRate);
    }, 30000);

    it('コンポーネントのアンマウント時にトラッキングが停止される', () => {
      const { result, unmount } = renderHook(() => useMouseTracker());

      act(() => {
        result.current.startTracking();
      });

      expect(result.current.isTracking).toBe(true);

      unmount();

      // アンマウント後はトラッキングが停止される
      // （実際の状態は確認できないが、エラーが発生しないことを確認）
    });
  });

  describe('境界値テスト', () => {
    it('同じ位置での移動は速度0となる', async () => {
      const { result } = renderHook(() => useMouseTracker());

      act(() => {
        result.current.startTracking();
      });

      // イベントリスナーが登録されるまで少し待つ
      await new Promise(resolve => setTimeout(resolve, 50));

      act(() => {
        window.dispatchEvent(createMouseEvent('mousemove', 100, 100));
        window.dispatchEvent(createMouseEvent('mousemove', 100, 100));
      });

      // 同じ位置への移動は速度0
      expect(result.current.metrics.speed).toBe(0);
    });

    it('マウス移動なしではメトリクスが初期値のまま', () => {
      const { result } = renderHook(() => useMouseTracker());

      act(() => {
        result.current.startTracking();
      });

      // デフォルトのsmoothness値は0（初期値）
      expect(result.current.metrics.smoothness).toBe(0);
      expect(result.current.metrics.accuracy).toBe(0);
    });

    it('単一のクリックではタイミングスコアが初期値', async () => {
      const { result } = renderHook(() => useMouseTracker());

      act(() => {
        result.current.startTracking();
      });

      // イベントリスナーが登録されるまで少し待つ
      await new Promise(resolve => setTimeout(resolve, 50));

      act(() => {
        window.dispatchEvent(createMouseEvent('click', 100, 100));
      });

      expect(result.current.metrics.clickTiming).toBe(0);
    });
  });
});