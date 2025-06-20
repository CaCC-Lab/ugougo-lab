/**
 * 多次元バッジ・アチーブメントシステム
 * 
 * 学習者の多様な成果を認識し、内発的動機付けを促進する
 * 52教材全てに対応した包括的な達成システム
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  icon: string;
  color: string;
  
  // 獲得条件
  criteria: AchievementCriteria;
  
  // 報酬
  rewards: BadgeReward;
  
  // メタデータ
  createdAt: Date;
  isSecret: boolean; // 隠しバッジ
  prerequisites: string[]; // 前提バッジ
  series: string; // バッジシリーズ（例：「算数マスター」シリーズ）
}

export enum BadgeCategory {
  // 学習成果
  ACADEMIC_MASTERY = 'academic_mastery',
  PROBLEM_SOLVING = 'problem_solving',
  CREATIVITY = 'creativity',
  
  // 学習行動
  CONSISTENCY = 'consistency',
  IMPROVEMENT = 'improvement',
  EXPLORATION = 'exploration',
  
  // 社会的行動
  COLLABORATION = 'collaboration',
  MENTORING = 'mentoring',
  COMMUNITY = 'community',
  
  // 特別な達成
  MILESTONE = 'milestone',
  BREAKTHROUGH = 'breakthrough',
  INNOVATION = 'innovation'
}

export enum BadgeRarity {
  COMMON = 'common',     // 緑色、簡単に獲得可能
  UNCOMMON = 'uncommon', // 青色、適度な努力で獲得
  RARE = 'rare',         // 紫色、継続的努力が必要
  EPIC = 'epic',         // オレンジ色、優れた成果
  LEGENDARY = 'legendary' // 金色、卓越した成果
}

export interface AchievementCriteria {
  type: CriteriaType;
  conditions: Condition[];
  timeframe?: TimeFrame;
  repeatability: 'once' | 'multiple' | 'renewable';
}

export enum CriteriaType {
  SIMPLE = 'simple',           // 単一条件
  COMPOUND = 'compound',       // 複数条件の組み合わせ
  SEQUENCE = 'sequence',       // 順序が重要な条件
  ACCUMULATIVE = 'accumulative' // 累積条件
}

export interface Condition {
  metric: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'contains';
  value: any;
  weight?: number; // 複合条件での重み
}

export interface TimeFrame {
  duration: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  rolling: boolean; // 移動期間か固定期間か
}

export interface BadgeReward {
  xpBonus: number;
  title?: string; // 特別な称号
  cosmetics: CosmeticReward[];
  privileges: PrivilegeReward[];
  socialRecognition: SocialReward;
}

export interface CosmeticReward {
  type: 'avatar_item' | 'theme' | 'effect' | 'frame';
  itemId: string;
  duration?: number; // 期間限定か永続か
}

export interface PrivilegeReward {
  type: 'early_access' | 'custom_challenge' | 'mentor_access' | 'skip_option';
  details: any;
}

export interface SocialReward {
  shareableAchievement: boolean;
  leaderboardBoost: number;
  specialMention: boolean;
}

/**
 * 52教材対応バッジ定義
 */
export class BadgeDefinitions {
  // 学習成果バッジ
  static readonly ACADEMIC_BADGES: Badge[] = [
    // 算数・数学バッジ
    {
      id: 'math-first-steps',
      name: '数学の第一歩',
      description: '初めての算数教材を完了しました',
      category: BadgeCategory.ACADEMIC_MASTERY,
      rarity: BadgeRarity.COMMON,
      icon: '🔢',
      color: '#4CAF50',
      criteria: {
        type: CriteriaType.SIMPLE,
        conditions: [{
          metric: 'materials_completed_subject',
          operator: 'equals',
          value: { subject: 'math', count: 1 }
        }],
        repeatability: 'once'
      },
      rewards: {
        xpBonus: 100,
        cosmetics: [],
        privileges: [],
        socialRecognition: { shareableAchievement: true, leaderboardBoost: 0, specialMention: false }
      },
      createdAt: new Date(),
      isSecret: false,
      prerequisites: [],
      series: 'math-mastery'
    },
    
    {
      id: 'fraction-master',
      name: '分数マスター',
      description: '分数の視覚化で90%以上の精度を達成',
      category: BadgeCategory.ACADEMIC_MASTERY,
      rarity: BadgeRarity.RARE,
      icon: '🍰',
      color: '#9C27B0',
      criteria: {
        type: CriteriaType.COMPOUND,
        conditions: [
          {
            metric: 'material_accuracy',
            operator: 'greater_than',
            value: { materialId: 'fraction-visualization', accuracy: 0.9 }
          },
          {
            metric: 'material_completed',
            operator: 'equals',
            value: { materialId: 'fraction-visualization', completed: true }
          }
        ],
        repeatability: 'once'
      },
      rewards: {
        xpBonus: 300,
        title: '分数の達人',
        cosmetics: [{ type: 'avatar_item', itemId: 'math-crown' }],
        privileges: [{ type: 'custom_challenge', details: 'fraction-advanced' }],
        socialRecognition: { shareableAchievement: true, leaderboardBoost: 50, specialMention: true }
      },
      createdAt: new Date(),
      isSecret: false,
      prerequisites: ['math-first-steps'],
      series: 'math-mastery'
    },
    
    // 理科バッジ
    {
      id: 'young-scientist',
      name: '若き科学者',
      description: '3つの理科実験を成功させました',
      category: BadgeCategory.ACADEMIC_MASTERY,
      rarity: BadgeRarity.UNCOMMON,
      icon: '🔬',
      color: '#2196F3',
      criteria: {
        type: CriteriaType.ACCUMULATIVE,
        conditions: [{
          metric: 'experiments_completed',
          operator: 'greater_than',
          value: 3
        }],
        repeatability: 'once'
      },
      rewards: {
        xpBonus: 200,
        cosmetics: [{ type: 'effect', itemId: 'sparkle-effect' }],
        privileges: [],
        socialRecognition: { shareableAchievement: true, leaderboardBoost: 25, specialMention: false }
      },
      createdAt: new Date(),
      isSecret: false,
      prerequisites: [],
      series: 'science-explorer'
    }
  ];
  
  // 学習行動バッジ
  static readonly BEHAVIOR_BADGES: Badge[] = [
    {
      id: 'daily-learner',
      name: '毎日学習者',
      description: '7日連続で学習しました',
      category: BadgeCategory.CONSISTENCY,
      rarity: BadgeRarity.UNCOMMON,
      icon: '📅',
      color: '#FF9800',
      criteria: {
        type: CriteriaType.SIMPLE,
        conditions: [{
          metric: 'consecutive_learning_days',
          operator: 'greater_than',
          value: 7
        }],
        timeframe: { duration: 7, unit: 'days', rolling: true },
        repeatability: 'renewable'
      },
      rewards: {
        xpBonus: 250,
        cosmetics: [{ type: 'frame', itemId: 'consistency-frame' }],
        privileges: [{ type: 'skip_option', details: 'daily-challenge-skip' }],
        socialRecognition: { shareableAchievement: true, leaderboardBoost: 30, specialMention: false }
      },
      createdAt: new Date(),
      isSecret: false,
      prerequisites: [],
      series: 'consistency'
    },
    
    {
      id: 'speed-learner',
      name: 'スピード学習者',
      description: '平均の2倍の速度で教材を完了',
      category: BadgeCategory.IMPROVEMENT,
      rarity: BadgeRarity.RARE,
      icon: '⚡',
      color: '#FFC107',
      criteria: {
        type: CriteriaType.COMPOUND,
        conditions: [
          {
            metric: 'completion_speed_ratio',
            operator: 'greater_than',
            value: 2.0
          },
          {
            metric: 'accuracy_maintained',
            operator: 'greater_than',
            value: 0.8
          }
        ],
        repeatability: 'multiple'
      },
      rewards: {
        xpBonus: 400,
        title: 'スピードマスター',
        cosmetics: [{ type: 'effect', itemId: 'lightning-effect' }],
        privileges: [{ type: 'early_access', details: 'advanced-materials' }],
        socialRecognition: { shareableAchievement: true, leaderboardBoost: 75, specialMention: true }
      },
      createdAt: new Date(),
      isSecret: false,
      prerequisites: [],
      series: 'excellence'
    }
  ];
  
  // 社会的バッジ
  static readonly SOCIAL_BADGES: Badge[] = [
    {
      id: 'helpful-peer',
      name: '頼れる仲間',
      description: '5人の学習を支援しました',
      category: BadgeCategory.COLLABORATION,
      rarity: BadgeRarity.RARE,
      icon: '🤝',
      color: '#E91E63',
      criteria: {
        type: CriteriaType.ACCUMULATIVE,
        conditions: [{
          metric: 'peers_helped',
          operator: 'greater_than',
          value: 5
        }],
        repeatability: 'renewable'
      },
      rewards: {
        xpBonus: 350,
        title: 'ヘルパー',
        cosmetics: [{ type: 'avatar_item', itemId: 'helper-badge' }],
        privileges: [{ type: 'mentor_access', details: 'junior-mentor-role' }],
        socialRecognition: { shareableAchievement: true, leaderboardBoost: 100, specialMention: true }
      },
      createdAt: new Date(),
      isSecret: false,
      prerequisites: [],
      series: 'social-impact'
    }
  ];
  
  // 特別・隠しバッジ
  static readonly SECRET_BADGES: Badge[] = [
    {
      id: 'easter-egg-hunter',
      name: 'イースターエッグハンター',
      description: '隠された秘密を発見しました',
      category: BadgeCategory.EXPLORATION,
      rarity: BadgeRarity.LEGENDARY,
      icon: '🥚',
      color: '#FFD700',
      criteria: {
        type: CriteriaType.SIMPLE,
        conditions: [{
          metric: 'easter_eggs_found',
          operator: 'greater_than',
          value: 1
        }],
        repeatability: 'multiple'
      },
      rewards: {
        xpBonus: 1000,
        title: '探検家',
        cosmetics: [
          { type: 'avatar_item', itemId: 'explorer-hat' },
          { type: 'theme', itemId: 'mystery-theme' }
        ],
        privileges: [{ type: 'early_access', details: 'beta-features' }],
        socialRecognition: { shareableAchievement: true, leaderboardBoost: 200, specialMention: true }
      },
      createdAt: new Date(),
      isSecret: true,
      prerequisites: [],
      series: 'mystery'
    }
  ];
  
  // 全バッジを取得
  static getAllBadges(): Badge[] {
    return [
      ...this.ACADEMIC_BADGES,
      ...this.BEHAVIOR_BADGES,
      ...this.SOCIAL_BADGES,
      ...this.SECRET_BADGES
    ];
  }
  
  // カテゴリ別バッジ取得
  static getBadgesByCategory(category: BadgeCategory): Badge[] {
    return this.getAllBadges().filter(badge => badge.category === category);
  }
  
  // レアリティ別バッジ取得
  static getBadgesByRarity(rarity: BadgeRarity): Badge[] {
    return this.getAllBadges().filter(badge => badge.rarity === rarity);
  }
}

/**
 * アチーブメント評価エンジン
 */
export class AchievementEvaluator {
  // 条件評価
  static evaluateCondition(condition: Condition, userData: any): boolean {
    const userValue = this.extractUserValue(userData, condition.metric);
    
    switch (condition.operator) {
      case 'equals':
        return this.deepEquals(userValue, condition.value);
      case 'greater_than':
        return userValue > condition.value;
      case 'less_than':
        return userValue < condition.value;
      case 'between':
        return userValue >= condition.value.min && userValue <= condition.value.max;
      case 'contains':
        return Array.isArray(userValue) && userValue.includes(condition.value);
      default:
        return false;
    }
  }
  
  // 複合条件評価
  static evaluateCriteria(criteria: AchievementCriteria, userData: any): boolean {
    switch (criteria.type) {
      case CriteriaType.SIMPLE:
        return criteria.conditions.every(condition => 
          this.evaluateCondition(condition, userData)
        );
        
      case CriteriaType.COMPOUND:
        return this.evaluateCompoundConditions(criteria.conditions, userData);
        
      case CriteriaType.SEQUENCE:
        return this.evaluateSequentialConditions(criteria.conditions, userData);
        
      case CriteriaType.ACCUMULATIVE:
        return this.evaluateAccumulativeConditions(criteria.conditions, userData);
        
      default:
        return false;
    }
  }
  
  // バッジ獲得チェック
  static checkBadgeEligibility(badge: Badge, userData: any): boolean {
    // 前提条件チェック
    if (!this.checkPrerequisites(badge.prerequisites, userData.earnedBadges)) {
      return false;
    }
    
    // 既に獲得済みかチェック
    if (badge.criteria.repeatability === 'once' && 
        userData.earnedBadges.includes(badge.id)) {
      return false;
    }
    
    // 時間枠チェック
    if (badge.criteria.timeframe && 
        !this.checkTimeFrame(badge.criteria.timeframe, userData)) {
      return false;
    }
    
    // メイン条件評価
    return this.evaluateCriteria(badge.criteria, userData);
  }
  
  // 新規獲得バッジを検出
  static detectNewBadges(allBadges: Badge[], userData: any): Badge[] {
    return allBadges.filter(badge => 
      this.checkBadgeEligibility(badge, userData) &&
      !userData.earnedBadges.includes(badge.id)
    );
  }
  
  // プライベートヘルパーメソッド
  private static extractUserValue(userData: any, metric: string): any {
    const keys = metric.split('.');
    let value = userData;
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
  
  private static deepEquals(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  
  private static evaluateCompoundConditions(conditions: Condition[], userData: any): boolean {
    const totalWeight = conditions.reduce((sum, condition) => sum + (condition.weight || 1), 0);
    const achievedWeight = conditions.reduce((sum, condition) => {
      const weight = condition.weight || 1;
      return this.evaluateCondition(condition, userData) ? sum + weight : sum;
    }, 0);
    
    return achievedWeight / totalWeight >= 0.8; // 80%以上の条件を満たす
  }
  
  private static evaluateSequentialConditions(conditions: Condition[], userData: any): boolean {
    // 順序が重要な条件の評価（実装の詳細は省略）
    return conditions.every(condition => this.evaluateCondition(condition, userData));
  }
  
  private static evaluateAccumulativeConditions(conditions: Condition[], userData: any): boolean {
    // 累積条件の評価
    return conditions.every(condition => this.evaluateCondition(condition, userData));
  }
  
  private static checkPrerequisites(prerequisites: string[], earnedBadges: string[]): boolean {
    return prerequisites.every(prerequisite => earnedBadges.includes(prerequisite));
  }
  
  private static checkTimeFrame(timeframe: TimeFrame, userData: any): boolean {
    // 時間枠内での条件評価（実装の詳細は省略）
    return true;
  }
}

/**
 * バッジ通知システム
 */
export class BadgeNotificationSystem {
  static generateNotification(badge: Badge): BadgeNotification {
    return {
      id: `notification-${badge.id}-${Date.now()}`,
      badgeId: badge.id,
      type: this.getNotificationType(badge.rarity),
      title: `新しいバッジを獲得！`,
      message: `「${badge.name}」を獲得しました！`,
      animation: this.getAnimation(badge.rarity),
      sound: this.getSound(badge.rarity),
      displayDuration: this.getDisplayDuration(badge.rarity),
      timestamp: new Date()
    };
  }
  
  private static getNotificationType(rarity: BadgeRarity): NotificationType {
    switch (rarity) {
      case BadgeRarity.LEGENDARY: return 'celebration';
      case BadgeRarity.EPIC: return 'spectacular';
      case BadgeRarity.RARE: return 'impressive';
      case BadgeRarity.UNCOMMON: return 'notable';
      default: return 'standard';
    }
  }
  
  private static getAnimation(rarity: BadgeRarity): string {
    switch (rarity) {
      case BadgeRarity.LEGENDARY: return 'golden-explosion';
      case BadgeRarity.EPIC: return 'rainbow-burst';
      case BadgeRarity.RARE: return 'purple-glow';
      case BadgeRarity.UNCOMMON: return 'blue-shine';
      default: return 'simple-glow';
    }
  }
  
  private static getSound(rarity: BadgeRarity): string {
    switch (rarity) {
      case BadgeRarity.LEGENDARY: return 'legendary-fanfare';
      case BadgeRarity.EPIC: return 'epic-chime';
      case BadgeRarity.RARE: return 'achievement-bell';
      case BadgeRarity.UNCOMMON: return 'success-ding';
      default: return 'gentle-ping';
    }
  }
  
  private static getDisplayDuration(rarity: BadgeRarity): number {
    switch (rarity) {
      case BadgeRarity.LEGENDARY: return 8000; // 8秒
      case BadgeRarity.EPIC: return 6000; // 6秒
      case BadgeRarity.RARE: return 4000; // 4秒
      case BadgeRarity.UNCOMMON: return 3000; // 3秒
      default: return 2000; // 2秒
    }
  }
}

// 型定義
interface BadgeNotification {
  id: string;
  badgeId: string;
  type: NotificationType;
  title: string;
  message: string;
  animation: string;
  sound: string;
  displayDuration: number;
  timestamp: Date;
}

type NotificationType = 'standard' | 'notable' | 'impressive' | 'spectacular' | 'celebration';