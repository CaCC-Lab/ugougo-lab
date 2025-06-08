// 時差計算のカスタムフック
import { useState, useCallback, useEffect } from 'react';
import type { City } from '../data/cityData';

interface TimeInfo {
  hours: number;
  minutes: number;
  seconds: number;
  date: Date;
}

export const useTimeZoneCalculation = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [baseCity, setBaseCity] = useState<City | null>(null);
  const [targetCity, setTargetCity] = useState<City | null>(null);

  // 現在時刻を更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 特定の都市の現在時刻を取得
  const getCityTime = useCallback((city: City): TimeInfo => {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cityTime = new Date(utcTime + (3600000 * city.timezone));

    return {
      hours: cityTime.getHours(),
      minutes: cityTime.getMinutes(),
      seconds: cityTime.getSeconds(),
      date: cityTime
    };
  }, []);

  // 基準都市の特定時刻から目標都市の時刻を計算
  const calculateTargetTime = useCallback((
    baseCity: City,
    targetCity: City,
    baseHour: number,
    baseMinute: number
  ): TimeInfo => {
    // 時差を計算
    const timeDifference = targetCity.timezone - baseCity.timezone;
    
    // 基準時刻を分に変換
    let totalMinutes = baseHour * 60 + baseMinute;
    
    // 時差を適用
    totalMinutes += timeDifference * 60;
    
    // 日付をまたぐ場合の処理
    let dayOffset = 0;
    if (totalMinutes < 0) {
      dayOffset = -1;
      totalMinutes += 24 * 60;
    } else if (totalMinutes >= 24 * 60) {
      dayOffset = 1;
      totalMinutes -= 24 * 60;
    }
    
    // 時と分に変換
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // 日付オブジェクトを作成
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    if (dayOffset !== 0) {
      date.setDate(date.getDate() + dayOffset);
    }
    
    return {
      hours,
      minutes,
      seconds: 0,
      date
    };
  }, []);

  // 時差を計算（時間単位）
  const calculateTimeDifference = useCallback((city1: City, city2: City): number => {
    return city2.timezone - city1.timezone;
  }, []);

  // 経度差から理論的な時差を計算
  const calculateTheoreticalTimeDifference = useCallback((city1: City, city2: City): number => {
    const longitudeDifference = city2.longitude - city1.longitude;
    // 経度15度 = 1時間の時差
    return longitudeDifference / 15;
  }, []);

  // 時刻をフォーマット
  const formatTime = useCallback((timeInfo: TimeInfo, showSeconds = false): string => {
    const hours = timeInfo.hours.toString().padStart(2, '0');
    const minutes = timeInfo.minutes.toString().padStart(2, '0');
    
    if (showSeconds) {
      const seconds = timeInfo.seconds.toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
    
    return `${hours}:${minutes}`;
  }, []);

  // 日付が変わるかどうかを判定
  const checkDateChange = useCallback((
    baseCity: City,
    targetCity: City,
    baseHour: number
  ): 'same' | 'next' | 'previous' => {
    const timeDifference = targetCity.timezone - baseCity.timezone;
    const targetHour = baseHour + timeDifference;
    
    if (targetHour < 0) {
      return 'previous';
    } else if (targetHour >= 24) {
      return 'next';
    }
    return 'same';
  }, []);

  return {
    currentTime,
    baseCity,
    targetCity,
    setBaseCity,
    setTargetCity,
    getCityTime,
    calculateTargetTime,
    calculateTimeDifference,
    calculateTheoreticalTimeDifference,
    formatTime,
    checkDateChange
  };
};