// アプリケーション全体で使用する定数

// 学年レベルの表示名
export const GRADE_LEVEL_LABELS = {
  elementary1: '小学1年生',
  elementary2: '小学2年生',
  elementary3: '小学3年生',
  elementary4: '小学4年生',
  elementary5: '小学5年生',
  elementary6: '小学6年生',
  juniorHigh1: '中学1年生',
  juniorHigh2: '中学2年生',
  juniorHigh3: '中学3年生',
  highSchool1: '高校1年生',
  highSchool2: '高校2年生',
  highSchool3: '高校3年生',
} as const;

// 教科の表示名
export const SUBJECT_LABELS = {
  math: '算数・数学',
  japanese: '国語',
  english: '英語',
  science: '理科',
  social: '社会',
  life: '生活',
  physics: '物理',
  chemistry: '化学',
  biology: '生物',
} as const;

// 難易度の表示名
export const DIFFICULTY_LABELS = {
  easy: 'かんたん',
  normal: 'ふつう',
  hard: 'むずかしい',
} as const;

// サブスクリプションプラン
export const SUBSCRIPTION_PLANS = {
  free: {
    name: '無料プラン',
    price: 0,
    features: [
      '各学年・教科の代表的な教材',
      '基本機能のみ',
      '広告表示あり',
    ],
  },
  premium: {
    name: 'プレミアムプラン',
    price: 500,
    features: [
      'すべての教材が利用可能',
      '学習履歴の保存',
      '広告なし',
      'オフライン利用可能',
      '複数デバイス同期',
    ],
  },
} as const;

// ローカルストレージのキー
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME_MODE: 'theme_mode',
} as const;

// APIエンドポイント
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    PROGRESS: '/user/progress',
  },
  MATERIALS: {
    LIST: '/materials',
    DETAIL: (id: string) => `/materials/${id}`,
    SEARCH: '/materials/search',
  },
  SUBSCRIPTION: {
    STATUS: '/subscription/status',
    UPGRADE: '/subscription/upgrade',
    CANCEL: '/subscription/cancel',
  },
} as const;

// アニメーション設定
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

// 学習時間の閾値（秒）
export const LEARNING_TIME_THRESHOLD = {
  MIN_SESSION: 60, // 最小セッション時間
  MAX_SESSION: 3600, // 最大セッション時間（1時間）
  IDLE_TIMEOUT: 300, // アイドルタイムアウト（5分）
} as const;