/**
 * インタラクティブピザモジュール - つかうモード
 * ピザやケーキを使った分数の体験学習
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Pizza as PizzaIcon,
  Cake as CakeIcon,
  Help as HelpIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface InteractivePizzaModuleProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface PizzaScenario {
  id: string;
  title: string;
  description: string;
  totalPieces: number;
  targetPieces: number;
  icon: React.ReactNode;
  difficulty: 'easy' | 'medium' | 'hard';
  context: string;
  tips: string[];
}

const scenarios: PizzaScenario[] = [
  {
    id: 'pizza-family',
    title: 'ファミリーピザ',
    description: '4人家族でピザを分けよう',
    totalPieces: 4,
    targetPieces: 1,
    icon: <PizzaIcon />,
    difficulty: 'easy',
    context: '大きなピザを4人家族で平等に分けました。1人分はピザ全体のどれくらいでしょう？',
    tips: [
      'ピザを4つに分けると、1つが1/4になります',
      '同じ大きさに分けることが大切です',
      '全部で4つあるうちの1つです'
    ]
  },
  {
    id: 'cake-birthday',
    title: 'バースデーケーキ',
    description: '8人でケーキを分けよう',
    totalPieces: 8,
    targetPieces: 3,
    icon: <CakeIcon />,
    difficulty: 'medium',
    context: '誕生日パーティーで8等分したケーキ。あなたは3切れ食べました。全体のどれくらい食べましたか？',
    tips: [
      'ケーキを8つに分けて、そのうち3つです',
      '3/8 と表します',
      '8分の3という読み方をします'
    ]
  },
  {
    id: 'pizza-party',
    title: 'パーティーピザ',
    description: '12等分のピザから5切れ',
    totalPieces: 12,
    targetPieces: 5,
    icon: <PizzaIcon />,
    difficulty: 'hard',
    context: '大きなパーティー用ピザを12等分しました。あなたのグループは5切れもらいました。',
    tips: [
      '12等分されたピザの5切れ分です',
      '5/12 と表現します',
      '1/2（半分）より少し少ないくらいです'
    ]
  }
];

export const InteractivePizzaModule: React.FC<InteractivePizzaModuleProps> = ({
  onComplete,
  onBack
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedPieces, setSelectedPieces] = useState<number[]>([]);
  const [completed, setCompleted] = useState<boolean[]>(new Array(scenarios.length).fill(false));
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const currentScenario = scenarios[currentScenarioIndex];
  const allCompleted = completed.every(c => c);

  // ピース選択の処理
  const handlePieceClick = useCallback((pieceIndex: number) => {
    setSelectedPieces(prev => {
      if (prev.includes(pieceIndex)) {
        return prev.filter(p => p !== pieceIndex);
      } else {
        return [...prev, pieceIndex].sort((a, b) => a - b);
      }
    });
  }, []);

  // 答えの確認
  const checkAnswer = useCallback(() => {
    const isCorrect = selectedPieces.length === currentScenario.targetPieces &&
                     selectedPieces.every((piece, index) => piece === index);
    
    setAttempts(prev => prev + 1);

    if (isCorrect) {
      const newCompleted = [...completed];
      newCompleted[currentScenarioIndex] = true;
      setCompleted(newCompleted);
      
      // スコア計算（試行回数を考慮）
      const baseScore = 30;
      const bonusScore = Math.max(0, 20 - (attempts * 5));
      const newScore = baseScore + bonusScore;
      setScore(prev => prev + newScore);

      // 次のシナリオまたは完了
      setTimeout(() => {
        if (currentScenarioIndex < scenarios.length - 1) {
          setCurrentScenarioIndex(prev => prev + 1);
          setSelectedPieces([]);
          setAttempts(0);
        } else {
          // 全完了
          const totalScore = score + newScore;
          onComplete(totalScore);
        }
      }, 1500);
    }
  }, [selectedPieces, currentScenario, attempts, completed, currentScenarioIndex, score, onComplete]);

  // リセット
  const resetScenario = useCallback(() => {
    setSelectedPieces([]);
    setAttempts(0);
  }, []);

  // ピザ/ケーキの視覚化
  const renderPizzaVisualization = () => {
    const size = isMobile ? 250 : 300;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - 40) / 2;
    const sectorAngle = (2 * Math.PI) / currentScenario.totalPieces;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        <svg width={size} height={size} style={{ overflow: 'visible' }}>
          {/* 背景円 */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill={theme.palette.grey[100]}
            stroke={theme.palette.grey[400]}
            strokeWidth="2"
          />
          
          {/* ピザ/ケーキのピース */}
          {Array.from({ length: currentScenario.totalPieces }, (_, index) => {
            const startAngle = index * sectorAngle - Math.PI / 2;
            const endAngle = (index + 1) * sectorAngle - Math.PI / 2;
            
            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);
            
            const largeArcFlag = sectorAngle > Math.PI ? 1 : 0;
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            const isSelected = selectedPieces.includes(index);
            const isTarget = index < currentScenario.targetPieces;
            const isCompleted = completed[currentScenarioIndex];
            
            return (
              <path
                key={index}
                d={pathData}
                fill={
                  isCompleted && isTarget
                    ? theme.palette.success.main
                    : isSelected
                    ? theme.palette.primary.main
                    : theme.palette.grey[200]
                }
                stroke={theme.palette.common.white}
                strokeWidth="3"
                style={{
                  cursor: isCompleted ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: isCompleted && !isTarget ? 0.5 : 1
                }}
                onClick={() => !isCompleted && handlePieceClick(index)}
              />
            );
          })}
          
          {/* 中央のアイコン */}
          <foreignObject x={centerX - 20} y={centerY - 20} width="40" height="40">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              {currentScenario.icon}
            </Box>
          </foreignObject>
          
          {/* 分数表示 */}
          {completed[currentScenarioIndex] && (
            <g>
              <text
                x={centerX}
                y={centerY + 60}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="24"
                fontWeight="bold"
                fill={theme.palette.success.main}
              >
                {currentScenario.targetPieces}/{currentScenario.totalPieces}
              </text>
            </g>
          )}
        </svg>
      </Box>
    );
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3, maxWidth: 1200, mx: 'auto' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🍕 つかうモード
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            ピザやケーキで分数を体験しよう
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`${currentScenarioIndex + 1}/${scenarios.length}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`${score}pt`} 
            color="warning" 
            icon={<StarIcon />}
          />
        </Box>
      </Box>

      {/* 進捗バー */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {scenarios.map((_, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: completed[index]
                  ? theme.palette.success.main
                  : index === currentScenarioIndex
                  ? theme.palette.primary.main
                  : theme.palette.grey[200]
              }}
            />
          ))}
        </Box>
      </Box>

      {/* メインコンテンツ */}
      <Grid container spacing={3}>
        {/* シナリオカード */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ mr: 2, color: 'primary.main' }}>
                  {currentScenario.icon}
                </Box>
                <Typography variant="h6">
                  {currentScenario.title}
                </Typography>
                <Chip
                  label={currentScenario.difficulty === 'easy' ? '初級' : 
                        currentScenario.difficulty === 'medium' ? '中級' : '上級'}
                  color={currentScenario.difficulty === 'easy' ? 'success' : 
                        currentScenario.difficulty === 'medium' ? 'warning' : 'error'}
                  size="small"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3 }}>
                {currentScenario.context}
              </Typography>

              {/* ピザ/ケーキビジュアライゼーション */}
              {renderPizzaVisualization()}

              {/* 指示 */}
              {!completed[currentScenarioIndex] && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>指示：</strong>
                    {currentScenario.targetPieces}切れ分をクリックして選択してください。
                    選んだピースが正しい分数になるように注意しましょう。
                  </Typography>
                </Alert>
              )}

              {/* 完了メッセージ */}
              {completed[currentScenarioIndex] && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>正解！</strong>
                    {currentScenario.targetPieces}/{currentScenario.totalPieces} を正しく選択できました。
                  </Typography>
                </Alert>
              )}

              {/* 選択状況 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body2">
                  選択中: {selectedPieces.length}/{currentScenario.totalPieces}
                </Typography>
                {selectedPieces.length > 0 && (
                  <Typography variant="body2" color="primary.main">
                    分数: {selectedPieces.length}/{currentScenario.totalPieces}
                  </Typography>
                )}
              </Box>
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={resetScenario}
                  disabled={completed[currentScenarioIndex]}
                >
                  リセット
                </Button>
                <Button
                  startIcon={<HelpIcon />}
                  onClick={() => setShowHint(true)}
                >
                  ヒント
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!completed[currentScenarioIndex] && (
                  <Button
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={checkAnswer}
                    disabled={selectedPieces.length !== currentScenario.targetPieces}
                  >
                    答えを確認
                  </Button>
                )}
                
                {completed[currentScenarioIndex] && currentScenarioIndex < scenarios.length - 1 && (
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    onClick={() => {
                      setCurrentScenarioIndex(prev => prev + 1);
                      setSelectedPieces([]);
                      setAttempts(0);
                    }}
                  >
                    次のシナリオ
                  </Button>
                )}
              </Box>
            </CardActions>
          </Card>
        </Grid>

        {/* サイドパネル */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                💡 分数のコツ
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>分数の意味：</strong><br />
                分数は「全体をいくつかに分けた時の部分」を表します。
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>分母（下の数）：</strong><br />
                全体をいくつに分けたか
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>分子（上の数）：</strong><br />
                そのうちいくつを選んだか
              </Typography>

              {/* 実生活の例 */}
              <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  🌟 実生活の例
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                  • ピザを4人で分ける → 1/4ずつ
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                  • 1時間の半分 → 30分 = 1/2時間
                </Typography>
                <Typography variant="caption" display="block">
                  • 10個のクッキーの3個 → 3/10
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ヒントダイアログ */}
      <Dialog open={showHint} onClose={() => setShowHint(false)} maxWidth="sm" fullWidth>
        <DialogTitle>💡 ヒント</DialogTitle>
        <DialogContent>
          {currentScenario.tips.map((tip, index) => (
            <Typography key={index} variant="body2" sx={{ mb: 1 }}>
              • {tip}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHint(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>

      {/* 戻るボタン */}
      <Fab
        color="primary"
        size="medium"
        onClick={onBack}
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: 1000
        }}
      >
        <Typography variant="caption" sx={{ fontSize: '12px' }}>
          戻る
        </Typography>
      </Fab>

      {/* 完了メッセージ */}
      {allCompleted && (
        <Alert severity="success" sx={{ mt: 3 }}>
          <Typography variant="h6">
            🎉 つかうモード完了！
          </Typography>
          <Typography variant="body2">
            ピザとケーキを使って分数を体験できました。最終スコア: {score}ポイント
          </Typography>
        </Alert>
      )}
    </Box>
  );
};