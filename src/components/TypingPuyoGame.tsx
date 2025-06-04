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

// ぷよぷよ風タイピングゲーム
function TypingPuyoGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const gameLoopRef = useRef<number>();
  
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
  
  const canvasWidth = 400;
  const canvasHeight = 600;
  const blockSize = 40;
  const cols = 10;
  const rows = 15;
  
  // 色の配列
  const colors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  
  // アルファベット配列
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // ランダムなブロックを生成
  const createRandomBlock = (x: number, y: number): Block => {
    const letter = letters[Math.floor(Math.random() * letters.length)];
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
    const initialBlocks: Block[] = [];
    
    // 底に少しブロックを配置
    for (let row = rows - 3; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() > 0.7) {
          initialBlocks.push(createRandomBlock(col, row));
        }
      }
    }
    
    setGameState({
      blocks: initialBlocks,
      score: 0,
      level: 1,
      combo: 0,
      lines: 0,
      gameOver: false,
      wpm: 0,
      accuracy: 100
    });
    
    setCurrentBlock(createRandomBlock(Math.floor(cols / 2), 0));
    setNextBlocks([
      createRandomBlock(Math.floor(cols / 2), 0),
      createRandomBlock(Math.floor(cols / 2), 0)
    ]);
    
    setTimeLeft(60);
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
      
      // ブロックをタイプ済みにマーク
      const typedBlock = { ...currentBlock, typed: true, falling: false };
      
      setGameState(prev => ({
        ...prev,
        blocks: [...prev.blocks, typedBlock]
      }));
      
      // 次のブロックをセット
      setCurrentBlock(nextBlocks[0]);
      setNextBlocks(prev => [prev[1], createRandomBlock(Math.floor(cols / 2), 0)]);
      
      // 連鎖チェック
      setTimeout(() => checkForMatches(), 100);
      
    } else {
      // 間違い
      setMistakeCount(prev => prev + 1);
      
      // ブロックが下に落ちる
      setCurrentBlock(prev => prev ? { ...prev, y: prev.y + 1 } : null);
    }
  }, [isPlaying, currentBlock, gameState.gameOver, nextBlocks]);
  
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
    } else {
      setIsPlaying(false);
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    }
  };
  
  // リセット
  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setTimeLeft(60);
    setTypedCount(0);
    setMistakeCount(0);
    setStartTime(null);
    setChainEffect(null);
    
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
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
        落ちてくるブロックのアルファベットをタイピングして、連鎖で高得点を狙おう！
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
                  レベル: {gameState.level}
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
                <Typography variant="body2" color="text.secondary">
                  💡 キーボードで落ちてくるブロックの文字をタイプ！同じ色を3つ以上揃えて消そう！
                </Typography>
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
          • 正確性を重視して、まずは間違えずにタイプしましょう<br/>
          • 同じ色のブロックを3つ以上揃えると連鎖で高得点！<br/>
          • WPM（Words Per Minute）で速度を、正確度でスキルを測定<br/>
          • 継続的な練習がタイピングスキル向上の鍵です
        </Typography>
      </Paper>
    </Box>
  );
}

export default TypingPuyoGame;