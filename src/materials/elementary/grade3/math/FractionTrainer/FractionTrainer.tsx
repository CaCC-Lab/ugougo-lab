/**
 * 分数計算トレーナー - メインコンポーネント
 * 
 * 小学3年生〜中学生向けの分数学習教材
 * 視覚的理解から実生活応用まで段階的に学習
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  School as SchoolIcon,
  Visibility as VisualIcon,
  Calculate as CalculateIcon,
  CompareArrows as ConvertIcon,
  Public as RealWorldIcon,
  EmojiEvents as TrophyIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  PlayArrow as StartIcon,
  Assessment as ProgressIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// コンポーネントのインポート
import { FractionVisualizer } from './components/FractionVisualizer';
import { FractionCalculator } from './components/FractionCalculator';
import { FractionConverter } from './components/FractionConverter';
import { RealWorldProblems } from './components/RealWorldProblems';

// フックとデータのインポート
import { useFractionLogic } from './hooks/useFractionLogic';
import {
  conceptProblems,
  equivalentProblems,
  comparisonProblems,
  additionProblems,
  subtractionProblems,
  multiplicationProblems,
  divisionProblems,
  applicationProblems,
  getRandomProblem
} from './data/fractionProblems';

// 型のインポート
import type {
  LearningMode,
  FractionProblem,
  VisualizationType,
  CalculatorConfig,
  Fraction
} from './types';

/**
 * タブパネルコンポーネント
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`fraction-tabpanel-${index}`}
      aria-labelledby={`fraction-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
};

/**
 * メインコンポーネント
 */
const FractionTrainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMode, setSelectedMode] = useState<LearningMode>('concept');
  const [selectedProblem, setSelectedProblem] = useState<FractionProblem | null>(null);
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('circle');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [calculatorConfig, setCalculatorConfig] = useState<CalculatorConfig>({
    showSteps: true,
    showVisuals: true,
    autoSimplify: true,
    allowMixedNumbers: true,
    allowNegatives: false,
    maxValue: 100,
    difficulty: 'normal',
    hintLevel: 'minimal',
    animationSpeed: 'normal',
    enableEffects: true
  });
  
  // カスタムフックの使用
  const {
    currentProblem,
    userAnswer,
    validationResult,
    showHints,
    currentHintIndex,
    currentStep,
    progress,
    setProblem,
    setUserAnswer,
    validateAnswer,
    showNextHint,
    formatFraction,
    canShowMoreHints,
    elapsedTime
  } = useFractionLogic();
  
  // モード情報
  const modeInfo: Record<LearningMode, { title: string; icon: React.ReactNode; color: string; description: string }> = {
    concept: { 
      title: '概念理解', 
      icon: <SchoolIcon />, 
      color: '#3498DB',
      description: '分数の基本概念を視覚的に理解'
    },
    representation: { 
      title: '表現', 
      icon: <VisualIcon />, 
      color: '#9B59B6',
      description: '図形や数直線での表現方法'
    },
    equivalent: { 
      title: '等しい分数', 
      icon: <ConvertIcon />, 
      color: '#1ABC9C',
      description: '約分・通分の練習'
    },
    comparison: { 
      title: '大小比較', 
      icon: <CalculateIcon />, 
      color: '#F39C12',
      description: '分数の大きさを比べる'
    },
    addition: { 
      title: '足し算', 
      icon: <CalculateIcon />, 
      color: '#2ECC71',
      description: '分数の足し算をマスター'
    },
    subtraction: { 
      title: '引き算', 
      icon: <CalculateIcon />, 
      color: '#E74C3C',
      description: '分数の引き算をマスター'
    },
    multiplication: { 
      title: 'かけ算', 
      icon: <CalculateIcon />, 
      color: '#34495E',
      description: '分数のかけ算をマスター'
    },
    division: { 
      title: 'わり算', 
      icon: <CalculateIcon />, 
      color: '#16A085',
      description: '分数のわり算をマスター'
    },
    mixed: { 
      title: '帯分数', 
      icon: <ConvertIcon />, 
      color: '#8E44AD',
      description: '帯分数と仮分数の変換'
    },
    application: { 
      title: '応用問題', 
      icon: <RealWorldIcon />, 
      color: '#D35400',
      description: '実生活での活用'
    }
  };
  
  /**
   * 問題を選択
   */
  const selectProblem = (problem: FractionProblem) => {
    setSelectedProblem(problem);
    setProblem(problem);
    setActiveTab(2); // 問題解決タブに切り替え
  };
  
  /**
   * ランダム問題を開始
   */
  const startRandomProblem = () => {
    const problem = getRandomProblem({ mode: selectedMode });
    selectProblem(problem);
  };
  
  /**
   * 時間をフォーマット
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  /**
   * 進捗率を計算
   */
  const calculateProgress = (): number => {
    if (!progress || !progress.statistics || !progress.statistics.totalProblems) return 0;
    return (progress.statistics.correctAnswers / progress.statistics.totalProblems) * 100;
  };
  
  /**
   * 習熟度の色を取得
   */
  const getMasteryColor = (value: number): string => {
    if (value >= 80) return '#2ECC71';
    if (value >= 60) return '#F39C12';
    return '#E74C3C';
  };
  
  /**
   * 正解時の処理
   */
  useEffect(() => {
    if (validationResult?.isCorrect) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  }, [validationResult]);
  
  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
      <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* ヘッダー */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} sm={true}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon color="primary" />
                分数計算トレーナー
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  icon={<ProgressIcon />}
                  label={`正答率: ${calculateProgress().toFixed(0)}%`}
                  color={calculateProgress() >= 70 ? 'success' : 'default'}
                />
                <Chip
                  icon={<TrophyIcon />}
                  label={`習熟度: ${progress?.mastery?.overall?.toFixed(0) || 0}%`}
                  sx={{
                    backgroundColor: getMasteryColor(progress?.mastery?.overall || 0),
                    color: 'white'
                  }}
                />
                {currentProblem && (
                  <Chip
                    icon={<TimerIcon />}
                    label={formatTime(elapsedTime)}
                    variant="outlined"
                  />
                )}
                <Tooltip title="設定">
                  <IconButton onClick={() => setSettingsOpen(true)}>
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* タブ */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="ホーム" icon={<HomeIcon />} iconPosition="start" />
            <Tab label="視覚化" icon={<VisualIcon />} iconPosition="start" />
            <Tab
              label="問題に挑戦"
              icon={
                <Badge badgeContent={currentProblem ? 1 : 0} color="primary">
                  <SchoolIcon />
                </Badge>
              }
              iconPosition="start"
            />
            <Tab label="計算機" icon={<CalculateIcon />} iconPosition="start" />
            <Tab label="変換練習" icon={<ConvertIcon />} iconPosition="start" />
            <Tab label="実生活" icon={<RealWorldIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        {/* コンテンツ */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
              {/* モード選択 */}
              <Typography variant="h6" gutterBottom>
                学習モードを選択
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {Object.entries(modeInfo).map(([mode, info]) => (
                  <Grid item xs={12} sm={6} md={3} key={mode}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          border: selectedMode === mode ? 2 : 0,
                          borderColor: 'primary.main',
                          transition: 'all 0.3s',
                          '&:hover': {
                            boxShadow: 4
                          }
                        }}
                        onClick={() => setSelectedMode(mode as LearningMode)}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 2,
                              color: info.color
                            }}
                          >
                            {info.icon}
                            <Typography variant="h6">
                              {info.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {info.description}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={
                                progress?.statistics?.byMode?.[mode as LearningMode]
                                  ? (progress.statistics.byMode[mode as LearningMode].correct /
                                     Math.max(1, progress.statistics.byMode[mode as LearningMode].attempted)) * 100
                                  : 0
                              }
                              sx={{
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: info.color
                                }
                              }}
                            />
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            startIcon={<StartIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMode(mode as LearningMode);
                              startRandomProblem();
                            }}
                          >
                            開始
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
              
              {/* スキル状況 */}
              <Typography variant="h6" gutterBottom>
                スキル習得状況
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(progress?.skills || {}).map(([skill, acquired]) => (
                  <Grid item key={skill}>
                    <Chip
                      label={skill.replace(/([A-Z])/g, ' $1').trim()}
                      color={acquired ? 'success' : 'default'}
                      variant={acquired ? 'filled' : 'outlined'}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ p: 3, height: '100%' }}>
              {selectedProblem && selectedProblem.fractions && selectedProblem.fractions[0] ? (
                <FractionVisualizer
                  fraction={selectedProblem.fractions[0]}
                  visualizationType={visualizationType}
                  onVisualizationChange={setVisualizationType}
                  showLabels={true}
                  interactive={true}
                  size="large"
                  animationSpeed={calculatorConfig.animationSpeed}
                />
              ) : (
                <FractionVisualizer
                  fraction={{ numerator: 3, denominator: 4, wholeNumber: 0, isNegative: false }}
                  visualizationType={visualizationType}
                  onVisualizationChange={setVisualizationType}
                  showLabels={true}
                  interactive={true}
                  size="large"
                  animationSpeed={calculatorConfig.animationSpeed}
                />
              )}
            </Box>
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 3, height: '100%' }}>
              {currentProblem ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {currentProblem.title}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {currentProblem.description}
                        </Typography>
                        <Alert severity="info">
                          <Typography variant="body1">
                            {currentProblem.question}
                          </Typography>
                        </Alert>
                        
                        {/* 分数表示 */}
                        {currentProblem.fractions.length > 0 && (
                          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                            {currentProblem.fractions.map((fraction, index) => (
                              <Chip
                                key={index}
                                label={formatFraction(fraction)}
                                sx={{ fontSize: '1.2rem', p: 2 }}
                              />
                            ))}
                          </Box>
                        )}
                        
                        {/* 答え入力 */}
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            あなたの答え:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              label="分子"
                              type="number"
                              value={userAnswer?.numerator || ''}
                              onChange={(e) => setUserAnswer({
                                ...userAnswer!,
                                numerator: parseInt(e.target.value) || 0,
                                denominator: userAnswer?.denominator || 1,
                                wholeNumber: userAnswer?.wholeNumber || 0,
                                isNegative: false
                              })}
                              sx={{ width: 100 }}
                            />
                            <Typography variant="h5">/</Typography>
                            <TextField
                              label="分母"
                              type="number"
                              value={userAnswer?.denominator || ''}
                              onChange={(e) => setUserAnswer({
                                ...userAnswer!,
                                numerator: userAnswer?.numerator || 0,
                                denominator: parseInt(e.target.value) || 1,
                                wholeNumber: userAnswer?.wholeNumber || 0,
                                isNegative: false
                              })}
                              sx={{ width: 100 }}
                            />
                            <Button
                              variant="contained"
                              onClick={() => validateAnswer(userAnswer!)}
                              disabled={!userAnswer || userAnswer.denominator === 0}
                            >
                              確認
                            </Button>
                          </Box>
                        </Box>
                        
                        {/* ヒント */}
                        {showHints && (
                          <Box sx={{ mt: 2 }}>
                            <Alert severity="info">
                              {currentProblem.hints[currentHintIndex]}
                            </Alert>
                          </Box>
                        )}
                        
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={showNextHint}
                            disabled={!canShowMoreHints}
                          >
                            ヒントを見る ({currentHintIndex + 1}/{currentProblem.hints.length})
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    {currentProblem.visualization && currentProblem.fractions && currentProblem.fractions[0] && (
                      <FractionVisualizer
                        fraction={currentProblem.fractions[0]}
                        visualizationType={currentProblem.visualization.type}
                        showLabels={true}
                        interactive={false}
                        size="medium"
                      />
                    )}
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    問題が選択されていません
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<StartIcon />}
                    onClick={startRandomProblem}
                  >
                    問題を始める
                  </Button>
                </Box>
              )}
            </Box>
          </TabPanel>
          
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ p: 3, height: '100%' }}>
              <FractionCalculator
                showSteps={calculatorConfig.showSteps}
                allowMixedNumbers={calculatorConfig.allowMixedNumbers}
                autoSimplify={calculatorConfig.autoSimplify}
                maxValue={calculatorConfig.maxValue}
              />
            </Box>
          </TabPanel>
          
          <TabPanel value={activeTab} index={4}>
            <Box sx={{ p: 3, height: '100%' }}>
              <FractionConverter
                mode="all"
                showHints={calculatorConfig.hintLevel !== 'none'}
                showFactors={true}
                practiceMode={true}
              />
            </Box>
          </TabPanel>
          
          <TabPanel value={activeTab} index={5}>
            <Box sx={{ p: 3, height: '100%' }}>
              <RealWorldProblems
                category="all"
                difficulty={calculatorConfig.difficulty === 'easy' ? 2 : calculatorConfig.difficulty === 'hard' ? 4 : 3}
                showVisuals={calculatorConfig.showVisuals}
                showStepByStep={calculatorConfig.showSteps}
              />
            </Box>
          </TabPanel>
        </Box>
        
        {/* 設定ダイアログ */}
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>設定</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>難易度</InputLabel>
                  <Select
                    value={calculatorConfig.difficulty}
                    onChange={(e) => setCalculatorConfig({
                      ...calculatorConfig,
                      difficulty: e.target.value as 'easy' | 'normal' | 'hard'
                    })}
                    label="難易度"
                  >
                    <MenuItem value="easy">やさしい</MenuItem>
                    <MenuItem value="normal">普通</MenuItem>
                    <MenuItem value="hard">難しい</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>ヒントレベル</InputLabel>
                  <Select
                    value={calculatorConfig.hintLevel}
                    onChange={(e) => setCalculatorConfig({
                      ...calculatorConfig,
                      hintLevel: e.target.value as 'none' | 'minimal' | 'detailed'
                    })}
                    label="ヒントレベル"
                  >
                    <MenuItem value="none">なし</MenuItem>
                    <MenuItem value="minimal">最小限</MenuItem>
                    <MenuItem value="detailed">詳細</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>アニメーション速度</InputLabel>
                  <Select
                    value={calculatorConfig.animationSpeed}
                    onChange={(e) => setCalculatorConfig({
                      ...calculatorConfig,
                      animationSpeed: e.target.value as 'slow' | 'normal' | 'fast'
                    })}
                    label="アニメーション速度"
                  >
                    <MenuItem value="slow">遅い</MenuItem>
                    <MenuItem value="normal">普通</MenuItem>
                    <MenuItem value="fast">速い</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>閉じる</Button>
          </DialogActions>
        </Dialog>
        
        {/* 成功通知 */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            🎉 正解！素晴らしい！
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default FractionTrainer;