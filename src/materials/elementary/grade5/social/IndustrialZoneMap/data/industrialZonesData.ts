import { IndustrialZone } from '../IndustrialZoneMap';

export const industrialZonesData: IndustrialZone[] = [
  {
    id: 'keihin',
    name: '京浜工業地帯',
    region: '関東地方',
    position: { x: 65, y: 55 },
    cities: ['東京', '横浜', '川崎'],
    mainProducts: ['自動車', '電子機器', '機械', '化学製品'],
    characteristics: [
      '日本最大の工業地帯',
      '首都圏に位置し、消費地に近い',
      '先端技術産業が発達',
      '研究開発機能が集中'
    ],
    productionValue: 48.5,
    industries: {
      automobile: 25,
      electronics: 30,
      machinery: 20,
      chemical: 15,
      food: 10
    }
  },
  {
    id: 'chukyo',
    name: '中京工業地帯',
    region: '中部地方',
    position: { x: 58, y: 58 },
    cities: ['名古屋', '豊田', '四日市'],
    mainProducts: ['自動車', '航空機', '繊維', '陶磁器'],
    characteristics: [
      '自動車産業の中心地',
      'トヨタ自動車の本拠地',
      '航空宇宙産業も発達',
      '伝統産業と先端産業が共存'
    ],
    productionValue: 45.2,
    industries: {
      automobile: 45,
      machinery: 20,
      textile: 10,
      chemical: 15,
      electronics: 10
    }
  },
  {
    id: 'hanshin',
    name: '阪神工業地帯',
    region: '近畿地方',
    position: { x: 55, y: 60 },
    cities: ['大阪', '神戸', '堺'],
    mainProducts: ['機械', '金属', '化学', '繊維'],
    characteristics: [
      '歴史ある工業地帯',
      '中小企業が多い',
      '多様な産業が発達',
      '商業都市大阪を中心に発展'
    ],
    productionValue: 32.8,
    industries: {
      machinery: 25,
      chemical: 20,
      steel: 15,
      textile: 15,
      electronics: 15,
      food: 10
    }
  },
  {
    id: 'kitakyushu',
    name: '北九州工業地帯',
    region: '九州地方',
    position: { x: 45, y: 65 },
    cities: ['北九州', '福岡', '大牟田'],
    mainProducts: ['鉄鋼', '化学', '機械', 'セメント'],
    characteristics: [
      '日本の近代工業発祥の地',
      '八幡製鉄所で有名',
      '重化学工業が中心',
      '環境技術の先進地域'
    ],
    productionValue: 12.5,
    industries: {
      steel: 30,
      chemical: 25,
      machinery: 20,
      automobile: 15,
      food: 10
    }
  },
  {
    id: 'keiyo',
    name: '京葉工業地域',
    region: '関東地方',
    position: { x: 66, y: 56 },
    cities: ['千葉', '市原', '君津'],
    mainProducts: ['石油化学', '鉄鋼', '電力'],
    characteristics: [
      '東京湾岸に位置',
      '石油化学コンビナート',
      '製鉄所が立地',
      '火力発電所も多い'
    ],
    productionValue: 18.3,
    industries: {
      chemical: 40,
      steel: 25,
      machinery: 20,
      food: 15
    }
  },
  {
    id: 'tokai',
    name: '東海工業地域',
    region: '中部地方',
    position: { x: 60, y: 57 },
    cities: ['静岡', '浜松', '富士'],
    mainProducts: ['楽器', 'オートバイ', '製紙', '茶'],
    characteristics: [
      '東名高速道路沿いに発達',
      'ヤマハ・スズキの本拠地',
      '楽器・オートバイ生産で有名',
      '製紙業も盛ん'
    ],
    productionValue: 22.6,
    industries: {
      machinery: 30,
      automobile: 25,
      electronics: 20,
      food: 15,
      chemical: 10
    }
  },
  {
    id: 'hokuriku',
    name: '北陸工業地域',
    region: '北陸地方',
    position: { x: 57, y: 52 },
    cities: ['富山', '金沢', '福井'],
    mainProducts: ['繊維', '機械', '医薬品', '眼鏡'],
    characteristics: [
      '伝統産業が発達',
      '繊維工業の中心地',
      '医薬品産業も盛ん',
      '眼鏡フレームの産地'
    ],
    productionValue: 8.9,
    industries: {
      textile: 30,
      machinery: 25,
      chemical: 20,
      electronics: 15,
      food: 10
    }
  },
  {
    id: 'setouchi',
    name: '瀬戸内工業地域',
    region: '中国地方',
    position: { x: 52, y: 61 },
    cities: ['岡山', '倉敷', '福山', '広島'],
    mainProducts: ['石油化学', '鉄鋼', '造船', '自動車'],
    characteristics: [
      '瀬戸内海沿岸に発達',
      '水島コンビナート',
      '造船業の中心地',
      '穏やかな気候を活用'
    ],
    productionValue: 15.7,
    industries: {
      chemical: 25,
      steel: 20,
      shipbuilding: 20,
      automobile: 20,
      machinery: 15
    }
  }
];