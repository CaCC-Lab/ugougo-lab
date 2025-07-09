import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Box, useTheme, Typography, Chip } from '@mui/material';

interface ProficiencyRadarChartProps {
  data: Array<{
    subject: string;
    value: number;
    fullMark: number;
  }>;
}

const ProficiencyRadarChart: React.FC<ProficiencyRadarChartProps> = ({ data }) => {
  const theme = useTheme();
  
  // カスタムツールチップ
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        subject: string;
        value: number;
        fullMark: number;
      };
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: theme.shadows[4]
          }}
        >
          <Typography variant="body2" color="text.primary">
            {data.subject}
          </Typography>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {data.value}%
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
            <Chip
              size="small"
              label={
                data.value >= 80
                  ? '優秀'
                  : data.value >= 60
                  ? '良好'
                  : data.value >= 40
                  ? '要努力'
                  : '要復習'
              }
              color={
                data.value >= 80
                  ? 'success'
                  : data.value >= 60
                  ? 'primary'
                  : data.value >= 40
                  ? 'warning'
                  : 'error'
              }
              variant="filled"
            />
          </Box>
        </Box>
      );
    }
    return null;
  };
  
  // データが空の場合のフォールバック
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          データがありません
        </Typography>
      </Box>
    );
  }
  
  // 平均習熟度を計算
  const averageProficiency = Math.round(
    data.reduce((sum, d) => sum + d.value, 0) / data.length
  );
  
  return (
    <Box sx={{ width: '100%', height: 350 }}>
      <Box display="flex" justifyContent="center" mb={2}>
        <Typography variant="caption" color="text.secondary">
          総合習熟度: {averageProficiency}%
        </Typography>
      </Box>
      
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid
            gridType="polygon"
            radialLines={true}
            stroke={theme.palette.divider}
            strokeWidth={1}
            opacity={0.3}
          />
          
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fontSize: 12,
              fill: theme.palette.text.secondary
            }}
            style={{
              textAnchor: 'middle'
            }}
          />
          
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tickCount={5}
            tick={{
              fontSize: 10,
              fill: theme.palette.text.secondary
            }}
            axisLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Radar
            name="習熟度"
            dataKey="value"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            fill={theme.palette.primary.main}
            fillOpacity={0.3}
            animationDuration={1500}
            animationBegin={0}
          />
          
          {/* 目標ライン（80%） */}
          <Radar
            name="目標"
            dataKey={() => 80}
            stroke={theme.palette.success.main}
            strokeWidth={1}
            strokeDasharray="5 5"
            fill="none"
            dot={false}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* 凡例 */}
      <Box display="flex" justifyContent="center" gap={2} mt={2}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box
            sx={{
              width: 12,
              height: 2,
              backgroundColor: theme.palette.primary.main
            }}
          />
          <Typography variant="caption" color="text.secondary">
            現在の習熟度
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box
            sx={{
              width: 12,
              height: 2,
              backgroundColor: theme.palette.success.main,
              border: '1px dashed',
              borderColor: theme.palette.success.main
            }}
          />
          <Typography variant="caption" color="text.secondary">
            目標ライン（80%）
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProficiencyRadarChart;