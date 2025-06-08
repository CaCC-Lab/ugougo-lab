// 証明の流れを表示するコンポーネント
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { ProofStep } from '../types';

interface ProofFlowChartProps {
  steps: ProofStep[];
  isComplete: boolean;
}

export const ProofFlowChart: React.FC<ProofFlowChartProps> = ({ steps, isComplete }) => {
  const getStepColor = (step: ProofStep) => {
    if (!step.reasonType) return '#ffcc80'; // オレンジ（理由なし）
    switch (step.reasonType) {
      case 'given': return '#90caf9'; // 青（仮定）
      case 'definition': return '#a5d6a7'; // 緑（定義）
      case 'theorem': return '#ce93d8'; // 紫（定理）
      case 'assumption': return '#ffab91'; // オレンジ（推論）
      case 'conclusion': return '#f48fb1'; // ピンク（結論）
      default: return '#e0e0e0';
    }
  };

  const getStepIcon = (step: ProofStep) => {
    if (step.isValid === false) {
      return <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />;
    }
    if (step.reasonType === 'conclusion' && isComplete) {
      return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
    }
    return null;
  };

  if (steps.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          証明の流れ
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 'calc(100% - 40px)',
          color: 'text.secondary'
        }}>
          <Typography variant="body2">
            証明のステップを追加すると、ここに流れが表示されます
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        証明の流れ
      </Typography>

      <Box sx={{ mt: 2 }}>
        {steps.map((step, index) => (
          <Box key={step.id}>
            {/* ステップボックス */}
            <Box
              sx={{
                bgcolor: getStepColor(step),
                borderRadius: 2,
                p: 2,
                position: 'relative',
                boxShadow: 1,
                transition: 'all 0.3s',
                '&:hover': { boxShadow: 3 }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', minWidth: '60px' }}>
                  ステップ {index + 1}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {step.content}
                  </Typography>
                  {step.reason && (
                    <Typography variant="caption" color="text.secondary">
                      理由: {step.reason}
                    </Typography>
                  )}
                </Box>
                {getStepIcon(step)}
              </Box>
            </Box>

            {/* 矢印 */}
            {index < steps.length - 1 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                my: 1
              }}>
                <ArrowDownwardIcon sx={{ color: 'primary.main' }} />
              </Box>
            )}
          </Box>
        ))}

        {/* 完了状態の表示 */}
        {isComplete && (
          <Box sx={{
            mt: 3,
            p: 2,
            bgcolor: 'success.light',
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 40 }} />
            <Typography variant="h6" color="success.dark">
              証明完了！
            </Typography>
          </Box>
        )}
      </Box>

      {/* 凡例 */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
          色の意味:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {[
            { color: '#90caf9', label: '仮定' },
            { color: '#a5d6a7', label: '定義' },
            { color: '#ce93d8', label: '定理' },
            { color: '#ffab91', label: '推論' },
            { color: '#f48fb1', label: '結論' }
          ].map(({ color, label }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: color, borderRadius: 0.5 }} />
              <Typography variant="caption">{label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};