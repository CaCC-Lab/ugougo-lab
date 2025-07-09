import React from 'react';
import { Box, useTheme, Typography, Paper } from '@mui/material';

interface HourlyHeatmapProps {
  data: Array<{
    hour: number;
    displayHour: string;
    value: number; // 平均学習時間（分）
    intensity: number; // 0-1の正規化された頻度
  }>;
}

const HourlyHeatmap: React.FC<HourlyHeatmapProps> = ({ data }) => {
  const theme = useTheme();
  
  // データを24時間分に拡張（データがない時間は0で埋める）
  const fullDayData = Array.from({ length: 24 }, (_, hour) => {
    const existingData = data.find(d => d.hour === hour);
    return existingData || {
      hour,
      displayHour: `${hour}:00`,
      value: 0,
      intensity: 0
    };
  });
  
  // 強度に基づいて色を取得
  const getColor = (intensity: number, value: number) => {
    if (value === 0) return theme.palette.grey[100];
    
    const baseColor = theme.palette.primary.main;
    const opacity = Math.max(0.2, Math.min(1, intensity));
    
    // RGBに変換して透明度を適用
    return `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  };
  
  // 時間帯のラベル
  const getTimeLabel = (hour: number) => {
    if (hour === 0) return '深夜';
    if (hour >= 6 && hour < 9) return '朝';
    if (hour >= 9 && hour < 12) return '午前';
    if (hour >= 12 && hour < 15) return '昼';
    if (hour >= 15 && hour < 18) return '午後';
    if (hour >= 18 && hour < 21) return '夜';
    return '深夜';
  };
  
  // 最大値を取得（凡例用）
  const _maxValue = Math.max(...fullDayData.map(d => d.value));
  
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* ヒートマップグリッド */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 1,
          mb: 3
        }}
      >
        {fullDayData.map((item) => (
          <Paper
            key={item.hour}
            elevation={item.value > 0 ? 2 : 0}
            sx={{
              position: 'relative',
              aspectRatio: '1 / 1',
              backgroundColor: getColor(item.intensity, item.value),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                transform: item.value > 0 ? 'scale(1.05)' : 'none',
                boxShadow: item.value > 0 ? theme.shadows[8] : 'none',
                zIndex: 1
              }
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 'bold',
                color: item.intensity > 0.5 ? 'white' : theme.palette.text.primary
              }}
            >
              {item.displayHour}
            </Typography>
            {item.value > 0 && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  color: item.intensity > 0.5 ? 'white' : theme.palette.text.secondary
                }}
              >
                {item.value}分
              </Typography>
            )}
            
            {/* 時間帯ラベル（特定の時間のみ） */}
            {[0, 6, 9, 12, 15, 18, 21].includes(item.hour) && (
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: -20,
                  fontSize: '0.65rem',
                  color: theme.palette.text.secondary,
                  fontWeight: 'medium'
                }}
              >
                {getTimeLabel(item.hour)}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
      
      {/* 凡例 */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          学習頻度の凡例
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <Typography variant="caption" color="text.secondary">
            少ない
          </Typography>
          <Box display="flex" gap={0.5}>
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity) => (
              <Box
                key={intensity}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: getColor(intensity, 10),
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 0.5
                }}
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">
            多い
          </Typography>
        </Box>
      </Box>
      
      {/* インサイト */}
      <Box mt={3} p={2} bgcolor={theme.palette.grey[50]} borderRadius={1}>
        <Typography variant="body2" color="text.secondary">
          {(() => {
            const activeHours = fullDayData.filter(d => d.value > 0);
            if (activeHours.length === 0) return 'まだ学習データがありません';
            
            const mostActiveHour = fullDayData.reduce((max, d) => 
              d.value > max.value ? d : max
            );
            
            const morningActivity = fullDayData.slice(6, 12).reduce((sum, d) => sum + d.value, 0);
            const afternoonActivity = fullDayData.slice(12, 18).reduce((sum, d) => sum + d.value, 0);
            const eveningActivity = fullDayData.slice(18, 23).reduce((sum, d) => sum + d.value, 0);
            
            let timePreference = '朝型';
            let maxActivity = morningActivity;
            
            if (afternoonActivity > maxActivity) {
              timePreference = '昼型';
              maxActivity = afternoonActivity;
            }
            if (eveningActivity > maxActivity) {
              timePreference = '夜型';
            }
            
            return `最も活発な時間帯は${mostActiveHour.displayHour}（平均${mostActiveHour.value}分）です。あなたは${timePreference}の学習パターンです。`;
          })()}
        </Typography>
      </Box>
    </Box>
  );
};

export default HourlyHeatmap;