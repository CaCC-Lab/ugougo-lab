import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Organ } from '../HumanBodyAnimation';

interface DigestiveSystemProps {
  isPlaying: boolean;
  speed: number;
  onOrganClick: (organId: string) => void;
  selectedOrgan: Organ | null;
}

interface FoodParticle {
  id: number;
  x: number;
  y: number;
  stage: 'mouth' | 'esophagus' | 'stomach' | 'smallIntestine' | 'largeIntestine';
  progress: number;
}

export const DigestiveSystem: React.FC<DigestiveSystemProps> = ({
  isPlaying,
  speed,
  onOrganClick,
  selectedOrgan
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [foodParticles, setFoodParticles] = useState<FoodParticle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    // 食べ物粒子の初期化
    const particles: FoodParticle[] = [];
    for (let i = 0; i < 10; i++) {
      particles.push({
        id: i,
        x: 0,
        y: 0,
        stage: 'mouth',
        progress: (i / 10) * 100
      });
    }
    setFoodParticles(particles);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (isPlaying) {
        // 食べ物粒子の更新
        setFoodParticles(prev => prev.map(particle => {
          let newProgress = particle.progress + speed * 0.3;
          let newStage = particle.stage;

          // ステージの遷移
          if (newProgress > 100) {
            switch (particle.stage) {
              case 'mouth':
                newStage = 'esophagus';
                break;
              case 'esophagus':
                newStage = 'stomach';
                break;
              case 'stomach':
                newStage = 'smallIntestine';
                break;
              case 'smallIntestine':
                newStage = 'largeIntestine';
                break;
              case 'largeIntestine':
                newStage = 'mouth';
                break;
            }
            newProgress = 0;
          }

          return {
            ...particle,
            progress: newProgress,
            stage: newStage
          };
        }));
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
  }, [isPlaying, speed]);

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // 背景
    ctx.fillStyle = '#fff8e1';
    ctx.fillRect(0, 0, width, height);

    // 体の輪郭
    drawBodyOutline(ctx, width, height);

    // 消化器官
    drawMouth(ctx, width, height);
    drawEsophagus(ctx, width, height);
    drawStomach(ctx, width, height);
    drawSmallIntestine(ctx, width, height);
    drawLargeIntestine(ctx, width, height);
    drawLiver(ctx, width, height);

    // 食べ物粒子
    foodParticles.forEach(particle => {
      drawFoodParticle(ctx, particle, width, height);
    });

    // 臓器のハイライト
    if (selectedOrgan && selectedOrgan.system === 'digestive') {
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

  const drawMouth = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#ef5350';
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.17, 15, 0, Math.PI);
    ctx.closePath();
    ctx.fill();

    // 歯
    ctx.fillStyle = 'white';
    for (let i = -2; i <= 2; i++) {
      ctx.fillRect(width / 2 + i * 5 - 2, height * 0.17 - 5, 4, 5);
    }
  };

  const drawEsophagus = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#ff8a65';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.2);
    ctx.lineTo(width / 2, height * 0.35);
    ctx.stroke();
  };

  const drawStomach = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#ff7043';
    ctx.beginPath();
    ctx.moveTo(width / 2 - 10, height * 0.35);
    ctx.quadraticCurveTo(width / 2 - 40, height * 0.38, width / 2 - 35, height * 0.42);
    ctx.quadraticCurveTo(width / 2 - 30, height * 0.48, width / 2 - 10, height * 0.48);
    ctx.quadraticCurveTo(width / 2 + 10, height * 0.45, width / 2 + 5, height * 0.38);
    ctx.quadraticCurveTo(width / 2, height * 0.35, width / 2 - 10, height * 0.35);
    ctx.fill();

    // 胃液の表現
    ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
    ctx.beginPath();
    ctx.arc(width / 2 - 15, height * 0.42, 15, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawSmallIntestine = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';

    // 小腸の曲がりくねった形状
    const points = [
      { x: width / 2 - 10, y: height * 0.48 },
      { x: width / 2 - 30, y: height * 0.52 },
      { x: width / 2 + 20, y: height * 0.54 },
      { x: width / 2 - 25, y: height * 0.58 },
      { x: width / 2 + 25, y: height * 0.6 },
      { x: width / 2 - 20, y: height * 0.64 },
      { x: width / 2 + 15, y: height * 0.66 },
      { x: width / 2, y: height * 0.68 }
    ];

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // 絨毛の表現
    ctx.strokeStyle = '#ffb74d';
    ctx.lineWidth = 2;
    for (let i = 0; i < points.length - 1; i++) {
      const x = points[i].x;
      const y = points[i].y;
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.moveTo(x + j * 3, y);
        ctx.lineTo(x + j * 3, y - 5);
        ctx.stroke();
      }
    }
  };

  const drawLargeIntestine = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 18;
    
    // 大腸の形状（コの字型）
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.68);
    ctx.lineTo(width / 2 + 40, height * 0.68);
    ctx.lineTo(width / 2 + 40, height * 0.55);
    ctx.lineTo(width / 2 - 40, height * 0.55);
    ctx.lineTo(width / 2 - 40, height * 0.72);
    ctx.lineTo(width / 2, height * 0.72);
    ctx.stroke();
  };

  const drawLiver = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.moveTo(width / 2 + 20, height * 0.38);
    ctx.quadraticCurveTo(width / 2 + 45, height * 0.35, width / 2 + 50, height * 0.42);
    ctx.quadraticCurveTo(width / 2 + 45, height * 0.48, width / 2 + 25, height * 0.46);
    ctx.quadraticCurveTo(width / 2 + 15, height * 0.42, width / 2 + 20, height * 0.38);
    ctx.fill();

    // 胆のう
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.ellipse(width / 2 + 35, height * 0.45, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawFoodParticle = (ctx: CanvasRenderingContext2D, particle: FoodParticle, width: number, height: number) => {
    const position = getFoodPosition(particle, width, height);
    
    // 消化の進行度に応じて色と大きさを変える
    let color = '#8bc34a';
    let size = 8;
    
    switch (particle.stage) {
      case 'mouth':
        color = '#8bc34a';
        size = 8;
        break;
      case 'esophagus':
        color = '#7cb342';
        size = 7;
        break;
      case 'stomach':
        color = '#ffeb3b';
        size = 6;
        break;
      case 'smallIntestine':
        color = '#ffc107';
        size = 4;
        break;
      case 'largeIntestine':
        color = '#795548';
        size = 3;
        break;
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
    ctx.fill();
  };

  const getFoodPosition = (particle: FoodParticle, width: number, height: number): { x: number; y: number } => {
    const t = particle.progress / 100;

    switch (particle.stage) {
      case 'mouth':
        return {
          x: width / 2,
          y: height * 0.17
        };
      case 'esophagus':
        return {
          x: width / 2,
          y: height * 0.2 + (height * 0.15) * t
        };
      case 'stomach':
        // 胃の中で円運動
        const angle = t * Math.PI * 2;
        return {
          x: width / 2 - 15 + Math.cos(angle) * 10,
          y: height * 0.42 + Math.sin(angle) * 8
        };
      case 'smallIntestine':
        // 小腸の経路に沿って移動
        const pathIndex = Math.floor(t * 7);
        const localT = (t * 7) % 1;
        const points = [
          { x: width / 2 - 10, y: height * 0.48 },
          { x: width / 2 - 30, y: height * 0.52 },
          { x: width / 2 + 20, y: height * 0.54 },
          { x: width / 2 - 25, y: height * 0.58 },
          { x: width / 2 + 25, y: height * 0.6 },
          { x: width / 2 - 20, y: height * 0.64 },
          { x: width / 2 + 15, y: height * 0.66 },
          { x: width / 2, y: height * 0.68 }
        ];
        if (pathIndex < points.length - 1) {
          return {
            x: points[pathIndex].x + (points[pathIndex + 1].x - points[pathIndex].x) * localT,
            y: points[pathIndex].y + (points[pathIndex + 1].y - points[pathIndex].y) * localT
          };
        }
        return points[points.length - 1];
      case 'largeIntestine':
        // 大腸の経路
        if (t < 0.25) {
          return {
            x: width / 2 + 40 * t * 4,
            y: height * 0.68
          };
        } else if (t < 0.5) {
          return {
            x: width / 2 + 40,
            y: height * 0.68 - (height * 0.13) * (t - 0.25) * 4
          };
        } else if (t < 0.75) {
          return {
            x: width / 2 + 40 - 80 * (t - 0.5) * 4,
            y: height * 0.55
          };
        } else {
          return {
            x: width / 2 - 40,
            y: height * 0.55 + (height * 0.17) * (t - 0.75) * 4
          };
        }
    }
  };

  const highlightOrgan = (ctx: CanvasRenderingContext2D, organ: Organ, width: number, height: number) => {
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    
    switch (organ.id) {
      case 'stomach':
        ctx.beginPath();
        ctx.arc(width / 2 - 15, height * 0.42, 30, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'smallIntestine':
        ctx.strokeRect(width / 2 - 40, height * 0.48, 80, height * 0.2);
        break;
      case 'liver':
        ctx.beginPath();
        ctx.arc(width / 2 + 35, height * 0.42, 25, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
    
    ctx.setLineDash([]);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 胃の領域
    const stomachDist = Math.sqrt((x - canvas.width / 2 + 15) ** 2 + (y - canvas.height * 0.42) ** 2);
    if (stomachDist < 30) {
      onOrganClick('stomach');
      return;
    }

    // 肝臓の領域
    const liverDist = Math.sqrt((x - canvas.width / 2 - 35) ** 2 + (y - canvas.height * 0.42) ** 2);
    if (liverDist < 25) {
      onOrganClick('liver');
      return;
    }

    // 小腸の領域（簡略化）
    if (x > canvas.width / 2 - 40 && x < canvas.width / 2 + 40 &&
        y > canvas.height * 0.48 && y < canvas.height * 0.68) {
      onOrganClick('smallIntestine');
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
      
      {/* 消化時間インジケーター */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: 'rgba(255, 152, 0, 0.1)',
          p: 1,
          borderRadius: 1
        }}
      >
        <motion.div
          style={{
            fontSize: 12,
            color: '#ff9800'
          }}
        >
          消化時間: 約3〜5時間
        </motion.div>
      </Box>
    </Box>
  );
};