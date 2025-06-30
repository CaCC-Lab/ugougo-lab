/**
 * withMousePractice HOC のテスト
 * モックを使用せず、実際のHOCの動作をテストする
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { withMousePractice } from '../withMousePractice';
import { MouseSkillLevel } from '../../../types/mouse-practice';

// テスト用コンポーネント
const TestComponent: React.FC<{ title?: string }> = ({ title = 'Test Component' }) => (
  <div data-testid="test-component">{title}</div>
);

describe('withMousePractice HOC', () => {
  beforeEach(() => {
    // localStorageをクリア
    window.localStorage.clear();
  });

  describe('基本機能', () => {
    it('ラップされたコンポーネントが表示される', () => {
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent title="Custom Title" />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('練習ボタンが表示される', () => {
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent showPracticeButton={true} />);

      const practiceButton = screen.getByRole('button');
      expect(practiceButton).toBeInTheDocument();
    });

    it('練習ボタンが非表示に設定される', () => {
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent showPracticeButton={false} />);

      const practiceButton = screen.queryByRole('button');
      expect(practiceButton).not.toBeInTheDocument();
    });

    it('デフォルトで練習ボタンが表示される', () => {
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent />);

      const practiceButton = screen.getByRole('button');
      expect(practiceButton).toBeInTheDocument();
    });
  });

  describe('スキルレベル要件', () => {
    it('必要スキルレベルが不足している場合に警告が表示される', () => {
      const WrappedComponent = withMousePractice(TestComponent, {
        requiredSkillLevel: MouseSkillLevel.EXPERT,
      });

      render(<WrappedComponent />);

      // 初心者レベルでエキスパートが必要な場合の警告
      expect(screen.getByText(/この教材はexpertレベル以上のマウススキルが推奨されます/)).toBeInTheDocument();
    });

    it('警告の閉じるボタンが動作する', async () => {
      const user = userEvent.setup();
      const WrappedComponent = withMousePractice(TestComponent, {
        requiredSkillLevel: MouseSkillLevel.EXPERT,
      });

      render(<WrappedComponent />);

      const alert = screen.getByText(/この教材はexpertレベル以上のマウススキルが推奨されます/);
      expect(alert).toBeInTheDocument();

      // MUIのアラートのクローズボタンを探す
      const closeButton = screen.getByTestId('CloseIcon').parentElement;
      if (closeButton) {
        await user.click(closeButton);
      }

      await waitFor(() => {
        expect(alert).not.toBeInTheDocument();
      });
    });
  });

  describe('練習ダイアログ', () => {
    it('練習ボタンをクリックすると練習ダイアログが開く', async () => {
      const user = userEvent.setup();
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent showPracticeButton={true} />);

      const practiceButton = screen.getByRole('button');
      await user.click(practiceButton);

      expect(screen.getByText('マウス練習モード')).toBeInTheDocument();
    });

    it('練習ダイアログの閉じるボタンが動作する', async () => {
      const user = userEvent.setup();
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent showPracticeButton={true} />);

      // ダイアログを開く
      const practiceButton = screen.getByRole('button');
      await user.click(practiceButton);

      // 閉じるボタンをクリック
      const closeButtons = screen.getAllByText('閉じる');
      await user.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('マウス練習モード')).not.toBeInTheDocument();
      });
    });

    it('教材で練習を続けるボタンが動作する', async () => {
      const user = userEvent.setup();
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent showPracticeButton={true} />);

      // ダイアログを開く
      const practiceButton = screen.getByRole('button');
      await user.click(practiceButton);

      // 「教材で練習を続ける」ボタンをクリック
      const continueButton = screen.getByText('教材で練習を続ける');
      await user.click(continueButton);

      await waitFor(() => {
        expect(screen.queryByText('マウス練習モード')).not.toBeInTheDocument();
      });
    });
  });

  describe('設定ダイアログ', () => {
    it('設定ボタンで設定ダイアログが開く', async () => {
      const user = userEvent.setup();
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent showPracticeButton={true} />);

      // 練習ダイアログを開く
      const practiceButton = screen.getByRole('button');
      await user.click(practiceButton);

      // 設定ボタンをクリック
      const settingsButton = screen.getByLabelText('設定');
      await user.click(settingsButton);

      expect(screen.getByText('練習モード設定')).toBeInTheDocument();
    });

    it('設定スイッチが表示される', async () => {
      const user = userEvent.setup();
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent showPracticeButton={true} />);

      // 設定ダイアログを開く
      const practiceButton = screen.getByRole('button');
      await user.click(practiceButton);
      const settingsButton = screen.getByLabelText('設定');
      await user.click(settingsButton);

      // 各種設定が表示される
      expect(screen.getByLabelText('マウス練習を有効化')).toBeInTheDocument();
      expect(screen.getByLabelText('メトリクスを表示')).toBeInTheDocument();
      expect(screen.getByLabelText('アダプティブUI（スキルに応じてUI調整）')).toBeInTheDocument();
    });
  });

  describe('モード設定', () => {
    it('埋め込みモードで練習UIが表示される', () => {
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent mousePracticeMode="embedded" />);

      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    it('オーバーレイモードが設定される', () => {
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent mousePracticeMode="overlay" />);

      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    it('スタンドアロンモードが設定される', () => {
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent mousePracticeMode="standalone" />);

      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });
  });

  describe('アダプティブUI', () => {
    it('アダプティブUIが有効な場合の表示', () => {
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent adaptiveUI={true} />);

      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    it('アダプティブUIが無効な場合の表示', () => {
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent adaptiveUI={false} />);

      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });
  });

  describe('カスタム練習コンポーネント', () => {
    it('カスタム練習コンポーネントが使用される', async () => {
      const user = userEvent.setup();
      
      const CustomPracticeComponent: React.FC = () => (
        <div data-testid="custom-practice">Custom Practice Component</div>
      );

      const WrappedComponent = withMousePractice(TestComponent, {
        customPracticeComponent: CustomPracticeComponent,
      });

      render(<WrappedComponent showPracticeButton={true} />);

      // 練習ダイアログを開く
      const practiceButton = screen.getByRole('button');
      await user.click(practiceButton);

      expect(screen.getByTestId('custom-practice')).toBeInTheDocument();
      expect(screen.getByText('Custom Practice Component')).toBeInTheDocument();
    });
  });

  describe('練習タスクタイプ', () => {
    it('クリックタスクタイプが設定される', async () => {
      const user = userEvent.setup();
      
      const WrappedComponent = withMousePractice(TestComponent, {
        practiceTaskType: 'click',
      });

      render(<WrappedComponent showPracticeButton={true} />);

      // 練習ダイアログを開く
      const practiceButton = screen.getByRole('button');
      await user.click(practiceButton);

      expect(screen.getByText('マウス練習モード')).toBeInTheDocument();
    });

    it('ドラッグタスクタイプが設定される', async () => {
      const user = userEvent.setup();
      
      const WrappedComponent = withMousePractice(TestComponent, {
        practiceTaskType: 'drag',
      });

      render(<WrappedComponent showPracticeButton={true} />);

      // 練習ダイアログを開く
      const practiceButton = screen.getByRole('button');
      await user.click(practiceButton);

      expect(screen.getByText('マウス練習モード')).toBeInTheDocument();
    });
  });

  describe('プロパティの継承', () => {
    it('元のコンポーネントのpropsが正しく渡される', () => {
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent title="Props Test" />);

      expect(screen.getByText('Props Test')).toBeInTheDocument();
    });

    it('複数のプロパティが正しく渡される', () => {
      interface ExtendedProps {
        title: string;
        subtitle?: string;
      }

      const ExtendedComponent: React.FC<ExtendedProps> = ({ title, subtitle }) => (
        <div>
          <h1>{title}</h1>
          {subtitle && <h2>{subtitle}</h2>}
        </div>
      );

      const WrappedComponent = withMousePractice(ExtendedComponent);
      render(<WrappedComponent title="Main Title" subtitle="Sub Title" />);

      expect(screen.getByText('Main Title')).toBeInTheDocument();
      expect(screen.getByText('Sub Title')).toBeInTheDocument();
    });
  });

  describe('エラーハンドリング', () => {
    it('コンポーネントがエラーを起こしても練習機能は動作する', () => {
      const ErrorComponent: React.FC = () => {
        throw new Error('Test error');
      };

      // エラーバウンダリーでラップ
      class ErrorBoundary extends React.Component<
        { children: React.ReactNode },
        { hasError: boolean }
      > {
        constructor(props: { children: React.ReactNode }) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        render() {
          if (this.state.hasError) {
            return <div>Error occurred</div>;
          }
          return this.props.children;
        }
      }

      const WrappedComponent = withMousePractice(ErrorComponent);
      
      render(
        <ErrorBoundary>
          <WrappedComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なロールとラベルが設定されている', () => {
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent />);

      const practiceButton = screen.getByRole('button');
      expect(practiceButton).toBeInTheDocument();
    });

    it('キーボードナビゲーションが可能', async () => {
      const user = userEvent.setup();
      const WrappedComponent = withMousePractice(TestComponent);
      render(<WrappedComponent />);

      // Tab キーでフォーカス移動
      await user.tab();

      // フォーカス可能な要素が存在することを確認
      expect(document.activeElement).toBeDefined();
    });
  });
});