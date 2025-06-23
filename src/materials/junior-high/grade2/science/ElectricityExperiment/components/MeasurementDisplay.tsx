import React from 'react';
import { Box, Paper, Typography, LinearProgress, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { MeasurementPoint, CircuitComponent } from '../types';
import { formatMeasurement } from '../utils/circuitCalculations';

interface MeasurementDisplayProps {
  measurements: MeasurementPoint[];
  components: CircuitComponent[];
  selectedComponentId: string | null;
}

// アナログメーター風のスタイル
const MeterContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
  borderRadius: theme.spacing(2),
  boxShadow: '5px 5px 10px #bebebe, -5px -5px 10px #ffffff',
  position: 'relative',
  overflow: 'hidden'
}));

const MeterScale = styled(Box)(({ theme: _theme }) => ({
  position: 'relative',
  height: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%'
  }
}));

const NeedleContainer = styled(Box)<{ rotation: number }>(({ rotation }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: `rotate(${rotation}deg)`,
  transition: 'transform 0.5s ease-in-out'
}));

const Needle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: 2,
  height: '40%',
  backgroundColor: theme.palette.error.main,
  bottom: '50%',
  transformOrigin: 'bottom center',
  boxShadow: '0 0 5px rgba(0,0,0,0.3)'
}));

// 個別メーター
const MeterDisplay: React.FC<{
  label: string;
  value: number;
  unit: string;
  max: number;
  type: 'voltage' | 'current' | 'resistance';
}> = ({ label, value, unit, max, type }) => {
  // 針の角度計算（-90度から90度の範囲）
  const rotation = Math.min(Math.max((value / max) * 180 - 90, -90), 90);
  
  // 色の設定
  const getColor = () => {
    switch (type) {
      case 'voltage': return '#1976d2';
      case 'current': return '#388e3c';
      case 'resistance': return '#f57c00';
      default: return '#666';
    }
  };
  
  return (
    <MeterContainer elevation={3}>
      <Typography variant="subtitle2" align="center" gutterBottom>
        {label}
      </Typography>
      
      <MeterScale>
        {/* 目盛り */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <Box
            key={percent}
            sx={{
              position: 'absolute',
              width: 1,
              height: 10,
              backgroundColor: '#999',
              top: 0,
              left: `${percent}%`,
              transform: 'translateX(-50%)'
            }}
          />
        ))}
        
        {/* 針 */}
        <NeedleContainer rotation={rotation}>
          <Needle />
        </NeedleContainer>
        
        {/* 中心点 */}
        <Box
          sx={{
            position: 'absolute',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#333',
            boxShadow: '0 0 5px rgba(0,0,0,0.5)'
          }}
        />
      </MeterScale>
      
      {/* デジタル表示 */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'monospace',
            color: getColor(),
            fontWeight: 'bold'
          }}
        >
          {formatMeasurement(value, unit)}
        </Typography>
      </Box>
      
      {/* プログレスバー */}
      <LinearProgress
        variant="determinate"
        value={Math.min((value / max) * 100, 100)}
        sx={{
          mt: 1,
          height: 6,
          borderRadius: 3,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getColor(),
            borderRadius: 3
          }
        }}
      />
    </MeterContainer>
  );
};

export const MeasurementDisplay: React.FC<MeasurementDisplayProps> = ({
  measurements,
  components,
  selectedComponentId
}) => {
  // 選択された部品の測定値を取得
  const selectedMeasurement = selectedComponentId
    ? measurements.find(m => m.componentId === selectedComponentId)
    : null;
    
  // 全体の測定値を計算
  const totalMeasurement = measurements.reduce(
    (acc, m) => {
      const component = components.find(c => c.id === m.componentId);
      if (component?.type === 'battery') {
        acc.voltage += m.measurement.voltage;
      }
      return acc;
    },
    { voltage: 0, current: 0, resistance: 0 }
  );
  
  // 回路全体の電流（最初の電流計の値を使用）
  const ammeterMeasurement = measurements.find(m => {
    const component = components.find(c => c.id === m.componentId);
    return component?.type === 'ammeter';
  });
  
  if (ammeterMeasurement) {
    totalMeasurement.current = ammeterMeasurement.measurement.current;
  }
  
  // 全体の抵抗を計算
  if (totalMeasurement.voltage > 0 && totalMeasurement.current > 0) {
    totalMeasurement.resistance = totalMeasurement.voltage / totalMeasurement.current;
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        測定値表示
      </Typography>
      
      {/* 回路全体の測定値 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          回路全体
          <Chip label="総合" size="small" color="primary" />
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          <MeterDisplay
            label="電圧"
            value={totalMeasurement.voltage}
            unit="V"
            max={20}
            type="voltage"
          />
          <MeterDisplay
            label="電流"
            value={totalMeasurement.current}
            unit="A"
            max={2}
            type="current"
          />
          <MeterDisplay
            label="抵抗"
            value={totalMeasurement.resistance}
            unit="Ω"
            max={100}
            type="resistance"
          />
        </Box>
      </Box>
      
      {/* 選択された部品の測定値 */}
      {selectedMeasurement && (
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            選択された部品
            <Chip
              label={components.find(c => c.id === selectedComponentId)?.type || ''}
              size="small"
              color="secondary"
            />
          </Typography>
          
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  電圧
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatMeasurement(selectedMeasurement.measurement.voltage, 'V')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  電流
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatMeasurement(selectedMeasurement.measurement.current, 'A')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  抵抗
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {formatMeasurement(selectedMeasurement.measurement.resistance, 'Ω')}
                </Typography>
              </Box>
            </Box>
            
            {/* 予測値との比較（予測モード時） */}
            {selectedMeasurement.predicted && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  予測値との比較
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Chip
                    label={`予測: ${formatMeasurement(selectedMeasurement.predicted.voltage, 'V')}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`実測: ${formatMeasurement(selectedMeasurement.measurement.voltage, 'V')}`}
                    size="small"
                    color="primary"
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};