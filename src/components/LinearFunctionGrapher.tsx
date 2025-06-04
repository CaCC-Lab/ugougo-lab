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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  ShowChart as ChartIcon,
  Functions as FunctionIcon,
  GridOn as GridIcon,
  Circle as PointIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';

// 一次関数グラフ描画ツール
function LinearFunctionGrapher({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 第1の直線 y = ax + b
  const [a1, setA1] = useState(1);
  const [b1, setB1] = useState(0);
  
  // 第2の直線（オプション）
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [a2, setA2] = useState(-0.5);
  const [b2, setB2] = useState(3);
  
  // グラフ設定
  const [scale, setScale] = useState(20); // 1単位あたりのピクセル数
  const [showGrid, setShowGrid] = useState(true);
  const [showIntercepts, setShowIntercepts] = useState(true);
  
  // モード
  const [mode, setMode] = useState<'free' | 'twoPoints' | 'quiz' | 'realLife'>('free');
  
  // 2点通過モード用
  const [point1, setPoint1] = useState({ x: 0, y: 0 });
  const [point2, setPoint2] = useState({ x: 3, y: 3 });
  
  // クイズモード用
  const [quizMode, setQuizMode] = useState<'findEquation' | 'findIntersection'>('findEquation');
  const [quizAnswer, setQuizAnswer] = useState({ a: '', b: '' });
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // 実生活の例
  const [realLifeExample, setRealLifeExample] = useState<'taxi' | 'phone' | 'water'>('taxi');
  
  const canvasSize = 500;
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  
  // 実生活の例のパラメータ
  const realLifeExamples = {
    taxi: {
      name: 'タクシー料金',
      a: 90, // 90円/100m
      b: 410, // 初乗り410円
      xLabel: '距離（100m）',
      yLabel: '料金（円）',
      description: '初乗り410円、100mごとに90円加算'
    },
    phone: {
      name: '携帯電話料金',
      a: 20, // 20円/分
      b: 3000, // 基本料金3000円
      xLabel: '通話時間（分）',
      yLabel: '料金（円）',
      description: '基本料金3000円、1分20円の通話料'
    },
    water: {
      name: '水槽の水量',
      a: 5, // 5L/分
      b: 20, // 初期水量20L
      xLabel: '時間（分）',
      yLabel: '水量（L）',
      description: '初期水量20L、毎分5Lずつ増加'
    }
  };
  
  // 2点を通る直線の式を計算
  const calculateLineFromTwoPoints = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    if (p1.x === p2.x) {
      // 垂直線の場合
      return { a: Infinity, b: p1.x };
    }
    const a = (p2.y - p1.y) / (p2.x - p1.x);
    const b = p1.y - a * p1.x;
    return { a, b };
  };
  
  // 2直線の交点を計算
  const calculateIntersection = (a1: number, b1: number, a2: number, b2: number) => {
    if (a1 === a2) {
      // 平行線の場合
      return null;
    }
    const x = (b2 - b1) / (a1 - a2);
    const y = a1 * x + b1;
    return { x, y };
  };
  
  // x切片とy切片を計算
  const calculateIntercepts = (a: number, b: number) => {
    const yIntercept = b; // x = 0のときのy
    const xIntercept = a !== 0 ? -b / a : null; // y = 0のときのx
    return { xIntercept, yIntercept };
  };
  
  // グラフを描画
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // 背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // グリッドを描画
    if (showGrid) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      
      for (let i = 0; i <= canvasSize; i += scale) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvasSize, i);
        ctx.stroke();
      }
    }
    
    // 座標軸を描画
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // x軸
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasSize, centerY);
    ctx.stroke();
    
    // y軸
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvasSize);
    ctx.stroke();
    
    // 軸のラベル
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // x軸の目盛り
    for (let x = -10; x <= 10; x++) {
      if (x !== 0) {
        const px = centerX + x * scale;
        ctx.fillText(x.toString(), px, centerY + 5);
        
        // 目盛り線
        ctx.beginPath();
        ctx.moveTo(px, centerY - 3);
        ctx.lineTo(px, centerY + 3);
        ctx.stroke();
      }
    }
    
    // y軸の目盛り
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = -10; y <= 10; y++) {
      if (y !== 0) {
        const py = centerY - y * scale;
        ctx.fillText(y.toString(), centerX - 5, py);
        
        // 目盛り線
        ctx.beginPath();
        ctx.moveTo(centerX - 3, py);
        ctx.lineTo(centerX + 3, py);
        ctx.stroke();
      }
    }
    
    // 原点
    ctx.fillText('0', centerX - 5, centerY + 15);
    
    // 実際の値を使用（実生活モードの場合）
    let actualA1 = a1;
    let actualB1 = b1;
    let actualA2 = a2;
    let actualB2 = b2;
    
    if (mode === 'realLife') {
      const example = realLifeExamples[realLifeExample];
      actualA1 = example.a / scale; // スケール調整
      actualB1 = example.b / scale;
    }
    
    // 2点通過モードの場合
    if (mode === 'twoPoints') {
      const calculated = calculateLineFromTwoPoints(point1, point2);
      actualA1 = calculated.a;
      actualB1 = calculated.b;
    }
    
    // 第1の直線を描画
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const x1 = -centerX / scale;
    const y1 = actualA1 * x1 + actualB1;
    const x2 = (canvasSize - centerX) / scale;
    const y2 = actualA1 * x2 + actualB1;
    
    ctx.moveTo(0, centerY - y1 * scale);
    ctx.lineTo(canvasSize, centerY - y2 * scale);
    ctx.stroke();
    
    // 第2の直線を描画（表示する場合）
    if (showSecondLine) {
      ctx.strokeStyle = '#F44336';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      const y3 = actualA2 * x1 + actualB2;
      const y4 = actualA2 * x2 + actualB2;
      
      ctx.moveTo(0, centerY - y3 * scale);
      ctx.lineTo(canvasSize, centerY - y4 * scale);
      ctx.stroke();
      
      // 交点を描画
      const intersection = calculateIntersection(actualA1, actualB1, actualA2, actualB2);
      if (intersection) {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(
          centerX + intersection.x * scale,
          centerY - intersection.y * scale,
          5,
          0,
          2 * Math.PI
        );
        ctx.fill();
        
        // 交点の座標を表示
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(
          `(${intersection.x.toFixed(1)}, ${intersection.y.toFixed(1)})`,
          centerX + intersection.x * scale + 10,
          centerY - intersection.y * scale - 10
        );
      }
    }
    
    // 切片を表示
    if (showIntercepts) {
      const intercepts1 = calculateIntercepts(actualA1, actualB1);
      
      // y切片
      ctx.fillStyle = '#9C27B0';
      ctx.beginPath();
      ctx.arc(centerX, centerY - intercepts1.yIntercept * scale, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // x切片
      if (intercepts1.xIntercept !== null && Math.abs(intercepts1.xIntercept) < 20) {
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(centerX + intercepts1.xIntercept * scale, centerY, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    
    // 2点通過モードの場合、点を描画
    if (mode === 'twoPoints') {
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(centerX + point1.x * scale, centerY - point1.y * scale, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(centerX + point2.x * scale, centerY - point2.y * scale, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // 点の座標を表示
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`(${point1.x}, ${point1.y})`, centerX + point1.x * scale + 10, centerY - point1.y * scale - 10);
      ctx.fillText(`(${point2.x}, ${point2.y})`, centerX + point2.x * scale + 10, centerY - point2.y * scale - 10);
    }
    
    // 変化の割合を視覚化（矢印で表示）
    if (mode === 'free' && actualA1 !== 0) {
      const startX = 0;
      const startY = actualB1;
      const endX = 1;
      const endY = actualA1 + actualB1;
      
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      // 横の矢印（Δx = 1）
      ctx.beginPath();
      ctx.moveTo(centerX + startX * scale, centerY - startY * scale);
      ctx.lineTo(centerX + endX * scale, centerY - startY * scale);
      ctx.stroke();
      
      // 縦の矢印（Δy = a）
      ctx.beginPath();
      ctx.moveTo(centerX + endX * scale, centerY - startY * scale);
      ctx.lineTo(centerX + endX * scale, centerY - endY * scale);
      ctx.stroke();
      
      ctx.setLineDash([]);
      
      // ラベル
      ctx.fillStyle = '#4CAF50';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Δx=1', centerX + (startX + endX) * scale / 2, centerY - startY * scale + 20);
      ctx.textAlign = 'left';
      ctx.fillText(`Δy=${actualA1.toFixed(1)}`, centerX + endX * scale + 10, centerY - (startY + endY) * scale / 2);
    }
  };
  
  // クイズの新しい問題を生成
  const generateNewQuiz = () => {
    if (quizMode === 'findEquation') {
      // グラフから式を求める問題
      const newA = Math.floor(Math.random() * 5 - 2) + (Math.random() > 0.5 ? 0.5 : 0);
      const newB = Math.floor(Math.random() * 7 - 3);
      setA1(newA);
      setB1(newB);
      setShowSecondLine(false);
    } else {
      // 交点を求める問題
      const newA1 = Math.floor(Math.random() * 3) + 1;
      const newB1 = Math.floor(Math.random() * 5 - 2);
      const newA2 = -Math.floor(Math.random() * 3) - 1;
      const newB2 = Math.floor(Math.random() * 5 - 2);
      
      setA1(newA1);
      setB1(newB1);
      setA2(newA2);
      setB2(newB2);
      setShowSecondLine(true);
    }
    
    setQuizAnswer({ a: '', b: '' });
    setShowQuizAnswer(false);
  };
  
  // クイズの答え合わせ
  const checkQuizAnswer = () => {
    if (quizMode === 'findEquation') {
      const answerA = parseFloat(quizAnswer.a);
      const answerB = parseFloat(quizAnswer.b);
      
      const isCorrect = Math.abs(answerA - a1) < 0.1 && Math.abs(answerB - b1) < 0.1;
      
      if (isCorrect) {
        setScore(prev => prev + 1);
        setProgress(prev => Math.min(prev + 20, 100));
      }
      
      setAttempts(prev => prev + 1);
      setShowQuizAnswer(true);
      
      if (isCorrect) {
        setTimeout(() => {
          generateNewQuiz();
        }, 2000);
      }
    } else {
      // 交点の問題
      const intersection = calculateIntersection(a1, b1, a2, b2);
      if (intersection) {
        const answerX = parseFloat(quizAnswer.a);
        const answerY = parseFloat(quizAnswer.b);
        
        const isCorrect = 
          Math.abs(answerX - intersection.x) < 0.1 && 
          Math.abs(answerY - intersection.y) < 0.1;
        
        if (isCorrect) {
          setScore(prev => prev + 1);
          setProgress(prev => Math.min(prev + 20, 100));
        }
        
        setAttempts(prev => prev + 1);
        setShowQuizAnswer(true);
        
        if (isCorrect) {
          setTimeout(() => {
            generateNewQuiz();
          }, 2000);
        }
      }
    }
  };
  
  // リセット
  const handleReset = () => {
    setA1(1);
    setB1(0);
    setA2(-0.5);
    setB2(3);
    setShowSecondLine(false);
    setPoint1({ x: 0, y: 0 });
    setPoint2({ x: 3, y: 3 });
    setScore(0);
    setAttempts(0);
    setProgress(0);
    setQuizAnswer({ a: '', b: '' });
    setShowQuizAnswer(false);
  };
  
  // エフェクト
  useEffect(() => {
    drawGraph();
  }, [
    a1, b1, a2, b2, showSecondLine, scale, showGrid, showIntercepts,
    mode, point1, point2, realLifeExample
  ]);
  
  useEffect(() => {
    if (mode === 'quiz') {
      generateNewQuiz();
    }
  }, [mode, quizMode]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          一次関数グラフ描画ツール
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
        一次関数y=ax+bのグラフを自在に操作！傾きと切片を調整して、グラフの変化を観察しよう。
      </Typography>

      {/* 状況表示 */}
      {mode === 'quiz' && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip 
            label={`得点: ${score}`}
            icon={<QuizIcon />}
            color="primary" 
            size="medium"
          />
          <Chip 
            label={`挑戦: ${attempts}`} 
            color="secondary" 
            size="medium"
          />
        </Box>
      )}

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
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, value) => value && setMode(value)}
          fullWidth
        >
          <ToggleButton value="free">
            自由操作
          </ToggleButton>
          <ToggleButton value="twoPoints">
            2点通過
          </ToggleButton>
          <ToggleButton value="quiz">
            クイズ
          </ToggleButton>
          <ToggleButton value="realLife">
            実生活
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：コントロール */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 2, height: 'fit-content' }}>
            {mode === 'free' && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  関数の設定
                </Typography>
                
                {/* 第1の直線 */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, color: '#2196F3' }}>
                      青い直線: y = ax + b
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      傾き a = {a1.toFixed(1)}
                    </Typography>
                    <Slider
                      value={a1}
                      onChange={(_, value) => setA1(value as number)}
                      min={-5}
                      max={5}
                      step={0.1}
                      marks
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      切片 b = {b1.toFixed(1)}
                    </Typography>
                    <Slider
                      value={b1}
                      onChange={(_, value) => setB1(value as number)}
                      min={-10}
                      max={10}
                      step={0.5}
                      marks
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="h6" color="primary">
                      y = {a1.toFixed(1)}x {b1 >= 0 ? '+' : ''} {b1.toFixed(1)}
                    </Typography>
                  </CardContent>
                </Card>
                
                {/* 第2の直線の表示切り替え */}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setShowSecondLine(!showSecondLine)}
                  sx={{ mb: 2 }}
                >
                  {showSecondLine ? '2本目の直線を隠す' : '2本目の直線を表示'}
                </Button>
                
                {/* 第2の直線 */}
                {showSecondLine && (
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, color: '#F44336' }}>
                        赤い直線: y = ax + b
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        傾き a = {a2.toFixed(1)}
                      </Typography>
                      <Slider
                        value={a2}
                        onChange={(_, value) => setA2(value as number)}
                        min={-5}
                        max={5}
                        step={0.1}
                        marks
                        sx={{ mb: 2 }}
                      />
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        切片 b = {b2.toFixed(1)}
                      </Typography>
                      <Slider
                        value={b2}
                        onChange={(_, value) => setB2(value as number)}
                        min={-10}
                        max={10}
                        step={0.5}
                        marks
                        sx={{ mb: 2 }}
                      />
                      
                      <Typography variant="h6" color="error">
                        y = {a2.toFixed(1)}x {b2 >= 0 ? '+' : ''} {b2.toFixed(1)}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
                
                {/* 交点の情報 */}
                {showSecondLine && (() => {
                  const intersection = calculateIntersection(a1, b1, a2, b2);
                  return intersection ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      交点: ({intersection.x.toFixed(2)}, {intersection.y.toFixed(2)})
                    </Alert>
                  ) : (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      2つの直線は平行です（交点なし）
                    </Alert>
                  );
                })()}
              </>
            )}
            
            {mode === 'twoPoints' && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  2点を通る直線
                </Typography>
                
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      点1の座標
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={6}>
                        <TextField
                          label="x₁"
                          type="number"
                          value={point1.x}
                          onChange={(e) => setPoint1({ ...point1, x: parseFloat(e.target.value) || 0 })}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid size={6}>
                        <TextField
                          label="y₁"
                          type="number"
                          value={point1.y}
                          onChange={(e) => setPoint1({ ...point1, y: parseFloat(e.target.value) || 0 })}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      点2の座標
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <TextField
                          label="x₂"
                          type="number"
                          value={point2.x}
                          onChange={(e) => setPoint2({ ...point2, x: parseFloat(e.target.value) || 0 })}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid size={6}>
                        <TextField
                          label="y₂"
                          type="number"
                          value={point2.y}
                          onChange={(e) => setPoint2({ ...point2, y: parseFloat(e.target.value) || 0 })}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                {/* 計算結果 */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      計算結果
                    </Typography>
                    {point1.x !== point2.x ? (
                      <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          傾き a = (y₂ - y₁) / (x₂ - x₁)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          = ({point2.y} - {point1.y}) / ({point2.x} - {point1.x})
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          = {((point2.y - point1.y) / (point2.x - point1.x)).toFixed(2)}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" color="primary">
                          y = {((point2.y - point1.y) / (point2.x - point1.x)).toFixed(2)}x 
                          {(() => {
                            const a = (point2.y - point1.y) / (point2.x - point1.x);
                            const b = point1.y - a * point1.x;
                            return b >= 0 ? ' + ' : ' ';
                          })()}
                          {(point1.y - ((point2.y - point1.y) / (point2.x - point1.x)) * point1.x).toFixed(2)}
                        </Typography>
                      </>
                    ) : (
                      <Alert severity="warning">
                        x座標が同じなので、垂直線になります
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
            
            {mode === 'quiz' && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  クイズモード
                </Typography>
                
                <ToggleButtonGroup
                  value={quizMode}
                  exclusive
                  onChange={(_, value) => {
                    if (value) {
                      setQuizMode(value);
                      generateNewQuiz();
                    }
                  }}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="findEquation">
                    式を求める
                  </ToggleButton>
                  <ToggleButton value="findIntersection">
                    交点を求める
                  </ToggleButton>
                </ToggleButtonGroup>
                
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      問題
                    </Typography>
                    {quizMode === 'findEquation' ? (
                      <>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          グラフから一次関数の式を求めてください
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          y = ax + b の形で答えてください
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={6}>
                            <TextField
                              label="a（傾き）"
                              value={quizAnswer.a}
                              onChange={(e) => setQuizAnswer({ ...quizAnswer, a: e.target.value })}
                              fullWidth
                              size="small"
                            />
                          </Grid>
                          <Grid size={6}>
                            <TextField
                              label="b（切片）"
                              value={quizAnswer.b}
                              onChange={(e) => setQuizAnswer({ ...quizAnswer, b: e.target.value })}
                              fullWidth
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          2つの直線の交点の座標を求めてください
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                          青: y = {a1}x {b1 >= 0 ? '+' : ''} {b1}
                        </Typography>
                        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                          赤: y = {a2}x {b2 >= 0 ? '+' : ''} {b2}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={6}>
                            <TextField
                              label="x座標"
                              value={quizAnswer.a}
                              onChange={(e) => setQuizAnswer({ ...quizAnswer, a: e.target.value })}
                              fullWidth
                              size="small"
                            />
                          </Grid>
                          <Grid size={6}>
                            <TextField
                              label="y座標"
                              value={quizAnswer.b}
                              onChange={(e) => setQuizAnswer({ ...quizAnswer, b: e.target.value })}
                              fullWidth
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={checkQuizAnswer}
                  disabled={!quizAnswer.a || !quizAnswer.b}
                  sx={{ mb: 2 }}
                >
                  答え合わせ
                </Button>
                
                {showQuizAnswer && (
                  <Alert 
                    severity={
                      quizMode === 'findEquation'
                        ? Math.abs(parseFloat(quizAnswer.a) - a1) < 0.1 && Math.abs(parseFloat(quizAnswer.b) - b1) < 0.1
                          ? 'success'
                          : 'error'
                        : (() => {
                            const intersection = calculateIntersection(a1, b1, a2, b2);
                            return intersection &&
                              Math.abs(parseFloat(quizAnswer.a) - intersection.x) < 0.1 &&
                              Math.abs(parseFloat(quizAnswer.b) - intersection.y) < 0.1
                              ? 'success'
                              : 'error';
                          })()
                    }
                  >
                    {quizMode === 'findEquation' ? (
                      <>
                        正解: y = {a1}x {b1 >= 0 ? '+' : ''} {b1}
                      </>
                    ) : (
                      <>
                        正解: {(() => {
                          const intersection = calculateIntersection(a1, b1, a2, b2);
                          return intersection
                            ? `(${intersection.x.toFixed(1)}, ${intersection.y.toFixed(1)})`
                            : '交点なし';
                        })()}
                      </>
                    )}
                  </Alert>
                )}
              </>
            )}
            
            {mode === 'realLife' && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  実生活の例
                </Typography>
                
                <ToggleButtonGroup
                  value={realLifeExample}
                  exclusive
                  onChange={(_, value) => value && setRealLifeExample(value)}
                  orientation="vertical"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="taxi">
                    タクシー料金
                  </ToggleButton>
                  <ToggleButton value="phone">
                    携帯電話料金
                  </ToggleButton>
                  <ToggleButton value="water">
                    水槽の水量
                  </ToggleButton>
                </ToggleButtonGroup>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {realLifeExamples[realLifeExample].name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {realLifeExamples[realLifeExample].description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      式: y = {realLifeExamples[realLifeExample].a}x + {realLifeExamples[realLifeExample].b}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      x: {realLifeExamples[realLifeExample].xLabel}<br/>
                      y: {realLifeExamples[realLifeExample].yLabel}
                    </Typography>
                  </CardContent>
                </Card>
              </>
            )}
            
            {/* 表示設定 */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              表示設定
            </Typography>
            <List dense>
              <ListItem>
                <Button
                  size="small"
                  startIcon={<GridIcon />}
                  onClick={() => setShowGrid(!showGrid)}
                  variant={showGrid ? 'contained' : 'outlined'}
                >
                  グリッド
                </Button>
              </ListItem>
              <ListItem>
                <Button
                  size="small"
                  startIcon={<PointIcon />}
                  onClick={() => setShowIntercepts(!showIntercepts)}
                  variant={showIntercepts ? 'contained' : 'outlined'}
                >
                  切片
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* 右側：グラフ表示 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <ChartIcon sx={{ mr: 1 }} />
              グラフ
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                style={{
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff'
                }}
              />
            </Box>
            
            {/* グラフの情報 */}
            {mode === 'free' && !showSecondLine && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        y切片
                      </Typography>
                      <Typography variant="body1" color="secondary">
                        (0, {b1.toFixed(1)})
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        x切片
                      </Typography>
                      <Typography variant="body1" color="error">
                        {a1 !== 0 ? `(${(-b1/a1).toFixed(1)}, 0)` : 'なし'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        変化の割合
                      </Typography>
                      <Typography variant="body1" color="primary">
                        {a1.toFixed(1)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e3f2fd' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          📈 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 傾き（a）：xが1増えたときのyの変化量。正なら右上がり、負なら右下がり<br/>
          • y切片（b）：x=0のときのyの値。グラフがy軸と交わる点<br/>
          • x切片：y=0のときのxの値。グラフがx軸と交わる点<br/>
          • 2直線の交点：連立方程式の解を表します
        </Typography>
      </Paper>
    </Box>
  );
}

export default LinearFunctionGrapher;