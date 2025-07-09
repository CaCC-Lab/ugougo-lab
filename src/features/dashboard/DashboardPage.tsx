import React, { Suspense, lazy, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Fade,
  Button,
  IconButton
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useDashboardStore } from './stores/dashboardStore';
import { useLearningAnalytics } from './hooks/useLearningAnalytics';
import TimeRangeFilter from './components/TimeRangeFilter';
import RoleSelector from './components/RoleSelector';
import DataExportDialog from './components/export/DataExportDialog';

// ビューの遅延読み込み
const StudentView = lazy(() => import('./views/StudentView'));
const ParentView = lazy(() => import('./views/ParentView'));
const TeacherView = lazy(() => import('./views/TeacherView'));

// ローディングコンポーネント
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="400px"
  >
    <CircularProgress size={48} />
  </Box>
);

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  const { selectedRole, error } = useDashboardStore();
  const { summary, isLoading } = useLearningAnalytics();
  
  // 役割に応じたビューの選択
  const renderView = () => {
    switch (selectedRole) {
      case 'student':
        return <StudentView />;
      case 'parent':
        return <ParentView />;
      case 'teacher':
        return <TeacherView />;
      default:
        return <StudentView />;
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* ヘッダー部分 */}
      <Fade in timeout={600}>
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                学習分析ダッシュボード
              </Typography>
              
              {summary && !isLoading && (
                <Typography variant="body1" color="text.secondary">
                  総学習時間: {summary.totalHours}時間 | 
                  連続学習: {summary.streakDays}日 | 
                  平均正答率: {summary.averageAccuracy}%
                </Typography>
              )}
            </Box>
            
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => setIsExportDialogOpen(true)}
                size={isMobile ? 'small' : 'medium'}
              >
                エクスポート
              </Button>
              <IconButton color="primary">
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Fade>
      
      {/* コントロール部分 */}
      <Fade in timeout={800}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mb: 3,
            background: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <RoleSelector />
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <TimeRangeFilter />
            </Grid>
          </Grid>
        </Paper>
      </Fade>
      
      {/* エラー表示 */}
      {error && (
        <Fade in timeout={300}>
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => useDashboardStore.getState().clearError()}>
            {error}
          </Alert>
        </Fade>
      )}
      
      {/* メインコンテンツ */}
      <Fade in timeout={1000}>
        <Box>
          <Suspense fallback={<LoadingFallback />}>
            {renderView()}
          </Suspense>
        </Box>
      </Fade>
      
      {/* エクスポートダイアログ */}
      <DataExportDialog
        open={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
    </Container>
  );
};