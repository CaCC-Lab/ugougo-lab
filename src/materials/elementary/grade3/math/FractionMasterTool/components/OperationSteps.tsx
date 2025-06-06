import React from 'react';
import { Box, Typography, Paper, Button, Chip, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { OperationStep, OperationType } from '../hooks/useFractionLogic';
import { FractionVisualizer } from './FractionVisualizer';

interface OperationStepsProps {
  operationType: OperationType;
  steps: OperationStep[];
  currentStep: number;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const OperationSteps: React.FC<OperationStepsProps> = ({
  operationType,
  steps,
  currentStep,
  onNextStep,
  onPrevStep
}) => {
  if (steps.length === 0) return null;

  const getOperationSymbol = () => {
    switch (operationType) {
      case 'add': return '+';
      case 'subtract': return '−';
      case 'multiply': return '×';
      case 'divide': return '÷';
    }
  };

  const getOperationName = () => {
    switch (operationType) {
      case 'add': return '足し算';
      case 'subtract': return '引き算';
      case 'multiply': return 'かけ算';
      case 'divide': return '割り算';
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="h6">
          分数の{getOperationName()}
        </Typography>
        <Chip
          label={`ステップ ${currentStep + 1} / ${steps.length}`}
          color="primary"
          size="small"
        />
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 3, height: 8, borderRadius: 1 }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper elevation={3} sx={{ p: 4, minHeight: 300 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
              {step.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              {step.fractions.map((fraction, index) => (
                <React.Fragment key={index}>
                  {index > 0 && index < step.fractions.length && !step.result && (
                    <Typography variant="h3" sx={{ mx: 2 }}>
                      {getOperationSymbol()}
                    </Typography>
                  )}
                  <Box sx={{ textAlign: 'center' }}>
                    <FractionVisualizer
                      fraction={fraction}
                      visualType={
                        step.visual === 'common-denominator' ? 'rectangle' :
                        step.visual === 'add-numerators' ? 'chocolate' :
                        operationType === 'multiply' || operationType === 'divide' ? 'circle' : 'pizza'
                      }
                      size={150}
                      animated={true}
                    />
                    <Typography variant="h5" sx={{ mt: 2 }}>
                      {fraction.numerator}/{fraction.denominator}
                    </Typography>
                  </Box>
                </React.Fragment>
              ))}
            </Box>

            {step.result && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                    textAlign: 'center',
                    mx: 'auto',
                    maxWidth: 400
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    答え
                  </Typography>
                  <Typography variant="h3">
                    {step.result.numerator}/{step.result.denominator}
                  </Typography>
                </Paper>
              </motion.div>
            )}

            {/* 特別な説明 */}
            {step.visual === 'common-denominator' && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2">
                  💡 ヒント：分母を同じにすることで、分子だけを見て計算できるようになります
                </Typography>
              </Box>
            )}

            {operationType === 'divide' && currentStep === 1 && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography variant="body2">
                  💡 ヒント：分数の割り算は、割る数をひっくり返してかけ算に変えます
                </Typography>
              </Box>
            )}
          </Paper>
        </motion.div>
      </AnimatePresence>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onPrevStep}
          disabled={currentStep === 0}
        >
          前のステップ
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={onNextStep}
          disabled={currentStep === steps.length - 1}
        >
          次のステップ
        </Button>
      </Box>
    </Box>
  );
};