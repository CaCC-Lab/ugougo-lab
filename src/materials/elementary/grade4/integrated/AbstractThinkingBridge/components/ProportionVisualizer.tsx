import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { Stage, Layer, Line, Circle, Text as KonvaText, Rect } from 'react-konva';
import type { ModuleComponentProps, ProportionData } from '../types';

export const ProportionVisualizer: React.FC<ModuleComponentProps> = ({ onConceptMastered, progress }) => {
  const [xValue, setXValue] = useState(1);
  const [relationshipType, setRelationshipType] = useState<'proportional' | 'inverse'>('proportional');
  const [showTable, setShowTable] = useState(true);
  const [showGraph, setShowGraph] = useState(true);
  const [animatePoint, setAnimatePoint] = useState(false);
  const [exerciseMode, setExerciseMode] = useState(false);
  const [userPrediction, setUserPrediction] = useState<number | null>(null);

  const stageWidth = 400;
  const stageHeight = 400;
  const padding = 40;
  const graphWidth = stageWidth - 2 * padding;
  const graphHeight = stageHeight - 2 * padding;

  // 比例・反比例の計算
  const calculateY = (x: number): number => {
    if (relationshipType === 'proportional') {
      return x * 2; // y = 2x
    } else {
      return x !== 0 ? 12 / x : 0; // y = 12/x
    }
  };

  // データポイントの生成
  const generateDataPoints = (): ProportionData[] => {
    const points: ProportionData[] = [];
    for (let x = 1; x <= 6; x++) {
      points.push({
        x,
        y: calculateY(x),
        relationship: relationshipType
      });
    }
    return points;
  };

  const dataPoints = generateDataPoints();

  // グラフの座標変換
  const toGraphX = (x: number) => padding + (x / 6) * graphWidth;
  const toGraphY = (y: number) => {
    const maxY = relationshipType === 'proportional' ? 12 : 12;
    return padding + graphHeight - (y / maxY) * graphHeight;
  };

  // グラフの線を生成
  const generateGraphLine = () => {
    const points: number[] = [];
    
    if (relationshipType === 'proportional') {
      // 比例のグラフ（直線）
      points.push(toGraphX(0), toGraphY(0));
      points.push(toGraphX(6), toGraphY(12));
    } else {
      // 反比例のグラフ（曲線）
      for (let x = 0.1; x <= 6; x += 0.1) {
        points.push(toGraphX(x), toGraphY(calculateY(x)));
      }
    }
    
    return points;
  };

  const handleRelationshipChange = (_event: React.MouseEvent<HTMLElement>, newType: 'proportional' | 'inverse' | null) => {
    if (newType !== null) {
      setRelationshipType(newType);
      setXValue(1);
      setUserPrediction(null);
    }
  };

  const handleExerciseSubmit = () => {
    const correctY = calculateY(xValue);
    if (userPrediction !== null && Math.abs(userPrediction - correctY) < 0.1) {
      onConceptMastered(`${relationshipType}-understanding`);
      setExerciseMode(false);
      setUserPrediction(null);
    }
  };

  useEffect(() => {
    if (animatePoint) {
      const timer = setTimeout(() => setAnimatePoint(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [xValue, animatePoint]);

  const currentY = calculateY(xValue);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* コントロールパネル */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                関係を選ぼう
              </Typography>
              
              <ToggleButtonGroup
                value={relationshipType}
                exclusive
                onChange={handleRelationshipChange}
                sx={{ mb: 3 }}
              >
                <ToggleButton value="proportional">
                  比例（y = 2x）
                </ToggleButton>
                <ToggleButton value="inverse">
                  反比例（y = 12/x）
                </ToggleButton>
              </ToggleButtonGroup>

              <Typography gutterBottom>
                xの値: {xValue}
              </Typography>
              <Slider
                value={xValue}
                onChange={(_event, newValue) => {
                  setXValue(newValue as number);
                  setAnimatePoint(true);
                }}
                min={1}
                max={6}
                step={0.5}
                marks
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant={showTable ? 'contained' : 'outlined'}
                  onClick={() => setShowTable(!showTable)}
                  size="small"
                >
                  表
                </Button>
                <Button
                  variant={showGraph ? 'contained' : 'outlined'}
                  onClick={() => setShowGraph(!showGraph)}
                  size="small"
                >
                  グラフ
                </Button>
              </Box>

              {!exerciseMode ? (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setExerciseMode(true)}
                  fullWidth
                >
                  練習問題に挑戦
                </Button>
              ) : (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    x = {xValue} のとき、y の値を予想してください
                  </Alert>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography>y = </Typography>
                    <input
                      type="number"
                      value={userPrediction || ''}
                      onChange={(e) => setUserPrediction(parseFloat(e.target.value))}
                      style={{
                        padding: '8px',
                        fontSize: '16px',
                        width: '100px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleExerciseSubmit}
                      disabled={userPrediction === null}
                    >
                      確認
                    </Button>
                  </Box>
                  {userPrediction !== null && Math.abs(userPrediction - currentY) >= 0.1 && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      もう一度計算してみよう。
                      {relationshipType === 'proportional' ? 'y = 2 × x' : 'y = 12 ÷ x'} です。
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 表示エリア */}
        <Grid item xs={12} md={6}>
          {showTable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    値の表
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">x</TableCell>
                          <TableCell align="center">y</TableCell>
                          <TableCell align="center">
                            {relationshipType === 'proportional' ? 'y ÷ x' : 'x × y'}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataPoints.map((point) => (
                          <TableRow
                            key={point.x}
                            sx={{
                              bgcolor: point.x === xValue ? 'primary.light' : 'inherit',
                              '& td': {
                                fontWeight: point.x === xValue ? 'bold' : 'normal'
                              }
                            }}
                          >
                            <TableCell align="center">{point.x}</TableCell>
                            <TableCell align="center">{point.y.toFixed(1)}</TableCell>
                            <TableCell align="center">
                              {relationshipType === 'proportional'
                                ? (point.y / point.x).toFixed(1)
                                : (point.x * point.y).toFixed(1)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Alert severity="success" sx={{ mt: 2 }}>
                    {relationshipType === 'proportional'
                      ? 'y ÷ x の値は常に 2 で一定！'
                      : 'x × y の値は常に 12 で一定！'}
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          {showGraph && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    グラフ
                  </Typography>
                  
                  <Stage width={stageWidth} height={stageHeight}>
                    <Layer>
                      {/* 軸 */}
                      <Line
                        points={[padding, stageHeight - padding, stageWidth - padding, stageHeight - padding]}
                        stroke="black"
                        strokeWidth={2}
                      />
                      <Line
                        points={[padding, stageHeight - padding, padding, padding]}
                        stroke="black"
                        strokeWidth={2}
                      />
                      
                      {/* 軸ラベル */}
                      <KonvaText
                        x={stageWidth - padding - 20}
                        y={stageHeight - padding + 10}
                        text="x"
                        fontSize={16}
                      />
                      <KonvaText
                        x={padding - 20}
                        y={padding - 10}
                        text="y"
                        fontSize={16}
                      />

                      {/* グリッド線 */}
                      {[1, 2, 3, 4, 5, 6].map((x) => (
                        <React.Fragment key={`grid-x-${x}`}>
                          <Line
                            points={[toGraphX(x), stageHeight - padding, toGraphX(x), stageHeight - padding + 5]}
                            stroke="gray"
                            strokeWidth={1}
                          />
                          <KonvaText
                            x={toGraphX(x) - 5}
                            y={stageHeight - padding + 10}
                            text={x.toString()}
                            fontSize={12}
                          />
                        </React.Fragment>
                      ))}

                      {/* グラフの線 */}
                      <Line
                        points={generateGraphLine()}
                        stroke={relationshipType === 'proportional' ? '#2196F3' : '#FF9800'}
                        strokeWidth={3}
                        tension={0.5}
                      />

                      {/* データポイント */}
                      {dataPoints.map((point) => (
                        <Circle
                          key={`point-${point.x}`}
                          x={toGraphX(point.x)}
                          y={toGraphY(point.y)}
                          radius={5}
                          fill={point.x === xValue ? '#F44336' : '#666'}
                        />
                      ))}

                      {/* 現在の点を強調 */}
                      <motion.g
                        animate={animatePoint ? {
                          scale: [1, 1.5, 1],
                          opacity: [1, 0.5, 1]
                        } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <Circle
                          x={toGraphX(xValue)}
                          y={toGraphY(currentY)}
                          radius={8}
                          fill="#F44336"
                          stroke="white"
                          strokeWidth={2}
                        />
                      </motion.g>

                      {/* 現在の値を表示 */}
                      <Rect
                        x={toGraphX(xValue) - 30}
                        y={toGraphY(currentY) - 40}
                        width={60}
                        height={25}
                        fill="white"
                        stroke="#F44336"
                        strokeWidth={1}
                        cornerRadius={5}
                      />
                      <KonvaText
                        x={toGraphX(xValue) - 25}
                        y={toGraphY(currentY) - 35}
                        text={`(${xValue}, ${currentY.toFixed(1)})`}
                        fontSize={12}
                        fill="#F44336"
                      />
                    </Layer>
                  </Stage>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {relationshipType === 'proportional'
                      ? '比例のグラフは原点を通る直線になります'
                      : '反比例のグラフは曲線（双曲線）になります'}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};