import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Button,
  Container,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TimerIcon from '@mui/icons-material/Timer';
import StraightenIcon from '@mui/icons-material/Straighten';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DeleteIcon from '@mui/icons-material/Delete';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

// 実験エリアのスタイル
const ExperimentArea = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '400px',
  backgroundColor: '#f5f9ff',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    height: '300px',
  },
}));

// 振り子の糸のスタイル
const PendulumString = styled('line')({
  stroke: '#666',
  strokeWidth: 2,
});

// 振り子のおもりのスタイル
const PendulumBob = styled('circle')<{ weight: number }>(({ weight }) => ({
  fill: weight < 30 ? '#2196f3' : weight < 60 ? '#ff9800' : '#f44336',
  stroke: '#333',
  strokeWidth: 2,
}));

// 角度インジケーターのスタイル
const AngleIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  border: '1px solid #e0e0e0',
}));

interface ExperimentData {
  id: number;
  length: number;
  weight: number;
  angle: number;
  period: number;
  oscillations: number;
}

interface PendulumExperimentProps {
  onClose?: () => void;
}

// 振り子実験シミュレーター（内部コンポーネント）
const PendulumExperimentContent: React.FC<PendulumExperimentProps> = ({ onClose }) => {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const oscillationCountRef = useRef<number>(0);
  const lastAngleRef = useRef<number>(0);
  
  const [length, setLength] = useState(50); // cm
  const [weight, setWeight] = useState(50); // g
  const [initialAngle, setInitialAngle] = useState(30); // degrees
  const [currentAngle, setCurrentAngle] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [oscillationCount, setOscillationCount] = useState(0);
  const [experimentData, setExperimentData] = useState<ExperimentData[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  
  // 振り子の周期の理論値計算（単振り子の式）
  const calculateTheoreticalPeriod = (lengthCm: number): number => {
    const lengthM = lengthCm / 100;
    const g = 9.8; // 重力加速度
    return 2 * Math.PI * Math.sqrt(lengthM / g);
  };
  
  // 振り子の角度計算
  const calculateAngle = (time: number): number => {
    const period = calculateTheoreticalPeriod(length);
    const omega = (2 * Math.PI) / period;
    const damping = 0.995; // 減衰係数
    const dampingFactor = Math.pow(damping, time);
    return initialAngle * dampingFactor * Math.cos(omega * time);
  };
  
  // アニメーション処理
  const animate = () => {
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    
    const angle = calculateAngle(elapsed);
    setCurrentAngle(angle);
    setElapsedTime(elapsed);
    
    // 振動回数のカウント
    if (lastAngleRef.current * angle < 0 && lastAngleRef.current < 0) {
      oscillationCountRef.current += 1;
      setOscillationCount(oscillationCountRef.current);
    }
    lastAngleRef.current = angle;
    
    // 10往復で自動停止
    if (oscillationCountRef.current >= 10) {
      handleStop();
      return;
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // 実験の開始
  const handleStart = () => {
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    oscillationCountRef.current = 0;
    lastAngleRef.current = initialAngle;
    setOscillationCount(0);
    setElapsedTime(0);
    animate();
  };
  
  // 実験の停止と記録
  const handleStop = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // 10往復の時間から周期を計算
    if (oscillationCount === 10) {
      const period = elapsedTime / 10;
      const theoretical = calculateTheoreticalPeriod(length);
      const error = Math.abs((period - theoretical) / theoretical * 100);
      
      const newData: ExperimentData = {
        id: Date.now(),
        length,
        weight,
        angle: initialAngle,
        period,
        oscillations: 10,
      };
      setExperimentData([...experimentData, newData]);
      
      // 実験完了を学習履歴に記録
      recordAnswer(true, {
        problem: '振り子実験の完了',
        userAnswer: `長さ${length}cm、重さ${weight}g、角度${initialAngle}°での周期測定`,
        correctAnswer: '振り子の周期を正確に測定',
        experimentResults: {
          length: length,
          weight: weight,
          angle: initialAngle,
          measuredPeriod: period,
          theoreticalPeriod: theoretical,
          error: error,
          totalTime: elapsedTime
        },
        accuracy: error < 5 ? 'high' : error < 10 ? 'medium' : 'low'
      });
    }
  };
  
  // リセット
  const handleReset = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCurrentAngle(initialAngle);
    setElapsedTime(0);
    setOscillationCount(0);
    oscillationCountRef.current = 0;
  };
  
  // 実験データの削除
  const deleteExperimentData = (id: number) => {
    setExperimentData(experimentData.filter(data => data.id !== id));
  };
  
  // グラフ用データの準備
  const getGraphData = () => {
    return experimentData.map(data => ({
      length: data.length,
      period: data.period,
      theoretical: calculateTheoreticalPeriod(data.length),
    }));
  };
  
  // 振り子の座標計算
  const pendulumX = 200 + length * 2 * Math.sin(currentAngle * Math.PI / 180);
  const pendulumY = 50 + length * 2 * Math.cos(currentAngle * Math.PI / 180);
  
  return (
    <Container maxWidth="lg">
      <Card sx={{ backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              振り子の実験装置
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              振り子の長さと重さを変えて、周期の変化を調べよう！
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ExperimentArea elevation={3}>
                <svg width="100%" height="100%" viewBox="0 0 400 400">
                  {/* 支点 */}
                  <circle cx="200" cy="50" r="5" fill="#333" />
                  
                  {/* 振り子の糸 */}
                  <PendulumString
                    x1="200"
                    y1="50"
                    x2={pendulumX}
                    y2={pendulumY}
                  />
                  
                  {/* おもり */}
                  <PendulumBob
                    cx={pendulumX}
                    cy={pendulumY}
                    r={10 + weight / 10}
                    weight={weight}
                  />
                  
                  {/* 振れ幅の目安線 */}
                  <line
                    x1="200"
                    y1="50"
                    x2="200"
                    y2="350"
                    stroke="#ccc"
                    strokeDasharray="5,5"
                  />
                </svg>
                
                {/* 角度表示 */}
                <AngleIndicator>
                  <Typography variant="body2">
                    角度: {Math.abs(currentAngle).toFixed(1)}°
                  </Typography>
                </AngleIndicator>
                
                {/* タイマー表示 */}
                {(isPlaying || elapsedTime > 0) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      padding: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">
                      経過時間: {elapsedTime.toFixed(2)}秒
                    </Typography>
                    <Typography variant="body2">
                      往復回数: {oscillationCount}/10
                    </Typography>
                  </Box>
                )}
              </ExperimentArea>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  onClick={() => {
                    if (isPlaying) {
                      handleStop();
                    } else {
                      handleStart();
                    }
                    recordInteraction('click');
                    
                    // 実験開始/停止を記録
                    recordAnswer(true, {
                      problem: '振り子実験の実行',
                      userAnswer: isPlaying ? '実験停止' : '実験開始',
                      correctAnswer: '実験手順の理解',
                      action: isPlaying ? 'stop' : 'start',
                      conditions: {
                        length: length,
                        weight: weight,
                        initialAngle: initialAngle
                      }
                    });
                  }}
                  disabled={isPlaying && oscillationCount < 10}
                >
                  {isPlaying ? '測定中...' : '実験開始'}
                </Button>
                <IconButton onClick={() => {
                  handleReset();
                  recordInteraction('click');
                  
                  // リセット実行を記録
                  recordAnswer(true, {
                    problem: '振り子実験のリセット',
                    userAnswer: '実験を初期状態に戻す',
                    correctAnswer: '新しい実験の準備',
                    resetData: {
                      previousLength: length,
                      previousWeight: weight,
                      previousAngle: initialAngle,
                      experimentCount: experimentData.length
                    }
                  });
                }} color="default">
                  <RestartAltIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  実験条件の設定
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StraightenIcon />
                    振り子の長さ: {length} cm
                  </Typography>
                  <Slider
                    value={length}
                    onChange={(_, value) => {
                      const newLength = value as number;
                      setLength(newLength);
                      recordInteraction('drag');
                      
                      // 振り子の長さ変更を記録
                      recordAnswer(true, {
                        problem: '振り子の長さ調整',
                        userAnswer: `長さを${newLength}cmに設定`,
                        correctAnswer: '長さが周期に影響することを理解',
                        parameter: 'length',
                        value: newLength,
                        theoreticalPeriod: calculateTheoreticalPeriod(newLength)
                      });
                    }}
                    min={10}
                    max={100}
                    step={5}
                    marks
                    disabled={isPlaying}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FitnessCenterIcon />
                    おもりの重さ: {weight} g
                  </Typography>
                  <Slider
                    value={weight}
                    onChange={(_, value) => {
                      const newWeight = value as number;
                      setWeight(newWeight);
                      recordInteraction('drag');
                      
                      // おもりの重さ変更を記録
                      recordAnswer(true, {
                        problem: 'おもりの重さ調整',
                        userAnswer: `重さを${newWeight}gに設定`,
                        correctAnswer: '重さは周期に影響しないことを理解',
                        parameter: 'weight',
                        value: newWeight
                      });
                    }}
                    min={10}
                    max={100}
                    step={10}
                    marks
                    disabled={isPlaying}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>
                    初期角度: {initialAngle}°
                  </Typography>
                  <Slider
                    value={initialAngle}
                    onChange={(_, value) => {
                      const newAngle = value as number;
                      setInitialAngle(newAngle);
                      if (!isPlaying) setCurrentAngle(newAngle);
                      recordInteraction('drag');
                      
                      // 初期角度変更を記録
                      recordAnswer(true, {
                        problem: '初期角度の調整',
                        userAnswer: `初期角度を${newAngle}°に設定`,
                        correctAnswer: '初期角度が振り幅に影響することを理解',
                        parameter: 'initialAngle',
                        value: newAngle
                      });
                    }}
                    min={10}
                    max={45}
                    step={5}
                    marks
                    disabled={isPlaying}
                  />
                </Box>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    10往復の時間を測定して、1往復の周期を計算します
                  </Typography>
                </Alert>
              </Paper>
              
              <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  振り子の法則
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 周期は振り子の長さで決まります
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • おもりの重さは周期に影響しません
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 振れ幅が小さいとき、周期は一定です
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* 実験データテーブル */}
          {experimentData.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                実験結果
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>長さ (cm)</TableCell>
                      <TableCell>重さ (g)</TableCell>
                      <TableCell>角度 (°)</TableCell>
                      <TableCell>周期 (秒)</TableCell>
                      <TableCell>理論値 (秒)</TableCell>
                      <TableCell>誤差 (%)</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {experimentData.map((data) => {
                      const theoretical = calculateTheoreticalPeriod(data.length);
                      const error = Math.abs((data.period - theoretical) / theoretical * 100);
                      return (
                        <TableRow key={data.id}>
                          <TableCell>{data.length}</TableCell>
                          <TableCell>{data.weight}</TableCell>
                          <TableCell>{data.angle}</TableCell>
                          <TableCell>{data.period.toFixed(3)}</TableCell>
                          <TableCell>{theoretical.toFixed(3)}</TableCell>
                          <TableCell>{error.toFixed(1)}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => {
                                deleteExperimentData(data.id);
                                recordInteraction('click');
                                
                                // 実験データ削除を記録
                                recordAnswer(true, {
                                  problem: '実験データの削除',
                                  userAnswer: `長さ${data.length}cmのデータを削除`,
                                  correctAnswer: '不要なデータの整理',
                                  deletedData: {
                                    length: data.length,
                                    weight: data.weight,
                                    angle: data.angle,
                                    period: data.period
                                  }
                                });
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Button
                variant="outlined"
                onClick={() => {
                  setShowGraph(!showGraph);
                  recordInteraction('click');
                  
                  // グラフ表示切り替えを記録
                  recordAnswer(true, {
                    problem: '実験データのグラフ化',
                    userAnswer: showGraph ? 'グラフを非表示' : 'グラフを表示',
                    correctAnswer: 'データの視覚化の理解',
                    dataCount: experimentData.length,
                    showGraph: !showGraph
                  });
                }}
                sx={{ mt: 2 }}
              >
                {showGraph ? 'グラフを隠す' : 'グラフを表示'}
              </Button>
              
              {showGraph && experimentData.length > 1 && (
                <Box sx={{ mt: 2, height: 300 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    長さと周期の関係
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getGraphData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="length" label={{ value: '長さ (cm)', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: '周期 (秒)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="period" stroke="#8884d8" name="実験値" />
                      <Line type="monotone" dataKey="theoretical" stroke="#82ca9d" name="理論値" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

// 振り子実験シミュレーター（MaterialWrapperでラップ）
const PendulumExperiment: React.FC<PendulumExperimentProps> = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="pendulum-experiment"
      materialName="振り子実験シミュレーター"
      showMetricsButton={true}
      showAssistant={true}
    >
      <PendulumExperimentContent onClose={onClose} />
    </MaterialWrapper>
  );
};

export default PendulumExperiment;