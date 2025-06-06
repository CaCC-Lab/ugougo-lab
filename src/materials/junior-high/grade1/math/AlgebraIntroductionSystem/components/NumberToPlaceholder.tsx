import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface NumberToPlaceholderProps {
  onComplete: (success: boolean) => void;
  onMisconception: (type: string) => void;
}

interface Problem {
  question: string;
  equation: string;
  answer: number;
  hint: string;
}

const NumberToPlaceholder: React.FC<NumberToPlaceholderProps> = ({
  onComplete,
  onMisconception
}) => {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const problems: Problem[] = [
    {
      question: '3 + □ = 8 のとき、□に入る数は？',
      equation: '3 + □ = 8',
      answer: 5,
      hint: '8から3を引くと答えが見つかるよ！'
    },
    {
      question: '□ × 4 = 12 のとき、□に入る数は？',
      equation: '□ × 4 = 12',
      answer: 3,
      hint: '12を4で割ると答えが見つかるよ！'
    },
    {
      question: '15 - □ = 7 のとき、□に入る数は？',
      equation: '15 - □ = 7',
      answer: 8,
      hint: '15から7を引くと答えが見つかるよ！'
    }
  ];

  const handleSubmit = () => {
    const answer = parseFloat(userAnswer);
    const correct = answer === problems[currentProblem].answer;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    setAttempts(attempts + 1);

    if (!correct) {
      // 誤解パターンの検出
      if (userAnswer === '') {
        onMisconception('empty_answer');
      } else if (isNaN(answer)) {
        onMisconception('non_numeric_answer');
      } else if (problems[currentProblem].equation.includes('+') && 
                 answer === problems[currentProblem].answer * -1) {
        onMisconception('sign_confusion');
      }
    }

    if (correct && currentProblem === problems.length - 1) {
      setTimeout(() => onComplete(true), 1500);
    }
  };

  const handleNext = () => {
    if (currentProblem < problems.length - 1) {
      setCurrentProblem(currentProblem + 1);
      setUserAnswer('');
      setShowFeedback(false);
      setAttempts(0);
    }
  };

  const renderEquation = (equation: string) => {
    const parts = equation.split('□');
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '2rem' }}>
        {parts[0]}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Paper
            elevation={3}
            sx={{
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: userAnswer ? 'primary.light' : 'grey.200',
              color: userAnswer ? 'primary.contrastText' : 'text.primary'
            }}
          >
            {userAnswer || '□'}
          </Paper>
        </motion.div>
        {parts[1]}
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center">
        ステップ1: 具体的な数から記号へ
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        □（四角）に入る数を見つけよう！これが代数の第一歩です。
      </Typography>

      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          問題 {currentProblem + 1} / {problems.length}
        </Typography>
        
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
          {renderEquation(problems[currentProblem].equation)}
        </Box>

        <Typography variant="body1" sx={{ mb: 3 }}>
          {problems[currentProblem].question}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="答えを入力"
            type="number"
            variant="outlined"
            sx={{ flex: 1 }}
            disabled={showFeedback && isCorrect}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!userAnswer || (showFeedback && isCorrect)}
          >
            確認
          </Button>
        </Box>

        {attempts >= 2 && !isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Chip
              label={problems[currentProblem].hint}
              color="info"
              sx={{ mt: 2 }}
            />
          </motion.div>
        )}
      </Paper>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 3,
                bgcolor: isCorrect ? 'success.light' : 'error.light',
                color: isCorrect ? 'success.contrastText' : 'error.contrastText'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isCorrect ? <CheckCircleIcon /> : <ErrorIcon />}
                <Typography variant="h6">
                  {isCorrect ? '正解です！' : 'もう一度考えてみよう'}
                </Typography>
              </Box>
              
              {isCorrect && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    □ = {problems[currentProblem].answer} でした！
                  </Typography>
                  {currentProblem < problems.length - 1 && (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 2 }}
                      color="primary"
                    >
                      次の問題へ
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default NumberToPlaceholder;