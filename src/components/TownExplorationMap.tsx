import { useState, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Refresh as RefreshIcon,
  School as SchoolIcon,
  LocalHospital as HospitalIcon,
  Store as StoreIcon,
  LocalLibrary as LibraryIcon,
  Park as ParkIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

// 施設の情報
interface Facility {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'store' | 'library' | 'park';
  x: number; // パーセンテージ
  y: number; // パーセンテージ
  description: string;
  icon: React.ElementType;
  visited: boolean;
}

// 町探検マップ
function TownExplorationMap({ onClose }: { onClose: () => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [facilities, setFacilities] = useState<Facility[]>([
    {
      id: 'school',
      name: 'みんなの小学校',
      type: 'school',
      x: 20,
      y: 30,
      description: '毎日べんきょうしたり、あそんだりする場所です。先生やおともだちがいます。',
      icon: SchoolIcon,
      visited: false
    },
    {
      id: 'hospital',
      name: 'まちの病院',
      type: 'hospital',
      x: 70,
      y: 20,
      description: 'びょうきやけがをしたときに、おいしゃさんがなおしてくれる場所です。',
      icon: HospitalIcon,
      visited: false
    },
    {
      id: 'store',
      name: 'スーパーマーケット',
      type: 'store',
      x: 50,
      y: 60,
      description: 'たべものや、にちようひんをかうことができる場所です。',
      icon: StoreIcon,
      visited: false
    },
    {
      id: 'library',
      name: 'としょかん',
      type: 'library',
      x: 30,
      y: 70,
      description: 'たくさんのほんがあって、しずかにべんきょうできる場所です。',
      icon: LibraryIcon,
      visited: false
    },
    {
      id: 'park',
      name: 'こうえん',
      type: 'park',
      x: 80,
      y: 50,
      description: 'ブランコやすべりだいであそんだり、しぜんをかんじることができる場所です。',
      icon: ParkIcon,
      visited: false
    }
  ]);
  
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizFacility, setQuizFacility] = useState<Facility | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  // 訪問した施設数
  const visitedCount = facilities.filter(f => f.visited).length;
  const progress = (visitedCount / facilities.length) * 100;
  
  // 施設をクリック
  const handleFacilityClick = (facility: Facility) => {
    if (quizMode) {
      // クイズモード
      if (facility.id === quizFacility?.id) {
        setScore(prev => prev + 1);
        alert('せいかい！');
        startQuiz();
      } else {
        alert('ざんねん！もういちどチャレンジ！');
      }
      setAttempts(prev => prev + 1);
    } else {
      // 探検モード
      setSelectedFacility(facility);
      setShowDialog(true);
      
      // 訪問済みにする
      setFacilities(prev => prev.map(f => 
        f.id === facility.id ? { ...f, visited: true } : f
      ));
    }
  };
  
  // クイズを開始
  const startQuiz = () => {
    const unvisitedFacilities = facilities.filter(f => !f.visited);
    if (unvisitedFacilities.length > 0) {
      const randomFacility = unvisitedFacilities[Math.floor(Math.random() * unvisitedFacilities.length)];
      setQuizFacility(randomFacility);
    } else {
      // 全部訪問済みならランダムに選ぶ
      const randomFacility = facilities[Math.floor(Math.random() * facilities.length)];
      setQuizFacility(randomFacility);
    }
  };
  
  // リセット
  const handleReset = () => {
    setFacilities(prev => prev.map(f => ({ ...f, visited: false })));
    setScore(0);
    setAttempts(0);
    setQuizMode(false);
    setQuizFacility(null);
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          町探検マップ
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
        町のいろいろな場所をクリックして、どんな場所か調べてみよう！
      </Typography>

      {/* 状況表示 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip 
          label={`訪問: ${visitedCount}/${facilities.length}`}
          color="primary" 
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
              color="secondary" 
              size="medium"
            />
          </>
        )}
      </Box>

      {/* 進捗バー */}
      {!quizMode && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">探検の進捗</Typography>
            <Typography variant="caption">{Math.round(progress)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

      {/* モード切り替え */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant={!quizMode ? 'contained' : 'outlined'}
          onClick={() => setQuizMode(false)}
        >
          探検モード
        </Button>
        <Button
          variant={quizMode ? 'contained' : 'outlined'}
          onClick={() => {
            setQuizMode(true);
            startQuiz();
          }}
          disabled={visitedCount === 0}
        >
          クイズモード
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左側：マップ */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper 
            ref={mapRef}
            elevation={2} 
            sx={{ 
              height: '500px',
              position: 'relative',
              bgcolor: '#E8F5E9',
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 20px,
                  rgba(0,0,0,0.03) 20px,
                  rgba(0,0,0,0.03) 21px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 20px,
                  rgba(0,0,0,0.03) 20px,
                  rgba(0,0,0,0.03) 21px
                )
              `,
              overflow: 'hidden'
            }}
          >
            {/* 道路（装飾） */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '40px',
                bgcolor: '#9E9E9E',
                transform: 'translateY(-50%)'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '40px',
                bgcolor: '#9E9E9E',
                transform: 'translateX(-50%)'
              }}
            />
            
            {/* 施設 */}
            {facilities.map((facility) => {
              const Icon = facility.icon;
              return (
                <Box
                  key={facility.id}
                  onClick={() => handleFacilityClick(facility)}
                  sx={{
                    position: 'absolute',
                    left: `${facility.x}%`,
                    top: `${facility.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translate(-50%, -50%) scale(1.1)'
                    }
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      bgcolor: facility.visited ? 'primary.light' : 'background.paper',
                      border: quizMode && quizFacility?.id === facility.id ? '3px solid #FF6B6B' : 'none'
                    }}
                  >
                    <Icon sx={{ fontSize: 40, color: facility.visited ? 'white' : 'primary.main' }} />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        textAlign: 'center',
                        mt: 1,
                        color: facility.visited ? 'white' : 'text.primary'
                      }}
                    >
                      {facility.name}
                    </Typography>
                  </Paper>
                  {facility.visited && (
                    <LocationIcon 
                      sx={{ 
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        color: 'success.main',
                        fontSize: 24
                      }} 
                    />
                  )}
                </Box>
              );
            })}
          </Paper>
        </Grid>

        {/* 右側：情報 */}
        <Grid size={{ xs: 12, md: 4 }}>
          {quizMode ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  クイズ
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  「{quizFacility?.name}」はどこかな？
                  地図の中から見つけてクリックしよう！
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ヒント：{quizFacility?.description}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  探検のヒント
                </Typography>
                <Typography variant="body2" paragraph>
                  🏫 学校：みんなが毎日かよう場所
                </Typography>
                <Typography variant="body2" paragraph>
                  🏥 病院：けがやびょうきのときに行く場所
                </Typography>
                <Typography variant="body2" paragraph>
                  🏪 お店：かいものをする場所
                </Typography>
                <Typography variant="body2" paragraph>
                  📚 図書館：本をかりたり、よんだりする場所
                </Typography>
                <Typography variant="body2" paragraph>
                  🌳 公園：あそんだり、うんどうする場所
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 施設詳細ダイアログ */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedFacility?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {selectedFacility?.description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            この場所について、おうちの人や先生に聞いてみよう！
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>とじる</Button>
        </DialogActions>
      </Dialog>

      {/* 説明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#fff3e0' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          🗺️ 学習のポイント：
        </Typography>
        <Typography variant="body2">
          • 町にはいろいろな施設があり、それぞれ大切な役割があります<br/>
          • 探検モードですべての場所を訪問してみよう<br/>
          • クイズモードで場所を覚えているか確認しよう<br/>
          • 実際の町でも、安全に気をつけて探検してみよう
        </Typography>
      </Paper>
    </Box>
  );
}

export default TownExplorationMap;