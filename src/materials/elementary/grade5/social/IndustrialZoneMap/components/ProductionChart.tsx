import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { IndustrialZone } from '../IndustrialZoneMap';

interface ProductionChartProps {
  zones: IndustrialZone[];
}

export const ProductionChart: React.FC<ProductionChartProps> = ({ zones }) => {
  const maxValue = Math.max(...zones.map(z => z.productionValue));
  const chartHeight = 300;
  const barWidth = 80;
  const barSpacing = 20;

  const getBarColor = (index: number): string => {
    const colors = ['#2196F3', '#FF5722', '#4CAF50', '#FFC107'];
    return colors[index % colors.length];
  };

  return (
    <Paper elevation={1} sx={{ p: 2, bgcolor: '#fafafa' }}>
      <Box sx={{ position: 'relative', height: chartHeight + 60 }}>
        {/* Y軸ラベル */}
        <Box sx={{ 
          position: 'absolute',
          left: -30,
          top: 0,
          height: chartHeight,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {[50, 40, 30, 20, 10, 0].map(value => (
            <Typography key={value} variant="caption" color="text.secondary">
              {value}
            </Typography>
          ))}
        </Box>

        {/* Y軸線 */}
        <Box sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1,
          height: chartHeight,
          bgcolor: '#ccc'
        }} />

        {/* X軸線 */}
        <Box sx={{
          position: 'absolute',
          left: 0,
          bottom: 60,
          width: zones.length * (barWidth + barSpacing),
          height: 1,
          bgcolor: '#ccc'
        }} />

        {/* グリッド線 */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              left: 0,
              top: chartHeight * (1 - ratio),
              width: zones.length * (barWidth + barSpacing),
              height: 1,
              bgcolor: '#f0f0f0',
              zIndex: 0
            }}
          />
        ))}

        {/* 棒グラフ */}
        {zones.map((zone, index) => {
          const barHeight = (zone.productionValue / maxValue) * chartHeight;
          const xPosition = index * (barWidth + barSpacing) + barSpacing;

          return (
            <Box key={zone.id} sx={{ position: 'absolute', left: xPosition, bottom: 60 }}>
              {/* 棒 */}
              <Box
                sx={{
                  width: barWidth,
                  height: 0,
                  bgcolor: getBarColor(index),
                  position: 'relative',
                  animation: 'growBar 0.8s ease-out forwards',
                  animationDelay: `${index * 0.1}s`,
                  '@keyframes growBar': {
                    to: { height: barHeight }
                  },
                  '&:hover': {
                    filter: 'brightness(1.1)',
                    cursor: 'pointer'
                  }
                }}
              >
                {/* 値ラベル */}
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 'bold',
                    opacity: 0,
                    animation: 'fadeIn 0.3s ease-out forwards',
                    animationDelay: `${index * 0.1 + 0.8}s`,
                    '@keyframes fadeIn': {
                      to: { opacity: 1 }
                    }
                  }}
                >
                  {zone.productionValue}兆円
                </Typography>
              </Box>

              {/* 地帯名 */}
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  bottom: -40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: barWidth + 20,
                  textAlign: 'center',
                  fontSize: '0.75rem'
                }}
              >
                {zone.name}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* 凡例 */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#ccc', mr: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            生産額（兆円）
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};