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
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon, 
  PlayArrow as PlayIcon, 
  Pause as PauseIcon
} from '@mui/icons-material';

// 動く点Pの教材
function MovingPointP({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [pointPosition, setPointPosition] = useState(0); // 0-1の範囲で点Pの位置
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(0.01);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentArea, setCurrentArea] = useState(0);
  const [maxArea, setMaxArea] = useState(0);
  
  // 四角形の座標設定（キャンバス上の座標）
  const rect = {
    x: 50,
    y: 50,
    width: 300,
    height: 200
  };
  
  // 固定点A（四角形の左上角）
  const pointA = { x: rect.x, y: rect.y };
  
  // 点Pの座標を計算（四角形の周囲を移動）
  const calculatePointP = (position: number) => {
    const perimeter = 2 * (rect.width + rect.height);
    const distance = position * perimeter;
    
    if (distance <= rect.width) {
      // 上辺を移動
      return { x: rect.x + distance, y: rect.y };
    } else if (distance <= rect.width + rect.height) {
      // 右辺を移動
      return { x: rect.x + rect.width, y: rect.y + (distance - rect.width) };
    } else if (distance <= 2 * rect.width + rect.height) {
      // 下辺を移動
      return { x: rect.x + rect.width - (distance - rect.width - rect.height), y: rect.y + rect.height };
    } else {
      // 左辺を移動
      return { x: rect.x, y: rect.y + rect.height - (distance - 2 * rect.width - rect.height) };
    }
  };
  
  // 三角形の面積を計算
  const calculateTriangleArea = (pointP: { x: number; y: number }) => {
    // 点A、点P、四角形の右上角で作る三角形の面積
    const pointC = { x: rect.x + rect.width, y: rect.y };
    
    // 三角形の面積 = |x1(y2-y3) + x2(y3-y1) + x3(y1-y2)| / 2
    const area = Math.abs(
      pointA.x * (pointP.y - pointC.y) + 
      pointP.x * (pointC.y - pointA.y) + 
      pointC.x * (pointA.y - pointP.y)
    ) / 2;
    
    return area;
  };
  
  // キャンバスに描画
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 四角形を描画
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    
    // 四角形の角に点の名前を表示
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('A', rect.x - 15, rect.y - 5);
    ctx.fillText('B', rect.x + rect.width + 5, rect.y - 5);
    ctx.fillText('C', rect.x + rect.width + 5, rect.y + rect.height + 15);
    ctx.fillText('D', rect.x - 15, rect.y + rect.height + 15);
    
    // 点Pの位置を計算
    const pointP = calculatePointP(pointPosition);
    
    // 三角形ABPを描画
    const pointB = { x: rect.x + rect.width, y: rect.y };
    ctx.fillStyle = 'rgba(255, 99, 132, 0.3)';
    ctx.strokeStyle = '#ff6384';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(pointA.x, pointA.y);
    ctx.lineTo(pointB.x, pointB.y);
    ctx.lineTo(pointP.x, pointP.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 点Pを描画
    ctx.fillStyle = '#ff6384';
    ctx.beginPath();
    ctx.arc(pointP.x, pointP.y, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // 点Pのラベル
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('P', pointP.x + 10, pointP.y - 10);
    
    // 面積を計算して更新
    const area = calculateTriangleArea(pointP);
    setCurrentArea(area);
    if (area > maxArea) {
      setMaxArea(area);
    }
  };
  
  // 面積グラフを描画
  const drawAreaGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // グラフの位置とサイズ
    const graphX = 400;
    const graphY = 50;
    const graphWidth = 250;
    const graphHeight = 150;
    
    // グラフの枠を描画
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphWidth, graphHeight);
    
    // グラフのラベル
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText('点Pの位置', graphX + graphWidth/2 - 30, graphY + graphHeight + 20);
    
    // Y軸ラベル（回転）
    ctx.save();
    ctx.translate(graphX - 20, graphY + graphHeight/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('三角形の面積', -30, 0);
    ctx.restore();
    
    // 現在の位置と面積をグラフに表示
    const x = graphX + pointPosition * graphWidth;
    const maxPossibleArea = rect.width * rect.height / 2; // 理論上の最大面積
    const y = graphY + graphHeight - (currentArea / maxPossibleArea) * graphHeight;
    
    // 現在の点を描画
    ctx.fillStyle = '#ff6384';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // 面積の軌跡を描画（簡略化）
    ctx.strokeStyle = '#ff6384';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const pos = i / 100;
      const p = calculatePointP(pos);
      const area = calculateTriangleArea(p);
      const gx = graphX + pos * graphWidth;
      const gy = graphY + graphHeight - (area / maxPossibleArea) * graphHeight;
      
      if (i === 0) {
        ctx.moveTo(gx, gy);
      } else {
        ctx.lineTo(gx, gy);
      }
    }
    ctx.stroke();
  };
  
  // アニメーションループ
  const animate = () => {
    if (isAnimating) {
      setPointPosition(prev => {
        const newPos = (prev + speed) % 1;
        return newPos;
      });
      animationRef.current = requestAnimationFrame(animate);
    }
  };
  
  // マウス/タッチイベントの処理
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 点Pの近くをクリックしたかチェック
    const pointP = calculatePointP(pointPosition);
    const distance = Math.sqrt((x - pointP.x) ** 2 + (y - pointP.y) ** 2);
    
    if (distance < 20) {
      setIsDragging(true);
      setIsAnimating(false);
    }
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    // マウス位置から四角形の周囲の最も近い点を見つける
    const newPosition = findNearestPositionOnRectangle(x, y);
    setPointPosition(newPosition);
  };
  
  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };
  
  // 四角形の周囲の最も近い位置を計算
  const findNearestPositionOnRectangle = (mouseX: number, mouseY: number) => {
    // 四角形の各辺への距離を計算し、最も近い辺での位置を求める
    const perimeter = 2 * (rect.width + rect.height);
    
    // 上辺
    if (mouseY <= rect.y + 20 && mouseX >= rect.x && mouseX <= rect.x + rect.width) {
      return Math.max(0, Math.min(1, (mouseX - rect.x) / perimeter));
    }
    
    // 右辺
    if (mouseX >= rect.x + rect.width - 20 && mouseY >= rect.y && mouseY <= rect.y + rect.height) {
      return (rect.width + (mouseY - rect.y)) / perimeter;
    }
    
    // 下辺
    if (mouseY >= rect.y + rect.height - 20 && mouseX >= rect.x && mouseX <= rect.x + rect.width) {
      return (rect.width + rect.height + (rect.x + rect.width - mouseX)) / perimeter;
    }
    
    // 左辺
    if (mouseX <= rect.x + 20 && mouseY >= rect.y && mouseY <= rect.y + rect.height) {
      return (2 * rect.width + rect.height + (rect.y + rect.height - mouseY)) / perimeter;
    }
    
    return pointPosition; // 変更なし
  };
  
  // アニメーション制御
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };
  
  // リセット
  const handleReset = () => {
    setPointPosition(0);
    setIsAnimating(false);
    setCurrentArea(0);
    setMaxArea(0);
    setProgress(0);
    setSuccessCount(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
  
  // エフェクト
  useEffect(() => {
    if (isAnimating) {
      animate();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, speed]);
  
  useEffect(() => {
    drawCanvas();
    drawAreaGraph();
  }, [pointPosition]);
  
  useEffect(() => {
    // 最大面積に近づいたときの成功判定
    if (currentArea > maxArea * 0.95 && currentArea > 100) {
      setSuccessCount(prev => prev + 1);
      setProgress(prev => Math.min(prev + 5, 100));
    }
  }, [currentArea, maxArea]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          動く点P - 三角形の面積変化
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
        四角形ABCD上を動く点Pによって作られる三角形ABPの面積変化を観察しよう！
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`現在の面積: ${currentArea.toFixed(1)}`}
          color="primary" 
          size="large"
        />
        <Chip 
          label={`最大面積: ${maxArea.toFixed(1)}`} 
          color="secondary" 
          size="medium"
        />
        <Chip 
          label={`観察回数: ${successCount}`} 
          color="success" 
          size="medium"
        />
      </Box>

      {/* 進捗バー */}
      {progress > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">学習進捗</Typography>
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

            {/* アニメーション制御 */}
            <Button
              variant="contained"
              fullWidth
              startIcon={isAnimating ? <PauseIcon /> : <PlayIcon />}
              onClick={toggleAnimation}
              sx={{ mb: 2 }}
            >
              {isAnimating ? 'アニメーション停止' : 'アニメーション開始'}
            </Button>

            {/* 速度調整 */}
            <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
              アニメーション速度
            </Typography>
            <Slider
              value={speed * 1000}
              onChange={(_, value) => setSpeed((value as number) / 1000)}
              min={1}
              max={50}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}x`}
              sx={{ mb: 2 }}
            />

            {/* 手動位置調整 */}
            <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
              点Pの位置を手動調整
            </Typography>
            <Slider
              value={pointPosition * 100}
              onChange={(_, value) => setPointPosition((value as number) / 100)}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
              sx={{ mb: 2 }}
            />

            {/* 情報表示 */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  📐 数学のポイント
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 点Pの位置により三角形ABPの面積が変化<br/>
                  • 面積は点Pの高さに比例<br/>
                  • グラフで面積の変化を視覚的に確認<br/>
                  • 点Pをドラッグして直感的に理解
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* 右側：図形とグラフ表示エリア */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              四角形と面積グラフ
            </Typography>
            
            <canvas
              ref={canvasRef}
              width={700}
              height={250}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                display: 'block',
                margin: '0 auto',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />

            {/* 操作説明 */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                💡 点P（ピンクの点）をドラッグして動かしたり、アニメーションで自動的に動かして観察しよう！
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e3f2fd' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          📚 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 四角形ABCD上を点Pが移動すると、三角形ABPの面積が変化します<br/>
          • 右側のグラフで、点Pの位置に対する面積の変化を確認できます<br/>
          • 面積が最大になるのはどの位置でしょうか？その理由も考えてみましょう<br/>
          • この問題は高校入試でもよく出題される重要な概念です
        </Typography>
      </Paper>
    </Box>
  );
}

export default MovingPointP;