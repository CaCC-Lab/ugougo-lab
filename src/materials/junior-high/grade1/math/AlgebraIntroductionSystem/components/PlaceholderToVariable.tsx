import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Fade, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

interface PlaceholderToVariableProps {
  onComplete: (success: boolean) => void;
  onMisconception: (type: string) => void;
}

interface TransitionExample {
  placeholder: string;
  variable: string;
  meaning: string;
  example: string;
}

const PlaceholderToVariable: React.FC<PlaceholderToVariableProps> = ({
  onComplete,
  onMisconception
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const transitions: TransitionExample[] = [
    {
      placeholder: '□ + 5 = 12',
      variable: 'x + 5 = 12',
      meaning: '□をxという文字で表すことができます',
      example: 'xは「わからない数」を表す文字です'
    },
    {
      placeholder: '□ × 3 = 15',
      variable: 'a × 3 = 15',
      meaning: '□をaという文字で表すこともできます',
      example: 'aもxと同じように「わからない数」を表します'
    },
    {
      placeholder: '2 × □ + 3 = 11',
      variable: '2y + 3 = 11',
      meaning: '複雑な式でも文字で表せます',
      example: 'yも変数として使えます。×は省略できます！'
    }
  ];

  const handleSubmit = () => {
    const current = transitions[currentStep];
    const expectedVariable = current.variable.split(' ')[0];
    const isCorrect = userAnswer.replace(/\s/g, '') === expectedVariable.replace(/\s/g, '');
    
    if (isCorrect) {
      setShowExplanation(true);
      if (currentStep === transitions.length - 1) {
        setTimeout(() => onComplete(true), 2000);
      }
    } else {
      setAttempts(attempts + 1);
      
      // 誤解パターンの検出
      if (userAnswer.includes('□')) {
        onMisconception('still_using_placeholder');
      } else if (userAnswer.includes('=')) {
        onMisconception('including_equation');
      } else if (attempts >= 2) {
        onMisconception('difficulty_with_variables');
      }
    }
  };

  const handleNext = () => {
    if (currentStep < transitions.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserAnswer('');
      setShowExplanation(false);
      setAttempts(0);
    }
  };

  const renderTransition = () => {
    const current = transitions[currentStep];
    
    return (
      <Box sx={{ position: 'relative', minHeight: 200 }}>
        <AnimatePresence mode="wait">
          {!showExplanation ? (
            <motion.div
              key="transition"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <Paper elevation={2} sx={{ p: 3, bgcolor: 'grey.100' }}>
                  <Typography variant="h5">{current.placeholder}</Typography>
                </Paper>
                
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowForwardIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </motion.div>
                
                <Paper elevation={2} sx={{ p: 3, bgcolor: 'primary.light' }}>
                  <Typography variant="h5" sx={{ minWidth: 150 }}>
                    {userAnswer || '?'}
                  </Typography>
                </Paper>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="explanation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Paper elevation={3} sx={{ p: 4, bgcolor: 'success.light' }}>
                <Typography variant="h5" align="center" gutterBottom>
                  {current.variable}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <LightbulbIcon sx={{ color: 'success.dark' }} />
                  <Typography variant="body1">{current.meaning}</Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  {current.example}
                </Typography>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center">
        ステップ2: 記号から文字へ
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        □（四角）の代わりに、x、y、aなどの文字を使ってみよう！
      </Typography>

      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          変換 {currentStep + 1} / {transitions.length}
        </Typography>
        
        {renderTransition()}

        {!showExplanation && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              □を文字に変えて式を書いてみよう：
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="例: x + 5"
                variant="outlined"
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!userAnswer}
              >
                確認
              </Button>
            </Box>

            {attempts >= 2 && (
              <Fade in={true}>
                <Chip
                  icon={<LightbulbIcon />}
                  label={`ヒント: ${transitions[currentStep].variable.split(' ')[0]}`}
                  color="info"
                  sx={{ mt: 2 }}
                />
              </Fade>
            )}
          </Box>
        )}

        {showExplanation && currentStep < transitions.length - 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              次の変換へ
            </Button>
          </Box>
        )}
      </Paper>

      <Paper elevation={1} sx={{ p: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          なぜ文字を使うの？
        </Typography>
        <Typography variant="body2">
          • 文字を使うと、どんな数でも表せる一般的な式が作れます<br />
          • x, y, a, bなど、好きな文字を使えます<br />
          • 文字を使った式を「文字式」と呼びます
        </Typography>
      </Paper>
    </Box>
  );
};

export default PlaceholderToVariable;