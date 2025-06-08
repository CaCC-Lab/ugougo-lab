import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Alert,
  Chip,
  Grid,
  Slider,
  Divider
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as ResetIcon,
  Science as ExperimentIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const ElectricityExperiment: React.FC = () => {
  const [voltage, setVoltage] = useState(10); // V
  const [resistance, setResistance] = useState(5); // Ω
  const [current, setCurrent] = useState(2); // A
  const [mode, setMode] = useState<'series' | 'parallel'>('series');
  const [isRunning, setIsRunning] = useState(false);

  // オームの法則で電流を計算
  React.useEffect(() => {
    if (resistance > 0) {
      setCurrent(voltage / resistance);
    }
  }, [voltage, resistance]);

  const handleVoltageChange = (event: Event, newValue: number | number[]) => {
    setVoltage(newValue as number);
  };

  const handleResistanceChange = (event: Event, newValue: number | number[]) => {
    setResistance(newValue as number);
  };

  const reset = () => {
    setVoltage(10);
    setResistance(5);
    setIsRunning(false);
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default', overflow: 'auto' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            電流・電圧・抵抗の関係実験器
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            オームの法則を体験的に学習できる仮想実験ツール
          </Typography>
        </Paper>

        {/* ヘッダー部分 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                電気回路シミュレーター
              </Typography>
              <Typography variant="body2" color="text.secondary">
                回路を組み立てて、電流・電圧・抵抗の関係を調べよう
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ResetIcon />}
                onClick={reset}
              >
                リセット
              </Button>
              <Button
                variant="outlined"
                startIcon={<HelpIcon />}
              >
                使い方
              </Button>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* 左側：回路エディター */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                回路シミュレーション
              </Typography>
              
              {/* 回路タイプ選択 */}
              <Box sx={{ mb: 3 }}>
                <ButtonGroup variant="outlined" fullWidth>
                  <Button
                    variant={mode === 'series' ? 'contained' : 'outlined'}
                    onClick={() => setMode('series')}
                  >
                    直列回路
                  </Button>
                  <Button
                    variant={mode === 'parallel' ? 'contained' : 'outlined'}
                    onClick={() => setMode('parallel')}
                  >
                    並列回路
                  </Button>
                </ButtonGroup>
              </Box>

              {/* 回路図エリア */}
              <Box 
                sx={{ 
                  height: 300, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderRadius: 1,
                  mb: 3
                }}
              >
                <Typography color="text.secondary">
                  {mode === 'series' ? '直列回路' : '並列回路'}の図
                </Typography>
              </Box>

              {/* パラメータ調整 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  電圧 (V): {voltage.toFixed(1)} V
                </Typography>
                <Slider
                  value={voltage}
                  onChange={handleVoltageChange}
                  min={0}
                  max={20}
                  step={0.5}
                  marks={[
                    { value: 0, label: '0V' },
                    { value: 10, label: '10V' },
                    { value: 20, label: '20V' }
                  ]}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  抵抗 (Ω): {resistance.toFixed(1)} Ω
                </Typography>
                <Slider
                  value={resistance}
                  onChange={handleResistanceChange}
                  min={1}
                  max={20}
                  step={0.5}
                  marks={[
                    { value: 1, label: '1Ω' },
                    { value: 10, label: '10Ω' },
                    { value: 20, label: '20Ω' }
                  ]}
                />
              </Box>
            </Paper>
          </Grid>

          {/* 右側：測定結果 */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                測定結果
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip label="電圧" color="primary" size="small" sx={{ mr: 1 }} />
                <Typography variant="h4" color="primary">
                  {voltage.toFixed(1)} V
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Chip label="電流" color="secondary" size="small" sx={{ mr: 1 }} />
                <Typography variant="h4" color="secondary">
                  {current.toFixed(2)} A
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Chip label="抵抗" color="success" size="small" sx={{ mr: 1 }} />
                <Typography variant="h4" color="success.main">
                  {resistance.toFixed(1)} Ω
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Alert severity="info">
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  V = I × R
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                  {voltage.toFixed(1)} = {current.toFixed(2)} × {resistance.toFixed(1)}
                </Typography>
              </Alert>
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                オームの法則
              </Typography>
              <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  電圧 (V) = 電流 (I) × 抵抗 (R)
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  • 電圧が上がると電流も増加
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 抵抗が上がると電流は減少
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ElectricityExperiment;