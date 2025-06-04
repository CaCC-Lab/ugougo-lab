import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Button,
  Paper,
  LinearProgress,
  IconButton,
  ButtonGroup,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import { Close as CloseIcon, Refresh as RefreshIcon, PlayArrow as PlayIcon, Pause as PauseIcon } from '@mui/icons-material';

// 原子・分子の構造シミュレーション
function AtomMoleculeSimulation({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [selectedMolecule, setSelectedMolecule] = useState('H2O');
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState('H2O');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [electrons, setElectrons] = useState<Array<{ x: number; y: number; angle: number; orbit: number }>>([]);

  // 分子データ
  const molecules = {
    H2O: {
      name: '水分子',
      atoms: [
        { element: 'O', x: 200, y: 150, color: '#FF0000', radius: 20 },
        { element: 'H', x: 170, y: 120, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: 230, y: 120, color: '#FFFFFF', radius: 12 }
      ],
      bonds: [
        { from: 0, to: 1, type: 'single' },
        { from: 0, to: 2, type: 'single' }
      ],
      formula: 'H₂O',
      description: '水分子は酸素原子1個と水素原子2個からなります'
    },
    CO2: {
      name: '二酸化炭素分子',
      atoms: [
        { element: 'C', x: 200, y: 150, color: '#000000', radius: 18 },
        { element: 'O', x: 160, y: 150, color: '#FF0000', radius: 16 },
        { element: 'O', x: 240, y: 150, color: '#FF0000', radius: 16 }
      ],
      bonds: [
        { from: 0, to: 1, type: 'double' },
        { from: 0, to: 2, type: 'double' }
      ],
      formula: 'CO₂',
      description: '二酸化炭素分子は炭素原子1個と酸素原子2個からなります'
    },
    CH4: {
      name: 'メタン分子',
      atoms: [
        { element: 'C', x: 200, y: 150, color: '#000000', radius: 18 },
        { element: 'H', x: 180, y: 130, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: 220, y: 130, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: 180, y: 170, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: 220, y: 170, color: '#FFFFFF', radius: 12 }
      ],
      bonds: [
        { from: 0, to: 1, type: 'single' },
        { from: 0, to: 2, type: 'single' },
        { from: 0, to: 3, type: 'single' },
        { from: 0, to: 4, type: 'single' }
      ],
      formula: 'CH₄',
      description: 'メタン分子は炭素原子1個と水素原子4個からなります'
    },
    O2: {
      name: '酸素分子',
      atoms: [
        { element: 'O', x: 180, y: 150, color: '#FF0000', radius: 18 },
        { element: 'O', x: 220, y: 150, color: '#FF0000', radius: 18 }
      ],
      bonds: [
        { from: 0, to: 1, type: 'double' }
      ],
      formula: 'O₂',
      description: '酸素分子は酸素原子2個からなります'
    }
  };

  // キャンバスに分子を描画
  const drawMolecule = (moleculeName: keyof typeof molecules) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const molecule = molecules[moleculeName];
    
    // 結合を描画
    molecule.bonds.forEach(bond => {
      const atomFrom = molecule.atoms[bond.from];
      const atomTo = molecule.atoms[bond.to];
      
      ctx.strokeStyle = '#666';
      ctx.lineWidth = bond.type === 'double' ? 4 : 2;
      
      if (bond.type === 'double') {
        // 二重結合
        const dx = atomTo.x - atomFrom.x;
        const dy = atomTo.y - atomFrom.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / length;
        const unitY = dy / length;
        const perpX = -unitY * 3;
        const perpY = unitX * 3;
        
        // 1本目の線
        ctx.beginPath();
        ctx.moveTo(atomFrom.x + perpX, atomFrom.y + perpY);
        ctx.lineTo(atomTo.x + perpX, atomTo.y + perpY);
        ctx.stroke();
        
        // 2本目の線
        ctx.beginPath();
        ctx.moveTo(atomFrom.x - perpX, atomFrom.y - perpY);
        ctx.lineTo(atomTo.x - perpX, atomTo.y - perpY);
        ctx.stroke();
      } else {
        // 単結合
        ctx.beginPath();
        ctx.moveTo(atomFrom.x, atomFrom.y);
        ctx.lineTo(atomTo.x, atomTo.y);
        ctx.stroke();
      }
    });
    
    // 原子を描画
    molecule.atoms.forEach((atom, index) => {
      // 原子の円
      ctx.fillStyle = atom.color;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(atom.x, atom.y, atom.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // 原子記号
      ctx.fillStyle = atom.color === '#FFFFFF' ? '#000000' : '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(atom.element, atom.x, atom.y);
      
      // アニメーション中の電子軌道
      if (isAnimating && atom.element !== 'H') {
        const electronCount = atom.element === 'O' ? 8 : atom.element === 'C' ? 6 : 2;
        const orbits = atom.element === 'O' ? [15, 25] : [15];
        
        orbits.forEach((orbitRadius, orbitIndex) => {
          // 軌道を描画
          ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(atom.x, atom.y, atom.radius + orbitRadius, 0, 2 * Math.PI);
          ctx.stroke();
          
          // この軌道の電子を描画
          const electronsInOrbit = orbitIndex === 0 ? 2 : Math.min(electronCount - 2, 6);
          for (let i = 0; i < electronsInOrbit; i++) {
            const electronAngle = (Date.now() / 1000 + i * (2 * Math.PI / electronsInOrbit)) % (2 * Math.PI);
            const electronX = atom.x + (atom.radius + orbitRadius) * Math.cos(electronAngle);
            const electronY = atom.y + (atom.radius + orbitRadius) * Math.sin(electronAngle);
            
            ctx.fillStyle = '#0000FF';
            ctx.beginPath();
            ctx.arc(electronX, electronY, 3, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
      }
    });
  };

  // アニメーションループ
  const animate = () => {
    if (isAnimating) {
      drawMolecule(selectedMolecule as keyof typeof molecules);
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // アニメーション開始/停止
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  // クイズ生成
  const generateQuiz = () => {
    const moleculeNames = Object.keys(molecules);
    const randomMolecule = moleculeNames[Math.floor(Math.random() * moleculeNames.length)];
    setQuizQuestion(randomMolecule);
    setUserAnswer('');
  };

  // クイズ回答チェック
  const checkAnswer = (answer: string) => {
    setUserAnswer(answer);
    const correct = molecules[quizQuestion as keyof typeof molecules].formula;
    if (answer === correct) {
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
    setIsAnimating(false);
    setQuizMode(false);
    setUserAnswer('');
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
  }, [isAnimating, selectedMolecule]);

  useEffect(() => {
    drawMolecule(selectedMolecule as keyof typeof molecules);
  }, [selectedMolecule]);

  // クイズ選択肢
  const generateChoices = () => {
    const correct = molecules[quizQuestion as keyof typeof molecules].formula;
    const allFormulas = Object.values(molecules).map(m => m.formula);
    const choices = [correct];
    
    allFormulas.forEach(formula => {
      if (formula !== correct && choices.length < 4) {
        choices.push(formula);
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
          原子・分子構造シミュレーション
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
        原子の結合や電子の動きを視覚的に理解しよう！
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={quizMode ? `クイズ: ${molecules[quizQuestion as keyof typeof molecules].name}` : `表示中: ${molecules[selectedMolecule as keyof typeof molecules].name}`}
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
              >
                学習モード
              </Button>
              <Button
                variant={quizMode ? 'contained' : 'outlined'}
                onClick={() => {
                  setQuizMode(true);
                  generateQuiz();
                }}
              >
                クイズモード
              </Button>
            </ButtonGroup>

            {!quizMode && (
              <>
                {/* 分子選択 */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>分子を選択</InputLabel>
                  <Select
                    value={selectedMolecule}
                    onChange={(e) => setSelectedMolecule(e.target.value)}
                  >
                    {Object.entries(molecules).map(([key, molecule]) => (
                      <MenuItem key={key} value={key}>
                        {molecule.name} ({molecule.formula})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* アニメーションコントロール */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={isAnimating ? <PauseIcon /> : <PlayIcon />}
                  onClick={toggleAnimation}
                  sx={{ mb: 2 }}
                >
                  {isAnimating ? '電子軌道を停止' : '電子軌道を表示'}
                </Button>
              </>
            )}

            {/* 分子情報 */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {quizMode ? molecules[quizQuestion as keyof typeof molecules].name : molecules[selectedMolecule as keyof typeof molecules].name}
                </Typography>
                <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                  {quizMode ? '?' : molecules[selectedMolecule as keyof typeof molecules].formula}
                </Typography>
                <Typography variant="body2">
                  {quizMode ? '分子式を答えてください' : molecules[selectedMolecule as keyof typeof molecules].description}
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* 右側：分子表示エリア */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, height: '400px', position: 'relative' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              分子構造
            </Typography>
            
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                display: 'block',
                margin: '0 auto'
              }}
            />

            {/* クイズモードの選択肢 */}
            {quizMode && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  この分子の化学式は？
                </Typography>
                
                <Grid container spacing={2} justifyContent="center">
                  {choices.map((choice) => (
                    <Grid item key={choice}>
                      <Button
                        variant={userAnswer === choice ? (choice === molecules[quizQuestion as keyof typeof molecules].formula ? 'contained' : 'outlined') : 'outlined'}
                        color={userAnswer === choice ? (choice === molecules[quizQuestion as keyof typeof molecules].formula ? 'success' : 'error') : 'primary'}
                        onClick={() => checkAnswer(choice)}
                        disabled={userAnswer !== ''}
                        sx={{ 
                          minWidth: 80, 
                          minHeight: 50,
                          fontSize: '1.1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {choice}
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                {userAnswer && (
                  <Typography 
                    variant="h6" 
                    color={userAnswer === molecules[quizQuestion as keyof typeof molecules].formula ? 'success.main' : 'error.main'}
                    sx={{ mt: 2, fontWeight: 'bold' }}
                  >
                    {userAnswer === molecules[quizQuestion as keyof typeof molecules].formula ? 
                      '🎉 正解！分子構造を正しく理解できました！' : 
                      '❌ 間違いです。原子の数と種類をもう一度確認してみましょう！'
                    }
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e8' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🧪 原子・分子のポイント：
        </Typography>
        <Typography variant="body2">
          • 原子は元素記号で表され、それぞれ異なる色と大きさを持ちます<br/>
          • 結合線は原子同士のつながりを表します（単結合・二重結合）<br/>
          • 電子は原子核の周りを軌道に沿って回転しています<br/>
          • 化学式は分子に含まれる原子の種類と数を表します
        </Typography>
      </Paper>
    </Box>
  );
}

export default AtomMoleculeSimulation;