import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Grid,
  Paper,
  Rating
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CheckCircle as CheckIcon,
  Timer as TimerIcon,
  Score as ScoreIcon,
  TrendingUp as ImprovementIcon,
  Replay as ReplayIcon,
  Home as HomeIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import type { DialogueScenario } from '../data/dialogueScenarios';

interface ScenarioCompleteProps {
  scenario: DialogueScenario;
  score: number;
  mistakes: number;
  timeSpent: number;
  onReplay: () => void;
  onBackToMenu: () => void;
  previousBestScore?: number;
}

export const ScenarioComplete: React.FC<ScenarioCompleteProps> = ({
  scenario,
  score,
  mistakes,
  timeSpent,
  onReplay,
  onBackToMenu,
  previousBestScore
}) => {
  const maxScore = scenario.dialogue.filter(turn => turn.speaker === 'user').length * 15;
  const scorePercentage = (score / maxScore) * 100;
  const rating = scorePercentage >= 90 ? 5 : scorePercentage >= 70 ? 4 : scorePercentage >= 50 ? 3 : 2;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  const getPerformanceMessage = () => {
    if (scorePercentage >= 90) return '素晴らしい！完璧な会話でした！';
    if (scorePercentage >= 70) return 'よくできました！もう少しで完璧です！';
    if (scorePercentage >= 50) return 'がんばりました！練習を続けましょう！';
    return 'お疲れさまでした！もう一度挑戦してみましょう！';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card elevation={3}>
        <CardContent>
          <Box textAlign="center" mb={4}>
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
            >
              <CheckIcon
                sx={{
                  fontSize: 80,
                  color: 'success.main',
                  mb: 2
                }}
              />
            </motion.div>
            
            <Typography variant="h4" gutterBottom>
              シナリオ完了！
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {scenario.titleJa}
            </Typography>
            
            <Rating value={rating} readOnly size="large" sx={{ mt: 2 }} />
            
            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
              {getPerformanceMessage()}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* スコア詳細 */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light', textAlign: 'center' }}>
                <ScoreIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary.main">
                  {score}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  獲得スコア
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={scorePercentage}
                  sx={{ mt: 1, height: 8, borderRadius: 1 }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'warning.light', textAlign: 'center' }}>
                <TimerIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {formatTime(timeSpent)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  練習時間
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'error.light', textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {mistakes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  間違えた数
                </Typography>
                {mistakes === 0 && (
                  <Chip
                    label="パーフェクト！"
                    color="success"
                    size="small"
                    icon={<TrophyIcon />}
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* 前回との比較 */}
          {previousBestScore !== undefined && score > previousBestScore && (
            <Box mt={3} p={2} bgcolor="success.light" borderRadius={1}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <ImprovementIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body1" color="success.main" fontWeight="bold">
                  自己ベスト更新！（前回: {previousBestScore}点）
                </Typography>
              </Box>
            </Box>
          )}

          {/* 学習した単語 */}
          {scenario.vocabularyNotes && scenario.vocabularyNotes.length > 0 && (
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                今回学習した単語
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {scenario.vocabularyNotes.map((vocab, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Chip
                      label={`${vocab.word} - ${vocab.meaning}`}
                      variant="outlined"
                      color="primary"
                    />
                  </motion.div>
                ))}
              </Box>
            </Box>
          )}

          {/* アクションボタン */}
          <Box display="flex" gap={2} justifyContent="center" mt={4}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ReplayIcon />}
              onClick={onReplay}
            >
              もう一度挑戦
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<HomeIcon />}
              onClick={onBackToMenu}
            >
              メニューに戻る
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};