/**
 * 視覚的割合表現コンポーネント
 * 
 * 円グラフ、棒グラフ、数値バーなどで
 * 割合を視覚的に理解できるようにする
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Slider, 
  Button,
  ButtonGroup,
  Chip,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import type { PercentageElements, GraphType, StatisticsData } from '../types';

interface VisualPercentageProps {
  elements: PercentageElements;
  graphType?: GraphType;
  data?: StatisticsData[];
  interactive?: boolean;
  showValues?: boolean;
  showAnimation?: boolean;
  onElementChange?: (elements: PercentageElements) => void;
}

export const VisualPercentage: React.FC<VisualPercentageProps> = ({
  elements,
  graphType = 'pie',
  data,
  interactive = true,
  showValues = true,
  showAnimation = true,
  onElementChange
}) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // グラフ描画
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (graphType === 'pie' && data) {
      drawPieChart(ctx, canvas, data);
    } else if (graphType === 'bar' && data) {
      drawBarChart(ctx, canvas, data);
    }
  }, [data, graphType]);
  
  // 円グラフ描画
  const drawPieChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: StatisticsData[]) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    let currentAngle = -Math.PI / 2; // 12時の位置から開始
    
    data.forEach((item, index) => {
      const sliceAngle = (item.percentage || 0) / 100 * 2 * Math.PI;
      
      // セクター描画
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      
      // 境界線
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // ラベル表示
      if (showValues && item.percentage && item.percentage > 5) {
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${item.percentage}%`, labelX, labelY);
      }
      
      currentAngle += sliceAngle;
    });
  };
  
  // 棒グラフ描画
  const drawBarChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: StatisticsData[]) => {
    const margin = 40;
    const barWidth = (canvas.width - margin * 2) / data.length;
    const maxHeight = canvas.height - margin * 2;
    
    data.forEach((item, index) => {
      const barHeight = (item.percentage || 0) / 100 * maxHeight;
      const x = margin + index * barWidth + barWidth * 0.1;
      const y = canvas.height - margin - barHeight;
      const width = barWidth * 0.8;
      
      // バー描画
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, width, barHeight);
      
      // 値表示
      if (showValues) {
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${item.percentage}%`, x + width / 2, y - 5);
      }
      
      // ラベル表示
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(item.label, x + width / 2, canvas.height - margin + 5);
    });
  };
  
  // 数値バー表示
  const NumberBar = () => {
    const percentage = elements.percentageValue;
    
    return (
      <Box sx={{ width: '100%', mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          割合の視覚的表現
        </Typography>
        
        {/* プログレスバー */}
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Box
            sx={{
              width: '100%',
              height: 40,
              backgroundColor: theme.palette.grey[200],
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: showAnimation ? 1 : 0, ease: 'easeOut' }}
              style={{
                height: '100%',
                backgroundColor: theme.palette.primary.main,
                position: 'relative'
              }}
            >
              {showValues && percentage > 10 && (
                <Typography
                  variant="body2"
                  sx={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {percentage}%
                </Typography>
              )}
            </motion.div>
          </Box>
          
          {/* 目盛り */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            {[0, 25, 50, 75, 100].map(val => (
              <Typography key={val} variant="caption" color="text.secondary">
                {val}%
              </Typography>
            ))}
          </Box>
        </Box>
        
        {/* 10×10グリッド */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            100マスで表現
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 0.5,
              p: 1,
              backgroundColor: theme.palette.grey[100],
              borderRadius: 1
            }}
          >
            {Array.from({ length: 100 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: showAnimation ? i * 0.002 : 0,
                  duration: 0.3
                }}
              >
                <Box
                  sx={{
                    aspectRatio: '1/1',
                    backgroundColor: i < percentage ? theme.palette.primary.main : theme.palette.grey[300],
                    borderRadius: 0.5,
                    transition: 'background-color 0.3s'
                  }}
                />
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };
  
  // インタラクティブコントロール
  const InteractiveControls = () => {
    const handleSliderChange = (event: Event, value: number | number[]) => {
      if (typeof value === 'number' && onElementChange) {
        const newElements = {
          ...elements,
          percentageValue: value,
          percentage: value / 100,
          compareAmount: elements.baseAmount * (value / 100)
        };
        onElementChange(newElements);
      }
    };
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          割合を調整
        </Typography>
        <Box sx={{ px: 2 }}>
          <Slider
            value={elements.percentageValue}
            onChange={handleSliderChange}
            aria-label="Percentage"
            valueLabelDisplay="on"
            valueLabelFormat={(value) => `${value}%`}
            step={1}
            marks={[
              { value: 0, label: '0%' },
              { value: 25, label: '25%' },
              { value: 50, label: '50%' },
              { value: 75, label: '75%' },
              { value: 100, label: '100%' }
            ]}
            min={0}
            max={100}
          />
        </Box>
        
        {/* クイック選択ボタン */}
        <Box sx={{ mt: 2 }}>
          <ButtonGroup size="small" fullWidth>
            {[10, 25, 50, 75, 100].map(val => (
              <Button
                key={val}
                onClick={() => {
                  if (onElementChange) {
                    const newElements = {
                      ...elements,
                      percentageValue: val,
                      percentage: val / 100,
                      compareAmount: elements.baseAmount * (val / 100)
                    };
                    onElementChange(newElements);
                  }
                }}
                variant={elements.percentageValue === val ? 'contained' : 'outlined'}
              >
                {val}%
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      </Box>
    );
  };
  
  // 要素の説明
  const ElementsDisplay = () => (
    <Box sx={{ mt: 3 }}>
      <Stack spacing={1}>
        <Chip
          label={`もとにする量: ${elements.baseAmount}`}
          color="primary"
          variant="outlined"
          icon={<Typography sx={{ ml: 1 }}>📊</Typography>}
        />
        <Chip
          label={`比べる量: ${elements.compareAmount}`}
          color="secondary"
          variant="outlined"
          icon={<Typography sx={{ ml: 1 }}>📈</Typography>}
        />
        <Chip
          label={`割合: ${elements.percentage} (${elements.percentageValue}%)`}
          color="success"
          variant="outlined"
          icon={<Typography sx={{ ml: 1 }}>➗</Typography>}
        />
      </Stack>
      
      {/* 計算式 */}
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2,
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          border: `1px solid ${theme.palette.info.main}`
        }}
      >
        <Typography variant="body2" color="info.dark" sx={{ fontFamily: 'monospace' }}>
          {elements.compareAmount} ÷ {elements.baseAmount} = {elements.percentage} = {elements.percentageValue}%
        </Typography>
      </Paper>
    </Box>
  );
  
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          割合の視覚化
        </Typography>
        
        {/* グラフ表示 */}
        {data && data.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </Box>
        )}
        
        {/* 数値バー */}
        <NumberBar />
        
        {/* インタラクティブコントロール */}
        {interactive && <InteractiveControls />}
        
        {/* 要素の説明 */}
        <ElementsDisplay />
      </Paper>
    </Box>
  );
};