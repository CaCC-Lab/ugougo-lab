import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import type { Fraction } from '../hooks/useFractionLogic';
import { FractionVisualizer } from './FractionVisualizer';

interface FractionComparisonProps {
  fractions: Fraction[];
  onFractionsChange: (index: number, fraction: Fraction) => void;
  compareFractions: (f1: Fraction, f2: Fraction) => -1 | 0 | 1;
  findCommonDenominator: (f1: Fraction, f2: Fraction) => [Fraction, Fraction, number];
}

export const FractionComparison: React.FC<FractionComparisonProps> = ({
  fractions,
  onFractionsChange,
  compareFractions,
  findCommonDenominator
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [showCommonDenom, setShowCommonDenom] = useState(false);
  const [commonFractions, setCommonFractions] = useState<[Fraction, Fraction] | null>(null);
  const [comparisonResult, setComparisonResult] = useState<-1 | 0 | 1>(0);

  useEffect(() => {
    if (fractions.length >= 2) {
      const result = compareFractions(fractions[0], fractions[1]);
      setComparisonResult(result);
    }
  }, [fractions, compareFractions]);

  const handleCompare = () => {
    setShowComparison(true);
    if (fractions[0].denominator !== fractions[1].denominator) {
      const [common1, common2] = findCommonDenominator(fractions[0], fractions[1]);
      setCommonFractions([common1, common2]);
    }
  };

  const handleShowCommonDenom = () => {
    setShowCommonDenom(!showCommonDenom);
  };

  const getComparisonSymbol = () => {
    switch (comparisonResult) {
      case -1:
        return '<';
      case 0:
        return '=';
      case 1:
        return '>';
    }
  };

  const getComparisonMessage = () => {
    const symbol = getComparisonSymbol();
    return `${fractions[0].numerator}/${fractions[0].denominator} ${symbol} ${fractions[1].numerator}/${fractions[1].denominator}`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        分数の大小比較
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mb: 4 }}>
        {/* 左側の分数 */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <FractionVisualizer
            fraction={fractions[0]}
            visualType="pizza"
            size={180}
            animated={true}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              size="small"
              onClick={() => onFractionsChange(0, {
                ...fractions[0],
                numerator: Math.max(1, fractions[0].numerator - 1)
              })}
            >
              −
            </Button>
            <Typography variant="h5">
              {fractions[0].numerator}/{fractions[0].denominator}
            </Typography>
            <Button
              size="small"
              onClick={() => onFractionsChange(0, {
                ...fractions[0],
                numerator: Math.min(fractions[0].denominator, fractions[0].numerator + 1)
              })}
            >
              +
            </Button>
          </Box>
        </Paper>

        {/* 比較記号 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <Typography variant="h2" sx={{ color: '#ff6b6b' }}>
                  {getComparisonSymbol()}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
          {!showComparison && (
            <IconButton onClick={handleCompare} color="primary" size="large">
              <SwapHorizIcon fontSize="large" />
            </IconButton>
          )}
        </Box>

        {/* 右側の分数 */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <FractionVisualizer
            fraction={fractions[1]}
            visualType="pizza"
            size={180}
            animated={true}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              size="small"
              onClick={() => onFractionsChange(1, {
                ...fractions[1],
                numerator: Math.max(1, fractions[1].numerator - 1)
              })}
            >
              −
            </Button>
            <Typography variant="h5">
              {fractions[1].numerator}/{fractions[1].denominator}
            </Typography>
            <Button
              size="small"
              onClick={() => onFractionsChange(1, {
                ...fractions[1],
                numerator: Math.min(fractions[1].denominator, fractions[1].numerator + 1)
              })}
            >
              +
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* 比較結果 */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
              <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                {getComparisonMessage()}
              </Typography>
              
              {fractions[0].denominator !== fractions[1].denominator && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleShowCommonDenom}
                    sx={{ mb: 2 }}
                  >
                    通分して比較する
                  </Button>

                  <AnimatePresence>
                    {showCommonDenom && commonFractions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            分母を揃えると比較しやすくなります：
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <FractionVisualizer
                                fraction={commonFractions[0]}
                                visualType="rectangle"
                                size={150}
                                animated={true}
                              />
                              <Typography variant="h6" sx={{ mt: 1 }}>
                                {commonFractions[0].numerator}/{commonFractions[0].denominator}
                              </Typography>
                            </Box>
                            <Typography variant="h4">
                              {getComparisonSymbol()}
                            </Typography>
                            <Box sx={{ textAlign: 'center' }}>
                              <FractionVisualizer
                                fraction={commonFractions[1]}
                                visualType="rectangle"
                                size={150}
                                animated={true}
                              />
                              <Typography variant="h6" sx={{ mt: 1 }}>
                                {commonFractions[1].numerator}/{commonFractions[1].denominator}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={handleCompare}
          disabled={showComparison}
        >
          比較する
        </Button>
        {showComparison && (
          <Button
            variant="outlined"
            onClick={() => {
              setShowComparison(false);
              setShowCommonDenom(false);
            }}
          >
            リセット
          </Button>
        )}
      </Box>
    </Box>
  );
};