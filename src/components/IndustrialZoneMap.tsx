import { useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
  Alert,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  Factory as FactoryIcon,
  LocationOn as LocationIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';

// 工業地帯データ
const industrialZones = [
  {
    id: 'keihin',
    name: '京浜工業地帯',
    location: { x: 70, y: 50 },
    prefectures: ['東京', '神奈川'],
    products: ['機械', '化学', '食品'],
    features: '日本最大の工業地帯。東京湾沿岸に広がる。',
    color: '#FF6B6B'
  },
  {
    id: 'chukyo',
    name: '中京工業地帯',
    location: { x: 60, y: 52 },
    prefectures: ['愛知', '岐阜', '三重'],
    products: ['自動車', '航空機', '繊維'],
    features: '自動車産業の中心地。トヨタ自動車の本拠地。',
    color: '#4ECDC4'
  },
  {
    id: 'hanshin',
    name: '阪神工業地帯',
    location: { x: 55, y: 55 },
    prefectures: ['大阪', '兵庫'],
    products: ['機械', '金属', '化学'],
    features: '古くからの工業地帯。中小企業が多い。',
    color: '#45B7D1'
  },
  {
    id: 'kitakyushu',
    name: '北九州工業地帯',
    location: { x: 35, y: 58 },
    prefectures: ['福岡'],
    products: ['鉄鋼', '化学', 'セメント'],
    features: '八幡製鉄所で有名。重化学工業が中心。',
    color: '#96CEB4'
  },
  {
    id: 'keiyo',
    name: '京葉工業地域',
    location: { x: 72, y: 48 },
    prefectures: ['千葉'],
    products: ['石油化学', '鉄鋼', '食品'],
    features: '東京湾東岸の工業地域。石油コンビナートが特徴。',
    color: '#FECA57'
  },
  {
    id: 'tokai',
    name: '東海工業地域',
    location: { x: 62, y: 50 },
    prefectures: ['静岡'],
    products: ['輸送機械', '楽器', '製紙'],
    features: '東海道沿いに発達。ヤマハ、スズキの本拠地。',
    color: '#FF6B9D'
  }
];

// 工業地帯マップ
function IndustrialZoneMap({ onClose }: { onClose: () => void }) {
  const [selectedZone, setSelectedZone] = useState<typeof industrialZones[0] | null>(null);
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [quizType, setQuizType] = useState<'location' | 'product' | 'prefecture'>('location');
  const [quizZone, setQuizZone] = useState<typeof industrialZones[0] | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  const progress = Math.min((score / 10) * 100, 100);
  
  // クイズを生成
  const generateQuiz = () => {
    const randomZone = industrialZones[Math.floor(Math.random() * industrialZones.length)];
    setQuizZone(randomZone);
    const types: ('location' | 'product' | 'prefecture')[] = ['location', 'product', 'prefecture'];
    setQuizType(types[Math.floor(Math.random() * types.length)]);
    setShowHint(false);
  };
  
  // クイズの答えをチェック
  const checkAnswer = (zoneId: string) => {
    setAttempts(prev => prev + 1);
    
    if (zoneId === quizZone?.id) {
      setScore(prev => prev + 1);
      alert('正解！よくできました！');
      generateQuiz();
    } else {
      alert(`残念... 正解は「${quizZone?.name}」でした。`);
    }
  };
  
  // リセット
  const handleReset = () => {
    setSelectedZone(null);
    setScore(0);
    setAttempts(0);
    setShowHint(false);
    if (mode === 'quiz') {
      generateQuiz();
    }
  };
  
  // モード変更
  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (newMode) {
      setMode(newMode as 'learn' | 'quiz');
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
          工業地帯マップ
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
        日本の工業地帯を学習！各地域の特色や主要な工業製品を、インタラクティブな地図で確認しよう。
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {mode === 'learn' && selectedZone && (
          <Chip 
            label={selectedZone.name}
            icon={<FactoryIcon />}
            color="primary" 
            size="medium"
          />
        )}
        {mode === 'quiz' && (
          <>
            <Chip 
              label={`得点: ${score}`} 
              color="success" 
              size="medium"
            />
            <Chip 
              label={`挑戦: ${attempts}`} 
              color="secondary" 
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
          onChange={handleModeChange}
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

      {/* クイズの問題 */}
      {mode === 'quiz' && quizZone && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6">
            {quizType === 'location' && `「${quizZone.name}」はどこ？`}
            {quizType === 'product' && `「${quizZone.products[0]}」の生産が盛んな工業地帯は？`}
            {quizType === 'prefecture' && `「${quizZone.prefectures[0]}県」にある工業地帯は？`}
          </Typography>
          {showHint && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              ヒント: {quizZone.features}
            </Typography>
          )}
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
              bgcolor: '#F0F8FF',
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          >
            {/* 簡易日本地図の輪郭 */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                height: '80%',
                border: '2px solid #ccc',
                borderRadius: '20% 30% 40% 20%',
                bgcolor: 'rgba(255,255,255,0.5)'
              }}
            />
            
            {/* 工業地帯 */}
            {industrialZones.map(zone => {
              const isSelected = selectedZone?.id === zone.id;
              
              return (
                <Box
                  key={zone.id}
                  onClick={() => {
                    if (mode === 'learn') {
                      setSelectedZone(zone);
                    } else if (mode === 'quiz') {
                      checkAnswer(zone.id);
                    }
                  }}
                  sx={{
                    position: 'absolute',
                    left: `${zone.location.x}%`,
                    top: `${zone.location.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: isSelected ? 10 : 1
                  }}
                >
                  <Paper
                    elevation={isSelected ? 6 : 2}
                    sx={{
                      p: 2,
                      bgcolor: zone.color,
                      color: 'white',
                      minWidth: 120,
                      textAlign: 'center',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        zIndex: 5
                      }
                    }}
                  >
                    <FactoryIcon sx={{ fontSize: 30, mb: 1 }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: isSelected ? 'bold' : 'normal'
                      }}
                    >
                      {zone.name}
                    </Typography>
                  </Paper>
                  {isSelected && (
                    <LocationIcon 
                      sx={{ 
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        color: 'error.main',
                        fontSize: 30
                      }} 
                    />
                  )}
                </Box>
              );
            })}
          </Paper>
        </Grid>

        {/* 右側：詳細情報 */}
        <Grid size={{ xs: 12, md: 4 }}>
          {mode === 'learn' ? (
            selectedZone ? (
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ color: selectedZone.color }}>
                    {selectedZone.name}
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="都道府県"
                        secondary={selectedZone.prefectures.join('・')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="主な工業製品"
                        secondary={selectedZone.products.join('・')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="特徴"
                        secondary={selectedZone.features}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    工業地帯を選んでください
                  </Typography>
                  <Typography variant="body2">
                    地図上の工業地帯をクリックすると、詳細情報が表示されます。
                  </Typography>
                </CardContent>
              </Card>
            )
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  クイズのヒント
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setShowHint(true)}
                  disabled={showHint}
                  sx={{ mb: 2 }}
                >
                  ヒントを見る
                </Button>
                <Typography variant="body2">
                  • 工業地帯の位置を覚えよう<br/>
                  • 主要な製品も重要<br/>
                  • 都道府県との関係も確認
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#fff3e0' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🏭 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 四大工業地帯：京浜・中京・阪神・北九州<br/>
          • 太平洋ベルトに沿って発達<br/>
          • 各地域の特色ある産業を覚えよう<br/>
          • 原料の輸入に便利な臨海部に立地
        </Typography>
      </Paper>
    </Box>
  );
}

export default IndustrialZoneMap;