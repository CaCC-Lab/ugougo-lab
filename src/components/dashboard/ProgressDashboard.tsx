import React, { useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  CircularProgress,
  Badge,
  Slide,
  Grow,
  Fade,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Functions as MathIcon,
  Language as LanguageIcon,
  Science as ScienceIcon,
  Public as SocialIcon,
  Biotech as BiologyIcon,
  Computer as ComputerIcon,
  ArrowForward as ArrowIcon,
  Star as StarIcon,
  NavigateNext as NextIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  TrendingUp as GrowthIcon,
  Speed as SpeedIcon,
  EmojiEvents as AchievementIcon,
  Celebration as CelebrationIcon,
  Psychology as InsightIcon,
  BarChart as ChartIcon,
  Timeline as TimelineIcon,
  FavoriteRounded as HeartIcon,
  Stars as StarsIcon,
  WhatshotRounded as HotIcon,
  WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useLearningStore } from '../../stores/learningStore';
import { materialRegistry } from '../../utils/materialRegistry';

// タブパネルコンポーネント
interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// 教科アイコンの取得
const getSubjectIcon = (subject: string) => {
  const icons: { [key: string]: ReactNode } = {
    '算数': <MathIcon />,
    '数学': <MathIcon />,
    '国語': <LanguageIcon />,
    '英語': <LanguageIcon />,
    '理科': <ScienceIcon />,
    '社会': <SocialIcon />,
    '生物': <BiologyIcon />,
    '情報': <ComputerIcon />,
    '生活科': <SchoolIcon />,
    '総合': <LightbulbIcon />,
  };
  return icons[subject] || <SchoolIcon />;
};

// 時間フォーマット関数
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

// 日付フォーマット関数
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  });
};

export const ProgressDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [cardAnimationDelay, setCardAnimationDelay] = useState(0);
  
  const {
    records,
    progress,
    getTotalLearningTime,
    getStreakDays,
    getWeeklyProgress,
    getRecommendedMaterials,
  } = useLearningStore();
  
  // アニメーション制御
  useEffect(() => {
    if (animationEnabled) {
      setCardAnimationDelay(0);
      const timer = setInterval(() => {
        setCardAnimationDelay(prev => prev + 100);
      }, 100);
      
      setTimeout(() => {
        clearInterval(timer);
      }, 400);
      
      return () => clearInterval(timer);
    }
  }, [animationEnabled]);
  
  // カラーパレット統一
  const dashboardColors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    background: theme.palette.background.default,
    surface: theme.palette.background.paper,
    accent: '#9C27B0',
    gradient: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      success: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
      warning: 'linear-gradient(135deg, #FF9800 0%, #f57c00 100%)',
      info: 'linear-gradient(135deg, #2196F3 0%, #1976d2 100%)',
    }
  };

  // 基本統計（時間範囲フィルタ対応）
  const filteredRecords = useMemo(() => {
    const now = Date.now();
    const timeRanges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    };
    
    const cutoff = now - timeRanges[timeRange];
    return records.filter(r => r.timestamp > cutoff);
  }, [records, timeRange]);

  const totalTime = getTotalLearningTime();
  const streakDays = getStreakDays();
  const weeklyData = getWeeklyProgress();
  const recommendedMaterials = getRecommendedMaterials();
  
  // 学習済み教材数とレベル分析
  const completedMaterialsCount = progress.filter(p => p.masteryLevel >= 80).length;
  const totalMaterialsCount = 52;
  const progressingMaterialsCount = progress.filter(p => p.masteryLevel > 0 && p.masteryLevel < 80).length;
  
  // 平均スコアと習熟度（時間範囲考慮）
  const averageScore = filteredRecords.length > 0
    ? filteredRecords.reduce((sum, r) => sum + r.score, 0) / filteredRecords.length
    : 0;
  
  const averageMastery = progress.length > 0
    ? progress.reduce((sum, p) => sum + p.masteryLevel, 0) / progress.length
    : 0;

  // 学習傾向分析
  const learningTrends = useMemo(() => {
    const weeklyTime = filteredRecords.reduce((sum, r) => sum + r.duration, 0);
    const avgSessionTime = filteredRecords.length > 0 ? weeklyTime / filteredRecords.length : 0;
    const improvementRate = progress.length > 0
      ? progress.filter(p => p.masteryLevel > 60).length / progress.length * 100
      : 0;
    
    return {
      weeklyTime,
      avgSessionTime,
      improvementRate,
      consistency: streakDays / 7 * 100, // 週間一貫性スコア
    };
  }, [filteredRecords, progress, streakDays]);

  // 達成バッジシステム
  const achievements = useMemo(() => {
    const badges = [];
    
    if (streakDays >= 7) badges.push({ type: 'streak', title: '7日連続学習', icon: <FireIcon /> });
    if (completedMaterialsCount >= 5) badges.push({ type: 'completion', title: '5教材完了', icon: <TrophyIcon /> });
    if (totalTime >= 3600) badges.push({ type: 'time', title: '1時間学習', icon: <TimerIcon /> });
    if (averageScore >= 80) badges.push({ type: 'excellence', title: '高得点維持', icon: <StarsIcon /> });
    
    return badges;
  }, [streakDays, completedMaterialsCount, totalTime, averageScore]);
  
  // 教科別統計
  const subjectStats = useMemo(() => {
    const stats: { [key: string]: { count: number; totalTime: number; avgMastery: number } } = {};
    
    progress.forEach(p => {
      const material = materialRegistry.getMaterial(p.materialId);
      if (material) {
        const subject = material.subject;
        if (!stats[subject]) {
          stats[subject] = { count: 0, totalTime: 0, avgMastery: 0 };
        }
        stats[subject].count++;
        stats[subject].totalTime += p.totalTime;
        stats[subject].avgMastery += p.masteryLevel;
      }
    });
    
    // 平均習熟度を計算
    Object.keys(stats).forEach(subject => {
      if (stats[subject].count > 0) {
        stats[subject].avgMastery = stats[subject].avgMastery / stats[subject].count;
      }
    });
    
    return stats;
  }, [progress]);
  
  // レーダーチャート用データ
  const radarData = Object.entries(subjectStats).map(([subject, stat]) => ({
    subject,
    mastery: Math.round(stat.avgMastery),
  }));
  
  // 最近の学習履歴（直近10件）
  const recentRecords = records
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);
  
  // 学習時間推移（過去30日）
  const learningTrend = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const dailyTime: { [key: string]: number } = {};
    
    records
      .filter(r => r.timestamp > thirtyDaysAgo)
      .forEach(record => {
        const dateKey = new Date(record.timestamp).toLocaleDateString('ja-JP');
        dailyTime[dateKey] = (dailyTime[dateKey] || 0) + record.duration;
      });
    
    // 過去30日分のデータを生成（学習がない日は0）
    const trendData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('ja-JP');
      const dayName = date.toLocaleDateString('ja-JP', { day: 'numeric' });
      
      trendData.push({
        day: dayName,
        time: Math.round((dailyTime[dateKey] || 0) / 60), // 分単位
      });
    }
    
    return trendData;
  }, [records]);
  
  // 習熟度別教材数
  const masteryDistribution = [
    {
      name: '未学習',
      value: totalMaterialsCount - progress.length,
      color: '#e0e0e0',
    },
    {
      name: '初級（0-40%）',
      value: progress.filter(p => p.masteryLevel > 0 && p.masteryLevel <= 40).length,
      color: '#ff9800',
    },
    {
      name: '中級（41-80%）',
      value: progress.filter(p => p.masteryLevel > 40 && p.masteryLevel <= 80).length,
      color: '#2196f3',
    },
    {
      name: '上級（81-100%）',
      value: progress.filter(p => p.masteryLevel > 80).length,
      color: '#4caf50',
    },
  ];
  
  // タブ変更ハンドラー
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 達成バッジダイアログ */}
      <Dialog
        open={showAchievements}
        onClose={() => setShowAchievements(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AchievementIcon color="primary" />
            達成バッジ
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {achievements.map((badge, index) => (
              <Grid item xs={6} key={badge.type}>
                <Grow in timeout={300 * (index + 1)}>
                  <Card
                    elevation={3}
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      background: dashboardColors.gradient.success,
                      color: 'white',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        mx: 'auto',
                        mb: 1,
                        width: 56,
                        height: 56,
                      }}
                    >
                      {badge.icon}
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {badge.title}
                    </Typography>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAchievements(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>

      {/* ヘッダー */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4 }}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems={isMobile ? 'flex-start' : 'center'}
            flexDirection={isMobile ? 'column' : 'row'}
            gap={2}
          >
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  background: dashboardColors.gradient.primary,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 'bold',
                }}
              >
                <DashboardIcon sx={{ mr: 1, color: dashboardColors.primary }} />
                学習ダッシュボード
              </Typography>
              <Typography variant="body1" color="text.secondary">
                あなたの学習進捗と成果を可視化します
              </Typography>
              
              {/* 達成バッジ表示 */}
              {achievements.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CelebrationIcon />}
                    onClick={() => setShowAchievements(true)}
                    sx={{ 
                      borderColor: dashboardColors.accent,
                      color: dashboardColors.accent,
                      '&:hover': {
                        borderColor: dashboardColors.accent,
                        bgcolor: `${dashboardColors.accent}10`,
                      }
                    }}
                  >
                    達成バッジ ({achievements.length})
                  </Button>
                </Box>
              )}
            </Box>
            
            {/* コントロールパネル */}
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>期間</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                  label="期間"
                >
                  <MenuItem value="7d">過去7日</MenuItem>
                  <MenuItem value="30d">過去30日</MenuItem>
                  <MenuItem value="90d">過去90日</MenuItem>
                </Select>
              </FormControl>
              
              <Tooltip title="更新">
                <IconButton 
                  onClick={() => setAnimationEnabled(!animationEnabled)}
                  sx={{ 
                    bgcolor: dashboardColors.surface,
                    '&:hover': { bgcolor: `${dashboardColors.primary}10` }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Fade>
      
      {/* 統計カード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 総学習時間カード */}
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={600}>
            <Card 
              elevation={6}
              sx={{
                background: dashboardColors.gradient.info,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.3s ease',
                  boxShadow: theme.shadows[12],
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      総学習時間
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                      {formatTime(totalTime)}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      目標: 10時間
                    </Typography>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      width: 56, 
                      height: 56,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <TimerIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((totalTime / 36000) * 100, 100)}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white',
                        borderRadius: 4,
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    今週: {formatTime(learningTrends.weeklyTime)}
                  </Typography>
                </Box>
              </CardContent>
              {/* 背景装飾 */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  zIndex: 0,
                }}
              />
            </Card>
          </Grow>
        </Grid>
        
        {/* 連続学習カード */}
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={800}>
            <Card 
              elevation={6}
              sx={{
                background: dashboardColors.gradient.warning,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.3s ease',
                  boxShadow: theme.shadows[12],
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      連続学習
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                      {streakDays}日
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      一貫性: {Math.round(learningTrends.consistency)}%
                    </Typography>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      width: 56, 
                      height: 56,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <HotIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5} mt={2}>
                  {[...Array(7)].map((_, i) => (
                    <Grow key={i} in timeout={300 * (i + 1)}>
                      <FireIcon
                        sx={{
                          fontSize: 24,
                          color: i < Math.min(streakDays, 7) ? 'white' : 'rgba(255,255,255,0.3)',
                          filter: i < Math.min(streakDays, 7) ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none',
                        }}
                      />
                    </Grow>
                  ))}
                </Box>
              </CardContent>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  zIndex: 0,
                }}
              />
            </Card>
          </Grow>
        </Grid>
        
        {/* 習得済み教材カード */}
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1000}>
            <Card 
              elevation={6}
              sx={{
                background: dashboardColors.gradient.success,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.3s ease',
                  boxShadow: theme.shadows[12],
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      習得済み教材
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                      {completedMaterialsCount}/{totalMaterialsCount}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      進行中: {progressingMaterialsCount}教材
                    </Typography>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      width: 56, 
                      height: 56,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <PremiumIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(completedMaterialsCount / totalMaterialsCount) * 100}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white',
                        borderRadius: 4,
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    完了率: {Math.round((completedMaterialsCount / totalMaterialsCount) * 100)}%
                  </Typography>
                </Box>
              </CardContent>
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  zIndex: 0,
                }}
              />
            </Card>
          </Grow>
        </Grid>
        
        {/* 平均習熟度カード */}
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1200}>
            <Card 
              elevation={6}
              sx={{
                background: dashboardColors.gradient.primary,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.3s ease',
                  boxShadow: theme.shadows[12],
                }
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      平均習熟度
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                      {Math.round(averageMastery)}%
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      平均スコア: {Math.round(averageScore)}点
                    </Typography>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      width: 56, 
                      height: 56,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <InsightIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={averageMastery}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white',
                        borderRadius: 4,
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                    改善率: {Math.round(learningTrends.improvementRate)}%
                  </Typography>
                </Box>
              </CardContent>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -50,
                  right: -50,
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  zIndex: 0,
                }}
              />
            </Card>
          </Grow>
        </Grid>
      </Grid>
      
      {/* タブセクション */}
      <Slide in direction="up" timeout={800}>
        <Paper 
          elevation={4} 
          sx={{ 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                minHeight: 72,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: `${dashboardColors.primary}08`,
                  transform: 'translateY(-2px)',
                },
                '&.Mui-selected': {
                  background: `linear-gradient(135deg, ${dashboardColors.primary}15 0%, ${dashboardColors.primary}05 100%)`,
                  borderBottom: `3px solid ${dashboardColors.primary}`,
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: dashboardColors.gradient.primary,
              }
            }}
          >
            <Tab 
              label="概要" 
              icon={<DashboardIcon />} 
              iconPosition="start"
              sx={{ minWidth: isMobile ? 'auto' : 140 }}
            />
            <Tab 
              label="学習推移" 
              icon={<TimelineIcon />} 
              iconPosition="start"
              sx={{ minWidth: isMobile ? 'auto' : 140 }}
            />
            <Tab 
              label="教科別分析" 
              icon={<ChartIcon />} 
              iconPosition="start"
              sx={{ minWidth: isMobile ? 'auto' : 140 }}
            />
            <Tab 
              label="おすすめ" 
              icon={<LightbulbIcon />} 
              iconPosition="start"
              sx={{ minWidth: isMobile ? 'auto' : 140 }}
            />
          </Tabs>
        
        {/* 概要タブ */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* 学習時間推移チャート */}
            <Grid item xs={12} md={8}>
              <Fade in timeout={700}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        学習時間推移
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        過去{timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'}日間の学習活動
                      </Typography>
                    </Box>
                    <ToggleButtonGroup
                      value={timeRange}
                      exclusive
                      onChange={(_, value) => value && setTimeRange(value)}
                      size="small"
                    >
                      <ToggleButton value="7d">7日</ToggleButton>
                      <ToggleButton value="30d">30日</ToggleButton>
                      <ToggleButton value="90d">90日</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={learningTrend}>
                      <defs>
                        <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={dashboardColors.info} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={dashboardColors.info} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis 
                        dataKey="day" 
                        stroke={theme.palette.text.secondary}
                        fontSize={12}
                      />
                      <YAxis 
                        stroke={theme.palette.text.secondary}
                        fontSize={12}
                      />
                      <ChartTooltip
                        formatter={(value) => [`${value}分`, '学習時間']}
                        labelFormatter={(label) => `${label}日`}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          boxShadow: theme.shadows[4],
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="time"
                        stroke={dashboardColors.info}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTime)"
                        dot={{ fill: dashboardColors.info, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: dashboardColors.info, strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  {/* 学習統計サマリー */}
                  <Box 
                    sx={{ 
                      mt: 3, 
                      p: 2, 
                      bgcolor: `${dashboardColors.info}08`,
                      borderRadius: 2,
                      border: `1px solid ${dashboardColors.info}20`,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" color={dashboardColors.info} fontWeight="bold">
                            {formatTime(learningTrends.avgSessionTime)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            平均セッション時間
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" color={dashboardColors.success} fontWeight="bold">
                            {Math.round(learningTrends.consistency)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            学習継続率
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" color={dashboardColors.warning} fontWeight="bold">
                            {filteredRecords.length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            学習セッション数
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" color={dashboardColors.accent} fontWeight="bold">
                            {Math.round(learningTrends.improvementRate)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            改善率
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Fade>
            </Grid>
            
            {/* 習熟度分布 & 学習目標 */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Fade in timeout={900}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        習熟度分布
                      </Typography>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={masteryDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ value, name }) => value > 0 ? `${value}教材` : ''}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                            strokeWidth={2}
                            stroke={theme.palette.background.paper}
                          >
                            {masteryDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip
                            formatter={(value, name) => [`${value}教材`, name]}
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8,
                              boxShadow: theme.shadows[4],
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '12px' }}
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Fade>
                </Grid>
                
                {/* 今週の目標 */}
                <Grid item xs={12}>
                  <Fade in timeout={1100}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        background: dashboardColors.gradient.success,
                        color: 'white',
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={2}>
                        <AchievementIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold">
                          今週の目標
                        </Typography>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          学習時間目標: 5時間
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((learningTrends.weeklyTime / 18000) * 100, 100)}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: 'white',
                              borderRadius: 4,
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {formatTime(learningTrends.weeklyTime)} / 5時間
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />
                      
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          連続学習目標: 7日
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((streakDays / 7) * 100, 100)}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: 'white',
                              borderRadius: 4,
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {streakDays} / 7日
                        </Typography>
                      </Box>
                    </Paper>
                  </Fade>
                </Grid>
              </Grid>
            </Grid>
            
            {/* 最近の学習履歴 */}
            <Grid item xs={12}>
              <Fade in timeout={1300}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        最近の学習履歴
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        最新の{recentRecords.length}件の学習記録
                      </Typography>
                    </Box>
                    
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>教科フィルタ</InputLabel>
                      <Select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        label="教科フィルタ"
                      >
                        <MenuItem value="all">すべて</MenuItem>
                        <MenuItem value="算数">算数</MenuItem>
                        <MenuItem value="数学">数学</MenuItem>
                        <MenuItem value="国語">国語</MenuItem>
                        <MenuItem value="英語">英語</MenuItem>
                        <MenuItem value="理科">理科</MenuItem>
                        <MenuItem value="社会">社会</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <List sx={{ bgcolor: 'transparent' }}>
                    {recentRecords
                      .filter(record => {
                        if (subjectFilter === 'all') return true;
                        const material = materialRegistry.getMaterial(record.materialId);
                        return material?.subject === subjectFilter;
                      })
                      .map((record, index) => {
                        const material = materialRegistry.getMaterial(record.materialId);
                        return (
                          <Grow key={record.timestamp} in timeout={200 * (index + 1)}>
                            <Box>
                              <ListItem 
                                sx={{ 
                                  mb: 1,
                                  borderRadius: 2,
                                  bgcolor: theme.palette.background.paper,
                                  border: `1px solid ${theme.palette.divider}`,
                                  '&:hover': {
                                    bgcolor: `${dashboardColors.primary}05`,
                                    transform: 'translateX(4px)',
                                    transition: 'all 0.2s ease',
                                  }
                                }}
                              >
                                <ListItemIcon>
                                  <Avatar 
                                    sx={{ 
                                      bgcolor: `${dashboardColors.primary}15`,
                                      color: dashboardColors.primary,
                                      width: 48,
                                      height: 48,
                                    }}
                                  >
                                    {material ? getSubjectIcon(material.subject) : <SchoolIcon />}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography variant="subtitle1" fontWeight="600">
                                      {material?.name || record.materialId}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box component="div" sx={{ mt: 1 }}>
                                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                        <Chip
                                          label={`${record.score}点`}
                                          size="small"
                                          sx={{
                                            bgcolor: record.score >= 80 ? dashboardColors.success : 
                                                    record.score >= 60 ? dashboardColors.warning : dashboardColors.error,
                                            color: 'white',
                                            fontWeight: 'bold',
                                          }}
                                        />
                                        {material && (
                                          <Chip
                                            label={material.subject}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem' }}
                                          />
                                        )}
                                        {record.completed && (
                                          <Chip
                                            icon={<CheckIcon />}
                                            label="完了"
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                          />
                                        )}
                                      </Box>
                                      <Typography variant="caption" color="text.secondary">
                                        <ScheduleIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                        {formatDate(record.timestamp)} • {formatTime(record.duration)}
                                      </Typography>
                                    </Box>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    {record.score >= 90 && (
                                      <Tooltip title="優秀な成績！">
                                        <StarsIcon sx={{ color: dashboardColors.warning, fontSize: 20 }} />
                                      </Tooltip>
                                    )}
                                    <IconButton size="small" sx={{ opacity: 0.7 }}>
                                      <ArrowIcon />
                                    </IconButton>
                                  </Box>
                                </ListItemSecondaryAction>
                              </ListItem>
                            </Box>
                          </Grow>
                        );
                      })}
                  </List>
                  
                  {recentRecords.filter(record => {
                    if (subjectFilter === 'all') return true;
                    const material = materialRegistry.getMaterial(record.materialId);
                    return material?.subject === subjectFilter;
                  }).length === 0 && (
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        py: 4,
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 2,
                        border: `1px dashed ${theme.palette.divider}`,
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        {subjectFilter === 'all' ? '学習履歴がありません' : `${subjectFilter}の学習履歴がありません`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        学習を開始すると、ここに履歴が表示されます
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* 学習推移タブ */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  週間学習パフォーマンス
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" orientation="left" stroke="#2196f3" />
                    <YAxis yAxisId="right" orientation="right" stroke="#ff9800" />
                    <ChartTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="time" fill="#2196f3" name="学習時間（秒）" />
                    <Bar yAxisId="right" dataKey="score" fill="#ff9800" name="平均スコア" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* 教科別分析タブ */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* 教科別レーダーチャート */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  教科別習熟度
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="習熟度"
                      dataKey="mastery"
                      stroke="#2196f3"
                      fill="#2196f3"
                      fillOpacity={0.6}
                    />
                    <ChartTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* 教科別詳細 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  教科別学習状況
                </Typography>
                <List>
                  {Object.entries(subjectStats).map(([subject, stat]) => (
                    <ListItem key={subject}>
                      <ListItemIcon>
                        {getSubjectIcon(subject)}
                      </ListItemIcon>
                      <ListItemText
                        primary={subject}
                        secondary={
                          <Box>
                            <Typography variant="caption">
                              学習時間: {formatTime(stat.totalTime)} • 
                              教材数: {stat.count}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={stat.avgMastery}
                              sx={{ mt: 1, height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        }
                      />
                      <Box sx={{ minWidth: 50, textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(stat.avgMastery)}%
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* おすすめタブ */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* おすすめ教材メインセクション */}
            <Grid item xs={12}>
              <Fade in timeout={700}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box display="flex" alignItems="center" mb={3}>
                    <Box
                      sx={{
                        background: dashboardColors.gradient.primary,
                        borderRadius: 2,
                        p: 1.5,
                        mr: 2,
                      }}
                    >
                      <LightbulbIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        あなたにおすすめの教材
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        AI分析に基づく最適な学習プランを提案します
                      </Typography>
                    </Box>
                  </Box>
                  
                  {recommendedMaterials.length > 0 ? (
                    <Grid container spacing={2}>
                      {recommendedMaterials.slice(0, 6).map((materialId, index) => {
                        const material = materialRegistry.getMaterial(materialId);
                        const materialProgress = progress.find(p => p.materialId === materialId);
                        
                        if (!material) return null;
                        
                        const difficultyLevel = materialProgress?.masteryLevel ?? 0;
                        const recommendationReason = 
                          difficultyLevel < 60 ? '復習推奨' :
                          difficultyLevel < 80 ? '継続学習' : '新規チャレンジ';
                        
                        const priorityColor = 
                          index < 2 ? dashboardColors.error :
                          index < 4 ? dashboardColors.warning : dashboardColors.info;
                        
                        return (
                          <Grid item xs={12} md={6} key={materialId}>
                            <Grow in timeout={300 * (index + 1)}>
                              <Card
                                elevation={3}
                                sx={{
                                  position: 'relative',
                                  borderRadius: 3,
                                  overflow: 'hidden',
                                  border: `2px solid transparent`,
                                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                                  '&:hover': {
                                    transform: 'translateY(-8px)',
                                    transition: 'all 0.3s ease',
                                    boxShadow: theme.shadows[8],
                                    borderColor: dashboardColors.primary,
                                  }
                                }}
                              >
                                {/* 優先度バッジ */}
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    zIndex: 2,
                                  }}
                                >
                                  <Chip
                                    label={`#${index + 1}`}
                                    size="small"
                                    sx={{
                                      bgcolor: priorityColor,
                                      color: 'white',
                                      fontWeight: 'bold',
                                      fontSize: '0.8rem',
                                    }}
                                  />
                                </Box>
                                
                                <CardContent sx={{ p: 3 }}>
                                  <Box display="flex" alignItems="flex-start" mb={2}>
                                    <Avatar
                                      sx={{
                                        bgcolor: `${priorityColor}20`,
                                        color: priorityColor,
                                        width: 56,
                                        height: 56,
                                        mr: 2,
                                      }}
                                    >
                                      {getSubjectIcon(material.subject)}
                                    </Avatar>
                                    <Box flex={1}>
                                      <Typography variant="h6" fontWeight="bold" mb={0.5}>
                                        {material.name}
                                      </Typography>
                                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <Chip
                                          label={material.subject}
                                          size="small"
                                          variant="outlined"
                                          sx={{ fontSize: '0.7rem' }}
                                        />
                                        <Chip
                                          label={material.grade}
                                          size="small"
                                          variant="outlined"
                                          sx={{ fontSize: '0.7rem' }}
                                        />
                                        <Chip
                                          label={recommendationReason}
                                          size="small"
                                          sx={{
                                            bgcolor: difficultyLevel < 60 ? dashboardColors.warning : 
                                                    difficultyLevel < 80 ? dashboardColors.info : dashboardColors.success,
                                            color: 'white',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                  </Box>
                                  
                                  {materialProgress && (
                                    <Box mb={2}>
                                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="caption" color="text.secondary">
                                          習熟度
                                        </Typography>
                                        <Typography variant="caption" fontWeight="bold">
                                          {materialProgress.masteryLevel}%
                                        </Typography>
                                      </Box>
                                      <LinearProgress
                                        variant="determinate"
                                        value={materialProgress.masteryLevel}
                                        sx={{
                                          height: 8,
                                          borderRadius: 4,
                                          bgcolor: `${priorityColor}20`,
                                          '& .MuiLinearProgress-bar': {
                                            bgcolor: priorityColor,
                                            borderRadius: 4,
                                          }
                                        }}
                                      />
                                    </Box>
                                  )}
                                  
                                  <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    endIcon={<PlayIcon />}
                                    sx={{
                                      background: `linear-gradient(135deg, ${priorityColor} 0%, ${priorityColor}dd 100%)`,
                                      color: 'white',
                                      fontWeight: 'bold',
                                      py: 1.5,
                                      '&:hover': {
                                        background: `linear-gradient(135deg, ${priorityColor}dd 0%, ${priorityColor}bb 100%)`,
                                        transform: 'scale(1.02)',
                                      }
                                    }}
                                    onClick={() => {
                                      // 実際の教材ページへの遷移処理を実装
                                      const event = new CustomEvent('navigateToMaterial', { 
                                        detail: { materialId, materialName: material.name } 
                                      });
                                      window.dispatchEvent(event);
                                    }}
                                  >
                                    学習を開始する
                                  </Button>
                                </CardContent>
                              </Card>
                            </Grow>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Fade in timeout={1000}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          py: 8,
                          background: dashboardColors.gradient.success,
                          borderRadius: 3,
                          color: 'white',
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            mx: 'auto',
                            mb: 3,
                          }}
                        >
                          <TrophyIcon sx={{ fontSize: 48 }} />
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          素晴らしい成果です！
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                          すべての教材で高い習熟度を達成されています
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          新しい教材の追加をお待ちください
                        </Typography>
                      </Box>
                    </Fade>
                  )}
                </Paper>
              </Fade>
            </Grid>
            
            {/* AI学習アシスタント */}
            <Grid item xs={12} md={6}>
              <Fade in timeout={900}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: dashboardColors.gradient.info,
                    color: 'white',
                  }}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    <InsightIcon sx={{ mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" fontWeight="bold">
                      学習分析レポート
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      • 最も得意な教科: <strong>{Object.entries(subjectStats).reduce((a, b) => subjectStats[a[0]]?.avgMastery > subjectStats[b[0]]?.avgMastery ? a : b, ['', { avgMastery: 0 }])[0] || '未選択'}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      • 改善が期待される分野: <strong>{Object.entries(subjectStats).reduce((a, b) => subjectStats[a[0]]?.avgMastery < subjectStats[b[0]]?.avgMastery ? a : b, ['', { avgMastery: 100 }])[0] || '未選択'}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      • 学習ペース: <strong>{Math.round(learningTrends.consistency) >= 70 ? '良好' : '要改善'}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      • 次の目標: <strong>{completedMaterialsCount < 10 ? '10教材完了' : completedMaterialsCount < 25 ? '25教材完了' : '全教材マスター'}</strong>
                    </Typography>
                  </Box>
                  
                  <Alert 
                    severity="info" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      '& .MuiAlert-icon': { color: 'white' }
                    }}
                  >
                    <AlertTitle sx={{ color: 'white', fontWeight: 'bold' }}>
                      推奨学習プラン
                    </AlertTitle>
                    {learningTrends.consistency < 50 ? 
                      '毎日15分の学習習慣を作ることから始めましょう' :
                      learningTrends.consistency < 70 ?
                      '現在のペースを維持しつつ、苦手分野を重点的に学習しましょう' :
                      '素晴らしいペースです！新しい分野にもチャレンジしてみましょう'
                    }
                  </Alert>
                </Paper>
              </Fade>
            </Grid>
            
            {/* 学習のヒント */}
            <Grid item xs={12} md={6}>
              <Fade in timeout={1100}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: dashboardColors.gradient.warning,
                    color: 'white',
                  }}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    <LightbulbIcon sx={{ mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" fontWeight="bold">
                      効果的な学習のコツ
                    </Typography>
                  </Box>
                  
                  <List sx={{ p: 0 }}>
                    {[
                      { icon: <CalendarIcon />, text: '毎日少しずつでも継続することが最も重要です' },
                      { icon: <SpeedIcon />, text: '苦手分野こそ、段階的にじっくり取り組みましょう' },
                      { icon: <TrophyIcon />, text: '習熟度80%を目標に、確実にマスターしていきましょう' },
                      { icon: <RefreshIcon />, text: '定期的な復習で、知識を長期記憶に定着させましょう' },
                    ].map((tip, index) => (
                      <Grow key={index} in timeout={400 * (index + 1)}>
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                              {React.cloneElement(tip.icon, { sx: { fontSize: 18, color: 'white' } })}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText>
                            <Typography variant="body2" sx={{ opacity: 0.95 }}>
                              {tip.text}
                            </Typography>
                          </ListItemText>
                        </ListItem>
                      </Grow>
                    ))}
                  </List>
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </TabPanel>
        </Paper>
      </Slide>
    </Container>
  );
};