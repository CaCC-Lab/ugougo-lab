/**
 * エラーバウンダリーコンポーネント
 * Reactコンポーネントのエラーをキャッチして詳細情報を表示
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Alert, Button, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 外部エラーハンドラーを呼び出し
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIが提供されている場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラーUI
      return (
        <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                コンポーネントでエラーが発生しました
              </Typography>
              <Typography variant="body2">
                以下の詳細情報を開発チームにお知らせください。
              </Typography>
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Button 
                variant="contained" 
                onClick={this.handleRetry}
                sx={{ mr: 2 }}
              >
                再試行
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
              >
                ページを再読み込み
              </Button>
            </Box>

            {/* エラー詳細情報 */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">エラー詳細情報</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    エラーメッセージ:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      backgroundColor: '#f5f5f5', 
                      p: 1, 
                      borderRadius: 1,
                      mb: 2
                    }}
                  >
                    {this.state.error?.message || 'Unknown error'}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    スタックトレース:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      backgroundColor: '#f5f5f5', 
                      p: 1, 
                      borderRadius: 1,
                      mb: 2,
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.75rem'
                    }}
                  >
                    {this.state.error?.stack || 'No stack trace available'}
                  </Typography>

                  {this.state.errorInfo && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        コンポーネントスタック:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          backgroundColor: '#f5f5f5', 
                          p: 1, 
                          borderRadius: 1,
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.75rem'
                        }}
                      >
                        {this.state.errorInfo.componentStack}
                      </Typography>
                    </>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;