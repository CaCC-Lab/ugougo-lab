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
import { Close as CloseIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
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
import ProportionGraphTool from './components/ProportionGraphTool';
import LeverPrincipleExperiment from './components/LeverPrincipleExperiment';
import QuadraticFunctionGraph from './components/QuadraticFunctionGraph';
import CelestialMotionSimulator from './components/CelestialMotionSimulator';
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
import { EnglishSpeakingPractice, PronunciationPractice } from './materials/junior-high/grade1/english';
import { AlgebraIntroductionSystem } from './materials/junior-high/grade1/math/AlgebraIntroductionSystem';
import { EarthquakeWaveSimulator } from './materials/junior-high/grade1/science';
import { TimeZoneCalculator } from './materials/junior-high/grade1/social';
import { ProofStepBuilder } from './materials/junior-high/grade2/math';
import { ElectricityExperiment } from './materials/junior-high/grade2/science';
import { ProgressDashboard } from './components/dashboard/ProgressDashboard';
import { MaterialWrapper, useLearningTrackerContext } from './components/wrappers/MaterialWrapper';

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
  const [lastBonus, setLastBonus] = useState(0);
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
              size="large"
            />
            <Chip 
              label={`選択した数: ${selectedNumbers.length}個`} 
              color="info" 
              size="large"
            />
            <Chip 
              label={`成功回数: ${successCount}`} 
              color="secondary" 
              size="large"
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

// メインアプリ
function AppFull() {
  const [currentTheme, setCurrentTheme] = useState<'elementary' | 'juniorHigh' | 'highSchool'>('elementary');
  const [materialOpen, setMaterialOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [showDashboard, setShowDashboard] = useState(false);

  const materials = [
    {
      id: 'addition-subtraction',
      title: 'たし算・ひき算ビジュアライザー',
      description: 'リンゴを使って、たし算とひき算を楽しく学ぼう！数えながら答えを見つけてね。',
      grade: '小学1年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'hiragana-stroke',
      title: 'ひらがな書き順アニメーション',
      description: 'ひらがなの正しい書き順を覚えよう！アニメーションを見て、なぞり書きで練習できます。',
      grade: '小学1年生',
      subject: '国語',
      available: true,
    },
    {
      id: 'picture-word-matching',
      title: '絵と言葉のマッチングゲーム',
      description: '絵を見て正しい言葉を選ぼう！動物・果物・乗り物・食べ物から選べます。10問連続正解でごほうびがもらえるよ！',
      grade: '小学1年生',
      subject: '国語',
      available: true,
    },
    {
      id: 'clock-learning',
      title: '時計の読み方学習ツール',
      description: '時計の針をドラッグして動かしてみよう！デジタル表示と連動して、時計の読み方をマスターできます。',
      grade: '小学1年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'number-blocks',
      title: '数の合成・分解ブロック',
      description: '1〜10のブロックを使って数の合成・分解を学ぼう！2つ以上の数字を組み合わせて目標の数を作ってください。たくさん組み合わせると高得点！',
      grade: '小学1年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'multiplication',
      title: 'かけ算九九の視覚化',
      description: 'アニメーションでかけ算の仕組みがよくわかる！視覚的にかけ算を理解できます。',
      grade: '小学2年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'unit-conversion',
      title: '長さ・かさの単位変換ツール',
      description: 'cm、m、mm、mL、dL、Lの単位変換を視覚的に学べます。スライダーで数値を変えてみよう！',
      grade: '小学2年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'plant-growth',
      title: '植物の成長シミュレーター',
      description: '植物を育てて、成長の様子を観察しよう！水やりと日光の管理が大切です。',
      grade: '小学2年生',
      subject: '生活科',
      available: true,
    },
    {
      id: 'fraction-visualization',
      title: '分数の視覚化',
      description: '分数を円グラフや棒グラフで視覚的に理解しよう！練習モードとクイズモードがあります。',
      grade: '小学3年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'fraction-pizza',
      title: '分数ピザカッター',
      description: 'ピザを切って分数を学ぼう！ピースをクリックして選択できます。',
      grade: '小学3年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'magnet-experiment',
      title: '磁石の実験シミュレーター',
      description: '磁石の性質を体験！N極とS極の働きや、鉄・アルミ・プラスチックへの影響を観察しよう。',
      grade: '小学3年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'area-calculator',
      title: '面積計算ツール',
      description: '図形の頂点をドラッグして面積を計算！正方形、長方形、三角形、平行四辺形の面積を視覚的に学べます。',
      grade: '小学4年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'water-state',
      title: '水の三態変化アニメーション',
      description: '温度による水の状態変化を観察！氷・水・水蒸気の分子の動きをアニメーションで学習できます。',
      grade: '小学4年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'electric-circuit',
      title: '電気回路シミュレーター',
      description: '電池、豆電球、スイッチを使って電気回路を作ろう！直列回路と並列回路の違いを学べます。',
      grade: '小学4年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'number-line',
      title: '正負の数の数直線',
      description: '数直線を使って、マイナスの数も理解しよう！正負の数の計算をマスターできます。',
      grade: '中学1年生',
      subject: '数学',
      available: true,
    },
    {
      id: 'algebraic-expression',
      title: '文字式変形ツール',
      description: '文字式の展開、因数分解、同類項の整理をステップごとに学習！計算過程が見える化されます。',
      grade: '中学1年生',
      subject: '数学',
      available: true,
    },
    {
      id: 'light-refraction',
      title: '光の屈折実験器',
      description: '光の屈折現象を観察しよう！入射角を変えて、スネルの法則を確認できます。',
      grade: '中学1年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'linear-function',
      title: '一次関数グラフ描画ツール',
      description: '一次関数y=ax+bのグラフを自在に操作！傾きと切片を調整して、グラフの変化を観察しよう。',
      grade: '中学2年生',
      subject: '数学',
      available: true,
    },
    {
      id: 'atom-molecule',
      title: '原子・分子構造シミュレーション',
      description: '原子の結合や電子の動きを視覚的に理解しよう！化学の基礎をマスターできます。',
      grade: '中学2年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'chemical-reaction',
      title: '化学反応シミュレーター',
      description: '化学反応を分子モデルで観察！質量保存の法則を確認しながら、燃焼・中和・酸化・化合反応を学べます。',
      grade: '中学2年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'electricity-experiment',
      title: '電流・電圧・抵抗の関係実験器',
      description: 'オームの法則を体験的に学習！回路を組み立てて、電流・電圧・抵抗の関係をリアルタイムで観察。直列・並列回路の特性も理解できます。',
      grade: '中学2年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'sorting-algorithm',
      title: 'ソートアルゴリズム可視化',
      description: '様々なソートアルゴリズムの動作を視覚的に理解しよう！プログラミング思考を身につけます。',
      grade: '中学3年生',
      subject: '情報',
      available: true,
    },
    {
      id: 'function-graph',
      title: '関数グラフ動的描画ツール',
      description: '様々な関数のグラフを動的に描画！パラメータの変化による影響を学習できます。',
      grade: '高校1年生',
      subject: '数学',
      available: true,
    },
    {
      id: 'moving-point-p',
      title: '動く点P - 三角形の面積変化',
      description: '四角形上を動く点Pによって作られる三角形の面積変化を観察しよう！ドラッグ操作とアニメーションで直感的に理解できます。',
      grade: '中学1年生',
      subject: '数学',
      available: true,
    },
    {
      id: 'element-puzzle',
      title: '元素記号パズルゲーム',
      description: '元素記号と元素名をペアで揃えて消そう！パズルボブル風ゲームで楽しく暗記できます。',
      grade: '中学2年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'inertia-simulation',
      title: '慣性の法則シミュレーション',
      description: '電車の中で起こる慣性現象をマリオ風の視覚化で理解しよう！視点を切り替えて物理現象を体験できます。',
      grade: '中学3年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'typing-puyo',
      title: 'ぷよぷよ風タイピングゲーム',
      description: '落ちてくるブロックのアルファベットをタイピングして、連鎖で高得点を狙おう！楽しみながらタイピングスキルを向上できます。',
      grade: '高校1年生',
      subject: '情報',
      available: true,
    },
    {
      id: 'speed-time-distance',
      title: '速さ・時間・距離の関係シミュレーター',
      description: '車・自転車・徒歩の動きをアニメーションで観察！追いつき問題も視覚的に理解できます。',
      grade: '小学5年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'pendulum-experiment',
      title: '振り子の実験装置',
      description: '振り子の長さや重さを変えて周期を測定！ガリレオの法則を実験で確認できます。',
      grade: '小学5年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'proportion-graph',
      title: '比例・反比例グラフツール',
      description: 'リアルタイムでグラフが変化！速さと時間、値段と個数など、実生活の例で比例・反比例を学べます。',
      grade: '小学6年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'lever-principle',
      title: 'てこの原理実験器',
      description: 'てこのつり合いを体験！支点・力点・作用点を調整して、力のモーメントの法則を発見しよう。',
      grade: '小学6年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'quadratic-function',
      title: '二次関数グラフ変形ツール',
      description: '係数を変えて放物線の変化を観察！頂点・軸・判別式の関係を視覚的に理解できます。',
      grade: '中学3年生',
      subject: '数学',
      available: true,
    },
    {
      id: 'celestial-motion',
      title: '天体の動きシミュレーター',
      description: '地球・月・太陽の位置関係を3Dで観察！日食・月食の条件や月の満ち欠けを体験できます。',
      grade: '中学3年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'trigonometric-function',
      title: '三角関数グラフ描画ツール',
      description: '振幅・周期・位相を自由に調整！単位円との対応をアニメーションで理解できます。',
      grade: '高校1年生',
      subject: '数学',
      available: true,
    },
    {
      id: 'calculus-visualizer',
      title: '微分積分ビジュアライザー',
      description: '接線の傾きで微分を、面積で積分を視覚的に理解！極値・変曲点も自動検出します。',
      grade: '高校2年生',
      subject: '数学',
      available: true,
    },
    // 新しい教材（0から作成）
    {
      id: 'town-exploration-map',
      title: '町探検マップ',
      description: '町のいろいろな場所をクリックして、どんな場所か調べてみよう！探検モードとクイズモードで楽しく学習できます。',
      grade: '小学2年生',
      subject: '生活科',
      available: true,
    },
    {
      id: 'insect-metamorphosis',
      title: '昆虫の変態シミュレーター',
      description: '昆虫の成長過程を観察しよう！完全変態と不完全変態の違いを、アニメーションで理解できます。',
      grade: '小学3年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'compass-simulator',
      title: 'コンパスシミュレーター',
      description: '方位磁針の使い方を学習！地図と組み合わせて、方角の理解を深めよう。',
      grade: '小学3年生',
      subject: '社会',
      available: true,
    },
    {
      id: 'angle-measurement',
      title: '角度測定器',
      description: '分度器の使い方と角度測定を練習！インタラクティブな分度器で、正確な角度の測り方をマスターしよう。',
      grade: '小学4年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'prefecture-puzzle',
      title: '都道府県パズル',
      description: '日本の都道府県を楽しく学習！パズルゲームで位置関係を覚えよう。県庁所在地や特産品も学べます。',
      grade: '小学4年生',
      subject: '社会',
      available: true,
    },
    {
      id: 'weather-change-simulator',
      title: '天気の変化シミュレーター',
      description: '気象の変化を観察！前線の動きや気圧配置から、天気の変化を予測してみよう。',
      grade: '小学5年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'industrial-zone-map',
      title: '工業地帯マップ',
      description: '日本の工業地帯を学習！各地域の特色や主要な工業製品を、インタラクティブな地図で確認しよう。',
      grade: '小学5年生',
      subject: '社会',
      available: true,
    },
    {
      id: 'combination-simulator',
      title: '場合の数シミュレーター',
      description: '順列と組み合わせを視覚的に学習！樹形図や実例を通して、場合の数の考え方をマスターしよう。',
      grade: '小学6年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'human-body-animation',
      title: '人体の仕組みアニメーション',
      description: '人体の器官と働きを学習！消化器系・呼吸器系・循環器系の動きをアニメーションで理解しよう。',
      grade: '小学6年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'abstract-thinking-bridge',
      title: '抽象的思考への橋',
      description: '10歳の壁を越えよう！具体的な考え方から抽象的な考え方へ、段階的に理解を深める総合学習ツール。比例・面積・電気など複数教科を横断的に学習。',
      grade: '小学4年生',
      subject: '総合',
      available: true,
    },
    {
      id: 'fraction-master',
      title: '分数マスターツール',
      description: '分数の概念を視覚的に理解！ピザやケーキを使った分かりやすい表現で、大小比較・通分・四則演算をマスターしよう。',
      grade: '小学3年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'english-speaking-practice',
      title: '英語スピーキング練習',
      description: '対話形式で英会話を練習しよう！選択式・並び替え式の問題で、正しい語順と発音を身につけます。日常会話・自己紹介・買い物など実践的なシナリオで学習。',
      grade: '中学1年生',
      subject: '英語',
      available: true,
    },
    {
      id: 'pronunciation-practice',
      title: '発音練習ツール',
      description: '英語の音素（母音・子音）から単語まで段階的に発音を練習！音声認識AIがあなたの発音を評価。日本人が苦手な音を重点的に学習できます。',
      grade: '中学1年生',
      subject: '英語',
      available: true,
    },
    {
      id: 'algebra-introduction',
      title: '代数入門システム',
      description: '算数から数学へ！具体的な数から文字式へ、天秤メタファーで方程式を理解。3段階の学習ステップで代数的思考を身につけます。',
      grade: '中学1年生',
      subject: '数学',
      available: true,
    },
    {
      id: 'earthquake-wave-simulator',
      title: '地震波シミュレーター',
      description: 'P波とS波の違いを視覚的に理解！震源からの距離と揺れの関係、地震波の伝わり方をリアルタイムでシミュレーション。緊急地震速報の仕組みも学習できます。',
      grade: '中学1年生',
      subject: '理科',
      available: true,
    },
    {
      id: 'time-zone-calculator',
      title: '時差計算ツール',
      description: '世界の主要都市の時差を視覚的に学習！地球の自転と時差の関係、日付変更線の概念を実践的に理解。クイズモードで理解度をチェックできます。',
      grade: '中学1年生',
      subject: '社会',
      available: true,
    },
    {
      id: 'proof-step-builder',
      title: '証明ステップビルダー',
      description: '幾何学的証明を段階的に構築！ドラッグ&ドロップで証明の流れを組み立て、論理的思考力を養います。合同証明から始めて上級問題まで挑戦できます。',
      grade: '中学2年生',
      subject: '数学',
      available: true,
    },
  ];

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
            onClick={() => setShowDashboard(!showDashboard)}
            sx={{ mr: 2 }}
          >
            {showDashboard ? '教材一覧' : 'ダッシュボード'}
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
      ) : (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            動く教材へようこそ！
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            インタラクティブな教材で、楽しく学習しましょう。
            学年を選択してテーマを変更できます。
          </Typography>

          <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
            {currentTheme === 'elementary' ? '小学生' : currentTheme === 'juniorHigh' ? '中学生' : '高校生'}向けの教材
          </Typography>
          
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
          {selectedMaterial === 'addition-subtraction' && (
            <AdditionSubtractionVisualizer onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'hiragana-stroke' && (
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
            <ProportionGraphTool onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'lever-principle' && (
            <LeverPrincipleExperiment onClose={() => {
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
            <CelestialMotionSimulator onClose={() => {
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
            <PrefecturePuzzle onClose={() => {
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
            <EarthquakeWaveSimulator />
          )}
          {selectedMaterial === 'time-zone-calculator' && (
            <TimeZoneCalculator />
          )}
          {selectedMaterial === 'proof-step-builder' && (
            <ProofStepBuilder />
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
            <PrefecturePuzzle />
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
    </ThemeProvider>
  );
}

export default AppFull;