/**
 * マウス練習機能統合版 都道府県パズル
 */

import React from 'react';
import PrefecturePuzzle from '../PrefecturePuzzle';
import { withMousePractice } from './withMousePractice';
import { MouseSkillLevel } from '../../types/mouse-practice';

/**
 * マウス練習機能付き都道府県パズル
 */
const PrefecturePuzzleWithPractice = withMousePractice(PrefecturePuzzle, {
  requiredSkillLevel: MouseSkillLevel.INTERMEDIATE,
  practiceTaskType: 'drag',
});

export default PrefecturePuzzleWithPractice;