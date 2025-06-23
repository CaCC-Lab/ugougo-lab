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
  ToggleButtonGroup
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Cloud as CloudIcon,
  WbSunny as SunIcon,
  Grain as RainIcon,
  Air as WindIcon
} from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

// 天気の種類
type Weather = '晴れ' | 'くもり' | '雨';

// 前線の種類
interface Front {
  type: '温暖前線' | '寒冷前線';
  position: number; // 0-100の位置
  speed: number; // 移動速度
}

// 天気の変化シミュレーター（内部コンポーネント）
function WeatherChangeSimulatorContent({ onClose }: { onClose: () => void }) {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [front, setFront] = useState<Front>({ type: '寒冷前線', position: 20, speed: 1 });
  const [weather, setWeather] = useState<Weather[]>(['晴れ', '晴れ', 'くもり', '雨', '雨']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [windDirection, setWindDirection] = useState(270); // 西風
  const [pressure, setPressure] = useState(1013); // 気圧 (hPa)
  const [temperature, setTemperature] = useState(20); // 気温
  const [mode, setMode] = useState<'simulation' | 'quiz'>('simulation');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  const progress = Math.min((score / 5) * 100, 100);
  
  // 天気図を描画
  const drawWeatherMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height);
    
    // 背景（空）
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 地面
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, height - 50, width, 50);
    
    // 天気を描画
    const sectionWidth = width / weather.length;
    weather.forEach((w, index) => {
      const x = index * sectionWidth + sectionWidth / 2;
      const y = height / 2;
      
      ctx.save();
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      switch (w) {
        case '晴れ':
          ctx.fillStyle = '#FFD700';
          ctx.fillText('☀️', x, y);
          break;
        case 'くもり':
          ctx.fillStyle = '#808080';
          ctx.fillText('☁️', x, y);
          break;
        case '雨':
          ctx.fillStyle = '#4169E1';
          ctx.fillText('🌧️', x, y);
          break;
      }
      ctx.restore();
    });
    
    // 前線を描画
    const frontX = (front.position / 100) * width;
    ctx.strokeStyle = front.type === '寒冷前線' ? '#0000FF' : '#FF0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(frontX, 50);
    ctx.lineTo(frontX, height - 50);
    ctx.stroke();
    
    // 前線の記号
    ctx.save();
    ctx.translate(frontX, 100);
    if (front.type === '寒冷前線') {
      // 三角形（寒冷前線）
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 30);
        ctx.lineTo(15, i * 30 + 15);
        ctx.lineTo(0, i * 30 + 30);
        ctx.closePath();
        ctx.fillStyle = '#0000FF';
        ctx.fill();
      }
    } else {
      // 半円（温暖前線）
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, i * 30 + 15, 15, -Math.PI / 2, Math.PI / 2);
        ctx.fillStyle = '#FF0000';
        ctx.fill();
      }
    }
    ctx.restore();
    
    // 風向き
    ctx.save();
    ctx.translate(width - 50, 50);
    ctx.rotate((windDirection - 90) * Math.PI / 180);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.moveTo(20, 0);
    ctx.lineTo(10, -10);
    ctx.moveTo(20, 0);
    ctx.lineTo(10, 10);
    ctx.stroke();
    ctx.restore();
    
    // 気圧と気温
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`気圧: ${pressure} hPa`, 10, 30);
    ctx.fillText(`気温: ${temperature}°C`, 10, 50);
  };
  
  // 前線の動きをシミュレート
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setFront(prev => {
        const newPosition = prev.position + prev.speed;
        if (newPosition >= 100) {
          setIsPlaying(false);
          return prev;
        }
        
        // 前線の位置に応じて天気を変更
        updateWeatherByFront(newPosition);
        
        return { ...prev, position: newPosition };
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  // 前線の位置に応じて天気を更新
  const updateWeatherByFront = (position: number) => {
    const index = Math.floor(position / 20);
    
    setWeather(prev => {
      const newWeather = [...prev];
      
      if (front.type === '寒冷前線') {
        // 寒冷前線：急激に天気が悪化し、通過後は回復
        if (index > 0) newWeather[index - 1] = '雨';
        if (index < newWeather.length) newWeather[index] = 'くもり';
        if (index < newWeather.length - 1) newWeather[index + 1] = '晴れ';
      } else {
        // 温暖前線：徐々に天気が悪化
        if (index > 0) newWeather[index - 1] = 'くもり';
        if (index < newWeather.length) newWeather[index] = '雨';
      }
      
      return newWeather;
    });
    
    // 気圧と気温も変化
    setPressure(prev => prev - 0.5);
    setTemperature(prev => front.type === '寒冷前線' ? prev - 0.2 : prev + 0.1);
  };
  
  // クイズを生成
  const generateQuiz = () => {
    const questions = [
      '寒冷前線が通過すると、天気はどう変わる？',
      '温暖前線が近づくと、天気はどう変わる？',
      '前線が通過した後の天気は？',
      '低気圧が近づくと気圧はどうなる？'
    ];
    setQuizQuestion(questions[Math.floor(Math.random() * questions.length)]);
  };
  
  // リセット
  const handleReset = () => {
    recordInteraction('click');
    
    // リセット実行を記録
    recordAnswer(true, {
      problem: '天気変化シミュレーターのリセット',
      userAnswer: 'システムを初期状態に戻す',
      correctAnswer: 'リセット完了'
    });
    
    setFront({ type: '寒冷前線', position: 20, speed: 1 });
    setWeather(['晴れ', '晴れ', 'くもり', '雨', '雨']);
    setIsPlaying(false);
    setPressure(1013);
    setTemperature(20);
    setWindDirection(270);
    if (mode === 'quiz') {
      generateQuiz();
    }
  };
  
  // エフェクト
  useEffect(() => {
    drawWeatherMap();
  }, [front, weather, windDirection, pressure, temperature]);
  
  useEffect(() => {
    if (mode === 'quiz') {
      generateQuiz();
    }
  }, [mode]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          天気の変化シミュレーター
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
        気象の変化を観察！前線の動きや気圧配置から、天気の変化を予測してみよう。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`前線: ${front.type}`}
          icon={<CloudIcon />}
          color="primary" 
          size="medium"
        />
        <Chip 
          label={`気圧: ${pressure.toFixed(1)} hPa`}
          color="secondary" 
          size="medium"
        />
        <Chip 
          label={`気温: ${temperature.toFixed(1)}°C`}
          color="info" 
          size="medium"
        />
        {mode === 'quiz' && (
          <Chip 
            label={`得点: ${score}/5`} 
            color="success" 
            size="medium"
          />
        )}
      </Box>

      {/* 進捗バー */}
      {mode === 'quiz' && progress > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">学習進捗</Typography>
            <Typography variant="caption">{progress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

      {/* モード選択 */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, value) => {
            if (value) {
              recordInteraction('click');
              
              // モード切り替えを記録
              recordAnswer(true, {
                problem: '天気シミュレーターのモード切り替え',
                userAnswer: `${value === 'simulation' ? 'シミュレーション' : 'クイズ'}モードを選択`,
                correctAnswer: 'モード選択の理解'
              });
              
              setMode(value);
            }
          }}
          fullWidth
        >
          <ToggleButton value="simulation">
            シミュレーション
          </ToggleButton>
          <ToggleButton value="quiz">
            クイズ
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：天気図 */}
        <Grid xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f5f5f5'
                }}
              />
            </Box>
            
            {mode === 'simulation' && (
              <>
                {/* コントロール */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                  <IconButton
                    size="large"
                    onClick={() => {
                      const newIsPlaying = !isPlaying;
                      recordInteraction('click');
                      
                      // シミュレーション制御を記録
                      recordAnswer(true, {
                        problem: '天気変化シミュレーションの制御',
                        userAnswer: newIsPlaying ? 'シミュレーション開始' : 'シミュレーション停止',
                        correctAnswer: 'シミュレーション制御の理觨'
                      });
                      
                      setIsPlaying(newIsPlaying);
                    }}
                    color="primary"
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </IconButton>
                </Box>
                
                {/* 前線の種類 */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    前線の種類
                  </Typography>
                  <ToggleButtonGroup
                    value={front.type}
                    exclusive
                    onChange={(_, value) => {
                      if (value) {
                        recordInteraction('click');
                        
                        // 前線タイプ変更を記録
                        recordAnswer(true, {
                          problem: '前線タイプの選択',
                          userAnswer: `${value}を選択`,
                          correctAnswer: '前線の特徴理觨'
                        });
                        
                        setFront(prev => ({ ...prev, type: value }));
                      }
                    }}
                    fullWidth
                  >
                    <ToggleButton value="寒冷前線">
                      寒冷前線（青）
                    </ToggleButton>
                    <ToggleButton value="温暖前線">
                      温暖前線（赤）
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                
                {/* 前線の速度 */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    前線の速度: {front.speed}
                  </Typography>
                  <Slider
                    value={front.speed}
                    onChange={(_, value) => setFront(prev => ({ ...prev, speed: value as number }))}
                    min={0.5}
                    max={3}
                    step={0.5}
                    marks
                    disabled={isPlaying}
                  />
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* 右側：情報 */}
        <Grid xs={12} md={4}>
          {mode === 'simulation' ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  前線の特徴
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  寒冷前線
                </Typography>
                <Typography variant="body2" paragraph>
                  • 冷たい空気が暖かい空気の下に潜り込む<br/>
                  • 急激に天気が悪化（強い雨）<br/>
                  • 通過後は天気が回復し、気温が下がる<br/>
                  • 移動速度が速い
                </Typography>
                
                <Typography variant="subtitle2">
                  温暖前線
                </Typography>
                <Typography variant="body2">
                  • 暖かい空気が冷たい空気の上に乗り上げる<br/>
                  • 徐々に天気が悪化（長雨）<br/>
                  • 通過後は気温が上がる<br/>
                  • 移動速度が遅い
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  クイズ
                </Typography>
                <Typography variant="body1" paragraph>
                  {quizQuestion}
                </Typography>
                <Grid container spacing={1}>
                  <Grid xs={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        const isCorrect = quizQuestion.includes('寒冷前線');
                        recordInteraction('click');
                        setAttempts(prev => prev + 1);
                        
                        // クイズ回答を記録
                        recordAnswer(isCorrect, {
                          problem: `天気変化クイズ: ${quizQuestion}`,
                          userAnswer: '急激に悪化→回復',
                          correctAnswer: quizQuestion.includes('寒冷前線') ? '急激に悪化→回復' : '徐々に悪化',
                          quizData: {
                            question: quizQuestion,
                            selectedAnswer: '急激に悪化→回復',
                            isCorrect: isCorrect,
                            currentScore: score + (isCorrect ? 1 : 0),
                            currentAttempts: attempts + 1,
                            frontType: isCorrect ? '寒冷前線' : '温暖前線'
                          }
                        });
                        
                        if (isCorrect) {
                          setScore(prev => prev + 1);
                          alert('正解！急激に悪化し、通過後は回復します');
                          generateQuiz();
                        } else {
                          alert('もう一度考えてみよう');
                        }
                      }}
                    >
                      急激に悪化→回復
                    </Button>
                  </Grid>
                  <Grid xs={12}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        const isCorrect = quizQuestion.includes('温暖前線');
                        recordInteraction('click');
                        setAttempts(prev => prev + 1);
                        
                        // クイズ回答を記録
                        recordAnswer(isCorrect, {
                          problem: `天気変化クイズ: ${quizQuestion}`,
                          userAnswer: '徐々に悪化',
                          correctAnswer: quizQuestion.includes('温暖前線') ? '徐々に悪化' : '急激に悪化→回復',
                          quizData: {
                            question: quizQuestion,
                            selectedAnswer: '徐々に悪化',
                            isCorrect: isCorrect,
                            currentScore: score + (isCorrect ? 1 : 0),
                            currentAttempts: attempts + 1,
                            frontType: isCorrect ? '温暖前線' : '寒冷前線'
                          }
                        });
                        
                        if (isCorrect) {
                          setScore(prev => prev + 1);
                          alert('正解！徐々に天気が悪化します');
                          generateQuiz();
                        } else {
                          alert('もう一度考えてみよう');
                        }
                      }}
                    >
                      徐々に悪化
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e3f2fd' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🌤️ 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 前線は冷たい空気と暖かい空気の境目です<br/>
          • 低気圧の中心に向かって風が吹き込みます<br/>
          • 前線の通過で天気が大きく変化します<br/>
          • 天気図を見て、明日の天気を予想してみよう！
        </Typography>
      </Paper>
    </Box>
  );
}

// 天気の変化シミュレーター（MaterialWrapperでラップ）
function WeatherChangeSimulator({ onClose }: { onClose: () => void }) {
  return (
    <MaterialWrapper
      materialId="weather-change-simulator"
      materialName="天気の変化シミュレーター"
      showMetricsButton={true}
      showAssistant={true}
    >
      <WeatherChangeSimulatorContent onClose={onClose} />
    </MaterialWrapper>
  );
}

export default WeatherChangeSimulator;