import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  useTheme,
  Alert,
  AlertTitle,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  IconButton
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  PersonAdd as PersonAddIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import { useLearningAnalytics } from '../hooks/useLearningAnalytics';
import LearningTimeChart from '../components/charts/LearningTimeChart';
import AccuracyTrendChart from '../components/charts/AccuracyTrendChart';
import WeeklyPatternChart from '../components/charts/WeeklyPatternChart';
import MaterialProgressList from '../components/MaterialProgressList';
import InsightCards from '../components/insights/InsightCards';
import DataExportDialog from '../components/export/DataExportDialog';

// 保護者向け統計カード
const ParentStatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  recommendation?: string;
}> = ({ title, value, subtitle, icon, color, trend, recommendation }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              backgroundColor: color,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        
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
        
        {recommendation && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              {recommendation}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

// 学習パターン分析カード
const LearningPatternCard: React.FC<{
  title: string;
  patterns: string[];
  recommendations: string[];
}> = ({ title, patterns, recommendations }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          学習パターン
        </Typography>
        <List dense>
          {patterns.map((pattern, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={pattern}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          推奨アクション
        </Typography>
        <List dense>
          {recommendations.map((recommendation, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon>
                <TrendingUpIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={recommendation}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

const ParentView: React.FC = () => {
  const theme = useTheme();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  const {
    summary,
    learningTimeChartData,
    accuracyChartData,
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
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        ))}
      </Grid>
    );
  }
  
  // 保護者向けの推奨事項を生成
  const generateParentRecommendations = () => {
    const recommendations = [];
    
    if (summary.weeklyAverage < 10) {
      recommendations.push('毎日の学習時間を増やすサポートをしてください');
    }
    
    if (summary.averageAccuracy < 70) {
      recommendations.push('基礎的な内容の復習を一緒に行ってください');
    }
    
    if (summary.streakDays < 3) {
      recommendations.push('継続的な学習習慣の形成をサポートしてください');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('現在の学習ペースを維持してください');
    }
    
    return recommendations;
  };
  
  const learningPatterns = [
    '平日の学習時間が安定しています',
    '正答率が徐々に向上しています',
    '継続的な学習習慣が身についています'
  ];
  
  const parentRecommendations = generateParentRecommendations();
  
  return (
    <Grid container spacing={3}>
      {/* ヘッダー */}
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" gutterBottom>
            お子様の学習状況
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              startIcon={<DownloadIcon />}
              variant="outlined"
              size="small"
              onClick={() => setIsExportDialogOpen(true)}
            >
              レポート出力
            </Button>
            <IconButton>
              <NotificationIcon />
            </IconButton>
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
      </Grid>
      
      {/* 重要な注意事項 */}
      {priorityInsights.length > 0 && (
        <Grid item xs={12}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>注意が必要な点</AlertTitle>
            <List dense>
              {priorityInsights.slice(0, 3).map((insight, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon>
                    <WarningIcon color="warning" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={insight.description}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        </Grid>
      )}
      
      {/* 統計カード */}
      <Grid item xs={12} sm={6} md={3}>
        <ParentStatCard
          title="今週の学習時間"
          value={`${summary.weeklyAverage}分/日`}
          subtitle="平日の平均学習時間"
          icon={<TimeIcon />}
          color={theme.palette.primary.main}
          trend={summary.improvement}
          recommendation={
            summary.weeklyAverage < 10
              ? '理想的な学習時間は15-20分です'
              : '良いペースで継続できています'
          }
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <ParentStatCard
          title="継続学習日数"
          value={`${summary.streakDays}日`}
          subtitle="連続して学習した日数"
          icon={<TrophyIcon />}
          color={theme.palette.secondary.main}
          recommendation={
            summary.streakDays < 3
              ? '継続的な学習習慣を身につけましょう'
              : '素晴らしい継続力です'
          }
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <ParentStatCard
          title="理解度"
          value={`${summary.averageAccuracy}%`}
          subtitle="全体の平均正答率"
          icon={<SchoolIcon />}
          color={theme.palette.success.main}
          trend={summary.improvement}
          recommendation={
            summary.averageAccuracy < 70
              ? '基礎的な内容の復習が必要です'
              : '良い理解度を保っています'
          }
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <ParentStatCard
          title="完了教材数"
          value={summary.completedMaterials}
          subtitle="習熟度80%以上の教材"
          icon={<CheckIcon />}
          color={theme.palette.info.main}
          recommendation={
            summary.completedMaterials < 5
              ? '様々な教材に挑戦してみましょう'
              : '多様な分野で成果を上げています'
          }
        />
      </Grid>
      
      {/* 学習パターン分析 */}
      <Grid item xs={12} md={4}>
        <LearningPatternCard
          title="学習パターン分析"
          patterns={learningPatterns}
          recommendations={parentRecommendations}
        />
      </Grid>
      
      {/* 学習時間推移 */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            学習時間の推移
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            お子様の日々の学習時間を確認できます
          </Typography>
          <LearningTimeChart data={learningTimeChartData} />
        </Paper>
      </Grid>
      
      {/* 正答率推移 */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            理解度の推移
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            お子様の学習理解度の変化を確認できます
          </Typography>
          <AccuracyTrendChart data={accuracyChartData} />
        </Paper>
      </Grid>
      
      {/* 曜日別学習パターン */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            曜日別学習パターン
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            お子様の学習習慣を確認できます
          </Typography>
          <WeeklyPatternChart data={weeklyPatternData} />
        </Paper>
      </Grid>
      
      {/* 教材別進捗状況 */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            教材別進捗状況
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            お子様の得意分野と苦手分野を確認できます
          </Typography>
          <MaterialProgressList
            topMaterials={topAndBottomMaterials.top}
            bottomMaterials={topAndBottomMaterials.bottom}
          />
        </Paper>
      </Grid>
      
      {/* 推奨アクション */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            保護者向け推奨アクション
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  学習サポート
                </Typography>
                <List>
                  <ListItem disableGutters>
                    <ListItemIcon>
                      <PersonAddIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="一緒に学習する時間を作りましょう"
                      secondary="お子様のモチベーション向上につながります"
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon>
                      <TrophyIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="達成時にはしっかりと褒めてあげましょう"
                      secondary="継続的な学習習慣の形成に重要です"
                    />
                  </ListItem>
                </List>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle1" color="secondary" gutterBottom>
                  環境づくり
                </Typography>
                <List>
                  <ListItem disableGutters>
                    <ListItemIcon>
                      <TimeIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="決まった時間に学習する習慣を作りましょう"
                      secondary="規則正しい学習リズムが大切です"
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon>
                      <SchoolIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="集中できる学習環境を整えましょう"
                      secondary="静かで快適な学習スペースが効果的です"
                    />
                  </ListItem>
                </List>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      
      {/* エクスポートダイアログ */}
      <DataExportDialog
        open={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
    </Grid>
  );
};

export default ParentView;