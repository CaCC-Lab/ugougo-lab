// 問題と図形を表示するコンポーネント
import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import type { ProofProblem } from '../types';

interface ProblemDisplayProps {
  problem: ProofProblem | null;
}

export const ProblemDisplay: React.FC<ProblemDisplayProps> = ({ problem }) => {
  if (!problem) {
    return (
      <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          問題を選択してください
        </Typography>
      </Paper>
    );
  }

  // 図形の簡易的な描画
  const renderFigure = () => {
    if (!problem.figure) return null;

    const { type, labels } = problem.figure;
    
    // SVGで簡単な図形を描画
    switch (type) {
      case 'triangle':
        return (
          <svg width="200" height="200" viewBox="0 0 200 200">
            <polygon
              points="100,20 180,160 20,160"
              fill="none"
              stroke="#1976d2"
              strokeWidth="2"
            />
            <text x="100" y="15" textAnchor="middle" fontSize="14">{labels[0]}</text>
            <text x="15" y="165" textAnchor="middle" fontSize="14">{labels[1]}</text>
            <text x="185" y="165" textAnchor="middle" fontSize="14">{labels[2]}</text>
            {problem.figure.special?.includes('isosceles') && (
              <>
                <line x1="100" y1="20" x2="100" y2="160" stroke="#666" strokeWidth="1" strokeDasharray="5,5" />
                <text x="105" y="95" fontSize="12" fill="#666">D</text>
              </>
            )}
          </svg>
        );
      
      case 'parallel':
        return (
          <svg width="200" height="200" viewBox="0 0 200 200">
            <line x1="20" y1="60" x2="180" y2="60" stroke="#1976d2" strokeWidth="2" />
            <line x1="20" y1="140" x2="180" y2="140" stroke="#1976d2" strokeWidth="2" />
            <line x1="50" y1="30" x2="150" y2="170" stroke="#f50057" strokeWidth="2" />
            <text x="10" y="60" fontSize="12">{labels[0]}</text>
            <text x="10" y="140" fontSize="12">{labels[1]}</text>
            <text x="155" y="175" fontSize="12">{labels[2]}</text>
            <text x="85" y="55" fontSize="12">{labels[3]}</text>
            <text x="115" y="155" fontSize="12">{labels[4]}</text>
          </svg>
        );
      
      case 'quadrilateral':
        return (
          <svg width="200" height="200" viewBox="0 0 200 200">
            <polygon
              points="40,40 160,40 180,160 20,160"
              fill="none"
              stroke="#1976d2"
              strokeWidth="2"
            />
            <text x="35" y="35" fontSize="14">{labels[0]}</text>
            <text x="165" y="35" fontSize="14">{labels[1]}</text>
            <text x="185" y="165" fontSize="14">{labels[2]}</text>
            <text x="15" y="165" fontSize="14">{labels[3]}</text>
            {problem.figure.special?.includes('parallelogram') && (
              <>
                <line x1="40" y1="40" x2="180" y2="160" stroke="#666" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="160" y1="40" x2="20" y2="160" stroke="#666" strokeWidth="1" strokeDasharray="5,5" />
              </>
            )}
          </svg>
        );
      
      default:
        return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return difficulty;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {problem.title}
        </Typography>
        <Chip 
          label={getDifficultyText(problem.difficulty)} 
          color={getDifficultyColor(problem.difficulty)}
          size="small"
          sx={{ mb: 2 }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          仮定（与えられた条件）:
        </Typography>
        {problem.given.map((given, index) => (
          <Typography key={index} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
            • {given}
          </Typography>
        ))}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="secondary" gutterBottom>
          証明すること:
        </Typography>
        <Typography variant="body1" sx={{ ml: 2, fontWeight: 'bold' }}>
          {problem.toProve}
        </Typography>
      </Box>

      {problem.figure && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          {renderFigure()}
        </Box>
      )}
    </Paper>
  );
};