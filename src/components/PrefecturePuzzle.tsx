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
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

// 都道府県データ（一部抜粋）
const prefectures = [
  { id: 'hokkaido', name: '北海道', capital: '札幌市', region: '北海道', x: 85, y: 10, specialty: '海産物、じゃがいも' },
  { id: 'aomori', name: '青森県', capital: '青森市', region: '東北', x: 80, y: 20, specialty: 'りんご' },
  { id: 'iwate', name: '岩手県', capital: '盛岡市', region: '東北', x: 82, y: 25, specialty: 'わんこそば' },
  { id: 'miyagi', name: '宮城県', capital: '仙台市', region: '東北', x: 81, y: 30, specialty: '牛タン、ずんだ' },
  { id: 'tokyo', name: '東京都', capital: '新宿区', region: '関東', x: 70, y: 50, specialty: '江戸前寿司' },
  { id: 'kanagawa', name: '神奈川県', capital: '横浜市', region: '関東', x: 69, y: 52, specialty: 'シュウマイ' },
  { id: 'aichi', name: '愛知県', capital: '名古屋市', region: '中部', x: 60, y: 52, specialty: '味噌カツ、ひつまぶし' },
  { id: 'kyoto', name: '京都府', capital: '京都市', region: '近畿', x: 55, y: 53, specialty: '八つ橋、抹茶' },
  { id: 'osaka', name: '大阪府', capital: '大阪市', region: '近畿', x: 54, y: 55, specialty: 'たこ焼き、お好み焼き' },
  { id: 'hiroshima', name: '広島県', capital: '広島市', region: '中国', x: 45, y: 55, specialty: 'お好み焼き、牡蠣' },
  { id: 'fukuoka', name: '福岡県', capital: '福岡市', region: '九州', x: 35, y: 58, specialty: '明太子、とんこつラーメン' },
  { id: 'okinawa', name: '沖縄県', capital: '那覇市', region: '九州', x: 20, y: 85, specialty: 'ゴーヤ、サーターアンダギー' }
];

// 都道府県パズル
function PrefecturePuzzle({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'learn' | 'puzzle' | 'quiz'>('learn');
  const [selectedPrefecture, setSelectedPrefecture] = useState<typeof prefectures[0] | null>(null);
  const [placedPrefectures, setPlacedPrefectures] = useState<string[]>([]);
  const [draggedPrefecture, setDraggedPrefecture] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [quizPrefecture, setQuizPrefecture] = useState<typeof prefectures[0] | null>(null);
  const [quizType, setQuizType] = useState<'location' | 'capital' | 'specialty'>('location');
  
  const progress = (placedPrefectures.length / prefectures.length) * 100;
  
  // タイマー
  useEffect(() => {
    if (mode === 'puzzle' && startTime && placedPrefectures.length < prefectures.length) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mode, startTime, placedPrefectures.length]);
  
  // ドラッグ開始
  const handleDragStart = (prefectureId: string) => {
    if (mode === 'puzzle' && !placedPrefectures.includes(prefectureId)) {
      setDraggedPrefecture(prefectureId);
    }
  };
  
  // ドロップ
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedPrefecture === targetId) {
      setPlacedPrefectures(prev => [...prev, targetId]);
      setScore(prev => prev + 1);
      
      if (!startTime) {
        setStartTime(Date.now());
      }
      
      // 全部完成したら
      if (placedPrefectures.length + 1 === prefectures.length) {
        alert(`完成！ かかった時間: ${elapsedTime}秒`);
      }
    } else {
      setAttempts(prev => prev + 1);
    }
    setDraggedPrefecture(null);
  };
  
  // クイズを生成
  const generateQuiz = () => {
    const randomPrefecture = prefectures[Math.floor(Math.random() * prefectures.length)];
    setQuizPrefecture(randomPrefecture);
    const types: ('location' | 'capital' | 'specialty')[] = ['location', 'capital', 'specialty'];
    setQuizType(types[Math.floor(Math.random() * types.length)]);
  };
  
  // クイズの答えをチェック
  const checkQuizAnswer = (prefectureId: string) => {
    if (prefectureId === quizPrefecture?.id) {
      setScore(prev => prev + 1);
      alert('正解！');
      generateQuiz();
    } else {
      setAttempts(prev => prev + 1);
      alert(`残念... 正解は${quizPrefecture?.name}でした`);
    }
  };
  
  // リセット
  const handleReset = () => {
    setPlacedPrefectures([]);
    setScore(0);
    setAttempts(0);
    setStartTime(null);
    setElapsedTime(0);
    setSelectedPrefecture(null);
    if (mode === 'quiz') {
      generateQuiz();
    }
  };
  
  // モード変更
  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (newMode) {
      setMode(newMode as 'learn' | 'puzzle' | 'quiz');
      handleReset();
      if (newMode === 'quiz') {
        generateQuiz();
      }
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          都道府県パズル
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
        日本の都道府県を楽しく学習！パズルゲームで位置関係を覚えよう。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {mode === 'puzzle' && (
          <>
            <Chip 
              label={`配置: ${placedPrefectures.length}/${prefectures.length}`}
              icon={<LocationIcon />}
              color="primary" 
              size="medium"
            />
            <Chip 
              label={`時間: ${elapsedTime}秒`}
              icon={<TimerIcon />}
              color="secondary" 
              size="medium"
            />
          </>
        )}
        {(mode === 'quiz' || mode === 'puzzle') && (
          <>
            <Chip 
              label={`得点: ${score}`} 
              color="success" 
              size="medium"
            />
            <Chip 
              label={`ミス: ${attempts}`} 
              color="error" 
              size="medium"
            />
          </>
        )}
      </Box>

      {/* 進捗バー */}
      {mode === 'puzzle' && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">完成度</Typography>
            <Typography variant="caption">{Math.round(progress)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

      {/* モード選択 */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          fullWidth
        >
          <ToggleButton value="learn">
            学習モード
          </ToggleButton>
          <ToggleButton value="puzzle">
            パズルモード
          </ToggleButton>
          <ToggleButton value="quiz">
            クイズモード
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* クイズモードの問題表示 */}
      {mode === 'quiz' && quizPrefecture && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6">
            {quizType === 'location' && `「${quizPrefecture.name}」はどこ？`}
            {quizType === 'capital' && `県庁所在地が「${quizPrefecture.capital}」の都道府県は？`}
            {quizType === 'specialty' && `特産品が「${quizPrefecture.specialty}」の都道府県は？`}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：地図 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '500px',
              position: 'relative',
              bgcolor: '#E3F2FD',
              overflow: 'hidden'
            }}
          >
            {/* 簡易日本地図 */}
            {prefectures.map(prefecture => {
              const isPlaced = placedPrefectures.includes(prefecture.id);
              const isSelected = selectedPrefecture?.id === prefecture.id;
              
              return (
                <Box
                  key={prefecture.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, prefecture.id)}
                  onClick={() => {
                    if (mode === 'learn') {
                      setSelectedPrefecture(prefecture);
                    } else if (mode === 'quiz') {
                      checkQuizAnswer(prefecture.id);
                    }
                  }}
                  sx={{
                    position: 'absolute',
                    left: `${prefecture.x}%`,
                    top: `${prefecture.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Paper
                    elevation={isSelected ? 6 : 2}
                    sx={{
                      p: 1.5,
                      bgcolor: isPlaced ? 'success.light' : isSelected ? 'primary.light' : 'background.paper',
                      border: mode === 'puzzle' && !isPlaced ? '2px dashed #999' : 'none',
                      opacity: mode === 'puzzle' && !isPlaced ? 0.5 : 1,
                      '&:hover': {
                        transform: 'scale(1.1)',
                        zIndex: 10
                      }
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        color: isPlaced || isSelected ? 'white' : 'text.primary'
                      }}
                    >
                      {mode === 'puzzle' && !isPlaced ? '?' : prefecture.name}
                    </Typography>
                  </Paper>
                  {isPlaced && (
                    <CheckIcon 
                      sx={{ 
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        color: 'success.main',
                        fontSize: 20
                      }} 
                    />
                  )}
                </Box>
              );
            })}
          </Paper>
        </Grid>

        {/* 右側：情報/パズルピース */}
        <Grid size={{ xs: 12, md: 4 }}>
          {mode === 'learn' && selectedPrefecture && (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {selectedPrefecture.name}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="県庁所在地"
                      secondary={selectedPrefecture.capital}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="地方"
                      secondary={selectedPrefecture.region}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="特産品"
                      secondary={selectedPrefecture.specialty}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}
          
          {mode === 'puzzle' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  都道府県を配置しよう
                </Typography>
                <Grid container spacing={1}>
                  {prefectures.map(prefecture => {
                    const isPlaced = placedPrefectures.includes(prefecture.id);
                    return (
                      <Grid size={6} key={prefecture.id}>
                        <Paper
                          draggable={!isPlaced}
                          onDragStart={() => handleDragStart(prefecture.id)}
                          elevation={isPlaced ? 0 : 2}
                          sx={{
                            p: 1,
                            textAlign: 'center',
                            cursor: isPlaced ? 'default' : 'grab',
                            opacity: isPlaced ? 0.3 : 1,
                            bgcolor: isPlaced ? 'grey.200' : 'primary.light',
                            color: isPlaced ? 'text.disabled' : 'white',
                            '&:active': {
                              cursor: isPlaced ? 'default' : 'grabbing'
                            }
                          }}
                        >
                          <Typography variant="caption">
                            {prefecture.name}
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          )}
          
          {mode === 'quiz' && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  クイズのヒント
                </Typography>
                <Typography variant="body2" paragraph>
                  地図をよく見て、都道府県の位置を思い出そう！
                </Typography>
                <Typography variant="body2">
                  • 北から南へ<br/>
                  • 東から西へ<br/>
                  • 地方ごとに覚えよう
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#e8f5e9' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🗾 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 学習モード：都道府県をクリックして詳細を確認<br/>
          • パズルモード：都道府県を正しい位置にドラッグ&ドロップ<br/>
          • クイズモード：問題に答えて知識を確認<br/>
          • 地方ごとにまとめて覚えると効果的です
        </Typography>
      </Paper>
    </Box>
  );
}

export default PrefecturePuzzle;