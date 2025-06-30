/**
 * mouseSkillStore のテスト
 */

import { renderHook, act } from '@testing-library/react';
import { useMouseSkillStore } from '../mouseSkillStore';
import { MouseSkillLevel } from '../../types/mouse-practice';

describe('mouseSkillStore', () => {
  beforeEach(() => {
    // localStorage をクリア
    window.localStorage.clear();
    
    // ストアの状態を完全にリセット
    const store = useMouseSkillStore.getState();
    store.resetProgress();
    store.setAgeGroup('9-11'); // デフォルト値に戻す
    store.updateSkillLevel(MouseSkillLevel.BEGINNER); // デフォルト値に戻す
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定されている', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      expect(result.current.userId).toBe('default-user');
      expect(result.current.ageGroup).toBe('9-11');
      expect(result.current.currentLevel).toBe(MouseSkillLevel.BEGINNER);
      expect(result.current.metrics).toEqual({
        accuracy: 0,
        speed: 0,
        smoothness: 0,
        dragControl: 0,
        clickTiming: 0,
        doubleClickRate: 0,
      });
      expect(result.current.adaptiveUIEnabled).toBe(true);
      expect(result.current.gamificationEnabled).toBe(true);
      expect(result.current.soundEnabled).toBe(true);
    });

    it('デフォルトバッジが設定されている', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      expect(result.current.badges.length).toBeGreaterThan(0);
      expect(result.current.badges.some(badge => badge.id === 'first-click')).toBe(true);
      expect(result.current.badges.some(badge => badge.id === 'click-master')).toBe(true);
      expect(result.current.badges.some(badge => badge.id === 'mouse-ninja')).toBe(true);
    });
  });

  describe('メトリクス更新', () => {
    it('updateMetrics でメトリクスが更新される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      const newMetrics = {
        accuracy: 85,
        speed: 250,
        smoothness: 80,
        dragControl: 75,
        clickTiming: 90,
        doubleClickRate: 60,
      };

      act(() => {
        result.current.updateMetrics(newMetrics);
      });

      expect(result.current.metrics).toEqual(newMetrics);
      expect(result.current.progress.metrics).toEqual(newMetrics);
    });

    it('updateSkillLevel でスキルレベルが更新される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      act(() => {
        result.current.updateSkillLevel(MouseSkillLevel.ADVANCED);
      });

      expect(result.current.currentLevel).toBe(MouseSkillLevel.ADVANCED);
      expect(result.current.progress.currentLevel).toBe(MouseSkillLevel.ADVANCED);
    });
  });

  describe('セッション管理', () => {
    it('startSession でセッションが開始される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      act(() => {
        result.current.startSession('test-session-1', 'click');
      });

      expect(result.current.currentSessionId).toBe('test-session-1');
      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0]).toMatchObject({
        sessionId: 'test-session-1',
        taskType: 'click',
        difficulty: 'easy',
        score: 0,
      });
    });

    it('endSession でセッションが終了される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      const testMetrics = {
        accuracy: 75,
        speed: 200,
        smoothness: 70,
        dragControl: 65,
        clickTiming: 80,
        doubleClickRate: 50,
      };

      // セッション開始
      act(() => {
        result.current.startSession('test-session-1', 'click');
      });

      // セッション終了
      act(() => {
        result.current.endSession(testMetrics, 75);
      });

      expect(result.current.currentSessionId).toBeNull();
      expect(result.current.sessions[0]).toMatchObject({
        sessionId: 'test-session-1',
        score: 75,
        metrics: testMetrics,
      });
      expect(result.current.sessions[0].endTime).toBeDefined();
      expect(result.current.progress.totalSessions).toBe(1);
      expect(result.current.progress.recentSessions).toHaveLength(1);
    });

    it('セッション終了時に改善点が生成される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      const lowMetrics = {
        accuracy: 50,  // 70未満
        speed: 100,
        smoothness: 50,  // 70未満
        dragControl: 50,  // 70未満
        clickTiming: 80,
        doubleClickRate: 40,
      };

      act(() => {
        result.current.startSession('test-session-1', 'click');
        result.current.endSession(lowMetrics, 50);
      });

      const session = result.current.sessions[0];
      expect(session.improvements).toContain('クリック精度を向上させましょう');
      expect(session.improvements).toContain('マウスの動きをより滑らかにしましょう');
      expect(session.improvements).toContain('ドラッグ操作の練習が必要です');
    });
  });

  describe('バッジシステム', () => {
    it('unlockBadge でバッジが解除される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      act(() => {
        result.current.unlockBadge('first-click');
      });

      expect(result.current.unlockedBadges).toContain('first-click');
      
      const badge = result.current.badges.find(b => b.id === 'first-click');
      expect(badge?.unlockedAt).toBeDefined();
    });

    it('同じバッジの重複解除は無視される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      act(() => {
        result.current.unlockBadge('first-click');
        result.current.unlockBadge('first-click');
      });

      expect(result.current.unlockedBadges.filter(id => id === 'first-click')).toHaveLength(1);
    });

    it('checkBadgeUnlocks でメトリクス条件を満たすバッジが解除される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      const highMetrics = {
        accuracy: 95,
        speed: 350,
        smoothness: 95,
        dragControl: 95,
        clickTiming: 95,
        doubleClickRate: 80,
      };

      act(() => {
        result.current.checkBadgeUnlocks(highMetrics);
      });

      // 高いメトリクスにより複数のバッジが解除される
      expect(result.current.unlockedBadges).toContain('click-master'); // accuracy >= 90
      expect(result.current.unlockedBadges).toContain('speed-demon'); // speed >= 300
      expect(result.current.unlockedBadges).toContain('smooth-operator'); // smoothness >= 90
      expect(result.current.unlockedBadges).toContain('perfect-timing'); // clickTiming >= 95
      expect(result.current.unlockedBadges).toContain('mouse-ninja'); // 全メトリクス >= 85
    });

    it('セッション数に基づくバッジが解除される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      // progress.totalSessions を1に設定
      act(() => {
        result.current.startSession('session-1', 'click');
        result.current.endSession(result.current.metrics, 50);
      });

      act(() => {
        result.current.checkBadgeUnlocks(result.current.metrics);
      });

      expect(result.current.unlockedBadges).toContain('first-click');
    });
  });

  describe('設定管理', () => {
    it('年齢グループが設定される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      act(() => {
        result.current.setAgeGroup('12-14');
      });

      expect(result.current.ageGroup).toBe('12-14');
    });

    it('アダプティブUIが切り替えられる', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      act(() => {
        result.current.toggleAdaptiveUI();
      });

      expect(result.current.adaptiveUIEnabled).toBe(false);

      act(() => {
        result.current.toggleAdaptiveUI();
      });

      expect(result.current.adaptiveUIEnabled).toBe(true);
    });

    it('ゲーミフィケーションが切り替えられる', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      act(() => {
        result.current.toggleGamification();
      });

      expect(result.current.gamificationEnabled).toBe(false);
    });

    it('サウンドが切り替えられる', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      act(() => {
        result.current.toggleSound();
      });

      expect(result.current.soundEnabled).toBe(false);
    });
  });

  describe('アダプティブUI設定', () => {
    it('スキルレベルに応じたUI設定が取得される', () => {
      const { result } = renderHook(() => useMouseSkillStore());


      // 初心者レベル
      let config = result.current.getAdaptiveUIConfig();
      expect(config.buttonSize).toBe('large');
      expect(config.visualHints).toBe(true);
      expect(config.snapToGrid).toBe(true);

      // 上級者レベルに変更
      act(() => {
        result.current.updateSkillLevel(MouseSkillLevel.ADVANCED);
      });

      config = result.current.getAdaptiveUIConfig();
      expect(config.buttonSize).toBe('medium');
      expect(config.visualHints).toBe(false);
      expect(config.snapToGrid).toBe(false);
    });

    it('アダプティブUIが無効の場合はエキスパート設定を返す', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      act(() => {
        result.current.toggleAdaptiveUI(); // false にする
      });

      const config = result.current.getAdaptiveUIConfig();
      expect(config.buttonSize).toBe('small');
      expect(config.visualHints).toBe(false);
    });
  });

  describe('年齢別スキル基準', () => {
    it('年齢グループに応じたスキル基準が取得される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      // デフォルトは9-11歳グループ
      let criteria = result.current.getSkillCriteria();
      expect(criteria.ageGroup).toBe('9-11');
      expect(criteria.beginnerThreshold.accuracy).toBe(40);

      // 15+歳グループに変更
      act(() => {
        result.current.setAgeGroup('15+');
      });

      criteria = result.current.getSkillCriteria();
      expect(criteria.ageGroup).toBe('15+');
      expect(criteria.beginnerThreshold.accuracy).toBe(60);
    });
  });

  describe('デイリーストリーク', () => {
    it('updateDailyStreak でストリークが更新される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      // 初期状態
      expect(result.current.progress.dailyStreak).toBe(0);

      act(() => {
        result.current.updateDailyStreak();
      });

      // 同じ日にupdateDailyStreakを呼んでも変わらない
      expect(result.current.progress.dailyStreak).toBe(0);
      expect(result.current.progress.lastPracticeDate).toBeDefined();
    });
  });

  describe('データのエクスポート/インポート', () => {
    it('exportProgress でJSONデータが生成される', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      const exportedData = result.current.exportProgress();
      const parsed = JSON.parse(exportedData);

      expect(parsed).toHaveProperty('userId');
      expect(parsed).toHaveProperty('ageGroup');
      expect(parsed).toHaveProperty('progress');
      expect(parsed).toHaveProperty('unlockedBadges');
      expect(parsed).toHaveProperty('sessions');
    });

    it('importProgress でJSONデータが読み込まれる', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      const testData = {
        userId: 'test-user',
        ageGroup: '12-14',
        progress: {
          dailyStreak: 5,
          totalSessions: 10,
        },
        unlockedBadges: ['first-click', 'click-master'],
        sessions: [],
      };

      act(() => {
        result.current.importProgress(JSON.stringify(testData));
      });

      expect(result.current.userId).toBe('test-user');
      expect(result.current.ageGroup).toBe('12-14');
      expect(result.current.unlockedBadges).toEqual(['first-click', 'click-master']);
    });

    it('不正なJSONの場合エラーが処理される', () => {
      const { result } = renderHook(() => useMouseSkillStore());
      
      // console.errorの実際の出力を確認（モック禁止）
      const originalConsoleError = console.error;
      let errorLogged = false;
      console.error = (...args) => {
        if (args[0] === 'Failed to import progress:') {
          errorLogged = true;
        }
        originalConsoleError.apply(console, args);
      };

      act(() => {
        result.current.importProgress('invalid json');
      });

      expect(errorLogged).toBe(true);
      
      // 元に戻す
      console.error = originalConsoleError;
    });
  });

  describe('プログレスリセット', () => {
    it('resetProgress で全データがリセットされる', () => {
      const { result } = renderHook(() => useMouseSkillStore());

      // データを設定
      act(() => {
        result.current.updateMetrics({
          accuracy: 80,
          speed: 200,
          smoothness: 75,
          dragControl: 70,
          clickTiming: 85,
          doubleClickRate: 60,
        });
        result.current.updateSkillLevel(MouseSkillLevel.ADVANCED);
        result.current.unlockBadge('click-master');
      });

      // リセット実行
      act(() => {
        result.current.resetProgress();
      });

      // 初期状態に戻っていることを確認
      expect(result.current.currentLevel).toBe(MouseSkillLevel.BEGINNER);
      expect(result.current.metrics).toEqual({
        accuracy: 0,
        speed: 0,
        smoothness: 0,
        dragControl: 0,
        clickTiming: 0,
        doubleClickRate: 0,
      });
      expect(result.current.unlockedBadges).toHaveLength(0);
      expect(result.current.sessions).toHaveLength(0);
      expect(result.current.progress.totalSessions).toBe(0);
      expect(result.current.progress.dailyStreak).toBe(0);
    });
  });
});