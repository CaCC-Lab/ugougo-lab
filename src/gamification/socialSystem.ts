/**
 * ソーシャル学習・競争システム
 * 
 * 協力学習、健全な競争、コミュニティ形成を通じて
 * 学習意欲と社会性を同時に育成するシステム
 */

export interface SocialLearner {
  id: string;
  displayName: string;
  avatar: Avatar;
  level: number;
  
  // プロファイル
  grade: string;
  interests: string[];
  strengths: string[];
  learningStyle: LearningStyle;
  
  // ソーシャル情報
  friends: string[];
  studyGroups: string[];
  mentorshipRelations: MentorshipRelation[];
  
  // 評判システム
  reputation: Reputation;
  contributions: Contribution[];
  
  // プライバシー設定
  privacySettings: PrivacySettings;
}

export interface Avatar {
  baseCharacter: string;
  customizations: AvatarCustomization[];
  expressions: Expression[];
  outfits: Outfit[];
  accessories: Accessory[];
  
  // アニメーション
  animations: Animation[];
  currentMood: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  creator: string;
  members: GroupMember[];
  
  // 設定
  maxMembers: number;
  isPrivate: boolean;
  gradeLevel: string[];
  subjects: string[];
  
  // 活動
  currentChallenges: GroupChallenge[];
  completedActivities: GroupActivity[];
  schedule: StudySession[];
  
  // 進捗
  groupProgress: GroupProgress;
  achievements: GroupAchievement[];
  
  // メタデータ
  createdAt: Date;
  lastActivity: Date;
  activityLevel: ActivityLevel;
}

export interface GroupMember {
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  contribution: number;
  lastSeen: Date;
  
  // ステータス
  isOnline: boolean;
  currentActivity?: string;
  helpRequests: HelpRequest[];
}

export enum GroupRole {
  LEADER = 'leader',
  MENTOR = 'mentor',
  MEMBER = 'member',
  NEWCOMER = 'newcomer'
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  category: ChallengeCategory;
  
  // 参加者
  participants: Participant[];
  maxParticipants?: number;
  
  // 期間
  startDate: Date;
  endDate: Date;
  duration: number; // 分
  
  // 条件と報酬
  objectives: ChallengeObjective[];
  rewards: ChallengeReward[];
  
  // 進行状況
  status: ChallengeStatus;
  leaderboard: LeaderboardEntry[];
  
  // ソーシャル要素
  teamBased: boolean;
  collaborationRequired: boolean;
  peerReviewEnabled: boolean;
}

export enum ChallengeType {
  SPEED_LEARNING = 'speed_learning',
  ACCURACY_CONTEST = 'accuracy_contest',
  CREATIVITY_SHOWCASE = 'creativity_showcase',
  COLLABORATION_PROJECT = 'collaboration_project',
  KNOWLEDGE_QUIZ = 'knowledge_quiz',
  PROBLEM_SOLVING = 'problem_solving',
  PEER_TEACHING = 'peer_teaching',
  RESEARCH_QUEST = 'research_quest'
}

export enum ChallengeDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  LEGENDARY = 'legendary'
}

export interface Leaderboard {
  id: string;
  name: string;
  type: LeaderboardType;
  timeframe: TimeFrame;
  category: string;
  
  // エントリー
  entries: LeaderboardEntry[];
  updateFrequency: number; // 分
  lastUpdated: Date;
  
  // フィルタリング
  filters: LeaderboardFilter[];
  groupBy: string[];
  
  // 表示設定
  displaySettings: DisplaySettings;
  privacyLevel: PrivacyLevel;
}

export enum LeaderboardType {
  INDIVIDUAL_XP = 'individual_xp',
  SUBJECT_MASTERY = 'subject_mastery',
  LEARNING_STREAK = 'learning_streak',
  HELP_PROVIDED = 'help_provided',
  CREATIVITY_SCORE = 'creativity_score',
  COLLABORATION_RATING = 'collaboration_rating',
  GROUP_ACHIEVEMENT = 'group_achievement',
  IMPROVEMENT_RATE = 'improvement_rate'
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: string;
  score: number;
  
  // 詳細情報
  breakdown: ScoreBreakdown;
  trend: Trend;
  
  // 表彰
  badges: string[];
  specialRecognition?: string;
  
  // ソーシャル情報
  isFriend: boolean;
  isGroupMember: boolean;
}

/**
 * ソーシャル学習コーディネーター
 */
export class SocialLearningCoordinator {
  // 最適な学習パートナーを見つける
  static findLearningPartners(
    learner: SocialLearner,
    criteria: PartnerCriteria
  ): SocialLearner[] {
    const candidates = this.getCandidatePartners(learner, criteria);
    
    return candidates
      .map(candidate => ({
        candidate,
        compatibility: this.calculateCompatibility(learner, candidate, criteria)
      }))
      .filter(item => item.compatibility > 0.6) // 60%以上の相性
      .sort((a, b) => b.compatibility - a.compatibility)
      .map(item => item.candidate)
      .slice(0, criteria.maxResults || 5);
  }
  
  // 協力学習セッションを調整
  static coordinateCollaborativeSession(
    participants: SocialLearner[],
    subject: string,
    duration: number
  ): CollaborativeSession {
    // 参加者の強みと弱みを分析
    const strengthsAnalysis = this.analyzeGroupStrengths(participants);
    const weaknessesAnalysis = this.analyzeGroupWeaknesses(participants);
    
    // 最適な学習活動を選択
    const activities = this.selectOptimalActivities(
      strengthsAnalysis,
      weaknessesAnalysis,
      subject,
      duration
    );
    
    // 役割分担を決定
    const roleAssignments = this.assignRoles(participants, activities);
    
    return {
      id: `session-${Date.now()}`,
      participants: participants.map(p => p.id),
      activities,
      roleAssignments,
      estimatedDuration: duration,
      difficultyLevel: this.calculateOptimalDifficulty(participants),
      collaborationTools: this.selectCollaborationTools(activities),
      successMetrics: this.defineSuccessMetrics(activities),
      scheduledTime: new Date(),
      status: 'planned'
    };
  }
  
  // ピアサポートのマッチング
  static matchPeerSupport(
    helpSeeker: SocialLearner,
    subject: string,
    specificTopic?: string
  ): PeerSupportMatch[] {
    const potentialHelpers = this.findPotentialHelpers(helpSeeker, subject, specificTopic);
    
    return potentialHelpers.map(helper => ({
      helper,
      matchScore: this.calculateHelpMatchScore(helpSeeker, helper, subject, specificTopic),
      availability: this.checkAvailability(helper),
      teachingStyle: this.analyzeTeachingStyle(helper),
      successRate: this.calculateHelpSuccessRate(helper, subject),
      reviewsFromHelpees: this.getRecentReviews(helper.id)
    }))
    .filter(match => match.matchScore > 0.7)
    .sort((a, b) => b.matchScore - a.matchScore);
  }
  
  // 学習グループの自動最適化
  static optimizeStudyGroup(group: StudyGroup): GroupOptimization {
    const currentPerformance = this.analyzeGroupPerformance(group);
    const recommendations: OptimizationRecommendation[] = [];
    
    // メンバー構成の分析
    const memberAnalysis = this.analyzeMemberComposition(group);
    if (memberAnalysis.needsDiversity) {
      recommendations.push({
        type: 'member_diversity',
        description: '異なる学習スタイルのメンバーを追加することをお勧めします',
        suggestedActions: this.suggestDiversityActions(memberAnalysis),
        priority: 'medium'
      });
    }
    
    // 活動バランスの分析
    const activityBalance = this.analyzeActivityBalance(group);
    if (activityBalance.needsRebalancing) {
      recommendations.push({
        type: 'activity_balance',
        description: '協力学習と個人学習のバランスを調整しましょう',
        suggestedActions: this.suggestActivityRebalancing(activityBalance),
        priority: 'high'
      });
    }
    
    // リーダーシップの分析
    const leadershipAnalysis = this.analyzeLeadership(group);
    if (leadershipAnalysis.needsImprovement) {
      recommendations.push({
        type: 'leadership',
        description: 'リーダーシップの分散が効果的です',
        suggestedActions: this.suggestLeadershipImprovements(leadershipAnalysis),
        priority: 'medium'
      });
    }
    
    return {
      currentScore: currentPerformance.overallScore,
      potentialScore: this.calculatePotentialScore(currentPerformance, recommendations),
      recommendations,
      implementationPlan: this.createImplementationPlan(recommendations)
    };
  }
  
  // プライベートヘルパーメソッド
  private static getCandidatePartners(
    learner: SocialLearner,
    criteria: PartnerCriteria
  ): SocialLearner[] {
    // データベースから候補者を取得（実装は省略）
    return [];
  }
  
  private static calculateCompatibility(
    learner: SocialLearner,
    candidate: SocialLearner,
    criteria: PartnerCriteria
  ): number {
    let compatibility = 0;
    
    // 学年の近さ
    const gradeCompatibility = this.calculateGradeCompatibility(learner.grade, candidate.grade);
    compatibility += gradeCompatibility * 0.3;
    
    // 興味の重複
    const interestOverlap = this.calculateInterestOverlap(learner.interests, candidate.interests);
    compatibility += interestOverlap * 0.25;
    
    // 学習スタイルの相性
    const styleCompatibility = this.calculateStyleCompatibility(
      learner.learningStyle,
      candidate.learningStyle
    );
    compatibility += styleCompatibility * 0.2;
    
    // 補完的な強み
    const strengthsComplement = this.calculateStrengthsComplement(
      learner.strengths,
      candidate.strengths
    );
    compatibility += strengthsComplement * 0.25;
    
    return Math.min(compatibility, 1.0);
  }
  
  private static calculateGradeCompatibility(grade1: string, grade2: string): number {
    // 学年差による相性計算
    const gradeNumbers = { '1年': 1, '2年': 2, '3年': 3, '4年': 4, '5年': 5, '6年': 6 };
    const diff = Math.abs(gradeNumbers[grade1] - gradeNumbers[grade2]);
    return Math.max(0, 1 - diff * 0.2);
  }
  
  private static calculateInterestOverlap(interests1: string[], interests2: string[]): number {
    const overlap = interests1.filter(interest => interests2.includes(interest)).length;
    const total = new Set([...interests1, ...interests2]).size;
    return total > 0 ? overlap / total : 0;
  }
  
  private static calculateStyleCompatibility(style1: LearningStyle, style2: LearningStyle): number {
    // 学習スタイルの相性計算（実装は省略）
    return 0.8;
  }
  
  private static calculateStrengthsComplement(strengths1: string[], strengths2: string[]): number {
    // 補完的な強みの計算（実装は省略）
    return 0.7;
  }
  
  private static analyzeGroupStrengths(participants: SocialLearner[]): GroupStrengthsAnalysis {
    const allStrengths = participants.flatMap(p => p.strengths);
    const strengthCounts = this.countOccurrences(allStrengths);
    
    return {
      dominantStrengths: Object.keys(strengthCounts)
        .sort((a, b) => strengthCounts[b] - strengthCounts[a])
        .slice(0, 3),
      coverageScore: this.calculateStrengthCoverage(strengthCounts),
      balanceScore: this.calculateStrengthBalance(strengthCounts)
    };
  }
  
  private static analyzeGroupWeaknesses(participants: SocialLearner[]): GroupWeaknessesAnalysis {
    // グループの弱点分析（実装は省略）
    return {
      commonWeaknesses: [],
      coverageGaps: [],
      supportNeeds: []
    };
  }
  
  private static selectOptimalActivities(
    strengths: GroupStrengthsAnalysis,
    weaknesses: GroupWeaknessesAnalysis,
    subject: string,
    duration: number
  ): Activity[] {
    // 最適な活動選択（実装は省略）
    return [];
  }
  
  private static assignRoles(participants: SocialLearner[], activities: Activity[]): RoleAssignment[] {
    // 役割分担の決定（実装は省略）
    return [];
  }
  
  private static calculateOptimalDifficulty(participants: SocialLearner[]): string {
    const avgLevel = participants.reduce((sum, p) => sum + p.level, 0) / participants.length;
    if (avgLevel < 3) return 'beginner';
    if (avgLevel < 6) return 'intermediate';
    if (avgLevel < 9) return 'advanced';
    return 'expert';
  }
  
  private static selectCollaborationTools(activities: Activity[]): CollaborationTool[] {
    // 協力学習ツールの選択（実装は省略）
    return [];
  }
  
  private static defineSuccessMetrics(activities: Activity[]): SuccessMetric[] {
    // 成功指標の定義（実装は省略）
    return [];
  }
  
  private static findPotentialHelpers(
    helpSeeker: SocialLearner,
    subject: string,
    specificTopic?: string
  ): SocialLearner[] {
    // 潜在的ヘルパーの検索（実装は省略）
    return [];
  }
  
  private static calculateHelpMatchScore(
    helpSeeker: SocialLearner,
    helper: SocialLearner,
    subject: string,
    specificTopic?: string
  ): number {
    // ヘルプマッチスコアの計算（実装は省略）
    return 0.8;
  }
  
  private static checkAvailability(helper: SocialLearner): Availability {
    // 利用可能性のチェック（実装は省略）
    return {
      isCurrentlyOnline: true,
      nextAvailableTime: new Date(),
      preferredHelpTimes: []
    };
  }
  
  private static analyzeTeachingStyle(helper: SocialLearner): TeachingStyle {
    // 教育スタイルの分析（実装は省略）
    return {
      approach: 'patient',
      communicationStyle: 'visual',
      effectiveness: 0.85
    };
  }
  
  private static calculateHelpSuccessRate(helper: SocialLearner, subject: string): number {
    // ヘルプ成功率の計算（実装は省略）
    return 0.9;
  }
  
  private static getRecentReviews(helperId: string): Review[] {
    // 最近のレビューを取得（実装は省略）
    return [];
  }
  
  private static analyzeGroupPerformance(group: StudyGroup): GroupPerformanceAnalysis {
    // グループパフォーマンスの分析（実装は省略）
    return {
      overallScore: 0.8,
      learningEfficiency: 0.75,
      memberSatisfaction: 0.85,
      collaborationQuality: 0.9
    };
  }
  
  private static analyzeMemberComposition(group: StudyGroup): MemberCompositionAnalysis {
    // メンバー構成の分析（実装は省略）
    return {
      needsDiversity: false,
      strengthsDistribution: {},
      learningStyleBalance: {}
    };
  }
  
  private static analyzeActivityBalance(group: StudyGroup): ActivityBalanceAnalysis {
    // 活動バランスの分析（実装は省略）
    return {
      needsRebalancing: false,
      currentBalance: {},
      optimalBalance: {}
    };
  }
  
  private static analyzeLeadership(group: StudyGroup): LeadershipAnalysis {
    // リーダーシップの分析（実装は省略）
    return {
      needsImprovement: false,
      currentDistribution: {},
      recommendedChanges: []
    };
  }
  
  private static calculatePotentialScore(
    currentPerformance: GroupPerformanceAnalysis,
    recommendations: OptimizationRecommendation[]
  ): number {
    // 潜在的スコアの計算（実装は省略）
    return currentPerformance.overallScore + 0.1;
  }
  
  private static createImplementationPlan(
    recommendations: OptimizationRecommendation[]
  ): ImplementationPlan {
    // 実装計画の作成（実装は省略）
    return {
      phases: [],
      timeline: {},
      resources: []
    };
  }
  
  private static countOccurrences(items: string[]): Record<string, number> {
    return items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
  
  private static calculateStrengthCoverage(strengthCounts: Record<string, number>): number {
    // 強みのカバレッジ計算（実装は省略）
    return 0.8;
  }
  
  private static calculateStrengthBalance(strengthCounts: Record<string, number>): number {
    // 強みのバランス計算（実装は省略）
    return 0.7;
  }
  
  private static suggestDiversityActions(analysis: MemberCompositionAnalysis): string[] {
    return ['異なる学習スタイルのメンバーを募集', '新しい強みを持つメンバーを探す'];
  }
  
  private static suggestActivityRebalancing(analysis: ActivityBalanceAnalysis): string[] {
    return ['個人学習時間を増やす', '協力プロジェクトを追加'];
  }
  
  private static suggestLeadershipImprovements(analysis: LeadershipAnalysis): string[] {
    return ['ローテーションリーダー制の導入', 'メンタリング役割の分散'];
  }
}

/**
 * 健全な競争システム
 */
export class HealthyCompetitionSystem {
  // 個人に適した競争レベルを決定
  static determineOptimalCompetitionLevel(learner: SocialLearner): CompetitionLevel {
    const personality = this.analyzeCompetitivePersonality(learner);
    const currentStress = this.assessCurrentStressLevel(learner);
    const socialComfort = this.assessSocialComfort(learner);
    
    if (personality.competitiveness > 0.8 && currentStress < 0.3 && socialComfort > 0.7) {
      return CompetitionLevel.HIGH;
    } else if (personality.competitiveness > 0.5 && currentStress < 0.5) {
      return CompetitionLevel.MEDIUM;
    } else if (socialComfort > 0.5) {
      return CompetitionLevel.LOW;
    } else {
      return CompetitionLevel.COOPERATIVE_ONLY;
    }
  }
  
  // バランスの取れたチャレンジを生成
  static generateBalancedChallenge(
    participants: SocialLearner[],
    subject: string,
    duration: number
  ): BalancedChallenge {
    // 参加者の能力レベルを分析
    const skillAnalysis = this.analyzeParticipantSkills(participants, subject);
    
    // ハンディキャップシステムを設計
    const handicapSystem = this.designHandicapSystem(skillAnalysis);
    
    // 協力要素を組み込む
    const collaborativeElements = this.designCollaborativeElements(participants);
    
    return {
      id: `challenge-${Date.now()}`,
      type: ChallengeType.PROBLEM_SOLVING,
      title: this.generateChallengeTitle(subject),
      description: this.generateChallengeDescription(subject, collaborativeElements),
      
      // バランス調整
      handicapSystem,
      collaborativeElements,
      multipleWinCategories: this.defineMultipleWinCategories(),
      
      // 時間設定
      duration,
      flexibleDeadline: true,
      
      // 報酬システム
      rewards: this.designInclusiveRewards(participants.length),
      recognitionSystem: this.designRecognitionSystem()
    };
  }
  
  // ポジティブな競争文化の促進
  static promotePositiveCompetition(group: StudyGroup): CompetitionCulture {
    return {
      values: [
        '相手を尊重する',
        '一緒に成長する',
        '努力を称賛する',
        '失敗から学ぶ',
        'サポートし合う'
      ],
      practices: [
        'Good Game メッセージの交換',
        '相手の良いプレーを称賛',
        '学習方法のシェア',
        '困った時の助け合い'
      ],
      rituals: [
        'チャレンジ前の健闘を祈る挨拶',
        'チャレンジ後の振り返りセッション',
        '月間MVP（Most Valuable Partner）の選出'
      ],
      monitoring: {
        toxicBehaviorDetection: true,
        positiveInteractionRewards: true,
        culturalHealthMetrics: this.defineCulturalHealthMetrics()
      }
    };
  }
  
  private static analyzeCompetitivePersonality(learner: SocialLearner): CompetitivePersonality {
    // 競争的性格の分析（実装は省略）
    return {
      competitiveness: 0.6,
      cooperativeness: 0.8,
      riskTolerance: 0.5,
      socialSensitivity: 0.7
    };
  }
  
  private static assessCurrentStressLevel(learner: SocialLearner): number {
    // 現在のストレスレベル評価（実装は省略）
    return 0.3;
  }
  
  private static assessSocialComfort(learner: SocialLearner): number {
    // 社会的快適性の評価（実装は省略）
    return 0.8;
  }
  
  private static analyzeParticipantSkills(participants: SocialLearner[], subject: string): SkillAnalysis {
    // 参加者のスキル分析（実装は省略）
    return {
      skillLevels: {},
      strengthsDistribution: {},
      learningPaces: {}
    };
  }
  
  private static designHandicapSystem(skillAnalysis: SkillAnalysis): HandicapSystem {
    // ハンディキャップシステムの設計（実装は省略）
    return {
      type: 'time_bonus',
      adjustments: {},
      fairnessScore: 0.9
    };
  }
  
  private static designCollaborativeElements(participants: SocialLearner[]): CollaborativeElement[] {
    // 協力要素の設計（実装は省略）
    return [];
  }
  
  private static generateChallengeTitle(subject: string): string {
    const titles = {
      math: '数学の冒険チャレンジ',
      science: '科学探検隊',
      japanese: '言葉の達人への道'
    };
    return titles[subject] || '学習チャレンジ';
  }
  
  private static generateChallengeDescription(subject: string, elements: CollaborativeElement[]): string {
    return `${subject}の知識を使って、仲間と協力しながら問題を解決しよう！`;
  }
  
  private static defineMultipleWinCategories(): WinCategory[] {
    return [
      { name: '最速解答', description: '一番早く正解にたどり着いた人' },
      { name: '最優秀説明', description: '最もわかりやすく説明した人' },
      { name: 'ベストサポート', description: '仲間を最もよく助けた人' },
      { name: '創意工夫賞', description: '最も創造的なアプローチをした人' }
    ];
  }
  
  private static designInclusiveRewards(participantCount: number): ChallengeReward[] {
    // 全員が何かしらの報酬を得られるシステム
    return [
      { type: 'participation', description: '参加者全員', reward: 'XP + 50' },
      { type: 'improvement', description: '前回より良い結果', reward: 'XP + 100' },
      { type: 'collaboration', description: '優れた協力', reward: 'チームワークバッジ' },
      { type: 'excellence', description: 'トップパフォーマンス', reward: 'XP + 200 + 特別バッジ' }
    ];
  }
  
  private static designRecognitionSystem(): RecognitionSystem {
    return {
      publicPraise: {
        enabled: true,
        optOut: true // 本人が嫌がる場合は非公開
      },
      peerNomination: {
        enabled: true,
        categories: ['頑張り屋さん', '親切な人', '面白いアイデア']
      },
      progressCelebration: {
        personalMilestones: true,
        groupAchievements: true,
        improvedPerformance: true
      }
    };
  }
  
  private static defineCulturalHealthMetrics(): CulturalHealthMetric[] {
    return [
      { name: 'positiveInteractionRatio', target: 0.8 },
      { name: 'helpRequestFulfillmentRate', target: 0.9 },
      { name: 'memberRetentionRate', target: 0.95 },
      { name: 'conflictResolutionSuccess', target: 0.85 }
    ];
  }
}

// 型定義
interface LearningStyle {
  primary: 'visual' | 'auditory' | 'kinesthetic';
  secondary?: 'visual' | 'auditory' | 'kinesthetic';
  pace: 'fast' | 'medium' | 'slow';
  preference: 'individual' | 'group' | 'mixed';
}

interface MentorshipRelation {
  partnerId: string;
  type: 'mentor' | 'mentee';
  subject: string;
  startDate: Date;
  status: 'active' | 'completed' | 'paused';
}

interface Reputation {
  helpfulness: number;
  reliability: number;
  knowledge: number;
  communication: number;
  overall: number;
}

interface Contribution {
  type: string;
  description: string;
  impact: number;
  timestamp: Date;
}

interface PrivacySettings {
  showRealName: boolean;
  showProgress: boolean;
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;
}

interface AvatarCustomization {
  type: string;
  value: string;
}

interface Expression {
  name: string;
  animation: string;
}

interface Outfit {
  id: string;
  name: string;
  unlockCondition: string;
}

interface Accessory {
  id: string;
  name: string;
  effect?: string;
}

interface Animation {
  name: string;
  trigger: string;
}

interface GroupChallenge {
  challengeId: string;
  status: string;
  progress: number;
}

interface GroupActivity {
  activityId: string;
  completedAt: Date;
  participants: string[];
  results: any;
}

interface StudySession {
  id: string;
  title: string;
  scheduledTime: Date;
  duration: number;
  participants: string[];
}

interface GroupProgress {
  overallLevel: number;
  subjectProgress: Record<string, number>;
  collaborationScore: number;
}

interface GroupAchievement {
  achievementId: string;
  earnedAt: Date;
  contributors: string[];
}

enum ActivityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

interface HelpRequest {
  id: string;
  subject: string;
  topic: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
}

enum ChallengeCategory {
  INDIVIDUAL = 'individual',
  TEAM = 'team',
  CROSS_GRADE = 'cross_grade',
  SCHOOL_WIDE = 'school_wide'
}

interface Participant {
  userId: string;
  joinedAt: Date;
  currentScore: number;
  status: 'active' | 'completed' | 'withdrawn';
}

interface ChallengeObjective {
  id: string;
  description: string;
  metric: string;
  target: number;
  weight: number;
}

interface ChallengeReward {
  type: string;
  description: string;
  reward: string;
}

enum ChallengeStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

interface TimeFrame {
  start: Date;
  end: Date;
  duration: number;
  unit: 'minutes' | 'hours' | 'days';
}

interface LeaderboardFilter {
  type: string;
  value: string;
}

interface DisplaySettings {
  maxEntries: number;
  showAvatars: boolean;
  showTrends: boolean;
  anonymizeData: boolean;
}

enum PrivacyLevel {
  PUBLIC = 'public',
  FRIENDS_ONLY = 'friends_only',
  PRIVATE = 'private'
}

interface ScoreBreakdown {
  components: Record<string, number>;
  bonuses: Record<string, number>;
}

interface Trend {
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  period: string;
}

interface PartnerCriteria {
  gradeRange?: string[];
  subjects?: string[];
  learningStyle?: LearningStyle;
  maxResults?: number;
}

interface CollaborativeSession {
  id: string;
  participants: string[];
  activities: Activity[];
  roleAssignments: RoleAssignment[];
  estimatedDuration: number;
  difficultyLevel: string;
  collaborationTools: CollaborationTool[];
  successMetrics: SuccessMetric[];
  scheduledTime: Date;
  status: string;
}

interface Activity {
  id: string;
  name: string;
  type: string;
  duration: number;
}

interface RoleAssignment {
  userId: string;
  role: string;
  responsibilities: string[];
}

interface CollaborationTool {
  name: string;
  type: string;
  features: string[];
}

interface SuccessMetric {
  name: string;
  description: string;
  target: number;
}

interface PeerSupportMatch {
  helper: SocialLearner;
  matchScore: number;
  availability: Availability;
  teachingStyle: TeachingStyle;
  successRate: number;
  reviewsFromHelpees: Review[];
}

interface Availability {
  isCurrentlyOnline: boolean;
  nextAvailableTime: Date;
  preferredHelpTimes: Date[];
}

interface TeachingStyle {
  approach: string;
  communicationStyle: string;
  effectiveness: number;
}

interface Review {
  rating: number;
  comment: string;
  date: Date;
}

interface GroupOptimization {
  currentScore: number;
  potentialScore: number;
  recommendations: OptimizationRecommendation[];
  implementationPlan: ImplementationPlan;
}

interface OptimizationRecommendation {
  type: string;
  description: string;
  suggestedActions: string[];
  priority: 'low' | 'medium' | 'high';
}

interface ImplementationPlan {
  phases: any[];
  timeline: any;
  resources: any[];
}

interface GroupStrengthsAnalysis {
  dominantStrengths: string[];
  coverageScore: number;
  balanceScore: number;
}

interface GroupWeaknessesAnalysis {
  commonWeaknesses: string[];
  coverageGaps: string[];
  supportNeeds: string[];
}

interface GroupPerformanceAnalysis {
  overallScore: number;
  learningEfficiency: number;
  memberSatisfaction: number;
  collaborationQuality: number;
}

interface MemberCompositionAnalysis {
  needsDiversity: boolean;
  strengthsDistribution: any;
  learningStyleBalance: any;
}

interface ActivityBalanceAnalysis {
  needsRebalancing: boolean;
  currentBalance: any;
  optimalBalance: any;
}

interface LeadershipAnalysis {
  needsImprovement: boolean;
  currentDistribution: any;
  recommendedChanges: any[];
}

enum CompetitionLevel {
  COOPERATIVE_ONLY = 'cooperative_only',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

interface CompetitivePersonality {
  competitiveness: number;
  cooperativeness: number;
  riskTolerance: number;
  socialSensitivity: number;
}

interface BalancedChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  handicapSystem: HandicapSystem;
  collaborativeElements: CollaborativeElement[];
  multipleWinCategories: WinCategory[];
  duration: number;
  flexibleDeadline: boolean;
  rewards: ChallengeReward[];
  recognitionSystem: RecognitionSystem;
}

interface SkillAnalysis {
  skillLevels: any;
  strengthsDistribution: any;
  learningPaces: any;
}

interface HandicapSystem {
  type: string;
  adjustments: any;
  fairnessScore: number;
}

interface CollaborativeElement {
  type: string;
  description: string;
  points: number;
}

interface WinCategory {
  name: string;
  description: string;
}

interface RecognitionSystem {
  publicPraise: any;
  peerNomination: any;
  progressCelebration: any;
}

interface CompetitionCulture {
  values: string[];
  practices: string[];
  rituals: string[];
  monitoring: any;
}

interface CulturalHealthMetric {
  name: string;
  target: number;
}