/**
 * 分数ビジュアライザーコンポーネント
 * 
 * 機能：
 * - 円、長方形、数直線での分数表現
 * - アニメーション付き変化
 * - インタラクティブな操作
 * - ドラッグ＆ドロップ対応
 */

import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper, Typography, ToggleButton, ToggleButtonGroup, IconButton, Tooltip } from '@mui/material';
import {
  PieChart as CircleIcon,
  GridOn as RectangleIcon,
  Timeline as NumberLineIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { Fraction, VisualizationType, VisualElement } from '../types';

interface FractionVisualizerProps {
  fraction: Fraction;
  visualizationType: VisualizationType;
  onVisualizationChange?: (type: VisualizationType) => void;
  showLabels?: boolean;
  interactive?: boolean;
  highlightParts?: number[];
  onPartClick?: (partIndex: number) => void;
  size?: 'small' | 'medium' | 'large';
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

export const FractionVisualizer: React.FC<FractionVisualizerProps> = ({
  fraction: inputFraction,
  visualizationType,
  onVisualizationChange,
  showLabels = true,
  interactive = false,
  highlightParts = [],
  onPartClick,
  size = 'medium',
  animationSpeed = 'normal'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPart, setHoveredPart] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  
  // 安全なfractionオブジェクトを作成
  const fraction = inputFraction || {
    numerator: 1,
    denominator: 2,
    wholeNumber: 0,
    isNegative: false
  };
  
  // サイズ設定
  const dimensions = {
    small: { width: 200, height: 200 },
    medium: { width: 300, height: 300 },
    large: { width: 400, height: 400 }
  }[size];
  
  // アニメーション速度
  const animationDuration = {
    slow: 1.5,
    normal: 0.8,
    fast: 0.3
  }[animationSpeed];
  
  /**
   * 分数を文字列形式で表示
   */
  const formatFraction = (): string => {
    let result = '';
    if (fraction.isNegative) result += '-';
    if (fraction.wholeNumber) {
      result += `${fraction.wholeNumber} `;
    }
    result += `${fraction.numerator}/${fraction.denominator}`;
    return result;
  };
  
  /**
   * 円グラフを描画
   */
  const drawCircle = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    // 背景円
    ctx.fillStyle = '#E8E8E8';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 各部分を描画
    const anglePerPart = (Math.PI * 2) / fraction.denominator;
    const filledParts = fraction.numerator;
    
    for (let i = 0; i < fraction.denominator; i++) {
      const startAngle = -Math.PI / 2 + i * anglePerPart;
      const endAngle = startAngle + anglePerPart;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      // 色の設定
      if (i < filledParts) {
        if (highlightParts.includes(i)) {
          ctx.fillStyle = '#FF6B6B';
        } else {
          ctx.fillStyle = '#4ECDC4';
        }
      } else {
        ctx.fillStyle = '#F8F9FA';
      }
      
      if (hoveredPart === i && interactive) {
        ctx.fillStyle = '#FFE66D';
      }
      
      ctx.fill();
      ctx.strokeStyle = '#2C3E50';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // ラベル
    if (showLabels) {
      ctx.fillStyle = '#2C3E50';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatFraction(), centerX, height - 30);
    }
  };
  
  /**
   * 長方形を描画
   */
  const drawRectangle = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const rectWidth = width * 0.8;
    const rectHeight = height * 0.4;
    const startX = (width - rectWidth) / 2;
    const startY = (height - rectHeight) / 2;
    
    // 外枠
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, rectWidth, rectHeight);
    
    // 各部分を描画
    const partWidth = rectWidth / fraction.denominator;
    const filledParts = fraction.numerator;
    
    for (let i = 0; i < fraction.denominator; i++) {
      const x = startX + i * partWidth;
      
      // 色の設定
      if (i < filledParts) {
        if (highlightParts.includes(i)) {
          ctx.fillStyle = '#FF6B6B';
        } else {
          ctx.fillStyle = '#4ECDC4';
        }
      } else {
        ctx.fillStyle = '#F8F9FA';
      }
      
      if (hoveredPart === i && interactive) {
        ctx.fillStyle = '#FFE66D';
      }
      
      ctx.fillRect(x, startY, partWidth, rectHeight);
      
      // 区切り線
      if (i > 0) {
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + rectHeight);
        ctx.stroke();
      }
    }
    
    // ラベル
    if (showLabels) {
      ctx.fillStyle = '#2C3E50';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatFraction(), width / 2, height - 30);
    }
  };
  
  /**
   * 数直線を描画
   */
  const drawNumberLine = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const lineY = height / 2;
    const lineStartX = width * 0.1;
    const lineEndX = width * 0.9;
    const lineLength = lineEndX - lineStartX;
    
    // メインライン
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lineStartX, lineY);
    ctx.lineTo(lineEndX, lineY);
    ctx.stroke();
    
    // 目盛り
    const divisions = fraction.denominator;
    for (let i = 0; i <= divisions; i++) {
      const x = lineStartX + (lineLength / divisions) * i;
      
      ctx.beginPath();
      ctx.moveTo(x, lineY - 10);
      ctx.lineTo(x, lineY + 10);
      ctx.stroke();
      
      // 数値ラベル
      if (i === 0 || i === divisions) {
        ctx.fillStyle = '#2C3E50';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(i === 0 ? '0' : '1', x, lineY + 15);
      }
    }
    
    // 分数の位置
    const fractionValue = fraction.numerator / fraction.denominator;
    const fractionX = lineStartX + lineLength * fractionValue;
    
    // マーカー
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.arc(fractionX, lineY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 矢印
    ctx.beginPath();
    ctx.moveTo(fractionX, lineY - 20);
    ctx.lineTo(fractionX - 5, lineY - 30);
    ctx.lineTo(fractionX + 5, lineY - 30);
    ctx.closePath();
    ctx.fill();
    
    // ラベル
    if (showLabels) {
      ctx.fillStyle = '#2C3E50';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(formatFraction(), fractionX, lineY - 35);
    }
  };
  
  /**
   * キャンバスを再描画
   */
  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 高DPI対応
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr * scale, dpr * scale);
    
    // クリア
    ctx.clearRect(0, 0, rect.width / scale, rect.height / scale);
    
    // 描画
    switch (visualizationType) {
      case 'circle':
        drawCircle(ctx, rect.width / scale, rect.height / scale);
        break;
      case 'rectangle':
        drawRectangle(ctx, rect.width / scale, rect.height / scale);
        break;
      case 'numberLine':
        drawNumberLine(ctx, rect.width / scale, rect.height / scale);
        break;
    }
  };
  
  /**
   * マウス位置から部分を特定
   */
  const getPartFromMousePosition = (e: React.MouseEvent<HTMLCanvasElement>): number | null => {
    if (!interactive || visualizationType === 'numberLine') return null;
    
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    if (visualizationType === 'circle') {
      // 円の中心からの角度を計算
      const centerX = rect.width / 2 / scale;
      const centerY = rect.height / 2 / scale;
      const angle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
      const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
      
      const anglePerPart = (Math.PI * 2) / fraction.denominator;
      const part = Math.floor(normalizedAngle / anglePerPart);
      
      return part;
    } else if (visualizationType === 'rectangle') {
      // 長方形の部分を特定
      const rectWidth = rect.width * 0.8 / scale;
      const startX = (rect.width / scale - rectWidth) / 2;
      const partWidth = rectWidth / fraction.denominator;
      
      if (x >= startX && x <= startX + rectWidth) {
        const part = Math.floor((x - startX) / partWidth);
        return part;
      }
    }
    
    return null;
  };
  
  // エフェクトで再描画
  useEffect(() => {
    redraw();
  }, [fraction, visualizationType, highlightParts, hoveredPart, scale, showLabels]);
  
  // ウィンドウリサイズ対応
  useEffect(() => {
    const handleResize = () => redraw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* ツールバー */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <ToggleButtonGroup
            value={visualizationType}
            exclusive
            onChange={(_, newType) => {
              if (newType && onVisualizationChange) {
                onVisualizationChange(newType);
              }
            }}
            size="small"
          >
            <ToggleButton value="circle" aria-label="円グラフ">
              <Tooltip title="円グラフ">
                <CircleIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="rectangle" aria-label="長方形">
              <Tooltip title="長方形">
                <RectangleIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="numberLine" aria-label="数直線">
              <Tooltip title="数直線">
                <NumberLineIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Box>
            <Tooltip title="縮小">
              <IconButton size="small" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="拡大">
              <IconButton size="small" onClick={() => setScale(s => Math.min(2, s + 0.1))}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="リセット">
              <IconButton size="small" onClick={() => setScale(1)}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* メインキャンバス */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={visualizationType}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: animationDuration }}
              style={{ width: '100%', height: '100%' }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  width: '100%',
                  height: '100%',
                  cursor: interactive ? 'pointer' : 'default'
                }}
                onMouseMove={(e) => {
                  if (interactive) {
                    const part = getPartFromMousePosition(e);
                    setHoveredPart(part);
                  }
                }}
                onMouseLeave={() => setHoveredPart(null)}
                onClick={(e) => {
                  if (interactive && onPartClick) {
                    const part = getPartFromMousePosition(e);
                    if (part !== null) {
                      onPartClick(part);
                    }
                  }
                }}
              />
            </motion.div>
          </AnimatePresence>
        </Box>
        
        {/* 説明文 */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {fraction.wholeNumber && `${fraction.wholeNumber}と`}
            {fraction.numerator}/{fraction.denominator}
            {visualizationType === 'circle' && ' - 円を等分して表現'}
            {visualizationType === 'rectangle' && ' - 長方形を等分して表現'}
            {visualizationType === 'numberLine' && ' - 数直線上の位置で表現'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};