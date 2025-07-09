import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { Box, useTheme, Typography, Chip } from '@mui/material';
import { TrendingUp, Weekend, Work } from '@mui/icons-material';

interface WeeklyPatternChartProps {
  data: Array<{
    dayOfWeek: number;
    displayDay: string;
    avgDuration: number;
    hours: number;
  }>;
}

const WeeklyPatternChart: React.FC<WeeklyPatternChartProps> = ({ data }) => {
  const theme = useTheme();
  
  // 曜日ごとの色設定（週末は異なる色）
  const getDayColor = (dayOfWeek: number) => {
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // 週末
      return theme.palette.secondary.main;
    }
    return theme.palette.primary.main;
  };
  
  // カスタムラベル
  interface LabelProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    value?: number;
  }

  const CustomLabel = (props: LabelProps) => {
    const { x, y, width, value } = props;
    if (value === 0 || value === undefined || x === undefined || y === undefined || width === undefined) return null;
    
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill={theme.palette.text.secondary}
        textAnchor="middle"
        fontSize={12}
      >
        {value}分
      </text>
    );
  };
  
  // カスタムツールチップ
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        dayOfWeek: number;
        displayDay: string;
        avgDuration: number;
        hours: number;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      const isWeekend = data.dayOfWeek === 0 || data.dayOfWeek === 6;
      
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
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.primary">
              {label}
            </Typography>
            {isWeekend && <Weekend fontSize="small" color="secondary" />}
          </Box>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {data.avgDuration}分
          </Typography>
          <Typography variant="caption" color="text.secondary">
            約{data.hours}時間
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  // 統計計算
  const weekdayAvg = data
    .filter(d => d.dayOfWeek >= 1 && d.dayOfWeek <= 5)
    .reduce((sum, d, _, arr) => sum + d.avgDuration / arr.length, 0);
    
  const weekendAvg = data
    .filter(d => d.dayOfWeek === 0 || d.dayOfWeek === 6)
    .reduce((sum, d, _, arr) => sum + d.avgDuration / arr.length, 0);
    
  const totalWeekly = data.reduce((sum, d) => sum + d.avgDuration, 0);
  const mostActiveDay = data.reduce((max, d) => d.avgDuration > max.avgDuration ? d : max);
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* サマリー情報 */}
      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
        <Chip
          size="small"
          icon={<Work />}
          label={`平日平均: ${Math.round(weekdayAvg)}分`}
          variant="outlined"
          color="primary"
        />
        <Chip
          size="small"
          icon={<Weekend />}
          label={`週末平均: ${Math.round(weekendAvg)}分`}
          variant="outlined"
          color="secondary"
        />
        <Chip
          size="small"
          icon={<TrendingUp />}
          label={`最多: ${mostActiveDay.displayDay}`}
          variant="filled"
          color="success"
        />
      </Box>
      
      {/* チャート */}
      <Box sx={{ height: 250 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
              opacity={0.3}
            />
            
            <XAxis
              dataKey="displayDay"
              tick={{ fontSize: 14, fill: theme.palette.text.primary }}
              tickLine={{ stroke: theme.palette.divider }}
              axisLine={{ stroke: theme.palette.divider }}
            />
            
            <YAxis
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              tickLine={{ stroke: theme.palette.divider }}
              axisLine={{ stroke: theme.palette.divider }}
              label={{
                value: '平均学習時間（分）',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12, fill: theme.palette.text.secondary }
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Bar
              dataKey="avgDuration"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
              animationBegin={0}
            >
              <LabelList content={<CustomLabel />} />
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getDayColor(entry.dayOfWeek)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      {/* 週間サマリー */}
      <Box
        mt={2}
        p={2}
        bgcolor={theme.palette.grey[50]}
        borderRadius={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="body2" color="text.secondary">
          週間合計学習時間
        </Typography>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {Math.round(totalWeekly / 60 * 10) / 10}時間
        </Typography>
      </Box>
    </Box>
  );
};

export default WeeklyPatternChart;