import { type ReactNode, useState, useEffect } from 'react';
import { Box, Paper, Typography, LinearProgress, IconButton, Alert } from '@mui/material';
import { Refresh as RefreshIcon, Help as HelpIcon } from '@mui/icons-material';
import { Button } from '../../common/Button';
import type { MaterialComponentProps } from '../../../types';

// なぜMaterialBaseが必要か：
// 1. 全教材で共通のレイアウトと機能を提供
// 2. 進捗表示、リセット、ヘルプなどの統一されたUI
// 3. 学習データの保存とロードの統一的な処理

interface MaterialBaseProps extends MaterialComponentProps {
  children: ReactNode;
  // 進捗率（0-100）
  progress?: number;
  // ヘルプメッセージ
  helpMessage?: string;
  // エラーメッセージ
  errorMessage?: string;
  // 成功メッセージ
  successMessage?: string;
  // リセット機能
  onReset?: () => void;
  // ヘルプ表示の切り替え
  onToggleHelp?: () => void;
  // 追加のアクションボタン
  actions?: ReactNode;
}

export const MaterialBase = ({
  material,
  children,
  progress = 0,
  helpMessage,
  errorMessage,
  successMessage,
  onReset,
  onToggleHelp,
  onComplete,
  onProgress,
  savedData,
  isPreview = false,
  actions,
}: MaterialBaseProps) => {
  const [showHelp, setShowHelp] = useState(false);
  const [startTime] = useState(Date.now());
  const [interactionCount, setInteractionCount] = useState(0);

  // インタラクション数をカウント（学習分析用）
  const handleInteraction = () => {
    setInteractionCount(prev => prev + 1);
    onProgress?.({ 
      interactionCount: interactionCount + 1,
      timeSpent: Date.now() - startTime 
    });
  };

  // プログレスが100%になったら完了通知
  useEffect(() => {
    if (progress >= 100 && !isPreview) {
      onComplete?.({
        materialId: material.id,
        userId: '', // TODO: 実際のユーザーIDを設定
        startedAt: new Date(startTime),
        completedAt: new Date(),
        score: progress,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        attempts: 1,
        data: { 
          finalProgress: progress,
          totalInteractions: interactionCount 
        }
      });
    }
  }, [progress, material.id, startTime, interactionCount, onComplete, isPreview]);

  const handleToggleHelp = () => {
    setShowHelp(!showHelp);
    onToggleHelp?.();
  };

  const handleReset = () => {
    setInteractionCount(0);
    onReset?.();
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      // インタラクションをキャッチしてカウント
      onClick={handleInteraction}
    >
      {/* ヘッダー */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h5" component="h1">
            {material.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {helpMessage && (
              <IconButton
                size="small"
                onClick={handleToggleHelp}
                color={showHelp ? 'primary' : 'default'}
                aria-label="ヘルプを表示"
              >
                <HelpIcon />
              </IconButton>
            )}
            
            {onReset && (
              <IconButton
                size="small"
                onClick={handleReset}
                aria-label="リセット"
              >
                <RefreshIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {material.description}
        </Typography>

        {/* プログレスバー */}
        {progress > 0 && (
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">進捗</Typography>
              <Typography variant="caption">{Math.round(progress)}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* ヘルプメッセージ */}
        {showHelp && helpMessage && (
          <Alert severity="info" sx={{ mt: 1 }}>
            {helpMessage}
          </Alert>
        )}

        {/* エラーメッセージ */}
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errorMessage}
          </Alert>
        )}

        {/* 成功メッセージ */}
        {successMessage && (
          <Alert severity="success" sx={{ mt: 1 }}>
            {successMessage}
          </Alert>
        )}
      </Box>

      {/* メインコンテンツ */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {children}
      </Box>

      {/* フッター（アクション） */}
      {actions && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          {actions}
        </Box>
      )}

      {/* プレビューモードの表示 */}
      {isPreview && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            backgroundColor: 'warning.main',
            color: 'warning.contrastText',
            px: 1,
            py: 0.5,
            borderRadius: '0 0 0 8px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          プレビュー
        </Box>
      )}
    </Paper>
  );
};