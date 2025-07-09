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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Badge
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  FileDownload as DownloadIcon,
  Star as StarIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useLearningAnalytics } from '../hooks/useLearningAnalytics';
import LearningTimeChart from '../components/charts/LearningTimeChart';
import AccuracyTrendChart from '../components/charts/AccuracyTrendChart';
import WeeklyPatternChart from '../components/charts/WeeklyPatternChart';
import MaterialProgressList from '../components/MaterialProgressList';
import DataExportDialog from '../components/export/DataExportDialog';

// 教師向け統計カード
const TeacherStatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  comparison?: {
    label: string;
    value: number;
  };
}> = ({ title, value, subtitle, icon, color, trend, comparison }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
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
        
        {comparison && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">
              {comparison.label}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={comparison.value}
              sx={{ mt: 0.5 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// 生徒一覧テーブル
const StudentsTable: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  
  // モックデータ（実際のアプリケーションでは外部から取得）
  const students = [
    {
      id: 1,
      name: '田中太郎',
      class: 'A組',
      avatar: '/avatars/student1.png',
      totalTime: 45,
      accuracy: 85,
      completedMaterials: 12,
      streak: 7,
      status: 'active',
      concerns: []
    },
    {
      id: 2,
      name: '佐藤花子',
      class: 'A組',
      avatar: '/avatars/student2.png',
      totalTime: 32,
      accuracy: 92,
      completedMaterials: 8,
      streak: 5,
      status: 'active',
      concerns: []
    },
    {
      id: 3,
      name: '山田次郎',
      class: 'B組',
      avatar: '/avatars/student3.png',
      totalTime: 18,
      accuracy: 67,
      completedMaterials: 4,
      streak: 2,
      status: 'inactive',
      concerns: ['学習時間不足', '正答率低下']
    }
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      default: return 'default';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'アクティブ';
      case 'inactive': return '要注意';
      default: return '不明';
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          生徒一覧
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>クラス</InputLabel>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            label="クラス"
          >
            <MenuItem value="all">全て</MenuItem>
            <MenuItem value="A">A組</MenuItem>
            <MenuItem value="B">B組</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>生徒名</TableCell>
              <TableCell>クラス</TableCell>
              <TableCell align="right">学習時間</TableCell>
              <TableCell align="right">正答率</TableCell>
              <TableCell align="right">完了教材</TableCell>
              <TableCell align="right">連続日数</TableCell>
              <TableCell align="center">状態</TableCell>
              <TableCell align="center">アクション</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{ width: 32, height: 32, mr: 1 }}
                      src={student.avatar}
                    >
                      {student.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {student.name}
                      </Typography>
                      {student.concerns.length > 0 && (
                        <Box display="flex" gap={0.5} mt={0.5}>
                          {student.concerns.map((concern, index) => (
                            <Chip
                              key={index}
                              label={concern}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {student.totalTime}分
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {student.accuracy}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={student.accuracy}
                      sx={{ width: 60, height: 6 }}
                      color={student.accuracy >= 80 ? 'success' : 'warning'}
                    />
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Badge badgeContent={student.completedMaterials} color="primary">
                    <AssignmentIcon />
                  </Badge>
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" alignItems="center" justifyContent="flex-end">
                    <StarIcon sx={{ fontSize: 16, color: 'orange', mr: 0.5 }} />
                    <Typography variant="body2">
                      {student.streak}日
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={getStatusLabel(student.status)}
                    color={getStatusColor(student.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="詳細を見る">
                    <IconButton size="small">
                      <PersonIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

// 課題の多い教材一覧
const ProblematicMaterialsCard: React.FC = () => {
  const problematicMaterials = [
    {
      name: '分数の計算',
      category: '数学',
      averageAccuracy: 65,
      studentsStrugglingCount: 8,
      commonMistakes: ['通分のミス', '約分の忘れ']
    },
    {
      name: '英語の発音',
      category: '英語',
      averageAccuracy: 58,
      studentsStrugglingCount: 12,
      commonMistakes: ['th音の発音', 'r音とl音の区別']
    },
    {
      name: '図形の性質',
      category: '数学',
      averageAccuracy: 72,
      studentsStrugglingCount: 5,
      commonMistakes: ['角度の計算', '面積の公式']
    }
  ];
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        課題の多い教材
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        生徒が苦手とする教材とその傾向
      </Typography>
      
      <List>
        {problematicMaterials.map((material, index) => (
          <ListItem key={index} divider>
            <ListItemIcon>
              <FlagIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight="medium">
                    {material.name}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={`${material.averageAccuracy}%`}
                      color="warning"
                      size="small"
                    />
                    <Chip
                      label={`${material.studentsStrugglingCount}人`}
                      color="error"
                      size="small"
                    />
                  </Box>
                </Box>
              }
              secondary={
                <Box mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    よくある間違い: {material.commonMistakes.join(', ')}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

const TeacherView: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
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
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
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
  
  return (
    <Grid container spacing={3}>
      {/* ヘッダー */}
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" gutterBottom>
            教師ダッシュボード
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              startIcon={<DownloadIcon />}
              variant="outlined"
              size="small"
              onClick={() => setIsExportDialogOpen(true)}
            >
              クラスレポート
            </Button>
            <Button
              startIcon={<AssignmentIcon />}
              variant="contained"
              size="small"
            >
              課題作成
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
          <Alert severity="info">
            <AlertTitle>クラス全体の傾向</AlertTitle>
            <Typography variant="body2">
              複数の生徒が同じ分野で苦戦しています。追加の指導が必要かもしれません。
            </Typography>
          </Alert>
        </Grid>
      )}
      
      {/* 統計カード */}
      <Grid item xs={12} sm={6} md={3}>
        <TeacherStatCard
          title="クラス平均学習時間"
          value="32分"
          subtitle="今週の1日平均"
          icon={<TimeIcon />}
          color={theme.palette.primary.main}
          trend={15}
          comparison={{
            label: '目標達成率',
            value: 75
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <TeacherStatCard
          title="アクティブ生徒数"
          value="24人"
          subtitle="今週学習した生徒"
          icon={<GroupIcon />}
          color={theme.palette.success.main}
          comparison={{
            label: '参加率',
            value: 92
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <TeacherStatCard
          title="クラス平均正答率"
          value="78%"
          subtitle="全教材の平均"
          icon={<AssessmentIcon />}
          color={theme.palette.info.main}
          trend={5}
          comparison={{
            label: '目標達成率',
            value: 78
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <TeacherStatCard
          title="要注意生徒数"
          value="3人"
          subtitle="サポートが必要"
          icon={<WarningIcon />}
          color={theme.palette.warning.main}
          comparison={{
            label: '改善率',
            value: 45
          }}
        />
      </Grid>
      
      {/* タブ切り替え */}
      <Grid item xs={12}>
        <Paper sx={{ p: 0 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="概要" />
            <Tab label="生徒一覧" />
            <Tab label="教材分析" />
          </Tabs>
        </Paper>
      </Grid>
      
      {/* タブコンテンツ */}
      {tabValue === 0 && (
        <>
          {/* クラス全体の学習時間推移 */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                クラス全体の学習時間推移
              </Typography>
              <LearningTimeChart data={learningTimeChartData} />
            </Paper>
          </Grid>
          
          {/* 曜日別学習パターン */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                曜日別学習パターン
              </Typography>
              <WeeklyPatternChart data={weeklyPatternData} />
            </Paper>
          </Grid>
          
          {/* 正答率推移 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                クラス平均正答率推移
              </Typography>
              <AccuracyTrendChart data={accuracyChartData} />
            </Paper>
          </Grid>
          
          {/* 課題の多い教材 */}
          <Grid item xs={12} md={6}>
            <ProblematicMaterialsCard />
          </Grid>
        </>
      )}
      
      {tabValue === 1 && (
        <Grid item xs={12}>
          <StudentsTable />
        </Grid>
      )}
      
      {tabValue === 2 && (
        <>
          {/* 教材別進捗 */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                教材別進捗状況
              </Typography>
              <MaterialProgressList
                topMaterials={topAndBottomMaterials.top}
                bottomMaterials={topAndBottomMaterials.bottom}
              />
            </Paper>
          </Grid>
          
          {/* 推奨指導方針 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                推奨指導方針
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrophyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="分数計算の基礎復習"
                    secondary="通分・約分の手順確認"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <GroupIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="グループ学習の推奨"
                    secondary="理解度の高い生徒がサポート"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="個別課題の作成"
                    secondary="各生徒の理解度に応じた課題"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </>
      )}
      
      {/* エクスポートダイアログ */}
      <DataExportDialog
        open={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
    </Grid>
  );
};

export default TeacherView;