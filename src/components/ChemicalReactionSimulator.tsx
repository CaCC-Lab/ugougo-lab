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
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  Science as ScienceIcon,
  Whatshot as FireIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

// 原子の種類と色
const atomTypes = {
  H: { name: '水素', color: '#FFFFFF', radius: 20 },
  O: { name: '酸素', color: '#FF0000', radius: 25 },
  C: { name: '炭素', color: '#333333', radius: 30 },
  N: { name: '窒素', color: '#0000FF', radius: 25 },
  Na: { name: 'ナトリウム', color: '#FFA500', radius: 35 },
  Cl: { name: '塩素', color: '#00FF00', radius: 30 }
};

// 分子の結合情報
interface Bond {
  atom1: number;
  atom2: number;
  type: 'single' | 'double' | 'triple';
}

// 分子の情報
interface Molecule {
  id: string;
  atoms: { type: string; x: number; y: number }[];
  bonds: Bond[];
  formula: string;
}

// 化学反応の種類
type ReactionType = 'combustion' | 'neutralization' | 'oxidation' | 'synthesis';

// プリセット反応
const presetReactions = {
  combustion: {
    name: '燃焼反応',
    equation: '2H₂ + O₂ → 2H₂O',
    reactants: [
      { formula: 'H₂', count: 2 },
      { formula: 'O₂', count: 1 }
    ],
    products: [
      { formula: 'H₂O', count: 2 }
    ],
    heat: 'exothermic'
  },
  neutralization: {
    name: '中和反応',
    equation: 'HCl + NaOH → NaCl + H₂O',
    reactants: [
      { formula: 'HCl', count: 1 },
      { formula: 'NaOH', count: 1 }
    ],
    products: [
      { formula: 'NaCl', count: 1 },
      { formula: 'H₂O', count: 1 }
    ],
    heat: 'exothermic'
  },
  oxidation: {
    name: '酸化反応',
    equation: '2C + O₂ → 2CO',
    reactants: [
      { formula: 'C', count: 2 },
      { formula: 'O₂', count: 1 }
    ],
    products: [
      { formula: 'CO', count: 2 }
    ],
    heat: 'exothermic'
  },
  synthesis: {
    name: '化合反応',
    equation: 'N₂ + 3H₂ → 2NH₃',
    reactants: [
      { formula: 'N₂', count: 1 },
      { formula: 'H₂', count: 3 }
    ],
    products: [
      { formula: 'NH₃', count: 2 }
    ],
    heat: 'exothermic'
  }
};

// 化学反応シミュレーター
function ChemicalReactionSimulator({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reactionType, setReactionType] = useState<ReactionType>('combustion');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [customEquation, setCustomEquation] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [atomCounts, setAtomCounts] = useState<{ [key: string]: { before: number; after: number } }>({});
  const [isBalanced, setIsBalanced] = useState(true);
  const [showMolecularView, setShowMolecularView] = useState(true);
  const [showEquation, setShowEquation] = useState(true);
  const [showAtomCount, setShowAtomCount] = useState(true);
  
  // クイズモード
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState({ reactant1: '', reactant2: '', product1: '', product2: '' });
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const canvasSize = 600;
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  
  // 分子を描画する位置を計算
  const calculateMoleculePositions = (molecules: Molecule[], startX: number, startY: number, spacing: number) => {
    const positions: { x: number; y: number }[] = [];
    let currentX = startX;
    
    molecules.forEach((molecule, index) => {
      positions.push({ x: currentX, y: startY });
      currentX += spacing;
    });
    
    return positions;
  };
  
  // 分子を作成
  const createMolecule = (formula: string): Molecule => {
    const id = `${formula}-${Date.now()}-${Math.random()}`;
    
    switch (formula) {
      case 'H₂':
      case 'H2':
        return {
          id,
          formula: 'H₂',
          atoms: [
            { type: 'H', x: -15, y: 0 },
            { type: 'H', x: 15, y: 0 }
          ],
          bonds: [{ atom1: 0, atom2: 1, type: 'single' }]
        };
        
      case 'O₂':
      case 'O2':
        return {
          id,
          formula: 'O₂',
          atoms: [
            { type: 'O', x: -20, y: 0 },
            { type: 'O', x: 20, y: 0 }
          ],
          bonds: [{ atom1: 0, atom2: 1, type: 'double' }]
        };
        
      case 'H₂O':
      case 'H2O':
        return {
          id,
          formula: 'H₂O',
          atoms: [
            { type: 'O', x: 0, y: 0 },
            { type: 'H', x: -30, y: 20 },
            { type: 'H', x: 30, y: 20 }
          ],
          bonds: [
            { atom1: 0, atom2: 1, type: 'single' },
            { atom1: 0, atom2: 2, type: 'single' }
          ]
        };
        
      case 'CO':
        return {
          id,
          formula: 'CO',
          atoms: [
            { type: 'C', x: -20, y: 0 },
            { type: 'O', x: 20, y: 0 }
          ],
          bonds: [{ atom1: 0, atom2: 1, type: 'triple' }]
        };
        
      case 'CO₂':
      case 'CO2':
        return {
          id,
          formula: 'CO₂',
          atoms: [
            { type: 'C', x: 0, y: 0 },
            { type: 'O', x: -40, y: 0 },
            { type: 'O', x: 40, y: 0 }
          ],
          bonds: [
            { atom1: 0, atom2: 1, type: 'double' },
            { atom1: 0, atom2: 2, type: 'double' }
          ]
        };
        
      case 'HCl':
        return {
          id,
          formula: 'HCl',
          atoms: [
            { type: 'H', x: -20, y: 0 },
            { type: 'Cl', x: 20, y: 0 }
          ],
          bonds: [{ atom1: 0, atom2: 1, type: 'single' }]
        };
        
      case 'NaOH':
        return {
          id,
          formula: 'NaOH',
          atoms: [
            { type: 'Na', x: -40, y: 0 },
            { type: 'O', x: 0, y: 0 },
            { type: 'H', x: 40, y: 0 }
          ],
          bonds: [
            { atom1: 0, atom2: 1, type: 'single' },
            { atom1: 1, atom2: 2, type: 'single' }
          ]
        };
        
      case 'NaCl':
        return {
          id,
          formula: 'NaCl',
          atoms: [
            { type: 'Na', x: -25, y: 0 },
            { type: 'Cl', x: 25, y: 0 }
          ],
          bonds: [{ atom1: 0, atom2: 1, type: 'single' }]
        };
        
      case 'NH₃':
      case 'NH3':
        return {
          id,
          formula: 'NH₃',
          atoms: [
            { type: 'N', x: 0, y: -10 },
            { type: 'H', x: -30, y: 20 },
            { type: 'H', x: 0, y: 30 },
            { type: 'H', x: 30, y: 20 }
          ],
          bonds: [
            { atom1: 0, atom2: 1, type: 'single' },
            { atom1: 0, atom2: 2, type: 'single' },
            { atom1: 0, atom2: 3, type: 'single' }
          ]
        };
        
      case 'N₂':
      case 'N2':
        return {
          id,
          formula: 'N₂',
          atoms: [
            { type: 'N', x: -20, y: 0 },
            { type: 'N', x: 20, y: 0 }
          ],
          bonds: [{ atom1: 0, atom2: 1, type: 'triple' }]
        };
        
      case 'C':
        return {
          id,
          formula: 'C',
          atoms: [
            { type: 'C', x: 0, y: 0 }
          ],
          bonds: []
        };
        
      default:
        return {
          id,
          formula: formula,
          atoms: [],
          bonds: []
        };
    }
  };
  
  // 原子数をカウント
  const countAtoms = (molecules: Molecule[]) => {
    const counts: { [key: string]: number } = {};
    
    molecules.forEach(molecule => {
      molecule.atoms.forEach(atom => {
        counts[atom.type] = (counts[atom.type] || 0) + 1;
      });
    });
    
    return counts;
  };
  
  // 化学反応を描画
  const drawReaction = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasSize);
    gradient.addColorStop(0, '#F5F5F5');
    gradient.addColorStop(1, '#E0E0E0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // 反応の情報を取得
    const reaction = presetReactions[reactionType];
    
    // 反応物と生成物の分子を作成
    const reactantMolecules: Molecule[] = [];
    const productMolecules: Molecule[] = [];
    
    reaction.reactants.forEach(reactant => {
      for (let i = 0; i < reactant.count; i++) {
        reactantMolecules.push(createMolecule(reactant.formula));
      }
    });
    
    reaction.products.forEach(product => {
      for (let i = 0; i < product.count; i++) {
        productMolecules.push(createMolecule(product.formula));
      }
    });
    
    // 原子数をカウント
    const reactantAtoms = countAtoms(reactantMolecules);
    const productAtoms = countAtoms(productMolecules);
    setAtomCounts(
      Object.keys({ ...reactantAtoms, ...productAtoms }).reduce((acc, atom) => {
        acc[atom] = {
          before: reactantAtoms[atom] || 0,
          after: productAtoms[atom] || 0
        };
        return acc;
      }, {} as { [key: string]: { before: number; after: number } })
    );
    
    // 質量保存の法則をチェック
    const balanced = Object.keys({ ...reactantAtoms, ...productAtoms }).every(
      atom => reactantAtoms[atom] === productAtoms[atom]
    );
    setIsBalanced(balanced);
    
    // アニメーション進行度に応じて描画
    if (animationProgress < 0.5) {
      // 反応物を描画
      drawMolecules(ctx, reactantMolecules, 150, centerY, 100);
      
      // 矢印を描画（フェードイン）
      const arrowAlpha = animationProgress * 2;
      drawArrow(ctx, centerX - 50, centerY, centerX + 50, centerY, arrowAlpha);
    } else {
      // 生成物を描画（フェードイン）
      const productAlpha = (animationProgress - 0.5) * 2;
      drawMolecules(ctx, productMolecules, 450, centerY, 100, productAlpha);
      
      // 矢印を描画
      drawArrow(ctx, centerX - 50, centerY, centerX + 50, centerY, 1);
      
      // 反応熱の表現
      if (reaction.heat === 'exothermic' && animationProgress > 0.7) {
        drawHeatEffect(ctx, centerX, centerY - 50);
      }
    }
    
    // 化学式を表示
    if (showEquation) {
      ctx.fillStyle = '#333';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(reaction.equation, centerX, 50);
    }
    
    // 反応名を表示
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(reaction.name, centerX, 80);
  };
  
  // 分子を描画
  const drawMolecules = (
    ctx: CanvasRenderingContext2D,
    molecules: Molecule[],
    startX: number,
    startY: number,
    spacing: number,
    alpha: number = 1
  ) => {
    ctx.globalAlpha = alpha;
    
    molecules.forEach((molecule, index) => {
      const moleculeX = startX;
      const moleculeY = startY + (index - molecules.length / 2) * spacing;
      
      // 結合を描画
      molecule.bonds.forEach(bond => {
        const atom1 = molecule.atoms[bond.atom1];
        const atom2 = molecule.atoms[bond.atom2];
        
        ctx.strokeStyle = '#666';
        ctx.lineWidth = bond.type === 'single' ? 2 : bond.type === 'double' ? 4 : 6;
        
        ctx.beginPath();
        ctx.moveTo(moleculeX + atom1.x, moleculeY + atom1.y);
        ctx.lineTo(moleculeX + atom2.x, moleculeY + atom2.y);
        ctx.stroke();
      });
      
      // 原子を描画
      molecule.atoms.forEach(atom => {
        const atomInfo = atomTypes[atom.type];
        
        // 原子の円
        ctx.fillStyle = atomInfo.color;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(moleculeX + atom.x, moleculeY + atom.y, atomInfo.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 原子記号
        ctx.fillStyle = atom.type === 'C' ? '#FFF' : '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(atom.type, moleculeX + atom.x, moleculeY + atom.y);
      });
      
      // 分子式を表示
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(molecule.formula, moleculeX, moleculeY + 60);
    });
    
    ctx.globalAlpha = 1;
  };
  
  // 矢印を描画
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    alpha: number
  ) => {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    
    // 矢印の線
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, fromY);
    ctx.stroke();
    
    // 矢印の頭
    ctx.beginPath();
    ctx.moveTo(toX - 10, fromY - 10);
    ctx.lineTo(toX, fromY);
    ctx.lineTo(toX - 10, fromY + 10);
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  };
  
  // 熱の効果を描画
  const drawHeatEffect = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 熱', x, y);
  };
  
  // アニメーションを開始
  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationProgress(0);
    
    const animate = () => {
      setAnimationProgress(prev => {
        const next = prev + 0.02;
        if (next >= 1) {
          setIsAnimating(false);
          return 1;
        }
        return next;
      });
    };
    
    const interval = setInterval(() => {
      if (!isAnimating) {
        clearInterval(interval);
      } else {
        animate();
      }
    }, 50);
  };
  
  // リセット
  const handleReset = () => {
    setAnimationProgress(0);
    setIsAnimating(false);
    setCustomEquation('');
    setIsCustomMode(false);
    setQuizMode(false);
    setScore(0);
    setAttempts(0);
    setProgress(0);
  };
  
  // エフェクト
  useEffect(() => {
    drawReaction();
  }, [reactionType, animationProgress, showMolecularView, showEquation]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          化学反応シミュレーター
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
        化学反応を分子モデルで観察しよう！原子がどのように組み合わさるかを視覚的に理解できます。
      </Typography>

      {/* 状況表示 */}
      {quizMode && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip 
            label={`得点: ${score}`}
            icon={<ScienceIcon />}
            color="primary" 
            size="medium"
          />
          <Chip 
            label={`挑戦: ${attempts}`} 
            color="secondary" 
            size="medium"
          />
          <Chip 
            label={isBalanced ? '質量保存OK' : '質量保存NG'} 
            icon={isBalanced ? <CheckIcon /> : <ErrorIcon />}
            color={isBalanced ? 'success' : 'error'} 
            size="medium"
          />
        </Box>
      )}

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

      {/* 反応タイプ選択 */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={reactionType}
          exclusive
          onChange={(_, value) => {
            if (value) {
              setReactionType(value);
              setAnimationProgress(0);
            }
          }}
          fullWidth
        >
          <ToggleButton value="combustion">
            <FireIcon sx={{ mr: 1 }} />
            燃焼
          </ToggleButton>
          <ToggleButton value="neutralization">
            中和
          </ToggleButton>
          <ToggleButton value="oxidation">
            酸化
          </ToggleButton>
          <ToggleButton value="synthesis">
            化合
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：コントロール */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              反応の制御
            </Typography>
            
            {/* アニメーション制御 */}
            <Button
              variant="contained"
              fullWidth
              startIcon={isAnimating ? <PauseIcon /> : <PlayIcon />}
              onClick={() => {
                if (isAnimating) {
                  setIsAnimating(false);
                } else {
                  startAnimation();
                }
              }}
              sx={{ mb: 2 }}
            >
              {isAnimating ? 'アニメーション停止' : 'アニメーション開始'}
            </Button>
            
            {/* 進行状況 */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              反応の進行: {Math.round(animationProgress * 100)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={animationProgress * 100} 
              sx={{ mb: 3 }}
            />
            
            {/* 表示設定 */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              表示設定
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <Button
                size="small"
                variant={showMolecularView ? 'contained' : 'outlined'}
                onClick={() => setShowMolecularView(!showMolecularView)}
              >
                分子モデル
              </Button>
              <Button
                size="small"
                variant={showEquation ? 'contained' : 'outlined'}
                onClick={() => setShowEquation(!showEquation)}
              >
                化学反応式
              </Button>
              <Button
                size="small"
                variant={showAtomCount ? 'contained' : 'outlined'}
                onClick={() => setShowAtomCount(!showAtomCount)}
              >
                原子数カウント
              </Button>
            </Box>
            
            {/* カスタムモード */}
            {!quizMode && (
              <>
                <Divider sx={{ my: 2 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={isCustomMode}
                      onChange={(e) => setIsCustomMode(e.target.checked)}
                    />
                  }
                  label="カスタム反応式"
                />
                
                {isCustomMode && (
                  <TextField
                    fullWidth
                    label="化学反応式"
                    value={customEquation}
                    onChange={(e) => setCustomEquation(e.target.value)}
                    placeholder="例: 2H2 + O2 → 2H2O"
                    sx={{ mt: 2 }}
                  />
                )}
              </>
            )}
            
            {/* モード切替 */}
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setQuizMode(!quizMode)}
              sx={{ mt: 2 }}
            >
              {quizMode ? '通常モードへ' : 'クイズモードへ'}
            </Button>
          </Paper>
        </Grid>

        {/* 中央：反応表示 */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <ScienceIcon sx={{ mr: 1 }} />
              化学反応
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                style={{
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff'
                }}
              />
            </Box>
            
            {/* 反応の説明 */}
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {presetReactions[reactionType].name}の特徴
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {reactionType === 'combustion' && '物質が酸素と反応して燃える反応。熱と光を発生します。'}
                  {reactionType === 'neutralization' && '酸と塩基が反応して塩と水を生成する反応。'}
                  {reactionType === 'oxidation' && '物質が酸素と結合する反応。電子を失う反応でもあります。'}
                  {reactionType === 'synthesis' && '2つ以上の物質が結合して新しい物質を作る反応。'}
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* 右側：原子カウント */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              質量保存の法則
            </Typography>
            
            {showAtomCount && Object.keys(atomCounts).length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>原子</TableCell>
                      <TableCell align="center">反応前</TableCell>
                      <TableCell align="center">反応後</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(atomCounts).map(([atom, counts]) => (
                      <TableRow key={atom}>
                        <TableCell>
                          {atomTypes[atom]?.name || atom}
                        </TableCell>
                        <TableCell align="center">{counts.before}</TableCell>
                        <TableCell 
                          align="center"
                          sx={{ 
                            color: counts.before === counts.after ? 'success.main' : 'error.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {counts.after}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {isBalanced ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  ✓ 反応前後で原子の数が一致しています
                </Typography>
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  ✗ 原子の数が一致していません
                </Typography>
              </Alert>
            )}
            
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  質量保存の法則とは
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  化学反応の前後で、物質を構成する原子の種類と数は変わらない。
                  つまり、全体の質量は保存される。
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e9' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🧪 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 化学反応では原子の組み合わせが変わるだけで、原子そのものは生成も消滅もしません<br/>
          • 反応前後で各原子の数が等しくなるように係数を調整します（化学反応式の係数）<br/>
          • 多くの化学反応では熱の出入りがあります（発熱反応・吸熱反応）<br/>
          • 分子モデルを見ることで、どのように結合が切れて新しい結合ができるかがわかります
        </Typography>
      </Paper>
    </Box>
  );
}

export default ChemicalReactionSimulator;