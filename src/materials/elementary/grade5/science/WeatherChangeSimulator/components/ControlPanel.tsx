import React from 'react';
import { Paper, Typography, Slider, Button, Stack, Box, Grid } from '@mui/material';
import { Add, WbSunny, Cloud, Water, Air, Thermostat } from '@mui/icons-material';
import { WeatherData, Front } from '../WeatherChangeSimulator';

interface ControlPanelProps {
  weatherData: WeatherData;
  onWeatherDataChange: (data: WeatherData) => void;
  onAddPressureSystem: (type: 'high' | 'low') => void;
  onAddFront: (type: Front['type']) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  weatherData,
  onWeatherDataChange,
  onAddPressureSystem,
  onAddFront
}) => {
  const handleSliderChange = (key: keyof WeatherData) => (
    _: Event,
    value: number | number[]
  ) => {
    onWeatherDataChange({
      ...weatherData,
      [key]: value as number
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        気象パラメータ
      </Typography>

      <Stack spacing={2}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Thermostat sx={{ mr: 1, color: '#ff6b6b' }} />
            <Typography variant="body2">
              気温: {weatherData.temperature}°C
            </Typography>
          </Box>
          <Slider
            value={weatherData.temperature}
            onChange={handleSliderChange('temperature')}
            min={-10}
            max={40}
            step={1}
            valueLabelDisplay="auto"
            sx={{
              '& .MuiSlider-track': {
                background: 'linear-gradient(to right, #4a69bd, #ff6b6b)'
              }
            }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Water sx={{ mr: 1, color: '#3498db' }} />
            <Typography variant="body2">
              湿度: {weatherData.humidity}%
            </Typography>
          </Box>
          <Slider
            value={weatherData.humidity}
            onChange={handleSliderChange('humidity')}
            min={0}
            max={100}
            step={5}
            valueLabelDisplay="auto"
            color="primary"
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WbSunny sx={{ mr: 1, color: '#f39c12' }} />
            <Typography variant="body2">
              気圧: {weatherData.pressure}hPa
            </Typography>
          </Box>
          <Slider
            value={weatherData.pressure}
            onChange={handleSliderChange('pressure')}
            min={980}
            max={1040}
            step={1}
            valueLabelDisplay="auto"
            sx={{
              '& .MuiSlider-track': {
                background: 'linear-gradient(to right, #3498db, #e74c3c)'
              }
            }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Air sx={{ mr: 1, color: '#95a5a6' }} />
            <Typography variant="body2">
              風速: {weatherData.windSpeed}m/s
            </Typography>
          </Box>
          <Slider
            value={weatherData.windSpeed}
            onChange={handleSliderChange('windSpeed')}
            min={0}
            max={30}
            step={1}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Cloud sx={{ mr: 1, color: '#7f8c8d' }} />
            <Typography variant="body2">
              雲量: {weatherData.cloudCoverage}%
            </Typography>
          </Box>
          <Slider
            value={weatherData.cloudCoverage}
            onChange={handleSliderChange('cloudCoverage')}
            min={0}
            max={100}
            step={10}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            気圧系を追加
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                fullWidth
                startIcon={<Add />}
                onClick={() => onAddPressureSystem('high')}
              >
                高気圧
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                fullWidth
                startIcon={<Add />}
                onClick={() => onAddPressureSystem('low')}
              >
                低気圧
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            前線を追加
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{ color: '#0000ff', borderColor: '#0000ff' }}
                onClick={() => onAddFront('cold')}
              >
                寒冷前線
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{ color: '#ff0000', borderColor: '#ff0000' }}
                onClick={() => onAddFront('warm')}
              >
                温暖前線
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{ color: '#800080', borderColor: '#800080' }}
                onClick={() => onAddFront('stationary')}
              >
                停滞前線
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                sx={{ color: '#ff00ff', borderColor: '#ff00ff' }}
                onClick={() => onAddFront('occluded')}
              >
                閉塞前線
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Paper>
  );
};