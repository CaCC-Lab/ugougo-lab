/**
 * 分数棒グラフ視覚化コンポーネント
 */

import React, { useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';

interface FractionBarVisualizationProps {
  numerator: number;
  denominator: number;
  width?: number;
  height?: number;
  animationDelay?: number;
  showLabels?: boolean;
  interactive?: boolean;
  orientation?: 'horizontal' | 'vertical';
  onSegmentClick?: (segmentIndex: number) => void;
}

export const FractionBarVisualization: React.FC<FractionBarVisualizationProps> = ({
  numerator,
  denominator,
  width = 400,
  height = 100,
  animationDelay = 0,
  showLabels = true,
  interactive = false,
  orientation = 'horizontal',
  onSegmentClick
}) => {
  const theme = useTheme();
  const [animatedNumerator, setAnimatedNumerator] = useState(0);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  // アニメーション効果
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        if (current <= numerator) {
          setAnimatedNumerator(current);
          current++;
        } else {
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [numerator, animationDelay]);

  // セグメントの寸法計算
  const isHorizontal = orientation === 'horizontal';
  const segmentWidth = isHorizontal ? width / denominator : width;
  const segmentHeight = isHorizontal ? height : height / denominator;
  const totalWidth = isHorizontal ? width : width;
  const totalHeight = isHorizontal ? height : height;

  // セグメント作成
  const createSegment = (index: number) => {
    const x = isHorizontal ? index * segmentWidth : 0;
    const y = isHorizontal ? 0 : index * segmentHeight;
    
    const isSelected = index < animatedNumerator;
    const isHovered = hoveredSegment === index;
    
    return (
      <g key={index}>
        {/* セグメント本体 */}
        <rect
          x={x}
          y={y}
          width={segmentWidth}
          height={segmentHeight}
          fill={isSelected ? theme.palette.primary.main : theme.palette.grey[200]}
          stroke={theme.palette.common.white}
          strokeWidth="2"
          style={{
            cursor: interactive ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            opacity: isHovered ? 0.8 : 1
          }}
          onMouseEnter={() => interactive && setHoveredSegment(index)}
          onMouseLeave={() => interactive && setHoveredSegment(null)}
          onClick={() => interactive && onSegmentClick?.(index)}
        />
        
        {/* セグメント番号 */}
        {showLabels && denominator <= 10 && (
          <text
            x={x + segmentWidth / 2}
            y={y + segmentHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontWeight="bold"
            fill={isSelected ? theme.palette.common.white : theme.palette.text.primary}
          >
            {index + 1}
          </text>
        )}
      </g>
    );
  };

  // 分数表示の位置計算
  const fractionX = totalWidth / 2;
  const fractionY = totalHeight + 40;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <svg 
        width={totalWidth + 20} 
        height={totalHeight + 80} 
        style={{ overflow: 'visible' }}
      >
        {/* 背景枠 */}
        <rect
          x={0}
          y={0}
          width={totalWidth}
          height={totalHeight}
          fill="none"
          stroke={theme.palette.grey[400]}
          strokeWidth="2"
          rx="4"
        />
        
        {/* セグメント */}
        {Array.from({ length: denominator }, (_, index) => createSegment(index))}
        
        {/* 全体の枠線 */}
        <rect
          x={0}
          y={0}
          width={totalWidth}
          height={totalHeight}
          fill="none"
          stroke={theme.palette.text.primary}
          strokeWidth="3"
          rx="4"
        />
        
        {/* 分数表示 */}
        <g>
          <text
            x={fractionX}
            y={fractionY - 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="24"
            fontWeight="bold"
            fill={theme.palette.primary.main}
          >
            {animatedNumerator}
          </text>
          <line
            x1={fractionX - 20}
            y1={fractionY + 5}
            x2={fractionX + 20}
            y2={fractionY + 5}
            stroke={theme.palette.text.primary}
            strokeWidth="2"
          />
          <text
            x={fractionX}
            y={fractionY + 20}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="24"
            fontWeight="bold"
            fill={theme.palette.text.primary}
          >
            {denominator}
          </text>
        </g>
        
        {/* 選択範囲の強調表示 */}
        {animatedNumerator > 0 && (
          <rect
            x={0}
            y={0}
            width={isHorizontal ? (animatedNumerator * segmentWidth) : totalWidth}
            height={isHorizontal ? totalHeight : (animatedNumerator * segmentHeight)}
            fill="none"
            stroke={theme.palette.primary.main}
            strokeWidth="4"
            strokeDasharray="8,4"
            rx="4"
            style={{
              animation: 'pulse 2s infinite'
            }}
          />
        )}
      </svg>
      
      {/* CSS アニメーション */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}
      </style>
      
      {/* 説明テキスト */}
      <Box sx={{ textAlign: 'center', maxWidth: totalWidth }}>
        {animatedNumerator === 0 && (
          <span style={{ color: theme.palette.text.secondary }}>
            0個の部分が選ばれています
          </span>
        )}
        {animatedNumerator === 1 && denominator > 1 && (
          <span style={{ color: theme.palette.primary.main }}>
            {denominator}等分した1個の部分
          </span>
        )}
        {animatedNumerator > 1 && animatedNumerator < denominator && (
          <span style={{ color: theme.palette.primary.main }}>
            {denominator}等分した{animatedNumerator}個の部分
          </span>
        )}
        {animatedNumerator === denominator && denominator > 1 && (
          <span style={{ color: theme.palette.success.main }}>
            全体（{denominator}個すべて）
          </span>
        )}
        {animatedNumerator > denominator && (
          <span style={{ color: theme.palette.warning.main }}>
            全体を超えています
          </span>
        )}
      </Box>
      
      {/* 比較用の単位長方形 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
        <Box
          sx={{
            width: isHorizontal ? width / 4 : width / 2,
            height: isHorizontal ? height / 2 : height / 4,
            border: `2px solid ${theme.palette.grey[400]}`,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: theme.palette.text.secondary
          }}
        >
          全体
        </Box>
        <span style={{ color: theme.palette.text.secondary }}>と比べてみよう</span>
      </Box>
    </Box>
  );
};