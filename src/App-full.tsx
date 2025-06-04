import { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  CssBaseline, 
  AppBar,
  Toolbar,
  Typography,
  Button, 
  Card, 
  CardContent, 
  Box,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogContent,
  IconButton,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import MultiplicationVisualization from './components/MultiplicationVisualization';
import NumberLineIntegers from './components/NumberLineIntegers';

// 学年別テーマ
const themes = {
  elementary: createTheme({
    palette: {
      primary: { main: '#FF6B6B' },
      secondary: { main: '#4ECDC4' },
    },
    typography: {
      fontSize: 16,
      h1: { fontSize: '2.5rem', fontWeight: 600 },
    },
  }),
  juniorHigh: createTheme({
    palette: {
      primary: { main: '#3F51B5' },
      secondary: { main: '#FF4081' },
    },
    typography: {
      fontSize: 14,
      h1: { fontSize: '2rem', fontWeight: 500 },
    },
  }),
  highSchool: createTheme({
    palette: {
      primary: { main: '#1976D2' },
      secondary: { main: '#424242' },
    },
    typography: {
      fontSize: 14,
      h1: { fontSize: '1.75rem', fontWeight: 400 },
    },
  }),
};

// 数の合成・分解教材
function NumberBlocksMaterial({ onClose }: { onClose: () => void }) {
  const [target, setTarget] = useState(10);
  const [currentSum, setCurrentSum] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

  const numbers = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      const newSelected = selectedNumbers.filter(n => n !== num);
      setSelectedNumbers(newSelected);
      setCurrentSum(newSelected.reduce((sum, n) => sum + n, 0));
    } else {
      const newSelected = [...selectedNumbers, num];
      setSelectedNumbers(newSelected);
      const newSum = newSelected.reduce((sum, n) => sum + n, 0);
      setCurrentSum(newSum);
      
      if (newSum === target) {
        setSuccessCount(prev => prev + 1);
        setProgress(Math.min((successCount + 1) * 20, 100));
        setTimeout(() => {
          setTarget(Math.floor(Math.random() * 10) + 1);
          setSelectedNumbers([]);
          setCurrentSum(0);
        }, 1500);
      }
    }
  };

  const handleReset = () => {
    setSelectedNumbers([]);
    setCurrentSum(0);
    setProgress(0);
    setSuccessCount(0);
    setTarget(10);
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          数の合成・分解ブロック
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        10までの数を、ブロックを使って楽しく学ぼう！数字をクリックして目標の数を作ってください。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`目標: ${target}`} 
          color="primary" 
          size="large"
        />
        <Chip 
          label={`現在: ${currentSum}`} 
          color={currentSum === target ? 'success' : 'default'} 
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

      {/* 数字ブロック */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Grid container spacing={2} justifyContent="center">
          {numbers.map((num) => (
            <Grid item key={num}>
              <Button
                variant={selectedNumbers.includes(num) ? 'contained' : 'outlined'}
                onClick={() => handleNumberClick(num)}
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

        {/* 正解メッセージ */}
        {currentSum === target && (
          <Typography 
            variant="h5" 
            color="success.main" 
            sx={{ mt: 3, textAlign: 'center', fontWeight: 'bold' }}
          >
            🎉 すばらしい！ {target} ができました！
          </Typography>
        )}
      </Box>

      {/* フッター */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button variant="outlined" onClick={handleReset} size="large">
          リセット
        </Button>
      </Box>
    </Box>
  );
}

// メインアプリ
function AppFull() {
  const [currentTheme, setCurrentTheme] = useState<'elementary' | 'juniorHigh' | 'highSchool'>('elementary');
  const [materialOpen, setMaterialOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');

  const materials = [
    {
      id: 'number-blocks',
      title: '数の合成・分解ブロック',
      description: '10までの数を、ブロックを使って楽しく学ぼう！ドラッグ&ドロップで数の概念を理解できます。',
      grade: '小学1年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'multiplication',
      title: 'かけ算九九の視覚化',
      description: 'アニメーションでかけ算の仕組みがよくわかる！視覚的にかけ算を理解できます。',
      grade: '小学2年生',
      subject: '算数',
      available: true,
    },
    {
      id: 'number-line',
      title: '正負の数の数直線',
      description: '数直線を使って、マイナスの数も理解しよう！正負の数の計算をマスターできます。',
      grade: '中学1年生',
      subject: '数学',
      available: true,
    },
  ];

  return (
    <ThemeProvider theme={themes[currentTheme]}>
      <CssBaseline />
      
      {/* ヘッダー */}
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            動く教材
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel sx={{ color: 'white' }}>学年</InputLabel>
            <Select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value as any)}
              sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
            >
              <MenuItem value="elementary">小学生</MenuItem>
              <MenuItem value="juniorHigh">中学生</MenuItem>
              <MenuItem value="highSchool">高校生</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          動く教材へようこそ！
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          インタラクティブな教材で、楽しく学習しましょう。
          学年を選択してテーマを変更できます。
        </Typography>

        <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
          おすすめの教材
        </Typography>
        
        <Grid container spacing={3}>
          {materials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: material.available ? 'pointer' : 'default',
                  opacity: material.available ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  '&:hover': material.available ? {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  } : {}
                }}
                onClick={() => {
                  if (material.available) {
                    setSelectedMaterial(material.id);
                    setMaterialOpen(true);
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {material.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {material.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={material.subject} size="small" color="primary" />
                    <Chip label={material.grade} size="small" color="secondary" />
                    <Chip 
                      label={material.available ? '利用可能' : '準備中'} 
                      size="small" 
                      color={material.available ? 'success' : 'warning'} 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 教材ダイアログ */}
      <Dialog
        open={materialOpen}
        onClose={() => {
          setMaterialOpen(false);
          setSelectedMaterial('');
        }}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedMaterial === 'number-blocks' && (
            <NumberBlocksMaterial onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'multiplication' && (
            <MultiplicationVisualization onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
          {selectedMaterial === 'number-line' && (
            <NumberLineIntegers onClose={() => {
              setMaterialOpen(false);
              setSelectedMaterial('');
            }} />
          )}
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

export default AppFull;