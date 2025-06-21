/**
 * 天秤ビジュアライザーコンポーネント
 * 
 * 機能：
 * - 方程式を天秤のメタファーで視覚化
 * - ドラッグ＆ドロップでアイテムの移動
 * - アニメーションによる傾きの表現
 * - 等式の性質の直感的理解
 */

import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { BalanceState, BalanceItem, DragDropState } from '../types';

interface BalanceVisualizerProps {
  balanceState: BalanceState;
  dragDropState: DragDropState;
  onStartDrag: (item: BalanceItem) => void;
  onDragOver: (side: 'left' | 'right') => void;
  onDrop: (side: 'left' | 'right') => void;
  showValues?: boolean;
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

export const BalanceVisualizer: React.FC<BalanceVisualizerProps> = ({
  balanceState,
  dragDropState,
  onStartDrag,
  onDragOver,
  onDrop,
  showValues = true,
  animationSpeed = 'normal'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // アニメーション速度の設定
  const animationDuration = {
    slow: 1.5,
    normal: 0.8,
    fast: 0.3
  }[animationSpeed];
  
  /**
   * 天秤を描画
   */
  const drawBalance = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height);
    
    // 中心座標
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 天秤の支点を描画
    ctx.fillStyle = '#34495E';
    ctx.beginPath();
    ctx.moveTo(centerX - 30, height - 50);
    ctx.lineTo(centerX + 30, height - 50);
    ctx.lineTo(centerX, centerY + 50);
    ctx.closePath();
    ctx.fill();
    
    // 天秤の軸を描画
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((balanceState.tiltAngle * Math.PI) / 180);
    
    // 横棒
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(-200, -5, 400, 10);
    
    // 左の皿
    ctx.fillStyle = '#3498DB';
    ctx.fillRect(-180, 0, 60, 5);
    ctx.beginPath();
    ctx.arc(-150, 20, 40, 0, Math.PI, false);
    ctx.fill();
    
    // 右の皿
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(120, 0, 60, 5);
    ctx.beginPath();
    ctx.arc(150, 20, 40, 0, Math.PI, false);
    ctx.fill();
    
    ctx.restore();
    
    // 重さの表示
    if (showValues) {
      ctx.fillStyle = '#2C3E50';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      
      // 左側の重さ
      ctx.fillText(
        `${balanceState.leftWeight}`,
        centerX - 150,
        centerY + 80
      );
      
      // 右側の重さ
      ctx.fillText(
        `${balanceState.rightWeight}`,
        centerX + 150,
        centerY + 80
      );
      
      // バランス状態
      ctx.font = '14px Arial';
      ctx.fillStyle = balanceState.isBalanced ? '#27AE60' : '#E74C3C';
      ctx.fillText(
        balanceState.isBalanced ? 'バランスが取れています' : 'バランスが崩れています',
        centerX,
        height - 20
      );
    }
  };
  
  /**
   * キャンバスの描画
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 高DPI対応
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    drawBalance(ctx, rect.width, rect.height);
  }, [balanceState, showValues]);
  
  /**
   * アイテムの位置を計算
   */
  const getItemPosition = (item: BalanceItem, index: number, side: 'left' | 'right') => {
    const baseX = side === 'left' ? 200 : 500;
    const baseY = 200;
    const tiltRad = (balanceState.tiltAngle * Math.PI) / 180;
    
    // 傾きに応じて位置を調整
    const adjustedX = baseX + index * 60;
    const adjustedY = baseY - Math.sin(tiltRad) * (adjustedX - 350) * 0.3;
    
    return { x: adjustedX, y: adjustedY };
  };
  
  /**
   * ズーム操作
   */
  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };
  
  /**
   * リセット
   */
  const handleReset = () => {
    setScale(1);
  };
  
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F8F9FA'
        }}
      >
        {/* ツールバー */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#2C3E50' }}>
            天秤でバランスを見る
          </Typography>
          <Box>
            <Tooltip title="縮小">
              <IconButton size="small" onClick={() => handleZoom(-0.1)}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="拡大">
              <IconButton size="small" onClick={() => handleZoom(0.1)}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="リセット">
              <IconButton size="small" onClick={handleReset}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* メインビジュアライザー */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
            backgroundColor: '#FFFFFF',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease'
          }}
        >
          {/* 背景のキャンバス */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0
            }}
          />
          
          {/* アイテムのレンダリング */}
          <AnimatePresence>
            {balanceState.items.map((item, index) => {
              const position = getItemPosition(
                item,
                balanceState.items.filter(i => i.side === item.side).indexOf(item),
                item.side
              );
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    x: position.x,
                    y: position.y,
                    scale: 1,
                    opacity: 1,
                    rotate: balanceState.tiltAngle * (item.side === 'left' ? -1 : 1) * 0.5
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    duration: animationDuration,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }}
                  drag={!dragDropState.isDragging}
                  dragConstraints={{ left: 0, right: 700, top: 0, bottom: 400 }}
                  onDragStart={() => onStartDrag(item)}
                  onDragEnd={() => {
                    if (dragDropState.dropTarget) {
                      onDrop(dragDropState.dropTarget);
                    }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    position: 'absolute',
                    cursor: 'grab',
                    userSelect: 'none'
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: item.type === 'variable' ? '50%' : 1,
                      backgroundColor: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      boxShadow: hoveredItem === item.id ? 4 : 2,
                      border: dragDropState.draggedItem?.id === item.id
                        ? '3px dashed #2C3E50'
                        : 'none'
                    }}
                  >
                    {item.label}
                  </Box>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* ドロップゾーン */}
          <Box
            sx={{
              position: 'absolute',
              left: 100,
              top: 150,
              width: 200,
              height: 100,
              backgroundColor:
                dragDropState.dropTarget === 'left'
                  ? 'rgba(52, 152, 219, 0.2)'
                  : 'transparent',
              border:
                dragDropState.dropTarget === 'left'
                  ? '2px dashed #3498DB'
                  : '2px dashed transparent',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              pointerEvents: dragDropState.isDragging ? 'auto' : 'none'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              onDragOver('left');
            }}
            onDragLeave={() => onDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              onDrop('left');
            }}
          />
          
          <Box
            sx={{
              position: 'absolute',
              right: 100,
              top: 150,
              width: 200,
              height: 100,
              backgroundColor:
                dragDropState.dropTarget === 'right'
                  ? 'rgba(231, 76, 60, 0.2)'
                  : 'transparent',
              border:
                dragDropState.dropTarget === 'right'
                  ? '2px dashed #E74C3C'
                  : '2px dashed transparent',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              pointerEvents: dragDropState.isDragging ? 'auto' : 'none'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              onDragOver('right');
            }}
            onDragLeave={() => onDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              onDrop('right');
            }}
          />
        </Box>
        
        {/* 説明文 */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            アイテムをドラッグして移動できます。両辺に同じ操作をして、天秤のバランスを保ちましょう。
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};