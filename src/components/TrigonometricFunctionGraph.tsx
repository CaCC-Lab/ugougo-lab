import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Slider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

interface FunctionData {
  id: string;
  type: 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan';
  A: number; // 振幅
  B: number; // 周期係数
  C: number; // 位相
  D: number; // 縦方向のシフト
  color: string;
  visible: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface TrigonometricFunctionGraphProps {
  onClose?: () => void;
}

// 三角関数グラフツール（内部コンポーネント）
const TrigonometricFunctionGraphContent: React.FC<TrigonometricFunctionGraphProps> = ({ onClose }) => {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unitCircleCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // 関数リスト
  const [functions, setFunctions] = useState<FunctionData[]>([
    {
      id: '1',
      type: 'sin',
      A: 1,
      B: 1,
      C: 0,
      D: 0,
      color: '#2196f3',
      visible: true,
    },
  ]);
  
  // 設定
  const [angleMode, setAngleMode] = useState<'degree' | 'radian'>('radian');
  const [showUnitCircle, setShowUnitCircle] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [animationAngle, setAnimationAngle] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [clickedPoint, setClickedPoint] = useState<Point | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [xScale, setXScale] = useState<number>(1);
  const [yScale, setYScale] = useState<number>(1);
  
  // グラフ設定
  const canvasWidth = 600;
  const canvasHeight = 400;
  const unitCircleSize = 200;
  const padding = 40;
  
  // 色の選択肢
  const colors = ['#2196f3', '#f50057', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];
  
  // 角度変換
  const toRadian = (degree: number) => (degree * Math.PI) / 180;
  const toDegree = (radian: number) => (radian * 180) / Math.PI;
  
  // 関数の計算
  const calculateFunction = (func: FunctionData, x: number): number => {
    const angle = angleMode === 'degree' ? toRadian(x) : x;
    const adjustedAngle = func.B * angle + func.C;
    
    switch (func.type) {
      case 'sin':
        return func.A * Math.sin(adjustedAngle) + func.D;
      case 'cos':
        return func.A * Math.cos(adjustedAngle) + func.D;
      case 'tan':
        return func.A * Math.tan(adjustedAngle) + func.D;
      case 'asin':
        const asinInput = (x - func.C) / func.B;
        if (Math.abs(asinInput) <= 1) {
          return func.A * Math.asin(asinInput) + func.D;
        }
        return NaN;
      case 'acos':
        const acosInput = (x - func.C) / func.B;
        if (Math.abs(acosInput) <= 1) {
          return func.A * Math.acos(acosInput) + func.D;
        }
        return NaN;
      case 'atan':
        return func.A * Math.atan(func.B * x + func.C) + func.D;
      default:
        return 0;
    }
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
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // グリッド
    if (showGrid) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      
      // 縦線
      const xStep = angleMode === 'degree' ? 90 : Math.PI / 2;
      for (let x = -4 * Math.PI; x <= 4 * Math.PI; x += xStep) {
        const canvasX = centerX + x * 40 * xScale;
        ctx.beginPath();
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, canvasHeight);
        ctx.stroke();
      }
      
      // 横線
      for (let y = -3; y <= 3; y += 0.5) {
        const canvasY = centerY - y * 80 * yScale;
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(canvasWidth, canvasY);
        ctx.stroke();
      }
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
    
    // x軸の目盛り
    const xLabels = angleMode === 'degree' ? 
      [-360, -270, -180, -90, 0, 90, 180, 270, 360] :
      [-2 * Math.PI, -Math.PI, 0, Math.PI, 2 * Math.PI];
    
    xLabels.forEach(val => {
      const x = centerX + val * (angleMode === 'degree' ? 40 / 90 : 40) * xScale;
      if (x >= 0 && x <= canvasWidth) {
        const label = angleMode === 'degree' ? 
          `${val}°` : 
          val === 0 ? '0' : 
          val === Math.PI ? 'π' : 
          val === -Math.PI ? '-π' :
          val === 2 * Math.PI ? '2π' :
          val === -2 * Math.PI ? '-2π' : val.toFixed(2);
        ctx.fillText(label, x, centerY + 5);
      }
    });
    
    // y軸の目盛り
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = -2; y <= 2; y += 0.5) {
      if (y !== 0) {
        const canvasY = centerY - y * 80 * yScale;
        ctx.fillText(y.toString(), centerX - 5, canvasY);
      }
    }
    
    // 関数のグラフ
    functions.forEach(func => {
      if (!func.visible) return;
      
      ctx.strokeStyle = func.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let firstPoint = true;
      const xMin = -canvasWidth / (2 * 40 * xScale);
      const xMax = canvasWidth / (2 * 40 * xScale);
      const step = angleMode === 'degree' ? 1 : 0.01;
      
      for (let x = xMin; x <= xMax; x += step) {
        const y = calculateFunction(func, x);
        if (!isNaN(y) && isFinite(y)) {
          const canvasX = centerX + x * (angleMode === 'degree' ? 40 / 90 : 40) * xScale;
          const canvasY = centerY - y * 80 * yScale;
          
          if (canvasY >= -100 && canvasY <= canvasHeight + 100) {
            if (firstPoint) {
              ctx.moveTo(canvasX, canvasY);
              firstPoint = false;
            } else {
              ctx.lineTo(canvasX, canvasY);
            }
          } else {
            firstPoint = true;
          }
        } else {
          firstPoint = true;
        }
      }
      ctx.stroke();
    });
    
    // クリックした点
    if (clickedPoint) {
      ctx.fillStyle = '#ff5722';
      ctx.beginPath();
      ctx.arc(
        centerX + clickedPoint.x * (angleMode === 'degree' ? 40 / 90 : 40) * xScale,
        centerY - clickedPoint.y * 80 * yScale,
        5,
        0,
        2 * Math.PI
      );
      ctx.fill();
      
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.fillText(
        `(${clickedPoint.x.toFixed(2)}, ${clickedPoint.y.toFixed(2)})`,
        centerX + clickedPoint.x * (angleMode === 'degree' ? 40 / 90 : 40) * xScale + 10,
        centerY - clickedPoint.y * 80 * yScale - 10
      );
    }
  };
  
  // 単位円の描画
  const drawUnitCircle = () => {
    const canvas = unitCircleCanvasRef.current;
    if (!canvas || !showUnitCircle) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, unitCircleSize, unitCircleSize);
    
    const centerX = unitCircleSize / 2;
    const centerY = unitCircleSize / 2;
    const radius = 80;
    
    // 背景
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, unitCircleSize, unitCircleSize);
    
    // 軸
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(unitCircleSize, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, unitCircleSize);
    ctx.stroke();
    
    // 単位円
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // アニメーション角度での点
    const angle = isAnimating ? animationAngle : 0;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    
    // 半径線
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + x * radius, centerY - y * radius);
    ctx.stroke();
    
    // sin線
    ctx.strokeStyle = '#f50057';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX + x * radius, centerY);
    ctx.lineTo(centerX + x * radius, centerY - y * radius);
    ctx.stroke();
    
    // cos線
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + x * radius, centerY);
    ctx.stroke();
    
    // 点
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX + x * radius, centerY - y * radius, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // ラベル
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    const angleText = angleMode === 'degree' ? 
      `${Math.round(toDegree(angle))}°` : 
      `${angle.toFixed(2)}`;
    ctx.fillText(`θ = ${angleText}`, centerX, unitCircleSize - 10);
    ctx.fillText(`sin θ = ${y.toFixed(3)}`, centerX - 50, 20);
    ctx.fillText(`cos θ = ${x.toFixed(3)}`, centerX + 50, 20);
  };
  
  // グラフとアニメーションの更新
  useEffect(() => {
    drawGraph();
    drawUnitCircle();
  }, [functions, angleMode, showGrid, xScale, yScale, clickedPoint, showUnitCircle, animationAngle]);
  
  // アニメーション
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setAnimationAngle(prev => (prev + 0.05) % (2 * Math.PI));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);
  
  // キャンバスクリックハンドラ
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    const x = (canvasX - centerX) / ((angleMode === 'degree' ? 40 / 90 : 40) * xScale);
    const y = -(canvasY - centerY) / (80 * yScale);
    
    setClickedPoint({ x, y });
    recordInteraction('click');
    
    // グラフ上の点クリックを記録
    recordAnswer(true, {
      problem: 'グラフ上の座標確認',
      userAnswer: `点(${x.toFixed(2)}, ${y.toFixed(2)})をクリック`,
      correctAnswer: '三角関数の値の確認',
      clickedPoint: { x, y },
      angleMode: angleMode
    });
  };
  
  // 関数の追加
  const addFunction = () => {
    const newFunc: FunctionData = {
      id: Date.now().toString(),
      type: 'sin',
      A: 1,
      B: 1,
      C: 0,
      D: 0,
      color: colors[functions.length % colors.length],
      visible: true,
    };
    setFunctions([...functions, newFunc]);
  };
  
  // 関数の削除
  const removeFunction = (id: string) => {
    if (functions.length > 1) {
      setFunctions(functions.filter(f => f.id !== id));
    }
  };
  
  // 関数の更新
  const updateFunction = (id: string, updates: Partial<FunctionData>) => {
    setFunctions(functions.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };
  
  // リセット
  const handleReset = () => {
    setFunctions([{
      id: '1',
      type: 'sin',
      A: 1,
      B: 1,
      C: 0,
      D: 0,
      color: '#2196f3',
      visible: true,
    }]);
    setAnimationAngle(0);
    setIsAnimating(false);
    setClickedPoint(null);
    setXScale(1);
    setYScale(1);
  };
  
  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          三角関数グラフ描画ツール
        </Typography>
        <Tooltip title="使い方">
          <IconButton onClick={() => {
            setShowExplanation(!showExplanation);
            recordInteraction('click');
            
            // ヘルプ表示切り替えを記録
            recordAnswer(true, {
              problem: 'ヘルプ情報の確認',
              userAnswer: showExplanation ? 'ヘルプを非表示' : 'ヘルプを表示',
              correctAnswer: '使い方の理解'
            });
          }}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {showExplanation && (
        <Alert severity="info" sx={{ mb: 3 }}>
          三角関数のグラフを自在に描画できます。振幅・周期・位相を調整し、
          複数の関数を重ねて比較できます。単位円との対応をアニメーションで確認しましょう。
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* 左側：コントロール */}
        <Box sx={{ flex: '0 0 350px', minWidth: 300 }}>
          {/* 角度モード */}
          <ToggleButtonGroup
            value={angleMode}
            exclusive
            onChange={(_, value) => {
              if (value) {
                setAngleMode(value);
                recordInteraction('click');
                
                // 角度モード切り替えを記録
                recordAnswer(true, {
                  problem: '角度モードの切り替え',
                  userAnswer: value === 'degree' ? '度数法を選択' : '弧度法を選択',
                  correctAnswer: '角度表現の理解',
                  angleMode: value
                });
              }
            }}
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="degree">度数法</ToggleButton>
            <ToggleButton value="radian">弧度法</ToggleButton>
          </ToggleButtonGroup>

          {/* 関数リスト */}
          <Typography variant="subtitle2" gutterBottom>
            関数一覧
          </Typography>
          {functions.map((func, index) => (
            <Paper key={func.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FormControl size="small" sx={{ minWidth: 80, mr: 1 }}>
                  <Select
                    value={func.type}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      updateFunction(func.id, { type: newType });
                      recordInteraction('click');
                      
                      // 関数タイプ変更を記録
                      recordAnswer(true, {
                        problem: '三角関数の選択',
                        userAnswer: `${func.type}から${newType}へ変更`,
                        correctAnswer: '異なる三角関数のグラフの特徴を理解',
                        functionType: newType,
                        functionId: func.id
                      });
                    }}
                  >
                    <MenuItem value="sin">sin</MenuItem>
                    <MenuItem value="cos">cos</MenuItem>
                    <MenuItem value="tan">tan</MenuItem>
                    <MenuItem value="asin">arcsin</MenuItem>
                    <MenuItem value="acos">arccos</MenuItem>
                    <MenuItem value="atan">arctan</MenuItem>
                  </Select>
                </FormControl>
                
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    bgcolor: func.color,
                    borderRadius: 1,
                    mr: 1,
                  }}
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={func.visible}
                      onChange={(e) => {
                        const visible = e.target.checked;
                        updateFunction(func.id, { visible });
                        recordInteraction('click');
                        
                        // 関数表示切り替えを記録
                        recordAnswer(true, {
                          problem: '関数の表示切り替え',
                          userAnswer: visible ? '関数を表示' : '関数を非表示',
                          correctAnswer: '複数関数の比較観察の理解',
                          functionType: func.type,
                          functionId: func.id,
                          visible: visible
                        });
                      }}
                      size="small"
                    />
                  }
                  label="表示"
                />
                
                {functions.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      removeFunction(func.id);
                      recordInteraction('click');
                      
                      // 関数削除を記録
                      recordAnswer(true, {
                        problem: '関数の削除',
                        userAnswer: `${func.type}関数を削除`,
                        correctAnswer: '不要な関数の削除',
                        removedFunction: func.type,
                        functionId: func.id
                      });
                    }}
                    sx={{ ml: 'auto' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              
              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                y = {func.A} × {func.type}({func.B}x {func.C >= 0 ? '+' : ''} {func.C}) {func.D >= 0 ? '+' : ''} {func.D}
              </Typography>
              
              <Box sx={{ px: 1 }}>
                <Typography variant="caption">振幅 A = {func.A.toFixed(1)}</Typography>
                <Slider
                  value={func.A}
                  onChange={(_, value) => {
                    const newA = value as number;
                    updateFunction(func.id, { A: newA });
                    recordInteraction('drag');
                    
                    // 振幅変更を記録
                    recordAnswer(true, {
                      problem: '振幅Aの調整',
                      userAnswer: `振幅を${newA.toFixed(1)}に設定`,
                      correctAnswer: '振幅がグラフの縦の伸縮に影響',
                      functionType: func.type,
                      parameter: 'amplitude',
                      value: newA
                    });
                  }}
                  min={0}
                  max={3}
                  step={0.1}
                  size="small"
                />
                
                <Typography variant="caption">周期係数 B = {func.B.toFixed(1)}</Typography>
                <Slider
                  value={func.B}
                  onChange={(_, value) => {
                    const newB = value as number;
                    updateFunction(func.id, { B: newB });
                    recordInteraction('drag');
                    
                    // 周期係数変更を記録
                    recordAnswer(true, {
                      problem: '周期係数Bの調整',
                      userAnswer: `周期係数を${newB.toFixed(1)}に設定`,
                      correctAnswer: '周期係数がグラフの横の伸縮に影響',
                      functionType: func.type,
                      parameter: 'frequency',
                      value: newB,
                      period: 2 * Math.PI / newB
                    });
                  }}
                  min={0.1}
                  max={5}
                  step={0.1}
                  size="small"
                />
                
                <Typography variant="caption">位相 C = {func.C.toFixed(2)}</Typography>
                <Slider
                  value={func.C}
                  onChange={(_, value) => {
                    const newC = value as number;
                    updateFunction(func.id, { C: newC });
                    recordInteraction('drag');
                    
                    // 位相変更を記録
                    recordAnswer(true, {
                      problem: '位相Cの調整',
                      userAnswer: `位相を${newC.toFixed(2)}に設定`,
                      correctAnswer: '位相がグラフの横方向のシフトに影響',
                      functionType: func.type,
                      parameter: 'phase',
                      value: newC,
                      phaseShift: -newC / func.B
                    });
                  }}
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.1}
                  size="small"
                />
                
                <Typography variant="caption">縦シフト D = {func.D.toFixed(1)}</Typography>
                <Slider
                  value={func.D}
                  onChange={(_, value) => {
                    const newD = value as number;
                    updateFunction(func.id, { D: newD });
                    recordInteraction('drag');
                    
                    // 縦シフト変更を記録
                    recordAnswer(true, {
                      problem: '縦シフトDの調整',
                      userAnswer: `縦シフトを${newD.toFixed(1)}に設定`,
                      correctAnswer: '縦シフトがグラフの上下移動に影響',
                      functionType: func.type,
                      parameter: 'verticalShift',
                      value: newD
                    });
                  }}
                  min={-2}
                  max={2}
                  step={0.1}
                  size="small"
                />
              </Box>
            </Paper>
          ))}
          
          {functions.length < 6 && (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => {
                addFunction();
                recordInteraction('click');
                
                // 関数追加を記録
                recordAnswer(true, {
                  problem: '新しい関数の追加',
                  userAnswer: '複数の三角関数を比較',
                  correctAnswer: '関数の比較観察の理解',
                  totalFunctions: functions.length + 1
                });
              }}
              sx={{ mb: 2 }}
            >
              関数を追加
            </Button>
          )}

          {/* 表示設定 */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              表示設定
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showGrid}
                  onChange={(e) => {
                    const showGrid = e.target.checked;
                    setShowGrid(showGrid);
                    recordInteraction('click');
                    
                    // グリッド表示切り替えを記録
                    recordAnswer(true, {
                      problem: 'グリッド表示の切り替え',
                      userAnswer: showGrid ? 'グリッドを表示' : 'グリッドを非表示',
                      correctAnswer: '読みやすさの調整',
                      showGrid: showGrid
                    });
                  }}
                />
              }
              label="グリッドを表示"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showUnitCircle}
                  onChange={(e) => {
                    const showUnitCircle = e.target.checked;
                    setShowUnitCircle(showUnitCircle);
                    recordInteraction('click');
                    
                    // 単位円表示切り替えを記録
                    recordAnswer(true, {
                      problem: '単位円表示の切り替え',
                      userAnswer: showUnitCircle ? '単位円を表示' : '単位円を非表示',
                      correctAnswer: '単位円とグラフの対応関係の理解',
                      showUnitCircle: showUnitCircle
                    });
                  }}
                />
              }
              label="単位円を表示"
            />
          </Paper>

          {/* スケール調整 */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              表示スケール
            </Typography>
            <Typography variant="caption">X軸: {xScale.toFixed(1)}倍</Typography>
            <Slider
              value={xScale}
              onChange={(_, value) => {
                const newScale = value as number;
                setXScale(newScale);
                recordInteraction('drag');
                
                // X軸スケール変更を記録
                recordAnswer(true, {
                  problem: 'X軸スケールの調整',
                  userAnswer: `X軸を${newScale.toFixed(1)}倍に設定`,
                  correctAnswer: '表示範囲の理解',
                  scale: newScale,
                  axis: 'x'
                });
              }}
              min={0.5}
              max={3}
              step={0.1}
              size="small"
            />
            <Typography variant="caption">Y軸: {yScale.toFixed(1)}倍</Typography>
            <Slider
              value={yScale}
              onChange={(_, value) => {
                const newScale = value as number;
                setYScale(newScale);
                recordInteraction('drag');
                
                // Y軸スケール変更を記録
                recordAnswer(true, {
                  problem: 'Y軸スケールの調整',
                  userAnswer: `Y軸を${newScale.toFixed(1)}倍に設定`,
                  correctAnswer: '表示範囲の理解',
                  scale: newScale,
                  axis: 'y'
                });
              }}
              min={0.5}
              max={3}
              step={0.1}
              size="small"
            />
          </Paper>
        </Box>

        {/* 右側：グラフと単位円 */}
        <Box sx={{ flex: '1 1 400px' }}>
          {/* グラフ */}
          <Paper sx={{ p: 2, mb: 2 }}>
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

          {/* 単位円とコントロール */}
          {showUnitCircle && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Paper sx={{ p: 2 }}>
                <canvas
                  ref={unitCircleCanvasRef}
                  width={unitCircleSize}
                  height={unitCircleSize}
                  style={{
                    width: unitCircleSize,
                    height: unitCircleSize,
                  }}
                />
              </Paper>
              
              <Box sx={{ flex: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setIsAnimating(!isAnimating);
                    recordInteraction('click');
                    
                    // アニメーション切り替えを記録
                    recordAnswer(true, {
                      problem: '単位円アニメーションの制御',
                      userAnswer: isAnimating ? 'アニメーション停止' : 'アニメーション開始',
                      correctAnswer: '単位円とグラフの対応関係の理解',
                      isAnimating: !isAnimating
                    });
                  }}
                  startIcon={isAnimating ? <PauseIcon /> : <PlayArrowIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {isAnimating ? '停止' : 'アニメーション'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => {
                    handleReset();
                    recordInteraction('click');
                    
                    // リセット実行を記録
                    recordAnswer(true, {
                      problem: '三角関数グラフのリセット',
                      userAnswer: '全ての設定を初期化',
                      correctAnswer: '基本状態への復帰',
                      resetParameters: {
                        functionsCount: functions.length,
                        xScale,
                        yScale
                      }
                    });
                  }}
                  startIcon={<RefreshIcon />}
                  fullWidth
                >
                  リセット
                </Button>
                
                {/* 三角関数の値 */}
                <Paper sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    特殊角の値
                  </Typography>
                  <Typography variant="caption" component="div">
                    sin(30°) = 1/2
                  </Typography>
                  <Typography variant="caption" component="div">
                    cos(60°) = 1/2
                  </Typography>
                  <Typography variant="caption" component="div">
                    tan(45°) = 1
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}

          {/* 情報チップ */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="周期 = 2π/B"
              color="primary"
              size="small"
            />
            <Chip
              label="振幅 = |A|"
              color="secondary"
              size="small"
            />
            <Chip
              label="位相シフト = -C/B"
              size="small"
            />
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

// 三角関数グラフ描画ツール（MaterialWrapperでラップ）
const TrigonometricFunctionGraph: React.FC<TrigonometricFunctionGraphProps> = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="trigonometric-function-graph"
      materialName="三角関数グラフ描画ツール"
      showMetricsButton={true}
      showAssistant={true}
    >
      <TrigonometricFunctionGraphContent onClose={onClose} />
    </MaterialWrapper>
  );
};

export default TrigonometricFunctionGraph;