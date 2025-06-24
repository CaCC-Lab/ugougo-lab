import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  Paper,
  Fab,
  Zoom,
  Alert,
  AlertTitle,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FunctionsIcon from '@mui/icons-material/Functions';
import SquareIcon from '@mui/icons-material/Square';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { MaterialWrapper, useLearningTrackerContext } from '../../../../../components/wrappers/MaterialWrapper';
import { ConceptBridge } from './components/ConceptBridge';
import { ProportionVisualizer } from './components/ProportionVisualizer';
import { AreaVolumeExplorer } from './components/AreaVolumeExplorer';
import { InvisiblePhenomenaVisualizer } from './components/InvisiblePhenomenaVisualizer';
import { useLearningProgress } from './hooks/useLearningProgress';
import { useEurekaAnimation } from './hooks/useEurekaAnimation';
import type { LearningModule } from './types';

// 抽象的思考への橋（内部コンポーネント）
const AbstractThinkingBridgeContent: React.FC = () => {
  const { recordInteraction, recordAnswer } = useLearningTrackerContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const { progress, updateProgress, getRecommendedModule } = useLearningProgress();
  const { showEureka, triggerEureka, EurekaAnimation } = useEurekaAnimation();

  const modules: LearningModule[] = [
    {
      id: 'concept-bridge',
      title: '具体から抽象へ',
      icon: <PsychologyIcon />,
      component: ConceptBridge,
      description: '身近な例から抽象的な考え方を学ぼう'
    },
    {
      id: 'proportion',
      title: '比例と反比例',
      icon: <FunctionsIcon />,
      component: ProportionVisualizer,
      description: '変化の関係を目で見て理解しよう'
    },
    {
      id: 'area-volume',
      title: '面積と体積',
      icon: <SquareIcon />,
      component: AreaVolumeExplorer,
      description: '公式がなぜそうなるのかを体験しよう'
    },
    {
      id: 'invisible-phenomena',
      title: '見えない力',
      icon: <BoltOutlinedIcon />,
      component: InvisiblePhenomenaVisualizer,
      description: '電気や磁気の不思議を見てみよう'
    }
  ];

  useEffect(() => {
    // 初回起動時の説明を表示
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    recordInteraction('click');
  };

  const handleConceptMastered = (conceptId: string) => {
    updateProgress(modules[activeTab].id, conceptId);
    triggerEureka();
    
    // 学習成果を記録
    recordAnswer(true, {
      module: modules[activeTab].id,
      concept: conceptId,
      title: modules[activeTab].title
    });
  };

  const ActiveComponent = modules[activeTab].component;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                mx: { xs: 1, sm: 0 }
              }}
              onClose={() => {
                setShowIntro(false);
                recordInteraction('click');
              }}
            >
              <AlertTitle>抽象的思考への橋渡し</AlertTitle>
              ここでは、具体的なものから抽象的な考え方へ少しずつステップアップしていきます。
              各モジュールで「わかった！」という瞬間を体験してください。
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          抽象的思考の橋
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          目に見えないものを理解する力を育てよう
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {modules.map((module, index) => (
            <Tab
              key={module.id}
              {...(module.icon && React.isValidElement(module.icon) && { icon: module.icon })}
              label={module.title}
              id={`module-tab-${index}`}
              aria-controls={`module-tabpanel-${index}`}
              sx={{
                minHeight: { xs: 60, sm: 80 },
                '& .MuiTab-iconWrapper': {
                  mb: 1
                }
              }}
            />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ position: 'relative', minHeight: 600 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                minHeight: 600,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Typography variant="h5" gutterBottom>
                {modules[activeTab].title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {modules[activeTab].description}
              </Typography>
              
              <ActiveComponent 
                onConceptMastered={handleConceptMastered}
                progress={progress[modules[activeTab].id] || {}}
              />
            </Paper>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* 学習進捗の推奨表示 */}
      <Zoom in={progress && Object.keys(progress).length > 0}>
        <Fab
          color="secondary"
          variant="extended"
          sx={{
            position: 'fixed',
            bottom: { xs: 80, sm: 16 },
            right: 16,
          }}
          onClick={() => {
            const recommended = getRecommendedModule(modules);
            if (recommended) {
              const index = modules.findIndex(m => m.id === recommended.id);
              if (index !== -1) {
                setActiveTab(index);
                recordInteraction('click');
              }
            }
          }}
        >
          <PsychologyIcon sx={{ mr: 1 }} />
          次のおすすめ
        </Fab>
      </Zoom>

      {/* わかった！アニメーション */}
      <EurekaAnimation />

      {/* 全体の進捗状況 */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          学習の進み具合
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {modules.map((module) => {
            const moduleProgress = progress[module.id] || {};
            const masteredCount = Object.values(moduleProgress).filter(Boolean).length;
            const totalConcepts = 5; // 各モジュールの概念数（実際の実装に応じて調整）
            const percentage = (masteredCount / totalConcepts) * 100;

            return (
              <Paper
                key={module.id}
                sx={{
                  p: 2,
                  flex: '1 1 200px',
                  textAlign: 'center',
                  background: percentage === 100 
                    ? 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)'
                    : undefined,
                  color: percentage === 100 ? 'white' : undefined
                }}
              >
                {module.icon}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {module.title}
                </Typography>
                <Typography variant="h6">
                  {Math.round(percentage)}%
                </Typography>
                {percentage === 100 && <CelebrationIcon sx={{ mt: 1 }} />}
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Container>
  );
};

// 抽象的思考への橋（MaterialWrapperでラップ）
const AbstractThinkingBridge: React.FC = () => {
  return (
    <MaterialWrapper
      materialId="abstract-thinking-bridge"
      materialName="抽象的思考への橋"
      showMetricsButton={true}
      showAssistant={true}
    >
      <AbstractThinkingBridgeContent />
    </MaterialWrapper>
  );
};

export default AbstractThinkingBridge;