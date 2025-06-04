import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Button,
  Paper,
  LinearProgress,
  IconButton,
  TextField,
  Slider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon, PlayArrow as PlayIcon, Pause as PauseIcon } from '@mui/icons-material';

// 関数グラフの動的描画ツール
function FunctionGraphTool({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [functionType, setFunctionType] = useState('linear');
  const [paramA, setParamA] = useState(1);
  const [paramB, setParamB] = useState(0);
  const [paramC, setParamC] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState({ type: 'linear', a: 1, b: 0, c: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [customFunction, setCustomFunction] = useState('x');
  const [errorMessage, setErrorMessage] = useState('');
  const [animationProgress, setAnimationProgress] = useState(0);

  // 関数の種類
  const functionTypes = {
    linear: { name: '一次関数', formula: 'y = ax + b', params: ['a', 'b'] },
    quadratic: { name: '二次関数', formula: 'y = ax² + bx + c', params: ['a', 'b', 'c'] },
    cubic: { name: '三次関数', formula: 'y = ax³ + bx² + cx + d', params: ['a', 'b', 'c'] },
    sin: { name: '正弦関数', formula: 'y = a sin(bx + c)', params: ['a', 'b', 'c'] },
    cos: { name: '余弦関数', formula: 'y = a cos(bx + c)', params: ['a', 'b', 'c'] },
    exp: { name: '指数関数', formula: 'y = a * e^(bx) + c', params: ['a', 'b', 'c'] },
    log: { name: '対数関数', formula: 'y = a * ln(bx) + c', params: ['a', 'b', 'c'] }
  };

  // 座標変換
  const canvasToMath = (canvasX: number, canvasY: number, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 20;
    
    return {
      x: (canvasX - centerX) / scale,
      y: (centerY - canvasY) / scale
    };
  };

  const mathToCanvas = (mathX: number, mathY: number, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 20;
    
    return {
      x: centerX + mathX * scale,
      y: centerY - mathY * scale
    };
  };

  // 関数の計算
  const calculateFunction = (x: number, type: string, a: number, b: number, c: number) => {
    try {
      switch (type) {
        case 'linear':
          return a * x + b;
        case 'quadratic':
          return a * x * x + b * x + c;
        case 'cubic':
          return a * x * x * x + b * x * x + c * x;
        case 'sin':
          return a * Math.sin(b * x + c);
        case 'cos':
          return a * Math.cos(b * x + c);
        case 'exp':
          return a * Math.exp(b * x) + c;
        case 'log':
          return x > 0 ? a * Math.log(b * x) + c : NaN;
        default:
          return 0;
      }
    } catch (e) {
      return NaN;
    }
  };

  // グラフの描画
  const drawGraph = (type: string, a: number, b: number, c: number, animationProgressValue = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // グリッドと軸を描画
    drawGrid(ctx, canvas);
    
    // 関数を描画
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const step = 0.1;
    const startX = -canvas.width / 40;
    const endX = canvas.width / 40;
    const maxX = startX + (endX - startX) * animationProgressValue;
    
    let first = true;
    for (let x = startX; x <= maxX; x += step) {
      const y = calculateFunction(x, type, a, b, c);
      
      if (!isNaN(y) && Math.abs(y) < 50) {
        const canvasPoint = mathToCanvas(x, y, canvas);
        
        if (first) {
          ctx.moveTo(canvasPoint.x, canvasPoint.y);
          first = false;
        } else {
          ctx.lineTo(canvasPoint.x, canvasPoint.y);
        }
      } else {
        first = true;
      }
    }
    
    ctx.stroke();
    
    // 関数式の表示
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(getFunctionText(type, a, b, c), 10, 30);
  };

  // グリッドと軸の描画
  const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 20;
    
    // グリッド
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    
    for (let i = -20; i <= 20; i++) {
      // 縦線
      const x = centerX + i * scale;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      
      // 横線
      const y = centerY + i * scale;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // 軸
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // x軸
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();
    
    // y軸
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();
    
    // 目盛り
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    for (let i = -10; i <= 10; i++) {
      if (i !== 0) {
        // x軸の目盛り
        const x = centerX + i * scale;
        ctx.fillText(i.toString(), x, centerY + 15);
        
        // y軸の目盛り
        const y = centerY - i * scale;
        ctx.fillText(i.toString(), centerX - 15, y + 5);
      }
    }
    
    // 原点
    ctx.fillText('O', centerX - 10, centerY + 15);
  };

  // 関数式のテキスト生成
  const getFunctionText = (type: string, a: number, b: number, c: number) => {
    const formatParam = (value: number) => {
      if (value === Math.floor(value)) {
        return value.toString();
      }
      return value.toFixed(2);
    };
    
    switch (type) {
      case 'linear':
        return `y = ${formatParam(a)}x + ${formatParam(b)}`;
      case 'quadratic':
        return `y = ${formatParam(a)}x² + ${formatParam(b)}x + ${formatParam(c)}`;
      case 'cubic':
        return `y = ${formatParam(a)}x³ + ${formatParam(b)}x² + ${formatParam(c)}x`;
      case 'sin':
        return `y = ${formatParam(a)} sin(${formatParam(b)}x + ${formatParam(c)})`;
      case 'cos':
        return `y = ${formatParam(a)} cos(${formatParam(b)}x + ${formatParam(c)})`;
      case 'exp':
        return `y = ${formatParam(a)} * e^(${formatParam(b)}x) + ${formatParam(c)}`;
      case 'log':
        return `y = ${formatParam(a)} * ln(${formatParam(b)}x) + ${formatParam(c)}`;
      default:
        return '';
    }
  };

  // アニメーション
  const animate = () => {
    if (isAnimating) {
      setAnimationProgress((prev) => {
        const newProgress = (prev + 0.02) % 1;
        drawGraph(functionType, paramA, paramB, paramC, newProgress);
        return newProgress;
      });
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // アニメーション開始/停止
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
    if (!isAnimating) {
      setAnimationProgress(0);
    }
  };

  // クイズ生成
  const generateQuiz = () => {
    const types = Object.keys(functionTypes);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomA = Math.floor(Math.random() * 6) - 2; // -2 to 3
    const randomB = Math.floor(Math.random() * 6) - 2;
    const randomC = Math.floor(Math.random() * 6) - 2;
    
    setQuizQuestion({ type: randomType, a: randomA, b: randomB, c: randomC });
    setUserAnswer('');
  };

  // クイズ回答チェック
  const checkAnswer = (answer: string) => {
    setUserAnswer(answer);
    const correct = getFunctionText(quizQuestion.type, quizQuestion.a, quizQuestion.b, quizQuestion.c);
    // 簡単な正解判定（空白や符号の違いを許容）
    const normalizeFormula = (formula: string) => formula.replace(/\s/g, '').replace(/\+\-/g, '-');
    
    if (normalizeFormula(answer) === normalizeFormula(correct)) {
      setSuccessCount(prev => prev + 1);
      setProgress(prev => Math.min(prev + 10, 100));
      setTimeout(() => {
        generateQuiz();
      }, 2500);
    }
  };

  // リセット
  const handleReset = () => {
    setProgress(0);
    setSuccessCount(0);
    setIsAnimating(false);
    setQuizMode(false);
    setUserAnswer('');
    setParamA(1);
    setParamB(0);
    setParamC(0);
    setAnimationProgress(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
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
  }, [isAnimating]);

  useEffect(() => {
    if (!isAnimating) {
      drawGraph(functionType, paramA, paramB, paramC);
    }
  }, [functionType, paramA, paramB, paramC]);

  useEffect(() => {
    if (quizMode) {
      drawGraph(quizQuestion.type, quizQuestion.a, quizQuestion.b, quizQuestion.c);
    }
  }, [quizMode, quizQuestion]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          関数グラフ動的描画ツール
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
        様々な関数のグラフを動的に描画して、パラメータの変化による影響を学習しよう！
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={quizMode ? `クイズ: ${functionTypes[quizQuestion.type as keyof typeof functionTypes].name}` : `表示中: ${functionTypes[functionType as keyof typeof functionTypes].name}`}
          color="primary" 
          size="large"
        />
        <Chip 
          label={`成功回数: ${successCount}`} 
          color="secondary" 
          size="medium"
        />
      </Box>

      {/* 進捗バー */}
      {progress > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">進捗</Typography>
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
              コントロール
            </Typography>

            {/* モード選択 */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Button
                variant={!quizMode ? 'contained' : 'outlined'}
                onClick={() => setQuizMode(false)}
                size="small"
              >
                学習モード
              </Button>
              <Button
                variant={quizMode ? 'contained' : 'outlined'}
                onClick={() => {
                  setQuizMode(true);
                  generateQuiz();
                }}
                size="small"
              >
                クイズモード
              </Button>
            </Box>

            {!quizMode && (
              <>
                {/* 関数タイプ選択 */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>関数の種類</InputLabel>
                  <Select
                    value={functionType}
                    onChange={(e) => setFunctionType(e.target.value)}
                    size="small"
                  >
                    {Object.entries(functionTypes).map(([key, func]) => (
                      <MenuItem key={key} value={key}>
                        {func.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* パラメータ調整 */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  パラメータ調整
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption">a = {paramA}</Typography>
                  <Slider
                    value={paramA}
                    onChange={(_, value) => setParamA(value as number)}
                    min={-5}
                    max={5}
                    step={0.1}
                    valueLabelDisplay="auto"
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption">b = {paramB}</Typography>
                  <Slider
                    value={paramB}
                    onChange={(_, value) => setParamB(value as number)}
                    min={-5}
                    max={5}
                    step={0.1}
                    valueLabelDisplay="auto"
                    size="small"
                  />
                </Box>

                {functionTypes[functionType as keyof typeof functionTypes].params.includes('c') && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption">c = {paramC}</Typography>
                    <Slider
                      value={paramC}
                      onChange={(_, value) => setParamC(value as number)}
                      min={-5}
                      max={5}
                      step={0.1}
                      valueLabelDisplay="auto"
                      size="small"
                    />
                  </Box>
                )}

                {/* アニメーションコントロール */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={isAnimating ? <PauseIcon /> : <PlayIcon />}
                  onClick={toggleAnimation}
                  size="small"
                >
                  {isAnimating ? 'アニメーション停止' : 'アニメーション開始'}
                </Button>
              </>
            )}

            {/* 関数情報 */}
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {quizMode ? functionTypes[quizQuestion.type as keyof typeof functionTypes].name : functionTypes[functionType as keyof typeof functionTypes].name}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  {quizMode ? '?' : getFunctionText(functionType, paramA, paramB, paramC)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {quizMode ? 'グラフから関数式を読み取ってください' : functionTypes[functionType as keyof typeof functionTypes].formula}
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* 右側：グラフ表示エリア */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              関数グラフ
            </Typography>
            
            <canvas
              ref={canvasRef}
              width={500}
              height={400}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                display: 'block',
                margin: '0 auto'
              }}
            />

            {/* クイズモードの回答欄 */}
            {quizMode && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  このグラフの関数式を入力してください：
                </Typography>
                
                <TextField
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="例: y = 2x + 1"
                  fullWidth
                  sx={{ mb: 2 }}
                  disabled={userAnswer !== '' && userAnswer === getFunctionText(quizQuestion.type, quizQuestion.a, quizQuestion.b, quizQuestion.c)}
                />
                
                <Button
                  variant="contained"
                  onClick={() => checkAnswer(userAnswer)}
                  disabled={!userAnswer || (userAnswer !== '' && userAnswer === getFunctionText(quizQuestion.type, quizQuestion.a, quizQuestion.b, quizQuestion.c))}
                >
                  回答する
                </Button>

                {userAnswer && (
                  <Alert 
                    severity={userAnswer === getFunctionText(quizQuestion.type, quizQuestion.a, quizQuestion.b, quizQuestion.c) ? 'success' : 'error'}
                    sx={{ mt: 2 }}
                  >
                    {userAnswer === getFunctionText(quizQuestion.type, quizQuestion.a, quizQuestion.b, quizQuestion.c) ? 
                      '🎉 正解！グラフから正しく関数式を読み取れました！' : 
                      '❌ 間違いです。グラフの形や通る点をもう一度確認してみましょう！'
                    }
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#fff3e0' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          📊 関数グラフのポイント：
        </Typography>
        <Typography variant="body2">
          • パラメータaは傾きや振幅を調整します<br/>
          • パラメータbは周期や伸縮を調整します<br/>
          • パラメータcは位相や平行移動を調整します<br/>
          • アニメーションでグラフが描かれる過程を観察できます
        </Typography>
      </Paper>
    </Box>
  );
}

export default FunctionGraphTool;