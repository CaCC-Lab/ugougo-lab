import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Stage, Layer, Line, Circle, Text, Rect, Group } from 'react-konva';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

interface Weight {
  id: string;
  mass: number; // グラム
  position: number; // 支点からの距離（cm）
  side: 'left' | 'right';
}

interface ExperimentData {
  leftMoment: number;
  rightMoment: number;
  isBalanced: boolean;
  leverType: string;
}

interface LeverPrincipleExperimentProps {
  onClose?: () => void;
}

// てこの原理実験シミュレーター（内部コンポーネント）
const LeverPrincipleExperimentContent: React.FC<LeverPrincipleExperimentProps> = ({ onClose }) => {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const theme = useTheme();
  const stageRef = useRef<any>(null);
  
  // てこの種類
  const [leverType, setLeverType] = useState<'type1' | 'type2' | 'type3'>('type1');
  const [fulcrumPosition, setFulcrumPosition] = useState<number>(50); // 0-100の範囲
  const [weights, setWeights] = useState<Weight[]>([]);
  const [experimentData, setExperimentData] = useState<ExperimentData[]>([]);
  const [rotation, setRotation] = useState<number>(0); // てこの回転角度
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showTools, setShowTools] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<string>('');
  
  // キャンバスサイズ
  const canvasWidth = 800;
  const canvasHeight = 500;
  const leverLength = 600; // てこの長さ（ピクセル）
  const leverY = 300; // てこのY座標
  
  // 身近な道具の例
  const tools = [
    { id: 'scissors', name: 'はさみ', type: 'type1', description: '支点が中央にある第1種てこ' },
    { id: 'nutcracker', name: 'くるみ割り器', type: 'type2', description: '作用点が中央にある第2種てこ' },
    { id: 'pliers', name: 'ペンチ', type: 'type1', description: '支点が端にある第1種てこ' },
    { id: 'wheelbarrow', name: '一輪車', type: 'type2', description: '車輪が支点となる第2種てこ' },
    { id: 'tweezers', name: 'ピンセット', type: 'type3', description: '力点が中央にある第3種てこ' },
    { id: 'fishingrod', name: '釣り竿', type: 'type3', description: '手元が支点となる第3種てこ' },
  ];
  
  // おもりの追加
  const addWeight = (mass: number, side: 'left' | 'right') => {
    const newWeight: Weight = {
      id: `weight-${Date.now()}`,
      mass: mass,
      position: side === 'left' ? 30 : 70, // 初期位置
      side: side,
    };
    setWeights([...weights, newWeight]);
  };
  
  // おもりの削除
  const removeWeight = (id: string) => {
    setWeights(weights.filter(w => w.id !== id));
  };
  
  // おもりの位置更新
  const updateWeightPosition = (id: string, position: number) => {
    setWeights(weights.map(w => 
      w.id === id ? { ...w, position } : w
    ));
  };
  
  // モーメントの計算
  const calculateMoment = () => {
    let leftMoment = 0;
    let rightMoment = 0;
    
    weights.forEach(weight => {
      const distance = Math.abs(weight.position - fulcrumPosition);
      const moment = weight.mass * distance / 10; // cm -> 10cmを単位とする
      
      if (weight.side === 'left') {
        leftMoment += moment;
      } else {
        rightMoment += moment;
      }
    });
    
    return { leftMoment, rightMoment };
  };
  
  // つり合いの判定とアニメーション
  useEffect(() => {
    const { leftMoment, rightMoment } = calculateMoment();
    const difference = leftMoment - rightMoment;
    const maxRotation = 20; // 最大回転角度
    
    // 回転角度を計算（差に応じて）
    let targetRotation = 0;
    if (Math.abs(difference) > 0.1) {
      targetRotation = Math.sign(difference) * Math.min(Math.abs(difference) / 50, 1) * maxRotation;
    }
    
    // アニメーション
    if (isAnimating) {
      const animate = () => {
        setRotation(prev => {
          const diff = targetRotation - prev;
          if (Math.abs(diff) < 0.1) {
            setIsAnimating(false);
            return targetRotation;
          }
          return prev + diff * 0.1;
        });
      };
      const timer = setInterval(animate, 30);
      return () => clearInterval(timer);
    } else {
      setRotation(targetRotation);
    }
  }, [weights, fulcrumPosition, isAnimating]);
  
  // 実験データの記録
  const recordExperiment = () => {
    const { leftMoment, rightMoment } = calculateMoment();
    const isBalanced = Math.abs(leftMoment - rightMoment) < 0.1;
    
    const data: ExperimentData = {
      leftMoment: Math.round(leftMoment * 10) / 10,
      rightMoment: Math.round(rightMoment * 10) / 10,
      isBalanced,
      leverType: leverType === 'type1' ? '第1種' : leverType === 'type2' ? '第2種' : '第3種',
    };
    
    setExperimentData([...experimentData, data]);
  };
  
  // 座標変換
  const getLeverCoordinates = () => {
    const fulcrumX = (canvasWidth - leverLength) / 2 + (fulcrumPosition / 100) * leverLength;
    const fulcrumY = leverY;
    const leftEndX = (canvasWidth - leverLength) / 2;
    const rightEndX = (canvasWidth + leverLength) / 2;
    
    // 回転を考慮した端点の座標
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const leftX = fulcrumX + (leftEndX - fulcrumX) * cos - (leverY - fulcrumY) * sin;
    const leftY = fulcrumY + (leftEndX - fulcrumX) * sin + (leverY - fulcrumY) * cos;
    const rightX = fulcrumX + (rightEndX - fulcrumX) * cos - (leverY - fulcrumY) * sin;
    const rightY = fulcrumY + (rightEndX - fulcrumX) * sin + (leverY - fulcrumY) * cos;
    
    return { fulcrumX, fulcrumY, leftX, leftY, rightX, rightY };
  };
  
  // おもりの座標計算
  const getWeightPosition = (weight: Weight) => {
    const { fulcrumX, fulcrumY, leftX, leftY, rightX, rightY } = getLeverCoordinates();
    const leverStartX = (canvasWidth - leverLength) / 2;
    const x = leverStartX + (weight.position / 100) * leverLength;
    
    // てこ上の位置を計算
    const t = (x - leftX) / (rightX - leftX);
    const leverX = leftX + t * (rightX - leftX);
    const leverY = leftY + t * (rightY - leftY);
    
    return { x: leverX, y: leverY - 30 }; // おもりは棒の上に配置
  };
  
  // リセット
  const handleReset = () => {
    setWeights([]);
    setFulcrumPosition(50);
    setRotation(0);
    setExperimentData([]);
  };
  
  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          てこの原理実験器
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="身近な道具">
            <IconButton onClick={() => {
              setShowTools(true);
              recordInteraction('click');
              
              // 身近な道具表示を記録
              recordAnswer(true, {
                problem: '身近な道具の確認',
                userAnswer: 'てこを使った道具を調査',
                correctAnswer: '日常生活でのてこの応用例の理解'
              });
            }}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="使い方">
            <IconButton onClick={() => {
              setShowExplanation(!showExplanation);
              recordInteraction('click');
              
              // ヘルプ表示切り替えを記録
              recordAnswer(true, {
                problem: 'ヘルプ情報の確認',
                userAnswer: showExplanation ? 'ヘルプを非表示' : 'ヘルプを表示',
                correctAnswer: '使い方の理解'
              });
            }}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {showExplanation && (
        <Alert severity="info" sx={{ mb: 3 }}>
          てこのつり合いを実験できます。支点の位置を変えたり、おもりを追加して、
          力のモーメントがつり合う条件を発見しましょう。
          てこの3種類（第1種〜第3種）も切り替えて違いを観察できます。
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* 左側：コントロール */}
        <Box sx={{ flex: '0 0 300px', minWidth: 300 }}>
          {/* てこの種類選択 */}
          <Typography variant="subtitle2" gutterBottom>
            てこの種類
          </Typography>
          <ToggleButtonGroup
            value={leverType}
            exclusive
            onChange={(_, value) => {
              if (value) {
                setLeverType(value);
                recordInteraction('click');
                
                // てこの種類変更を記録
                recordAnswer(true, {
                  problem: 'てこの種類の選択',
                  userAnswer: `第${value.slice(-1)}種てこを選択`,
                  correctAnswer: 'てこの種類の理解',
                  leverType: value
                });
              }
            }}
            fullWidth
            sx={{ mb: 3 }}
          >
            <ToggleButton value="type1">第1種</ToggleButton>
            <ToggleButton value="type2">第2種</ToggleButton>
            <ToggleButton value="type3">第3種</ToggleButton>
          </ToggleButtonGroup>

          {/* 支点の位置 */}
          <Typography variant="subtitle2" gutterBottom>
            支点の位置: {fulcrumPosition}%
          </Typography>
          <Slider
            value={fulcrumPosition}
            onChange={(_, value) => {
              const newPosition = value as number;
              setFulcrumPosition(newPosition);
              recordInteraction('drag');
              
              // 支点位置変更を記録
              recordAnswer(true, {
                problem: '支点位置の調整',
                userAnswer: `支点を${newPosition}%の位置に設定`,
                correctAnswer: '支点位置がてこのバランスに影響することを理解',
                fulcrumPosition: newPosition
              });
            }}
            min={10}
            max={90}
            step={5}
            marks
            valueLabelDisplay="auto"
            sx={{ mb: 3 }}
          />

          {/* おもりの追加 */}
          <Typography variant="subtitle2" gutterBottom>
            おもりを追加
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <Select defaultValue={50}>
                <MenuItem value={10}>10g</MenuItem>
                <MenuItem value={20}>20g</MenuItem>
                <MenuItem value={50}>50g</MenuItem>
                <MenuItem value={100}>100g</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                const select = e.currentTarget.previousElementSibling?.querySelector('input');
                const mass = parseInt(select?.getAttribute('value') || '50');
                addWeight(mass, 'left');
                recordInteraction('click');
                
                // 左側へのおもり追加を記録
                recordAnswer(true, {
                  problem: 'おもりの追加',
                  userAnswer: `${mass}gのおもりを左側に追加`,
                  correctAnswer: 'おもりの重さと位置がモーメントに影響することを理解',
                  weightMass: mass,
                  side: 'left',
                  totalWeights: weights.length + 1
                });
              }}
            >
              左に追加
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                const select = e.currentTarget.parentElement?.querySelector('input');
                const mass = parseInt(select?.getAttribute('value') || '50');
                addWeight(mass, 'right');
                recordInteraction('click');
                
                // 右側へのおもり追加を記録
                recordAnswer(true, {
                  problem: 'おもりの追加',
                  userAnswer: `${mass}gのおもりを右側に追加`,
                  correctAnswer: 'おもりの重さと位置がモーメントに影響することを理解',
                  weightMass: mass,
                  side: 'right',
                  totalWeights: weights.length + 1
                });
              }}
            >
              右に追加
            </Button>
          </Box>

          {/* モーメント表示 */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              力のモーメント
            </Typography>
            {(() => {
              const { leftMoment, rightMoment } = calculateMoment();
              const isBalanced = Math.abs(leftMoment - rightMoment) < 0.1;
              return (
                <>
                  <Typography variant="body2">
                    左側: {leftMoment.toFixed(1)} N・cm
                  </Typography>
                  <Typography variant="body2">
                    右側: {rightMoment.toFixed(1)} N・cm
                  </Typography>
                  <Chip
                    label={isBalanced ? 'つり合っている' : 'つり合っていない'}
                    color={isBalanced ? 'success' : 'warning'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </>
              );
            })()}
          </Paper>

          {/* アクションボタン */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => {
                setIsAnimating(true);
                recordInteraction('click');
                
                // アニメーション開始を記録
                const { leftMoment, rightMoment } = calculateMoment();
                recordAnswer(true, {
                  problem: 'てこの動きの観察',
                  userAnswer: 'てこの動きをアニメーションで確認',
                  correctAnswer: 'てこの動きとモーメントの関係を理解',
                  moments: { leftMoment, rightMoment },
                  isBalanced: Math.abs(leftMoment - rightMoment) < 0.1,
                  weightsCount: weights.length
                });
              }}
              startIcon={<PlayArrowIcon />}
            >
              動かす
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                recordExperiment();
                recordInteraction('click');
                
                // 実験記録を記録
                const { leftMoment, rightMoment } = calculateMoment();
                const isBalanced = Math.abs(leftMoment - rightMoment) < 0.1;
                recordAnswer(true, {
                  problem: 'てこの実験結果の記録',
                  userAnswer: `左${leftMoment.toFixed(1)}N・cm 右${rightMoment.toFixed(1)}N・cm`,
                  correctAnswer: 'モーメントの数値を正確に記録',
                  experimentData: {
                    leftMoment,
                    rightMoment,
                    isBalanced,
                    leverType,
                    fulcrumPosition,
                    weightsCount: weights.length
                  }
                });
              }}
              startIcon={<AddIcon />}
            >
              記録
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                handleReset();
                recordInteraction('click');
                
                // リセット実行を記録
                recordAnswer(true, {
                  problem: 'てこ実験のリセット',
                  userAnswer: '実験を初期状態に戻す',
                  correctAnswer: '新しい実験の準備',
                  resetData: {
                    previousWeightsCount: weights.length,
                    previousLeverType: leverType,
                    previousFulcrumPosition: fulcrumPosition,
                    experimentsRecorded: experimentData.length
                  }
                });
              }}
              startIcon={<RefreshIcon />}
            >
              リセット
            </Button>
          </Box>

          {/* 実験記録 */}
          {experimentData.length > 0 && (
            <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>種類</TableCell>
                    <TableCell>左(N・cm)</TableCell>
                    <TableCell>右(N・cm)</TableCell>
                    <TableCell>結果</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {experimentData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{data.leverType}</TableCell>
                      <TableCell>{data.leftMoment}</TableCell>
                      <TableCell>{data.rightMoment}</TableCell>
                      <TableCell>
                        {data.isBalanced ? '○' : '×'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* 右側：実験装置 */}
        <Box sx={{ flex: '1 1 500px' }}>
          <Paper sx={{ p: 2 }}>
            <Stage width={canvasWidth} height={canvasHeight} ref={stageRef}>
              <Layer>
                {/* 背景 */}
                <Rect
                  x={0}
                  y={0}
                  width={canvasWidth}
                  height={canvasHeight}
                  fill="#f5f5f5"
                />

                {/* てこ本体 */}
                <Group rotation={rotation} x={getLeverCoordinates().fulcrumX} y={getLeverCoordinates().fulcrumY}>
                  <Line
                    points={[
                      -(fulcrumPosition / 100) * leverLength,
                      0,
                      ((100 - fulcrumPosition) / 100) * leverLength,
                      0,
                    ]}
                    stroke="#8B4513"
                    strokeWidth={10}
                    lineCap="round"
                  />
                </Group>

                {/* 支点 */}
                <Group>
                  {/* 三角形の支点 */}
                  <Line
                    points={[
                      getLeverCoordinates().fulcrumX - 30,
                      leverY + 50,
                      getLeverCoordinates().fulcrumX,
                      leverY,
                      getLeverCoordinates().fulcrumX + 30,
                      leverY + 50,
                      getLeverCoordinates().fulcrumX - 30,
                      leverY + 50,
                    ]}
                    fill="#666"
                    closed
                  />
                  <Text
                    x={getLeverCoordinates().fulcrumX - 20}
                    y={leverY + 60}
                    text="支点"
                    fontSize={14}
                    fill="#333"
                  />
                </Group>

                {/* おもり */}
                {weights.map((weight) => {
                  const pos = getWeightPosition(weight);
                  return (
                    <Group key={weight.id}>
                      <Circle
                        x={pos.x}
                        y={pos.y}
                        radius={15 + weight.mass / 10}
                        fill={weight.side === 'left' ? '#3f51b5' : '#f50057'}
                        stroke="#333"
                        strokeWidth={2}
                      />
                      <Text
                        x={pos.x - 15}
                        y={pos.y - 5}
                        text={`${weight.mass}g`}
                        fontSize={12}
                        fill="white"
                      />
                    </Group>
                  );
                })}

                {/* 目盛り */}
                {Array.from({ length: 11 }, (_, i) => i * 10).map((value) => {
                  const x = (canvasWidth - leverLength) / 2 + (value / 100) * leverLength;
                  return (
                    <Group key={value}>
                      <Line
                        points={[x, leverY + 60, x, leverY + 70]}
                        stroke="#999"
                        strokeWidth={1}
                      />
                      <Text
                        x={x - 10}
                        y={leverY + 75}
                        text={value.toString()}
                        fontSize={10}
                        fill="#666"
                      />
                    </Group>
                  );
                })}
              </Layer>
            </Stage>
          </Paper>

          {/* おもりリスト */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              配置されたおもり
            </Typography>
            {weights.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                おもりを追加してください
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {weights.map((weight) => (
                  <Paper key={weight.id} sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${weight.mass}g`}
                      color={weight.side === 'left' ? 'primary' : 'secondary'}
                      size="small"
                    />
                    <Typography variant="body2">
                      位置: {weight.position}cm
                    </Typography>
                    <Slider
                      value={weight.position}
                      onChange={(_, value) => {
                        const newPosition = value as number;
                        updateWeightPosition(weight.id, newPosition);
                        recordInteraction('drag');
                        
                        // おもり位置変更を記録
                        recordAnswer(true, {
                          problem: 'おもりの位置調整',
                          userAnswer: `${weight.mass}gのおもりを${newPosition}cmの位置に移動`,
                          correctAnswer: 'おもりの位置がモーメントに影響することを理解',
                          weightId: weight.id,
                          mass: weight.mass,
                          side: weight.side,
                          newPosition: newPosition
                        });
                      }}
                      min={0}
                      max={100}
                      step={5}
                      size="small"
                      sx={{ flex: 1, mx: 2 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        removeWeight(weight.id);
                        recordInteraction('click');
                        
                        // おもり削除を記録
                        recordAnswer(true, {
                          problem: 'おもりの削除',
                          userAnswer: `${weight.mass}gのおもりを削除`,
                          correctAnswer: '不要なおもりの整理',
                          removedWeight: {
                            mass: weight.mass,
                            position: weight.position,
                            side: weight.side
                          },
                          remainingWeights: weights.length - 1
                        });
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* 身近な道具ダイアログ */}
      <Dialog open={showTools} onClose={() => {
        setShowTools(false);
        recordInteraction('click');
        
        // 道具ダイアログ終了を記録
        recordAnswer(true, {
          problem: '身近な道具の学習終了',
          userAnswer: 'てこを使った道具の学習を終了',
          correctAnswer: '日常生活でのてこの応用例を理解'
        });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>てこを使った身近な道具</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {tools.map((tool) => (
              <Paper key={tool.id} sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {tool.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tool.description}
                </Typography>
                <Chip
                  label={tool.type === 'type1' ? '第1種' : tool.type === 'type2' ? '第2種' : '第3種'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Paper>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

};

// てこの原理実験シミュレーター（MaterialWrapperでラップ）
const LeverPrincipleExperiment: React.FC<LeverPrincipleExperimentProps> = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="lever-principle-experiment"
      materialName="てこの原理実験シミュレーター"
      showMetricsButton={true}
      showAssistant={true}
    >
      <LeverPrincipleExperimentContent onClose={onClose} />
    </MaterialWrapper>
  );
};

export default LeverPrincipleExperiment;