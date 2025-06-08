import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Replay as ReplayIcon,
  Info as InfoIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

const EarthquakeWaveSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  const handleSpeedChange = (event: Event, newValue: number | number[]) => {
    setSimulationSpeed(newValue as number);
  };

  const startSimulation = () => {
    setIsRunning(true);
  };

  const stopSimulation = () => {
    setIsRunning(false);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentTime(0);
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            地震波シミュレーター
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            P波とS波の性質を理解し、初期微動継続時間から震源距離を計算しよう！
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip label="P波（初期微動）とS波（主要動）の違いを理解する" size="small" />
            <Chip label="地震波の伝播速度の違いを視覚的に確認する" size="small" />
            <Chip label="初期微動継続時間から震源距離を計算できる" size="small" />
            <Chip label="大森公式の意味と使い方を理解する" size="small" />
          </Box>
          <Button variant="outlined" size="small" onClick={resetSimulation}>
            全体リセット
          </Button>
        </Paper>

        <Grid container spacing={3}>
          {/* 左側：シミュレーション */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  地震波の伝播シミュレーション
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip 
                    label={`経過時間: ${currentTime.toFixed(1)}秒`}
                    color="primary"
                  />
                  
                  <ButtonGroup variant="contained" size="small">
                    <Button
                      onClick={isRunning ? stopSimulation : startSimulation}
                      startIcon={isRunning ? <PauseIcon /> : <PlayIcon />}
                    >
                      {isRunning ? '一時停止' : '開始'}
                    </Button>
                    <Button
                      onClick={resetSimulation}
                      startIcon={<ReplayIcon />}
                    >
                      リセット
                    </Button>
                  </ButtonGroup>

                  <Tooltip title="使い方">
                    <IconButton onClick={() => setShowInfo(!showInfo)}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {showInfo && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light' }}>
                  <Typography variant="body2">
                    <strong>使い方：</strong>
                    震源（赤い円）をドラッグして移動できます。
                    Shift+クリックで新しい観測点を追加できます。
                    青い円がP波、赤い円がS波を表します。
                  </Typography>
                </Paper>
              )}

              {/* シミュレーションエリア（プレースホルダー） */}
              <Box 
                sx={{ 
                  height: 400, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: 1,
                  border: '2px dashed grey.400'
                }}
              >
                <Typography color="text.secondary">
                  地震波アニメーションエリア
                </Typography>
              </Box>

              {/* シミュレーション速度調整 */}
              <Box sx={{ mt: 2, px: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <SpeedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  シミュレーション速度
                </Typography>
                <Slider
                  value={simulationSpeed}
                  onChange={handleSpeedChange}
                  min={0.1}
                  max={2}
                  step={0.1}
                  marks={[
                    { value: 0.5, label: '0.5x' },
                    { value: 1, label: '1x' },
                    { value: 1.5, label: '1.5x' },
                    { value: 2, label: '2x' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Paper>
          </Grid>

          {/* 右側：学習パネル */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                学習のポイント
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  P波とS波の特徴
                </Typography>
                <Box sx={{ bgcolor: 'blue.50', p: 1, borderRadius: 1, mb: 1 }}>
                  <Typography variant="body2">
                    <strong>P波：</strong>速度 約6km/s、縦波、初期微動
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'red.50', p: 1, borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>S波：</strong>速度 約3.5km/s、横波、主要動
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  大森公式
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    震源距離(km) = 初期微動継続時間(秒) × 8
                  </Typography>
                </Paper>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EarthquakeWaveSimulator;