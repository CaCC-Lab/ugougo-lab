import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { Card } from './components/common/Card';
import { Button } from './components/common/Button';
import { GradeSelector } from './components/common/GradeSelector';
import { Typography, Box, Grid, Dialog, DialogContent, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { GradeLevel, Material } from './types';
import { useTheme } from './hooks/useTheme';
import { NumberBlocks } from './materials/elementary/grade1/math';
import { TownExplorationMap } from './materials/elementary/grade2/life';
import { InsectMetamorphosisSimulator } from './materials/elementary/grade3/science';
import { CompassSimulator } from './materials/elementary/grade3/social';
import { AngleMeasurementTool } from './materials/elementary/grade4/math';
import { PrefecturePuzzle } from './materials/elementary/grade4/social';
import { WeatherChangeSimulator } from './materials/elementary/grade5/science';
import { IndustrialZoneMap } from './materials/elementary/grade5/social';

// 実装済み教材データ
const materials: Material[] = [
  {
    id: 'number-blocks-1',
    title: '数の合成・分解ブロック',
    description: '10までの数を、ブロックを使って楽しく学ぼう！ドラッグ&ドロップで数の概念を理解できます。',
    gradeLevel: 'elementary1',
    subject: 'math',
    tags: ['数の合成', '数の分解', 'ドラッグ&ドロップ', '10までの数'],
    difficulty: 'easy',
    estimatedTime: 15,
    isPremium: false,
  },
  {
    id: 'multiplication-visualization-2',
    title: 'かけ算九九の視覚化',
    description: 'アニメーションでかけ算の仕組みがよくわかる！（準備中）',
    gradeLevel: 'elementary2',
    subject: 'math',
    tags: ['かけ算', '九九', 'アニメーション'],
    difficulty: 'normal',
    estimatedTime: 20,
    isPremium: false,
  },
  {
    id: 'town-exploration-map-2',
    title: '町たんけんマップ',
    description: 'まちのいろいろな場所をたんけんして、それぞれの役割を学ぼう！',
    gradeLevel: 'elementary2',
    subject: 'life',
    tags: ['地域', '施設', '探検', 'マップ'],
    difficulty: 'easy',
    estimatedTime: 15,
    isPremium: false,
  },
  {
    id: 'number-line-integers-3',
    title: '正負の数の数直線',
    description: '数直線を使って、マイナスの数も理解しよう！（準備中）',
    gradeLevel: 'juniorHigh1',
    subject: 'math',
    tags: ['正負の数', '数直線', '整数'],
    difficulty: 'normal',
    estimatedTime: 25,
    isPremium: false,
  },
  {
    id: 'insect-metamorphosis-3',
    title: 'こんちゅうの変態シミュレーター',
    description: '完全変態と不完全変態の違いをアニメーションで学ぼう！',
    gradeLevel: 'elementary3',
    subject: 'science',
    tags: ['昆虫', '変態', '成長', '生物'],
    difficulty: 'easy',
    estimatedTime: 15,
    isPremium: false,
  },
  {
    id: 'compass-simulator-3',
    title: 'ほういじしんシミュレーター',
    description: '8つの方位を方位磁針で学ぼう！まちの目印も確認できるよ。',
    gradeLevel: 'elementary3',
    subject: 'social',
    tags: ['方位', '方位磁針', '地図', '社会'],
    difficulty: 'easy',
    estimatedTime: 15,
    isPremium: false,
  },
  {
    id: 'angle-measurement-4',
    title: 'かくど そくてい器',
    description: '分度器を使わずに角度を測る練習ができるよ！',
    gradeLevel: 'elementary4',
    subject: 'math',
    tags: ['角度', '鋭角', '直角', '鈍角'],
    difficulty: 'normal',
    estimatedTime: 20,
    isPremium: false,
  },
  {
    id: 'prefecture-puzzle-4',
    title: 'とどうふけんパズル',
    description: '日本地図のピースをドラッグして都道府県を覚えよう！',
    gradeLevel: 'elementary4',
    subject: 'social',
    tags: ['都道府県', '地図', 'パズル', '日本'],
    difficulty: 'normal',
    estimatedTime: 20,
    isPremium: false,
  },
  {
    id: 'weather-change-simulator-5',
    title: '天気の変化シミュレーター',
    description: '気圧配置と前線の動きから天気の変化を学ぼう！雲の形成や降水の仕組みもわかる！',
    gradeLevel: 'elementary5',
    subject: 'science',
    tags: ['天気', '気圧', '前線', '雲', '降水'],
    difficulty: 'normal',
    estimatedTime: 20,
    isPremium: false,
  },
  {
    id: 'industrial-zone-map-5',
    title: '工業地帯マップ',
    description: '日本の主要な工業地帯の位置と特徴を学ぼう！各地域の生産品や産業の違いがわかる！',
    gradeLevel: 'elementary5',
    subject: 'social',
    tags: ['工業地帯', '産業', '地図', '生産額'],
    difficulty: 'normal',
    estimatedTime: 20,
    isPremium: false,
  },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentGrade, setCurrentGrade] = useState<GradeLevel>('elementary1');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const { setThemeMode } = useTheme();

  // 学年が変更されたときの処理
  const handleGradeChange = (grade: GradeLevel) => {
    setCurrentGrade(grade);
    
    // 学年に応じてテーマを自動切り替え
    if (grade.startsWith('elementary')) {
      setThemeMode('elementary');
    } else if (grade.startsWith('juniorHigh')) {
      setThemeMode('juniorHigh');
    } else {
      setThemeMode('highSchool');
    }
  };

  // 教材を開く処理
  const handleOpenMaterial = (material: Material) => {
    if (material.id === 'number-blocks-1' || material.id === 'town-exploration-map-2' || material.id === 'insect-metamorphosis-3' || material.id === 'compass-simulator-3' || material.id === 'angle-measurement-4' || material.id === 'prefecture-puzzle-4' || material.id === 'weather-change-simulator-5' || material.id === 'industrial-zone-map-5') {
      setSelectedMaterial(material);
      setMaterialDialogOpen(true);
    } else {
      // 未実装の教材
      console.log(`教材「${material.title}」は準備中です`);
    }
  };

  // 教材を閉じる処理
  const handleCloseMaterial = () => {
    setMaterialDialogOpen(false);
    setSelectedMaterial(null);
  };

  // 教材完了時の処理
  const handleMaterialComplete = (progress: any) => {
    console.log('教材完了:', progress);
    // TODO: 学習履歴の保存
  };

  // 教材の進捗更新処理
  const handleMaterialProgress = (data: any) => {
    console.log('進捗更新:', data);
    // TODO: 進捗データの保存
  };

  return (
    <Layout
      currentGrade={currentGrade}
      onGradeChange={handleGradeChange}
      isAuthenticated={isAuthenticated}
      onLoginClick={() => setIsAuthenticated(true)}
      onLogoutClick={() => setIsAuthenticated(false)}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          動く教材へようこそ！
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          インタラクティブな教材で、楽しく学習しましょう。
          まずは学年を選択してください。
        </Typography>
      </Box>

      {/* 学年選択セクション */}
      {!isAuthenticated && (
        <Box sx={{ mb: 4, maxWidth: 400 }}>
          <GradeSelector
            value={currentGrade}
            onChange={handleGradeChange}
          />
        </Box>
      )}

      {/* 教材カードの表示 */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        おすすめの教材
      </Typography>
      
      <Grid container spacing={3}>
        {materials.map((material) => (
          <Grid item xs={12} sm={6} md={4} key={material.id}>
            <Card
              interactive
              onClick={() => handleOpenMaterial(material)}
            >
              <Typography variant="h5" component="h3" gutterBottom>
                {material.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {material.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ 
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}>
                  {material.subject === 'math' ? '算数・数学' : material.subject === 'life' ? '生活科' : material.subject === 'science' ? '理科' : material.subject === 'social' ? '社会' : material.subject}
                </Typography>
                <Typography variant="caption" sx={{ 
                  backgroundColor: 'secondary.main',
                  color: 'secondary.contrastText',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}>
                  {material.estimatedTime}分
                </Typography>
                {(material.id === 'number-blocks-1' || material.id === 'town-exploration-map-2' || material.id === 'insect-metamorphosis-3' || material.id === 'compass-simulator-3' || material.id === 'angle-measurement-4' || material.id === 'prefecture-puzzle-4' || material.id === 'weather-change-simulator-5' || material.id === 'industrial-zone-map-5') ? (
                  <Typography variant="caption" sx={{ 
                    backgroundColor: 'success.main',
                    color: 'success.contrastText',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}>
                    利用可能
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ 
                    backgroundColor: 'warning.main',
                    color: 'warning.contrastText',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}>
                    準備中
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ボタンのデモ */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary">
          学習を始める
        </Button>
        <Button variant="outlined" color="secondary">
          もっと見る
        </Button>
        <Button disabled>
          準備中
        </Button>
      </Box>

      {/* 教材ダイアログ */}
      <Dialog
        open={materialDialogOpen}
        onClose={handleCloseMaterial}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '90vh',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* 閉じるボタン */}
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
            <IconButton
              onClick={handleCloseMaterial}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 教材コンテンツ */}
          {selectedMaterial && selectedMaterial.id === 'number-blocks-1' && (
            <NumberBlocks
              material={selectedMaterial}
              onComplete={handleMaterialComplete}
              onProgress={handleMaterialProgress}
            />
          )}
          {selectedMaterial && selectedMaterial.id === 'town-exploration-map-2' && (
            <TownExplorationMap />
          )}
          {selectedMaterial && selectedMaterial.id === 'insect-metamorphosis-3' && (
            <InsectMetamorphosisSimulator />
          )}
          {selectedMaterial && selectedMaterial.id === 'compass-simulator-3' && (
            <CompassSimulator />
          )}
          {selectedMaterial && selectedMaterial.id === 'angle-measurement-4' && (
            <AngleMeasurementTool />
          )}
          {selectedMaterial && selectedMaterial.id === 'prefecture-puzzle-4' && (
            <PrefecturePuzzle />
          )}
          {selectedMaterial && selectedMaterial.id === 'weather-change-simulator-5' && (
            <WeatherChangeSimulator />
          )}
          {selectedMaterial && selectedMaterial.id === 'industrial-zone-map-5' && (
            <IndustrialZoneMap />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default App;
