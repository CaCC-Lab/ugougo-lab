import React, { useState } from 'react';
import { Box, Paper, Typography, Chip, Grid, IconButton } from '@mui/material';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Item {
  id: string;
  label: string;
  color: string;
  emoji: string;
}

interface PermutationVisualizerProps {
  items: Item[];
  selectCount: number;
  patterns: Item[][];
}

export const PermutationVisualizer: React.FC<PermutationVisualizerProps> = ({
  items,
  selectCount,
  patterns
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const patternsPerPage = 12;
  const totalPages = Math.ceil(patterns.length / patternsPerPage);

  const currentPatterns = patterns.slice(
    currentPage * patternsPerPage,
    (currentPage + 1) * patternsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          すべての順列パターン（{patterns.length}通り）
        </Typography>
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handlePrevPage} disabled={currentPage === 0} size="small">
              <NavigateBefore />
            </IconButton>
            <Typography variant="body2">
              {currentPage + 1} / {totalPages}
            </Typography>
            <IconButton onClick={handleNextPage} disabled={currentPage === totalPages - 1} size="small">
              <NavigateNext />
            </IconButton>
          </Box>
        )}
      </Box>

      <Grid container spacing={1}>
        <AnimatePresence mode="wait">
          {currentPatterns.map((pattern, index) => (
            <Grid item xs={6} sm={4} md={3} key={`${currentPage}-${index}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    '&:hover': {
                      elevation: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', mb: 1 }}>
                    {pattern.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.1 }}
                      >
                        <Chip
                          label={item.emoji}
                          size="small"
                          sx={{
                            bgcolor: item.color,
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </motion.div>
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {pattern.map(item => item.label).join('')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    #{currentPage * patternsPerPage + index + 1}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          💡 順列のポイント
        </Typography>
        <Typography variant="body2" color="text.secondary">
          順列では<strong>並べる順番</strong>が重要です。
          例えば「AB」と「BA」は別のものとして数えます。
          {items.length}個から{selectCount}個を選んで並べる場合、
          最初は{items.length}通り、次は{items.length - 1}通り...と選択肢が減っていきます。
        </Typography>
      </Box>
    </Box>
  );
};