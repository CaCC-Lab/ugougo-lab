import React from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CloseIcon from '@mui/icons-material/Close';
import type { LearningHint } from '../hooks/useFractionLogic';

interface LearningHintsProps {
  hint: LearningHint | null;
  showHint: boolean;
  onGenerateHint: () => void;
  onCloseHint: () => void;
}

export const LearningHints: React.FC<LearningHintsProps> = ({
  hint,
  showHint,
  onGenerateHint,
  onCloseHint
}) => {
  const getHintColor = (level: string) => {
    switch (level) {
      case 'basic':
        return '#4ecdc4';
      case 'intermediate':
        return '#ffa94d';
      case 'advanced':
        return '#ff6b6b';
      default:
        return '#4ecdc4';
    }
  };

  const getHintLabel = (level: string) => {
    switch (level) {
      case 'basic':
        return '基本のヒント';
      case 'intermediate':
        return '発展のヒント';
      case 'advanced':
        return '応用のヒント';
      default:
        return 'ヒント';
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <AnimatePresence>
        {!showHint && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              onClick={onGenerateHint}
              sx={{
                bgcolor: '#ffd93d',
                color: '#333',
                width: 60,
                height: 60,
                boxShadow: 3,
                '&:hover': {
                  bgcolor: '#ffcd3c'
                }
              }}
            >
              <LightbulbIcon fontSize="large" />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHint && hint && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <Paper
              elevation={6}
              sx={{
                p: 3,
                maxWidth: 350,
                bgcolor: 'background.paper',
                borderLeft: `4px solid ${getHintColor(hint.level)}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LightbulbIcon sx={{ color: getHintColor(hint.level) }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: getHintColor(hint.level),
                      fontWeight: 'bold'
                    }}
                  >
                    {getHintLabel(hint.level)}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={onCloseHint}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {hint.text}
              </Typography>

              {hint.visual && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    視覚的な説明が利用可能です
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onGenerateHint}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    fontSize: '14px'
                  }}
                >
                  別のヒントを見る
                </motion.button>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};