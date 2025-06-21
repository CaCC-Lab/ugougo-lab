/**
 * 方程式ソルバーコンポーネント
 * 
 * 機能：
 * - ステップバイステップの解法表示
 * - インタラクティブな操作選択
 * - 解法履歴の表示
 * - アニメーション付き変形表示
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Help as HelpIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Functions as FunctionsIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  Equation,
  Operation,
  SolutionStep,
  TransformationHistory,
  ValidationResult,
  EquationTerm
} from '../types';

interface EquationSolverProps {
  equation: Equation;
  history: TransformationHistory;
  validationResult: ValidationResult | null;
  onApplyOperation: (operation: Operation) => void;
  onValidateAnswer: (answer: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onShowHint: () => void;
  hints: string[];
  currentHintIndex: number;
  showHints: boolean;
  canShowMoreHints: boolean;
}

export const EquationSolver: React.FC<EquationSolverProps> = ({
  equation,
  history,
  validationResult,
  onApplyOperation,
  onValidateAnswer,
  onUndo,
  onRedo,
  onShowHint,
  hints,
  currentHintIndex,
  showHints,
  canShowMoreHints
}) => {
  const [operationDialog, setOperationDialog] = useState<{
    open: boolean;
    type: Operation['type'] | null;
  }>({ open: false, type: null });
  const [operationValue, setOperationValue] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showStepDetails, setShowStepDetails] = useState<number | null>(null);
  
  /**
   * 方程式の項を文字列に変換
   */
  const formatTerm = (term: EquationTerm): string => {
    if (term.variable) {
      if (term.coefficient === 1) return term.variable;
      if (term.coefficient === -1) return `-${term.variable}`;
      return `${term.coefficient}${term.variable}`;
    }
    return term.constant?.toString() || '0';
  };
  
  /**
   * 方程式全体を文字列に変換
   */
  const formatEquation = (eq: Equation): string => {
    const leftTerms = eq.leftSide.map(formatTerm).filter(t => t !== '0');
    const rightTerms = eq.rightSide.map(formatTerm).filter(t => t !== '0');
    
    const leftSide = leftTerms.length > 0 ? leftTerms.join(' + ').replace(/\+ -/g, '- ') : '0';
    const rightSide = rightTerms.length > 0 ? rightTerms.join(' + ').replace(/\+ -/g, '- ') : '0';
    
    return `${leftSide} = ${rightSide}`;
  };
  
  /**
   * 操作ダイアログを開く
   */
  const openOperationDialog = (type: Operation['type']) => {
    setOperationDialog({ open: true, type });
    setOperationValue('');
  };
  
  /**
   * 操作を適用
   */
  const handleApplyOperation = () => {
    if (!operationDialog.type || !operationValue) return;
    
    const value = parseFloat(operationValue);
    if (isNaN(value)) return;
    
    let description = '';
    switch (operationDialog.type) {
      case 'add':
        description = `両辺に ${value} を足す`;
        break;
      case 'subtract':
        description = `両辺から ${value} を引く`;
        break;
      case 'multiply':
        description = `両辺に ${value} をかける`;
        break;
      case 'divide':
        description = `両辺を ${value} で割る`;
        break;
    }
    
    onApplyOperation({
      type: operationDialog.type,
      value,
      targetSide: 'both',
      description
    });
    
    setOperationDialog({ open: false, type: null });
  };
  
  /**
   * 答えを確認
   */
  const handleCheckAnswer = () => {
    const answer = parseFloat(userAnswer);
    if (!isNaN(answer)) {
      onValidateAnswer(answer);
    }
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 3, flex: 1, overflow: 'auto' }}>
        {/* 現在の方程式 */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontFamily: 'monospace', color: '#2C3E50' }}>
            <motion.span
              key={equation.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {formatEquation(equation)}
            </motion.span>
          </Typography>
        </Box>
        
        {/* 操作ボタン */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            操作を選択:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ButtonGroup variant="outlined" fullWidth>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => openOperationDialog('add')}
                >
                  足す
                </Button>
                <Button
                  startIcon={<RemoveIcon />}
                  onClick={() => openOperationDialog('subtract')}
                >
                  引く
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ButtonGroup variant="outlined" fullWidth>
                <Button
                  startIcon={<CloseIcon />}
                  onClick={() => openOperationDialog('multiply')}
                >
                  かける
                </Button>
                <Button
                  startIcon={<FunctionsIcon />}
                  onClick={() => openOperationDialog('divide')}
                >
                  割る
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Tooltip title="元に戻す">
              <span>
                <IconButton
                  onClick={onUndo}
                  disabled={!history.canUndo}
                  color="primary"
                >
                  <UndoIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="やり直す">
              <span>
                <IconButton
                  onClick={onRedo}
                  disabled={!history.canRedo}
                  color="primary"
                >
                  <RedoIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="ヒントを見る">
              <IconButton
                onClick={onShowHint}
                color="info"
                disabled={!canShowMoreHints && showHints}
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* ヒント表示 */}
        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  ヒント {currentHintIndex + 1}/{hints.length}
                </Typography>
                <Typography>{hints[currentHintIndex]}</Typography>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 解法履歴 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            解法のステップ:
          </Typography>
          <Stepper activeStep={history.currentStepIndex} orientation="vertical">
            {history.steps.map((step, index) => (
              <Step key={step.id} completed={index < history.currentStepIndex}>
                <StepLabel
                  optional={
                    step.isKeyStep && (
                      <Typography variant="caption" color="primary">
                        重要なステップ
                      </Typography>
                    )
                  }
                >
                  {step.description}
                </StepLabel>
                <StepContent>
                  <Card
                    variant="outlined"
                    sx={{
                      backgroundColor:
                        index === history.currentStepIndex ? '#E3F2FD' : 'transparent'
                    }}
                  >
                    <CardContent>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                        {formatEquation(step.equation)}
                      </Typography>
                      {step.explanation && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {step.explanation}
                        </Typography>
                      )}
                      {step.visualHint && (
                        <Chip
                          label={step.visualHint}
                          size="small"
                          color="info"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        {/* 答えの入力 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            答えを入力:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="x = "
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              type="number"
              variant="outlined"
              size="small"
              sx={{ width: 150 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={handleCheckAnswer}
              disabled={!userAnswer}
            >
              確認
            </Button>
          </Box>
        </Box>
        
        {/* 検証結果 */}
        <AnimatePresence>
          {validationResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity={validationResult.isCorrect ? 'success' : 'error'}
                sx={{ mb: 2 }}
                action={
                  validationResult.isCorrect && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setUserAnswer('');
                        // 次の問題へ進む処理
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  )
                }
              >
                <Typography variant="subtitle2">
                  {validationResult.feedback.title}
                </Typography>
                <Typography variant="body2">
                  {validationResult.feedback.message}
                </Typography>
                {validationResult.feedback.details && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {validationResult.feedback.details}
                  </Typography>
                )}
                {validationResult.feedback.nextAction && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 1, fontStyle: 'italic' }}
                  >
                    💡 {validationResult.feedback.nextAction}
                  </Typography>
                )}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
      
      {/* 操作ダイアログ */}
      <Dialog
        open={operationDialog.open}
        onClose={() => setOperationDialog({ open: false, type: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {operationDialog.type === 'add' && '両辺に数を足す'}
          {operationDialog.type === 'subtract' && '両辺から数を引く'}
          {operationDialog.type === 'multiply' && '両辺に数をかける'}
          {operationDialog.type === 'divide' && '両辺を数で割る'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              label="値"
              type="number"
              fullWidth
              value={operationValue}
              onChange={(e) => setOperationValue(e.target.value)}
              helperText={
                operationDialog.type === 'divide'
                  ? '0では割れません'
                  : '正の数、負の数、小数が使えます'
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOperationDialog({ open: false, type: null })}>
            キャンセル
          </Button>
          <Button
            onClick={handleApplyOperation}
            variant="contained"
            disabled={
              !operationValue ||
              (operationDialog.type === 'divide' && parseFloat(operationValue) === 0)
            }
          >
            適用
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};