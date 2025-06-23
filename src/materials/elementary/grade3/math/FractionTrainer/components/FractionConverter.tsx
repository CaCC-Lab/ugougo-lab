/**
 * 分数変換コンポーネント
 * 
 * 機能：
 * - 約分の練習
 * - 通分の練習
 * - 帯分数⇔仮分数の変換
 * - 最大公約数・最小公倍数の視覚化
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  LinearProgress
} from '@mui/material';
import {
  CompareArrows as ConvertIcon,
  Check as CheckIcon,
  Close as ClearIcon,
  HelpOutline as HintIcon,
  Lightbulb as LightbulbIcon,
  Functions as CalculateIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { Fraction } from '../types';

interface FractionConverterProps {
  mode: 'simplify' | 'expand' | 'convert' | 'all';
  onConvert?: (from: Fraction | Fraction[], to: Fraction | Fraction[]) => void;
  showHints?: boolean;
  showFactors?: boolean;
  practiceMode?: boolean;
}

export const FractionConverter: React.FC<FractionConverterProps> = ({
  mode = 'all',
  onConvert,
  showHints = true,
  showFactors = true,
  practiceMode = false
}) => {
  const [selectedMode, setSelectedMode] = useState<'simplify' | 'expand' | 'convert'>(
    mode === 'all' ? 'simplify' : mode
  );
  
  // 約分用の状態
  const [simplifyInput, setSimplifyInput] = useState<Fraction>({
    numerator: 6,
    denominator: 8,
    wholeNumber: 0,
    isNegative: false
  });
  const [simplifyResult, setSimplifyResult] = useState<Fraction | null>(null);
  const [simplifyFactors, setSimplifyFactors] = useState<number[]>([]);
  
  // 通分用の状態
  const [expandInput1, setExpandInput1] = useState<Fraction>({
    numerator: 1,
    denominator: 3,
    wholeNumber: 0,
    isNegative: false
  });
  const [expandInput2, setExpandInput2] = useState<Fraction>({
    numerator: 1,
    denominator: 4,
    wholeNumber: 0,
    isNegative: false
  });
  const [expandResult, setExpandResult] = useState<[Fraction, Fraction] | null>(null);
  const [commonMultiples, setCommonMultiples] = useState<number[]>([]);
  
  // 変換用の状態
  const [convertInput, setConvertInput] = useState<Fraction>({
    numerator: 7,
    denominator: 3,
    wholeNumber: 0,
    isNegative: false
  });
  const [convertResult, setConvertResult] = useState<Fraction | null>(null);
  const [convertMode, setConvertMode] = useState<'toMixed' | 'toImproper'>('toMixed');
  
  // 共通状態
  const [showResult, setShowResult] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState<Fraction | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  /**
   * 最大公約数を計算
   */
  const gcd = (a: number, b: number): number => {
    return b === 0 ? Math.abs(a) : gcd(b, a % b);
  };
  
  /**
   * 最小公倍数を計算
   */
  const lcm = (a: number, b: number): number => {
    return Math.abs(a * b) / gcd(a, b);
  };
  
  /**
   * 約数を見つける
   */
  const findFactors = (n: number): number[] => {
    const factors: number[] = [];
    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        factors.push(i);
        if (i !== n / i) {
          factors.push(n / i);
        }
      }
    }
    return factors.sort((a, b) => a - b);
  };
  
  /**
   * 公約数を見つける
   */
  const findCommonFactors = (a: number, b: number): number[] => {
    const factorsA = findFactors(a);
    const factorsB = findFactors(b);
    return factorsA.filter(f => factorsB.includes(f));
  };
  
  /**
   * 公倍数を見つける（最初の5つ）
   */
  const findCommonMultiples = (a: number, b: number, count: number = 5): number[] => {
    const multiples: number[] = [];
    const lcmValue = lcm(a, b);
    for (let i = 1; i <= count; i++) {
      multiples.push(lcmValue * i);
    }
    return multiples;
  };
  
  /**
   * 約分を実行
   */
  const simplifyFraction = () => {
    const divisor = gcd(simplifyInput.numerator, simplifyInput.denominator);
    const result: Fraction = {
      numerator: simplifyInput.numerator / divisor,
      denominator: simplifyInput.denominator / divisor,
      wholeNumber: simplifyInput.wholeNumber,
      isNegative: simplifyInput.isNegative
    };
    
    setSimplifyResult(result);
    setSimplifyFactors(findCommonFactors(simplifyInput.numerator, simplifyInput.denominator));
    setShowResult(true);
    setCurrentStep(0);
    
    if (onConvert) {
      onConvert(simplifyInput, result);
    }
  };
  
  /**
   * 通分を実行
   */
  const expandFractions = () => {
    const lcmValue = lcm(expandInput1.denominator, expandInput2.denominator);
    
    const result1: Fraction = {
      numerator: expandInput1.numerator * (lcmValue / expandInput1.denominator),
      denominator: lcmValue,
      wholeNumber: expandInput1.wholeNumber,
      isNegative: expandInput1.isNegative
    };
    
    const result2: Fraction = {
      numerator: expandInput2.numerator * (lcmValue / expandInput2.denominator),
      denominator: lcmValue,
      wholeNumber: expandInput2.wholeNumber,
      isNegative: expandInput2.isNegative
    };
    
    setExpandResult([result1, result2]);
    setCommonMultiples(findCommonMultiples(expandInput1.denominator, expandInput2.denominator));
    setShowResult(true);
    setCurrentStep(0);
    
    if (onConvert) {
      onConvert([expandInput1, expandInput2], [result1, result2]);
    }
  };
  
  /**
   * 帯分数⇔仮分数の変換
   */
  const convertFraction = () => {
    let result: Fraction;
    
    if (convertMode === 'toMixed') {
      // 仮分数→帯分数
      const wholeNumber = Math.floor(convertInput.numerator / convertInput.denominator);
      const remainder = convertInput.numerator % convertInput.denominator;
      
      result = {
        numerator: remainder,
        denominator: convertInput.denominator,
        wholeNumber,
        isNegative: convertInput.isNegative
      };
    } else {
      // 帯分数→仮分数
      const numerator = convertInput.wholeNumber! * convertInput.denominator + convertInput.numerator;
      
      result = {
        numerator,
        denominator: convertInput.denominator,
        wholeNumber: 0,
        isNegative: convertInput.isNegative
      };
    }
    
    setConvertResult(result);
    setShowResult(true);
    setCurrentStep(0);
    
    if (onConvert) {
      onConvert(convertInput, result);
    }
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
    if (fraction.numerator > 0) {
      result += `${fraction.numerator}/${fraction.denominator}`;
    } else if (!fraction.wholeNumber) {
      result += '0';
    }
    return result;
  };
  
  /**
   * 答えをチェック（練習モード）
   */
  const checkAnswer = () => {
    if (!userAnswer) return;
    
    let correct = false;
    
    switch (selectedMode) {
      case 'simplify':
        if (simplifyResult) {
          correct = userAnswer.numerator === simplifyResult.numerator &&
                   userAnswer.denominator === simplifyResult.denominator;
        }
        break;
      case 'expand':
        // 通分の場合は最初の分数をチェック
        if (expandResult) {
          correct = userAnswer.numerator === expandResult[0].numerator &&
                   userAnswer.denominator === expandResult[0].denominator;
        }
        break;
      case 'convert':
        if (convertResult) {
          correct = userAnswer.numerator === convertResult.numerator &&
                   userAnswer.denominator === convertResult.denominator &&
                   userAnswer.wholeNumber === convertResult.wholeNumber;
        }
        break;
    }
    
    setIsCorrect(correct);
  };
  
  /**
   * リセット
   */
  const reset = () => {
    setShowResult(false);
    setCurrentStep(0);
    setUserAnswer(null);
    setIsCorrect(null);
    setSimplifyResult(null);
    setExpandResult(null);
    setConvertResult(null);
  };
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Paper elevation={3} sx={{ p: 3, height: '100%', overflow: 'auto' }}>
        {/* モード選択（allモードの場合） */}
        {mode === 'all' && (
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedMode === 'simplify' ? 2 : 0,
                    borderColor: 'primary.main'
                  }}
                  onClick={() => {
                    setSelectedMode('simplify');
                    reset();
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" align="center">
                      約分
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      分数を簡単にする
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedMode === 'expand' ? 2 : 0,
                    borderColor: 'primary.main'
                  }}
                  onClick={() => {
                    setSelectedMode('expand');
                    reset();
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" align="center">
                      通分
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      分母をそろえる
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedMode === 'convert' ? 2 : 0,
                    borderColor: 'primary.main'
                  }}
                  onClick={() => {
                    setSelectedMode('convert');
                    reset();
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" align="center">
                      変換
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      帯分数⇔仮分数
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* 約分モード */}
        {selectedMode === 'simplify' && (
          <Box>
            <Typography variant="h5" gutterBottom>
              約分の練習
            </Typography>
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      約分する分数
                    </Typography>
                    <Box sx={{ textAlign: 'center' }}>
                      <TextField
                        label="分子"
                        type="number"
                        value={simplifyInput.numerator}
                        onChange={(e) => setSimplifyInput({
                          ...simplifyInput,
                          numerator: parseInt(e.target.value) || 0
                        })}
                        sx={{ width: 100 }}
                      />
                      <Divider sx={{ my: 1 }} />
                      <TextField
                        label="分母"
                        type="number"
                        value={simplifyInput.denominator}
                        onChange={(e) => setSimplifyInput({
                          ...simplifyInput,
                          denominator: parseInt(e.target.value) || 1
                        })}
                        sx={{ width: 100 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={1}>
                <Box sx={{ textAlign: 'center' }}>
                  <ArrowIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                {practiceMode && !showResult ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        あなたの答え
                      </Typography>
                      <Box sx={{ textAlign: 'center' }}>
                        <TextField
                          label="分子"
                          type="number"
                          value={userAnswer?.numerator || ''}
                          onChange={(e) => setUserAnswer({
                            ...userAnswer!,
                            numerator: parseInt(e.target.value) || 0,
                            denominator: userAnswer?.denominator || 1,
                            wholeNumber: 0,
                            isNegative: false
                          })}
                          sx={{ width: 100 }}
                        />
                        <Divider sx={{ my: 1 }} />
                        <TextField
                          label="分母"
                          type="number"
                          value={userAnswer?.denominator || ''}
                          onChange={(e) => setUserAnswer({
                            ...userAnswer!,
                            numerator: userAnswer?.numerator || 0,
                            denominator: parseInt(e.target.value) || 1,
                            wholeNumber: 0,
                            isNegative: false
                          })}
                          sx={{ width: 100 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ) : showResult && simplifyResult ? (
                  <Card sx={{ backgroundColor: '#E8F5E9' }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        約分後
                      </Typography>
                      <Typography variant="h4" align="center">
                        {formatFraction(simplifyResult)}
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Card variant="outlined" sx={{ opacity: 0.5 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        結果
                      </Typography>
                      <Typography variant="h4" align="center" color="text.secondary">
                        ?
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
              
              <Grid item xs={12} sm={3}>
                {practiceMode && userAnswer && !showResult ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      simplifyFraction();
                      checkAnswer();
                    }}
                    fullWidth
                  >
                    答え合わせ
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={simplifyFraction}
                      startIcon={<CalculateIcon />}
                      fullWidth
                    >
                      約分
                    </Button>
                    <Tooltip title="リセット">
                      <IconButton onClick={reset}>
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Grid>
            </Grid>
            
            {/* 結果とヒント */}
            <Collapse in={showResult}>
              <Box sx={{ mt: 3 }}>
                {isCorrect !== null && (
                  <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mb: 2 }}>
                    {isCorrect ? '正解！よくできました！' : '惜しい！もう一度考えてみよう'}
                  </Alert>
                )}
                
                {showFactors && simplifyFactors.length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        公約数
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {simplifyFactors.map(factor => (
                          <Chip
                            key={factor}
                            label={factor}
                            color={factor === gcd(simplifyInput.numerator, simplifyInput.denominator) ? 'primary' : 'default'}
                            variant={factor === gcd(simplifyInput.numerator, simplifyInput.denominator) ? 'filled' : 'outlined'}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        最大公約数: {gcd(simplifyInput.numerator, simplifyInput.denominator)}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
                
                {showHints && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        💡 ヒント: {simplifyInput.numerator}と{simplifyInput.denominator}の最大公約数は
                        {gcd(simplifyInput.numerator, simplifyInput.denominator)}です。
                        分子と分母をこの数で割りましょう。
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>
        )}
        
        {/* 通分モード */}
        {selectedMode === 'expand' && (
          <Box>
            <Typography variant="h5" gutterBottom>
              通分の練習
            </Typography>
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={5}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom align="center">
                          1つ目
                        </Typography>
                        <Box sx={{ textAlign: 'center' }}>
                          <TextField
                            label="分子"
                            type="number"
                            value={expandInput1.numerator}
                            onChange={(e) => setExpandInput1({
                              ...expandInput1,
                              numerator: parseInt(e.target.value) || 0
                            })}
                            sx={{ width: 80 }}
                            size="small"
                          />
                          <Divider sx={{ my: 1 }} />
                          <TextField
                            label="分母"
                            type="number"
                            value={expandInput1.denominator}
                            onChange={(e) => setExpandInput1({
                              ...expandInput1,
                              denominator: parseInt(e.target.value) || 1
                            })}
                            sx={{ width: 80 }}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom align="center">
                          2つ目
                        </Typography>
                        <Box sx={{ textAlign: 'center' }}>
                          <TextField
                            label="分子"
                            type="number"
                            value={expandInput2.numerator}
                            onChange={(e) => setExpandInput2({
                              ...expandInput2,
                              numerator: parseInt(e.target.value) || 0
                            })}
                            sx={{ width: 80 }}
                            size="small"
                          />
                          <Divider sx={{ my: 1 }} />
                          <TextField
                            label="分母"
                            type="number"
                            value={expandInput2.denominator}
                            onChange={(e) => setExpandInput2({
                              ...expandInput2,
                              denominator: parseInt(e.target.value) || 1
                            })}
                            sx={{ width: 80 }}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} sm={1}>
                <Box sx={{ textAlign: 'center' }}>
                  <ArrowIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                {showResult && expandResult ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card sx={{ backgroundColor: '#E8F5E9' }}>
                        <CardContent>
                          <Typography variant="h5" align="center">
                            {formatFraction(expandResult[0])}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card sx={{ backgroundColor: '#E8F5E9' }}>
                        <CardContent>
                          <Typography variant="h5" align="center">
                            {formatFraction(expandResult[1])}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Card variant="outlined" sx={{ opacity: 0.5 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom align="center">
                        通分後
                      </Typography>
                      <Typography variant="h5" align="center" color="text.secondary">
                        ? / ?
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={expandFractions}
                    fullWidth
                  >
                    通分
                  </Button>
                  <Tooltip title="リセット">
                    <IconButton onClick={reset}>
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
            
            {/* 結果とヒント */}
            <Collapse in={showResult}>
              <Box sx={{ mt: 3 }}>
                {showFactors && commonMultiples.length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        公倍数
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {commonMultiples.map((multiple, index) => (
                          <Chip
                            key={multiple}
                            label={multiple}
                            color={index === 0 ? 'primary' : 'default'}
                            variant={index === 0 ? 'filled' : 'outlined'}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        最小公倍数: {lcm(expandInput1.denominator, expandInput2.denominator)}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
                
                {showHints && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      💡 ヒント: {expandInput1.denominator}と{expandInput2.denominator}の最小公倍数は
                      {lcm(expandInput1.denominator, expandInput2.denominator)}です。
                      両方の分母をこの数にしましょう。
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Collapse>
          </Box>
        )}
        
        {/* 変換モード */}
        {selectedMode === 'convert' && (
          <Box>
            <Typography variant="h5" gutterBottom>
              帯分数⇔仮分数の変換
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant={convertMode === 'toMixed' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setConvertMode('toMixed');
                      setConvertInput({ ...convertInput, wholeNumber: 0 });
                      reset();
                    }}
                  >
                    仮分数→帯分数
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant={convertMode === 'toImproper' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setConvertMode('toImproper');
                      setConvertInput({ ...convertInput, wholeNumber: 2, numerator: 1, denominator: 3 });
                      reset();
                    }}
                  >
                    帯分数→仮分数
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      変換前
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {convertMode === 'toImproper' && (
                        <TextField
                          label="整数"
                          type="number"
                          value={convertInput.wholeNumber || ''}
                          onChange={(e) => setConvertInput({
                            ...convertInput,
                            wholeNumber: parseInt(e.target.value) || 0
                          })}
                          sx={{ width: 80 }}
                        />
                      )}
                      <Box sx={{ textAlign: 'center' }}>
                        <TextField
                          label="分子"
                          type="number"
                          value={convertInput.numerator}
                          onChange={(e) => setConvertInput({
                            ...convertInput,
                            numerator: parseInt(e.target.value) || 0
                          })}
                          sx={{ width: 80 }}
                        />
                        <Divider sx={{ my: 1 }} />
                        <TextField
                          label="分母"
                          type="number"
                          value={convertInput.denominator}
                          onChange={(e) => setConvertInput({
                            ...convertInput,
                            denominator: parseInt(e.target.value) || 1
                          })}
                          sx={{ width: 80 }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={1}>
                <Box sx={{ textAlign: 'center' }}>
                  <ConvertIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                {showResult && convertResult ? (
                  <Card sx={{ backgroundColor: '#E8F5E9' }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        変換後
                      </Typography>
                      <Typography variant="h4" align="center">
                        {formatFraction(convertResult)}
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Card variant="outlined" sx={{ opacity: 0.5 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        結果
                      </Typography>
                      <Typography variant="h4" align="center" color="text.secondary">
                        ?
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={convertFraction}
                    startIcon={<ConvertIcon />}
                    fullWidth
                  >
                    変換
                  </Button>
                  <Tooltip title="リセット">
                    <IconButton onClick={reset}>
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
            
            {/* ヒント */}
            <Collapse in={showResult}>
              <Box sx={{ mt: 3 }}>
                {showHints && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      {convertMode === 'toMixed' ? (
                        <>
                          💡 ヒント: {convertInput.numerator} ÷ {convertInput.denominator} = 
                          {Math.floor(convertInput.numerator / convertInput.denominator)} 余り 
                          {convertInput.numerator % convertInput.denominator}
                        </>
                      ) : (
                        <>
                          💡 ヒント: {convertInput.wholeNumber} × {convertInput.denominator} + 
                          {convertInput.numerator} = 
                          {convertInput.wholeNumber! * convertInput.denominator + convertInput.numerator}
                        </>
                      )}
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Collapse>
          </Box>
        )}
      </Paper>
    </Box>
  );
};