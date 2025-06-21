/**
 * 小数計算機コンポーネント
 * 
 * 筆算形式で小数の計算を視覚的に学習できる
 * インタラクティブな計算練習ツール
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  ButtonGroup,
  IconButton,
  Divider,
  Chip,
  Fade,
  Collapse,
  useTheme
} from '@mui/material';
import { 
  Add as AddIcon, 
  Remove as RemoveIcon,
  Refresh as RefreshIcon,
  Lightbulb as HintIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { DecimalProblem, DecimalNumber } from '../types';

interface DecimalCalculatorProps {
  problem: DecimalProblem;
  onAnswer: (answer: string) => boolean;
  onNewProblem: () => void;
  showHint: boolean;
  hint?: string;
  showStepByStep?: boolean;
}

// 計算ステップの型定義
interface CalculationStep {
  position: 'hundredths' | 'tenths' | 'ones' | 'tens' | 'hundreds';
  value: number;
  carry?: number;
  result: number;
  description: string;
}

export const DecimalCalculator: React.FC<DecimalCalculatorProps> = ({
  problem,
  onAnswer,
  onNewProblem,
  showHint,
  hint,
  showStepByStep = true
}) => {
  const theme = useTheme();
  const [userInput, setUserInput] = useState('');
  const [showCalculation, setShowCalculation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // 計算ステップの生成
  const generateCalculationSteps = (): CalculationStep[] => {
    const steps: CalculationStep[] = [];
    const { operand1, operand2, type } = problem;
    
    if (type === 'addition') {
      // 小数点以下2桁までの数を100倍して整数として扱う
      const num1 = Math.round(operand1.value * 100);
      const num2 = Math.round(operand2.value * 100);
      
      // 各桁の計算
      const hundredths = (num1 % 10) + (num2 % 10);
      const tenths = (Math.floor(num1 / 10) % 10) + (Math.floor(num2 / 10) % 10);
      const ones = (Math.floor(num1 / 100) % 10) + (Math.floor(num2 / 100) % 10);
      const tens = (Math.floor(num1 / 1000) % 10) + (Math.floor(num2 / 1000) % 10);
      
      // 百分の一の位
      steps.push({
        position: 'hundredths',
        value: hundredths % 10,
        carry: Math.floor(hundredths / 10),
        result: hundredths % 10,
        description: `百分の一の位: ${num1 % 10} + ${num2 % 10} = ${hundredths}`
      });
      
      // 十分の一の位
      const tenthsWithCarry = tenths + Math.floor(hundredths / 10);
      steps.push({
        position: 'tenths',
        value: tenthsWithCarry % 10,
        carry: Math.floor(tenthsWithCarry / 10),
        result: tenthsWithCarry % 10,
        description: `十分の一の位: ${Math.floor(num1 / 10) % 10} + ${Math.floor(num2 / 10) % 10}${Math.floor(hundredths / 10) > 0 ? ` + ${Math.floor(hundredths / 10)}（繰り上がり）` : ''} = ${tenthsWithCarry}`
      });
      
      // 一の位
      const onesWithCarry = ones + Math.floor(tenthsWithCarry / 10);
      steps.push({
        position: 'ones',
        value: onesWithCarry % 10,
        carry: Math.floor(onesWithCarry / 10),
        result: onesWithCarry % 10,
        description: `一の位: ${Math.floor(num1 / 100) % 10} + ${Math.floor(num2 / 100) % 10}${Math.floor(tenthsWithCarry / 10) > 0 ? ` + ${Math.floor(tenthsWithCarry / 10)}（繰り上がり）` : ''} = ${onesWithCarry}`
      });
      
      // 十の位（必要な場合）
      if (Math.floor(num1 / 1000) > 0 || Math.floor(num2 / 1000) > 0 || Math.floor(onesWithCarry / 10) > 0) {
        const tensWithCarry = tens + Math.floor(onesWithCarry / 10);
        steps.push({
          position: 'tens',
          value: tensWithCarry % 10,
          carry: Math.floor(tensWithCarry / 10),
          result: tensWithCarry % 10,
          description: `十の位: ${Math.floor(num1 / 1000) % 10} + ${Math.floor(num2 / 1000) % 10}${Math.floor(onesWithCarry / 10) > 0 ? ` + ${Math.floor(onesWithCarry / 10)}（繰り上がり）` : ''} = ${tensWithCarry}`
        });
      }
    }
    
    // 引き算の場合も同様に実装（省略）
    
    return steps;
  };
  
  const calculationSteps = generateCalculationSteps();
  
  // 小数点の位置を揃えて表示するための文字列フォーマット
  const formatNumberForDisplay = (num: DecimalNumber): string => {
    // 整数部と小数部を分けて、位を揃える
    const intPart = num.integerPart.toString().padStart(3, ' ');
    const decPart = num.decimalPart.toFixed(2).substring(2);
    return `${intPart}.${decPart}`;
  };
  
  // 答えを確認
  const handleCheckAnswer = () => {
    const correct = onAnswer(userInput);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      // 正解時のアニメーション
      setTimeout(() => {
        setShowFeedback(false);
        onNewProblem();
        setUserInput('');
        setCurrentStep(0);
        setShowCalculation(false);
      }, 2000);
    }
  };
  
  // 計算過程の表示切り替え
  const toggleCalculation = () => {
    setShowCalculation(!showCalculation);
    setCurrentStep(0);
  };
  
  // ステップを進める
  const nextStep = () => {
    if (currentStep < calculationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // ステップを戻る
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // キーボードイベント
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && userInput) {
        handleCheckAnswer();
      }
    };
    
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [userInput]);
  
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          小数の計算
        </Typography>
        
        {/* 問題表示 */}
        <Box sx={{ mb: 4 }}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              backgroundColor: theme.palette.grey[50],
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
              {problem.operand1.displayString} {problem.type === 'addition' ? '+' : '-'} {problem.operand2.displayString} = ?
            </Typography>
            {problem.realWorldContext && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {problem.realWorldContext}
              </Typography>
            )}
          </Paper>
        </Box>
        
        {/* 筆算表示エリア */}
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          {/* 筆算 */}
          <Box sx={{ flex: 1 }}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                backgroundColor: theme.palette.primary.light + '10',
                position: 'relative'
              }}
            >
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                筆算で計算してみよう
              </Typography>
              
              {/* 筆算フォーマット */}
              <Box sx={{ fontFamily: 'monospace', fontSize: '1.5rem' }}>
                <Box sx={{ textAlign: 'right', mb: 1 }}>
                  {formatNumberForDisplay(problem.operand1)}
                </Box>
                <Box sx={{ 
                  textAlign: 'right', 
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center'
                }}>
                  <Typography sx={{ mr: 1, fontSize: '1.5rem' }}>
                    {problem.type === 'addition' ? '+' : '-'}
                  </Typography>
                  {formatNumberForDisplay(problem.operand2)}
                </Box>
                <Divider sx={{ borderWidth: 2, borderColor: 'black', mb: 1 }} />
                
                {/* 答え入力 or 計算過程表示 */}
                {showCalculation && showStepByStep ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ textAlign: 'right', position: 'relative' }}>
                        {/* 繰り上がり表示 */}
                        {calculationSteps[currentStep]?.carry > 0 && (
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              top: -20,
                              right: getPositionOffset(calculationSteps[currentStep].position),
                              fontSize: '0.8rem',
                              color: theme.palette.error.main,
                              fontWeight: 'bold'
                            }}
                          >
                            {calculationSteps[currentStep].carry}
                          </Box>
                        )}
                        
                        {/* 部分的な答え表示 */}
                        <Box sx={{ color: theme.palette.primary.main }}>
                          {buildPartialAnswer(calculationSteps, currentStep)}
                        </Box>
                      </Box>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <Box sx={{ textAlign: 'right' }}>
                    <TextField
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="答えを入力"
                      variant="standard"
                      sx={{ 
                        width: '150px',
                        '& input': { 
                          textAlign: 'right',
                          fontSize: '1.5rem',
                          fontFamily: 'monospace'
                        }
                      }}
                      autoFocus
                    />
                  </Box>
                )}
              </Box>
              
              {/* 計算過程の説明 */}
              {showCalculation && showStepByStep && (
                <Box sx={{ mt: 3 }}>
                  <Chip 
                    label={calculationSteps[currentStep]?.description}
                    color="primary"
                    size="small"
                  />
                </Box>
              )}
            </Paper>
            
            {/* コントロールボタン */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
              {showStepByStep && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={showCalculation ? <CancelIcon /> : <HintIcon />}
                  onClick={toggleCalculation}
                >
                  {showCalculation ? '通常モード' : '計算過程を見る'}
                </Button>
              )}
              
              {showCalculation && showStepByStep && (
                <ButtonGroup size="small" variant="contained">
                  <Button onClick={prevStep} disabled={currentStep === 0}>
                    <RemoveIcon />
                  </Button>
                  <Button disabled>
                    {currentStep + 1} / {calculationSteps.length}
                  </Button>
                  <Button onClick={nextStep} disabled={currentStep === calculationSteps.length - 1}>
                    <AddIcon />
                  </Button>
                </ButtonGroup>
              )}
              
              {!showCalculation && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCheckAnswer}
                  disabled={!userInput}
                  startIcon={<CheckIcon />}
                >
                  答え合わせ
                </Button>
              )}
              
              <IconButton onClick={onNewProblem} color="secondary">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
          
          {/* ヒントエリア */}
          <Collapse in={showHint} orientation="horizontal">
            <Box sx={{ width: 250 }}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  backgroundColor: theme.palette.warning.light + '20',
                  border: `2px solid ${theme.palette.warning.main}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <HintIcon color="warning" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    ヒント
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {hint || problem.hint || '小数点の位置を縦に揃えて、右から順番に計算してみよう！'}
                </Typography>
              </Paper>
            </Box>
          </Collapse>
        </Box>
        
        {/* フィードバック表示 */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    backgroundColor: isCorrect 
                      ? theme.palette.success.light + '20'
                      : theme.palette.error.light + '20',
                    border: `2px solid ${isCorrect ? theme.palette.success.main : theme.palette.error.main}`
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: isCorrect ? theme.palette.success.dark : theme.palette.error.dark,
                      fontWeight: 'bold'
                    }}
                  >
                    {isCorrect ? '正解！すばらしい！' : 'もう一度考えてみよう'}
                  </Typography>
                  {isCorrect && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      答え: {problem.answer.displayString}
                    </Typography>
                  )}
                </Paper>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </Box>
  );
};

// ヘルパー関数：位置に応じたオフセットを取得
function getPositionOffset(position: string): string {
  const offsets = {
    hundredths: '10px',
    tenths: '35px',
    ones: '70px',
    tens: '95px',
    hundreds: '120px'
  };
  return offsets[position as keyof typeof offsets] || '0px';
}

// ヘルパー関数：部分的な答えを構築
function buildPartialAnswer(steps: CalculationStep[], currentStep: number): string {
  let answer = '   .  ';
  
  for (let i = 0; i <= currentStep; i++) {
    const step = steps[i];
    switch (step.position) {
      case 'hundredths':
        answer = answer.substring(0, 5) + step.value;
        break;
      case 'tenths':
        answer = answer.substring(0, 4) + step.value + answer.substring(5);
        break;
      case 'ones':
        answer = answer.substring(0, 2) + step.value + answer.substring(3);
        break;
      case 'tens':
        answer = answer.substring(0, 1) + step.value + answer.substring(2);
        break;
      case 'hundreds':
        answer = step.value + answer.substring(1);
        break;
    }
  }
  
  return answer;
}