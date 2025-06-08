import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Waves as WavesIcon,
  Calculate as CalculateIcon,
  School as LearnIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { explanations } from '../data/earthquakeData';

interface LearningPanelProps {
  onQuizComplete?: (score: number) => void;
}

export const LearningPanel: React.FC<LearningPanelProps> = ({ onQuizComplete }) => {
  const [tabValue, setTabValue] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleQuizSubmit = () => {
    const answer = parseFloat(quizAnswer);
    if (isNaN(answer)) {
      setQuizResult('数値を入力してください');
      return;
    }

    // 初期微動継続時間が15秒の場合の震源距離
    const correctAnswer = 7.42 * 15;
    const tolerance = 5; // 誤差許容範囲

    if (Math.abs(answer - correctAnswer) <= tolerance) {
      setQuizResult(`正解！震源距離は約${correctAnswer.toFixed(1)}kmです。`);
      onQuizComplete?.(100);
    } else {
      setQuizResult(`惜しい！正解は${correctAnswer.toFixed(1)}kmです。計算式：7.42 × 15 = ${correctAnswer.toFixed(1)}`);
      onQuizComplete?.(50);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="P波・S波" icon={<WavesIcon />} iconPosition="start" />
          <Tab label="計算方法" icon={<CalculateIcon />} iconPosition="start" />
          <Tab label="学習のポイント" icon={<LearnIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2, height: 'calc(100% - 100px)', overflowY: 'auto' }}>
        {tabValue === 0 && (
          <Box>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h6" gutterBottom>
                {explanations.pWave.title}
              </Typography>
              <List>
                {explanations.pWave.content.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <SpeedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                {explanations.sWave.title}
              </Typography>
              <List>
                {explanations.sWave.content.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <WavesIcon color="error" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </motion.div>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h6" gutterBottom>
                {explanations.psDuration.title}
              </Typography>
              <List>
                {explanations.psDuration.content.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CalculateIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  大森公式の覚え方
                </Typography>
                <Typography variant="body2">
                  「なじみ（7.42）のある数字」として覚えましょう！
                </Typography>
              </Alert>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                {explanations.calculation.title}
              </Typography>
              <List>
                {explanations.calculation.content.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={`${index + 1}. ${item}`}
                      primaryTypographyProps={{
                        variant: 'body2'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </motion.div>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h6" gutterBottom>
                学習のポイント
              </Typography>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  なぜP波とS波で速度が違うの？
                </Typography>
                <Typography variant="body2">
                  P波は岩盤を押し引きする縦波、S波は横に揺らす横波です。
                  固体中では縦波の方が速く伝わる性質があります。
                </Typography>
              </Alert>

              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  実際の地震では
                </Typography>
                <Typography variant="body2">
                  実際の地震では、地下構造の影響で波の速度が変化します。
                  また、震源の深さによっても到達時間が変わります。
                </Typography>
              </Alert>

              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  緊急地震速報の仕組み
                </Typography>
                <Typography variant="body2">
                  P波を検知した時点で、より大きな揺れのS波が来ることを予測し、
                  警報を発信します。数秒〜数十秒の猶予時間が生まれます。
                </Typography>
              </Alert>
            </motion.div>
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<QuizIcon />}
          onClick={() => setQuizOpen(true)}
        >
          練習問題に挑戦
        </Button>
      </Box>

      {/* クイズダイアログ */}
      <Dialog open={quizOpen} onClose={() => setQuizOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>練習問題</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            ある地震で、P波到達から15秒後にS波が到達しました。
            震源までの距離は何kmでしょうか？
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            ヒント：大森公式を使います（震源距離 = 7.42 × 初期微動継続時間）
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="震源距離 (km)"
            type="number"
            fullWidth
            variant="outlined"
            value={quizAnswer}
            onChange={(e) => setQuizAnswer(e.target.value)}
            inputProps={{ step: 0.1 }}
          />
          {quizResult && (
            <Alert 
              severity={quizResult.includes('正解') ? 'success' : 'info'} 
              sx={{ mt: 2 }}
            >
              {quizResult}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setQuizOpen(false);
            setQuizAnswer('');
            setQuizResult(null);
          }}>
            閉じる
          </Button>
          <Button onClick={handleQuizSubmit} variant="contained">
            答え合わせ
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};