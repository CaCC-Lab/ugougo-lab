import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  Collapse,
  Fab
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  VolumeUp as VolumeIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Phoneme } from '../data/phonemeData';

interface PracticeInterfaceProps {
  phoneme: Phoneme;
  practiceMode: 'phoneme' | 'word';
  isRecording: boolean;
  isPracticing: boolean;
  currentScore: number | null;
  recognizedText: string;
  feedback: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlaySound: (text: string) => void;
  onBack: () => void;
}

export const PracticeInterface: React.FC<PracticeInterfaceProps> = ({
  phoneme,
  practiceMode,
  isRecording,
  isPracticing,
  currentScore,
  recognizedText,
  feedback,
  onStartRecording,
  onStopRecording,
  onPlaySound,
  onBack
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  const currentPracticeWord = phoneme.practiceWords[wordIndex];
  const targetText = practiceMode === 'phoneme' 
    ? phoneme.examples[0]
    : currentPracticeWord.word;

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    if (score >= 50) return '#f44336';
    return '#9e9e9e';
  };

  const nextWord = () => {
    setWordIndex((prev) => (prev + 1) % phoneme.practiceWords.length);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={onBack}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5">
          {phoneme.label}の練習
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {/* 発音情報カード */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h2" sx={{ mr: 2 }}>
                  /{phoneme.symbol}/
                </Typography>
                <IconButton 
                  onClick={() => onPlaySound(targetText)}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <VolumeIcon />
                </IconButton>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                練習する{practiceMode === 'phoneme' ? '音' : '単語'}:
              </Typography>
              
              {practiceMode === 'phoneme' ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {targetText}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    この音を含む例: {phoneme.examples.join(', ')}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" color="primary">
                    {currentPracticeWord.word}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    [{currentPracticeWord.phonetic}]
                  </Typography>
                  <Typography variant="body2">
                    意味: {currentPracticeWord.meaning}
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={nextWord}
                    sx={{ mt: 1 }}
                  >
                    次の単語
                  </Button>
                </Box>
              )}

              <Button
                variant="text"
                startIcon={<InfoIcon />}
                onClick={() => setShowDetails(!showDetails)}
                sx={{ mt: 1 }}
              >
                発音のコツを{showDetails ? '隠す' : '見る'}
              </Button>
            </CardContent>
          </Card>

          {/* 発音のコツ */}
          <Collapse in={showDetails}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  発音のコツ
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    口の形:
                  </Typography>
                  <Typography variant="body2">
                    {phoneme.mouthShape}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    舌の位置:
                  </Typography>
                  <Typography variant="body2">
                    {phoneme.tonguePosition}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary">
                    日本語との違い:
                  </Typography>
                  <Typography variant="body2">
                    {phoneme.japaneseComparison}
                  </Typography>
                </Box>

                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    よくある間違い: {phoneme.commonMistakes.join('、')}
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Collapse>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* 録音インターフェース */}
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              発音してみましょう
            </Typography>

            <Box sx={{ my: 4 }}>
              <AnimatePresence>
                {isPracticing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <LinearProgress />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        録音中...
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              <Fab
                color={isRecording ? 'secondary' : 'primary'}
                size="large"
                onClick={isRecording ? onStopRecording : onStartRecording}
                disabled={!phoneme}
                sx={{ 
                  width: 80, 
                  height: 80,
                  transition: 'all 0.3s ease'
                }}
              >
                {isRecording ? <MicOffIcon /> : <MicIcon />}
              </Fab>

              <Typography variant="body1" sx={{ mt: 2 }}>
                {isRecording ? 'タップして停止' : 'タップして開始'}
              </Typography>
            </Box>

            {/* 結果表示 */}
            {currentScore !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Paper 
                  sx={{ 
                    p: 3, 
                    mt: 3,
                    bgcolor: 'background.default',
                    border: 2,
                    borderColor: getScoreColor(currentScore)
                  }}
                >
                  <Typography variant="h4" sx={{ color: getScoreColor(currentScore), mb: 2 }}>
                    スコア: {currentScore}点
                  </Typography>

                  {recognizedText && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        認識された音声:
                      </Typography>
                      <Typography variant="h6">
                        "{recognizedText}"
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {feedback}
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={onStartRecording}
                    sx={{ mt: 2 }}
                  >
                    もう一度挑戦
                  </Button>
                </Paper>
              </motion.div>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};