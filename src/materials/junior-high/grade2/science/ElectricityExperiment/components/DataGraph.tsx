import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import type { GraphDataPoint, MeasurementPoint } from '../types';
import { formatMeasurement } from '../utils/circuitCalculations';

interface DataGraphProps {
  voltageCurrent: GraphDataPoint[];
  resistanceCurrent: GraphDataPoint[];
  measurements: MeasurementPoint[];
  currentCircuitData?: {
    voltage: number;
    current: number;
    resistance: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ pt: 2 }}
    >
      {value === index && children}
    </Box>
  );
};

export const DataGraph: React.FC<DataGraphProps> = ({
  voltageCurrent,
  resistanceCurrent,
  measurements,
  currentCircuitData
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [graphType, setGraphType] = useState<'voltage' | 'resistance'>('voltage');
  
  // グラフデータの準備
  const prepareGraphData = () => {
    if (graphType === 'voltage') {
      return voltageCurrent.map(point => ({
        電圧: point.x,
        電流: point.y,
        オームの法則: point.y // 理論値
      }));
    } else {
      return resistanceCurrent.map(point => ({
        抵抗: point.x,
        電流: point.y,
        理論値: point.y
      }));
    }
  };
  
  const graphData = prepareGraphData();
  
  // 実験データテーブル用のデータ準備
  const experimentData = measurements
    .filter(m => m.measurement.voltage > 0 || m.measurement.current > 0)
    .map(m => ({
      id: m.id,
      voltage: m.measurement.voltage,
      current: m.measurement.current,
      resistance: m.measurement.resistance,
      power: m.measurement.voltage * m.measurement.current
    }));
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        データ分析
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab label="グラフ" />
          <Tab label="データ表" />
          <Tab label="関係式" />
        </Tabs>
        
        {/* グラフタブ */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup
              value={graphType}
              exclusive
              onChange={(_, value) => value && setGraphType(value)}
              size="small"
            >
              <ToggleButton value="voltage">
                電圧-電流グラフ
              </ToggleButton>
              <ToggleButton value="resistance">
                抵抗-電流グラフ
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          <Box sx={{ height: 400, width: '100%' }}>
            <ResponsiveContainer>
              {graphType === 'voltage' ? (
                <AreaChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="電圧"
                    label={{ value: '電圧 (V)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: '電流 (A)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatMeasurement(value, 'A', 3)}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="電流"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  {currentCircuitData && (
                    <Line
                      type="monotone"
                      dataKey="オームの法則"
                      stroke="#ff7300"
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  )}
                </AreaChart>
              ) : (
                <LineChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="抵抗"
                    label={{ value: '抵抗 (Ω)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: '電流 (A)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatMeasurement(value, 'A', 3)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="電流"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="理論値"
                    stroke="#ff7300"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </Box>
          
          {/* 現在の測定点の表示 */}
          {currentCircuitData && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="subtitle2" gutterBottom>
                現在の測定値
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Typography variant="body2">
                  電圧: {formatMeasurement(currentCircuitData.voltage, 'V')}
                </Typography>
                <Typography variant="body2">
                  電流: {formatMeasurement(currentCircuitData.current, 'A')}
                </Typography>
                <Typography variant="body2">
                  抵抗: {formatMeasurement(currentCircuitData.resistance, 'Ω')}
                </Typography>
              </Box>
            </Paper>
          )}
        </TabPanel>
        
        {/* データ表タブ */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>測定回</TableCell>
                  <TableCell align="right">電圧 (V)</TableCell>
                  <TableCell align="right">電流 (A)</TableCell>
                  <TableCell align="right">抵抗 (Ω)</TableCell>
                  <TableCell align="right">電力 (W)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {experimentData.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell align="right">
                      {formatMeasurement(row.voltage, 'V')}
                    </TableCell>
                    <TableCell align="right">
                      {formatMeasurement(row.current, 'A')}
                    </TableCell>
                    <TableCell align="right">
                      {formatMeasurement(row.resistance, 'Ω')}
                    </TableCell>
                    <TableCell align="right">
                      {formatMeasurement(row.power, 'W')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {experimentData.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                まだ測定データがありません
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        {/* 関係式タブ */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            {/* オームの法則 */}
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom color="primary">
                オームの法則
              </Typography>
              <Typography
                variant="h4"
                align="center"
                sx={{ fontFamily: 'monospace', my: 2 }}
              >
                V = I × R
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    V: 電圧
                  </Typography>
                  <Typography variant="body1">
                    ボルト (V)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    I: 電流
                  </Typography>
                  <Typography variant="body1">
                    アンペア (A)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    R: 抵抗
                  </Typography>
                  <Typography variant="body1">
                    オーム (Ω)
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            {/* 変形式 */}
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle1" gutterBottom>
                変形式
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                    I = V / R
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    電流を求める
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                    R = V / I
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    抵抗を求める
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                    P = V × I
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    電力を求める
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            {/* 関係の説明 */}
            <Paper sx={{ p: 3, bgcolor: 'info.light' }}>
              <Typography variant="subtitle1" gutterBottom>
                グラフから分かること
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" paragraph>
                  • 抵抗が一定のとき、電圧と電流は比例関係にある
                </Typography>
                <Typography variant="body2" paragraph>
                  • 電圧が一定のとき、抵抗と電流は反比例の関係にある
                </Typography>
                <Typography variant="body2">
                  • グラフの傾きは抵抗値の逆数（1/R）を表す
                </Typography>
              </Box>
            </Paper>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};