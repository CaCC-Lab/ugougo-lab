import React, { useRef, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { waveData } from '../data/earthquakeData';
import type { Epicenter, ObservationPoint } from '../data/earthquakeData';

interface WaveAnimationProps {
  epicenter: Epicenter;
  observationPoints: ObservationPoint[];
  waveRadius: {
    P: number;
    S: number;
  };
  selectedPointId: string | null;
  onEpicenterDrag: (x: number, y: number) => void;
  onAddObservationPoint: (x: number, y: number) => void;
  onSelectPoint: (pointId: string) => void;
}

export const WaveAnimation: React.FC<WaveAnimationProps> = ({
  epicenter,
  observationPoints,
  waveRadius,
  selectedPointId,
  onEpicenterDrag,
  onAddObservationPoint,
  onSelectPoint
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // キャンバスに波を描画
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // キャンバスサイズ設定
    canvas.width = 600;
    canvas.height = 400;

    // 背景をクリア
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // グリッドを描画
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 地形を描画（簡易的な表現）
    const gradient = ctx.createLinearGradient(0, canvas.height - 100, 0, canvas.height);
    gradient.addColorStop(0, '#8D6E63');
    gradient.addColorStop(1, '#5D4037');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // P波を描画
    if (waveRadius.P > 0) {
      ctx.strokeStyle = waveData.P.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(epicenter.x, epicenter.y, waveRadius.P, 0, Math.PI * 2);
      ctx.stroke();
      
      // 波面のグラデーション
      const pGradient = ctx.createRadialGradient(
        epicenter.x, epicenter.y, waveRadius.P - 10,
        epicenter.x, epicenter.y, waveRadius.P + 10
      );
      pGradient.addColorStop(0, 'rgba(33, 150, 243, 0)');
      pGradient.addColorStop(0.5, 'rgba(33, 150, 243, 0.3)');
      pGradient.addColorStop(1, 'rgba(33, 150, 243, 0)');
      ctx.fillStyle = pGradient;
      ctx.fill();
    }

    // S波を描画
    if (waveRadius.S > 0) {
      ctx.strokeStyle = waveData.S.color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(epicenter.x, epicenter.y, waveRadius.S, 0, Math.PI * 2);
      ctx.stroke();
      
      // 波面のグラデーション
      const sGradient = ctx.createRadialGradient(
        epicenter.x, epicenter.y, waveRadius.S - 15,
        epicenter.x, epicenter.y, waveRadius.S + 15
      );
      sGradient.addColorStop(0, 'rgba(244, 67, 54, 0)');
      sGradient.addColorStop(0.5, 'rgba(244, 67, 54, 0.4)');
      sGradient.addColorStop(1, 'rgba(244, 67, 54, 0)');
      ctx.fillStyle = sGradient;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }, [epicenter, waveRadius]);

  // キャンバスクリック時の処理
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Shiftキーが押されていたら観測点を追加
    if (e.shiftKey) {
      onAddObservationPoint(x, y);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, position: 'relative' }}>
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: 600,
          height: 400,
          cursor: 'crosshair'
        }}
        onClick={handleCanvasClick}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />

        {/* 震源 */}
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          onDrag={(e, info) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            onEpicenterDrag(info.point.x - rect.left, info.point.y - rect.top);
          }}
          style={{
            position: 'absolute',
            left: epicenter.x - 15,
            top: epicenter.y - 15,
            width: 30,
            height: 30,
            cursor: 'grab'
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              bgcolor: '#FF5722',
              border: 3,
              borderColor: '#D84315',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            震
          </Box>
        </motion.div>

        {/* 観測点 */}
        {observationPoints.map(point => (
          <motion.div
            key={point.id}
            style={{
              position: 'absolute',
              left: point.x - 12,
              top: point.y - 12,
              width: 24,
              height: 24,
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelectPoint(point.id)}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                bgcolor: selectedPointId === point.id ? '#4CAF50' : '#2196F3',
                border: 2,
                borderColor: selectedPointId === point.id ? '#388E3C' : '#1976D2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              {point.name.slice(-1)}
            </Box>
            
            {/* 観測点名のラベル */}
            <Box
              sx={{
                position: 'absolute',
                top: 25,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: 12,
                whiteSpace: 'nowrap',
                boxShadow: 1
              }}
            >
              {point.name}
            </Box>
          </motion.div>
        ))}

        {/* 波の説明 */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            p: 1,
            borderRadius: 1,
            fontSize: 12
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              sx={{
                width: 20,
                height: 3,
                bgcolor: waveData.P.color,
                mr: 1
              }}
            />
            P波（速い）
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 20,
                height: 3,
                bgcolor: waveData.S.color,
                mr: 1
              }}
            />
            S波（遅い）
          </Box>
        </Box>

        {/* 操作説明 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            p: 1,
            borderRadius: 1,
            fontSize: 11,
            color: 'text.secondary'
          }}
        >
          震源をドラッグで移動 | Shift+クリックで観測点追加
        </Box>
      </Box>
    </Paper>
  );
};