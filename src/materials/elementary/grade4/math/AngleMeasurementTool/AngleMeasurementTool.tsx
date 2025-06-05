import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Button, Card, CardContent, ToggleButtonGroup, ToggleButton, Slider } from '@mui/material';
import { Refresh, QuestionMark, Check, Clear } from '@mui/icons-material';
import { motion } from 'framer-motion';

type Mode = 'practice' | 'quiz';
type AngleType = 'acute' | 'right' | 'obtuse' | 'straight';

interface QuizQuestion {
  angle: number;
  type: AngleType;
}

const AngleMeasurementTool: React.FC = () => {
  const [mode, setMode] = useState<Mode>('practice');
  const [angle, setAngle] = useState(45);
  const [showAngle, setShowAngle] = useState(true);
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getAngleType = (angle: number): AngleType => {
    if (angle < 90) return 'acute';
    if (angle === 90) return 'right';
    if (angle < 180) return 'obtuse';
    return 'straight';
  };

  const getAngleTypeJapanese = (type: AngleType): string => {
    switch (type) {
      case 'acute': return 'えいかく（90度より小さい）';
      case 'right': return 'ちょっかく（90度）';
      case 'obtuse': return 'どんかく（90度より大きい）';
      case 'straight': return 'へいかく（180度）';
    }
  };

  useEffect(() => {
    drawAngle();
  }, [angle, mode]);

  const drawAngle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 150;

    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height);

    // 角度の弧を描画
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, (angle * Math.PI) / 180);
    ctx.fillStyle = 'rgba(33, 150, 243, 0.2)';
    ctx.fill();

    // 基準線（水平線）
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 角度の線
    const angleRad = (angle * Math.PI) / 180;
    const endX = centerX + radius * Math.cos(angleRad);
    const endY = centerY - radius * Math.sin(angleRad);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 頂点
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();

    // グリッド線（10度ごと）
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 180; i += 10) {
      const rad = (i * Math.PI) / 180;
      const x = centerX + radius * Math.cos(rad);
      const y = centerY - radius * Math.sin(rad);
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // 角度の表示
    if (showAngle || mode === 'practice') {
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const labelX = centerX + 80 * Math.cos(angleRad / 2);
      const labelY = centerY - 80 * Math.sin(angleRad / 2);
      ctx.fillText(`${angle}°`, labelX, labelY);
    }
  };

  const generateQuizQuestion = () => {
    const angles = [30, 45, 60, 90, 120, 135, 150, 180];
    const randomAngle = angles[Math.floor(Math.random() * angles.length)];
    
    setQuizQuestion({
      angle: randomAngle,
      type: getAngleType(randomAngle)
    });
    setAngle(randomAngle);
    setShowAngle(false);
    setUserAnswer('');
    setFeedback(null);
  };

  const checkAnswer = () => {
    if (!quizQuestion || !userAnswer) return;

    const userAnswerNum = parseInt(userAnswer);
    const correct = userAnswerNum === quizQuestion.angle;

    setFeedback({
      correct,
      message: correct 
        ? 'せいかい！よくできました！' 
        : `ざんねん。せいかいは ${quizQuestion.angle}° でした。`
    });

    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    setShowAngle(true);
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setAngle(newValue as number);
  };

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: Mode | null) => {
    if (newMode) {
      setMode(newMode);
      if (newMode === 'quiz') {
        generateQuizQuestion();
        setScore({ correct: 0, total: 0 });
      } else {
        setShowAngle(true);
        setFeedback(null);
      }
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', my: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          かくど そくてい器
        </Typography>

        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            fullWidth
          >
            <ToggleButton value="practice">れんしゅうモード</ToggleButton>
            <ToggleButton value="quiz">クイズモード</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            style={{ 
              display: 'block',
              margin: '0 auto',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          />
        </Paper>

        {mode === 'practice' && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                かくどを へんこうする（0° ～ 180°）
              </Typography>
              <Slider
                value={angle}
                onChange={handleSliderChange}
                min={0}
                max={180}
                step={5}
                marks={[
                  { value: 0, label: '0°' },
                  { value: 45, label: '45°' },
                  { value: 90, label: '90°' },
                  { value: 135, label: '135°' },
                  { value: 180, label: '180°' }
                ]}
                valueLabelDisplay="on"
              />
            </Box>

            <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white' }}>
              <Typography variant="h6" gutterBottom>
                げんざいの かくど: {angle}°
              </Typography>
              <Typography variant="body2">
                しゅるい: {getAngleTypeJapanese(getAngleType(angle))}
              </Typography>
            </Paper>
          </>
        )}

        {mode === 'quiz' && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                この かくどは なんど でしょう？
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="かくどを にゅうりょく"
                  style={{
                    padding: '8px 12px',
                    fontSize: '16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '150px'
                  }}
                  disabled={feedback !== null}
                />
                <Typography variant="body1">ど</Typography>
                
                {!feedback && (
                  <Button
                    variant="contained"
                    onClick={checkAnswer}
                    disabled={!userAnswer}
                    startIcon={<Check />}
                  >
                    こたえる
                  </Button>
                )}
              </Box>

              {feedback && (
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: feedback.correct ? 'success.light' : 'error.light',
                    color: 'white'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {feedback.correct ? <Check /> : <Clear />}
                    <Typography>{feedback.message}</Typography>
                  </Box>
                </Paper>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={generateQuizQuestion}
                  startIcon={<Refresh />}
                >
                  つぎの もんだい
                </Button>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  せいかい: {score.correct} / {score.total}
                </Typography>
                {score.total > 0 && (
                  <Typography variant="body2">
                    せいかいりつ: {Math.round((score.correct / score.total) * 100)}%
                  </Typography>
                )}
              </Box>
            </Box>
          </>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            かくどの しゅるい
          </Typography>
          <Typography variant="body2">
            • えいかく: 0° より おおきく 90° より ちいさい<br />
            • ちょっかく: ちょうど 90°<br />
            • どんかく: 90° より おおきく 180° より ちいさい<br />
            • へいかく: ちょうど 180°
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AngleMeasurementTool;