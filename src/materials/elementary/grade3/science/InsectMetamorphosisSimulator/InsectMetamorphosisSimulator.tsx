import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Card, CardContent, Select, MenuItem, FormControl, InputLabel, LinearProgress, IconButton } from '@mui/material';
import { PlayArrow, Pause, Replay, Speed } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

type MetamorphosisType = 'complete' | 'incomplete';
type InsectType = 'butterfly' | 'beetle' | 'grasshopper' | 'dragonfly';

interface StageInfo {
  name: string;
  duration: number; // 秒数
  description: string;
  emoji: string;
}

interface InsectData {
  name: string;
  type: MetamorphosisType;
  stages: StageInfo[];
}

const insectDatabase: Record<InsectType, InsectData> = {
  butterfly: {
    name: 'チョウ',
    type: 'complete',
    stages: [
      { name: 'たまご', duration: 3, description: 'ハッパの うらに ちいさな たまごを うみます', emoji: '🥚' },
      { name: 'ようちゅう', duration: 5, description: 'あおむしが はっぱを たくさん たべて おおきくなります', emoji: '🐛' },
      { name: 'さなぎ', duration: 4, description: 'さなぎの なかで からだが へんかします', emoji: '🛡️' },
      { name: 'せいちゅう', duration: 5, description: 'きれいな はねを もった チョウに なります', emoji: '🦋' }
    ]
  },
  beetle: {
    name: 'カブトムシ',
    type: 'complete',
    stages: [
      { name: 'たまご', duration: 3, description: 'つちの なかに しろい たまごを うみます', emoji: '🥚' },
      { name: 'ようちゅう', duration: 5, description: 'つちの なかで くさった はっぱを たべます', emoji: '🐛' },
      { name: 'さなぎ', duration: 4, description: 'つちの なかで さなぎに なります', emoji: '🛡️' },
      { name: 'せいちゅう', duration: 5, description: 'つよい つのを もった カブトムシに なります', emoji: '🪲' }
    ]
  },
  grasshopper: {
    name: 'バッタ',
    type: 'incomplete',
    stages: [
      { name: 'たまご', duration: 4, description: 'つちの なかに たまごを うみます', emoji: '🥚' },
      { name: 'ようちゅう', duration: 6, description: 'ちいさな バッタが なんかいも だっぴして おおきくなります', emoji: '🦗' },
      { name: 'せいちゅう', duration: 5, description: 'はねが はえて とべるように なります', emoji: '🦗' }
    ]
  },
  dragonfly: {
    name: 'トンボ',
    type: 'incomplete',
    stages: [
      { name: 'たまご', duration: 3, description: 'みずの なかに たまごを うみます', emoji: '🥚' },
      { name: 'ようちゅう（ヤゴ）', duration: 6, description: 'みずの なかで ちいさな むしを たべて そだちます', emoji: '🦐' },
      { name: 'せいちゅう', duration: 5, description: 'みずから でて とべる トンボに なります', emoji: '🪰' }
    ]
  }
};

const InsectMetamorphosisSimulator: React.FC = () => {
  const [selectedInsect, setSelectedInsect] = useState<InsectType>('butterfly');
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const insectData = insectDatabase[selectedInsect];
  const currentStageInfo = insectData.stages[currentStage];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (currentStageInfo.duration * 10)) * speed;
          
          if (newProgress >= 100) {
            if (currentStage < insectData.stages.length - 1) {
              setCurrentStage(currentStage + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          
          return newProgress;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentStage, currentStageInfo.duration, insectData.stages.length, speed]);

  const handleInsectChange = (insect: InsectType) => {
    setSelectedInsect(insect);
    setCurrentStage(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStage(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 2];
    const currentIndex = speeds.indexOf(speed);
    setSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  const getStageEmoji = (stage: number) => {
    const stageInfo = insectData.stages[stage];
    return stageInfo.emoji;
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', my: 2 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          こんちゅうの へんたい シミュレーター
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>こんちゅうを えらぼう</InputLabel>
            <Select
              value={selectedInsect}
              label="こんちゅうを えらぼう"
              onChange={(e) => handleInsectChange(e.target.value as InsectType)}
            >
              <MenuItem value="butterfly">チョウ（かんぜんへんたい）</MenuItem>
              <MenuItem value="beetle">カブトムシ（かんぜんへんたい）</MenuItem>
              <MenuItem value="grasshopper">バッタ（ふかんぜんへんたい）</MenuItem>
              <MenuItem value="dragonfly">トンボ（ふかんぜんへんたい）</MenuItem>
            </Select>
          </FormControl>

          <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>{insectData.type === 'complete' ? 'かんぜんへんたい' : 'ふかんぜんへんたい'}</strong>
            </Typography>
            <Typography variant="body2">
              {insectData.type === 'complete' 
                ? 'たまご → ようちゅう → さなぎ → せいちゅう' 
                : 'たまご → ようちゅう → せいちゅう'}
            </Typography>
          </Paper>
        </Box>

        <Paper sx={{ p: 3, bgcolor: '#f5f5f5', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.5 }}
                style={{ fontSize: '120px' }}
              >
                {getStageEmoji(currentStage)}
              </motion.div>
            </AnimatePresence>
          </Box>

          <Typography variant="h6" align="center" gutterBottom>
            {currentStageInfo.name}
          </Typography>

          <Typography variant="body2" align="center" sx={{ mb: 2 }}>
            {currentStageInfo.description}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <IconButton onClick={handlePlayPause} color="primary" size="large">
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton onClick={handleReset} color="secondary" size="large">
              <Replay />
            </IconButton>
            <IconButton onClick={handleSpeedChange} color="default" size="large">
              <Speed />
              <Typography variant="caption" sx={{ position: 'absolute', bottom: -5 }}>
                x{speed}
              </Typography>
            </IconButton>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {insectData.stages.map((stage, index) => (
            <React.Fragment key={index}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: index === currentStage ? 1 : 0.5,
                  transition: 'opacity 0.3s'
                }}
              >
                <Typography variant="h4">{stage.emoji}</Typography>
                <Typography variant="caption">{stage.name}</Typography>
              </Box>
              {index < insectData.stages.length - 1 && (
                <Box sx={{ mx: 1 }}>→</Box>
              )}
            </React.Fragment>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InsectMetamorphosisSimulator;