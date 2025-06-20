import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Paper,
  Chip,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Stage, Layer, Line, Circle, Text, Arrow } from 'react-konva';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

interface DataPoint {
  x: number;
  y: number;
}

interface Example {
  id: string;
  title: string;
  xLabel: string;
  yLabel: string;
  xUnit: string;
  yUnit: string;
  type: 'proportion' | 'inverse';
  coefficient: number;
  description: string;
}

interface ProportionGraphToolProps {
  onClose?: () => void;
}

// 比例・反比例グラフツール（内部コンポーネント）
const ProportionGraphToolContent: React.FC<ProportionGraphToolProps> = ({ onClose }) => {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const theme = useTheme();
  const stageRef = useRef<any>(null);
  const [graphType, setGraphType] = useState<'proportion' | 'inverse'>('proportion');
  const [selectedExample, setSelectedExample] = useState<string>('speed');
  const [coefficient, setCoefficient] = useState<number>(60);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [customX, setCustomX] = useState<string>('');
  const [customY, setCustomY] = useState<string>('');

  // 実生活の例題
  const examples: Example[] = [
    {
      id: 'speed',
      title: '速さと時間',
      xLabel: '時間',
      yLabel: '距離',
      xUnit: '時間',
      yUnit: 'km',
      type: 'proportion',
      coefficient: 60,
      description: '一定の速さで進むと、時間に比例して距離が増えます',
    },
    {
      id: 'price',
      title: '値段と個数',
      xLabel: '個数',
      yLabel: '値段',
      xUnit: '個',
      yUnit: '円',
      type: 'proportion',
      coefficient: 120,
      description: '商品の個数に比例して値段が増えます',
    },
    {
      id: 'work',
      title: '仕事量と人数',
      xLabel: '人数',
      yLabel: '時間',
      xUnit: '人',
      yUnit: '時間',
      type: 'inverse',
      coefficient: 24,
      description: '人数が増えると、仕事にかかる時間は反比例して減ります',
    },
    {
      id: 'area',
      title: '長方形の縦と横',
      xLabel: '横の長さ',
      yLabel: '縦の長さ',
      xUnit: 'cm',
      yUnit: 'cm',
      type: 'inverse',
      coefficient: 48,
      description: '面積が一定の長方形では、横が長くなると縦は短くなります',
    },
  ];

  const currentExample = examples.find(ex => ex.id === selectedExample) || examples[0];

  // グラフサイズ
  const graphWidth = 600;
  const graphHeight = 400;
  const padding = 60;
  const graphInnerWidth = graphWidth - 2 * padding;
  const graphInnerHeight = graphHeight - 2 * padding;

  // データポイントの生成
  useEffect(() => {
    const points: DataPoint[] = [];
    const maxX = graphType === 'proportion' ? 10 : 20;
    
    for (let i = 0; i <= 10; i++) {
      const x = (maxX / 10) * i;
      if (graphType === 'proportion') {
        points.push({ x, y: coefficient * x });
      } else {
        if (x > 0) {
          points.push({ x, y: coefficient / x });
        }
      }
    }
    setDataPoints(points);
  }, [graphType, coefficient]);

  // アニメーション処理
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 1) {
            setIsAnimating(false);
            
            // アニメーション完了を記録
            recordAnswer(true, {
              problem: 'グラフ描画アニメーションの完了',
              userAnswer: `${currentExample.title}のグラフ描画を完了`,
              correctAnswer: 'グラフの形状と特徴の理解',
              animationComplete: {
                graphType: graphType,
                coefficient: coefficient,
                example: selectedExample,
                exampleTitle: currentExample.title,
                equation: graphType === 'proportion' ? `y = ${coefficient} × x` : `y = ${coefficient} ÷ x`,
                graphCharacteristics: graphType === 'proportion' ? '原点を通る直線' : '双曲線'
              }
            });
            
            return 1;
          }
          return prev + 0.02;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isAnimating, graphType, coefficient, selectedExample, currentExample]);

  // グラフのスケール計算
  const xScale = (x: number) => {
    const maxX = graphType === 'proportion' ? 10 : 20;
    return padding + (x / maxX) * graphInnerWidth;
  };

  const yScale = (y: number) => {
    const maxY = graphType === 'proportion' ? coefficient * 10 : coefficient;
    return graphHeight - padding - (y / maxY) * graphInnerHeight;
  };

  // グリッド線の描画
  const renderGrid = () => {
    const lines = [];
    const gridCount = 10;

    // 縦線
    for (let i = 0; i <= gridCount; i++) {
      const x = padding + (graphInnerWidth / gridCount) * i;
      lines.push(
        <Line
          key={`v-${i}`}
          points={[x, padding, x, graphHeight - padding]}
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      );
    }

    // 横線
    for (let i = 0; i <= gridCount; i++) {
      const y = padding + (graphInnerHeight / gridCount) * i;
      lines.push(
        <Line
          key={`h-${i}`}
          points={[padding, y, graphWidth - padding, y]}
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      );
    }

    return lines;
  };

  // 軸の描画
  const renderAxes = () => {
    return (
      <>
        {/* X軸 */}
        <Arrow
          points={[padding, graphHeight - padding, graphWidth - padding + 10, graphHeight - padding]}
          stroke="#333"
          strokeWidth={2}
          fill="#333"
        />
        {/* Y軸 */}
        <Arrow
          points={[padding, graphHeight - padding, padding, padding - 10]}
          stroke="#333"
          strokeWidth={2}
          fill="#333"
        />
        {/* 軸ラベル */}
        <Text
          x={graphWidth - padding - 30}
          y={graphHeight - padding + 20}
          text={`${currentExample.xLabel}(${currentExample.xUnit})`}
          fontSize={14}
          fill="#333"
        />
        <Text
          x={padding - 50}
          y={padding - 30}
          text={`${currentExample.yLabel}(${currentExample.yUnit})`}
          fontSize={14}
          fill="#333"
        />
      </>
    );
  };

  // グラフの描画
  const renderGraph = () => {
    const visiblePoints = dataPoints.slice(0, Math.ceil(dataPoints.length * animationProgress));
    
    if (visiblePoints.length < 2) return null;

    const linePoints = visiblePoints.flatMap(point => [
      xScale(point.x),
      yScale(point.y),
    ]);

    return (
      <>
        <Line
          points={linePoints}
          stroke={theme.palette.primary.main}
          strokeWidth={3}
          lineCap="round"
          lineJoin="round"
        />
        {visiblePoints.map((point, index) => (
          <Circle
            key={index}
            x={xScale(point.x)}
            y={yScale(point.y)}
            radius={4}
            fill={theme.palette.primary.main}
          />
        ))}
      </>
    );
  };

  // 目盛りの描画
  const renderScale = () => {
    const scaleElements = [];
    const scaleCount = 10;
    const maxX = graphType === 'proportion' ? 10 : 20;
    const maxY = graphType === 'proportion' ? coefficient * 10 : coefficient;

    // X軸の目盛り
    for (let i = 0; i <= scaleCount; i++) {
      const x = padding + (graphInnerWidth / scaleCount) * i;
      const value = (maxX / scaleCount) * i;
      scaleElements.push(
        <Text
          key={`x-${i}`}
          x={x - 10}
          y={graphHeight - padding + 10}
          text={value.toString()}
          fontSize={12}
          fill="#666"
        />
      );
    }

    // Y軸の目盛り
    for (let i = 0; i <= scaleCount; i++) {
      const y = graphHeight - padding - (graphInnerHeight / scaleCount) * i;
      const value = (maxY / scaleCount) * i;
      scaleElements.push(
        <Text
          key={`y-${i}`}
          x={padding - 30}
          y={y - 5}
          text={value.toFixed(0)}
          fontSize={12}
          fill="#666"
        />
      );
    }

    return scaleElements;
  };

  // カスタム値の追加
  const handleAddCustomValue = () => {
    const x = parseFloat(customX);
    const y = parseFloat(customY);
    
    recordInteraction('click');
    
    if (!isNaN(x) && !isNaN(y) && x > 0) {
      // 比例・反比例の関係をチェック
      const expectedY = graphType === 'proportion' ? coefficient * x : coefficient / x;
      const tolerance = Math.abs(expectedY) * 0.1; // 10%の誤差を許容
      const isCorrect = Math.abs(y - expectedY) <= tolerance;
      
      // 値予想の結果を記録
      recordAnswer(isCorrect, {
        problem: `${currentExample.title}の値予想`,
        userAnswer: `${currentExample.xLabel}=${x} → ${currentExample.yLabel}=${y}`,
        correctAnswer: `${currentExample.xLabel}=${x} → ${currentExample.yLabel}=${expectedY.toFixed(2)}`,
        predictionData: {
          inputX: x,
          predictedY: y,
          expectedY: expectedY,
          difference: Math.abs(y - expectedY),
          tolerance: tolerance,
          isWithinTolerance: isCorrect,
          graphType: graphType,
          coefficient: coefficient,
          equation: graphType === 'proportion' ? `y = ${coefficient} × x` : `y = ${coefficient} ÷ x`
        }
      });
      
      if (isCorrect) {
        setCustomX('');
        setCustomY('');
        // 正解のフィードバック
      }
    }
  };

  // 表データの生成
  const generateTableData = () => {
    const data = [];
    const count = 6;
    const maxX = graphType === 'proportion' ? 10 : 20;
    
    for (let i = 1; i <= count; i++) {
      const x = (maxX / count) * i;
      const y = graphType === 'proportion' ? coefficient * x : coefficient / x;
      data.push({ x: x.toFixed(1), y: y.toFixed(1) });
    }
    
    return data;
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          比例・反比例グラフツール
        </Typography>
        <Tooltip title="使い方">
          <IconButton onClick={() => {
            const newShowExplanation = !showExplanation;
            setShowExplanation(newShowExplanation);
            recordInteraction('click');
            
            // ヘルプ表示切り替えを記録
            recordAnswer(true, {
              problem: 'ヘルプ・使い方の表示',
              userAnswer: newShowExplanation ? 'ヘルプを表示' : 'ヘルプを非表示',
              correctAnswer: 'ツールの使用方法理解',
              helpAction: {
                isShowing: newShowExplanation,
                currentSettings: {
                  graphType: graphType,
                  example: selectedExample,
                  coefficient: coefficient
                }
              }
            });
          }}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {showExplanation && (
        <Alert severity="info" sx={{ mb: 3 }}>
          比例と反比例の関係をグラフで学習できます。実生活の例を選んで、
          値の変化を観察してみましょう。表とグラフが連動して変化します。
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* 左側：コントロール */}
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          {/* グラフタイプ選択 */}
          <ToggleButtonGroup
            value={graphType}
            exclusive
            onChange={(_, value) => {
              if (value) {
                recordInteraction('click');
                
                // グラフタイプ変更を記録
                recordAnswer(true, {
                  problem: '比例・反比例の切り替え',
                  userAnswer: `${value === 'proportion' ? '比例' : '反比例'}を選択`,
                  correctAnswer: '比例・反比例の理解',
                  graphTypeChange: {
                    from: graphType,
                    to: value,
                    previousExample: selectedExample,
                    previousCoefficient: coefficient
                  }
                });
                
                setGraphType(value);
                const newExample = examples.find(ex => ex.type === value);
                if (newExample) {
                  setSelectedExample(newExample.id);
                  setCoefficient(newExample.coefficient);
                }
              }
            }}
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="proportion">
              比例
            </ToggleButton>
            <ToggleButton value="inverse">
              反比例
            </ToggleButton>
          </ToggleButtonGroup>

          {/* 例題選択 */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>実生活の例</InputLabel>
            <Select
              value={selectedExample}
              onChange={(e) => {
                const newExampleId = e.target.value;
                recordInteraction('click');
                
                const example = examples.find(ex => ex.id === newExampleId);
                if (example) {
                  // 実例変更を記録
                  recordAnswer(true, {
                    problem: '実生活の例の選択',
                    userAnswer: `${example.title}を選択`,
                    correctAnswer: '実生活との関連付け',
                    exampleChange: {
                      from: selectedExample,
                      to: newExampleId,
                      exampleTitle: example.title,
                      description: example.description,
                      graphType: example.type,
                      coefficient: example.coefficient,
                      xLabel: example.xLabel,
                      yLabel: example.yLabel
                    }
                  });
                  
                  setSelectedExample(newExampleId);
                  setCoefficient(example.coefficient);
                  setGraphType(example.type);
                }
              }}
              label="実生活の例"
            >
              {examples
                .filter(ex => ex.type === graphType)
                .map(ex => (
                  <MenuItem key={ex.id} value={ex.id}>
                    {ex.title}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* 係数調整 */}
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              {graphType === 'proportion' ? '比例定数' : '反比例の定数'}: {coefficient}
            </Typography>
            <Slider
              value={coefficient}
              onChange={(_, value) => {
                const newCoefficient = value as number;
                setCoefficient(newCoefficient);
                recordInteraction('slider');
                
                // 係数変更を記録（重要な値で）
                if (newCoefficient % 20 === 0) { // 20の倍数での記録
                  recordAnswer(true, {
                    problem: '比例・反比例の定数調整',
                    userAnswer: `定数を${newCoefficient}に設定`,
                    correctAnswer: '定数と関数の関係理解',
                    coefficientChange: {
                      value: newCoefficient,
                      graphType: graphType,
                      example: selectedExample,
                      equation: graphType === 'proportion' ? `y = ${newCoefficient} × x` : `y = ${newCoefficient} ÷ x`
                    }
                  });
                }
              }}
              min={10}
              max={200}
              step={10}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          {/* 説明 */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary">
              {currentExample.description}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {graphType === 'proportion' 
                ? `y = ${coefficient} × x`
                : `y = ${coefficient} ÷ x`}
            </Typography>
          </Paper>

          {/* アニメーションボタン */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<PlayArrowIcon />}
            onClick={() => {
              setAnimationProgress(0);
              setIsAnimating(true);
              recordInteraction('click');
              
              // グラフ描画開始を記録
              recordAnswer(true, {
                problem: 'グラフ描画アニメーションの実行',
                userAnswer: `${currentExample.title}のグラフを描画`,
                correctAnswer: 'グラフの生成プロセス理解',
                animationStart: {
                  graphType: graphType,
                  coefficient: coefficient,
                  example: selectedExample,
                  exampleTitle: currentExample.title,
                  equation: graphType === 'proportion' ? `y = ${coefficient} × x` : `y = ${coefficient} ÷ x`
                }
              });
            }}
            disabled={isAnimating}
            sx={{ mb: 2 }}
          >
            グラフを描画
          </Button>

          {/* 値の関係を示す表 */}
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{currentExample.xLabel}</TableCell>
                  <TableCell>{currentExample.yLabel}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {generateTableData().map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.x}</TableCell>
                    <TableCell>{row.y}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* カスタム値入力 */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              値を予想してみよう
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label={currentExample.xLabel}
                value={customX}
                onChange={(e) => setCustomX(e.target.value)}
                size="small"
                type="number"
                sx={{ flex: 1 }}
              />
              <Typography>=</Typography>
              <TextField
                label={currentExample.yLabel}
                value={customY}
                onChange={(e) => setCustomY(e.target.value)}
                size="small"
                type="number"
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddCustomValue}
              >
                確認
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* 右側：グラフ */}
        <Box sx={{ flex: '1 1 400px' }}>
          <Paper sx={{ p: 2 }}>
            <Stage width={graphWidth} height={graphHeight} ref={stageRef}>
              <Layer>
                {renderGrid()}
                {renderAxes()}
                {renderScale()}
                {animationProgress > 0 && renderGraph()}
              </Layer>
            </Stage>
          </Paper>

          {/* グラフの特徴 */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={graphType === 'proportion' ? '原点を通る直線' : '双曲線'}
              color="primary"
              size="small"
            />
            <Chip
              label={graphType === 'proportion' ? 'xが2倍→yも2倍' : 'xが2倍→yは半分'}
              color="secondary"
              size="small"
            />
            <Chip
              label={`${currentExample.xLabel}と${currentExample.yLabel}の関係`}
              size="small"
            />
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

// 比例・反比例グラフツール（MaterialWrapperでラップ）
const ProportionGraphTool: React.FC<ProportionGraphToolProps> = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="proportion-graph-tool"
      materialName="比例・反比例グラフツール"
      showMetricsButton={true}
      showAssistant={true}
    >
      <ProportionGraphToolContent onClose={onClose} />
    </MaterialWrapper>
  );
};

export default ProportionGraphTool;