/**
 * 学習進捗トラッカーコンポーネント
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

interface ProgressTrackerProps {
  totalModules: number;
  completedModules: number;
  currentScore: number;
  studyTime?: number; // 秒単位
  level?: number;
  showDetails?: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  totalModules,
  completedModules,
  currentScore,
  studyTime = 0,
  level = 1,
  showDetails = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 完了率計算
  const completionRate = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
  
  // 学習時間の表示フォーマット
  const formatStudyTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    } else if (minutes > 0) {
      return `${minutes}分`;
    } else {
      return `${seconds}秒`;
    }
  };

  // レベルに基づく色の決定
  const getLevelColor = () => {
    if (level >= 5) return theme.palette.success.main;
    if (level >= 3) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  // 進捗メッセージ
  const getProgressMessage = () => {
    if (completionRate === 100) {
      return '🎉 すべてのモジュールを完了しました！';
    } else if (completionRate >= 75) {
      return '🚀 あと少しでコンプリートです！';
    } else if (completionRate >= 50) {
      return '📈 順調に進んでいます！';
    } else if (completionRate > 0) {
      return '💪 がんばって続けましょう！';
    } else {
      return '🌱 学習を始めましょう！';
    }
  };

  if (isMobile && !showDetails) {
    // モバイル用簡易表示
    return (
      <Paper
        elevation={2}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 1,
          backgroundColor: theme.palette.background.paper,
          borderTop: `2px solid ${theme.palette.primary.main}`,
          zIndex: 1000
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" sx={{ minWidth: 'fit-content' }}>
            {completedModules}/{totalModules}
          </Typography>
          <Chip
            label={`${currentScore}pt`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        p: 2,
        minWidth: 280,
        maxWidth: 400,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.primary.main}`,
        borderRadius: 3,
        zIndex: 1000
      }}
    >
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          学習進捗
        </Typography>
        <Chip
          label={`Lv.${level}`}
          size="small"
          sx={{
            backgroundColor: getLevelColor(),
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      </Box>

      {/* 進捗バー */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            モジュール完了
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {completedModules}/{totalModules} ({Math.round(completionRate)}%)
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={completionRate}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`
            }
          }}
        />
      </Box>

      {/* 統計情報 */}
      {showDetails && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<StarIcon />}
            label={`${currentScore} ポイント`}
            size="small"
            color="warning"
            variant="outlined"
          />
          {studyTime > 0 && (
            <Chip
              icon={<TimerIcon />}
              label={formatStudyTime(studyTime)}
              size="small"
              color="info"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* 進捗メッセージ */}
      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          color: theme.palette.text.secondary,
          fontStyle: 'italic',
          p: 1,
          backgroundColor: theme.palette.grey[50],
          borderRadius: 2
        }}
      >
        {getProgressMessage()}
      </Typography>

      {/* レベルアップ効果 */}
      {level > 1 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            次のレベルまで: {(level * 100) - currentScore} ポイント
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(currentScore % 100)}
            sx={{
              height: 4,
              borderRadius: 2,
              mt: 0.5,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: getLevelColor()
              }
            }}
          />
        </Box>
      )}

      {/* 実績バッジ */}
      {completionRate === 100 && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'inline-block',
              px: 2,
              py: 0.5,
              backgroundColor: theme.palette.success.main,
              color: 'white',
              borderRadius: 3,
              fontWeight: 'bold'
            }}
          >
            🏆 分数マスター
          </Typography>
        </Box>
      )}
    </Paper>
  );
};