/**
 * 小数グリッド表示コンポーネント
 * 
 * 10×10のグリッドで1を表現し、
 * 各セルが0.01、各列が0.1を表すことで
 * 小数の概念を視覚的に理解できるようにする
 */

import React, { useMemo } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import type { GridCell } from '../types';

interface DecimalGridProps {
  value: number; // 表示する小数値
  highlightedCells: Set<string>; // ハイライトされたセルのキー
  onCellClick?: (row: number, col: number) => void;
  showLabels?: boolean; // 0.1, 0.01のラベルを表示するか
  interactive?: boolean; // クリック可能にするか
  animateChanges?: boolean; // 値の変化をアニメーションするか
}

export const DecimalGrid: React.FC<DecimalGridProps> = ({
  value,
  highlightedCells,
  onCellClick,
  showLabels = true,
  interactive = true,
  animateChanges = true
}) => {
  const theme = useTheme();
  
  // 値から塗りつぶすセルを計算
  const filledCells = useMemo(() => {
    const cells = new Set<string>();
    const totalCells = Math.round(value * 100); // 0.01単位でのセル数
    
    // 完全な列（0.1単位）
    const fullColumns = Math.floor(totalCells / 10);
    for (let col = 0; col < fullColumns; col++) {
      for (let row = 0; row < 10; row++) {
        cells.add(`${row}-${col}`);
      }
    }
    
    // 部分的な列の残りのセル
    const remainingCells = totalCells % 10;
    for (let row = 0; row < remainingCells; row++) {
      cells.add(`${row}-${fullColumns}`);
    }
    
    return cells;
  }, [value]);
  
  // セルの色を決定
  const getCellColor = (row: number, col: number): string => {
    const key = `${row}-${col}`;
    
    if (highlightedCells.has(key)) {
      return theme.palette.warning.main; // ハイライト色
    }
    
    if (filledCells.has(key)) {
      // 列ごとに少し色を変えて0.1の単位を視覚的に区別
      const hue = 200 + (col * 5); // 青系の色相
      return `hsl(${hue}, 70%, 50%)`;
    }
    
    return theme.palette.grey[200]; // 空のセル
  };
  
  // セルのアニメーション設定
  const getCellAnimation = (row: number, col: number) => {
    const key = `${row}-${col}`;
    const isFilled = filledCells.has(key);
    
    return {
      initial: animateChanges ? { scale: 0.8, opacity: 0 } : {},
      animate: {
        scale: isFilled ? 1 : 0.95,
        opacity: 1,
        backgroundColor: getCellColor(row, col)
      },
      transition: {
        duration: 0.3,
        delay: animateChanges ? (col * 10 + row) * 0.01 : 0, // 波のようなアニメーション
        ease: 'easeOut'
      }
    };
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
        {/* タイトルと現在の値 */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            = {Math.floor(value)}（整数部分） + {(value - Math.floor(value)).toFixed(2)}（小数部分）
          </Typography>
        </Box>
        
        {/* グリッド本体 */}
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          {/* 列ラベル（0.1単位） */}
          {showLabels && (
            <Box sx={{ display: 'flex', mb: 1 }}>
              <Box sx={{ width: 30 }} /> {/* 行ラベル用のスペース */}
              {Array.from({ length: 10 }, (_, col) => (
                <Box
                  key={`col-label-${col}`}
                  sx={{
                    width: 35,
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary
                  }}
                >
                  {col === 0 && '0.0'}
                  {col === 1 && '0.1'}
                  {col === 9 && '0.9'}
                </Box>
              ))}
            </Box>
          )}
          
          <Box sx={{ display: 'flex' }}>
            {/* 行ラベル（0.01単位） */}
            {showLabels && (
              <Box sx={{ display: 'flex', flexDirection: 'column', mr: 1 }}>
                {Array.from({ length: 10 }, (_, row) => (
                  <Box
                    key={`row-label-${row}`}
                    sx={{
                      height: 35,
                      width: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      fontSize: '0.7rem',
                      color: theme.palette.text.secondary,
                      pr: 0.5
                    }}
                  >
                    {row === 0 && '+0.00'}
                    {row === 1 && '+0.01'}
                    {row === 9 && '+0.09'}
                  </Box>
                ))}
              </Box>
            )}
            
            {/* グリッド */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(10, 35px)',
                gridTemplateRows: 'repeat(10, 35px)',
                gap: 0.5,
                border: `2px solid ${theme.palette.primary.main}`,
                borderRadius: 1,
                p: 0.5,
                backgroundColor: theme.palette.background.paper
              }}
            >
              {Array.from({ length: 100 }, (_, index) => {
                const row = index % 10;
                const col = Math.floor(index / 10);
                const key = `${row}-${col}`;
                
                return (
                  <motion.div
                    key={key}
                    {...getCellAnimation(row, col)}
                    style={{
                      width: '100%',
                      height: '100%',
                      cursor: interactive ? 'pointer' : 'default',
                      borderRadius: 4,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => interactive && onCellClick?.(row, col)}
                    whileHover={interactive ? { scale: 1.1 } : {}}
                    whileTap={interactive ? { scale: 0.95 } : {}}
                  >
                    {/* セルの値表示（デバッグ用、通常は非表示） */}
                    {process.env.NODE_ENV === 'development' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          fontSize: '0.6rem',
                          color: 'white',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          px: 0.3,
                          borderRadius: '0 0 4px 0'
                        }}
                      >
                        {(col * 0.1 + row * 0.01).toFixed(2)}
                      </Box>
                    )}
                  </motion.div>
                );
              })}
            </Box>
          </Box>
          
          {/* 凡例 */}
          {showLabels && (
            <Box sx={{ mt: 2, display: 'flex', gap: 3, justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: 'hsl(200, 70%, 50%)',
                    borderRadius: 0.5
                  }}
                />
                <Typography variant="caption">= 0.01（1つのマス）</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 20,
                    background: 'linear-gradient(to right, hsl(200, 70%, 50%), hsl(205, 70%, 50%))',
                    borderRadius: 0.5
                  }}
                />
                <Typography variant="caption">= 0.1（1列）</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 100,
                    height: 20,
                    background: 'linear-gradient(to right, hsl(200, 70%, 50%), hsl(250, 70%, 50%))',
                    borderRadius: 0.5
                  }}
                />
                <Typography variant="caption">= 1.0（全体）</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};