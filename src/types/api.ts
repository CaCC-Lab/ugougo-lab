// API関連の型定義

// APIレスポンスの基本形
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    timestamp: string;
    version: string;
  };
}

// APIエラー
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ページネーション
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 検索パラメータ
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, unknown>;
}

// 認証関連
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  displayName: string;
  gradeLevel?: string;
  parentEmail?: string; // 13歳未満の場合
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}