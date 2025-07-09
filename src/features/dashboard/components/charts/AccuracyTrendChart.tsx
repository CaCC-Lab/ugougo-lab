import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { Box, useTheme, Typography, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { chartColors } from '../../hooks/useLearningAnalytics';

interface AccuracyTrendChartProps {
  data: Array<{
    date: string;
    displayDate: string;
    accuracy: number;
    accuracyPercent: number;
    totalQuestions: number;
    correctAnswers: number;
  }>;
}

const AccuracyTrendChart: React.FC<AccuracyTrendChartProps> = ({ data }) => {
  const theme = useTheme();
  
  // 平均正答率を計算
  const averageAccuracy = data.length > 0
    ? Math.round(data.reduce((sum, d) => sum + d.accuracyPercent, 0) / data.length)
    : 0;
  
  // トレンドを計算（最初と最後を比較）
  const trend = data.length > 1
    ? data[data.length - 1].accuracyPercent - data[0].accuracyPercent
    : 0;
  
  // カスタムツールチップ
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        date: string;
        displayDate: string;
        accuracy: number;
        accuracyPercent: number;
        totalQuestions: number;
        correctAnswers: number;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 2,
            boxShadow: theme.shadows[4]
          }}
        >
          <Typography variant="body2" color="text.primary" gutterBottom>
            {label}
          </Typography>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {data.accuracyPercent}%
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            正解: {data.correctAnswers} / {data.totalQuestions} 問
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  // カスタムドット
  interface DotProps {
    cx?: number;
    cy?: number;
    payload?: {
      accuracyPercent: number;
    };
  }

  const CustomDot = (props: DotProps) => {
    const { cx, cy, payload } = props;
    if (!payload || cx === undefined || cy === undefined) return null;
    
    const isHighScore = payload.accuracyPercent >= 90;
    const isLowScore = payload.accuracyPercent < 60;
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isHighScore || isLowScore ? 6 : 4}
        fill={
          isHighScore
            ? theme.palette.success.main
            : isLowScore
            ? theme.palette.error.main
            : theme.palette.primary.main
        }
        stroke={theme.palette.background.paper}
        strokeWidth={2}
      />
    );
  };
  
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="caption" color="text.secondary">
            平均正答率: {averageAccuracy}%
          </Typography>
          <Chip
            size="small"
            icon={trend >= 0 ? <TrendingUp /> : <TrendingDown />}
            label={`${Math.abs(trend).toFixed(1)}%`}
            color={trend >= 0 ? 'success' : 'error'}
            variant="outlined"
          />
        </Box>
      </Box>
      
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0} />
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
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            tickLine={{ stroke: theme.palette.divider }}
            axisLine={{ stroke: theme.palette.divider }}
            label={{
              value: '正答率（%）',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: theme.palette.text.secondary }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* 目標ライン */}
          <ReferenceLine
            y={80}
            stroke={theme.palette.success.main}
            strokeDasharray="5 5"
            label={{
              value: "目標: 80%",
              position: "right",
              style: { fontSize: 12, fill: theme.palette.success.main }
            }}
          />
          
          {/* 平均ライン */}
          <ReferenceLine
            y={averageAccuracy}
            stroke={theme.palette.primary.main}
            strokeDasharray="3 3"
            opacity={0.7}
          />
          
          <Area
            type="monotone"
            dataKey="accuracyPercent"
            stroke={chartColors.secondary}
            strokeWidth={3}
            fill="url(#accuracyGradient)"
            animationDuration={1500}
            dot={<CustomDot />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AccuracyTrendChart;