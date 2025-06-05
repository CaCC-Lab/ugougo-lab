import React from 'react';
import { Paper, Typography, Box, Chip, Stack } from '@mui/material';
import { 
  WbSunny, 
  Cloud, 
  Grain, 
  AcUnit, 
  Thunderstorm,
  WbCloudy,
  CloudQueue
} from '@mui/icons-material';
import { WeatherData } from '../WeatherChangeSimulator';

interface InfoPanelProps {
  weatherData: WeatherData;
  cloudType: string;
  precipitation: number;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  weatherData,
  cloudType,
  precipitation
}) => {
  const getWeatherIcon = () => {
    if (precipitation > 0.5) {
      if (weatherData.temperature < 0) {
        return <AcUnit sx={{ fontSize: 48, color: '#3498db' }} />;
      }
      return <Grain sx={{ fontSize: 48, color: '#3498db' }} />;
    }
    if (weatherData.cloudCoverage > 80) {
      return <Cloud sx={{ fontSize: 48, color: '#95a5a6' }} />;
    }
    if (weatherData.cloudCoverage > 40) {
      return <WbCloudy sx={{ fontSize: 48, color: '#bdc3c7' }} />;
    }
    return <WbSunny sx={{ fontSize: 48, color: '#f39c12' }} />;
  };

  const getWeatherDescription = () => {
    if (precipitation > 0.8) {
      return weatherData.temperature < 0 ? '大雪' : '大雨';
    }
    if (precipitation > 0.5) {
      return weatherData.temperature < 0 ? '雪' : '雨';
    }
    if (precipitation > 0.2) {
      return weatherData.temperature < 0 ? '小雪' : '小雨';
    }
    if (weatherData.cloudCoverage > 80) {
      return '曇り';
    }
    if (weatherData.cloudCoverage > 40) {
      return '晴れ時々曇り';
    }
    return '晴れ';
  };

  const getCloudIcon = (type: string) => {
    switch (type) {
      case '積雲':
        return <CloudQueue />;
      case '積乱雲':
        return <Thunderstorm />;
      case '層雲':
        return <Cloud />;
      default:
        return <WbCloudy />;
    }
  };

  const getWeatherTips = () => {
    const tips = [];
    
    if (weatherData.pressure < 1000) {
      tips.push('低気圧が近づいています。天気が崩れる可能性があります。');
    } else if (weatherData.pressure > 1020) {
      tips.push('高気圧に覆われています。安定した天気が続くでしょう。');
    }

    if (weatherData.humidity > 80 && weatherData.temperature > 25) {
      tips.push('蒸し暑い天気です。熱中症に注意しましょう。');
    }

    if (weatherData.windSpeed > 15) {
      tips.push('風が強いです。屋外活動には注意が必要です。');
    }

    if (precipitation > 0.5 && weatherData.temperature < 0) {
      tips.push('雪が降っています。路面の凍結に注意しましょう。');
    }

    return tips;
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        現在の天気
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {getWeatherIcon()}
        <Box sx={{ ml: 2 }}>
          <Typography variant="h5">
            {getWeatherDescription()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {weatherData.temperature}°C / 湿度 {weatherData.humidity}%
          </Typography>
        </Box>
      </Box>

      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            雲の種類
          </Typography>
          <Chip
            icon={getCloudIcon(cloudType)}
            label={cloudType}
            variant="outlined"
            size="small"
          />
        </Box>

        {precipitation > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              降水量
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  bgcolor: '#e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    width: `${Math.min(precipitation * 100, 100)}%`,
                    height: '100%',
                    bgcolor: '#3498db',
                    transition: 'width 0.3s'
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {(precipitation * 10).toFixed(1)}mm/h
              </Typography>
            </Box>
          </Box>
        )}

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            風向・風速
          </Typography>
          <Typography variant="body2">
            {['北', '北東', '東', '南東', '南', '南西', '西', '北西'][
              Math.floor(((weatherData.windDirection + 22.5) % 360) / 45)
            ]}の風 {weatherData.windSpeed}m/s
          </Typography>
        </Box>

        {getWeatherTips().length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              お天気メモ
            </Typography>
            <Stack spacing={1}>
              {getWeatherTips().map((tip, index) => (
                <Typography key={index} variant="body2" sx={{ 
                  p: 1, 
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                  fontSize: '0.875rem'
                }}>
                  💡 {tip}
                </Typography>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};