import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  ExpandMore as ExpandMoreIcon,
  School as LearnIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { calculateOhmsLaw } from '../utils/circuitCalculations';
import { learningHints } from '../data/circuitComponents';

interface FormulaDisplayProps {
  onCalculate?: (result: { voltage?: number; current?: number; resistance?: number }) => void;
}

interface CalculationState {
  voltage: string;
  current: string;
  resistance: string;
  result: {
    voltage?: number;
    current?: number;
    resistance?: number;
  } | null;
  error: string | null;
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ onCalculate }) => {
  const [expanded, setExpanded] = useState(true);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [calculation, setCalculation] = useState<CalculationState>({
    voltage: '',
    current: '',
    resistance: '',
    result: null,
    error: null
  });
  
  // 計算実行
  const handleCalculate = () => {
    const { voltage, current, resistance } = calculation;
    
    // 入力値のカウント
    const inputCount = [voltage, current, resistance].filter(v => v !== '').length;
    
    if (inputCount < 2) {
      setCalculation(prev => ({
        ...prev,
        error: '少なくとも2つの値を入力してください',
        result: null
      }));
      return;
    }
    
    if (inputCount > 2) {
      setCalculation(prev => ({
        ...prev,
        error: '入力は2つまでにしてください',
        result: null
      }));
      return;
    }
    
    // 数値変換
    const v = voltage ? parseFloat(voltage) : undefined;
    const i = current ? parseFloat(current) : undefined;
    const r = resistance ? parseFloat(resistance) : undefined;
    
    // 計算実行
    const result = calculateOhmsLaw(v, i, r);
    
    setCalculation(prev => ({
      ...prev,
      result,
      error: null
    }));
    
    if (onCalculate) {
      onCalculate(result);
    }
  };
  
  // リセット
  const handleReset = () => {
    setCalculation({
      voltage: '',
      current: '',
      resistance: '',
      result: null,
      error: null
    });
  };
  
  // 入力変更
  const handleInputChange = (field: 'voltage' | 'current' | 'resistance', value: string) => {
    setCalculation(prev => ({
      ...prev,
      [field]: value,
      result: null,
      error: null
    }));
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          公式と計算
        </Typography>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Stack spacing={2}>
          {/* オームの法則の表示 */}
          <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h4" align="center" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              V = I × R
            </Typography>
          </Paper>
          
          {/* 計算ツール */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalculateIcon />
              計算ツール
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 2 }}>
              <TextField
                label="電圧 V"
                value={calculation.voltage}
                onChange={(e) => handleInputChange('voltage', e.target.value)}
                type="number"
                size="small"
                helperText="ボルト"
                InputProps={{
                  endAdornment: calculation.result?.voltage !== undefined && (
                    <Chip
                      label={calculation.result.voltage.toFixed(2)}
                      size="small"
                      color="success"
                    />
                  )
                }}
              />
              <TextField
                label="電流 I"
                value={calculation.current}
                onChange={(e) => handleInputChange('current', e.target.value)}
                type="number"
                size="small"
                helperText="アンペア"
                InputProps={{
                  endAdornment: calculation.result?.current !== undefined && (
                    <Chip
                      label={calculation.result.current.toFixed(3)}
                      size="small"
                      color="success"
                    />
                  )
                }}
              />
              <TextField
                label="抵抗 R"
                value={calculation.resistance}
                onChange={(e) => handleInputChange('resistance', e.target.value)}
                type="number"
                size="small"
                helperText="オーム"
                InputProps={{
                  endAdornment: calculation.result?.resistance !== undefined && (
                    <Chip
                      label={calculation.result.resistance.toFixed(1)}
                      size="small"
                      color="success"
                    />
                  )
                }}
              />
            </Box>
            
            {calculation.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {calculation.error}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={handleCalculate}
                fullWidth
              >
                計算する
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
              >
                リセット
              </Button>
            </Box>
          </Paper>
          
          {/* 学習のヒント */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LearnIcon />
              学習のヒント
            </Typography>
            
            <Stack spacing={1}>
              {Object.entries(learningHints).slice(0, 3).map(([key, hint]) => (
                <Box
                  key={key}
                  sx={{
                    p: 1.5,
                    bgcolor: activeHint === key ? 'action.selected' : 'background.default',
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: activeHint === key ? 'action.selected' : 'action.hover'
                    }
                  }}
                  onClick={() => setActiveHint(activeHint === key ? null : key)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">{hint.title}</Typography>
                    <ExpandMoreIcon
                      sx={{
                        transform: activeHint === key ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                      }}
                    />
                  </Box>
                  
                  <Collapse in={activeHint === key}>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {hint.content}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}
                      >
                        {hint.formula}
                      </Typography>
                      {hint.example && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          例: {hint.example}
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </Stack>
          </Paper>
          
          {/* 練習問題 */}
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" gutterBottom>
              確認問題
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" paragraph>
                6Vの電池に20Ωの抵抗をつないだとき、流れる電流は？
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['0.1A', '0.3A', '0.5A', '1.2A'].map((answer) => (
                  <Button
                    key={answer}
                    variant="outlined"
                    size="small"
                    startIcon={answer === '0.3A' ? <CheckIcon /> : <CancelIcon />}
                    color={answer === '0.3A' ? 'success' : 'inherit'}
                  >
                    {answer}
                  </Button>
                ))}
              </Box>
              
              <Collapse in={true}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  解説: I = V / R = 6V / 20Ω = 0.3A
                </Alert>
              </Collapse>
            </Box>
          </Paper>
        </Stack>
      </Collapse>
    </Box>
  );
};