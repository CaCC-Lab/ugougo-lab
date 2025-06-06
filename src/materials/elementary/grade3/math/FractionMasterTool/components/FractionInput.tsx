import React from 'react';
import { Box, TextField, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { Fraction } from '../hooks/useFractionLogic';

interface FractionInputProps {
  fraction: Fraction;
  onChange: (fraction: Fraction) => void;
  label?: string;
  maxNumerator?: number;
  maxDenominator?: number;
}

export const FractionInput: React.FC<FractionInputProps> = ({
  fraction,
  onChange,
  label,
  maxNumerator = 12,
  maxDenominator = 12
}) => {
  const handleNumeratorChange = (value: number) => {
    if (value >= 0 && value <= fraction.denominator && value <= maxNumerator) {
      onChange({ ...fraction, numerator: value });
    }
  };

  const handleDenominatorChange = (value: number) => {
    if (value > 0 && value <= maxDenominator) {
      const newNumerator = Math.min(fraction.numerator, value);
      onChange({ numerator: newNumerator, denominator: value });
    }
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* 分子 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => handleNumeratorChange(fraction.numerator - 1)}
            disabled={fraction.numerator <= 0}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <TextField
            value={fraction.numerator}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              handleNumeratorChange(value);
            }}
            type="number"
            inputProps={{
              min: 0,
              max: Math.min(fraction.denominator, maxNumerator),
              style: { textAlign: 'center' }
            }}
            sx={{ width: 60 }}
            size="small"
          />
          <IconButton
            size="small"
            onClick={() => handleNumeratorChange(fraction.numerator + 1)}
            disabled={fraction.numerator >= fraction.denominator || fraction.numerator >= maxNumerator}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* 分数線 */}
        <Typography variant="h5" sx={{ mx: 1 }}>
          /
        </Typography>

        {/* 分母 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => handleDenominatorChange(fraction.denominator - 1)}
            disabled={fraction.denominator <= 1}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <TextField
            value={fraction.denominator}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              handleDenominatorChange(value);
            }}
            type="number"
            inputProps={{
              min: 1,
              max: maxDenominator,
              style: { textAlign: 'center' }
            }}
            sx={{ width: 60 }}
            size="small"
          />
          <IconButton
            size="small"
            onClick={() => handleDenominatorChange(fraction.denominator + 1)}
            disabled={fraction.denominator >= maxDenominator}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};