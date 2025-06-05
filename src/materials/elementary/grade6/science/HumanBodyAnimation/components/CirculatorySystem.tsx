import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Organ } from '../HumanBodyAnimation';

interface CirculatorySystemProps {
  isPlaying: boolean;
  speed: number;
  heartRate: number;
  onOrganClick: (organId: string) => void;
  selectedOrgan: Organ | null;
}

interface BloodCell {
  id: number;
  x: number;
  y: number;
  path: 'arterial' | 'venous';
  progress: number;
}

export const CirculatorySystem: React.FC<CirculatorySystemProps> = ({
  isPlaying,
  speed,
  heartRate,
  onOrganClick,
  selectedOrgan
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bloodCells, setBloodCells] = useState<BloodCell[]>([]);
  const animationRef = useRef<number>();
  const beatPhaseRef = useRef(0);

  // 心臓の拍動周期（ミリ秒）
  const heartBeatDuration = 60000 / heartRate;

  useEffect(() => {
    // 血液細胞の初期化
    const cells: BloodCell[] = [];
    for (let i = 0; i < 20; i++) {
      cells.push({
        id: i,
        x: 0,
        y: 0,
        path: i % 2 === 0 ? 'arterial' : 'venous',
        progress: (i / 20) * 100
      });
    }
    setBloodCells(cells);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (isPlaying) {
        beatPhaseRef.current += (deltaTime / heartBeatDuration) * speed;
        if (beatPhaseRef.current > 1) beatPhaseRef.current -= 1;

        // 血液細胞の更新
        setBloodCells(prev => prev.map(cell => ({
          ...cell,
          progress: (cell.progress + speed * 0.5) % 100
        })));
      }

      draw(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, speed, heartBeatDuration]);

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // 背景
    ctx.fillStyle = '#fff5f5';
    ctx.fillRect(0, 0, width, height);

    // 体の輪郭
    drawBodyOutline(ctx, width, height);

    // 血管系
    drawBloodVessels(ctx, width, height);

    // 心臓
    drawHeart(ctx, width, height, beatPhaseRef.current);

    // 肺
    drawLungs(ctx, width, height);

    // 血液細胞
    bloodCells.forEach(cell => {
      drawBloodCell(ctx, cell, width, height);
    });

    // 臓器のハイライト
    if (selectedOrgan && selectedOrgan.system === 'circulatory') {
      highlightOrgan(ctx, selectedOrgan, width, height);
    }
  };

  const drawBodyOutline = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // 頭部
    ctx.arc(width / 2, height * 0.15, 40, 0, Math.PI * 2);
    
    // 体
    ctx.moveTo(width / 2 - 50, height * 0.25);
    ctx.lineTo(width / 2 - 60, height * 0.8);
    ctx.lineTo(width / 2 + 60, height * 0.8);
    ctx.lineTo(width / 2 + 50, height * 0.25);
    ctx.closePath();
    
    ctx.stroke();
  };

  const drawHeart = (ctx: CanvasRenderingContext2D, width: number, height: number, phase: number) => {
    const x = width / 2;
    const y = height * 0.35;
    const baseSize = 40;
    const scale = 1 + Math.sin(phase * Math.PI * 2) * 0.1;
    const size = baseSize * scale;

    // 心臓の形を描画
    ctx.fillStyle = '#e91e63';
    ctx.beginPath();
    
    // 左側の曲線
    ctx.moveTo(x, y + size * 0.3);
    ctx.bezierCurveTo(
      x - size * 0.5, y - size * 0.3,
      x - size, y + size * 0.1,
      x, y + size
    );
    
    // 右側の曲線
    ctx.bezierCurveTo(
      x + size, y + size * 0.1,
      x + size * 0.5, y - size * 0.3,
      x, y + size * 0.3
    );
    
    ctx.fill();

    // 心房と心室のライン
    ctx.strokeStyle = '#c2185b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.5, y);
    ctx.lineTo(x + size * 0.5, y);
    ctx.stroke();
  };

  const drawLungs = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 左肺
    ctx.fillStyle = 'rgba(33, 150, 243, 0.3)';
    ctx.beginPath();
    ctx.ellipse(width / 2 - 50, height * 0.35, 30, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // 右肺
    ctx.beginPath();
    ctx.ellipse(width / 2 + 50, height * 0.35, 30, 50, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBloodVessels = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 動脈（赤）
    ctx.strokeStyle = '#ff5252';
    ctx.lineWidth = 8;
    ctx.beginPath();
    
    // 大動脈
    ctx.moveTo(width / 2, height * 0.4);
    ctx.quadraticCurveTo(width / 2 - 30, height * 0.5, width / 2 - 40, height * 0.7);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.4);
    ctx.quadraticCurveTo(width / 2 + 30, height * 0.5, width / 2 + 40, height * 0.7);
    ctx.stroke();

    // 静脈（青）
    ctx.strokeStyle = '#3f51b5';
    ctx.lineWidth = 8;
    ctx.beginPath();
    
    // 大静脈
    ctx.moveTo(width / 2 - 40, height * 0.7);
    ctx.quadraticCurveTo(width / 2 - 30, height * 0.5, width / 2 - 10, height * 0.3);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width / 2 + 40, height * 0.7);
    ctx.quadraticCurveTo(width / 2 + 30, height * 0.5, width / 2 + 10, height * 0.3);
    ctx.stroke();

    // 肺動脈・肺静脈
    ctx.strokeStyle = '#7986cb';
    ctx.lineWidth = 6;
    
    // 左肺へ
    ctx.beginPath();
    ctx.moveTo(width / 2 - 10, height * 0.35);
    ctx.lineTo(width / 2 - 30, height * 0.35);
    ctx.stroke();
    
    // 右肺へ
    ctx.beginPath();
    ctx.moveTo(width / 2 + 10, height * 0.35);
    ctx.lineTo(width / 2 + 30, height * 0.35);
    ctx.stroke();
  };

  const drawBloodCell = (ctx: CanvasRenderingContext2D, cell: BloodCell, width: number, height: number) => {
    // 経路に沿った位置を計算
    const path = getBloodPath(cell.path, cell.progress, width, height);
    
    ctx.fillStyle = cell.path === 'arterial' ? '#ff6b6b' : '#5c6bc0';
    ctx.beginPath();
    ctx.arc(path.x, path.y, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  const getBloodPath = (
    pathType: 'arterial' | 'venous', 
    progress: number, 
    width: number, 
    height: number
  ): { x: number; y: number } => {
    const t = progress / 100;
    
    if (pathType === 'arterial') {
      // 心臓から体へ
      if (t < 0.5) {
        const localT = t * 2;
        return {
          x: width / 2 + (width / 2 - 40) * localT,
          y: height * 0.4 + height * 0.3 * localT
        };
      } else {
        // 体から心臓へ戻る（静脈経由）
        const localT = (t - 0.5) * 2;
        return {
          x: width / 2 + 40 - 50 * localT,
          y: height * 0.7 - height * 0.4 * localT
        };
      }
    } else {
      // 心臓から肺へ
      if (t < 0.3) {
        const localT = t / 0.3;
        return {
          x: width / 2 - 10 - 20 * localT,
          y: height * 0.35
        };
      } else if (t < 0.6) {
        // 肺で酸素化
        return {
          x: width / 2 - 30,
          y: height * 0.35
        };
      } else {
        // 肺から心臓へ戻る
        const localT = (t - 0.6) / 0.4;
        return {
          x: width / 2 - 30 + 20 * localT,
          y: height * 0.35
        };
      }
    }
  };

  const highlightOrgan = (ctx: CanvasRenderingContext2D, organ: Organ, width: number, height: number) => {
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    
    if (organ.id === 'heart') {
      ctx.beginPath();
      ctx.arc(width / 2, height * 0.35, 50, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 心臓の領域をチェック
    const heartX = canvas.width / 2;
    const heartY = canvas.height * 0.35;
    const distance = Math.sqrt((x - heartX) ** 2 + (y - heartY) ** 2);
    
    if (distance < 50) {
      onOrganClick('heart');
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
      />
      
      {/* 心拍インジケーター */}
      <motion.div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 20,
          height: 20,
          backgroundColor: '#e91e63',
          borderRadius: '50%'
        }}
        animate={{
          scale: isPlaying ? [1, 1.3, 1] : 1,
          opacity: isPlaying ? [1, 0.7, 1] : 1
        }}
        transition={{
          duration: heartBeatDuration / 1000 / speed,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </Box>
  );
};