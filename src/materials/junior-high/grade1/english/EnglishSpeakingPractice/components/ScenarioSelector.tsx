import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Button,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  School as SchoolIcon,
  ShoppingCart as ShoppingIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Flight as TravelIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon
} from '@mui/icons-material';
import type { DialogueScenario } from '../data/dialogueScenarios';

interface ScenarioSelectorProps {
  scenarios: DialogueScenario[];
  onSelectScenario: (scenario: DialogueScenario) => void;
  completedScenarios: string[];
  practiceStats: Record<string, any>;
}

const categoryIcons = {
  daily: <ChatIcon />,
  introduction: <PersonIcon />,
  shopping: <ShoppingIcon />,
  school: <SchoolIcon />,
  travel: <TravelIcon />
};

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error'
} as const;

const difficultyLabels = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級'
};

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  onSelectScenario,
  completedScenarios,
  practiceStats
}) => {
  const getCompletionRate = (difficulty: string) => {
    const difficultyScenarios = scenarios.filter(s => s.difficulty === difficulty);
    const completed = difficultyScenarios.filter(s => completedScenarios.includes(s.id));
    return (completed.length / difficultyScenarios.length) * 100;
  };

  const isScenarioCompleted = (scenarioId: string) => {
    return completedScenarios.includes(scenarioId);
  };

  return (
    <Box>
      {/* 難易度別の進捗表示 */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          学習進捗
        </Typography>
        <Grid container spacing={2}>
          {(['beginner', 'intermediate', 'advanced'] as const).map(difficulty => (
            <Grid item xs={12} md={4} key={difficulty}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {difficultyLabels[difficulty]}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Box flexGrow={1} mr={2}>
                      <LinearProgress
                        variant="determinate"
                        value={getCompletionRate(difficulty)}
                        color={difficultyColors[difficulty]}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography variant="body2">
                      {Math.round(getCompletionRate(difficulty))}%
                    </Typography>
                  </Box>
                  {practiceStats[difficulty] && (
                    <Box mt={2}>
                      <Typography variant="caption" display="block">
                        平均スコア: {practiceStats[difficulty].averageScore || 0}点
                      </Typography>
                      <Typography variant="caption" display="block">
                        平均時間: {practiceStats[difficulty].averageTime || 0}秒
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* シナリオ一覧 */}
      <Typography variant="h6" gutterBottom>
        練習シナリオを選ぼう
      </Typography>
      <Grid container spacing={3}>
        {scenarios.map((scenario, index) => (
          <Grid item xs={12} md={6} lg={4} key={scenario.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  position: 'relative',
                  overflow: 'visible'
                }}
                onClick={() => onSelectScenario(scenario)}
              >
                {isScenarioCompleted(scenario.id) && (
                  <Tooltip title="クリア済み">
                    <CheckIcon
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        color: 'success.main',
                        backgroundColor: 'background.paper',
                        borderRadius: '50%',
                        fontSize: 30,
                        boxShadow: 2
                      }}
                    />
                  </Tooltip>
                )}
                
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        backgroundColor: 'primary.light',
                        color: 'primary.main',
                        mr: 2
                      }}
                    >
                      {categoryIcons[scenario.category]}
                    </Box>
                    <Box flexGrow={1}>
                      <Typography variant="h6" component="div">
                        {scenario.titleJa}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {scenario.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {scenario.description}
                  </Typography>

                  <Box display="flex" gap={1} alignItems="center">
                    <Chip
                      label={difficultyLabels[scenario.difficulty]}
                      size="small"
                      color={difficultyColors[scenario.difficulty]}
                    />
                    <Chip
                      label={`${scenario.dialogue.length}ターン`}
                      size="small"
                      variant="outlined"
                    />
                    {scenario.vocabularyNotes && (
                      <Chip
                        label={`単語${scenario.vocabularyNotes.length}個`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Box mt={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="small"
                      endIcon={isScenarioCompleted(scenario.id) ? <StarIcon /> : null}
                    >
                      {isScenarioCompleted(scenario.id) ? 'もう一度挑戦' : '始める'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};