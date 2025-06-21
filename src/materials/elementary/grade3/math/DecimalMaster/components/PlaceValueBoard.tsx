/**
 * 位取り板コンポーネント
 * 
 * 百の位から百分の一の位まで表示し、
 * 各位の数字を操作できるインタラクティブな位取り板
 */

import React from 'react';
import { Box, Paper, Typography, IconButton, Divider, Chip, useTheme } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlaceValueState } from '../types';

interface PlaceValueBoardProps {
  value: PlaceValueState;
  onChange: (place: keyof PlaceValueState, delta: number) => void;
  readOnly?: boolean;
  showTotal?: boolean;
  highlightDecimalPoint?: boolean;
}

// 位の情報
const placeInfo = [
  { key: 'hundreds' as keyof PlaceValueState, label: '百の位', value: 100, color: '#FF6B6B' },
  { key: 'tens' as keyof PlaceValueState, label: '十の位', value: 10, color: '#4ECDC4' },
  { key: 'ones' as keyof PlaceValueState, label: '一の位', value: 1, color: '#45B7D1' },
  { key: 'tenths' as keyof PlaceValueState, label: '十分の一の位', value: 0.1, color: '#96CEB4' },
  { key: 'hundredths' as keyof PlaceValueState, label: '百分の一の位', value: 0.01, color: '#DDA0DD' }
];

export const PlaceValueBoard: React.FC<PlaceValueBoardProps> = ({
  value,
  onChange,
  readOnly = false,
  showTotal = true,
  highlightDecimalPoint = true
}) => {
  const theme = useTheme();
  
  // 合計値の計算
  const totalValue = 
    value.hundreds * 100 +
    value.tens * 10 +
    value.ones * 1 +
    value.tenths * 0.1 +
    value.hundredths * 0.01;
  
  // 数字の変化アニメーション
  const digitAnimation = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
    transition: { duration: 0.2 }
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          位取り板
        </Typography>
        
        {/* 位取り板本体 */}
        <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1, mb: 3 }}>
          {placeInfo.map((place, index) => (
            <React.Fragment key={place.key}>
              {/* 小数点の表示 */}
              {index === 3 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                    position: 'relative'
                  }}
                >
                  <motion.div
                    animate={highlightDecimalPoint ? {
                      scale: [1, 1.3, 1],
                      color: [theme.palette.text.primary, theme.palette.primary.main, theme.palette.text.primary]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 'bold',
                        userSelect: 'none'
                      }}
                    >
                      .
                    </Typography>
                  </motion.div>
                  {highlightDecimalPoint && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.7rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      小数点
                    </Box>
                  )}
                </Box>
              )}
              
              {/* 各位の表示 */}
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  minWidth: 120,
                  backgroundColor: `${place.color}20`,
                  border: `2px solid ${place.color}`,
                  position: 'relative'
                }}
              >
                {/* 位の名前 */}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    mb: 1,
                    color: place.color,
                    fontWeight: 'bold'
                  }}
                >
                  {place.label}
                </Typography>
                
                {/* 位の値 */}
                <Chip
                  label={place.value >= 1 ? `×${place.value}` : `×${place.value}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    backgroundColor: place.color,
                    color: 'white',
                    fontSize: '0.7rem'
                  }}
                />
                
                {/* 数字表示エリア */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {!readOnly && (
                    <IconButton
                      size="small"
                      onClick={() => onChange(place.key, 1)}
                      disabled={value[place.key] >= 9}
                      sx={{ color: place.color }}
                    >
                      <AddIcon />
                    </IconButton>
                  )}
                  
                  {/* 数字 */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      borderRadius: 2,
                      border: `3px solid ${place.color}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={value[place.key]}
                        {...digitAnimation}
                        style={{
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: place.color
                        }}
                      >
                        {value[place.key]}
                      </motion.div>
                    </AnimatePresence>
                  </Box>
                  
                  {!readOnly && (
                    <IconButton
                      size="small"
                      onClick={() => onChange(place.key, -1)}
                      disabled={value[place.key] <= 0}
                      sx={{ color: place.color }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>
                
                {/* 実際の値 */}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'center',
                    mt: 1,
                    color: theme.palette.text.secondary
                  }}
                >
                  = {(value[place.key] * place.value).toFixed(2).replace(/\.?0+$/, '')}
                </Typography>
              </Paper>
            </React.Fragment>
          ))}
        </Box>
        
        {/* 合計値の表示 */}
        {showTotal && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                合計
              </Typography>
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 0.3 }}
                key={totalValue}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                    display: 'inline-block',
                    px: 3,
                    py: 1,
                    backgroundColor: theme.palette.primary.light + '20',
                    borderRadius: 2
                  }}
                >
                  {totalValue.toFixed(2).replace(/\.?0+$/, '')}
                </Typography>
              </motion.div>
              
              {/* 計算式の表示 */}
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 2,
                  color: theme.palette.text.secondary,
                  fontFamily: 'monospace'
                }}
              >
                {value.hundreds > 0 && `${value.hundreds}×100`}
                {value.hundreds > 0 && value.tens > 0 && ' + '}
                {value.tens > 0 && `${value.tens}×10`}
                {(value.hundreds > 0 || value.tens > 0) && value.ones > 0 && ' + '}
                {value.ones > 0 && `${value.ones}×1`}
                {(value.hundreds > 0 || value.tens > 0 || value.ones > 0) && value.tenths > 0 && ' + '}
                {value.tenths > 0 && `${value.tenths}×0.1`}
                {(value.hundreds > 0 || value.tens > 0 || value.ones > 0 || value.tenths > 0) && value.hundredths > 0 && ' + '}
                {value.hundredths > 0 && `${value.hundredths}×0.01`}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};