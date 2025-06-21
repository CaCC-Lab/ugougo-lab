/**
 * 実生活シナリオコンポーネント
 * 
 * 買い物、統計、スポーツなど実生活での
 * 割合・百分率の応用を体験的に学習
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  AlertTitle,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  alpha
} from '@mui/material';
import {
  ShoppingCart as ShoppingIcon,
  Restaurant as CookingIcon,
  ShowChart as StatisticsIcon,
  SportsSoccer as SportsIcon,
  Science as ScienceIcon,
  AccountBalance as FinanceIcon,
  CheckCircle as CheckIcon,
  Cancel as CloseIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Calculate as CalculateIcon,
  LocalOffer as DiscountIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { 
  RealWorldScenario, 
  PercentageProblem, 
  ShoppingItem,
  StatisticsData 
} from '../types';

interface RealWorldScenariosProps {
  scenarios: RealWorldScenario[];
  onProblemSolve: (problemId: string, answer: string) => boolean;
  onScenarioComplete: (scenarioId: string) => void;
}

// シナリオカテゴリーの設定
const categoryConfig = {
  shopping: {
    icon: ShoppingIcon,
    color: '#FF6B6B',
    title: 'お買い物',
    description: '割引計算や消費税を学ぼう'
  },
  statistics: {
    icon: StatisticsIcon,
    color: '#4ECDC4',
    title: '統計・データ',
    description: 'アンケート結果を分析しよう'
  },
  sports: {
    icon: SportsIcon,
    color: '#45B7D1',
    title: 'スポーツ',
    description: '勝率や成功率を計算しよう'
  },
  cooking: {
    icon: CookingIcon,
    color: '#96CEB4',
    title: '料理',
    description: '材料の分量を調整しよう'
  },
  finance: {
    icon: FinanceIcon,
    color: '#DDA0DD',
    title: 'お金の計算',
    description: '貯金や利息を理解しよう'
  },
  science: {
    icon: ScienceIcon,
    color: '#FFD93D',
    title: '理科・実験',
    description: '濃度や比率を計算しよう'
  }
};

export const RealWorldScenarios: React.FC<RealWorldScenariosProps> = ({
  scenarios,
  onProblemSolve,
  onScenarioComplete
}) => {
  const theme = useTheme();
  const [selectedScenario, setSelectedScenario] = useState<RealWorldScenario | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [showCalculator, setShowCalculator] = useState(false);
  
  // シナリオの進捗率計算
  const getProgress = (scenario: RealWorldScenario) => {
    const solved = scenario.problems.filter(p => solvedProblems.has(p.id)).length;
    return (solved / scenario.problems.length) * 100;
  };
  
  // シナリオを開く
  const openScenario = (scenario: RealWorldScenario) => {
    setSelectedScenario(scenario);
    setCurrentProblemIndex(0);
    setUserAnswer('');
    setShowResult(false);
  };
  
  // シナリオを閉じる
  const closeScenario = () => {
    if (selectedScenario && getProgress(selectedScenario) === 100) {
      onScenarioComplete(selectedScenario.id);
    }
    setSelectedScenario(null);
  };
  
  // 答えをチェック
  const checkAnswer = () => {
    if (!selectedScenario) return;
    
    const currentProblem = selectedScenario.problems[currentProblemIndex];
    const correct = onProblemSolve(currentProblem.id, userAnswer);
    
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setSolvedProblems(prev => new Set([...prev, currentProblem.id]));
    }
  };
  
  // 次の問題へ
  const nextProblem = () => {
    setCurrentProblemIndex(prev => prev + 1);
    setUserAnswer('');
    setShowResult(false);
  };
  
  // 前の問題へ
  const prevProblem = () => {
    setCurrentProblemIndex(prev => prev - 1);
    setUserAnswer('');
    setShowResult(false);
  };
  
  // シナリオ一覧表示
  const ScenarioList = () => (
    <Grid container spacing={3}>
      {scenarios.map((scenario) => {
        const config = categoryConfig[scenario.category];
        const Icon = config.icon;
        const progress = getProgress(scenario);
        
        return (
          <Grid item xs={12} sm={6} md={4} key={scenario.id}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  border: `2px solid ${config.color}`,
                  '&:hover': {
                    boxShadow: theme.shadows[8]
                  }
                }}
                onClick={() => openScenario(scenario)}
              >
                <CardMedia
                  sx={{
                    height: 120,
                    backgroundColor: alpha(config.color, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon sx={{ fontSize: 60, color: config.color }} />
                </CardMedia>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {scenario.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {scenario.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${scenario.problems.length}問`}
                      size="small"
                      variant="outlined"
                    />
                    {progress > 0 && (
                      <Chip
                        label={`${Math.round(progress)}%完了`}
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      width: '100%',
                      backgroundColor: alpha(config.color, 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: config.color
                      }
                    }}
                  />
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        );
      })}
    </Grid>
  );
  
  // 買い物シナリオの表示
  const ShoppingScenarioDisplay = ({ scenario }: { scenario: RealWorldScenario }) => {
    const items = scenario.data.items || [];
    
    return (
      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            backgroundColor: alpha(categoryConfig.shopping.color, 0.05)
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: categoryConfig.shopping.color }}>
            🛒 商品リスト
          </Typography>
          <Grid container spacing={2}>
            {items.map((item: ShoppingItem) => (
              <Grid item xs={6} sm={4} key={item.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: 'white'
                  }}
                >
                  <Typography variant="h3">{item.icon}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    定価: ¥{item.originalPrice}
                  </Typography>
                  {item.discountPercentage && (
                    <Chip
                      label={`${item.discountPercentage}%OFF`}
                      size="small"
                      color="error"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  };
  
  // 統計シナリオの表示
  const StatisticsScenarioDisplay = ({ scenario }: { scenario: RealWorldScenario }) => {
    const stats = scenario.data.stats || [];
    const total = stats.reduce((sum, stat) => sum + stat.value, 0);
    
    return (
      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            backgroundColor: alpha(categoryConfig.statistics.color, 0.05)
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: categoryConfig.statistics.color }}>
            📊 データ
          </Typography>
          <List>
            {stats.map((stat: StatisticsData, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        backgroundColor: stat.color,
                        borderRadius: 1
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={stat.label}
                    secondary={`${stat.value}個 (${Math.round((stat.value / total) * 100)}%)`}
                  />
                  <Box sx={{ width: 100 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(stat.value / total) * 100}
                      sx={{
                        backgroundColor: alpha(stat.color, 0.2),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stat.color
                        }
                      }}
                    />
                  </Box>
                </ListItem>
                {index < stats.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              合計: {total}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };
  
  // 問題表示
  const ProblemDisplay = () => {
    if (!selectedScenario) return null;
    
    const currentProblem = selectedScenario.problems[currentProblemIndex];
    const config = categoryConfig[selectedScenario.category];
    
    return (
      <Box>
        {/* シナリオ固有のデータ表示 */}
        {selectedScenario.category === 'shopping' && (
          <ShoppingScenarioDisplay scenario={selectedScenario} />
        )}
        {selectedScenario.category === 'statistics' && (
          <StatisticsScenarioDisplay scenario={selectedScenario} />
        )}
        
        {/* 問題 */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              問題 {currentProblemIndex + 1} / {selectedScenario.problems.length}
            </Typography>
            <IconButton
              onClick={() => setShowCalculator(!showCalculator)}
              color={showCalculator ? 'primary' : 'default'}
            >
              <CalculateIcon />
            </IconButton>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            {currentProblem.question}
          </Typography>
          
          {/* ヒント */}
          {currentProblem.hints.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>ヒント</AlertTitle>
              {currentProblem.hints[0]}
            </Alert>
          )}
          
          {/* 答え入力 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              label="答え"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={showResult}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {currentProblem.answer.unit}
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              onClick={checkAnswer}
              disabled={!userAnswer || showResult}
              sx={{ minWidth: 100 }}
            >
              確認
            </Button>
          </Box>
          
          {/* 結果表示 */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity={isCorrect ? 'success' : 'error'}
                sx={{ mt: 2 }}
                icon={isCorrect ? <CheckIcon /> : <CloseIcon />}
              >
                <AlertTitle>
                  {isCorrect ? '正解！' : '残念...'}
                </AlertTitle>
                {isCorrect ? (
                  <Typography variant="body2">
                    {currentProblem.explanation}
                  </Typography>
                ) : (
                  <Typography variant="body2">
                    正解: {currentProblem.answer.value}{currentProblem.answer.unit}
                  </Typography>
                )}
              </Alert>
            </motion.div>
          )}
          
          {/* 簡易電卓 */}
          <AnimatePresence>
            {showCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: theme.palette.grey[100]
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    計算メモ
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="ここで計算できます..."
                    variant="outlined"
                    sx={{ backgroundColor: 'white' }}
                  />
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </Box>
    );
  };
  
  return (
    <Box sx={{ p: 2 }}>
      {!selectedScenario ? (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            実生活で割合を使ってみよう
          </Typography>
          <ScenarioList />
        </>
      ) : (
        <Box>
          {/* ヘッダー */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <IconButton onClick={closeScenario}>
              <BackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {selectedScenario.title}
            </Typography>
            <Chip
              label={`${Math.round(getProgress(selectedScenario))}%完了`}
              color="success"
              variant="outlined"
            />
          </Box>
          
          {/* 進捗バー */}
          <LinearProgress
            variant="determinate"
            value={(currentProblemIndex + 1) / selectedScenario.problems.length * 100}
            sx={{ mb: 3, height: 8, borderRadius: 4 }}
          />
          
          {/* 問題表示 */}
          <ProblemDisplay />
          
          {/* ナビゲーション */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={prevProblem}
              disabled={currentProblemIndex === 0}
            >
              前の問題
            </Button>
            
            {currentProblemIndex < selectedScenario.problems.length - 1 ? (
              <Button
                endIcon={<NextIcon />}
                onClick={nextProblem}
                variant="contained"
                disabled={!showResult || !isCorrect}
              >
                次の問題
              </Button>
            ) : (
              <Button
                onClick={closeScenario}
                variant="contained"
                color="success"
                disabled={!showResult || !isCorrect}
              >
                完了
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};