/**
 * 実生活の例題コンポーネント
 * 
 * 買い物、料理、測定など実生活のシーンで
 * 小数を使う場面を体験的に学習できる
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme
} from '@mui/material';
import {
  ShoppingCart as ShoppingIcon,
  Restaurant as CookingIcon,
  Straighten as MeasurementIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Cancel as CloseIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { RealWorldExample, DecimalProblem } from '../types';

interface RealWorldExamplesProps {
  examples: RealWorldExample[];
  onProblemSolve: (problemId: string, answer: string) => boolean;
  onComplete: (exampleId: string) => void;
}

// シナリオアイコンのマップ
const scenarioIcons = {
  shopping: ShoppingIcon,
  cooking: CookingIcon,
  measurement: MeasurementIcon,
  money: MoneyIcon
};

// シナリオの色設定
const scenarioColors = {
  shopping: '#FF6B6B',
  cooking: '#4ECDC4',
  measurement: '#45B7D1',
  money: '#96CEB4'
};

// 仮想的な画像パス（実際のプロジェクトでは適切な画像を用意）
const scenarioImages = {
  shopping: '/images/decimals/shopping.svg',
  cooking: '/images/decimals/cooking.svg',
  measurement: '/images/decimals/measurement.svg',
  money: '/images/decimals/money.svg'
};

export const RealWorldExamples: React.FC<RealWorldExamplesProps> = ({
  examples,
  onProblemSolve,
  onComplete
}) => {
  const theme = useTheme();
  const [selectedExample, setSelectedExample] = useState<RealWorldExample | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  
  // 例題を開く
  const handleOpenExample = (example: RealWorldExample) => {
    setSelectedExample(example);
    setCurrentProblemIndex(0);
    setUserAnswer('');
    setShowResult(false);
  };
  
  // 例題を閉じる
  const handleCloseExample = () => {
    if (selectedExample && solvedProblems.size === selectedExample.problems.length) {
      onComplete(selectedExample.id);
    }
    setSelectedExample(null);
    setCurrentProblemIndex(0);
  };
  
  // 答えを確認
  const handleCheckAnswer = () => {
    if (!selectedExample) return;
    
    const currentProblem = selectedExample.problems[currentProblemIndex];
    const correct = onProblemSolve(currentProblem.id, userAnswer);
    
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setSolvedProblems(prev => new Set([...prev, currentProblem.id]));
      
      // 2秒後に次の問題へ
      setTimeout(() => {
        if (currentProblemIndex < selectedExample.problems.length - 1) {
          handleNextProblem();
        }
      }, 2000);
    }
  };
  
  // 次の問題へ
  const handleNextProblem = () => {
    setCurrentProblemIndex(prev => prev + 1);
    setUserAnswer('');
    setShowResult(false);
  };
  
  // 前の問題へ
  const handlePrevProblem = () => {
    setCurrentProblemIndex(prev => prev - 1);
    setUserAnswer('');
    setShowResult(false);
  };
  
  // 進捗率の計算
  const getProgress = (example: RealWorldExample) => {
    const solved = example.problems.filter(p => solvedProblems.has(p.id)).length;
    return (solved / example.problems.length) * 100;
  };
  
  return (
    <Box sx={{ p: 2 }}>
      {/* 例題一覧 */}
      <Grid container spacing={3}>
        {examples.map((example) => {
          const Icon = scenarioIcons[example.scenario];
          const color = scenarioColors[example.scenario];
          const progress = getProgress(example);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={example.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    border: `2px solid ${color}`,
                    '&:hover': {
                      boxShadow: theme.shadows[8]
                    }
                  }}
                  onClick={() => handleOpenExample(example)}
                >
                  <CardMedia
                    sx={{
                      height: 140,
                      backgroundColor: `${color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon sx={{ fontSize: 80, color }} />
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color }}>
                      {example.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {example.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={`${example.problems.length}問`} 
                        size="small"
                        sx={{ backgroundColor: `${color}20` }}
                      />
                      {progress > 0 && (
                        <Chip
                          label={`${Math.round(progress)}%完了`}
                          size="small"
                          color="success"
                          variant="outlined"
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
                        backgroundColor: `${color}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: color
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
      
      {/* 問題ダイアログ */}
      <Dialog 
        open={!!selectedExample} 
        onClose={handleCloseExample}
        maxWidth="md"
        fullWidth
      >
        {selectedExample && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {React.createElement(scenarioIcons[selectedExample.scenario], {
                    sx: { color: scenarioColors[selectedExample.scenario] }
                  })}
                  <Typography variant="h6">
                    {selectedExample.title}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseExample}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={(currentProblemIndex + 1) / selectedExample.problems.length * 100}
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  問題 {currentProblemIndex + 1} / {selectedExample.problems.length}
                </Typography>
              </Box>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProblemIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentProblemIndex < selectedExample.problems.length && (
                    <ProblemDisplay
                      problem={selectedExample.problems[currentProblemIndex]}
                      scenario={selectedExample.scenario}
                      userAnswer={userAnswer}
                      onAnswerChange={setUserAnswer}
                      showResult={showResult}
                      isCorrect={isCorrect}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </DialogContent>
            
            <DialogActions>
              <Button
                onClick={handlePrevProblem}
                disabled={currentProblemIndex === 0}
                startIcon={<BackIcon />}
              >
                前の問題
              </Button>
              
              {!showResult && (
                <Button
                  onClick={handleCheckAnswer}
                  variant="contained"
                  color="primary"
                  disabled={!userAnswer}
                >
                  答え合わせ
                </Button>
              )}
              
              {currentProblemIndex < selectedExample.problems.length - 1 ? (
                <Button
                  onClick={handleNextProblem}
                  endIcon={<NextIcon />}
                  disabled={!showResult || !isCorrect}
                >
                  次の問題
                </Button>
              ) : (
                <Button
                  onClick={handleCloseExample}
                  variant="contained"
                  color="success"
                  disabled={!showResult || !isCorrect}
                >
                  完了
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

// 問題表示コンポーネント
interface ProblemDisplayProps {
  problem: DecimalProblem;
  scenario: string;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean;
}

const ProblemDisplay: React.FC<ProblemDisplayProps> = ({
  problem,
  scenario,
  userAnswer,
  onAnswerChange,
  showResult,
  isCorrect
}) => {
  const theme = useTheme();
  const color = scenarioColors[scenario as keyof typeof scenarioColors];
  
  // シナリオに応じた問題表示
  const renderScenarioContent = () => {
    switch (scenario) {
      case 'shopping':
        return (
          <ShoppingScenario problem={problem} color={color} />
        );
      case 'measurement':
        return (
          <MeasurementScenario problem={problem} color={color} />
        );
      case 'cooking':
        return (
          <CookingScenario problem={problem} color={color} />
        );
      default:
        return null;
    }
  };
  
  return (
    <Box>
      {/* シナリオ固有のコンテンツ */}
      {renderScenarioContent()}
      
      {/* 問題文 */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mt: 3,
          backgroundColor: theme.palette.grey[50]
        }}
      >
        <Typography variant="h6" gutterBottom>
          問題
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {problem.realWorldContext}
        </Typography>
        
        {/* 計算式 */}
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: 'white',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '1.2rem',
            textAlign: 'center',
            mb: 2
          }}
        >
          {problem.operand1.displayString} {problem.type === 'addition' ? '+' : problem.type === 'subtraction' ? '-' : '×'} {problem.operand2.displayString} = ?
        </Box>
        
        {/* 答え入力 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
          <TextField
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="答えを入力"
            variant="outlined"
            disabled={showResult}
            sx={{
              width: 200,
              '& input': {
                textAlign: 'center',
                fontSize: '1.2rem'
              }
            }}
          />
        </Box>
        
        {/* 結果表示 */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box 
              sx={{ 
                mt: 2, 
                p: 2,
                backgroundColor: isCorrect 
                  ? theme.palette.success.light + '20'
                  : theme.palette.error.light + '20',
                borderRadius: 1,
                textAlign: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                {isCorrect ? (
                  <CheckIcon color="success" />
                ) : (
                  <CloseIcon color="error" />
                )}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: isCorrect 
                      ? theme.palette.success.dark 
                      : theme.palette.error.dark 
                  }}
                >
                  {isCorrect ? '正解！' : '残念...'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                答え: {problem.answer.displayString}
              </Typography>
            </Box>
          </motion.div>
        )}
        
        {/* ヒント */}
        {problem.hint && !showResult && (
          <Box 
            sx={{ 
              mt: 2,
              p: 2,
              backgroundColor: theme.palette.warning.light + '20',
              borderRadius: 1
            }}
          >
            <Typography variant="body2" color="text.secondary">
              💡 ヒント: {problem.hint}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

// 買い物シナリオのコンポーネント
const ShoppingScenario: React.FC<{ problem: DecimalProblem; color: string }> = ({ problem, color }) => {
  const items = [
    { name: 'えんぴつ', price: problem.operand1.value, icon: '✏️' },
    { name: 'けしゴム', price: problem.operand2.value, icon: '🧽' }
  ];
  
  return (
    <Paper elevation={1} sx={{ p: 2, backgroundColor: `${color}10` }}>
      <Typography variant="h6" gutterBottom sx={{ color }}>
        🛒 お買い物
      </Typography>
      <List>
        {items.map((item, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <Typography variant="h5">{item.icon}</Typography>
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              secondary={`${item.price}円`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

// 測定シナリオのコンポーネント
const MeasurementScenario: React.FC<{ problem: DecimalProblem; color: string }> = ({ problem, color }) => {
  return (
    <Paper elevation={1} sx={{ p: 2, backgroundColor: `${color}10` }}>
      <Typography variant="h6" gutterBottom sx={{ color }}>
        📏 長さの測定
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box 
            sx={{ 
              height: 20, 
              backgroundColor: color,
              borderRadius: 1,
              position: 'relative'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute',
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              {problem.operand1.displayString}m
            </Typography>
          </Box>
        </Box>
        <Typography>+</Typography>
        <Box sx={{ flex: 1 }}>
          <Box 
            sx={{ 
              height: 20, 
              backgroundColor: color,
              opacity: 0.7,
              borderRadius: 1,
              position: 'relative'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute',
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              {problem.operand2.displayString}m
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// 料理シナリオのコンポーネント
const CookingScenario: React.FC<{ problem: DecimalProblem; color: string }> = ({ problem, color }) => {
  return (
    <Paper elevation={1} sx={{ p: 2, backgroundColor: `${color}10` }}>
      <Typography variant="h6" gutterBottom sx={{ color }}>
        👨‍🍳 料理の分量
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3">🥛</Typography>
          <Typography variant="body2">
            {problem.operand1.displayString}カップ
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5">+</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3">🥛</Typography>
          <Typography variant="body2">
            {problem.operand2.displayString}カップ
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};