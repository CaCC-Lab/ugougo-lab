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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  Light as LightIcon,
  Waves as WavesIcon,
  Science as ScienceIcon,
  ChangeHistory as PrismIcon,
  TableChart as DataIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

// 媒質の屈折率
const refractiveIndices = {
  air: 1.0,
  water: 1.33,
  glass: 1.5,
  diamond: 2.42
};

// 媒質の情報
interface Medium {
  name: string;
  refractiveIndex: number;
  color: string;
}

const mediaTypes: { [key: string]: Medium } = {
  air: { name: '空気', refractiveIndex: 1.0, color: '#E3F2FD' },
  water: { name: '水', refractiveIndex: 1.33, color: '#B3E5FC' },
  glass: { name: 'ガラス', refractiveIndex: 1.5, color: '#90CAF9' },
  diamond: { name: 'ダイヤモンド', refractiveIndex: 2.42, color: '#64B5F6' }
};

// 実験データ
interface ExperimentData {
  incidentAngle: number;
  refractedAngle: number;
  medium1: string;
  medium2: string;
}

interface LightRefractionExperimentProps {
  onClose?: () => void;
}

// 光の屈折実験器（内部コンポーネント）
const LightRefractionExperimentContent: React.FC<LightRefractionExperimentProps> = ({ onClose }) => {
  const { recordInteraction, recordAnswer } = useLearningTrackerContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 実験設定
  const [incidentAngle, setIncidentAngle] = useState(30); // 入射角（度）
  const [medium1, setMedium1] = useState('air'); // 上側の媒質
  const [medium2, setMedium2] = useState('water'); // 下側の媒質
  const [experimentMode, setExperimentMode] = useState<'refraction' | 'prism'>('refraction');
  const [showRays, setShowRays] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
  
  // プリズムモード用
  const [prismAngle, setPrismAngle] = useState(60); // プリズムの頂角
  
  // 実験データ
  const [experimentData, setExperimentData] = useState<ExperimentData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  // クイズモード
  const [quizMode, setQuizMode] = useState(false);
  const [targetAngle, setTargetAngle] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const canvasSize = 500;
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  
  // スネルの法則で屈折角を計算
  const calculateRefractedAngle = (incident: number, n1: number, n2: number) => {
    const incidentRad = (incident * Math.PI) / 180;
    const sinRefracted = (n1 * Math.sin(incidentRad)) / n2;
    
    // 全反射のチェック
    if (sinRefracted > 1) {
      return null; // 全反射
    }
    
    const refractedRad = Math.asin(sinRefracted);
    return (refractedRad * 180) / Math.PI;
  };
  
  // 臨界角を計算
  const calculateCriticalAngle = (n1: number, n2: number) => {
    if (n1 <= n2) return null; // 臨界角は存在しない
    const criticalRad = Math.asin(n2 / n1);
    return (criticalRad * 180) / Math.PI;
  };
  
  // 反射角を計算（入射角と同じ）
  const calculateReflectedAngle = (incident: number) => {
    return incident;
  };
  
  // キャンバスに実験を描画
  const drawExperiment = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // 背景を描画
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    if (experimentMode === 'refraction') {
      drawRefractionExperiment(ctx);
    } else {
      drawPrismExperiment(ctx);
    }
  };
  
  // 屈折実験を描画
  const drawRefractionExperiment = (ctx: CanvasRenderingContext2D) => {
    const n1 = mediaTypes[medium1].refractiveIndex;
    const n2 = mediaTypes[medium2].refractiveIndex;
    
    // 媒質を描画
    // 上側の媒質
    ctx.fillStyle = mediaTypes[medium1].color;
    ctx.fillRect(0, 0, canvasSize, centerY);
    
    // 下側の媒質
    ctx.fillStyle = mediaTypes[medium2].color;
    ctx.fillRect(0, centerY, canvasSize, centerY);
    
    // 境界線を描画
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasSize, centerY);
    ctx.stroke();
    
    // 法線を描画
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 100);
    ctx.lineTo(centerX, centerY + 100);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 光線を描画
    if (showRays) {
      const incidentRad = (incidentAngle * Math.PI) / 180;
      const rayLength = 150;
      
      // 入射光線
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const startX = centerX - rayLength * Math.sin(incidentRad);
      const startY = centerY - rayLength * Math.cos(incidentRad);
      ctx.moveTo(startX, startY);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();
      
      // 矢印を描画
      drawArrow(ctx, startX, startY, centerX, centerY, '#FF0000');
      
      // 屈折光線
      const refractedAngle = calculateRefractedAngle(incidentAngle, n1, n2);
      if (refractedAngle !== null) {
        const refractedRad = (refractedAngle * Math.PI) / 180;
        ctx.strokeStyle = '#0000FF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const endX = centerX + rayLength * Math.sin(refractedRad);
        const endY = centerY + rayLength * Math.cos(refractedRad);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // 矢印を描画
        drawArrow(ctx, centerX, centerY, endX, endY, '#0000FF');
      } else {
        // 全反射の場合
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('全反射', centerX, centerY + 150);
      }
      
      // 反射光線（常に存在するが、強度は変わる）
      const reflectedRad = (incidentAngle * Math.PI) / 180;
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const reflectEndX = centerX + rayLength * Math.sin(reflectedRad);
      const reflectEndY = centerY - rayLength * Math.cos(reflectedRad);
      ctx.lineTo(reflectEndX, reflectEndY);
      ctx.stroke();
    }
    
    // 角度を表示
    if (showAngles) {
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      
      // 入射角
      ctx.fillText(`入射角: ${incidentAngle}°`, centerX - 80, centerY - 120);
      
      // 屈折角
      const refractedAngle = calculateRefractedAngle(incidentAngle, n1, n2);
      if (refractedAngle !== null) {
        ctx.fillText(`屈折角: ${refractedAngle.toFixed(1)}°`, centerX + 80, centerY + 120);
      }
      
      // 反射角
      ctx.fillText(`反射角: ${incidentAngle}°`, centerX + 80, centerY - 120);
    }
    
    // 媒質の情報を表示
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${mediaTypes[medium1].name} (n=${n1})`, 10, 30);
    ctx.fillText(`${mediaTypes[medium2].name} (n=${n2})`, 10, canvasSize - 10);
    
    // 臨界角の表示（該当する場合）
    const criticalAngle = calculateCriticalAngle(n1, n2);
    if (criticalAngle !== null) {
      ctx.fillStyle = '#FF5722';
      ctx.font = '14px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`臨界角: ${criticalAngle.toFixed(1)}°`, canvasSize - 10, 30);
    }
  };
  
  // プリズム実験を描画
  const drawPrismExperiment = (ctx: CanvasRenderingContext2D) => {
    // プリズムを描画
    const prismHeight = 200;
    const prismBase = prismHeight * Math.tan((prismAngle * Math.PI) / 360);
    
    ctx.fillStyle = mediaTypes.glass.color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - prismHeight / 2);
    ctx.lineTo(centerX - prismBase, centerY + prismHeight / 2);
    ctx.lineTo(centerX + prismBase, centerY + prismHeight / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 入射光線
    if (showRays) {
      const rayLength = 150;
      const incidentRad = (incidentAngle * Math.PI) / 180;
      
      // 白色光の入射
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const startX = centerX - rayLength * Math.sin(incidentRad) - 100;
      const startY = centerY - rayLength * Math.cos(incidentRad);
      ctx.moveTo(startX, startY);
      ctx.lineTo(centerX - prismBase / 2, centerY);
      ctx.stroke();
      
      // プリズム内での分散
      const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
      const dispersions = [-3, -2, -1, 0, 1, 2, 3];
      
      colors.forEach((color, index) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - prismBase / 2, centerY);
        
        // 簡略化した分散効果
        const dispersionAngle = incidentAngle + dispersions[index];
        const dispersionRad = (dispersionAngle * Math.PI) / 180;
        const endX = centerX + prismBase / 2 + rayLength * Math.sin(dispersionRad);
        const endY = centerY + rayLength * Math.cos(dispersionRad);
        
        ctx.lineTo(centerX + prismBase / 2, centerY);
        ctx.moveTo(centerX + prismBase / 2, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      });
    }
    
    // プリズムの情報を表示
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`プリズム頂角: ${prismAngle}°`, centerX, canvasSize - 20);
    ctx.fillText('白色光の分散', centerX, 30);
  };
  
  // 矢印を描画
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string
  ) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };
  
  // 実験データを記録
  const recordData = () => {
    if (experimentMode === 'refraction') {
      const n1 = mediaTypes[medium1].refractiveIndex;
      const n2 = mediaTypes[medium2].refractiveIndex;
      const refractedAngle = calculateRefractedAngle(incidentAngle, n1, n2);
      
      if (refractedAngle !== null) {
        const newData: ExperimentData = {
          incidentAngle,
          refractedAngle,
          medium1,
          medium2
        };
        
        setExperimentData(prev => [...prev, newData]);
        recordInteraction('click');
      }
    }
  };
  
  // クイズの新しい問題を生成
  const generateNewQuiz = () => {
    // ランダムな媒質を選択
    const media = Object.keys(mediaTypes);
    const randomMedium1 = media[Math.floor(Math.random() * media.length)];
    let randomMedium2 = media[Math.floor(Math.random() * media.length)];
    
    // 異なる媒質にする
    while (randomMedium2 === randomMedium1) {
      randomMedium2 = media[Math.floor(Math.random() * media.length)];
    }
    
    setMedium1(randomMedium1);
    setMedium2(randomMedium2);
    
    // ランダムな入射角を設定
    const randomIncident = Math.floor(Math.random() * 60) + 10;
    setIncidentAngle(randomIncident);
    
    // 目標の屈折角を計算
    const n1 = mediaTypes[randomMedium1].refractiveIndex;
    const n2 = mediaTypes[randomMedium2].refractiveIndex;
    const refracted = calculateRefractedAngle(randomIncident, n1, n2);
    
    if (refracted !== null) {
      setTargetAngle(Math.round(refracted));
    }
  };
  
  // リセット
  const handleReset = () => {
    setIncidentAngle(30);
    setMedium1('air');
    setMedium2('water');
    setPrismAngle(60);
    setExperimentData([]);
    setScore(0);
    setAttempts(0);
    setProgress(0);
    setQuizMode(false);
    setIsRecording(false);
    recordInteraction('click');
  };
  
  // エフェクト
  useEffect(() => {
    drawExperiment();
  }, [
    incidentAngle, 
    medium1, 
    medium2, 
    experimentMode, 
    prismAngle, 
    showRays, 
    showAngles
  ]);
  
  useEffect(() => {
    if (quizMode) {
      generateNewQuiz();
    }
  }, [quizMode]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          光の屈折実験器
        </Typography>
        <Box>
          <IconButton onClick={handleReset} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        光の屈折現象を観察しよう！入射角を変えて、スネルの法則を確認できます。
      </Typography>

      {/* 状況表示 */}
      {quizMode && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip 
            label={`得点: ${score}`}
            icon={<ScienceIcon />}
            color="primary" 
            size="medium"
          />
          <Chip 
            label={`挑戦: ${attempts}`} 
            color="secondary" 
            size="medium"
          />
        </Box>
      )}

      {/* 進捗バー */}
      {quizMode && progress > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">学習進捗</Typography>
            <Typography variant="caption">{progress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

      {/* 実験モード選択 */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={experimentMode}
          exclusive
          onChange={(_, value) => {
            if (value) {
              setExperimentMode(value);
              recordInteraction('change');
            }
          }}
          fullWidth
        >
          <ToggleButton value="refraction">
            <WavesIcon sx={{ mr: 1 }} />
            屈折実験
          </ToggleButton>
          <ToggleButton value="prism">
            <PrismIcon sx={{ mr: 1 }} />
            プリズム
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：コントロール */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              実験設定
            </Typography>
            
            {experimentMode === 'refraction' ? (
              <>
                {/* 入射角の調整 */}
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  入射角: {incidentAngle}°
                </Typography>
                <Slider
                  value={incidentAngle}
                  onChange={(_, value) => {
                    setIncidentAngle(value as number);
                    recordInteraction('drag');
                  }}
                  min={0}
                  max={90}
                  disabled={quizMode}
                  sx={{ mb: 3 }}
                />
                
                {/* 媒質の選択 */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>上側の媒質</InputLabel>
                  <Select
                    value={medium1}
                    onChange={(e) => {
                      setMedium1(e.target.value);
                      recordInteraction('change');
                    }}
                    disabled={quizMode}
                  >
                    {Object.entries(mediaTypes).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value.name} (n={value.refractiveIndex})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>下側の媒質</InputLabel>
                  <Select
                    value={medium2}
                    onChange={(e) => {
                      setMedium2(e.target.value);
                      recordInteraction('change');
                    }}
                    disabled={quizMode}
                  >
                    {Object.entries(mediaTypes).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value.name} (n={value.refractiveIndex})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* スネルの法則の表示 */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      スネルの法則
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      n₁ × sin(θ₁) = n₂ × sin(θ₂)
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      n: 屈折率、θ: 角度
                    </Typography>
                  </CardContent>
                </Card>
                
                {/* 実験データ記録 */}
                <Button
                  variant={isRecording ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => {
                    setIsRecording(!isRecording);
                    recordInteraction('click');
                  }}
                  startIcon={<DataIcon />}
                  sx={{ mb: 1 }}
                >
                  {isRecording ? 'データ記録中' : 'データ記録開始'}
                </Button>
                
                {isRecording && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={recordData}
                    sx={{ mb: 2 }}
                  >
                    現在の値を記録
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* プリズム設定 */}
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  プリズム頂角: {prismAngle}°
                </Typography>
                <Slider
                  value={prismAngle}
                  onChange={(_, value) => {
                    setPrismAngle(value as number);
                    recordInteraction('drag');
                  }}
                  min={30}
                  max={90}
                  sx={{ mb: 3 }}
                />
                
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  入射角: {incidentAngle}°
                </Typography>
                <Slider
                  value={incidentAngle}
                  onChange={(_, value) => {
                    setIncidentAngle(value as number);
                    recordInteraction('drag');
                  }}
                  min={-45}
                  max={45}
                  sx={{ mb: 3 }}
                />
                
                <Alert severity="info">
                  白色光がプリズムを通過すると、波長によって屈折率が異なるため、色ごとに分かれます（分散）。
                </Alert>
              </>
            )}
            
            {/* 表示設定 */}
            <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
              表示設定
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant={showRays ? 'contained' : 'outlined'}
                onClick={() => {
                  setShowRays(!showRays);
                  recordInteraction('click');
                }}
              >
                光線
              </Button>
              <Button
                size="small"
                variant={showAngles ? 'contained' : 'outlined'}
                onClick={() => {
                  setShowAngles(!showAngles);
                  recordInteraction('click');
                }}
              >
                角度
              </Button>
            </Box>
            
            {/* クイズモード */}
            {experimentMode === 'refraction' && (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setQuizMode(!quizMode);
                  recordInteraction('click');
                }}
                sx={{ mt: 2 }}
              >
                {quizMode ? '通常モードへ' : 'クイズモードへ'}
              </Button>
            )}
          </Paper>
        </Grid>

        {/* 中央：実験表示 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <LightIcon sx={{ mr: 1 }} />
              実験
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
            
            {/* クイズ問題 */}
            {quizMode && experimentMode === 'refraction' && (
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    問題
                  </Typography>
                  <Typography variant="body1">
                    {mediaTypes[medium1].name}から{mediaTypes[medium2].name}へ
                    入射角{incidentAngle}°で光が進むとき、
                    屈折角は約何度になるでしょうか？
                  </Typography>
                  <Typography variant="h5" color="primary" sx={{ mt: 2, textAlign: 'center' }}>
                    目標: {targetAngle}°
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>

        {/* 右側：実験データ */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              実験データ
            </Typography>
            
            {experimentData.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>入射角</TableCell>
                      <TableCell>屈折角</TableCell>
                      <TableCell>媒質</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {experimentData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell>{data.incidentAngle}°</TableCell>
                        <TableCell>{data.refractedAngle.toFixed(1)}°</TableCell>
                        <TableCell>
                          {mediaTypes[data.medium1].name}→
                          {mediaTypes[data.medium2].name}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                データを記録するには、「データ記録開始」をクリックしてから
                「現在の値を記録」ボタンを押してください。
              </Typography>
            )}
            
            {experimentData.length > 0 && (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setExperimentData([]);
                  recordInteraction('click');
                }}
                sx={{ mt: 2 }}
              >
                データクリア
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e3f2fd' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          💡 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 光は異なる物質の境界で曲がります（屈折）<br/>
          • 屈折の大きさは媒質の屈折率によって決まります<br/>
          • 密度の高い物質から低い物質へ進むとき、臨界角を超えると全反射が起こります<br/>
          • プリズムでは波長によって屈折率が異なるため、白色光が虹色に分かれます
        </Typography>
      </Paper>
    </Box>
  );
};

// 光の屈折実験器（MaterialWrapperでラップ）
const LightRefractionExperiment: React.FC<LightRefractionExperimentProps> = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="light-refraction-experiment"
      materialName="光の屈折実験器"
      showMetricsButton={true}
      showAssistant={true}
    >
      <LightRefractionExperimentContent onClose={onClose} />
    </MaterialWrapper>
  );
};

export default LightRefractionExperiment;