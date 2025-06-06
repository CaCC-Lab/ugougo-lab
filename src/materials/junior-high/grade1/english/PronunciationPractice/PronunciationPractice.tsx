import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Fade
} from '@mui/material';
import {
  Help as HelpIcon,
  Assessment as AssessmentIcon,
  RecordVoiceOver as PhonemeIcon,
  Abc as WordIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { MaterialBase } from '../../../../../components/educational/MaterialBase';
import { usePronunciationPractice } from './hooks';
import {
  PhonemeSelector,
  PracticeInterface,
  ProgressDashboard
} from './components';

type ViewMode = 'select' | 'practice' | 'progress';

const PronunciationPractice: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [tabValue, setTabValue] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const {
    state,
    selectPhoneme,
    setPracticeMode,
    setDifficulty,
    startRecording,
    stopRecording,
    getStatistics,
    playSound,
    reset
  } = usePronunciationPractice();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) setViewMode('select');
    else if (newValue === 1) setViewMode('progress');
  };

  const handleSelectPhoneme = (phoneme: any) => {
    selectPhoneme(phoneme);
    setViewMode('practice');
    setTabValue(-1); // タブを非選択状態に
  };

  const handleBackToSelect = () => {
    setViewMode('select');
    setTabValue(0);
  };

  const handlePracticeModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'phoneme' | 'word'
  ) => {
    if (newMode !== null) {
      setPracticeMode(newMode);
    }
  };

  const statistics = getStatistics();

  return (
    <MaterialBase
      title="発音練習ツール"
      description="英語の音素（母音・子音）から単語まで、段階的に発音を練習しよう！"
      learningObjectives={[
        '英語の基本的な音素を正しく発音できる',
        '日本語にない音の違いを理解する',
        '単語レベルで正確な発音ができる',
        '発音の自己評価と改善ができる'
      ]}
      onReset={reset}
    >
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{ display: viewMode === 'practice' ? 'none' : 'block' }}
              >
                <Tab label="音素を選ぶ" />
                <Tab label="学習進捗" icon={<AssessmentIcon />} iconPosition="end" />
              </Tabs>

              {viewMode === 'select' && (
                <ToggleButtonGroup
                  value={state.practiceMode}
                  exclusive
                  onChange={handlePracticeModeChange}
                  size="small"
                >
                  <ToggleButton value="phoneme">
                    <PhonemeIcon sx={{ mr: 1 }} />
                    音素練習
                  </ToggleButton>
                  <ToggleButton value="word">
                    <WordIcon sx={{ mr: 1 }} />
                    単語練習
                  </ToggleButton>
                </ToggleButtonGroup>
              )}
            </Box>

            <Tooltip title="使い方">
              <IconButton onClick={() => setShowHelp(!showHelp)}>
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light' }}>
                  <Typography variant="h6" gutterBottom>
                    <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    使い方
                  </Typography>
                  <Typography variant="body2" paragraph>
                    1. 練習したい音素を選びます（かんたん→むずかしい順がおすすめ）
                  </Typography>
                  <Typography variant="body2" paragraph>
                    2. 「音素練習」では基本的な音を、「単語練習」では実際の単語で練習します
                  </Typography>
                  <Typography variant="body2" paragraph>
                    3. マイクボタンをタップして発音し、AIがあなたの発音を評価します
                  </Typography>
                  <Typography variant="body2">
                    4. 「学習進捗」タブで、これまでの成長を確認できます
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {viewMode === 'select' && (
              <Fade in key="select">
                <Box>
                  <PhonemeSelector
                    onSelectPhoneme={handleSelectPhoneme}
                    selectedPhoneme={state.currentPhoneme}
                    difficulty={state.difficulty}
                    onDifficultyChange={setDifficulty}
                  />
                </Box>
              </Fade>
            )}

            {viewMode === 'practice' && state.currentPhoneme && (
              <Fade in key="practice">
                <Box>
                  <PracticeInterface
                    phoneme={state.currentPhoneme}
                    practiceMode={state.practiceMode}
                    isRecording={state.isRecording}
                    isPracticing={state.isPracticing}
                    currentScore={state.currentScore}
                    recognizedText={state.recognizedText}
                    feedback={state.feedback}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    onPlaySound={playSound}
                    onBack={handleBackToSelect}
                  />
                </Box>
              </Fade>
            )}

            {viewMode === 'progress' && (
              <Fade in key="progress">
                <Box>
                  <ProgressDashboard
                    statistics={statistics}
                    practiceResults={state.practiceResults}
                  />
                </Box>
              </Fade>
            )}
          </AnimatePresence>
        </Paper>
      </Container>
    </MaterialBase>
  );
};

export default PronunciationPractice;