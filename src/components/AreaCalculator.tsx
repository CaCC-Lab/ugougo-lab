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
  const [triangleMode, setTriangleMode] = useState<'free' | 'isosceles' | 'equilateral'>('free');
  
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
        if (triangleMode === 'equilateral') {
          // 正三角形
          const sideLength = 100;
          const height = (Math.sqrt(3) / 2) * sideLength;
          setShape({
            type,
            vertices: [
              { x: centerX, y: centerY - height / 2 },
              { x: centerX + sideLength / 2, y: centerY + height / 2 },
              { x: centerX - sideLength / 2, y: centerY + height / 2 },
            ],
          });
        } else if (triangleMode === 'isosceles') {
          // 二等辺三角形
          setShape({
            type,
            vertices: [
              { x: centerX, y: centerY - 60 },
              { x: centerX + 50, y: centerY + 40 },
              { x: centerX - 50, y: centerY + 40 },
            ],
          });
        } else {
          // 自由モード
          setShape({
            type,
            vertices: [
              { x: centerX, y: centerY - 60 },
              { x: centerX + 60, y: centerY + 40 },
              { x: centerX - 60, y: centerY + 40 },
            ],
          });
        }
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
  
  // 面積の計算（Shoelace formula使用）
  const calculateArea = (): number => {
    const { vertices } = shape;
    
    // Shoelace formula（ガウスの面積公式）
    let area = 0;
    const n = vertices.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += vertices[i].x * vertices[j].y;
      area -= vertices[j].x * vertices[i].y;
    }
    
    area = Math.abs(area) / 2;
    return area / 400; // 20px = 1cm, 400 = 20²
  };
  
  // 図形の辺の長さを計算
  const getDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) / 20;
  };

  // 面積の公式を取得
  const getFormula = (): string => {
    const { type, vertices } = shape;
    
    switch (type) {
      case 'square': {
        // すべての辺の長さを計算して平均を取る（正方形なのでほぼ同じはず）
        const sides = [
          getDistance(vertices[0], vertices[1]),
          getDistance(vertices[1], vertices[2]),
          getDistance(vertices[2], vertices[3]),
          getDistance(vertices[3], vertices[0])
        ];
        const avgSide = sides.reduce((a, b) => a + b) / sides.length;
        return `一辺 × 一辺 = ${avgSide.toFixed(1)} × ${avgSide.toFixed(1)}`;
      }
      case 'rectangle': {
        // 隣接する2辺の長さを取得
        const width = getDistance(vertices[0], vertices[1]);
        const height = getDistance(vertices[1], vertices[2]);
        return `たて × よこ = ${height.toFixed(1)} × ${width.toFixed(1)}`;
      }
      case 'triangle': {
        const area = calculateArea();
        const sides = [
          getDistance(vertices[0], vertices[1]),
          getDistance(vertices[1], vertices[2]),
          getDistance(vertices[2], vertices[0])
        ];
        
        if (triangleMode === 'isosceles') {
          // 二等辺三角形の公式表示
          const base = getDistance(vertices[1], vertices[2]);
          
          // 底辺の中点
          const midX = (vertices[1].x + vertices[2].x) / 2;
          const midY = (vertices[1].y + vertices[2].y) / 2;
          
          // 頂点から底辺の中点までの距離（高さ）
          const height = Math.sqrt(
            Math.pow(vertices[0].x - midX, 2) + 
            Math.pow(vertices[0].y - midY, 2)
          ) / 20;
          
          return `底辺 × 高さ ÷ 2 = ${base.toFixed(1)} × ${height.toFixed(1)} ÷ 2`;
        } else if (triangleMode === 'equilateral') {
          // 正三角形の公式表示
          const side = sides[0]; // すべての辺が等しい
          return `(√3 ÷ 4) × 一辺² = (√3 ÷ 4) × ${side.toFixed(1)}²`;
        } else {
          // 自由モード
          return `面積 = ${area.toFixed(1)} cm²`;
        }
      }
      case 'parallelogram': {
        // 底辺と高さを計算
        const base = getDistance(vertices[0], vertices[1]);
        const v1 = { x: vertices[1].x - vertices[0].x, y: vertices[1].y - vertices[0].y };
        const v2 = { x: vertices[3].x - vertices[0].x, y: vertices[3].y - vertices[0].y };
        const crossProduct = Math.abs(v1.x * v2.y - v1.y * v2.x);
        const baseLength = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const height = crossProduct / baseLength / 20;
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
      // 対角の頂点を固定点として正方形を維持（軸に平行）
      const oppositeIndex = (draggedVertex + 2) % 4;
      const oppositeVertex = shape.vertices[oppositeIndex];
      
      // 正方形の中心点
      const centerX = (x + oppositeVertex.x) / 2;
      const centerY = (y + oppositeVertex.y) / 2;
      
      // マウス位置から中心までの距離（対角線の半分）
      const dx = x - centerX;
      const dy = y - centerY;
      
      // 正方形の一辺の長さ（対角線から計算）
      const halfSide = Math.max(Math.abs(dx), Math.abs(dy));
      
      // 各頂点の位置を中心から計算（軸に平行な正方形）
      if (draggedVertex === 0) {
        // 左上
        newVertices[0] = { x: centerX - halfSide, y: centerY - halfSide };
        newVertices[1] = { x: centerX + halfSide, y: centerY - halfSide };
        newVertices[2] = { x: centerX + halfSide, y: centerY + halfSide };
        newVertices[3] = { x: centerX - halfSide, y: centerY + halfSide };
      } else if (draggedVertex === 1) {
        // 右上
        newVertices[0] = { x: centerX - halfSide, y: centerY - halfSide };
        newVertices[1] = { x: centerX + halfSide, y: centerY - halfSide };
        newVertices[2] = { x: centerX + halfSide, y: centerY + halfSide };
        newVertices[3] = { x: centerX - halfSide, y: centerY + halfSide };
      } else if (draggedVertex === 2) {
        // 右下
        newVertices[0] = { x: centerX - halfSide, y: centerY - halfSide };
        newVertices[1] = { x: centerX + halfSide, y: centerY - halfSide };
        newVertices[2] = { x: centerX + halfSide, y: centerY + halfSide };
        newVertices[3] = { x: centerX - halfSide, y: centerY + halfSide };
      } else if (draggedVertex === 3) {
        // 左下
        newVertices[0] = { x: centerX - halfSide, y: centerY - halfSide };
        newVertices[1] = { x: centerX + halfSide, y: centerY - halfSide };
        newVertices[2] = { x: centerX + halfSide, y: centerY + halfSide };
        newVertices[3] = { x: centerX - halfSide, y: centerY + halfSide };
      }
    } else if (shape.type === 'rectangle' && draggedVertex < 4) {
      // 長方形の頂点を調整
      const opposite = (draggedVertex + 2) % 4;
      const adj1 = (draggedVertex + 1) % 4;
      const adj2 = (draggedVertex + 3) % 4;
      
      newVertices[adj1] = { x: newVertices[draggedVertex].x, y: newVertices[opposite].y };
      newVertices[adj2] = { x: newVertices[opposite].x, y: newVertices[draggedVertex].y };
    } else if (shape.type === 'triangle') {
      // 三角形のモードに応じて制約を適用
      if (triangleMode === 'isosceles') {
        // 二等辺三角形: 頂点から底辺の両端までの距離が等しい
        if (draggedVertex === 0) {
          // 頂点（上）を動かす場合
          const base1 = shape.vertices[1];
          const base2 = shape.vertices[2];
          const midX = (base1.x + base2.x) / 2;
          
          // 頂点は底辺の中点の垂線上に制約
          newVertices[0] = { x: midX, y: y };
        } else if (draggedVertex === 1 || draggedVertex === 2) {
          // 底辺の端点を動かす場合
          const topVertex = shape.vertices[0];
          const otherBaseIndex = draggedVertex === 1 ? 2 : 1;
          const otherBase = shape.vertices[otherBaseIndex];
          
          // ドラッグした頂点を更新
          newVertices[draggedVertex] = { x, y };
          
          // 新しい底辺の中点
          const newMidX = (x + otherBase.x) / 2;
          const newMidY = (y + otherBase.y) / 2;
          
          // 底辺の長さ
          const baseLength = Math.sqrt(Math.pow(x - otherBase.x, 2) + Math.pow(y - otherBase.y, 2));
          
          // 元の高さを計算（頂点から底辺への垂直距離）
          const baseVector = { x: x - otherBase.x, y: y - otherBase.y };
          const baseUnitVector = {
            x: baseVector.x / baseLength,
            y: baseVector.y / baseLength
          };
          
          // 90度回転した垂直ベクトル
          const perpVector = { x: -baseUnitVector.y, y: baseUnitVector.x };
          
          // 元の頂点が底辺のどちら側にあるかを判定
          const oldMidX = (shape.vertices[1].x + shape.vertices[2].x) / 2;
          const oldMidY = (shape.vertices[1].y + shape.vertices[2].y) / 2;
          const vectorToTop = {
            x: topVertex.x - oldMidX,
            y: topVertex.y - oldMidY
          };
          
          // 新しい底辺の垂直ベクトルと元のベクトルの内積で向きを判定
          const dotProduct = perpVector.x * vectorToTop.x + perpVector.y * vectorToTop.y;
          const direction = dotProduct >= 0 ? 1 : -1;
          
          // 元の高さを計算
          const originalHeight = Math.sqrt(
            Math.pow(vectorToTop.x, 2) + Math.pow(vectorToTop.y, 2)
          );
          
          // 頂点を底辺の垂直二等分線上に配置（向きを保持）
          newVertices[0] = {
            x: newMidX + perpVector.x * originalHeight * direction,
            y: newMidY + perpVector.y * originalHeight * direction
          };
        }
      } else if (triangleMode === 'equilateral') {
        // 正三角形: すべての辺が等しい
        if (draggedVertex === 0) {
          // 頂点（上）を動かす場合
          const base1 = shape.vertices[1];
          const base2 = shape.vertices[2];
          const midX = (base1.x + base2.x) / 2;
          const midY = (base1.y + base2.y) / 2;
          
          // 底辺の長さ
          const baseLength = Math.sqrt(Math.pow(base2.x - base1.x, 2) + Math.pow(base2.y - base1.y, 2));
          
          // 正三角形の高さ = (√3/2) * 辺の長さ
          const height = (Math.sqrt(3) / 2) * baseLength;
          
          // 頂点は底辺の中点から垂直に高さ分離れた位置
          const baseAngle = Math.atan2(base2.y - base1.y, base2.x - base1.x);
          newVertices[0] = {
            x: midX - height * Math.sin(baseAngle),
            y: midY - height * Math.cos(baseAngle)
          };
        } else if (draggedVertex === 1 || draggedVertex === 2) {
          // 底辺の端点を動かす場合：新しい正三角形を構築
          const fixedIndex = draggedVertex === 1 ? 2 : 1;
          const fixedVertex = shape.vertices[fixedIndex];
          
          // 新しい辺の長さ
          const newSideLength = Math.sqrt(Math.pow(x - fixedVertex.x, 2) + Math.pow(y - fixedVertex.y, 2));
          
          // 新しい頂点位置を計算
          const angle = Math.atan2(y - fixedVertex.y, x - fixedVertex.x);
          
          // ドラッグした頂点
          newVertices[draggedVertex] = { x, y };
          
          // もう一つの頂点（60度回転）
          const thirdAngle = angle - Math.PI / 3;
          newVertices[0] = {
            x: fixedVertex.x + newSideLength * Math.cos(thirdAngle),
            y: fixedVertex.y + newSideLength * Math.sin(thirdAngle)
          };
        }
      }
      // else: 自由モード（制約なし）
    } else if (shape.type === 'parallelogram') {
      // 平行四辺形の性質を維持
      if (draggedVertex === 0) {
        // 左上をドラッグ
        const dx = x - shape.vertices[0].x;
        const dy = y - shape.vertices[0].y;
        newVertices[0] = { x, y };
        newVertices[3] = { x: shape.vertices[3].x + dx, y: shape.vertices[3].y + dy };
      } else if (draggedVertex === 1) {
        // 右上をドラッグ
        const dx = x - shape.vertices[1].x;
        const dy = y - shape.vertices[1].y;
        newVertices[1] = { x, y };
        newVertices[2] = { x: shape.vertices[2].x + dx, y: shape.vertices[2].y + dy };
      } else if (draggedVertex === 2) {
        // 右下をドラッグ
        const dx = x - shape.vertices[2].x;
        const dy = y - shape.vertices[2].y;
        newVertices[2] = { x, y };
        newVertices[1] = { x: shape.vertices[1].x + dx, y: shape.vertices[1].y + dy };
      } else if (draggedVertex === 3) {
        // 左下をドラッグ
        const dx = x - shape.vertices[3].x;
        const dy = y - shape.vertices[3].y;
        newVertices[3] = { x, y };
        newVertices[0] = { x: shape.vertices[0].x + dx, y: shape.vertices[0].y + dy };
      }
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
      if (newType !== 'triangle') {
        setTriangleMode('free'); // 三角形以外に変更したらモードをリセット
      }
      initializeShape(newType);
      setShowAnimation(false);
    }
  };
  
  // 三角形モードの変更
  const handleTriangleModeChange = (mode: 'free' | 'isosceles' | 'equilateral') => {
    setTriangleMode(mode);
    if (shapeType === 'triangle') {
      initializeShape('triangle');
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
              
              {/* 三角形モード選択 */}
              {shapeType === 'triangle' && (
                <Box sx={{ mb: 2 }}>
                  <ButtonGroup variant="outlined" size={isMobile ? 'small' : 'medium'}>
                    <Button
                      onClick={() => handleTriangleModeChange('free')}
                      variant={triangleMode === 'free' ? 'contained' : 'outlined'}
                    >
                      自由
                    </Button>
                    <Button
                      onClick={() => handleTriangleModeChange('isosceles')}
                      variant={triangleMode === 'isosceles' ? 'contained' : 'outlined'}
                    >
                      二等辺三角形
                    </Button>
                    <Button
                      onClick={() => handleTriangleModeChange('equilateral')}
                      variant={triangleMode === 'equilateral' ? 'contained' : 'outlined'}
                    >
                      正三角形
                    </Button>
                  </ButtonGroup>
                </Box>
              )}
              
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
                  
                  {/* 二等辺三角形の高さと等しい辺の表示 */}
                  {shape.type === 'triangle' && triangleMode === 'isosceles' && (
                    <>
                      {/* 高さの線 */}
                      <line
                        x1={(shape.vertices[1].x + shape.vertices[2].x) / 2}
                        y1={(shape.vertices[1].y + shape.vertices[2].y) / 2}
                        x2={shape.vertices[0].x}
                        y2={shape.vertices[0].y}
                        stroke={theme.palette.secondary.main}
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity={0.7}
                      />
                      <circle
                        cx={(shape.vertices[1].x + shape.vertices[2].x) / 2}
                        cy={(shape.vertices[1].y + shape.vertices[2].y) / 2}
                        r="3"
                        fill={theme.palette.secondary.main}
                        opacity={0.7}
                      />
                      
                      {/* 等しい辺にマーカー */}
                      <circle
                        cx={(shape.vertices[0].x + shape.vertices[1].x) / 2}
                        cy={(shape.vertices[0].y + shape.vertices[1].y) / 2}
                        r="4"
                        fill={theme.palette.info.main}
                        opacity={0.8}
                      />
                      <circle
                        cx={(shape.vertices[0].x + shape.vertices[2].x) / 2}
                        cy={(shape.vertices[0].y + shape.vertices[2].y) / 2}
                        r="4"
                        fill={theme.palette.info.main}
                        opacity={0.8}
                      />
                    </>
                  )}
                  
                  {/* 正三角形の等しい辺の表示 */}
                  {shape.type === 'triangle' && triangleMode === 'equilateral' && (
                    <>
                      {/* すべての辺にマーカー */}
                      <circle
                        cx={(shape.vertices[0].x + shape.vertices[1].x) / 2}
                        cy={(shape.vertices[0].y + shape.vertices[1].y) / 2}
                        r="4"
                        fill={theme.palette.info.main}
                        opacity={0.8}
                      />
                      <circle
                        cx={(shape.vertices[1].x + shape.vertices[2].x) / 2}
                        cy={(shape.vertices[1].y + shape.vertices[2].y) / 2}
                        r="4"
                        fill={theme.palette.info.main}
                        opacity={0.8}
                      />
                      <circle
                        cx={(shape.vertices[2].x + shape.vertices[0].x) / 2}
                        cy={(shape.vertices[2].y + shape.vertices[0].y) / 2}
                        r="4"
                        fill={theme.palette.info.main}
                        opacity={0.8}
                      />
                    </>
                  )}
                  
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
                
                {shape.type === 'triangle' && triangleMode === 'free' && (
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
                    if (shapeType === 'triangle') {
                      setTriangleMode('free');
                    }
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
              • 正方形と長方形は形を保ちながらサイズが変わります
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 平行四辺形は対辺が平行を保ちます
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 三角形は自由/二等辺/正三角形モードを選べます
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • グリッドの1マスは1cm×1cm（1cm²）です
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • チャレンジモードで、指定された面積の図形を作ってみよう！
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