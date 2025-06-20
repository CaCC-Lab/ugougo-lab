import { useState, useEffect, useRef, useCallback } from 'react';
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
  Alert
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon, 
  PlayArrow as PlayIcon, 
  Pause as PauseIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

interface Block {
  id: string;
  x: number;
  y: number;
  letter: string;
  color: string;
  typed: boolean;
  falling: boolean;
  chain: number;
}

interface GameState {
  blocks: Block[];
  score: number;
  level: number;
  combo: number;
  lines: number;
  gameOver: boolean;
  wpm: number;
  accuracy: number;
}

// ぷよぷよ風タイピングゲーム（内部コンポーネント）
function TypingPuyoGameContent({ onClose }: { onClose: () => void }) {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const gameLoopRef = useRef<number>();
  const dropLoopRef = useRef<number>();
  const nextBlocksRef = useRef<Block[]>([]);
  
  const [gameState, setGameState] = useState<GameState>({
    blocks: [],
    score: 0,
    level: 1,
    combo: 0,
    lines: 0,
    gameOver: false,
    wpm: 0,
    accuracy: 100
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [nextBlocks, setNextBlocks] = useState<Block[]>([]);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [typedCount, setTypedCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [chainEffect, setChainEffect] = useState<{ x: number; y: number; combo: number } | null>(null);
  const [gameMode, setGameMode] = useState<'normal' | 'learning'>('learning');
  const [learningLevel, setLearningLevel] = useState(1);
  const [practiceLetters, setPracticeLetters] = useState<string[]>([]);
  
  const canvasWidth = 400;
  const canvasHeight = 600;
  const blockSize = 40;
  const cols = 10;
  const rows = 15;
  
  // 色の配列
  const colors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  
  // アルファベット配列
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // 学習レベル別の文字セット
  const learningLetterSets = [
    ['F', 'J'],                                    // レベル1: ホームポジション基本
    ['F', 'J', 'D', 'K'],                         // レベル2: 人差し指
    ['F', 'J', 'D', 'K', 'S', 'L'],              // レベル3: 中指追加
    ['F', 'J', 'D', 'K', 'S', 'L', 'A', ';'],    // レベル4: 薬指追加
    ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'],    // レベル5: ホームポジション完成
    ['G', 'H'],                                    // レベル6: 内側の文字
    ['R', 'U', 'E', 'I'],                         // レベル7: 上段基本
    ['T', 'Y', 'W', 'O'],                         // レベル8: 上段応用
    ['V', 'N', 'C', 'M'],                         // レベル9: 下段基本
    letters                                        // レベル10: 全文字
  ];
  
  // ランダムなブロックを生成
  const createRandomBlock = (x: number, y: number): Block => {
    let letter: string;
    
    if (gameMode === 'learning' && practiceLetters.length > 0) {
      // 学習モードでは練習文字から選択
      letter = practiceLetters[Math.floor(Math.random() * practiceLetters.length)];
    } else {
      // 通常モードでは全文字から選択
      letter = letters[Math.floor(Math.random() * letters.length)];
    }
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      letter,
      color,
      typed: false,
      falling: true,
      chain: 0
    };
  };
  
  // ゲームの初期化
  const initializeGame = () => {
    // 学習モードの場合、練習文字をセット
    if (gameMode === 'learning') {
      const levelIndex = Math.min(learningLevel - 1, learningLetterSets.length - 1);
      setPracticeLetters(learningLetterSets[levelIndex]);
    }
    
    const initialBlocks: Block[] = [];
    
    // 底に少しブロックを配置（学習モードでは少なめ）
    const startRow = gameMode === 'learning' ? rows - 2 : rows - 3;
    for (let row = startRow; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() > (gameMode === 'learning' ? 0.8 : 0.7)) {
          initialBlocks.push(createRandomBlock(col, row));
        }
      }
    }
    
    setGameState({
      blocks: initialBlocks,
      score: 0,
      level: gameMode === 'learning' ? learningLevel : 1,
      combo: 0,
      lines: 0,
      gameOver: false,
      wpm: 0,
      accuracy: 100
    });
    
    setCurrentBlock(createRandomBlock(Math.floor(cols / 2), 0));
    const initialNextBlocks = [
      createRandomBlock(Math.floor(cols / 2), 0),
      createRandomBlock(Math.floor(cols / 2), 0)
    ];
    setNextBlocks(initialNextBlocks);
    nextBlocksRef.current = initialNextBlocks;
    
    setTimeLeft(gameMode === 'learning' ? 120 : 60); // 学習モードは時間を長めに
    setTypedCount(0);
    setMistakeCount(0);
    setStartTime(Date.now());
  };
  
  // キャンバスに描画
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 背景グラデーション
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // グリッドライン
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * blockSize, 0);
      ctx.lineTo(i * blockSize, canvasHeight);
      ctx.stroke();
    }
    
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * blockSize);
      ctx.lineTo(canvasWidth, i * blockSize);
      ctx.stroke();
    }
    
    // 配置済みブロックを描画
    gameState.blocks.forEach(block => {
      drawBlock(ctx, block);
    });
    
    // 落下中のブロックを描画
    if (currentBlock) {
      drawBlock(ctx, currentBlock);
    }
    
    // 連鎖エフェクト
    if (chainEffect) {
      drawChainEffect(ctx, chainEffect);
    }
    
    // 危険ライン
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(0, blockSize * 3);
    ctx.lineTo(canvasWidth, blockSize * 3);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  
  // ブロックを描画
  const drawBlock = (ctx: CanvasRenderingContext2D, block: Block) => {
    const x = block.x * blockSize;
    const y = block.y * blockSize;
    
    // ブロックの影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 2, y + 2, blockSize - 4, blockSize - 4);
    
    // ブロック本体
    ctx.fillStyle = block.typed ? '#90EE90' : block.color;
    ctx.fillRect(x + 1, y + 1, blockSize - 2, blockSize - 2);
    
    // ブロックの枠
    ctx.strokeStyle = block.typed ? '#32CD32' : '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, blockSize - 2, blockSize - 2);
    
    // 文字
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(block.letter, x + blockSize / 2, y + blockSize / 2);
    
    // タイプ済みマーク
    if (block.typed) {
      ctx.fillStyle = '#32CD32';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('✓', x + blockSize - 8, y + 8);
    }
  };
  
  // 連鎖エフェクトを描画
  const drawChainEffect = (ctx: CanvasRenderingContext2D, effect: { x: number; y: number; combo: number }) => {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${effect.combo} CHAIN!`, effect.x, effect.y);
    
    // パーティクルエフェクト
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * 2 * Math.PI;
      const distance = 30 + Math.sin(Date.now() * 0.01) * 10;
      const px = effect.x + Math.cos(angle) * distance;
      const py = effect.y + Math.sin(angle) * distance;
      
      ctx.fillStyle = `hsl(${(Date.now() * 0.1 + i * 36) % 360}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  };
  
  // キーボード入力の処理
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isPlaying || !currentBlock || gameState.gameOver) return;
    
    const key = event.key.toUpperCase();
    
    if (key === currentBlock.letter) {
      // 正解
      setTypedCount(prev => prev + 1);
      
      // 学習履歴に記録
      recordAnswer(true, {
        problem: `タイピング: ${currentBlock.letter}`,
        userAnswer: key,
        correctAnswer: currentBlock.letter,
        gameMode: gameMode,
        level: gameState.level,
        typingSpeed: Math.round((typedCount / ((Date.now() - (startTime || Date.now())) / 60000))),
        accuracy: Math.round((typedCount / (typedCount + mistakeCount)) * 100)
      });
      
      // ブロックをタイプ済みにマーク（現在の位置で固定）
      const typedBlock = { ...currentBlock, typed: true, falling: false };
      
      setGameState(prev => ({
        ...prev,
        blocks: [...prev.blocks, typedBlock]
      }));
      
      // 次のブロックをセット
      setCurrentBlock(nextBlocks[0]);
      const newNextBlocks = [nextBlocks[1], createRandomBlock(Math.floor(cols / 2), 0)];
      setNextBlocks(newNextBlocks);
      nextBlocksRef.current = newNextBlocks;
      
      // 連鎖チェック
      setTimeout(() => checkForMatches(), 100);
      
      // 学習モードでのレベルアップチェック
      if (gameMode === 'learning') {
        checkLevelProgress();
      }
      
    } else {
      // 間違い
      setMistakeCount(prev => prev + 1);
      recordInteraction('mistake');
      
      // 学習履歴に記録
      recordAnswer(false, {
        problem: `タイピング: ${currentBlock.letter}`,
        userAnswer: key,
        correctAnswer: currentBlock.letter,
        gameMode: gameMode,
        level: gameState.level
      });
      
      // ブロックが下に落ちる（落下速度を速める）
      setCurrentBlock(prev => prev ? { ...prev, y: prev.y + 1 } : null);
    }
  }, [isPlaying, currentBlock, gameState.gameOver, nextBlocks, gameMode]);
  
  // マッチングチェック
  const checkForMatches = () => {
    setGameState(prev => {
      const newBlocks = [...prev.blocks];
      const toRemove: string[] = [];
      let newScore = prev.score;
      let newCombo = prev.combo;
      
      // タイプ済みブロックの連続を探す
      const typedBlocks = newBlocks.filter(block => block.typed);
      
      // 同じ色のタイプ済みブロックが3つ以上つながっているかチェック
      const colorGroups: { [color: string]: Block[] } = {};
      typedBlocks.forEach(block => {
        if (!colorGroups[block.color]) {
          colorGroups[block.color] = [];
        }
        colorGroups[block.color].push(block);
      });
      
      Object.entries(colorGroups).forEach(([color, blocks]) => {
        if (blocks.length >= 3) {
          // 3つ以上の同色ブロックを削除
          blocks.forEach(block => toRemove.push(block.id));
          newScore += blocks.length * 100 * (newCombo + 1);
          newCombo++;
          
          // 連鎖エフェクト
          if (blocks.length > 0) {
            const centerX = blocks.reduce((sum, b) => sum + b.x, 0) / blocks.length * blockSize + blockSize / 2;
            const centerY = blocks.reduce((sum, b) => sum + b.y, 0) / blocks.length * blockSize + blockSize / 2;
            setChainEffect({ x: centerX, y: centerY, combo: newCombo });
            setTimeout(() => setChainEffect(null), 1000);
          }
        }
      });
      
      // 削除されるブロックを除去
      const remainingBlocks = newBlocks.filter(block => !toRemove.includes(block.id));
      
      // ブロックを下に落とす
      const droppedBlocks = dropBlocks(remainingBlocks);
      
      return {
        ...prev,
        blocks: droppedBlocks,
        score: newScore,
        combo: newCombo,
        lines: prev.lines + (toRemove.length > 0 ? 1 : 0)
      };
    });
  };
  
  // レベル進行をチェック（学習モード）
  const checkLevelProgress = () => {
    const currentAccuracy = typedCount + mistakeCount > 0 
      ? (typedCount / (typedCount + mistakeCount)) * 100 
      : 100;
    
    // 正解数が20以上かつ正確度が90%以上でレベルアップ
    if (typedCount >= 20 && currentAccuracy >= 90 && learningLevel < learningLetterSets.length) {
      const nextLevel = learningLevel + 1;
      
      // 学習進捗のレベルアップを記録
      recordAnswer(true, {
        problem: `学習モード レベル${learningLevel}完了`,
        userAnswer: `正解数: ${typedCount}, 正確度: ${currentAccuracy.toFixed(1)}%`,
        correctAnswer: `レベル${nextLevel}へ昇格`,
        level: learningLevel,
        nextLevel: nextLevel,
        accuracy: currentAccuracy,
        previousLetters: practiceLetters.join(','),
        nextLetters: learningLetterSets[Math.min(learningLevel, learningLetterSets.length - 1)].join(',')
      });
      
      setLearningLevel(prev => prev + 1);
      setTypedCount(0);
      setMistakeCount(0);
      
      // 新しいレベルの文字をセット
      const newLevelIndex = Math.min(learningLevel, learningLetterSets.length - 1);
      setPracticeLetters(learningLetterSets[newLevelIndex]);
      
      // レベルアップのフィードバック
      setChainEffect({ 
        x: canvasWidth / 2, 
        y: canvasHeight / 2, 
        combo: learningLevel + 1 
      });
      setTimeout(() => setChainEffect(null), 2000);
    }
  };

  // ブロックを重力で落とす
  const dropBlocks = (blocks: Block[]): Block[] => {
    const grid: (Block | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));
    
    // グリッドにブロックを配置
    blocks.forEach(block => {
      if (block.y >= 0 && block.y < rows && block.x >= 0 && block.x < cols) {
        grid[block.y][block.x] = block;
      }
    });
    
    // 各列で下に落とす
    for (let col = 0; col < cols; col++) {
      const columnBlocks: Block[] = [];
      
      for (let row = 0; row < rows; row++) {
        if (grid[row][col]) {
          columnBlocks.push(grid[row][col]!);
        }
      }
      
      // 下から配置し直す
      for (let i = 0; i < columnBlocks.length; i++) {
        columnBlocks[i].y = rows - 1 - i;
      }
    }
    
    return blocks;
  };
  
  // 衝突チェック
  const checkCollision = useCallback((x: number, y: number): boolean => {
    return gameState.blocks.some(block => block.x === x && block.y === y && !block.falling);
  }, [gameState.blocks]);
  
  // ゲームループ
  const gameLoop = () => {
    if (!isPlaying || gameState.gameOver) return;
    
    // 時間を減らす
    setTimeLeft(prev => {
      const newTime = Math.max(prev - 1, 0);
      if (newTime === 0) {
        setGameState(prev => ({ ...prev, gameOver: true }));
      }
      return newTime;
    });
    
    // WPMと正確度を計算
    if (startTime) {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      const wpm = elapsedMinutes > 0 ? Math.round(typedCount / elapsedMinutes) : 0;
      const accuracy = typedCount + mistakeCount > 0 ? Math.round((typedCount / (typedCount + mistakeCount)) * 100) : 100;
      
      setGameState(prev => ({
        ...prev,
        wpm,
        accuracy
      }));
    }
    
    // 進捗更新
    setProgress((60 - timeLeft) / 60 * 100);
    
    gameLoopRef.current = setTimeout(gameLoop, 1000);
  };
  
  // ブロック落下ループ
  const dropLoop = useCallback(() => {
    if (!isPlaying || gameState.gameOver) return;
    
    // 現在のブロックを落下させる
    setCurrentBlock(prev => {
      if (!prev) return null;
      
      const newY = prev.y + 1;
      
      // ブロックが底についたか、他のブロックに衝突したかチェック
      if (newY >= rows || checkCollision(prev.x, newY)) {
        // ブロックを固定
        setGameState(prevState => {
          const newBlocks = [...prevState.blocks, { ...prev, falling: false }];
          
          // ゲームオーバーチェック（ブロックが上まで積み上がった）
          if (prev.y <= 3) {
            return { ...prevState, blocks: newBlocks, gameOver: true };
          }
          
          return { ...prevState, blocks: newBlocks };
        });
        
        // 次のブロックをセット（refから取得）
        const nextBlocksArr = nextBlocksRef.current;
        if (nextBlocksArr.length > 0) {
          setCurrentBlock(nextBlocksArr[0]);
          const newNextBlocks = [nextBlocksArr[1], createRandomBlock(Math.floor(cols / 2), 0)];
          setNextBlocks(newNextBlocks);
          nextBlocksRef.current = newNextBlocks;
        }
        
        // 連鎖チェック
        setTimeout(() => checkForMatches(), 100);
        
        return null;
      }
      
      return { ...prev, y: newY };
    });
    
    // 落下速度（レベルに応じて速くなる）
    // タイピング初心者でも対応できるよう、大幅に遅く調整
    const baseSpeed = gameMode === 'learning' ? 5000 : 3000; // 学習モード5秒、通常モード3秒
    const speedReduction = gameMode === 'learning' ? 100 : 150; // レベルごとの速度増加（緩やか）
    const minSpeed = gameMode === 'learning' ? 2000 : 1000; // 最速でも学習モード2秒、通常モード1秒
    const dropSpeed = Math.max(baseSpeed - (gameState.level - 1) * speedReduction, minSpeed);
    
    // デバッグ用: 現在の落下速度を確認
    console.log(`Drop speed: ${dropSpeed}ms (${(dropSpeed / 1000).toFixed(1)}秒)`);
    
    dropLoopRef.current = setTimeout(dropLoop, dropSpeed);
  }, [isPlaying, gameState.gameOver, gameState.level, gameMode, checkCollision]);
  
  // アニメーションループ
  const animate = () => {
    drawGame();
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // ゲーム開始/停止
  const toggleGame = () => {
    if (!isPlaying) {
      initializeGame();
      setIsPlaying(true);
      recordInteraction('click');
      
      // ゲーム開始を記録
      recordAnswer(true, {
        problem: 'タイピングゲーム開始',
        userAnswer: `${gameMode}モード開始`,
        correctAnswer: 'ゲームセッション開始',
        gameMode: gameMode,
        level: gameMode === 'learning' ? learningLevel : 1
      });
    } else {
      setIsPlaying(false);
      recordInteraction('click');
      
      // ゲーム終了時の成果を記録
      const finalAccuracy = typedCount > 0 ? Math.round((typedCount / (typedCount + mistakeCount)) * 100) : 0;
      const timeElapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
      const wpm = timeElapsed > 0 ? Math.round((typedCount / timeElapsed) * 60) : 0;
      
      recordAnswer(true, {
        problem: 'タイピングゲーム終了',
        userAnswer: `スコア: ${gameState.score}, 正解数: ${typedCount}`,
        correctAnswer: 'ゲームセッション完了',
        gameMode: gameMode,
        level: gameState.level,
        score: gameState.score,
        typedCount: typedCount,
        accuracy: finalAccuracy,
        wpm: wpm,
        playTime: Math.round(timeElapsed)
      });
      
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
      if (dropLoopRef.current) {
        clearTimeout(dropLoopRef.current);
      }
    }
  };
  
  // リセット
  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setTimeLeft(gameMode === 'learning' ? 120 : 60);
    setTypedCount(0);
    setMistakeCount(0);
    setStartTime(null);
    setChainEffect(null);
    recordInteraction('click');
    
    // 学習モードでは進捗を保持（レベルは維持）
    if (gameMode !== 'learning') {
      setLearningLevel(1);
    }
    
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
    }
    if (dropLoopRef.current) {
      clearTimeout(dropLoopRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    initializeGame();
  };
  
  // エフェクト
  useEffect(() => {
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, currentBlock, chainEffect]);
  
  useEffect(() => {
    if (isPlaying) {
      gameLoop();
      dropLoop(); // 落下ループを開始
      document.addEventListener('keydown', handleKeyPress);
    } else {
      document.removeEventListener('keydown', handleKeyPress);
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
      if (dropLoopRef.current) {
        clearTimeout(dropLoopRef.current);
      }
    };
  }, [isPlaying, handleKeyPress]);
  
  useEffect(() => {
    initializeGame();
  }, []);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          ぷよぷよ風タイピングゲーム
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
        {gameMode === 'learning' 
          ? '段階的に文字を学習しながら、正確なタイピングを身につけよう！'
          : '落ちてくるブロックのアルファベットをタイピングして、連鎖で高得点を狙おう！'}
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`スコア: ${gameState.score}`}
          color="primary" 
          size="large"
        />
        <Chip 
          label={`WPM: ${gameState.wpm}`} 
          color="secondary" 
          size="medium"
        />
        <Chip 
          label={`正確度: ${gameState.accuracy}%`} 
          color="info" 
          size="medium"
        />
        <Chip 
          label={`時間: ${timeLeft}s`} 
          color={timeLeft < 10 ? 'error' : 'success'}
          size="medium"
        />
        {gameState.combo > 0 && (
          <Chip 
            label={`コンボ: ${gameState.combo}`} 
            color="warning" 
            size="medium"
          />
        )}
      </Box>

      {/* 進捗バー */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption">ゲーム進行</Typography>
          <Typography variant="caption">{progress.toFixed(1)}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：コントロールパネル */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              ゲームコントロール
            </Typography>

            {/* ゲームモード選択 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                ゲームモード
              </Typography>
              <Button
                variant={gameMode === 'learning' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  setGameMode('learning');
                  handleReset();
                  recordInteraction('click');
                  recordAnswer(true, {
                    problem: 'ゲームモード変更',
                    userAnswer: '学習モード選択',
                    correctAnswer: '学習モードへの切り替え完了'
                  });
                }}
                sx={{ mr: 1 }}
                disabled={isPlaying}
              >
                学習モード
              </Button>
              <Button
                variant={gameMode === 'normal' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  setGameMode('normal');
                  handleReset();
                  recordInteraction('click');
                  recordAnswer(true, {
                    problem: 'ゲームモード変更',
                    userAnswer: '通常モード選択',
                    correctAnswer: '通常モードへの切り替え完了'
                  });
                }}
                disabled={isPlaying}
              >
                通常モード
              </Button>
            </Box>

            {/* 学習モードの情報 */}
            {gameMode === 'learning' && (
              <Card variant="outlined" sx={{ mb: 2, bgcolor: 'info.light' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    レベル {learningLevel} / {learningLetterSets.length}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    練習文字: {practiceLetters.join(', ')}
                  </Typography>
                  <Typography variant="caption">
                    20回正解（正確度90%以上）で次のレベルへ
                  </Typography>
                  {learningLevel > 1 && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      進捗: {typedCount}/20 (正確度: {((typedCount / (typedCount + mistakeCount || 1)) * 100).toFixed(1)}%)
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ゲーム開始/停止 */}
            <Button
              variant="contained"
              fullWidth
              startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
              onClick={toggleGame}
              sx={{ mb: 2 }}
            >
              {isPlaying ? 'ゲーム停止' : 'ゲーム開始'}
            </Button>

            {/* 現在のブロック表示 */}
            {currentBlock && (
              <Card variant="outlined" sx={{ mb: 2, textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    現在のブロック
                  </Typography>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      margin: '0 auto',
                      backgroundColor: currentBlock.color,
                      border: '2px solid #333',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold' }}>
                      {currentBlock.letter}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* 次のブロック */}
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  次のブロック
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  {nextBlocks.map((block, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: block.color,
                        border: '1px solid #333',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>
                        {block.letter}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* 統計 */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  📊 タイピング統計
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  正打数: {typedCount}<br/>
                  ミス数: {mistakeCount}<br/>
                  連鎖数: {gameState.lines}<br/>
                  レベル: {gameState.level}<br/>
                  {isPlaying && (
                    <>
                      落下速度: {(() => {
                        const baseSpeed = gameMode === 'learning' ? 5000 : 3000;
                        const speedReduction = gameMode === 'learning' ? 100 : 150;
                        const minSpeed = gameMode === 'learning' ? 2000 : 1000;
                        const dropSpeed = Math.max(baseSpeed - (gameState.level - 1) * speedReduction, minSpeed);
                        return `${(dropSpeed / 1000).toFixed(1)}秒`;
                      })()}
                    </>
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* 右側：ゲームエリア */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              ゲームフィールド
            </Typography>
            
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              style={{
                border: '2px solid #333',
                borderRadius: '8px',
                display: 'block',
                margin: '0 auto',
                backgroundColor: '#000'
              }}
            />

            {/* 操作説明 */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              {isPlaying ? (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    💡 キーボードで落ちてくるブロックの文字をタイプ！同じ色を3つ以上揃えて消そう！
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    ヒント: 落ちてくる文字をよく見て、正確にタイプしましょう
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  「ゲーム開始」ボタンを押してタイピング練習を始めよう！
                </Typography>
              )}
            </Box>

            {/* ゲームオーバー */}
            {gameState.gameOver && (
              <Alert severity="info" sx={{ mt: 2 }}>
                ゲーム終了！ 最終スコア: {gameState.score}点 | WPM: {gameState.wpm} | 正確度: {gameState.accuracy}%
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e8' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          ⌨️ タイピング上達のポイント：
        </Typography>
        <Typography variant="body2">
          • <strong>学習モードで基本から段階的に練習するのがおすすめです</strong><br/>
          • 正確性を重視して、まずは間違えずにタイプしましょう<br/>
          • 同じ色のブロックを3つ以上揃えると連鎖で高得点！<br/>
          • WPM（Words Per Minute）で速度を、正確度でスキルを測定<br/>
          • ホームポジション（F・J）から始めて、徐々に範囲を広げましょう
        </Typography>
      </Paper>
    </Box>
  );
}

// ぷよぷよ風タイピングゲーム（MaterialWrapperでラップ）
function TypingPuyoGame({ onClose }: { onClose: () => void }) {
  return (
    <MaterialWrapper
      materialId="typing-puyo-game"
      materialName="ぷよぷよ風タイピングゲーム"
      showMetricsButton={true}
      showAssistant={true}
    >
      <TypingPuyoGameContent onClose={onClose} />
    </MaterialWrapper>
  );
}

export default TypingPuyoGame;