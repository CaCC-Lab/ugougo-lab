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
  CardContent,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon, 
  PlayArrow as PlayIcon, 
  Pause as PauseIcon
} from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

// 動く点Pの教材（内部コンポーネント）
function MovingPointPContent({ onClose }: { onClose: () => void }) {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [pointPosition, setPointPosition] = useState(0); // 0-1の範囲で点Pの位置
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(0.01);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentArea, setCurrentArea] = useState(0);
  const [maxArea, setMaxArea] = useState(0);
  const [explorationMode, setExplorationMode] = useState<'free' | 'guided'>('guided');
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [observations, setObservations] = useState<string[]>([]);
  const [discoveredPatterns, setDiscoveredPatterns] = useState<Set<string>>(new Set());
  
  // 四角形の座標設定（キャンバス上の座標）- レスポンシブ対応
  const getCanvasSize = () => {
    const width = isMobile ? Math.min(350, window.innerWidth - 60) : 700;
    const height = isMobile ? 200 : 250;
    return { width, height };
  };

  const rect = {
    x: isMobile ? 25 : 50,
    y: isMobile ? 25 : 50,
    width: isMobile ? Math.min(300, (window.innerWidth - 120)) : 300,
    height: isMobile ? 120 : 150
  };
  
  // 探索チャレンジ
  const challenges = [
    {
      id: 0,
      title: "点Pを四角形の角に移動させよう",
      description: "まず、点Pを四角形の4つの角（A、B、C、D）に移動させて、それぞれの面積を観察しましょう。",
      checkCondition: () => {
        const corners = [0, 0.25, 0.5, 0.75];
        return corners.some(pos => Math.abs(pointPosition - pos) < 0.02);
      },
      hint: "点Pをドラッグして、各角に移動させてみましょう。"
    },
    {
      id: 1,
      title: "面積が0になる位置を見つけよう",
      description: "三角形ABPの面積が0になる位置を探してみましょう。どこにありますか？",
      checkCondition: () => currentArea < 10,
      hint: "三角形の面積が0になるのは、3つの点が一直線上にあるときです。"
    },
    {
      id: 2,
      title: "面積が最大になる位置を探そう",
      description: "三角形ABPの面積が最大になる位置を見つけてください。",
      checkCondition: () => currentArea > maxArea * 0.95 && currentArea > 100,
      hint: "点Pが辺ABから最も離れた位置にあるとき、面積が最大になります。"
    },
    {
      id: 3,
      title: "面積の変化パターンを理解しよう",
      description: "点Pをゆっくり一周させて、面積がどのように変化するか観察しましょう。",
      checkCondition: () => observations.length >= 3,
      hint: "各辺での面積の変化に注目してください。"
    }
  ];
  
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
      recordInteraction('drag');
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
    
    // ドラッグによる位置変更を記録（連続的な操作なので適度な間隔で）
    if (Math.random() < 0.1) {
      recordAnswer(true, {
        problem: 'ドラッグによる点Pの位置調整',
        userAnswer: `位置${(newPosition * 100).toFixed(1)}%に移動`,
        correctAnswer: '手動操作による探索'
      });
    }
  };
  
  const handleCanvasMouseUp = () => {
    if (isDragging) {
      // ドラッグ完了時の記録
      recordAnswer(true, {
        problem: 'ドラッグ操作の完了',
        userAnswer: `点Pの位置を${(pointPosition * 100).toFixed(1)}%に設定`,
        correctAnswer: 'ドラッグ操作完了'
      });
    }
    setIsDragging(false);
  };

  // タッチイベントハンドラー
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.touches.length !== 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // 点Pの近くをタップしたかチェック
    const pointP = calculatePointP(pointPosition);
    const distance = Math.sqrt((x - pointP.x) ** 2 + (y - pointP.y) ** 2);
    
    if (distance < 30) { // タッチの場合は少し大きめの判定エリア
      setIsDragging(true);
      setIsAnimating(false);
      recordInteraction('drag');
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDragging || e.touches.length !== 1) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - canvasRect.left;
    const y = touch.clientY - canvasRect.top;
    
    // タッチ位置から四角形の周囲の最も近い点を見つける
    const newPosition = findNearestPositionOnRectangle(x, y);
    setPointPosition(newPosition);
    
    // タッチによる位置変更を記録
    if (Math.random() < 0.1) {
      recordAnswer(true, {
        problem: 'タッチドラッグによる点Pの位置調整',
        userAnswer: `位置${(newPosition * 100).toFixed(1)}%に移動`,
        correctAnswer: '手動操作による探索'
      });
    }
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isDragging) {
      // タッチドラッグ完了時の記録
      recordAnswer(true, {
        problem: 'タッチドラッグ操作の完了',
        userAnswer: `点Pの位置を${(pointPosition * 100).toFixed(1)}%に設定`,
        correctAnswer: 'タッチドラッグ操作完了'
      });
    }
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
    recordInteraction('click');
    
    // アニメーション状態変更を記録
    recordAnswer(true, {
      problem: 'アニメーション制御',
      userAnswer: `アニメーション${!isAnimating ? '開始' : '停止'}`,
      correctAnswer: 'アニメーション状態変更完了'
    });
  };
  
  // 観察を記録
  const recordObservation = (observation: string) => {
    setObservations(prev => [...prev, observation]);
    recordInteraction('click');
    
    // 観察記録を学習履歴に記録
    recordAnswer(true, {
      problem: '動く点Pの観察記録',
      userAnswer: observation,
      correctAnswer: '観察完了'
    });
    
    // パターンを検出
    if (currentArea < 10) {
      setDiscoveredPatterns(prev => new Set([...prev, 'zero_area']));
      recordAnswer(true, {
        problem: 'パターン発見: 面積が0になる条件',
        userAnswer: '面積が最小値に到達',
        correctAnswer: '面積最小パターンの発見'
      });
    }
    if (currentArea > maxArea * 0.95 && currentArea > 100) {
      setDiscoveredPatterns(prev => new Set([...prev, 'max_area']));
      recordAnswer(true, {
        problem: 'パターン発見: 最大面積の発見',
        userAnswer: '面積が最大値に到達',
        correctAnswer: '面積最大パターンの発見'
      });
    }
    if (pointPosition < 0.02 || Math.abs(pointPosition - 0.25) < 0.02 || 
        Math.abs(pointPosition - 0.5) < 0.02 || Math.abs(pointPosition - 0.75) < 0.02) {
      setDiscoveredPatterns(prev => new Set([...prev, 'corners']));
      recordAnswer(true, {
        problem: 'パターン発見: 特殊な位置での探索',
        userAnswer: '四隅や辺の中点での観察',
        correctAnswer: '重要な位置パターンの発見'
      });
    }
  };

  // チャレンジ完了をチェック
  const checkChallengeCompletion = () => {
    if (explorationMode === 'guided' && currentChallenge < challenges.length) {
      const challenge = challenges[currentChallenge];
      if (challenge.checkCondition()) {
        setSuccessCount(prev => prev + 1);
        setProgress(prev => Math.min(prev + 25, 100));
        
        // チャレンジ完了を学習履歴に記録
        recordAnswer(true, {
          problem: `ガイド付きチャレンジ ${currentChallenge + 1}`,
          userAnswer: challenge.title,
          correctAnswer: 'チャレンジ達成'
        });
        
        // 自動的に観察を記録
        if (challenge.id === 0) {
          recordObservation(`角での面積: ${currentArea.toFixed(1)}`);
        } else if (challenge.id === 1) {
          recordObservation(`面積が0になる位置を発見！`);
        } else if (challenge.id === 2) {
          recordObservation(`最大面積: ${currentArea.toFixed(1)}`);
        }
        
        // 次のチャレンジへ
        if (currentChallenge < challenges.length - 1) {
          setTimeout(() => setCurrentChallenge(prev => prev + 1), 1000);
        }
      }
    }
  };

  // リセット
  const handleReset = () => {
    recordInteraction('click');
    
    // リセット実行を記録
    recordAnswer(true, {
      problem: '動く点P探索のリセット',
      userAnswer: '探索状態をリセット',
      correctAnswer: 'リセット完了'
    });
    
    setPointPosition(0);
    setIsAnimating(false);
    setCurrentArea(0);
    setMaxArea(0);
    setProgress(0);
    setSuccessCount(0);
    setCurrentChallenge(0);
    setObservations([]);
    setDiscoveredPatterns(new Set());
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
    checkChallengeCompletion();
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
          size="medium"
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

            {/* 探索モード選択 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                探索モード
              </Typography>
              <Button
                variant={explorationMode === 'guided' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  setExplorationMode('guided');
                  recordInteraction('click');
                  recordAnswer(true, {
                    problem: '探索モード変更',
                    userAnswer: 'ガイド付きモードを選択',
                    correctAnswer: 'ガイド付きモードに切り替え完了'
                  });
                }}
                sx={{ mr: 1 }}
              >
                ガイド付き
              </Button>
              <Button
                variant={explorationMode === 'free' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  setExplorationMode('free');
                  recordInteraction('click');
                  recordAnswer(true, {
                    problem: '探索モード変更',
                    userAnswer: '自由探索モードを選択',
                    correctAnswer: '自由探索モードに切り替え完了'
                  });
                }}
              >
                自由探索
              </Button>
            </Box>

            {/* チャレンジ表示（ガイドモード時） */}
            {explorationMode === 'guided' && currentChallenge < challenges.length && (
              <Card variant="outlined" sx={{ mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    チャレンジ {currentChallenge + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {challenges[currentChallenge].title}
                  </Typography>
                  <Typography variant="caption">
                    {challenges[currentChallenge].description}
                  </Typography>
                  {successCount > currentChallenge && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                      💡 ヒント: {challenges[currentChallenge].hint}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

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
              onChange={(_, value) => {
                setSpeed((value as number) / 1000);
                recordInteraction('drag');
              }}
              min={1}
              max={50}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}x`}
              sx={{ 
                mb: 2,
                '& .MuiSlider-track': {
                  height: isMobile ? 6 : 4
                },
                '& .MuiSlider-thumb': {
                  width: isMobile ? 24 : 20,
                  height: isMobile ? 24 : 20
                }
              }}
            />

            {/* 手動位置調整 */}
            <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
              点Pの位置を手動調整
            </Typography>
            <Slider
              value={pointPosition * 100}
              onChange={(_, value) => {
                setPointPosition((value as number) / 100);
                recordInteraction('drag');
              }}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
              sx={{ 
                mb: 2,
                '& .MuiSlider-track': {
                  height: isMobile ? 6 : 4
                },
                '& .MuiSlider-thumb': {
                  width: isMobile ? 24 : 20,
                  height: isMobile ? 24 : 20
                }
              }}
            />

            {/* 観察記録ボタン */}
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                const positionName = pointPosition < 0.25 ? '上辺' : 
                                   pointPosition < 0.5 ? '右辺' :
                                   pointPosition < 0.75 ? '下辺' : '左辺';
                recordObservation(`${positionName}での面積: ${currentArea.toFixed(1)}`);
              }}
              sx={{ mb: 2 }}
            >
              現在の観察を記録
            </Button>

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

            {/* 観察記録 */}
            {observations.length > 0 && (
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    📝 観察記録
                  </Typography>
                  {observations.map((obs, index) => (
                    <Typography key={index} variant="caption" display="block" sx={{ mb: 0.5 }}>
                      • {obs}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 発見したパターン */}
            {discoveredPatterns.size > 0 && (
              <Card variant="outlined" sx={{ mt: 2, bgcolor: 'success.light' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    🎯 発見したパターン
                  </Typography>
                  {discoveredPatterns.has('zero_area') && (
                    <Typography variant="caption" display="block">✓ 面積が0になる位置</Typography>
                  )}
                  {discoveredPatterns.has('max_area') && (
                    <Typography variant="caption" display="block">✓ 面積が最大になる位置</Typography>
                  )}
                  {discoveredPatterns.has('corners') && (
                    <Typography variant="caption" display="block">✓ 角での面積の特徴</Typography>
                  )}
                </CardContent>
              </Card>
            )}
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
              width={isMobile ? Math.min(350, window.innerWidth - 60) : 700}
              height={isMobile ? 200 : 250}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                display: 'block',
                margin: '0 auto',
                cursor: isDragging ? 'grabbing' : 'grab',
                maxWidth: '100%',
                touchAction: 'none' // タッチ操作の最適化
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onTouchStart={handleCanvasTouchStart}
              onTouchMove={handleCanvasTouchMove}
              onTouchEnd={handleCanvasTouchEnd}
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
          • <strong>ガイド付きモードで段階的に探索すると、パターンが見えてきます</strong><br/>
          • 観察を記録して、どこで面積が最大・最小になるか発見しましょう<br/>
          • 右側のグラフで、点Pの位置と面積の関係を視覚的に理解できます<br/>
          • この問題は高校入試でもよく出題される重要な概念です
        </Typography>
      </Paper>
    </Box>
  );
}

// 動く点Pの教材（MaterialWrapperでラップ）
function MovingPointP({ onClose }: { onClose: () => void }) {
  return (
    <MaterialWrapper
      materialId="moving-point-p"
      materialName="動く点Pの探索"
      showMetricsButton={true}
      showAssistant={true}
    >
      <MovingPointPContent onClose={onClose} />
    </MaterialWrapper>
  );
}

export default MovingPointP;