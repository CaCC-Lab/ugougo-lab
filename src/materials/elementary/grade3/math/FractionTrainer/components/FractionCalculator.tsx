/**
 * 分数計算機コンポーネント
 * 
 * 機能：
 * - 四則演算の入力と計算
 * - ステップバイステップの解法表示
 * - 約分・通分の自動処理
 * - 帯分数・仮分数の変換
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  ButtonGroup,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as SubtractIcon,
  Close as MultiplyIcon,
  FunctionsOutlined as DivideIcon,
  Calculate as CalculateIcon,
  Refresh as ClearIcon,
  SwapHoriz as ConvertIcon,
  Check as CheckIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { Fraction, FractionOperation } from '../types';

interface FractionCalculatorProps {
  onCalculate?: (operation: FractionOperation) => void;
  onValidate?: (userAnswer: Fraction) => void;
  showSteps?: boolean;
  allowMixedNumbers?: boolean;
  autoSimplify?: boolean;
  maxValue?: number;
}

export const FractionCalculator: React.FC<FractionCalculatorProps> = ({
  onCalculate,
  onValidate,
  showSteps = true,
  allowMixedNumbers = true,
  autoSimplify = true,
  maxValue = 100
}) => {
  // 入力状態
  const [fraction1, setFraction1] = useState<Fraction>({
    numerator: 1,
    denominator: 2,
    wholeNumber: 0,
    isNegative: false
  });
  
  const [fraction2, setFraction2] = useState<Fraction>({
    numerator: 1,
    denominator: 4,
    wholeNumber: 0,
    isNegative: false
  });
  
  const [operation, setOperation] = useState<'add' | 'subtract' | 'multiply' | 'divide'>('add');
  const [result, setResult] = useState<FractionOperation | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputMode, setInputMode] = useState<'improper' | 'mixed'>('improper');
  
  /**
   * 分数入力の更新
   */
  const updateFraction = (
    fractionIndex: 1 | 2,
    field: keyof Fraction,
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    if (numValue > maxValue) return;
    
    const updateFunc = fractionIndex === 1 ? setFraction1 : setFraction2;
    updateFunc(prev => ({
      ...prev,
      [field]: field === 'isNegative' ? value === 'true' : numValue
    }));
  };
  
  /**
   * 最大公約数を計算
   */
  const gcd = (a: number, b: number): number => {
    return b === 0 ? Math.abs(a) : gcd(b, a % b);
  };
  
  /**
   * 分数を約分
   */
  const simplifyFraction = (fraction: Fraction): Fraction => {
    const divisor = gcd(Math.abs(fraction.numerator), Math.abs(fraction.denominator));
    
    return {
      numerator: fraction.numerator / divisor,
      denominator: fraction.denominator / divisor,
      wholeNumber: fraction.wholeNumber,
      isNegative: fraction.isNegative
    };
  };
  
  /**
   * 帯分数を仮分数に変換
   */
  const toImproperFraction = (fraction: Fraction): Fraction => {
    if (!fraction.wholeNumber) return fraction;
    
    const numerator = Math.abs(fraction.wholeNumber) * fraction.denominator + fraction.numerator;
    
    return {
      numerator,
      denominator: fraction.denominator,
      isNegative: fraction.isNegative || fraction.wholeNumber < 0
    };
  };
  
  /**
   * 仮分数を帯分数に変換
   */
  const toMixedNumber = (fraction: Fraction): Fraction => {
    if (fraction.numerator < fraction.denominator) return fraction;
    
    const wholeNumber = Math.floor(fraction.numerator / fraction.denominator);
    const remainder = fraction.numerator % fraction.denominator;
    
    return {
      numerator: remainder,
      denominator: fraction.denominator,
      wholeNumber,
      isNegative: fraction.isNegative
    };
  };
  
  /**
   * 計算を実行
   */
  const calculate = () => {
    // 分母が0でないことを確認
    if (fraction1.denominator === 0 || fraction2.denominator === 0) {
      alert('分母は0にできません');
      return;
    }
    
    // 帯分数を仮分数に変換
    const f1 = toImproperFraction(fraction1);
    const f2 = toImproperFraction(fraction2);
    
    let resultOperation: FractionOperation;
    
    switch (operation) {
      case 'add':
        resultOperation = addFractions(f1, f2);
        break;
      case 'subtract':
        resultOperation = subtractFractions(f1, f2);
        break;
      case 'multiply':
        resultOperation = multiplyFractions(f1, f2);
        break;
      case 'divide':
        if (f2.numerator === 0) {
          alert('0で割ることはできません');
          return;
        }
        resultOperation = divideFractions(f1, f2);
        break;
    }
    
    setResult(resultOperation);
    setShowResult(true);
    setCurrentStep(0);
    
    if (onCalculate) {
      onCalculate(resultOperation);
    }
  };
  
  /**
   * 分数の足し算
   */
  const addFractions = (f1: Fraction, f2: Fraction): FractionOperation => {
    const steps: { description: string; fractions: Fraction[] }[] = [];
    
    if (f1.denominator === f2.denominator) {
      // 同分母
      const result = {
        numerator: f1.numerator + f2.numerator,
        denominator: f1.denominator,
        isNegative: false
      };
      steps.push({
        description: '分母が同じなので分子を足す',
        fractions: [result]
      });
      
      if (autoSimplify) {
        const simplified = simplifyFraction(result);
        if (simplified.numerator !== result.numerator) {
          steps.push({
            description: '約分する',
            fractions: [simplified]
          });
        }
        return { type: 'add', operand1: f1, operand2: f2, result: simplified, steps };
      }
      
      return { type: 'add', operand1: f1, operand2: f2, result, steps };
    } else {
      // 異分母
      const lcm = (f1.denominator * f2.denominator) / gcd(f1.denominator, f2.denominator);
      const factor1 = lcm / f1.denominator;
      const factor2 = lcm / f2.denominator;
      
      const common1 = {
        numerator: f1.numerator * factor1,
        denominator: lcm,
        isNegative: f1.isNegative
      };
      const common2 = {
        numerator: f2.numerator * factor2,
        denominator: lcm,
        isNegative: f2.isNegative
      };
      
      steps.push({
        description: `通分する（最小公倍数: ${lcm}）`,
        fractions: [common1, common2]
      });
      
      const result = {
        numerator: common1.numerator + common2.numerator,
        denominator: lcm,
        isNegative: false
      };
      steps.push({
        description: '分子を足す',
        fractions: [result]
      });
      
      if (autoSimplify) {
        const simplified = simplifyFraction(result);
        if (simplified.numerator !== result.numerator) {
          steps.push({
            description: '約分する',
            fractions: [simplified]
          });
        }
        return { type: 'add', operand1: f1, operand2: f2, result: simplified, steps };
      }
      
      return { type: 'add', operand1: f1, operand2: f2, result, steps };
    }
  };
  
  /**
   * 分数の引き算
   */
  const subtractFractions = (f1: Fraction, f2: Fraction): FractionOperation => {
    const steps: { description: string; fractions: Fraction[] }[] = [];
    
    if (f1.denominator === f2.denominator) {
      // 同分母
      const numeratorDiff = f1.numerator - f2.numerator;
      const result = {
        numerator: Math.abs(numeratorDiff),
        denominator: f1.denominator,
        isNegative: numeratorDiff < 0
      };
      steps.push({
        description: '分母が同じなので分子を引く',
        fractions: [result]
      });
      
      if (autoSimplify) {
        const simplified = simplifyFraction(result);
        if (simplified.numerator !== result.numerator) {
          steps.push({
            description: '約分する',
            fractions: [simplified]
          });
        }
        return { type: 'subtract', operand1: f1, operand2: f2, result: simplified, steps };
      }
      
      return { type: 'subtract', operand1: f1, operand2: f2, result, steps };
    } else {
      // 異分母
      const lcm = (f1.denominator * f2.denominator) / gcd(f1.denominator, f2.denominator);
      const factor1 = lcm / f1.denominator;
      const factor2 = lcm / f2.denominator;
      
      const common1 = {
        numerator: f1.numerator * factor1,
        denominator: lcm,
        isNegative: f1.isNegative
      };
      const common2 = {
        numerator: f2.numerator * factor2,
        denominator: lcm,
        isNegative: f2.isNegative
      };
      
      steps.push({
        description: `通分する（最小公倍数: ${lcm}）`,
        fractions: [common1, common2]
      });
      
      const numeratorDiff = common1.numerator - common2.numerator;
      const result = {
        numerator: Math.abs(numeratorDiff),
        denominator: lcm,
        isNegative: numeratorDiff < 0
      };
      steps.push({
        description: '分子を引く',
        fractions: [result]
      });
      
      if (autoSimplify) {
        const simplified = simplifyFraction(result);
        if (simplified.numerator !== result.numerator) {
          steps.push({
            description: '約分する',
            fractions: [simplified]
          });
        }
        return { type: 'subtract', operand1: f1, operand2: f2, result: simplified, steps };
      }
      
      return { type: 'subtract', operand1: f1, operand2: f2, result, steps };
    }
  };
  
  /**
   * 分数のかけ算
   */
  const multiplyFractions = (f1: Fraction, f2: Fraction): FractionOperation => {
    const steps: { description: string; fractions: Fraction[] }[] = [];
    
    const result = {
      numerator: f1.numerator * f2.numerator,
      denominator: f1.denominator * f2.denominator,
      isNegative: f1.isNegative !== f2.isNegative
    };
    steps.push({
      description: '分子同士、分母同士をかける',
      fractions: [result]
    });
    
    if (autoSimplify) {
      const simplified = simplifyFraction(result);
      if (simplified.numerator !== result.numerator) {
        steps.push({
          description: '約分する',
          fractions: [simplified]
        });
      }
      return { type: 'multiply', operand1: f1, operand2: f2, result: simplified, steps };
    }
    
    return { type: 'multiply', operand1: f1, operand2: f2, result, steps };
  };
  
  /**
   * 分数のわり算
   */
  const divideFractions = (f1: Fraction, f2: Fraction): FractionOperation => {
    const steps: { description: string; fractions: Fraction[] }[] = [];
    
    const reciprocal = {
      numerator: f2.denominator,
      denominator: f2.numerator,
      isNegative: f2.isNegative
    };
    steps.push({
      description: '除数の逆数を作る',
      fractions: [reciprocal]
    });
    
    const result = {
      numerator: f1.numerator * reciprocal.numerator,
      denominator: f1.denominator * reciprocal.denominator,
      isNegative: f1.isNegative !== reciprocal.isNegative
    };
    steps.push({
      description: '逆数をかける',
      fractions: [result]
    });
    
    if (autoSimplify) {
      const simplified = simplifyFraction(result);
      if (simplified.numerator !== result.numerator) {
        steps.push({
          description: '約分する',
          fractions: [simplified]
        });
      }
      return { type: 'divide', operand1: f1, operand2: f2, result: simplified, steps };
    }
    
    return { type: 'divide', operand1: f1, operand2: f2, result, steps };
  };
  
  /**
   * 分数を文字列形式で表示
   */
  const formatFraction = (fraction: Fraction): string => {
    let result = '';
    if (fraction.isNegative) result += '-';
    if (fraction.wholeNumber) {
      result += `${fraction.wholeNumber} `;
    }
    result += `${fraction.numerator}/${fraction.denominator}`;
    return result;
  };
  
  /**
   * クリア
   */
  const clear = () => {
    setFraction1({ numerator: 1, denominator: 2, wholeNumber: 0, isNegative: false });
    setFraction2({ numerator: 1, denominator: 4, wholeNumber: 0, isNegative: false });
    setResult(null);
    setShowResult(false);
    setCurrentStep(0);
  };
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Paper elevation={3} sx={{ p: 3, height: '100%', overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          分数計算機
        </Typography>
        
        {/* 入力モード切り替え */}
        {allowMixedNumbers && (
          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup
              value={inputMode}
              exclusive
              onChange={(_, newMode) => {
                if (newMode) setInputMode(newMode);
              }}
              size="small"
            >
              <ToggleButton value="improper">
                仮分数
              </ToggleButton>
              <ToggleButton value="mixed">
                帯分数
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}
        
        {/* 分数入力 */}
        <Grid container spacing={2} alignItems="center">
          {/* 分数1 */}
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  1つ目の分数
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {inputMode === 'mixed' && (
                    <TextField
                      label="整数"
                      type="number"
                      value={fraction1.wholeNumber || ''}
                      onChange={(e) => updateFraction(1, 'wholeNumber', e.target.value)}
                      sx={{ width: 80 }}
                      size="small"
                    />
                  )}
                  <Box sx={{ textAlign: 'center' }}>
                    <TextField
                      label="分子"
                      type="number"
                      value={fraction1.numerator}
                      onChange={(e) => updateFraction(1, 'numerator', e.target.value)}
                      sx={{ width: 80 }}
                      size="small"
                    />
                    <Divider sx={{ my: 1 }} />
                    <TextField
                      label="分母"
                      type="number"
                      value={fraction1.denominator}
                      onChange={(e) => updateFraction(1, 'denominator', e.target.value)}
                      sx={{ width: 80 }}
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* 演算子 */}
          <Grid item xs={12} sm={1}>
            <Box sx={{ textAlign: 'center' }}>
              <ButtonGroup
                orientation="vertical"
                variant="outlined"
                size="small"
              >
                <Button
                  onClick={() => setOperation('add')}
                  variant={operation === 'add' ? 'contained' : 'outlined'}
                >
                  <AddIcon />
                </Button>
                <Button
                  onClick={() => setOperation('subtract')}
                  variant={operation === 'subtract' ? 'contained' : 'outlined'}
                >
                  <SubtractIcon />
                </Button>
                <Button
                  onClick={() => setOperation('multiply')}
                  variant={operation === 'multiply' ? 'contained' : 'outlined'}
                >
                  <MultiplyIcon />
                </Button>
                <Button
                  onClick={() => setOperation('divide')}
                  variant={operation === 'divide' ? 'contained' : 'outlined'}
                >
                  <DivideIcon />
                </Button>
              </ButtonGroup>
            </Box>
          </Grid>
          
          {/* 分数2 */}
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  2つ目の分数
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {inputMode === 'mixed' && (
                    <TextField
                      label="整数"
                      type="number"
                      value={fraction2.wholeNumber || ''}
                      onChange={(e) => updateFraction(2, 'wholeNumber', e.target.value)}
                      sx={{ width: 80 }}
                      size="small"
                    />
                  )}
                  <Box sx={{ textAlign: 'center' }}>
                    <TextField
                      label="分子"
                      type="number"
                      value={fraction2.numerator}
                      onChange={(e) => updateFraction(2, 'numerator', e.target.value)}
                      sx={{ width: 80 }}
                      size="small"
                    />
                    <Divider sx={{ my: 1 }} />
                    <TextField
                      label="分母"
                      type="number"
                      value={fraction2.denominator}
                      onChange={(e) => updateFraction(2, 'denominator', e.target.value)}
                      sx={{ width: 80 }}
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* 計算ボタン */}
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={calculate}
                startIcon={<CalculateIcon />}
                fullWidth
              >
                計算
              </Button>
              <Tooltip title="クリア">
                <IconButton onClick={clear} color="secondary">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
        
        {/* 結果表示 */}
        <Collapse in={showResult}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            
            {result && (
              <>
                {/* 計算式と答え */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontFamily: 'monospace' }}>
                    {formatFraction(toImproperFraction(fraction1))}
                    {' '}
                    {operation === 'add' && '+'}
                    {operation === 'subtract' && '-'}
                    {operation === 'multiply' && '×'}
                    {operation === 'divide' && '÷'}
                    {' '}
                    {formatFraction(toImproperFraction(fraction2))}
                    {' = '}
                    <Chip
                      label={formatFraction(result.result)}
                      color="primary"
                      sx={{ fontSize: '1.2rem', height: 'auto', p: 1 }}
                    />
                  </Typography>
                  
                  {allowMixedNumbers && result.result.numerator >= result.result.denominator && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        帯分数: {formatFraction(toMixedNumber(result.result))}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {/* 計算過程 */}
                {showSteps && result.steps.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      計算過程:
                    </Typography>
                    <Stepper activeStep={currentStep} orientation="vertical">
                      {result.steps.map((step, index) => (
                        <Step key={index} completed={index < currentStep}>
                          <StepLabel>{step.description}</StepLabel>
                          <StepContent>
                            <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                              <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                                {step.fractions.map((f, i) => (
                                  <span key={i}>
                                    {i > 0 && ' = '}
                                    {formatFraction(f)}
                                  </span>
                                ))}
                              </Typography>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => setCurrentStep(index + 1)}
                                disabled={index >= result.steps.length - 1}
                              >
                                次へ
                              </Button>
                            </Box>
                          </StepContent>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
};