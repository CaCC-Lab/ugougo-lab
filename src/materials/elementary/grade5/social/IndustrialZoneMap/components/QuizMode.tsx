import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  EmojiEvents,
  Close
} from '@mui/icons-material';
import { IndustrialZone } from '../IndustrialZoneMap';

interface QuizModeProps {
  zones: IndustrialZone[];
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

export const QuizMode: React.FC<QuizModeProps> = ({ zones, onComplete, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);

  useEffect(() => {
    generateQuestions();
  }, [zones]);

  const generateQuestions = () => {
    const generatedQuestions: Question[] = [];

    // 質問タイプ1: 工業地帯の主要都市
    zones.slice(0, 3).forEach(zone => {
      const wrongCities = zones
        .filter(z => z.id !== zone.id)
        .flatMap(z => z.cities)
        .filter((city, index, self) => self.indexOf(city) === index)
        .slice(0, 3);

      generatedQuestions.push({
        id: `city-${zone.id}`,
        question: `${zone.name}の主要都市はどれですか？`,
        options: shuffleArray([zone.cities[0], ...wrongCities]),
        correctAnswer: zone.cities[0],
        explanation: `${zone.name}の主要都市は${zone.cities.join('、')}などです。`
      });
    });

    // 質問タイプ2: 工業地帯の特産品
    zones.slice(0, 3).forEach(zone => {
      const correctProduct = zone.mainProducts[0];
      const wrongProducts = zones
        .filter(z => z.id !== zone.id)
        .flatMap(z => z.mainProducts)
        .filter(p => p !== correctProduct)
        .slice(0, 3);

      generatedQuestions.push({
        id: `product-${zone.id}`,
        question: `${zone.name}の主な生産品はどれですか？`,
        options: shuffleArray([correctProduct, ...wrongProducts]),
        correctAnswer: correctProduct,
        explanation: `${zone.name}では${zone.mainProducts.join('、')}などが生産されています。`
      });
    });

    // 質問タイプ3: 生産額ランキング
    const sortedZones = [...zones].sort((a, b) => b.productionValue - a.productionValue);
    generatedQuestions.push({
      id: 'ranking-1',
      question: '日本で最も生産額が大きい工業地帯はどれですか？',
      options: shuffleArray(zones.slice(0, 4).map(z => z.name)),
      correctAnswer: sortedZones[0].name,
      explanation: `${sortedZones[0].name}は生産額${sortedZones[0].productionValue}兆円で日本最大の工業地帯です。`
    });

    // 質問タイプ4: 特徴的な産業
    const autoZone = zones.find(z => z.name === '中京工業地帯');
    if (autoZone) {
      generatedQuestions.push({
        id: 'special-auto',
        question: '自動車産業が特に発達している工業地帯はどれですか？',
        options: shuffleArray(['中京工業地帯', '北九州工業地帯', '北陸工業地域', '瀬戸内工業地域']),
        correctAnswer: '中京工業地帯',
        explanation: '中京工業地帯はトヨタ自動車の本拠地で、自動車産業の中心地です。'
      });
    }

    setQuestions(shuffleArray(generatedQuestions).slice(0, 5));
    setAnsweredQuestions(new Array(5).fill(false));
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleSubmit = () => {
    const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestionIndex] = true;
    setAnsweredQuestions(newAnsweredQuestions);
    
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

  if (questions.length === 0) {
    return <Box>クイズを準備中...</Box>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          工業地帯クイズ
        </Typography>
        <Button
          size="small"
          startIcon={<Close />}
          onClick={onExit}
        >
          終了
        </Button>
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
          <Stack spacing={1}>
            {currentQuestion.options.map((option) => (
              <Paper
                key={option}
                elevation={selectedAnswer === option ? 3 : 1}
                sx={{ 
                  p: 1,
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
          </Stack>
        </RadioGroup>
      </Box>

      {showResult && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color={selectedAnswer === currentQuestion.correctAnswer ? 'success.main' : 'error.main'} gutterBottom>
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
            startIcon={isLastQuestion ? <EmojiEvents /> : undefined}
          >
            {isLastQuestion ? '結果を見る' : '次の問題へ'}
          </Button>
        )}
      </Box>
    </Paper>
  );
};