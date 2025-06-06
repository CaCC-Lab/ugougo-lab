import React, { useState } from 'react';
import { Box, Card, Typography, Stepper, Step, StepLabel, Button } from '@mui/material';
import { MaterialBase } from '../../../../../components/educational/MaterialBase';
import { 
  NumberToPlaceholder,
  PlaceholderToVariable,
  BalanceScale,
  VariableAnimation,
  AlgebraicManipulator,
  MisconceptionDetector,
  LearningProgress
} from './components';
import { useAlgebraLearning } from './hooks';
import { motion, AnimatePresence } from 'framer-motion';

const AlgebraIntroductionSystem: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  const {
    currentProblem,
    progress,
    misconceptions,
    recordAnswer,
    recordMisconception,
    getNextProblem,
    resetProgress
  } = useAlgebraLearning();

  const steps = [
    '具体的な数から記号へ',
    '記号から文字へ',
    '文字式と方程式'
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
      setShowHint(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      setShowHint(false);
    }
  };

  const renderStageContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <NumberToPlaceholder
            onComplete={(success) => {
              recordAnswer(success);
              if (success) handleNext();
            }}
            onMisconception={(type) => recordMisconception(type)}
          />
        );
      case 1:
        return (
          <PlaceholderToVariable
            onComplete={(success) => {
              recordAnswer(success);
              if (success) handleNext();
            }}
            onMisconception={(type) => recordMisconception(type)}
          />
        );
      case 2:
        return (
          <Box>
            <BalanceScale
              equation={currentProblem?.equation || 'x + 3 = 8'}
              onSolve={(correct) => {
                recordAnswer(correct);
                if (correct) getNextProblem();
              }}
            />
            <Box sx={{ mt: 4 }}>
              <AlgebraicManipulator
                expression={currentProblem?.expression || '2x + 3'}
                onManipulate={(steps) => {
                  // 操作履歴を記録
                  console.log('操作ステップ:', steps);
                }}
              />
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  const material = {
    id: 'algebra-introduction',
    title: '代数入門システム',
    description: '算数から数学へ - 文字式と方程式の世界を体験しよう',
    gradeLevel: 'juniorHigh1' as const,
    subject: 'math' as const,
    tags: ['代数', '文字式', '方程式'],
    difficulty: 'normal' as const,
    estimatedTime: 30,
    isPremium: false
  };

  return (
    <MaterialBase material={material}>
      <Box sx={{ width: '100%', p: 3 }}>
        {/* 学習進度表示 */}
        <Card sx={{ mb: 3, p: 2, bgcolor: 'background.paper' }}>
          <LearningProgress progress={progress} />
        </Card>

        {/* ステッパー */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* 誤解パターン検出アラート */}
        <AnimatePresence>
          {misconceptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MisconceptionDetector
                misconceptions={misconceptions}
                onClose={() => setShowHint(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* メインコンテンツ */}
        <Card sx={{ p: 4, mb: 3 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderStageContent()}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* 文字式アニメーション */}
        {activeStep >= 1 && (
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              文字式の意味を理解しよう
            </Typography>
            <VariableAnimation
              expression={activeStep === 1 ? 'x' : '2x + 3'}
              showHint={showHint}
            />
          </Card>
        )}

        {/* ナビゲーションボタン */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
          >
            前のステップ
          </Button>
          
          <Button
            onClick={() => setShowHint(!showHint)}
            variant="outlined"
            color="info"
          >
            ヒントを{showHint ? '隠す' : '表示'}
          </Button>

          <Button
            onClick={resetProgress}
            variant="outlined"
            color="warning"
          >
            最初から
          </Button>
        </Box>
      </Box>
    </MaterialBase>
  );
};

export default AlgebraIntroductionSystem;