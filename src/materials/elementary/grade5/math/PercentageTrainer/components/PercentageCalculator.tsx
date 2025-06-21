/**
 * 割合計算練習コンポーネント
 * 
 * 3つの要素（もとにする量、比べる量、割合）から
 * 1つを求める計算練習を行う
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Chip,
  Stack,
  Alert,
  AlertTitle,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  Lightbulb as HintIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  School as LearnIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { PercentageProblem, ProblemType, PercentageElements } from '../types';

interface PercentageCalculatorProps {
  problem: PercentageProblem;
  onAnswer: (answer: string) => boolean;
  onNewProblem: () => void;
  showHint: boolean;
  currentHintIndex: number;
  onShowNextHint: () => void;
  showStepByStep?: boolean;
}

// 問題タイプ別の表示設定
const problemTypeConfig = {
  findPercentage: {
    label: '割合を求める',
    formula: '割合 = 比べる量 ÷ もとにする量',
    unit: '%',
    color: '#FF6B6B'
  },
  findCompareAmount: {
    label: '比べる量を求める',
    formula: '比べる量 = もとにする量 × 割合',
    unit: '',
    color: '#4ECDC4'
  },
  findBaseAmount: {
    label: 'もとにする量を求める',
    formula: 'もとにする量 = 比べる量 ÷ 割合',
    unit: '',
    color: '#45B7D1'
  },
  increase: {
    label: '増加率を求める',
    formula: '増加率 = 増加分 ÷ もとの値',
    unit: '%',
    color: '#96CEB4'
  },
  decrease: {
    label: '減少率を求める',
    formula: '減少率 = 減少分 ÷ もとの値',
    unit: '%',
    color: '#DDA0DD'
  },
  compound: {
    label: '複合問題',
    formula: '状況に応じて考える',
    unit: '',
    color: '#FFD93D'
  }
};

export const PercentageCalculator: React.FC<PercentageCalculatorProps> = ({
  problem,
  onAnswer,
  onNewProblem,
  showHint,
  currentHintIndex,
  onShowNextHint,
  showStepByStep = true
}) => {
  const theme = useTheme();
  const [userInput, setUserInput] = useState('');
  const [showFormula, setShowFormula] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerFormat, setAnswerFormat] = useState<'percentage' | 'decimal' | 'fraction'>('percentage');
  
  const config = problemTypeConfig[problem.type];
  
  // 問題がリセットされたらフォームもリセット
  useEffect(() => {
    setUserInput('');
    setShowFormula(false);
    setShowCalculation(false);
    setIsCorrect(null);
    setShowFeedback(false);
  }, [problem.id]);
  
  // 答えを確認
  const handleCheckAnswer = () => {
    const correct = onAnswer(userInput);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      // 正解時のアニメーション後、次の問題へ
      setTimeout(() => {
        onNewProblem();
      }, 2500);
    }
  };
  
  // Enterキーで答え合わせ
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userInput) {
      handleCheckAnswer();
    }
  };
  
  // 計算過程の表示
  const CalculationSteps = () => {
    const { given } = problem;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ color: config.color }}>
          計算の手順
        </Typography>
        
        <Stack spacing={1}>
          {/* Step 1: 与えられた値の確認 */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: alpha(theme.palette.grey[100], 0.5),
              border: `1px dashed ${theme.palette.grey[400]}`
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Step 1: 与えられた値を確認
            </Typography>
            {given.baseAmount !== undefined && (
              <Chip label={`もとにする量: ${given.baseAmount}`} size="small" sx={{ mr: 1 }} />
            )}
            {given.compareAmount !== undefined && (
              <Chip label={`比べる量: ${given.compareAmount}`} size="small" sx={{ mr: 1 }} />
            )}
            {given.percentage !== undefined && (
              <Chip label={`割合: ${given.percentage} (${given.percentage * 100}%)`} size="small" />
            )}
          </Paper>
          
          {/* Step 2: 公式の適用 */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: alpha(config.color, 0.1),
              border: `1px dashed ${config.color}`
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Step 2: 公式を使う
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
              {config.formula}
            </Typography>
          </Paper>
          
          {/* Step 3: 実際の計算 */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              border: `1px dashed ${theme.palette.success.main}`
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Step 3: 計算する
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
              {renderCalculation()}
            </Typography>
          </Paper>
        </Stack>
      </Box>
    );
  };
  
  // 計算式のレンダリング
  const renderCalculation = () => {
    const { given } = problem;
    
    switch (problem.type) {
      case 'findPercentage':
        return `${given.compareAmount} ÷ ${given.baseAmount} = ${(given.compareAmount! / given.baseAmount!).toFixed(2)} = ${((given.compareAmount! / given.baseAmount!) * 100).toFixed(0)}%`;
      
      case 'findCompareAmount':
        return `${given.baseAmount} × ${given.percentage} = ${(given.baseAmount! * given.percentage!).toFixed(2)}`;
      
      case 'findBaseAmount':
        return `${given.compareAmount} ÷ ${given.percentage} = ${(given.compareAmount! / given.percentage!).toFixed(2)}`;
      
      default:
        return '計算式を確認してください';
    }
  };
  
  // 問題表示エリア
  const ProblemDisplay = () => (
    <Box sx={{ mb: 3 }}>
      <Paper
        elevation={1}
        sx={{
          p: 3,
          backgroundColor: alpha(config.color, 0.05),
          border: `2px solid ${config.color}`
        }}
      >
        {/* 問題タイプ */}
        <Chip
          label={config.label}
          size="small"
          sx={{
            backgroundColor: config.color,
            color: 'white',
            mb: 2
          }}
        />
        
        {/* 問題文 */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          {problem.question}
        </Typography>
        
        {/* 文脈（あれば） */}
        {problem.context && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>場面</AlertTitle>
            {problem.context}
          </Alert>
        )}
      </Paper>
    </Box>
  );
  
  // 回答入力エリア
  const AnswerInput = () => (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="flex-end">
        <TextField
          fullWidth
          label="答えを入力"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isCorrect === true}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {problem.answer.unit}
              </InputAdornment>
            ),
            sx: {
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }
          }}
          helperText={
            problem.type === 'findPercentage' 
              ? '百分率で答えてください（例: 25）' 
              : '数値で答えてください'
          }
        />
        
        <Button
          variant="contained"
          size="large"
          onClick={handleCheckAnswer}
          disabled={!userInput || isCorrect === true}
          startIcon={<CheckIcon />}
          sx={{
            minWidth: 120,
            height: 56
          }}
        >
          答え合わせ
        </Button>
      </Stack>
    </Box>
  );
  
  // ツールバー
  const Toolbar = () => (
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <Tooltip title="公式を表示">
        <IconButton
          onClick={() => setShowFormula(!showFormula)}
          color={showFormula ? 'primary' : 'default'}
          sx={{
            backgroundColor: showFormula ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
          }}
        >
          <LearnIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="計算過程を表示">
        <IconButton
          onClick={() => setShowCalculation(!showCalculation)}
          color={showCalculation ? 'primary' : 'default'}
          sx={{
            backgroundColor: showCalculation ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
          }}
        >
          <CalculateIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="次の問題">
        <IconButton onClick={onNewProblem} color="secondary">
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
  
  // ヒント表示
  const HintDisplay = () => (
    <Collapse in={showHint}>
      <Alert
        severity="info"
        sx={{ mb: 2 }}
        action={
          currentHintIndex < problem.hints.length - 1 && (
            <Button
              size="small"
              onClick={onShowNextHint}
              endIcon={<ArrowIcon />}
            >
              次のヒント
            </Button>
          )
        }
      >
        <AlertTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HintIcon />
            ヒント {currentHintIndex + 1} / {problem.hints.length}
          </Box>
        </AlertTitle>
        {problem.hints[currentHintIndex]}
      </Alert>
    </Collapse>
  );
  
  // フィードバック表示
  const FeedbackDisplay = () => (
    <AnimatePresence>
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Alert
            severity={isCorrect ? 'success' : 'error'}
            sx={{ mb: 2 }}
            icon={isCorrect ? <CheckIcon /> : <CancelIcon />}
          >
            <AlertTitle>
              {isCorrect ? '正解！すばらしい！' : '残念...もう一度'}
            </AlertTitle>
            {isCorrect && problem.explanation && (
              <Typography variant="body2">
                {problem.explanation}
              </Typography>
            )}
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          計算練習
        </Typography>
        
        <Toolbar />
        
        <Divider sx={{ my: 2 }} />
        
        {/* 公式表示 */}
        <Collapse in={showFormula}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <AlertTitle>公式</AlertTitle>
            <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
              {config.formula}
            </Typography>
          </Alert>
        </Collapse>
        
        {/* 問題表示 */}
        <ProblemDisplay />
        
        {/* ヒント */}
        <HintDisplay />
        
        {/* 答え入力 */}
        <AnswerInput />
        
        {/* フィードバック */}
        <FeedbackDisplay />
        
        {/* 計算過程 */}
        {showStepByStep && (
          <Collapse in={showCalculation}>
            <CalculationSteps />
          </Collapse>
        )}
      </Paper>
    </Box>
  );
};