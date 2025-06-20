import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Button,
  Paper,
  LinearProgress,
  IconButton,
  Grid,
  Card,
  CardContent,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  WaterDrop as WaterIcon,
  WbSunny as SunIcon,
  Timer as TimerIcon,
  LocalFlorist as FlowerIcon,
  Grass as SeedIcon,
  Park as PlantIcon
} from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

// 植物の種類
type PlantType = 'sunflower' | 'asagao' | 'tomato';

// 成長段階
type GrowthStage = 'seed' | 'sprout' | 'growing' | 'flower' | 'fruit';

// 植物データ
interface PlantData {
  name: string;
  stages: {
    [key in GrowthStage]: {
      name: string;
      duration: number; // 必要な日数
      waterNeeded: number; // 必要な水の量
      sunNeeded: number; // 必要な日光の量
      description: string;
    };
  };
  finalProduct: string;
}

const plantDatabase: Record<PlantType, PlantData> = {
  sunflower: {
    name: 'ヒマワリ',
    stages: {
      seed: { name: 'たね', duration: 3, waterNeeded: 2, sunNeeded: 1, description: 'たねをまきました' },
      sprout: { name: 'め', duration: 5, waterNeeded: 3, sunNeeded: 2, description: 'めがでてきました！' },
      growing: { name: 'せいちょう', duration: 7, waterNeeded: 4, sunNeeded: 3, description: 'くきがのびています' },
      flower: { name: 'はな', duration: 5, waterNeeded: 3, sunNeeded: 4, description: 'きれいなはながさきました！' },
      fruit: { name: 'たね', duration: 3, waterNeeded: 2, sunNeeded: 3, description: 'たねができました' }
    },
    finalProduct: 'ヒマワリのたね'
  },
  asagao: {
    name: 'アサガオ',
    stages: {
      seed: { name: 'たね', duration: 2, waterNeeded: 2, sunNeeded: 1, description: 'たねをまきました' },
      sprout: { name: 'め', duration: 4, waterNeeded: 3, sunNeeded: 2, description: 'かわいいめがでました！' },
      growing: { name: 'つる', duration: 6, waterNeeded: 3, sunNeeded: 3, description: 'つるがのびています' },
      flower: { name: 'はな', duration: 4, waterNeeded: 3, sunNeeded: 3, description: 'あさにきれいなはながさきます！' },
      fruit: { name: 'たね', duration: 3, waterNeeded: 2, sunNeeded: 2, description: 'たねができました' }
    },
    finalProduct: 'アサガオのたね'
  },
  tomato: {
    name: 'トマト',
    stages: {
      seed: { name: 'たね', duration: 3, waterNeeded: 3, sunNeeded: 1, description: 'たねをまきました' },
      sprout: { name: 'め', duration: 5, waterNeeded: 3, sunNeeded: 2, description: 'みどりのめがでました！' },
      growing: { name: 'くき', duration: 8, waterNeeded: 4, sunNeeded: 3, description: 'くきがたくましくなっています' },
      flower: { name: 'はな', duration: 4, waterNeeded: 3, sunNeeded: 3, description: 'きいろいはながさきました' },
      fruit: { name: 'み', duration: 6, waterNeeded: 4, sunNeeded: 4, description: 'あかいトマトができました！' }
    },
    finalProduct: 'おいしいトマト'
  }
};

// 植物の成長シミュレーター（内部コンポーネント）
function PlantGrowthSimulatorContent({ onClose }: { onClose: () => void }) {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPlant, setSelectedPlant] = useState<PlantType>('sunflower');
  const [currentStage, setCurrentStage] = useState<GrowthStage>('seed');
  const [growthProgress, setGrowthProgress] = useState(0);
  const [waterLevel, setWaterLevel] = useState(50);
  const [sunLevel, setSunLevel] = useState(50);
  const [daysPassed, setDaysPassed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [growthHistory, setGrowthHistory] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [harvestCount, setHarvestCount] = useState(0);
  const [fastForward, setFastForward] = useState(false);
  const [fastForwardUsed, setFastForwardUsed] = useState(0);
  const [lastFastForwardDay, setLastFastForwardDay] = useState(-1);
  
  const canvasSize = 400;
  const plantData = plantDatabase[selectedPlant];
  const stageData = plantData.stages[currentStage];
  
  // 植物を描画
  const drawPlant = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // 背景（空）
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasSize);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // 地面
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvasSize - 100, canvasSize, 100);
    
    // 植木鉢
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.moveTo(150, canvasSize - 100);
    ctx.lineTo(170, canvasSize - 50);
    ctx.lineTo(230, canvasSize - 50);
    ctx.lineTo(250, canvasSize - 100);
    ctx.closePath();
    ctx.fill();
    
    // 植物を描画（成長段階に応じて）
    const centerX = canvasSize / 2;
    const groundY = canvasSize - 100;
    
    switch (currentStage) {
      case 'seed':
        // 種
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(centerX, groundY - 10, 5, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'sprout':
        // 芽
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, groundY);
        ctx.quadraticCurveTo(centerX - 10, groundY - 20, centerX, groundY - 30);
        ctx.stroke();
        
        // 葉
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.ellipse(centerX - 5, groundY - 25, 8, 5, -Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'growing':
        // 茎
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 5 + growthProgress * 0.05;
        ctx.beginPath();
        ctx.moveTo(centerX, groundY);
        ctx.lineTo(centerX, groundY - 60 - growthProgress * 0.4);
        ctx.stroke();
        
        // 葉（複数）
        for (let i = 0; i < 3; i++) {
          const leafY = groundY - 20 - i * 20;
          const leafX = centerX + (i % 2 === 0 ? -15 : 15);
          
          ctx.fillStyle = '#32CD32';
          ctx.beginPath();
          ctx.ellipse(leafX, leafY, 15, 8, i % 2 === 0 ? -Math.PI / 4 : Math.PI / 4, 0, 2 * Math.PI);
          ctx.fill();
        }
        break;
        
      case 'flower':
        // 茎
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(centerX, groundY);
        ctx.lineTo(centerX, groundY - 100);
        ctx.stroke();
        
        // 葉
        for (let i = 0; i < 4; i++) {
          const leafY = groundY - 20 - i * 20;
          const leafX = centerX + (i % 2 === 0 ? -20 : 20);
          
          ctx.fillStyle = '#32CD32';
          ctx.beginPath();
          ctx.ellipse(leafX, leafY, 20, 10, i % 2 === 0 ? -Math.PI / 4 : Math.PI / 4, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // 花を描画（植物の種類に応じて）
        if (selectedPlant === 'sunflower') {
          // ヒマワリ
          ctx.fillStyle = '#FFD700';
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * 2 * Math.PI;
            const petalX = centerX + Math.cos(angle) * 30;
            const petalY = groundY - 100 + Math.sin(angle) * 30;
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, 20, 10, angle, 0, 2 * Math.PI);
            ctx.fill();
          }
          
          ctx.fillStyle = '#8B4513';
          ctx.beginPath();
          ctx.arc(centerX, groundY - 100, 20, 0, 2 * Math.PI);
          ctx.fill();
          
        } else if (selectedPlant === 'asagao') {
          // アサガオ
          ctx.fillStyle = '#6A0DAD';
          ctx.beginPath();
          ctx.arc(centerX, groundY - 100, 25, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(centerX, groundY - 100, 10, 0, 2 * Math.PI);
          ctx.fill();
          
        } else if (selectedPlant === 'tomato') {
          // トマトの花
          ctx.fillStyle = '#FFFF00';
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * 2 * Math.PI;
            const petalX = centerX + Math.cos(angle) * 15;
            const petalY = groundY - 100 + Math.sin(angle) * 15;
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, 10, 5, angle, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
        break;
        
      case 'fruit':
        // 茎
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(centerX, groundY);
        ctx.lineTo(centerX, groundY - 100);
        ctx.stroke();
        
        // 葉
        for (let i = 0; i < 4; i++) {
          const leafY = groundY - 20 - i * 20;
          const leafX = centerX + (i % 2 === 0 ? -20 : 20);
          
          ctx.fillStyle = '#32CD32';
          ctx.beginPath();
          ctx.ellipse(leafX, leafY, 20, 10, i % 2 === 0 ? -Math.PI / 4 : Math.PI / 4, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // 実を描画
        if (selectedPlant === 'tomato') {
          // トマトの実
          ctx.fillStyle = '#FF6347';
          ctx.beginPath();
          ctx.arc(centerX, groundY - 80, 20, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.fillStyle = '#32CD32';
          ctx.beginPath();
          ctx.arc(centerX, groundY - 95, 8, 0, 2 * Math.PI);
          ctx.fill();
          
        } else {
          // 種（ヒマワリ、アサガオ）
          ctx.fillStyle = '#8B4513';
          ctx.beginPath();
          ctx.arc(centerX, groundY - 100, 15, 0, 2 * Math.PI);
          ctx.fill();
        }
        break;
    }
    
    // 水やりエフェクト
    if (waterLevel > 70) {
      ctx.fillStyle = 'rgba(0, 191, 255, 0.3)';
      for (let i = 0; i < 5; i++) {
        const dropX = centerX + (Math.random() - 0.5) * 100;
        const dropY = groundY - 150 + Math.random() * 50;
        ctx.beginPath();
        ctx.arc(dropX, dropY, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    
    // 太陽エフェクト
    if (sunLevel > 70) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(canvasSize - 50, 50, 30, 0, 2 * Math.PI);
      ctx.fill();
      
      // 太陽光線
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(canvasSize - 50 + Math.cos(angle) * 35, 50 + Math.sin(angle) * 35);
        ctx.lineTo(canvasSize - 50 + Math.cos(angle) * 45, 50 + Math.sin(angle) * 45);
        ctx.stroke();
      }
    }
  };
  
  // 成長の更新
  const updateGrowth = () => {
    if (!isPlaying) return;
    
    // 必要な条件をチェック
    const waterOk = waterLevel >= stageData.waterNeeded * 10;
    const sunOk = sunLevel >= stageData.sunNeeded * 10;
    
    if (waterOk && sunOk) {
      setGrowthProgress(prev => {
        const newProgress = prev + (fastForward ? 10 : 1);
        
        // 早送り使用時の記録
        if (fastForward && daysPassed !== lastFastForwardDay) {
          setFastForwardUsed(count => count + 1);
          setLastFastForwardDay(daysPassed);
          
          // 早送りを使いすぎた場合はスコアを減らす
          if (fastForwardUsed >= 3) {
            setScore(s => Math.max(0, s - 50));
            setGrowthHistory(h => [...h, `${daysPassed}日目: 早送りを使いすぎました（スコア-50）`]);
          }
        }
        
        if (newProgress >= 100) {
          // 次の段階へ
          const stages: GrowthStage[] = ['seed', 'sprout', 'growing', 'flower', 'fruit'];
          const currentIndex = stages.indexOf(currentStage);
          
          if (currentIndex < stages.length - 1) {
            const nextStage = stages[currentIndex + 1];
            setCurrentStage(nextStage);
            setGrowthHistory(prev => [...prev, `${daysPassed}日目: ${plantData.stages[nextStage].description}`]);
            
            // 早送りを使わずに成長させた場合はボーナススコア
            const bonusScore = fastForwardUsed === 0 ? 150 : 100;
            setScore(prev => prev + bonusScore);
            
            // 成長段階完了を記録
            recordAnswer(true, {
              problem: `${plantData.name}の成長: ${stageData.name}から${plantData.stages[nextStage].name}へ`,
              userAnswer: '成長段階完了',
              correctAnswer: plantData.stages[nextStage].description,
              score: bonusScore,
              stage: nextStage,
              fastForwardUsed: fastForwardUsed
            });
            
            if (fastForwardUsed === 0) {
              setGrowthHistory(h => [...h, `ボーナス！ じっくり観察しました（+50スコア）`]);
            }
            
            return 0;
          } else {
            // 収穫完了
            setHarvestCount(prev => prev + 1);
            const harvestBonus = fastForwardUsed === 0 ? 700 : 500;
            setScore(prev => prev + harvestBonus);
            setGrowthHistory(prev => [...prev, `${daysPassed}日目: ${plantData.finalProduct}を収穫しました！`]);
            
            // 学習履歴に記録
            const isPerfect = fastForwardUsed === 0;
            recordAnswer(true, {
              problem: `${plantData.name}の栽培`,
              userAnswer: '収穫完了',
              correctAnswer: plantData.finalProduct,
              score: harvestBonus,
              growthDays: daysPassed,
              fastForwardUsed: fastForwardUsed,
              perfect: isPerfect
            });
            
            if (isPerfect) {
              setGrowthHistory(h => [...h, `パーフェクト！ 早送りを使わずに育てました（+200スコア）`]);
            }
            setIsPlaying(false);
            return 100;
          }
        }
        
        return newProgress;
      });
    }
    
    // 水と日光を消費
    setWaterLevel(prev => Math.max(prev - 2, 0));
    setSunLevel(prev => Math.max(prev - 1, 0));
    setDaysPassed(prev => prev + 1);
  };
  
  // 水やり
  const water = () => {
    setWaterLevel(prev => Math.min(prev + 30, 100));
    recordInteraction('click');
    if (isPlaying) {
      setGrowthHistory(prev => [...prev, `${daysPassed}日目: 水をあげました`]);
    }
  };
  
  // 日光調整
  const adjustSunlight = (value: number) => {
    setSunLevel(value);
    recordInteraction('drag');
  };
  
  // リセット
  const handleReset = () => {
    setCurrentStage('seed');
    setGrowthProgress(0);
    setWaterLevel(50);
    setSunLevel(50);
    setDaysPassed(0);
    setIsPlaying(false);
    setGrowthHistory([]);
    setFastForward(false);
    setFastForwardUsed(0);
    setLastFastForwardDay(-1);
  };
  
  // エフェクト
  useEffect(() => {
    drawPlant();
  }, [selectedPlant, currentStage, growthProgress, waterLevel, sunLevel]);
  
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(updateGrowth, fastForward ? 500 : 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, fastForward, currentStage, waterLevel, sunLevel]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          植物の成長シミュレーター
        </Typography>
        <Box>
          <IconButton onClick={() => {
            handleReset();
            recordInteraction('click');
          }} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        植物を育てて、成長の様子を観察しよう！水やりと日光の管理が大切です。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`${daysPassed}日目`}
          icon={<TimerIcon />}
          color="primary" 
          size="medium"
        />
        <Chip 
          label={`成長段階: ${stageData.name}`} 
          icon={<PlantIcon />}
          color="secondary" 
          size="medium"
        />
        <Chip 
          label={`収穫数: ${harvestCount}`} 
          icon={<FlowerIcon />}
          color="success" 
          size="medium"
        />
        <Chip 
          label={`スコア: ${score}`} 
          color="info" 
          size="medium"
        />
      </Box>

      {/* 植物選択 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          育てる植物を選ぼう
        </Typography>
        <ToggleButtonGroup
          value={selectedPlant}
          exclusive
          onChange={(_, value) => {
            if (value && !isPlaying) {
              setSelectedPlant(value);
              handleReset();
              recordInteraction('click');
            }
          }}
        >
          <ToggleButton value="sunflower">
            <FlowerIcon sx={{ mr: 1 }} />
            ヒマワリ
          </ToggleButton>
          <ToggleButton value="asagao">
            <FlowerIcon sx={{ mr: 1 }} />
            アサガオ
          </ToggleButton>
          <ToggleButton value="tomato">
            <PlantIcon sx={{ mr: 1 }} />
            トマト
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：コントロール */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              お世話をしよう
            </Typography>
            
            {/* 水やり */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                <WaterIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                水の量: {waterLevel}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={waterLevel} 
                sx={{ mb: 1, height: 10, borderRadius: 5 }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={water}
                startIcon={<WaterIcon />}
              >
                水をあげる
              </Button>
            </Box>
            
            {/* 日光 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                <SunIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                日光の量: {sunLevel}%
              </Typography>
              <Slider
                value={sunLevel}
                onChange={(_, value) => adjustSunlight(value as number)}
                min={0}
                max={100}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                スライダーで日光の量を調整しよう
              </Typography>
            </Box>
            
            {/* ゲームコントロール */}
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  recordInteraction('click');
                }}
                disabled={currentStage === 'fruit' && growthProgress === 100}
                sx={{ mb: 1 }}
              >
                {isPlaying ? '一時停止' : '観察開始'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setFastForward(!fastForward);
                  recordInteraction('click');
                }}
                startIcon={<TimerIcon />}
                color={fastForwardUsed >= 3 ? 'warning' : 'primary'}
              >
                {fastForward ? '通常速度' : '早送り'} 
                {fastForwardUsed > 0 && ` (${fastForwardUsed}回使用)`}
              </Button>
              {fastForwardUsed >= 2 && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                  ⚠️ 早送りの使いすぎはスコアが下がります
                </Typography>
              )}
            </Box>
            
            {/* 成長情報 */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  現在の成長段階
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  {stageData.name}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={growthProgress} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  必要な水: {stageData.waterNeeded} / 日光: {stageData.sunNeeded}
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* 中央：植物表示 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {plantData.name}の様子
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                style={{
                  border: '2px solid #ddd',
                  borderRadius: '8px'
                }}
              />
            </Box>
            
            {currentStage === 'fruit' && growthProgress === 100 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                🎉 収穫できます！{plantData.finalProduct}が完成しました！
              </Alert>
            )}
            
            {!isPlaying && currentStage === 'seed' && daysPassed === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                「観察開始」ボタンを押して育て始めよう！
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* 右側：成長記録 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              成長日記
            </Typography>
            
            {growthHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                まだ記録がありません
              </Typography>
            ) : (
              <List dense>
                {growthHistory.map((entry, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={entry}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e9' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🌱 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 植物は水と日光が必要です。適切な量をあげましょう<br/>
          • 成長には時間がかかります。毎日観察することが大切です<br/>
          • 植物によって成長の速さや必要な世話が違います<br/>
          • 種→芽→成長→花→実の順番で成長します<br/>
          • <strong>じっくり観察すると高いスコアがもらえます！早送りの使いすぎには注意しましょう</strong>
        </Typography>
      </Paper>
    </Box>
  );
}

// 植物の成長シミュレーター（MaterialWrapperでラップ）
function PlantGrowthSimulator({ onClose }: { onClose: () => void }) {
  return (
    <MaterialWrapper
      materialId="plant-growth"
      materialName="植物の成長シミュレーター"
      showMetricsButton={true}
      showAssistant={true}
    >
      <PlantGrowthSimulatorContent onClose={onClose} />
    </MaterialWrapper>
  );
}

export default PlantGrowthSimulator;