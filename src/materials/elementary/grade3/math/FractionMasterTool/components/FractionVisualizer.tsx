import React from 'react';
import { Box } from '@mui/material';
import { Stage, Layer, Arc, Rect, Line, Text } from 'react-konva';
import { motion } from 'framer-motion';
import type { Fraction, VisualType } from '../hooks/useFractionLogic';

interface FractionVisualizerProps {
  fraction: Fraction;
  visualType: VisualType;
  size?: number;
  animated?: boolean;
  showLabel?: boolean;
}

export const FractionVisualizer: React.FC<FractionVisualizerProps> = ({
  fraction,
  visualType,
  size = 200,
  animated = true,
  showLabel = true
}) => {
  const { numerator, denominator } = fraction;

  // ピザの描画
  const renderPizza = () => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    const anglePerSlice = 360 / denominator;

    const slices = [];
    for (let i = 0; i < denominator; i++) {
      const startAngle = i * anglePerSlice - 90; // -90度から開始（12時の位置）
      const endAngle = (i + 1) * anglePerSlice - 90;
      const isActive = i < numerator;

      slices.push(
        <Arc
          key={i}
          x={centerX}
          y={centerY}
          innerRadius={0}
          outerRadius={radius}
          angle={anglePerSlice}
          rotation={startAngle}
          fill={isActive ? '#ff6b6b' : '#f0f0f0'}
          stroke="#333"
          strokeWidth={2}
        />
      );

      // カット線
      const angle = (startAngle * Math.PI) / 180;
      slices.push(
        <Line
          key={`line-${i}`}
          points={[
            centerX,
            centerY,
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
          ]}
          stroke="#333"
          strokeWidth={1}
        />
      );
    }

    return slices;
  };

  // ケーキの描画
  const renderCake = () => {
    const centerX = size / 2;
    const centerY = size * 0.6;
    const radius = size * 0.35;
    const height = size * 0.3;
    const anglePerSlice = 360 / denominator;

    const slices = [];
    for (let i = 0; i < denominator; i++) {
      const startAngle = i * anglePerSlice - 90;
      const isActive = i < numerator;

      // ケーキの上面
      slices.push(
        <Arc
          key={`top-${i}`}
          x={centerX}
          y={centerY - height / 2}
          innerRadius={0}
          outerRadius={radius}
          angle={anglePerSlice}
          rotation={startAngle}
          fill={isActive ? '#ffa94d' : '#f5f5f5'}
          stroke="#333"
          strokeWidth={2}
        />
      );

      // ケーキの側面（簡略化）
      if (i === 0 || i === numerator) {
        const angle1 = (startAngle * Math.PI) / 180;
        const angle2 = ((startAngle + anglePerSlice) * Math.PI) / 180;
        
        slices.push(
          <Rect
            key={`side-${i}`}
            x={centerX + radius * Math.cos(angle1) * 0.9}
            y={centerY - height / 2}
            width={3}
            height={height}
            fill={isActive ? '#fd7e14' : '#e0e0e0'}
            rotation={startAngle + 90}
          />
        );
      }
    }

    return slices;
  };

  // チョコレートバーの描画
  const renderChocolate = () => {
    const barWidth = size * 0.8;
    const barHeight = size * 0.3;
    const startX = (size - barWidth) / 2;
    const startY = (size - barHeight) / 2;
    const segmentWidth = barWidth / denominator;

    const segments = [];
    for (let i = 0; i < denominator; i++) {
      const isActive = i < numerator;
      const x = startX + i * segmentWidth;

      segments.push(
        <Rect
          key={i}
          x={x}
          y={startY}
          width={segmentWidth - 2}
          height={barHeight}
          fill={isActive ? '#7950f2' : '#f8f9fa'}
          stroke="#333"
          strokeWidth={2}
          cornerRadius={2}
        />
      );

      // チョコレートの区切り線
      if (i > 0) {
        segments.push(
          <Line
            key={`line-${i}`}
            points={[x, startY, x, startY + barHeight]}
            stroke="#333"
            strokeWidth={1}
            dash={[5, 5]}
          />
        );
      }
    }

    return segments;
  };

  // 円の描画
  const renderCircle = () => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    const anglePerSegment = 360 / denominator;

    const segments = [];
    for (let i = 0; i < denominator; i++) {
      const startAngle = i * anglePerSegment;
      const isActive = i < numerator;

      segments.push(
        <Arc
          key={i}
          x={centerX}
          y={centerY}
          innerRadius={0}
          outerRadius={radius}
          angle={anglePerSegment}
          rotation={startAngle}
          fill={isActive ? '#4ecdc4' : '#e9ecef'}
          stroke="#333"
          strokeWidth={2}
        />
      );
    }

    return segments;
  };

  // 長方形の描画
  const renderRectangle = () => {
    const rectWidth = size * 0.8;
    const rectHeight = size * 0.5;
    const startX = (size - rectWidth) / 2;
    const startY = (size - rectHeight) / 2;

    const segments = [];
    
    // 横分割の場合
    if (denominator <= 6) {
      const segmentHeight = rectHeight / denominator;
      for (let i = 0; i < denominator; i++) {
        const isActive = i < numerator;
        const y = startY + i * segmentHeight;

        segments.push(
          <Rect
            key={i}
            x={startX}
            y={y}
            width={rectWidth}
            height={segmentHeight - 2}
            fill={isActive ? '#12b886' : '#f1f3f5'}
            stroke="#333"
            strokeWidth={2}
          />
        );
      }
    } else {
      // 格子状分割の場合
      const cols = Math.ceil(Math.sqrt(denominator));
      const rows = Math.ceil(denominator / cols);
      const cellWidth = rectWidth / cols;
      const cellHeight = rectHeight / rows;
      
      let count = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols && count < denominator; col++) {
          const isActive = count < numerator;
          const x = startX + col * cellWidth;
          const y = startY + row * cellHeight;

          segments.push(
            <Rect
              key={count}
              x={x}
              y={y}
              width={cellWidth - 2}
              height={cellHeight - 2}
              fill={isActive ? '#12b886' : '#f1f3f5'}
              stroke="#333"
              strokeWidth={1}
            />
          );
          count++;
        }
      }
    }

    return segments;
  };

  // 視覚表現を選択
  const renderVisual = () => {
    switch (visualType) {
      case 'pizza':
        return renderPizza();
      case 'cake':
        return renderCake();
      case 'chocolate':
        return renderChocolate();
      case 'circle':
        return renderCircle();
      case 'rectangle':
        return renderRectangle();
      default:
        return renderCircle();
    }
  };

  const AnimatedBox = animated ? motion.div : 'div';

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <AnimatedBox
        initial={animated ? { scale: 0.8, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, opacity: 1 } : undefined}
        transition={animated ? { duration: 0.5 } : undefined}
      >
        <Stage width={size} height={size}>
          <Layer>{renderVisual()}</Layer>
          {showLabel && (
            <Layer>
              <Text
                x={size / 2}
                y={size - 30}
                text={`${numerator}/${denominator}`}
                fontSize={24}
                fontStyle="bold"
                fill="#333"
                align="center"
                width={size}
              />
            </Layer>
          )}
        </Stage>
      </AnimatedBox>
    </Box>
  );
};