/**
 * 分数比較モジュール - くらべるモード
 * 分数の大小関係や等価性の理解
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
  ButtonGroup,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Help as HelpIcon,
  Star as StarIcon,
  CompareArrows as CompareIcon,
  MoreHoriz as EqualIcon,
  KeyboardArrowUp as GreaterIcon,
  KeyboardArrowDown as LessIcon
} from '@mui/icons-material';
import { FractionCircleVisualization } from '../components/FractionCircleVisualization';
import { FractionBarVisualization } from '../components/FractionBarVisualization';

interface ComparisonModuleProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Fraction {
  numerator: number;
  denominator: number;
}

interface ComparisonQuestion {
  id: string;
  fraction1: Fraction;
  fraction2: Fraction;
  correctAnswer: 'greater' | 'less' | 'equal';
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  hint: string;
}

const generateQuestions = (): ComparisonQuestion[] => [
  // 初級 - 同じ分母
  {
    id: 'q1',
    fraction1: { numerator: 1, denominator: 4 },
    fraction2: { numerator: 3, denominator: 4 },
    correctAnswer: 'less',
    difficulty: 'easy',
    explanation: '分母が同じ時は、分子の大きい方が大きな分数です。1 < 3 なので 1/4 < 3/4',
    hint: '分母が同じ時は分子を比べましょう'
  },
  {
    id: 'q2',
    fraction1: { numerator: 2, denominator: 3 },
    fraction2: { numerator: 1, denominator: 3 },
    correctAnswer: 'greater',
    difficulty: 'easy',
    explanation: '分母が同じなので分子を比較します。2 > 1 なので 2/3 > 1/3',
    hint: '2個と1個、どちらが多いですか？'
  },
  // 等しい分数
  {
    id: 'q3',
    fraction1: { numerator: 2, denominator: 4 },
    fraction2: { numerator: 1, denominator: 2 },
    correctAnswer: 'equal',
    difficulty: 'medium',
    explanation: '2/4 = 1/2 です。分子と分母を同じ数で割ると等しい分数になります。',
    hint: '2/4を簡単にしてみましょう'
  },
  // 中級 - 異なる分母
  {
    id: 'q4',
    fraction1: { numerator: 1, denominator: 2 },
    fraction2: { numerator: 1, denominator: 3 },
    correctAnswer: 'greater',
    difficulty: 'medium',
    explanation: '1/2 = 0.5、1/3 = 0.33... なので 1/2 > 1/3',
    hint: '同じ1個でも、大きく分けた1個の方が大きいです'
  },
  {
    id: 'q5',
    fraction1: { numerator: 3, denominator: 8 },
    fraction2: { numerator: 1, denominator: 2 },
    correctAnswer: 'less',
    difficulty: 'medium',
    explanation: '1/2 = 4/8 なので、3/8 < 4/8 = 1/2',
    hint: '1/2を8分の○の形に直してみましょう'
  },
  // 上級
  {
    id: 'q6',
    fraction1: { numerator: 5, denominator: 6 },
    fraction2: { numerator: 7, denominator: 8 },
    correctAnswer: 'less',
    difficulty: 'hard',
    explanation: '5/6 ≈ 0.833、7/8 = 0.875 なので 5/6 < 7/8',
    hint: '1に近い分数同士の比較は、1からどれくらい離れているかを考えましょう'
  }
];

export const ComparisonModule: React.FC<ComparisonModuleProps> = ({
  onComplete,
  onBack
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [questions] = useState<ComparisonQuestion[]>(generateQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'greater' | 'less' | 'equal' | null>(null);
  const [answered, setAnswered] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [visualizationType, setVisualizationType] = useState<'circle' | 'bar'>('circle');

  const currentQuestion = questions[currentQuestionIndex];
  const allAnswered = answered.every(a => a);
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  // 答えの確認
  const checkAnswer = useCallback(() => {
    if (!selectedAnswer) return;

    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      const newAnswered = [...answered];
      newAnswered[currentQuestionIndex] = true;
      setAnswered(newAnswered);
      
      // スコア計算
      const baseScore = currentQuestion.difficulty === 'easy' ? 20 : 
                       currentQuestion.difficulty === 'medium' ? 35 : 50;
      const bonusScore = attempts === 0 ? 10 : 0;
      const newScore = baseScore + bonusScore;
      setScore(prev => prev + newScore);

      setShowExplanation(true);
    }
  }, [selectedAnswer, isCorrect, answered, currentQuestionIndex, currentQuestion.difficulty, attempts]);

  // 次の問題
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAttempts(0);
    } else {
      // 全問題完了
      onComplete(score);
    }
  }, [currentQuestionIndex, questions.length, score, onComplete]);

  // リセット
  const resetQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAttempts(0);
  }, []);

  // 分数を小数に変換
  const fractionToDecimal = (fraction: Fraction): number => {
    return fraction.numerator / fraction.denominator;
  };

  // 分数を文字列に変換
  const fractionToString = (fraction: Fraction): string => {
    return `${fraction.numerator}/${fraction.denominator}`;
  };

  // 比較記号を取得
  const getComparisonSymbol = (answer: 'greater' | 'less' | 'equal'): string => {
    switch (answer) {
      case 'greater': return '>';
      case 'less': return '<';
      case 'equal': return '=';
    }
  };

  // 難易度に応じた色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3, maxWidth: 1200, mx: 'auto' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareIcon /> くらべるモード
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            分数の大きさを比べて理解しよう
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`${currentQuestionIndex + 1}/${questions.length}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={getDifficultyColor(currentQuestion.difficulty) === 'success' ? '初級' : 
                  getDifficultyColor(currentQuestion.difficulty) === 'warning' ? '中級' : '上級'}
            color={getDifficultyColor(currentQuestion.difficulty) as any}
            size="small"
          />
          <Chip 
            label={`${score}pt`} 
            color="warning" 
            icon={<StarIcon />}
          />
        </Box>
      </Box>

      {/* 進捗バー */}
      <Box sx={{ mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={(answered.filter(a => a).length / questions.length) * 100}
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          進捗: {answered.filter(a => a).length}/{questions.length} 問完了
        </Typography>
      </Box>

      {/* メインコンテンツ */}
      <Grid container spacing={3}>
        {/* 問題表示 */}
        <Grid item xs={12} lg={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
                問題 {currentQuestionIndex + 1}: 次の分数の大小を比べましょう
              </Typography>

              {/* 視覚化タイプ選択 */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <ButtonGroup size="small">
                  <Button
                    variant={visualizationType === 'circle' ? 'contained' : 'outlined'}
                    onClick={() => setVisualizationType('circle')}
                  >
                    円グラフ
                  </Button>
                  <Button
                    variant={visualizationType === 'bar' ? 'contained' : 'outlined'}
                    onClick={() => setVisualizationType('bar')}
                  >
                    棒グラフ
                  </Button>
                </ButtonGroup>
              </Box>

              {/* 分数比較表示 */}
              <Grid container spacing={3} alignItems="center">
                {/* 左の分数 */}
                <Grid item xs={12} md={5}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
                      {fractionToString(currentQuestion.fraction1)}
                    </Typography>
                    {visualizationType === 'circle' ? (
                      <FractionCircleVisualization
                        numerator={currentQuestion.fraction1.numerator}
                        denominator={currentQuestion.fraction1.denominator}
                        size={isMobile ? 180 : 220}
                        animationDelay={0}
                        showLabels={false}
                      />
                    ) : (
                      <FractionBarVisualization
                        numerator={currentQuestion.fraction1.numerator}
                        denominator={currentQuestion.fraction1.denominator}
                        width={isMobile ? 180 : 220}
                        height={60}
                        animationDelay={0}
                        showLabels={false}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      = {fractionToDecimal(currentQuestion.fraction1).toFixed(3)}
                    </Typography>
                  </Box>
                </Grid>

                {/* 比較記号 */}
                <Grid item xs={12} md={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    {showExplanation ? (
                      <Typography variant="h3" color="success.main">
                        {getComparisonSymbol(currentQuestion.correctAnswer)}
                      </Typography>
                    ) : (
                      <Typography variant="h3" color="text.secondary">
                        ?
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* 右の分数 */}
                <Grid item xs={12} md={5}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ mb: 2, color: 'secondary.main' }}>
                      {fractionToString(currentQuestion.fraction2)}
                    </Typography>
                    {visualizationType === 'circle' ? (
                      <FractionCircleVisualization
                        numerator={currentQuestion.fraction2.numerator}
                        denominator={currentQuestion.fraction2.denominator}
                        size={isMobile ? 180 : 220}
                        animationDelay={300}
                        showLabels={false}
                      />
                    ) : (
                      <FractionBarVisualization
                        numerator={currentQuestion.fraction2.numerator}
                        denominator={currentQuestion.fraction2.denominator}
                        width={isMobile ? 180 : 220}
                        height={60}
                        animationDelay={300}
                        showLabels={false}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      = {fractionToDecimal(currentQuestion.fraction2).toFixed(3)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* 答えの選択肢 */}
              {!answered[currentQuestionIndex] && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                  <Button
                    variant={selectedAnswer === 'greater' ? 'contained' : 'outlined'}
                    size="large"
                    startIcon={<GreaterIcon />}
                    onClick={() => setSelectedAnswer('greater')}
                    color={selectedAnswer === 'greater' ? 'primary' : 'inherit'}
                  >
                    左 ＞ 右
                  </Button>
                  <Button
                    variant={selectedAnswer === 'equal' ? 'contained' : 'outlined'}
                    size="large"
                    startIcon={<EqualIcon />}
                    onClick={() => setSelectedAnswer('equal')}
                    color={selectedAnswer === 'equal' ? 'primary' : 'inherit'}
                  >
                    左 ＝ 右
                  </Button>
                  <Button
                    variant={selectedAnswer === 'less' ? 'contained' : 'outlined'}
                    size="large"
                    startIcon={<LessIcon />}
                    onClick={() => setSelectedAnswer('less')}
                    color={selectedAnswer === 'less' ? 'primary' : 'inherit'}
                  >
                    左 ＜ 右
                  </Button>
                </Box>
              )}

              {/* 結果表示 */}
              {showExplanation && (
                <Alert 
                  severity={isCorrect ? 'success' : 'error'} 
                  sx={{ mt: 3 }}
                >
                  <Typography variant="body2">
                    <strong>{isCorrect ? '正解！' : '不正解'}</strong><br />
                    {currentQuestion.explanation}
                  </Typography>
                </Alert>
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
                    disabled={!selectedAnswer}
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
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📊 分数比較のコツ
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  1. 分母が同じ場合
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  分子の大きい方が大きな分数です。<br />
                  例: 2/5 ＞ 1/5
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  2. 分子が同じ場合
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  分母の小さい方が大きな分数です。<br />
                  例: 1/3 ＞ 1/4
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  3. 分母も分子も違う場合
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  通分して比較するか、小数に直して比較します。
                </Typography>
              </Box>

              {/* 特別な分数 */}
              <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  🌟 覚えておこう
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                  • 1/2 = 0.5（半分）
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                  • 1/4 = 0.25（4分の1）
                </Typography>
                <Typography variant="caption" display="block">
                  • 3/4 = 0.75（4分の3）
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* 進捗カード */}
          <Card elevation={2} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📈 学習進捗
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="body2">完了問題:</Typography>
                <Typography variant="h6" color="primary.main">
                  {answered.filter(a => a).length}/{questions.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">獲得スコア:</Typography>
                <Typography variant="h6" color="warning.main">
                  {score}pt
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
            🎉 くらべるモード完了！
          </Typography>
          <Typography variant="body2">
            分数の大小関係をマスターしました。最終スコア: {score}ポイント
          </Typography>
        </Alert>
      )}
    </Box>
  );
};