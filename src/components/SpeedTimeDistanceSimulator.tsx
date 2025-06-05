import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Chip,
  Alert,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TimelineIcon from '@mui/icons-material/Timeline';
import SpeedIcon from '@mui/icons-material/Speed';

// アニメーションエリアのスタイル
const AnimationArea = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '200px',
  backgroundColor: '#e3f2fd',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  marginBottom: theme.spacing(2),
}));

// 道路のスタイル
const Road = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '60px',
  backgroundColor: '#424242',
  borderTop: '3px solid #ffd54f',
  borderBottom: '3px solid #ffd54f',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: '4px',
    background: 'repeating-linear-gradient(90deg, #fff 0, #fff 20px, transparent 20px, transparent 40px)',
    transform: 'translateY(-50%)',
  },
}));

// 移動体のスタイル
const Vehicle = styled(Box)<{ type: string }>(({ type }) => ({
  position: 'absolute',
  bottom: '70px',
  fontSize: '40px',
  transition: 'left 0.1s linear',
}));

// グラフエリアのスタイル
const GraphArea = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '300px',
  backgroundColor: '#fafafa',
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
}));

interface SpeedTimeDistanceSimulatorProps {
  onClose?: () => void;
}

const SpeedTimeDistanceSimulator: React.FC<SpeedTimeDistanceSimulatorProps> = ({ onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  
  const [mode, setMode] = useState<'basic' | 'chase'>('basic');
  const [vehicleType, setVehicleType] = useState<'car' | 'bike' | 'walk'>('car');
  const [speed, setSpeed] = useState(60); // km/h
  const [time, setTime] = useState(2); // hours
  const [distance, setDistance] = useState(120); // km
  const [calculation, setCalculation] = useState<'distance' | 'time' | 'speed'>('distance');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [graphData, setGraphData] = useState<{ time: number; distance: number }[]>([]);
  
  // 追いつき問題用の状態
  const [vehicle1Speed, setVehicle1Speed] = useState(60);
  const [vehicle2Speed, setVehicle2Speed] = useState(80);
  const [vehicle2Delay, setVehicle2Delay] = useState(0.5); // hours
  const [vehicle1Position, setVehicle1Position] = useState(0);
  const [vehicle2Position, setVehicle2Position] = useState(0);
  
  // 単位変換
  const speedUnits = [
    { value: 'kmh', label: 'km/h' },
    { value: 'ms', label: 'm/s' },
    { value: 'mph', label: 'mph' },
  ];
  const [speedUnit, setSpeedUnit] = useState('kmh');
  
  // 速度の単位変換
  const convertSpeed = (value: number, from: string, to: string): number => {
    let kmh = value;
    if (from === 'ms') kmh = value * 3.6;
    if (from === 'mph') kmh = value * 1.60934;
    
    if (to === 'kmh') return kmh;
    if (to === 'ms') return kmh / 3.6;
    if (to === 'mph') return kmh / 1.60934;
    return kmh;
  };
  
  // 計算の実行
  const calculate = () => {
    switch (calculation) {
      case 'distance':
        setDistance(speed * time);
        break;
      case 'time':
        if (speed > 0) {
          setTime(distance / speed);
        }
        break;
      case 'speed':
        if (time > 0) {
          setSpeed(distance / time);
        }
        break;
    }
  };
  
  // アニメーションの開始/停止
  const toggleAnimation = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      setIsPlaying(true);
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      animate();
    }
  };
  
  // アニメーション処理
  const animate = () => {
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000 / 3600; // hours
    
    if (mode === 'basic') {
      const position = (speed * elapsed / distance) * 100;
      
      if (position >= 100) {
        setCurrentPosition(100);
        setElapsedTime(time);
        setIsPlaying(false);
        return;
      }
      
      setCurrentPosition(position);
      setElapsedTime(elapsed);
      
      // グラフデータの更新
      setGraphData(prev => [...prev, { time: elapsed, distance: speed * elapsed }]);
    } else {
      // 追いつき問題のアニメーション
      const pos1 = (vehicle1Speed * elapsed / 200) * 100;
      const pos2 = elapsed > vehicle2Delay ? 
        (vehicle2Speed * (elapsed - vehicle2Delay) / 200) * 100 : 0;
      
      setVehicle1Position(Math.min(pos1, 100));
      setVehicle2Position(Math.min(pos2, 100));
      setElapsedTime(elapsed);
      
      if (pos1 >= 100 && pos2 >= 100) {
        setIsPlaying(false);
        return;
      }
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // リセット
  const reset = () => {
    setIsPlaying(false);
    setElapsedTime(0);
    setCurrentPosition(0);
    setVehicle1Position(0);
    setVehicle2Position(0);
    setGraphData([]);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
  
  // 車両タイプごとのデフォルト速度
  const getDefaultSpeed = (type: string): number => {
    switch (type) {
      case 'walk': return 4;
      case 'bike': return 15;
      case 'car': return 60;
      default: return 60;
    }
  };
  
  // 車両タイプ変更時の処理
  const handleVehicleTypeChange = (type: 'car' | 'bike' | 'walk') => {
    setVehicleType(type);
    setSpeed(getDefaultSpeed(type));
    reset();
  };
  
  // グラフの描画
  const renderGraph = () => {
    const maxTime = mode === 'basic' ? time : 3;
    const maxDistance = mode === 'basic' ? distance : 200;
    
    return (
      <GraphArea>
        <Typography variant="subtitle2" gutterBottom>
          時間-距離グラフ
        </Typography>
        
        {/* Y軸 */}
        <Box
          sx={{
            position: 'absolute',
            left: 40,
            top: 40,
            bottom: 40,
            width: 2,
            backgroundColor: '#333',
          }}
        />
        
        {/* X軸 */}
        <Box
          sx={{
            position: 'absolute',
            left: 40,
            right: 20,
            bottom: 40,
            height: 2,
            backgroundColor: '#333',
          }}
        />
        
        {/* グラフの線 */}
        {mode === 'basic' && graphData.length > 1 && (
          <svg
            style={{
              position: 'absolute',
              left: 40,
              top: 40,
              right: 20,
              bottom: 40,
            }}
            width="calc(100% - 60px)"
            height="calc(100% - 80px)"
          >
            <polyline
              points={graphData.map((point, index) => 
                `${(point.time / maxTime) * 100}%,${100 - (point.distance / maxDistance) * 100}%`
              ).join(' ')}
              fill="none"
              stroke={theme.palette.primary.main}
              strokeWidth="2"
            />
          </svg>
        )}
        
        {/* 軸ラベル */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 15,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          時間 (h)
        </Typography>
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            left: 5,
            top: '50%',
            transform: 'rotate(-90deg) translateX(-50%)',
            transformOrigin: 'left center',
          }}
        >
          距離 (km)
        </Typography>
      </GraphArea>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <Card sx={{ backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              速さ・時間・距離の関係シミュレーター
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              速さ、時間、距離の関係を視覚的に理解しよう！
            </Typography>
          </Box>
          
          <Tabs value={mode} onChange={(_, v) => { setMode(v); reset(); }} sx={{ mb: 3 }}>
            <Tab label="基本学習" value="basic" />
            <Tab label="追いつき問題" value="chase" />
          </Tabs>
          
          {mode === 'basic' ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <AnimationArea elevation={3}>
                  <Road />
                  
                  {/* スタート地点 */}
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      left: 10,
                      top: 10,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      px: 1,
                      borderRadius: 1,
                    }}
                  >
                    スタート
                  </Typography>
                  
                  {/* ゴール地点 */}
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      right: 10,
                      top: 10,
                      backgroundColor: 'error.main',
                      color: 'white',
                      px: 1,
                      borderRadius: 1,
                    }}
                  >
                    ゴール
                  </Typography>
                  
                  {/* 距離表示 */}
                  <Typography
                    variant="body2"
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: 10,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {distance} km
                  </Typography>
                  
                  {/* 移動体 */}
                  <Vehicle type={vehicleType} style={{ left: `${currentPosition}%` }}>
                    {vehicleType === 'car' && <DirectionsCarIcon sx={{ fontSize: 40 }} />}
                    {vehicleType === 'bike' && <DirectionsBikeIcon sx={{ fontSize: 40 }} />}
                    {vehicleType === 'walk' && <DirectionsWalkIcon sx={{ fontSize: 40 }} />}
                  </Vehicle>
                  
                  {/* 経過時間と現在位置 */}
                  {isPlaying && (
                    <Box sx={{ position: 'absolute', bottom: 10, left: 10 }}>
                      <Typography variant="caption">
                        経過時間: {(elapsedTime * 60).toFixed(1)} 分
                      </Typography>
                      <br />
                      <Typography variant="caption">
                        移動距離: {(currentPosition * distance / 100).toFixed(1)} km
                      </Typography>
                    </Box>
                  )}
                </AnimationArea>
                
                {renderGraph()}
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    計算設定
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>移動手段</InputLabel>
                    <Select
                      value={vehicleType}
                      onChange={(e) => handleVehicleTypeChange(e.target.value as any)}
                    >
                      <MenuItem value="walk">徒歩</MenuItem>
                      <MenuItem value="bike">自転車</MenuItem>
                      <MenuItem value="car">自動車</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <ToggleButtonGroup
                    value={calculation}
                    exclusive
                    onChange={(_, v) => v && setCalculation(v)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="distance">距離を求める</ToggleButton>
                    <ToggleButton value="time">時間を求める</ToggleButton>
                    <ToggleButton value="speed">速さを求める</ToggleButton>
                  </ToggleButtonGroup>
                  
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="速さ (km/h)"
                      type="number"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      disabled={calculation === 'speed'}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="時間 (時間)"
                      type="number"
                      value={time}
                      onChange={(e) => setTime(Number(e.target.value))}
                      disabled={calculation === 'time'}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="距離 (km)"
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      disabled={calculation === 'distance'}
                    />
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={calculate}
                    sx={{ mb: 2 }}
                  >
                    計算する
                  </Button>
                  
                  <Alert severity="info" icon={false}>
                    <Typography variant="body2">
                      {calculation === 'distance' && '距離 = 速さ × 時間'}
                      {calculation === 'time' && '時間 = 距離 ÷ 速さ'}
                      {calculation === 'speed' && '速さ = 距離 ÷ 時間'}
                    </Typography>
                  </Alert>
                </Paper>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    onClick={toggleAnimation}
                    fullWidth
                  >
                    {isPlaying ? '一時停止' : 'アニメーション開始'}
                  </Button>
                  <IconButton onClick={reset} color="default">
                    <RestartAltIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    学習のポイント
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 速さ×時間=距離の関係を覚えよう
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • グラフの傾きが速さを表します
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 単位に注意しましょう
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ) : (
            // 追いつき問題モード
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <AnimationArea elevation={3}>
                  <Road />
                  
                  {/* 車両1 */}
                  <Vehicle type="car" style={{ left: `${vehicle1Position}%`, bottom: '90px' }}>
                    <DirectionsCarIcon sx={{ fontSize: 40, color: '#2196f3' }} />
                  </Vehicle>
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      left: `${vehicle1Position}%`,
                      bottom: '130px',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      px: 1,
                      borderRadius: 1,
                    }}
                  >
                    車A
                  </Typography>
                  
                  {/* 車両2 */}
                  <Vehicle type="car" style={{ left: `${vehicle2Position}%`, bottom: '50px' }}>
                    <DirectionsCarIcon sx={{ fontSize: 40, color: '#f44336' }} />
                  </Vehicle>
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      left: `${vehicle2Position}%`,
                      bottom: '20px',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#f44336',
                      color: 'white',
                      px: 1,
                      borderRadius: 1,
                    }}
                  >
                    車B
                  </Typography>
                  
                  {/* 状態表示 */}
                  {isPlaying && (
                    <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
                      <Typography variant="caption">
                        経過時間: {(elapsedTime * 60).toFixed(1)} 分
                      </Typography>
                      {vehicle2Position > vehicle1Position && (
                        <Chip
                          label="車Bが追い越しました！"
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  )}
                </AnimationArea>
                
                {renderGraph()}
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    追いつき問題の設定
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      車A（先に出発）
                    </Typography>
                    <TextField
                      fullWidth
                      label="速さ (km/h)"
                      type="number"
                      value={vehicle1Speed}
                      onChange={(e) => setVehicle1Speed(Number(e.target.value))}
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" gutterBottom>
                      車B（後から出発）
                    </Typography>
                    <TextField
                      fullWidth
                      label="速さ (km/h)"
                      type="number"
                      value={vehicle2Speed}
                      onChange={(e) => setVehicle2Speed(Number(e.target.value))}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="出発の遅れ (時間)"
                      type="number"
                      value={vehicle2Delay}
                      onChange={(e) => setVehicle2Delay(Number(e.target.value))}
                      inputProps={{ step: 0.1 }}
                    />
                  </Box>
                  
                  <Alert severity="info" icon={false}>
                    <Typography variant="body2">
                      追いつく時間 = 
                    </Typography>
                    <Typography variant="body2">
                      (速さの差) × 時間差 ÷ 速さの差
                    </Typography>
                  </Alert>
                </Paper>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    onClick={toggleAnimation}
                    fullWidth
                  >
                    {isPlaying ? '一時停止' : 'シミュレーション開始'}
                  </Button>
                  <IconButton onClick={reset} color="default">
                    <RestartAltIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default SpeedTimeDistanceSimulator;