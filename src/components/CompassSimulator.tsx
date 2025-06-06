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
  Slider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  Navigation as CompassIcon,
  North as NorthIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';

// 方位
const directions = [
  { angle: 0, name: '北', shortName: 'N', color: '#FF0000' },
  { angle: 45, name: '北東', shortName: 'NE', color: '#FF8C00' },
  { angle: 90, name: '東', shortName: 'E', color: '#FFD700' },
  { angle: 135, name: '南東', shortName: 'SE', color: '#32CD32' },
  { angle: 180, name: '南', shortName: 'S', color: '#4169E1' },
  { angle: 225, name: '南西', shortName: 'SW', color: '#4B0082' },
  { angle: 270, name: '西', shortName: 'W', color: '#8A2BE2' },
  { angle: 315, name: '北西', shortName: 'NW', color: '#DC143C' }
];

// 地図上の場所
const locations = [
  { name: '学校', angle: 45, distance: 100 },
  { name: '公園', angle: 90, distance: 150 },
  { name: '駅', angle: 180, distance: 200 },
  { name: '病院', angle: 270, distance: 120 },
  { name: '図書館', angle: 315, distance: 80 }
];

// コンパスシミュレーター
function CompassSimulator({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0); // コンパスの回転角度
  const [magneticDeclination, setMagneticDeclination] = useState(0); // 磁気偏角
  const [showMap, setShowMap] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizDirection, setQuizDirection] = useState<typeof directions[0] | null>(null);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // コンパスを描画
  const drawCompass = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 背景
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // コンパスの外側の円
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 方位マーク
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation + magneticDeclination) * Math.PI / 180);
    
    directions.forEach(dir => {
      ctx.save();
      ctx.rotate(dir.angle * Math.PI / 180);
      
      // 方位線
      ctx.beginPath();
      ctx.moveTo(0, -radius + 20);
      ctx.lineTo(0, -radius + 5);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 方位文字
      ctx.fillStyle = dir.angle === 0 ? '#FF0000' : '#333';
      ctx.font = dir.angle % 90 === 0 ? 'bold 20px Arial' : '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dir.shortName, 0, -radius + 35);
      
      ctx.restore();
    });
    
    // コンパスの針
    ctx.strokeStyle = '#FF0000';
    ctx.fillStyle = '#FF0000';
    ctx.lineWidth = 4;
    
    // 北向きの針（赤）
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, 20);
    ctx.lineTo(0, -radius + 50);
    ctx.lineTo(10, 20);
    ctx.closePath();
    ctx.fill();
    
    // 南向きの針（白）
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -20);
    ctx.lineTo(0, radius - 50);
    ctx.lineTo(10, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 中心の円
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    
    ctx.restore();
    
    // 地図モード
    if (showMap) {
      locations.forEach(loc => {
        const angle = (loc.angle - rotation - magneticDeclination) * Math.PI / 180;
        const x = centerX + Math.sin(angle) * loc.distance;
        const y = centerY - Math.cos(angle) * loc.distance;
        
        // 場所のアイコン
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#4CAF50';
        ctx.fill();
        
        // 場所の名前
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(loc.name, x, y + 20);
      });
    }
  };
  
  // エフェクト
  useEffect(() => {
    drawCompass();
  }, [rotation, magneticDeclination, showMap]);
  
  // クイズを生成
  const generateQuiz = () => {
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setQuizDirection(randomDirection);
    setUserAnswer(null);
  };
  
  // 答えをチェック
  const checkAnswer = () => {
    if (userAnswer === null || !quizDirection) return;
    
    setAttempts(prev => prev + 1);
    
    // 角度の差を計算（循環を考慮）
    let diff = Math.abs(userAnswer - quizDirection.angle);
    if (diff > 180) diff = 360 - diff;
    
    if (diff <= 22.5) { // 許容誤差22.5度
      setScore(prev => prev + 1);
      setProgress(prev => Math.min(prev + 20, 100));
      alert('せいかい！よくできました！');
      generateQuiz();
    } else {
      alert(`ざんねん！正解は${quizDirection.angle}度（${quizDirection.name}）でした。`);
    }
  };
  
  // リセット
  const handleReset = () => {
    setRotation(0);
    setMagneticDeclination(0);
    setScore(0);
    setAttempts(0);
    setProgress(0);
    setUserAnswer(null);
    if (quizMode) {
      generateQuiz();
    }
  };
  
  // クイズモード開始
  const startQuizMode = () => {
    setQuizMode(true);
    generateQuiz();
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          コンパスシミュレーター
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
        方位磁針の使い方を学習！地図と組み合わせて、方角の理解を深めよう。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`向き: ${Math.round(rotation)}°`}
          icon={<CompassIcon />}
          color="primary" 
          size="medium"
        />
        {quizMode && (
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
      {quizMode && progress > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">学習進捗</Typography>
            <Typography variant="caption">{progress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

      {/* モード切り替え */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant={!quizMode ? 'contained' : 'outlined'}
          onClick={() => setQuizMode(false)}
        >
          学習モード
        </Button>
        <Button
          variant={quizMode ? 'contained' : 'outlined'}
          onClick={startQuizMode}
          startIcon={<QuizIcon />}
        >
          クイズモード
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：コンパス */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '50%',
                  backgroundColor: '#f5f5f5'
                }}
              />
            </Box>
            
            {!quizMode ? (
              <>
                {/* コンパスの回転 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    コンパスを回転: {Math.round(rotation)}°
                  </Typography>
                  <Slider
                    value={rotation}
                    onChange={(_, value) => setRotation(value as number)}
                    min={0}
                    max={360}
                    marks={[
                      { value: 0, label: '0°' },
                      { value: 90, label: '90°' },
                      { value: 180, label: '180°' },
                      { value: 270, label: '270°' },
                      { value: 360, label: '360°' }
                    ]}
                  />
                </Box>
                
                {/* 磁気偏角 */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    磁気偏角: {magneticDeclination}°
                  </Typography>
                  <Slider
                    value={magneticDeclination}
                    onChange={(_, value) => setMagneticDeclination(value as number)}
                    min={-10}
                    max={10}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                {/* 地図表示 */}
                <Button
                  variant={showMap ? 'contained' : 'outlined'}
                  onClick={() => setShowMap(!showMap)}
                  fullWidth
                >
                  {showMap ? '地図を隠す' : '地図を表示'}
                </Button>
              </>
            ) : (
              // クイズモード
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  「{quizDirection?.name}」の方向にコンパスを合わせよう！
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    あなたの答え: {userAnswer !== null ? `${userAnswer}°` : '未回答'}
                  </Typography>
                  <Slider
                    value={userAnswer || 0}
                    onChange={(_, value) => setUserAnswer(value as number)}
                    min={0}
                    max={360}
                    step={15}
                    marks={directions.map(d => ({ value: d.angle, label: d.shortName }))}
                    valueLabelDisplay="on"
                  />
                </Box>
                <Button
                  variant="contained"
                  onClick={checkAnswer}
                  disabled={userAnswer === null}
                  size="large"
                >
                  答え合わせ
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 右側：情報 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                方位の覚え方
              </Typography>
              <Grid container spacing={2}>
                {directions.filter(d => d.angle % 90 === 0).map(dir => (
                  <Grid size={6} key={dir.angle}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        bgcolor: dir.angle === 0 ? 'error.light' : 'background.paper'
                      }}
                    >
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          color: dir.angle === 0 ? 'white' : dir.color 
                        }}
                      >
                        {dir.shortName}
                      </Typography>
                      <Typography variant="body2">
                        {dir.name}
                      </Typography>
                      <Typography variant="caption">
                        {dir.angle}°
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              
              <Typography variant="body2" sx={{ mt: 3 }}>
                💡 ヒント：
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li>太陽は東から昇って西に沈みます</li>
                <li>北極星は北の方向にあります</li>
                <li>コンパスの赤い針は北を指します</li>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e3f2fd' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🧭 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • コンパスの赤い針は常に北を指します<br/>
          • 東西南北の4方位と、その間の4方位を合わせて8方位といいます<br/>
          • 地図では上が北になっていることが多いです<br/>
          • 磁気偏角とは、磁北と真北のずれのことです
        </Typography>
      </Paper>
    </Box>
  );
}

export default CompassSimulator;