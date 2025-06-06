import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Button,
  ButtonGroup,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import { Stage, Layer, Rect, Line, Text as KonvaText, Group } from 'react-konva';
import type { ModuleComponentProps, Shape3D } from '../types';

interface ShapeStep {
  title: string;
  description: string;
  visualization: React.FC<{ dimensions: Shape3D['dimensions'] }>;
  formula: string;
}

const RectangleVisualization: React.FC<{ dimensions: Shape3D['dimensions'] }> = ({ dimensions }) => {
  const { width = 100, height = 60 } = dimensions;
  const scale = 3;
  
  return (
    <Stage width={400} height={300}>
      <Layer>
        {/* 長方形 */}
        <Rect
          x={50}
          y={50}
          width={width * scale}
          height={height * scale}
          fill="#E3F2FD"
          stroke="#1976D2"
          strokeWidth={2}
        />
        
        {/* グリッド線でマス目を表示 */}
        {Array.from({ length: Math.floor(width / 10) }).map((_, i) => (
          <Line
            key={`v-${i}`}
            points={[50 + (i + 1) * 10 * scale, 50, 50 + (i + 1) * 10 * scale, 50 + height * scale]}
            stroke="#90CAF9"
            strokeWidth={1}
            dash={[5, 5]}
          />
        ))}
        {Array.from({ length: Math.floor(height / 10) }).map((_, i) => (
          <Line
            key={`h-${i}`}
            points={[50, 50 + (i + 1) * 10 * scale, 50 + width * scale, 50 + (i + 1) * 10 * scale]}
            stroke="#90CAF9"
            strokeWidth={1}
            dash={[5, 5]}
          />
        ))}
        
        {/* 寸法 */}
        <KonvaText
          x={50 + width * scale / 2 - 20}
          y={20}
          text={`横: ${width}cm`}
          fontSize={16}
          fill="#1976D2"
        />
        <KonvaText
          x={10}
          y={50 + height * scale / 2}
          text={`縦: ${height}cm`}
          fontSize={16}
          fill="#1976D2"
        />
        
        {/* 面積表示 */}
        <KonvaText
          x={50 + width * scale / 2 - 30}
          y={50 + height * scale / 2}
          text={`${width * height}cm²`}
          fontSize={24}
          fill="#F44336"
          fontStyle="bold"
        />
      </Layer>
    </Stage>
  );
};

const TriangleVisualization: React.FC<{ dimensions: Shape3D['dimensions'] }> = ({ dimensions }) => {
  const { width = 100, height = 60 } = dimensions;
  const scale = 3;
  
  return (
    <Stage width={400} height={300}>
      <Layer>
        {/* 元の長方形（薄く表示） */}
        <Rect
          x={50}
          y={50}
          width={width * scale}
          height={height * scale}
          fill="#FFF3E0"
          stroke="#FFB74D"
          strokeWidth={1}
          opacity={0.3}
        />
        
        {/* 三角形 */}
        <Line
          points={[50, 50 + height * scale, 50 + width * scale, 50 + height * scale, 50, 50, 50, 50 + height * scale]}
          fill="#FFE0B2"
          stroke="#FF6F00"
          strokeWidth={2}
          closed
        />
        
        {/* 対角線 */}
        <Line
          points={[50, 50 + height * scale, 50 + width * scale, 50]}
          stroke="#F44336"
          strokeWidth={2}
          dash={[10, 10]}
        />
        
        {/* 寸法 */}
        <KonvaText
          x={50 + width * scale / 2 - 20}
          y={50 + height * scale + 10}
          text={`底辺: ${width}cm`}
          fontSize={16}
          fill="#FF6F00"
        />
        <KonvaText
          x={10}
          y={50 + height * scale / 2}
          text={`高さ: ${height}cm`}
          fontSize={16}
          fill="#FF6F00"
        />
        
        {/* 説明 */}
        <KonvaText
          x={50}
          y={250}
          text="長方形の半分が三角形！"
          fontSize={14}
          fill="#666"
        />
      </Layer>
    </Stage>
  );
};

const CubeVisualization: React.FC<{ dimensions: Shape3D['dimensions'] }> = ({ dimensions }) => {
  const { width = 50, height = 50, depth = 50 } = dimensions;
  const scale = 2;
  const offset = 30;
  
  return (
    <Stage width={400} height={300}>
      <Layer>
        {/* 立方体の各面 */}
        <Group>
          {/* 前面 */}
          <Rect
            x={100}
            y={100}
            width={width * scale}
            height={height * scale}
            fill="#E1F5FE"
            stroke="#0277BD"
            strokeWidth={2}
          />
          
          {/* 上面 */}
          <Line
            points={[
              100, 100,
              100 + offset, 100 - offset,
              100 + width * scale + offset, 100 - offset,
              100 + width * scale, 100,
              100, 100
            ]}
            fill="#B3E5FC"
            stroke="#0277BD"
            strokeWidth={2}
            closed
          />
          
          {/* 右面 */}
          <Line
            points={[
              100 + width * scale, 100,
              100 + width * scale + offset, 100 - offset,
              100 + width * scale + offset, 100 + height * scale - offset,
              100 + width * scale, 100 + height * scale,
              100 + width * scale, 100
            ]}
            fill="#81D4FA"
            stroke="#0277BD"
            strokeWidth={2}
            closed
          />
          
          {/* 単位立方体を表示 */}
          {Array.from({ length: Math.floor(width / 10) }).map((_, x) =>
            Array.from({ length: Math.floor(height / 10) }).map((_, y) => (
              <Rect
                key={`unit-${x}-${y}`}
                x={100 + x * 10 * scale}
                y={100 + y * 10 * scale}
                width={10 * scale}
                height={10 * scale}
                stroke="#4FC3F7"
                strokeWidth={0.5}
              />
            ))
          )}
        </Group>
        
        {/* 寸法 */}
        <KonvaText
          x={100 + width * scale / 2 - 30}
          y={100 + height * scale + 10}
          text={`横: ${width}cm`}
          fontSize={14}
          fill="#0277BD"
        />
        <KonvaText
          x={50}
          y={100 + height * scale / 2}
          text={`縦: ${height}cm`}
          fontSize={14}
          fill="#0277BD"
        />
        <KonvaText
          x={100 + width * scale + offset + 10}
          y={100 + height * scale / 2 - offset / 2}
          text={`奥行き: ${depth}cm`}
          fontSize={14}
          fill="#0277BD"
        />
        
        {/* 体積表示 */}
        <KonvaText
          x={150}
          y={250}
          text={`体積: ${width * height * depth}cm³`}
          fontSize={20}
          fill="#F44336"
          fontStyle="bold"
        />
      </Layer>
    </Stage>
  );
};

export const AreaVolumeExplorer: React.FC<ModuleComponentProps> = ({ onConceptMastered, progress }) => {
  const [shapeType, setShapeType] = useState<'rectangle' | 'triangle' | 'cube'>('rectangle');
  const [dimensions, setDimensions] = useState<Shape3D['dimensions']>({
    width: 60,
    height: 40,
    depth: 50
  });
  const [activeStep, setActiveStep] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);

  const shapeSteps: Record<string, ShapeStep[]> = {
    rectangle: [
      {
        title: 'マス目を数えよう',
        description: '1cm×1cmのマス目がいくつあるか数えてみよう',
        visualization: RectangleVisualization,
        formula: '面積 = 横 × 縦'
      },
      {
        title: '公式の意味',
        description: '横にマス目が何個、それが縦に何列あるかを考えよう',
        visualization: RectangleVisualization,
        formula: `${dimensions.width} × ${dimensions.height} = ${dimensions.width * dimensions.height}`
      }
    ],
    triangle: [
      {
        title: '長方形から考える',
        description: '三角形は長方形の半分だよ',
        visualization: TriangleVisualization,
        formula: '面積 = 底辺 × 高さ ÷ 2'
      },
      {
        title: '公式の理由',
        description: '長方形の面積を2で割ると三角形の面積になる',
        visualization: TriangleVisualization,
        formula: `${dimensions.width} × ${dimensions.height} ÷ 2 = ${(dimensions.width * dimensions.height) / 2}`
      }
    ],
    cube: [
      {
        title: '単位立方体を数えよう',
        description: '1cm×1cm×1cmの立方体がいくつあるか考えよう',
        visualization: CubeVisualization,
        formula: '体積 = 横 × 縦 × 奥行き'
      },
      {
        title: '層で考える',
        description: '底面積の長方形が何層重なっているか',
        visualization: CubeVisualization,
        formula: `${dimensions.width} × ${dimensions.height} × ${dimensions.depth} = ${dimensions.width * dimensions.height * dimensions.depth}`
      }
    ]
  };

  const currentSteps = shapeSteps[shapeType];

  const handleShapeChange = (newShape: 'rectangle' | 'triangle' | 'cube') => {
    setShapeType(newShape);
    setActiveStep(0);
    setShowChallenge(false);
  };

  const handleStepComplete = () => {
    if (activeStep < currentSteps.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      onConceptMastered(`${shapeType}-formula`);
      setShowChallenge(true);
    }
  };

  const CurrentVisualization = currentSteps[activeStep].visualization;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* 形状選択 */}
        <Grid item xs={12}>
          <ButtonGroup variant="outlined" fullWidth>
            <Button
              variant={shapeType === 'rectangle' ? 'contained' : 'outlined'}
              onClick={() => handleShapeChange('rectangle')}
              startIcon={progress['rectangle-formula'] && '✓'}
            >
              長方形の面積
            </Button>
            <Button
              variant={shapeType === 'triangle' ? 'contained' : 'outlined'}
              onClick={() => handleShapeChange('triangle')}
              startIcon={progress['triangle-formula'] && '✓'}
            >
              三角形の面積
            </Button>
            <Button
              variant={shapeType === 'cube' ? 'contained' : 'outlined'}
              onClick={() => handleShapeChange('cube')}
              startIcon={progress['cube-formula'] && '✓'}
            >
              立方体の体積
            </Button>
          </ButtonGroup>
        </Grid>

        {/* メインコンテンツ */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                寸法を調整しよう
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  横: {dimensions.width}cm
                </Typography>
                <Slider
                  value={dimensions.width}
                  onChange={(_, value) => setDimensions({ ...dimensions, width: value as number })}
                  min={20}
                  max={100}
                  step={10}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  縦（高さ）: {dimensions.height}cm
                </Typography>
                <Slider
                  value={dimensions.height}
                  onChange={(_, value) => setDimensions({ ...dimensions, height: value as number })}
                  min={20}
                  max={80}
                  step={10}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              {shapeType === 'cube' && (
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>
                    奥行き: {dimensions.depth}cm
                  </Typography>
                  <Slider
                    value={dimensions.depth}
                    onChange={(_, value) => setDimensions({ ...dimensions, depth: value as number })}
                    min={20}
                    max={80}
                    step={10}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}

              {/* ステップ表示 */}
              <Stepper activeStep={activeStep} orientation="vertical">
                {currentSteps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel>{step.title}</StepLabel>
                    <StepContent>
                      <Typography variant="body2" paragraph>
                        {step.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={step.formula}
                          color="primary"
                          sx={{ fontSize: '16px', py: 2 }}
                        />
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              <Button
                variant="contained"
                onClick={handleStepComplete}
                sx={{ mt: 2 }}
                fullWidth
              >
                {activeStep < currentSteps.length - 1 ? '次のステップ' : '理解できた！'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* ビジュアライゼーション */}
        <Grid item xs={12} md={6}>
          <motion.div
            key={`${shapeType}-${activeStep}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  図で理解しよう
                </Typography>
                <CurrentVisualization dimensions={dimensions} />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* チャレンジ問題 */}
        {showChallenge && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert severity="success">
                <Typography variant="h6" gutterBottom>
                  すばらしい！公式の意味が理解できました
                </Typography>
                <Typography variant="body2">
                  公式は覚えるものではなく、理解するものです。
                  なぜそうなるのかがわかれば、忘れても自分で導き出せます！
                </Typography>
              </Alert>
            </motion.div>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};