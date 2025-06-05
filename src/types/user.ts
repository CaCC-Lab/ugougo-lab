// ユーザーに関する型定義

import type { GradeLevel } from './material';

// ユーザーロール
export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

// サブスクリプションステータス
export type SubscriptionStatus = 'free' | 'premium' | 'expired';

// ユーザー基本情報
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  gradeLevel?: GradeLevel; // 生徒の場合
  avatarUrl?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// ユーザープロファイル
export interface UserProfile extends User {
  subscription: {
    status: SubscriptionStatus;
    expiresAt?: Date;
    planId?: string;
  };
  preferences: UserPreferences;
  parentEmail?: string; // 13歳未満の場合
}

// ユーザー設定
export interface UserPreferences {
  theme: 'elementary' | 'juniorHigh' | 'highSchool' | 'auto';
  language: 'ja' | 'en';
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  colorMode?: 'normal' | 'highContrast' | 'colorBlind';
}

// 認証状態
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}