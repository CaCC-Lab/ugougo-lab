/**
 * EnglishSpeakingGym のメタデータ定義
 * materialMetadata.ts に追加するためのコード
 */

import type { MaterialMetadata } from '../types/material';

// 中学1年生の英語カテゴリに追加
export const englishSpeakingGymMetadata: MaterialMetadata = {
  id: 'english-speaking-gym',
  title: '英語スピーキングジム',
  description: '発音から会話まで総合的に学べる英語学習システム！音素レベルの発音練習から実践的な会話まで、段階的にスピーキング力を向上させます。',
  gradeLevel: 'juniorHigh1',
  gradeJapanese: '中学1年生',
  subject: 'english',
  subjectJapanese: '英語',
  category: 'integrated',  // 統合教材として新しいカテゴリ
  status: 'development',  // 開発中
  enabled: false,  // 初期は無効（開発完了後に有効化）
  tags: ['統合教材', '発音', '会話', 'スピーキング', '重要'],
  difficulty: 'normal',
  estimatedTime: 40,  // 各モジュール10分×4想定
  isPremium: false,
  createdAt: '2025-06-29T00:00:00.000Z',
  updatedAt: '2025-06-29T00:00:00.000Z',
  moduleType: 'material',
  // 統合教材としての追加情報
  integratedFrom: ['english-speaking-practice', 'pronunciation-practice'],
  modules: [
    {
      id: 'phonetics',
      name: '基礎発音トレーニング',
      description: '英語の音素を基礎から学習'
    },
    {
      id: 'words',
      name: '単語練習',
      description: '基本単語の発音とスペリング'
    },
    {
      id: 'phrases',
      name: 'フレーズ練習',
      description: '日常的なフレーズの練習'
    },
    {
      id: 'conversation',
      name: '会話シミュレーション',
      description: '実践的な会話練習'
    }
  ]
};

// 旧教材の無効化設定
export const deprecatedMaterialUpdates = [
  {
    id: 'english-speaking-practice',
    updates: {
      enabled: false,
      status: 'deprecated' as const,
      deprecationMessage: 'この教材は「英語スピーキングジム」に統合されました。',
      redirectTo: 'english-speaking-gym'
    }
  },
  {
    id: 'pronunciation-practice',
    updates: {
      enabled: false,
      status: 'deprecated' as const,
      deprecationMessage: 'この教材は「英語スピーキングジム」に統合されました。',
      redirectTo: 'english-speaking-gym'
    }
  }
];

// カテゴリの説明（必要に応じて追加）
export const categoryDescriptions = {
  integrated: '複数の学習要素を統合した総合教材'
};