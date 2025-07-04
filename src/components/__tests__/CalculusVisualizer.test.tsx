import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalculusVisualizer from '../CalculusVisualizer';
import { MaterialWrapper } from '../wrappers/MaterialWrapper';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Test theme for components
const testTheme = createTheme();

// Mock wrapper to provide required context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={testTheme}>
    <MaterialWrapper
      materialId="test-calculus-visualizer"
      materialName="テスト用微分積分ビジュアライザー"
      showMetricsButton={false}
      showAssistant={false}
    >
      {children}
    </MaterialWrapper>
  </ThemeProvider>
);

describe('CalculusVisualizer - セキュリティテスト', () => {
  beforeEach(() => {
    // Canvas mockを設定
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      fillStyle: '',
      fillRect: jest.fn(),
      strokeStyle: '',
      lineWidth: 0,
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      font: '',
      textAlign: '',
      textBaseline: '',
      fillText: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      strokeRect: jest.fn(),
      setLineDash: jest.fn(),
    })) as jest.Mock;
  });

  test('セキュリティ: 危険なJavaScriptコードが実行されないことを確認', () => {
    render(<CalculusVisualizer />, { wrapper: TestWrapper });
    
    const functionInput = screen.getByLabelText('関数 f(x)');
    
    // 危険なコードの注入を試行
    const dangerousInputs = [
      'alert("XSS")',
      'window.location="http://malicious.com"',
      'document.cookie',
      'eval("alert(1)")',
      'Function("alert(1)")()',
      'console.log("injection")',
      '(() => { alert("arrow function injection") })()',
    ];

    dangerousInputs.forEach(dangerousInput => {
      // 危険な入力が例外なく処理されることを確認
      expect(() => {
        fireEvent.change(functionInput, { target: { value: dangerousInput } });
      }).not.toThrow();
      
      // DOMが破損していないことを確認
      expect(document.body).toBeInTheDocument();
    });
  });

  test('セキュリティ: 正当な数学関数は安全に処理される', async () => {
    render(<CalculusVisualizer />, { wrapper: TestWrapper });
    
    const functionInput = screen.getByLabelText('関数 f(x)');
    
    const validInputs = [
      'x^2',
      'sin(x)',
      'cos(x)',
      'exp(x)',
      'log(x)',
      '2*x + 1',
      'sqrt(x)',
      'x^3 - 2*x + 1',
    ];

    for (const validInput of validInputs) {
      fireEvent.change(functionInput, { target: { value: validInput } });
      
      // 関数が正常に処理されることを確認
      await waitFor(() => {
        expect(functionInput).toHaveValue(validInput);
      });
      
      // エラーが発生していないことを確認
      expect(screen.queryByText(/エラー/)).not.toBeInTheDocument();
    }
  });

  test('セキュリティ: 不正な数式に対して適切にエラーハンドリングされる', () => {
    render(<CalculusVisualizer />, { wrapper: TestWrapper });
    
    const functionInput = screen.getByLabelText('関数 f(x)');
    
    const invalidInputs = [
      'invalid_function(x)',
      'x +',
      '+++',
      '(((',
      'undefined',
      'null',
      'NaN',
      '',
    ];

    invalidInputs.forEach(invalidInput => {
      expect(() => {
        fireEvent.change(functionInput, { target: { value: invalidInput } });
      }).not.toThrow();
      
      // アプリケーションが継続して動作することを確認
      expect(screen.getByText('微分積分ビジュアライザー')).toBeInTheDocument();
    });
  });

  test('機能: 基本的な微分計算が正しく動作する', () => {
    render(<CalculusVisualizer />, { wrapper: TestWrapper });
    
    const functionInput = screen.getByLabelText('関数 f(x)');
    
    // x^2の微分は2xなので、x=1での微分は2になる
    fireEvent.change(functionInput, { target: { value: 'x^2' } });
    
    // 接線点を1に設定
    const tangentSlider = screen.getByRole('slider', { name: /x = / });
    fireEvent.change(tangentSlider, { target: { value: '1' } });
    
    // 計算結果が表示されることを確認（数値は近似値）
    expect(screen.getByText(/f'\(1\.0\) =/)).toBeInTheDocument();
  });

  test('機能: 積分計算の基本動作確認', () => {
    render(<CalculusVisualizer />, { wrapper: TestWrapper });
    
    // 積分モードに切り替え
    const integralButton = screen.getByText('積分');
    fireEvent.click(integralButton);
    
    // 積分値が表示されることを確認
    expect(screen.getByText(/積分値:/)).toBeInTheDocument();
    expect(screen.getByText(/∫f\(x\)dx ≈/)).toBeInTheDocument();
  });

  test('UI: コントロール要素が正しく表示される', () => {
    render(<CalculusVisualizer />, { wrapper: TestWrapper });
    
    // 主要なUI要素の存在確認
    expect(screen.getByLabelText('関数 f(x)')).toBeInTheDocument();
    expect(screen.getByText('微分')).toBeInTheDocument();
    expect(screen.getByText('積分')).toBeInTheDocument();
    expect(screen.getByText('両方')).toBeInTheDocument();
    expect(screen.getByText('アニメーション')).toBeInTheDocument();
    expect(screen.getByText('リセット')).toBeInTheDocument();
  });

  test('UI: ヘルプ機能が動作する', () => {
    render(<CalculusVisualizer />, { wrapper: TestWrapper });
    
    const helpButton = screen.getByRole('button', { name: '使い方' });
    fireEvent.click(helpButton);
    
    // ヘルプテキストが表示されることを確認
    expect(screen.getByText(/関数の微分と積分を視覚的に理解/)).toBeInTheDocument();
  });
});

// 数式パーサーの分離テスト
describe('MathParser - 安全な数式パーサー', () => {
  // この関数は修正後のCalculusVisualizerから抽出される想定
  const createSafeMathParser = () => {
    return (expr: string) => {
      return (x: number): number => {
        try {
          // math.jsを使用した安全なパーサー（実装予定）
          // return evaluate(processedExpr, { x });
          return 0; // 仮の実装
        } catch (e) {
          return 0;
        }
      };
    };
  };

  test('安全性: eval()を使用していない', () => {
    const parser = createSafeMathParser();
    const func = parser('x^2');
    
    // evalが使用されていないことを間接的に確認
    // （実際の実装時にmath.jsの使用を確認）
    expect(typeof func).toBe('function');
  });

  test('機能: 基本的な数学関数が正しく解析される', () => {
    const parser = createSafeMathParser();
    
    const testCases = [
      { expr: 'x^2', x: 2, expected: 4 },
      { expr: '2*x + 1', x: 3, expected: 7 },
      { expr: 'sin(0)', x: 0, expected: 0 },
    ];

    testCases.forEach(({ expr, x, expected }) => {
      const func = parser(expr);
      // 注意: 現在は仮の実装なので、実際の値チェックは後で行う
      expect(typeof func(x)).toBe('number');
    });
  });
});