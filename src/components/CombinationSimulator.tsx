import { useState } from 'react';
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
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  Casino as DiceIcon,
  Group as GroupIcon,
  Calculate as CalcIcon
} from '@mui/icons-material';

// 場合の数シミュレーター
function CombinationSimulator({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'permutation' | 'combination' | 'tree'>('permutation');
  const [n, setN] = useState(5); // 全体の数
  const [r, setR] = useState(3); // 選ぶ数
  const [items, setItems] = useState(['A', 'B', 'C', 'D', 'E']);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [results, setResults] = useState<string[][]>([]);
  const [showSteps, setShowSteps] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  const progress = Math.min((score / 5) * 100, 100);
  
  // 階乗を計算
  const factorial = (num: number): number => {
    if (num <= 1) return 1;
    return num * factorial(num - 1);
  };
  
  // 順列を計算 (nPr)
  const calculatePermutation = (n: number, r: number): number => {
    if (r > n) return 0;
    return factorial(n) / factorial(n - r);
  };
  
  // 組み合わせを計算 (nCr)
  const calculateCombination = (n: number, r: number): number => {
    if (r > n) return 0;
    return factorial(n) / (factorial(r) * factorial(n - r));
  };
  
  // 順列を生成
  const generatePermutations = (arr: string[], r: number): string[][] => {
    if (r === 1) return arr.map(item => [item]);
    
    const results: string[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = arr.filter((_, index) => index !== i);
      const perms = generatePermutations(rest, r - 1);
      perms.forEach(perm => {
        results.push([arr[i], ...perm]);
      });
    }
    return results;
  };
  
  // 組み合わせを生成
  const generateCombinations = (arr: string[], r: number): string[][] => {
    if (r === 1) return arr.map(item => [item]);
    if (r === arr.length) return [arr];
    
    const results: string[][] = [];
    for (let i = 0; i <= arr.length - r; i++) {
      const first = arr[i];
      const rest = arr.slice(i + 1);
      const combs = generateCombinations(rest, r - 1);
      combs.forEach(comb => {
        results.push([first, ...comb]);
      });
    }
    return results;
  };
  
  // 計算を実行
  const handleCalculate = () => {
    const itemsToUse = items.slice(0, n);
    
    if (mode === 'permutation') {
      const perms = generatePermutations(itemsToUse, r);
      setResults(perms.slice(0, 20)); // 最初の20個だけ表示
    } else if (mode === 'combination') {
      const combs = generateCombinations(itemsToUse, r);
      setResults(combs);
    }
  };
  
  // クイズの答えをチェック
  const checkAnswer = () => {
    const correctAnswer = mode === 'permutation' 
      ? calculatePermutation(n, r) 
      : calculateCombination(n, r);
    
    const userNum = parseInt(userAnswer);
    setAttempts(prev => prev + 1);
    
    if (userNum === correctAnswer) {
      setScore(prev => prev + 1);
      alert(`正解！答えは${correctAnswer}通りです！`);
      // 新しい問題
      setN(Math.floor(Math.random() * 5) + 3);
      setR(Math.floor(Math.random() * 3) + 1);
      setUserAnswer('');
    } else {
      alert(`残念... 正解は${correctAnswer}通りでした。`);
    }
  };
  
  // リセット
  const handleReset = () => {
    setN(5);
    setR(3);
    setSelectedItems([]);
    setResults([]);
    setUserAnswer('');
    setScore(0);
    setAttempts(0);
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          場合の数シミュレーター
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
        順列と組み合わせを視覚的に学習！樹形図や実例を通して、場合の数の考え方をマスターしよう。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`${n}個から${r}個選ぶ`}
          icon={<GroupIcon />}
          color="primary" 
          size="medium"
        />
        {!quizMode && (
          <Chip 
            label={mode === 'permutation' ? `${n}P${r} = ${calculatePermutation(n, r)}` : `${n}C${r} = ${calculateCombination(n, r)}`}
            icon={<CalcIcon />}
            color="secondary" 
            size="medium"
          />
        )}
        {quizMode && (
          <>
            <Chip 
              label={`得点: ${score}`} 
              color="success" 
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
      {quizMode && progress > 0 && (
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
          onChange={(_, value) => value && setMode(value)}
          fullWidth
        >
          <ToggleButton value="permutation">
            順列（順番あり）
          </ToggleButton>
          <ToggleButton value="combination">
            組み合わせ（順番なし）
          </ToggleButton>
          <ToggleButton value="tree">
            樹形図
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* クイズモード切り替え */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant={quizMode ? 'contained' : 'outlined'}
          onClick={() => setQuizMode(!quizMode)}
        >
          {quizMode ? '練習モードに戻る' : 'クイズに挑戦'}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：設定と計算 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            {!quizMode ? (
              <>
                <Typography variant="h6" gutterBottom>
                  設定
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    全体の数 (n) = {n}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {[3, 4, 5, 6, 7].map(num => (
                      <Button
                        key={num}
                        variant={n === num ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setN(num)}
                      >
                        {num}
                      </Button>
                    ))}
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    選ぶ数 (r) = {r}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[1, 2, 3, 4, 5].map(num => (
                      <Button
                        key={num}
                        variant={r === num ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setR(num)}
                        disabled={num > n}
                      >
                        {num}
                      </Button>
                    ))}
                  </Box>
                </Box>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCalculate}
                  startIcon={<DiceIcon />}
                >
                  計算する
                </Button>
                
                {showSteps && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      計算過程
                    </Typography>
                    {mode === 'permutation' ? (
                      <>
                        <Typography variant="body2">
                          {n}P{r} = {n}! / ({n}-{r})!
                        </Typography>
                        <Typography variant="body2">
                          = {n}! / {n - r}!
                        </Typography>
                        <Typography variant="body2">
                          = {calculatePermutation(n, r)}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="body2">
                          {n}C{r} = {n}! / ({r}! × ({n}-{r})!)
                        </Typography>
                        <Typography variant="body2">
                          = {n}! / ({r}! × {n - r}!)
                        </Typography>
                        <Typography variant="body2">
                          = {calculateCombination(n, r)}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </>
            ) : (
              // クイズモード
              <>
                <Typography variant="h6" gutterBottom>
                  問題
                </Typography>
                <Typography variant="body1" paragraph>
                  {items.slice(0, n).join(', ')} の{n}個から{r}個を選ぶ
                  {mode === 'permutation' ? '順列' : '組み合わせ'}
                  は何通り？
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="答えを入力"
                    size="small"
                    sx={{ width: 150 }}
                  />
                  <Typography>通り</Typography>
                  <Button
                    variant="contained"
                    onClick={checkAnswer}
                    disabled={!userAnswer}
                  >
                    答え合わせ
                  </Button>
                </Box>
              </>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="text"
                onClick={() => setShowSteps(!showSteps)}
                size="small"
              >
                {showSteps ? '計算過程を隠す' : '計算過程を見る'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* 右側：結果表示 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, maxHeight: 400, overflow: 'auto' }}>
            {mode === 'tree' ? (
              <>
                <Typography variant="h6" gutterBottom>
                  樹形図
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  ※ 簡略版の表示
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {items.slice(0, Math.min(n, 3)).map((item1, i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Typography variant="body1">
                        {item1}
                      </Typography>
                      <Box sx={{ pl: 3 }}>
                        {items.slice(0, n).filter(item => item !== item1).slice(0, 2).map((item2, j) => (
                          <Typography key={j} variant="body2" color="text.secondary">
                            ├─ {item2}
                            {r > 2 && ' ─ ...'}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  {mode === 'permutation' ? '順列' : '組み合わせ'}の例
                </Typography>
                {results.length > 0 ? (
                  <>
                    <List dense>
                      {results.map((result, index) => (
                        <ListItem key={index}>
                          <ListItemText 
                            primary={`${index + 1}. ${result.join(' → ')}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    {mode === 'permutation' && results.length >= 20 && (
                      <Typography variant="caption" color="text.secondary">
                        ※ 最初の20個のみ表示
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    「計算する」ボタンを押すと、結果が表示されます
                  </Typography>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e9' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🎲 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 順列：順番を考える（ABとBAは別）- nPr = n!/(n-r)!<br/>
          • 組み合わせ：順番を考えない（ABとBAは同じ）- nCr = n!/(r!(n-r)!)<br/>
          • 樹形図を書いて、もれなく数えよう<br/>
          • 公式を覚えて、大きな数でも計算できるように！
        </Typography>
      </Paper>
    </Box>
  );
}

export default CombinationSimulator;