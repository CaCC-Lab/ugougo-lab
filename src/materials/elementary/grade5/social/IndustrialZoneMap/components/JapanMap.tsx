import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { IndustrialZone } from '../IndustrialZoneMap';

interface JapanMapProps {
  zones: IndustrialZone[];
  selectedZone: IndustrialZone | null;
  highlightedZones: string[];
  onZoneClick: (zoneId: string) => void;
}

export const JapanMap: React.FC<JapanMapProps> = ({
  zones,
  selectedZone,
  highlightedZones,
  onZoneClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapWidth = 800;
  const mapHeight = 600;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスをクリア
    ctx.clearRect(0, 0, mapWidth, mapHeight);

    // 日本地図を描画（簡略化した形状）
    drawJapanMap(ctx);

    // 工業地帯を描画
    zones.forEach(zone => {
      drawIndustrialZone(ctx, zone, 
        selectedZone?.id === zone.id,
        highlightedZones.includes(zone.id)
      );
    });

  }, [zones, selectedZone, highlightedZones]);

  const drawJapanMap = (ctx: CanvasRenderingContext2D) => {
    // 背景（海）
    ctx.fillStyle = '#E3F2FD';
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    // 日本の本州を簡略化して描画
    ctx.fillStyle = '#FFF8E1';
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2;

    // 本州
    ctx.beginPath();
    ctx.moveTo(400, 100);
    ctx.quadraticCurveTo(450, 120, 480, 180);
    ctx.quadraticCurveTo(490, 250, 470, 320);
    ctx.quadraticCurveTo(450, 380, 400, 420);
    ctx.quadraticCurveTo(350, 410, 320, 380);
    ctx.quadraticCurveTo(300, 340, 310, 280);
    ctx.quadraticCurveTo(320, 220, 340, 160);
    ctx.quadraticCurveTo(370, 110, 400, 100);
    ctx.fill();
    ctx.stroke();

    // 北海道
    ctx.beginPath();
    ctx.arc(450, 60, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 九州
    ctx.beginPath();
    ctx.moveTo(340, 420);
    ctx.quadraticCurveTo(360, 440, 350, 480);
    ctx.quadraticCurveTo(330, 500, 310, 480);
    ctx.quadraticCurveTo(300, 450, 320, 430);
    ctx.quadraticCurveTo(330, 420, 340, 420);
    ctx.fill();
    ctx.stroke();

    // 四国
    ctx.beginPath();
    ctx.ellipse(400, 390, 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 地域名を表示
    ctx.fillStyle = '#616161';
    ctx.font = '14px sans-serif';
    ctx.fillText('北海道', 430, 65);
    ctx.fillText('東北', 420, 150);
    ctx.fillText('関東', 460, 280);
    ctx.fillText('中部', 380, 280);
    ctx.fillText('近畿', 360, 340);
    ctx.fillText('中国', 320, 360);
    ctx.fillText('四国', 390, 395);
    ctx.fillText('九州', 300, 470);
  };

  const drawIndustrialZone = (
    ctx: CanvasRenderingContext2D, 
    zone: IndustrialZone,
    isSelected: boolean,
    isHighlighted: boolean
  ) => {
    const x = (zone.position.x / 100) * mapWidth;
    const y = (zone.position.y / 100) * mapHeight;
    const radius = isSelected ? 20 : 15;

    // 工業地帯の円を描画
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    if (isSelected) {
      ctx.fillStyle = '#FF5722';
      ctx.strokeStyle = '#D84315';
      ctx.lineWidth = 3;
    } else if (isHighlighted) {
      ctx.fillStyle = '#FFC107';
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 2;
    } else {
      ctx.fillStyle = '#2196F3';
      ctx.strokeStyle = '#1565C0';
      ctx.lineWidth = 2;
    }
    
    ctx.fill();
    ctx.stroke();

    // アイコン（工場マーク）を描画
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    // 工場の煙突
    ctx.fillRect(x - 6, y - 8, 4, 10);
    ctx.fillRect(x + 2, y - 8, 4, 10);
    
    // 工場の建物
    ctx.fillRect(x - 8, y - 2, 16, 8);

    // 地帯名を表示
    ctx.fillStyle = isSelected ? '#D84315' : '#1565C0';
    ctx.font = isSelected ? 'bold 12px sans-serif' : '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(zone.name, x, y + radius + 15);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = mapWidth / rect.width;
    const scaleY = mapHeight / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // クリックされた工業地帯を探す
    zones.forEach(zone => {
      const zoneX = (zone.position.x / 100) * mapWidth;
      const zoneY = (zone.position.y / 100) * mapHeight;
      const distance = Math.sqrt((x - zoneX) ** 2 + (y - zoneY) ** 2);
      
      if (distance < 20) {
        onZoneClick(zone.id);
      }
    });
  };

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%',
      paddingTop: '75%', // 4:3 aspect ratio
      bgcolor: '#f5f5f5',
      borderRadius: 1,
      overflow: 'hidden'
    }}>
      <canvas
        ref={canvasRef}
        width={mapWidth}
        height={mapHeight}
        onClick={handleCanvasClick}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
      />
    </Box>
  );
};