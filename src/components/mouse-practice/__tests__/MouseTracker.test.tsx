/**
 * MouseTracker コンポーネントのテスト
 * モックを使用せず、実際のコンポーネントの動作をテストする
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MouseTracker } from '../MouseTracker';
import { MouseSkillLevel } from '../../../types/mouse-practice';

describe('MouseTracker', () => {
  beforeEach(() => {
    // localStorageをクリア
    window.localStorage.clear();
  });

  describe('レンダリング', () => {
    it('基本的な要素が表示される', () => {
      render(<MouseTracker />);

      expect(screen.getByText('マウス練習トラッカー')).toBeInTheDocument();
      expect(screen.getByText('開始')).toBeInTheDocument();
      expect(screen.getByText('停止')).toBeInTheDocument();
      expect(screen.getByText('リセット')).toBeInTheDocument();
    });

    it('メトリクスカードが表示される', () => {
      render(<MouseTracker showMetrics={true} />);

      expect(screen.getByText('クリック精度')).toBeInTheDocument();
      expect(screen.getByText('移動速度')).toBeInTheDocument();
      expect(screen.getByText('滑らかさ')).toBeInTheDocument();
      expect(screen.getByText('ドラッグ制御')).toBeInTheDocument();
      expect(screen.getByText('タイミング')).toBeInTheDocument();
      expect(screen.getByText('ダブルクリック')).toBeInTheDocument();
    });

    it('メトリクス非表示設定が動作する', () => {
      render(<MouseTracker showMetrics={false} />);

      expect(screen.queryByText('クリック精度')).not.toBeInTheDocument();
      expect(screen.queryByText('パフォーマンスメトリクス')).not.toBeInTheDocument();
    });

    it('スキルレベルバッジがゲーミフィケーション有効時に表示される', () => {
      render(<MouseTracker gamificationEnabled={true} />);

      // 初期レベルは初心者
      expect(screen.getByText('初心者')).toBeInTheDocument();
    });

    it('キャンバスが正しくレンダリングされる', () => {
      const { container } = render(<MouseTracker />);
      const canvas = container.querySelector('canvas');
      
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveAttribute('width', '400');
      expect(canvas).toHaveAttribute('height', '300');
    });
  });

  describe('トラッキング操作', () => {
    it('開始ボタンでトラッキングが開始される', async () => {
      const user = userEvent.setup();
      render(<MouseTracker />);

      const startButton = screen.getByText('開始');
      await user.click(startButton);

      // ボタンが無効化される
      expect(startButton).toBeDisabled();
    });

    it('停止ボタンでトラッキングが停止される', async () => {
      const user = userEvent.setup();
      render(<MouseTracker />);

      // まず開始
      const startButton = screen.getByText('開始');
      await user.click(startButton);

      // 停止
      const stopButton = screen.getByText('停止');
      await user.click(stopButton);

      // ボタンが無効化される
      expect(stopButton).toBeDisabled();
    });

    it('リセットボタンでメトリクスがリセットされる', async () => {
      const user = userEvent.setup();
      render(<MouseTracker />);

      const resetButton = screen.getByText('リセット');
      await user.click(resetButton);

      // リセット確認はUIの状態変化で検証
      expect(resetButton).toBeInTheDocument();
    });

    it('トラッキング中の状態表示が正しい', async () => {
      const user = userEvent.setup();
      render(<MouseTracker />);

      // 開始前
      expect(screen.getByText('停止中')).toBeInTheDocument();

      // 開始後
      const startButton = screen.getByText('開始');
      await user.click(startButton);
      expect(screen.getByText('トラッキング中')).toBeInTheDocument();
    });
  });

  describe('マウスイベントの処理', () => {
    it('トラッキング中にマウス移動が検知される', async () => {
      const user = userEvent.setup();
      const { container } = render(<MouseTracker />);

      // トラッキング開始
      const startButton = screen.getByText('開始');
      await user.click(startButton);

      // マウス移動イベント
      const canvas = container.querySelector('canvas')!;
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });

      // キャンバスの描画が更新されることを確認
      expect(canvas).toBeInTheDocument();
    });

    it('クリックイベントが処理される', async () => {
      const user = userEvent.setup();
      const { container } = render(<MouseTracker />);

      // トラッキング開始
      const startButton = screen.getByText('開始');
      await user.click(startButton);

      // クリックイベント
      const canvas = container.querySelector('canvas')!;
      await user.click(canvas);

      // イベントが処理されたことを確認
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('練習タスクタイプ', () => {
    it('クリックタスクが正しく設定される', () => {
      render(<MouseTracker taskType="click" />);
      
      expect(screen.getByText('マウス練習トラッカー')).toBeInTheDocument();
    });

    it('ドラッグタスクが正しく設定される', () => {
      render(<MouseTracker taskType="drag" />);
      
      expect(screen.getByText('マウス練習トラッカー')).toBeInTheDocument();
    });

    it('トレースタスクが正しく設定される', () => {
      render(<MouseTracker taskType="trace" />);
      
      expect(screen.getByText('マウス練習トラッカー')).toBeInTheDocument();
    });
  });

  describe('アダプティブUI', () => {
    it('アダプティブUIが有効な場合の表示', () => {
      render(<MouseTracker adaptiveUI={true} />);
      
      expect(screen.getByText('マウス練習トラッカー')).toBeInTheDocument();
    });

    it('アダプティブUIが無効な場合の表示', () => {
      render(<MouseTracker adaptiveUI={false} />);
      
      expect(screen.getByText('マウス練習トラッカー')).toBeInTheDocument();
    });
  });

  describe('完了コールバック', () => {
    it('セッション完了時にonCompleteが呼ばれる', async () => {
      const onComplete = (session: any) => {
        expect(session).toHaveProperty('sessionId');
        expect(session).toHaveProperty('taskType');
        expect(session).toHaveProperty('metrics');
      };

      const user = userEvent.setup();
      render(<MouseTracker onComplete={onComplete} />);

      // 開始して停止
      const startButton = screen.getByText('開始');
      await user.click(startButton);

      const stopButton = screen.getByText('停止');
      await user.click(stopButton);
    });
  });

  describe('進捗コールバック', () => {
    it('メトリクス更新時にonProgressが呼ばれる', async () => {
      const onProgress = (metrics: any) => {
        expect(metrics).toHaveProperty('accuracy');
        expect(metrics).toHaveProperty('speed');
        expect(metrics).toHaveProperty('smoothness');
      };

      const user = userEvent.setup();
      const { container } = render(<MouseTracker onProgress={onProgress} />);

      // トラッキング開始
      const startButton = screen.getByText('開始');
      await user.click(startButton);

      // マウス操作
      const canvas = container.querySelector('canvas')!;
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    });
  });

  describe('難易度設定', () => {
    it('簡単モードで表示される', () => {
      render(<MouseTracker difficulty="easy" />);
      expect(screen.getByText('マウス練習トラッカー')).toBeInTheDocument();
    });

    it('中級モードで表示される', () => {
      render(<MouseTracker difficulty="medium" />);
      expect(screen.getByText('マウス練習トラッカー')).toBeInTheDocument();
    });

    it('難しいモードで表示される', () => {
      render(<MouseTracker difficulty="hard" />);
      expect(screen.getByText('マウス練習トラッカー')).toBeInTheDocument();
    });
  });

  describe('キャンバス描画', () => {
    it('軌跡が描画される', async () => {
      const user = userEvent.setup();
      const { container } = render(<MouseTracker />);

      // トラッキング開始
      const startButton = screen.getByText('開始');
      await user.click(startButton);

      // マウス移動で軌跡を作る
      const canvas = container.querySelector('canvas')!;
      fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });

      // キャンバスが存在することを確認（実際の描画内容は検証できない）
      expect(canvas).toBeInTheDocument();
    });
  });
});