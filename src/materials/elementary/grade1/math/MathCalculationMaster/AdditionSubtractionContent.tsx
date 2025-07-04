import { useState, useEffect } from 'react';
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
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Apple as AppleIcon
} from '@mui/icons-material';
import { useLearningTrackerContext } from '../../../../../components/wrappers/MaterialWrapper';

// たし算・ひき算ビジュアライザー
function AdditionSubtractionContent() {
  // 学習追跡の取得
  const { recordAnswer } = useLearningTrackerContext();
  
  const [operation, setOperation] = useState<'addition' | 'subtraction'>('addition');
  const [firstNumber, setFirstNumber] = useState(3);
  const [secondNumber, setSecondNumber] = useState(2);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState(0);
  const [successStreak, setSuccessStreak] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  
  const maxNumber = 10;
  const correctAnswer = operation === 'addition' ? firstNumber + secondNumber : firstNumber - secondNumber;
  
  // 新しい問題を生成
  const generateNewProblem = () => {
    if (operation === 'addition') {
      const num1 = Math.floor(Math.random() * (maxNumber - 1)) + 1;
      const num2 = Math.floor(Math.random() * (maxNumber - num1)) + 1;
      setFirstNumber(num1);
      setSecondNumber(num2);
    } else {
      const num1 = Math.floor(Math.random() * maxNumber) + 1;
      const num2 = Math.floor(Math.random() * num1) + 1;
      setFirstNumber(num1);
      setSecondNumber(num2);
    }
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setWrongAttempts(0);
    setHintLevel(0);
  };
  
  // 答えをチェック
  const checkAnswer = () => {
    if (userAnswer === '') return;
    
    const answer = parseInt(userAnswer);
    const correct = answer === correctAnswer;
    
    setIsCorrect(correct);
    setShowResult(true);
    setAttempts(prev => prev + 1);
    
    // 学習記録を追加
    recordAnswer(correct, {
      problem: `${firstNumber} ${operation === 'addition' ? '+' : '-'} ${secondNumber}`,
      userAnswer: userAnswer,
      correctAnswer: correctAnswer.toString()
    });
    
    if (correct) {
      setScore(prev => prev + 1);
      setSuccessStreak(prev => prev + 1);
      setProgress(prev => Math.min(prev + 10, 100));
      setAnimating(true);
      
      setTimeout(() => {
        setAnimating(false);
        generateNewProblem();
      }, 2000);
    } else {
      setSuccessStreak(0);
      setWrongAttempts(prev => prev + 1);
      setHintLevel(wrongAttempts + 1);
      // 答えの入力をクリアして再入力を促す
      if (wrongAttempts < 2) {
        setTimeout(() => {
          setUserAnswer('');
          setShowResult(false);
        }, 2000);
      }
    }
  };
  
  // ヒントを生成
  const getHint = () => {
    if (hintLevel === 0) return null;
    
    if (hintLevel === 1) {
      return 'もういちどかんがえてみよう！';
    } else if (hintLevel === 2) {
      // 数値ヒントを提供
      if (operation === 'addition') {
        if (correctAnswer > 10) {
          return '10よりおおきいよ！';
        } else if (correctAnswer > 5) {
          return '5よりおおきいよ！';
        } else {
          return '5よりちいさいよ！';
        }
      } else {
        if (correctAnswer >= 5) {
          return '5以上だよ！';
        } else {
          return '5よりちいさいよ！';
        }
      }
    } else {
      return `こたえは ${correctAnswer} だよ`;
    }
  };
  
  // リセット
  const handleReset = () => {
    setScore(0);
    setAttempts(0);
    setProgress(0);
    setSuccessStreak(0);
    generateNewProblem();
  };
  
  // 操作タイプを変更
  const handleOperationChange = (_event: React.MouseEvent<HTMLElement>, newOperation: 'addition' | 'subtraction' | null) => {
    if (newOperation !== null) {
      setOperation(newOperation);
      generateNewProblem();
    }
  };
  
  // エフェクト
  useEffect(() => {
    generateNewProblem();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // アイテムを描画（リンゴまたはブロック）
  const renderItems = (count: number, color: string, startAnimation = false) => {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(
        <Box
          key={i}
          sx={{
            width: 50,
            height: 50,
            backgroundColor: color,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            animation: startAnimation && animating ? 'bounceIn 0.5s ease-out' : 'none',
            '@keyframes bounceIn': {
              '0%': { transform: 'scale(0)', opacity: 0 },
              '50%': { transform: 'scale(1.2)' },
              '100%': { transform: 'scale(1)', opacity: 1 }
            }
          }}
        >
          <AppleIcon sx={{ color: '#fff' }} />
        </Box>
      );
    }
    return items;
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          たし算・ひき算ビジュアライザー
        </Typography>
        <IconButton onClick={handleReset}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        リンゴを使って、たし算とひき算を楽しく学ぼう！数えながら答えを見つけてね。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`得点: ${score}`}
          color="primary" 
          size="medium"
        />
        <Chip 
          label={`挑戦: ${attempts}`} 
          color="secondary" 
          size="medium"
        />
        <Chip 
          label={`連続正解: ${successStreak}`} 
          color="success" 
          size="medium"
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

      {/* 操作タイプ選択 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={operation}
          exclusive
          onChange={handleOperationChange}
          size="large"
        >
          <ToggleButton value="addition">
            <AddIcon sx={{ mr: 1 }} />
            たし算
          </ToggleButton>
          <ToggleButton value="subtraction">
            <RemoveIcon sx={{ mr: 1 }} />
            ひき算
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：問題と入力 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              もんだい
            </Typography>
            
            {/* 式の表示 */}
            <Box sx={{ 
              fontSize: '3rem', 
              textAlign: 'center', 
              mb: 3,
              fontWeight: 'bold',
              color: 'primary.main'
            }}>
              {firstNumber} {operation === 'addition' ? '+' : '−'} {secondNumber} = ?
            </Box>
            
            {/* 答え入力 */}
            <TextField
              fullWidth
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              placeholder="こたえをいれてね"
              inputProps={{ 
                min: 0, 
                max: 20,
                style: { textAlign: 'center', fontSize: '2rem' }
              }}
              sx={{ mb: 2 }}
            />
            
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={checkAnswer}
              disabled={userAnswer === ''}
            >
              こたえをみる
            </Button>
            
            {/* 結果表示 */}
            {showResult && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                {isCorrect ? (
                  <Typography variant="h5" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                    🎉 せいかい！
                  </Typography>
                ) : (
                  <Box>
                    <Typography variant="h6" sx={{ color: 'error.main' }}>
                      ❌ ちがうよ！
                    </Typography>
                    {getHint() && (
                      <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
                        {getHint()}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 右側：ビジュアル表示 */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              リンゴをかぞえてみよう！
            </Typography>
            
            {/* 最初の数 */}
            <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  さいしょ: {firstNumber}こ
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {renderItems(firstNumber, '#FF6B6B')}
                </Box>
              </CardContent>
            </Card>
            
            {/* 操作表示 */}
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant="h5" sx={{ color: operation === 'addition' ? 'success.main' : 'warning.main' }}>
                {operation === 'addition' ? '+' : '−'}
              </Typography>
            </Box>
            
            {/* 二番目の数 */}
            <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {operation === 'addition' ? 'ふやす' : 'へらす'}: {secondNumber}こ
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {renderItems(secondNumber, operation === 'addition' ? '#4ECDC4' : '#FFA726')}
                </Box>
              </CardContent>
            </Card>
            
            {/* 結果のビジュアル */}
            {showResult && isCorrect && (
              <Card sx={{ bgcolor: 'success.light', p: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: 'success.dark' }}>
                    こたえ: {correctAnswer}こ
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {renderItems(correctAnswer, '#4CAF50', true)}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#fff3e0' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🎯 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • リンゴをひとつずつ数えて、答えを見つけよう<br/>
          • たし算は「あわせていくつ？」、ひき算は「のこりはいくつ？」<br/>
          • 絵を見ながら考えることで、数の概念が身につきます<br/>
          • 間違えても大丈夫！何度でも挑戦してみよう
        </Typography>
      </Paper>
    </Box>
  );
}

export default AdditionSubtractionContent;