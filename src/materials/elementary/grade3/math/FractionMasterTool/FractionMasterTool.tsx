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
  Divider
} from '@mui/material';
import { MaterialBase } from '../../../../../components/educational/MaterialBase';
import { useFractionLogic } from './hooks/useFractionLogic';
import {
  FractionVisualizer,
  FractionComparison,
  CommonDenominatorVisualizer,
  OperationSteps,
  FractionInput,
  LearningHints
} from './components';

export default function FractionMasterTool() {
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
    <MaterialBase
      material={{
        id: 'fraction-master',
        title: '分数マスターツール',
        description: '視覚的に分数を理解し、計算方法を段階的に学べる高度な学習ツール',
        grade: '小学3年生',
        subject: '算数',
        type: 'interactive',
        difficulty: 'medium'
      }}
    >
      <Container maxWidth="lg">
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

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    視覚表現を選択
                  </Typography>
                  <ToggleButtonGroup
                    value={visualType}
                    exclusive
                    onChange={(_, value) => value && setVisualType(value)}
                    sx={{ mb: 3, flexWrap: 'wrap' }}
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
                      size={250}
                      animated={true}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 3 }}>
                    分数を調整
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    <FractionInput
                      fraction={fractions[0]}
                      onChange={(f) => updateFraction(0, f)}
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
            onFractionsChange={updateFraction}
            compareFractions={compareFractions}
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

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FractionInput
                    fraction={fractions[0]}
                    onChange={(f) => updateFraction(0, f)}
                    label="最初の分数"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', pt: 3 }}>
                    <ToggleButtonGroup
                      value={selectedOperation}
                      exclusive
                      onChange={(_, value) => value && setSelectedOperation(value)}
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

                <Grid item xs={12} md={4}>
                  <FractionInput
                    fraction={fractions[1]}
                    onChange={(f) => updateFraction(1, f)}
                    label="2番目の分数"
                  />
                </Grid>
              </Grid>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={performOperation}
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
                onNextStep={nextStep}
                onPrevStep={prevStep}
              />
            )}
          </Box>
        )}

        {/* ヒントシステム */}
        <LearningHints
          hint={currentHint}
          showHint={showHint}
          onGenerateHint={generateHint}
          onCloseHint={() => setShowHint(false)}
        />
      </Container>
    </MaterialBase>
  );
}