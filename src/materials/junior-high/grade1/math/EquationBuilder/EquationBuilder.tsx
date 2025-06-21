/**
 * 一次方程式ビルダー - メインコンポーネント
 * 
 * 中学1年生向けの一次方程式学習教材
 * 天秤のメタファーで等式の性質を理解し、
 * 段階的に一次方程式の解法を学習
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge
} from '@mui/material';
import {
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Calculate as CalculateIcon,
  Description as DescriptionIcon,
  EmojiEvents as TrophyIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// コンポーネントのインポート
import { BalanceVisualizer } from './components/BalanceVisualizer';
import { EquationSolver } from './components/EquationSolver';
import { WordProblemInterface } from './components/WordProblemInterface';

// フックとデータのインポート
import { useEquationLogic } from './hooks/useEquationLogic';
import {
  conceptProblems,
  basicProblems,
  intermediateProblems,
  advancedProblems,
  wordProblems,
  getRandomProblem,
  getProblemsByMode
} from './data/equationProblems';

// 型のインポート
import type { LearningMode, EquationProblem, EquationBuilderConfig } from './types';

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
      id={`equation-tabpanel-${index}`}
      aria-labelledby={`equation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
};

/**
 * メインコンポーネント
 */
const EquationBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMode, setSelectedMode] = useState<LearningMode>('concept');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<EquationProblem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [config, setConfig] = useState<EquationBuilderConfig>({
    showBalance: true,
    showSteps: true,
    showHints: true,
    animationSpeed: 'normal',
    enableEffects: true,
    difficulty: 'normal',
    allowUndo: true,
    autoCheck: false,
    enableSound: true,
    readProblems: false
  });
  
  // カスタムフックの使用
  const {
    currentProblem,
    currentEquation,
    balanceState,
    transformationHistory,
    validationResult,
    userAnswer,
    showHints,
    currentHintIndex,
    progress,
    dragDropState,
    setProblem,
    applyOperation,
    validateAnswer,
    setUserAnswer,
    showNextHint,
    undo,
    redo,
    startDrag,
    dragOver,
    drop,
    canShowMoreHints,
    elapsedTime
  } = useEquationLogic();
  
  // モード情報
  const modeInfo: Record<LearningMode, { title: string; icon: React.ReactNode; color: string }> = {
    concept: { title: '概念理解', icon: <PsychologyIcon />, color: '#3498DB' },
    basic: { title: '基本形', icon: <SchoolIcon />, color: '#2ECC71' },
    intermediate: { title: '中級', icon: <CalculateIcon />, color: '#F39C12' },
    advanced: { title: '上級', icon: <StarIcon />, color: '#E74C3C' },
    fraction: { title: '分数', icon: <CalculateIcon />, color: '#9B59B6' },
    negative: { title: '負の数', icon: <CalculateIcon />, color: '#1ABC9C' },
    wordProblem: { title: '文章題', icon: <DescriptionIcon />, color: '#34495E' },
    challenge: { title: 'チャレンジ', icon: <TrophyIcon />, color: '#E67E22' }
  };
  
  /**
   * 問題を選択
   */
  const selectProblem = (problem: EquationProblem) => {
    setSelectedProblem(problem);
    setProblem(problem);
    setActiveTab(1); // 解法タブに切り替え
  };
  
  /**
   * 新しい問題を開始
   */
  const startNewProblem = () => {
    const problem = getRandomProblem({ mode: selectedMode });
    selectProblem(problem);
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
  
  /**
   * 進捗率の計算
   */
  const calculateProgress = (): number => {
    if (!progress || !progress.problemStats || !progress.problemStats.total) return 0;
    return (progress.problemStats.correct / progress.problemStats.total) * 100;
  };
  
  /**
   * 習熟度の表示色
   */
  const getMasteryColor = (value: number): string => {
    if (value >= 80) return '#2ECC71';
    if (value >= 60) return '#F39C12';
    return '#E74C3C';
  };
  
  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
      <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* ヘッダー */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} sm={true}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon color="primary" />
                一次方程式ビルダー
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  icon={<TimelineIcon />}
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
            <Tab label="問題選択" icon={<HomeIcon />} iconPosition="start" />
            <Tab
              label="解法"
              icon={
                <Badge badgeContent={currentProblem ? 1 : 0} color="primary">
                  <CalculateIcon />
                </Badge>
              }
              iconPosition="start"
              disabled={!currentProblem}
            />
            <Tab
              label="天秤"
              icon={<PsychologyIcon />}
              iconPosition="start"
              disabled={!currentProblem || !config.showBalance}
            />
            <Tab
              label="文章題"
              icon={<DescriptionIcon />}
              iconPosition="start"
              disabled={!currentProblem || currentProblem.mode !== 'wordProblem'}
            />
          </Tabs>
        </Box>
        
        {/* コンテンツ */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
              {/* モード選択 */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>学習モード</InputLabel>
                    <Select
                      value={selectedMode}
                      onChange={(e) => setSelectedMode(e.target.value as LearningMode)}
                      label="学習モード"
                    >
                      {Object.entries(modeInfo).map(([mode, info]) => (
                        <MenuItem key={mode} value={mode}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {info.icon}
                            {info.title}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* 問題カード */}
                {getProblemsByMode(selectedMode).map((problem) => (
                  <Grid item xs={12} sm={6} md={4} key={problem.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                        onClick={() => selectProblem(problem)}
                      >
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {problem.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {problem.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {problem.tags.map((tag) => (
                              <Chip key={tag} label={tag} size="small" />
                            ))}
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            startIcon={<PlayIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectProblem(problem);
                            }}
                          >
                            開始
                          </Button>
                          <Box sx={{ ml: 'auto' }}>
                            {[...Array(problem.difficulty)].map((_, i) => (
                              <StarIcon
                                key={i}
                                sx={{ fontSize: 16, color: '#F39C12' }}
                              />
                            ))}
                          </Box>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
                
                {/* ランダム問題 */}
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<RefreshIcon />}
                      onClick={startNewProblem}
                    >
                      ランダムに問題を選ぶ
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            {currentProblem && currentEquation && (
              <EquationSolver
                equation={currentEquation}
                history={transformationHistory}
                validationResult={validationResult}
                onApplyOperation={applyOperation}
                onValidateAnswer={validateAnswer}
                onUndo={undo}
                onRedo={redo}
                onShowHint={showNextHint}
                hints={currentProblem.hints}
                currentHintIndex={currentHintIndex}
                showHints={showHints}
                canShowMoreHints={canShowMoreHints}
              />
            )}
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            {config.showBalance && (
              <BalanceVisualizer
                balanceState={balanceState}
                dragDropState={dragDropState}
                onStartDrag={startDrag}
                onDragOver={dragOver}
                onDrop={drop}
                showValues={true}
                animationSpeed={config.animationSpeed}
              />
            )}
          </TabPanel>
          
          <TabPanel value={activeTab} index={3}>
            {currentProblem && currentProblem.mode === 'wordProblem' && (
              <WordProblemInterface
                problem={currentProblem}
                onEquationBuilt={(equation) => {
                  // 方程式が作成されたら解法タブに移動
                  setActiveTab(1);
                }}
                onShowHint={showNextHint}
              />
            )}
          </TabPanel>
        </Box>
        
        {/* 設定ダイアログ */}
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>設定</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>アニメーション速度</InputLabel>
                  <Select
                    value={config.animationSpeed}
                    onChange={(e) => setConfig({ ...config, animationSpeed: e.target.value as 'slow' | 'normal' | 'fast' })}
                    label="アニメーション速度"
                  >
                    <MenuItem value="slow">遅い</MenuItem>
                    <MenuItem value="normal">普通</MenuItem>
                    <MenuItem value="fast">速い</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>難易度</InputLabel>
                  <Select
                    value={config.difficulty}
                    onChange={(e) => setConfig({ ...config, difficulty: e.target.value as 'easy' | 'normal' | 'hard' })}
                    label="難易度"
                  >
                    <MenuItem value="easy">やさしい</MenuItem>
                    <MenuItem value="normal">普通</MenuItem>
                    <MenuItem value="hard">難しい</MenuItem>
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

export default EquationBuilder;