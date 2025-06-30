/**
 * 分数練習モジュール - とっくんモード
 * 分数の計算問題の練習と習熟
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  TextField,
  LinearProgress,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Help as HelpIcon,
  Star as StarIcon,
  FitnessCenter as TrainingIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { FractionCircleVisualization } from '../components/FractionCircleVisualization';

interface TrainingModuleProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Fraction {
  numerator: number;
  denominator: number;
}

interface TrainingQuestion {
  id: string;
  type: 'addition' | 'subtraction' | 'simplify' | 'convert';
  question: string;
  operand1?: Fraction;
  operand2?: Fraction;
  targetFraction?: Fraction;
  correctAnswer: Fraction;
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
  explanation: string;
}

const generateQuestions = (): TrainingQuestion[] => [
  // 分数の足し算（同じ分母）
  {
    id: 'add1',
    type: 'addition',
    question: '1/4 + 2/4 = ?',
    operand1: { numerator: 1, denominator: 4 },
    operand2: { numerator: 2, denominator: 4 },
    correctAnswer: { numerator: 3, denominator: 4 },
    difficulty: 'easy',
    hint: '分母が同じなので分子同士を足します',
    explanation: '分母が同じ分数の足し算では、分子同士を足して分母はそのままです。1 + 2 = 3 なので答えは 3/4'
  },
  {
    id: 'add2',
    type: 'addition',
    question: '2/5 + 1/5 = ?',
    operand1: { numerator: 2, denominator: 5 },
    operand2: { numerator: 1, denominator: 5 },
    correctAnswer: { numerator: 3, denominator: 5 },
    difficulty: 'easy',
    hint: '分母は5のまま、分子を足します',
    explanation: '2 + 1 = 3 なので答えは 3/5'
  },
  
  // 分数の引き算（同じ分母）
  {
    id: 'sub1',
    type: 'subtraction',
    question: '3/4 - 1/4 = ?',
    operand1: { numerator: 3, denominator: 4 },
    operand2: { numerator: 1, denominator: 4 },
    correctAnswer: { numerator: 2, denominator: 4 },
    difficulty: 'easy',
    hint: '分母が同じなので分子同士を引きます',
    explanation: '分母が同じ分数の引き算では、分子同士を引いて分母はそのままです。3 - 1 = 2 なので答えは 2/4'
  },
  
  // 分数の約分
  {
    id: 'simp1',
    type: 'simplify',
    question: '2/4 を約分すると？',
    targetFraction: { numerator: 2, denominator: 4 },
    correctAnswer: { numerator: 1, denominator: 2 },
    difficulty: 'medium',
    hint: '分子と分母を同じ数で割れるか考えてみましょう',
    explanation: '2/4 の分子と分母を2で割ると 1/2 になります'
  },
  {
    id: 'simp2',
    type: 'simplify',
    question: '6/8 を約分すると？',
    targetFraction: { numerator: 6, denominator: 8 },
    correctAnswer: { numerator: 3, denominator: 4 },
    difficulty: 'medium',
    hint: '6と8の公約数を見つけましょう',
    explanation: '6/8 の分子と分母を2で割ると 3/4 になります'
  },
  
  // 帯分数から仮分数
  {
    id: 'conv1',
    type: 'convert',
    question: '1と1/2 を仮分数にすると？',
    correctAnswer: { numerator: 3, denominator: 2 },
    difficulty: 'hard',
    hint: '1 = 2/2 と考えて足し算してみましょう',
    explanation: '1と1/2 = 2/2 + 1/2 = 3/2'
  }
];

export const TrainingModule: React.FC<TrainingModuleProps> = ({
  onComplete,
  onBack
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [questions] = useState<TrainingQuestion[]>(generateQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState({ numerator: '', denominator: '' });
  const [answered, setAnswered] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [results, setResults] = useState<boolean[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [streak, setStreak] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswered = answered.every(a => a);

  // タイマー
  useEffect(() => {
    if (!startTime) {
      setStartTime(new Date());
    }

    const interval = setInterval(() => {
      if (startTime) {
        setTimeSpent(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // 分数の等価性をチェック
  const areFractionsEqual = useCallback((f1: Fraction, f2: Fraction): boolean => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    
    const simplify = (fraction: Fraction): Fraction => {
      const divisor = gcd(fraction.numerator, fraction.denominator);
      return {
        numerator: fraction.numerator / divisor,
        denominator: fraction.denominator / divisor
      };
    };

    const simplified1 = simplify(f1);
    const simplified2 = simplify(f2);
    
    return simplified1.numerator === simplified2.numerator && 
           simplified1.denominator === simplified2.denominator;
  }, []);

  // 答えの確認
  const checkAnswer = useCallback(() => {
    if (!userAnswer.numerator || !userAnswer.denominator) return;

    const userFraction: Fraction = {
      numerator: parseInt(userAnswer.numerator),
      denominator: parseInt(userAnswer.denominator)
    };

    setAttempts(prev => prev + 1);
    
    const isCorrect = areFractionsEqual(userFraction, currentQuestion.correctAnswer);
    
    if (isCorrect) {
      const newAnswered = [...answered];
      newAnswered[currentQuestionIndex] = true;
      setAnswered(newAnswered);
      
      const newResults = [...results];
      newResults[currentQuestionIndex] = true;
      setResults(newResults);
      
      // 連続正解の更新
      setStreak(prev => prev + 1);
      
      // スコア計算
      const baseScore = currentQuestion.difficulty === 'easy' ? 25 : 
                       currentQuestion.difficulty === 'medium' ? 40 : 60;
      const timeBonus = attempts === 1 ? 15 : attempts === 2 ? 10 : 5;
      const streakBonus = streak >= 3 ? 20 : streak >= 2 ? 10 : 0;
      const newScore = baseScore + timeBonus + streakBonus;
      
      setScore(prev => prev + newScore);
      setShowExplanation(true);
    } else {
      const newResults = [...results];
      newResults[currentQuestionIndex] = false;
      setResults(newResults);
      setStreak(0); // 連続正解リセット
    }
  }, [userAnswer, currentQuestion, attempts, answered, results, streak, areFractionsEqual]);

  // 次の問題
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer({ numerator: '', denominator: '' });
      setShowExplanation(false);
      setAttempts(0);
    } else {
      // 全問題完了
      const finalScore = score + (streak >= 5 ? 50 : 0); // 最後のボーナス
      onComplete(finalScore);
    }
  }, [currentQuestionIndex, questions.length, score, streak, onComplete]);

  // リセット
  const resetQuestion = useCallback(() => {
    setUserAnswer({ numerator: '', denominator: '' });
    setShowExplanation(false);
    setAttempts(0);
  }, []);

  // 時間フォーマット
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 問題タイプのアイコン
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'addition': return '➕';
      case 'subtraction': return '➖';
      case 'simplify': return '🔄';
      case 'convert': return '🔀';
      default: return '❓';
    }
  };

  // 問題タイプの名前
  const getQuestionTypeName = (type: string) => {
    switch (type) {
      case 'addition': return '足し算';
      case 'subtraction': return '引き算';
      case 'simplify': return '約分';
      case 'convert': return '変換';
      default: return '問題';
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3, maxWidth: 1200, mx: 'auto' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrainingIcon /> とっくんモード
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            分数の計算問題に挑戦しよう
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`${currentQuestionIndex + 1}/${questions.length}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            icon={<TimerIcon />}
            label={formatTime(timeSpent)}
            color="info"
            variant="outlined"
          />
          <Chip 
            icon={<SpeedIcon />}
            label={`連続${streak}回`}
            color={streak >= 3 ? 'success' : 'default'}
            variant="outlined"
          />
          <Chip 
            label={`${score}pt`} 
            color="warning" 
            icon={<StarIcon />}
          />
        </Box>
      </Box>

      {/* 進捗ステッパー */}
      <Box sx={{ mb: 3 }}>
        <Stepper activeStep={currentQuestionIndex} alternativeLabel={!isMobile}>
          {questions.map((question, index) => (
            <Step key={question.id} completed={answered[index]}>
              <StepLabel 
                error={results[index] === false}
                icon={
                  answered[index] ? (
                    results[index] ? '✅' : '❌'
                  ) : (
                    getQuestionTypeIcon(question.type)
                  )
                }
              >
                {!isMobile && getQuestionTypeName(question.type)}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* メインコンテンツ */}
      <Grid container spacing={3}>
        {/* 問題表示 */}
        <Grid item xs={12} lg={8}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {getQuestionTypeIcon(currentQuestion.type)} {getQuestionTypeName(currentQuestion.type)}問題
                </Typography>
                <Chip
                  label={currentQuestion.difficulty === 'easy' ? '初級' : 
                        currentQuestion.difficulty === 'medium' ? '中級' : '上級'}
                  color={currentQuestion.difficulty === 'easy' ? 'success' : 
                        currentQuestion.difficulty === 'medium' ? 'warning' : 'error'}
                  size="small"
                />
              </Box>

              {/* 問題文 */}
              <Typography variant="h4" sx={{ textAlign: 'center', mb: 4, color: 'primary.main' }}>
                {currentQuestion.question}
              </Typography>

              {/* 視覚的補助（足し算・引き算の場合） */}
              {(currentQuestion.type === 'addition' || currentQuestion.type === 'subtraction') && 
               currentQuestion.operand1 && currentQuestion.operand2 && (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {currentQuestion.operand1.numerator}/{currentQuestion.operand1.denominator}
                      </Typography>
                      <FractionCircleVisualization
                        numerator={currentQuestion.operand1.numerator}
                        denominator={currentQuestion.operand1.denominator}
                        size={isMobile ? 150 : 180}
                        showLabels={false}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {currentQuestion.operand2.numerator}/{currentQuestion.operand2.denominator}
                      </Typography>
                      <FractionCircleVisualization
                        numerator={currentQuestion.operand2.numerator}
                        denominator={currentQuestion.operand2.denominator}
                        size={isMobile ? 150 : 180}
                        showLabels={false}
                      />
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* 答え入力 */}
              {!answered[currentQuestionIndex] && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
                  <TextField
                    label="分子"
                    value={userAnswer.numerator}
                    onChange={(e) => setUserAnswer(prev => ({ ...prev, numerator: e.target.value }))}
                    type="number"
                    size="small"
                    sx={{ width: 100 }}
                    InputProps={{
                      inputProps: { min: 0, max: 99 }
                    }}
                  />
                  <Typography variant="h4">/</Typography>
                  <TextField
                    label="分母"
                    value={userAnswer.denominator}
                    onChange={(e) => setUserAnswer(prev => ({ ...prev, denominator: e.target.value }))}
                    type="number"
                    size="small"
                    sx={{ width: 100 }}
                    InputProps={{
                      inputProps: { min: 1, max: 99 }
                    }}
                  />
                </Box>
              )}

              {/* 正解表示 */}
              {showExplanation && (
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h3" color="success.main" sx={{ mb: 2 }}>
                    {currentQuestion.correctAnswer.numerator}/{currentQuestion.correctAnswer.denominator}
                  </Typography>
                  <Alert severity="success">
                    <Typography variant="body2">
                      <strong>正解！</strong><br />
                      {currentQuestion.explanation}
                    </Typography>
                  </Alert>
                </Box>
              )}

              {/* 試行回数表示 */}
              {attempts > 0 && !answered[currentQuestionIndex] && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                  試行回数: {attempts}回
                </Typography>
              )}
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={resetQuestion}
                  disabled={answered[currentQuestionIndex]}
                >
                  リセット
                </Button>
                <Button
                  startIcon={<HelpIcon />}
                  onClick={() => setShowHint(true)}
                >
                  ヒント
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!answered[currentQuestionIndex] && (
                  <Button
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={checkAnswer}
                    disabled={!userAnswer.numerator || !userAnswer.denominator}
                  >
                    答えを確認
                  </Button>
                )}
                
                {answered[currentQuestionIndex] && (
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={nextQuestion}
                  >
                    {currentQuestionIndex < questions.length - 1 ? '次の問題' : '完了'}
                  </Button>
                )}
              </Box>
            </CardActions>
          </Card>
        </Grid>

        {/* サイドパネル */}
        <Grid item xs={12} lg={4}>
          {/* 統計カード */}
          <Card elevation={2} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📊 学習統計
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">正解数:</Typography>
                <Typography variant="h6" color="success.main">
                  {results.filter(r => r === true).length}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">不正解数:</Typography>
                <Typography variant="h6" color="error.main">
                  {results.filter(r => r === false).length}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">連続正解:</Typography>
                <Typography variant="h6" color="primary.main">
                  {streak}回
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">スコア:</Typography>
                <Typography variant="h6" color="warning.main">
                  {score}pt
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* 計算のコツカード */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🧮 計算のコツ
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  足し算・引き算
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  分母が同じなら分子だけ計算します
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  約分
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  分子と分母を同じ数で割って簡単にします
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  変換
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  帯分数は整数部分を仮分数に直して足します
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ヒントダイアログ */}
      <Dialog open={showHint} onClose={() => setShowHint(false)} maxWidth="sm" fullWidth>
        <DialogTitle>💡 ヒント</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {currentQuestion.hint}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHint(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>

      {/* 戻るボタン */}
      <Fab
        color="primary"
        size="medium"
        onClick={onBack}
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: 1000
        }}
      >
        <Typography variant="caption" sx={{ fontSize: '12px' }}>
          戻る
        </Typography>
      </Fab>

      {/* 完了メッセージ */}
      {allAnswered && (
        <Alert severity="success" sx={{ mt: 3 }}>
          <Typography variant="h6">
            🎉 とっくんモード完了！
          </Typography>
          <Typography variant="body2">
            分数の計算をマスターしました！<br />
            最終スコア: {score}ポイント | 学習時間: {formatTime(timeSpent)} | 正解率: {((results.filter(r => r === true).length / results.length) * 100).toFixed(1)}%
          </Typography>
        </Alert>
      )}
    </Box>
  );
};