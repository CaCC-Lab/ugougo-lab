/**
 * グラフ表現コンポーネント
 * 
 * 円グラフ、棒グラフ、帯グラフなどで
 * 割合を視覚的に表現し、データ分析の基礎を学ぶ
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  Stack,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha
} from '@mui/material';
import {
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { GraphType, StatisticsData, GraphData } from '../types';

interface GraphRepresentationProps {
  initialData?: StatisticsData[];
  editable?: boolean;
  showLegend?: boolean;
  showTable?: boolean;
  onDataChange?: (data: StatisticsData[]) => void;
}

// デフォルトのデータセット
const defaultDataSets = {
  fruits: {
    title: '好きな果物アンケート',
    data: [
      { label: 'りんご', value: 25, percentage: 25, color: '#FF6B6B' },
      { label: 'みかん', value: 20, percentage: 20, color: '#FFA500' },
      { label: 'ぶどう', value: 15, percentage: 15, color: '#9B59B6' },
      { label: 'いちご', value: 30, percentage: 30, color: '#E74C3C' },
      { label: 'その他', value: 10, percentage: 10, color: '#95A5A6' }
    ]
  },
  subjects: {
    title: '好きな教科',
    data: [
      { label: '算数', value: 35, percentage: 35, color: '#3498DB' },
      { label: '国語', value: 25, percentage: 25, color: '#E74C3C' },
      { label: '理科', value: 20, percentage: 20, color: '#2ECC71' },
      { label: '社会', value: 15, percentage: 15, color: '#F39C12' },
      { label: '体育', value: 5, percentage: 5, color: '#9B59B6' }
    ]
  },
  weather: {
    title: '今月の天気',
    data: [
      { label: '晴れ', value: 15, percentage: 50, color: '#FFD93D' },
      { label: '曇り', value: 9, percentage: 30, color: '#95A5A6' },
      { label: '雨', value: 6, percentage: 20, color: '#3498DB' }
    ]
  }
};

export const GraphRepresentation: React.FC<GraphRepresentationProps> = ({
  initialData = defaultDataSets.fruits.data,
  editable = true,
  showLegend = true,
  showTable = true,
  onDataChange
}) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graphType, setGraphType] = useState<GraphType>('pie');
  const [data, setData] = useState<StatisticsData[]>(initialData);
  const [editMode, setEditMode] = useState(false);
  const [editingData, setEditingData] = useState<StatisticsData[]>([]);
  const [selectedDataSet, setSelectedDataSet] = useState<keyof typeof defaultDataSets>('fruits');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', value: 0, color: '#000000' });
  
  // データが変更されたら親コンポーネントに通知
  useEffect(() => {
    if (onDataChange) {
      onDataChange(data);
    }
  }, [data, onDataChange]);
  
  // グラフの描画
  useEffect(() => {
    drawGraph();
  }, [data, graphType]);
  
  // グラフ描画メイン関数
  const drawGraph = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    switch (graphType) {
      case 'pie':
        drawPieChart(ctx, canvas);
        break;
      case 'bar':
        drawBarChart(ctx, canvas);
        break;
      case 'stacked':
        drawStackedBarChart(ctx, canvas);
        break;
      case 'donut':
        drawDonutChart(ctx, canvas);
        break;
      case 'line':
        drawLineChart(ctx, canvas);
        break;
    }
  };
  
  // 円グラフ描画
  const drawPieChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    let currentAngle = -Math.PI / 2;
    
    data.forEach((item, index) => {
      const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
      
      // アニメーション用のスケール
      const animationScale = 1;
      
      // セクター描画
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius * animationScale, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      
      // 境界線
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // ラベルと値
      if (item.percentage > 5) {
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        // 背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(labelX, labelY, 25, 0, 2 * Math.PI);
        ctx.fill();
        
        // テキスト
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${item.percentage}%`, labelX, labelY);
      }
      
      currentAngle += sliceAngle;
    });
    
    // タイトル
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('割合の円グラフ', centerX, 30);
  };
  
  // 棒グラフ描画
  const drawBarChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const margin = { top: 60, right: 40, bottom: 80, left: 60 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    const barWidth = chartWidth / data.length * 0.7;
    const barGap = chartWidth / data.length * 0.3;
    
    // 軸の描画
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();
    
    // Y軸の目盛り
    for (let i = 0; i <= 10; i++) {
      const y = margin.top + chartHeight - (chartHeight * i / 10);
      
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
      
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i * 10}%`, margin.left - 10, y);
    }
    
    // バーの描画
    data.forEach((item, index) => {
      const barHeight = (item.percentage / 100) * chartHeight;
      const x = margin.left + index * (barWidth + barGap) + barGap / 2;
      const y = margin.top + chartHeight - barHeight;
      
      // バー
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // 値
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${item.percentage}%`, x + barWidth / 2, y - 5);
      
      // ラベル
      ctx.save();
      ctx.translate(x + barWidth / 2, margin.top + chartHeight + 20);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label, 0, 0);
      ctx.restore();
    });
    
    // タイトル
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('割合の棒グラフ', canvas.width / 2, 30);
  };
  
  // 帯グラフ描画
  const drawStackedBarChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const margin = 60;
    const barHeight = 80;
    const barY = (canvas.height - barHeight) / 2;
    const barWidth = canvas.width - margin * 2;
    
    let currentX = margin;
    
    // 背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(margin, barY, barWidth, barHeight);
    
    // 各セグメント
    data.forEach((item, index) => {
      const segmentWidth = (item.percentage / 100) * barWidth;
      
      // セグメント
      ctx.fillStyle = item.color;
      ctx.fillRect(currentX, barY, segmentWidth, barHeight);
      
      // 境界線
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(currentX, barY, segmentWidth, barHeight);
      
      // ラベルと値（10%以上の場合のみ表示）
      if (item.percentage >= 10) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `${item.label}\n${item.percentage}%`,
          currentX + segmentWidth / 2,
          barY + barHeight / 2
        );
      }
      
      currentX += segmentWidth;
    });
    
    // 目盛り
    for (let i = 0; i <= 10; i++) {
      const x = margin + (barWidth * i / 10);
      
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, barY + barHeight);
      ctx.lineTo(x, barY + barHeight + 10);
      ctx.stroke();
      
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${i * 10}%`, x, barY + barHeight + 25);
    }
    
    // タイトル
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('割合の帯グラフ', canvas.width / 2, 30);
  };
  
  // ドーナツグラフ描画
  const drawDonutChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 40;
    const innerRadius = outerRadius * 0.6;
    
    let currentAngle = -Math.PI / 2;
    
    data.forEach((item) => {
      const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
      
      // 外側の円弧
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      
      // 境界線
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      currentAngle += sliceAngle;
    });
    
    // 中央のテキスト
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('100%', centerX, centerY);
    
    // タイトル
    ctx.font = 'bold 20px Arial';
    ctx.fillText('割合のドーナツグラフ', centerX, 30);
  };
  
  // 折れ線グラフ描画（変化率表示用）
  const drawLineChart = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const margin = { top: 60, right: 40, bottom: 80, left: 60 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // 軸の描画
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();
    
    // 累積パーセンテージを計算
    let cumulative = 0;
    const points: { x: number; y: number; label: string; percentage: number }[] = [];
    
    data.forEach((item, index) => {
      cumulative += item.percentage;
      const x = margin.left + (chartWidth / (data.length - 1)) * index;
      const y = margin.top + chartHeight - (cumulative / 100) * chartHeight;
      points.push({ x, y, label: item.label, percentage: cumulative });
    });
    
    // 折れ線の描画
    ctx.strokeStyle = theme.palette.primary.main;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    
    // ポイントの描画
    points.forEach((point, index) => {
      // 点
      ctx.fillStyle = data[index].color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // ラベル
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(point.percentage)}%`, point.x, point.y - 15);
    });
    
    // タイトル
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('累積割合グラフ', canvas.width / 2, 30);
  };
  
  // 編集モードの開始
  const startEdit = () => {
    setEditingData([...data]);
    setEditMode(true);
  };
  
  // 編集の保存
  const saveEdit = () => {
    // 合計を100%に正規化
    const total = editingData.reduce((sum, item) => sum + item.value, 0);
    const normalizedData = editingData.map(item => ({
      ...item,
      percentage: Math.round((item.value / total) * 100)
    }));
    
    setData(normalizedData);
    setEditMode(false);
  };
  
  // 編集のキャンセル
  const cancelEdit = () => {
    setEditingData([]);
    setEditMode(false);
  };
  
  // データ項目の追加
  const addDataItem = () => {
    if (newItem.label && newItem.value > 0) {
      const updatedData = [...data, {
        ...newItem,
        percentage: 0 // 後で正規化
      }];
      
      // 合計を100%に正規化
      const total = updatedData.reduce((sum, item) => sum + item.value, 0);
      const normalizedData = updatedData.map(item => ({
        ...item,
        percentage: Math.round((item.value / total) * 100)
      }));
      
      setData(normalizedData);
      setShowAddDialog(false);
      setNewItem({ label: '', value: 0, color: '#000000' });
    }
  };
  
  // データ項目の削除
  const removeDataItem = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    
    // 合計を100%に正規化
    const total = updatedData.reduce((sum, item) => sum + item.value, 0);
    const normalizedData = updatedData.map(item => ({
      ...item,
      percentage: Math.round((item.value / total) * 100)
    }));
    
    setData(normalizedData);
  };
  
  // データテーブル
  const DataTable = () => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>項目</TableCell>
            <TableCell align="right">値</TableCell>
            <TableCell align="right">割合</TableCell>
            <TableCell align="center">色</TableCell>
            {editMode && <TableCell align="center">操作</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {(editMode ? editingData : data).map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.label}</TableCell>
              <TableCell align="right">
                {editMode ? (
                  <TextField
                    type="number"
                    value={editingData[index].value}
                    onChange={(e) => {
                      const newData = [...editingData];
                      newData[index].value = Number(e.target.value);
                      setEditingData(newData);
                    }}
                    size="small"
                    sx={{ width: 80 }}
                  />
                ) : (
                  item.value
                )}
              </TableCell>
              <TableCell align="right">{item.percentage}%</TableCell>
              <TableCell align="center">
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: item.color,
                    borderRadius: 1,
                    mx: 'auto'
                  }}
                />
              </TableCell>
              {editMode && (
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => removeDataItem(index)}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>合計</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              {data.reduce((sum, item) => sum + item.value, 0)}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              100%
            </TableCell>
            <TableCell />
            {editMode && <TableCell />}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            グラフで割合を表現
          </Typography>
          
          {editable && (
            <Box>
              {!editMode ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={startEdit}
                  variant="outlined"
                  size="small"
                >
                  編集
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    startIcon={<SaveIcon />}
                    onClick={saveEdit}
                    variant="contained"
                    size="small"
                    color="success"
                  >
                    保存
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={cancelEdit}
                    variant="outlined"
                    size="small"
                    color="error"
                  >
                    キャンセル
                  </Button>
                </Stack>
              )}
            </Box>
          )}
        </Box>
        
        {/* グラフタイプ選択 */}
        <Box sx={{ mb: 2 }}>
          <ButtonGroup size="small" fullWidth>
            <Tooltip title="円グラフ">
              <Button
                onClick={() => setGraphType('pie')}
                variant={graphType === 'pie' ? 'contained' : 'outlined'}
              >
                <PieChartIcon />
              </Button>
            </Tooltip>
            <Tooltip title="棒グラフ">
              <Button
                onClick={() => setGraphType('bar')}
                variant={graphType === 'bar' ? 'contained' : 'outlined'}
              >
                <BarChartIcon />
              </Button>
            </Tooltip>
            <Tooltip title="帯グラフ">
              <Button
                onClick={() => setGraphType('stacked')}
                variant={graphType === 'stacked' ? 'contained' : 'outlined'}
              >
                積み上げ
              </Button>
            </Tooltip>
            <Tooltip title="ドーナツグラフ">
              <Button
                onClick={() => setGraphType('donut')}
                variant={graphType === 'donut' ? 'contained' : 'outlined'}
              >
                ドーナツ
              </Button>
            </Tooltip>
            <Tooltip title="累積グラフ">
              <Button
                onClick={() => setGraphType('line')}
                variant={graphType === 'line' ? 'contained' : 'outlined'}
              >
                <LineChartIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>
        
        {/* データセット選択 */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1}>
            <Chip
              label="好きな果物"
              onClick={() => {
                setSelectedDataSet('fruits');
                setData(defaultDataSets.fruits.data);
              }}
              color={selectedDataSet === 'fruits' ? 'primary' : 'default'}
            />
            <Chip
              label="好きな教科"
              onClick={() => {
                setSelectedDataSet('subjects');
                setData(defaultDataSets.subjects.data);
              }}
              color={selectedDataSet === 'subjects' ? 'primary' : 'default'}
            />
            <Chip
              label="今月の天気"
              onClick={() => {
                setSelectedDataSet('weather');
                setData(defaultDataSets.weather.data);
              }}
              color={selectedDataSet === 'weather' ? 'primary' : 'default'}
            />
            {editable && (
              <Chip
                label="新規追加"
                onClick={() => setShowAddDialog(true)}
                icon={<AddIcon />}
                color="secondary"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
        
        {/* グラフ表示 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius
            }}
          />
        </Box>
        
        {/* データテーブル */}
        {showTable && <DataTable />}
        
        {/* 凡例 */}
        {showLegend && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              凡例
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {data.map((item, index) => (
                <Chip
                  key={index}
                  label={`${item.label} (${item.percentage}%)`}
                  sx={{
                    backgroundColor: alpha(item.color, 0.2),
                    borderColor: item.color,
                    borderWidth: 2,
                    borderStyle: 'solid'
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
      
      {/* 新規追加ダイアログ */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)}>
        <DialogTitle>新しい項目を追加</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <TextField
              label="項目名"
              value={newItem.label}
              onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
              fullWidth
            />
            <TextField
              label="値"
              type="number"
              value={newItem.value}
              onChange={(e) => setNewItem({ ...newItem, value: Number(e.target.value) })}
              fullWidth
            />
            <Box>
              <Typography variant="body2" gutterBottom>
                色
              </Typography>
              <input
                type="color"
                value={newItem.color}
                onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                style={{ width: '100%', height: 40 }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>キャンセル</Button>
          <Button onClick={addDataItem} variant="contained">追加</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};