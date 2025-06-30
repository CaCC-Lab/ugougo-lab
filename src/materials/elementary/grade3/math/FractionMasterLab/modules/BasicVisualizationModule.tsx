/**
 * 基本視覚化モジュール
 * 「まなぶモード」- 分数の基本概念を視覚的に学習
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Button,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Zoom,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';

// 視覚化コンポーネント
import { FractionCircleVisualization } from '../components/FractionCircleVisualization';
import { FractionBarVisualization } from '../components/FractionBarVisualization';
import { FractionNumberLine } from '../components/FractionNumberLine';

interface BasicVisualizationModuleProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface LearningStep {
  id: string;
  title: string;
  description: string;
  targetFraction: { numerator: number; denominator: number };
  hint: string;
  visualizationType: 'circle' | 'bar' | 'numberline';
}

export const BasicVisualizationModule: React.FC<BasicVisualizationModuleProps> = ({
  onComplete,
  onBack
}) => {
  const theme = useTheme();
  
  // 現在の分数
  const [numerator, setNumerator] = useState(1);
  const [denominator, setDenominator] = useState(2);
  
  // 学習進捗
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  
  // UI状態
  const [visualizationType, setVisualizationType] = useState<'circle' | 'bar' | 'numberline'>('circle');
  const [showHint, setShowHint] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 学習ステップ定義
  const learningSteps: LearningStep[] = [
    {
      id: 'half',
      title: '2分の1を作ろう',
      description: '全体を2つに分けて、1つの部分を表してみましょう',
      targetFraction: { numerator: 1, denominator: 2 },
      hint: '分母を2に、分子を1に設定してみましょう',
      visualizationType: 'circle'
    },
    {
      id: 'quarter',
      title: '4分の1を作ろう',
      description: '全体を4つに分けて、1つの部分を表してみましょう',
      targetFraction: { numerator: 1, denominator: 4 },
      hint: '分母を4に、分子を1に設定してみましょう',
      visualizationType: 'bar'
    },
    {
      id: 'three_quarters',
      title: '4分の3を作ろう',
      description: '全体を4つに分けて、3つの部分を表してみましょう',
      targetFraction: { numerator: 3, denominator: 4 },
      hint: '分母を4に、分子を3に設定してみましょう',
      visualizationType: 'circle'
    },
    {
      id: 'thirds',
      title: '3分の2を作ろう',
      description: '全体を3つに分けて、2つの部分を表してみましょう',
      targetFraction: { numerator: 2, denominator: 3 },
      hint: '分母を3に、分子を2に設定してみましょう',
      visualizationType: 'numberline'
    },
    {
      id: 'sixths',
      title: '6分の5を作ろう',
      description: '全体を6つに分けて、5つの部分を表してみましょう',
      targetFraction: { numerator: 5, denominator: 6 },
      hint: '分母を6に、分子を5に設定してみましょう',
      visualizationType: 'bar'
    }
  ];

  const currentStepData = learningSteps[currentStep];

  // 分数が正解かチェック
  const checkAnswer = useCallback(() => {
    const target = currentStepData.targetFraction;
    return numerator === target.numerator && denominator === target.denominator;
  }, [numerator, denominator, currentStepData]);

  // 正解時の処理
  const handleCorrectAnswer = useCallback(() => {
    if (!completedSteps.includes(currentStep)) {
      const newCompletedSteps = [...completedSteps, currentStep];
      setCompletedSteps(newCompletedSteps);
      setScore(prev => prev + 20); // 各ステップ20点
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        if (currentStep < learningSteps.length - 1) {
          setCurrentStep(prev => prev + 1);
          // 次のステップに合わせて視覚化タイプを変更
          setVisualizationType(learningSteps[currentStep + 1].visualizationType);
        } else {
          // 全ステップ完了
          onComplete(score + 20);
        }
      }, 2000);
    }
  }, [currentStep, completedSteps, score, onComplete]);

  // 分数変更時の正解チェック
  useEffect(() => {
    if (checkAnswer()) {
      handleCorrectAnswer();
    }
  }, [numerator, denominator, checkAnswer, handleCorrectAnswer]);

  // 視覚化タイプに応じた最大値設定
  const getMaxValue = () => {
    switch (visualizationType) {
      case 'circle':
      case 'bar':
        return 12;
      case 'numberline':
        return 10;
      default:
        return 12;
    }
  };

  // 現在のステップに合わせて視覚化タイプを更新
  useEffect(() => {
    if (currentStepData) {
      setVisualizationType(currentStepData.visualizationType);
    }
  }, [currentStepData]);

  // 分数の簡約
  const getSimplifiedFraction = () => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(numerator, denominator);
    return {
      numerator: numerator / divisor,
      denominator: denominator / divisor
    };
  };

  const simplified = getSimplifiedFraction();
  const isSimplified = simplified.numerator === numerator && simplified.denominator === denominator;

  return (
    <Box sx={{ p: 3, minHeight: '100%', bgcolor: 'background.default' }}>
      {/* ヘッダー */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={onBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6">
                まなぶモード
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ステップ {currentStep + 1} / {learningSteps.length}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`スコア: ${score}`} 
              color="primary" 
              variant="outlined" 
            />
            <IconButton onClick={() => setShowHint(!showHint)}>
              <HelpIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* 進捗バー */}
        <LinearProgress 
          variant="determinate" 
          value={(completedSteps.length / learningSteps.length) * 100}
          sx={{ mt: 2, height: 8, borderRadius: 4 }}
        />
      </Paper>

      <Grid container spacing={3}>
        {/* 学習ステップ */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <LightbulbIcon sx={{ mr: 1, color: 'warning.main' }} />
                今回の課題
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  {currentStepData.title}
                </Typography>
                <Typography variant="body2">
                  {currentStepData.description}
                </Typography>
              </Alert>

              {showHint && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    💡 ヒント: {currentStepData.hint}
                  </Typography>
                </Alert>
              )}

              {/* 分数入力 */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  分数を作ってみよう
                </Typography>
                
                {/* 分子 */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    分子（上の数）: {numerator}
                  </Typography>
                  <Slider
                    value={numerator}
                    onChange={(_, value) => setNumerator(value as number)}
                    min={0}
                    max={denominator}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ mb: 1 }}
                  />
                </Box>

                {/* 分母 */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    分母（下の数）: {denominator}
                  </Typography>
                  <Slider
                    value={denominator}
                    onChange={(_, value) => setDenominator(value as number)}
                    min={1}
                    max={getMaxValue()}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ mb: 1 }}
                  />
                </Box>

                {/* 現在の分数表示 */}
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: checkAnswer() ? 'success.light' : 'background.paper'
                  }}
                >
                  <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
                    {numerator}/{denominator}
                  </Typography>
                  {!isSimplified && (
                    <Typography variant="body2" color="text.secondary">
                      簡約: {simplified.numerator}/{simplified.denominator}
                    </Typography>
                  )}
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 視覚化エリア */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  視覚化
                </Typography>
                <FormControl size="small">
                  <InputLabel>表示タイプ</InputLabel>
                  <Select
                    value={visualizationType}
                    onChange={(e) => setVisualizationType(e.target.value as any)}
                    label="表示タイプ"
                  >
                    <MenuItem value="circle">円グラフ</MenuItem>
                    <MenuItem value="bar">棒グラフ</MenuItem>
                    <MenuItem value="numberline">数直線</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {visualizationType === 'circle' && (
                  <FractionCircleVisualization 
                    numerator={numerator}
                    denominator={denominator}
                    size={300}
                    animationDelay={0}
                  />
                )}
                {visualizationType === 'bar' && (
                  <FractionBarVisualization 
                    numerator={numerator}
                    denominator={denominator}
                    width={400}
                    height={100}
                  />
                )}
                {visualizationType === 'numberline' && (
                  <FractionNumberLine 
                    numerator={numerator}
                    denominator={denominator}
                    width={500}
                    max={2}
                  />
                )}
              </Box>

              {/* 分数の説明 */}
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  {numerator === 0 ? 
                    '0は「何もない」を表します' :
                    numerator === denominator ?
                    `${numerator}/${denominator} = 1 (全体と同じ)` :
                    numerator > denominator ?
                    `${numerator}/${denominator} > 1 (全体より大きい)` :
                    `${numerator}/${denominator} < 1 (全体より小さい)`
                  }
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 成功メッセージ */}
      <Zoom in={showSuccess}>
        <Fab
          color="success"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 80,
            height: 80
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 40 }} />
        </Fab>
      </Zoom>

      {/* 完了時の処理 */}
      {completedSteps.length === learningSteps.length && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            🎉 おめでとうございます！
          </Typography>
          <Typography variant="body2">
            基本の視覚化をマスターしました！次は「つかうモード」に挑戦してみましょう。
          </Typography>
        </Alert>
      )}
    </Box>
  );
};