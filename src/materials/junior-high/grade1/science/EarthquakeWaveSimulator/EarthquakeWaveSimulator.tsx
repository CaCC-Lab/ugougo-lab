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
import { MaterialWrapper, useLearningTrackerContext } from '../../../../../components/wrappers/MaterialWrapper';
import { useEarthquakeSimulation } from './hooks';
import { WaveAnimation, SeismographDisplay, LearningPanel } from './components';
import type { SelectChangeEvent } from '@mui/material';

// 地震波シミュレーター（内部コンポーネント）
const EarthquakeWaveSimulatorContent: React.FC = () => {
  const { recordInteraction, recordAnswer } = useLearningTrackerContext();
  console.log('EarthquakeWaveSimulator rendering');
  
  try {
  const {
    state,
    setEpicenter,
    addObservationPoint,
    selectObservationPoint,
    startSimulation,
    stopSimulation,
    resetSimulation,
    calculateDistanceFromPS
  } = useEarthquakeSimulation();

  const [showInfo, setShowInfo] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  const selectedPoint = state.observationPoints.find(
    p => p.id === state.selectedPointId
  );

  const handleSpeedChange = (event: Event, newValue: number | number[]) => {
    setSimulationSpeed(newValue as number);
  };

  const handlePointSelect = (event: SelectChangeEvent) => {
    selectObservationPoint(event.target.value);
    recordInteraction('change');
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', bgcolor: 'background.default' }}>
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
          <Button variant="outlined" size="small" onClick={() => {
            resetSimulation();
            recordInteraction('click');
          }}>
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
                    label={`経過時間: ${state.currentTime.toFixed(1)}秒`}
                    color="primary"
                  />
                  
                  <ButtonGroup variant="contained" size="small">
                    <Button
                      onClick={() => {
                        if (state.isRunning) {
                          stopSimulation();
                        } else {
                          startSimulation();
                        }
                        recordInteraction('click');
                      }}
                      startIcon={state.isRunning ? <PauseIcon /> : <PlayIcon />}
                    >
                      {state.isRunning ? '一時停止' : '開始'}
                    </Button>
                    <Button
                      onClick={() => {
                        resetSimulation();
                        recordInteraction('click');
                      }}
                      startIcon={<ReplayIcon />}
                    >
                      リセット
                    </Button>
                  </ButtonGroup>

                  <Tooltip title="使い方">
                    <IconButton onClick={() => {
                      setShowInfo(!showInfo);
                      recordInteraction('click');
                    }}>
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

              <WaveAnimation
                epicenter={state.epicenter}
                observationPoints={state.observationPoints}
                waveRadius={state.waveRadius}
                selectedPointId={state.selectedPointId}
                onEpicenterDrag={(point) => {
                  setEpicenter(point);
                  recordInteraction('drag');
                }}
                onAddObservationPoint={(point) => {
                  addObservationPoint(point);
                  recordInteraction('click');
                }}
                onSelectPoint={(id) => {
                  selectObservationPoint(id);
                  recordInteraction('click');
                }}
              />

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

            {/* 地震計表示 */}
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>観測点を選択</InputLabel>
                <Select
                  value={state.selectedPointId || ''}
                  onChange={handlePointSelect}
                  label="観測点を選択"
                >
                  {state.observationPoints.map(point => (
                    <MenuItem key={point.id} value={point.id}>
                      {point.name}
                      {point.distance && ` (震源距離: ${point.distance.toFixed(1)}km)`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <SeismographDisplay
                observationPoint={selectedPoint || null}
                seismographData={
                  selectedPoint && state.seismographData[selectedPoint.id]
                    ? state.seismographData[selectedPoint.id]
                    : null
                }
                currentTime={state.currentTime}
              />
            </Box>
          </Grid>

          {/* 右側：学習パネル */}
          <Grid item xs={12} lg={4}>
            <LearningPanel
              onQuizComplete={(score) => {
                console.log(`クイズスコア: ${score}`);
                recordAnswer(score >= 70, {
                  type: 'quiz',
                  score: score,
                  topic: '地震波の理解'
                });
              }}
            />
          </Grid>
        </Grid>

        {/* 観測点データ一覧 */}
        {state.observationPoints.length > 0 && (
          <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              観測データ一覧
            </Typography>
            <Grid container spacing={2}>
              {state.observationPoints.map(point => {
                const psDuration = point.pArrivalTime && point.sArrivalTime
                  ? point.sArrivalTime - point.pArrivalTime
                  : null;
                const calculatedDistance = psDuration
                  ? calculateDistanceFromPS(point.id)
                  : null;

                return (
                  <Grid item xs={12} sm={6} md={4} key={point.id}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: state.selectedPointId === point.id ? 'action.selected' : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                      onClick={() => {
                        selectObservationPoint(point.id);
                        recordInteraction('click');
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {point.name}
                      </Typography>
                      {point.distance && (
                        <Typography variant="body2">
                          実際の距離: {point.distance.toFixed(1)}km
                        </Typography>
                      )}
                      {state.currentTime >= (point.pArrivalTime || 0) && point.pArrivalTime && (
                        <Typography variant="body2" color="primary">
                          P波到達: {point.pArrivalTime.toFixed(1)}秒
                        </Typography>
                      )}
                      {state.currentTime >= (point.sArrivalTime || 0) && point.sArrivalTime && (
                        <Typography variant="body2" color="error">
                          S波到達: {point.sArrivalTime.toFixed(1)}秒
                        </Typography>
                      )}
                      {psDuration && state.currentTime >= (point.sArrivalTime || 0) && (
                        <>
                          <Typography variant="body2" color="secondary">
                            初期微動継続時間: {psDuration.toFixed(1)}秒
                          </Typography>
                          {calculatedDistance && (
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              計算距離: {calculatedDistance.toFixed(1)}km
                            </Typography>
                          )}
                        </>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}
      </Container>
    </Box>
  );
  } catch (error) {
    console.error('Error in EarthquakeWaveSimulator:', error);
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">エラーが発生しました: {String(error)}</Typography>
      </Box>
    );
  }
};

// 地震波シミュレーター（MaterialWrapperでラップ）
const EarthquakeWaveSimulator: React.FC = () => {
  return (
    <MaterialWrapper
      materialId="earthquake-wave-simulator"
      materialName="地震波シミュレーター"
      showMetricsButton={true}
      showAssistant={true}
    >
      <EarthquakeWaveSimulatorContent />
    </MaterialWrapper>
  );
};

export default EarthquakeWaveSimulator;