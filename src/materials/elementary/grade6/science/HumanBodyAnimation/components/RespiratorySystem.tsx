import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Organ } from '../HumanBodyAnimation';

interface RespiratorySystemProps {
  isPlaying: boolean;
  speed: number;
  breathingRate: number;
  onOrganClick: (organId: string) => void;
  selectedOrgan: Organ | null;
}

interface OxygenMolecule {
  id: number;
  x: number;
  y: number;
  type: 'oxygen' | 'carbonDioxide';
  progress: number;
  path: 'inhale' | 'exhale';
}

export const RespiratorySystem: React.FC<RespiratorySystemProps> = ({
  isPlaying,
  speed,
  breathingRate,
  onOrganClick,
  selectedOrgan
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [molecules, setMolecules] = useState<OxygenMolecule[]>([]);
  const animationRef = useRef<number>();
  const breathPhaseRef = useRef(0);

  // 呼吸周期（ミリ秒）
  const breathingDuration = 60000 / breathingRate;

  useEffect(() => {
    // 酸素・二酸化炭素分子の初期化
    const mols: OxygenMolecule[] = [];
    for (let i = 0; i < 15; i++) {
      mols.push({
        id: i,
        x: 0,
        y: 0,
        type: i % 3 === 0 ? 'carbonDioxide' : 'oxygen',
        progress: (i / 15) * 100,
        path: i % 2 === 0 ? 'inhale' : 'exhale'
      });
    }
    setMolecules(mols);
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
        breathPhaseRef.current += (deltaTime / breathingDuration) * speed;
        if (breathPhaseRef.current > 1) breathPhaseRef.current -= 1;

        // 分子の更新
        setMolecules(prev => prev.map(mol => ({
          ...mol,
          progress: (mol.progress + speed * 0.8) % 100
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
  }, [isPlaying, speed, breathingDuration]);

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // 背景
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, width, height);

    // 体の輪郭
    drawBodyOutline(ctx, width, height);

    // 気管・気管支
    drawAirways(ctx, width, height);

    // 肺
    drawLungs(ctx, width, height, breathPhaseRef.current);

    // 横隔膜
    drawDiaphragm(ctx, width, height, breathPhaseRef.current);

    // 鼻・口
    drawNoseMouth(ctx, width, height);

    // 酸素・二酸化炭素分子
    molecules.forEach(mol => {
      drawMolecule(ctx, mol, width, height, breathPhaseRef.current);
    });

    // 臓器のハイライト
    if (selectedOrgan && selectedOrgan.system === 'respiratory') {
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

  const drawNoseMouth = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 鼻
    ctx.fillStyle = '#ffab91';
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.13);
    ctx.lineTo(width / 2 - 8, height * 0.15);
    ctx.lineTo(width / 2 + 8, height * 0.15);
    ctx.closePath();
    ctx.fill();

    // 口
    ctx.strokeStyle = '#e57373';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.17, 12, 0, Math.PI);
    ctx.stroke();
  };

  const drawAirways = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#64b5f6';
    ctx.lineWidth = 12;
    
    // 気管
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.2);
    ctx.lineTo(width / 2, height * 0.35);
    ctx.stroke();

    // 気管支（左）
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.35);
    ctx.quadraticCurveTo(width / 2 - 20, height * 0.37, width / 2 - 50, height * 0.4);
    ctx.stroke();

    // 気管支（右）
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.35);
    ctx.quadraticCurveTo(width / 2 + 20, height * 0.37, width / 2 + 50, height * 0.4);
    ctx.stroke();
  };

  const drawLungs = (ctx: CanvasRenderingContext2D, width: number, height: number, phase: number) => {
    // 呼吸による膨張・収縮
    const expansion = Math.sin(phase * Math.PI * 2) * 0.15 + 1;
    
    // 左肺
    ctx.fillStyle = 'rgba(33, 150, 243, 0.4)';
    ctx.beginPath();
    ctx.ellipse(
      width / 2 - 50, 
      height * 0.45, 
      35 * expansion, 
      60 * expansion, 
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // 左肺の肺胞パターン
    ctx.fillStyle = 'rgba(33, 150, 243, 0.2)';
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.arc(
          width / 2 - 60 + i * 15,
          height * 0.4 + j * 20,
          5 * expansion,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }

    // 右肺
    ctx.fillStyle = 'rgba(33, 150, 243, 0.4)';
    ctx.beginPath();
    ctx.ellipse(
      width / 2 + 50, 
      height * 0.45, 
      35 * expansion, 
      60 * expansion, 
      0, 0, Math.PI * 2
    );
    ctx.fill();

    // 右肺の肺胞パターン
    ctx.fillStyle = 'rgba(33, 150, 243, 0.2)';
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.arc(
          width / 2 + 30 + i * 15,
          height * 0.4 + j * 20,
          5 * expansion,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }
  };

  const drawDiaphragm = (ctx: CanvasRenderingContext2D, width: number, height: number, phase: number) => {
    // 横隔膜の上下動
    const movement = Math.sin(phase * Math.PI * 2) * 20;
    const baseY = height * 0.6;

    ctx.strokeStyle = '#ff7043';
    ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(255, 112, 67, 0.3)';

    ctx.beginPath();
    ctx.moveTo(width / 2 - 80, baseY + movement);
    ctx.quadraticCurveTo(
      width / 2, baseY - 20 + movement,
      width / 2 + 80, baseY + movement
    );
    ctx.lineTo(width / 2 + 80, baseY + 10 + movement);
    ctx.quadraticCurveTo(
      width / 2, baseY - 10 + movement,
      width / 2 - 80, baseY + 10 + movement
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const drawMolecule = (
    ctx: CanvasRenderingContext2D, 
    mol: OxygenMolecule, 
    width: number, 
    height: number,
    breathPhase: number
  ) => {
    const path = getMoleculePath(mol, width, height, breathPhase);
    
    // 分子を描画
    if (mol.type === 'oxygen') {
      ctx.fillStyle = '#4caf50';
      ctx.font = '12px sans-serif';
      ctx.fillText('O₂', path.x - 8, path.y + 4);
    } else {
      ctx.fillStyle = '#9e9e9e';
      ctx.font = '12px sans-serif';
      ctx.fillText('CO₂', path.x - 12, path.y + 4);
    }
  };

  const getMoleculePath = (
    mol: OxygenMolecule,
    width: number,
    height: number,
    breathPhase: number
  ): { x: number; y: number } => {
    const t = mol.progress / 100;
    const isInhaling = breathPhase < 0.5;

    if (mol.path === 'inhale' && mol.type === 'oxygen') {
      if (isInhaling && t < 0.5) {
        // 鼻から気管へ
        const localT = t * 2;
        return {
          x: width / 2,
          y: height * 0.15 + (height * 0.3) * localT
        };
      } else if (t < 0.8) {
        // 肺胞へ
        const localT = (t - 0.5) / 0.3;
        const side = mol.id % 2 === 0 ? -1 : 1;
        return {
          x: width / 2 + side * 50 * localT,
          y: height * 0.45
        };
      } else {
        // 肺胞で待機
        const side = mol.id % 2 === 0 ? -1 : 1;
        return {
          x: width / 2 + side * 50,
          y: height * 0.45
        };
      }
    } else if (mol.path === 'exhale' && mol.type === 'carbonDioxide') {
      if (!isInhaling && t < 0.5) {
        // 肺胞から気管へ
        const localT = t * 2;
        const side = mol.id % 2 === 0 ? -1 : 1;
        return {
          x: width / 2 + side * 50 * (1 - localT),
          y: height * 0.45 - (height * 0.1) * localT
        };
      } else if (t < 0.8) {
        // 気管から鼻へ
        const localT = (t - 0.5) / 0.3;
        return {
          x: width / 2,
          y: height * 0.35 - (height * 0.2) * localT
        };
      } else {
        // 外へ
        return {
          x: width / 2,
          y: height * 0.1
        };
      }
    }

    return { x: width / 2, y: height * 0.3 };
  };

  const highlightOrgan = (ctx: CanvasRenderingContext2D, organ: Organ, width: number, height: number) => {
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    
    if (organ.id === 'lungs') {
      // 左肺
      ctx.beginPath();
      ctx.ellipse(width / 2 - 50, height * 0.45, 45, 70, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // 右肺
      ctx.beginPath();
      ctx.ellipse(width / 2 + 50, height * 0.45, 45, 70, 0, 0, Math.PI * 2);
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
    
    // 肺の領域をチェック
    const leftLungDist = Math.sqrt((x - canvas.width / 2 + 50) ** 2 + (y - canvas.height * 0.45) ** 2);
    const rightLungDist = Math.sqrt((x - canvas.width / 2 - 50) ** 2 + (y - canvas.height * 0.45) ** 2);
    
    if (leftLungDist < 50 || rightLungDist < 50) {
      onOrganClick('lungs');
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
      
      {/* 呼吸インジケーター */}
      <motion.div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 12px',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderRadius: 16
        }}
      >
        <motion.div
          animate={{
            opacity: isPlaying ? [0.3, 1, 0.3] : 0.5
          }}
          transition={{
            duration: breathingDuration / 1000 / speed,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            fontSize: 14,
            color: '#2196f3'
          }}
        >
          {breathPhaseRef.current < 0.5 ? '吸う' : '吐く'}
        </motion.div>
      </motion.div>
    </Box>
  );
};