import { WeatherData, PressureSystem, Front } from '../WeatherChangeSimulator';

export const useWeatherSimulation = () => {
  const simulateWeather = (
    currentWeather: WeatherData,
    pressureSystems: PressureSystem[],
    fronts: Front[],
    time: number
  ): WeatherData => {
    let newWeather = { ...currentWeather };

    // 気圧系の影響を計算
    pressureSystems.forEach(system => {
      const influence = calculatePressureInfluence(system, newWeather);
      newWeather = applyPressureInfluence(newWeather, influence, system.type);
    });

    // 前線の影響を計算
    fronts.forEach(front => {
      const influence = calculateFrontInfluence(front, time);
      newWeather = applyFrontInfluence(newWeather, influence, front.type);
    });

    // 自然な変動を追加
    newWeather = addNaturalVariation(newWeather, time);

    // 降水量を計算
    newWeather.precipitation = predictPrecipitation(newWeather);

    return newWeather;
  };

  const calculatePressureInfluence = (
    system: PressureSystem,
    weather: WeatherData
  ) => {
    // 気圧差による影響の強さ
    const pressureDiff = Math.abs(system.pressure - weather.pressure);
    const influence = Math.min(pressureDiff / 20, 1);
    
    return influence;
  };

  const applyPressureInfluence = (
    weather: WeatherData,
    influence: number,
    type: 'high' | 'low'
  ): WeatherData => {
    const newWeather = { ...weather };

    if (type === 'high') {
      // 高気圧の影響
      newWeather.cloudCoverage = Math.max(0, weather.cloudCoverage - influence * 20);
      newWeather.humidity = Math.max(20, weather.humidity - influence * 10);
      newWeather.windSpeed = Math.max(0, weather.windSpeed - influence * 2);
    } else {
      // 低気圧の影響
      newWeather.cloudCoverage = Math.min(100, weather.cloudCoverage + influence * 30);
      newWeather.humidity = Math.min(100, weather.humidity + influence * 15);
      newWeather.windSpeed = Math.min(30, weather.windSpeed + influence * 5);
    }

    return newWeather;
  };

  const calculateFrontInfluence = (front: Front, time: number) => {
    // 前線の移動による影響
    const movementFactor = Math.sin(time * 0.01) * 0.5 + 0.5;
    return movementFactor;
  };

  const applyFrontInfluence = (
    weather: WeatherData,
    influence: number,
    type: Front['type']
  ): WeatherData => {
    const newWeather = { ...weather };

    switch (type) {
      case 'cold':
        // 寒冷前線：気温低下、突発的な雨
        newWeather.temperature = Math.max(-10, weather.temperature - influence * 5);
        newWeather.cloudCoverage = Math.min(100, weather.cloudCoverage + influence * 40);
        newWeather.windSpeed = Math.min(30, weather.windSpeed + influence * 10);
        break;
      case 'warm':
        // 温暖前線：気温上昇、持続的な雨
        newWeather.temperature = Math.min(40, weather.temperature + influence * 3);
        newWeather.cloudCoverage = Math.min(100, weather.cloudCoverage + influence * 30);
        newWeather.humidity = Math.min(100, weather.humidity + influence * 20);
        break;
      case 'stationary':
        // 停滞前線：長期的な曇り・雨
        newWeather.cloudCoverage = Math.min(100, weather.cloudCoverage + influence * 25);
        newWeather.humidity = Math.min(100, weather.humidity + influence * 15);
        break;
      case 'occluded':
        // 閉塞前線：複雑な天気変化
        newWeather.temperature = weather.temperature + (Math.random() - 0.5) * influence * 4;
        newWeather.cloudCoverage = Math.min(100, weather.cloudCoverage + influence * 35);
        break;
    }

    return newWeather;
  };

  const addNaturalVariation = (weather: WeatherData, time: number): WeatherData => {
    const newWeather = { ...weather };
    
    // 時間による自然な変動
    const timeFactor = time * 0.001;
    
    newWeather.temperature += Math.sin(timeFactor) * 0.5;
    newWeather.humidity += Math.cos(timeFactor * 1.3) * 2;
    newWeather.windDirection = (weather.windDirection + Math.sin(timeFactor * 0.7) * 5) % 360;
    
    // 値の範囲を制限
    newWeather.temperature = Math.max(-10, Math.min(40, newWeather.temperature));
    newWeather.humidity = Math.max(0, Math.min(100, newWeather.humidity));
    
    return newWeather;
  };

  const calculateCloudType = (weather: WeatherData): string => {
    if (weather.cloudCoverage < 20) {
      return '快晴';
    }
    
    if (weather.humidity > 80 && weather.temperature > 25) {
      return '積乱雲';
    }
    
    if (weather.humidity > 70 && weather.cloudCoverage > 60) {
      return '層雲';
    }
    
    if (weather.cloudCoverage > 40 && weather.cloudCoverage < 70) {
      return '積雲';
    }
    
    if (weather.cloudCoverage > 80) {
      return '層積雲';
    }
    
    return '巻雲';
  };

  const predictPrecipitation = (weather: WeatherData): number => {
    let precipitationChance = 0;

    // 湿度の影響
    if (weather.humidity > 80) {
      precipitationChance += 0.4;
    } else if (weather.humidity > 60) {
      precipitationChance += 0.2;
    }

    // 雲量の影響
    if (weather.cloudCoverage > 80) {
      precipitationChance += 0.4;
    } else if (weather.cloudCoverage > 60) {
      precipitationChance += 0.2;
    }

    // 気圧の影響
    if (weather.pressure < 1000) {
      precipitationChance += 0.3;
    } else if (weather.pressure < 1010) {
      precipitationChance += 0.1;
    }

    // 風速の影響（強風時は降水確率上昇）
    if (weather.windSpeed > 15) {
      precipitationChance += 0.2;
    }

    return Math.min(precipitationChance, 1);
  };

  const updateFrontPosition = (front: Front, timeSpeed: number): Front => {
    const updatedFront = { ...front };
    
    // 前線の移動速度（km/h → px/frame）
    const movementSpeed = (front.speed * timeSpeed) / 100;
    
    // 移動方向（度数法 → ラジアン）
    const directionRad = (front.direction * Math.PI) / 180;
    
    // 各点を移動
    updatedFront.points = front.points.map(point => ({
      x: point.x + Math.cos(directionRad) * movementSpeed,
      y: point.y + Math.sin(directionRad) * movementSpeed
    }));
    
    return updatedFront;
  };

  return {
    simulateWeather,
    calculateCloudType,
    predictPrecipitation,
    updateFrontPosition
  };
};