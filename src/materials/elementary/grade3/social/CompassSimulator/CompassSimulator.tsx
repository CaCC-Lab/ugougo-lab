import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, Card, CardContent, Slider, FormControlLabel, Switch } from '@mui/material';
import { Replay, MyLocation, Explore, NorthEast, East, SouthEast, South, SouthWest, West, NorthWest } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Direction {
  name: string;
  angle: number;
  kanji: string;
  reading: string;
}

const directions: Direction[] = [
  { name: 'north', angle: 0, kanji: '北', reading: 'きた' },
  { name: 'northeast', angle: 45, kanji: '北東', reading: 'ほくとう' },
  { name: 'east', angle: 90, kanji: '東', reading: 'ひがし' },
  { name: 'southeast', angle: 135, kanji: '南東', reading: 'なんとう' },
  { name: 'south', angle: 180, kanji: '南', reading: 'みなみ' },
  { name: 'southwest', angle: 225, kanji: '南西', reading: 'なんせい' },
  { name: 'west', angle: 270, kanji: '西', reading: 'にし' },
  { name: 'northwest', angle: 315, kanji: '北西', reading: 'ほくせい' }
];

const landmarks = [
  { name: '学校', direction: 'north', emoji: '🏫' },
  { name: '公園', direction: 'northeast', emoji: '🌳' },
  { name: 'スーパー', direction: 'east', emoji: '🏪' },
  { name: '図書館', direction: 'southeast', emoji: '📚' },
  { name: '駅', direction: 'south', emoji: '🚉' },
  { name: '病院', direction: 'southwest', emoji: '🏥' },
  { name: '郵便局', direction: 'west', emoji: '📮' },
  { name: '消防署', direction: 'northwest', emoji: '🚒' }
];

const CompassSimulator: React.FC = () => {
  const [deviceOrientation, setDeviceOrientation] = useState(0);
  const [manualRotation, setManualRotation] = useState(0);
  const [useDeviceOrientation, setUseDeviceOrientation] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const compassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (useDeviceOrientation && window.DeviceOrientationEvent) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          setDeviceOrientation(360 - event.alpha);
        }
      };

      // デバイスの向きへのアクセス許可を要求（iOS 13+）
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }

      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    }
  }, [useDeviceOrientation]);

  const currentRotation = useDeviceOrientation ? deviceOrientation : manualRotation;

  const handleManualRotation = (_: Event, newValue: number | number[]) => {
    setManualRotation(newValue as number);
  };

  const handleDirectionClick = (direction: Direction) => {
    setSelectedDirection(direction);
    if (!useDeviceOrientation) {
      setManualRotation(direction.angle);
    }
  };

  const resetCompass = () => {
    setManualRotation(0);
    setSelectedDirection(null);
  };

  const getDirectionIcon = (name: string) => {
    switch (name) {
      case 'northeast': return <NorthEast />;
      case 'east': return <East />;
      case 'southeast': return <SouthEast />;
      case 'south': return <South />;
      case 'southwest': return <SouthWest />;
      case 'west': return <West />;
      case 'northwest': return <NorthWest />;
      default: return <Explore />;
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', my: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          ほういじしん シミュレーター
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            ほういじしんを つかって、8つの ほうこうを おぼえよう！
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useDeviceOrientation}
                  onChange={(e) => setUseDeviceOrientation(e.target.checked)}
                />
              }
              label="デバイスの向きを使う"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showLandmarks}
                  onChange={(e) => setShowLandmarks(e.target.checked)}
                />
              }
              label="まちの目印を表示"
            />
          </Box>
        </Box>

        <Paper 
          ref={compassRef}
          sx={{ 
            position: 'relative',
            width: 400,
            height: 400,
            mx: 'auto',
            mb: 3,
            borderRadius: '50%',
            bgcolor: '#f0f4f8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* 背景の円 */}
          <Box
            sx={{
              position: 'absolute',
              width: '90%',
              height: '90%',
              borderRadius: '50%',
              border: '3px solid #333',
              bgcolor: 'white'
            }}
          />

          {/* 方位磁針の針 */}
          <motion.div
            style={{
              position: 'absolute',
              width: '80%',
              height: '80%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            animate={{ rotate: -currentRotation }}
            transition={{ type: 'spring', stiffness: 50 }}
          >
            {/* 北を示す赤い針 */}
            <Box
              sx={{
                position: 'absolute',
                width: 0,
                height: 0,
                borderLeft: '20px solid transparent',
                borderRight: '20px solid transparent',
                borderBottom: '120px solid #ff0000',
                top: '10%'
              }}
            />
            {/* 南を示す白い針 */}
            <Box
              sx={{
                position: 'absolute',
                width: 0,
                height: 0,
                borderLeft: '20px solid transparent',
                borderRight: '20px solid transparent',
                borderTop: '120px solid #666',
                bottom: '10%'
              }}
            />
            {/* 中心の円 */}
            <Box
              sx={{
                position: 'absolute',
                width: 30,
                height: 30,
                borderRadius: '50%',
                bgcolor: '#333',
                border: '3px solid white'
              }}
            />
          </motion.div>

          {/* 方位表示 */}
          <motion.div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%'
            }}
            animate={{ rotate: -currentRotation }}
            transition={{ type: 'spring', stiffness: 50 }}
          >
            {directions.map((direction) => (
              <Box
                key={direction.name}
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${direction.angle}deg) translateY(-160px) rotate(-${direction.angle}deg)`,
                  cursor: 'pointer',
                  transition: 'transform 0.3s'
                }}
                onClick={() => handleDirectionClick(direction)}
              >
                <Paper
                  sx={{
                    p: 1,
                    bgcolor: selectedDirection?.name === direction.name ? 'primary.main' : 'white',
                    color: selectedDirection?.name === direction.name ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: selectedDirection?.name === direction.name ? 'primary.dark' : 'grey.100',
                      transform: 'scale(1.1)'
                    }
                  }}
                  elevation={3}
                >
                  <Typography variant="h6" align="center">
                    {direction.kanji}
                  </Typography>
                  <Typography variant="caption" align="center" display="block">
                    {direction.reading}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </motion.div>

          {/* ランドマーク表示 */}
          {showLandmarks && (
            <motion.div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%'
              }}
              animate={{ rotate: -currentRotation }}
              transition={{ type: 'spring', stiffness: 50 }}
            >
              {landmarks.map((landmark) => {
                const dir = directions.find(d => d.name === landmark.direction);
                if (!dir) return null;
                
                return (
                  <Box
                    key={landmark.name}
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) rotate(${dir.angle}deg) translateY(-100px) rotate(-${dir.angle}deg)`,
                      fontSize: '24px'
                    }}
                    title={landmark.name}
                  >
                    {landmark.emoji}
                  </Box>
                );
              })}
            </motion.div>
          )}
        </Paper>

        {!useDeviceOrientation && (
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>方位磁針を回転させる</Typography>
            <Slider
              value={manualRotation}
              onChange={handleManualRotation}
              min={0}
              max={360}
              step={1}
              marks={[
                { value: 0, label: '北' },
                { value: 90, label: '東' },
                { value: 180, label: '南' },
                { value: 270, label: '西' }
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}°`}
            />
          </Box>
        )}

        {selectedDirection && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6" gutterBottom>
              {selectedDirection.kanji}（{selectedDirection.reading}）
            </Typography>
            <Typography variant="body2">
              角度: {selectedDirection.angle}度
            </Typography>
            {showLandmarks && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                この方向にあるもの: {landmarks.find(l => l.name === selectedDirection.name)?.emoji} {landmarks.find(l => l.direction === selectedDirection.name)?.name}
              </Typography>
            )}
          </Paper>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Replay />}
            onClick={resetCompass}
          >
            リセット
          </Button>
          {useDeviceOrientation && (
            <Button
              variant="outlined"
              startIcon={<MyLocation />}
              onClick={() => setManualRotation(0)}
            >
              北を上にする
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CompassSimulator;