import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Button, Card, CardContent, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { Replay, EmojiEvents, Help, Timer } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

type Region = 'hokkaido' | 'tohoku' | 'kanto' | 'chubu' | 'kinki' | 'chugoku' | 'shikoku' | 'kyushu' | 'all';
type Difficulty = 'easy' | 'normal' | 'hard';

interface Prefecture {
  id: string;
  name: string;
  region: string;
  capital: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
}

const prefectures: Prefecture[] = [
  // 北海道地方
  { id: 'hokkaido', name: '北海道', region: 'hokkaido', capital: '札幌市', position: { x: 320, y: 50 }, size: { width: 80, height: 60 }, color: '#ff6b6b' },
  
  // 東北地方
  { id: 'aomori', name: '青森県', region: 'tohoku', capital: '青森市', position: { x: 320, y: 120 }, size: { width: 60, height: 40 }, color: '#4ecdc4' },
  { id: 'iwate', name: '岩手県', region: 'tohoku', capital: '盛岡市', position: { x: 340, y: 160 }, size: { width: 50, height: 50 }, color: '#4ecdc4' },
  { id: 'miyagi', name: '宮城県', region: 'tohoku', capital: '仙台市', position: { x: 340, y: 210 }, size: { width: 50, height: 40 }, color: '#4ecdc4' },
  { id: 'akita', name: '秋田県', region: 'tohoku', capital: '秋田市', position: { x: 290, y: 160 }, size: { width: 50, height: 50 }, color: '#4ecdc4' },
  { id: 'yamagata', name: '山形県', region: 'tohoku', capital: '山形市', position: { x: 290, y: 210 }, size: { width: 50, height: 40 }, color: '#4ecdc4' },
  { id: 'fukushima', name: '福島県', region: 'tohoku', capital: '福島市', position: { x: 315, y: 250 }, size: { width: 60, height: 40 }, color: '#4ecdc4' },
  
  // 関東地方
  { id: 'ibaraki', name: '茨城県', region: 'kanto', capital: '水戸市', position: { x: 340, y: 290 }, size: { width: 40, height: 40 }, color: '#45b7d1' },
  { id: 'tochigi', name: '栃木県', region: 'kanto', capital: '宇都宮市', position: { x: 300, y: 290 }, size: { width: 40, height: 40 }, color: '#45b7d1' },
  { id: 'gunma', name: '群馬県', region: 'kanto', capital: '前橋市', position: { x: 260, y: 290 }, size: { width: 40, height: 40 }, color: '#45b7d1' },
  { id: 'saitama', name: '埼玉県', region: 'kanto', capital: 'さいたま市', position: { x: 280, y: 330 }, size: { width: 50, height: 30 }, color: '#45b7d1' },
  { id: 'chiba', name: '千葉県', region: 'kanto', capital: '千葉市', position: { x: 340, y: 330 }, size: { width: 40, height: 50 }, color: '#45b7d1' },
  { id: 'tokyo', name: '東京都', region: 'kanto', capital: '東京', position: { x: 300, y: 360 }, size: { width: 30, height: 20 }, color: '#45b7d1' },
  { id: 'kanagawa', name: '神奈川県', region: 'kanto', capital: '横浜市', position: { x: 300, y: 380 }, size: { width: 40, height: 30 }, color: '#45b7d1' },
  
  // 中部地方（一部）
  { id: 'yamanashi', name: '山梨県', region: 'chubu', capital: '甲府市', position: { x: 260, y: 350 }, size: { width: 40, height: 30 }, color: '#f7b731' },
  { id: 'shizuoka', name: '静岡県', region: 'chubu', capital: '静岡市', position: { x: 260, y: 380 }, size: { width: 60, height: 30 }, color: '#f7b731' },
  { id: 'aichi', name: '愛知県', region: 'chubu', capital: '名古屋市', position: { x: 220, y: 380 }, size: { width: 40, height: 30 }, color: '#f7b731' },
  
  // 近畿地方（一部）
  { id: 'osaka', name: '大阪府', region: 'kinki', capital: '大阪市', position: { x: 180, y: 380 }, size: { width: 30, height: 30 }, color: '#a55eea' },
  { id: 'kyoto', name: '京都府', region: 'kinki', capital: '京都市', position: { x: 180, y: 350 }, size: { width: 30, height: 30 }, color: '#a55eea' },
  { id: 'hyogo', name: '兵庫県', region: 'kinki', capital: '神戸市', position: { x: 150, y: 360 }, size: { width: 40, height: 40 }, color: '#a55eea' },
  
  // 中国地方（一部）
  { id: 'hiroshima', name: '広島県', region: 'chugoku', capital: '広島市', position: { x: 100, y: 360 }, size: { width: 40, height: 30 }, color: '#26de81' },
  { id: 'okayama', name: '岡山県', region: 'chugoku', capital: '岡山市', position: { x: 140, y: 360 }, size: { width: 40, height: 30 }, color: '#26de81' },
  
  // 九州地方（一部）
  { id: 'fukuoka', name: '福岡県', region: 'kyushu', capital: '福岡市', position: { x: 50, y: 380 }, size: { width: 40, height: 30 }, color: '#fd79a8' },
  { id: 'okinawa', name: '沖縄県', region: 'kyushu', capital: '那覇市', position: { x: 30, y: 450 }, size: { width: 40, height: 20 }, color: '#fd79a8' },
];

const PrefecturePuzzle: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [placedPrefectures, setPlacedPrefectures] = useState<Set<string>>(new Set());
  const [draggedPrefecture, setDraggedPrefecture] = useState<Prefecture | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const visiblePrefectures = selectedRegion === 'all' 
    ? prefectures 
    : prefectures.filter(p => p.region === selectedRegion);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !isCompleted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isCompleted]);

  useEffect(() => {
    if (placedPrefectures.size === visiblePrefectures.length && visiblePrefectures.length > 0) {
      setIsCompleted(true);
      setIsTimerRunning(false);
    }
  }, [placedPrefectures, visiblePrefectures]);

  const handleDragStart = (prefecture: Prefecture) => {
    setDraggedPrefecture(prefecture);
    if (!isTimerRunning && placedPrefectures.size === 0) {
      setIsTimerRunning(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPrefecture || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 正解位置との距離を計算
    const distance = Math.sqrt(
      Math.pow(x - draggedPrefecture.position.x, 2) + 
      Math.pow(y - draggedPrefecture.position.y, 2)
    );

    // 難易度による許容範囲
    const tolerance = difficulty === 'easy' ? 50 : difficulty === 'normal' ? 30 : 15;

    if (distance < tolerance) {
      setPlacedPrefectures(prev => new Set([...prev, draggedPrefecture.id]));
    }
    
    setDraggedPrefecture(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const resetGame = () => {
    setPlacedPrefectures(new Set());
    setTimer(0);
    setIsTimerRunning(false);
    setIsCompleted(false);
    setShowHints(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card sx={{ maxWidth: 900, mx: 'auto', my: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          とどうふけん パズル
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>ちいき</InputLabel>
            <Select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value as Region)}>
              <MenuItem value="all">ぜんこく</MenuItem>
              <MenuItem value="hokkaido">ほっかいどう</MenuItem>
              <MenuItem value="tohoku">とうほく</MenuItem>
              <MenuItem value="kanto">かんとう</MenuItem>
              <MenuItem value="chubu">ちゅうぶ</MenuItem>
              <MenuItem value="kinki">きんき</MenuItem>
              <MenuItem value="chugoku">ちゅうごく</MenuItem>
              <MenuItem value="shikoku">しこく</MenuItem>
              <MenuItem value="kyushu">きゅうしゅう</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>なんいど</InputLabel>
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
              <MenuItem value="easy">かんたん</MenuItem>
              <MenuItem value="normal">ふつう</MenuItem>
              <MenuItem value="hard">むずかしい</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Help />}
            onClick={() => setShowHints(!showHints)}
          >
            ヒント
          </Button>

          <Button
            variant="contained"
            startIcon={<Replay />}
            onClick={resetGame}
          >
            リセット
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Chip icon={<Timer />} label={`じかん: ${formatTime(timer)}`} />
          <Chip 
            label={`かんせい: ${placedPrefectures.size} / ${visiblePrefectures.length}`}
            color={isCompleted ? 'success' : 'default'}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* 日本地図エリア */}
          <Paper
            ref={mapRef}
            sx={{
              flex: 1,
              height: 500,
              position: 'relative',
              bgcolor: '#e3f2fd',
              border: '2px dashed #90caf9',
              overflow: 'hidden'
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* ヒント表示 */}
            {showHints && visiblePrefectures.map(prefecture => (
              <Box
                key={`hint-${prefecture.id}`}
                sx={{
                  position: 'absolute',
                  left: prefecture.position.x - prefecture.size.width / 2,
                  top: prefecture.position.y - prefecture.size.height / 2,
                  width: prefecture.size.width,
                  height: prefecture.size.height,
                  border: '2px dashed rgba(0,0,0,0.3)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: 'rgba(0,0,0,0.5)',
                  pointerEvents: 'none'
                }}
              >
                {prefecture.name}
              </Box>
            ))}

            {/* 配置済みの都道府県 */}
            {visiblePrefectures.filter(p => placedPrefectures.has(p.id)).map(prefecture => (
              <motion.div
                key={`placed-${prefecture.id}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  left: prefecture.position.x - prefecture.size.width / 2,
                  top: prefecture.position.y - prefecture.size.height / 2,
                  width: prefecture.size.width,
                  height: prefecture.size.height,
                  backgroundColor: prefecture.color,
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <div>{prefecture.name}</div>
                {difficulty === 'easy' && (
                  <div style={{ fontSize: '10px' }}>{prefecture.capital}</div>
                )}
              </motion.div>
            ))}
          </Paper>

          {/* 都道府県ピース置き場 */}
          <Paper sx={{ width: 200, p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle2" gutterBottom>
              とどうふけん
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {visiblePrefectures.filter(p => !placedPrefectures.has(p.id)).map(prefecture => (
                <motion.div
                  key={`piece-${prefecture.id}`}
                  draggable
                  onDragStart={() => handleDragStart(prefecture)}
                  whileHover={{ scale: 1.05 }}
                  whileDrag={{ scale: 1.1, opacity: 0.8 }}
                  style={{
                    backgroundColor: prefecture.color,
                    padding: '8px 12px',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'grab',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {prefecture.name}
                </motion.div>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* 完成メッセージ */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Paper sx={{ p: 3, mt: 2, bgcolor: 'success.light', color: 'white', textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <EmojiEvents sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6">かんせい！</Typography>
                    <Typography>
                      じかん: {formatTime(timer)} / なんいど: {difficulty === 'easy' ? 'かんたん' : difficulty === 'normal' ? 'ふつう' : 'むずかしい'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default PrefecturePuzzle;