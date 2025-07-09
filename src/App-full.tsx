import { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  CssBaseline, 
  AppBar,
  Toolbar,
  Typography,
  Button, 
  Card, 
  CardContent, 
  Box,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogContent,
  IconButton,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import MouseIcon from '@mui/icons-material/Mouse';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import MultiplicationVisualization from './components/MultiplicationVisualization';
import NumberLineIntegers from './components/NumberLineIntegers';
import FractionVisualization from './components/FractionVisualization';
import AtomMoleculeSimulation from './components/AtomMoleculeSimulation';
import FunctionGraphTool from './components/FunctionGraphTool';
import SortingVisualization from './components/SortingVisualization';
import MovingPointP from './components/MovingPointP';
import ElementPuzzleGame from './components/ElementPuzzleGame';
import InertiaSimulation from './components/InertiaSimulation';
import TypingPuyoGame from './components/TypingPuyoGame';
import AdditionSubtractionVisualizer from './components/AdditionSubtractionVisualizer';
import HiraganaStrokeOrder from './components/HiraganaStrokeOrder';
import PlantGrowthSimulator from './components/PlantGrowthSimulator';
import FractionPizzaCutter from './components/FractionPizzaCutter';
import ElectricCircuitSimulator from './components/ElectricCircuitSimulator';
import LinearFunctionGrapher from './components/LinearFunctionGrapher';
import LightRefractionExperiment from './components/LightRefractionExperiment';
import ChemicalReactionSimulator from './components/ChemicalReactionSimulator';
import ClockLearningTool from './components/ClockLearningTool';
import UnitConversionTool from './components/UnitConversionTool';
import MagnetExperiment from './components/MagnetExperiment';
import AreaCalculator from './components/AreaCalculator';
import AlgebraicExpressionTool from './components/AlgebraicExpressionTool';
import WaterStateAnimation from './components/WaterStateAnimation';
import SpeedTimeDistanceSimulator from './components/SpeedTimeDistanceSimulator';
import PendulumExperiment from './components/PendulumExperiment';
import ProportionGraphToolLazy from './components/ProportionGraphToolLazy';
import LeverPrincipleExperimentLazy from './components/LeverPrincipleExperimentLazy';
import QuadraticFunctionGraph from './components/QuadraticFunctionGraph';
import CelestialMotionSimulatorLazy from './components/CelestialMotionSimulatorLazy';
import TrigonometricFunctionGraph from './components/TrigonometricFunctionGraph';
import CalculusVisualizer from './components/CalculusVisualizer';
import PictureWordMatching from './components/PictureWordMatching';
import TownExplorationMap from './components/TownExplorationMap';
import InsectMetamorphosisSimulator from './components/InsectMetamorphosisSimulator';
import CompassSimulator from './components/CompassSimulator';
import AngleMeasurementTool from './components/AngleMeasurementTool';
import PrefecturePuzzle from './components/PrefecturePuzzle';
import WeatherChangeSimulator from './components/WeatherChangeSimulator';
import IndustrialZoneMap from './components/IndustrialZoneMap';
import CombinationSimulator from './components/CombinationSimulator';
import HumanBodyAnimation from './components/HumanBodyAnimation';

// 新しい教材のインポート（materials配下から）
import { AbstractThinkingBridge } from './materials/elementary/grade4/integrated/AbstractThinkingBridge';
import { FractionMasterTool } from './materials/elementary/grade3/math/FractionMasterTool';
import DecimalMaster from './materials/elementary/grade3/math/DecimalMaster';
import PercentageTrainer from './materials/elementary/grade5/math/PercentageTrainer';
import { EnglishSpeakingPractice, PronunciationPractice } from './materials/junior-high/grade1/english';
import { AlgebraIntroductionSystem } from './materials/junior-high/grade1/math/AlgebraIntroductionSystem';
// import { EquationBuilder } from './materials/junior-high/grade1/math/EquationBuilder';
import { FractionTrainer } from './materials/elementary/grade3/math/FractionTrainer';
import { FractionMasterLab } from './materials/elementary/grade3/math/FractionMasterLab';
import { ErrorBoundary } from './components/ErrorBoundary';
// import { EarthquakeWaveSimulator } from './materials/junior-high/grade1/science';
import { TimeZoneCalculator } from './materials/junior-high/grade1/social';
import { ProofStepBuilder } from './materials/junior-high/grade2/math';
import { ElectricityExperiment } from './materials/junior-high/grade2/science';
import { ProgressDashboard } from './components/dashboard/ProgressDashboard';
import { MaterialWrapper, useLearningTrackerContext } from './components/wrappers/MaterialWrapper';
import MaterialSettingsPanel from './components/admin/MaterialSettingsPanel';
import { useMaterialSettingsStore } from './stores/materialSettingsStore';
import { MouseSkillDashboard } from './components/mouse-practice/MouseSkillDashboard';
import { PrefecturePuzzleWithPractice } from './components/mouse-practice';
import MathCalculationMaster from './materials/elementary/grade1/math/MathCalculationMaster';
import { DashboardPage } from './features/dashboard/DashboardPage';

// TODO: MaterialComponentPropsの問題を解決後に有効化
// import { NumberBlocks } from './materials/elementary/grade1/math';
// import { TownExplorationMap } from './materials/elementary/grade2/life';
// import { InsectMetamorphosisSimulator } from './materials/elementary/grade3/science';
// import { CompassSimulator } from './materials/elementary/grade3/social';
// import { AngleMeasurementTool } from './materials/elementary/grade4/math';
// import { PrefecturePuzzle } from './materials/elementary/grade4/social';
// import { WeatherChangeSimulator } from './materials/elementary/grade5/science';
// import { IndustrialZoneMap } from './materials/elementary/grade5/social';
// import { CombinationSimulator } from './materials/elementary/grade6/math';
// import { HumanBodyAnimation } from './materials/elementary/grade6/science';

// 学年別テーマ
const themes = {
  elementary: createTheme({
    palette: {
      primary: { main: '#FF6B6B' },
      secondary: { main: '#4ECDC4' },
    },
    typography: {
      fontSize: 16,
      h1: { fontSize: '2.5rem', fontWeight: 600 },
    },
  }),
  juniorHigh: createTheme({
    palette: {
      primary: { main: '#3F51B5' },
      secondary: { main: '#FF4081' },
    },
    typography: {
      fontSize: 14,
      h1: { fontSize: '2rem', fontWeight: 500 },
    },
  }),
  highSchool: createTheme({
    palette: {
      primary: { main: '#1976D2' },
      secondary: { main: '#424242' },
    },
    typography: {
      fontSize: 14,
      h1: { fontSize: '1.75rem', fontWeight: 400 },
    },
  }),
};

// 数の合成・分解教材（内部コンポーネント）
function NumberBlocksMaterialContent({ onClose }: { onClose: () => void }) {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const [target, setTarget] = useState(Math.floor(Math.random() * 16) + 4); // 4〜19
  const [currentSum, setCurrentSum] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [message, setMessage] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [_lastBonus, setLastBonus] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const numbers = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleNumberClick = (num: number) => {
    // インタラクションを記録
    recordInteraction('click');
    
    if (selectedNumbers.includes(num)) {
      const newSelected = selectedNumbers.filter(n => n !== num);
      setSelectedNumbers(newSelected);
      setCurrentSum(newSelected.reduce((sum, n) => sum + n, 0));
    } else {
      const newSelected = [...selectedNumbers, num];
      setSelectedNumbers(newSelected);
      const newSum = newSelected.reduce((sum, n) => sum + n, 0);
      setCurrentSum(newSum);
      
      // 合計が目標に達した場合
      if (newSum === target) {
        if (newSelected.length >= 2) {
          // 2つ以上の組み合わせの場合のみ正解
          // ボーナス得点の計算
          let bonus = 100; // 基本点
          if (newSelected.length === 3) bonus = 200;
          else if (newSelected.length === 4) bonus = 400;
          else if (newSelected.length >= 5) bonus = 800;
          
          // 学習履歴に正解を記録
          recordAnswer(true, {
            problem: `${target}を作る`,
            userAnswer: newSelected.join('+'),
            correctAnswer: `${newSelected.length}個の組み合わせで${target}`
          });
          
          const emoji = newSelected.length >= 5 ? '🌟' : newSelected.length >= 4 ? '⭐' : newSelected.length >= 3 ? '✨' : '🎉';
          setMessage(`せいかい！${emoji} ${newSelected.length}個の組み合わせ！ +${bonus}点`);
          setLastBonus(bonus);
          setTotalScore(prev => {
            const newScore = prev + bonus;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          setSuccessCount(prev => prev + 1);
          const newProgress = Math.min((successCount + 1) * 20, 100);
          setProgress(newProgress);
          
          // 進捗が100%になったら終了
          if (newProgress >= 100) {
            setTimeout(() => {
              setIsCompleted(true);
              setMessage('');
            }, 2500);
          } else {
            setTimeout(() => {
              // 次の目標は必ず複数の数の組み合わせが必要な値にする
              const nextTarget = Math.floor(Math.random() * 16) + 4; // 4〜19の範囲
              setTarget(nextTarget);
              setSelectedNumbers([]);
              setCurrentSum(0);
              setMessage('');
              setLastBonus(0);
            }, 2500);
          }
        } else {
          // 1つだけの場合は正解としない
          setMessage('2つ以上の数を組み合わせてね！');
          // 選択をリセット
          setTimeout(() => {
            setSelectedNumbers([]);
            setCurrentSum(0);
            setMessage('');
          }, 2000);
        }
      }
    }
  };

  const handleReset = () => {
    setSelectedNumbers([]);
    setCurrentSum(0);
    setProgress(0);
    setSuccessCount(0);
    setTarget(Math.floor(Math.random() * 16) + 4); // 4〜19
    setMessage('');
    setTotalScore(0);
    setLastBonus(0);
    setIsCompleted(false);
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          数の合成・分解ブロック
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 終了画面 */}
      {isCompleted ? (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
            <Typography variant="h3" sx={{ mb: 3, color: 'success.main' }}>
              🎊 すべてクリア！ 🎊
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 2 }}>
              5つの問題をすべて解きました！
            </Typography>
            
            <Box sx={{ my: 3 }}>
              <Paper elevation={2} sx={{ p: 2, backgroundColor: 'warning.light', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  最終スコア: {totalScore}点
                </Typography>
              </Paper>
              
              {highScore > 0 && (
                <Typography variant="h6" color="text.secondary">
                  ハイスコア: {highScore}点
                </Typography>
              )}
            </Box>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              数の合成・分解がとても上手になりました！
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={handleReset}
                sx={{ px: 4 }}
              >
                もう一度挑戦
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                onClick={onClose}
              >
                終了
              </Button>
            </Box>
          </Paper>
        </Box>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            1〜10のブロックを使って数の合成・分解を学ぼう！<strong>2つ以上の数字を組み合わせて</strong>目標の数を作ってください。
          </Typography>

          {/* 目標の数を大きく表示 */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              目標の数
            </Typography>
            <Paper elevation={3} sx={{ 
              display: 'inline-block', 
              px: 4, 
              py: 2, 
              backgroundColor: 'primary.main',
              color: 'primary.contrastText'
            }}>
              <Typography variant="h2" component="div" sx={{ fontWeight: 'bold' }}>
                {target}
              </Typography>
            </Paper>
          </Box>

          {/* 状況表示 */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip 
              label={`現在の合計: ${currentSum}`} 
              color={currentSum === target && selectedNumbers.length >= 2 ? 'success' : 'default'} 
              size="medium"
            />
            <Chip 
              label={`選択した数: ${selectedNumbers.length}個`} 
              color="info" 
              size="medium"
            />
            <Chip 
              label={`成功回数: ${successCount}`} 
              color="secondary" 
              size="medium"
            />
          </Box>

          {/* スコア表示 */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Paper elevation={2} sx={{ px: 2, py: 1, backgroundColor: 'warning.light' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                スコア: {totalScore}点
              </Typography>
            </Paper>
            {highScore > 0 && (
              <Paper elevation={2} sx={{ px: 2, py: 1, backgroundColor: 'info.light' }}>
                <Typography variant="body1">
                  ハイスコア: {highScore}点
                </Typography>
              </Paper>
            )}
          </Box>

          {/* 進捗バー */}
          {progress > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">進捗</Typography>
                <Typography variant="caption">{progress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          )}

          {/* メッセージ表示 */}
          {message && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Alert 
                severity={message.includes('せいかい') ? 'success' : 'info'}
                sx={{ display: 'inline-flex' }}
              >
                {message}
              </Alert>
            </Box>
          )}

          {/* 数字ブロック */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Grid container spacing={2} justifyContent="center">
              {numbers.map((num) => (
                <Grid item key={num}>
                  <Button
                    variant={selectedNumbers.includes(num) ? 'contained' : 'outlined'}
                    onClick={() => handleNumberClick(num)}
                    disabled={isCompleted}
                    sx={{ 
                      minWidth: 80, 
                      minHeight: 80,
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      boxShadow: selectedNumbers.includes(num) ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
                      transform: selectedNumbers.includes(num) ? 'translateY(-2px)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {num}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {/* 正解メッセージ（2つ以上組み合わせた場合のみ） */}
            {currentSum === target && selectedNumbers.length >= 2 && (
              <Typography 
                variant="h5" 
                color="success.main" 
                sx={{ mt: 3, textAlign: 'center', fontWeight: 'bold' }}
              >
                🎉 すばらしい！ {target} ができました！
              </Typography>
            )}
          </Box>

          {/* ボーナス点数の説明 */}
          <Box sx={{ mt: 'auto', mb: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" align="center" display="block">
              💡 たくさん組み合わせるとボーナス点がもらえるよ！
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption">2個: 100点</Typography>
              <Typography variant="caption">✨ 3個: 200点</Typography>
              <Typography variant="caption">⭐ 4個: 400点</Typography>
              <Typography variant="caption">🌟 5個以上: 800点</Typography>
            </Box>
          </Box>

          {/* フッター */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button variant="outlined" onClick={handleReset} size="large">
              リセット
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

// 数の合成・分解教材（MaterialWrapperでラップ）
function NumberBlocksMaterial({ onClose }: { onClose: () => void }) {
  return (
    <MaterialWrapper
      materialId="number-blocks"
      materialName="数の合成・分解ブロック"
      showMetricsButton={true}
      showAssistant={true}
    >
      <NumberBlocksMaterialContent onClose={onClose} />
    </MaterialWrapper>
  );
}

// たし算・ひき算ビジュアライザー（MaterialWrapperでラップ）
function AdditionSubtractionMaterial({ onClose }: { onClose: () => void }) {
  return (
    <MaterialWrapper
      materialId="addition-subtraction"
      materialName="たし算・ひき算ビジュアライザー"
      showMetricsButton={true}
      showAssistant={true}
    >
      <AdditionSubtractionVisualizer onClose={onClose} />
    </MaterialWrapper>
  );
}

// メインアプリ
function AppFull() {
  const [currentTheme, setCurrentTheme] = useState<'elementary' | 'juniorHigh' | 'highSchool'>('elementary');
  const [materialOpen, setMaterialOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMouseSkills, setShowMouseSkills] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // 教材表示設定ストアから取得
  const getVisibleMaterials = useMaterialSettingsStore(state => state.getVisibleMaterials);
  
  // 表示可能な教材を取得
  const visibleMaterials = getVisibleMaterials();
  
  // レガシー互換性のための変換（既存のコードに影響を与えないため）
  const materials = visibleMaterials.map(material => ({
    id: material.id,
    title: material.title,
    description: material.description,
    grade: material.gradeJapanese,
    subject: material.subjectJapanese,
    available: material.enabled && (material.status === 'published' || material.status === 'testing'),
  }));

  return (
    <ThemeProvider theme={themes[currentTheme]}>
      <CssBaseline />
      
      {/* ヘッダー */}
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            動く教材
          </Typography>
          
          <Button 
            color="inherit" 
            startIcon={<DashboardIcon />}
            onClick={() => {
              setShowDashboard(!showDashboard);
              setShowMouseSkills(false);
              setShowAnalytics(false);
            }}
            sx={{ mr: 2 }}
          >
            {showDashboard ? '教材一覧' : 'ダッシュボード'}
          </Button>
          
          <Button
            color="inherit"
            startIcon={<MouseIcon />}
            onClick={() => {
              setShowMouseSkills(!showMouseSkills);
              setShowDashboard(false);
              setShowAnalytics(false);
            }}
            sx={{ mr: 2 }}
          >
            {showMouseSkills ? '教材一覧' : 'マウススキル'}
          </Button>
          
          <Button
            color="inherit"
            startIcon={<AnalyticsIcon />}
            onClick={() => {
              setShowAnalytics(!showAnalytics);
              setShowDashboard(false);
              setShowMouseSkills(false);
            }}
            sx={{ mr: 2 }}
          >
            {showAnalytics ? '教材一覧' : '学習分析'}
          </Button>
          
          <Button
            color="inherit"
            startIcon={<SettingsIcon />}
            onClick={() => setShowSettings(true)}
            sx={{ mr: 2 }}
          >
            設定
          </Button>
          
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel sx={{ color: 'white' }}>学年</InputLabel>
            <Select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value as 'elementary' | 'juniorHigh' | 'highSchool')}
              sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
            >
              <MenuItem value="elementary">小学生</MenuItem>
              <MenuItem value="juniorHigh">中学生</MenuItem>
              <MenuItem value="highSchool">高校生</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      {showDashboard ? (
        <ProgressDashboard />
      ) : showMouseSkills ? (
        <MouseSkillDashboard />
      ) : showAnalytics ? (
        <DashboardPage />
      ) : (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            動く教材へようこそ！
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            インタラクティブな教材で、楽しく学習しましょう。
            学年を選択してテーマを変更できます。
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 4, mb: 2 }}>
            <Typography variant="h4" component="h2">
              {currentTheme === 'elementary' ? '小学生' : currentTheme === 'juniorHigh' ? '中学生' : '高校生'}向けの教材
            </Typography>
            <Chip 
              label={`${materials.filter((material) => {
                if (currentTheme === 'elementary') {
                  return material.grade.includes('小学');
                } else if (currentTheme === 'juniorHigh') {
                  return material.grade.includes('中学');
                } else if (currentTheme === 'highSchool') {
                  return material.grade.includes('高校');
                }
                return true;
              }).length} 教材`}
              color="primary"
            />
          </Box>
          
          <Grid container spacing={3}>
          {materials
            .filter((material) => {
              if (currentTheme === 'elementary') {
                return material.grade.includes('小学');
              } else if (currentTheme === 'juniorHigh') {
                return material.grade.includes('中学');
              } else if (currentTheme === 'highSchool') {
                return material.grade.includes('高校');
              }
              return true;
            })
            .map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: material.available ? 'pointer' : 'default',
                  opacity: material.available ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  '&:hover': material.available ? {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  } : {}
                }}
                onClick={() => {
                  if (material.available) {
                    setSelectedMaterial(material.id);
                    setMaterialOpen(true);
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {material.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {material.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={material.subject} size="small" color="primary" />
                    <Chip label={material.grade} size="small" color="secondary" />
                    <Chip 
                      label={material.available ? '利用可能' : '準備中'} 
                      size="small" 
                      color={material.available ? 'success' : 'warning'} 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        </Container>
      )}

      {/* 教材ダイアログ */}
      <Dialog
        open={materialOpen}
        onClose={() => {
          setMaterialOpen(false);
          setSelectedMaterial('');
        }}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* 選択された教材が本当に利用可能かチェック */}
          {(() => {
            const material = materials.find(m => m.id === selectedMaterial);
            if (!material || !material.available) {
              return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Alert severity="warning">
                    この教材は現在開発中のため利用できません。
                  </Alert>
                </Box>
              );
            }
            return null;
          })()}
          
          {/* 以下、各教材のレンダリング */}
          {selectedMaterial === 'addition-subtraction' && (
            <AdditionSubtractionMaterial onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'hiragana-stroke' && materials.find(m => m.id === 'hiragana-stroke')?.available && (
            <HiraganaStrokeOrder onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'picture-word-matching' && (
            <PictureWordMatching onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'clock-learning' && (
            <ClockLearningTool onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'number-blocks' && (
            <NumberBlocksMaterial onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'multiplication' && (
            <MultiplicationVisualization onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'unit-conversion' && (
            <UnitConversionTool onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'plant-growth' && (
            <PlantGrowthSimulator onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'fraction-visualization' && (
            <FractionVisualization onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'fraction-pizza' && (
            <FractionPizzaCutter onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'magnet-experiment' && (
            <MagnetExperiment onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'area-calculator' && (
            <AreaCalculator onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'water-state' && (
            <WaterStateAnimation onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'electric-circuit' && (
            <ElectricCircuitSimulator onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'number-line' && (
            <NumberLineIntegers onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'algebraic-expression' && (
            <AlgebraicExpressionTool onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'light-refraction' && (
            <LightRefractionExperiment onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'linear-function' && (
            <LinearFunctionGrapher onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'atom-molecule' && (
            <AtomMoleculeSimulation onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'chemical-reaction' && (
            <ChemicalReactionSimulator onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'electricity-experiment' && (
            <ElectricityExperiment />
          )}
          {selectedMaterial === 'sorting-algorithm' && (
            <SortingVisualization onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'function-graph' && (
            <FunctionGraphTool onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'moving-point-p' && (
            <MovingPointP onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'element-puzzle' && (
            <ElementPuzzleGame onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'inertia-simulation' && (
            <InertiaSimulation onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'typing-puyo' && (
            <TypingPuyoGame onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'speed-time-distance' && (
            <SpeedTimeDistanceSimulator onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'pendulum-experiment' && (
            <PendulumExperiment onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'proportion-graph' && (
            <ProportionGraphToolLazy onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'lever-principle' && (
            <LeverPrincipleExperimentLazy onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'quadratic-function' && (
            <QuadraticFunctionGraph onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'celestial-motion' && (
            <CelestialMotionSimulatorLazy onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'trigonometric-function' && (
            <TrigonometricFunctionGraph onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'calculus-visualizer' && (
            <CalculusVisualizer onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {/* 新しい教材（0から作成） */}
          {selectedMaterial === 'town-exploration-map' && (
            <TownExplorationMap onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'insect-metamorphosis' && (
            <InsectMetamorphosisSimulator onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'compass-simulator' && (
            <CompassSimulator onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'angle-measurement' && (
            <AngleMeasurementTool onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'prefecture-puzzle' && (
            <PrefecturePuzzleWithPractice onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'weather-change-simulator' && (
            <WeatherChangeSimulator onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'industrial-zone-map' && (
            <IndustrialZoneMap onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'combination-simulator' && (
            <CombinationSimulator onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'human-body-animation' && (
            <HumanBodyAnimation onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'abstract-thinking-bridge' && (
            <AbstractThinkingBridge />
          )}
          {selectedMaterial === 'fraction-master' && (
            <FractionMasterTool />
          )}
          {selectedMaterial === 'decimal-master' && (
            <DecimalMaster />
          )}
          {selectedMaterial === 'percentage-trainer' && (
            <ErrorBoundary onError={(error, info) => console.error('PercentageTrainer Error:', error, info)}>
              <PercentageTrainer onClose={() => setSelectedMaterial('')} />
            </ErrorBoundary>
          )}
          {selectedMaterial === 'equation-builder' && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                一次方程式構築ツール（メンテナンス中）
              </Typography>
              <Typography variant="body1" color="text.secondary">
                この教材は現在メンテナンス中です。しばらくお待ちください。
              </Typography>
            </Box>
          )}
          {selectedMaterial === 'fraction-trainer' && (
            <ErrorBoundary onError={(error, info) => console.error('FractionTrainer Error:', error, info)}>
              <FractionTrainer />
            </ErrorBoundary>
          )}
          {selectedMaterial === 'fraction-master-lab' && (
            <ErrorBoundary onError={(error, info) => console.error('FractionMasterLab Error:', error, info)}>
              <FractionMasterLab />
            </ErrorBoundary>
          )}
          {selectedMaterial === 'english-speaking-practice' && (
            <EnglishSpeakingPractice />
          )}
          {selectedMaterial === 'pronunciation-practice' && (
            <PronunciationPractice />
          )}
          {selectedMaterial === 'algebra-introduction' && (
            <AlgebraIntroductionSystem />
          )}
          {selectedMaterial === 'earthquake-wave-simulator' && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                地震波シミュレーター（メンテナンス中）
              </Typography>
              <Typography variant="body1" color="text.secondary">
                この教材は現在メンテナンス中です。しばらくお待ちください。
              </Typography>
            </Box>
          )}
          {selectedMaterial === 'time-zone-calculator' && (
            <TimeZoneCalculator />
          )}
          {selectedMaterial === 'proof-step-builder' && (
            <ProofStepBuilder />
          )}
          {selectedMaterial === 'math-calculation-master' && (
            <MathCalculationMaster onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {/* 新しい教材 - TODO: MaterialComponentPropsの問題を解決後に有効化 */}
          {/* {selectedMaterial === 'town-exploration-map' && (
            <TownExplorationMap />
          )}
          {selectedMaterial === 'insect-metamorphosis' && (
            <InsectMetamorphosisSimulator />
          )}
          {selectedMaterial === 'compass-simulator' && (
            <CompassSimulator />
          )}
          {selectedMaterial === 'angle-measurement' && (
            <AngleMeasurementTool />
          )}
          {selectedMaterial === 'prefecture-puzzle' && (
            <PrefecturePuzzleWithPractice />
          )}
          {selectedMaterial === 'weather-change-simulator' && (
            <WeatherChangeSimulator />
          )}
          {selectedMaterial === 'industrial-zone-map' && (
            <IndustrialZoneMap />
          )}
          {selectedMaterial === 'combination-simulator' && (
            <CombinationSimulator />
          )}
          {selectedMaterial === 'human-body-animation' && (
            <HumanBodyAnimation />
          )} */}
        </DialogContent>
      </Dialog>
      
      {/* 教材表示設定パネル */}
      <MaterialSettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </ThemeProvider>
  );
}

export default AppFull;