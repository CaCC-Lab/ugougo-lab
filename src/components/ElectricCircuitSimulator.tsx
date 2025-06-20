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
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Slider,
  FormControlLabel,
  Switch as MUISwitch
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  FlashOn as PowerIcon,
  Lightbulb as BulbIcon,
  Battery0Bar as BatteryIcon,
  ToggleOn as SwitchIcon,
  Shuffle as WireIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

// 部品の種類
type ComponentType = 'battery' | 'bulb' | 'switch' | 'wire';

// 回路部品の情報
interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270度
  isOn?: boolean; // スイッチ用
  brightness?: number; // 電球用
  connections: { [key: string]: string | null }; // 接続ポイント: 接続先のID
}

// 接続ポイントの定義
const connectionPoints: { [key in ComponentType]: { [key: string]: { x: number; y: number } } } = {
  battery: {
    positive: { x: 50, y: 25 },
    negative: { x: 0, y: 25 }
  },
  bulb: {
    top: { x: 25, y: 0 },
    bottom: { x: 25, y: 50 }
  },
  switch: {
    left: { x: 0, y: 25 },
    right: { x: 50, y: 25 }
  },
  wire: {
    start: { x: 0, y: 25 },
    end: { x: 50, y: 25 }
  }
};

// 電気回路シミュレーター（内部コンポーネント）
function ElectricCircuitSimulatorContent({ onClose }: { onClose: () => void }) {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [circuitMode, setCircuitMode] = useState<'series' | 'parallel' | 'free'>('free');
  const [isCircuitComplete, setIsCircuitComplete] = useState(false);
  const [showCurrent, setShowCurrent] = useState(true);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [batteryCount, setBatteryCount] = useState(1);
  
  const canvasSize = 600;
  const gridSize = 50;
  
  // クイズ問題
  const quizQuestions = [
    {
      question: '豆電球を1つ光らせるには、どんな回路を作ればいいかな？',
      requiredComponents: { battery: 1, bulb: 1, wire: 2 },
      checkFunction: (comps: CircuitComponent[]) => {
        // 簡単な直列回路のチェック
        const batteries = comps.filter(c => c.type === 'battery');
        const bulbs = comps.filter(c => c.type === 'bulb');
        return batteries.length === 1 && bulbs.length === 1 && bulbs[0].brightness! > 0;
      }
    },
    {
      question: '2つの豆電球を同じ明るさで光らせよう！',
      requiredComponents: { battery: 1, bulb: 2, wire: 4 },
      checkFunction: (comps: CircuitComponent[]) => {
        const bulbs = comps.filter(c => c.type === 'bulb');
        return bulbs.length === 2 && 
               bulbs[0].brightness! > 0 && 
               Math.abs(bulbs[0].brightness! - bulbs[1].brightness!) < 0.1;
      }
    },
    {
      question: 'スイッチを使って、豆電球をつけたり消したりできる回路を作ろう！',
      requiredComponents: { battery: 1, bulb: 1, switch: 1, wire: 3 },
      checkFunction: (comps: CircuitComponent[]) => {
        const switches = comps.filter(c => c.type === 'switch');
        const bulbs = comps.filter(c => c.type === 'bulb');
        return switches.length === 1 && bulbs.length === 1;
      }
    }
  ];
  
  // 部品を追加
  const addComponent = (type: ComponentType) => {
    const newComponent: CircuitComponent = {
      id: `${type}-${Date.now()}`,
      type,
      x: Math.floor(Math.random() * 10) * gridSize + 50,
      y: Math.floor(Math.random() * 10) * gridSize + 50,
      rotation: 0,
      isOn: type === 'switch' ? true : undefined,
      brightness: type === 'bulb' ? 0 : undefined,
      connections: {}
    };
    
    // 接続ポイントを初期化
    Object.keys(connectionPoints[type]).forEach(point => {
      newComponent.connections[point] = null;
    });
    
    setComponents(prev => [...prev, newComponent]);
    recordInteraction('click');
  };
  
  // 部品を削除
  const removeComponent = (id: string) => {
    setComponents(prev => {
      // 削除する部品への接続を解除
      const updatedComps = prev.map(comp => {
        const newConnections = { ...comp.connections };
        Object.keys(newConnections).forEach(point => {
          if (newConnections[point] === id) {
            newConnections[point] = null;
          }
        });
        return { ...comp, connections: newConnections };
      });
      
      // 部品を削除
      return updatedComps.filter(comp => comp.id !== id);
    });
  };
  
  // 部品を回転
  const rotateComponent = (id: string) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id 
        ? { ...comp, rotation: (comp.rotation + 90) % 360 }
        : comp
    ));
  };
  
  // スイッチの切り替え
  const toggleSwitch = (id: string) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id && comp.type === 'switch'
        ? { ...comp, isOn: !comp.isOn }
        : comp
    ));
    recordInteraction('click');
  };
  
  // 回路の解析と電流計算
  const analyzeCircuit = () => {
    // 簡略化した回路解析
    // 実際の実装では、より複雑な電気回路の解析アルゴリズムが必要
    
    const batteries = components.filter(c => c.type === 'battery');
    const bulbs = components.filter(c => c.type === 'bulb');
    const switches = components.filter(c => c.type === 'switch');
    
    // すべての電球を消灯
    setComponents(prev => prev.map(comp => 
      comp.type === 'bulb' ? { ...comp, brightness: 0 } : comp
    ));
    
    // 電池がない場合は終了
    if (batteries.length === 0) {
      setIsCircuitComplete(false);
      return;
    }
    
    // スイッチがOFFの場合は回路が切断
    const allSwitchesOn = switches.every(s => s.isOn);
    if (switches.length > 0 && !allSwitchesOn) {
      setIsCircuitComplete(false);
      return;
    }
    
    // 簡易的な明るさ計算（実際はもっと複雑）
    if (bulbs.length > 0) {
      const brightnessPerBulb = circuitMode === 'parallel' 
        ? 1.0 
        : 1.0 / bulbs.length;
      
      setComponents(prev => prev.map(comp => 
        comp.type === 'bulb' 
          ? { ...comp, brightness: brightnessPerBulb * batteryCount }
          : comp
      ));
      
      setIsCircuitComplete(true);
    } else {
      setIsCircuitComplete(false);
    }
  };
  
  // キャンバスに描画
  const drawCircuit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // グリッドを描画
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvasSize; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasSize);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasSize, i);
      ctx.stroke();
    }
    
    // 部品を描画
    components.forEach(component => {
      ctx.save();
      ctx.translate(component.x, component.y);
      ctx.rotate((component.rotation * Math.PI) / 180);
      
      switch (component.type) {
        case 'battery':
          drawBattery(ctx);
          break;
        case 'bulb':
          drawBulb(ctx, component.brightness || 0);
          break;
        case 'switch':
          drawSwitch(ctx, component.isOn || false);
          break;
        case 'wire':
          drawWire(ctx);
          break;
      }
      
      ctx.restore();
    });
    
    // 電流のアニメーション
    if (showCurrent && isCircuitComplete) {
      drawCurrentFlow(ctx);
    }
  };
  
  // 電池を描画
  const drawBattery = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    
    // プラス極
    ctx.beginPath();
    ctx.moveTo(35, 15);
    ctx.lineTo(35, 35);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(30, 10);
    ctx.lineTo(30, 40);
    ctx.stroke();
    
    // マイナス極
    ctx.beginPath();
    ctx.moveTo(20, 10);
    ctx.lineTo(20, 40);
    ctx.stroke();
    
    // 記号
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('+', 40, 28);
    ctx.fillText('-', 5, 28);
    
    // 電池の本体
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(15, 15, 20, 20);
  };
  
  // 豆電球を描画
  const drawBulb = (ctx: CanvasRenderingContext2D, brightness: number) => {
    // フィラメント
    ctx.strokeStyle = brightness > 0 ? '#FFA500' : '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(25, 15);
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(20 + (i % 2) * 10, 20 + i * 5);
    }
    ctx.lineTo(25, 35);
    ctx.stroke();
    
    // 電球のガラス
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(25, 25, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    // 光の表現
    if (brightness > 0) {
      ctx.fillStyle = `rgba(255, 255, 0, ${brightness * 0.3})`;
      ctx.beginPath();
      ctx.arc(25, 25, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // ソケット
    ctx.fillStyle = '#666';
    ctx.fillRect(20, 35, 10, 10);
  };
  
  // スイッチを描画
  const drawSwitch = (ctx: CanvasRenderingContext2D, isOn: boolean) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    
    // 接点
    ctx.beginPath();
    ctx.arc(10, 25, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(40, 25, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // スイッチのレバー
    ctx.beginPath();
    ctx.moveTo(10, 25);
    if (isOn) {
      ctx.lineTo(40, 25);
    } else {
      ctx.lineTo(25, 15);
    }
    ctx.stroke();
  };
  
  // 導線を描画
  const drawWire = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.lineTo(50, 25);
    ctx.stroke();
  };
  
  // 電流の流れを描画
  const drawCurrentFlow = (ctx: CanvasRenderingContext2D) => {
    // アニメーション用の電流表示（簡略版）
    const time = Date.now() / 1000;
    
    ctx.strokeStyle = '#00BCD4';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -time * 10;
    
    // 簡単な電流パスの例（実際はもっと複雑）
    components.forEach(comp => {
      if (comp.type === 'wire' || (comp.type === 'switch' && comp.isOn)) {
        ctx.beginPath();
        ctx.moveTo(comp.x, comp.y);
        ctx.lineTo(comp.x + 50, comp.y);
        ctx.stroke();
      }
    });
    
    ctx.setLineDash([]);
  };
  
  // プリセット回路を作成
  const createPresetCircuit = (mode: 'series' | 'parallel') => {
    setComponents([]);
    
    if (mode === 'series') {
      // 直列回路
      const battery: CircuitComponent = {
        id: 'battery-1',
        type: 'battery',
        x: 100,
        y: 200,
        rotation: 0,
        connections: { positive: null, negative: null }
      };
      
      const bulb1: CircuitComponent = {
        id: 'bulb-1',
        type: 'bulb',
        x: 300,
        y: 200,
        rotation: 0,
        brightness: 0,
        connections: { top: null, bottom: null }
      };
      
      const bulb2: CircuitComponent = {
        id: 'bulb-2',
        type: 'bulb',
        x: 300,
        y: 400,
        rotation: 0,
        brightness: 0,
        connections: { top: null, bottom: null }
      };
      
      setComponents([battery, bulb1, bulb2]);
    } else {
      // 並列回路
      const battery: CircuitComponent = {
        id: 'battery-1',
        type: 'battery',
        x: 100,
        y: 300,
        rotation: 0,
        connections: { positive: null, negative: null }
      };
      
      const bulb1: CircuitComponent = {
        id: 'bulb-1',
        type: 'bulb',
        x: 300,
        y: 200,
        rotation: 0,
        brightness: 0,
        connections: { top: null, bottom: null }
      };
      
      const bulb2: CircuitComponent = {
        id: 'bulb-2',
        type: 'bulb',
        x: 300,
        y: 400,
        rotation: 0,
        brightness: 0,
        connections: { top: null, bottom: null }
      };
      
      setComponents([battery, bulb1, bulb2]);
    }
  };
  
  // クイズの答え合わせ
  const checkQuizAnswer = () => {
    const quiz = quizQuestions[currentQuiz];
    const isCorrect = quiz.checkFunction(components);
    
    // 学習履歴に記録
    recordAnswer(isCorrect, {
      problem: quiz.question,
      userAnswer: isCorrect ? '正しい回路を作成' : '不正解の回路',
      correctAnswer: '正しい回路構成'
    });
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setProgress(prev => Math.min(prev + 33.33, 100));
      
      if (currentQuiz < quizQuestions.length - 1) {
        setCurrentQuiz(prev => prev + 1);
        setComponents([]);
      } else {
        setQuizMode(false);
      }
    }
    setAttempts(prev => prev + 1);
  };
  
  // リセット
  const handleReset = () => {
    setComponents([]);
    setSelectedComponent(null);
    setIsCircuitComplete(false);
    setScore(0);
    setAttempts(0);
    setProgress(0);
    setCurrentQuiz(0);
  };
  
  // エフェクト
  useEffect(() => {
    drawCircuit();
  }, [components, showCurrent, isCircuitComplete]);
  
  useEffect(() => {
    analyzeCircuit();
  }, [components, circuitMode, batteryCount]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (showCurrent && isCircuitComplete) {
        drawCircuit();
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [showCurrent, isCircuitComplete]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          電気回路シミュレーター
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
        電池、豆電球、スイッチを使って電気回路を作ろう！部品をドラッグして配置できます。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={isCircuitComplete ? '回路完成！' : '回路未完成'}
          color={isCircuitComplete ? 'success' : 'default'} 
          icon={<PowerIcon />}
          size="medium"
        />
        {quizMode && (
          <>
            <Chip 
              label={`問題 ${currentQuiz + 1}/${quizQuestions.length}`} 
              color="primary" 
              size="medium"
            />
            <Chip 
              label={`得点: ${score}`} 
              color="secondary" 
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
            <Typography variant="caption">{Math.round(progress)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：部品とコントロール */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {quizMode ? 'クイズ' : '部品ボックス'}
            </Typography>
            
            {quizMode ? (
              <>
                <Card variant="outlined" sx={{ mb: 2, bgcolor: '#e3f2fd' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      問題 {currentQuiz + 1}
                    </Typography>
                    <Typography variant="body1">
                      {quizQuestions[currentQuiz].question}
                    </Typography>
                  </CardContent>
                </Card>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  必要な部品：
                  {Object.entries(quizQuestions[currentQuiz].requiredComponents).map(([type, count]) => (
                    <div key={type}>• {type}: {count}個</div>
                  ))}
                </Alert>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={checkQuizAnswer}
                  sx={{ mb: 2 }}
                >
                  答え合わせ
                </Button>
              </>
            ) : (
              <>
                {/* 部品追加ボタン */}
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid size={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<BatteryIcon />}
                      onClick={() => addComponent('battery')}
                    >
                      電池
                    </Button>
                  </Grid>
                  <Grid size={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<BulbIcon />}
                      onClick={() => addComponent('bulb')}
                    >
                      豆電球
                    </Button>
                  </Grid>
                  <Grid size={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<SwitchIcon />}
                      onClick={() => addComponent('switch')}
                    >
                      スイッチ
                    </Button>
                  </Grid>
                  <Grid size={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<WireIcon />}
                      onClick={() => addComponent('wire')}
                    >
                      導線
                    </Button>
                  </Grid>
                </Grid>
                
                {/* 回路モード */}
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  回路の種類
                </Typography>
                <ToggleButtonGroup
                  value={circuitMode}
                  exclusive
                  onChange={(_, value) => value && setCircuitMode(value)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="free">
                    自由
                  </ToggleButton>
                  <ToggleButton value="series">
                    直列
                  </ToggleButton>
                  <ToggleButton value="parallel">
                    並列
                  </ToggleButton>
                </ToggleButtonGroup>
                
                {circuitMode !== 'free' && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => createPresetCircuit(circuitMode)}
                    sx={{ mb: 2 }}
                  >
                    {circuitMode === 'series' ? '直列' : '並列'}回路を作る
                  </Button>
                )}
                
                {/* 電池の数 */}
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  電池の数: {batteryCount}個
                </Typography>
                <Slider
                  value={batteryCount}
                  onChange={(_, value) => setBatteryCount(value as number)}
                  min={1}
                  max={3}
                  marks
                  sx={{ mb: 2 }}
                />
                
                {/* 表示設定 */}
                <FormControlLabel
                  control={
                    <MUISwitch 
                      checked={showCurrent} 
                      onChange={(e) => setShowCurrent(e.target.checked)} 
                    />
                  }
                  label="電流の流れを表示"
                />
              </>
            )}
            
            {/* モード切替 */}
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setQuizMode(!quizMode);
                handleReset();
              }}
              sx={{ mt: 2 }}
            >
              {quizMode ? '自由モードへ' : 'クイズモードへ'}
            </Button>
          </Paper>
          
          {/* 使い方 */}
          <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HelpIcon sx={{ mr: 1, fontSize: 20 }} />
              使い方
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 部品をクリックして選択<br/>
              • Rキーで回転<br/>
              • Deleteキーで削除<br/>
              • スイッチはクリックでON/OFF<br/>
              • 導線で部品をつなごう
            </Typography>
          </Paper>
        </Grid>

        {/* 右側：回路キャンバス */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              回路を組み立てよう
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                style={{
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa',
                  cursor: 'crosshair'
                }}
                onClick={(e) => {
                  const rect = canvasRef.current!.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  // クリック位置の部品を選択
                  const clickedComponent = components.find(comp => 
                    x >= comp.x - 25 && x <= comp.x + 25 &&
                    y >= comp.y - 25 && y <= comp.y + 25
                  );
                  
                  if (clickedComponent) {
                    if (clickedComponent.type === 'switch') {
                      toggleSwitch(clickedComponent.id);
                    } else {
                      setSelectedComponent(clickedComponent.id);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (selectedComponent) {
                    if (e.key === 'r' || e.key === 'R') {
                      rotateComponent(selectedComponent);
                    } else if (e.key === 'Delete') {
                      removeComponent(selectedComponent);
                      setSelectedComponent(null);
                    }
                  }
                }}
                tabIndex={0}
              />
            </Box>
            
            {/* 回路の説明 */}
            {isCircuitComplete && (
              <Alert severity="success" sx={{ mt: 2 }}>
                回路が完成しました！豆電球が光っています。
                {circuitMode === 'series' && '直列回路では、電流が一つの道を通ります。'}
                {circuitMode === 'parallel' && '並列回路では、電流が分かれて流れます。'}
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e9' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          ⚡ 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 電気は電池のプラス極からマイナス極へ流れます<br/>
          • 直列回路：豆電球を一列につなぐと、明るさが暗くなります<br/>
          • 並列回路：豆電球を枝分かれしてつなぐと、同じ明るさで光ります<br/>
          • スイッチを切ると電気の流れが止まります
        </Typography>
      </Paper>
    </Box>
  );
}

// 電気回路シミュレーター（MaterialWrapperでラップ）
function ElectricCircuitSimulator({ onClose }: { onClose: () => void }) {
  return (
    <MaterialWrapper
      materialId="electric-circuit"
      materialName="電気回路シミュレーター"
      showMetricsButton={true}
      showAssistant={true}
    >
      <ElectricCircuitSimulatorContent onClose={onClose} />
    </MaterialWrapper>
  );
}

export default ElectricCircuitSimulator;