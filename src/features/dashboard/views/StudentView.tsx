import React from 'react';
import {
  Grid,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  CheckCircle as AccuracyIcon,
  CheckCircle,
  EmojiEvents as AchievementIcon
} from '@mui/icons-material';
import { useLearningAnalytics } from '../hooks/useLearningAnalytics';
import LearningTimeChart from '../components/charts/LearningTimeChart';
import AccuracyTrendChart from '../components/charts/AccuracyTrendChart';
import ProficiencyRadarChart from '../components/charts/ProficiencyRadarChart';
import HourlyHeatmap from '../components/charts/HourlyHeatmap';
import WeeklyPatternChart from '../components/charts/WeeklyPatternChart';
import MaterialProgressList from '../components/MaterialProgressList';
import InsightCards from '../components/insights/InsightCards';
import GoalTracker from '../components/GoalTracker';

// 統計カードコンポーネント
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}> = ({ title, value, subtitle, icon, color, trend }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: 20,
          width: 48,
          height: 48,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          color: 'white',
          boxShadow: theme.shadows[4]
        }}
      >
        {icon}
      </Box>
      
      <CardContent sx={{ pt: 4 }}>
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" display="block">
            {subtitle}
          </Typography>
        )}
        {trend !== undefined && (
          <Box display="flex" alignItems="center" mt={1}>
            <TrendingUpIcon
              sx={{
                fontSize: 16,
                color: trend >= 0 ? theme.palette.success.main : theme.palette.error.main,
                transform: trend >= 0 ? 'none' : 'rotate(180deg)'
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: trend >= 0 ? theme.palette.success.main : theme.palette.error.main,
                ml: 0.5
              }}
            >
              {Math.abs(trend)}% {trend >= 0 ? '向上' : '低下'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const StudentView: React.FC = () => {
  const theme = useTheme();
  const _isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const _isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    summary,
    learningTimeChartData,
    accuracyChartData,
    proficiencyRadarData,
    hourlyHeatmapData,
    weeklyPatternData,
    topAndBottomMaterials,
    priorityInsights,
    isLoading
  } = useLearningAnalytics();
  
  if (isLoading || !summary) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rectangular" height={140} />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={400} />
        </Grid>
      </Grid>
    );
  }
  
  return (
    <Grid container spacing={3}>
      {/* 統計カード */}
      <Grid item xs={12} sm={6} md={3}>
        <Fade in timeout={600}>
          <Box>
            <StatCard
              title="総学習時間"
              value={`${summary.totalHours}時間`}
              subtitle={`今週平均: ${summary.weeklyAverage}分/日`}
              icon={<TimeIcon />}
              color={theme.palette.primary.main}
            />
          </Box>
        </Fade>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Fade in timeout={800}>
          <Box>
            <StatCard
              title="連続学習日数"
              value={`${summary.streakDays}日`}
              subtitle="毎日の継続が力に！"
              icon={<AchievementIcon />}
              color={theme.palette.secondary.main}
            />
          </Box>
        </Fade>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Fade in timeout={1000}>
          <Box>
            <StatCard
              title="平均正答率"
              value={`${summary.averageAccuracy}%`}
              subtitle="前週比"
              icon={<AccuracyIcon />}
              color={theme.palette.success.main}
              trend={summary.improvement}
            />
          </Box>
        </Fade>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Fade in timeout={1200}>
          <Box>
            <StatCard
              title="完了教材数"
              value={summary.completedMaterials}
              subtitle="習熟度80%以上"
              icon={<CheckCircle />}
              color={theme.palette.warning.main}
            />
          </Box>
        </Fade>
      </Grid>
      
      {/* 学習インサイト */}
      {priorityInsights.length > 0 && (
        <Grid item xs={12}>
          <Fade in timeout={1400}>
            <Box>
              <InsightCards insights={priorityInsights} />
            </Box>
          </Fade>
        </Grid>
      )}
      
      {/* 学習時間グラフ */}
      <Grid item xs={12} lg={8}>
        <Fade in timeout={1600}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              学習時間の推移
            </Typography>
            <LearningTimeChart data={learningTimeChartData} />
          </Paper>
        </Fade>
      </Grid>
      
      {/* 週間パターン */}
      <Grid item xs={12} lg={4}>
        <Fade in timeout={1800}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              曜日別学習パターン
            </Typography>
            <WeeklyPatternChart data={weeklyPatternData} />
          </Paper>
        </Fade>
      </Grid>
      
      {/* 正答率トレンド */}
      <Grid item xs={12} md={6}>
        <Fade in timeout={2000}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              正答率の推移
            </Typography>
            <AccuracyTrendChart data={accuracyChartData} />
          </Paper>
        </Fade>
      </Grid>
      
      {/* 習熟度レーダーチャート */}
      <Grid item xs={12} md={6}>
        <Fade in timeout={2200}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              教科別習熟度
            </Typography>
            <ProficiencyRadarChart data={proficiencyRadarData} />
          </Paper>
        </Fade>
      </Grid>
      
      {/* 時間帯別ヒートマップ */}
      <Grid item xs={12}>
        <Fade in timeout={2400}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              時間帯別学習パターン
            </Typography>
            <HourlyHeatmap data={hourlyHeatmapData} />
          </Paper>
        </Fade>
      </Grid>
      
      {/* 教材別進捗 */}
      <Grid item xs={12} lg={6}>
        <Fade in timeout={2600}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              教材別進捗状況
            </Typography>
            <MaterialProgressList
              topMaterials={topAndBottomMaterials.top}
              bottomMaterials={topAndBottomMaterials.bottom}
            />
          </Paper>
        </Fade>
      </Grid>
      
      {/* 学習目標トラッカー */}
      <Grid item xs={12} lg={6}>
        <Fade in timeout={2800}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              学習目標
            </Typography>
            <GoalTracker />
          </Paper>
        </Fade>
      </Grid>
    </Grid>
  );
};

export default StudentView;