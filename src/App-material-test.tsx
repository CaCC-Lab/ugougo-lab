import { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  CssBaseline, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Grid,
  Chip,
  LinearProgress 
} from '@mui/material';

// 教材機能の動作確認用アプリ
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B6B', // 小学生向けの明るい色
    },
    secondary: {
      main: '#4ECDC4',
    },
  },
  typography: {
    fontSize: 16,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
  },
});

// 簡単な数の教材シミュレーション
function NumberGameSimple() {
  const [target, setTarget] = useState(5);
  const [currentSum, setCurrentSum] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  const numbers = [1, 2, 3, 4, 5];

  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      // 既に選択されている場合は削除
      const newSelected = selectedNumbers.filter(n => n !== num);
      setSelectedNumbers(newSelected);
      setCurrentSum(newSelected.reduce((sum, n) => sum + n, 0));
    } else {
      // 新しく追加
      const newSelected = [...selectedNumbers, num];
      setSelectedNumbers(newSelected);
      const newSum = newSelected.reduce((sum, n) => sum + n, 0);
      setCurrentSum(newSum);
      
      // 正解チェック
      if (newSum === target) {
        setProgress(progress + 20);
        setTimeout(() => {
          // 次の問題
          setTarget(Math.floor(Math.random() * 10) + 1);
          setSelectedNumbers([]);
          setCurrentSum(0);
        }, 1000);
      }
    }
  };

  const handleReset = () => {
    setSelectedNumbers([]);
    setCurrentSum(0);
    setProgress(0);
    setTarget(5);
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          数の合成ゲーム（簡易版）
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={`目標: ${target}`} 
            color="primary" 
            size="large"
            sx={{ mr: 1 }}
          />
          <Chip 
            label={`現在: ${currentSum}`} 
            color={currentSum === target ? 'success' : 'default'} 
            size="large"
          />
        </Box>

        {progress > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption">進捗: {progress}%</Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        <Typography variant="body2" sx={{ mb: 2 }}>
          数字をクリックして、目標の数を作ってみましょう！
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {numbers.map((num) => (
            <Grid item key={num}>
              <Button
                variant={selectedNumbers.includes(num) ? 'contained' : 'outlined'}
                onClick={() => handleNumberClick(num)}
                sx={{ 
                  minWidth: 60, 
                  minHeight: 60,
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                {num}
              </Button>
            </Grid>
          ))}
        </Grid>

        <Button variant="outlined" onClick={handleReset}>
          リセット
        </Button>

        {currentSum === target && (
          <Typography 
            variant="h6" 
            color="success.main" 
            sx={{ mt: 2, textAlign: 'center' }}
          >
            🎉 正解！すばらしい！
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function AppMaterialTest() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          動く教材プロジェクト - 教材機能テスト
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          基本的な教材機能をテストしています。数字ボタンをクリックして目標の数を作ってみてください！
        </Typography>

        <NumberGameSimple />

        <Card sx={{ mt: 3, maxWidth: 600, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              実装状況
            </Typography>
            <ul>
              <li>✅ React基本動作</li>
              <li>✅ MUI基本コンポーネント</li>
              <li>✅ 教材基本ロジック</li>
              <li>✅ インタラクティブ機能</li>
              <li>⏳ ドラッグ&ドロップ機能</li>
              <li>⏳ 高度なアニメーション</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}

export default AppMaterialTest;