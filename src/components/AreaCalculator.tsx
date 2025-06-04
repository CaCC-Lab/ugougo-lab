import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  Container,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SquareIcon from '@mui/icons-material/Square';
import RectangleIcon from '@mui/icons-material/Rectangle';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import GridOnIcon from '@mui/icons-material/GridOn';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// キャンバスのスタイル
const CanvasContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '400px',
  backgroundColor: '#fafafa',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  cursor: 'crosshair',
  [theme.breakpoints.down('sm')]: {
    height: '300px',
  },
}));

// グリッドのスタイル
const GridOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'repeating-linear-gradient(0deg, #e0e0e0 0px, transparent 1px, transparent 19px, #e0e0e0 20px), repeating-linear-gradient(90deg, #e0e0e0 0px, transparent 1px, transparent 19px, #e0e0e0 20px)',
  pointerEvents: 'none',
  opacity: 0.5,
}));

// 頂点のスタイル
const Vertex = styled(Box)<{ isDragging?: boolean }>(({ theme, isDragging }) => ({
  position: 'absolute',
  width: '12px',
  height: '12px',
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  cursor: isDragging ? 'grabbing' : 'grab',
  transform: 'translate(-50%, -50%)',
  zIndex: 10,
  '&:hover': {
    width: '16px',
    height: '16px',
  },
}));

interface Point {
  x: number;
  y: number;
}

interface Shape {
  type: 'square' | 'rectangle' | 'triangle' | 'parallelogram';
  vertices: Point[];
}

interface AreaCalculatorProps {
  onClose?: () => void;
}

const AreaCalculator: React.FC<AreaCalculatorProps> = ({ onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [shapeType, setShapeType] = useState<Shape['type']>('rectangle');
  const [showGrid, setShowGrid] = useState(true);
  const [unit, setUnit] = useState<'cm' | 'm'>('cm');
  const [shape, setShape] = useState<Shape>({
    type: 'rectangle',
    vertices: [
      { x: 100, y: 100 },
      { x: 250, y: 100 },
      { x: 250, y: 200 },
      { x: 100, y: 200 },
    ],
  });
  const [draggedVertex, setDraggedVertex] = useState<number | null>(null);
  const [mode, setMode] = useState<'free' | 'challenge'>('free');
  const [targetArea, setTargetArea] = useState(100);
  const [showAnimation, setShowAnimation] = useState(false);
  const [challengeDialog, setChallengeDialog] = useState(false);
  
  // 図形の初期化
  const initializeShape = (type: Shape['type']) => {
    const centerX = 200;
    const centerY = 150;
    
    switch (type) {
      case 'square':
        setShape({
          type,
          vertices: [
            { x: centerX - 50, y: centerY - 50 },
            { x: centerX + 50, y: centerY - 50 },
            { x: centerX + 50, y: centerY + 50 },
            { x: centerX - 50, y: centerY + 50 },
          ],
        });
        break;
      case 'rectangle':
        setShape({
          type,
          vertices: [
            { x: centerX - 75, y: centerY - 50 },
            { x: centerX + 75, y: centerY - 50 },
            { x: centerX + 75, y: centerY + 50 },
            { x: centerX - 75, y: centerY + 50 },
          ],
        });
        break;
      case 'triangle':
        setShape({
          type,
          vertices: [
            { x: centerX, y: centerY - 60 },
            { x: centerX + 60, y: centerY + 40 },
            { x: centerX - 60, y: centerY + 40 },
          ],
        });
        break;
      case 'parallelogram':
        setShape({
          type,
          vertices: [
            { x: centerX - 60, y: centerY - 40 },
            { x: centerX + 40, y: centerY - 40 },
            { x: centerX + 60, y: centerY + 40 },
            { x: centerX - 40, y: centerY + 40 },
          ],
        });
        break;
    }
  };
  
  // 面積の計算
  const calculateArea = (): number => {
    const { type, vertices } = shape;
    
    switch (type) {
      case 'square':
      case 'rectangle': {
        const width = Math.abs(vertices[1].x - vertices[0].x);
        const height = Math.abs(vertices[2].y - vertices[1].y);
        return (width * height) / 400; // 20px = 1cm
      }
      case 'triangle': {
        // ヘロンの公式を使用
        const a = Math.sqrt(Math.pow(vertices[1].x - vertices[0].x, 2) + Math.pow(vertices[1].y - vertices[0].y, 2));
        const b = Math.sqrt(Math.pow(vertices[2].x - vertices[1].x, 2) + Math.pow(vertices[2].y - vertices[1].y, 2));
        const c = Math.sqrt(Math.pow(vertices[0].x - vertices[2].x, 2) + Math.pow(vertices[0].y - vertices[2].y, 2));
        const s = (a + b + c) / 2;
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        return area / 400;
      }
      case 'parallelogram': {
        // ベクトルの外積を使用
        const base = Math.sqrt(Math.pow(vertices[1].x - vertices[0].x, 2) + Math.pow(vertices[1].y - vertices[0].y, 2));
        const v1 = { x: vertices[1].x - vertices[0].x, y: vertices[1].y - vertices[0].y };
        const v2 = { x: vertices[3].x - vertices[0].x, y: vertices[3].y - vertices[0].y };
        const height = Math.abs(v1.x * v2.y - v1.y * v2.x) / base;
        return (base * height) / 400;
      }
      default:
        return 0;
    }
  };
  
  // 面積の公式を取得
  const getFormula = (): string => {
    const { type, vertices } = shape;
    
    switch (type) {
      case 'square': {
        const side = Math.abs(vertices[1].x - vertices[0].x) / 20;
        return `一辺 × 一辺 = ${side.toFixed(1)} × ${side.toFixed(1)}`;
      }
      case 'rectangle': {
        const width = Math.abs(vertices[1].x - vertices[0].x) / 20;
        const height = Math.abs(vertices[2].y - vertices[1].y) / 20;
        return `たて × よこ = ${height.toFixed(1)} × ${width.toFixed(1)}`;
      }
      case 'triangle': {
        const base = Math.abs(vertices[2].x - vertices[1].x) / 20;
        const height = Math.abs(vertices[0].y - vertices[1].y) / 20;
        return `底辺 × 高さ ÷ 2 = ${base.toFixed(1)} × ${height.toFixed(1)} ÷ 2`;
      }
      case 'parallelogram': {
        const base = Math.sqrt(Math.pow(vertices[1].x - vertices[0].x, 2) + Math.pow(vertices[1].y - vertices[0].y, 2)) / 20;
        const v1 = { x: vertices[1].x - vertices[0].x, y: vertices[1].y - vertices[0].y };
        const v2 = { x: vertices[3].x - vertices[0].x, y: vertices[3].y - vertices[0].y };
        const height = Math.abs(v1.x * v2.y - v1.y * v2.x) / Math.sqrt(v1.x * v1.x + v1.y * v1.y) / 20;
        return `底辺 × 高さ = ${base.toFixed(1)} × ${height.toFixed(1)}`;
      }
      default:
        return '';
    }
  };
  
  // 頂点のドラッグ処理
  const handleVertexMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setDraggedVertex(index);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedVertex === null || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    const newVertices = [...shape.vertices];
    newVertices[draggedVertex] = { x, y };
    
    // 正方形と長方形の場合は、形状を維持
    if (shape.type === 'square') {
      const dx = x - shape.vertices[draggedVertex].x;
      const dy = y - shape.vertices[draggedVertex].y;
      const avgDelta = (Math.abs(dx) + Math.abs(dy)) / 2;
      
      // 対角の頂点を特定して、正方形を維持
      if (draggedVertex === 0) {
        newVertices[1] = { x: newVertices[0].x + avgDelta, y: newVertices[0].y };
        newVertices[2] = { x: newVertices[0].x + avgDelta, y: newVertices[0].y + avgDelta };
        newVertices[3] = { x: newVertices[0].x, y: newVertices[0].y + avgDelta };
      }
    } else if (shape.type === 'rectangle' && draggedVertex < 4) {
      // 長方形の頂点を調整
      const opposite = (draggedVertex + 2) % 4;
      const adj1 = (draggedVertex + 1) % 4;
      const adj2 = (draggedVertex + 3) % 4;
      
      newVertices[adj1] = { x: newVertices[draggedVertex].x, y: newVertices[opposite].y };
      newVertices[adj2] = { x: newVertices[opposite].x, y: newVertices[draggedVertex].y };
    }
    
    setShape({ ...shape, vertices: newVertices });
  };
  
  const handleMouseUp = () => {
    setDraggedVertex(null);
  };
  
  // 図形タイプの変更
  const handleShapeTypeChange = (_: React.MouseEvent<HTMLElement>, newType: Shape['type'] | null) => {
    if (newType) {
      setShapeType(newType);
      initializeShape(newType);
      setShowAnimation(false);
    }
  };
  
  // チャレンジモードの開始
  const startChallenge = () => {
    const randomArea = Math.floor(Math.random() * 150) + 50;
    setTargetArea(randomArea);
    setChallengeDialog(true);
    setMode('challenge');
    initializeShape(shapeType);
  };
  
  // チャレンジの判定
  const checkChallenge = () => {
    const currentArea = calculateArea();
    const tolerance = 5; // 5cm²の誤差を許容
    return Math.abs(currentArea - targetArea) < tolerance;
  };
  
  // 三角形のアニメーション
  const showTriangleAnimation = () => {
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 3000);
  };
  
  // 単位変換
  const convertArea = (area: number): string => {
    if (unit === 'cm') {
      return `${area.toFixed(1)} cm²`;
    } else {
      return `${(area / 10000).toFixed(4)} m²`;
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Card sx={{ backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GridOnIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              面積計算ツール
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              図形の頂点をドラッグして、面積の変化を観察しよう！
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 2 }}>
                <ToggleButtonGroup
                  value={shapeType}
                  exclusive
                  onChange={handleShapeTypeChange}
                  aria-label="図形の種類"
                  size={isMobile ? 'small' : 'medium'}
                >
                  <ToggleButton value="square" aria-label="正方形">
                    <SquareIcon sx={{ mr: 1 }} />
                    正方形
                  </ToggleButton>
                  <ToggleButton value="rectangle" aria-label="長方形">
                    <RectangleIcon sx={{ mr: 1 }} />
                    長方形
                  </ToggleButton>
                  <ToggleButton value="triangle" aria-label="三角形">
                    <ChangeHistoryIcon sx={{ mr: 1 }} />
                    三角形
                  </ToggleButton>
                  <ToggleButton value="parallelogram" aria-label="平行四辺形">
                    <FilterNoneIcon sx={{ mr: 1 }} />
                    平行四辺形
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <CanvasContainer
                ref={canvasRef}
                elevation={3}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {showGrid && <GridOverlay />}
                
                {/* 図形の描画 */}
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                >
                  <polygon
                    points={shape.vertices.map(v => `${v.x},${v.y}`).join(' ')}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.3}
                    stroke={theme.palette.primary.main}
                    strokeWidth="2"
                  />
                  
                  {/* 三角形のアニメーション */}
                  {showAnimation && shape.type === 'triangle' && (
                    <>
                      <rect
                        x={shape.vertices[1].x}
                        y={shape.vertices[0].y}
                        width={shape.vertices[2].x - shape.vertices[1].x}
                        height={shape.vertices[1].y - shape.vertices[0].y}
                        fill="none"
                        stroke={theme.palette.secondary.main}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity={0.5}
                      />
                      <text
                        x={(shape.vertices[1].x + shape.vertices[2].x) / 2}
                        y={shape.vertices[0].y - 10}
                        textAnchor="middle"
                        fill={theme.palette.secondary.main}
                        fontSize="14"
                      >
                        長方形の半分
                      </text>
                    </>
                  )}
                </svg>
                
                {/* 頂点 */}
                {shape.vertices.map((vertex, index) => (
                  <Vertex
                    key={index}
                    sx={{ left: vertex.x, top: vertex.y }}
                    isDragging={draggedVertex === index}
                    onMouseDown={(e) => handleVertexMouseDown(e, index)}
                  />
                ))}
                
                {/* グリッドの単位表示 */}
                {showGrid && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      bottom: 5,
                      right: 5,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      padding: '2px 6px',
                      borderRadius: 1,
                    }}
                  >
                    1マス = 1cm
                  </Typography>
                )}
              </CanvasContainer>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  面積の計算
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    公式
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {getFormula()}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    面積
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {convertArea(calculateArea())}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <ButtonGroup variant="outlined" size="small" fullWidth>
                    <Button
                      onClick={() => setUnit('cm')}
                      variant={unit === 'cm' ? 'contained' : 'outlined'}
                    >
                      cm²
                    </Button>
                    <Button
                      onClick={() => setUnit('m')}
                      variant={unit === 'm' ? 'contained' : 'outlined'}
                    >
                      m²
                    </Button>
                  </ButtonGroup>
                </Box>
                
                {mode === 'challenge' && (
                  <Alert
                    severity={checkChallenge() ? 'success' : 'info'}
                    icon={checkChallenge() ? <CheckCircleIcon /> : null}
                    sx={{ mb: 2 }}
                  >
                    目標: {targetArea} cm²
                    {checkChallenge() && ' - 正解！'}
                  </Alert>
                )}
              </Paper>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<GridOnIcon />}
                  onClick={() => setShowGrid(!showGrid)}
                  fullWidth
                >
                  グリッド {showGrid ? 'OFF' : 'ON'}
                </Button>
                
                {shape.type === 'triangle' && (
                  <Button
                    variant="outlined"
                    startIcon={<PlayArrowIcon />}
                    onClick={showTriangleAnimation}
                    fullWidth
                  >
                    アニメーション
                  </Button>
                )}
                
                <Button
                  variant="contained"
                  onClick={startChallenge}
                  fullWidth
                  color="secondary"
                >
                  チャレンジモード
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  onClick={() => {
                    initializeShape(shapeType);
                    setMode('free');
                  }}
                  fullWidth
                >
                  リセット
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              使い方のヒント
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 頂点（青い点）をドラッグして図形の大きさを変えられます
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • グリッドの1マスは1cm×1cm（1cm²）です
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • チャレンジモードで、指定された面積の図形を作ってみよう！
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 三角形のアニメーションで、面積の求め方がわかります
            </Typography>
          </Box>
        </CardContent>
      </Card>
      
      {/* チャレンジダイアログ */}
      <Dialog open={challengeDialog} onClose={() => setChallengeDialog(false)}>
        <DialogTitle>チャレンジモード</DialogTitle>
        <DialogContent>
          <Typography>
            {targetArea} cm²の図形を作ってください！
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            頂点をドラッグして、目標の面積に近づけましょう。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChallengeDialog(false)} color="primary">
            スタート！
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AreaCalculator;