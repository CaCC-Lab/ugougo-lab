import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  ToggleButton, 
  ToggleButtonGroup,
  Slider,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import { 
  Favorite, 
  Air, 
  Restaurant,
  PlayArrow,
  Pause,
  Quiz,
  Speed
} from '@mui/icons-material';
import { MaterialBase } from '@components/educational';
import { CirculatorySystem } from './components/CirculatorySystem';
import { RespiratorySystem } from './components/RespiratorySystem';
import { DigestiveSystem } from './components/DigestiveSystem';
import { OrganInfo } from './components/OrganInfo';
import { SystemQuiz } from './components/SystemQuiz';
import { useBodyAnimation } from './hooks/useBodyAnimation';

type BodySystem = 'circulatory' | 'respiratory' | 'digestive';

export interface Organ {
  id: string;
  name: string;
  system: BodySystem;
  position: { x: number; y: number };
  description: string;
  function: string;
}

const HumanBodyAnimation: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<BodySystem>('circulatory');
  const [isPlaying, setIsPlaying] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [selectedOrgan, setSelectedOrgan] = useState<Organ | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [heartRate, setHeartRate] = useState(70);
  const [breathingRate, setBreathingRate] = useState(16);

  const { organs, getSystemOrgans } = useBodyAnimation();

  const handleSystemChange = (
    event: React.MouseEvent<HTMLElement>,
    newSystem: BodySystem | null
  ) => {
    if (newSystem !== null) {
      setSelectedSystem(newSystem);
      setSelectedOrgan(null);
    }
  };

  const handleOrganClick = (organId: string) => {
    const organ = organs.find(o => o.id === organId);
    if (organ) {
      setSelectedOrgan(organ);
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    setShowQuiz(false);
    console.log(`クイズ完了: ${score}/${total}`);
  };

  const getSystemInfo = () => {
    switch (selectedSystem) {
      case 'circulatory':
        return {
          title: '循環器系',
          description: '心臓と血管を通じて血液を全身に送る仕組み',
          icon: <Favorite />,
          color: '#e91e63'
        };
      case 'respiratory':
        return {
          title: '呼吸器系',
          description: '酸素を取り入れ、二酸化炭素を出す仕組み',
          icon: <Air />,
          color: '#2196f3'
        };
      case 'digestive':
        return {
          title: '消化器系',
          description: '食べ物を消化・吸収する仕組み',
          icon: <Restaurant />,
          color: '#ff9800'
        };
    }
  };

  const systemInfo = getSystemInfo();

  return (
    <MaterialBase
      title="人体の仕組みアニメーション"
      description="体の中の臓器の働きを動きで理解しよう"
    >
      {showQuiz ? (
        <SystemQuiz
          system={selectedSystem}
          organs={getSystemOrgans(selectedSystem)}
          onComplete={handleQuizComplete}
          onExit={() => setShowQuiz(false)}
        />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  体のシステムを選択
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Quiz />}
                  onClick={() => setShowQuiz(true)}
                  size="small"
                >
                  クイズに挑戦
                </Button>
              </Box>

              <ToggleButtonGroup
                value={selectedSystem}
                exclusive
                onChange={handleSystemChange}
                aria-label="body system"
                fullWidth
              >
                <ToggleButton value="circulatory" aria-label="circulatory system">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Favorite sx={{ color: '#e91e63' }} />
                    <Box>
                      <Typography variant="subtitle2">循環器系</Typography>
                      <Typography variant="caption" display="block">
                        心臓・血管
                      </Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="respiratory" aria-label="respiratory system">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Air sx={{ color: '#2196f3' }} />
                    <Box>
                      <Typography variant="subtitle2">呼吸器系</Typography>
                      <Typography variant="caption" display="block">
                        肺・気管
                      </Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="digestive" aria-label="digestive system">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Restaurant sx={{ color: '#ff9800' }} />
                    <Box>
                      <Typography variant="subtitle2">消化器系</Typography>
                      <Typography variant="caption" display="block">
                        胃・腸
                      </Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>

              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                  onClick={() => setIsPlaying(!isPlaying)}
                  size="small"
                >
                  {isPlaying ? '一時停止' : '再生'}
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <Speed />
                  <Typography variant="body2">速度:</Typography>
                  <Slider
                    value={animationSpeed}
                    onChange={(_, value) => setAnimationSpeed(value as number)}
                    min={0.5}
                    max={2}
                    step={0.5}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ maxWidth: 200 }}
                  />
                </Box>

                {selectedSystem === 'circulatory' && (
                  <Chip
                    icon={<Favorite />}
                    label={`心拍数: ${heartRate}回/分`}
                    color="error"
                    variant="outlined"
                  />
                )}
                {selectedSystem === 'respiratory' && (
                  <Chip
                    icon={<Air />}
                    label={`呼吸数: ${breathingRate}回/分`}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2, height: 600, position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 16, 
                left: 16, 
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                p: 1,
                borderRadius: 1
              }}>
                {React.cloneElement(systemInfo.icon, { sx: { color: systemInfo.color } })}
                <Typography variant="h6" sx={{ color: systemInfo.color }}>
                  {systemInfo.title}
                </Typography>
              </Box>

              {selectedSystem === 'circulatory' && (
                <CirculatorySystem
                  isPlaying={isPlaying}
                  speed={animationSpeed}
                  heartRate={heartRate}
                  onOrganClick={handleOrganClick}
                  selectedOrgan={selectedOrgan}
                />
              )}
              {selectedSystem === 'respiratory' && (
                <RespiratorySystem
                  isPlaying={isPlaying}
                  speed={animationSpeed}
                  breathingRate={breathingRate}
                  onOrganClick={handleOrganClick}
                  selectedOrgan={selectedOrgan}
                />
              )}
              {selectedSystem === 'digestive' && (
                <DigestiveSystem
                  isPlaying={isPlaying}
                  speed={animationSpeed}
                  onOrganClick={handleOrganClick}
                  selectedOrgan={selectedOrgan}
                />
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: systemInfo.color }}>
                    {systemInfo.title}について
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {systemInfo.description}
                  </Typography>
                  
                  {selectedSystem === 'circulatory' && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        心拍数の調整
                      </Typography>
                      <Slider
                        value={heartRate}
                        onChange={(_, value) => setHeartRate(value as number)}
                        min={40}
                        max={120}
                        valueLabelDisplay="auto"
                        marks={[
                          { value: 40, label: '安静時' },
                          { value: 70, label: '通常' },
                          { value: 120, label: '運動時' }
                        ]}
                      />
                    </Box>
                  )}

                  {selectedSystem === 'respiratory' && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        呼吸数の調整
                      </Typography>
                      <Slider
                        value={breathingRate}
                        onChange={(_, value) => setBreathingRate(value as number)}
                        min={8}
                        max={30}
                        valueLabelDisplay="auto"
                        marks={[
                          { value: 8, label: '深呼吸' },
                          { value: 16, label: '通常' },
                          { value: 30, label: '運動時' }
                        ]}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>

              {selectedOrgan && (
                <OrganInfo
                  organ={selectedOrgan}
                  onClose={() => setSelectedOrgan(null)}
                />
              )}
            </Stack>
          </Grid>
        </Grid>
      )}
    </MaterialBase>
  );
};

export default HumanBodyAnimation;