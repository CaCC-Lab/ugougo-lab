// 時差計算ツール メインコンポーネント
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Divider,
  Chip,
  Alert,
  Button
} from '@mui/material';
import {
  Public as PublicIcon,
  AccessTime as AccessTimeIcon,
  Quiz as QuizIcon,
  Info as InfoIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from '../../../../../components/wrappers/MaterialWrapper';
import { WorldMap, ClockDisplay, TimeZoneQuiz, DateLineExplanation } from './components';
import { useTimeZoneCalculation } from './hooks';
import { cities, quizQuestions } from './data/cityData';
import type { City } from './data/cityData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// 時差計算ツール（内部コンポーネント）
const TimeZoneCalculatorContent: React.FC = () => {
  const { recordInteraction, recordAnswer } = useLearningTrackerContext();
  const [tabValue, setTabValue] = useState(0);
  const [selectedCityMode, setSelectedCityMode] = useState<'base' | 'target'>('base');
  
  const {
    baseCity,
    targetCity,
    setBaseCity,
    setTargetCity,
    getCityTime,
    calculateTimeDifference,
    calculateTheoreticalTimeDifference
  } = useTimeZoneCalculation();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    recordInteraction('click');
  };

  const handleCityClick = (city: City) => {
    if (selectedCityMode === 'base') {
      setBaseCity(city);
      if (!targetCity) {
        setSelectedCityMode('target');
      }
    } else {
      setTargetCity(city);
    }
    recordInteraction('click');
  };

  const handleQuizComplete = (score?: number) => {
    setTabValue(0);
    if (score !== undefined) {
      recordAnswer(score >= 70, {
        problem: '時差計算クイズ',
        userAnswer: `スコア: ${score}%`,
        correctAnswer: '70%以上で合格'
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PublicIcon fontSize="large" />
          時差計算ツール
        </Typography>
        
        <Typography variant="body1" color="textSecondary" paragraph>
          世界の主要都市の時差を計算し、地球の自転と時間の関係を学習しましょう。
        </Typography>

        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<AccessTimeIcon />} 
              label="時差計算" 
              iconPosition="start"
            />
            <Tab 
              icon={<QuizIcon />} 
              label="練習問題" 
              iconPosition="start"
            />
            <Tab 
              icon={<InfoIcon />} 
              label="日付変更線" 
              iconPosition="start"
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  地図上の都市をクリックして、基準都市と比較都市を選択してください。
                  時差は地球の自転によって生まれ、経度15度ごとに1時間の時差があります。
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant={selectedCityMode === 'base' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => {
                    setSelectedCityMode('base');
                    recordInteraction('click');
                  }}
                  startIcon={<CalculateIcon />}
                >
                  基準都市を選択
                </Button>
                <Button
                  variant={selectedCityMode === 'target' ? 'contained' : 'outlined'}
                  color="secondary"
                  onClick={() => {
                    setSelectedCityMode('target');
                    recordInteraction('click');
                  }}
                  startIcon={<CalculateIcon />}
                >
                  比較都市を選択
                </Button>
              </Box>

              <WorldMap
                cities={cities}
                selectedBaseCity={baseCity}
                selectedTargetCity={targetCity}
                onCityClick={handleCityClick}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              {baseCity && (
                <Grid item xs={12} md={6}>
                  <ClockDisplay
                    city={baseCity}
                    time={getCityTime(baseCity)}
                    label="基準都市"
                    color="primary"
                  />
                </Grid>
              )}
              
              {targetCity && (
                <Grid item xs={12} md={6}>
                  <ClockDisplay
                    city={targetCity}
                    time={getCityTime(targetCity)}
                    label="比較都市"
                    color="secondary"
                  />
                </Grid>
              )}
            </Grid>

            {baseCity && targetCity && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  時差の計算
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      <strong>実際の時差:</strong>
                    </Typography>
                    <Typography variant="body1">
                      {targetCity.nameJa}は{baseCity.nameJa}より
                      <Chip 
                        label={`${Math.abs(calculateTimeDifference(baseCity, targetCity))}時間`}
                        color="primary"
                        size="small"
                        sx={{ mx: 1 }}
                      />
                      {calculateTimeDifference(baseCity, targetCity) > 0 ? '進んでいます' : '遅れています'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      <strong>理論的な時差（経度差から）:</strong>
                    </Typography>
                    <Typography variant="body1">
                      経度差: {Math.abs(targetCity.longitude - baseCity.longitude).toFixed(1)}度
                      ≈ {Math.abs(calculateTheoreticalTimeDifference(baseCity, targetCity)).toFixed(1)}時間
                    </Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                  ※実際の時差は、国や地域の政策により理論値と異なる場合があります
                </Typography>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TimeZoneQuiz
              questions={quizQuestions}
              onComplete={handleQuizComplete}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <DateLineExplanation />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

// 時差計算ツール（MaterialWrapperでラップ）
const TimeZoneCalculator: React.FC = () => {
  return (
    <MaterialWrapper
      materialId="time-zone-calculator"
      materialName="時差計算ツール"
      showMetricsButton={true}
      showAssistant={true}
    >
      <TimeZoneCalculatorContent />
    </MaterialWrapper>
  );
};

export default TimeZoneCalculator;