/**
 * 分数マスターラボ
 * 統合分数学習教材
 * 
 * 統合対象:
 * - FractionVisualization (基本視覚化)
 * - FractionPizzaCutter (インタラクティブピザ)
 * - FractionMasterTool (高機能統合)
 * - FractionTrainer (総合トレーニング)
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Fade,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  SportsEsports as GameIcon,
  FitnessCenter as TrainingIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  TipsAndUpdates as HintIcon
} from '@mui/icons-material';

// 統合モジュール
import { BasicVisualizationModule } from './modules/BasicVisualizationModule';
import { InteractivePizzaModule } from './modules/InteractivePizzaModule';
import { ComparisonModule } from './modules/ComparisonModule';
import { TrainingModule } from './modules/TrainingModule';

// 共通コンポーネント
import { ProgressTracker } from './components/ProgressTracker';
import { HelpOverlay } from './components/HelpOverlay';

// フック
import { useFractionProgress } from './hooks/useFractionProgress';

// 型定義
interface LearningModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  prerequisites?: string[];
}

interface FractionMasterLabProps {
  onClose: () => void;
}

export const FractionMasterLab: React.FC<FractionMasterLabProps> = ({ onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // 学習進捗管理
  const { 
    progress, 
    completedModules, 
    currentLevel,
    totalScore,
    updateProgress,
    completeModule,
    resetProgress
  } = useFractionProgress();

  // UI状態管理
  const [activeModule, setActiveModule] = useState<string>('overview');
  const [showHelp, setShowHelp] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // 学習モジュール定義
  const learningModules: LearningModule[] = [
    {
      id: 'basic',
      title: 'まなぶモード',
      description: '分数の基本的な意味を視覚的に学習',
      icon: <SchoolIcon />,
      difficulty: 'beginner',
      estimatedTime: 15,
    },
    {
      id: 'interactive',
      title: 'つかうモード',
      description: 'ピザやケーキを使って分数を体験',
      icon: <GameIcon />,
      difficulty: 'beginner',
      estimatedTime: 20,
      prerequisites: ['basic']
    },
    {
      id: 'comparison',
      title: 'くらべるモード',
      description: '分数の大小関係や等価性を理解',
      icon: <PsychologyIcon />,
      difficulty: 'intermediate',
      estimatedTime: 25,
      prerequisites: ['basic', 'interactive']
    },
    {
      id: 'training',
      title: 'とっくんモード',
      description: '分数の計算問題に挑戦',
      icon: <TrainingIcon />,
      difficulty: 'advanced',
      estimatedTime: 30,
      prerequisites: ['basic', 'interactive', 'comparison']
    }
  ];

  // モジュール完了ハンドラー
  const handleModuleComplete = useCallback((moduleId: string, score: number) => {
    completeModule(moduleId, score);
    setShowCelebration(true);
    
    // 次のモジュールが利用可能になったかチェック
    const nextModule = learningModules.find(module => 
      module.prerequisites?.every(prereq => completedModules.includes(prereq))
    );
    
    setTimeout(() => {
      setShowCelebration(false);
      if (nextModule && !completedModules.includes(nextModule.id)) {
        setActiveModule(nextModule.id);
      }
    }, 3000);
  }, [completeModule, completedModules, learningModules]);

  // 推奨学習パスの計算
  const getRecommendedModule = () => {
    return learningModules.find(module => 
      !completedModules.includes(module.id) &&
      (module.prerequisites?.every(prereq => completedModules.includes(prereq)) ?? true)
    );
  };

  // モジュールが利用可能かチェック
  const isModuleAvailable = (module: LearningModule) => {
    return module.prerequisites?.every(prereq => completedModules.includes(prereq)) ?? true;
  };

  // オーバービューコンポーネント
  const OverviewContent = () => {
    const recommendedModule = getRecommendedModule();
    
    return (
      <Box sx={{ p: 3 }}>
        {/* 進捗サマリー */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                学習進捗
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                {completedModules.length} / {learningModules.length} モジュール完了
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(completedModules.length / learningModules.length) * 100}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#fff'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalScore}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  合計スコア
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* 推奨学習 */}
        {recommendedModule && (
          <Paper elevation={1} sx={{ p: 3, mb: 3, border: `2px solid ${theme.palette.primary.main}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HintIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" color="primary">
                次におすすめの学習
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {recommendedModule.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {recommendedModule.description}
                </Typography>
                <Chip 
                  label={`約${recommendedModule.estimatedTime}分`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => setActiveModule(recommendedModule.id)}
                sx={{ flexShrink: 0 }}
              >
                はじめる
              </Button>
            </Box>
          </Paper>
        )}

        {/* 学習モジュール一覧 */}
        <Typography variant="h6" sx={{ mb: 3 }}>
          学習モジュール
        </Typography>
        <Grid container spacing={2}>
          {learningModules.map((module) => {
            const isAvailable = isModuleAvailable(module);
            const isCompleted = completedModules.includes(module.id);
            
            return (
              <Grid item xs={12} sm={6} key={module.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    opacity: isAvailable ? 1 : 0.6,
                    border: isCompleted ? `2px solid ${theme.palette.success.main}` : 'none',
                    cursor: isAvailable ? 'pointer' : 'default',
                    transition: 'all 0.3s ease',
                    '&:hover': isAvailable ? {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    } : {}
                  }}
                  onClick={() => isAvailable && setActiveModule(module.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        color: isCompleted ? theme.palette.success.main : theme.palette.primary.main,
                        mr: 2 
                      }}>
                        {isCompleted ? <CheckCircleIcon /> : module.icon}
                      </Box>
                      <Typography variant="h6">
                        {module.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {module.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={module.difficulty === 'beginner' ? '初級' : 
                               module.difficulty === 'intermediate' ? '中級' : '上級'} 
                        size="small"
                        color={module.difficulty === 'beginner' ? 'success' : 
                               module.difficulty === 'intermediate' ? 'warning' : 'error'}
                        variant="outlined"
                      />
                      <Chip 
                        label={`${module.estimatedTime}分`} 
                        size="small" 
                        variant="outlined" 
                      />
                      {isCompleted && (
                        <Chip 
                          label="完了" 
                          size="small" 
                          color="success" 
                        />
                      )}
                    </Box>
                    {!isAvailable && module.prerequisites && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        前提: {module.prerequisites.map(prereq => 
                          learningModules.find(m => m.id === prereq)?.title
                        ).join(', ')}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // アクティブなモジュールコンテンツを取得
  const getActiveModuleContent = () => {
    switch (activeModule) {
      case 'basic':
        return (
          <BasicVisualizationModule 
            onComplete={(score) => handleModuleComplete('basic', score)}
            onBack={() => setActiveModule('overview')}
          />
        );
      case 'interactive':
        return (
          <InteractivePizzaModule
            onComplete={(score) => handleModuleComplete('interactive', score)}
            onBack={() => setActiveModule('overview')}
          />
        );
      case 'comparison':
        return (
          <ComparisonModule
            onComplete={(score) => handleModuleComplete('comparison', score)}
            onBack={() => setActiveModule('overview')}
          />
        );
      case 'training':
        return (
          <TrainingModule
            onComplete={(score) => handleModuleComplete('training', score)}
            onBack={() => setActiveModule('overview')}
          />
        );
      default:
        return <OverviewContent />;
    }
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* ヘッダー */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" component="h1">
                分数マスターラボ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                10歳の壁を乗り越える！段階的分数学習システム
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<HintIcon />}
              onClick={() => setShowHelp(true)}
              size="small"
            >
              ヘルプ
            </Button>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* メインコンテンツ */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Fade in={true} timeout={500}>
          <Box sx={{ minHeight: '100%' }}>
            {getActiveModuleContent()}
          </Box>
        </Fade>
      </Box>

      {/* 進捗トラッカー */}
      <ProgressTracker 
        totalModules={learningModules.length}
        completedModules={completedModules.length}
        currentScore={totalScore}
      />

      {/* ヘルプオーバーレイ */}
      <HelpOverlay 
        open={showHelp}
        onClose={() => setShowHelp(false)}
        modules={learningModules}
      />

      {/* 完了お祝いダイアログ */}
      <Dialog open={showCelebration} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            おめでとうございます！
          </Typography>
          <Typography variant="body1" color="text.secondary">
            モジュールを完了しました！次の学習に進みましょう。
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};