import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  useTheme,
  alpha,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useDashboardStore } from '../stores/dashboardStore';
import { type LearningGoal } from '../types';

const GoalTracker: React.FC = () => {
  const theme = useTheme();
  const { goals, addGoal, updateGoal, deleteGoal } = useDashboardStore();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<LearningGoal | null>(null);
  const [goalForm, setGoalForm] = React.useState({
    title: '',
    description: '',
    targetValue: 0,
    unit: '',
    category: 'time' as LearningGoal['category'],
    deadline: ''
  });

  const resetForm = () => {
    setGoalForm({
      title: '',
      description: '',
      targetValue: 0,
      unit: '',
      category: 'time',
      deadline: ''
    });
    setEditingGoal(null);
  };

  const handleOpenDialog = (goal?: LearningGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalForm({
        title: goal.title,
        description: goal.description,
        targetValue: goal.targetValue,
        unit: goal.unit,
        category: goal.category,
        deadline: goal.deadline.toISOString().split('T')[0]
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSaveGoal = () => {
    const goalData = {
      ...goalForm,
      deadline: new Date(goalForm.deadline),
      currentValue: editingGoal?.currentValue || 0,
      isCompleted: editingGoal?.isCompleted || false,
      status: editingGoal?.status || 'not-started' as LearningGoal['status']
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
    } else {
      addGoal(goalData);
    }

    setDialogOpen(false);
    resetForm();
  };

  const getCategoryIcon = (category: LearningGoal['category']) => {
    switch (category) {
      case 'time':
        return <ScheduleIcon />;
      case 'accuracy':
        return <TrendingUpIcon />;
      case 'materials':
        return <FlagIcon />;
      case 'streak':
        return <CheckIcon />;
      default:
        return <FlagIcon />;
    }
  };

  const getCategoryLabel = (category: LearningGoal['category']) => {
    switch (category) {
      case 'time':
        return '学習時間';
      case 'accuracy':
        return '正答率';
      case 'materials':
        return '教材数';
      case 'streak':
        return '連続日数';
      default:
        return 'その他';
    }
  };

  const getCategoryColor = (category: LearningGoal['category']) => {
    switch (category) {
      case 'time':
        return theme.palette.primary.main;
      case 'accuracy':
        return theme.palette.success.main;
      case 'materials':
        return theme.palette.warning.main;
      case 'streak':
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getProgressPercentage = (goal: LearningGoal) => {
    return Math.min(100, (goal.currentValue / goal.targetValue) * 100);
  };

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusChip = (goal: LearningGoal) => {
    if (goal.isCompleted) {
      return (
        <Chip
          size="small"
          label="達成"
          color="success"
          variant="filled"
          icon={<CheckIcon />}
        />
      );
    }

    const daysRemaining = getDaysRemaining(goal.deadline);
    if (daysRemaining < 0) {
      return (
        <Chip
          size="small"
          label="期限切れ"
          color="error"
          variant="filled"
        />
      );
    }

    if (daysRemaining <= 7) {
      return (
        <Chip
          size="small"
          label={`残り${daysRemaining}日`}
          color="warning"
          variant="filled"
        />
      );
    }

    return (
      <Chip
        size="small"
        label={`残り${daysRemaining}日`}
        variant="outlined"
      />
    );
  };

  return (
    <Box>
      {/* ヘッダー */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          学習目標
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none' }}
        >
          目標を追加
        </Button>
      </Box>

      {/* 目標リスト */}
      <Stack spacing={2}>
        {goals.map((goal) => {
          const progress = getProgressPercentage(goal);
          const categoryColor = getCategoryColor(goal.category);

          return (
            <Card
              key={goal.id}
              sx={{
                borderLeft: `4px solid ${categoryColor}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Box
                        sx={{
                          color: categoryColor,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {getCategoryIcon(goal.category)}
                      </Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {goal.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={getCategoryLabel(goal.category)}
                        sx={{
                          backgroundColor: alpha(categoryColor, 0.1),
                          color: categoryColor,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {goal.description}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" gap={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(goal)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteGoal(goal.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* 進捗バー */}
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight="medium">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(categoryColor, 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: categoryColor,
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>

                {/* ステータス */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  {getStatusChip(goal)}
                  <Typography variant="caption" color="text.secondary">
                    開始日: {goal.createdAt.toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* 空状態 */}
      {goals.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            backgroundColor: alpha(theme.palette.grey[100], 0.3),
            borderRadius: 2,
            border: `2px dashed ${theme.palette.divider}`
          }}
        >
          <FlagIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }} />
          <Typography variant="body1" color="text.secondary" mb={2}>
            まだ学習目標が設定されていません
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ textTransform: 'none' }}
          >
            最初の目標を設定する
          </Button>
        </Box>
      )}

      {/* 目標作成・編集ダイアログ */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingGoal ? '目標を編集' : '新しい目標を作成'}
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="目標名"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
              fullWidth
              placeholder="例: 数学の習熟度向上"
            />
            
            <TextField
              label="詳細説明"
              value={goalForm.description}
              onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="目標の詳細を入力してください"
            />
            
            <FormControl fullWidth>
              <InputLabel>カテゴリー</InputLabel>
              <Select
                value={goalForm.category}
                onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value as LearningGoal['category'] })}
              >
                <MenuItem value="time">学習時間</MenuItem>
                <MenuItem value="accuracy">正答率</MenuItem>
                <MenuItem value="materials">教材数</MenuItem>
                <MenuItem value="streak">連続日数</MenuItem>
              </Select>
            </FormControl>
            
            <Box display="flex" gap={2}>
              <TextField
                label="目標値"
                type="number"
                value={goalForm.targetValue}
                onChange={(e) => setGoalForm({ ...goalForm, targetValue: Number(e.target.value) })}
                sx={{ flex: 2 }}
              />
              <TextField
                label="単位"
                value={goalForm.unit}
                onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                placeholder="時間、%、個など"
                sx={{ flex: 1 }}
              />
            </Box>
            
            <TextField
              label="期限"
              type="date"
              value={goalForm.deadline}
              onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            キャンセル
          </Button>
          <Button
            onClick={handleSaveGoal}
            variant="contained"
            disabled={!goalForm.title || !goalForm.deadline || goalForm.targetValue <= 0}
          >
            {editingGoal ? '更新' : '作成'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoalTracker;