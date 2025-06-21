/**
 * 割合・百分率トレーナー - メインコンポーネント
 * 
 * 小学5-6年生・中学生向けの割合・百分率学習教材
 * 視覚的・体験的に割合の概念を理解できる総合学習システム
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Fade,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  School as ConceptIcon,
  Calculate as CalculateIcon,
  SwapHoriz as ConversionIcon,
  PieChart as GraphIcon,
  CompareArrows as CompareIcon,
  Store as RealWorldIcon,
  EmojiEvents as TrophyIcon,
  Info as InfoIcon,
  RestartAlt as RestartIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// コンポーネントのインポート
import { VisualPercentage } from './components/VisualPercentage';
import { PercentageCalculator } from './components/PercentageCalculator';
import { GraphRepresentation } from './components/GraphRepresentation';
import { RealWorldScenarios } from './components/RealWorldScenarios';

// フックとデータのインポート
import { usePercentageLogic } from './hooks/usePercentageLogic';
import {
  conceptProblems,
  calculationProblems,
  conversionProblems,
  shoppingScenario,
  statisticsScenario,
  getRandomProblem
} from './data/percentageProblems';

// 型のインポート
import type { LearningMode, PercentageTrainerConfig } from './types';

// 学習モードの定義
const learningModes = [
  {
    id: 'concept' as LearningMode,
    label: '概念理解',
    icon: ConceptIcon,
    color: '#FF6B6B',
    description: '割合の基本概念を視覚的に理解しよう'
  },
  {
    id: 'calculation' as LearningMode,
    label: '計算練習',
    icon: CalculateIcon,
    color: '#4ECDC4',
    description: '3つの要素から1つを求める練習'
  },
  {
    id: 'conversion' as LearningMode,
    label: '変換練習',
    icon: ConversionIcon,
    color: '#45B7D1',
    description: '百分率⇔小数⇔分数⇔歩合の変換'
  },
  {
    id: 'graph' as LearningMode,
    label: 'グラフ表現',
    icon: GraphIcon,
    color: '#96CEB4',
    description: '円グラフや棒グラフで割合を表現'
  },
  {
    id: 'realWorld' as LearningMode,
    label: '実生活応用',
    icon: RealWorldIcon,
    color: '#DDA0DD',
    description: '買い物や統計など実際の場面で活用'
  }
];

export const PercentageTrainer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // カスタムフックの使用
  const {
    currentMode,
    currentProblem,
    userAnswer,
    feedback,
    showHint,
    currentHintIndex,
    attempts,
    progress,
    graphData,
    setUserAnswer,
    checkAnswer,
    changeMode,
    setNewProblem,
    showNextHint,
    generateGraphData,
    calculatePercentageElements,
    conversionUtils
  } = usePercentageLogic();
  
  // ローカル状態
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<PercentageTrainerConfig>({
    showDecimals: true,
    decimalPlaces: 2,
    defaultGraphType: 'pie',
    animateGraphs: true,
    difficulty: 'normal',
    enableHints: true,
    showStepByStep: true,
    enableSound: true,
    readProblems: false
  });
  
  // 視覚的表現用の要素
  const [visualElements, setVisualElements] = useState(
    calculatePercentageElements({ baseAmount: 100, compareAmount: 25 })
  );
  
  // 初回アクセス時のウェルカムメッセージ
  useEffect(() => {
    const hasVisited = localStorage.getItem('percentageTrainer_visited');
    if (hasVisited) {
      setShowWelcome(false);
    }
  }, []);
  
  // ウェルカムメッセージを閉じる
  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('percentageTrainer_visited', 'true');
  };
  
  // 学習モードの変更
  const handleModeChange = (mode: LearningMode) => {
    changeMode(mode);
    setSelectedTab(learningModes.findIndex(m => m.id === mode));
    
    // モードに応じた初期問題を設定
    switch (mode) {
      case 'concept':
        setNewProblem(conceptProblems[0]);
        break;
      case 'calculation':
        setNewProblem(getRandomProblem({ type: 'findPercentage' }));
        break;
      case 'conversion':
        setNewProblem(conversionProblems[0]);
        break;
      case 'graph':
        // グラフモードは問題なし
        break;
      case 'realWorld':
        // 実生活モードは別途管理
        break;
    }
  };
  
  // 新しい問題を生成
  const handleNewProblem = () => {
    if (currentMode === 'calculation') {
      setNewProblem(getRandomProblem());
    } else if (currentMode === 'conversion') {
      setNewProblem(getRandomProblem({ type: 'findPercentage' }));
    } else if (currentMode === 'concept') {
      const nextIndex = conceptProblems.findIndex(p => p.id === currentProblem?.id) + 1;
      if (nextIndex < conceptProblems.length) {
        setNewProblem(conceptProblems[nextIndex]);
      } else {
        setNewProblem(conceptProblems[0]);
      }
    }
  };
  
  // 習熟度の計算
  const getMasteryLevel = () => {
    const { mastery } = progress;
    if (mastery.overall >= 80) return { level: '達人', color: 'success' };
    if (mastery.overall >= 60) return { level: '上級', color: 'info' };
    if (mastery.overall >= 40) return { level: '中級', color: 'warning' };
    return { level: '初級', color: 'error' };
  };
  
  // モードごとのコンテンツをレンダリング
  const renderModeContent = () => {
    switch (currentMode) {
      case 'concept':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              割合の概念を理解しよう
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <VisualPercentage
                  elements={visualElements}
                  interactive={true}
                  showValues={true}
                  showAnimation={true}
                  onElementChange={setVisualElements}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                {currentProblem && (
                  <PercentageCalculator
                    problem={currentProblem}
                    onAnswer={checkAnswer}
                    onNewProblem={handleNewProblem}
                    showHint={showHint}
                    currentHintIndex={currentHintIndex}
                    onShowNextHint={showNextHint}
                    showStepByStep={config.showStepByStep}
                  />
                )}
              </Grid>
            </Grid>
          </Box>
        );
        
      case 'calculation':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              割合の計算をマスターしよう
            </Typography>
            {currentProblem && (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <PercentageCalculator
                    problem={currentProblem}
                    onAnswer={checkAnswer}
                    onNewProblem={handleNewProblem}
                    showHint={showHint}
                    currentHintIndex={currentHintIndex}
                    onShowNextHint={showNextHint}
                    showStepByStep={config.showStepByStep}
                  />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      計算のコツ
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="割合を求める"
                          secondary="比べる量 ÷ もとにする量"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="比べる量を求める"
                          secondary="もとにする量 × 割合"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="もとにする量を求める"
                          secondary="比べる量 ÷ 割合"
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        );
        
      case 'conversion':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              いろいろな表し方を覚えよう
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                {currentProblem && (
                  <PercentageCalculator
                    problem={currentProblem}
                    onAnswer={checkAnswer}
                    onNewProblem={handleNewProblem}
                    showHint={showHint}
                    currentHintIndex={currentHintIndex}
                    onShowNextHint={showNextHint}
                    showStepByStep={config.showStepByStep}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    変換表
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={1}>
                    {[
                      { decimal: 0.5, percentage: 50, fraction: '1/2', waribun: '5割' },
                      { decimal: 0.25, percentage: 25, fraction: '1/4', waribun: '2割5分' },
                      { decimal: 0.1, percentage: 10, fraction: '1/10', waribun: '1割' },
                      { decimal: 0.75, percentage: 75, fraction: '3/4', waribun: '7割5分' },
                      { decimal: 0.2, percentage: 20, fraction: '1/5', waribun: '2割' }
                    ].map((item, index) => (
                      <React.Fragment key={index}>
                        <Grid item xs={3}>
                          <Typography variant="caption" color="text.secondary">
                            小数
                          </Typography>
                          <Typography variant="body2">
                            {item.decimal}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" color="text.secondary">
                            百分率
                          </Typography>
                          <Typography variant="body2">
                            {item.percentage}%
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" color="text.secondary">
                            分数
                          </Typography>
                          <Typography variant="body2">
                            {item.fraction}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="caption" color="text.secondary">
                            歩合
                          </Typography>
                          <Typography variant="body2">
                            {item.waribun}
                          </Typography>
                        </Grid>
                        {index < 4 && (
                          <Grid item xs={12}>
                            <Divider />
                          </Grid>
                        )}
                      </React.Fragment>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 'graph':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              グラフで割合を表現しよう
            </Typography>
            <GraphRepresentation
              editable={true}
              showLegend={true}
              showTable={true}
              onDataChange={(data) => {
                // データ変更時の処理
                console.log('Graph data changed:', data);
              }}
            />
          </Box>
        );
        
      case 'realWorld':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              実生活で割合を使ってみよう
            </Typography>
            <RealWorldScenarios
              scenarios={[shoppingScenario, statisticsScenario]}
              onProblemSolve={(problemId, answer) => {
                // 実際の問題を探して答え合わせ
                const allProblems = [
                  ...shoppingScenario.problems,
                  ...statisticsScenario.problems
                ];
                const problem = allProblems.find(p => p.id === problemId);
                if (problem) {
                  const userValue = parseFloat(answer);
                  return Math.abs(userValue - problem.answer.value) < 0.01;
                }
                return false;
              }}
              onScenarioComplete={(scenarioId) => {
                console.log(`Scenario ${scenarioId} completed!`);
              }}
            />
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  // ヘルプダイアログ
  const HelpDialog = () => (
    <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="sm" fullWidth>
      <DialogTitle>割合・百分率の学習ガイド</DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemIcon>
              <ConceptIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="概念理解"
              secondary="まずは割合が何を表すか理解しましょう。視覚的な表現で直感的に学べます。"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CalculateIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="計算練習"
              secondary="3つの要素（もとにする量、比べる量、割合）の関係を理解し、計算できるようになりましょう。"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ConversionIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="変換練習"
              secondary="百分率、小数、分数、歩合の相互変換をマスターしましょう。"
            />
          </ListItem>
        </List>
        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>学習のコツ</AlertTitle>
          <Typography variant="body2">
            1日10問ずつ練習すると、1週間で基本的な割合の計算ができるようになります。
            わからない時は、ヒントを活用しましょう！
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowHelp(false)}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ウェルカムメッセージ */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Alert
              severity="success"
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={handleCloseWelcome}>
                  始める
                </Button>
              }
            >
              <AlertTitle>ようこそ、割合・百分率トレーナーへ！</AlertTitle>
              生活の中でよく使う割合を楽しく学びましょう。まずは「概念理解」から始めてみてね。
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ヘッダー */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              📊 割合・百分率トレーナー
            </Typography>
            <Typography variant="body1" color="text.secondary">
              割合の概念から実生活での応用まで、段階的に学習できます
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary">
              {progress.mastery.overall}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              習熟度
            </Typography>
            <Chip
              label={getMasteryLevel().level}
              color={getMasteryLevel().color as any}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
        
        {/* 進捗バー */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress.mastery.overall}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        
        {/* 統計情報 */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<TrophyIcon />}
            label={`正解数: ${progress.problemStats.correct} / ${progress.problemStats.total}`}
            variant="outlined"
          />
          <Chip
            label={`完了モード: ${progress.completedModes.length} / ${learningModes.length}`}
            variant="outlined"
          />
          <Chip
            label={`学習時間: ${Math.floor(progress.timeSpent / 60)}分`}
            variant="outlined"
          />
        </Box>
      </Paper>
      
      {/* 学習モード選択 */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => {
            setSelectedTab(newValue);
            handleModeChange(learningModes[newValue].id);
          }}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            '& .MuiTab-root': {
              minHeight: 80,
              textTransform: 'none'
            }
          }}
        >
          {learningModes.map((mode, index) => {
            const Icon = mode.icon;
            const isCompleted = progress.completedModes.includes(mode.id);
            
            return (
              <Tab
                key={mode.id}
                label={
                  <Box sx={{ textAlign: 'center' }}>
                    <Icon sx={{ fontSize: 30, color: mode.color, mb: 1 }} />
                    <Typography variant="body2">
                      {mode.label}
                    </Typography>
                    {isCompleted && (
                      <Chip
                        size="small"
                        label="完了"
                        color="success"
                        sx={{ mt: 0.5, height: 20 }}
                      />
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Paper>
      
      {/* メインコンテンツ */}
      <Fade in={true} timeout={500}>
        <Box>
          {renderModeContent()}
        </Box>
      </Fade>
      
      {/* フィードバック表示 */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000
            }}
          >
            <Alert
              severity={feedback.type === 'success' ? 'success' : feedback.type === 'error' ? 'error' : 'info'}
              sx={{
                boxShadow: theme.shadows[8],
                maxWidth: 400
              }}
            >
              <AlertTitle>{feedback.title}</AlertTitle>
              <Typography variant="body2">
                {feedback.message}
              </Typography>
              {feedback.details && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {feedback.details}
                </Typography>
              )}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ヘルプボタン */}
      <Tooltip title="ヘルプ">
        <IconButton
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark
            }
          }}
          onClick={() => setShowHelp(true)}
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>
      
      {/* ヘルプダイアログ */}
      <HelpDialog />
    </Container>
  );
};