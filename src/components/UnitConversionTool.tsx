import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Container,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StraightenIcon from '@mui/icons-material/Straighten';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

const VisualizationBox = styled(Box)(({ theme }) => ({
  minHeight: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f5f5f5',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
}));

const UnitCard = styled(Paper)<{ isActive?: boolean }>(({ theme, isActive }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isActive ? theme.palette.primary.light : '#fff',
  color: isActive ? '#fff' : 'inherit',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const Ruler = styled(Box)<{ width: number }>(({ width }) => ({
  width: `${width}%`,
  height: '40px',
  background: 'linear-gradient(90deg, #ffeb3b 0%, #ff9800 100%)',
  borderRadius: '4px',
  position: 'relative',
  transition: 'width 0.5s ease',
  display: 'flex',
  alignItems: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '100%',
    background: 'repeating-linear-gradient(90deg, transparent 0, transparent 9px, rgba(0,0,0,0.2) 9px, rgba(0,0,0,0.2) 10px)',
  },
}));

const LiquidContainer = styled(Box)<{ height: number }>(({ height }) => ({
  width: '80px',
  height: '200px',
  border: '3px solid #333',
  borderRadius: '0 0 8px 8px',
  position: 'relative',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: `${height}%`,
    background: 'linear-gradient(180deg, #64b5f6 0%, #1976d2 100%)',
    transition: 'height 0.5s ease',
  },
}));

interface UnitConversionToolProps {
  onClose?: () => void;
}

// 単位変換ツール（内部コンポーネント）
const UnitConversionToolContent: React.FC<UnitConversionToolProps> = ({ onClose }) => {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [mode, setMode] = useState<'length' | 'volume'>('length');
  const [lengthValue, setLengthValue] = useState(100); // 基準値（cm）
  const [volumeValue, setVolumeValue] = useState(500); // 基準値（mL）
  const [selectedLengthUnit, setSelectedLengthUnit] = useState<'cm' | 'm' | 'mm'>('cm');
  const [selectedVolumeUnit, setSelectedVolumeUnit] = useState<'mL' | 'dL' | 'L'>('mL');

  // 単位変換の計算
  const convertLength = (value: number, fromUnit: 'cm' | 'm' | 'mm', toUnit: 'cm' | 'm' | 'mm'): number => {
    // まずcmに変換
    let cmValue = value;
    if (fromUnit === 'm') cmValue = value * 100;
    if (fromUnit === 'mm') cmValue = value / 10;
    
    // 目的の単位に変換
    if (toUnit === 'cm') return cmValue;
    if (toUnit === 'm') return cmValue / 100;
    if (toUnit === 'mm') return cmValue * 10;
    return cmValue;
  };

  const convertVolume = (value: number, fromUnit: 'mL' | 'dL' | 'L', toUnit: 'mL' | 'dL' | 'L'): number => {
    // まずmLに変換
    let mlValue = value;
    if (fromUnit === 'dL') mlValue = value * 100;
    if (fromUnit === 'L') mlValue = value * 1000;
    
    // 目的の単位に変換
    if (toUnit === 'mL') return mlValue;
    if (toUnit === 'dL') return mlValue / 100;
    if (toUnit === 'L') return mlValue / 1000;
    return mlValue;
  };

  // 現在の値を各単位で取得
  const getLengthInAllUnits = () => {
    const baseValue = lengthValue;
    const baseUnit = selectedLengthUnit;
    return {
      cm: convertLength(baseValue, baseUnit, 'cm'),
      m: convertLength(baseValue, baseUnit, 'm'),
      mm: convertLength(baseValue, baseUnit, 'mm'),
    };
  };

  const getVolumeInAllUnits = () => {
    const baseValue = volumeValue;
    const baseUnit = selectedVolumeUnit;
    return {
      mL: convertVolume(baseValue, baseUnit, 'mL'),
      dL: convertVolume(baseValue, baseUnit, 'dL'),
      L: convertVolume(baseValue, baseUnit, 'L'),
    };
  };

  // スライダーの最大値を動的に設定
  const getSliderMax = () => {
    if (mode === 'length') {
      if (selectedLengthUnit === 'mm') return 1000;
      if (selectedLengthUnit === 'm') return 10;
      return 300; // cm
    } else {
      if (selectedVolumeUnit === 'mL') return 2000;
      if (selectedVolumeUnit === 'dL') return 20;
      return 2; // L
    }
  };

  // 視覚化のための正規化（0-100%）
  const getNormalizedValue = () => {
    if (mode === 'length') {
      const cmValue = convertLength(lengthValue, selectedLengthUnit, 'cm');
      return Math.min((cmValue / 300) * 100, 100); // 最大300cmを100%とする
    } else {
      const mlValue = convertVolume(volumeValue, selectedVolumeUnit, 'mL');
      return Math.min((mlValue / 2000) * 100, 100); // 最大2000mLを100%とする
    }
  };

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: 'length' | 'volume' | null) => {
    if (newMode !== null) {
      setMode(newMode);
      recordInteraction('click');
    }
  };

  const lengthUnits = getLengthInAllUnits();
  const volumeUnits = getVolumeInAllUnits();

  return (
    <Container maxWidth="md">
      <Card sx={{ backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {mode === 'length' ? (
                <>
                  <StraightenIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  長さの単位変換
                </>
              ) : (
                <>
                  <LocalDrinkIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  かさの単位変換
                </>
              )}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              スライダーを動かして、単位の変換を学ぼう！
            </Typography>
          </Box>

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              aria-label="単位の種類"
              size={isMobile ? 'small' : 'medium'}
            >
              <ToggleButton value="length" aria-label="長さ">
                <StraightenIcon sx={{ mr: 1 }} />
                長さ
              </ToggleButton>
              <ToggleButton value="volume" aria-label="かさ">
                <LocalDrinkIcon sx={{ mr: 1 }} />
                かさ
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {mode === 'length' ? (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <UnitCard 
                    elevation={selectedLengthUnit === 'mm' ? 4 : 1}
                    isActive={selectedLengthUnit === 'mm'}
                    onClick={() => {
                      setSelectedLengthUnit('mm');
                      recordInteraction('click');
                    }}
                  >
                    <Typography variant="h5" component="div">
                      {Math.round(lengthUnits.mm * 10) / 10}
                    </Typography>
                    <Typography variant="h6" color={selectedLengthUnit === 'mm' ? 'inherit' : 'text.secondary'}>
                      mm
                    </Typography>
                    <Typography variant="caption" display="block">
                      ミリメートル
                    </Typography>
                  </UnitCard>
                </Grid>
                <Grid item xs={4}>
                  <UnitCard 
                    elevation={selectedLengthUnit === 'cm' ? 4 : 1}
                    isActive={selectedLengthUnit === 'cm'}
                    onClick={() => {
                      setSelectedLengthUnit('cm');
                      recordInteraction('click');
                    }}
                  >
                    <Typography variant="h5" component="div">
                      {Math.round(lengthUnits.cm * 10) / 10}
                    </Typography>
                    <Typography variant="h6" color={selectedLengthUnit === 'cm' ? 'inherit' : 'text.secondary'}>
                      cm
                    </Typography>
                    <Typography variant="caption" display="block">
                      センチメートル
                    </Typography>
                  </UnitCard>
                </Grid>
                <Grid item xs={4}>
                  <UnitCard 
                    elevation={selectedLengthUnit === 'm' ? 4 : 1}
                    isActive={selectedLengthUnit === 'm'}
                    onClick={() => {
                      setSelectedLengthUnit('m');
                      recordInteraction('click');
                    }}
                  >
                    <Typography variant="h5" component="div">
                      {Math.round(lengthUnits.m * 100) / 100}
                    </Typography>
                    <Typography variant="h6" color={selectedLengthUnit === 'm' ? 'inherit' : 'text.secondary'}>
                      m
                    </Typography>
                    <Typography variant="caption" display="block">
                      メートル
                    </Typography>
                  </UnitCard>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3, px: 2 }}>
                <Typography gutterBottom>
                  {selectedLengthUnit === 'mm' && 'ミリメートル'}
                  {selectedLengthUnit === 'cm' && 'センチメートル'}
                  {selectedLengthUnit === 'm' && 'メートル'}
                  で調整
                </Typography>
                <Slider
                  value={lengthValue}
                  onChange={(_, value) => {
                    setLengthValue(value as number);
                    recordInteraction('drag');
                  }}
                  min={0}
                  max={getSliderMax()}
                  step={selectedLengthUnit === 'm' ? 0.01 : 1}
                  marks
                  valueLabelDisplay="on"
                  sx={{ color: theme.palette.primary.main }}
                />
              </Box>

              <VisualizationBox>
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  <Typography variant="body2" gutterBottom>
                    定規の長さ
                  </Typography>
                  <Box sx={{ position: 'relative', width: '100%', maxWidth: '400px', mx: 'auto' }}>
                    <Ruler width={getNormalizedValue()} />
                    <Typography variant="caption" sx={{ position: 'absolute', left: 0, top: '50px' }}>
                      0
                    </Typography>
                    <Typography variant="caption" sx={{ position: 'absolute', right: 0, top: '50px' }}>
                      3m
                    </Typography>
                  </Box>
                </Box>
              </VisualizationBox>

              <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  覚えよう！
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Chip label="1m = 100cm" color="primary" size="small" sx={{ mr: 1 }} />
                    <Chip label="1cm = 10mm" color="primary" size="small" sx={{ mr: 1 }} />
                    <Chip label="1m = 1000mm" color="primary" size="small" />
                  </Grid>
                </Grid>
              </Box>
            </>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <UnitCard 
                    elevation={selectedVolumeUnit === 'mL' ? 4 : 1}
                    isActive={selectedVolumeUnit === 'mL'}
                    onClick={() => {
                      setSelectedVolumeUnit('mL');
                      recordInteraction('click');
                    }}
                  >
                    <Typography variant="h5" component="div">
                      {Math.round(volumeUnits.mL)}
                    </Typography>
                    <Typography variant="h6" color={selectedVolumeUnit === 'mL' ? 'inherit' : 'text.secondary'}>
                      mL
                    </Typography>
                    <Typography variant="caption" display="block">
                      ミリリットル
                    </Typography>
                  </UnitCard>
                </Grid>
                <Grid item xs={4}>
                  <UnitCard 
                    elevation={selectedVolumeUnit === 'dL' ? 4 : 1}
                    isActive={selectedVolumeUnit === 'dL'}
                    onClick={() => {
                      setSelectedVolumeUnit('dL');
                      recordInteraction('click');
                    }}
                  >
                    <Typography variant="h5" component="div">
                      {Math.round(volumeUnits.dL * 10) / 10}
                    </Typography>
                    <Typography variant="h6" color={selectedVolumeUnit === 'dL' ? 'inherit' : 'text.secondary'}>
                      dL
                    </Typography>
                    <Typography variant="caption" display="block">
                      デシリットル
                    </Typography>
                  </UnitCard>
                </Grid>
                <Grid item xs={4}>
                  <UnitCard 
                    elevation={selectedVolumeUnit === 'L' ? 4 : 1}
                    isActive={selectedVolumeUnit === 'L'}
                    onClick={() => {
                      setSelectedVolumeUnit('L');
                      recordInteraction('click');
                    }}
                  >
                    <Typography variant="h5" component="div">
                      {Math.round(volumeUnits.L * 100) / 100}
                    </Typography>
                    <Typography variant="h6" color={selectedVolumeUnit === 'L' ? 'inherit' : 'text.secondary'}>
                      L
                    </Typography>
                    <Typography variant="caption" display="block">
                      リットル
                    </Typography>
                  </UnitCard>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3, px: 2 }}>
                <Typography gutterBottom>
                  {selectedVolumeUnit === 'mL' && 'ミリリットル'}
                  {selectedVolumeUnit === 'dL' && 'デシリットル'}
                  {selectedVolumeUnit === 'L' && 'リットル'}
                  で調整
                </Typography>
                <Slider
                  value={volumeValue}
                  onChange={(_, value) => {
                    setVolumeValue(value as number);
                    recordInteraction('drag');
                  }}
                  min={0}
                  max={getSliderMax()}
                  step={selectedVolumeUnit === 'L' ? 0.01 : 1}
                  marks
                  valueLabelDisplay="on"
                  sx={{ color: theme.palette.primary.main }}
                />
              </Box>

              <VisualizationBox>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" gutterBottom>
                    ビーカーの水の量
                  </Typography>
                  <LiquidContainer height={getNormalizedValue()} />
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    最大2L
                  </Typography>
                </Box>
              </VisualizationBox>

              <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  覚えよう！
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Chip label="1L = 10dL" color="primary" size="small" sx={{ mr: 1 }} />
                    <Chip label="1dL = 100mL" color="primary" size="small" sx={{ mr: 1 }} />
                    <Chip label="1L = 1000mL" color="primary" size="small" />
                  </Grid>
                </Grid>
              </Box>
            </>
          )}

          <Box sx={{ mt: 3, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              💡 ヒント：
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mode === 'length' 
                ? '• 単位をクリックすると、その単位で数値を調整できます'
                : '• ペットボトル（500mL）は0.5Lと同じです'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • スライダーを動かして、単位の関係を確認しよう
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

// 単位変換ツール（MaterialWrapperでラップ）
const UnitConversionTool: React.FC<UnitConversionToolProps> = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="unit-conversion"
      materialName="単位変換ツール"
      showMetricsButton={true}
      showAssistant={true}
    >
      <UnitConversionToolContent onClose={onClose} />
    </MaterialWrapper>
  );
};

export default UnitConversionTool;