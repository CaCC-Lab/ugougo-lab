/**
 * テスト用の統合プロバイダー
 * Material-UIの無限ループ問題を解決するための最小限のプロバイダー構成
 */

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LearningTrackerContext } from '../components/wrappers/MaterialWrapper';

// テスト用の最小限のテーマ
const testTheme = createTheme({
  // デフォルト設定を最小限に抑える
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
  palette: {
    mode: 'light',
  },
  components: {
    // Material-UIコンポーネントの無限ループを防ぐための設定
    MuiCssBaseline: {
      styleOverrides: {
        // アニメーションを無効化
        '*': {
          animationDuration: '0s !important',
          animationDelay: '0s !important',
          transitionDuration: '0s !important',
          transitionDelay: '0s !important',
        },
      },
    },
    MuiFormControl: {
      defaultProps: {
        // FormControlの動的サイズ計算を無効化
        variant: 'standard',
      },
    },
    MuiInputBase: {
      defaultProps: {
        // InputBaseの動的レイアウト計算を無効化
        disableInjectingGlobalStyles: true,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // OutlinedInputのnotchサイズ計算を無効化
          '& .MuiOutlinedInput-notchedOutline': {
            borderWidth: '1px',
          },
        },
      },
    },
  },
});

// テスト用のLearningTrackerコンテキストの値
const testLearningTrackerValue = {
  recordInteraction: jest.fn(),
  recordAnswer: jest.fn(),
  recordHintUsed: jest.fn(),
  saveSession: jest.fn(),
  resetSession: jest.fn(),
  getSessionInfo: jest.fn().mockReturnValue({
    duration: 0,
    score: 0,
    totalInteractions: 0,
    hintsUsed: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
  }),
};

interface TestProvidersProps {
  children: React.ReactNode;
}

/**
 * テスト用の統合プロバイダーコンポーネント
 * Material-UIとLearningTrackerの最小限の設定を提供
 */
export const TestProviders: React.FC<TestProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider theme={testTheme}>
      <CssBaseline />
      <LearningTrackerContext.Provider value={testLearningTrackerValue}>
        {children}
      </LearningTrackerContext.Provider>
    </ThemeProvider>
  );
};

/**
 * より軽量なテスト用プロバイダー（CssBaselineなし）
 * 基本的なテストで無限ループが発生する場合に使用
 */
export const MinimalTestProviders: React.FC<TestProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider theme={testTheme}>
      <LearningTrackerContext.Provider value={testLearningTrackerValue}>
        {children}
      </LearningTrackerContext.Provider>
    </ThemeProvider>
  );
};

/**
 * React Testing Libraryのrender関数用のカスタムrender
 */
import { render, RenderOptions } from '@testing-library/react';

export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  useMinimal?: boolean;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { useMinimal = false, ...renderOptions } = options;
  const Wrapper = useMinimal ? MinimalTestProviders : TestProviders;
  
  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
};

// テスト用のユーティリティ関数をエクスポート
export { testTheme, testLearningTrackerValue };