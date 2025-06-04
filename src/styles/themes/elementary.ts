import { createTheme } from '@mui/material/styles';

// 小学生向けテーマ設定
// 大きな文字、明るい色、わかりやすいコントラスト
const elementaryThemeConfig = {
  palette: {
    mode: 'light',
    primary: {
      main: '#FF6B6B', // 明るい赤
      light: '#FF9F9F',
      dark: '#CC5555',
    },
    secondary: {
      main: '#4ECDC4', // 明るい青緑
      light: '#7EDDD6',
      dark: '#3EBAB2',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    success: {
      main: '#95E1A5', // やさしい緑
    },
    warning: {
      main: '#FFE66D', // 明るい黄色
    },
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16, // 基本フォントサイズを大きく
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1.25rem',
      lineHeight: 1.8,
    },
    button: {
      fontSize: '1.25rem',
      fontWeight: 600,
      textTransform: 'none', // 大文字変換を無効化
    },
  },
  shape: {
    borderRadius: 16, // 角を丸く
  },
  spacing: 10, // 広めの余白
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          minHeight: '48px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
  },
};

export default createTheme(elementaryThemeConfig);