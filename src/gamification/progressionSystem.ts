/**
 * マルチレイヤー進歩システム
 * 
 * 複数の軸で学習者の成長を追跡・可視化するシステム
 * 教育心理学の理論に基づき、内発的動機付けを促進する
 */

export interface LearnerLevel {
  // 全体レベル
  overallLevel: number;
  totalXP: number;
  
  // 教科別レベル
  subjectLevels: {
    math: SubjectProgress;
    science: SubjectProgress;
    japanese: SubjectProgress;
    social: SubjectProgress;
    english: SubjectProgress;
  };
  
  // スキル別習熟度
  skillMastery: {
    problemSolving: SkillLevel;
    criticalThinking: SkillLevel;
    creativity: SkillLevel;
    collaboration: SkillLevel;
    communication: SkillLevel;
    persistence: SkillLevel;
  };
}

export interface SubjectProgress {
  level: number;
  xp: number;
  xpToNext: number;
  mastery: number; // 0-100%
  
  // 詳細進捗
  conceptsMastered: string[];
  conceptsInProgress: string[];
  conceptsNotStarted: string[];
  
  // 学習統計
  totalStudyTime: number;
  averageAccuracy: number;
  consecutiveDays: number;
  
  // 成長傾向
  growthTrend: 'accelerating' | 'steady' | 'slowing' | 'plateau';
  lastBreakthrough: Date;
}

export interface SkillLevel {
  currentLevel: number;
  experience: number;
  demonstrations: SkillDemonstration[];
  
  // 能力指標
  consistency: number; // 一貫性
  transferability: number; // 転移可能性
  creativity: number; // 創造性
}

export interface SkillDemonstration {
  materialId: string;
  timestamp: Date;
  skillType: string;
  evidence: any; // 技能発揮の証拠
  qualityScore: number;
}

/**
 * XP計算エンジン
 */
export class ExperienceCalculator {
  // 基本XP計算
  static calculateBaseXP(activity: LearningActivity): number {
    const baseValues = {
      materialCompletion: 100,
      problemSolved: 25,
      conceptMastered: 150,
      helpPeerProvided: 75,
      creativeWork: 200,
      reflection: 50
    };
    
    return baseValues[activity.type] || 0;
  }
  
  // 品質乗数
  static getQualityMultiplier(performance: Performance): number {
    if (performance.accuracy >= 0.95) return 1.5;
    if (performance.accuracy >= 0.85) return 1.2;
    if (performance.accuracy >= 0.70) return 1.0;
    return 0.8;
  }
  
  // 難易度乗数
  static getDifficultyMultiplier(difficulty: string): number {
    const multipliers = {
      'beginner': 1.0,
      'intermediate': 1.3,
      'advanced': 1.6,
      'expert': 2.0
    };
    return multipliers[difficulty] || 1.0;
  }
  
  // 連続学習ボーナス
  static getStreakBonus(consecutiveDays: number): number {
    if (consecutiveDays >= 30) return 2.0;
    if (consecutiveDays >= 14) return 1.5;
    if (consecutiveDays >= 7) return 1.2;
    return 1.0;
  }
  
  // 総合XP計算
  static calculateTotalXP(
    activity: LearningActivity,
    performance: Performance,
    difficulty: string,
    streakDays: number
  ): number {
    const baseXP = this.calculateBaseXP(activity);
    const qualityMultiplier = this.getQualityMultiplier(performance);
    const difficultyMultiplier = this.getDifficultyMultiplier(difficulty);
    const streakBonus = this.getStreakBonus(streakDays);
    
    return Math.round(baseXP * qualityMultiplier * difficultyMultiplier * streakBonus);
  }
}

/**
 * レベルアップ計算
 */
export class LevelCalculator {
  // 次のレベルに必要なXP計算（指数関数的増加）
  static getXPRequiredForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  }
  
  // 累積XPから現在レベルを計算
  static getCurrentLevel(totalXP: number): number {
    let level = 1;
    let requiredXP = 0;
    
    while (requiredXP <= totalXP) {
      level++;
      requiredXP += this.getXPRequiredForLevel(level);
    }
    
    return level - 1;
  }
  
  // 次のレベルまでの残りXP
  static getXPToNextLevel(currentXP: number, currentLevel: number): number {
    const currentLevelStartXP = this.getTotalXPForLevel(currentLevel);
    const nextLevelXP = this.getXPRequiredForLevel(currentLevel + 1);
    
    return nextLevelXP - (currentXP - currentLevelStartXP);
  }
  
  // 指定レベルまでの累積XP
  static getTotalXPForLevel(level: number): number {
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
      totalXP += this.getXPRequiredForLevel(i);
    }
    return totalXP;
  }
}

/**
 * 進歩可視化データ生成
 */
export class ProgressVisualization {
  // スキルレーダーチャート用データ
  static generateSkillRadarData(skillMastery: any): RadarChartData {
    return {
      labels: Object.keys(skillMastery),
      datasets: [{
        label: '現在のスキルレベル',
        data: Object.values(skillMastery).map((skill: any) => skill.currentLevel),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)'
      }]
    };
  }
  
  // 成長トレンドグラフ用データ
  static generateGrowthTrendData(progressHistory: ProgressSnapshot[]): LineChartData {
    return {
      labels: progressHistory.map(snapshot => snapshot.date),
      datasets: [{
        label: '総合レベル',
        data: progressHistory.map(snapshot => snapshot.overallLevel),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  }
  
  // 習熟度ヒートマップ用データ
  static generateMasteryHeatmapData(subjectProgresses: any): HeatmapData {
    const subjects = Object.keys(subjectProgresses);
    const concepts = this.getAllConcepts(subjectProgresses);
    
    return {
      subjects,
      concepts,
      data: subjects.flatMap(subject => 
        concepts.map(concept => ({
          subject,
          concept,
          mastery: this.getConceptMastery(subjectProgresses[subject], concept)
        }))
      )
    };
  }
  
  private static getAllConcepts(subjectProgresses: any): string[] {
    const allConcepts = new Set<string>();
    Object.values(subjectProgresses).forEach((progress: any) => {
      progress.conceptsMastered.forEach((concept: string) => allConcepts.add(concept));
      progress.conceptsInProgress.forEach((concept: string) => allConcepts.add(concept));
      progress.conceptsNotStarted.forEach((concept: string) => allConcepts.add(concept));
    });
    return Array.from(allConcepts);
  }
  
  private static getConceptMastery(subjectProgress: any, concept: string): number {
    if (subjectProgress.conceptsMastered.includes(concept)) return 100;
    if (subjectProgress.conceptsInProgress.includes(concept)) return 50;
    return 0;
  }
}

// 型定義
interface LearningActivity {
  type: 'materialCompletion' | 'problemSolved' | 'conceptMastered' | 'helpPeerProvided' | 'creativeWork' | 'reflection';
  materialId?: string;
  duration?: number;
  metadata?: any;
}

interface Performance {
  accuracy: number;
  speed: number;
  creativity: number;
  effort: number;
}

interface ProgressSnapshot {
  date: string;
  overallLevel: number;
  subjectLevels: any;
  skillMastery: any;
}

interface RadarChartData {
  labels: string[];
  datasets: any[];
}

interface LineChartData {
  labels: string[];
  datasets: any[];
}

interface HeatmapData {
  subjects: string[];
  concepts: string[];
  data: any[];
}