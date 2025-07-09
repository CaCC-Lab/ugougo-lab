import { useEffect, useMemo } from 'react';
import { useDashboardStore } from '../stores/dashboardStore';
import { useLearningStore } from '../../../stores/learningStore';
import { 
  type LearningTimeData, 
  type AccuracyData
} from '../types';

// 学習分析データを取得・整形するカスタムフック
export const useLearningAnalytics = () => {
  const {
    analyticsData,
    timeRange,
    isLoading,
    error,
    fetchAnalyticsData,
    clearError
  } = useDashboardStore();
  
  // 学習ストアからデータを取得
  const learningStore = useLearningStore();
  const { records, progress, getStreakDays } = learningStore;
  
  // 初回マウント時とtimeRange変更時にデータを取得
  useEffect(() => {
    fetchAnalyticsData({
      records,
      progress,
      streakDays: getStreakDays()
    });
  }, [timeRange, fetchAnalyticsData, records, progress, getStreakDays]);
  
  // 学習時間データのグラフ用整形
  const learningTimeChartData = useMemo(() => {
    if (!analyticsData?.learningTimeHistory) return [];
    
    return analyticsData.learningTimeHistory.map(item => ({
      ...item,
      displayDate: formatDateForChart(item.date),
      hours: Math.round(item.duration / 60 * 10) / 10 // 時間に変換（小数点1桁）
    }));
  }, [analyticsData?.learningTimeHistory]);
  
  // 正答率データのグラフ用整形
  const accuracyChartData = useMemo(() => {
    if (!analyticsData?.accuracyHistory) return [];
    
    return analyticsData.accuracyHistory.map(item => ({
      ...item,
      displayDate: formatDateForChart(item.date),
      accuracyPercent: Math.round(item.accuracy)
    }));
  }, [analyticsData?.accuracyHistory]);
  
  // 時間帯別学習パターンのヒートマップ用データ
  const hourlyHeatmapData = useMemo(() => {
    if (!analyticsData?.hourlyPatterns) return [];
    
    const maxFrequency = Math.max(...analyticsData.hourlyPatterns.map(p => p.frequency));
    
    return analyticsData.hourlyPatterns.map(pattern => ({
      hour: pattern.hour,
      displayHour: `${pattern.hour}:00`,
      value: pattern.avgDuration,
      intensity: maxFrequency > 0 ? pattern.frequency / maxFrequency : 0
    }));
  }, [analyticsData?.hourlyPatterns]);
  
  // 曜日別学習パターンデータ
  const weeklyPatternData = useMemo(() => {
    if (!analyticsData?.weeklyPatterns) return [];
    
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    
    return analyticsData.weeklyPatterns.map(pattern => ({
      ...pattern,
      displayDay: dayNames[pattern.dayOfWeek],
      hours: Math.round(pattern.avgDuration / 60 * 10) / 10
    }));
  }, [analyticsData?.weeklyPatterns]);
  
  // 習熟度レーダーチャート用データ
  const proficiencyRadarData = useMemo(() => {
    if (!analyticsData?.proficiencyMap) return [];
    
    return analyticsData.proficiencyMap.map(item => ({
      subject: translateConcept(item.concept),
      value: item.level,
      fullMark: 100
    }));
  }, [analyticsData?.proficiencyMap]);
  
  // 上位/下位の教材
  const topAndBottomMaterials = useMemo(() => {
    if (!analyticsData?.materialProgress) return { top: [], bottom: [] };
    
    const sorted = [...analyticsData.materialProgress].sort(
      (a, b) => b.averageScore - a.averageScore
    );
    
    return {
      top: sorted.slice(0, 5),
      bottom: sorted.slice(-5).reverse()
    };
  }, [analyticsData?.materialProgress]);
  
  // 重要なインサイトのフィルタリング
  const priorityInsights = useMemo(() => {
    if (!analyticsData?.insights) return [];
    
    return analyticsData.insights
      .filter(insight => insight.priority === 'high' || insight.priority === 'medium')
      .slice(0, 5);
  }, [analyticsData?.insights]);
  
  // 学習統計のサマリー
  const summary = useMemo(() => {
    if (!analyticsData) return null;
    
    return {
      totalHours: Math.round(analyticsData.totalLearningTime / 60 * 10) / 10,
      totalMinutes: Math.round(analyticsData.totalLearningTime),
      streakDays: analyticsData.streakDays,
      completedMaterials: analyticsData.completedMaterials,
      averageAccuracy: Math.round(analyticsData.averageAccuracy),
      weeklyAverage: calculateWeeklyAverage(analyticsData.learningTimeHistory),
      improvement: calculateImprovement(analyticsData.accuracyHistory)
    };
  }, [analyticsData]);
  
  return {
    // 生データ
    analyticsData,
    
    // 整形済みデータ
    learningTimeChartData,
    accuracyChartData,
    hourlyHeatmapData,
    weeklyPatternData,
    proficiencyRadarData,
    topAndBottomMaterials,
    priorityInsights,
    summary,
    
    // 状態
    isLoading,
    error,
    
    // アクション
    refetch: () => fetchAnalyticsData(true),
    clearError
  };
};

// ユーティリティ関数

function formatDateForChart(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function translateConcept(concept: string): string {
  const translations: { [key: string]: string } = {
    'math': '数学',
    'science': '理科',
    'english': '英語',
    'social': '社会',
    'japanese': '国語',
    'programming': 'プログラミング',
    'geometry': '図形',
    'algebra': '代数',
    'calculation': '計算'
  };
  
  return translations[concept.toLowerCase()] || concept;
}

function calculateWeeklyAverage(history: LearningTimeData[]): number {
  if (!history || history.length === 0) return 0;
  
  const last7Days = history.slice(-7);
  const total = last7Days.reduce((sum, day) => sum + day.duration, 0);
  
  return Math.round(total / 7);
}

function calculateImprovement(history: AccuracyData[]): number {
  if (!history || history.length < 2) return 0;
  
  const recent = history.slice(-7);
  const previous = history.slice(-14, -7);
  
  if (recent.length === 0 || previous.length === 0) return 0;
  
  const recentAvg = recent.reduce((sum, d) => sum + d.accuracy, 0) / recent.length;
  const previousAvg = previous.reduce((sum, d) => sum + d.accuracy, 0) / previous.length;
  
  return Math.round(recentAvg - previousAvg);
}

// グラフ用の色設定
export const chartColors = {
  primary: '#2196F3',
  secondary: '#4CAF50',
  tertiary: '#FF9800',
  error: '#F44336',
  warning: '#FFC107',
  success: '#4CAF50',
  gradient: {
    start: '#2196F3',
    end: '#21CBF3'
  }
};