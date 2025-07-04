import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Button,
  Paper,
  LinearProgress,
  Grid,
  Alert
} from '@mui/material';
import { useLearningTrackerContext } from '../../../../../components/wrappers/MaterialWrapper';

// 数の合成・分解ブロック
function NumberBlocksContent() {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const [target, setTarget] = useState(Math.floor(Math.random() * 16) + 4); // 4〜19
  const [currentSum, setCurrentSum] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [message, setMessage] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [_lastBonus, setLastBonus] = useState(0);
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
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" component="h2">
          数の合成・分解ブロック
        </Typography>
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
            
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleReset}
              sx={{ px: 4 }}
            >
              もう一度挑戦
            </Button>
          </Paper>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
              size="medium"
            />
            <Chip 
              label={`選択した数: ${selectedNumbers.length}個`} 
              color="info" 
              size="medium"
            />
            <Chip 
              label={`成功回数: ${successCount}`} 
              color="secondary" 
              size="medium"
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

      {/* 説明 */}
      {!isCompleted && (
        <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e9' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            🎯 学習のポイント：
          </Typography>
          <Typography variant="body2">
            • いろいろな組み合わせで同じ数を作ってみよう<br/>
            • 数を分解したり合成したりする力が身につきます<br/>
            • たくさんの数を使うとボーナス点がもらえます<br/>
            • 10までの数の仕組みを楽しく理解できます
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default NumberBlocksContent;