import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Slider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Stage, Layer, Rect, Circle, Text, Line, Group } from 'react-konva';
import ScaleIcon from '@mui/icons-material/Scale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface BalanceScaleProps {
  equation: string;
  onSolve: (correct: boolean) => void;
}

interface ScaleItem {
  type: 'variable' | 'number';
  value: string | number;
  count: number;
}

const BalanceScale: React.FC<BalanceScaleProps> = ({ equation, onSolve }) => {
  const [leftSide, setLeftSide] = useState<ScaleItem[]>([]);
  const [rightSide, setRightSide] = useState<ScaleItem[]>([]);
  const [xValue, setXValue] = useState(5);
  const [isBalanced, setIsBalanced] = useState(false);
  // const [showSolution, setShowSolution] = useState(false);  // 将来の拡張用

  // 方程式をパースして天秤の両側に配置
  useEffect(() => {
    parseEquation(equation);
  }, [equation]);

  const parseEquation = (eq: string) => {
    // 簡単な方程式のパース (例: "x + 3 = 8", "2x + 1 = 7")
    const [left, right] = eq.split('=').map(s => s.trim());
    
    // 左辺の解析
    const leftItems: ScaleItem[] = [];
    if (left.includes('x')) {
      const coefficient = left.match(/(\d*)x/)?.[1] || '1';
      leftItems.push({ type: 'variable', value: 'x', count: parseInt(coefficient) });
    }
    const leftNumber = left.match(/\+\s*(\d+)/) || left.match(/(\d+)\s*\+/);
    if (leftNumber) {
      leftItems.push({ type: 'number', value: parseInt(leftNumber[1]), count: 1 });
    }
    
    // 右辺の解析
    const rightItems: ScaleItem[] = [{
      type: 'number',
      value: parseInt(right),
      count: 1
    }];
    
    setLeftSide(leftItems);
    setRightSide(rightItems);
    
    // 正解を計算（必要に応じて後で使用）
    // const xCoeff = leftItems.find(item => item.type === 'variable')?.count || 0;
    // const leftConst = leftItems.find(item => item.type === 'number')?.value as number || 0;
    // const rightConst = parseInt(right);
    // const correctAnswer = (rightConst - leftConst) / xCoeff;
  };

  // 天秤の重さを計算
  const calculateWeight = (items: ScaleItem[], xVal: number) => {
    return items.reduce((total, item) => {
      if (item.type === 'variable') {
        return total + (xVal * item.count);
      } else {
        return total + (item.value as number * item.count);
      }
    }, 0);
  };

  // 天秤の傾きを計算
  const calculateTilt = () => {
    const leftWeight = calculateWeight(leftSide, xValue);
    const rightWeight = calculateWeight(rightSide, xValue);
    const diff = leftWeight - rightWeight;
    return Math.max(-30, Math.min(30, diff * 3)); // 最大30度まで傾く
  };

  const handleCheck = () => {
    const leftWeight = calculateWeight(leftSide, xValue);
    const rightWeight = calculateWeight(rightSide, xValue);
    const balanced = Math.abs(leftWeight - rightWeight) < 0.1;
    
    setIsBalanced(balanced);
    if (balanced) {
      // setShowSolution(true);  // 将来の拡張用
      onSolve(true);
    }
  };

  const renderScaleItems = (items: ScaleItem[], side: 'left' | 'right', tilt: number) => {
    const baseX = side === 'left' ? 200 : 400;
    const baseY = 200 - (side === 'left' ? tilt : -tilt);
    
    return items.map((item, index) => {
      const offsetX = index * 60 - (items.length - 1) * 30;
      
      if (item.type === 'variable') {
        return (
          <Group key={index}>
            {Array.from({ length: item.count }).map((_, i) => (
              <Group key={i} x={baseX + offsetX + i * 25} y={baseY - 40}>
                <Rect
                  width={40}
                  height={40}
                  fill="#4CAF50"
                  stroke="#2E7D32"
                  strokeWidth={2}
                  cornerRadius={5}
                />
                <Text
                  text="x"
                  fontSize={20}
                  fill="white"
                  width={40}
                  height={40}
                  align="center"
                  verticalAlign="middle"
                />
              </Group>
            ))}
          </Group>
        );
      } else {
        return (
          <Group key={index} x={baseX + offsetX} y={baseY - 40}>
            <Circle
              radius={20}
              fill="#2196F3"
              stroke="#1565C0"
              strokeWidth={2}
            />
            <Text
              text={item.value.toString()}
              fontSize={16}
              fill="white"
              x={-20}
              y={-20}
              width={40}
              height={40}
              align="center"
              verticalAlign="middle"
            />
          </Group>
        );
      }
    });
  };

  const tilt = calculateTilt();

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center">
        天秤で方程式を理解しよう
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          {equation}
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Stage width={600} height={400}>
            <Layer>
              {/* 天秤の支点 */}
              <Line
                points={[300, 350, 280, 400, 320, 400, 300, 350]}
                fill="#666"
                closed
              />
              
              {/* 天秤の棒 */}
              <motion.line
                animate={{ rotate: tilt }}
                style={{ originX: '300px', originY: '250px' }}
              >
                <Line
                  points={[100, 250, 500, 250]}
                  stroke="#333"
                  strokeWidth={8}
                  rotation={tilt}
                  offsetX={300}
                  offsetY={250}
                  x={300}
                  y={250}
                />
              </motion.line>
              
              {/* 天秤の皿 */}
              <Line
                points={[150, 200, 250, 200]}
                stroke="#333"
                strokeWidth={4}
                rotation={tilt}
                offsetX={300}
                offsetY={250}
                x={300}
                y={250}
              />
              <Line
                points={[350, 200, 450, 200]}
                stroke="#333"
                strokeWidth={4}
                rotation={tilt}
                offsetX={300}
                offsetY={250}
                x={300}
                y={250}
              />
              
              {/* アイテムの表示 */}
              <Group rotation={tilt} offsetX={300} offsetY={250} x={300} y={250}>
                {renderScaleItems(leftSide, 'left', 0)}
                {renderScaleItems(rightSide, 'right', 0)}
              </Group>
              
              {/* 重さの表示 */}
              <Text
                text={`左: ${calculateWeight(leftSide, xValue)}`}
                x={50}
                y={50}
                fontSize={16}
                fill="#333"
              />
              <Text
                text={`右: ${calculateWeight(rightSide, xValue)}`}
                x={450}
                y={50}
                fontSize={16}
                fill="#333"
              />
            </Layer>
          </Stage>
        </Box>

        <Box sx={{ px: 4, mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            xの値を調整して天秤を釣り合わせよう：
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>x =</Typography>
            <Slider
              value={xValue}
              onChange={(_, value) => setXValue(value as number)}
              min={0}
              max={20}
              step={0.5}
              marks
              valueLabelDisplay="on"
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleCheck}
            startIcon={<ScaleIcon />}
          >
            天秤をチェック
          </Button>
        </Box>

        <AnimatePresence>
          {isBalanced && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  mt: 3,
                  bgcolor: 'success.light',
                  color: 'success.contrastText'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon />
                  <Typography variant="h6">
                    完璧！天秤が釣り合いました！
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  x = {xValue} のとき、方程式 {equation} が成り立ちます。
                </Typography>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, bgcolor: 'info.light' }}>
        <Typography variant="body2">
          💡 ヒント: 方程式は天秤のようなもの。左右が同じ重さになるようにxの値を見つけよう！
        </Typography>
      </Paper>
    </Box>
  );
};

export default BalanceScale;