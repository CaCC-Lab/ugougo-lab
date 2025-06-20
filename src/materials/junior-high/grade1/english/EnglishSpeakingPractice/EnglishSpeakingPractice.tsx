import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Fade,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Help as HelpIcon,
  History as HistoryIcon,
  School as LearnIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { MaterialWrapper, useLearningTrackerContext } from '../../../../../components/wrappers/MaterialWrapper';
import { useSpeakingPractice } from './hooks';
import {
  ScenarioSelector,
  DialogueInterface,
  PronunciationGuide,
  ScenarioComplete
} from './components';
import { dialogueScenarios } from './data/dialogueScenarios';

type ViewMode = 'menu' | 'practice' | 'complete' | 'guide';

// 英語スピーキング練習（内部コンポーネント）
const EnglishSpeakingPracticeContent: React.FC = () => {
  const { recordInteraction, recordAnswer } = useLearningTrackerContext();
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [selectedTab, setSelectedTab] = useState(0);
  
  const {
    state,
    startScenario,
    selectOption,
    arrangeWords,
    checkArrangement,
    nextTurn,
    togglePronunciationHelp,
    getCurrentTurn,
    getProgress,
    getStatistics,
    reset,
    practiceHistory
  } = useSpeakingPractice();

  const handleSelectScenario = (scenario: typeof dialogueScenarios[0]) => {
    startScenario(scenario);
    setViewMode('practice');
    recordInteraction('click');
  };

  const handleOptionSelect = (optionId: string) => {
    const currentTurn = getCurrentTurn();
    if (currentTurn) {
      selectOption(currentTurn.id, optionId);
      recordInteraction('click');
    }
  };

  const handleArrangeWords = (words: string[]) => {
    const currentTurn = getCurrentTurn();
    if (currentTurn) {
      arrangeWords(currentTurn.id, words);
      // 自動的に答え合わせ
      if (words.length === currentTurn.words?.length) {
        setTimeout(() => {
          const result = checkArrangement(currentTurn.id);
          // 単語並び替えの結果を記録
          if (result !== undefined) {
            recordAnswer(result, {
              turnId: currentTurn.id,
              type: 'word-arrangement',
              words: words.join(' '),
              correct: currentTurn.words?.join(' ')
            });
          }
        }, 500);
      }
    }
  };

  const handleNext = () => {
    const currentTurn = getCurrentTurn();
    const nextIndex = state.currentTurnIndex + 1;
    
    if (state.currentScenario && nextIndex >= state.currentScenario.dialogue.length) {
      setViewMode('complete');
      // シナリオ完了時のスコアを記録
      recordAnswer(true, {
        scenarioId: state.currentScenario.id,
        scenarioTitle: state.currentScenario.titleJa,
        score: state.score,
        mistakes: state.mistakes,
        completed: true
      });
    } else {
      nextTurn();
    }
  };

  const handleReplay = () => {
    if (state.currentScenario) {
      startScenario(state.currentScenario);
      setViewMode('practice');
    }
  };

  const handleBackToMenu = () => {
    reset();
    setViewMode('menu');
    recordInteraction('click');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'menu':
        return (
          <Fade in>
            <Box>
              <Tabs
                value={selectedTab}
                onChange={(_, newValue) => {
                  setSelectedTab(newValue);
                  recordInteraction('click');
                }}
                variant="fullWidth"
                sx={{ mb: 3 }}
              >
                <Tab label="練習を始める" icon={<LearnIcon />} />
                <Tab label="発音ガイド" icon={<HelpIcon />} />
                <Tab label="学習履歴" icon={<HistoryIcon />} />
              </Tabs>

              {selectedTab === 0 && (
                <ScenarioSelector
                  scenarios={dialogueScenarios}
                  onSelectScenario={handleSelectScenario}
                  completedScenarios={state.completedScenarios}
                  practiceStats={getStatistics()}
                />
              )}

              {selectedTab === 1 && (
                <PronunciationGuide />
              )}

              {selectedTab === 2 && (
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    学習履歴
                  </Typography>
                  {practiceHistory.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      まだ練習記録がありません。練習を始めましょう！
                    </Typography>
                  ) : (
                    <Box>
                      {practiceHistory.slice(-10).reverse().map((record, index) => {
                        const scenario = dialogueScenarios.find(s => s.id === record.scenarioId);
                        if (!scenario) return null;
                        
                        return (
                          <Box
                            key={index}
                            sx={{
                              p: 2,
                              mb: 1,
                              bgcolor: 'grey.50',
                              borderRadius: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2">
                                {scenario.titleJa}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(record.completedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box display="flex" gap={2} alignItems="center">
                              <Typography variant="body2">
                                スコア: {record.score}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                時間: {Math.floor(record.timeSpent / 60)}分
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Paper>
              )}
            </Box>
          </Fade>
        );

      case 'practice':
        const currentTurn = getCurrentTurn();
        if (!currentTurn || !state.currentScenario) return null;

        return (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTurn.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Box mb={2}>
                <Button
                  startIcon={<BackIcon />}
                  onClick={handleBackToMenu}
                  size="small"
                >
                  メニューに戻る
                </Button>
              </Box>
              
              <DialogueInterface
                turn={currentTurn}
                onSelectOption={handleOptionSelect}
                onArrangeWords={handleArrangeWords}
                onNext={handleNext}
                selectedOption={state.selectedOptions[currentTurn.id]}
                arrangedWords={state.arrangedWords[currentTurn.id]}
                feedback={state.feedbackMessages[currentTurn.id]}
                progress={getProgress()}
                showPronunciationHelp={state.showPronunciationHelp}
                onToggleHelp={() => {
                  togglePronunciationHelp();
                  recordInteraction('click');
                }}
              />
            </motion.div>
          </AnimatePresence>
        );

      case 'complete':
        if (!state.currentScenario) return null;

        return (
          <ScenarioComplete
            scenario={state.currentScenario}
            score={state.score}
            mistakes={state.mistakes}
            timeSpent={0} // TODO: 実際の時間計測
            onReplay={() => {
              handleReplay();
              recordInteraction('click');
            }}
            onBackToMenu={handleBackToMenu}
          />
        );

      default:
        return null;
    }
  };

  return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {renderContent()}
      </Container>
  );
};

// 英語スピーキング練習（MaterialWrapperでラップ）
const EnglishSpeakingPractice: React.FC = () => {
  return (
    <MaterialWrapper
      materialId="english-speaking-practice"
      materialName="英語スピーキング練習"
      showMetricsButton={true}
      showAssistant={true}
    >
      <EnglishSpeakingPracticeContent />
    </MaterialWrapper>
  );
};

export default EnglishSpeakingPractice;