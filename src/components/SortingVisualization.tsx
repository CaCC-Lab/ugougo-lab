import { useState, useEffect, useRef } from 'react';
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
  MenuItem,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon, 
  PlayArrow as PlayIcon, 
  Pause as PauseIcon,
  SkipNext as StepIcon,
  Shuffle as ShuffleIcon
} from '@mui/icons-material';

interface SortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  message: string;
}

// ソートアルゴリズムの可視化
function SortingVisualization({ onClose }: { onClose: () => void }) {
  const [algorithm, setAlgorithm] = useState('bubble');
  const [arraySize, setArraySize] = useState(8);
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState({ algorithm: 'bubble', array: [3, 1, 4, 2] });
  const [userAnswer, setUserAnswer] = useState<string>('');
  
  const intervalRef = useRef<NodeJS.Timeout>();

  // ソートアルゴリズム
  const algorithms = {
    bubble: { name: 'バブルソート', description: '隣り合う要素を比較して並び替える' },
    selection: { name: '選択ソート', description: '最小値を見つけて先頭に移動する' },
    insertion: { name: '挿入ソート', description: '要素を適切な位置に挿入する' },
    quick: { name: 'クイックソート', description: 'ピボットを基準に分割して並び替える' }
  };

  // 配列の生成
  const generateArray = () => {
    const newArray = Array.from({ length: arraySize }, (_, i) => i + 1);
    // シャッフル
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    setArray(newArray);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // バブルソートの実装
  const bubbleSort = (arr: number[]): SortStep[] => {
    const steps: SortStep[] = [];
    const workArray = [...arr];
    const n = workArray.length;
    
    steps.push({
      array: [...workArray],
      comparing: [],
      swapping: [],
      sorted: [],
      message: 'バブルソートを開始します'
    });
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // 比較
        steps.push({
          array: [...workArray],
          comparing: [j, j + 1],
          swapping: [],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
          message: `${workArray[j]} と ${workArray[j + 1]} を比較`
        });
        
        if (workArray[j] > workArray[j + 1]) {
          // 交換
          [workArray[j], workArray[j + 1]] = [workArray[j + 1], workArray[j]];
          steps.push({
            array: [...workArray],
            comparing: [],
            swapping: [j, j + 1],
            sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
            message: `${workArray[j + 1]} と ${workArray[j]} を交換`
          });
        }
      }
    }
    
    steps.push({
      array: [...workArray],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, i) => i),
      message: 'ソート完了！'
    });
    
    return steps;
  };

  // 選択ソートの実装
  const selectionSort = (arr: number[]): SortStep[] => {
    const steps: SortStep[] = [];
    const workArray = [...arr];
    const n = workArray.length;
    
    steps.push({
      array: [...workArray],
      comparing: [],
      swapping: [],
      sorted: [],
      message: '選択ソートを開始します'
    });
    
    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      
      // 最小値を探す
      for (let j = i + 1; j < n; j++) {
        steps.push({
          array: [...workArray],
          comparing: [minIndex, j],
          swapping: [],
          sorted: Array.from({ length: i }, (_, k) => k),
          message: `最小値を探しています: ${workArray[minIndex]} vs ${workArray[j]}`
        });
        
        if (workArray[j] < workArray[minIndex]) {
          minIndex = j;
        }
      }
      
      // 交換
      if (minIndex !== i) {
        [workArray[i], workArray[minIndex]] = [workArray[minIndex], workArray[i]];
        steps.push({
          array: [...workArray],
          comparing: [],
          swapping: [i, minIndex],
          sorted: Array.from({ length: i }, (_, k) => k),
          message: `最小値 ${workArray[i]} を位置 ${i} に移動`
        });
      }
    }
    
    steps.push({
      array: [...workArray],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, i) => i),
      message: 'ソート完了！'
    });
    
    return steps;
  };

  // 挿入ソートの実装
  const insertionSort = (arr: number[]): SortStep[] => {
    const steps: SortStep[] = [];
    const workArray = [...arr];
    const n = workArray.length;
    
    steps.push({
      array: [...workArray],
      comparing: [],
      swapping: [],
      sorted: [0],
      message: '挿入ソートを開始します'
    });
    
    for (let i = 1; i < n; i++) {
      const key = workArray[i];
      let j = i - 1;
      
      steps.push({
        array: [...workArray],
        comparing: [i],
        swapping: [],
        sorted: Array.from({ length: i }, (_, k) => k),
        message: `${key} を適切な位置に挿入します`
      });
      
      while (j >= 0 && workArray[j] > key) {
        steps.push({
          array: [...workArray],
          comparing: [j, j + 1],
          swapping: [],
          sorted: Array.from({ length: i }, (_, k) => k),
          message: `${workArray[j]} > ${key} なので後ろに移動`
        });
        
        workArray[j + 1] = workArray[j];
        j--;
        
        steps.push({
          array: [...workArray],
          comparing: [],
          swapping: [j + 1, j + 2],
          sorted: Array.from({ length: i }, (_, k) => k),
          message: `要素を後ろに移動中...`
        });
      }
      
      workArray[j + 1] = key;
      
      steps.push({
        array: [...workArray],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: i + 1 }, (_, k) => k),
        message: `${key} を位置 ${j + 1} に挿入`
      });
    }
    
    steps.push({
      array: [...workArray],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, i) => i),
      message: 'ソート完了！'
    });
    
    return steps;
  };

  // ソート実行
  const executeSort = () => {
    let sortSteps: SortStep[] = [];
    
    switch (algorithm) {
      case 'bubble':
        sortSteps = bubbleSort(array);
        break;
      case 'selection':
        sortSteps = selectionSort(array);
        break;
      case 'insertion':
        sortSteps = insertionSort(array);
        break;
      default:
        sortSteps = bubbleSort(array);
    }
    
    setSteps(sortSteps);
    setCurrentStep(0);
  };

  // 自動再生
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // 次のステップ
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 配列の描画
  const renderArray = () => {
    if (steps.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'end', gap: 1, height: 200 }}>
          {array.map((value, index) => (
            <Box
              key={index}
              sx={{
                width: 40,
                height: value * 20,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: 1,
                transition: 'all 0.3s ease'
              }}
            >
              {value}
            </Box>
          ))}
        </Box>
      );
    }
    
    const currentState = steps[currentStep];
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'end', gap: 1, height: 200 }}>
        {currentState.array.map((value, index) => {
          let color = 'primary.main';
          let transform = 'scale(1)';
          
          if (currentState.sorted.includes(index)) {
            color = 'success.main';
          } else if (currentState.comparing.includes(index)) {
            color = 'warning.main';
            transform = 'scale(1.1)';
          } else if (currentState.swapping.includes(index)) {
            color = 'error.main';
            transform = 'scale(1.2)';
          }
          
          return (
            <Box
              key={index}
              sx={{
                width: 40,
                height: value * 20,
                bgcolor: color,
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: 1,
                transform,
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              {value}
              {currentState.comparing.includes(index) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -25,
                    fontSize: '12px',
                    color: 'warning.main',
                    fontWeight: 'bold'
                  }}
                >
                  比較中
                </Box>
              )}
              {currentState.swapping.includes(index) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -25,
                    fontSize: '12px',
                    color: 'error.main',
                    fontWeight: 'bold'
                  }}
                >
                  交換中
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  // クイズ生成
  const generateQuiz = () => {
    const algKeys = Object.keys(algorithms);
    const randomAlg = algKeys[Math.floor(Math.random() * algKeys.length)];
    const randomArray = Array.from({ length: 4 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    
    setQuizQuestion({ algorithm: randomAlg, array: randomArray });
    setUserAnswer('');
  };

  // クイズ回答チェック
  const checkAnswer = (answer: string) => {
    setUserAnswer(answer);
    if (answer === quizQuestion.algorithm) {
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
    setIsPlaying(false);
    setQuizMode(false);
    setUserAnswer('');
    setCurrentStep(0);
    setSteps([]);
    generateArray();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // エフェクト
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length, speed]);

  useEffect(() => {
    generateArray();
  }, [arraySize]);

  // クイズ選択肢
  const generateChoices = () => {
    const correct = quizQuestion.algorithm;
    const choices = [correct];
    
    Object.keys(algorithms).forEach(alg => {
      if (alg !== correct && choices.length < 4) {
        choices.push(alg);
      }
    });
    
    return choices.sort(() => Math.random() - 0.5);
  };

  const choices = quizMode ? generateChoices() : [];

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          ソートアルゴリズム可視化
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
        様々なソートアルゴリズムの動作を視覚的に理解しよう！
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={quizMode ? `クイズ: どのアルゴリズム？` : `アルゴリズム: ${algorithms[algorithm as keyof typeof algorithms].name}`}
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

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：コントロールパネル */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              コントロール
            </Typography>

            {/* モード選択 */}
            <ButtonGroup fullWidth sx={{ mb: 2 }}>
              <Button
                variant={!quizMode ? 'contained' : 'outlined'}
                onClick={() => setQuizMode(false)}
                size="small"
              >
                学習モード
              </Button>
              <Button
                variant={quizMode ? 'contained' : 'outlined'}
                onClick={() => {
                  setQuizMode(true);
                  generateQuiz();
                }}
                size="small"
              >
                クイズモード
              </Button>
            </ButtonGroup>

            {!quizMode && (
              <>
                {/* アルゴリズム選択 */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>アルゴリズム</InputLabel>
                  <Select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    size="small"
                  >
                    {Object.entries(algorithms).map(([key, alg]) => (
                      <MenuItem key={key} value={key}>
                        {alg.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 配列サイズ */}
                <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                  配列サイズ: {arraySize}
                </Typography>
                <Slider
                  value={arraySize}
                  onChange={(_, value) => setArraySize(value as number)}
                  min={4}
                  max={10}
                  marks
                  valueLabelDisplay="auto"
                  size="small"
                  sx={{ mb: 2 }}
                />

                {/* 速度調整 */}
                <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                  速度: {speed}ms
                </Typography>
                <Slider
                  value={speed}
                  onChange={(_, value) => setSpeed(value as number)}
                  min={100}
                  max={2000}
                  step={100}
                  valueLabelDisplay="auto"
                  size="small"
                  sx={{ mb: 2 }}
                />

                {/* 操作ボタン */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ShuffleIcon />}
                    onClick={generateArray}
                    size="small"
                  >
                    シャッフル
                  </Button>
                  <Button
                    variant="contained"
                    onClick={executeSort}
                    size="small"
                    disabled={steps.length > 0}
                  >
                    ソート実行
                  </Button>
                </Box>

                {steps.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
                      onClick={togglePlay}
                      size="small"
                    >
                      {isPlaying ? '一時停止' : '再生'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<StepIcon />}
                      onClick={nextStep}
                      size="small"
                      disabled={currentStep >= steps.length - 1}
                    >
                      次へ
                    </Button>
                  </Box>
                )}
              </>
            )}

            {/* アルゴリズム情報 */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {quizMode ? '？？？' : algorithms[algorithm as keyof typeof algorithms].name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {quizMode ? 'アルゴリズムを当ててください' : algorithms[algorithm as keyof typeof algorithms].description}
                </Typography>
                {steps.length > 0 && !quizMode && (
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    ステップ: {currentStep + 1} / {steps.length}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* 右側：可視化エリア */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              ソート可視化
            </Typography>
            
            {renderArray()}

            {/* 現在の状態説明 */}
            {steps.length > 0 && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {steps[currentStep]?.message}
                </Typography>
              </Box>
            )}

            {/* クイズモードの選択肢 */}
            {quizMode && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  この並び替えはどのアルゴリズムでしょう？
                </Typography>
                
                <Grid container spacing={2} justifyContent="center">
                  {choices.map((choice) => (
                    <Grid item key={choice}>
                      <Button
                        variant={userAnswer === choice ? (choice === quizQuestion.algorithm ? 'contained' : 'outlined') : 'outlined'}
                        color={userAnswer === choice ? (choice === quizQuestion.algorithm ? 'success' : 'error') : 'primary'}
                        onClick={() => checkAnswer(choice)}
                        disabled={userAnswer !== ''}
                        sx={{ 
                          minWidth: 120, 
                          minHeight: 50,
                          fontSize: '1rem'
                        }}
                      >
                        {algorithms[choice as keyof typeof algorithms].name}
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                {userAnswer && (
                  <Alert 
                    severity={userAnswer === quizQuestion.algorithm ? 'success' : 'error'}
                    sx={{ mt: 2 }}
                  >
                    {userAnswer === quizQuestion.algorithm ? 
                      '🎉 正解！アルゴリズムの特徴を正しく理解できました！' : 
                      '❌ 間違いです。並び替えの手順をもう一度観察してみましょう！'
                    }
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#f3e5f5' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          💻 ソートアルゴリズムのポイント：
        </Typography>
        <Typography variant="body2">
          • 🟦 青：未ソート状態　🟡 黄：比較中　🔴 赤：交換中　🟢 緑：ソート済み<br/>
          • 各アルゴリズムには異なる特徴と効率性があります<br/>
          • 速度やステップ数を比較してアルゴリズムの違いを理解しましょう
        </Typography>
      </Paper>
    </Box>
  );
}

export default SortingVisualization;