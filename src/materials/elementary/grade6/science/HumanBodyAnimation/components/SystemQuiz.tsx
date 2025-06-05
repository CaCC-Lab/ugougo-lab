import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  IconButton
} from '@mui/material';
import { CheckCircle, Cancel, Close } from '@mui/icons-material';
import { Organ } from '../HumanBodyAnimation';

interface SystemQuizProps {
  system: 'circulatory' | 'respiratory' | 'digestive';
  organs: Organ[];
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const SystemQuiz: React.FC<SystemQuizProps> = ({
  system,
  organs,
  onComplete,
  onExit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const getQuestions = (): Question[] => {
    switch (system) {
      case 'circulatory':
        return [
          {
            id: 'circ1',
            question: '心臓は1日に約何回拍動するでしょうか？',
            options: ['1万回', '10万回', '100万回', '1000万回'],
            correctAnswer: '10万回',
            explanation: '心臓は1分間に約70回、1日では約10万回拍動します。'
          },
          {
            id: 'circ2',
            question: '血液が酸素を多く含んでいるのはどちら？',
            options: ['動脈血', '静脈血', 'どちらも同じ', '血液の種類による'],
            correctAnswer: '動脈血',
            explanation: '動脈血は肺で酸素を取り込んだ血液で、鮮やかな赤色をしています。'
          },
          {
            id: 'circ3',
            question: '心臓の部屋はいくつありますか？',
            options: ['2つ', '3つ', '4つ', '5つ'],
            correctAnswer: '4つ',
            explanation: '心臓には左心房、右心房、左心室、右心室の4つの部屋があります。'
          }
        ];
      case 'respiratory':
        return [
          {
            id: 'resp1',
            question: '肺胞の数は左右合わせて約何個？',
            options: ['6万個', '600万個', '6億個', '60億個'],
            correctAnswer: '6億個',
            explanation: '肺胞は左右合わせて約6億個あり、ガス交換を行います。'
          },
          {
            id: 'resp2',
            question: '呼吸で取り込む気体は？',
            options: ['酸素', '二酸化炭素', '窒素', '水素'],
            correctAnswer: '酸素',
            explanation: '呼吸では酸素を取り込み、二酸化炭素を出します。'
          },
          {
            id: 'resp3',
            question: '横隔膜が下がるとどうなる？',
            options: ['息を吸う', '息を吐く', '呼吸が止まる', '変化なし'],
            correctAnswer: '息を吸う',
            explanation: '横隔膜が下がると胸腔が広がり、肺に空気が入ります。'
          }
        ];
      case 'digestive':
        return [
          {
            id: 'dig1',
            question: '小腸の長さは約何メートル？',
            options: ['1〜2m', '3〜4m', '6〜7m', '10〜12m'],
            correctAnswer: '6〜7m',
            explanation: '小腸は約6〜7メートルの長さがあり、栄養を吸収します。'
          },
          {
            id: 'dig2',
            question: '胃液のpHはどのくらい？',
            options: ['中性（pH7）', '弱酸性（pH5〜6）', '強酸性（pH1〜2）', 'アルカリ性（pH8〜9）'],
            correctAnswer: '強酸性（pH1〜2）',
            explanation: '胃液は強い酸性で、食べ物を溶かし、殺菌作用もあります。'
          },
          {
            id: 'dig3',
            question: '体の中で最も大きな臓器は？',
            options: ['心臓', '肺', '肝臓', '胃'],
            correctAnswer: '肝臓',
            explanation: '肝臓は体の中で最も大きな臓器で、500以上の働きがあります。'
          }
        ];
    }
  };

  const questions = getQuestions();
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleSubmit = () => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      onComplete(score, questions.length);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          {system === 'circulatory' ? '循環器系' : 
           system === 'respiratory' ? '呼吸器系' : '消化器系'}クイズ
        </Typography>
        <IconButton onClick={onExit} size="small">
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            問題 {currentQuestionIndex + 1} / {questions.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            スコア: {score}点
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {currentQuestion.question}
        </Typography>

        <RadioGroup value={selectedAnswer} onChange={(e) => handleAnswerSelect(e.target.value)}>
          {currentQuestion.options.map((option) => (
            <Paper
              key={option}
              elevation={selectedAnswer === option ? 3 : 1}
              sx={{ 
                p: 1,
                mb: 1,
                bgcolor: showResult
                  ? option === currentQuestion.correctAnswer
                    ? '#c8e6c9'
                    : selectedAnswer === option
                    ? '#ffcdd2'
                    : 'background.paper'
                  : 'background.paper'
              }}
            >
              <FormControlLabel
                value={option}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {option}
                    {showResult && option === currentQuestion.correctAnswer && (
                      <CheckCircle color="success" fontSize="small" />
                    )}
                    {showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                      <Cancel color="error" fontSize="small" />
                    )}
                  </Box>
                }
                disabled={showResult}
              />
            </Paper>
          ))}
        </RadioGroup>
      </Box>

      {showResult && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography 
            variant="body2" 
            color={selectedAnswer === currentQuestion.correctAnswer ? 'success.main' : 'error.main'} 
            gutterBottom
          >
            {selectedAnswer === currentQuestion.correctAnswer ? '正解！' : '不正解...'}
          </Typography>
          <Typography variant="body2">
            {currentQuestion.explanation}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {!showResult ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedAnswer}
          >
            回答する
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            {currentQuestionIndex === questions.length - 1 ? '結果を見る' : '次の問題へ'}
          </Button>
        )}
      </Box>
    </Paper>
  );
};