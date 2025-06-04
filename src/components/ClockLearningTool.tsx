import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Alert,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

const ClockContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '300px',
  height: '300px',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    width: '250px',
    height: '250px',
  },
}));

const ClockFace = styled('svg')(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: '#fff9e6',
  borderRadius: '50%',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  cursor: 'pointer',
}));

const ClockHand = styled('line')<{ handType: 'hour' | 'minute' }>(({ handType }) => ({
  stroke: handType === 'hour' ? '#ff6b6b' : '#4ecdc4',
  strokeWidth: handType === 'hour' ? 6 : 4,
  strokeLinecap: 'round',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    filter: 'brightness(1.2)',
  },
}));

const DigitalDisplay = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: '#333',
  color: '#0ff',
  fontFamily: 'monospace',
  fontSize: '2rem',
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  },
}));

const QuizOption = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  minWidth: '120px',
  fontSize: '1.2rem',
  [theme.breakpoints.down('sm')]: {
    minWidth: '100px',
    fontSize: '1rem',
  },
}));

interface ClockLearningToolProps {
  onClose?: () => void;
}

const ClockLearningTool: React.FC<ClockLearningToolProps> = ({ onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [hour, setHour] = useState(3);
  const [minute, setMinute] = useState(0);
  const [isDragging, setIsDragging] = useState<'hour' | 'minute' | null>(null);
  const [mode, setMode] = useState<'practice' | 'quiz'>('practice');
  const [quizHour, setQuizHour] = useState(0);
  const [quizMinute, setQuizMinute] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // 時刻のフォーマット
  const formatTime = (h: number, m: number): string => {
    const displayHour = h === 0 ? 12 : h;
    const minuteStr = m.toString().padStart(2, '0');
    return `${displayHour}:${minuteStr}`;
  };

  // 角度から時刻を計算
  const angleToTime = (angle: number, isHour: boolean): number => {
    // 12時を0度として時計回りに角度を正規化
    const normalizedAngle = ((angle + 90) % 360 + 360) % 360;
    
    if (isHour) {
      // 時針: 30度で1時間
      const hour = Math.round(normalizedAngle / 30) % 12;
      return hour;
    } else {
      // 分針: 6度で1分
      const minute = Math.round(normalizedAngle / 6) % 60;
      return minute;
    }
  };

  // マウス/タッチイベントの処理
  const handlePointerDown = (e: React.PointerEvent, handType: 'hour' | 'minute') => {
    e.preventDefault();
    setIsDragging(handType);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    
    if (isDragging === 'hour') {
      setHour(angleToTime(angle, true));
    } else if (isDragging === 'minute') {
      setMinute(angleToTime(angle, false));
    }
  };

  const handlePointerUp = () => {
    setIsDragging(null);
  };

  // グローバルイベントリスナー
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (isDragging && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left - centerX;
        const y = e.clientY - rect.top - centerY;
        
        const angle = Math.atan2(y, x) * (180 / Math.PI);
        
        if (isDragging === 'hour') {
          setHour(angleToTime(angle, true));
        } else if (isDragging === 'minute') {
          setMinute(angleToTime(angle, false));
        }
      }
    };

    const handleGlobalPointerUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('pointermove', handleGlobalPointerMove);
      document.addEventListener('pointerup', handleGlobalPointerUp);
      
      return () => {
        document.removeEventListener('pointermove', handleGlobalPointerMove);
        document.removeEventListener('pointerup', handleGlobalPointerUp);
      };
    }
  }, [isDragging]);

  // クイズ問題の生成
  const generateQuiz = () => {
    const h = Math.floor(Math.random() * 12);
    const m = Math.floor(Math.random() * 12) * 5; // 5分刻み
    setQuizHour(h);
    setQuizMinute(m);
    setHour(h);
    setMinute(m);
    
    // 正解を含む4つの選択肢を生成
    const correctAnswer = formatTime(h, m);
    const options = [correctAnswer];
    
    while (options.length < 4) {
      const randomHour = Math.floor(Math.random() * 12);
      const randomMinute = Math.floor(Math.random() * 12) * 5;
      const option = formatTime(randomHour, randomMinute);
      
      if (!options.includes(option)) {
        options.push(option);
      }
    }
    
    // シャッフル
    setQuizOptions(options.sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  // モード切り替え
  const handleModeChange = (newMode: 'practice' | 'quiz') => {
    setMode(newMode);
    if (newMode === 'quiz') {
      generateQuiz();
      setScore(0);
      setTotalQuestions(0);
    }
  };

  // 答えの選択
  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    const correct = answer === formatTime(quizHour, quizMinute);
    setIsCorrect(correct);
    setTotalQuestions(totalQuestions + 1);
    
    if (correct) {
      setScore(score + 1);
    }
  };

  // 次の問題
  const handleNextQuestion = () => {
    generateQuiz();
  };

  // 時針と分針の角度計算
  const hourAngle = (hour % 12) * 30 + (minute / 60) * 30 - 90;
  const minuteAngle = minute * 6 - 90;

  return (
    <Container maxWidth="md">
      <Card sx={{ backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              時計の読み方を学ぼう！
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {mode === 'practice' 
                ? '時計の針をドラッグして動かしてみよう！'
                : '時計が示している時刻を当ててみよう！'}
            </Typography>
          </Box>

          <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant={mode === 'practice' ? 'contained' : 'outlined'}
              onClick={() => handleModeChange('practice')}
              size={isMobile ? 'small' : 'medium'}
            >
              練習モード
            </Button>
            <Button
              variant={mode === 'quiz' ? 'contained' : 'outlined'}
              onClick={() => handleModeChange('quiz')}
              size={isMobile ? 'small' : 'medium'}
            >
              クイズモード
            </Button>
          </Box>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <ClockContainer>
                <ClockFace
                  ref={svgRef}
                  viewBox="0 0 300 300"
                  onPointerMove={handlePointerMove}
                  style={{ touchAction: 'none' }}
                >
                  {/* 時計の文字盤 */}
                  <circle cx="150" cy="150" r="145" fill="none" stroke="#333" strokeWidth="3" />
                  <circle cx="150" cy="150" r="5" fill="#333" />
                  
                  {/* 数字 */}
                  {[...Array(12)].map((_, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180);
                    const x = 150 + 120 * Math.cos(angle);
                    const y = 150 + 120 * Math.sin(angle);
                    const number = i === 0 ? 12 : i;
                    
                    return (
                      <text
                        key={i}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="24"
                        fontWeight="bold"
                        fill="#333"
                      >
                        {number}
                      </text>
                    );
                  })}
                  
                  {/* 目盛り */}
                  {[...Array(60)].map((_, i) => {
                    const angle = (i * 6 - 90) * (Math.PI / 180);
                    const isHour = i % 5 === 0;
                    const innerRadius = isHour ? 135 : 140;
                    const outerRadius = 145;
                    const x1 = 150 + innerRadius * Math.cos(angle);
                    const y1 = 150 + innerRadius * Math.sin(angle);
                    const x2 = 150 + outerRadius * Math.cos(angle);
                    const y2 = 150 + outerRadius * Math.sin(angle);
                    
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#333"
                        strokeWidth={isHour ? 2 : 1}
                      />
                    );
                  })}
                  
                  {/* 分針 */}
                  <ClockHand
                    handType="minute"
                    x1="150"
                    y1="150"
                    x2={150 + 100 * Math.cos(minuteAngle * Math.PI / 180)}
                    y2={150 + 100 * Math.sin(minuteAngle * Math.PI / 180)}
                    onPointerDown={(e) => mode === 'practice' && handlePointerDown(e, 'minute')}
                    style={{ pointerEvents: mode === 'practice' ? 'auto' : 'none' }}
                  />
                  
                  {/* 時針 */}
                  <ClockHand
                    handType="hour"
                    x1="150"
                    y1="150"
                    x2={150 + 70 * Math.cos(hourAngle * Math.PI / 180)}
                    y2={150 + 70 * Math.sin(hourAngle * Math.PI / 180)}
                    onPointerDown={(e) => mode === 'practice' && handlePointerDown(e, 'hour')}
                    style={{ pointerEvents: mode === 'practice' ? 'auto' : 'none' }}
                  />
                </ClockFace>
              </ClockContainer>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  デジタル表示
                </Typography>
                <DigitalDisplay elevation={3}>
                  {formatTime(hour, minute)}
                </DigitalDisplay>
                
                {mode === 'practice' && (
                  <Box sx={{ mt: 3 }}>
                    <Chip
                      label="赤い針：短針（時）"
                      sx={{ 
                        backgroundColor: '#ffebee',
                        color: '#d32f2f',
                        mr: 1,
                        mb: 1
                      }}
                    />
                    <Chip
                      label="青い針：長針（分）"
                      sx={{ 
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        mb: 1
                      }}
                    />
                  </Box>
                )}
                
                {mode === 'quiz' && (
                  <Box sx={{ mt: 3 }}>
                    {!selectedAnswer ? (
                      <>
                        <Typography variant="h6" gutterBottom>
                          この時刻は？
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {quizOptions.map((option) => (
                            <QuizOption
                              key={option}
                              variant="contained"
                              onClick={() => handleAnswerSelect(option)}
                              color="primary"
                            >
                              {option}
                            </QuizOption>
                          ))}
                        </Box>
                      </>
                    ) : (
                      <>
                        <Alert
                          severity={isCorrect ? 'success' : 'error'}
                          icon={isCorrect ? <CheckCircleIcon /> : null}
                          sx={{ mb: 2 }}
                        >
                          {isCorrect ? 'せいかい！' : `ざんねん... 正解は ${formatTime(quizHour, quizMinute)} でした`}
                        </Alert>
                        <Button
                          variant="contained"
                          startIcon={<RefreshIcon />}
                          onClick={handleNextQuestion}
                          size="large"
                        >
                          次の問題
                        </Button>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="h6">
                            スコア: {score} / {totalQuestions}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
          
          {mode === 'practice' && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                💡 ヒント：
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 短い赤い針は「時」を指します（1周で12時間）
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 長い青い針は「分」を指します（1周で60分）
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 針をドラッグして好きな時刻に合わせてみよう！
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ClockLearningTool;