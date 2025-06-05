import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Slider, Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { PlayArrow, Pause, Refresh } from '@mui/icons-material';
import { MaterialBase } from '@components/educational';
import { WeatherMap } from './components/WeatherMap';
import { ControlPanel } from './components/ControlPanel';
import { InfoPanel } from './components/InfoPanel';
import { useWeatherSimulation } from './hooks/useWeatherSimulation';

export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  cloudCoverage: number;
  precipitation: number;
}

export interface PressureSystem {
  id: string;
  type: 'high' | 'low';
  x: number;
  y: number;
  pressure: number;
  size: number;
}

export interface Front {
  id: string;
  type: 'cold' | 'warm' | 'stationary' | 'occluded';
  points: { x: number; y: number }[];
  speed: number;
  direction: number;
}

const WeatherChangeSimulator: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 20,
    humidity: 60,
    pressure: 1013,
    windSpeed: 5,
    windDirection: 270,
    cloudCoverage: 50,
    precipitation: 0
  });

  const [pressureSystems, setPressureSystems] = useState<PressureSystem[]>([
    {
      id: 'high1',
      type: 'high',
      x: 200,
      y: 150,
      pressure: 1020,
      size: 100
    },
    {
      id: 'low1',
      type: 'low',
      x: 500,
      y: 200,
      pressure: 1005,
      size: 120
    }
  ]);

  const [fronts, setFronts] = useState<Front[]>([
    {
      id: 'cold1',
      type: 'cold',
      points: [
        { x: 350, y: 100 },
        { x: 400, y: 250 },
        { x: 450, y: 350 }
      ],
      speed: 30,
      direction: 90
    }
  ]);

  const { 
    simulateWeather, 
    calculateCloudType, 
    predictPrecipitation,
    updateFrontPosition 
  } = useWeatherSimulation();

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => prev + timeSpeed);
        
        // 前線の移動
        setFronts(prevFronts => 
          prevFronts.map(front => updateFrontPosition(front, timeSpeed))
        );
        
        // 天気データの更新
        const newWeatherData = simulateWeather(
          weatherData, 
          pressureSystems, 
          fronts, 
          currentTime
        );
        setWeatherData(newWeatherData);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPlaying, timeSpeed, currentTime, weatherData, pressureSystems, fronts]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setWeatherData({
      temperature: 20,
      humidity: 60,
      pressure: 1013,
      windSpeed: 5,
      windDirection: 270,
      cloudCoverage: 50,
      precipitation: 0
    });
  };

  const handlePressureSystemUpdate = (id: string, data: Partial<PressureSystem>) => {
    setPressureSystems(prev => 
      prev.map(system => system.id === id ? { ...system, ...data } : system)
    );
  };

  const handleAddPressureSystem = (type: 'high' | 'low') => {
    const newSystem: PressureSystem = {
      id: `${type}${Date.now()}`,
      type,
      x: Math.random() * 600 + 100,
      y: Math.random() * 300 + 100,
      pressure: type === 'high' ? 1020 : 1005,
      size: 100
    };
    setPressureSystems([...pressureSystems, newSystem]);
  };

  const handleAddFront = (type: Front['type']) => {
    const newFront: Front = {
      id: `${type}${Date.now()}`,
      type,
      points: [
        { x: 200, y: 200 },
        { x: 300, y: 250 },
        { x: 400, y: 300 }
      ],
      speed: 20,
      direction: 90
    };
    setFronts([...fronts, newFront]);
  };

  return (
    <MaterialBase
      title="天気の変化シミュレーター"
      description="気圧配置と前線の動きから天気の変化を学ぼう"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '600px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">天気図</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                  onClick={() => setIsPlaying(!isPlaying)}
                  size="small"
                >
                  {isPlaying ? '一時停止' : '再生'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleReset}
                  size="small"
                >
                  リセット
                </Button>
              </Box>
            </Box>
            
            <WeatherMap
              weatherData={weatherData}
              pressureSystems={pressureSystems}
              fronts={fronts}
              onPressureSystemUpdate={handlePressureSystemUpdate}
              cloudType={calculateCloudType(weatherData)}
              precipitation={predictPrecipitation(weatherData)}
            />

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">時間の速さ:</Typography>
              <Slider
                value={timeSpeed}
                onChange={(_, value) => setTimeSpeed(value as number)}
                min={0.5}
                max={5}
                step={0.5}
                marks
                valueLabelDisplay="auto"
                sx={{ width: 200 }}
                disabled={isPlaying}
              />
              <Typography variant="body2">経過時間: {Math.floor(currentTime / 10)}時間</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ControlPanel
                weatherData={weatherData}
                onWeatherDataChange={setWeatherData}
                onAddPressureSystem={handleAddPressureSystem}
                onAddFront={handleAddFront}
              />
            </Grid>
            
            <Grid item xs={12}>
              <InfoPanel
                weatherData={weatherData}
                cloudType={calculateCloudType(weatherData)}
                precipitation={predictPrecipitation(weatherData)}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </MaterialBase>
  );
};

export default WeatherChangeSimulator;