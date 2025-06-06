import React from 'react';
import { Box, Typography, LinearProgress, Grid, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimerIcon from '@mui/icons-material/Timer';

interface LearningProgressProps {
  progress: {
    completedStages: number[];
    totalProblems: number;
    correctAnswers: number;
    timeSpent: number;
    misconceptionCount: Record<string, number>;
  };
}

const LearningProgress: React.FC<LearningProgressProps> = ({ progress }) => {
  const stages = [
    { id: 1, name: '具体的な数から記号へ', icon: '1️⃣' },
    { id: 2, name: '記号から文字へ', icon: '2️⃣' },
    { id: 3, name: '文字式と方程式', icon: '3️⃣' }
  ];

  const calculateAccuracy = () => {
    if (progress.totalProblems === 0) return 0;
    return Math.round((progress.correctAnswers / progress.totalProblems) * 100);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  const getMostCommonMisconception = () => {
    const entries = Object.entries(progress.misconceptionCount);
    if (entries.length === 0) return null;
    
    const [type, count] = entries.reduce((max, curr) => 
      curr[1] > max[1] ? curr : max
    );
    
    const misconceptionNames: Record<string, string> = {
      empty_answer: '空欄のまま',
      non_numeric_answer: '数字以外の入力',
      sign_confusion: '符号の混乱',
      still_using_placeholder: '記号の使用継続',
      including_equation: '等号の誤用',
      difficulty_with_variables: '文字の使い方'
    };
    
    return { name: misconceptionNames[type] || type, count };
  };

  const overallProgress = (progress.completedStages.length / stages.length) * 100;
  const accuracy = calculateAccuracy();
  const commonMisconception = getMostCommonMisconception();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        学習進度
      </Typography>
      
      {/* 全体の進捗 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">全体の進捗</Typography>
          <Typography variant="body2" fontWeight="bold">
            {Math.round(overallProgress)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={overallProgress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* ステージ別進捗 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stages.map((stage) => {
          const isCompleted = progress.completedStages.includes(stage.id);
          
          return (
            <Grid item xs={4} key={stage.id}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: stage.id * 0.1 }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    bgcolor: isCompleted ? 'success.light' : 'grey.100',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {stage.icon}
                  </Typography>
                  {isCompleted ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <RadioButtonUncheckedIcon color="disabled" />
                  )}
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {stage.name}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* 統計情報 */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'info.light' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="info" />
              <Box>
                <Typography variant="subtitle2">正答率</Typography>
                <Typography variant="h6">{accuracy}%</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={6}>
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'warning.light' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon color="warning" />
              <Box>
                <Typography variant="subtitle2">学習時間</Typography>
                <Typography variant="h6">{formatTime(progress.timeSpent)}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* よくある間違い */}
      {commonMisconception && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            よくある間違い:
          </Typography>
          <Chip
            label={`${commonMisconception.name} (${commonMisconception.count}回)`}
            size="small"
            color="warning"
          />
        </Box>
      )}
    </Box>
  );
};

export default LearningProgress;