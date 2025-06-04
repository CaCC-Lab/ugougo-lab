import { createTheme, ThemeOptions } from '@mui/material/styles';

// 高校生向けテーマ設定
// より洗練された色使い、コンパクトなレイアウト
const highSchoolTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2', // プロフェッショナルな青
      light: '#42A5F5',
      dark: '#1565C0',
    },
    secondary: {
      main: '#424242', // グレー系
      light: '#6D6D6D',
      dark: '#1B1B1B',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    success: {
      main: '#388E3C',
    },
    warning: {
      main: '#F57C00',
    },
    error: {
      main: '#D32F2F',
    },
    info: {
      main: '#0288D1',
    },
  },
  typography: {
    fontFamily: '"Noto Sans JP", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: {
      fontSize: '2rem',
      fontWeight: 400,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 400,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 400,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.43,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '6px 16px',
          minHeight: '36px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
          '&:hover': {
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
  },
};

export default createTheme(highSchoolTheme);