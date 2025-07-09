import { 
  type LearningAnalytics, 
  type TimeRange, 
  type UserRole,
  type LearningTimeData,
  type AccuracyData,
  type HourlyLearningPattern,
  type ProficiencyData,
  type MaterialProgress,
  type ErrorPattern,
  type LearningInsight,
  type LearningPace,
  type ComparisonData
} from '../types';
import { type LearningRecord, type LearningProgress } from '../../../stores/learningStore';

// 分析サービスクラス
class AnalyticsService {
  // メインの分析データ取得
  async fetchAnalytics(params: {
    timeRange: TimeRange;
    role: UserRole;
    records: LearningRecord[];
    progress: LearningProgress[];
    streakDays: number;
  }): Promise<LearningAnalytics> {
    const { records, progress, streakDays } = params;
    
    // 指定期間内のレコードをフィルタリング
    const filteredRecords = records.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= params.timeRange.start && recordDate <= params.timeRange.end;
    });
    
    // 各種データの計算
    const learningTimeHistory = this.calculateLearningTimeHistory(filteredRecords, params.timeRange);
    const accuracyHistory = this.calculateAccuracyHistory(filteredRecords, params.timeRange);
    const hourlyPatterns = this.calculateHourlyPatterns(filteredRecords);
    const weeklyPatterns = this.calculateWeeklyPatterns(filteredRecords);
    const proficiencyMap = this.calculateProficiencyMap(progress);
    const materialProgress = this.getMaterialProgress(progress);
    const errorPatterns = this.analyzeErrorPatterns(filteredRecords);
    const insights = this.generateInsights(filteredRecords, progress);
    const learningPace = this.analyzeLearningPace(filteredRecords);
    const recommendedMaterials = this.getRecommendedMaterials(progress, errorPatterns);
    
    // 基本統計の計算
    const totalLearningTime = filteredRecords.reduce((sum, record) => sum + record.duration, 0) / 60; // 分単位
    const completedMaterials = progress.filter(p => p.masteryLevel >= 80).length;
    const accuracyData = filteredRecords.filter(r => r.score !== undefined);
    const averageAccuracy = accuracyData.length > 0
      ? accuracyData.reduce((sum, r) => sum + r.score, 0) / accuracyData.length
      : 0;
    
    return {
      totalLearningTime,
      streakDays,
      completedMaterials,
      averageAccuracy,
      learningTimeHistory,
      accuracyHistory,
      hourlyPatterns,
      weeklyPatterns,
      proficiencyMap,
      materialProgress,
      errorPatterns,
      insights,
      learningPace,
      recommendedMaterials
    };
  }
  
  // 比較データの取得
  async fetchComparisonData(params: {
    target: 'self' | 'gradeAverage' | 'schoolAverage';
    timeRange: TimeRange;
  }): Promise<ComparisonData[]> {
    // 実際のアプリケーションではAPIから他のユーザーのデータを取得
    // ここではモックデータを返す
    const comparisons: ComparisonData[] = [];
    
    if (params.target === 'self') {
      // 前期間との比較
      const previousRange = this.getPreviousTimeRange(params.timeRange);
      const currentData = await this.fetchAnalytics({ timeRange: params.timeRange, role: 'student' });
      const previousData = await this.fetchAnalytics({ timeRange: previousRange, role: 'student' });
      
      comparisons.push({
        target: 'self',
        metric: '学習時間',
        currentValue: currentData.totalLearningTime,
        targetValue: previousData.totalLearningTime,
        difference: currentData.totalLearningTime - previousData.totalLearningTime,
        trend: this.getTrend(currentData.totalLearningTime, previousData.totalLearningTime)
      });
      
      comparisons.push({
        target: 'self',
        metric: '正答率',
        currentValue: currentData.averageAccuracy,
        targetValue: previousData.averageAccuracy,
        difference: currentData.averageAccuracy - previousData.averageAccuracy,
        trend: this.getTrend(currentData.averageAccuracy, previousData.averageAccuracy)
      });
    } else {
      // 学年平均・学校平均との比較（モックデータ）
      comparisons.push({
        target: params.target,
        metric: '学習時間',
        currentValue: 120, // 現在の値
        targetValue: 150, // 平均値
        difference: -30,
        trend: 'stable'
      });
    }
    
    return comparisons;
  }
  
  // プライベートメソッド群
  
  private calculateLearningTimeHistory(records: LearningRecord[], _timeRange: TimeRange): LearningTimeData[] {
    const dailyData = new Map<string, number>();
    
    records.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      const duration = record.duration / 60; // 分単位に変換
      dailyData.set(date, (dailyData.get(date) || 0) + duration);
    });
    
    return Array.from(dailyData.entries()).map(([date, duration]) => ({
      date,
      duration: Math.round(duration)
    }));
  }
  
  private calculateAccuracyHistory(records: LearningRecord[], _timeRange: TimeRange): AccuracyData[] {
    const dailyData = new Map<string, { correct: number; total: number }>();
    
    records.forEach(record => {
      if (record.score !== undefined) {
        const date = new Date(record.timestamp).toISOString().split('T')[0];
        const current = dailyData.get(date) || { correct: 0, total: 0 };
        current.total += 1;
        if (record.score >= 80) { // 80点以上を正解とみなす
          current.correct += 1;
        }
        dailyData.set(date, current);
      }
    });
    
    return Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      totalQuestions: data.total,
      correctAnswers: data.correct
    }));
  }
  
  private calculateHourlyPatterns(records: LearningRecord[]): HourlyLearningPattern[] {
    const hourlyData = new Map<number, { duration: number; count: number }>();
    
    for (let hour = 0; hour < 24; hour++) {
      hourlyData.set(hour, { duration: 0, count: 0 });
    }
    
    records.forEach(record => {
      const hour = new Date(record.timestamp).getHours();
      const current = hourlyData.get(hour)!;
      current.duration += record.duration / 60;
      current.count += 1;
    });
    
    return Array.from(hourlyData.entries()).map(([hour, data]) => ({
      hour,
      avgDuration: data.count > 0 ? Math.round(data.duration / data.count) : 0,
      frequency: data.count
    }));
  }
  
  private calculateWeeklyPatterns(records: LearningRecord[]): { dayOfWeek: number; avgDuration: number }[] {
    const weeklyData = new Map<number, { duration: number; count: number }>();
    
    for (let day = 0; day < 7; day++) {
      weeklyData.set(day, { duration: 0, count: 0 });
    }
    
    // 日ごとの学習時間を集計
    const dailyTotals = new Map<string, number>();
    records.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      dailyTotals.set(date, (dailyTotals.get(date) || 0) + record.duration / 60);
    });
    
    // 曜日ごとに集計
    dailyTotals.forEach((duration, date) => {
      const dayOfWeek = new Date(date).getDay();
      const current = weeklyData.get(dayOfWeek)!;
      current.duration += duration;
      current.count += 1;
    });
    
    return Array.from(weeklyData.entries()).map(([dayOfWeek, data]) => ({
      dayOfWeek,
      avgDuration: data.count > 0 ? Math.round(data.duration / data.count) : 0
    }));
  }
  
  private calculateProficiencyMap(progress: LearningProgress[]): ProficiencyData[] {
    const conceptMap = new Map<string, number[]>();
    
    progress.forEach(p => {
      if (!conceptMap.has(p.concept)) {
        conceptMap.set(p.concept, []);
      }
      conceptMap.get(p.concept)!.push(p.masteryLevel);
    });
    
    return Array.from(conceptMap.entries()).map(([concept, levels]) => ({
      concept,
      level: Math.round(levels.reduce((sum, l) => sum + l, 0) / levels.length)
    }));
  }
  
  private getMaterialProgress(progress: LearningProgress[]): MaterialProgress[] {
    return progress.map(p => ({
      materialId: p.materialId,
      materialName: p.materialId, // 実際にはマテリアル名を取得
      category: 'math', // 実際にはカテゴリを取得
      completionRate: p.masteryLevel,
      lastAccessed: new Date(p.lastAccessed),
      totalTime: p.totalTime / 60,
      attemptCount: p.attemptCount,
      averageScore: p.averageScore,
      difficultyLevel: p.difficultyLevel
    }));
  }
  
  private analyzeErrorPatterns(records: LearningRecord[]): ErrorPattern[] {
    const errorMap = new Map<string, ErrorPattern>();
    
    records.forEach(record => {
      if (record.mistakes && record.mistakes.length > 0) {
        record.mistakes.forEach((mistake: { problem: string; userAnswer: string; correctAnswer: string }) => {
          const errorType = this.categorizeError(mistake);
          
          if (!errorMap.has(errorType)) {
            errorMap.set(errorType, {
              type: errorType,
              frequency: 0,
              examples: [],
              suggestions: []
            });
          }
          
          const pattern = errorMap.get(errorType)!;
          pattern.frequency += 1;
          
          if (pattern.examples.length < 5) {
            pattern.examples.push({
              ...mistake,
              timestamp: new Date(record.timestamp)
            });
          }
        });
      }
    });
    
    // 各エラーパターンに対する提案を生成
    errorMap.forEach((pattern) => {
      pattern.suggestions = this.generateErrorSuggestions(pattern.type);
    });
    
    return Array.from(errorMap.values()).sort((a, b) => b.frequency - a.frequency);
  }
  
  private categorizeError(mistake: { problem: string; userAnswer: string; correctAnswer: string }): string {
    // 簡単なエラー分類ロジック
    if (mistake.problem && mistake.problem.includes('計算')) {
      return '計算エラー';
    } else if (mistake.problem && mistake.problem.includes('読解')) {
      return '読解エラー';
    }
    return 'その他のエラー';
  }
  
  private generateErrorSuggestions(errorType: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      '計算エラー': [
        '基本的な計算練習を増やしましょう',
        '計算の手順を確認しましょう',
        '暗算ではなく筆算を使ってみましょう'
      ],
      '読解エラー': [
        '問題文をゆっくり読み返しましょう',
        'キーワードに下線を引いてみましょう',
        '問題を自分の言葉で言い換えてみましょう'
      ],
      'その他のエラー': [
        '基礎概念を復習しましょう',
        'ヒントを活用してみましょう'
      ]
    };
    
    return suggestions[errorType] || suggestions['その他のエラー'];
  }
  
  private generateInsights(records: LearningRecord[], progress: LearningProgress[]): LearningInsight[] {
    const insights: LearningInsight[] = [];
    
    // 弱点領域の検出
    const weakAreas = progress.filter(p => p.masteryLevel < 50);
    if (weakAreas.length > 0) {
      insights.push({
        type: 'weakness',
        title: '改善が必要な領域',
        description: `${weakAreas.length}つの教材で習熟度が50%未満です`,
        priority: 'high',
        actionItems: weakAreas.map(w => `${w.materialId}の復習`),
        relatedMaterials: weakAreas.map(w => w.materialId)
      });
    }
    
    // 強み領域の検出
    const strongAreas = progress.filter(p => p.masteryLevel >= 90);
    if (strongAreas.length > 0) {
      insights.push({
        type: 'strength',
        title: '得意な領域',
        description: `${strongAreas.length}つの教材で高い習熟度を達成しています`,
        priority: 'low',
        actionItems: ['より高度な教材に挑戦'],
        relatedMaterials: []
      });
    }
    
    // 学習パターンの検出
    const recentRecords = records.slice(-20);
    const avgDuration = recentRecords.reduce((sum, r) => sum + r.duration, 0) / recentRecords.length / 60;
    if (avgDuration < 10) {
      insights.push({
        type: 'pattern',
        title: '学習時間が短い傾向',
        description: '最近の学習セッションが平均10分未満です',
        priority: 'medium',
        actionItems: ['15-20分の学習セッションを目指しましょう']
      });
    }
    
    return insights;
  }
  
  private analyzeLearningPace(records: LearningRecord[]): LearningPace {
    const recentRecords = records.slice(-20);
    const avgSessionDuration = recentRecords.reduce((sum, r) => sum + r.duration, 0) / recentRecords.length / 60;
    
    // 学習ペースの判定
    let currentPace: LearningPace['currentPace'] = 'optimal';
    let recommendedSessionDuration = 20;
    
    if (avgSessionDuration < 10) {
      currentPace = 'too-fast';
      recommendedSessionDuration = 15;
    } else if (avgSessionDuration > 45) {
      currentPace = 'too-slow';
      recommendedSessionDuration = 30;
    }
    
    // 最適な時間帯の計算（簡略版）
    const optimalTimeSlots = [
      {
        dayOfWeek: 1, // 月曜日
        hourRange: { start: 16, end: 18 },
        effectiveness: 85
      },
      {
        dayOfWeek: 3, // 水曜日
        hourRange: { start: 15, end: 17 },
        effectiveness: 90
      }
    ];
    
    return {
      currentPace,
      averageSessionDuration: Math.round(avgSessionDuration),
      recommendedSessionDuration,
      optimalTimeSlots
    };
  }
  
  private getRecommendedMaterials(progress: LearningProgress[], errorPatterns: ErrorPattern[]): { materialId: string; reason: string; priority: number; }[] {
    const recommendations: { materialId: string; reason: string; priority: number; }[] = [];
    
    // エラーパターンに基づく推奨
    if (errorPatterns.length > 0 && errorPatterns[0].frequency > 5) {
      recommendations.push({
        materialId: 'calculation-practice',
        reason: `${errorPatterns[0].type}を改善するため`,
        priority: 1
      });
    }
    
    // 習熟度に基づく推奨
    const lowMasteryMaterials = progress
      .filter(p => p.masteryLevel < 70 && p.attemptCount < 5)
      .sort((a, b) => a.masteryLevel - b.masteryLevel);
    
    if (lowMasteryMaterials.length > 0) {
      recommendations.push({
        materialId: lowMasteryMaterials[0].materialId,
        reason: '習熟度を向上させるため',
        priority: 2
      });
    }
    
    return recommendations;
  }
  
  private getPreviousTimeRange(currentRange: TimeRange): TimeRange {
    const duration = currentRange.end.getTime() - currentRange.start.getTime();
    return {
      start: new Date(currentRange.start.getTime() - duration),
      end: new Date(currentRange.end.getTime() - duration),
      preset: currentRange.preset
    };
  }
  
  private getTrend(current: number, previous: number): 'improving' | 'stable' | 'declining' {
    const difference = current - previous;
    const percentChange = previous > 0 ? (difference / previous) * 100 : 0;
    
    if (percentChange > 5) return 'improving';
    if (percentChange < -5) return 'declining';
    return 'stable';
  }
}

// シングルトンインスタンスをエクスポート
export const analyticsService = new AnalyticsService();