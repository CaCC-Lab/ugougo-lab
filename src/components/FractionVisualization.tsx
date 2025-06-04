import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Button,
  Paper,
  LinearProgress,
  IconButton,
  Slider,
  ButtonGroup,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon } from '@mui/icons-material';

// 分数の視覚化教材
function FractionVisualization({ onClose }: { onClose: () => void }) {
  const [numerator, setNumerator] = useState(1);
  const [denominator, setDenominator] = useState(4);
  const [visualMode, setVisualMode] = useState<'pie' | 'bar'>('pie');
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState({ num: 1, den: 4 });
  const [userAnswer, setUserAnswer] = useState<string>('');

  // 新しいクイズ問題を生成
  const generateQuiz = () => {
    const den = Math.floor(Math.random() * 8) + 2; // 2-9
    const num = Math.floor(Math.random() * (den - 1)) + 1; // 1 to den-1
    setQuizQuestion({ num, den });
    setUserAnswer('');
  };

  // クイズ回答チェック
  const checkQuizAnswer = (answer: string) => {
    setUserAnswer(answer);
    const [answerNum, answerDen] = answer.split('/').map(Number);
    if (answerNum === quizQuestion.num && answerDen === quizQuestion.den) {
      setSuccessCount(prev => prev + 1);
      setProgress(prev => Math.min(prev + 10, 100));
      setTimeout(() => {
        generateQuiz();
      }, 2000);
    }
  };

  // リセット
  const handleReset = () => {
    setProgress(0);
    setSuccessCount(0);
    setNumerator(1);
    setDenominator(4);
    setQuizMode(false);
    setUserAnswer('');
  };

  // 円グラフの描画
  const renderPieChart = (num: number, den: number) => {
    const segments = [];
    const segmentAngle = 360 / den;
    
    for (let i = 0; i < den; i++) {
      const startAngle = i * segmentAngle - 90; // -90度から開始（12時方向）
      const endAngle = (i + 1) * segmentAngle - 90;
      const isFilled = i < num;
      
      // SVGパスを計算
      const centerX = 100;
      const centerY = 100;
      const radius = 80;
      
      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
      
      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      segments.push(
        <path
          key={i}
          d={pathData}
          fill={isFilled ? '#4CAF50' : '#E0E0E0'}
          stroke="#333"
          strokeWidth="2"
          style={{
            transition: 'fill 0.3s ease',
          }}
        />
      );
    }
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {segments}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#333"
            strokeWidth="3"
          />
        </svg>
      </Box>
    );
  };

  // 棒グラフの描画
  const renderBarChart = (num: number, den: number) => {
    const segments = [];
    const segmentWidth = 300 / den;
    
    for (let i = 0; i < den; i++) {
      const isFilled = i < num;
      segments.push(
        <Box
          key={i}
          sx={{
            width: segmentWidth - 2,
            height: 60,
            bgcolor: isFilled ? 'primary.main' : 'grey.300',
            border: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isFilled ? 'white' : 'black',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            transform: isFilled ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          {i + 1}
        </Box>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <Box sx={{ display: 'flex', gap: 0.25 }}>
          {segments}
        </Box>
      </Box>
    );
  };

  // クイズ選択肢生成
  const generateChoices = () => {
    const correct = `${quizQuestion.num}/${quizQuestion.den}`;
    const choices = [correct];
    
    // 間違いの選択肢を追加
    while (choices.length < 4) {
      const wrongNum = Math.floor(Math.random() * quizQuestion.den) + 1;
      const wrongDen = quizQuestion.den;
      const wrong = `${wrongNum}/${wrongDen}`;
      if (!choices.includes(wrong)) {
        choices.push(wrong);
      }
    }
    
    // 他の分母の選択肢も追加
    if (choices.length < 4) {
      const otherDen = quizQuestion.den === 4 ? 6 : 4;
      const otherNum = Math.floor(Math.random() * otherDen) + 1;
      const other = `${otherNum}/${otherDen}`;
      if (!choices.includes(other)) {
        choices.push(other);
      }
    }
    
    return choices.slice(0, 4).sort(() => Math.random() - 0.5);
  };

  const choices = quizMode ? generateChoices() : [];

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          分数の視覚化
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
        分数を円グラフや棒グラフで視覚的に理解しよう！
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={quizMode ? `クイズ問題: ${quizQuestion.num}/${quizQuestion.den}` : `分数: ${numerator}/${denominator}`}
          color="primary" 
          size="large"
        />
        <Chip 
          label={`成功回数: ${successCount}`} 
          color="secondary" 
          size="medium"
        />
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

      {/* メインコンテンツ */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* モード選択 */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <ButtonGroup>
            <Button
              variant={!quizMode ? 'contained' : 'outlined'}
              onClick={() => setQuizMode(false)}
            >
              練習モード
            </Button>
            <Button
              variant={quizMode ? 'contained' : 'outlined'}
              onClick={() => {
                setQuizMode(true);
                generateQuiz();
              }}
            >
              クイズモード
            </Button>
          </ButtonGroup>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>表示方法</InputLabel>
            <Select
              value={visualMode}
              onChange={(e) => setVisualMode(e.target.value as 'pie' | 'bar')}
            >
              <MenuItem value="pie">円グラフ</MenuItem>
              <MenuItem value="bar">棒グラフ</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          {!quizMode ? (
            <>
              {/* 練習モード */}
              <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                {numerator} / {denominator}
              </Typography>

              {/* スライダー */}
              <Grid container spacing={4} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    分子: {numerator}
                  </Typography>
                  <Slider
                    value={numerator}
                    onChange={(_, value) => setNumerator(Math.min(value as number, denominator))}
                    min={0}
                    max={denominator}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    分母: {denominator}
                  </Typography>
                  <Slider
                    value={denominator}
                    onChange={(_, value) => {
                      const newDen = value as number;
                      setDenominator(newDen);
                      if (numerator > newDen) {
                        setNumerator(newDen);
                      }
                    }}
                    min={2}
                    max={12}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>

              {/* 視覚化 */}
              {visualMode === 'pie' ? renderPieChart(numerator, denominator) : renderBarChart(numerator, denominator)}

              <Typography variant="h5" sx={{ mt: 2, color: 'success.main' }}>
                {numerator === 0 ? '0' : 
                 numerator === denominator ? '1 (全体)' : 
                 `${((numerator / denominator) * 100).toFixed(1)}%`}
              </Typography>
            </>
          ) : (
            <>
              {/* クイズモード */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                この図が表す分数を選んでください：
              </Typography>

              {/* 視覚化 */}
              {visualMode === 'pie' ? renderPieChart(quizQuestion.num, quizQuestion.den) : renderBarChart(quizQuestion.num, quizQuestion.den)}

              {/* 選択肢 */}
              <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                {choices.map((choice) => (
                  <Grid item key={choice}>
                    <Button
                      variant={userAnswer === choice ? (choice === `${quizQuestion.num}/${quizQuestion.den}` ? 'contained' : 'outlined') : 'outlined'}
                      color={userAnswer === choice ? (choice === `${quizQuestion.num}/${quizQuestion.den}` ? 'success' : 'error') : 'primary'}
                      onClick={() => checkQuizAnswer(choice)}
                      disabled={userAnswer !== ''}
                      sx={{ 
                        minWidth: 80, 
                        minHeight: 60,
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {choice}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              {userAnswer && (
                <Typography 
                  variant="h6" 
                  color={userAnswer === `${quizQuestion.num}/${quizQuestion.den}` ? 'success.main' : 'error.main'}
                  sx={{ mt: 2, fontWeight: 'bold' }}
                >
                  {userAnswer === `${quizQuestion.num}/${quizQuestion.den}` ? 
                    '🎉 正解！分数を正しく読み取れました！' : 
                    '❌ 間違いです。図をもう一度よく見てみましょう！'
                  }
                </Typography>
              )}
            </>
          )}
        </Paper>

        {/* 説明 */}
        <Paper elevation={1} sx={{ p: 2, bgcolor: '#e3f2fd' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            💡 分数のポイント：
          </Typography>
          <Typography variant="body2">
            • 分母は全体をいくつに分けるかを表します<br/>
            • 分子はそのうちいくつを取るかを表します<br/>
            • 円グラフでは扇形の数、棒グラフでは色付きの部分で確認できます
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default FractionVisualization;