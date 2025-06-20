import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

interface WordItem {
  id: string;
  word: string;
  hiragana: string;
  emoji: string;
  category: string;
  sound?: string;
}

interface GameState {
  currentWord: WordItem | null;
  options: WordItem[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  showResult: boolean;
  isCorrect: boolean;
}

interface PictureWordMatchingProps {
  onClose?: () => void;
}

// 絵と言葉のマッチングゲーム（内部コンポーネント）
const PictureWordMatchingContent: React.FC<PictureWordMatchingProps> = ({ onClose }) => {
  const theme = useTheme();
  const { recordInteraction, recordAnswer } = useLearningTrackerContext();
  
  // 単語データベース
  const wordDatabase: WordItem[] = [
    // 動物
    { id: '1', word: 'いぬ', hiragana: 'いぬ', emoji: '🐕', category: 'animal' },
    { id: '2', word: 'ねこ', hiragana: 'ねこ', emoji: '🐈', category: 'animal' },
    { id: '3', word: 'うさぎ', hiragana: 'うさぎ', emoji: '🐰', category: 'animal' },
    { id: '4', word: 'ぞう', hiragana: 'ぞう', emoji: '🐘', category: 'animal' },
    { id: '5', word: 'きりん', hiragana: 'きりん', emoji: '🦒', category: 'animal' },
    { id: '6', word: 'らいおん', hiragana: 'らいおん', emoji: '🦁', category: 'animal' },
    { id: '7', word: 'さる', hiragana: 'さる', emoji: '🐵', category: 'animal' },
    { id: '8', word: 'とり', hiragana: 'とり', emoji: '🐦', category: 'animal' },
    
    // 果物
    { id: '9', word: 'りんご', hiragana: 'りんご', emoji: '🍎', category: 'fruit' },
    { id: '10', word: 'みかん', hiragana: 'みかん', emoji: '🍊', category: 'fruit' },
    { id: '11', word: 'ばなな', hiragana: 'ばなな', emoji: '🍌', category: 'fruit' },
    { id: '12', word: 'いちご', hiragana: 'いちご', emoji: '🍓', category: 'fruit' },
    { id: '13', word: 'ぶどう', hiragana: 'ぶどう', emoji: '🍇', category: 'fruit' },
    { id: '14', word: 'もも', hiragana: 'もも', emoji: '🍑', category: 'fruit' },
    { id: '15', word: 'すいか', hiragana: 'すいか', emoji: '🍉', category: 'fruit' },
    { id: '16', word: 'めろん', hiragana: 'めろん', emoji: '🍈', category: 'fruit' },
    
    // 乗り物
    { id: '17', word: 'くるま', hiragana: 'くるま', emoji: '🚗', category: 'vehicle' },
    { id: '18', word: 'でんしゃ', hiragana: 'でんしゃ', emoji: '🚃', category: 'vehicle' },
    { id: '19', word: 'ひこうき', hiragana: 'ひこうき', emoji: '✈️', category: 'vehicle' },
    { id: '20', word: 'ふね', hiragana: 'ふね', emoji: '🚢', category: 'vehicle' },
    { id: '21', word: 'じてんしゃ', hiragana: 'じてんしゃ', emoji: '🚲', category: 'vehicle' },
    { id: '22', word: 'ばす', hiragana: 'ばす', emoji: '🚌', category: 'vehicle' },
    { id: '23', word: 'しょうぼうしゃ', hiragana: 'しょうぼうしゃ', emoji: '🚒', category: 'vehicle' },
    { id: '24', word: 'きゅうきゅうしゃ', hiragana: 'きゅうきゅうしゃ', emoji: '🚑', category: 'vehicle' },
    
    // 食べ物
    { id: '25', word: 'ぱん', hiragana: 'ぱん', emoji: '🍞', category: 'food' },
    { id: '26', word: 'おにぎり', hiragana: 'おにぎり', emoji: '🍙', category: 'food' },
    { id: '27', word: 'らーめん', hiragana: 'らーめん', emoji: '🍜', category: 'food' },
    { id: '28', word: 'かれー', hiragana: 'かれー', emoji: '🍛', category: 'food' },
    { id: '29', word: 'けーき', hiragana: 'けーき', emoji: '🍰', category: 'food' },
    { id: '30', word: 'あいす', hiragana: 'あいす', emoji: '🍦', category: 'food' },
    { id: '31', word: 'たまご', hiragana: 'たまご', emoji: '🥚', category: 'food' },
    { id: '32', word: 'ぎゅうにゅう', hiragana: 'ぎゅうにゅう', emoji: '🥛', category: 'food' },
  ];
  
  // ゲーム設定
  const [category, setCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('easy');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>({
    currentWord: null,
    options: [],
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    showResult: false,
    isCorrect: false,
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  
  // 問題の生成
  const generateQuestion = () => {
    let availableWords = wordDatabase;
    
    // カテゴリフィルタ
    if (category !== 'all') {
      availableWords = availableWords.filter(word => word.category === category);
    }
    
    // ランダムに正解を選択
    const correctIndex = Math.floor(Math.random() * availableWords.length);
    const correctWord = availableWords[correctIndex];
    
    // 選択肢の数（難易度による）
    const optionCount = difficulty === 'easy' ? 3 : difficulty === 'normal' ? 4 : 6;
    
    // 選択肢を生成
    const options: WordItem[] = [correctWord];
    const usedIndices = new Set([correctIndex]);
    
    while (options.length < optionCount && options.length < availableWords.length) {
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      if (!usedIndices.has(randomIndex)) {
        options.push(availableWords[randomIndex]);
        usedIndices.add(randomIndex);
      }
    }
    
    // 選択肢をシャッフル
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    setGameState(prev => ({
      ...prev,
      currentWord: correctWord,
      options: options,
      showResult: false,
      isCorrect: false,
      totalQuestions: prev.totalQuestions + 1,
    }));
    setSelectedOption(null);
  };
  
  // 初期化
  useEffect(() => {
    generateQuestion();
  }, [category, difficulty]);
  
  // 答えの選択
  const handleOptionClick = (word: WordItem) => {
    if (gameState.showResult) return;
    
    setSelectedOption(word.id);
    const isCorrect = word.id === gameState.currentWord?.id;
    
    setGameState(prev => ({
      ...prev,
      showResult: true,
      isCorrect: isCorrect,
      score: isCorrect ? prev.score + (difficulty === 'easy' ? 10 : difficulty === 'normal' ? 20 : 30) : prev.score,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
    }));
    
    // 回答結果を記録
    recordAnswer(isCorrect, {
      selectedWord: word.word,
      correctWord: gameState.currentWord?.word,
      category: category,
      difficulty: difficulty,
      questionNumber: gameState.totalQuestions
    });
    recordInteraction('click');
    
    // 全問正解チェック
    if (isCorrect && gameState.correctAnswers + 1 >= 10) {
      setTimeout(() => setShowSuccessDialog(true), 1000);
    }
  };
  
  // 次の問題
  const handleNext = () => {
    generateQuestion();
    recordInteraction('click');
  };
  
  // リセット
  const handleReset = () => {
    setGameState({
      currentWord: null,
      options: [],
      score: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      showResult: false,
      isCorrect: false,
    });
    generateQuestion();
    recordInteraction('click');
  };
  
  // 音声再生（実際の実装では音声ファイルが必要）
  const playSound = (word: string) => {
    // 実際の実装では音声ファイルを再生
    console.log(`Playing sound for: ${word}`);
    recordInteraction('click');
  };
  
  // 正答率
  const accuracy = gameState.totalQuestions > 0 
    ? Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100) 
    : 0;
  
  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          えとことばのマッチングゲーム
        </Typography>
        <Tooltip title="つかいかた">
          <IconButton onClick={() => {
            setShowExplanation(!showExplanation);
            recordInteraction('click');
          }}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {showExplanation && (
        <Alert severity="info" sx={{ mb: 3 }}>
          えをみて、ただしいことばをえらびましょう！
          ただしくこたえるとポイントがもらえます。
          10もんれんぞくでせいかいすると、すぺしゃるなごほうびがあります！
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* 左側：設定とスコア */}
        <Box sx={{ flex: '0 0 300px', minWidth: 250 }}>
          {/* カテゴリ選択 */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                recordInteraction('change');
              }}
              label="カテゴリ"
            >
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="animal">どうぶつ</MenuItem>
              <MenuItem value="fruit">くだもの</MenuItem>
              <MenuItem value="vehicle">のりもの</MenuItem>
              <MenuItem value="food">たべもの</MenuItem>
            </Select>
          </FormControl>

          {/* 難易度選択 */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>なんいど</InputLabel>
            <Select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value as any);
                recordInteraction('change');
              }}
              label="なんいど"
            >
              <MenuItem value="easy">かんたん（3つからえらぶ）</MenuItem>
              <MenuItem value="normal">ふつう（4つからえらぶ）</MenuItem>
              <MenuItem value="hard">むずかしい（6つからえらぶ）</MenuItem>
            </Select>
          </FormControl>

          {/* スコア表示 */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              スコア
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StarIcon sx={{ color: '#ffd700', mr: 1 }} />
              <Typography variant="h4">{gameState.score}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              せいかい: {gameState.correctAnswers} / {gameState.totalQuestions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              せいかいりつ: {accuracy}%
            </Typography>
          </Paper>

          {/* 進捗 */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              れんぞくせいかい
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min((gameState.correctAnswers % 10) * 10, 100)} 
              sx={{ mb: 1, height: 10, borderRadius: 5 }}
            />
            <Typography variant="caption" color="text.secondary">
              あと{10 - (gameState.correctAnswers % 10)}もんでごほうび！
            </Typography>
          </Paper>

          {/* リセットボタン */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            さいしょから
          </Button>
        </Box>

        {/* 右側：ゲーム画面 */}
        <Box sx={{ flex: '1 1 500px' }}>
          {/* 問題の絵文字 */}
          {gameState.currentWord && (
            <Paper 
              sx={{ 
                p: 4, 
                mb: 3, 
                textAlign: 'center',
                bgcolor: theme.palette.primary.light + '20',
              }}
            >
              <Typography 
                sx={{ 
                  fontSize: '120px',
                  lineHeight: 1,
                  mb: 2,
                }}
              >
                {gameState.currentWord.emoji}
              </Typography>
              <Typography variant="h5" sx={{ mb: 1 }}>
                これはなんですか？
              </Typography>
              <IconButton 
                onClick={() => playSound(gameState.currentWord!.word)}
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': { bgcolor: theme.palette.primary.dark },
                }}
              >
                <VolumeUpIcon />
              </IconButton>
            </Paper>
          )}

          {/* 選択肢 */}
          <Grid container spacing={2}>
            {gameState.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const isCorrect = option.id === gameState.currentWord?.id;
              const showCorrect = gameState.showResult && isCorrect;
              const showIncorrect = gameState.showResult && isSelected && !isCorrect;
              
              return (
                <Grid item xs={6} sm={4} key={option.id}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: gameState.showResult ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      bgcolor: showCorrect ? '#4caf50' : showIncorrect ? '#f44336' : 'background.paper',
                      color: (showCorrect || showIncorrect) ? 'white' : 'text.primary',
                      '&:hover': {
                        transform: gameState.showResult ? 'scale(1)' : 'scale(1.05)',
                        boxShadow: gameState.showResult ? 1 : 4,
                      },
                    }}
                    onClick={() => handleOptionClick(option)}
                  >
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {option.word}
                    </Typography>
                    {showCorrect && (
                      <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* 結果表示と次へボタン */}
          {gameState.showResult && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2,
                  color: gameState.isCorrect ? '#4caf50' : '#f44336',
                  fontWeight: 'bold',
                }}
              >
                {gameState.isCorrect ? 'せいかい！すごい！' : 'ざんねん...もういちど！'}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleNext}
                sx={{ minWidth: 200 }}
              >
                つぎのもんだい
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* 成功ダイアログ */}
      <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)}>
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <Typography variant="h4" sx={{ color: '#ffd700', mb: 1 }}>
            ⭐ おめでとう！ ⭐
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            10もんれんぞくせいかい！
          </Typography>
          <Typography variant="h1" sx={{ fontSize: '100px', mb: 2 }}>
            🎉
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            きみはことばのたつじん！
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setShowSuccessDialog(false);
              handleReset();
            }}
            sx={{ minWidth: 200 }}
          >
            もういちどあそぶ
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// 絵と言葉のマッチングゲーム（MaterialWrapperでラップ）
const PictureWordMatching: React.FC<PictureWordMatchingProps> = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="picture-word-matching"
      materialName="絵と言葉のマッチングゲーム"
      showMetricsButton={true}
      showAssistant={true}
    >
      <PictureWordMatchingContent onClose={onClose} />
    </MaterialWrapper>
  );
};

export default PictureWordMatching;