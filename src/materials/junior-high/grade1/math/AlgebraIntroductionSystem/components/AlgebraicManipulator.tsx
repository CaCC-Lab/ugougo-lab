import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Chip, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import UndoIcon from '@mui/icons-material/Undo';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface AlgebraicManipulatorProps {
  expression: string;
  onManipulate: (steps: string[]) => void;
}

interface Term {
  id: string;
  coefficient: number;
  variable: string;
  isConstant: boolean;
}

const AlgebraicManipulator: React.FC<AlgebraicManipulatorProps> = ({
  expression,
  onManipulate
}) => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [history, setHistory] = useState<string[]>([expression]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  // 式をパースして項に分解
  React.useEffect(() => {
    const parsedTerms = parseExpression(expression);
    setTerms(parsedTerms);
  }, [expression]);

  const parseExpression = (expr: string): Term[] => {
    const termRegex = /([+-]?\s*\d*)\s*([a-z]?)/g;
    const parsedTerms: Term[] = [];
    let match;
    let id = 0;

    while ((match = termRegex.exec(expr)) !== null) {
      const [full, coeff, variable] = match;
      if (full.trim()) {
        const coefficient = coeff.replace(/\s/g, '') || (variable ? '1' : '0');
        const numCoeff = parseInt(coefficient) || (coefficient.includes('-') ? -1 : 1);
        
        parsedTerms.push({
          id: `term-${id++}`,
          coefficient: numCoeff,
          variable: variable || '',
          isConstant: !variable
        });
      }
    }

    return parsedTerms;
  };

  const termsToExpression = (termList: Term[]): string => {
    return termList
      .map((term, index) => {
        const sign = term.coefficient >= 0 && index > 0 ? '+' : '';
        const coeff = Math.abs(term.coefficient) === 1 && term.variable 
          ? (term.coefficient < 0 ? '-' : '') 
          : term.coefficient.toString();
        return `${sign}${coeff}${term.variable}`;
      })
      .join(' ')
      .trim();
  };

  const handleTermClick = (termId: string) => {
    if (selectedTerms.includes(termId)) {
      setSelectedTerms(selectedTerms.filter(id => id !== termId));
    } else {
      setSelectedTerms([...selectedTerms, termId]);
    }
  };

  const combineSelectedTerms = () => {
    if (selectedTerms.length < 2) return;

    const selected = terms.filter(t => selectedTerms.includes(t.id));
    const canCombine = selected.every(t => t.variable === selected[0].variable);

    if (!canCombine) {
      alert('同じ文字の項だけを組み合わせることができます！');
      return;
    }

    const combinedCoeff = selected.reduce((sum, t) => sum + t.coefficient, 0);
    const newTerms = terms.filter(t => !selectedTerms.includes(t.id));
    
    if (combinedCoeff !== 0) {
      newTerms.push({
        id: `term-${Date.now()}`,
        coefficient: combinedCoeff,
        variable: selected[0].variable,
        isConstant: selected[0].isConstant
      });
    }

    const newExpression = termsToExpression(newTerms);
    setTerms(newTerms);
    setHistory([...history, newExpression]);
    setSelectedTerms([]);
    onManipulate(history);
    setShowExplanation(true);
  };

  const undo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previousExpression = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setTerms(parseExpression(previousExpression));
      setSelectedTerms([]);
    }
  };

  const addTerm = (coefficient: number, variable: string) => {
    const newTerm: Term = {
      id: `term-${Date.now()}`,
      coefficient,
      variable,
      isConstant: !variable
    };
    
    const newTerms = [...terms, newTerm];
    const newExpression = termsToExpression(newTerms);
    setTerms(newTerms);
    setHistory([...history, newExpression]);
    onManipulate(history);
  };

  const renderTerm = (term: Term) => {
    const isSelected = selectedTerms.includes(term.id);
    const displayText = `${term.coefficient === 1 && term.variable ? '' : 
                         term.coefficient === -1 && term.variable ? '-' : 
                         term.coefficient}${term.variable}`;

    return (
      <motion.div
        key={term.id}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          backgroundColor: isSelected ? '#2196F3' : '#f5f5f5',
          color: isSelected ? 'white' : 'black'
        }}
        style={{
          padding: '12px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'inline-block',
          margin: '4px',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          border: '2px solid',
          borderColor: isSelected ? '#1976D2' : '#ddd'
        }}
        onClick={() => handleTermClick(term.id)}
      >
        <DragIndicatorIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
        {displayText}
      </motion.div>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        代数的操作を体験しよう
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          同じ文字の項をクリックして選択し、まとめてみよう！
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1, 
          my: 3,
          p: 2,
          border: '2px dashed #ccc',
          borderRadius: 2,
          minHeight: 80
        }}>
          {terms.map(term => renderTerm(term))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            onClick={combineSelectedTerms}
            disabled={selectedTerms.length < 2}
          >
            選択した項をまとめる
          </Button>
          
          <IconButton onClick={undo} disabled={history.length <= 1}>
            <UndoIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            icon={<AddIcon />}
            label="+x"
            onClick={() => addTerm(1, 'x')}
            clickable
          />
          <Chip
            icon={<RemoveIcon />}
            label="-x"
            onClick={() => addTerm(-1, 'x')}
            clickable
          />
          <Chip
            icon={<AddIcon />}
            label="+1"
            onClick={() => addTerm(1, '')}
            clickable
          />
          <Chip
            icon={<RemoveIcon />}
            label="-1"
            onClick={() => addTerm(-1, '')}
            clickable
          />
        </Box>
      </Paper>

      {/* 操作履歴 */}
      <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100' }}>
        <Typography variant="subtitle2" gutterBottom>
          操作履歴:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {history.map((expr, index) => (
            <React.Fragment key={index}>
              <Chip label={expr} size="small" />
              {index < history.length - 1 && '→'}
            </React.Fragment>
          ))}
        </Box>
      </Paper>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => setTimeout(() => setShowExplanation(false), 3000)}
          >
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.light' }}>
              <Typography variant="body2">
                ✨ 同じ文字の項はまとめることができます！これを「同類項をまとめる」と言います。
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default AlgebraicManipulator;