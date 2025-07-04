/**
 * Material-UI テスト用のユーティリティ
 * 無限ループ問題を回避するための特別な設定を含む
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Material-UI のデフォルトテーマ
const theme = createTheme({
  // テスト環境では transition を無効化
  transitions: {
    create: () => 'none',
  },
  components: {
    // TextField と FormControl の特別な設定
    MuiInputBase: {
      defaultProps: {
        // notched を静的に設定してレンダリングループを防ぐ
        notched: true,
      },
    },
    MuiFormControl: {
      defaultProps: {
        // variant を固定
        variant: 'outlined',
      },
    },
    // アニメーションを無効化
    MuiCollapse: {
      defaultProps: {
        timeout: 0,
      },
    },
    MuiDialog: {
      defaultProps: {
        disablePortal: true,
      },
    },
  },
});

// Material-UI コンポーネント用のカスタムレンダラー
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any;
}

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export const renderWithMui = (
  ui: React.ReactElement,
  options?: CustomRenderOptions
) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Material-UI TextField の安定版モック
export const MockTextField = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof import('@mui/material').TextField>
>((props, ref) => {
  const { label, value, onChange, error, helperText, ...rest } = props;
  
  return (
    <div ref={ref} data-testid={`mock-textfield-${label}`}>
      {label && <label>{label}</label>}
      <input
        value={value || ''}
        onChange={(e) => {
          if (onChange) {
            // Material-UI の onChange イベントをシミュレート
            const syntheticEvent = {
              ...e,
              target: {
                ...e.target,
                value: e.target.value,
              },
            };
            onChange(syntheticEvent as any);
          }
        }}
        aria-invalid={error}
        {...rest}
      />
      {helperText && <span>{helperText}</span>}
    </div>
  );
});

MockTextField.displayName = 'MockTextField';

// re-export everything
export * from '@testing-library/react';