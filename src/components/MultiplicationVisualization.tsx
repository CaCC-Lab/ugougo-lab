import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Button,
  Grid,
  Paper,
  LinearProgress,
  IconButton 
} from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

// かけ算九九の視覚化教材（内部コンポーネント）
function MultiplicationVisualizationContent({ onClose }: { onClose: () => void }) {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const [currentProblem, setCurrentProblem] = useState({ a: 3, b: 4 });
  const [showAnimation, setShowAnimation] = useState(false);
  const [visibleBoxes, setVisibleBoxes] = useState(0);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const answer = currentProblem.a * currentProblem.b;

  // 新しい問題を生成
  const generateNewProblem = () => {
    const a = Math.floor(Math.random() * 9) + 1; // 1-9
    const b = Math.floor(Math.random() * 9) + 1; // 1-9
    setCurrentProblem({ a, b });
    setShowAnimation(false);
    setVisibleBoxes(0);
    setUserAnswer(null);
    setShowResult(false);
  };

  // アニメーション開始
  const startVisualization = () => {
    setShowAnimation(true);
    setVisibleBoxes(0);
    recordInteraction('click');
    
    // 段階的にボックスを表示
    const totalBoxes = currentProblem.a * currentProblem.b;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleBoxes(count);
      if (count >= totalBoxes) {
        clearInterval(interval);
        setShowResult(true);
      }
    }, 200); // 0.2秒ごとにボックスを追加
  };

  // 回答チェック
  const checkAnswer = (selectedAnswer: number) => {
    setUserAnswer(selectedAnswer);
    const isCorrect = selectedAnswer === answer;
    
    // 学習履歴に記録
    recordAnswer(isCorrect, {
      problem: `${currentProblem.a} × ${currentProblem.b}`,
      userAnswer: selectedAnswer.toString(),
      correctAnswer: answer.toString()
    });
    
    if (isCorrect) {
      setSuccessCount(prev => prev + 1);
      setProgress(prev => Math.min(prev + 10, 100));
      setTimeout(() => {
        generateNewProblem();
      }, 2000);
    }
  };

  // リセット
  const handleReset = () => {
    setProgress(0);
    setSuccessCount(0);
    generateNewProblem();
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
    const correct = answer;
    const choices = [correct];
    
    // より教育的な間違いの選択肢を追加
    // 1. 1つ違いの答え（計算ミスを想定）
    if (correct > 1 && !choices.includes(correct - 1)) {
      choices.push(correct - 1);
    }
    if (correct < 81 && !choices.includes(correct + 1)) {
      choices.push(correct + 1);
    }
    
    // 2. 片方の数字だけでかけた答え（理解不足を想定）
    const singleMultiple = currentProblem.a > currentProblem.b ? currentProblem.a : currentProblem.b;
    if (!choices.includes(singleMultiple) && singleMultiple !== correct) {
      choices.push(singleMultiple);
    }
    
    // 3. ランダムな間違い（残りの選択肢）
    while (choices.length < 4) {
      const wrong = correct + Math.floor(Math.random() * 20) - 10;
      if (wrong > 0 && wrong <= 81 && !choices.includes(wrong)) {
        choices.push(wrong);
      }
    }
    
    // 選択肢を4つに調整
    if (choices.length > 4) {
      choices.length = 4;
    }
    
    // Fisher-Yatesシャッフルで完全にランダム化
    return fisherYatesShuffle(choices);
  };

  const choices = generateChoices();

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          かけ算九九の視覚化
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
        かけ算を視覚的に理解しよう！アニメーションで数の並びを確認できます。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`問題: ${currentProblem.a} × ${currentProblem.b}`} 
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
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* 視覚化エリア */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 3, 
            minHeight: 300, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f8f9fa'
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
            {currentProblem.a} × {currentProblem.b} = ?
          </Typography>

          {!showAnimation ? (
            <Button 
              variant="contained" 
              size="medium" 
              onClick={startVisualization}
              sx={{ fontSize: '1.2rem', px: 4, py: 2 }}
            >
              視覚化を開始
            </Button>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                {currentProblem.a}つのグループに、それぞれ{currentProblem.b}個ずつ
              </Typography>
              
              {/* グリッド表示 */}
              <Grid container spacing={1} sx={{ maxWidth: 400 }}>
                {Array.from({ length: currentProblem.a }).map((_, rowIndex) => (
                  <Grid item xs={12} key={rowIndex}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {Array.from({ length: currentProblem.b }).map((_, colIndex) => {
                        const boxNumber = rowIndex * currentProblem.b + colIndex + 1;
                        const isVisible = boxNumber <= visibleBoxes;
                        
                        return (
                          <Box
                            key={colIndex}
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: isVisible ? 'primary.main' : 'grey.300',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              transform: isVisible ? 'scale(1)' : 'scale(0)',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {isVisible ? boxNumber : ''}
                          </Box>
                        );
                      })}
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {showResult && (
                <Typography variant="h4" sx={{ mt: 3, textAlign: 'center', color: 'success.main' }}>
                  全部で {visibleBoxes} 個！
                </Typography>
              )}
            </Box>
          )}
        </Paper>

        {/* 答えの選択 */}
        {showResult && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              答えを選んでください：
            </Typography>
            
            <Grid container spacing={2} justifyContent="center">
              {choices.map((choice) => (
                <Grid item key={choice}>
                  <Button
                    variant={userAnswer === choice ? (choice === answer ? 'contained' : 'outlined') : 'outlined'}
                    color={userAnswer === choice ? (choice === answer ? 'success' : 'error') : 'primary'}
                    onClick={() => checkAnswer(choice)}
                    disabled={userAnswer !== null}
                    sx={{ 
                      minWidth: 80, 
                      minHeight: 60,
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {choice}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {userAnswer !== null && (
              <Typography 
                variant="h5" 
                color={userAnswer === answer ? 'success.main' : 'error.main'}
                sx={{ mt: 2, fontWeight: 'bold' }}
              >
                {userAnswer === answer ? '🎉 正解！すばらしい！' : '❌ 間違いです。もう一度考えてみましょう！'}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// かけ算九九の視覚化教材（MaterialWrapperでラップ）
function MultiplicationVisualization({ onClose }: { onClose: () => void }) {
  return (
    <MaterialWrapper
      materialId="multiplication-table"
      materialName="かけ算九九の視覚化"
      showMetricsButton={true}
      showAssistant={true}
    >
      <MultiplicationVisualizationContent onClose={onClose} />
    </MaterialWrapper>
  );
}

export default MultiplicationVisualization;