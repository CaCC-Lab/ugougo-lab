import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Slider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface VariableAnimationProps {
  expression: string;
  showHint?: boolean;
}

const VariableAnimation: React.FC<VariableAnimationProps> = ({ expression, showHint = false }) => {
  const [xValue, setXValue] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const parseExpression = (expr: string, x: number): number => {
    // 簡単な式の評価 (例: "x", "2x + 3", "x - 1")
    let result = expr;
    result = result.replace(/(\d*)x/g, (_, coeff) => {
      const coefficient = coeff || '1';
      return (parseInt(coefficient) * x).toString();
    });
    
    try {
      // 安全な評価のための簡易パーサー
      const parts = result.split(/([+-])/);
      let total = 0;
      let operator = '+';
      
      for (const part of parts) {
        if (part === '+' || part === '-') {
          operator = part;
        } else if (part.trim()) {
          const value = parseInt(part);
          if (!isNaN(value)) {
            total = operator === '+' ? total + value : total - value;
          }
        }
      }
      
      return total;
    } catch {
      return 0;
    }
  };

  const animationSteps = [
    { text: `xに${xValue}を代入します`, highlight: 'x' },
    { text: expression.replace(/x/g, `(${xValue})`), highlight: 'substitute' },
    { text: `計算すると...`, highlight: 'calculate' },
    { text: `答えは ${parseExpression(expression, xValue)}`, highlight: 'result' }
  ];

  const playAnimation = async () => {
    setIsPlaying(true);
    setCurrentStep(0);
    
    for (let i = 0; i < animationSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsPlaying(false);
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const renderExpression = () => {
    if (currentStep === 0) {
      // xをハイライト
      return expression.split('').map((char, index) => (
        <motion.span
          key={index}
          animate={char === 'x' ? { scale: [1, 1.3, 1], color: ['#000', '#f50057', '#000'] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ fontSize: '2rem' }}
        >
          {char}
        </motion.span>
      ));
    } else if (currentStep === 1) {
      // xを値で置き換え
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ fontSize: '2rem' }}
        >
          {expression.replace(/x/g, `(${xValue})`)}
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ fontSize: '2rem' }}
        >
          {animationSteps[currentStep].text}
        </motion.div>
      );
    }
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            式: <strong>{expression}</strong>
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Typography>x =</Typography>
            <Slider
              value={xValue}
              onChange={(_, value) => {
                setXValue(value as number);
                reset();
              }}
              min={1}
              max={10}
              marks
              valueLabelDisplay="on"
              sx={{ flex: 1, maxWidth: 300 }}
              disabled={isPlaying}
            />
          </Box>
        </Box>

        <Box
          sx={{
            minHeight: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            borderRadius: 2,
            p: 3,
            mb: 3
          }}
        >
          <AnimatePresence mode="wait">
            {renderExpression()}
          </AnimatePresence>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={playAnimation}
            disabled={isPlaying}
            startIcon={<PlayArrowIcon />}
          >
            アニメーション再生
          </Button>
          <Button
            variant="outlined"
            onClick={reset}
            disabled={isPlaying}
            startIcon={<RestartAltIcon />}
          >
            リセット
          </Button>
        </Box>

        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Paper sx={{ p: 2, mt: 3, bgcolor: 'warning.light' }}>
              <Typography variant="body2">
                💡 文字xは「どんな数でも入る箱」のようなもの。
                xの値を変えると、式全体の値も変わります！
              </Typography>
            </Paper>
          </motion.div>
        )}
      </Paper>

      {/* 視覚的な説明 */}
      <Paper elevation={1} sx={{ p: 3, mt: 2, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          文字式の意味
        </Typography>
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Typography variant="body2">
            • <strong>x</strong>: 1つの未知の数を表す
          </Typography>
          <Typography variant="body2">
            • <strong>2x</strong>: xの2倍（x + x と同じ）
          </Typography>
          <Typography variant="body2">
            • <strong>x + 3</strong>: xに3を足した数
          </Typography>
          <Typography variant="body2">
            • <strong>2x + 3</strong>: xの2倍に3を足した数
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default VariableAnimation;