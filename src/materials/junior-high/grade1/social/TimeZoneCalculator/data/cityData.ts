// 都市の位置・時差情報

export interface City {
  id: string;
  name: string;
  nameJa: string;
  country: string;
  countryJa: string;
  timezone: number; // UTC+/- hours
  longitude: number;
  latitude: number;
  // SVG地図上の位置（パーセンテージ）
  mapX: number;
  mapY: number;
}

export const cities: City[] = [
  {
    id: 'tokyo',
    name: 'Tokyo',
    nameJa: '東京',
    country: 'Japan',
    countryJa: '日本',
    timezone: 9,
    longitude: 139.6917,
    latitude: 35.6895,
    mapX: 82,
    mapY: 38
  },
  {
    id: 'london',
    name: 'London',
    nameJa: 'ロンドン',
    country: 'United Kingdom',
    countryJa: 'イギリス',
    timezone: 0,
    longitude: -0.1276,
    latitude: 51.5074,
    mapX: 49.5,
    mapY: 25
  },
  {
    id: 'newyork',
    name: 'New York',
    nameJa: 'ニューヨーク',
    country: 'United States',
    countryJa: 'アメリカ',
    timezone: -5,
    longitude: -74.0060,
    latitude: 40.7128,
    mapX: 26,
    mapY: 34
  },
  {
    id: 'sydney',
    name: 'Sydney',
    nameJa: 'シドニー',
    country: 'Australia',
    countryJa: 'オーストラリア',
    timezone: 10,
    longitude: 151.2093,
    latitude: -33.8688,
    mapX: 86,
    mapY: 70
  },
  {
    id: 'paris',
    name: 'Paris',
    nameJa: 'パリ',
    country: 'France',
    countryJa: 'フランス',
    timezone: 1,
    longitude: 2.3522,
    latitude: 48.8566,
    mapX: 51,
    mapY: 27
  },
  {
    id: 'beijing',
    name: 'Beijing',
    nameJa: '北京',
    country: 'China',
    countryJa: '中国',
    timezone: 8,
    longitude: 116.4074,
    latitude: 39.9042,
    mapX: 76,
    mapY: 35
  },
  {
    id: 'moscow',
    name: 'Moscow',
    nameJa: 'モスクワ',
    country: 'Russia',
    countryJa: 'ロシア',
    timezone: 3,
    longitude: 37.6173,
    latitude: 55.7558,
    mapX: 58,
    mapY: 22
  },
  {
    id: 'cairo',
    name: 'Cairo',
    nameJa: 'カイロ',
    country: 'Egypt',
    countryJa: 'エジプト',
    timezone: 2,
    longitude: 31.2357,
    latitude: 30.0444,
    mapX: 56,
    mapY: 42
  },
  {
    id: 'losangeles',
    name: 'Los Angeles',
    nameJa: 'ロサンゼルス',
    country: 'United States',
    countryJa: 'アメリカ',
    timezone: -8,
    longitude: -118.2437,
    latitude: 34.0522,
    mapX: 18,
    mapY: 37
  },
  {
    id: 'rio',
    name: 'Rio de Janeiro',
    nameJa: 'リオデジャネイロ',
    country: 'Brazil',
    countryJa: 'ブラジル',
    timezone: -3,
    longitude: -43.1729,
    latitude: -22.9068,
    mapX: 35,
    mapY: 62
  }
];

// 練習問題用のシナリオ
export interface TimeZoneQuizQuestion {
  id: string;
  baseCityId: string;
  baseTime: { hour: number; minute: number };
  targetCityId: string;
  questionText: string;
  hint: string;
}

export const quizQuestions: TimeZoneQuizQuestion[] = [
  {
    id: 'q1',
    baseCityId: 'tokyo',
    baseTime: { hour: 15, minute: 0 },
    targetCityId: 'london',
    questionText: '東京が午後3時のとき、ロンドンは何時でしょう？',
    hint: '東京とロンドンの時差は9時間です。東京の方が進んでいます。'
  },
  {
    id: 'q2',
    baseCityId: 'newyork',
    baseTime: { hour: 9, minute: 30 },
    targetCityId: 'tokyo',
    questionText: 'ニューヨークが午前9時30分のとき、東京は何時でしょう？',
    hint: 'ニューヨークと東京の時差は14時間です。東京の方が進んでいます。'
  },
  {
    id: 'q3',
    baseCityId: 'paris',
    baseTime: { hour: 20, minute: 0 },
    targetCityId: 'sydney',
    questionText: 'パリが午後8時のとき、シドニーは何時でしょう？',
    hint: 'パリとシドニーの時差は9時間です。シドニーの方が進んでいます。'
  },
  {
    id: 'q4',
    baseCityId: 'beijing',
    baseTime: { hour: 12, minute: 0 },
    targetCityId: 'losangeles',
    questionText: '北京が正午のとき、ロサンゼルスは何時でしょう？',
    hint: '北京とロサンゼルスの時差は16時間です。北京の方が進んでいます。'
  },
  {
    id: 'q5',
    baseCityId: 'moscow',
    baseTime: { hour: 18, minute: 15 },
    targetCityId: 'rio',
    questionText: 'モスクワが午後6時15分のとき、リオデジャネイロは何時でしょう？',
    hint: 'モスクワとリオデジャネイロの時差は6時間です。モスクワの方が進んでいます。'
  }
];