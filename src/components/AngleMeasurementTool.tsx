import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Button,
  Paper,
  LinearProgress,
  IconButton,
  Grid,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  TextField
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  Straighten as RulerIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';

// 角度測定器
function AngleMeasurementTool({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(45); // 現在の角度
  const [showProtractor, setShowProtractor] = useState(true); // 分度器表示
  const [mode, setMode] = useState<'practice' | 'quiz'>('practice');
  const [quizAngle, setQuizAngle] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const progress = Math.min((score / 10) * 100, 100);
  
  // 角度を描画
  const drawAngle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 背景
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 分度器を描画
    if (showProtractor) {
      // 外側の半円
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI, true);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 目盛り
      for (let i = 0; i <= 180; i += 10) {
        const angleRad = (180 - i) * Math.PI / 180;
        const startRadius = i % 30 === 0 ? radius - 15 : radius - 10;
        const endRadius = radius;
        
        const x1 = centerX + startRadius * Math.cos(angleRad);
        const y1 = centerY - startRadius * Math.sin(angleRad);
        const x2 = centerX + endRadius * Math.cos(angleRad);
        const y2 = centerY - endRadius * Math.sin(angleRad);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = i % 30 === 0 ? '#333' : '#999';
        ctx.lineWidth = i % 30 === 0 ? 2 : 1;
        ctx.stroke();
        
        // 数字
        if (i % 30 === 0) {
          ctx.fillStyle = '#333';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const textRadius = radius - 25;
          const tx = centerX + textRadius * Math.cos(angleRad);
          const ty = centerY - textRadius * Math.sin(angleRad);
          ctx.fillText(i.toString(), tx, ty);
        }
      }
      
      // 中心線
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // 角度の表示
    const displayAngle = mode === 'quiz' ? quizAngle : angle;
    
    // 角度の腕
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    
    // 基準線（0度）
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius * 0.8, centerY);
    ctx.stroke();
    
    // 角度線
    const angleRad = displayAngle * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + radius * 0.8 * Math.cos(angleRad),
      centerY - radius * 0.8 * Math.sin(angleRad)
    );
    ctx.stroke();
    
    // 角度の弧
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, -angleRad, true);
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 角度の数値表示（練習モードのみ）
    if (mode === 'practice') {
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${angle}°`, centerX, centerY + 80);
    }
    
    // 頂点
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
  };
  
  // マウス/タッチイベントから角度を計算
  const calculateAngleFromPosition = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const dx = x - centerX;
    const dy = centerY - y; // Y軸を反転
    
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle = 0;
    if (angle > 180) angle = 180;
    
    setAngle(Math.round(angle));
  };
  
  // イベントハンドラー
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && mode === 'practice') {
      calculateAngleFromPosition(e.clientX, e.clientY);
    }
  };
  
  // クイズを生成
  const generateQuiz = () => {
    const angles = [30, 45, 60, 90, 120, 135, 150];
    const randomAngle = angles[Math.floor(Math.random() * angles.length)];
    setQuizAngle(randomAngle);
    setUserAnswer('');
    setShowAnswer(false);
  };
  
  // 答えをチェック
  const checkAnswer = () => {
    const answer = parseInt(userAnswer);
    if (isNaN(answer)) return;
    
    setAttempts(prev => prev + 1);
    setShowAnswer(true);
    
    if (Math.abs(answer - quizAngle) <= 5) { // 5度の誤差を許容
      setScore(prev => prev + 1);
      setTimeout(() => {
        generateQuiz();
      }, 2000);
    }
  };
  
  // リセット
  const handleReset = () => {
    setAngle(45);
    setScore(0);
    setAttempts(0);
    setShowAnswer(false);
    if (mode === 'quiz') {
      generateQuiz();
    }
  };
  
  // エフェクト
  useEffect(() => {
    drawAngle();
  }, [angle, quizAngle, showProtractor, mode]);
  
  useEffect(() => {
    if (mode === 'quiz') {
      generateQuiz();
    }
  }, [mode]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          角度測定器
        </Typography>
        <Box>
          <IconButton onClick={handleReset} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        分度器の使い方と角度測定を練習！インタラクティブな分度器で、正確な角度の測り方をマスターしよう。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {mode === 'practice' ? (
          <Chip 
            label={`角度: ${angle}°`}
            icon={<RulerIcon />}
            color="primary" 
            size="medium"
          />
        ) : (
          <>
            <Chip 
              label={`得点: ${score}`} 
              color="success" 
              size="medium"
            />
            <Chip 
              label={`挑戦: ${attempts}`} 
              color="secondary" 
              size="medium"
            />
          </>
        )}
      </Box>

      {/* 進捗バー */}
      {mode === 'quiz' && progress > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">学習進捗</Typography>
            <Typography variant="caption">{progress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

      {/* モード選択 */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, value) => value && setMode(value)}
          fullWidth
        >
          <ToggleButton value="practice">
            練習モード
          </ToggleButton>
          <ToggleButton value="quiz">
            <QuizIcon sx={{ mr: 1 }} />
            クイズモード
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：分度器 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseUp}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: mode === 'practice' && isDragging ? 'grabbing' : 'grab'
                }}
              />
            </Box>
            
            {mode === 'practice' && (
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant={showProtractor ? 'contained' : 'outlined'}
                  onClick={() => setShowProtractor(!showProtractor)}
                >
                  {showProtractor ? '分度器を隠す' : '分度器を表示'}
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  青い線をドラッグして角度を変えてみよう！
                </Typography>
              </Box>
            )}
            
            {mode === 'quiz' && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  この角度は何度でしょう？
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                  <TextField
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="角度を入力"
                    size="small"
                    sx={{ width: 120 }}
                    disabled={showAnswer}
                  />
                  <Typography>度</Typography>
                  <Button
                    variant="contained"
                    onClick={checkAnswer}
                    disabled={!userAnswer || showAnswer}
                  >
                    答え合わせ
                  </Button>
                </Box>
                {showAnswer && (
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mt: 2, 
                      color: Math.abs(parseInt(userAnswer) - quizAngle) <= 5 ? 'success.main' : 'error.main'
                    }}
                  >
                    {Math.abs(parseInt(userAnswer) - quizAngle) <= 5 
                      ? `正解！ ${quizAngle}度でした！` 
                      : `残念... 正解は${quizAngle}度でした`}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 右側：ヒント */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                角度の種類
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" paragraph>
                  <strong>鋭角</strong>：0°より大きく90°より小さい角
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  <strong>直角</strong>：ちょうど90°の角
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  <strong>鈍角</strong>：90°より大きく180°より小さい角
                </Typography>
                <Typography component="li" variant="body2" paragraph>
                  <strong>平角</strong>：ちょうど180°の角
                </Typography>
              </Box>
              
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                よく使う角度
              </Typography>
              <Grid container spacing={1}>
                {[30, 45, 60, 90, 120, 135, 150, 180].map(a => (
                  <Grid size={3} key={a}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 1, 
                        textAlign: 'center',
                        bgcolor: a === 90 ? 'primary.light' : 'background.paper'
                      }}
                    >
                      <Typography variant="body2">{a}°</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#fff3e0' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          📐 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 分度器の中心を角の頂点に合わせます<br/>
          • 基準線（0度の線）を角の一つの辺に合わせます<br/>
          • もう一つの辺が指す目盛りを読みます<br/>
          • 練習を重ねて、目測でも大体の角度がわかるようになろう！
        </Typography>
      </Paper>
    </Box>
  );
}

export default AngleMeasurementTool;