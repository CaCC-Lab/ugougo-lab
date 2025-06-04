import { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { useTheme } from '@/hooks/useTheme';

// なぜこのコンポーネントが必要か：
// MUIのThemeProviderをラップし、学年別テーマの切り替えロジックを
// アプリケーション全体で統一的に管理するため

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const { theme } = useTheme();

  return (
    <MuiThemeProvider theme={theme}>
      {/* CssBaselineはブラウザのデフォルトスタイルをリセットし、
          一貫したスタイリングの基盤を提供する */}
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};