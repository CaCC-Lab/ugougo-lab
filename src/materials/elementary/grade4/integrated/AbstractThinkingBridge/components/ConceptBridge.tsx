import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  NavigateNext,
  NavigateBefore,
  CheckCircle,
  RadioButtonUnchecked,
  TipsAndUpdates
} from '@mui/icons-material';
import type { ModuleComponentProps } from '../types';

interface ConceptExample {
  id: string;
  title: string;
  steps: {
    concrete: string;
    semiAbstract: string;
    abstract: string;
  };
  visualization: React.FC<{ step: number }>;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    hint: string;
  };
}

const NumberPatternVisualization: React.FC<{ step: number }> = ({ step }) => {
  const blocks = [2, 4, 6, 8];
  
  return (
    <Box sx={{ my: 2, textAlign: 'center' }}>
      {step === 0 && (
        // 具体的：ブロックで表現
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {blocks.map((count, index) => (
            <Box key={index} sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', width: 60, justifyContent: 'center' }}>
                {Array.from({ length: count }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: 'primary.main',
                      m: 0.25,
                      borderRadius: 0.5
                    }}
                  />
                ))}
              </Box>
              <Typography variant="caption">{count}個</Typography>
            </Box>
          ))}
        </Box>
      )}
      
      {step === 1 && (
        // 半抽象的：数字と視覚的パターン
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'center' }}>
          {blocks.map((count, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card sx={{ p: 2 }}>
                <Typography variant="h4" color="primary">{count}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  {Array.from({ length: count / 2 }).map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 8,
                        height: 20,
                        bgcolor: 'secondary.main',
                        mx: 0.25
                      }}
                    />
                  ))}
                </Box>
              </Card>
            </motion.div>
          ))}
        </Box>
      )}
      
      {step === 2 && (
        // 抽象的：数式とグラフ
        <Box>
          <Typography variant="h5" gutterBottom>
            y = 2x
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
            {[1, 2, 3, 4].map((x) => (
              <Chip
                key={x}
                label={`x=${x}, y=${x * 2}`}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            xが1増えるたびに、yは2ずつ増える規則
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const GroupingVisualization: React.FC<{ step: number }> = ({ step }) => {
  const items = ['🍎', '🍊', '🍌', '🍓', '🥕', '🥒', '🌽', '🥔'];
  
  return (
    <Box sx={{ my: 2 }}>
      {step === 0 && (
        // 具体的：実際の物で分類
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={6}>
            <Card sx={{ p: 2, bgcolor: 'error.light' }}>
              <Typography variant="subtitle2" gutterBottom>果物</Typography>
              <Box sx={{ display: 'flex', gap: 1, fontSize: 32 }}>
                {items.slice(0, 4).map((item, i) => (
                  <span key={i}>{item}</span>
                ))}
              </Box>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ p: 2, bgcolor: 'success.light' }}>
              <Typography variant="subtitle2" gutterBottom>野菜</Typography>
              <Box sx={{ display: 'flex', gap: 1, fontSize: 32 }}>
                {items.slice(4).map((item, i) => (
                  <span key={i}>{item}</span>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {step === 1 && (
        // 半抽象的：カテゴリとアイコン
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
            <Box>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 48,
                  mb: 1
                }}
              >
                🍎
              </Box>
              <Typography>果物（4）</Typography>
            </Box>
            <Box>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 48,
                  mb: 1
                }}
              >
                🥕
              </Box>
              <Typography>野菜（4）</Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      {step === 2 && (
        // 抽象的：集合の概念
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            集合A ∩ 集合B = ∅
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 2 }}>
            <Box
              sx={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                border: '3px solid',
                borderColor: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography>A: 果物</Typography>
            </Box>
            <Box
              sx={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                border: '3px solid',
                borderColor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography>B: 野菜</Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            共通の要素がない = 互いに素な集合
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export const ConceptBridge: React.FC<ModuleComponentProps> = ({ onConceptMastered, progress }) => {
  const [activeExample, setActiveExample] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const examples: ConceptExample[] = [
    {
      id: 'number-patterns',
      title: '数のパターン',
      steps: {
        concrete: '実際のブロックを使って、2個、4個、6個、8個と並べてみよう',
        semiAbstract: '数字とパターンの関係を見つけよう',
        abstract: '規則を式で表してみよう（y = 2x）'
      },
      visualization: NumberPatternVisualization,
      quiz: {
        question: 'x = 5のとき、yの値は？',
        options: ['5', '7', '10', '12'],
        correctIndex: 2,
        hint: 'y = 2xの式にx = 5を代入してみよう'
      }
    },
    {
      id: 'grouping',
      title: '分類とグループ',
      steps: {
        concrete: '果物と野菜を実際に分けてみよう',
        semiAbstract: 'カテゴリーという考え方を理解しよう',
        abstract: '集合の概念を学ぼう'
      },
      visualization: GroupingVisualization,
      quiz: {
        question: '「すべての果物は植物である」という文は正しい？',
        options: ['正しい', '間違い', 'わからない'],
        correctIndex: 0,
        hint: '果物は植物の一部分（部分集合）です'
      }
    }
  ];

  const currentExample = examples[activeExample];
  const steps = ['具体的', '半抽象的', '抽象的'];
  
  const handleNext = () => {
    if (activeStep < 2) {
      setActiveStep(prev => prev + 1);
    } else if (!showQuiz && currentExample.quiz) {
      setShowQuiz(true);
    }
  };

  const handleBack = () => {
    if (showQuiz) {
      setShowQuiz(false);
      setSelectedAnswer(null);
      setShowHint(false);
    } else if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    if (index === currentExample.quiz?.correctIndex) {
      onConceptMastered(currentExample.id);
    }
  };

  const handleExampleChange = (index: number) => {
    setActiveExample(index);
    setActiveStep(0);
    setShowQuiz(false);
    setSelectedAnswer(null);
    setShowHint(false);
  };

  return (
    <Box>
      {/* 例の選択 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {examples.map((example, index) => (
          <Button
            key={example.id}
            variant={activeExample === index ? 'contained' : 'outlined'}
            onClick={() => handleExampleChange(index)}
            startIcon={
              progress[example.id] ? <CheckCircle /> : <RadioButtonUnchecked />
            }
            sx={{
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            {example.title}
          </Button>
        ))}
      </Box>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentExample.title}
          </Typography>

          {!showQuiz ? (
            <>
              {/* ステッパー */}
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                      <Typography variant="body2" paragraph>
                        {index === 0 && currentExample.steps.concrete}
                        {index === 1 && currentExample.steps.semiAbstract}
                        {index === 2 && currentExample.steps.abstract}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {/* ビジュアライゼーション */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <currentExample.visualization step={activeStep} />
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            // クイズセクション
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                理解度チェック
              </Typography>
              <Typography variant="body1" paragraph>
                {currentExample.quiz?.question}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {currentExample.quiz?.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? 'contained' : 'outlined'}
                    color={
                      selectedAnswer === index
                        ? index === currentExample.quiz.correctIndex
                          ? 'success'
                          : 'error'
                        : 'primary'
                    }
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    {option}
                  </Button>
                ))}
              </Box>

              {selectedAnswer !== null && selectedAnswer !== currentExample.quiz?.correctIndex && (
                <Box sx={{ mb: 2 }}>
                  <Button
                    startIcon={<TipsAndUpdates />}
                    onClick={() => setShowHint(!showHint)}
                    size="small"
                  >
                    ヒントを見る
                  </Button>
                  {showHint && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      {currentExample.quiz?.hint}
                    </Alert>
                  )}
                </Box>
              )}

              {selectedAnswer === currentExample.quiz?.correctIndex && (
                <Alert severity="success">
                  正解です！抽象的な考え方が身についてきましたね！
                </Alert>
              )}
            </Box>
          )}

          {/* ナビゲーションボタン */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              startIcon={<NavigateBefore />}
              onClick={handleBack}
              disabled={activeStep === 0 && !showQuiz}
            >
              戻る
            </Button>
            <Button
              endIcon={<NavigateNext />}
              onClick={handleNext}
              variant="contained"
              disabled={showQuiz && selectedAnswer === null}
            >
              {activeStep < 2 ? '次へ' : showQuiz ? '完了' : 'クイズへ'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};