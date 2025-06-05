import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Slider,
  Button,
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
  TextField,
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

interface QuadraticFunctionGraphProps {
  onClose?: () => void;
}

const QuadraticFunctionGraph: React.FC<QuadraticFunctionGraphProps> = ({ onClose }) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 係数
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(0);
  const [c, setC] = useState<number>(0);
  
  // アニメーション用の係数
  const [animatedA, setAnimatedA] = useState<number>(1);
  const [animatedB, setAnimatedB] = useState<number>(0);
  const [animatedC, setAnimatedC] = useState<number>(0);
  
  // 表示設定
  const [showVertex, setShowVertex] = useState<boolean>(true);
  const [showAxis, setShowAxis] = useState<boolean>(true);
  const [showRoots, setShowRoots] = useState<boolean>(true);
  const [showStandardForm, setShowStandardForm] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [clickedPoint, setClickedPoint] = useState<Point | null>(null);
  
  // グラフ設定
  const canvasWidth = 600;
  const canvasHeight = 600;
  const scale = 30; // 1単位 = 30ピクセル
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // 頂点の計算
  const getVertex = (a: number, b: number, c: number) => {
    if (a === 0) return { x: 0, y: 0 };
    const x = -b / (2 * a);
    const y = a * x * x + b * x + c;
    return { x, y };
  };
  
  // 軸の方程式
  const getAxisEquation = (a: number, b: number) => {
    if (a === 0) return 'x = 0';
    const x = -b / (2 * a);
    return `x = ${x.toFixed(2)}`;
  };
  
  // 判別式の計算
  const getDiscriminant = (a: number, b: number, c: number) => {
    return b * b - 4 * a * c;
  };
  
  // 解の計算
  const getRoots = (a: number, b: number, c: number) => {
    if (a === 0) return [];
    const D = getDiscriminant(a, b, c);
    if (D < 0) return [];
    if (D === 0) return [-b / (2 * a)];
    const sqrtD = Math.sqrt(D);
    return [(-b - sqrtD) / (2 * a), (-b + sqrtD) / (2 * a)];
  };
  
  // 標準形への変換
  const getStandardForm = (a: number, b: number, c: number) => {
    if (a === 0) return { a: 0, p: 0, q: 0 };
    const p = -b / (2 * a);
    const q = c - b * b / (4 * a);
    return { a, p, q };
  };
  
  // 座標変換
  const toCanvasX = (x: number) => centerX + x * scale;
  const toCanvasY = (y: number) => centerY - y * scale;
  const toMathX = (canvasX: number) => (canvasX - centerX) / scale;
  const toMathY = (canvasY: number) => -(canvasY - centerY) / scale;
  
  // 関数の値を計算
  const f = (x: number, a: number, b: number, c: number) => {
    return a * x * x + b * x + c;
  };
  
  // グラフ描画
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // クリア
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
    
    // x軸
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.stroke();
    
    // y軸
    ctx.beginPath();
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
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let i = -10; i <= 10; i++) {
      if (i !== 0) {
        ctx.fillText(i.toString(), centerX + 5, toCanvasY(i));
      }
    }
    
    // 放物線
    ctx.strokeStyle = theme.palette.primary.main;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    let firstPoint = true;
    for (let x = -10; x <= 10; x += 0.1) {
      const y = f(x, animatedA, animatedB, animatedC);
      if (Math.abs(y) > 15) continue; // 画面外は描画しない
      
      const canvasX = toCanvasX(x);
      const canvasY = toCanvasY(y);
      
      if (firstPoint) {
        ctx.moveTo(canvasX, canvasY);
        firstPoint = false;
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();
    
    // 頂点
    if (showVertex && animatedA !== 0) {
      const vertex = getVertex(animatedA, animatedB, animatedC);
      ctx.fillStyle = '#f50057';
      ctx.beginPath();
      ctx.arc(toCanvasX(vertex.x), toCanvasY(vertex.y), 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.fillText(
        `頂点(${vertex.x.toFixed(2)}, ${vertex.y.toFixed(2)})`,
        toCanvasX(vertex.x) + 10,
        toCanvasY(vertex.y) - 10
      );
    }
    
    // 軸
    if (showAxis && animatedA !== 0) {
      const axisX = -animatedB / (2 * animatedA);
      ctx.strokeStyle = '#ff9800';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(axisX), 0);
      ctx.lineTo(toCanvasX(axisX), canvasHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // x切片（解）
    if (showRoots) {
      const roots = getRoots(animatedA, animatedB, animatedC);
      ctx.fillStyle = '#4caf50';
      roots.forEach(root => {
        ctx.beginPath();
        ctx.arc(toCanvasX(root), toCanvasY(0), 6, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    
    // クリックした点
    if (clickedPoint) {
      ctx.fillStyle = '#2196f3';
      ctx.beginPath();
      ctx.arc(toCanvasX(clickedPoint.x), toCanvasY(clickedPoint.y), 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.fillText(
        `(${clickedPoint.x.toFixed(2)}, ${clickedPoint.y.toFixed(2)})`,
        toCanvasX(clickedPoint.x) + 10,
        toCanvasY(clickedPoint.y) - 10
      );
    }
  };
  
  // アニメーション処理
  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        let completed = true;
        
        // aの更新
        if (Math.abs(animatedA - a) > 0.01) {
          setAnimatedA(prev => prev + (a - prev) * 0.1);
          completed = false;
        } else {
          setAnimatedA(a);
        }
        
        // bの更新
        if (Math.abs(animatedB - b) > 0.01) {
          setAnimatedB(prev => prev + (b - prev) * 0.1);
          completed = false;
        } else {
          setAnimatedB(b);
        }
        
        // cの更新
        if (Math.abs(animatedC - c) > 0.01) {
          setAnimatedC(prev => prev + (c - prev) * 0.1);
          completed = false;
        } else {
          setAnimatedC(c);
        }
        
        if (completed) {
          setIsAnimating(false);
        }
      };
      
      const timer = setInterval(animate, 30);
      return () => clearInterval(timer);
    }
  }, [isAnimating, a, b, c, animatedA, animatedB, animatedC]);
  
  // グラフ再描画
  useEffect(() => {
    drawGraph();
  }, [animatedA, animatedB, animatedC, showVertex, showAxis, showRoots, clickedPoint]);
  
  // キャンバスクリックハンドラ
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    const mathX = toMathX(canvasX);
    const mathY = f(mathX, animatedA, animatedB, animatedC);
    
    setClickedPoint({ x: mathX, y: mathY });
  };
  
  // リセット
  const handleReset = () => {
    setA(1);
    setB(0);
    setC(0);
    setAnimatedA(1);
    setAnimatedB(0);
    setAnimatedC(0);
    setClickedPoint(null);
  };
  
  // 標準形の表示
  const standardForm = getStandardForm(a, b, c);
  const discriminant = getDiscriminant(a, b, c);
  const roots = getRoots(a, b, c);
  const vertex = getVertex(a, b, c);
  
  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          二次関数グラフ変形ツール
        </Typography>
        <Tooltip title="使い方">
          <IconButton onClick={() => setShowExplanation(!showExplanation)}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {showExplanation && (
        <Alert severity="info" sx={{ mb: 3 }}>
          二次関数 y = ax² + bx + c のグラフを自由に変形できます。
          係数を変更すると、頂点や軸、解の変化をリアルタイムで観察できます。
          グラフ上をクリックすると、その点の座標が表示されます。
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* 左側：コントロール */}
        <Box sx={{ flex: '0 0 350px', minWidth: 300 }}>
          {/* 係数スライダー */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              係数の調整
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>
                a = {a.toFixed(2)}
              </Typography>
              <Slider
                value={a}
                onChange={(_, value) => setA(value as number)}
                min={-5}
                max={5}
                step={0.1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>
                b = {b.toFixed(2)}
              </Typography>
              <Slider
                value={b}
                onChange={(_, value) => setB(value as number)}
                min={-10}
                max={10}
                step={0.1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
            
            <Box>
              <Typography gutterBottom>
                c = {c.toFixed(2)}
              </Typography>
              <Slider
                value={c}
                onChange={(_, value) => setC(value as number)}
                min={-10}
                max={10}
                step={0.1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          </Paper>

          {/* 表示オプション */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              表示オプション
            </Typography>
            <ToggleButtonGroup
              orientation="vertical"
              sx={{ width: '100%' }}
            >
              <ToggleButton
                value="vertex"
                selected={showVertex}
                onClick={() => setShowVertex(!showVertex)}
              >
                <VisibilityIcon sx={{ mr: 1 }} />
                頂点を表示
              </ToggleButton>
              <ToggleButton
                value="axis"
                selected={showAxis}
                onClick={() => setShowAxis(!showAxis)}
              >
                <VisibilityIcon sx={{ mr: 1 }} />
                軸を表示
              </ToggleButton>
              <ToggleButton
                value="roots"
                selected={showRoots}
                onClick={() => setShowRoots(!showRoots)}
              >
                <VisibilityIcon sx={{ mr: 1 }} />
                x切片を表示
              </ToggleButton>
              <ToggleButton
                value="standard"
                selected={showStandardForm}
                onClick={() => setShowStandardForm(!showStandardForm)}
              >
                <VisibilityIcon sx={{ mr: 1 }} />
                標準形を表示
              </ToggleButton>
            </ToggleButtonGroup>
          </Paper>

          {/* 関数の情報 */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              関数の情報
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              一般形: y = {a.toFixed(2)}x² {b >= 0 ? '+' : ''} {b.toFixed(2)}x {c >= 0 ? '+' : ''} {c.toFixed(2)}
            </Typography>
            
            {showStandardForm && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                標準形: y = {standardForm.a.toFixed(2)}(x {standardForm.p >= 0 ? '-' : '+'} {Math.abs(standardForm.p).toFixed(2)})² {standardForm.q >= 0 ? '+' : ''} {standardForm.q.toFixed(2)}
              </Typography>
            )}
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              頂点: ({vertex.x.toFixed(2)}, {vertex.y.toFixed(2)})
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              軸: {getAxisEquation(a, b)}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              判別式 D = {discriminant.toFixed(2)}
            </Typography>
            
            <Typography variant="body2">
              解の個数: 
              {discriminant > 0 ? ' 2個' : discriminant === 0 ? ' 1個（重解）' : ' 0個（実数解なし）'}
            </Typography>
            
            {roots.length > 0 && (
              <Typography variant="body2">
                解: x = {roots.map(r => r.toFixed(2)).join(', ')}
              </Typography>
            )}
          </Paper>

          {/* アクションボタン */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => setIsAnimating(true)}
              startIcon={<PlayArrowIcon />}
              disabled={isAnimating}
            >
              アニメーション
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<RefreshIcon />}
            >
              リセット
            </Button>
          </Box>

          {/* 変形の過程 */}
          {showStandardForm && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                標準形への変形過程
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                y = {a.toFixed(2)}x² {b >= 0 ? '+' : ''} {b.toFixed(2)}x {c >= 0 ? '+' : ''} {c.toFixed(2)}
                {'\n'}= {a.toFixed(2)}(x² {b/a >= 0 ? '+' : ''} {(b/a).toFixed(2)}x) {c >= 0 ? '+' : ''} {c.toFixed(2)}
                {'\n'}= {a.toFixed(2)}(x² {b/a >= 0 ? '+' : ''} {(b/a).toFixed(2)}x + {(b/(2*a)).toFixed(2)}² - {(b/(2*a)).toFixed(2)}²) {c >= 0 ? '+' : ''} {c.toFixed(2)}
                {'\n'}= {a.toFixed(2)}(x {-b/(2*a) >= 0 ? '+' : ''} {(-b/(2*a)).toFixed(2)})² {c - b*b/(4*a) >= 0 ? '+' : ''} {(c - b*b/(4*a)).toFixed(2)}
              </Typography>
            </Paper>
          )}
        </Box>

        {/* 右側：グラフ */}
        <Box sx={{ flex: '1 1 400px' }}>
          <Paper sx={{ p: 2 }}>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onClick={handleCanvasClick}
              style={{
                cursor: 'crosshair',
                width: '100%',
                maxWidth: canvasWidth,
                height: 'auto',
              }}
            />
          </Paper>

          {/* グラフの特徴 */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={a > 0 ? '下に凸' : a < 0 ? '上に凸' : '直線'}
              color={a !== 0 ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label={`頂点 (${vertex.x.toFixed(1)}, ${vertex.y.toFixed(1)})`}
              color="secondary"
              size="small"
            />
            <Chip
              label={
                discriminant > 0
                  ? `x軸と2点で交わる`
                  : discriminant === 0
                  ? `x軸に接する`
                  : `x軸と交わらない`
              }
              size="small"
            />
            {a !== 0 && (
              <Chip
                label={a > 0 ? `最小値 ${vertex.y.toFixed(1)}` : `最大値 ${vertex.y.toFixed(1)}`}
                size="small"
              />
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default QuadraticFunctionGraph;