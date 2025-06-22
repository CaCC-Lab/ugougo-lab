import React from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { MaterialWrapper, useLearningTrackerContext } from '../../../../../components/wrappers/MaterialWrapper';
import { useFractionLogic } from './hooks/useFractionLogic';
import {
  FractionVisualizer,
  FractionComparison,
  CommonDenominatorVisualizer,
  OperationSteps,
  FractionInput,
  LearningHints
} from './components';

// 分数マスターツール（内部コンポーネント）
const FractionMasterToolContent: React.FC = () => {
  const { recordInteraction, recordAnswer } = useLearningTrackerContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    mode,
    visualType,
    fractions,
    selectedOperation,
    operationSteps,
    currentStep,
    showHint,
    currentHint,
    setMode,
    setVisualType,
    updateFraction,
    setSelectedOperation,
    performOperation,
    nextStep,
    prevStep,
    generateHint,
    setShowHint,
    compareFractions,
    simplifyFraction,
    findCommonDenominator
  } = useFractionLogic();

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setMode(newValue as any);
    recordInteraction('click');
  };

  const visualTypes = [
    { value: 'pizza', label: 'ピザ' },
    { value: 'cake', label: 'ケーキ' },
    { value: 'chocolate', label: 'チョコ' },
    { value: 'circle', label: '円' },
    { value: 'rectangle', label: '長方形' }
  ];

  const operationTypes = [
    { value: 'add', label: '足し算' },
    { value: 'subtract', label: '引き算' },
    { value: 'multiply', label: 'かけ算' },
    { value: 'divide', label: '割り算' }
  ];

  return (
      <Container 
        maxWidth={isMobile ? "sm" : "lg"} 
        sx={{ 
          height: '100%', 
          overflow: 'auto',
          px: { xs: 1, sm: 3 }
        }}
      >
        <Tabs
          value={mode}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 4 }}
        >
          <Tab label="分数を探る" value="explore" />
          <Tab label="大小比較" value="compare" />
          <Tab label="通分を学ぶ" value="commonDenom" />
          <Tab label="四則演算" value="operations" />
        </Tabs>

        {/* 分数を探るモード */}
        {mode === 'explore' && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              分数の視覚的理解
            </Typography>

            <Grid container spacing={isMobile ? 2 : 3}>
              <Grid item xs={12} sm={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    視覚表現を選択
                  </Typography>
                  <ToggleButtonGroup
                    value={visualType}
                    exclusive
                    onChange={(_, value) => {
                      if (value) {
                        setVisualType(value);
                        recordInteraction('change');
                      }
                    }}
                    size={isMobile ? "small" : "medium"}
                    sx={{ 
                      mb: 3, 
                      flexWrap: 'wrap',
                      width: isMobile ? '100%' : 'auto',
                      '& .MuiToggleButton-root': {
                        minWidth: isMobile ? '48px' : '64px',
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                      }
                    }}
                  >
                    {visualTypes.map((type) => (
                      <ToggleButton key={type.value} value={type.value}>
                        {type.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>

                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <FractionVisualizer
                      fraction={fractions[0]}
                      visualType={visualType}
                      size={isMobile ? Math.min(200, window.innerWidth - 100) : 250}
                      animated={true}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 3 }}>
                    分数を調整
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    <FractionInput
                      fraction={fractions[0]}
                      onChange={(f) => {
                        updateFraction(0, f);
                        recordInteraction('input');
                      }}
                      label="分数の値"
                    />
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>分数の意味：</strong>
                    </Typography>
                    <Typography variant="body2">
                      • 分母（{fractions[0].denominator}）：全体を{fractions[0].denominator}個に分けました
                    </Typography>
                    <Typography variant="body2">
                      • 分子（{fractions[0].numerator}）：そのうちの{fractions[0].numerator}個分です
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      • 小数で表すと：{(fractions[0].numerator / fractions[0].denominator).toFixed(2)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* 大小比較モード */}
        {mode === 'compare' && (
          <FractionComparison
            fractions={fractions}
            onFractionsChange={(index, fraction) => {
              updateFraction(index, fraction);
              recordInteraction('input');
            }}
            compareFractions={(...args) => {
              const result = compareFractions(...args);
              recordInteraction('click');
              return result;
            }}
            findCommonDenominator={findCommonDenominator}
          />
        )}

        {/* 通分を学ぶモード */}
        {mode === 'commonDenom' && (
          <CommonDenominatorVisualizer
            fractions={fractions}
            findCommonDenominator={findCommonDenominator}
          />
        )}

        {/* 四則演算モード */}
        {mode === 'operations' && (
          <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                計算の設定
              </Typography>

              <Grid container spacing={isMobile ? 2 : 3}>
                <Grid item xs={12} sm={6} md={4}>
                  <FractionInput
                    fraction={fractions[0]}
                    onChange={(f) => updateFraction(0, f)}
                    label="最初の分数"
                  />
                </Grid>

                <Grid item xs={12} sm={12} md={4}>
                  <Box sx={{ textAlign: 'center', pt: 3 }}>
                    <ToggleButtonGroup
                      value={selectedOperation}
                      exclusive
                      onChange={(_, value) => {
                        if (value) {
                          setSelectedOperation(value);
                          recordInteraction('change');
                        }
                      }}
                      orientation="horizontal"
                    >
                      {operationTypes.map((type) => (
                        <ToggleButton key={type.value} value={type.value}>
                          {type.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FractionInput
                    fraction={fractions[1]}
                    onChange={(f) => {
                      updateFraction(1, f);
                      recordInteraction('input');
                    }}
                    label="2番目の分数"
                  />
                </Grid>
              </Grid>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    performOperation();
                    recordInteraction('click');
                    
                    // 計算結果を記録
                    const operation = selectedOperation;
                    const f1 = fractions[0];
                    const f2 = fractions[1];
                    const problem = `${f1.numerator}/${f1.denominator} ${operation === 'add' ? '+' : operation === 'subtract' ? '-' : operation === 'multiply' ? '×' : '÷'} ${f2.numerator}/${f2.denominator}`;
                    
                    // 演算の種類に応じて学習記録
                    recordAnswer(true, {
                      problem: problem,
                      operation: operation,
                      fractions: [f1, f2]
                    });
                  }}
                  sx={{ px: 4 }}
                >
                  計算を開始
                </Button>
              </Box>
            </Paper>

            {operationSteps.length > 0 && (
              <OperationSteps
                operationType={selectedOperation}
                steps={operationSteps}
                currentStep={currentStep}
                onNextStep={() => {
                  nextStep();
                  recordInteraction('click');
                }}
                onPrevStep={() => {
                  prevStep();
                  recordInteraction('click');
                }}
              />
            )}
          </Box>
        )}

        {/* ヒントシステム */}
        <LearningHints
          hint={currentHint}
          showHint={showHint}
          onGenerateHint={() => {
            generateHint();
            recordInteraction('click');
          }}
          onCloseHint={() => {
            setShowHint(false);
            recordInteraction('click');
          }}
        />
      </Container>
  );
};

// 分数マスターツール（MaterialWrapperでラップ）
export default function FractionMasterTool() {
  return (
    <MaterialWrapper
      materialId="fraction-master"
      materialName="分数マスターツール"
      showMetricsButton={true}
      showAssistant={true}
    >
      <FractionMasterToolContent />
    </MaterialWrapper>
  );
}