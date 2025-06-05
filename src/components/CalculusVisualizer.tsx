import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Slider,
  Paper,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Point {
  x: number;
  y: number;
}

interface CriticalPoint {
  x: number;
  y: number;
  type: 'max' | 'min' | 'inflection';
}

interface CalculusVisualizerProps {
  onClose?: () => void;
}

const CalculusVisualizer: React.FC<CalculusVisualizerProps> = ({ onClose }) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const derivativeCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // 関数設定
  const [functionStr, setFunctionStr] = useState<string>('x^2');
  const [mode, setMode] = useState<'derivative' | 'integral' | 'both'>('derivative');
  const [tangentPoint, setTangentPoint] = useState<number>(0);
  const [integralBounds, setIntegralBounds] = useState<{ a: number; b: number }>({ a: -2, b: 2 });
  const [rectangleCount, setRectangleCount] = useState<number>(10);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  
  // 表示設定
  const [showDerivative, setShowDerivative] = useState<boolean>(true);
  const [showTangent, setShowTangent] = useState<boolean>(true);
  const [showArea, setShowArea] = useState<boolean>(true);
  const [showCriticalPoints, setShowCriticalPoints] = useState<boolean>(true);
  const [showTaylorExpansion, setShowTaylorExpansion] = useState<boolean>(false);
  const [taylorOrder, setTaylorOrder] = useState<number>(3);
  
  // グラフ設定
  const canvasWidth = 600;
  const canvasHeight = 400;
  const scale = 40;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // 関数パーサー
  const parseFunction = (expr: string) => {
    return (x: number): number => {
      try {
        // 簡単な関数パーサー
        let processedExpr = expr
          .replace(/\^/g, '**')
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/exp/g, 'Math.exp')
          .replace(/log/g, 'Math.log')
          .replace(/sqrt/g, 'Math.sqrt')
          .replace(/pi/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/x/g, `(${x})`);
        
        return eval(processedExpr);
      } catch (e) {
        return 0;
      }
    };
  };
  
  // 数値微分
  const derivative = (f: (x: number) => number, x: number, h: number = 0.0001): number => {
    return (f(x + h) - f(x - h)) / (2 * h);
  };
  
  // 二階微分
  const secondDerivative = (f: (x: number) => number, x: number, h: number = 0.0001): number => {
    return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
  };
  
  // 数値積分（台形公式）
  const integrate = (f: (x: number) => number, a: number, b: number, n: number = 1000): number => {
    const h = (b - a) / n;
    let sum = (f(a) + f(b)) / 2;
    for (let i = 1; i < n; i++) {
      sum += f(a + i * h);
    }
    return sum * h;
  };
  
  // 臨界点の検出
  const findCriticalPoints = (f: (x: number) => number, xMin: number, xMax: number): CriticalPoint[] => {
    const points: CriticalPoint[] = [];
    const step = 0.1;
    
    for (let x = xMin; x <= xMax; x += step) {
      const d1 = derivative(f, x);
      const d2 = secondDerivative(f, x);
      
      // 極値の検出（一階微分がほぼ0）
      if (Math.abs(d1) < 0.01) {
        if (d2 > 0) {
          points.push({ x, y: f(x), type: 'min' });
        } else if (d2 < 0) {
          points.push({ x, y: f(x), type: 'max' });
        }
      }
      
      // 変曲点の検出（二階微分がほぼ0）
      if (Math.abs(d2) < 0.01 && Math.abs(secondDerivative(f, x + 0.01)) > 0.01) {
        points.push({ x, y: f(x), type: 'inflection' });
      }
    }
    
    return points;
  };
  
  // テイラー展開
  const taylorExpansion = (f: (x: number) => number, a: number, x: number, n: number): number => {
    let result = 0;
    let factorial = 1;
    
    for (let i = 0; i <= n; i++) {
      if (i > 0) factorial *= i;
      
      // n階微分の近似
      let nthDerivative = f;
      for (let j = 0; j < i; j++) {
        const prevDerivative = nthDerivative;
        nthDerivative = (t: number) => derivative(prevDerivative, t);
      }
      
      result += (nthDerivative(a) * Math.pow(x - a, i)) / factorial;
    }
    
    return result;
  };
  
  // 座標変換
  const toCanvasX = (x: number) => centerX + x * scale;
  const toCanvasY = (y: number) => centerY - y * scale;
  
  // グラフ描画
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 背景
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // グリッド
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      // 縦線
      ctx.beginPath();
      ctx.moveTo(toCanvasX(i), 0);
      ctx.lineTo(toCanvasX(i), canvasHeight);
      ctx.stroke();
      
      // 横線
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(i));
      ctx.lineTo(canvasWidth, toCanvasY(i));
      ctx.stroke();
    }
    
    // 軸
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvasHeight);
    ctx.stroke();
    
    // 目盛り
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = -10; i <= 10; i++) {
      if (i !== 0) {
        ctx.fillText(i.toString(), toCanvasX(i), centerY + 5);
      }
    }
    
    const f = parseFunction(functionStr);
    
    // 積分の面積（短冊）
    if (mode === 'integral' || mode === 'both') {
      if (showArea) {
        const width = (integralBounds.b - integralBounds.a) / rectangleCount;
        
        for (let i = 0; i < rectangleCount; i++) {
          const x = integralBounds.a + i * width;
          const y = f(x + width / 2);
          
          if (isFinite(y)) {
            ctx.fillStyle = y >= 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)';
            ctx.fillRect(
              toCanvasX(x),
              y >= 0 ? toCanvasY(y) : centerY,
              width * scale,
              Math.abs(y) * scale
            );
            
            ctx.strokeStyle = y >= 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)';
            ctx.strokeRect(
              toCanvasX(x),
              y >= 0 ? toCanvasY(y) : centerY,
              width * scale,
              Math.abs(y) * scale
            );
          }
        }
      }
    }
    
    // 関数のグラフ
    ctx.strokeStyle = theme.palette.primary.main;
    ctx.lineWidth = 3;
    ctx.beginPath();
    let firstPoint = true;
    
    for (let x = -10; x <= 10; x += 0.01) {
      const y = f(x);
      if (isFinite(y) && Math.abs(y) < 20) {
        if (firstPoint) {
          ctx.moveTo(toCanvasX(x), toCanvasY(y));
          firstPoint = false;
        } else {
          ctx.lineTo(toCanvasX(x), toCanvasY(y));
        }
      } else {
        firstPoint = true;
      }
    }
    ctx.stroke();
    
    // 接線
    if ((mode === 'derivative' || mode === 'both') && showTangent) {
      const y0 = f(tangentPoint);
      const slope = derivative(f, tangentPoint);
      
      if (isFinite(y0) && isFinite(slope)) {
        ctx.strokeStyle = '#f50057';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // 接線の式: y - y0 = slope * (x - x0)
        const x1 = -10;
        const y1 = y0 + slope * (x1 - tangentPoint);
        const x2 = 10;
        const y2 = y0 + slope * (x2 - tangentPoint);
        
        ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
        ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
        ctx.stroke();
        
        // 接点
        ctx.fillStyle = '#f50057';
        ctx.beginPath();
        ctx.arc(toCanvasX(tangentPoint), toCanvasY(y0), 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // 傾きの表示
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.fillText(
          `傾き = ${slope.toFixed(2)}`,
          toCanvasX(tangentPoint) + 10,
          toCanvasY(y0) - 10
        );
      }
    }
    
    // 臨界点
    if (showCriticalPoints) {
      const criticalPoints = findCriticalPoints(f, -10, 10);
      criticalPoints.forEach(point => {
        ctx.fillStyle = 
          point.type === 'max' ? '#4caf50' :
          point.type === 'min' ? '#ff9800' :
          '#9c27b0';
        ctx.beginPath();
        ctx.arc(toCanvasX(point.x), toCanvasY(point.y), 6, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        const label = 
          point.type === 'max' ? '極大' :
          point.type === 'min' ? '極小' :
          '変曲点';
        ctx.fillText(label, toCanvasX(point.x) + 10, toCanvasY(point.y));
      });
    }
    
    // テイラー展開
    if (showTaylorExpansion) {
      ctx.strokeStyle = '#ff5722';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      firstPoint = true;
      
      for (let x = -10; x <= 10; x += 0.01) {
        const y = taylorExpansion(f, tangentPoint, x, taylorOrder);
        if (isFinite(y) && Math.abs(y) < 20) {
          if (firstPoint) {
            ctx.moveTo(toCanvasX(x), toCanvasY(y));
            firstPoint = false;
          } else {
            ctx.lineTo(toCanvasX(x), toCanvasY(y));
          }
        } else {
          firstPoint = true;
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };
  
  // 導関数のグラフ描画
  const drawDerivativeGraph = () => {
    const canvas = derivativeCanvasRef.current;
    if (!canvas || !showDerivative) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasWidth, 200);
    
    // 背景
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvasWidth, 200);
    
    const derivCenterY = 100;
    
    // 軸
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, derivCenterY);
    ctx.lineTo(canvasWidth, derivCenterY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, 200);
    ctx.stroke();
    
    const f = parseFunction(functionStr);
    
    // 導関数のグラフ
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let firstPoint = true;
    
    for (let x = -10; x <= 10; x += 0.01) {
      const y = derivative(f, x);
      if (isFinite(y) && Math.abs(y) < 10) {
        const canvasY = derivCenterY - y * 20; // スケールを調整
        if (firstPoint) {
          ctx.moveTo(toCanvasX(x), canvasY);
          firstPoint = false;
        } else {
          ctx.lineTo(toCanvasX(x), canvasY);
        }
      } else {
        firstPoint = true;
      }
    }
    ctx.stroke();
    
    // ラベル
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText("f'(x)", 10, 20);
  };
  
  // グラフの更新
  useEffect(() => {
    drawGraph();
    drawDerivativeGraph();
  }, [functionStr, mode, tangentPoint, integralBounds, rectangleCount, 
      showTangent, showArea, showCriticalPoints, showDerivative,
      showTaylorExpansion, taylorOrder]);
  
  // アニメーション
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 1) {
            setIsAnimating(false);
            return 0;
          }
          return prev + 0.02;
        });
        setTangentPoint(prev => {
          const next = prev + 0.05;
          return next > 5 ? -5 : next;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);
  
  // 積分値の計算
  const f = parseFunction(functionStr);
  const integralValue = integrate(f, integralBounds.a, integralBounds.b);
  
  // リセット
  const handleReset = () => {
    setFunctionStr('x^2');
    setTangentPoint(0);
    setIntegralBounds({ a: -2, b: 2 });
    setRectangleCount(10);
    setIsAnimating(false);
    setTaylorOrder(3);
  };
  
  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          微分積分ビジュアライザー
        </Typography>
        <Tooltip title="使い方">
          <IconButton onClick={() => setShowExplanation(!showExplanation)}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {showExplanation && (
        <Alert severity="info" sx={{ mb: 3 }}>
          関数の微分と積分を視覚的に理解できます。接線の傾きで微分を、
          面積の近似で積分を体験しましょう。関数式にはx, sin, cos, exp, log等が使えます。
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* 左側：コントロール */}
        <Box sx={{ flex: '0 0 350px', minWidth: 300 }}>
          {/* 関数入力 */}
          <TextField
            fullWidth
            label="関数 f(x)"
            value={functionStr}
            onChange={(e) => setFunctionStr(e.target.value)}
            placeholder="例: x^2, sin(x), exp(x)"
            sx={{ mb: 2 }}
          />

          {/* モード選択 */}
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, value) => value && setMode(value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="derivative">微分</ToggleButton>
            <ToggleButton value="integral">積分</ToggleButton>
            <ToggleButton value="both">両方</ToggleButton>
          </ToggleButtonGroup>

          {/* 微分設定 */}
          {(mode === 'derivative' || mode === 'both') && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                微分の設定
              </Typography>
              <Typography variant="caption">
                x = {tangentPoint.toFixed(2)} での接線
              </Typography>
              <Slider
                value={tangentPoint}
                onChange={(_, value) => setTangentPoint(value as number)}
                min={-5}
                max={5}
                step={0.1}
                marks
                valueLabelDisplay="auto"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showTangent}
                    onChange={(e) => setShowTangent(e.target.checked)}
                  />
                }
                label="接線を表示"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showDerivative}
                    onChange={(e) => setShowDerivative(e.target.checked)}
                  />
                }
                label="導関数グラフを表示"
              />
            </Paper>
          )}

          {/* 積分設定 */}
          {(mode === 'integral' || mode === 'both') && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                積分の設定
              </Typography>
              <Typography variant="caption">
                積分区間: [{integralBounds.a.toFixed(1)}, {integralBounds.b.toFixed(1)}]
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Slider
                  value={[integralBounds.a, integralBounds.b]}
                  onChange={(_, value) => {
                    const [a, b] = value as number[];
                    setIntegralBounds({ a, b });
                  }}
                  min={-5}
                  max={5}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
              <Typography variant="caption">
                分割数: {rectangleCount}
              </Typography>
              <Slider
                value={rectangleCount}
                onChange={(_, value) => setRectangleCount(value as number)}
                min={1}
                max={100}
                step={1}
                valueLabelDisplay="auto"
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                積分値: {integralValue.toFixed(4)}
              </Typography>
            </Paper>
          )}

          {/* 表示オプション */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              表示オプション
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={showCriticalPoints}
                  onChange={(e) => setShowCriticalPoints(e.target.checked)}
                />
              }
              label="極値・変曲点を表示"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showTaylorExpansion}
                  onChange={(e) => setShowTaylorExpansion(e.target.checked)}
                />
              }
              label="テイラー展開を表示"
            />
            {showTaylorExpansion && (
              <Box sx={{ ml: 3 }}>
                <Typography variant="caption">
                  次数: {taylorOrder}
                </Typography>
                <Slider
                  value={taylorOrder}
                  onChange={(_, value) => setTaylorOrder(value as number)}
                  min={1}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
            )}
          </Paper>

          {/* アクションボタン */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => setIsAnimating(!isAnimating)}
              startIcon={<PlayArrowIcon />}
            >
              {isAnimating ? '停止' : 'アニメーション'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<RefreshIcon />}
            >
              リセット
            </Button>
          </Box>

          {/* 公式集 */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              基本公式
            </Typography>
            <Typography variant="caption" component="div">
              (xⁿ)' = n·xⁿ⁻¹
            </Typography>
            <Typography variant="caption" component="div">
              (sin x)' = cos x
            </Typography>
            <Typography variant="caption" component="div">
              (eˣ)' = eˣ
            </Typography>
            <Typography variant="caption" component="div">
              ∫xⁿ dx = xⁿ⁺¹/(n+1) + C
            </Typography>
          </Paper>
        </Box>

        {/* 右側：グラフ */}
        <Box sx={{ flex: '1 1 400px' }}>
          {/* メイングラフ */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              style={{
                width: '100%',
                maxWidth: canvasWidth,
                height: 'auto',
              }}
            />
          </Paper>

          {/* 導関数グラフ */}
          {showDerivative && (mode === 'derivative' || mode === 'both') && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <canvas
                ref={derivativeCanvasRef}
                width={canvasWidth}
                height={200}
                style={{
                  width: '100%',
                  maxWidth: canvasWidth,
                  height: 'auto',
                }}
              />
            </Paper>
          )}

          {/* 情報表示 */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`f(${tangentPoint.toFixed(1)}) = ${f(tangentPoint).toFixed(2)}`}
              color="primary"
              size="small"
            />
            <Chip
              label={`f'(${tangentPoint.toFixed(1)}) = ${derivative(f, tangentPoint).toFixed(2)}`}
              color="secondary"
              size="small"
            />
            {(mode === 'integral' || mode === 'both') && (
              <Chip
                label={`∫f(x)dx ≈ ${integralValue.toFixed(4)}`}
                size="small"
              />
            )}
          </Box>

          {/* 応用例 */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              応用例
            </Typography>
            <Typography variant="caption" component="div">
              • 速度 = 位置の微分
            </Typography>
            <Typography variant="caption" component="div">
              • 加速度 = 速度の微分
            </Typography>
            <Typography variant="caption" component="div">
              • 移動距離 = 速度の積分
            </Typography>
            <Typography variant="caption" component="div">
              • 仕事 = 力の積分
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Card>
  );
};

export default CalculusVisualizer;