/**
 * ナラティブ学習システム
 * 
 * 学習を物語として体験させることで、深い没入感と継続的な動機付けを提供
 * 個人の学習進捗に応じて動的に展開される物語世界
 */

export interface LearningStory {
  id: string;
  title: string;
  theme: StoryTheme;
  setting: StorySetting;
  mainCharacter: Character;
  
  // 物語構造
  acts: StoryAct[];
  currentAct: number;
  currentChapter: number;
  
  // 進行条件
  progressionRequirements: ProgressionRequirement[];
  
  // 個人化要素
  playerChoices: Choice[];
  personalizedElements: PersonalizationElement[];
  
  // メタデータ
  recommendedAge: number[];
  estimatedDuration: number; // 分
  educationalObjectives: string[];
}

export enum StoryTheme {
  SPACE_EXPLORATION = 'space_exploration',
  TIME_TRAVEL = 'time_travel',
  UNDERWATER_ADVENTURE = 'underwater_adventure',
  MAGICAL_KINGDOM = 'magical_kingdom',
  FUTURE_CITY = 'future_city',
  ANCIENT_CIVILIZATION = 'ancient_civilization',
  DETECTIVE_MYSTERY = 'detective_mystery',
  NATURE_ADVENTURE = 'nature_adventure'
}

export interface StorySetting {
  world: string;
  timeEra: string;
  locations: Location[];
  atmosphere: Atmosphere;
}

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  personality: PersonalityTrait[];
  appearance: CharacterAppearance;
  abilities: CharacterAbility[];
  
  // 関係性
  relationships: CharacterRelationship[];
  
  // 成長
  development: CharacterDevelopment;
}

export enum CharacterRole {
  PROTAGONIST = 'protagonist', // 主人公（学習者）
  MENTOR = 'mentor',           // 指導者
  COMPANION = 'companion',     // 仲間
  CHALLENGER = 'challenger',   // 挑戦者
  GUIDE = 'guide',            // 案内役
  MYSTERIOUS = 'mysterious'    // 謎の存在
}

export interface StoryAct {
  actNumber: number;
  title: string;
  summary: string;
  chapters: Chapter[];
  
  // 教育目標
  learningObjectives: LearningObjective[];
  requiredMaterials: string[]; // 必要な教材ID
  
  // 物語要素
  conflict: string;
  resolution: string;
  climax: string;
}

export interface Chapter {
  chapterNumber: number;
  title: string;
  content: ChapterContent;
  
  // インタラクション
  interactions: Interaction[];
  choices: Choice[];
  
  // 学習要素
  associatedMaterials: string[];
  challenges: Challenge[];
  
  // 進行制御
  unlockConditions: UnlockCondition[];
  completionConditions: CompletionCondition[];
}

export interface ChapterContent {
  narrative: NarrativeElement[];
  dialogue: DialogueElement[];
  visualElements: VisualElement[];
  audioElements: AudioElement[];
}

export interface NarrativeElement {
  type: 'description' | 'action' | 'thought' | 'exposition';
  text: string;
  mood: string;
  pacing: 'slow' | 'medium' | 'fast';
  emphasis: 'normal' | 'important' | 'critical';
}

export interface DialogueElement {
  speaker: string;
  text: string;
  emotion: string;
  voiceSettings?: VoiceSettings;
  responseOptions?: ResponseOption[];
}

export interface Interaction {
  id: string;
  type: InteractionType;
  trigger: string;
  effect: InteractionEffect;
  feedback: string;
}

export enum InteractionType {
  MATERIAL_COMPLETION = 'material_completion',
  CHOICE_SELECTION = 'choice_selection',
  ACHIEVEMENT_UNLOCK = 'achievement_unlock',
  HELP_REQUEST = 'help_request',
  EXPLORATION = 'exploration',
  COLLABORATION = 'collaboration'
}

export interface Choice {
  id: string;
  text: string;
  consequences: Consequence[];
  requiredConditions?: string[];
  personalityAlignment?: PersonalityTrait;
  
  // 学習的影響
  educationalImpact: EducationalImpact;
}

export interface Consequence {
  type: 'story_branch' | 'character_development' | 'relationship_change' | 'ability_gain';
  description: string;
  effects: any;
  duration: 'temporary' | 'permanent';
}

/**
 * 動的ストーリー生成システム
 */
export class DynamicStoryGenerator {
  // 学習者プロファイルに基づくストーリー選択
  static selectOptimalStory(learnerProfile: LearnerProfile): LearningStory {
    const preferences = learnerProfile.preferences;
    const academicLevel = learnerProfile.academicLevel;
    const interests = learnerProfile.interests;
    
    // 興味に基づくテーマ選択
    const selectedTheme = this.selectThemeByInterests(interests);
    
    // 年齢適正チェック
    const availableStories = this.getStoriesByTheme(selectedTheme)
      .filter(story => this.isAgeAppropriate(story, learnerProfile.age));
    
    // 学習レベルに最適な物語を選択
    return this.selectByAcademicLevel(availableStories, academicLevel);
  }
  
  // リアルタイム物語調整
  static adaptStoryToProgress(
    story: LearningStory, 
    learningProgress: LearningProgress,
    recentPerformance: Performance
  ): StoryAdaptation {
    const adaptations: StoryAdaptation = {
      difficultyAdjustment: this.calculateDifficultyAdjustment(recentPerformance),
      paceAdjustment: this.calculatePaceAdjustment(learningProgress),
      contentModifications: [],
      characterDevelopment: []
    };
    
    // パフォーマンスに基づく調整
    if (recentPerformance.strugglingAreas.length > 0) {
      adaptations.contentModifications.push({
        type: 'add_support_character',
        details: this.createSupportCharacter(recentPerformance.strugglingAreas)
      });
    }
    
    if (recentPerformance.excellenceAreas.length > 0) {
      adaptations.contentModifications.push({
        type: 'add_advanced_challenge',
        details: this.createAdvancedChallenge(recentPerformance.excellenceAreas)
      });
    }
    
    return adaptations;
  }
  
  // 個人化された選択肢生成
  static generatePersonalizedChoices(
    context: StoryContext,
    learnerPersonality: PersonalityProfile
  ): Choice[] {
    const baseChoices = context.availableChoices;
    const personalizedChoices: Choice[] = [];
    
    // 性格特性に合った選択肢を強調
    for (const choice of baseChoices) {
      const modifiedChoice = { ...choice };
      
      if (this.alignsWithPersonality(choice, learnerPersonality)) {
        modifiedChoice.text = `✨ ${choice.text}`; // 視覚的な強調
        modifiedChoice.educationalImpact.motivationBoost = 1.2;
      }
      
      personalizedChoices.push(modifiedChoice);
    }
    
    // 新しい選択肢を動的に生成
    const dynamicChoice = this.generateDynamicChoice(context, learnerPersonality);
    if (dynamicChoice) {
      personalizedChoices.push(dynamicChoice);
    }
    
    return personalizedChoices;
  }
  
  // ストーリー進行の自動管理
  static manageStoryProgression(
    story: LearningStory,
    completedMaterials: string[],
    earnedAchievements: string[]
  ): ProgressionUpdate {
    const currentChapter = story.acts[story.currentAct].chapters[story.currentChapter];
    
    // 現在のチャプターの完了条件をチェック
    const chapterCompleted = this.checkChapterCompletion(
      currentChapter,
      completedMaterials,
      earnedAchievements
    );
    
    if (chapterCompleted) {
      // 次のチャプターまたはアクトにアンロック
      const nextProgression = this.calculateNextProgression(story);
      
      return {
        type: 'progression',
        nextAct: nextProgression.act,
        nextChapter: nextProgression.chapter,
        unlockedContent: nextProgression.unlockedContent,
        celebrationEvent: this.createProgressionCelebration(nextProgression)
      };
    }
    
    // 部分的な進行をチェック
    const partialProgress = this.calculatePartialProgress(
      currentChapter,
      completedMaterials,
      earnedAchievements
    );
    
    return {
      type: 'partial_progress',
      progressPercentage: partialProgress.percentage,
      nextMilestone: partialProgress.nextMilestone,
      encouragementMessage: this.generateEncouragementMessage(partialProgress)
    };
  }
  
  // プライベートヘルパーメソッド
  private static selectThemeByInterests(interests: string[]): StoryTheme {
    const themeMapping: Record<string, StoryTheme> = {
      'space': StoryTheme.SPACE_EXPLORATION,
      'history': StoryTheme.TIME_TRAVEL,
      'ocean': StoryTheme.UNDERWATER_ADVENTURE,
      'fantasy': StoryTheme.MAGICAL_KINGDOM,
      'technology': StoryTheme.FUTURE_CITY,
      'archaeology': StoryTheme.ANCIENT_CIVILIZATION,
      'mystery': StoryTheme.DETECTIVE_MYSTERY,
      'nature': StoryTheme.NATURE_ADVENTURE
    };
    
    for (const interest of interests) {
      if (themeMapping[interest]) {
        return themeMapping[interest];
      }
    }
    
    return StoryTheme.NATURE_ADVENTURE; // デフォルト
  }
  
  private static getStoriesByTheme(theme: StoryTheme): LearningStory[] {
    // 実際の実装では、データベースやファイルから読み込む
    return StoryDatabase.getStoriesByTheme(theme);
  }
  
  private static isAgeAppropriate(story: LearningStory, age: number): boolean {
    return story.recommendedAge[0] <= age && age <= story.recommendedAge[1];
  }
  
  private static selectByAcademicLevel(
    stories: LearningStory[],
    academicLevel: string
  ): LearningStory {
    // 学力レベルに最も適した物語を選択
    return stories[0]; // 簡略化
  }
  
  private static calculateDifficultyAdjustment(performance: Performance): number {
    if (performance.averageAccuracy < 0.7) return -0.1; // 易しく
    if (performance.averageAccuracy > 0.9) return 0.1;  // 難しく
    return 0; // 現状維持
  }
  
  private static calculatePaceAdjustment(progress: LearningProgress): number {
    // 学習ペースの調整計算
    return 1.0; // 簡略化
  }
  
  private static createSupportCharacter(strugglingAreas: string[]): any {
    return {
      name: 'サポート先生',
      role: CharacterRole.MENTOR,
      specialties: strugglingAreas,
      helpMessages: this.generateHelpMessages(strugglingAreas)
    };
  }
  
  private static createAdvancedChallenge(excellenceAreas: string[]): any {
    return {
      type: 'advanced_puzzle',
      areas: excellenceAreas,
      difficultyMultiplier: 1.3,
      rewardMultiplier: 1.5
    };
  }
  
  private static alignsWithPersonality(
    choice: Choice,
    personality: PersonalityProfile
  ): boolean {
    return choice.personalityAlignment && 
           personality.dominantTraits.includes(choice.personalityAlignment);
  }
  
  private static generateDynamicChoice(
    context: StoryContext,
    personality: PersonalityProfile
  ): Choice | null {
    // 動的選択肢生成の実装
    return null; // 簡略化
  }
  
  private static checkChapterCompletion(
    chapter: Chapter,
    completedMaterials: string[],
    earnedAchievements: string[]
  ): boolean {
    return chapter.completionConditions.every(condition =>
      this.evaluateCompletionCondition(condition, completedMaterials, earnedAchievements)
    );
  }
  
  private static evaluateCompletionCondition(
    condition: CompletionCondition,
    completedMaterials: string[],
    earnedAchievements: string[]
  ): boolean {
    switch (condition.type) {
      case 'materials_completed':
        return condition.requiredMaterials.every(materialId =>
          completedMaterials.includes(materialId)
        );
      case 'achievements_earned':
        return condition.requiredAchievements.every(achievementId =>
          earnedAchievements.includes(achievementId)
        );
      default:
        return false;
    }
  }
  
  private static calculateNextProgression(story: LearningStory): any {
    // 次の進行ポイントを計算
    return {
      act: story.currentAct,
      chapter: story.currentChapter + 1,
      unlockedContent: []
    };
  }
  
  private static createProgressionCelebration(progression: any): any {
    return {
      type: 'chapter_completion',
      animation: 'story-progress-celebration',
      message: 'すばらしい！物語が進展しました！'
    };
  }
  
  private static calculatePartialProgress(
    chapter: Chapter,
    completedMaterials: string[],
    earnedAchievements: string[]
  ): any {
    // 部分的な進行状況を計算
    return {
      percentage: 0.5,
      nextMilestone: '次の教材完了'
    };
  }
  
  private static generateEncouragementMessage(partialProgress: any): string {
    const messages = [
      'がんばっています！もう少しで次に進めます。',
      '順調に進んでいますね！',
      'その調子！物語の続きが待っています。'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  private static generateHelpMessages(strugglingAreas: string[]): string[] {
    return strugglingAreas.map(area => `${area}で困ったときは、私に聞いてくださいね！`);
  }
}

/**
 * ストーリーデータベース（サンプル）
 */
export class StoryDatabase {
  static getStoriesByTheme(theme: StoryTheme): LearningStory[] {
    // 宇宙探検の物語例
    if (theme === StoryTheme.SPACE_EXPLORATION) {
      return [{
        id: 'space-adventure-1',
        title: '銀河系学習探検隊',
        theme: StoryTheme.SPACE_EXPLORATION,
        setting: {
          world: '宇宙',
          timeEra: '未来（2150年）',
          locations: [
            { id: 'space-station', name: '宇宙ステーション・ラーニング', description: '学習の拠点' },
            { id: 'math-planet', name: '数学惑星マセマティカ', description: '数学の知識が詰まった惑星' },
            { id: 'science-moon', name: '理科の月サイエンシア', description: '実験と発見の衛星' }
          ],
          atmosphere: {
            mood: 'adventurous',
            tone: 'optimistic',
            visualStyle: 'colorful-futuristic'
          }
        },
        mainCharacter: {
          id: 'player-explorer',
          name: 'あなた（探検隊長）',
          role: CharacterRole.PROTAGONIST,
          personality: [PersonalityTrait.CURIOUS, PersonalityTrait.BRAVE],
          appearance: {
            customizable: true,
            defaultStyle: 'space-suit'
          },
          abilities: [
            { id: 'learning-scanner', name: '学習スキャナー', description: '知識を発見する能力' },
            { id: 'problem-solver', name: '問題解決装置', description: '難題を解く力' }
          ],
          relationships: [],
          development: {
            initialLevel: 1,
            growthMilestones: []
          }
        },
        acts: [
          {
            actNumber: 1,
            title: '宇宙ステーションでの訓練',
            summary: '探検に必要な基礎知識を身につける',
            chapters: [
              {
                chapterNumber: 1,
                title: '探検隊への仲間入り',
                content: {
                  narrative: [{
                    type: 'description',
                    text: '輝く星々の中で、宇宙ステーション・ラーニングがゆっくりと回転しています。あなたは新米探検隊員として、この壮大な学習の旅に参加することになりました。',
                    mood: 'wonder',
                    pacing: 'medium',
                    emphasis: 'normal'
                  }],
                  dialogue: [{
                    speaker: 'キャプテン・ノレッジ',
                    text: 'ようこそ、新しい仲間！君の学習への冒険がここから始まります。まずは基本的な訓練から始めましょう。',
                    emotion: 'welcoming',
                    responseOptions: [
                      { text: 'はい、がんばります！', effect: 'enthusiasm_boost' },
                      { text: '少し緊張しています...', effect: 'comfort_provided' }
                    ]
                  }],
                  visualElements: [],
                  audioElements: []
                },
                interactions: [],
                choices: [],
                associatedMaterials: ['number-basics', 'addition-subtraction'],
                challenges: [],
                unlockConditions: [],
                completionConditions: [{
                  type: 'materials_completed',
                  requiredMaterials: ['number-basics'],
                  requiredAchievements: []
                }]
              }
            ],
            learningObjectives: [
              { subject: 'math', concept: 'basic_numbers', level: 'beginner' }
            ],
            requiredMaterials: ['number-basics', 'addition-subtraction'],
            conflict: '宇宙での学習に適応する必要がある',
            resolution: '基礎訓練を完了し、準備が整う',
            climax: '初めての実習テストに合格'
          }
        ],
        currentAct: 0,
        currentChapter: 0,
        progressionRequirements: [],
        playerChoices: [],
        personalizedElements: [],
        recommendedAge: [6, 12],
        estimatedDuration: 180,
        educationalObjectives: ['数学基礎', '理科入門', '問題解決力']
      }];
    }
    
    return [];
  }
}

// 型定義の続き
interface LearnerProfile {
  age: number;
  academicLevel: string;
  interests: string[];
  preferences: any;
}

interface LearningProgress {
  completedMaterials: string[];
  currentLevel: number;
  skillProgression: any;
}

interface Performance {
  averageAccuracy: number;
  strugglingAreas: string[];
  excellenceAreas: string[];
}

interface StoryAdaptation {
  difficultyAdjustment: number;
  paceAdjustment: number;
  contentModifications: any[];
  characterDevelopment: any[];
}

interface PersonalityProfile {
  dominantTraits: PersonalityTrait[];
}

enum PersonalityTrait {
  CURIOUS = 'curious',
  BRAVE = 'brave',
  METHODICAL = 'methodical',
  CREATIVE = 'creative',
  SOCIAL = 'social',
  INDEPENDENT = 'independent'
}

interface StoryContext {
  availableChoices: Choice[];
  currentSituation: string;
  recentEvents: any[];
}

interface ProgressionUpdate {
  type: 'progression' | 'partial_progress';
  nextAct?: number;
  nextChapter?: number;
  unlockedContent?: any[];
  celebrationEvent?: any;
  progressPercentage?: number;
  nextMilestone?: string;
  encouragementMessage?: string;
}

interface Location {
  id: string;
  name: string;
  description: string;
}

interface Atmosphere {
  mood: string;
  tone: string;
  visualStyle: string;
}

interface PersonalityTrait extends String {}

interface CharacterAppearance {
  customizable: boolean;
  defaultStyle: string;
}

interface CharacterAbility {
  id: string;
  name: string;
  description: string;
}

interface CharacterRelationship {
  characterId: string;
  relationshipType: string;
  strength: number;
}

interface CharacterDevelopment {
  initialLevel: number;
  growthMilestones: any[];
}

interface LearningObjective {
  subject: string;
  concept: string;
  level: string;
}

interface VisualElement {
  type: string;
  content: any;
}

interface AudioElement {
  type: string;
  content: any;
}

interface VoiceSettings {
  voice: string;
  speed: number;
  emotion: string;
}

interface ResponseOption {
  text: string;
  effect: string;
}

interface InteractionEffect {
  type: string;
  magnitude: number;
  duration: number;
}

interface EducationalImpact {
  motivationBoost: number;
  engagementLevel: number;
  learningEffectiveness: number;
}

interface Challenge {
  id: string;
  type: string;
  difficulty: number;
  rewards: any;
}

interface UnlockCondition {
  type: string;
  requirements: any;
}

interface CompletionCondition {
  type: 'materials_completed' | 'achievements_earned';
  requiredMaterials?: string[];
  requiredAchievements?: string[];
}

interface PersonalizationElement {
  type: string;
  value: any;
}