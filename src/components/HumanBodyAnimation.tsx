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
  List,
  ListItem,
  ListItemText,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  Favorite as HeartIcon,
  Air as LungsIcon,
  RestaurantMenu as StomachIcon,
  Bloodtype as BloodIcon,
  Quiz as QuizIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

// 器官システムの種類
type OrganSystem = 'circulatory' | 'respiratory' | 'digestive';

// 器官の情報
interface OrganInfo {
  name: string;
  system: OrganSystem;
  function: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// 器官データ
const organs: OrganInfo[] = [
  {
    name: '心臓',
    system: 'circulatory',
    function: '血液を全身に送り出すポンプの役割',
    position: { x: 50, y: 30 },
    size: { width: 60, height: 80 }
  },
  {
    name: '肺',
    system: 'respiratory',
    function: '酸素を取り入れ、二酸化炭素を出す',
    position: { x: 50, y: 25 },
    size: { width: 120, height: 100 }
  },
  {
    name: '胃',
    system: 'digestive',
    function: '食べ物を消化する',
    position: { x: 45, y: 45 },
    size: { width: 50, height: 60 }
  },
  {
    name: '小腸',
    system: 'digestive',
    function: '栄養を吸収する',
    position: { x: 50, y: 60 },
    size: { width: 80, height: 80 }
  },
  {
    name: '大腸',
    system: 'digestive',
    function: '水分を吸収し、便を作る',
    position: { x: 50, y: 70 },
    size: { width: 100, height: 60 }
  }
];

// クイズ問題
const quizQuestions = [
  {
    question: '血液を全身に送り出す器官は？',
    options: ['心臓', '肺', '胃', '肝臓'],
    answer: '心臓',
    system: 'circulatory'
  },
  {
    question: '酸素を取り入れる器官は？',
    options: ['胃', '心臓', '肺', '腸'],
    answer: '肺',
    system: 'respiratory'
  },
  {
    question: '食べ物を消化する器官は？',
    options: ['肺', '心臓', '胃', '血管'],
    answer: '胃',
    system: 'digestive'
  },
  {
    question: '栄養を吸収する器官は？',
    options: ['胃', '小腸', '大腸', '肺'],
    answer: '小腸',
    system: 'digestive'
  }
];

// 人体の仕組みアニメーション（内部コンポーネント）
function HumanBodyAnimationContent({ onClose }: { onClose: () => void }) {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedSystem, setSelectedSystem] = useState<OrganSystem>('circulatory');
  const [selectedOrgan, setSelectedOrgan] = useState<OrganInfo | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const animationFrameRef = useRef<number>();
  
  const progress = Math.min((score / 5) * 100, 100);
  
  // アニメーションを描画
  const drawAnimation = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height);
    
    // 人体の輪郭を描画
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // 頭
    ctx.arc(width / 2, height * 0.15, 40, 0, Math.PI * 2);
    ctx.stroke();
    // 胴体
    ctx.beginPath();
    ctx.ellipse(width / 2, height * 0.5, 80, 150, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // 選択されたシステムに応じて器官を描画
    organs
      .filter(organ => organ.system === selectedSystem)
      .forEach(organ => {
        const x = (organ.position.x / 100) * width;
        const y = (organ.position.y / 100) * height;
        const w = organ.size.width;
        const h = organ.size.height;
        
        ctx.save();
        
        // 器官の色
        let color = '';
        switch (organ.system) {
          case 'circulatory':
            color = '#FF6B6B';
            break;
          case 'respiratory':
            color = '#4ECDC4';
            break;
          case 'digestive':
            color = '#95E1D3';
            break;
        }
        
        ctx.fillStyle = color;
        ctx.globalAlpha = selectedOrgan?.name === organ.name ? 1 : 0.7;
        
        // 器官を描画
        if (organ.name === '心臓') {
          // 心臓のアニメーション
          const scale = isAnimating ? 1 + 0.05 * Math.sin(timestamp * 0.003) : 1;
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(scale, scale);
          ctx.beginPath();
          ctx.moveTo(0, -h/3);
          ctx.bezierCurveTo(-w/2, -h/2, -w/2, h/4, 0, h/2);
          ctx.bezierCurveTo(w/2, h/4, w/2, -h/2, 0, -h/3);
          ctx.fill();
          ctx.restore();
        } else if (organ.name === '肺') {
          // 肺のアニメーション
          const scale = isAnimating ? 1 + 0.03 * Math.sin(timestamp * 0.002) : 1;
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(scale, scale);
          // 左肺
          ctx.beginPath();
          ctx.ellipse(-w/4, 0, w/3, h/2, 0, 0, Math.PI * 2);
          ctx.fill();
          // 右肺
          ctx.beginPath();
          ctx.ellipse(w/4, 0, w/3, h/2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // その他の器官
          ctx.beginPath();
          ctx.ellipse(x, y, w/2, h/2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // 器官名を表示
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(organ.name, x, y + h/2 + 20);
        
        ctx.restore();
      });
    
    // 選択されたシステムに応じて流れを表示
    if (isAnimating) {
      const flow = (timestamp * 0.001) % 1;
      
      if (selectedSystem === 'circulatory') {
        // 血液の流れ
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.lineDashOffset = -flow * 15;
        ctx.beginPath();
        ctx.moveTo(width / 2, height * 0.3);
        ctx.lineTo(width / 2 + 50, height * 0.4);
        ctx.lineTo(width / 2 + 50, height * 0.6);
        ctx.lineTo(width / 2, height * 0.7);
        ctx.lineTo(width / 2 - 50, height * 0.6);
        ctx.lineTo(width / 2 - 50, height * 0.4);
        ctx.lineTo(width / 2, height * 0.3);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (selectedSystem === 'respiratory') {
        // 空気の流れ
        const alpha = 0.3 + 0.2 * Math.sin(timestamp * 0.002);
        ctx.fillStyle = `rgba(78, 205, 196, ${alpha})`;
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.1, 20 * flow, 0, Math.PI * 2);
        ctx.fill();
      } else if (selectedSystem === 'digestive') {
        // 食べ物の流れ
        const y = height * (0.4 + 0.4 * flow);
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(width / 2, y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    if (isAnimating) {
      animationFrameRef.current = requestAnimationFrame(drawAnimation);
    }
  };
  
  // アニメーション開始
  useEffect(() => {
    if (isAnimating && mode === 'learn') {
      animationFrameRef.current = requestAnimationFrame(drawAnimation);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating, selectedSystem, selectedOrgan, mode]);
  
  // 静的な描画
  useEffect(() => {
    if (!isAnimating || mode !== 'learn') {
      drawAnimation(0);
    }
  }, [selectedSystem, selectedOrgan, isAnimating, mode]);
  
  // クイズの答えをチェック
  const checkAnswer = (answer: string) => {
    const isCorrect = answer === quizQuestions[currentQuestion].answer;
    recordInteraction('click');
    setAttempts(prev => prev + 1);
    
    // クイズ回答を記録
    recordAnswer(isCorrect, {
      problem: `人体の仕組みクイズ: ${quizQuestions[currentQuestion].question}`,
      userAnswer: answer,
      correctAnswer: quizQuestions[currentQuestion].answer,
      quizData: {
        questionNumber: currentQuestion + 1,
        totalQuestions: quizQuestions.length,
        organSystem: quizQuestions[currentQuestion].system,
        selectedAnswer: answer,
        isCorrect: isCorrect,
        currentScore: score + (isCorrect ? 1 : 0),
        currentAttempts: attempts + 1
      }
    });
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      alert('正解！');
      
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        alert(`クイズ終了！ 得点: ${score + 1}/${quizQuestions.length}`);
        setCurrentQuestion(0);
      }
    } else {
      alert(`残念... 正解は「${quizQuestions[currentQuestion].answer}」でした`);
    }
  };
  
  // リセット
  const handleReset = () => {
    recordInteraction('click');
    
    // リセット実行を記録
    recordAnswer(true, {
      problem: '人体アニメーションのリセット',
      userAnswer: 'システムを初期状態に戻す',
      correctAnswer: 'リセット完了',
      resetData: {
        previousSelectedSystem: selectedSystem,
        previousSelectedOrgan: selectedOrgan?.name || null,
        previousScore: score,
        previousAttempts: attempts,
        previousMode: mode,
        previousQuestionNumber: currentQuestion + 1,
        wasAnimating: isAnimating
      }
    });
    
    setSelectedOrgan(null);
    setScore(0);
    setAttempts(0);
    setCurrentQuestion(0);
    setIsAnimating(true);
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          人体の仕組みアニメーション
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
        人体の器官と働きを学習！消化器系・呼吸器系・循環器系の動きをアニメーションで理解しよう。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`システム: ${
            selectedSystem === 'circulatory' ? '循環器系' :
            selectedSystem === 'respiratory' ? '呼吸器系' : '消化器系'
          }`}
          icon={
            selectedSystem === 'circulatory' ? <HeartIcon /> :
            selectedSystem === 'respiratory' ? <LungsIcon /> : <StomachIcon />
          }
          color="primary" 
          size="medium"
        />
        {mode === 'quiz' && (
          <>
            <Chip 
              label={`問題: ${currentQuestion + 1}/${quizQuestions.length}`} 
              color="secondary" 
              size="medium"
            />
            <Chip 
              label={`得点: ${score}`} 
              color="success" 
              size="medium"
            />
          </>
        )}
      </Box>

      {/* 進捗バー */}
      {mode === 'quiz' && progress > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">学習進捗</Typography>
            <Typography variant="caption">{progress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

      {/* モード選択 */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, value) => {
            if (value) {
              setMode(value);
              recordInteraction('click');
              
              // モード切り替えを記録
              recordAnswer(true, {
                problem: '人体学習モードの切り替え',
                userAnswer: `${value === 'learn' ? '学習' : 'クイズ'}モードを選択`,
                correctAnswer: 'モード選択の理解',
                modeSwitch: {
                  from: mode,
                  to: value,
                  currentSystem: selectedSystem,
                  currentProgress: {
                    score: score,
                    attempts: attempts,
                    selectedOrgan: selectedOrgan?.name || null
                  }
                }
              });
            }
          }}
          fullWidth
        >
          <ToggleButton value="learn">
            学習モード
          </ToggleButton>
          <ToggleButton value="quiz">
            <QuizIcon sx={{ mr: 1 }} />
            クイズモード
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：アニメーション */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            {mode === 'learn' ? (
              <>
                {/* システム選択 */}
                <Box sx={{ mb: 2 }}>
                  <ToggleButtonGroup
                    value={selectedSystem}
                    exclusive
                    onChange={(_, value) => {
                      if (value) {
                        setSelectedSystem(value);
                        setSelectedOrgan(null); // 器官選択をリセット
                        recordInteraction('click');
                        
                        // 器官システム変更を記録
                        recordAnswer(true, {
                          problem: '器官システムの選択',
                          userAnswer: `${value === 'circulatory' ? '循環器系' : value === 'respiratory' ? '呼吸器系' : '消化器系'}を選択`,
                          correctAnswer: '器官システムの理解',
                          systemChange: {
                            from: selectedSystem,
                            to: value,
                            systemDescription: value === 'circulatory' ? '血液を全身に送る系統' : 
                                             value === 'respiratory' ? '呼吸と酸素交換の系統' : 
                                             '食物の消化と栄養吸収の系統',
                            mainOrgans: organs.filter(organ => organ.system === value).map(organ => organ.name)
                          }
                        });
                      }
                    }}
                    fullWidth
                  >
                    <ToggleButton value="circulatory">
                      <HeartIcon sx={{ mr: 1 }} />
                      循環器系
                    </ToggleButton>
                    <ToggleButton value="respiratory">
                      <LungsIcon sx={{ mr: 1 }} />
                      呼吸器系
                    </ToggleButton>
                    <ToggleButton value="digestive">
                      <StomachIcon sx={{ mr: 1 }} />
                      消化器系
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* キャンバス */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={500}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: '#fafafa',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      
                      // クリックした位置に近い器官を選択
                      const clickedOrgan = organs
                        .filter(organ => organ.system === selectedSystem)
                        .find(organ => {
                          const dx = Math.abs(organ.position.x - x);
                          const dy = Math.abs(organ.position.y - y);
                          return dx < 10 && dy < 10;
                        });
                      
                      if (clickedOrgan) {
                        setSelectedOrgan(clickedOrgan);
                        setShowInfo(true);
                        recordInteraction('click');
                        
                        // 器官選択を記録
                        recordAnswer(true, {
                          problem: '器官の詳細確認',
                          userAnswer: `${clickedOrgan.name}を選択して詳細を確認`,
                          correctAnswer: '器官の機能理解',
                          organSelection: {
                            organName: clickedOrgan.name,
                            organSystem: clickedOrgan.system,
                            organFunction: clickedOrgan.function,
                            interactionType: 'canvas_click',
                            position: { x, y }
                          }
                        });
                      }
                    }}
                  />
                </Box>

                {/* アニメーション制御 */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant={isAnimating ? 'contained' : 'outlined'}
                    onClick={() => {
                      const newIsAnimating = !isAnimating;
                      setIsAnimating(newIsAnimating);
                      recordInteraction('click');
                      
                      // アニメーション制御を記録
                      recordAnswer(true, {
                        problem: '人体アニメーションの制御',
                        userAnswer: newIsAnimating ? 'アニメーション開始' : 'アニメーション停止',
                        correctAnswer: 'アニメーション制御の理解',
                        animationControl: {
                          action: newIsAnimating ? 'start' : 'stop',
                          selectedSystem: selectedSystem,
                          selectedOrgan: selectedOrgan?.name || null,
                          purpose: newIsAnimating ? '器官の動きを視覚的に理解' : '静止画で詳細観察'
                        }
                      });
                    }}
                    startIcon={isAnimating ? <BloodIcon /> : <BloodIcon />}
                  >
                    {isAnimating ? 'アニメーション停止' : 'アニメーション開始'}
                  </Button>
                </Box>
              </>
            ) : (
              // クイズモード
              <Box>
                <Typography variant="h5" gutterBottom>
                  問題 {currentQuestion + 1}
                </Typography>
                <Typography variant="h6" paragraph>
                  {quizQuestions[currentQuestion].question}
                </Typography>
                <Grid container spacing={2}>
                  {quizQuestions[currentQuestion].options.map((option, index) => (
                    <Grid size={6} key={index}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        onClick={() => checkAnswer(option)}
                        sx={{ py: 2 }}
                      >
                        {option}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* 右側：情報 */}
        <Grid size={{ xs: 12, md: 4 }}>
          {mode === 'learn' ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  器官の説明
                </Typography>
                {selectedOrgan ? (
                  <>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {selectedOrgan.name}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedOrgan.function}
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      器官をクリックすると詳細が表示されます
                    </Alert>
                  </>
                ) : (
                  <>
                    <List>
                      {organs
                        .filter(organ => organ.system === selectedSystem)
                        .map((organ, index) => (
                          <ListItem 
                            key={index}
                            button
                            onClick={() => {
                              setSelectedOrgan(organ);
                              setShowInfo(true);
                              recordInteraction('click');
                              
                              // リストから器官選択を記録
                              recordAnswer(true, {
                                problem: '器官リストからの選択',
                                userAnswer: `${organ.name}をリストから選択`,
                                correctAnswer: '器官の機能理解',
                                organSelection: {
                                  organName: organ.name,
                                  organSystem: organ.system,
                                  organFunction: organ.function,
                                  interactionType: 'list_selection',
                                  currentSystem: selectedSystem
                                }
                              });
                            }}
                          >
                            <ListItemText
                              primary={organ.name}
                              secondary={organ.function}
                            />
                          </ListItem>
                        ))}
                    </List>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      器官をクリックまたはリストから選択してください
                    </Alert>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  クイズの成績
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="正解数" secondary={`${score}問`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="挑戦回数" secondary={`${attempts}回`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="正答率" 
                      secondary={attempts > 0 ? `${Math.round(score / attempts * 100)}%` : '-'} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#ffebee' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🫀 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 循環器系：心臓が血液を全身に送ります<br/>
          • 呼吸器系：肺で酸素を取り入れ、二酸化炭素を出します<br/>
          • 消化器系：食べ物を消化し、栄養を吸収します<br/>
          • 各器官は協力して体を動かしています
        </Typography>
      </Paper>

      {/* 器官詳細ダイアログ */}
      <Dialog open={showInfo && selectedOrgan !== null} onClose={() => setShowInfo(false)}>
        <DialogTitle>
          {selectedOrgan?.name}の詳細
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            <strong>働き：</strong>{selectedOrgan?.function}
          </Typography>
          <Typography variant="body1">
            <strong>属する系：</strong>
            {selectedOrgan?.system === 'circulatory' ? '循環器系' :
             selectedOrgan?.system === 'respiratory' ? '呼吸器系' : '消化器系'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInfo(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// 人体の仕組みアニメーション（MaterialWrapperでラップ）
function HumanBodyAnimation({ onClose }: { onClose: () => void }) {
  return (
    <MaterialWrapper
      materialId="human-body-animation"
      materialName="人体の仕組みアニメーション"
      showMetricsButton={true}
      showAssistant={true}
    >
      <HumanBodyAnimationContent onClose={onClose} />
    </MaterialWrapper>
  );
}

export default HumanBodyAnimation;