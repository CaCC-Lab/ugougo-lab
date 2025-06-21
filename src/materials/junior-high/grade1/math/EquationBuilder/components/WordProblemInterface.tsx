/**
 * 文章題インターフェースコンポーネント
 * 
 * 機能：
 * - 文章題の段階的理解サポート
 * - キーワードのハイライト表示
 * - 変数の定義と関係性の可視化
 * - 式の組み立てサポート
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import {
  LightbulbOutlined as LightbulbIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Functions as FunctionsIcon,
  Assignment as AssignmentIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { EquationProblem, Equation } from '../types';

interface WordProblemInterfaceProps {
  problem: EquationProblem;
  onEquationBuilt: (equation: Equation) => void;
  onShowHint: () => void;
}

interface WordAnalysis {
  variables: { [key: string]: string };
  relationships: string[];
  equation: string;
  keywords: string[];
}

export const WordProblemInterface: React.FC<WordProblemInterfaceProps> = ({
  problem,
  onEquationBuilt,
  onShowHint
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [analysis, setAnalysis] = useState<WordAnalysis>({
    variables: {},
    relationships: [],
    equation: '',
    keywords: []
  });
  const [variableName, setVariableName] = useState('x');
  const [variableDescription, setVariableDescription] = useState('');
  const [showKeywords, setShowKeywords] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  
  // 文章題からキーワードを抽出
  const extractKeywords = (text: string): string[] => {
    const keywordPatterns = [
      '合計', '全部で', '合わせて', '一緒に',
      'より多い', 'より少ない', '差', '違い',
      '倍', '半分', '分の',
      '増える', '減る', '加える', '引く',
      '同じ', '等しい', 'ずつ',
      '個', '円', '人', 'km', 'kg', 'L',
      '買う', '売る', '使う', '残る'
    ];
    
    return keywordPatterns.filter(keyword => text.includes(keyword));
  };
  
  // ステップを進める
  const handleNext = () => {
    if (activeStep < 3) {
      setActiveStep(prev => prev + 1);
      setExpandedStep(activeStep + 1);
    }
  };
  
  // ステップを戻る
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      setExpandedStep(activeStep - 1);
    }
  };
  
  // 変数を追加
  const addVariable = () => {
    if (variableName && variableDescription) {
      setAnalysis(prev => ({
        ...prev,
        variables: {
          ...prev.variables,
          [variableName]: variableDescription
        }
      }));
      setVariableName('x');
      setVariableDescription('');
    }
  };
  
  // 関係性を追加
  const addRelationship = (relationship: string) => {
    setAnalysis(prev => ({
      ...prev,
      relationships: [...prev.relationships, relationship]
    }));
  };
  
  // 方程式を確定
  const confirmEquation = () => {
    if (problem.equation) {
      onEquationBuilt(problem.equation);
    }
  };
  
  // キーワードをハイライト表示
  const highlightKeywords = (text: string, keywords: string[]): React.ReactNode => {
    if (keywords.length === 0) return text;
    
    const regex = new RegExp(`(${keywords.join('|')})`, 'g');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (keywords.includes(part)) {
        return (
          <Chip
            key={index}
            label={part}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mx: 0.5, my: 0.25, cursor: 'pointer' }}
            onClick={() => {
              // キーワードクリック時の処理
            }}
          />
        );
      }
      return part;
    });
  };
  
  React.useEffect(() => {
    if (problem.description) {
      const keywords = extractKeywords(problem.description);
      setAnalysis(prev => ({ ...prev, keywords }));
    }
  }, [problem]);
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 3, flex: 1, overflow: 'auto' }}>
        {/* 問題文 */}
        <Card sx={{ mb: 3, backgroundColor: '#F5F5F5' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AssignmentIcon sx={{ mr: 1, color: '#2196F3' }} />
              <Typography variant="h6">{problem.title}</Typography>
            </Box>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {showKeywords
                ? highlightKeywords(problem.description, analysis.keywords)
                : problem.description}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title={showKeywords ? 'キーワードを隠す' : 'キーワードを表示'}>
                <IconButton
                  size="small"
                  onClick={() => setShowKeywords(!showKeywords)}
                >
                  <LightbulbIcon color={showKeywords ? 'primary' : 'inherit'} />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
        
        {/* 解法ステップ */}
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* ステップ1: 何を求めるか理解する */}
          <Step>
            <StepLabel
              optional={
                <Typography variant="caption">問題の理解</Typography>
              }
              StepIconComponent={() => (
                <IconButton
                  size="small"
                  onClick={() => setExpandedStep(expandedStep === 0 ? null : 0)}
                >
                  {expandedStep === 0 ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            >
              何を求めるか理解する
            </StepLabel>
            <Collapse in={expandedStep === 0}>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    問題文をよく読んで、何を求めるのか確認しましょう
                  </Alert>
                  {problem.wordProblem && (
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          求めるもの:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {problem.wordProblem.question}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={activeStep !== 0}
                    >
                      次へ
                    </Button>
                    <Button onClick={onShowHint} variant="outlined">
                      ヒント
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Collapse>
          </Step>
          
          {/* ステップ2: 変数を決める */}
          <Step>
            <StepLabel
              optional={
                <Typography variant="caption">変数の定義</Typography>
              }
              StepIconComponent={() => (
                <IconButton
                  size="small"
                  onClick={() => setExpandedStep(expandedStep === 1 ? null : 1)}
                >
                  {expandedStep === 1 ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            >
              変数を決める
            </StepLabel>
            <Collapse in={expandedStep === 1}>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    わからない数を文字（変数）で表しましょう
                  </Alert>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={3}>
                      <TextField
                        label="変数"
                        value={variableName}
                        onChange={(e) => setVariableName(e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={7}>
                      <TextField
                        label="変数の意味"
                        value={variableDescription}
                        onChange={(e) => setVariableDescription(e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="例: りんごの個数"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Button
                        variant="outlined"
                        onClick={addVariable}
                        disabled={!variableName || !variableDescription}
                        fullWidth
                      >
                        追加
                      </Button>
                    </Grid>
                  </Grid>
                  
                  {Object.entries(analysis.variables).length > 0 && (
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        定義した変数:
                      </Typography>
                      <List dense>
                        {Object.entries(analysis.variables).map(([key, value]) => (
                          <ListItem key={key}>
                            <ListItemIcon>
                              <FunctionsIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`${key} = ${value}`}
                              primaryTypographyProps={{ fontFamily: 'monospace' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Card>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button onClick={handleBack}>戻る</Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={Object.keys(analysis.variables).length === 0}
                    >
                      次へ
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Collapse>
          </Step>
          
          {/* ステップ3: 関係を見つける */}
          <Step>
            <StepLabel
              optional={
                <Typography variant="caption">関係性の理解</Typography>
              }
              StepIconComponent={() => (
                <IconButton
                  size="small"
                  onClick={() => setExpandedStep(expandedStep === 2 ? null : 2)}
                >
                  {expandedStep === 2 ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            >
              数量の関係を見つける
            </StepLabel>
            <Collapse in={expandedStep === 2}>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    問題文から数量の関係を見つけて、式で表しましょう
                  </Alert>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    よく使う関係性:
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {[
                      '合計 = A + B',
                      'A = B × 倍率',
                      '差 = A - B',
                      '1個あたり × 個数 = 全体'
                    ].map((relation) => (
                      <Grid item key={relation}>
                        <Chip
                          label={relation}
                          onClick={() => addRelationship(relation)}
                          clickable
                          color="secondary"
                          variant="outlined"
                        />
                      </Grid>
                    ))}
                  </Grid>
                  
                  {analysis.relationships.length > 0 && (
                    <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        見つけた関係:
                      </Typography>
                      <List dense>
                        {analysis.relationships.map((rel, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CalculateIcon color="secondary" />
                            </ListItemIcon>
                            <ListItemText primary={rel} />
                          </ListItem>
                        ))}
                      </List>
                    </Card>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button onClick={handleBack}>戻る</Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={analysis.relationships.length === 0}
                    >
                      次へ
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Collapse>
          </Step>
          
          {/* ステップ4: 方程式を作る */}
          <Step>
            <StepLabel
              optional={
                <Typography variant="caption">方程式の作成</Typography>
              }
              StepIconComponent={() => (
                <IconButton
                  size="small"
                  onClick={() => setExpandedStep(expandedStep === 3 ? null : 3)}
                >
                  {expandedStep === 3 ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            >
              方程式を作る
            </StepLabel>
            <Collapse in={expandedStep === 3}>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    これまでの分析をもとに、方程式を作りましょう
                  </Alert>
                  
                  <Card sx={{ p: 2, backgroundColor: '#E3F2FD', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', textAlign: 'center' }}>
                      {problem.equation?.originalForm}
                    </Typography>
                  </Card>
                  
                  <TextField
                    label="あなたの方程式"
                    value={analysis.equation}
                    onChange={(e) => setAnalysis(prev => ({ ...prev, equation: e.target.value }))}
                    fullWidth
                    sx={{ mb: 2 }}
                    placeholder="例: 100x + 50 = 350"
                  />
                  
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button onClick={handleBack}>戻る</Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CheckIcon />}
                      onClick={confirmEquation}
                    >
                      方程式を確定
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Collapse>
          </Step>
        </Stepper>
        
        {/* ヒント */}
        {problem.wordProblem && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              💡 ポイント
            </Typography>
            <Typography variant="body2" color="text.secondary">
              文章題では、まず何を求めるのかを明確にし、わからない数を文字で表すことが大切です。
              その後、問題文から数量の関係を見つけて、等式（方程式）を作りましょう。
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};