/**
 * 分数数直線視覚化コンポーネント
 */

import React, { useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';

interface FractionNumberLineProps {
  numerator: number;
  denominator: number;
  width?: number;
  height?: number;
  max?: number;
  animationDelay?: number;
  showLabels?: boolean;
  showGrid?: boolean;
  interactive?: boolean;
  onPositionClick?: (position: number) => void;
}

export const FractionNumberLine: React.FC<FractionNumberLineProps> = ({
  numerator,
  denominator,
  width = 500,
  height = 120,
  max = 2,
  animationDelay = 0,
  showLabels = true,
  showGrid = true,
  interactive = false,
  onPositionClick
}) => {
  const theme = useTheme();
  const [animatedPosition, setAnimatedPosition] = useState(0);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);

  // 数直線の設定
  const padding = 50;
  const lineWidth = width - 2 * padding;
  const lineY = height / 2;
  const startX = padding;
  const endX = padding + lineWidth;

  // 分数の小数値
  const fractionValue = denominator > 0 ? numerator / denominator : 0;

  // アニメーション効果
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const target = fractionValue;
      const steps = 20;
      const increment = target / steps;
      
      const interval = setInterval(() => {
        if (current < target) {
          current = Math.min(current + increment, target);
          setAnimatedPosition(current);
        } else {
          setAnimatedPosition(target);
          clearInterval(interval);
        }
      }, 50);
      
      return () => clearInterval(interval);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [fractionValue, animationDelay]);

  // 位置から座標への変換
  const valueToX = (value: number) => {
    return startX + (value / max) * lineWidth;
  };

  // 座標から位置への変換
  const xToValue = (x: number) => {
    return ((x - startX) / lineWidth) * max;
  };

  // 主要な目盛り（整数）
  const majorTicks = Array.from({ length: max + 1 }, (_, i) => i);
  
  // 分母に基づく細かい目盛り
  const minorTicks = Array.from({ length: max * denominator + 1 }, (_, i) => i / denominator);

  // クリックハンドラー
  const handleLineClick = (event: React.MouseEvent<SVGElement>) => {
    if (!interactive) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const value = xToValue(clickX);
    
    // 最も近い分数位置にスナップ
    const snappedValue = Math.round(value * denominator) / denominator;
    onPositionClick?.(snappedValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <svg 
        width={width} 
        height={height + 60} 
        style={{ overflow: 'visible', cursor: interactive ? 'pointer' : 'default' }}
        onClick={handleLineClick}
      >
        {/* 背景グリッド */}
        {showGrid && (
          <g opacity="0.3">
            {minorTicks.map((tick, index) => {
              if (tick <= max) {
                const x = valueToX(tick);
                return (
                  <line
                    key={`grid-${index}`}
                    x1={x}
                    y1={lineY - 5}
                    x2={x}
                    y2={lineY + 5}
                    stroke={theme.palette.grey[300]}
                    strokeWidth="1"
                  />
                );
              }
              return null;
            })}
          </g>
        )}
        
        {/* メインの数直線 */}
        <line
          x1={startX}
          y1={lineY}
          x2={endX}
          y2={lineY}
          stroke={theme.palette.text.primary}
          strokeWidth="3"
          markerEnd="url(#arrowhead)"
        />
        
        {/* 矢印マーカー */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill={theme.palette.text.primary}
            />
          </marker>
        </defs>
        
        {/* 主要な目盛り */}
        {majorTicks.map((tick) => {
          const x = valueToX(tick);
          return (
            <g key={`major-${tick}`}>
              <line
                x1={x}
                y1={lineY - 15}
                x2={x}
                y2={lineY + 15}
                stroke={theme.palette.text.primary}
                strokeWidth="2"
              />
              {showLabels && (
                <text
                  x={x}
                  y={lineY + 35}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  fontWeight="bold"
                  fill={theme.palette.text.primary}
                >
                  {tick}
                </text>
              )}
            </g>
          );
        })}
        
        {/* 分数位置の目盛り（現在の分母で） */}
        {denominator > 1 && Array.from({ length: max * denominator + 1 }, (_, i) => {
          const value = i / denominator;
          if (value <= max && !Number.isInteger(value)) {
            const x = valueToX(value);
            return (
              <g key={`fraction-${i}`}>
                <line
                  x1={x}
                  y1={lineY - 8}
                  x2={x}
                  y2={lineY + 8}
                  stroke={theme.palette.primary.main}
                  strokeWidth="1"
                />
                {showLabels && denominator <= 8 && (
                  <text
                    x={x}
                    y={lineY - 25}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill={theme.palette.primary.main}
                  >
                    {i}/{denominator}
                  </text>
                )}
              </g>
            );
          }
          return null;
        })}
        
        {/* 現在の分数位置 */}
        {animatedPosition >= 0 && animatedPosition <= max && (
          <g>
            {/* 位置マーカー */}
            <circle
              cx={valueToX(animatedPosition)}
              cy={lineY}
              r="8"
              fill={theme.palette.secondary.main}
              stroke={theme.palette.common.white}
              strokeWidth="3"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                animation: 'bounce 1s infinite alternate'
              }}
            />
            
            {/* 分数値表示 */}
            <g transform={`translate(${valueToX(animatedPosition)}, ${lineY - 50})`}>
              <rect
                x="-25"
                y="-15"
                width="50"
                height="30"
                fill={theme.palette.secondary.main}
                rx="15"
                stroke={theme.palette.common.white}
                strokeWidth="2"
              />
              <text
                x="0"
                y="-5"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="bold"
                fill={theme.palette.common.white}
              >
                {numerator}
              </text>
              <line
                x1="-12"
                y1="2"
                x2="12"
                y2="2"
                stroke={theme.palette.common.white}
                strokeWidth="2"
              />
              <text
                x="0"
                y="12"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="bold"
                fill={theme.palette.common.white}
              >
                {denominator}
              </text>
            </g>
            
            {/* 0からの距離を示す線 */}
            <line
              x1={startX}
              y1={lineY + 25}
              x2={valueToX(animatedPosition)}
              y2={lineY + 25}
              stroke={theme.palette.secondary.main}
              strokeWidth="3"
              opacity="0.7"
            />
          </g>
        )}
        
        {/* ホバー位置 */}
        {interactive && hoveredPosition !== null && (
          <circle
            cx={valueToX(hoveredPosition)}
            cy={lineY}
            r="6"
            fill="none"
            stroke={theme.palette.primary.main}
            strokeWidth="2"
            opacity="0.7"
          />
        )}
      </svg>
      
      {/* CSS アニメーション */}
      <style>
        {`
          @keyframes bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-5px); }
          }
        `}
      </style>
      
      {/* 説明テキスト */}
      <Box sx={{ textAlign: 'center', maxWidth: width }}>
        {fractionValue === 0 && (
          <span style={{ color: theme.palette.text.secondary }}>
            数直線の0の位置
          </span>
        )}
        {fractionValue > 0 && fractionValue < 1 && (
          <span style={{ color: theme.palette.primary.main }}>
            0と1の間の位置：{numerator}/{denominator} = {fractionValue.toFixed(3)}
          </span>
        )}
        {fractionValue === 1 && (
          <span style={{ color: theme.palette.success.main }}>
            1（全体）の位置
          </span>
        )}
        {fractionValue > 1 && fractionValue <= max && (
          <span style={{ color: theme.palette.warning.main }}>
            1を超えた位置：{numerator}/{denominator} = {fractionValue.toFixed(3)}
          </span>
        )}
        {fractionValue > max && (
          <span style={{ color: theme.palette.error.main }}>
            表示範囲を超えています
          </span>
        )}
      </Box>
      
      {/* 分数と小数の対応表示 */}
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        backgroundColor: theme.palette.grey[100], 
        borderRadius: 2,
        textAlign: 'center'
      }}>
        <Box sx={{ fontSize: '18px', fontWeight: 'bold', mb: 1 }}>
          {numerator}/{denominator} = {fractionValue.toFixed(3)}
        </Box>
        {fractionValue !== 0 && fractionValue <= max && (
          <Box sx={{ fontSize: '14px', color: theme.palette.text.secondary }}>
            数直線上の位置：{(fractionValue * 100 / max).toFixed(1)}%
          </Box>
        )}
      </Box>
    </Box>
  );
};