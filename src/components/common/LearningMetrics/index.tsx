import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useLearningStore } from '../../../stores/learningStore';

interface LearningMetricsProps {
  materialId?: string;
  showButton?: boolean;
}

export const LearningMetrics: React.FC<LearningMetricsProps> = ({
  materialId,
  showButton = true,
}) => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  const {
    records,
    progress,
    getTotalLearningTime,
    getWeeklyProgress,
    getStreakDays,
  } = useLearningStore();
  
  // フィルタリング
  const filteredRecords = materialId
    ? records.filter((r) => r.materialId === materialId)
    : records;
  
  const filteredProgress = materialId
    ? progress.filter((p) => p.materialId === materialId)
    : progress;
  
  // 統計計算
  const totalTime = getTotalLearningTime();
  const weeklyData = getWeeklyProgress();
  const streakDays = getStreakDays();
  
  // 正答率計算
  const totalAttempts = filteredRecords.length;
  const totalScore = filteredRecords.reduce((sum, r) => sum + r.score, 0);
  const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;
  
  // 教材別統計
  const materialStats = progress.reduce((acc, p) => {
    const materialRecords = records.filter((r) => r.materialId === p.materialId);
    const totalTime = materialRecords.reduce((sum, r) => sum + r.duration, 0);
    
    acc.push({
      materialId: p.materialId,
      concept: p.concept,
      masteryLevel: p.masteryLevel,
      totalTime,
      attemptCount: p.attemptCount,
      averageScore: p.averageScore,
    });
    
    return acc;
  }, [] as {
    materialId: string;
    concept: string;
    masteryLevel: number;
    totalTime: number;
    attemptCount: number;
    averageScore: number;
  }[]);
  
  // 難易度別統計
  const difficultyStats = [
    {
      name: '簡単',
      value: filteredProgress.filter((p) => p.difficultyLevel === 'easy').length,
      color: '#4caf50',
    },
    {
      name: '普通',
      value: filteredProgress.filter((p) => p.difficultyLevel === 'medium').length,
      color: '#ff9800',
    },
    {
      name: '難しい',
      value: filteredProgress.filter((p) => p.difficultyLevel === 'hard').length,
      color: '#f44336',
    },
  ];
  
  // 時間帯別学習データ
  const hourlyData = filteredRecords.reduce((acc, record) => {
    const hour = new Date(record.timestamp).getHours();
    if (!acc[hour]) {
      acc[hour] = { hour, count: 0, totalScore: 0 };
    }
    acc[hour].count++;
    acc[hour].totalScore += record.score;
    return acc;
  }, {} as { [key: number]: { hour: number; count: number; totalScore: number } });
  
  const hourlyChartData = Object.values(hourlyData)
    .map((data) => ({
      hour: `${data.hour}時`,
      学習回数: data.count,
      平均スコア: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
    }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  
  // エクスポート機能
  const exportData = () => {
    const data = {
      総学習時間: `${Math.floor(totalTime / 3600)}時間${Math.floor((totalTime % 3600) / 60)}分`,
      平均スコア: averageScore.toFixed(1),
      連続学習日数: streakDays,
      学習記録: filteredRecords.map((r) => ({
        日時: new Date(r.timestamp).toLocaleString(),
        教材: r.materialId,
        スコア: r.score,
        学習時間: `${Math.floor(r.duration / 60)}分${r.duration % 60}秒`,
      })),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };
  
  return (
    <>
      {showButton && (
        <Button
          variant="outlined"
          startIcon={<AssessmentIcon />}
          onClick={() => setOpen(true)}
          sx={{ mt: 2 }}
        >
          学習レポートを見る
        </Button>
      )}
      
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">学習レポート</Typography>
            <Box>
              <IconButton onClick={exportData} size="small" sx={{ mr: 1 }}>
                <DownloadIcon />
              </IconButton>
              <IconButton onClick={() => setOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Tabs
            value={tabValue}
            onChange={(_, value) => setTabValue(value)}
            sx={{ mb: 2 }}
          >
            <Tab label="概要" />
            <Tab label="進捗詳細" />
            <Tab label="学習パターン" />
          </Tabs>
          
          {/* 概要タブ */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {/* 基本統計 */}
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <TimelineIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">総学習時間</Typography>
                    </Box>
                    <Typography variant="h4">
                      {formatTime(totalTime)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">平均スコア</Typography>
                    </Box>
                    <Typography variant="h4">
                      {averageScore.toFixed(1)}点
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SpeedIcon color="warning" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">連続学習</Typography>
                    </Box>
                    <Typography variant="h4">
                      {streakDays}日
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <CheckCircleIcon color="info" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">学習回数</Typography>
                    </Box>
                    <Typography variant="h4">
                      {totalAttempts}回
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* 週間進捗グラフ */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    週間学習時間
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="time" fill="#1976d2" name="学習時間（秒）" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              {/* 難易度分布 */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    難易度分布
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={difficultyStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {difficultyStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* 進捗詳細タブ */}
          {tabValue === 1 && (
            <Box>
              <List>
                {materialStats.map((stat, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={stat.concept || stat.materialId}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            学習時間: {formatTime(stat.totalTime)} | 
                            挑戦回数: {stat.attemptCount}回 | 
                            平均スコア: {stat.averageScore.toFixed(1)}点
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={stat.masteryLevel}
                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      }
                    />
                    <Chip
                      label={`習熟度 ${stat.masteryLevel}%`}
                      color={stat.masteryLevel >= 80 ? 'success' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {/* 学習パターンタブ */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    時間帯別学習傾向
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={hourlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="学習回数"
                        stroke="#8884d8"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="平均スコア"
                        stroke="#82ca9d"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};