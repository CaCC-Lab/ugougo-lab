// 時計表示コンポーネント
import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { City } from '../data/cityData';

interface ClockDisplayProps {
  city: City;
  time: {
    hours: number;
    minutes: number;
    seconds: number;
    date: Date;
  };
  label?: string;
  color?: 'primary' | 'secondary';
}

const ClockContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
}));

const AnalogClock = styled('svg')({
  width: '150px',
  height: '150px',
  margin: '0 auto'
});

const ClockFace = styled('circle')({
  fill: '#fff',
  stroke: '#333',
  strokeWidth: 2
});

const ClockHand = styled('line')<{ type: 'hour' | 'minute' | 'second' }>(({ type }) => ({
  stroke: type === 'hour' ? '#333' : type === 'minute' ? '#666' : '#f44336',
  strokeWidth: type === 'hour' ? 4 : type === 'minute' ? 3 : 1,
  strokeLinecap: 'round',
  transformOrigin: '75px 75px',
  transition: type === 'second' ? 'none' : 'transform 0.5s ease-in-out'
}));

const DigitalTime = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  margin: theme.spacing(1, 0)
}));

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  city,
  time,
  label,
  color = 'primary'
}) => {
  // 時計の針の角度を計算
  const hourAngle = (time.hours % 12) * 30 + time.minutes * 0.5;
  const minuteAngle = time.minutes * 6 + time.seconds * 0.1;
  const secondAngle = time.seconds * 6;

  // デジタル時刻のフォーマット
  const digitalTime = `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;

  // 日付のフォーマット
  const dateString = time.date.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  });

  return (
    <ClockContainer elevation={2}>
      <Typography variant="h6" color={color} gutterBottom>
        {label || city.nameJa}
      </Typography>
      
      <Typography variant="body2" color="textSecondary">
        {city.countryJa} (UTC{city.timezone >= 0 ? '+' : ''}{city.timezone})
      </Typography>

      {/* アナログ時計 */}
      <Box sx={{ my: 2 }}>
        <AnalogClock viewBox="0 0 150 150">
          {/* 時計の文字盤 */}
          <ClockFace cx="75" cy="75" r="70" />
          
          {/* 時間マーカー */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x1 = 75 + 60 * Math.cos(angle);
            const y1 = 75 + 60 * Math.sin(angle);
            const x2 = 75 + 65 * Math.cos(angle);
            const y2 = 75 + 65 * Math.sin(angle);
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#333"
                strokeWidth={i % 3 === 0 ? 2 : 1}
              />
            );
          })}
          
          {/* 時針 */}
          <ClockHand
            type="hour"
            x1="75"
            y1="75"
            x2="75"
            y2="30"
            transform={`rotate(${hourAngle} 75 75)`}
          />
          
          {/* 分針 */}
          <ClockHand
            type="minute"
            x1="75"
            y1="75"
            x2="75"
            y2="20"
            transform={`rotate(${minuteAngle} 75 75)`}
          />
          
          {/* 秒針 */}
          <ClockHand
            type="second"
            x1="75"
            y1="75"
            x2="75"
            y2="15"
            transform={`rotate(${secondAngle} 75 75)`}
          />
          
          {/* 中心点 */}
          <circle cx="75" cy="75" r="3" fill="#333" />
        </AnalogClock>
      </Box>

      {/* デジタル時計 */}
      <DigitalTime color={color}>
        {digitalTime}
      </DigitalTime>
      
      {/* 日付表示 */}
      <Typography variant="body2" color="textSecondary">
        {dateString}
      </Typography>
    </ClockContainer>
  );
};