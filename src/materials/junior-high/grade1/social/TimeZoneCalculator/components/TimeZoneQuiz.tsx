// 練習問題コンポーネント
import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  Collapse,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Lightbulb as LightbulbIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import type { TimeZoneQuizQuestion } from '../data/cityData';
import type { City } from '../data/cityData';
import { cities } from '../data/cityData';

interface TimeZoneQuizProps {
  questions: TimeZoneQuizQuestion[];
  onComplete: () => void;
}

interface Answer {
  hour: string;
  minute: string;
}

export const TimeZoneQuiz: React.FC<TimeZoneQuizProps> = ({
  questions,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer>({ hour: '', minute: '' });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const baseCity = cities.find(c => c.id === currentQuestion.baseCityId)!;
  const targetCity = cities.find(c => c.id === currentQuestion.targetCityId)!;

  // 正解を計算
  const calculateCorrectAnswer = useCallback((): { hour: number; minute: number; dateChange: string } => {
    const timeDifference = targetCity.timezone - baseCity.timezone;
    let totalMinutes = currentQuestion.baseTime.hour * 60 + currentQuestion.baseTime.minute;
    totalMinutes += timeDifference * 60;
    
    let dateChange = '同じ日';
    if (totalMinutes < 0) {
      dateChange = '前日';
      totalMinutes += 24 * 60;
    } else if (totalMinutes >= 24 * 60) {
      dateChange = '翌日';
      totalMinutes -= 24 * 60;
    }
    
    return {
      hour: Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60,
      dateChange
    };
  }, [baseCity, targetCity, currentQuestion]);

  // 回答をチェック
  const checkAnswer = useCallback(() => {
    const correct = calculateCorrectAnswer();
    const userHour = parseInt(answer.hour);
    const userMinute = parseInt(answer.minute);
    
    const isAnswerCorrect = 
      userHour === correct.hour && 
      userMinute === correct.minute;
    
    setIsCorrect(isAnswerCorrect);
    setAttemptCount(prev => prev + 1);
    
    if (isAnswerCorrect) {
      setShowResult(true);
      setCorrectAnswers(prev => prev + 1);
    } else {
      // 不正解の場合、ヒントレベルを上げる
      if (attemptCount < 2) {
        setHintLevel(Math.min(hintLevel + 1, 3));
      } else {
        setShowResult(true);
      }
    }
  }, [answer, calculateCorrectAnswer, attemptCount, hintLevel]);

  // 次の問題へ
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer({ hour: '', minute: '' });
      setShowResult(false);
      setShowHint(false);
      setHintLevel(0);
      setAttemptCount(0);
    } else {
      onComplete();
    }
  }, [currentQuestionIndex, questions.length, onComplete]);

  // 進捗率を計算
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const correctAnswer = calculateCorrectAnswer();

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          時差計算クイズ
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            問題 {currentQuestionIndex + 1} / {questions.length}
          </Typography>
          <Chip
            label={`正解数: ${correctAnswers}`}
            color="success"
            size="small"
          />
        </Box>
        
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          {currentQuestion.questionText}
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="subtitle1" gutterBottom>
                基準都市: {baseCity.nameJa}（{baseCity.countryJa}）
              </Typography>
              <Typography variant="h4">
                {currentQuestion.baseTime.hour.toString().padStart(2, '0')}:
                {currentQuestion.baseTime.minute.toString().padStart(2, '0')}
              </Typography>
              <Typography variant="body2">
                UTC{baseCity.timezone >= 0 ? '+' : ''}{baseCity.timezone}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'grey.200' }}>
              <Typography variant="subtitle1" gutterBottom>
                目標都市: {targetCity.nameJa}（{targetCity.countryJa}）
              </Typography>
              <Typography variant="h4" sx={{ color: 'text.secondary' }}>
                ?
              </Typography>
              <Typography variant="body2">
                UTC{targetCity.timezone >= 0 ? '+' : ''}{targetCity.timezone}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          あなたの答え:
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="時"
            type="number"
            value={answer.hour}
            onChange={(e) => setAnswer({ ...answer, hour: e.target.value })}
            inputProps={{ min: 0, max: 23 }}
            sx={{ width: 100 }}
            disabled={showResult}
          />
          <Typography variant="h6">:</Typography>
          <TextField
            label="分"
            type="number"
            value={answer.minute}
            onChange={(e) => setAnswer({ ...answer, minute: e.target.value })}
            inputProps={{ min: 0, max: 59 }}
            sx={{ width: 100 }}
            disabled={showResult}
          />
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          {!showResult && (
            <>
              <Button
                variant="contained"
                onClick={checkAnswer}
                disabled={!answer.hour || !answer.minute}
              >
                答えを確認
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<LightbulbIcon />}
                onClick={() => {
                  setShowHint(true);
                  setHintLevel(Math.min(hintLevel + 1, 3));
                }}
              >
                ヒント {hintLevel > 0 && `(${hintLevel}/3)`}
              </Button>
            </>
          )}
          
          {showResult && (
            <Button
              variant="contained"
              endIcon={<NavigateNextIcon />}
              onClick={nextQuestion}
            >
              {currentQuestionIndex < questions.length - 1 ? '次の問題へ' : '結果を見る'}
            </Button>
          )}
        </Box>
      </Box>

      <Collapse in={showHint && !showResult}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {hintLevel >= 1 && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>ヒント1:</strong> {currentQuestion.hint}
            </Typography>
          )}
          
          {hintLevel >= 2 && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>ヒント2:</strong> 時差を計算しましょう。
              {targetCity.nameJa}は{baseCity.nameJa}より
              {Math.abs(targetCity.timezone - baseCity.timezone)}時間
              {targetCity.timezone > baseCity.timezone ? '進んで' : '遅れて'}います。
            </Typography>
          )}
          
          {hintLevel >= 3 && (
            <Typography variant="body2">
              <strong>ヒント3:</strong> 計算式: 
              {currentQuestion.baseTime.hour}:{currentQuestion.baseTime.minute.toString().padStart(2, '0')} 
              {targetCity.timezone > baseCity.timezone ? ' + ' : ' - '}
              {Math.abs(targetCity.timezone - baseCity.timezone)}時間
            </Typography>
          )}
          
          {attemptCount >= 2 && hintLevel < 3 && (
            <Typography variant="body2" sx={{ mt: 1, color: 'warning.main' }}>
              もう一度チャレンジしてみましょう！
            </Typography>
          )}
        </Alert>
      </Collapse>

      <Collapse in={showResult}>
        <Alert
          severity={isCorrect ? 'success' : 'error'}
          icon={isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle1" gutterBottom>
            {isCorrect ? '正解です！' : '残念...'}
          </Typography>
          
          <Typography variant="body2">
            正解: {correctAnswer.hour.toString().padStart(2, '0')}:
            {correctAnswer.minute.toString().padStart(2, '0')}
            {correctAnswer.dateChange !== '同じ日' && ` (${correctAnswer.dateChange})`}
          </Typography>
          
          {!isCorrect && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>解説:</strong>
              </Typography>
              <Typography variant="body2">
                1. 時差 = {targetCity.timezone} - {baseCity.timezone} = {targetCity.timezone - baseCity.timezone}時間
              </Typography>
              <Typography variant="body2">
                2. {baseCity.nameJa} {currentQuestion.baseTime.hour}:{currentQuestion.baseTime.minute.toString().padStart(2, '0')} 
                   + {targetCity.timezone - baseCity.timezone}時間 = {correctAnswer.hour}:{correctAnswer.minute.toString().padStart(2, '0')}
              </Typography>
            </Box>
          )}
        </Alert>
      </Collapse>
    </Paper>
  );
};