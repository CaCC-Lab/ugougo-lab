import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Box, useTheme, Typography } from '@mui/material';
import { chartColors } from '../../hooks/useLearningAnalytics';

interface LearningTimeChartProps {
  data: Array<{
    date: string;
    displayDate: string;
    duration: number;
    hours: number;
  }>;
}

const LearningTimeChart: React.FC<LearningTimeChartProps> = ({ data }) => {
  const theme = useTheme();
  
  // カスタムツールチップ
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        date: string;
        displayDate: string;
        duration: number;
        hours: number;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload[0]) {
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
            {label}
          </Typography>
          <Typography variant="body2" color="primary" fontWeight="bold">
            学習時間: {payload[0].payload.duration}分
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({payload[0].payload.hours}時間)
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  // 最大値を取得して色分けの基準にする
  const maxDuration = Math.max(...data.map(d => d.duration));
  
  // 学習時間に応じて色を変える
  const getBarColor = (duration: number) => {
    const ratio = duration / maxDuration;
    if (ratio > 0.8) return theme.palette.success.main;
    if (ratio > 0.5) return theme.palette.primary.main;
    if (ratio > 0.2) return theme.palette.info.main;
    return theme.palette.grey[400];
  };
  
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.gradient.start} stopOpacity={0.8} />
              <stop offset="95%" stopColor={chartColors.gradient.end} stopOpacity={0.8} />
            </linearGradient>
          </defs>
          
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.palette.divider}
            opacity={0.3}
          />
          
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            tickLine={{ stroke: theme.palette.divider }}
            axisLine={{ stroke: theme.palette.divider }}
          />
          
          <YAxis
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            tickLine={{ stroke: theme.palette.divider }}
            axisLine={{ stroke: theme.palette.divider }}
            label={{
              value: '学習時間（分）',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: theme.palette.text.secondary }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Bar
            dataKey="duration"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.duration)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LearningTimeChart;