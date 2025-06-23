import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Stack
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as _StopIcon,
  Refresh as ResetIcon,
  Science as _ExperimentIcon,
  Assignment as TemplateIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from '../../../../../components/wrappers/MaterialWrapper';
import {
  CircuitEditor,
  MeasurementDisplay,
  ParameterControl,
  DataGraph,
  FormulaDisplay
} from './components';
import { useCircuitSimulation } from './hooks';
import { circuitTemplates, experimentChallenges } from './data/circuitComponents';
import type { ExperimentMode } from './types';

// 電流・電圧・抵抗の関係実験器（内部コンポーネント）
const ElectricityExperimentContent: React.FC = () => {
  const { recordInteraction, recordAnswer: _recordAnswer } = useLearningTrackerContext();
  
  try {
  const [showHelp, setShowHelp] = useState(false);
  const [activeChallenge, _setActiveChallenge] = useState(0);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  
  const {
    circuit,
    measurements,
    mode,
    selectedComponent,
    error,
    graphData,
    addComponent,
    removeComponent,
    moveComponent,
    updateComponentValue,
    selectComponent,
    addWire,
    removeWire: _removeWire,
    setMode,
    runSimulation,
    resetCircuit,
    loadTemplate,
    setPrediction: _setPrediction,
    checkPredictions: _checkPredictions
  } = useCircuitSimulation();
  
  // 実験モードのステップ
  const experimentSteps = [
    { label: '回路作成', mode: 'build' as ExperimentMode },
    { label: '測定', mode: 'measure' as ExperimentMode },
    { label: '予測', mode: 'predict' as ExperimentMode },
    { label: '分析', mode: 'analyze' as ExperimentMode }
  ];
  
  const currentStep = experimentSteps.findIndex(step => step.mode === mode);
  
  // 現在の回路の測定値
  const currentCircuitData = measurements.length > 0 ? {
    voltage: measurements.reduce((sum, m) => {
      const component = circuit.components.find(c => c.id === m.componentId);
      return component?.type === 'battery' ? sum + m.measurement.voltage : sum;
    }, 0),
    current: measurements.find(m => {
      const component = circuit.components.find(c => c.id === m.componentId);
      return component?.type === 'ammeter';
    })?.measurement.current || 0,
    resistance: 0
  } : undefined;
  
  if (currentCircuitData && currentCircuitData.current > 0) {
    currentCircuitData.resistance = currentCircuitData.voltage / currentCircuitData.current;
  }
  
  return (
    <Box sx={{ width: '100%', height: '100vh', bgcolor: 'background.default', overflow: 'auto' }}>
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
                startIcon={<TemplateIcon />}
                onClick={() => {
                  setShowTemplateDialog(true);
                  recordInteraction('click');
                }}
              >
                テンプレート
              </Button>
              <Button
                variant="outlined"
                startIcon={<HelpIcon />}
                onClick={() => {
                  setShowHelp(true);
                  recordInteraction('click');
                }}
              >
                使い方
              </Button>
            </Box>
          </Box>
          
          {/* 実験ステップ */}
          <Stepper activeStep={currentStep} sx={{ mb: 2 }}>
            {experimentSteps.map((step) => (
              <Step key={step.mode}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* モード切り替えボタン */}
          <ButtonGroup variant="contained" fullWidth>
            {experimentSteps.map((step) => (
              <Button
                key={step.mode}
                onClick={() => {
                  setMode(step.mode);
                  recordInteraction('click');
                }}
                variant={mode === step.mode ? 'contained' : 'outlined'}
                disabled={step.mode === 'measure' && circuit.components.length === 0}
              >
                {step.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        
        {/* エラー表示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}
        
        {/* メインコンテンツ */}
        <Grid container spacing={3}>
          {/* 左側：回路エディター */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">回路図</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {mode === 'measure' && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<StartIcon />}
                      onClick={() => {
                        runSimulation();
                        recordInteraction('click');
                      }}
                    >
                      シミュレーション実行
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<ResetIcon />}
                    onClick={() => {
                      resetCircuit();
                      recordInteraction('click');
                    }}
                  >
                    リセット
                  </Button>
                </Box>
              </Box>
              
              <CircuitEditor
                width={800}
                height={500}
                components={circuit.components}
                selectedComponent={selectedComponent}
                onAddComponent={(type, position) => {
                  addComponent(type, position);
                  recordInteraction('click');
                }}
                onMoveComponent={(id, position) => {
                  moveComponent(id, position);
                  recordInteraction('drag');
                }}
                onSelectComponent={(component) => {
                  selectComponent(component);
                  recordInteraction('click');
                }}
                onRemoveComponent={(id) => {
                  removeComponent(id);
                  recordInteraction('click');
                }}
                onAddWire={(from, to, fromPort, toPort) => {
                  addWire(from, to, fromPort, toPort);
                  recordInteraction('click');
                }}
                isSimulating={mode === 'measure'}
              />
              
              {/* 実験課題 */}
              {mode === 'build' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    実験課題
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={`課題 ${activeChallenge + 1}`}
                        color="primary"
                        size="small"
                      />
                      <Typography variant="subtitle2">
                        {experimentChallenges[activeChallenge].title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {experimentChallenges[activeChallenge].description}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                      目標: {experimentChallenges[activeChallenge].objective}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* 右側：コントロールパネル */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* パラメータ調整 */}
              {(mode === 'measure' || mode === 'predict') && (
                <Paper sx={{ p: 2 }}>
                  <ParameterControl
                    components={circuit.components}
                    selectedComponent={selectedComponent}
                    onUpdateValue={(id, value) => {
                      updateComponentValue(id, value);
                      recordInteraction('drag');
                    }}
                    onSelectComponent={selectComponent}
                    isSimulating={mode === 'measure'}
                  />
                </Paper>
              )}
              
              {/* 測定値表示 */}
              {mode !== 'build' && (
                <Paper sx={{ p: 2 }}>
                  <MeasurementDisplay
                    measurements={measurements}
                    components={circuit.components}
                    selectedComponentId={selectedComponent?.id || null}
                  />
                </Paper>
              )}
              
              {/* 公式と計算 */}
              <Paper sx={{ p: 2 }}>
                <FormulaDisplay />
              </Paper>
            </Stack>
          </Grid>
          
          {/* 下部：データ分析 */}
          {mode === 'analyze' && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <DataGraph
                  voltageCurrent={graphData.voltageCurrent}
                  resistanceCurrent={graphData.resistanceCurrent}
                  measurements={measurements}
                  currentCircuitData={currentCircuitData}
                />
              </Paper>
            </Grid>
          )}
        </Grid>
        
        {/* テンプレート選択ダイアログ */}
        <Dialog
          open={showTemplateDialog}
          onClose={() => setShowTemplateDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>回路テンプレート</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              {Object.entries(circuitTemplates).map(([key, template]) => (
                <Paper
                  key={key}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => {
                    loadTemplate(key);
                    setShowTemplateDialog(false);
                    recordInteraction('click');
                  }}
                >
                  <Typography variant="subtitle1">{template.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowTemplateDialog(false)}>
              キャンセル
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* ヘルプダイアログ */}
        <Dialog
          open={showHelp}
          onClose={() => setShowHelp(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>使い方</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  1. 回路作成モード
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  左のパレットから部品を選んで配置し、回路を組み立てます。
                  部品はドラッグで移動できます。
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  2. 測定モード
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  パラメータを調整して、シミュレーションを実行します。
                  リアルタイムで測定値が更新されます。
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  3. 予測モード
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  測定値を予測してから実際の値と比較し、理解を深めます。
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  4. 分析モード
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  グラフやデータ表を使って、電圧・電流・抵抗の関係を分析します。
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowHelp(false)}>
              閉じる
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
  } catch (error) {
    console.error('Error in ElectricityExperiment:', error);
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">エラーが発生しました: {String(error)}</Typography>
      </Box>
    );
  }
};

// 電流・電圧・抵抗の関係実験器（MaterialWrapperでラップ）
const ElectricityExperiment: React.FC = () => {
  return (
    <MaterialWrapper
      materialId="electricity-experiment"
      materialName="電流・電圧・抵抗の関係実験器"
      showMetricsButton={true}
      showAssistant={true}
    >
      <ElectricityExperimentContent />
    </MaterialWrapper>
  );
};

export default ElectricityExperiment;