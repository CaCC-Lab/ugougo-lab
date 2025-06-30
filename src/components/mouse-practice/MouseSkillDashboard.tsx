/**
 * マウススキルダッシュボード
 */

import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Stack,
  Button,
  Divider,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  TouchApp as AccuracyIcon,
  Timeline as SmoothnessIcon,
  PanTool as DragIcon,
  Timer as TimingIcon,
  TrendingUp as ProgressIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  LocalFireDepartment as StreakIcon,
} from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { useMouseSkillStore } from '../../stores/mouseSkillStore';
import type { MouseBadge, MousePracticeSession } from '../../types/mouse-practice';

/**
 * スキルメトリクスカード
 */
const SkillMetricCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  improvement?: number;
}> = ({ label, value, icon, color, improvement }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}20`, color }}>
          {icon}
        </Avatar>
        <Typography variant="subtitle2" sx={{ ml: 2, flex: 1 }}>
          {label}
        </Typography>
        {improvement !== undefined && improvement !== 0 && (
          <Chip
            label={`${improvement > 0 ? '+' : ''}${improvement}%`}
            size="small"
            color={improvement > 0 ? 'success' : 'error'}
          />
        )}
      </Box>
      <Typography variant="h4" sx={{ color, fontWeight: 'bold', mb: 1 }}>
        {value}%
      </Typography>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: `${color}20`,
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 4,
          },
        }}
      />
    </CardContent>
  </Card>
);

/**
 * バッジカード
 */
const BadgeCard: React.FC<{ badge: MouseBadge; unlocked: boolean }> = ({ badge, unlocked }) => (
  <motion.div
    whileHover={unlocked ? { scale: 1.05 } : {}}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <Card
      sx={{
        height: '100%',
        opacity: unlocked ? 1 : 0.5,
        filter: unlocked ? 'none' : 'grayscale(100%)',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {unlocked && badge.rarity === 'legendary' && (
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            animation: 'spin 4s linear infinite',
            '@keyframes spin': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' },
            },
          }}
        >
          <StarIcon sx={{ color: '#FFD700', fontSize: 30 }} />
        </Box>
      )}
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          {badge.icon}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {badge.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {badge.description}
        </Typography>
        <Chip
          label={badge.rarity}
          size="small"
          sx={{
            backgroundColor: 
              badge.rarity === 'legendary' ? '#9C27B0' :
              badge.rarity === 'epic' ? '#FF9800' :
              badge.rarity === 'rare' ? '#2196F3' : '#4CAF50',
            color: 'white',
            fontWeight: 'bold',
          }}
        />
        {unlocked && badge.unlockedAt && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            獲得日: {new Date(badge.unlockedAt).toLocaleDateString('ja-JP')}
          </Typography>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

/**
 * マウススキルダッシュボード
 */
export const MouseSkillDashboard: React.FC = () => {
  const {
    currentLevel,
    metrics,
    progress,
    badges,
    unlockedBadges,
    sessions,
    exportProgress,
    importProgress,
    resetProgress,
  } = useMouseSkillStore();

  // スキルレーダーチャートデータ
  const radarData = useMemo(() => [
    { skill: 'クリック精度', value: metrics.accuracy },
    { skill: '移動速度', value: Math.min(100, metrics.speed / 4) },
    { skill: '滑らかさ', value: metrics.smoothness },
    { skill: 'ドラッグ制御', value: metrics.dragControl },
    { skill: 'タイミング', value: metrics.clickTiming },
    { skill: 'ダブルクリック', value: metrics.doubleClickRate },
  ], [metrics]);

  // 最近のセッション分析
  const recentSessions = useMemo(() => {
    return progress.recentSessions.slice(0, 7).map((session, index) => ({
      day: `Day ${7 - index}`,
      score: session.score,
      accuracy: session.metrics.accuracy,
      time: session.endTime ? 
        Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000) : 0,
    }));
  }, [progress.recentSessions]);

  // 進捗統計
  const stats = useMemo(() => {
    const totalBadges = badges.length;
    const unlockedCount = unlockedBadges.length;
    const completionRate = Math.round((unlockedCount / totalBadges) * 100);
    
    const avgScore = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
      : 0;

    return {
      totalSessions: progress.totalSessions,
      totalTime: Math.round(progress.totalPracticeTime),
      avgScore,
      completionRate,
      dailyStreak: progress.dailyStreak,
    };
  }, [badges, unlockedBadges, sessions, progress]);

  /**
   * 進捗エクスポート
   */
  const handleExport = () => {
    const data = exportProgress();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mouse-skill-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * 進捗インポート
   */
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      importProgress(data);
    };
    reader.readAsText(file);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          マウススキルダッシュボード
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="進捗をエクスポート">
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="進捗をインポート">
            <IconButton component="label">
              <UploadIcon />
              <input type="file" accept=".json" hidden onChange={handleImport} />
            </IconButton>
          </Tooltip>
          <Tooltip title="進捗をリセット">
            <IconButton onClick={() => {
              if (window.confirm('すべての進捗をリセットしますか？')) {
                resetProgress();
              }
            }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* 統計カード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {stats.totalSessions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                総セッション数
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {stats.totalTime}分
              </Typography>
              <Typography variant="body2" color="text.secondary">
                総練習時間
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {stats.avgScore}点
              </Typography>
              <Typography variant="body2" color="text.secondary">
                平均スコア
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {stats.completionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                バッジ獲得率
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {stats.dailyStreak}
                </Typography>
                <StreakIcon sx={{ ml: 1, color: 'error.main', fontSize: 30 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                連続日数
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* スキルメトリクス */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        スキルメトリクス
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2}>
          <SkillMetricCard
            label="クリック精度"
            value={Math.round(metrics.accuracy)}
            icon={<AccuracyIcon />}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <SkillMetricCard
            label="移動速度"
            value={Math.min(100, Math.round(metrics.speed / 4))}
            icon={<SpeedIcon />}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <SkillMetricCard
            label="滑らかさ"
            value={Math.round(metrics.smoothness)}
            icon={<SmoothnessIcon />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <SkillMetricCard
            label="ドラッグ制御"
            value={Math.round(metrics.dragControl)}
            icon={<DragIcon />}
            color="#9C27B0"
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <SkillMetricCard
            label="タイミング"
            value={Math.round(metrics.clickTiming)}
            icon={<TimingIcon />}
            color="#F44336"
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <SkillMetricCard
            label="ダブルクリック"
            value={Math.round(metrics.doubleClickRate)}
            icon={<AccuracyIcon />}
            color="#00BCD4"
          />
        </Grid>
      </Grid>

      {/* チャートエリア */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* スキルレーダーチャート */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              スキルバランス
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="スキル"
                  dataKey="value"
                  stroke="#2196F3"
                  fill="#2196F3"
                  fillOpacity={0.6}
                />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 進捗グラフ */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              最近の進捗
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={recentSessions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2196F3"
                  strokeWidth={2}
                  name="スコア"
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  name="精度"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* バッジコレクション */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        バッジコレクション
      </Typography>
      <Grid container spacing={2}>
        {badges.map(badge => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={badge.id}>
            <BadgeCard
              badge={badge}
              unlocked={unlockedBadges.indexOf(badge.id) !== -1}
            />
          </Grid>
        ))}
      </Grid>

      {/* 最近のセッション */}
      {progress.recentSessions.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
            最近のセッション
          </Typography>
          <Paper>
            <List>
              {progress.recentSessions.slice(0, 5).map((session, index) => (
                <ListItem key={session.sessionId} divider={index < 4}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <TrophyIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${session.taskType} - スコア: ${session.score}点`}
                    secondary={`${new Date(session.startTime).toLocaleString('ja-JP')} - ${
                      session.endTime ? 
                        Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000) + '分' : 
                        '進行中'
                    }`}
                  />
                  <Stack direction="row" spacing={1}>
                    <Chip label={`精度: ${Math.round(session.metrics.accuracy)}%`} size="small" />
                    <Chip label={`速度: ${Math.round(session.metrics.speed)}`} size="small" />
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      )}
    </Box>
  );
};