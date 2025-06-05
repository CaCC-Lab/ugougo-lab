import React from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box
} from '@mui/material';
import { 
  Chair, 
  Flag, 
  Group, 
  ColorLens,
  SportsSoccer,
  School,
  EmojiEvents,
  Restaurant
} from '@mui/icons-material';

interface Example {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  total: number;
  select: number;
  problemType: 'permutation' | 'combination';
}

interface ProblemExamplesProps {
  problemType: 'permutation' | 'combination';
  onSelectExample: (example: Example) => void;
}

export const ProblemExamples: React.FC<ProblemExamplesProps> = ({
  problemType,
  onSelectExample
}) => {
  const permutationExamples: Example[] = [
    {
      id: 'seats',
      title: '席の並び方',
      description: '5人の生徒を3つの席に並べる',
      icon: <Chair />,
      total: 5,
      select: 3,
      problemType: 'permutation'
    },
    {
      id: 'flags',
      title: '旗の並べ方',
      description: '4色の旗から3色を選んで並べる',
      icon: <Flag />,
      total: 4,
      select: 3,
      problemType: 'permutation'
    },
    {
      id: 'relay',
      title: 'リレーの走順',
      description: '5人から4人を選んで走る順番を決める',
      icon: <SportsSoccer />,
      total: 5,
      select: 4,
      problemType: 'permutation'
    },
    {
      id: 'podium',
      title: '表彰台',
      description: '5人から金・銀・銅メダルを決める',
      icon: <EmojiEvents />,
      total: 5,
      select: 3,
      problemType: 'permutation'
    }
  ];

  const combinationExamples: Example[] = [
    {
      id: 'team',
      title: 'チーム分け',
      description: '5人から3人のチームを作る',
      icon: <Group />,
      total: 5,
      select: 3,
      problemType: 'combination'
    },
    {
      id: 'colors',
      title: '色の選び方',
      description: '4色から2色を選ぶ',
      icon: <ColorLens />,
      total: 4,
      select: 2,
      problemType: 'combination'
    },
    {
      id: 'committee',
      title: '委員会メンバー',
      description: '5人から2人の委員を選ぶ',
      icon: <School />,
      total: 5,
      select: 2,
      problemType: 'combination'
    },
    {
      id: 'menu',
      title: 'メニュー選び',
      description: '5つの料理から3つを選ぶ',
      icon: <Restaurant />,
      total: 5,
      select: 3,
      problemType: 'combination'
    }
  ];

  const examples = problemType === 'permutation' ? permutationExamples : combinationExamples;

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        実際の例題
      </Typography>
      
      <Box sx={{ mb: 2, p: 1.5, bgcolor: problemType === 'permutation' ? '#fff3e0' : '#e3f2fd', borderRadius: 1 }}>
        <Typography variant="body2">
          {problemType === 'permutation' 
            ? '順列：順番が重要な場合（1番目、2番目...の区別がある）'
            : '組み合わせ：選ぶだけで順番は関係ない場合'
          }
        </Typography>
      </Box>

      <List dense>
        {examples.map((example) => (
          <ListItem key={example.id} disablePadding>
            <ListItemButton onClick={() => onSelectExample(example)}>
              <ListItemIcon>
                {example.icon}
              </ListItemIcon>
              <ListItemText
                primary={example.title}
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      {example.description}
                    </Typography>
                    <Typography variant="caption" color="primary">
                      {example.total}個から{example.select}個を
                      {problemType === 'permutation' ? '並べる' : '選ぶ'}
                    </Typography>
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 例題をクリックすると、その設定で計算できます
        </Typography>
      </Box>
    </Paper>
  );
};