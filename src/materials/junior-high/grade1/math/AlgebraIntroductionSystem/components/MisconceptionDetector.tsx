import React from 'react';
import { Box, Typography, Paper, Button, Alert, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

interface MisconceptionDetectorProps {
  misconceptions: string[];
  onClose: () => void;
}

interface MisconceptionInfo {
  type: string;
  title: string;
  explanation: string;
  example: string;
  correction: string;
}

const MisconceptionDetector: React.FC<MisconceptionDetectorProps> = ({
  misconceptions,
  onClose
}) => {
  const misconceptionDatabase: Record<string, MisconceptionInfo> = {
    empty_answer: {
      type: 'empty_answer',
      title: '答えが入力されていません',
      explanation: '問題を解くときは、必ず答えを入力しましょう。',
      example: '□に入る数を考えて、入力欄に数字を入れてください。',
      correction: 'わからない場合は、ヒントを参考にしてみましょう。'
    },
    non_numeric_answer: {
      type: 'non_numeric_answer',
      title: '数字以外が入力されています',
      explanation: 'この段階では、□には数字が入ります。',
      example: '正しい例: 5, 10, -3',
      correction: '文字や記号ではなく、数字を入力してください。'
    },
    sign_confusion: {
      type: 'sign_confusion',
      title: '符号（プラス・マイナス）の混乱',
      explanation: '足し算と引き算で符号が逆になっていませんか？',
      example: '3 + □ = 8 のとき、□ = 5（正の数）',
      correction: '式をよく見て、足し算か引き算かを確認しましょう。'
    },
    still_using_placeholder: {
      type: 'still_using_placeholder',
      title: '□を使い続けています',
      explanation: 'このステップでは、□の代わりに文字（x, y, aなど）を使います。',
      example: '□ + 5 = 12 → x + 5 = 12',
      correction: '□を文字に置き換えて書いてみましょう。'
    },
    including_equation: {
      type: 'including_equation',
      title: '等号（=）を含めています',
      explanation: '式の一部だけを書いてください。',
      example: '「x + 5」のように、等号の左側だけを書きます。',
      correction: '= 以降は含めないでください。'
    },
    difficulty_with_variables: {
      type: 'difficulty_with_variables',
      title: '文字の使い方に迷っていますか？',
      explanation: '文字は「わからない数」を表す記号です。',
      example: 'x, y, a などの文字は、どれも同じように使えます。',
      correction: 'まずは「x」を使ってみましょう。慣れたら他の文字も使えます。'
    }
  };

  const getRelevantMisconceptions = () => {
    return misconceptions
      .map(type => misconceptionDatabase[type])
      .filter(Boolean);
  };

  const relevantMisconceptions = getRelevantMisconceptions();

  if (relevantMisconceptions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Alert
        severity="warning"
        sx={{ mb: 3 }}
        action={
          <Button color="inherit" size="small" onClick={onClose}>
            <CloseIcon />
          </Button>
        }
      >
        <Typography variant="h6" gutterBottom>
          <WarningIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          よくある間違いを検出しました
        </Typography>
        
        {relevantMisconceptions.map((misconception, index) => (
          <Paper
            key={misconception.type}
            elevation={1}
            sx={{ p: 2, mt: 2, bgcolor: 'warning.light' }}
            component={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {misconception.title}
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="説明"
                  secondary={misconception.explanation}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="正しい例"
                  secondary={misconception.example}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="改善方法"
                  secondary={misconception.correction}
                />
              </ListItem>
            </List>
          </Paper>
        ))}
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            💡 これらは多くの生徒が経験する間違いです。間違えることも学習の一部です！
          </Typography>
        </Box>
      </Alert>
    </motion.div>
  );
};

export default MisconceptionDetector;