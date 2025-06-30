/**
 * 分数円グラフ視覚化コンポーネント
 */

import React, { useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';

interface FractionCircleVisualizationProps {
  numerator: number;
  denominator: number;
  size?: number;
  animationDelay?: number;
  showLabels?: boolean;
  interactive?: boolean;
  onSectorClick?: (sectorIndex: number) => void;
}

export const FractionCircleVisualization: React.FC<FractionCircleVisualizationProps> = ({
  numerator,
  denominator,
  size = 300,
  animationDelay = 0,
  showLabels = true,
  interactive = false,
  onSectorClick
}) => {
  const theme = useTheme();
  const [animatedNumerator, setAnimatedNumerator] = useState(0);
  const [hoveredSector, setHoveredSector] = useState<number | null>(null);

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
      }, 200);
      return () => clearInterval(interval);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [numerator, animationDelay]);

  // 円の中心とサイズ
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - 40) / 2;

  // 各セクターの角度計算
  const sectorAngle = (2 * Math.PI) / denominator;

  // セクター作成
  const createSector = (index: number) => {
    const startAngle = index * sectorAngle - Math.PI / 2; // -90度から開始
    const endAngle = (index + 1) * sectorAngle - Math.PI / 2;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = sectorAngle > Math.PI ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    const isSelected = index < animatedNumerator;
    const isHovered = hoveredSector === index;
    
    return (
      <path
        key={index}
        d={pathData}
        fill={isSelected ? theme.palette.primary.main : theme.palette.grey[200]}
        stroke={theme.palette.common.white}
        strokeWidth="2"
        style={{
          cursor: interactive ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          opacity: isHovered ? 0.8 : 1,
          transform: isHovered ? `scale(1.02)` : 'scale(1)',
          transformOrigin: `${centerX}px ${centerY}px`
        }}
        onMouseEnter={() => interactive && setHoveredSector(index)}
        onMouseLeave={() => interactive && setHoveredSector(null)}
        onClick={() => interactive && onSectorClick?.(index)}
      />
    );
  };

  // ラベル位置計算
  const getLabelPosition = (index: number) => {
    const angle = (index + 0.5) * sectorAngle - Math.PI / 2;
    const labelRadius = radius * 0.7;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    return { x, y };
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* 背景円 */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={theme.palette.grey[300]}
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        
        {/* セクター */}
        {Array.from({ length: denominator }, (_, index) => createSector(index))}
        
        {/* セクターのラベル */}
        {showLabels && denominator <= 12 && Array.from({ length: denominator }, (_, index) => {
          const { x, y } = getLabelPosition(index);
          return (
            <text
              key={`label-${index}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill={theme.palette.text.primary}
              fontWeight="bold"
            >
              {index + 1}
            </text>
          );
        })}
        
        {/* 中央の分数表示 */}
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="24"
          fontWeight="bold"
          fill={theme.palette.primary.main}
        >
          {animatedNumerator}
        </text>
        <line
          x1={centerX - 20}
          y1={centerY + 5}
          x2={centerX + 20}
          y2={centerY + 5}
          stroke={theme.palette.text.primary}
          strokeWidth="2"
        />
        <text
          x={centerX}
          y={centerY + 20}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="24"
          fontWeight="bold"
          fill={theme.palette.text.primary}
        >
          {denominator}
        </text>
      </svg>
      
      {/* 説明テキスト */}
      <Box sx={{ textAlign: 'center', maxWidth: size }}>
        {animatedNumerator === 0 && (
          <span style={{ color: theme.palette.text.secondary }}>
            0個の部分が選ばれています
          </span>
        )}
        {animatedNumerator === 1 && denominator > 1 && (
          <span style={{ color: theme.palette.primary.main }}>
            {denominator}個に分けた1個の部分
          </span>
        )}
        {animatedNumerator > 1 && animatedNumerator < denominator && (
          <span style={{ color: theme.palette.primary.main }}>
            {denominator}個に分けた{animatedNumerator}個の部分
          </span>
        )}
        {animatedNumerator === denominator && denominator > 1 && (
          <span style={{ color: theme.palette.success.main }}>
            全体（{denominator}個すべて）
          </span>
        )}
        {animatedNumerator > denominator && (
          <span style={{ color: theme.palette.warning.main }}>
            全体を超えています（{animatedNumerator}/{denominator}）
          </span>
        )}
      </Box>
    </Box>
  );
};