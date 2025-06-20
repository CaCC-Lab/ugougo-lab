import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { Box, IconButton, Tooltip, Zoom } from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';
import { useLearningTracker } from '../../hooks/useLearningTracker';
import type { UseLearningTrackerOptions } from '../../hooks/useLearningTracker';
import { LearningMetrics } from '../common/LearningMetrics';
import { LearningAssistant } from '../common/LearningAssistant';

// 学習追跡コンテキストの型定義
interface LearningTrackerContextType {
  recordInteraction: (type?: 'click' | 'drag' | 'key' | 'hint') => void;
  recordAnswer: (isCorrect: boolean, details?: {
    problem?: string;
    userAnswer?: string;
    correctAnswer?: string;
  }) => void;
  recordHintUsed: () => void;
  saveSession: () => void;
  resetSession: () => void;
  getSessionInfo: () => {
    duration: number;
    score: number;
    totalInteractions: number;
    hintsUsed: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
  };
}

// デフォルト値（何もしない関数）
const defaultContext: LearningTrackerContextType = {
  recordInteraction: () => {},
  recordAnswer: () => {},
  recordHintUsed: () => {},
  saveSession: () => {},
  resetSession: () => {},
  getSessionInfo: () => ({
    duration: 0,
    score: 0,
    totalInteractions: 0,
    hintsUsed: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
  }),
};

// 学習追跡コンテキスト
const LearningTrackerContext = createContext<LearningTrackerContextType>(defaultContext);

// コンテキストを使用するためのカスタムフック
export const useLearningTrackerContext = () => {
  const context = useContext(LearningTrackerContext);
  if (!context) {
    console.warn('useLearningTrackerContext must be used within MaterialWrapper');
    return defaultContext;
  }
  return context;
};

interface MaterialWrapperProps extends UseLearningTrackerOptions {
  children: ReactNode;
  showMetricsButton?: boolean; // 学習メトリクスボタンの表示/非表示
  showAssistant?: boolean; // 学習アシスタントの表示/非表示
  className?: string;
}

/**
 * 教材をラップして学習追跡機能を提供するコンポーネント
 * 
 * 使用例:
 * ```tsx
 * <MaterialWrapper materialId="number-blocks" materialName="数の合成・分解ブロック">
 *   <NumberBlocks />
 * </MaterialWrapper>
 * ```
 */
export const MaterialWrapper: React.FC<MaterialWrapperProps> = ({
  children,
  materialId,
  materialName,
  minDuration = 10,
  autoSave = true,
  showMetricsButton = true,
  showAssistant = true,
  className,
}) => {
  const [showMetrics, setShowMetrics] = React.useState(false);
  
  // 学習追跡フックを使用
  const tracker = useLearningTracker({
    materialId,
    materialName,
    minDuration,
    autoSave,
  });

  // コンテキスト値を作成
  const contextValue: LearningTrackerContextType = {
    recordInteraction: tracker.recordInteraction,
    recordAnswer: tracker.recordAnswer,
    recordHintUsed: tracker.recordHintUsed,
    saveSession: tracker.saveSession,
    resetSession: tracker.resetSession,
    getSessionInfo: tracker.getSessionInfo,
  };

  return (
    <LearningTrackerContext.Provider value={contextValue}>
      <Box className={className} sx={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* 教材本体 */}
        {children}
        
        {/* 学習メトリクスボタン（オプション） */}
        {showMetricsButton && (
          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <Tooltip title="学習レポート" placement="left">
              <IconButton
                onClick={() => setShowMetrics(true)}
                sx={{
                  position: 'fixed',
                  bottom: showAssistant ? 80 : 20,
                  right: 20,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  boxShadow: 3,
                  zIndex: 1000,
                }}
              >
                <AssessmentIcon />
              </IconButton>
            </Tooltip>
          </Zoom>
        )}
        
        {/* 学習メトリクスダイアログ */}
        {showMetrics && (
          <LearningMetrics
            materialId={materialId}
            showButton={false}
          />
        )}
        
        {/* 学習アシスタント（オプション） */}
        {showAssistant && (
          <LearningAssistant materialId={materialId} />
        )}
      </Box>
    </LearningTrackerContext.Provider>
  );
};

// 高階コンポーネント（HOC）バージョン
export function withLearningTracker<P extends object>(
  Component: React.ComponentType<P>,
  options: UseLearningTrackerOptions & {
    showMetricsButton?: boolean;
    showAssistant?: boolean;
  }
) {
  return React.forwardRef<any, P>((props, ref) => {
    return (
      <MaterialWrapper {...options}>
        <Component {...props} ref={ref} />
      </MaterialWrapper>
    );
  });
}

// 学習追跡を有効にする簡易ラッパー
export const TrackedMaterial: React.FC<{
  materialId: string;
  materialName: string;
  children: ReactNode;
}> = ({ materialId, materialName, children }) => {
  return (
    <MaterialWrapper
      materialId={materialId}
      materialName={materialName}
      showMetricsButton={true}
      showAssistant={true}
    >
      {children}
    </MaterialWrapper>
  );
};