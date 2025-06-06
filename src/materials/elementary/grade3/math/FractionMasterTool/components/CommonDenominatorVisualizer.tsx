import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Stepper, Step, StepLabel } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import type { Fraction } from '../hooks/useFractionLogic';
import { FractionVisualizer } from './FractionVisualizer';

interface CommonDenominatorVisualizerProps {
  fractions: Fraction[];
  findCommonDenominator: (f1: Fraction, f2: Fraction) => [Fraction, Fraction, number];
}

export const CommonDenominatorVisualizer: React.FC<CommonDenominatorVisualizerProps> = ({
  fractions,
  findCommonDenominator
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [commonFractions, setCommonFractions] = useState<[Fraction, Fraction] | null>(null);
  const [commonDenom, setCommonDenom] = useState<number>(0);

  const steps = [
    '元の分数を確認',
    '最小公倍数を見つける',
    '分母を揃える',
    '完成！'
  ];

  const handleNext = () => {
    if (activeStep === 1) {
      const [common1, common2, denom] = findCommonDenominator(fractions[0], fractions[1]);
      setCommonFractions([common1, common2]);
      setCommonDenom(denom);
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setCommonFractions(null);
    setCommonDenom(0);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // ステップ1: 元の分数を確認
        return (
          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                最初の分数
              </Typography>
              <FractionVisualizer
                fraction={fractions[0]}
                visualType="rectangle"
                size={200}
                animated={true}
              />
              <Typography variant="h5" align="center" sx={{ mt: 2 }}>
                {fractions[0].numerator}/{fractions[0].denominator}
              </Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                2つ目の分数
              </Typography>
              <FractionVisualizer
                fraction={fractions[1]}
                visualType="rectangle"
                size={200}
                animated={true}
              />
              <Typography variant="h5" align="center" sx={{ mt: 2 }}>
                {fractions[1].numerator}/{fractions[1].denominator}
              </Typography>
            </Paper>
          </Box>
        );

      case 1:
        // ステップ2: 最小公倍数を見つける
        const factors1 = [];
        const factors2 = [];
        for (let i = 1; i <= 10; i++) {
          factors1.push(fractions[0].denominator * i);
          factors2.push(fractions[1].denominator * i);
        }
        
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              分母の最小公倍数を見つけます
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {fractions[0].denominator}の倍数
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: 200 }}>
                  {factors1.slice(0, 6).map((factor, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Paper
                        sx={{
                          px: 2,
                          py: 1,
                          bgcolor: factor === commonDenom ? '#4ecdc4' : '#f0f0f0'
                        }}
                      >
                        {factor}
                      </Paper>
                    </motion.div>
                  ))}
                </Box>
              </Paper>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {fractions[1].denominator}の倍数
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: 200 }}>
                  {factors2.slice(0, 6).map((factor, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Paper
                        sx={{
                          px: 2,
                          py: 1,
                          bgcolor: factor === commonDenom ? '#4ecdc4' : '#f0f0f0'
                        }}
                      >
                        {factor}
                      </Paper>
                    </motion.div>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        );

      case 2:
        // ステップ3: 分母を揃える
        if (!commonFractions) return null;
        
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              分母を{commonDenom}に揃えます
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              <Box>
                <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
                  <Typography variant="subtitle2" align="center" sx={{ mb: 1 }}>
                    変換前
                  </Typography>
                  <FractionVisualizer
                    fraction={fractions[0]}
                    visualType="rectangle"
                    size={150}
                    animated={false}
                  />
                </Paper>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Typography variant="h6" align="center" sx={{ my: 2 }}>
                    ↓ ×{commonDenom / fractions[0].denominator}
                  </Typography>
                </motion.div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="subtitle2" align="center" sx={{ mb: 1 }}>
                      変換後
                    </Typography>
                    <FractionVisualizer
                      fraction={commonFractions[0]}
                      visualType="rectangle"
                      size={150}
                      animated={true}
                    />
                  </Paper>
                </motion.div>
              </Box>
              
              <Box>
                <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
                  <Typography variant="subtitle2" align="center" sx={{ mb: 1 }}>
                    変換前
                  </Typography>
                  <FractionVisualizer
                    fraction={fractions[1]}
                    visualType="rectangle"
                    size={150}
                    animated={false}
                  />
                </Paper>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Typography variant="h6" align="center" sx={{ my: 2 }}>
                    ↓ ×{commonDenom / fractions[1].denominator}
                  </Typography>
                </motion.div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="subtitle2" align="center" sx={{ mb: 1 }}>
                      変換後
                    </Typography>
                    <FractionVisualizer
                      fraction={commonFractions[1]}
                      visualType="rectangle"
                      size={150}
                      animated={true}
                    />
                  </Paper>
                </motion.div>
              </Box>
            </Box>
          </Box>
        );

      case 3:
        // ステップ4: 完成
        if (!commonFractions) return null;
        
        return (
          <Box>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <Paper elevation={3} sx={{ p: 4, bgcolor: '#e3f2fd' }}>
                <Typography variant="h5" align="center" sx={{ mb: 3 }}>
                  通分完了！
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <FractionVisualizer
                      fraction={commonFractions[0]}
                      visualType="circle"
                      size={180}
                      animated={true}
                    />
                    <Typography variant="h4" sx={{ mt: 2 }}>
                      {commonFractions[0].numerator}/{commonFractions[0].denominator}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <FractionVisualizer
                      fraction={commonFractions[1]}
                      visualType="circle"
                      size={180}
                      animated={true}
                    />
                    <Typography variant="h4" sx={{ mt: 2 }}>
                      {commonFractions[1].numerator}/{commonFractions[1].denominator}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" align="center" sx={{ mt: 3 }}>
                  分母が同じになったので、分子を比べるだけで大小がわかります！
                </Typography>
              </Paper>
            </motion.div>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        通分の仕組み
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 400, mb: 4 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          戻る
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            次へ
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleReset}
          >
            最初から
          </Button>
        )}
      </Box>
    </Box>
  );
};