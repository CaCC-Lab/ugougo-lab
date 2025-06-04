import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Button,
  Paper,
  LinearProgress,
  IconButton,
  ButtonGroup,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon, 
  PlayArrow as PlayIcon, 
  Pause as PauseIcon,
  DirectionsWalk as WalkIcon,
  Train as TrainIcon
} from '@mui/icons-material';

// 慣性の法則シミュレーション
function InertiaSimulation({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [scenario, setScenario] = useState<'acceleration' | 'deceleration' | 'jump'>('acceleration');
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [viewMode, setViewMode] = useState<'inside' | 'outside'>('inside');
  const [showInertia, setShowInertia] = useState(true);
  
  // アニメーション状態
  const [trainX, setTrainX] = useState(100);
  const [trainVelocity, setTrainVelocity] = useState(0);
  const [personX, setPersonX] = useState(150);
  const [personY, setPersonY] = useState(350);
  const [personVelocityX, setPersonVelocityX] = useState(0);
  const [personVelocityY, setPersonVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [time, setTime] = useState(0);
  
  const canvasWidth = 600;
  const canvasHeight = 400;
  const trainWidth = 200;
  const trainHeight = 80;
  
  // シナリオごとの設定
  const scenarios = {
    acceleration: {
      name: '電車の急発進',
      description: '電車が急に発進すると、人は後ろに倒れそうになります',
      explanation: '電車は前に進もうとしますが、人の体は静止し続けようとする慣性により、相対的に後ろに移動します'
    },
    deceleration: {
      name: '電車の急停止', 
      description: '電車が急に止まると、人は前に倒れそうになります',
      explanation: '電車は停止しますが、人の体は動き続けようとする慣性により、前に移動します'
    },
    jump: {
      name: '電車内でのジャンプ',
      description: '電車内でジャンプしても、同じ場所に着地します',
      explanation: 'ジャンプした人も電車と同じ速度を持っているため、相対的には同じ場所に着地します'
    }
  };
  
  // キャンバスに描画
  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 地面
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvasHeight - 30, canvasWidth, 30);
    
    // 線路
    ctx.fillStyle = '#555';
    ctx.fillRect(0, canvasHeight - 35, canvasWidth, 5);
    
    // 線路の枕木
    for (let i = 0; i < canvasWidth; i += 30) {
      ctx.fillStyle = '#333';
      ctx.fillRect(i, canvasHeight - 40, 20, 10);
    }
    
    if (viewMode === 'outside') {
      // 外からの視点
      drawTrainExterior(ctx);
      if (scenario === 'jump' && isJumping) {
        drawPersonOutside(ctx);
      }
    } else {
      // 電車内からの視点
      drawTrainInterior(ctx);
      drawPersonInside(ctx);
    }
    
    // 慣性の説明矢印
    if (showInertia && isAnimating) {
      drawInertiaArrows(ctx);
    }
    
    // 速度メーター
    drawSpeedometer(ctx);
  };
  
  // 電車外観を描画
  const drawTrainExterior = (ctx: CanvasRenderingContext2D) => {
    // 電車本体
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(trainX, canvasHeight - 35 - trainHeight, trainWidth, trainHeight);
    
    // 電車の窓
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#E6F3FF';
      ctx.fillRect(trainX + 20 + i * 60, canvasHeight - 35 - trainHeight + 15, 40, 30);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(trainX + 20 + i * 60, canvasHeight - 35 - trainHeight + 15, 40, 30);
    }
    
    // 電車のドア
    ctx.fillStyle = '#333';
    ctx.fillRect(trainX + trainWidth - 15, canvasHeight - 35 - trainHeight + 20, 10, 50);
    
    // 車輪
    for (let i = 0; i < 2; i++) {
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(trainX + 30 + i * (trainWidth - 60), canvasHeight - 35, 15, 0, 2 * Math.PI);
      ctx.fill();
    }
  };
  
  // 電車内部を描画
  const drawTrainInterior = (ctx: CanvasRenderingContext2D) => {
    // 電車の床
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(50, canvasHeight - 100, canvasWidth - 100, 100);
    
    // 電車の壁
    ctx.fillStyle = '#F0F0F0';
    ctx.fillRect(50, canvasHeight - 200, 10, 100);
    ctx.fillRect(canvasWidth - 60, canvasHeight - 200, 10, 100);
    
    // 電車の天井
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(50, canvasHeight - 210, canvasWidth - 100, 10);
    
    // 座席
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(70 + i * 120, canvasHeight - 140, 60, 40);
      ctx.fillStyle = '#654321';
      ctx.fillRect(70 + i * 120, canvasHeight - 140, 60, 10);
    }
    
    // 手すり
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(70, canvasHeight - 180);
    ctx.lineTo(canvasWidth - 70, canvasHeight - 180);
    ctx.stroke();
  };
  
  // 人物（電車内）を描画
  const drawPersonInside = (ctx: CanvasRenderingContext2D) => {
    // 人の体
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(personX, personY - 30, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    // 人の体
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(personX - 8, personY - 15, 16, 30);
    
    // 人の腕
    ctx.strokeStyle = '#FFB6C1';
    ctx.lineWidth = 4;
    
    // 慣性による体の傾きを表現
    let armAngle = 0;
    if (scenario === 'acceleration' && isAnimating) {
      armAngle = -0.3; // 後ろに傾く
    } else if (scenario === 'deceleration' && isAnimating) {
      armAngle = 0.3; // 前に傾く
    }
    
    // 左腕
    ctx.beginPath();
    ctx.moveTo(personX - 8, personY - 10);
    ctx.lineTo(personX - 8 - 15 * Math.cos(Math.PI/4 + armAngle), personY - 10 - 15 * Math.sin(Math.PI/4 + armAngle));
    ctx.stroke();
    
    // 右腕
    ctx.beginPath();
    ctx.moveTo(personX + 8, personY - 10);
    ctx.lineTo(personX + 8 + 15 * Math.cos(Math.PI/4 - armAngle), personY - 10 - 15 * Math.sin(Math.PI/4 - armAngle));
    ctx.stroke();
    
    // 人の足
    ctx.beginPath();
    ctx.moveTo(personX - 5, personY + 15);
    ctx.lineTo(personX - 5, personY + 30);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(personX + 5, personY + 15);
    ctx.lineTo(personX + 5, personY + 30);
    ctx.stroke();
  };
  
  // 人物（電車外）を描画
  const drawPersonOutside = (ctx: CanvasRenderingContext2D) => {
    const absolutePersonX = trainX + (personX - 60); // 電車内の相対位置から絶対位置を計算
    
    // 人の頭
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.arc(absolutePersonX, personY - 30, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // 人の体
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(absolutePersonX - 4, personY - 15, 8, 20);
    
    // 人の腕
    ctx.strokeStyle = '#FFB6C1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(absolutePersonX - 4, personY - 10);
    ctx.lineTo(absolutePersonX - 10, personY - 5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(absolutePersonX + 4, personY - 10);
    ctx.lineTo(absolutePersonX + 10, personY - 5);
    ctx.stroke();
    
    // 人の足
    ctx.beginPath();
    ctx.moveTo(absolutePersonX - 2, personY + 5);
    ctx.lineTo(absolutePersonX - 2, personY + 15);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(absolutePersonX + 2, personY + 5);
    ctx.lineTo(absolutePersonX + 2, personY + 15);
    ctx.stroke();
  };
  
  // 慣性の矢印を描画
  const drawInertiaArrows = (ctx: CanvasRenderingContext2D) => {
    if (viewMode === 'inside') {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      
      if (scenario === 'acceleration') {
        // 後ろ向きの矢印
        drawArrow(ctx, personX, personY - 50, personX - 40, personY - 50);
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('慣性の力', personX - 60, personY - 60);
      } else if (scenario === 'deceleration') {
        // 前向きの矢印
        drawArrow(ctx, personX, personY - 50, personX + 40, personY - 50);
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('慣性の力', personX + 20, personY - 60);
      }
      
      ctx.setLineDash([]);
    }
  };
  
  // 矢印を描画
  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    // 矢印の頭
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - 10 * Math.cos(angle - Math.PI/6), toY - 10 * Math.sin(angle - Math.PI/6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - 10 * Math.cos(angle + Math.PI/6), toY - 10 * Math.sin(angle + Math.PI/6));
    ctx.stroke();
  };
  
  // 速度メーター
  const drawSpeedometer = (ctx: CanvasRenderingContext2D) => {
    const meterX = canvasWidth - 100;
    const meterY = 60;
    
    // メーターの背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(meterX - 40, meterY - 30, 80, 60);
    
    // 速度表示
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.abs(trainVelocity).toFixed(1)} km/h`, meterX, meterY - 10);
    
    // 加速度表示
    const acceleration = scenario === 'acceleration' ? '+2.5' : scenario === 'deceleration' ? '-2.5' : '0';
    ctx.fillStyle = scenario === 'acceleration' ? '#FF4500' : scenario === 'deceleration' ? '#FF0000' : '#FFFFFF';
    ctx.fillText(`${acceleration} m/s²`, meterX, meterY + 10);
  };
  
  // アニメーションループ
  const animate = () => {
    if (!isAnimating) return;
    
    setTime(prev => prev + 0.1);
    
    if (scenario === 'acceleration') {
      setTrainVelocity(prev => Math.min(prev + 0.5, 50));
      setTrainX(prev => prev + trainVelocity * 0.1);
      
      // 慣性効果：人は相対的に後ろに移動
      if (viewMode === 'inside') {
        setPersonX(prev => Math.max(prev - 0.2, 80));
      }
      
    } else if (scenario === 'deceleration') {
      setTrainVelocity(prev => Math.max(prev - 0.5, 0));
      setTrainX(prev => prev + trainVelocity * 0.1);
      
      // 慣性効果：人は相対的に前に移動
      if (viewMode === 'inside') {
        setPersonX(prev => Math.min(prev + 0.2, canvasWidth - 80));
      }
      
    } else if (scenario === 'jump') {
      setTrainVelocity(30); // 一定速度
      setTrainX(prev => prev + trainVelocity * 0.1);
      
      if (isJumping) {
        // ジャンプ物理
        setPersonVelocityY(prev => prev + 0.5); // 重力
        setPersonY(prev => {
          const newY = prev + personVelocityY;
          if (newY >= 350) { // 着地
            setIsJumping(false);
            setPersonVelocityY(0);
            return 350;
          }
          return newY;
        });
        
        // 外からの視点では人は放物線を描く
        if (viewMode === 'outside') {
          setPersonVelocityX(trainVelocity * 0.1); // 電車と同じ速度を維持
        }
      }
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // ジャンプ実行
  const executeJump = () => {
    if (scenario === 'jump' && !isJumping) {
      setIsJumping(true);
      setPersonVelocityY(-8);
      setSuccessCount(prev => prev + 1);
      setProgress(prev => Math.min(prev + 15, 100));
    }
  };
  
  // アニメーション開始/停止
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };
  
  // リセット
  const handleReset = () => {
    setIsAnimating(false);
    setProgress(0);
    setSuccessCount(0);
    setTrainX(100);
    setTrainVelocity(0);
    setPersonX(150);
    setPersonY(350);
    setPersonVelocityX(0);
    setPersonVelocityY(0);
    setIsJumping(false);
    setTime(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
  
  // シナリオ変更
  const changeScenario = (newScenario: typeof scenario) => {
    setScenario(newScenario);
    handleReset();
  };
  
  // エフェクト
  useEffect(() => {
    if (isAnimating) {
      animate();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, scenario, viewMode, trainVelocity, personVelocityY, isJumping]);
  
  useEffect(() => {
    drawScene();
  }, [trainX, trainVelocity, personX, personY, scenario, viewMode, showInertia, isAnimating]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          慣性の法則シミュレーション
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
        電車の中で起こる慣性現象をマリオ風の視覚化で理解しよう！
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={scenarios[scenario].name}
          color="primary" 
          size="large"
        />
        <Chip 
          label={`視点: ${viewMode === 'inside' ? '電車内' : '電車外'}`} 
          color="secondary" 
          size="medium"
        />
        <Chip 
          label={`実験回数: ${successCount}`} 
          color="success" 
          size="medium"
        />
      </Box>

      {/* 進捗バー */}
      {progress > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">理解度</Typography>
            <Typography variant="caption">{progress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：コントロールパネル */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              実験コントロール
            </Typography>

            {/* シナリオ選択 */}
            <ButtonGroup orientation="vertical" fullWidth sx={{ mb: 2 }}>
              <Button
                variant={scenario === 'acceleration' ? 'contained' : 'outlined'}
                onClick={() => changeScenario('acceleration')}
                startIcon={<TrainIcon />}
              >
                急発進
              </Button>
              <Button
                variant={scenario === 'deceleration' ? 'contained' : 'outlined'}
                onClick={() => changeScenario('deceleration')}
                startIcon={<TrainIcon />}
              >
                急停止
              </Button>
              <Button
                variant={scenario === 'jump' ? 'contained' : 'outlined'}
                onClick={() => changeScenario('jump')}
                startIcon={<WalkIcon />}
              >
                ジャンプ
              </Button>
            </ButtonGroup>

            {/* アニメーション制御 */}
            <Button
              variant="contained"
              fullWidth
              startIcon={isAnimating ? <PauseIcon /> : <PlayIcon />}
              onClick={toggleAnimation}
              sx={{ mb: 2 }}
            >
              {isAnimating ? '実験停止' : '実験開始'}
            </Button>

            {/* ジャンプボタン */}
            {scenario === 'jump' && (
              <Button
                variant="outlined"
                fullWidth
                onClick={executeJump}
                disabled={!isAnimating || isJumping}
                sx={{ mb: 2 }}
              >
                ジャンプ！
              </Button>
            )}

            {/* 視点切り替え */}
            <FormControlLabel
              control={
                <Switch
                  checked={viewMode === 'outside'}
                  onChange={(e) => setViewMode(e.target.checked ? 'outside' : 'inside')}
                />
              }
              label="外からの視点"
              sx={{ mb: 2 }}
            />

            {/* 慣性力表示切り替え */}
            <FormControlLabel
              control={
                <Switch
                  checked={showInertia}
                  onChange={(e) => setShowInertia(e.target.checked)}
                />
              }
              label="慣性の力を表示"
              sx={{ mb: 2 }}
            />

            {/* 説明 */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {scenarios[scenario].name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {scenarios[scenario].description}
                </Typography>
                <Typography variant="caption" color="primary">
                  💡 {scenarios[scenario].explanation}
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* 右側：シミュレーションエリア */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              物理シミュレーション
            </Typography>
            
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              style={{
                border: '2px solid #ddd',
                borderRadius: '8px',
                display: 'block',
                margin: '0 auto'
              }}
            />

            {/* 操作説明 */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {scenario === 'jump' 
                  ? '💡 「ジャンプ！」ボタンを押して電車内でジャンプしてみよう！視点を切り替えて観察！'
                  : '💡 「実験開始」ボタンを押して慣性現象を観察しよう！視点切り替えで理解が深まります！'
                }
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#fff3e0' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          ⚖️ 慣性の法則のポイント：
        </Typography>
        <Typography variant="body2">
          • 静止している物体は静止し続け、動いている物体は等速直線運動を続けようとします<br/>
          • 電車が急発進すると、人の体は静止し続けようとして後ろに倒れそうになります<br/>
          • 電車が急停止すると、人の体は動き続けようとして前に倒れそうになります<br/>
          • 視点を変えることで、同じ現象でも全く違って見えることがわかります
        </Typography>
      </Paper>
    </Box>
  );
}

export default InertiaSimulation;