import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  ButtonBase,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { motion } from 'framer-motion';
import { phonemeData, getPhonemesByDifficulty, getPhonemesByType } from '../data/phonemeData';
import type { Phoneme } from '../data/phonemeData';

interface PhonemeSelectorProps {
  onSelectPhoneme: (phoneme: Phoneme) => void;
  selectedPhoneme: Phoneme | null;
  difficulty: 'easy' | 'medium' | 'hard' | 'all';
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard' | 'all') => void;
}

export const PhonemeSelector: React.FC<PhonemeSelectorProps> = ({
  onSelectPhoneme,
  selectedPhoneme,
  difficulty,
  onDifficultyChange
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    onDifficultyChange(event.target.value as 'easy' | 'medium' | 'hard' | 'all');
  };

  // フィルタリングされた音素を取得
  const getFilteredPhonemes = () => {
    let filtered = phonemeData;
    
    // タブによるフィルタリング
    if (tabValue === 1) {
      filtered = getPhonemesByType('vowel');
    } else if (tabValue === 2) {
      filtered = getPhonemesByType('consonant');
    }
    
    // 難易度によるフィルタリング
    if (difficulty !== 'all') {
      filtered = filtered.filter(p => p.difficulty === difficulty);
    }
    
    return filtered;
  };

  const filteredPhonemes = getFilteredPhonemes();

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="すべて" />
          <Tab label="母音" />
          <Tab label="子音" />
        </Tabs>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={difficulty}
            onChange={handleDifficultyChange}
            displayEmpty
          >
            <MenuItem value="all">すべての難易度</MenuItem>
            <MenuItem value="easy">かんたん</MenuItem>
            <MenuItem value="medium">ふつう</MenuItem>
            <MenuItem value="hard">むずかしい</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        {filteredPhonemes.map((phoneme) => (
          <Grid item xs={12} sm={6} md={4} key={phoneme.id}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ButtonBase
                sx={{ width: '100%', textAlign: 'left' }}
                onClick={() => onSelectPhoneme(phoneme)}
              >
                <Card
                  sx={{
                    width: '100%',
                    cursor: 'pointer',
                    border: selectedPhoneme?.id === phoneme.id ? 2 : 1,
                    borderColor: selectedPhoneme?.id === phoneme.id 
                      ? 'primary.main' 
                      : 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 2
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h5" component="div">
                        /{phoneme.symbol}/
                      </Typography>
                      <Chip
                        label={
                          phoneme.difficulty === 'easy' ? 'かんたん' :
                          phoneme.difficulty === 'medium' ? 'ふつう' : 'むずかしい'
                        }
                        color={getDifficultyColor(phoneme.difficulty)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {phoneme.label}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      例: {phoneme.examples.join(', ')}
                    </Typography>
                    
                    <Chip
                      label={phoneme.type === 'vowel' ? '母音' : '子音'}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </ButtonBase>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {filteredPhonemes.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            該当する音素がありません
          </Typography>
        </Box>
      )}
    </Box>
  );
};