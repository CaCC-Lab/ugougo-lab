import { useState, useEffect } from 'react';
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
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon
} from '@mui/icons-material';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

// 変態のステージ
interface MetamorphosisStage {
  name: string;
  description: string;
  duration: number; // 日数
  emoji: string;
}

// 昆虫の種類
interface InsectType {
  id: string;
  name: string;
  type: 'complete' | 'incomplete'; // 完全変態か不完全変態
  stages: MetamorphosisStage[];
}

// 昆虫の変態シミュレーター（内部コンポーネント）
function InsectMetamorphosisSimulatorContent({ onClose }: { onClose: () => void }) {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
  const insects: InsectType[] = [
    {
      id: 'butterfly',
      name: 'チョウ',
      type: 'complete',
      stages: [
        { name: 'たまご', description: 'はっぱの上に小さなたまごがあります', duration: 5, emoji: '🥚' },
        { name: 'ようちゅう（いもむし）', description: 'はっぱをたくさん食べて大きくなります', duration: 15, emoji: '🐛' },
        { name: 'さなぎ', description: 'かたいからの中で大変身の準備をします', duration: 10, emoji: '🛡️' },
        { name: 'せいちゅう（チョウ）', description: '美しいはねを持つチョウになりました', duration: 30, emoji: '🦋' }
      ]
    },
    {
      id: 'beetle',
      name: 'カブトムシ',
      type: 'complete',
      stages: [
        { name: 'たまご', description: '土の中に白いたまごがあります', duration: 10, emoji: '🥚' },
        { name: 'ようちゅう', description: '土の中でふようどを食べて育ちます', duration: 300, emoji: '🪱' },
        { name: 'さなぎ', description: 'つのやからだができてきます', duration: 30, emoji: '🟫' },
        { name: 'せいちゅう', description: 'りっぱなカブトムシになりました', duration: 60, emoji: '🪲' }
      ]
    },
    {
      id: 'grasshopper',
      name: 'バッタ',
      type: 'incomplete',
      stages: [
        { name: 'たまご', description: '土の中にたまごをうみます', duration: 30, emoji: '🥚' },
        { name: 'ようちゅう（1れい）', description: 'とても小さく、はねがありません', duration: 7, emoji: '🦗' },
        { name: 'ようちゅう（3れい）', description: 'だんだん大きくなってきました', duration: 7, emoji: '🦗' },
        { name: 'ようちゅう（5れい）', description: 'はねのもとができてきました', duration: 7, emoji: '🦗' },
        { name: 'せいちゅう', description: 'はねが生えて、とべるようになりました', duration: 30, emoji: '🦗' }
      ]
    },
    {
      id: 'dragonfly',
      name: 'トンボ',
      type: 'incomplete',
      stages: [
        { name: 'たまご', description: '水の中や水草にたまごをうみます', duration: 7, emoji: '🥚' },
        { name: 'ようちゅう（ヤゴ）', description: '水の中で小さな生き物を食べて育ちます', duration: 365, emoji: '🦠' },
        { name: 'せいちゅう', description: '水から出て、美しいトンボになりました', duration: 60, emoji: '🦟' }
      ]
    }
  ];
  
  const [selectedInsect, setSelectedInsect] = useState<InsectType>(insects[0]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [daysPassed, setDaysPassed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1日 = 1秒
  const [quizMode, setQuizMode] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  const currentStage = selectedInsect.stages[currentStageIndex];
  const totalDuration = selectedInsect.stages.reduce((sum, stage) => sum + stage.duration, 0);
  const progress = (daysPassed / totalDuration) * 100;
  
  // 日数を進める
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setDaysPassed(prev => {
        const next = prev + 1;
        
        // 現在のステージの期間を超えたら次のステージへ
        let totalDays = 0;
        for (let i = 0; i < selectedInsect.stages.length; i++) {
          totalDays += selectedInsect.stages[i].duration;
          if (next <= totalDays) {
            if (i !== currentStageIndex) {
              setCurrentStageIndex(i);
            }
            break;
          }
        }
        
        // 全ステージ終了
        if (next >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        
        return next;
      });
    }, 1000 / speed);
    
    return () => clearInterval(interval);
  }, [isPlaying, speed, selectedInsect, totalDuration, currentStageIndex]);
  
  // 昆虫を変更
  const handleInsectChange = (insectId: string) => {
    const insect = insects.find(i => i.id === insectId);
    if (insect) {
      recordInteraction('click');
      
      // 昆虫選択を記録
      recordAnswer(true, {
        problem: '昆虫の種類選択',
        userAnswer: `${insect.name}を選択`,
        correctAnswer: '昆虫の変態タイプの理解',
        insectSelection: {
          from: selectedInsect.name,
          to: insect.name,
          metamorphosisType: insect.type,
          stageCount: insect.stages.length,
          totalDuration: insect.stages.reduce((sum, stage) => sum + stage.duration, 0)
        }
      });
      
      setSelectedInsect(insect);
      setCurrentStageIndex(0);
      setDaysPassed(0);
      setIsPlaying(false);
    }
  };
  
  // リセット
  const handleReset = () => {
    recordInteraction('click');
    
    // リセット実行を記録
    recordAnswer(true, {
      problem: '昆虫変態シミュレーターのリセット',
      userAnswer: 'シミュレーターを初期状態に戻す',
      correctAnswer: 'リセット完了',
      resetData: {
        previousInsect: selectedInsect.name,
        previousStage: currentStageIndex,
        previousDays: daysPassed,
        previousScore: score,
        previousAttempts: attempts,
        wasPlaying: isPlaying,
        currentSpeed: speed,
        wasInQuizMode: quizMode
      }
    });
    
    setCurrentStageIndex(0);
    setDaysPassed(0);
    setIsPlaying(false);
    setScore(0);
    setAttempts(0);
  };
  
  // 次のステージへ
  const handleNextStage = () => {
    if (currentStageIndex < selectedInsect.stages.length - 1) {
      const nextStageIndex = currentStageIndex + 1;
      recordInteraction('click');
      
      // ステージ進行を記録
      recordAnswer(true, {
        problem: '変態ステージの手動進行',
        userAnswer: `${selectedInsect.stages[nextStageIndex].name}ステージに進行`,
        correctAnswer: '変態プロセスの段階的理解',
        stageProgression: {
          insect: selectedInsect.name,
          fromStage: selectedInsect.stages[currentStageIndex].name,
          toStage: selectedInsect.stages[nextStageIndex].name,
          stageIndex: nextStageIndex + 1,
          totalStages: selectedInsect.stages.length,
          metamorphosisType: selectedInsect.type
        }
      });
      
      setCurrentStageIndex(prev => prev + 1);
      // 日数も調整
      let totalDays = 0;
      for (let i = 0; i <= nextStageIndex; i++) {
        if (i === nextStageIndex) {
          setDaysPassed(totalDays + 1);
          break;
        }
        totalDays += selectedInsect.stages[i].duration;
      }
    }
  };
  
  // クイズの答えをチェック
  const handleQuizAnswer = (isComplete: boolean) => {
    setAttempts(prev => prev + 1);
    recordInteraction('click');
    
    const isCorrect = (selectedInsect.type === 'complete') === isComplete;
    
    // クイズ回答を記録
    recordAnswer(isCorrect, {
      problem: `${selectedInsect.name}の変態タイプ識別`,
      userAnswer: isComplete ? '完全変態' : '不完全変態',
      correctAnswer: selectedInsect.type === 'complete' ? '完全変態' : '不完全変態',
      quizData: {
        insect: selectedInsect.name,
        selectedType: isComplete ? 'complete' : 'incomplete',
        correctType: selectedInsect.type,
        isCorrect: isCorrect,
        stageCount: selectedInsect.stages.length,
        currentScore: score + (isCorrect ? 1 : 0),
        currentAttempts: attempts + 1
      }
    });
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      alert('せいかい！');
      // 次の昆虫へ
      const currentIndex = insects.findIndex(i => i.id === selectedInsect.id);
      const nextIndex = (currentIndex + 1) % insects.length;
      handleInsectChange(insects[nextIndex].id);
    } else {
      alert('ざんねん！もういちど考えてみよう。');
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          昆虫の変態シミュレーター
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
        昆虫の成長過程を観察しよう！完全変態と不完全変態の違いを学べます。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`${daysPassed}日目 / ${totalDuration}日`}
          color="primary" 
          size="medium"
        />
        <Chip 
          label={selectedInsect.type === 'complete' ? '完全変態' : '不完全変態'}
          color="secondary" 
          size="medium"
        />
        {quizMode && (
          <>
            <Chip 
              label={`得点: ${score}`} 
              color="success" 
              size="medium"
            />
            <Chip 
              label={`挑戦: ${attempts}`} 
              color="info" 
              size="medium"
            />
          </>
        )}
      </Box>

      {/* 進捗バー */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption">成長の進捗</Typography>
          <Typography variant="caption">{Math.round(progress)}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
      </Box>

      {/* モード切り替え */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant={!quizMode ? 'contained' : 'outlined'}
          onClick={() => {
            if (quizMode) {
              recordInteraction('click');
              
              // 観察モード切り替えを記録
              recordAnswer(true, {
                problem: '観察モードへの切り替え',
                userAnswer: 'クイズモードから観察モードに変更',
                correctAnswer: 'モード切り替えの理解',
                modeSwitch: {
                  from: 'quiz',
                  to: 'observation',
                  quizResults: {
                    score: score,
                    attempts: attempts
                  },
                  currentInsect: selectedInsect.name
                }
              });
              
              setQuizMode(false);
            }
          }}
        >
          観察モード
        </Button>
        <Button
          variant={quizMode ? 'contained' : 'outlined'}
          onClick={() => {
            recordInteraction('click');
            
            // クイズモード開始を記録
            recordAnswer(true, {
              problem: 'クイズモードの開始',
              userAnswer: '観察モードからクイズモードに切り替え',
              correctAnswer: 'クイズモード開始',
              modeSwitch: {
                from: 'observation',
                to: 'quiz',
                currentInsect: selectedInsect.name,
                currentStage: selectedInsect.stages[currentStageIndex].name,
                currentProgress: Math.round((daysPassed / totalDuration) * 100)
              }
            });
            
            setQuizMode(true);
          }}
        >
          クイズモード
        </Button>
      </Box>

      {quizMode ? (
        // クイズモード
        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          <Grid xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  クイズ：{selectedInsect.name}の変態
                </Typography>
                <Box sx={{ my: 4, textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ fontSize: '120px' }}>
                    {selectedInsect.stages[selectedInsect.stages.length - 1].emoji}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {selectedInsect.name}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  この昆虫は「完全変態」と「不完全変態」のどちらでしょうか？
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleQuizAnswer(true)}
                  >
                    完全変態
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleQuizAnswer(false)}
                  >
                    不完全変態
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        // 観察モード
        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          {/* 左側：ステージ表示 */}
          <Grid xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              {/* 昆虫選択 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  昆虫を選ぶ
                </Typography>
                <ToggleButtonGroup
                  value={selectedInsect.id}
                  exclusive
                  onChange={(_, value) => value && handleInsectChange(value)}
                  fullWidth
                >
                  {insects.map(insect => (
                    <ToggleButton key={insect.id} value={insect.id}>
                      {insect.name}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
              
              {/* ステッパー */}
              <Stepper activeStep={currentStageIndex} sx={{ mb: 3 }}>
                {selectedInsect.stages.map((stage, index) => (
                  <Step key={index}>
                    <StepLabel>{stage.name}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              {/* 現在のステージ表示 */}
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h1" sx={{ fontSize: '120px', mb: 2 }}>
                  {currentStage.emoji}
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {currentStage.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {currentStage.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                  このステージは約{currentStage.duration}日間続きます
                </Typography>
              </Box>
              
              {/* コントロール */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <IconButton
                  size="large"
                  onClick={() => {
                    const newIsPlaying = !isPlaying;
                    setIsPlaying(newIsPlaying);
                    recordInteraction('click');
                    
                    // アニメーション制御を記録
                    recordAnswer(true, {
                      problem: '変態アニメーションの制御',
                      userAnswer: newIsPlaying ? 'アニメーション開始' : 'アニメーション停止',
                      correctAnswer: 'アニメーション制御の理解',
                      animationControl: {
                        action: newIsPlaying ? 'start' : 'stop',
                        insect: selectedInsect.name,
                        currentStage: selectedInsect.stages[currentStageIndex].name,
                        currentDay: daysPassed,
                        speed: speed,
                        progressPercent: Math.round((daysPassed / totalDuration) * 100)
                      }
                    });
                  }}
                  color="primary"
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
                <IconButton
                  size="large"
                  onClick={handleNextStage}
                  disabled={currentStageIndex >= selectedInsect.stages.length - 1}
                >
                  <NextIcon />
                </IconButton>
              </Box>
              
              {/* 速度調整 */}
              <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button
                  size="small"
                  variant={speed === 1 ? 'contained' : 'outlined'}
                  onClick={() => {
                    setSpeed(1);
                    recordInteraction('click');
                    
                    // 速度変更を記録
                    recordAnswer(true, {
                      problem: 'アニメーション速度の調整',
                      userAnswer: '等倍速（×1）に設定',
                      correctAnswer: '速度調整の理解',
                      speedChange: {
                        from: speed,
                        to: 1,
                        insect: selectedInsect.name,
                        currentStage: selectedInsect.stages[currentStageIndex].name
                      }
                    });
                  }}
                >
                  ×1
                </Button>
                <Button
                  size="small"
                  variant={speed === 5 ? 'contained' : 'outlined'}
                  onClick={() => {
                    setSpeed(5);
                    recordInteraction('click');
                    
                    // 速度変更を記録
                    recordAnswer(true, {
                      problem: 'アニメーション速度の調整',
                      userAnswer: '5倍速（×5）に設定',
                      correctAnswer: '速度調整の理解',
                      speedChange: {
                        from: speed,
                        to: 5,
                        insect: selectedInsect.name,
                        currentStage: selectedInsect.stages[currentStageIndex].name
                      }
                    });
                  }}
                >
                  ×5
                </Button>
                <Button
                  size="small"
                  variant={speed === 10 ? 'contained' : 'outlined'}
                  onClick={() => {
                    setSpeed(10);
                    recordInteraction('click');
                    
                    // 速度変更を記録
                    recordAnswer(true, {
                      problem: 'アニメーション速度の調整',
                      userAnswer: '10倍速（×10）に設定',
                      correctAnswer: '速度調整の理解',
                      speedChange: {
                        from: speed,
                        to: 10,
                        insect: selectedInsect.name,
                        currentStage: selectedInsect.stages[currentStageIndex].name
                      }
                    });
                  }}
                >
                  ×10
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* 右側：情報 */}
          <Grid xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedInsect.type === 'complete' ? '完全変態' : '不完全変態'}とは？
                </Typography>
                {selectedInsect.type === 'complete' ? (
                  <>
                    <Typography variant="body2" paragraph>
                      たまご→ようちゅう→さなぎ→せいちゅうの順に成長します。
                    </Typography>
                    <Typography variant="body2" paragraph>
                      さなぎの時期があるのが特徴で、この間に体が大きく変化します。
                    </Typography>
                    <Typography variant="body2">
                      例：チョウ、カブトムシ、ハチ、アリなど
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" paragraph>
                      たまご→ようちゅう→せいちゅうの順に成長します。
                    </Typography>
                    <Typography variant="body2" paragraph>
                      さなぎの時期がなく、脱皮を繰り返しながら少しずつ成虫に近づきます。
                    </Typography>
                    <Typography variant="body2">
                      例：バッタ、トンボ、セミ、カマキリなど
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e9' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🐛 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 完全変態：たまご→ようちゅう→さなぎ→せいちゅう（4段階）<br/>
          • 不完全変態：たまご→ようちゅう→せいちゅう（3段階）<br/>
          • さなぎの時期の有無が大きな違いです<br/>
          • 実際の昆虫も観察してみよう！
        </Typography>
      </Paper>
    </Box>
  );
}

// 昆虫の変態シミュレーター（MaterialWrapperでラップ）
function InsectMetamorphosisSimulator({ onClose }: { onClose: () => void }) {
  return (
    <MaterialWrapper
      materialId="insect-metamorphosis-simulator"
      materialName="昆虫の変態シミュレーター"
      showMetricsButton={true}
      showAssistant={true}
    >
      <InsectMetamorphosisSimulatorContent onClose={onClose} />
    </MaterialWrapper>
  );
}

export default InsectMetamorphosisSimulator;