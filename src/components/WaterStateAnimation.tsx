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
  IconButton,
  Chip,
  LinearProgress,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CloudIcon from '@mui/icons-material/Cloud';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ThermostatIcon from '@mui/icons-material/Thermostat';

// アニメーションコンテナのスタイル
const AnimationContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '400px',
  backgroundColor: '#f0f8ff',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('sm')]: {
    height: '300px',
  },
}));

// 分子のスタイル
const Molecule = styled(Box)<{ state: 'ice' | 'water' | 'steam' }>(({ state }) => ({
  position: 'absolute',
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: 
    state === 'ice' ? '#b3e5fc' :
    state === 'water' ? '#0288d1' :
    '#81d4fa',
  transition: 'all 0.5s ease',
}));

// ビーカーのスタイル
const Beaker = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '200px',
  height: '250px',
  border: '3px solid #666',
  borderTop: 'none',
  borderRadius: '0 0 20px 20px',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  margin: '0 auto',
}));

// 温度計のスタイル
const Thermometer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: '20px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '40px',
  height: '200px',
  backgroundColor: '#fff',
  border: '2px solid #333',
  borderRadius: '20px',
  padding: '10px 5px',
}));

interface MoleculeData {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface WaterStateAnimationProps {
  onClose?: () => void;
}

const WaterStateAnimation: React.FC<WaterStateAnimationProps> = ({ onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const animationRef = useRef<number>();
  const moleculesRef = useRef<MoleculeData[]>([]);
  
  const [temperature, setTemperature] = useState(20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waterState, setWaterState] = useState<'ice' | 'water' | 'steam'>('water');
  const [molecules, setMolecules] = useState<MoleculeData[]>([]);
  const [experiment, setExperiment] = useState<'heating' | 'cooling'>('heating');
  
  // 初期分子の生成
  useEffect(() => {
    const initialMolecules: MoleculeData[] = [];
    const rows = 6;
    const cols = 8;
    
    for (let i = 0; i < rows * cols; i++) {
      initialMolecules.push({
        id: i,
        x: 50 + (i % cols) * 20,
        y: 100 + Math.floor(i / cols) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
      });
    }
    
    moleculesRef.current = initialMolecules;
    setMolecules([...initialMolecules]);
  }, []);
  
  // 温度による状態変化
  useEffect(() => {
    if (temperature <= 0) {
      setWaterState('ice');
    } else if (temperature >= 100) {
      setWaterState('steam');
    } else {
      setWaterState('water');
    }
  }, [temperature]);
  
  // 分子の動きをアニメーション
  const animateMolecules = () => {
    const speed = waterState === 'ice' ? 0.1 : 
                  waterState === 'water' ? 1 : 3;
    
    moleculesRef.current = moleculesRef.current.map(mol => {
      let newX = mol.x;
      let newY = mol.y;
      let newVx = mol.vx;
      let newVy = mol.vy;
      
      if (waterState === 'ice') {
        // 氷：固定位置で振動
        const baseX = 50 + (mol.id % 8) * 20;
        const baseY = 100 + Math.floor(mol.id / 8) * 20;
        newX = baseX + Math.sin(Date.now() * 0.001 + mol.id) * 2;
        newY = baseY + Math.cos(Date.now() * 0.001 + mol.id) * 2;
      } else if (waterState === 'water') {
        // 水：ゆっくり移動
        newX = mol.x + mol.vx * speed;
        newY = mol.y + mol.vy * speed;
        
        // 壁での反射
        if (newX < 10 || newX > 190) newVx = -mol.vx;
        if (newY < 50 || newY > 230) newVy = -mol.vy;
        
        // 境界内に収める
        newX = Math.max(10, Math.min(190, newX));
        newY = Math.max(50, Math.min(230, newY));
      } else {
        // 水蒸気：激しく移動
        newX = mol.x + mol.vx * speed;
        newY = mol.y + mol.vy * speed;
        
        // より広い範囲で移動
        if (newX < -50 || newX > 250) newVx = -mol.vx;
        if (newY < -50 || newY > 300) newVy = -mol.vy;
        
        // ランダムな力を加える
        newVx += (Math.random() - 0.5) * 0.5;
        newVy += (Math.random() - 0.5) * 0.5;
      }
      
      return {
        ...mol,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy,
      };
    });
    
    setMolecules([...moleculesRef.current]);
  };
  
  // アニメーションループ
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        animateMolecules();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, waterState]);
  
  // 自動温度変化（実験モード）
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setTemperature(prev => {
          if (experiment === 'heating') {
            if (prev >= 120) return prev;
            return prev + 1;
          } else {
            if (prev <= -20) return prev;
            return prev - 1;
          }
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, experiment]);
  
  // 実験のリセット
  const resetExperiment = () => {
    setIsPlaying(false);
    setTemperature(20);
    setExperiment('heating');
    
    // 分子を初期位置に戻す
    const rows = 6;
    const cols = 8;
    moleculesRef.current = moleculesRef.current.map((mol, i) => ({
      ...mol,
      x: 50 + (i % cols) * 20,
      y: 100 + Math.floor(i / cols) * 20,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    }));
    setMolecules([...moleculesRef.current]);
  };
  
  // 状態の説明文
  const getStateDescription = () => {
    switch (waterState) {
      case 'ice':
        return '氷（固体）：分子が規則正しく並び、ほとんど動かない状態';
      case 'water':
        return '水（液体）：分子が自由に動き回るが、まとまっている状態';
      case 'steam':
        return '水蒸気（気体）：分子が激しく動き、広がっていく状態';
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Card sx={{ backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WaterDropIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              水の三態変化アニメーション
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              温度を変えて、水の状態変化と分子の動きを観察しよう！
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <AnimationContainer elevation={3}>
                <Beaker>
                  {molecules.map(mol => (
                    <Molecule
                      key={mol.id}
                      state={waterState}
                      sx={{
                        left: `${mol.x}px`,
                        top: `${mol.y}px`,
                        opacity: waterState === 'steam' ? 0.6 : 1,
                      }}
                    />
                  ))}
                  
                  {/* 状態のアイコン表示 */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    {waterState === 'ice' && <AcUnitIcon sx={{ fontSize: 40, color: '#b3e5fc' }} />}
                    {waterState === 'water' && <WaterDropIcon sx={{ fontSize: 40, color: '#0288d1' }} />}
                    {waterState === 'steam' && <CloudIcon sx={{ fontSize: 40, color: '#81d4fa' }} />}
                  </Box>
                </Beaker>
                
                <Thermometer>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: `${Math.max(0, Math.min(160, (temperature + 20) * 1.2))}px`,
                      backgroundColor: 
                        temperature <= 0 ? '#2196f3' :
                        temperature >= 100 ? '#f44336' :
                        '#ff9800',
                      borderRadius: '10px',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      top: -25,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {temperature}°C
                  </Typography>
                </Thermometer>
              </AnimationContainer>
              
              <Box sx={{ mt: 2, px: 2 }}>
                <Typography gutterBottom>
                  温度：{temperature}°C
                </Typography>
                <Slider
                  value={temperature}
                  onChange={(_, value) => setTemperature(value as number)}
                  min={-20}
                  max={120}
                  marks={[
                    { value: 0, label: '0°C' },
                    { value: 100, label: '100°C' },
                  ]}
                  valueLabelDisplay="auto"
                  disabled={isPlaying}
                />
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  onClick={() => setIsPlaying(!isPlaying)}
                  color={experiment === 'heating' ? 'error' : 'primary'}
                >
                  {isPlaying ? '一時停止' : experiment === 'heating' ? '加熱実験' : '冷却実験'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setExperiment(experiment === 'heating' ? 'cooling' : 'heating')}
                  disabled={isPlaying}
                >
                  {experiment === 'heating' ? '冷却に切替' : '加熱に切替'}
                </Button>
                <IconButton onClick={resetExperiment} color="default">
                  <RestartAltIcon />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  現在の状態
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {waterState === 'ice' && <AcUnitIcon sx={{ fontSize: 60, color: '#b3e5fc' }} />}
                  {waterState === 'water' && <WaterDropIcon sx={{ fontSize: 60, color: '#0288d1' }} />}
                  {waterState === 'steam' && <CloudIcon sx={{ fontSize: 60, color: '#81d4fa' }} />}
                  <Box>
                    <Typography variant="h5" color="primary">
                      {waterState === 'ice' ? '氷' : waterState === 'water' ? '水' : '水蒸気'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {waterState === 'ice' ? '固体' : waterState === 'water' ? '液体' : '気体'}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {getStateDescription()}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  状態変化の温度
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip
                    icon={<ThermostatIcon />}
                    label="融点：0°C（氷→水）"
                    color={temperature === 0 ? 'primary' : 'default'}
                    size="small"
                  />
                  <Chip
                    icon={<ThermostatIcon />}
                    label="沸点：100°C（水→水蒸気）"
                    color={temperature === 100 ? 'primary' : 'default'}
                    size="small"
                  />
                </Box>
              </Paper>
              
              <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  分子の動きを観察しよう
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 固体（氷）：分子は決まった位置で振動
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 液体（水）：分子は自由に動くが密集
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 気体（水蒸気）：分子は激しく動き拡散
                </Typography>
              </Box>
              
              {isPlaying && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    実験進行中...
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      experiment === 'heating' 
                        ? ((temperature + 20) / 140) * 100
                        : ((140 - (temperature + 20)) / 140) * 100
                    }
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default WaterStateAnimation;