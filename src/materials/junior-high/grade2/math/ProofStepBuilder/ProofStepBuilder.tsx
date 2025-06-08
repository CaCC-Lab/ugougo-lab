// 証明ステップビルダーのメインコンポーネント
import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Paper,
  Alert
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  ProblemDisplay,
  ProofCanvas,
  TheoremList,
  ProofFlowChart,
  HintSystem
} from './components';
import { useProofBuilder } from './hooks';
import { proofProblems } from './data/proofProblems';
import type { ValidationResult } from './types';

export const ProofStepBuilder: React.FC = () => {
  const [showProblemSelector, setShowProblemSelector] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  const {
    state,
    selectProblem,
    addStep,
    removeStep,
    updateStep,
    reorderSteps,
    validateProof,
    showNextHint,
    reset
  } = useProofBuilder();

  // 問題を選択
  const handleSelectProblem = (problemId: string) => {
    selectProblem(problemId);
    setShowProblemSelector(false);
    setValidationResult(null);
  };

  // 証明を検証
  const handleValidate = () => {
    const result = validateProof();
    setValidationResult(result);
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon sx={{ fontSize: 40 }} />
          証明ステップビルダー
        </Typography>
        <Typography variant="body1" color="text.secondary">
          数学的証明を段階的に構築し、論理的思考力を養いましょう
        </Typography>
      </Box>

      {/* 問題選択ボタン */}
      {state.problem && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<MenuBookIcon />}
            onClick={() => setShowProblemSelector(true)}
          >
            別の問題を選ぶ
          </Button>
        </Box>
      )}

      {/* メインコンテンツ */}
      <Grid container spacing={2}>
        {/* 左側：問題表示 */}
        <Grid item xs={12} md={3}>
          <ProblemDisplay problem={state.problem} />
          {state.problem && (
            <Box sx={{ mt: 2 }}>
              <HintSystem
                problem={state.problem}
                showHint={state.showHint}
                currentHintIndex={state.currentHintIndex}
                onShowNextHint={showNextHint}
                onReset={reset}
              />
            </Box>
          )}
        </Grid>

        {/* 中央：証明構築エリア */}
        <Grid item xs={12} md={5}>
          <ProofCanvas
            steps={state.steps}
            onAddStep={addStep}
            onRemoveStep={removeStep}
            onUpdateStep={updateStep}
            onReorderSteps={reorderSteps}
          />
          
          {/* 検証ボタンとフィードバック */}
          {state.problem && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleValidate}
                startIcon={<CheckCircleIcon />}
                disabled={state.steps.length === 0}
              >
                証明を検証
              </Button>

              {/* フィードバック表示 */}
              {state.feedback && (
                <Alert 
                  severity={state.isComplete ? 'success' : 'warning'}
                  sx={{ mt: 2 }}
                >
                  {state.feedback}
                </Alert>
              )}

              {/* 詳細な検証結果 */}
              {validationResult && (
                <Paper elevation={2} sx={{ mt: 2, p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    スコア: {validationResult.score}/100
                  </Typography>
                  
                  {validationResult.errors.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="error">
                        エラー:
                      </Typography>
                      {validationResult.errors.map((error, index) => (
                        <Typography key={index} variant="body2" color="error" sx={{ ml: 2 }}>
                          • {error}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {validationResult.suggestions.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="primary">
                        改善点:
                      </Typography>
                      {validationResult.suggestions.map((suggestion, index) => (
                        <Typography key={index} variant="body2" color="primary" sx={{ ml: 2 }}>
                          • {suggestion}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}
            </Box>
          )}
        </Grid>

        {/* 右側：定理リストと証明の流れ */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TheoremList theorems={state.availableTheorems} />
            </Grid>
            <Grid item xs={12}>
              <ProofFlowChart 
                steps={state.steps} 
                isComplete={state.isComplete} 
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* 問題選択ダイアログ */}
      <Dialog
        open={showProblemSelector}
        onClose={() => state.problem && setShowProblemSelector(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          証明問題を選択
        </DialogTitle>
        <DialogContent>
          <List>
            {['beginner', 'intermediate', 'advanced'].map(difficulty => (
              <Box key={difficulty}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}
                  color={`${getDifficultyColor(difficulty)}.main`}
                >
                  {getDifficultyText(difficulty as any)}
                </Typography>
                {proofProblems
                  .filter(p => p.difficulty === difficulty)
                  .map(problem => (
                    <ListItem key={problem.id} disablePadding sx={{ mb: 1 }}>
                      <ListItemButton 
                        onClick={() => handleSelectProblem(problem.id)}
                        selected={state.problem?.id === problem.id}
                      >
                        <ListItemText
                          primary={problem.title}
                          secondary={problem.category}
                        />
                        <Chip
                          label={getDifficultyText(problem.difficulty)}
                          color={getDifficultyColor(problem.difficulty)}
                          size="small"
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
              </Box>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Container>
  );
};