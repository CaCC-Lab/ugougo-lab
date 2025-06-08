import React, { useRef, useEffect } from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { waveData } from '../data/earthquakeData';
import type { ObservationPoint } from '../data/earthquakeData';

interface SeismographDisplayProps {
  observationPoint: ObservationPoint | null;
  seismographData: {
    time: number[];
    amplitude: number[];
  } | null;
  currentTime: number;
}

export const SeismographDisplay: React.FC<SeismographDisplayProps> = ({
  observationPoint,
  seismographData,
  currentTime
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !seismographData) return;

    // キャンバスサイズ設定
    canvas.width = 600;
    canvas.height = 200;

    // 背景をクリア
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // グリッドを描画
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // 縦線（時間）
    for (let i = 0; i <= 10; i++) {
      const x = (canvas.width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // 横線（振幅）
    for (let i = 0; i <= 4; i++) {
      const y = (canvas.height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 中心線
    ctx.strokeStyle = '#757575';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // 波形を描画
    if (seismographData.time.length > 1) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const timeRange = 30; // 表示する時間範囲（秒）
      const startTime = Math.max(0, currentTime - timeRange);

      for (let i = 0; i < seismographData.time.length; i++) {
        const time = seismographData.time[i];
        const amplitude = seismographData.amplitude[i];

        if (time < startTime) continue;

        const x = ((time - startTime) / timeRange) * canvas.width;
        const y = canvas.height / 2 - amplitude * 50;

        if (i === 0 || seismographData.time[i - 1] < startTime) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    }

    // P波・S波の到達時刻をマーク
    if (observationPoint?.pArrivalTime && observationPoint?.sArrivalTime) {
      const timeRange = 30;
      const startTime = Math.max(0, currentTime - timeRange);

      // P波到達
      if (observationPoint.pArrivalTime >= startTime && observationPoint.pArrivalTime <= currentTime) {
        const pX = ((observationPoint.pArrivalTime - startTime) / timeRange) * canvas.width;
        ctx.strokeStyle = waveData.P.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pX, 0);
        ctx.lineTo(pX, canvas.height);
        ctx.stroke();

        // ラベル
        ctx.fillStyle = waveData.P.color;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('P', pX + 5, 20);
      }

      // S波到達
      if (observationPoint.sArrivalTime >= startTime && observationPoint.sArrivalTime <= currentTime) {
        const sX = ((observationPoint.sArrivalTime - startTime) / timeRange) * canvas.width;
        ctx.strokeStyle = waveData.S.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sX, 0);
        ctx.lineTo(sX, canvas.height);
        ctx.stroke();

        // ラベル
        ctx.fillStyle = waveData.S.color;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('S', sX + 5, 20);
      }

      // 初期微動継続時間の表示
      if (observationPoint.pArrivalTime <= currentTime && observationPoint.sArrivalTime <= currentTime) {
        const psDuration = observationPoint.sArrivalTime - observationPoint.pArrivalTime;
        const pX = ((observationPoint.pArrivalTime - startTime) / timeRange) * canvas.width;
        const sX = ((observationPoint.sArrivalTime - startTime) / timeRange) * canvas.width;

        if (pX >= 0 && sX <= canvas.width) {
          // 矢印で範囲を示す
          ctx.strokeStyle = '#FF9800';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pX, canvas.height - 20);
          ctx.lineTo(sX, canvas.height - 20);
          ctx.stroke();

          // 矢印の先端
          ctx.beginPath();
          ctx.moveTo(pX, canvas.height - 20);
          ctx.lineTo(pX + 5, canvas.height - 25);
          ctx.lineTo(pX + 5, canvas.height - 15);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(sX, canvas.height - 20);
          ctx.lineTo(sX - 5, canvas.height - 25);
          ctx.lineTo(sX - 5, canvas.height - 15);
          ctx.closePath();
          ctx.fill();

          // 時間表示
          ctx.fillStyle = '#FF9800';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`初期微動継続時間: ${psDuration.toFixed(1)}秒`, (pX + sX) / 2, canvas.height - 25);
        }
      }
    }

  }, [seismographData, currentTime, observationPoint]);

  if (!observationPoint) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: 250 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          観測点を選択してください
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          地震計記録 - {observationPoint.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {observationPoint.distance && (
            <Chip
              label={`震源距離: ${observationPoint.distance.toFixed(1)}km`}
              size="small"
              color="primary"
            />
          )}
          {observationPoint.pArrivalTime && currentTime >= observationPoint.pArrivalTime && (
            <Chip
              label={`P波到達: ${observationPoint.pArrivalTime.toFixed(1)}秒`}
              size="small"
              sx={{ bgcolor: waveData.P.color, color: 'white' }}
            />
          )}
          {observationPoint.sArrivalTime && currentTime >= observationPoint.sArrivalTime && (
            <Chip
              label={`S波到達: ${observationPoint.sArrivalTime.toFixed(1)}秒`}
              size="small"
              sx={{ bgcolor: waveData.S.color, color: 'white' }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: 200,
            border: '1px solid #e0e0e0',
            borderRadius: 4
          }}
        />
        
        {/* Y軸ラベル */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            left: -40,
            top: '50%',
            transform: 'rotate(-90deg)',
            transformOrigin: 'center'
          }}
        >
          振幅
        </Typography>
        
        {/* X軸ラベル */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: -20,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          時間（秒）
        </Typography>
      </Box>

      {/* 初期微動継続時間の計算結果 */}
      {observationPoint.pArrivalTime && 
       observationPoint.sArrivalTime && 
       currentTime >= observationPoint.sArrivalTime && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            震源距離の計算
          </Typography>
          <Typography variant="body2">
            初期微動継続時間 = {(observationPoint.sArrivalTime - observationPoint.pArrivalTime).toFixed(1)}秒
          </Typography>
          <Typography variant="body2">
            震源距離 = 7.42 × {(observationPoint.sArrivalTime - observationPoint.pArrivalTime).toFixed(1)} 
            = <strong>{(7.42 * (observationPoint.sArrivalTime - observationPoint.pArrivalTime)).toFixed(1)}km</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            （実際の距離: {observationPoint.distance?.toFixed(1)}km）
          </Typography>
        </Box>
      )}
    </Paper>
  );
};