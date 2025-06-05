import React, { useState } from 'react';
import { Box, Paper, Typography, Chip, Grid, IconButton, Stack } from '@mui/material';
import { Group, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Item {
  id: string;
  label: string;
  color: string;
  emoji: string;
}

interface CombinationVisualizerProps {
  items: Item[];
  selectCount: number;
  patterns: Item[][];
}

export const CombinationVisualizer: React.FC<CombinationVisualizerProps> = ({
  items,
  selectCount,
  patterns
}) => {
  const [showDuplicates, setShowDuplicates] = useState(false);

  // 順列として考えた場合の全パターンを生成（重複を含む）
  const getAllPermutations = (): Item[][] => {
    const result: Item[][] = [];
    
    const generate = (current: Item[], remaining: Item[]) => {
      if (current.length === selectCount) {
        result.push([...current]);
        return;
      }
      
      remaining.forEach((item, index) => {
        const next = remaining.filter((_, i) => i !== index);
        generate([...current, item], next);
      });
    };
    
    generate([], items.slice(0, selectCount + (selectCount === items.length ? 0 : 1)));
    return result;
  };

  const permutations = getAllPermutations();
  
  // 組み合わせとして同じものをグループ化
  const groupedPatterns = new Map<string, Item[][]>();
  permutations.forEach(pattern => {
    const key = [...pattern].sort((a, b) => a.id.localeCompare(b.id)).map(item => item.id).join('');
    if (!groupedPatterns.has(key)) {
      groupedPatterns.set(key, []);
    }
    groupedPatterns.get(key)!.push(pattern);
  });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          すべての組み合わせパターン（{patterns.length}通り）
        </Typography>
        <IconButton
          onClick={() => setShowDuplicates(!showDuplicates)}
          color={showDuplicates ? 'primary' : 'default'}
          size="small"
        >
          <Group />
        </IconButton>
      </Stack>

      <Grid container spacing={2}>
        {patterns.map((pattern, index) => {
          const key = pattern.map(item => item.id).sort().join('');
          const duplicates = groupedPatterns.get(key) || [];

          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    {pattern.map((item, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <Typography sx={{ mx: 0.5 }}>+</Typography>}
                        <Chip
                          label={`${item.emoji} ${item.label}`}
                          sx={{
                            bgcolor: item.color,
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </React.Fragment>
                    ))}
                  </Box>

                  <Typography variant="body2" align="center" sx={{ fontWeight: 'medium' }}>
                    {pattern.map(item => item.label).sort().join('')}
                  </Typography>

                  {showDuplicates && duplicates.length > 1 && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        順列では{duplicates.length}通り:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {duplicates.map((dup, i) => (
                          <Typography key={i} variant="caption" sx={{ 
                            px: 1, 
                            py: 0.5, 
                            bgcolor: 'white',
                            borderRadius: 0.5,
                            border: '1px solid #e0e0e0'
                          }}>
                            {dup.map(item => item.label).join('')}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          💡 組み合わせのポイント
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          組み合わせでは<strong>選ぶだけ</strong>で順番は関係ありません。
          例えば「AB」と「BA」は同じものとして1通りと数えます。
        </Typography>
        {showDuplicates && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Group fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              グループ表示をONにすると、順列では別々に数えるパターンが表示されます。
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};