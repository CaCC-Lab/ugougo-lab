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
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  Alert
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  LocalPizza as PizzaIcon,
  ContentCut as CutIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

interface FractionPizzaCutterProps {
  onClose?: () => void;
}

// 分数ピザカッター（内部コンポーネント）
const FractionPizzaCutterContent: React.FC<FractionPizzaCutterProps> = ({ onClose }) => {
  const { recordInteraction, recordAnswer } = useLearningTrackerContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [slices, setSlices] = useState(8); // ピザを何等分するか
  const [selectedSlices, setSelectedSlices] = useState<number[]>([]); // 選択されたピースのインデックス
  const [mode, setMode] = useState<'practice' | 'quiz'>('practice'); // 練習モードかクイズモード
  const [quizNumerator, setQuizNumerator] = useState(1);
  const [quizDenominator, setQuizDenominator] = useState(4);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const canvasSize = 400;
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  const radius = 150;
  
  // 新しいクイズ問題を生成
  const generateNewQuiz = () => {
    const denominators = [2, 3, 4, 5, 6, 8, 10, 12];
    const newDenominator = denominators[Math.floor(Math.random() * denominators.length)];
    const newNumerator = Math.floor(Math.random() * newDenominator) + 1;
    
    setQuizDenominator(newDenominator);
    setQuizNumerator(newNumerator);
    setSlices(newDenominator);
    setSelectedSlices([]);
    setShowAnswer(false);
    setIsCorrect(false);
  };
  
  // ピザを描画
  const drawPizza = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // ピザの土台（薄い茶色）
    ctx.fillStyle = '#F4A460';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // ピザの耳（濃い茶色）
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // 各ピースを描画
    for (let i = 0; i < slices; i++) {
      const startAngle = (i * 2 * Math.PI) / slices - Math.PI / 2;
      const endAngle = ((i + 1) * 2 * Math.PI) / slices - Math.PI / 2;
      
      // ピースの本体
      ctx.fillStyle = selectedSlices.includes(i) ? '#FFD700' : '#FFA500';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius - 4, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
      
      // ピースの境界線
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // トッピング（チーズ）
      const midAngle = (startAngle + endAngle) / 2;
      const cheeseX = centerX + Math.cos(midAngle) * (radius * 0.6);
      const cheeseY = centerY + Math.sin(midAngle) * (radius * 0.6);
      
      ctx.fillStyle = selectedSlices.includes(i) ? '#FFFACD' : '#FFFF99';
      ctx.beginPath();
      ctx.arc(cheeseX, cheeseY, 15, 0, 2 * Math.PI);
      ctx.fill();
      
      // トッピング（ペパロニ）
      const pepperoniX = centerX + Math.cos(midAngle) * (radius * 0.4);
      const pepperoniY = centerY + Math.sin(midAngle) * (radius * 0.4);
      
      ctx.fillStyle = selectedSlices.includes(i) ? '#DC143C' : '#8B0000';
      ctx.beginPath();
      ctx.arc(pepperoniX, pepperoniY, 10, 0, 2 * Math.PI);
      ctx.fill();
      
      // 選択されたピースにハイライト
      if (selectedSlices.includes(i)) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius - 4, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
      }
    }
    
    // 中心に小さい円（ピザの中心）
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fill();
  };
  
  // ピースをクリック/タッチで選択
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    // クリック位置の角度を計算
    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    
    // どのピースがクリックされたか判定
    const pieceIndex = Math.floor((angle / (2 * Math.PI)) * slices);
    
    // 距離をチェック（ピザの外側をクリックしていないか）
    const distance = Math.sqrt(x * x + y * y);
    if (distance <= radius) {
      toggleSliceSelection(pieceIndex);
    }
  };
  
  // ピースの選択/選択解除
  const toggleSliceSelection = (index: number) => {
    setSelectedSlices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
    recordInteraction('click');
  };
  
  // 答えをチェック（クイズモード）
  const checkAnswer = () => {
    if (mode !== 'quiz') return;
    
    const correctSlices = quizNumerator;
    const isAnswerCorrect = selectedSlices.length === correctSlices;
    
    setIsCorrect(isAnswerCorrect);
    setShowAnswer(true);
    setAttempts(prev => prev + 1);
    
    // 回答結果を記録
    recordAnswer(isAnswerCorrect, {
      problem: `分数パズル: ${quizNumerator}/${quizDenominator}を選択`,
      userAnswer: `${selectedSlices.length}個選択`,
      correctAnswer: `${correctSlices}個選択`
    });
    recordInteraction('click');
    
    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
      setProgress(prev => Math.min(prev + 10, 100));
      
      setTimeout(() => {
        generateNewQuiz();
      }, 2000);
    }
  };
  
  // リセット
  const handleReset = () => {
    setSelectedSlices([]);
    setScore(0);
    setAttempts(0);
    setProgress(0);
    if (mode === 'quiz') {
      generateNewQuiz();
    }
    recordInteraction('click');
  };
  
  // 分数の表示用フォーマット
  const formatFraction = (numerator: number, denominator: number) => {
    return `${numerator}/${denominator}`;
  };
  
  // 分数を簡単にする
  const simplifyFraction = (numerator: number, denominator: number) => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(numerator, denominator);
    return {
      numerator: numerator / divisor,
      denominator: denominator / divisor
    };
  };
  
  // エフェクト
  useEffect(() => {
    drawPizza();
  }, [slices, selectedSlices]);
  
  useEffect(() => {
    if (mode === 'quiz') {
      generateNewQuiz();
    }
  }, [mode]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          分数ピザカッター
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
        ピザを切って分数を学ぼう！ピースをクリックして選択できます。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`選択: ${selectedSlices.length}/${slices}`}
          icon={<PizzaIcon />}
          color="primary" 
          size="medium"
        />
        {mode === 'quiz' && (
          <>
            <Chip 
              label={`得点: ${score}`} 
              color="secondary" 
              size="medium"
            />
            <Chip 
              label={`挑戦: ${attempts}`} 
              color="info" 
              size="medium"
            />
          </>
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
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, value) => {
            if (value) {
              setMode(value);
              recordInteraction('click');
            }
          }}
          fullWidth
        >
          <ToggleButton value="practice">
            練習モード
          </ToggleButton>
          <ToggleButton value="quiz">
            クイズモード
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：コントロール */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {mode === 'practice' ? 'ピザの切り分け' : 'クイズ'}
            </Typography>
            
            {mode === 'practice' ? (
              <>
                {/* 分割数の調整 */}
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  何等分にする？
                </Typography>
                <ButtonGroup fullWidth sx={{ mb: 2 }}>
                  <Button onClick={() => {
                    setSlices(Math.max(2, slices - 1));
                    recordInteraction('click');
                  }}>
                    <RemoveIcon />
                  </Button>
                  <Button disabled>{slices}等分</Button>
                  <Button onClick={() => {
                    setSlices(Math.min(12, slices + 1));
                    recordInteraction('click');
                  }}>
                    <AddIcon />
                  </Button>
                </ButtonGroup>
                
                {/* 現在の分数表示 */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      選んだピース
                    </Typography>
                    <Typography variant="h3" color="primary" sx={{ textAlign: 'center' }}>
                      {formatFraction(selectedSlices.length, slices)}
                    </Typography>
                    {selectedSlices.length > 0 && slices > selectedSlices.length && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                        {(() => {
                          const simplified = simplifyFraction(selectedSlices.length, slices);
                          return simplified.denominator !== slices 
                            ? `= ${formatFraction(simplified.numerator, simplified.denominator)}`
                            : '';
                        })()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
                
                {/* 分数の説明 */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      分数のよみかた
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 上の数字（分子）: 選んだピースの数<br/>
                      • 下の数字（分母）: 全体を何等分したか<br/>
                      • {selectedSlices.length}/{slices} は「{slices}分の{selectedSlices.length}」と読みます
                    </Typography>
                  </CardContent>
                </Card>
                
                {/* クリアボタン */}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setSelectedSlices([]);
                    recordInteraction('click');
                  }}
                  sx={{ mt: 2 }}
                >
                  選択をクリア
                </Button>
              </>
            ) : (
              <>
                {/* クイズ問題 */}
                <Card variant="outlined" sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      問題
                    </Typography>
                    <Typography variant="h3" color="primary" sx={{ textAlign: 'center', mb: 1 }}>
                      {formatFraction(quizNumerator, quizDenominator)}
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                      のピザを選んでね！
                    </Typography>
                  </CardContent>
                </Card>
                
                {/* 答え合わせボタン */}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={checkAnswer}
                  disabled={selectedSlices.length === 0 || showAnswer}
                  sx={{ mb: 2 }}
                >
                  答え合わせ
                </Button>
                
                {/* 結果表示 */}
                {showAnswer && (
                  <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mb: 2 }}>
                    {isCorrect ? (
                      <>
                        🎉 正解！<br/>
                        {quizDenominator}個に分けたピザの{quizNumerator}個分です！
                      </>
                    ) : (
                      <>
                        惜しい！<br/>
                        {quizNumerator}個のピースを選んでね。
                      </>
                    )}
                  </Alert>
                )}
                
                {/* ヒント */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      💡 ヒント
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      分母（{quizDenominator}）: ピザを{quizDenominator}等分<br/>
                      分子（{quizNumerator}）: その中から{quizNumerator}個選ぶ
                    </Typography>
                  </CardContent>
                </Card>
              </>
            )}
          </Paper>
        </Grid>

        {/* 右側：ピザ表示 */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <PizzaIcon sx={{ mr: 1 }} />
              ピザ
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                style={{
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onClick={handleCanvasClick}
              />
            </Box>
            
            {/* 分数の比較（練習モード） */}
            {mode === 'practice' && selectedSlices.length > 0 && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        同じ大きさの分数
                      </Typography>
                      <Typography variant="body2">
                        {(() => {
                          const examples = [];
                          for (let i = 2; i <= 4; i++) {
                            const newNum = selectedSlices.length * i;
                            const newDen = slices * i;
                            if (newDen <= 24) {
                              examples.push(`${newNum}/${newDen}`);
                            }
                          }
                          return examples.join(', ');
                        })()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        パーセント
                      </Typography>
                      <Typography variant="body2">
                        {Math.round((selectedSlices.length / slices) * 100)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#fff3e0' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🍕 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 分数は「全体をいくつに分けて、そのうちいくつか」を表します<br/>
          • ピザを使うと、分数の大きさが目で見てわかります<br/>
          • 同じ大きさでも、切り方によって分数の表し方が変わります<br/>
          • クイズモードで、いろいろな分数に挑戦してみよう！
        </Typography>
      </Paper>
    </Box>
  );
};

// 分数ピザカッター（MaterialWrapperでラップ）
const FractionPizzaCutter: React.FC<FractionPizzaCutterProps> = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="fraction-pizza-cutter"
      materialName="分数ピザカッター"
      showMetricsButton={true}
      showAssistant={true}
    >
      <FractionPizzaCutterContent onClose={onClose} />
    </MaterialWrapper>
  );
};

export default FractionPizzaCutter;