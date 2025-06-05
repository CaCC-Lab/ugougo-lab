import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { WeatherData, PressureSystem, Front } from '../WeatherChangeSimulator';

interface WeatherMapProps {
  weatherData: WeatherData;
  pressureSystems: PressureSystem[];
  fronts: Front[];
  onPressureSystemUpdate: (id: string, data: Partial<PressureSystem>) => void;
  cloudType: string;
  precipitation: number;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  weatherData,
  pressureSystems,
  fronts,
  onPressureSystemUpdate,
  cloudType,
  precipitation
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景（空）を描画
    drawSky(ctx, canvas.width, canvas.height, weatherData);

    // 等圧線を描画
    drawIsobars(ctx, canvas.width, canvas.height, pressureSystems);

    // 雲を描画
    drawClouds(ctx, canvas.width, canvas.height, weatherData, cloudType);

    // 降水を描画
    if (precipitation > 0) {
      drawPrecipitation(ctx, canvas.width, canvas.height, precipitation, weatherData.temperature);
    }

    // 気圧系を描画
    pressureSystems.forEach(system => {
      drawPressureSystem(ctx, system);
    });

    // 前線を描画
    fronts.forEach(front => {
      drawFront(ctx, front);
    });

    // 風向・風速を描画
    drawWind(ctx, canvas.width, canvas.height, weatherData);

  }, [weatherData, pressureSystems, fronts, cloudType, precipitation]);

  const drawSky = (ctx: CanvasRenderingContext2D, width: number, height: number, data: WeatherData) => {
    // 空のグラデーション
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    
    // 天気に応じた空の色
    if (data.cloudCoverage < 30) {
      // 晴れ
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
    } else if (data.cloudCoverage < 70) {
      // 曇り
      gradient.addColorStop(0, '#B0C4DE');
      gradient.addColorStop(1, '#D3D3D3');
    } else {
      // 雨雲
      gradient.addColorStop(0, '#708090');
      gradient.addColorStop(1, '#A9A9A9');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const drawIsobars = (ctx: CanvasRenderingContext2D, width: number, height: number, systems: PressureSystem[]) => {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // 簡易的な等圧線（同心円）
    systems.forEach(system => {
      const numIsobars = 5;
      for (let i = 0; i < numIsobars; i++) {
        ctx.beginPath();
        ctx.arc(system.x, system.y, system.size + i * 20, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.setLineDash([]);
  };

  const drawClouds = (ctx: CanvasRenderingContext2D, width: number, height: number, data: WeatherData, type: string) => {
    const numClouds = Math.floor(data.cloudCoverage / 10);
    
    for (let i = 0; i < numClouds; i++) {
      const x = (width / numClouds) * i + Math.random() * 50;
      const y = 50 + Math.random() * 100;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      // 雲の形を描画
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
      ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
      ctx.arc(x + 15, y - 20, 25, 0, Math.PI * 2);
      ctx.arc(x + 35, y - 20, 25, 0, Math.PI * 2);
      ctx.fill();

      // 雲の種類をラベル表示
      if (i === 0) {
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.fillText(type, x + 10, y + 50);
      }
    }
  };

  const drawPrecipitation = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number, temperature: number) => {
    ctx.strokeStyle = temperature > 0 ? 'rgba(100, 149, 237, 0.6)' : 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = temperature > 0 ? 2 : 3;

    const numDrops = intensity * 10;
    
    for (let i = 0; i < numDrops; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      ctx.beginPath();
      if (temperature > 0) {
        // 雨
        ctx.moveTo(x, y);
        ctx.lineTo(x - 2, y + 10);
      } else {
        // 雪
        const size = 5;
        for (let j = 0; j < 6; j++) {
          const angle = (Math.PI * 2 / 6) * j;
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
        }
      }
      ctx.stroke();
    }
  };

  const drawPressureSystem = (ctx: CanvasRenderingContext2D, system: PressureSystem) => {
    ctx.save();
    
    // 気圧系の円を描画
    ctx.beginPath();
    ctx.arc(system.x, system.y, system.size, 0, Math.PI * 2);
    
    if (system.type === 'high') {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.strokeStyle = '#ff0000';
    } else {
      ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
      ctx.strokeStyle = '#0000ff';
    }
    
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.stroke();

    // ラベルを描画
    ctx.fillStyle = system.type === 'high' ? '#ff0000' : '#0000ff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(system.type === 'high' ? '高' : '低', system.x, system.y);
    
    // 気圧値を表示
    ctx.font = '14px sans-serif';
    ctx.fillText(`${system.pressure}hPa`, system.x, system.y + 25);
    
    ctx.restore();
  };

  const drawFront = (ctx: CanvasRenderingContext2D, front: Front) => {
    ctx.save();
    
    // 前線の線を描画
    ctx.beginPath();
    ctx.moveTo(front.points[0].x, front.points[0].y);
    
    for (let i = 1; i < front.points.length; i++) {
      ctx.lineTo(front.points[i].x, front.points[i].y);
    }
    
    ctx.lineWidth = 3;
    
    switch (front.type) {
      case 'cold':
        ctx.strokeStyle = '#0000ff';
        break;
      case 'warm':
        ctx.strokeStyle = '#ff0000';
        break;
      case 'stationary':
        ctx.strokeStyle = '#800080';
        break;
      case 'occluded':
        ctx.strokeStyle = '#ff00ff';
        break;
    }
    
    ctx.stroke();

    // 前線の記号を描画
    const symbolInterval = 50;
    for (let i = 0; i < front.points.length - 1; i++) {
      const p1 = front.points[i];
      const p2 = front.points[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const numSymbols = Math.floor(distance / symbolInterval);

      for (let j = 1; j <= numSymbols; j++) {
        const t = j / (numSymbols + 1);
        const x = p1.x + dx * t;
        const y = p1.y + dy * t;
        const angle = Math.atan2(dy, dx);

        drawFrontSymbol(ctx, x, y, angle, front.type);
      }
    }
    
    ctx.restore();
  };

  const drawFrontSymbol = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, type: Front['type']) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    switch (type) {
      case 'cold':
        // 三角形
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fillStyle = '#0000ff';
        ctx.fill();
        break;
      case 'warm':
        // 半円
        ctx.beginPath();
        ctx.arc(-5, 0, 8, -Math.PI / 2, Math.PI / 2);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        break;
    }

    ctx.restore();
  };

  const drawWind = (ctx: CanvasRenderingContext2D, width: number, height: number, data: WeatherData) => {
    const arrowLength = 50;
    const arrowX = width - 100;
    const arrowY = height - 100;

    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.rotate((data.windDirection * Math.PI) / 180);

    // 風向矢印
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -arrowLength);
    ctx.lineTo(-10, -arrowLength + 10);
    ctx.moveTo(0, -arrowLength);
    ctx.lineTo(10, -arrowLength + 10);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // 風速表示
    ctx.fillStyle = '#000';
    ctx.font = '14px sans-serif';
    ctx.fillText(`風速: ${data.windSpeed}m/s`, arrowX - 30, arrowY + 30);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // クリックされた気圧系を探す
    const clickedSystem = pressureSystems.find(system => {
      const distance = Math.sqrt((x - system.x) ** 2 + (y - system.y) ** 2);
      return distance < system.size;
    });

    if (clickedSystem) {
      setIsDragging(clickedSystem.id);
      setDragOffset({
        x: x - clickedSystem.x,
        y: y - clickedSystem.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    onPressureSystemUpdate(isDragging, { x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  return (
    <Box sx={{ width: '100%', height: '450px', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #ccc',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </Box>
  );
};