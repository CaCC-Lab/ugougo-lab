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
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon
} from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

// ひらがなの書き順データ（簡略版）
const hiraganaData: { [key: string]: { strokes: string[]; name: string } } = {
  'あ': {
    name: 'あ',
    strokes: [
      'M 50,30 Q 50,50 40,70',  // 1画目
      'M 30,50 Q 50,50 70,50',  // 2画目
      'M 60,30 Q 60,50 60,70 Q 60,80 50,85 Q 40,80 45,70'  // 3画目
    ]
  },
  'い': {
    name: 'い',
    strokes: [
      'M 40,30 Q 40,50 40,70',  // 1画目（左の縦線）
      'M 60,30 Q 60,50 60,70'   // 2画目（右の縦線）
    ]
  },
  'う': {
    name: 'う',
    strokes: [
      'M 50,25 Q 50,35 50,45',  // 1画目（上の点）
      'M 30,50 Q 50,40 70,50 Q 70,60 60,70 Q 50,75 40,70'  // 2画目（曲線）
    ]
  },
  'え': {
    name: 'え',
    strokes: [
      'M 30,40 Q 50,40 70,40',  // 1画目（横線）
      'M 40,30 Q 40,50 35,70 Q 50,75 65,70'  // 2画目（縦線と下の曲線）
    ]
  },
  'お': {
    name: 'お',
    strokes: [
      'M 30,40 Q 50,40 70,40',  // 1画目（横線）
      'M 40,30 Q 40,50 40,65',  // 2画目（縦線）
      'M 55,50 Q 65,60 60,70 Q 50,75 40,70'  // 3画目（右の曲線）
    ]
  },
  'か': {
    name: 'か',
    strokes: [
      'M 30,40 Q 50,40 65,40 Q 70,50 65,60',  // 1画目
      'M 40,30 Q 40,50 40,70',  // 2画目
      'M 50,55 Q 60,55 70,55'   // 3画目
    ]
  },
  'き': {
    name: 'き',
    strokes: [
      'M 30,35 Q 50,35 70,35',  // 1画目（上の横線）
      'M 30,50 Q 45,50 60,50',  // 2画目（中の横線）
      'M 50,25 Q 50,45 50,65',  // 3画目（縦線）
      'M 40,65 Q 50,70 60,65'   // 4画目（下の曲線）
    ]
  },
  'く': {
    name: 'く',
    strokes: [
      'M 60,30 Q 40,50 60,70'  // 1画目（く の形）
    ]
  },
  'け': {
    name: 'け',
    strokes: [
      'M 40,30 Q 40,50 40,70',  // 1画目（縦線）
      'M 30,40 Q 45,40 60,40 Q 65,50 60,60',  // 2画目（横線と曲がり）
      'M 50,55 Q 60,55 70,55'   // 3画目（右の短い線）
    ]
  },
  'こ': {
    name: 'こ',
    strokes: [
      'M 30,40 Q 50,40 70,40',  // 1画目（上の横線）
      'M 30,60 Q 50,60 70,60'   // 2画目（下の横線）
    ]
  }
};

// ひらがな書き順アニメーション（内部コンポーネント）
function HiraganaStrokeOrderContent({ onClose }: { onClose: () => void }) {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const practiceCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [selectedHiragana, setSelectedHiragana] = useState('あ');
  const [currentStroke, setCurrentStroke] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  const [completedCharacters, setCompletedCharacters] = useState<string[]>([]);
  const [practiceStrokeIndex, setPracticeStrokeIndex] = useState(0);
  const [strokeCompleted, setStrokeCompleted] = useState<boolean[]>([]);
  const [showStrokeGuide, setShowStrokeGuide] = useState(true);
  
  const canvasSize = 200;
  const animationSpeed = 2000; // 2秒で1画
  
  // キャンバスをクリア
  const clearCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // ガイド線を描画
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // 十字線
    ctx.beginPath();
    ctx.moveTo(canvasSize / 2, 0);
    ctx.lineTo(canvasSize / 2, canvasSize);
    ctx.moveTo(0, canvasSize / 2);
    ctx.lineTo(canvasSize, canvasSize / 2);
    ctx.stroke();
    
    // 外枠
    ctx.strokeRect(0, 0, canvasSize, canvasSize);
    ctx.setLineDash([]);
  };
  
  // 文字の輪郭を描画（薄い色で）
  const drawOutline = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const data = hiraganaData[selectedHiragana];
    if (!data) return;
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    data.strokes.forEach(stroke => {
      const path = new Path2D(stroke);
      ctx.stroke(path);
    });
  };
  
  // ストロークを描画
  const drawStroke = (canvas: HTMLCanvasElement | null, strokeIndex: number, progress: number = 1) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const data = hiraganaData[selectedHiragana];
    if (!data || strokeIndex >= data.strokes.length) return;
    
    // 現在のストロークを描画
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const path = new Path2D(data.strokes[strokeIndex]);
    
    if (progress < 1) {
      // アニメーション中は部分的に描画
      ctx.save();
      ctx.clip(new Path2D(`M 0,0 L ${canvasSize * progress},0 L ${canvasSize * progress},${canvasSize} L 0,${canvasSize} Z`));
      ctx.stroke(path);
      ctx.restore();
    } else {
      ctx.stroke(path);
    }
    
    // 書き順番号を表示
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 16px Arial';
    ctx.fillText((strokeIndex + 1).toString(), 10, 20 + strokeIndex * 20);
  };
  
  // すべてのストロークを描画
  const drawAllStrokes = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    clearCanvas(canvas);
    drawOutline(canvas);
    
    const data = hiraganaData[selectedHiragana];
    if (!data) return;
    
    // 完成したストロークを黒で描画
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let i = 0; i < currentStroke; i++) {
      const path = new Path2D(data.strokes[i]);
      ctx.stroke(path);
    }
  };
  
  // アニメーション開始
  const startAnimation = () => {
    setIsAnimating(true);
    setCurrentStroke(0);
    recordInteraction('click');
    
    const animate = () => {
      const data = hiraganaData[selectedHiragana];
      if (!data || currentStroke >= data.strokes.length) {
        setIsAnimating(false);
        return;
      }
      
      let progress = 0;
      const step = () => {
        progress += 0.02;
        
        if (progress > 1) {
          setCurrentStroke(prev => prev + 1);
          setTimeout(() => {
            if (currentStroke < data.strokes.length - 1) {
              animate();
            } else {
              setIsAnimating(false);
              if (!completedCharacters.includes(selectedHiragana)) {
                setCompletedCharacters(prev => [...prev, selectedHiragana]);
                setProgress(prev => Math.min(prev + 10, 100));
              }
            }
          }, 500);
          return;
        }
        
        const canvas = canvasRef.current;
        if (canvas) {
          drawAllStrokes(canvas);
          drawStroke(canvas, currentStroke, progress);
        }
        
        animationRef.current = requestAnimationFrame(step);
      };
      
      step();
    };
    
    animate();
  };
  
  // アニメーション停止
  const stopAnimation = () => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    recordInteraction('click');
  };
  
  // 練習モードの処理
  const handlePracticeStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPracticeMode) return;
    setIsDrawing(true);
    
    const canvas = practiceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const handlePracticeMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isPracticeMode) return;
    
    const canvas = practiceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const handlePracticeEnd = () => {
    setIsDrawing(false);
    if (isPracticeMode && practiceStrokeIndex < hiraganaData[selectedHiragana].strokes.length) {
      // ストロークの完了を判定
      const canvas = practiceCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // キャンバスに描画があるかチェック
      const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
      let hasDrawing = false;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) {
          hasDrawing = true;
          break;
        }
      }
      
      if (hasDrawing) {
        // ストロークを完了としてマーク
        const newCompleted = [...strokeCompleted];
        newCompleted[practiceStrokeIndex] = true;
        setStrokeCompleted(newCompleted);
        
        // 次のストロークへ
        if (practiceStrokeIndex < hiraganaData[selectedHiragana].strokes.length - 1) {
          setPracticeStrokeIndex(practiceStrokeIndex + 1);
          setTimeout(() => {
            drawPracticeGuide();
          }, 500);
        } else {
          // すべてのストロークが完了
          setPracticeScore(prev => prev + 10);
          if (!completedCharacters.includes(selectedHiragana)) {
            setCompletedCharacters([...completedCharacters, selectedHiragana]);
          }
          
          // 学習履歴に記録
          recordAnswer(true, {
            problem: `「${selectedHiragana}」の書き順練習`,
            userAnswer: '正しい書き順で完了',
            correctAnswer: `${hiraganaData[selectedHiragana].strokes.length}画`
          });
          
          // 完了メッセージを表示
          setTimeout(() => {
            alert(`「${selectedHiragana}」の練習完了！正しい書き順で書けました！`);
            resetPractice();
          }, 500);
        }
      }
    }
  };
  
  // 練習モードのリセット
  const resetPractice = () => {
    setPracticeStrokeIndex(0);
    setStrokeCompleted(new Array(hiraganaData[selectedHiragana].strokes.length).fill(false));
    clearCanvas(practiceCanvasRef.current);
    drawPracticeGuide();
  };
  
  // 練習用ガイドの描画
  const drawPracticeGuide = () => {
    const canvas = practiceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    clearCanvas(canvas);
    
    const strokes = hiraganaData[selectedHiragana].strokes;
    
    // 完了したストロークを緑色で表示
    strokeCompleted.forEach((completed, index) => {
      if (completed && index < practiceStrokeIndex) {
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const path = new Path2D(strokes[index]);
        ctx.stroke(path);
      }
    });
    
    // 現在のストロークを赤い点線でガイド表示
    if (practiceStrokeIndex < strokes.length && showStrokeGuide) {
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const path = new Path2D(strokes[practiceStrokeIndex]);
      ctx.stroke(path);
      ctx.setLineDash([]);
      
      // ストローク番号を表示
      ctx.fillStyle = '#FF5722';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`${practiceStrokeIndex + 1}画目`, 10, 25);
    }
  };
  
  // エフェクト
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      clearCanvas(canvas);
      drawOutline(canvas);
    }
    
    // 文字が変更されたら練習をリセット
    setPracticeStrokeIndex(0);
    setStrokeCompleted(new Array(hiraganaData[selectedHiragana].strokes.length).fill(false));
    if (isPracticeMode) {
      const practiceCanvas = practiceCanvasRef.current;
      if (practiceCanvas) {
        setTimeout(() => drawPracticeGuide(), 100);
      }
    }
  }, [selectedHiragana]);
  
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          ひらがな書き順アニメーション
        </Typography>
        <Box>
          <IconButton onClick={() => setSoundEnabled(!soundEnabled)} sx={{ mr: 1 }}>
            {soundEnabled ? <VolumeIcon /> : <MuteIcon />}
          </IconButton>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        ひらがなの正しい書き順を覚えよう！アニメーションを見て、なぞり書きで練習できます。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`練習文字数: ${completedCharacters.length}`}
          color="primary" 
          size="medium"
        />
        <Chip 
          label={`練習スコア: ${practiceScore}`} 
          color="secondary" 
          size="medium"
        />
        <FormControlLabel
          control={<Switch checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />}
          label="効果音"
        />
      </Box>

      {/* 進捗バー */}
      {progress > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">学習進捗</Typography>
            <Typography variant="caption">{progress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

      {/* 文字選択 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          もじをえらぼう
        </Typography>
        <ToggleButtonGroup
          value={selectedHiragana}
          exclusive
          onChange={(_, value) => {
            if (value) {
              setSelectedHiragana(value);
              recordInteraction('click');
            }
          }}
          sx={{ flexWrap: 'wrap' }}
        >
          {Object.keys(hiraganaData).map(char => (
            <ToggleButton 
              key={char} 
              value={char}
              sx={{ 
                fontSize: '1.5rem',
                width: 60,
                height: 60,
                bgcolor: completedCharacters.includes(char) ? 'success.light' : 'background.paper'
              }}
            >
              {char}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：書き順アニメーション */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              かきじゅん
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                style={{
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff'
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={isAnimating ? <PauseIcon /> : <PlayIcon />}
                onClick={isAnimating ? stopAnimation : startAnimation}
                size="large"
              >
                {isAnimating ? 'ストップ' : 'さいせい'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setCurrentStroke(0);
                  clearCanvas(canvasRef.current);
                  drawOutline(canvasRef.current);
                }}
              >
                リセット
              </Button>
            </Box>
            
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  「{selectedHiragana}」のかきかた
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 画数: {hiraganaData[selectedHiragana].strokes.length}画<br/>
                  • 書き順の番号を見ながら練習しよう<br/>
                  • 赤い線が書く順番を教えてくれるよ
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* 右側：なぞり書き練習 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              なぞりがきれんしゅう
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <canvas
                ref={practiceCanvasRef}
                width={canvasSize}
                height={canvasSize}
                style={{
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  cursor: isPracticeMode ? 'crosshair' : 'default'
                }}
                onMouseDown={handlePracticeStart}
                onMouseMove={handlePracticeMove}
                onMouseUp={handlePracticeEnd}
                onMouseLeave={handlePracticeEnd}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant={isPracticeMode ? 'contained' : 'outlined'}
                onClick={() => {
                  setIsPracticeMode(!isPracticeMode);
                  if (!isPracticeMode) {
                    setTimeout(() => resetPractice(), 100);
                  } else {
                    clearCanvas(practiceCanvasRef.current);
                    drawOutline(practiceCanvasRef.current);
                  }
                }}
                size="large"
              >
                {isPracticeMode ? 'れんしゅうちゅう' : 'れんしゅうする'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (isPracticeMode) {
                    drawPracticeGuide();
                  } else {
                    clearCanvas(practiceCanvasRef.current);
                    drawOutline(practiceCanvasRef.current);
                  }
                }}
              >
                けす
              </Button>
            </Box>
            
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  れんしゅうのポイント
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 赤い点線が今書くストロークだよ<br/>
                  • 順番に1画ずつなぞって書こう<br/>
                  • 書き終わったら自動で次の画へ<br/>
                  • 全部書けたら完成だよ！<br/>
                  {isPracticeMode && practiceStrokeIndex < hiraganaData[selectedHiragana].strokes.length && (
                    <>
                      <br/>
                      <strong>現在: {practiceStrokeIndex + 1}/{hiraganaData[selectedHiragana].strokes.length}画目</strong>
                    </>
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e9' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          ✏️ 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 正しい書き順を覚えることで、きれいな字が書けるようになります<br/>
          • アニメーションを何度も見て、書き順を目で覚えましょう<br/>
          • なぞり書きで手を動かして、体で覚えましょう<br/>
          • 毎日少しずつ練習することが大切です
        </Typography>
      </Paper>
    </Box>
  );
}

// ひらがな書き順アニメーション（MaterialWrapperでラップ）
function HiraganaStrokeOrder({ onClose }: { onClose: () => void }) {
  return (
    <MaterialWrapper
      materialId="hiragana-stroke"
      materialName="ひらがな書き順アニメーション"
      showMetricsButton={true}
      showAssistant={true}
    >
      <HiraganaStrokeOrderContent onClose={onClose} />
    </MaterialWrapper>
  );
}

export default HiraganaStrokeOrder;