import React, { useState } from 'react';
import { Box, Card, Typography, Stepper, Step, StepLabel, Button } from '@mui/material';
import { MaterialWrapper, useLearningTrackerContext } from '../../../../../components/wrappers/MaterialWrapper';
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

// 代数入門システム（内部コンポーネント）
const AlgebraIntroductionSystemContent: React.FC = () => {
  const { recordInteraction, recordAnswer: recordAnswerToTracker } = useLearningTrackerContext();
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
      recordInteraction('click');
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      setShowHint(false);
      recordInteraction('click');
    }
  };

  const renderStageContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <NumberToPlaceholder
            onComplete={(success) => {
              recordAnswer(success);
              recordAnswerToTracker(success, {
                stage: '具体的な数から記号へ',
                step: activeStep
              });
              if (success) handleNext();
            }}
            onMisconception={(type) => {
              recordMisconception(type);
              recordAnswerToTracker(false, {
                misconception: type,
                stage: '具体的な数から記号へ'
              });
            }}
          />
        );
      case 1:
        return (
          <PlaceholderToVariable
            onComplete={(success) => {
              recordAnswer(success);
              recordAnswerToTracker(success, {
                stage: '記号から文字へ',
                step: activeStep
              });
              if (success) handleNext();
            }}
            onMisconception={(type) => {
              recordMisconception(type);
              recordAnswerToTracker(false, {
                misconception: type,
                stage: '記号から文字へ'
              });
            }}
          />
        );
      case 2:
        return (
          <Box>
            <BalanceScale
              equation={currentProblem?.equation || 'x + 3 = 8'}
              onSolve={(correct) => {
                recordAnswer(correct);
                recordAnswerToTracker(correct, {
                  stage: '文字式と方程式',
                  equation: currentProblem?.equation || 'x + 3 = 8',
                  step: activeStep
                });
                if (correct) getNextProblem();
              }}
            />
            <Box sx={{ mt: 4 }}>
              <AlgebraicManipulator
                expression={currentProblem?.expression || '2x + 3'}
                onManipulate={(steps) => {
                  // 操作履歴を記録
                  console.log('操作ステップ:', steps);
                  recordInteraction('drag');
                }}
              />
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
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
            onClick={() => {
              setShowHint(!showHint);
              recordInteraction('click');
            }}
            variant="outlined"
            color="info"
          >
            ヒントを{showHint ? '隠す' : '表示'}
          </Button>

          <Button
            onClick={() => {
              resetProgress();
              recordInteraction('click');
            }}
            variant="outlined"
            color="warning"
          >
            最初から
          </Button>
        </Box>
      </Box>
  );
};

// 代数入門システム（MaterialWrapperでラップ）
const AlgebraIntroductionSystem: React.FC = () => {
  return (
    <MaterialWrapper
      materialId="algebra-introduction"
      materialName="代数入門システム"
      showMetricsButton={true}
      showAssistant={true}
    >
      <AlgebraIntroductionSystemContent />
    </MaterialWrapper>
  );
};

export default AlgebraIntroductionSystem;