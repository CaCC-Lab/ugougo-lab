import { useState, useEffect } from 'react';
import type { Theme } from '@mui/material/styles';
import elementaryTheme from '../styles/themes/elementary';
import juniorHighTheme from '../styles/themes/juniorHigh';
import highSchoolTheme from '../styles/themes/highSchool';
import type { GradeLevel } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

// なぜこのフックが必要か：
// 学年に応じて最適なテーマを自動的に選択し、
// ユーザーの選択を記憶することで、一貫した学習体験を提供する

type ThemeMode = 'elementary' | 'juniorHigh' | 'highSchool' | 'auto';

interface UseThemeReturn {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  gradeLevelToTheme: (gradeLevel: GradeLevel) => Theme;
}

export const useTheme = (): UseThemeReturn => {
  // ローカルストレージから保存されたテーマモードを読み込む
  const savedThemeMode = localStorage.getItem(STORAGE_KEYS.THEME_MODE) as ThemeMode | null;
  const [themeMode, setThemeModeState] = useState<ThemeMode>(savedThemeMode || 'auto');

  // 学年レベルからテーマを決定する関数
  // なぜ分離しているか：他のコンポーネントでも学年からテーマを判定できるようにするため
  const gradeLevelToTheme = (gradeLevel: GradeLevel): Theme => {
    if (gradeLevel.startsWith('elementary')) {
      return elementaryTheme;
    } else if (gradeLevel.startsWith('juniorHigh')) {
      return juniorHighTheme;
    } else {
      return highSchoolTheme;
    }
  };

  // 現在のテーマを決定
  const getTheme = (): Theme => {
    switch (themeMode) {
      case 'elementary':
        return elementaryTheme;
      case 'juniorHigh':
        return juniorHighTheme;
      case 'highSchool':
        return highSchoolTheme;
      case 'auto':
        // autoの場合は、ユーザーの学年情報から自動判定
        // TODO: ユーザー情報から学年を取得する処理を追加
        return elementaryTheme; // 仮のデフォルト値
      default:
        return elementaryTheme;
    }
  };

  // テーマモードを設定し、ローカルストレージに保存
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  };

  // テーマモードが変更されたときの処理
  useEffect(() => {
    // 将来的にここでテーマ変更のアナリティクスイベントを送信
  }, [themeMode]);

  return {
    theme: getTheme(),
    themeMode,
    setThemeMode,
    gradeLevelToTheme,
  };
};