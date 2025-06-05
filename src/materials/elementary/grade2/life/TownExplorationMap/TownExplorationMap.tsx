import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, IconButton, Dialog, DialogTitle, DialogContent, Button, Card, CardContent } from '@mui/material';
import { Replay, VolumeUp, VolumeOff, Close, School, LocalHospital, Store, LocalLibrary, Park, LocalPostOffice } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Position {
  x: number;
  y: number;
}

interface Facility {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'store' | 'library' | 'park' | 'postoffice';
  position: Position;
  description: string;
  image?: string;
  visited: boolean;
}

const TownExplorationMap: React.FC = () => {
  const [characterPosition, setCharacterPosition] = useState<Position>({ x: 300, y: 300 });
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [visitedCount, setVisitedCount] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  const facilities: Facility[] = [
    {
      id: 'school',
      name: 'みんなの小学校',
      type: 'school',
      position: { x: 150, y: 100 },
      description: '毎日べんきょうしたり、あそんだりする場所です。先生やおともだちがいます。',
      visited: false
    },
    {
      id: 'hospital',
      name: 'まちの病院',
      type: 'hospital',
      position: { x: 450, y: 150 },
      description: 'びょうきやけがをしたときに、おいしゃさんがなおしてくれる場所です。',
      visited: false
    },
    {
      id: 'store',
      name: 'スーパーマーケット',
      type: 'store',
      position: { x: 300, y: 400 },
      description: 'たべものやにちようひんを買うことができる場所です。',
      visited: false
    },
    {
      id: 'library',
      name: 'としょかん',
      type: 'library',
      position: { x: 500, y: 300 },
      description: 'たくさんの本があって、しずかに本をよむことができる場所です。',
      visited: false
    },
    {
      id: 'park',
      name: 'みどり公園',
      type: 'park',
      position: { x: 100, y: 350 },
      description: 'ブランコやすべりだいがあって、みんなであそべる場所です。',
      visited: false
    },
    {
      id: 'postoffice',
      name: 'ゆうびんきょく',
      type: 'postoffice',
      position: { x: 350, y: 200 },
      description: 'てがみやにもつをおくったり、とどけたりしてくれる場所です。',
      visited: false
    }
  ];

  const [facilityStates, setFacilityStates] = useState(facilities);

  useEffect(() => {
    if (targetPosition) {
      const moveInterval = setInterval(() => {
        setCharacterPosition(prev => {
          const dx = targetPosition.x - prev.x;
          const dy = targetPosition.y - prev.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 5) {
            setTargetPosition(null);
            checkFacilityCollision({ x: targetPosition.x, y: targetPosition.y });
            return targetPosition;
          }

          const speed = 3;
          const ratio = speed / distance;
          return {
            x: prev.x + dx * ratio,
            y: prev.y + dy * ratio
          };
        });
      }, 16);

      return () => clearInterval(moveInterval);
    }
  }, [targetPosition, checkFacilityCollision]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setTargetPosition({ x, y });
    }
  };

  const checkFacilityCollision = useCallback((position: Position) => {
    facilityStates.forEach((facility, index) => {
      const distance = Math.sqrt(
        Math.pow(position.x - facility.position.x, 2) +
        Math.pow(position.y - facility.position.y, 2)
      );

      if (distance < 40 && !facility.visited) {
        const updatedFacilities = [...facilityStates];
        updatedFacilities[index] = { ...facility, visited: true };
        setFacilityStates(updatedFacilities);
        setSelectedFacility(facility);
        setVisitedCount(prev => prev + 1);
        setShowDialog(true);
        playSound();
      }
    });
  }, [facilityStates, playSound]);

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    // 実際の実装では音声ファイルを再生
  }, [soundEnabled]);

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'school': return <School sx={{ fontSize: 40 }} />;
      case 'hospital': return <LocalHospital sx={{ fontSize: 40 }} />;
      case 'store': return <Store sx={{ fontSize: 40 }} />;
      case 'library': return <LocalLibrary sx={{ fontSize: 40 }} />;
      case 'park': return <Park sx={{ fontSize: 40 }} />;
      case 'postoffice': return <LocalPostOffice sx={{ fontSize: 40 }} />;
      default: return null;
    }
  };

  const resetGame = () => {
    setCharacterPosition({ x: 300, y: 300 });
    setTargetPosition(null);
    setFacilityStates(facilities);
    setVisitedCount(0);
    setSelectedFacility(null);
    setShowDialog(false);
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', my: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            まちたんけんマップ
          </Typography>
          <Box>
            <IconButton onClick={() => setSoundEnabled(!soundEnabled)} color="primary">
              {soundEnabled ? <VolumeUp /> : <VolumeOff />}
            </IconButton>
            <IconButton onClick={resetGame} color="primary">
              <Replay />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mb: 2 }}>
          マップをクリックして、キャラクターをうごかそう！まちのいろいろな場所をたんけんしよう！
        </Typography>

        <Paper
          ref={mapRef}
          sx={{
            width: '100%',
            height: 500,
            position: 'relative',
            bgcolor: '#e8f5e9',
            cursor: 'pointer',
            overflow: 'hidden',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(0,0,0,.02) 50px, rgba(0,0,0,.02) 100px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,.02) 50px, rgba(0,0,0,.02) 100px)'
          }}
          onClick={handleMapClick}
        >
          {/* 道路 */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 40,
              bgcolor: '#9e9e9e',
              transform: 'translateY(-50%)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 40,
              bgcolor: '#9e9e9e',
              transform: 'translateX(-50%)'
            }}
          />

          {/* 施設 */}
          {facilityStates.map((facility) => (
            <motion.div
              key={facility.id}
              style={{
                position: 'absolute',
                left: facility.position.x - 30,
                top: facility.position.y - 30,
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: facility.visited ? '#4caf50' : '#2196f3',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
              whileHover={{ scale: 1.1 }}
              animate={{ scale: facility.visited ? [1, 1.2, 1] : 1 }}
            >
              {getFacilityIcon(facility.type)}
            </motion.div>
          ))}

          {/* キャラクター */}
          <motion.div
            style={{
              position: 'absolute',
              left: characterPosition.x - 20,
              top: characterPosition.y - 20,
              width: 40,
              height: 40,
              backgroundColor: '#ff5722',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
            animate={{
              x: 0,
              y: targetPosition ? [0, -5, 0] : 0
            }}
            transition={{
              y: {
                repeat: targetPosition ? Infinity : 0,
                duration: 0.5
              }
            }}
          >
            😊
          </motion.div>
        </Paper>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            たんけんした場所: {visitedCount} / {facilities.length}
          </Typography>
          {visitedCount === facilities.length && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <Typography variant="h6" color="success.main">
                ぜんぶたんけんできました！🎉
              </Typography>
            </motion.div>
          )}
        </Box>

        {/* 施設情報ダイアログ */}
        <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedFacility?.name}
            <IconButton onClick={() => setShowDialog(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: '#4caf50', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                mx: 'auto',
                mb: 2
              }}>
                {selectedFacility && getFacilityIcon(selectedFacility.type)}
              </Box>
              <Typography variant="body1">
                {selectedFacility?.description}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Button variant="contained" onClick={() => setShowDialog(false)}>
                とじる
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TownExplorationMap;