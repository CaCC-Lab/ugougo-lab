import { useState, useEffect, useRef } from 'react';
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
  Pause as PauseIcon
} from '@mui/icons-material';

interface Ball {
  id: string;
  type: 'symbol' | 'name';
  element: string;
  x: number;
  y: number;
  color: string;
  matched: boolean;
}

interface GameState {
  balls: Ball[];
  score: number;
  level: number;
  isGameOver: boolean;
  combo: number;
}

// 元素記号パズルゲーム
function ElementPuzzleGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [gameState, setGameState] = useState<GameState>({
    balls: [],
    score: 0,
    level: 1,
    isGameOver: false,
    combo: 0
  });
  
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shootAngle, setShootAngle] = useState(0);
  const [currentBall, setCurrentBall] = useState<Ball | null>(null);
  const [nextBall, setNextBall] = useState<Ball | null>(null);
  
  // 元素データ
  const elements = [
    { symbol: 'H', name: '水素', color: '#FF6B6B' },
    { symbol: 'He', name: 'ヘリウム', color: '#4ECDC4' },
    { symbol: 'Li', name: 'リチウム', color: '#45B7D1' },
    { symbol: 'Be', name: 'ベリリウム', color: '#96CEB4' },
    { symbol: 'B', name: 'ホウ素', color: '#FFEAA7' },
    { symbol: 'C', name: '炭素', color: '#DDA0DD' },
    { symbol: 'N', name: '窒素', color: '#98D8C8' },
    { symbol: 'O', name: '酸素', color: '#F7DC6F' },
    { symbol: 'F', name: 'フッ素', color: '#BB8FCE' },
    { symbol: 'Ne', name: 'ネオン', color: '#85C1E9' },
    { symbol: 'Na', name: 'ナトリウム', color: '#F8C471' },
    { symbol: 'Mg', name: 'マグネシウム', color: '#82E0AA' },
    { symbol: 'Al', name: 'アルミニウム', color: '#AED6F1' },
    { symbol: 'Si', name: 'ケイ素', color: '#F5B7B1' },
    { symbol: 'P', name: 'リン', color: '#D7BDE2' },
    { symbol: 'S', name: '硫黄', color: '#A9DFBF' },
    { symbol: 'Cl', name: '塩素', color: '#FAD7A0' },
    { symbol: 'Ar', name: 'アルゴン', color: '#AED6F1' },
    { symbol: 'K', name: 'カリウム', color: '#F1948A' },
    { symbol: 'Ca', name: 'カルシウム', color: '#85C1E9' }
  ];
  
  const canvasWidth = 600;
  const canvasHeight = 500;
  const ballRadius = 25;
  
  // ランダムな元素ボールを生成
  const createRandomBall = (x: number, y: number): Ball => {
    const element = elements[Math.floor(Math.random() * Math.min(10, elements.length))]; // 最初は基本的な元素のみ
    const type = Math.random() > 0.5 ? 'symbol' : 'name';
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      element: element.symbol,
      x,
      y,
      color: element.color,
      matched: false
    };
  };
  
  // 初期ボール配置
  const initializeGame = () => {
    const balls: Ball[] = [];
    const rows = 8;
    const cols = 12;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (row < 5) { // 上半分のみに配置
          const x = col * (ballRadius * 2) + ballRadius + (row % 2) * ballRadius;
          const y = row * (ballRadius * 1.7) + ballRadius * 2;
          
          if (x < canvasWidth - ballRadius && Math.random() > 0.3) {
            balls.push(createRandomBall(x, y));
          }
        }
      }
    }
    
    setGameState(prev => ({
      ...prev,
      balls,
      score: 0,
      level: 1,
      isGameOver: false,
      combo: 0
    }));
    
    // 発射するボールを設定
    setCurrentBall(createRandomBall(canvasWidth / 2, canvasHeight - 50));
    setNextBall(createRandomBall(canvasWidth / 2, canvasHeight - 50));
  };
  
  // キャンバスに描画
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 背景グラデーション
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#f0f8ff');
    gradient.addColorStop(1, '#e6f3ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // ゲームエリアの境界線
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    
    // 発射角度のガイドライン
    if (currentBall && isPlaying) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(currentBall.x, currentBall.y);
      const lineLength = 100;
      const endX = currentBall.x + Math.cos(shootAngle) * lineLength;
      const endY = currentBall.y + Math.sin(shootAngle) * lineLength;
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // ボールを描画
    gameState.balls.forEach(ball => {
      drawBall(ctx, ball);
    });
    
    // 現在のボール
    if (currentBall) {
      drawBall(ctx, currentBall);
    }
    
    // 次のボール表示
    if (nextBall) {
      const previewX = canvasWidth - 60;
      const previewY = canvasHeight - 60;
      drawBall(ctx, { ...nextBall, x: previewX, y: previewY });
      
      // "NEXT" ラベル
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('NEXT', previewX, previewY + 40);
    }
  };
  
  // ボールを描画
  const drawBall = (ctx: CanvasRenderingContext2D, ball: Ball) => {
    // 影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(ball.x + 2, ball.y + 2, ballRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // ボール本体
    ctx.fillStyle = ball.matched ? '#90EE90' : ball.color;
    ctx.strokeStyle = ball.matched ? '#32CD32' : '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // テキスト
    const element = elements.find(e => e.symbol === ball.element);
    if (element) {
      ctx.fillStyle = '#333';
      ctx.font = ball.type === 'symbol' ? 'bold 16px Arial' : 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = ball.type === 'symbol' ? element.symbol : element.name;
      
      // 長いテキストの場合は改行
      if (ball.type === 'name' && text.length > 4) {
        const halfLength = Math.ceil(text.length / 2);
        const firstHalf = text.substring(0, halfLength);
        const secondHalf = text.substring(halfLength);
        ctx.fillText(firstHalf, ball.x, ball.y - 5);
        ctx.fillText(secondHalf, ball.x, ball.y + 5);
      } else {
        ctx.fillText(text, ball.x, ball.y);
      }
    }
  };
  
  // マウスクリックで発射
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying || !currentBall) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 発射角度を計算
    const angle = Math.atan2(y - currentBall.y, x - currentBall.x);
    shootBall(angle);
  };
  
  // マウス移動で照準
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying || !currentBall) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const angle = Math.atan2(y - currentBall.y, x - currentBall.x);
    setShootAngle(angle);
  };
  
  // ボール発射
  const shootBall = (angle: number) => {
    if (!currentBall) return;
    
    // ボール移動のシミュレーション（簡略化）
    const speed = 10;
    let newX = currentBall.x;
    let newY = currentBall.y;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    
    // 衝突検知とボール配置
    const moveInterval = setInterval(() => {
      newX += vx;
      newY += vy;
      
      // 壁との衝突
      if (newX <= ballRadius || newX >= canvasWidth - ballRadius) {
        vx = -vx;
      }
      
      // 天井との衝突
      if (newY <= ballRadius) {
        vy = Math.abs(vy);
      }
      
      // 他のボールとの衝突または下端到達
      let hasCollided = false;
      for (const ball of gameState.balls) {
        const distance = Math.sqrt((newX - ball.x) ** 2 + (newY - ball.y) ** 2);
        if (distance < ballRadius * 2) {
          hasCollided = true;
          break;
        }
      }
      
      if (hasCollided || newY >= canvasHeight - ballRadius) {
        clearInterval(moveInterval);
        
        // 新しいボールを配置
        const newBall = { ...currentBall, x: newX, y: newY };
        addBallToField(newBall);
        
        // 次のボールに切り替え
        setCurrentBall(nextBall);
        setNextBall(createRandomBall(canvasWidth / 2, canvasHeight - 50));
      }
    }, 50);
  };
  
  // フィールドにボールを追加してマッチング判定
  const addBallToField = (newBall: Ball) => {
    setGameState(prev => {
      const updatedBalls = [...prev.balls, newBall];
      
      // マッチング判定
      const matchedGroups = findMatches(updatedBalls, newBall);
      
      if (matchedGroups.length >= 3) {
        // マッチしたボールを削除
        const remainingBalls = updatedBalls.filter(ball => 
          !matchedGroups.some(match => match.id === ball.id)
        );
        
        // スコア加算
        const points = matchedGroups.length * 100 * (prev.combo + 1);
        
        return {
          ...prev,
          balls: remainingBalls,
          score: prev.score + points,
          combo: prev.combo + 1
        };
      } else {
        return {
          ...prev,
          balls: updatedBalls,
          combo: 0
        };
      }
    });
  };
  
  // マッチング判定
  const findMatches = (balls: Ball[], targetBall: Ball): Ball[] => {
    const visited = new Set<string>();
    const matches: Ball[] = [];
    
    const dfs = (ball: Ball) => {
      if (visited.has(ball.id)) return;
      visited.add(ball.id);
      
      // 同じ元素のペア（記号と名前）をチェック
      const isMatch = balls.some(otherBall => 
        otherBall.element === ball.element && 
        otherBall.type !== ball.type &&
        Math.sqrt((ball.x - otherBall.x) ** 2 + (ball.y - otherBall.y) ** 2) < ballRadius * 3
      );
      
      if (isMatch) {
        matches.push(ball);
        
        // 隣接するボールを検索
        balls.forEach(adjacentBall => {
          const distance = Math.sqrt((ball.x - adjacentBall.x) ** 2 + (ball.y - adjacentBall.y) ** 2);
          if (distance < ballRadius * 2.5 && !visited.has(adjacentBall.id)) {
            if (adjacentBall.element === ball.element) {
              dfs(adjacentBall);
            }
          }
        });
      }
    };
    
    dfs(targetBall);
    return matches;
  };
  
  // ゲーム開始/停止
  const toggleGame = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      initializeGame();
    }
  };
  
  // リセット
  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setSuccessCount(0);
    initializeGame();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
  
  // エフェクト
  useEffect(() => {
    initializeGame();
  }, []);
  
  useEffect(() => {
    drawCanvas();
  }, [gameState, currentBall, nextBall, shootAngle, isPlaying]);
  
  useEffect(() => {
    // スコアに基づく進捗更新
    if (gameState.score > 0) {
      setProgress(Math.min((gameState.score / 5000) * 100, 100));
      if (gameState.combo > 2) {
        setSuccessCount(prev => prev + 1);
      }
    }
  }, [gameState.score, gameState.combo]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          元素記号パズルゲーム
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
        元素記号（H, O など）と元素名（水素, 酸素 など）をペアで揃えて消そう！パズルボブル風ゲームで楽しく暗記！
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`スコア: ${gameState.score}`}
          color="primary" 
          size="large"
        />
        <Chip 
          label={`コンボ: ${gameState.combo}`} 
          color="secondary" 
          size="medium"
        />
        <Chip 
          label={`レベル: ${gameState.level}`} 
          color="info" 
          size="medium"
        />
        <Chip 
          label={`成功回数: ${successCount}`} 
          color="success" 
          size="medium"
        />
      </Box>

      {/* 進捗バー */}
      {progress > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">学習進捗</Typography>
            <Typography variant="caption">{progress.toFixed(1)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

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
              {isPlaying ? 'ゲーム中断' : 'ゲーム開始'}
            </Button>

            {/* ルール説明 */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  🎮 遊び方
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  1. 画面をクリックしてボールを発射<br/>
                  2. 同じ元素の記号と名前をペアで揃える<br/>
                  3. 3個以上つながると消える<br/>
                  4. コンボでハイスコアを狙おう！
                </Typography>
              </CardContent>
            </Card>

            {/* 元素一覧 */}
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  📚 出題元素
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {elements.slice(0, 10).map((element) => (
                    <Chip
                      key={element.symbol}
                      label={`${element.symbol} - ${element.name}`}
                      size="small"
                      style={{ backgroundColor: element.color, color: '#333' }}
                    />
                  ))}
                </Box>
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
                border: '2px solid #ddd',
                borderRadius: '8px',
                display: 'block',
                margin: '0 auto',
                cursor: isPlaying ? 'crosshair' : 'default'
              }}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
            />

            {/* 操作説明 */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              {isPlaying ? (
                <Typography variant="body2" color="text.secondary">
                  💡 マウスで照準を合わせてクリックで発射！同じ元素の記号と名前をペアで揃えよう！
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  「ゲーム開始」ボタンを押してゲームを始めよう！
                </Typography>
              )}
            </Box>

            {gameState.isGameOver && (
              <Alert severity="info" sx={{ mt: 2 }}>
                ゲーム終了！ 最終スコア: {gameState.score}点
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#f3e5f5' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🧪 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 元素記号と元素名の対応を覚えながら楽しくゲーム<br/>
          • パズルボブルの要素でゲーム性があり飽きにくい<br/>
          • コンボを狙うことで自然と元素の組み合わせを覚える<br/>
          • 化学の基礎となる元素の知識を効率的に習得
        </Typography>
      </Paper>
    </Box>
  );
}

export default ElementPuzzleGame;