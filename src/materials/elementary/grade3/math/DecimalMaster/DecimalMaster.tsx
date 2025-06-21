/**
 * 小数マスター - メインコンポーネント
 * 
 * 小学3-4年生向けの小数学習教材
 * 視覚的・体験的に小数を理解できる総合学習システム
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
  CardActions,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Alert,
  AlertTitle,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  School as ConceptIcon,
  ViewModule as GridIcon,
  Calculate as CalculateIcon,
  CompareArrows as CompareIcon,
  Store as RealWorldIcon,
  EmojiEvents as TrophyIcon,
  Info as InfoIcon,
  PlayArrow as StartIcon,
  RestartAlt as RestartIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// コンポーネントのインポート
import { DecimalGrid } from './components/DecimalGrid';
import { PlaceValueBoard } from './components/PlaceValueBoard';
import { DecimalCalculator } from './components/DecimalCalculator';
import { RealWorldExamples } from './components/RealWorldExamples';

// フックとデータのインポート
import { useDecimalLogic } from './hooks/useDecimalLogic';
import { 
  conceptProblems, 
  placeValueProblems, 
  additionProblems, 
  subtractionProblems,
  realWorldExamples,
  getRandomProblem 
} from './data/decimalProblems';

// 型のインポート
import type { LearningMode, DecimalMasterConfig } from './types';

// 学習モードの定義
const learningModes = [
  {
    id: 'concept' as LearningMode,
    label: '小数を知ろう',
    icon: ConceptIcon,
    color: '#FF6B6B',
    description: '小数ってなに？0.1や0.01の意味を学ぼう'
  },
  {
    id: 'placeValue' as LearningMode,
    label: '位取りを学ぼう',
    icon: GridIcon,
    color: '#4ECDC4',
    description: '位取り板を使って小数の仕組みを理解しよう'
  },
  {
    id: 'addition' as LearningMode,
    label: 'たし算',
    icon: CalculateIcon,
    color: '#45B7D1',
    description: '小数のたし算をマスターしよう'
  },
  {
    id: 'subtraction' as LearningMode,
    label: 'ひき算',
    icon: CalculateIcon,
    color: '#96CEB4',
    description: '小数のひき算をマスターしよう'
  },
  {
    id: 'realWorld' as LearningMode,
    label: '生活の中の小数',
    icon: RealWorldIcon,
    color: '#DDA0DD',
    description: '買い物や料理で小数を使ってみよう'
  }
];

export const DecimalMaster: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // カスタムフックの使用
  const {
    currentMode,
    currentProblem,
    userAnswer,
    feedback,
    showHint,
    progress,
    highlightedCells,
    placeValueState,
    setUserAnswer,
    checkAnswer,
    changeMode,
    generateNewProblem,
    toggleCellHighlight,
    updatePlaceValue,
    generateHint,
    createDecimalNumber
  } = useDecimalLogic();
  
  // ローカル状態
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [config, setConfig] = useState<DecimalMasterConfig>({
    showGrid: true,
    showNumberLine: false,
    enableSound: true,
    animationSpeed: 'normal',
    difficultyLevel: 'beginner'
  });
  
  // 初回アクセス時のウェルカムメッセージ
  useEffect(() => {
    const hasVisited = localStorage.getItem('decimalMaster_visited');
    if (hasVisited) {
      setShowWelcome(false);
    }
  }, []);
  
  // ウェルカムメッセージを閉じる
  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('decimalMaster_visited', 'true');
  };
  
  // 学習モードの変更
  const handleModeChange = (mode: LearningMode) => {
    changeMode(mode);
    setSelectedTab(learningModes.findIndex(m => m.id === mode));
    
    // モードに応じた問題を生成
    switch (mode) {
      case 'concept':
        setCurrentProblem(conceptProblems[0]);
        break;
      case 'placeValue':
        setCurrentProblem(placeValueProblems[0]);
        break;
      case 'addition':
        setCurrentProblem(getRandomProblem('addition'));
        break;
      case 'subtraction':
        setCurrentProblem(getRandomProblem('subtraction'));
        break;
      case 'realWorld':
        // RealWorldExamplesコンポーネントで管理
        break;
    }
  };
  
  // 新しい問題を生成
  const handleNewProblem = () => {
    generateNewProblem(currentMode);
    if (currentMode === 'addition' || currentMode === 'subtraction') {
      setCurrentProblem(getRandomProblem(currentMode));
    }
  };
  
  // 問題を設定（内部用）
  const [currentProblemInternal, setCurrentProblem] = useState(currentProblem);
  
  useEffect(() => {
    setCurrentProblem(currentProblem);
  }, [currentProblem]);
  
  // 進捗率の計算
  const getProgressPercentage = () => {
    if (progress.totalProblems === 0) return 0;
    return Math.round((progress.correctAnswers / progress.totalProblems) * 100);
  };
  
  // モードごとのコンテンツをレンダリング
  const renderModeContent = () => {
    switch (currentMode) {
      case 'concept':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              小数の概念を理解しよう
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DecimalGrid
                  value={0.34}
                  highlightedCells={highlightedCells}
                  onCellClick={toggleCellHighlight}
                  showLabels={true}
                  interactive={true}
                  animateChanges={true}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    学習のポイント
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <AlertTitle>0.1（ゼロ点イチ）とは？</AlertTitle>
                      1を10個に分けたうちの1つ分です。
                      10個集まると1になります。
                    </Alert>
                    <Alert severity="info">
                      <AlertTitle>0.01（ゼロ点ゼロイチ）とは？</AlertTitle>
                      1を100個に分けたうちの1つ分です。
                      100個集まると1になります。
                    </Alert>
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      グリッドをクリックして、小数を作ってみよう！
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 1列 = 0.1
                      • 1マス = 0.01
                      • 全体 = 1.0
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 'placeValue':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              位取り板で小数を理解しよう
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <PlaceValueBoard
                  value={placeValueState}
                  onChange={updatePlaceValue}
                  readOnly={false}
                  showTotal={true}
                  highlightDecimalPoint={true}
                />
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    練習問題
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      位取り板を使って、次の数を作ってみよう：
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                      <Chip label="2.5" color="primary" />
                      <Chip label="3.14" color="secondary" />
                      <Chip label="10.25" color="success" />
                      <Chip label="0.08" color="warning" />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 'addition':
      case 'subtraction':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              小数の{currentMode === 'addition' ? 'たし算' : 'ひき算'}
            </Typography>
            {currentProblemInternal && (
              <DecimalCalculator
                problem={currentProblemInternal}
                onAnswer={checkAnswer}
                onNewProblem={handleNewProblem}
                showHint={showHint}
                hint={generateHint()}
                showStepByStep={config.difficultyLevel === 'beginner'}
              />
            )}
          </Box>
        );
        
      case 'realWorld':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              生活の中で小数を使ってみよう
            </Typography>
            <RealWorldExamples
              examples={realWorldExamples}
              onProblemSolve={(problemId, answer) => {
                const problem = realWorldExamples
                  .flatMap(e => e.problems)
                  .find(p => p.id === problemId);
                
                if (problem) {
                  const userValue = parseFloat(answer);
                  return Math.abs(userValue - problem.answer.value) < 0.001;
                }
                return false;
              }}
              onComplete={(exampleId) => {
                // 完了処理
                console.log(`Example ${exampleId} completed!`);
              }}
            />
          </Box>
        );
        
      default:
        return null;
    }
  };
  
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
              <AlertTitle>ようこそ、小数マスターへ！</AlertTitle>
              一緒に小数の世界を探検しよう！まずは「小数を知ろう」から始めてみてね。
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ヘッダー */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              🔢 小数マスター
            </Typography>
            <Typography variant="body1" color="text.secondary">
              小数を楽しく学ぼう！視覚的に理解できる学習教材
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary">
              {getProgressPercentage()}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              達成率
            </Typography>
          </Box>
        </Box>
        
        {/* 進捗バー */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={getProgressPercentage()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        
        {/* 統計情報 */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<TrophyIcon />} 
            label={`正解数: ${progress.correctAnswers}`} 
            color="success"
            variant="outlined"
          />
          <Chip 
            label={`挑戦数: ${progress.totalProblems}`} 
            variant="outlined"
          />
          <Chip 
            label={`完了モード: ${progress.completedModes.length} / ${learningModes.length}`} 
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
              <AlertTitle>{feedback.message}</AlertTitle>
              {feedback.detailedExplanation && (
                <Typography variant="body2">
                  {feedback.detailedExplanation}
                </Typography>
              )}
              {feedback.nextStep && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  次: {feedback.nextStep}
                </Typography>
              )}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ヘルプボタン */}
      <Zoom in={true} timeout={1000}>
        <Tooltip title="学習のヒント">
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
            onClick={() => {
              // ヘルプダイアログを表示（実装省略）
              alert('ヒント: ' + generateHint());
            }}
          >
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Zoom>
    </Container>
  );
};