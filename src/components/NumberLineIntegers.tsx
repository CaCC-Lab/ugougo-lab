import { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Button,
  Paper,
  LinearProgress,
  IconButton,
  Slider,
  ButtonGroup
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

interface NumberLineIntegersProps {
  onClose?: () => void;
}

// 正負の数の数直線教材（内部コンポーネント）
const NumberLineIntegersContent: React.FC<NumberLineIntegersProps> = ({ onClose }) => {
  const { recordInteraction, recordAnswer } = useLearningTrackerContext();
  const [currentProblem, setCurrentProblem] = useState({ start: 3, operation: '+', value: 5 });
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);

  const correctAnswer = currentProblem.operation === '+' 
    ? currentProblem.start + currentProblem.value
    : currentProblem.start - currentProblem.value;

  // 新しい問題を生成
  const generateNewProblem = () => {
    const start = Math.floor(Math.random() * 21) - 10; // -10 to 10
    const operation = Math.random() > 0.5 ? '+' : '-';
    const value = Math.floor(Math.random() * 10) + 1; // 1 to 10
    
    setCurrentProblem({ start, operation, value });
    setUserAnswer(null);
    setShowSolution(false);
    setSelectedNumber(start);
    setAnimationStep(0);
  };

  // アニメーション開始
  const startAnimation = () => {
    setAnimationStep(1);
    setSelectedNumber(currentProblem.start);
    recordInteraction('click');
    
    // 段階的にアニメーション
    setTimeout(() => {
      setAnimationStep(2);
      if (currentProblem.operation === '+') {
        // 右に移動
        let step = 0;
        const interval = setInterval(() => {
          step++;
          setSelectedNumber(currentProblem.start + step);
          if (step >= currentProblem.value) {
            clearInterval(interval);
            setAnimationStep(3);
          }
        }, 300);
      } else {
        // 左に移動
        let step = 0;
        const interval = setInterval(() => {
          step++;
          setSelectedNumber(currentProblem.start - step);
          if (step >= currentProblem.value) {
            clearInterval(interval);
            setAnimationStep(3);
          }
        }, 300);
      }
    }, 1000);
  };

  // 回答チェック
  const checkAnswer = (answer: number) => {
    setUserAnswer(answer);
    const isCorrect = answer === correctAnswer;
    
    // 回答結果を記録
    recordAnswer(isCorrect, {
      problem: `${currentProblem.start} ${currentProblem.operation} ${currentProblem.value}`,
      correctAnswer: correctAnswer.toString(),
      userAnswer: answer.toString(),
      successCount: successCount
    });
    recordInteraction('click');
    
    if (isCorrect) {
      setSuccessCount(prev => prev + 1);
      setProgress(prev => Math.min(prev + 10, 100));
      setTimeout(() => {
        generateNewProblem();
      }, 2500);
    }
  };

  // リセット
  const handleReset = () => {
    setProgress(0);
    setSuccessCount(0);
    generateNewProblem();
    recordInteraction('click');
  };

  // 数直線上の数字を描画
  const renderNumberLine = () => {
    const numbers = [];
    for (let i = -15; i <= 15; i++) {
      const isSelected = i === selectedNumber;
      const isStart = i === currentProblem.start && animationStep >= 1;
      const isEnd = i === correctAnswer && animationStep >= 3;
      
      numbers.push(
        <Box
          key={i}
          sx={{
            minWidth: 40,
            height: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderLeft: i === 0 ? '3px solid red' : '1px solid #ddd',
            bgcolor: isSelected ? 'primary.main' : 
                     isStart ? 'warning.light' :
                     isEnd ? 'success.light' : 'transparent',
            color: isSelected ? 'white' : 
                   (isStart || isEnd) ? 'black' : 
                   i === 0 ? 'red' : 'black',
            fontWeight: isSelected || isStart || isEnd ? 'bold' : 'normal',
            transition: 'all 0.3s ease',
            transform: isSelected ? 'scale(1.2)' : 'scale(1)',
          }}
        >
          {/* 数字 */}
          <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
            {i}
          </Typography>
          
          {/* 特別な印 */}
          {isStart && animationStep >= 1 && (
            <Typography variant="caption" sx={{ position: 'absolute', top: -15, fontSize: '0.7rem', color: 'warning.main' }}>
              開始
            </Typography>
          )}
          {isEnd && animationStep >= 3 && (
            <Typography variant="caption" sx={{ position: 'absolute', top: -15, fontSize: '0.7rem', color: 'success.main' }}>
              終了
            </Typography>
          )}
          {i === 0 && (
            <Typography variant="caption" sx={{ position: 'absolute', bottom: -20, fontSize: '0.7rem', color: 'red' }}>
              0
            </Typography>
          )}
        </Box>
      );
    }
    return numbers;
  };

  // Fisher-Yatesシャッフルアルゴリズム
  const fisherYatesShuffle = <T,>(array: T[]): T[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  // 選択肢を生成
  const generateChoices = () => {
    const correct = correctAnswer;
    const choices = [correct];
    
    // 教育的な選択肢を追加
    // 1. 近い値（計算ミス想定）
    [1, -1, 2, -2].forEach(offset => {
      const choice = correct + offset;
      if (choice >= -15 && choice <= 15 && !choices.includes(choice)) {
        choices.push(choice);
      }
    });
    
    // 2. 符号の間違い（正負の理解不足想定）
    const oppositeSign = -correct;
    if (oppositeSign >= -15 && oppositeSign <= 15 && !choices.includes(oppositeSign) && oppositeSign !== correct) {
      choices.push(oppositeSign);
    }
    
    // 3. 計算方向の間違い（加算と減算の混同）
    const wrongOperation = currentProblem.operation === '+' 
      ? currentProblem.start - currentProblem.value 
      : currentProblem.start + currentProblem.value;
    if (wrongOperation >= -15 && wrongOperation <= 15 && !choices.includes(wrongOperation)) {
      choices.push(wrongOperation);
    }
    
    // 4つになるまで追加
    while (choices.length < 4) {
      const choice = Math.floor(Math.random() * 31) - 15; // -15 to 15
      if (!choices.includes(choice)) {
        choices.push(choice);
      }
    }
    
    // 4つに調整してFisher-Yatesシャッフル
    return fisherYatesShuffle(choices.slice(0, 4));
  };

  const choices = generateChoices();

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          正負の数の数直線
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
        数直線を使って、正の数と負の数の計算を理解しましょう！
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`問題: ${currentProblem.start} ${currentProblem.operation} ${currentProblem.value}`} 
          color="primary" 
          size="medium"
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
        
        {/* 問題表示 */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
            {currentProblem.start} {currentProblem.operation} {currentProblem.value} = ?
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            {currentProblem.operation === '+' ? 
              `${currentProblem.start}から右に${currentProblem.value}進む` : 
              `${currentProblem.start}から左に${currentProblem.value}戻る`
            }
          </Typography>

          {animationStep === 0 && (
            <Button 
              variant="contained" 
              size="medium" 
              onClick={startAnimation}
              sx={{ fontSize: '1.2rem', px: 4, py: 2 }}
            >
              数直線で確認
            </Button>
          )}
        </Paper>

        {/* 数直線 */}
        {animationStep > 0 && (
          <Paper elevation={2} sx={{ p: 2, mb: 3, overflow: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              数直線上での移動
            </Typography>
            
            <Box sx={{ display: 'flex', overflowX: 'auto', pb: 2 }}>
              {renderNumberLine()}
            </Box>

            {/* 説明 */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              {animationStep === 1 && (
                <Typography variant="body1" color="warning.main">
                  開始位置: {currentProblem.start}
                </Typography>
              )}
              {animationStep === 2 && (
                <Typography variant="body1" color="info.main">
                  {currentProblem.operation === '+' ? '右' : '左'}に{currentProblem.value}移動中...
                </Typography>
              )}
              {animationStep === 3 && (
                <Typography variant="body1" color="success.main">
                  到着位置: {correctAnswer}
                </Typography>
              )}
            </Box>
          </Paper>
        )}

        {/* 回答選択 */}
        {animationStep >= 3 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              答えを選んでください：
            </Typography>
            
            <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
              {choices.map((choice) => (
                <Button
                  key={choice}
                  variant={userAnswer === choice ? (choice === correctAnswer ? 'contained' : 'outlined') : 'outlined'}
                  color={userAnswer === choice ? (choice === correctAnswer ? 'success' : 'error') : 'primary'}
                  onClick={() => checkAnswer(choice)}
                  disabled={userAnswer !== null}
                  sx={{ 
                    minWidth: 80, 
                    minHeight: 60,
                    fontSize: '1.3rem',
                    fontWeight: 'bold'
                  }}
                >
                  {choice}
                </Button>
              ))}
            </ButtonGroup>

            {userAnswer !== null && (
              <Typography 
                variant="h5" 
                color={userAnswer === correctAnswer ? 'success.main' : 'error.main'}
                sx={{ mt: 2, fontWeight: 'bold' }}
              >
                {userAnswer === correctAnswer ? 
                  '🎉 正解！数直線を使って正確に計算できました！' : 
                  '❌ 間違いです。数直線上の移動をもう一度確認してみましょう！'
                }
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// 正負の数の数直線教材（MaterialWrapperでラップ）
const NumberLineIntegers: React.FC<NumberLineIntegersProps> = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="number-line-integers"
      materialName="正負の数の数直線"
      showMetricsButton={true}
      showAssistant={true}
    >
      <NumberLineIntegersContent onClose={onClose} />
    </MaterialWrapper>
  );
};

export default NumberLineIntegers;