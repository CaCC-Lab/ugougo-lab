import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  School as SchoolIcon,
  Functions as FunctionsIcon,
  Language as LanguageIcon,
  Science as ScienceIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { MaterialWrapper } from '../components/wrappers/MaterialWrapper';
import { useLearningStore } from '../stores/learningStore';
import AdditionSubtractionVisualizer from '../components/AdditionSubtractionVisualizer';
import AlgebraicExpressionTool from '../components/AlgebraicExpressionTool';
import HiraganaStrokeOrder from '../components/HiraganaStrokeOrder';
import WaterStateAnimation from '../components/WaterStateAnimation';

/**
 * 学習履歴システムの統合実装例
 * 
 * このコンポーネントは、複数の教材を学習履歴システムと統合して使用する例を示します。
 * 各教材は MaterialWrapper でラップされ、学習進捗が自動的に記録されます。
 */

interface Material {
  id: string;
  name: string;
  subject: string;
  icon: React.ReactNode;
  component: React.ComponentType<{ onClose: () => void }>;
  description: string;
}

const materials: Material[] = [
  {
    id: 'addition-subtraction',
    name: 'たし算・ひき算ビジュアライザー',
    subject: '算数',
    icon: <FunctionsIcon />,
    component: AdditionSubtractionVisualizer,
    description: 'リンゴを使って、たし算とひき算を視覚的に学習します。',
  },
  {
    id: 'algebraic-expression',
    name: '文字式変形ツール',
    subject: '数学',
    icon: <FunctionsIcon />,
    component: AlgebraicExpressionTool,
    description: '文字式の展開、因数分解、同類項の整理を練習します。',
  },
  {
    id: 'hiragana-stroke',
    name: 'ひらがな書き順アニメーション',
    subject: '国語',
    icon: <LanguageIcon />,
    component: HiraganaStrokeOrder,
    description: 'ひらがなの正しい書き順をアニメーションで学習します。',
  },
  {
    id: 'water-state',
    name: '水の三態変化アニメーション',
    subject: '理科',
    icon: <ScienceIcon />,
    component: WaterStateAnimation,
    description: '水の固体・液体・気体への変化を観察します。',
  },
];

const IntegratedLearningExample: React.FC = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const { progress, getTotalLearningTime, getStreakDays } = useLearningStore();

  // 教材ごとの進捗を取得
  const getMaterialProgress = (materialId: string) => {
    const materialProgress = progress.find(p => p.materialId === materialId);
    return materialProgress?.masteryLevel || 0;
  };

  // 総学習時間を時間形式に変換
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  const totalTime = getTotalLearningTime();
  const streakDays = getStreakDays();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          学習履歴対応 教材一覧
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          各教材での学習時間や成績が自動的に記録され、あなたの学習をサポートします。
        </Typography>
        
        {/* 学習統計 */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Chip
            label={`総学習時間: ${formatTime(totalTime)}`}
            color="primary"
            size="medium"
          />
          <Chip
            label={`連続学習: ${streakDays}日`}
            color="secondary"
            size="medium"
          />
          <Chip
            label={`学習済み教材: ${progress.length}個`}
            color="success"
            size="medium"
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {materials.map((material) => {
          const progressValue = getMaterialProgress(material.id);
          const isStarted = progressValue > 0;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={material.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {isStarted && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      bgcolor: 'success.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      boxShadow: 2,
                    }}
                  >
                    {Math.round(progressValue)}%
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {material.icon}
                    <Typography variant="h6" component="h2" sx={{ ml: 1 }}>
                      {material.name}
                    </Typography>
                  </Box>
                  
                  <Chip
                    label={material.subject}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary">
                    {material.description}
                  </Typography>
                  
                  {isStarted && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        習熟度
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: 8,
                          bgcolor: 'grey.200',
                          borderRadius: 4,
                          overflow: 'hidden',
                          mt: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: `${progressValue}%`,
                            height: '100%',
                            bgcolor: 'success.main',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    fullWidth
                    variant={isStarted ? 'outlined' : 'contained'}
                    onClick={() => setSelectedMaterial(material)}
                  >
                    {isStarted ? '続きから学習' : '学習を開始'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 教材ダイアログ */}
      <Dialog
        open={Boolean(selectedMaterial)}
        onClose={() => setSelectedMaterial(null)}
        maxWidth="lg"
        fullWidth
      >
        {selectedMaterial && (
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <IconButton
              onClick={() => setSelectedMaterial(null)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                zIndex: 1,
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
            
            <MaterialWrapper
              materialId={selectedMaterial.id}
              materialName={selectedMaterial.name}
              minDuration={10}
              autoSave={true}
              showMetricsButton={true}
              showAssistant={true}
            >
              <selectedMaterial.component onClose={() => setSelectedMaterial(null)} />
            </MaterialWrapper>
          </DialogContent>
        )}
      </Dialog>
    </Container>
  );
};

export default IntegratedLearningExample;