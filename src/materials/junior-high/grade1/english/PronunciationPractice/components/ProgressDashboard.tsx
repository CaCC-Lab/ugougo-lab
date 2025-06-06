import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider
} from '@mui/material';
import {
  TrendingUp as ImprovementIcon,
  Star as StarIcon,
  School as PracticeIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { phonemeData } from '../data/phonemeData';

interface Statistics {
  phonemeId: string;
  phonemeLabel: string;
  averageScore: number;
  bestScore: number;
  practiceCount: number;
  improvement: number;
}

interface ProgressDashboardProps {
  statistics: Statistics[] | null;
  practiceResults: any[];
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  statistics,
  practiceResults
}) => {
  if (!statistics || statistics.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          まだ練習記録がありません
        </Typography>
        <Typography variant="body2" color="text.secondary">
          音素を選んで練習を始めましょう！
        </Typography>
      </Box>
    );
  }

  // 総合統計を計算
  const totalPracticeCount = statistics.reduce((sum, stat) => sum + stat.practiceCount, 0);
  const overallAverage = Math.round(
    statistics.reduce((sum, stat) => sum + stat.averageScore * stat.practiceCount, 0) / totalPracticeCount
  );
  const masteredCount = statistics.filter(stat => stat.bestScore >= 90).length;

  // トップ3の改善を見せた音素
  const topImproved = [...statistics]
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 3);

  // 最も練習した音素
  const mostPracticed = [...statistics]
    .sort((a, b) => b.practiceCount - a.practiceCount)
    .slice(0, 3);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    if (score >= 50) return 'error';
    return 'default';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        学習進捗ダッシュボード
      </Typography>

      {/* 総合統計 */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PracticeIcon />
                  </Avatar>
                  <Typography variant="h4">
                    {totalPracticeCount}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  総練習回数
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <StarIcon />
                  </Avatar>
                  <Typography variant="h4">
                    {overallAverage}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  平均スコア
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <TrophyIcon />
                  </Avatar>
                  <Typography variant="h4">
                    {masteredCount}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  マスターした音素
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <ImprovementIcon />
                  </Avatar>
                  <Typography variant="h4">
                    {statistics.length}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  練習した音素数
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* 音素別進捗 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              音素別の進捗
            </Typography>
            <List>
              {statistics.map((stat, index) => (
                <React.Fragment key={stat.phonemeId}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={stat.phonemeLabel}
                      secondary={
                        <Box>
                          <LinearProgress
                            variant="determinate"
                            value={stat.averageScore}
                            sx={{ my: 1 }}
                            color={getScoreColor(stat.averageScore) as any}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              label={`平均: ${stat.averageScore}点`}
                              size="small"
                              color={getScoreColor(stat.averageScore)}
                            />
                            <Chip
                              label={`最高: ${stat.bestScore}点`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={`${stat.practiceCount}回練習`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < statistics.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* 成長と練習頻度 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              最も成長した音素
            </Typography>
            <List>
              {topImproved.map((stat, index) => (
                <ListItem key={stat.phonemeId}>
                  <ListItemIcon>
                    <TrophyIcon color={index === 0 ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={stat.phonemeLabel}
                    secondary={`+${stat.improvement}点の改善`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              よく練習した音素
            </Typography>
            <List>
              {mostPracticed.map((stat) => (
                <ListItem key={stat.phonemeId}>
                  <ListItemIcon>
                    <PracticeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={stat.phonemeLabel}
                    secondary={`${stat.practiceCount}回練習`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};