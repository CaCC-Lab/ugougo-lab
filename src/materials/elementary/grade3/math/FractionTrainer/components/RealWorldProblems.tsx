/**
 * 実生活応用問題コンポーネント
 * 
 * 機能：
 * - 料理、時間、お金などの実生活シーン
 * - ビジュアル付き問題
 * - 段階的ヒント
 * - インタラクティブな解答
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Grid,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import {
  Restaurant as CookingIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Construction as ConstructionIcon,
  SportsSoccer as SportsIcon,
  Palette as ArtIcon,
  Help as HintIcon,
  Check as CheckIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Lightbulb as IdeaIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { Fraction, RealWorldContext } from '../types';

interface RealWorldProblemsProps {
  category?: 'cooking' | 'time' | 'money' | 'construction' | 'sports' | 'art' | 'all';
  difficulty?: 1 | 2 | 3 | 4 | 5;
  onProblemComplete?: (problemId: string, isCorrect: boolean) => void;
  showVisuals?: boolean;
  showStepByStep?: boolean;
}

interface Problem {
  id: string;
  category: string;
  title: string;
  story: string;
  question: string;
  image?: string;
  fractions: Fraction[];
  answer: Fraction;
  hints: string[];
  steps: {
    description: string;
    action: string;
  }[];
}

export const RealWorldProblems: React.FC<RealWorldProblemsProps> = ({
  category = 'all',
  difficulty = 3,
  onProblemComplete,
  showVisuals = true,
  showStepByStep = true
}) => {
  // 問題データ
  const problems: Problem[] = [
    {
      id: 'cooking-1',
      category: 'cooking',
      title: 'ケーキを分けよう',
      story: '誕生日パーティーでケーキを切り分けます。ケーキの3/4が残っていて、それを3人で等しく分けます。',
      question: '1人分は元のケーキの何分のいくつになりますか？',
      image: '🎂',
      fractions: [{ numerator: 3, denominator: 4, wholeNumber: 0, isNegative: false }],
      answer: { numerator: 1, denominator: 4, wholeNumber: 0, isNegative: false },
      hints: [
        '3/4を3人で分けるということは、3/4÷3を計算します',
        'わり算は逆数のかけ算に直せます',
        '3/4 × 1/3 = ?'
      ],
      steps: [
        { description: '残っているケーキの量を確認', action: '3/4' },
        { description: '人数で割る', action: '3/4 ÷ 3' },
        { description: '計算する', action: '3/4 × 1/3 = 3/12 = 1/4' }
      ]
    },
    {
      id: 'time-1',
      category: 'time',
      title: '宿題の時間配分',
      story: '1時間半（1と1/2時間）で3つの科目の宿題をします。それぞれ同じ時間をかけるとします。',
      question: '1つの科目にかける時間は何分ですか？',
      image: '⏰',
      fractions: [{ numerator: 1, denominator: 2, wholeNumber: 1, isNegative: false }],
      answer: { numerator: 30, denominator: 1, wholeNumber: 0, isNegative: false },
      hints: [
        '1時間半は何分でしょうか？',
        '1時間 = 60分、半時間 = 30分',
        '90分を3で割ると...'
      ],
      steps: [
        { description: '時間を分に変換', action: '1時間半 = 90分' },
        { description: '科目数で割る', action: '90分 ÷ 3' },
        { description: '計算する', action: '90 ÷ 3 = 30分' }
      ]
    },
    {
      id: 'money-1',
      category: 'money',
      title: 'お小遣いの貯金',
      story: 'お小遣いの2/5を貯金することにしました。お小遣いが1500円のとき、',
      question: '貯金する金額はいくらですか？',
      image: '💰',
      fractions: [{ numerator: 2, denominator: 5, wholeNumber: 0, isNegative: false }],
      answer: { numerator: 600, denominator: 1, wholeNumber: 0, isNegative: false },
      hints: [
        '1500円の2/5を求めます',
        '「〜の〜」はかけ算です',
        '1500 × 2/5 = ?'
      ],
      steps: [
        { description: 'お小遣いの額を確認', action: '1500円' },
        { description: '貯金の割合をかける', action: '1500 × 2/5' },
        { description: '計算する', action: '(1500 × 2) ÷ 5 = 3000 ÷ 5 = 600円' }
      ]
    },
    {
      id: 'construction-1',
      category: 'construction',
      title: '板を切り分ける',
      story: '長さ3/4メートルの板を、1/8メートルずつに切り分けます。',
      question: 'いくつに切り分けられますか？',
      image: '🪵',
      fractions: [
        { numerator: 3, denominator: 4, wholeNumber: 0, isNegative: false },
        { numerator: 1, denominator: 8, wholeNumber: 0, isNegative: false }
      ],
      answer: { numerator: 6, denominator: 1, wholeNumber: 0, isNegative: false },
      hints: [
        '全体の長さ÷1つ分の長さ',
        '3/4 ÷ 1/8 を計算します',
        'わり算は逆数のかけ算です'
      ],
      steps: [
        { description: '全体の長さ', action: '3/4メートル' },
        { description: '1つ分の長さで割る', action: '3/4 ÷ 1/8' },
        { description: '計算する', action: '3/4 × 8/1 = 24/4 = 6個' }
      ]
    }
  ];
  
  // 状態管理
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<Fraction>({
    numerator: 0,
    denominator: 1,
    wholeNumber: 0,
    isNegative: false
  });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);
  const [completedProblems, setCompletedProblems] = useState<string[]>([]);
  
  // カテゴリーアイコン
  const categoryIcons = {
    cooking: <CookingIcon />,
    time: <TimeIcon />,
    money: <MoneyIcon />,
    construction: <ConstructionIcon />,
    sports: <SportsIcon />,
    art: <ArtIcon />
  };
  
  // フィルタリングされた問題
  const filteredProblems = problems.filter(p => 
    selectedCategory === 'all' || p.category === selectedCategory
  );
  
  const currentProblem = filteredProblems[currentProblemIndex];
  
  /**
   * 答えをチェック
   */
  const checkAnswer = () => {
    if (!currentProblem) return;
    
    const correct = 
      userAnswer.numerator === currentProblem.answer.numerator &&
      userAnswer.denominator === currentProblem.answer.denominator &&
      (userAnswer.wholeNumber || 0) === (currentProblem.answer.wholeNumber || 0);
    
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setCompletedProblems([...completedProblems, currentProblem.id]);
    }
    
    if (onProblemComplete) {
      onProblemComplete(currentProblem.id, correct);
    }
  };
  
  /**
   * 次の問題へ
   */
  const nextProblem = () => {
    if (currentProblemIndex < filteredProblems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      resetProblem();
    }
  };
  
  /**
   * 前の問題へ
   */
  const prevProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
      resetProblem();
    }
  };
  
  /**
   * 問題をリセット
   */
  const resetProblem = () => {
    setUserAnswer({ numerator: 0, denominator: 1, wholeNumber: 0, isNegative: false });
    setShowResult(false);
    setIsCorrect(null);
    setCurrentStep(0);
    setHintsShown(0);
  };
  
  /**
   * ヒントを表示
   */
  const showHint = () => {
    if (currentProblem && hintsShown < currentProblem.hints.length) {
      setHintsShown(hintsShown + 1);
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
  
  if (!currentProblem) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          選択されたカテゴリーに問題がありません
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Paper elevation={3} sx={{ p: 3, height: '100%', overflow: 'auto' }}>
        {/* ヘッダー */}
        <Box sx={{ mb: 3 }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h5">
                実生活の分数問題
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  問題 {currentProblemIndex + 1} / {filteredProblems.length}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(completedProblems.length / filteredProblems.length) * 100}
                  sx={{ width: 100 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* カテゴリー選択（allモードの場合） */}
        {category === 'all' && (
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={1}>
              {Object.entries(categoryIcons).map(([cat, icon]) => (
                <Grid item key={cat}>
                  <Chip
                    icon={icon}
                    label={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentProblemIndex(0);
                      resetProblem();
                    }}
                    color={selectedCategory === cat ? 'primary' : 'default'}
                    variant={selectedCategory === cat ? 'filled' : 'outlined'}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* 問題表示 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProblem.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={3}>
                  {showVisuals && (
                    <Grid item xs={12} md={2}>
                      <Box
                        sx={{
                          fontSize: '4rem',
                          textAlign: 'center',
                          p: 2,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 2
                        }}
                      >
                        {currentProblem.image}
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12} md={showVisuals ? 10 : 12}>
                    <Typography variant="h6" gutterBottom>
                      {currentProblem.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {currentProblem.story}
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body1" fontWeight="bold">
                        問題: {currentProblem.question}
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        
        {/* 解答エリア */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  あなたの答え
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    label="整数部分"
                    type="number"
                    value={userAnswer.wholeNumber || ''}
                    onChange={(e) => setUserAnswer({
                      ...userAnswer,
                      wholeNumber: parseInt(e.target.value) || 0
                    })}
                    sx={{ width: 100 }}
                    disabled={showResult}
                  />
                  <Box sx={{ textAlign: 'center' }}>
                    <TextField
                      label="分子"
                      type="number"
                      value={userAnswer.numerator || ''}
                      onChange={(e) => setUserAnswer({
                        ...userAnswer,
                        numerator: parseInt(e.target.value) || 0
                      })}
                      sx={{ width: 100 }}
                      disabled={showResult}
                    />
                    <Divider sx={{ my: 1 }} />
                    <TextField
                      label="分母"
                      type="number"
                      value={userAnswer.denominator || ''}
                      onChange={(e) => setUserAnswer({
                        ...userAnswer,
                        denominator: parseInt(e.target.value) || 1
                      })}
                      sx={{ width: 100 }}
                      disabled={showResult}
                    />
                  </Box>
                  {currentProblem.answer.denominator === 1 && (
                    <Typography variant="body2" color="text.secondary">
                      ※ 答えが整数の場合は分母を1にしてください
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={checkAnswer}
                    disabled={showResult || userAnswer.denominator === 0}
                    fullWidth
                  >
                    答え合わせ
                  </Button>
                  <Tooltip title="ヒント">
                    <IconButton
                      onClick={showHint}
                      disabled={hintsShown >= currentProblem.hints.length}
                      color="info"
                    >
                      <HintIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {/* ヒント表示 */}
            {hintsShown > 0 && (
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    <IdeaIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    ヒント
                  </Typography>
                  <List dense>
                    {currentProblem.hints.slice(0, hintsShown).map((hint, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Chip label={index + 1} size="small" />
                        </ListItemIcon>
                        <ListItemText primary={hint} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
            
            {/* 結果表示 */}
            <Collapse in={showResult}>
              <Alert 
                severity={isCorrect ? 'success' : 'error'} 
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1">
                  {isCorrect ? '正解！' : '惜しい！'}
                </Typography>
                <Typography variant="body2">
                  正しい答え: {formatFraction(currentProblem.answer)}
                  {currentProblem.answer.denominator === 1 && ` (${currentProblem.answer.numerator})`}
                </Typography>
              </Alert>
            </Collapse>
          </Grid>
        </Grid>
        
        {/* 解法ステップ（結果表示時） */}
        {showResult && showStepByStep && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              解き方
            </Typography>
            <Stepper activeStep={currentStep} orientation="vertical">
              {currentProblem.steps.map((step, index) => (
                <Step key={index}>
                  <StepLabel>{step.description}</StepLabel>
                  <StepContent>
                    <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                        {step.action}
                      </Typography>
                    </Card>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setCurrentStep(index + 1)}
                      disabled={index >= currentProblem.steps.length - 1}
                    >
                      次のステップ
                    </Button>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}
        
        {/* ナビゲーション */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            startIcon={<BackIcon />}
            onClick={prevProblem}
            disabled={currentProblemIndex === 0}
          >
            前の問題
          </Button>
          <Button
            endIcon={<NextIcon />}
            onClick={nextProblem}
            disabled={currentProblemIndex === filteredProblems.length - 1}
            variant="contained"
          >
            次の問題
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};