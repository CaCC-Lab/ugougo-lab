import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FunctionsIcon from '@mui/icons-material/Functions';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { LearningAssistant } from './common/LearningAssistant';
import { LearningMetrics } from './common/LearningMetrics';
import { algebraicExpressionConcepts } from '../utils/learningSupport';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

// 式表示のスタイル
const ExpressionBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  fontFamily: 'monospace',
  fontSize: '1.2rem',
  textAlign: 'center',
  minHeight: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// ステップ表示のスタイル
const StepBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  backgroundColor: 'rgba(25, 118, 210, 0.05)',
}));

interface Step {
  expression: string;
  explanation: string;
  highlight?: string[];
}

interface AlgebraicExpressionToolProps {
  onClose?: () => void;
}

// 文字式変形ツール（内部コンポーネント）
const AlgebraicExpressionToolContent: React.FC<AlgebraicExpressionToolProps> = () => {
  const { recordAnswer, recordInteraction, recordHintUsed } = useLearningTrackerContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [expression, setExpression] = useState('3x + 2x + 5');
  const [operation, setOperation] = useState<'simplify' | 'expand' | 'factorize'>('simplify');
  const [steps, setSteps] = useState<Step[]>([]);
  const [showSteps, setShowSteps] = useState(false);
  const [error, setError] = useState('');
  
  // 学習支援機能
  const [_hintsUsed, setHintsUsed] = useState(0);
  
  // サンプル問題
  const sampleProblems = {
    simplify: [
      { expr: '3x + 2x + 5', desc: '同類項をまとめる' },
      { expr: '4a - 2a + 3b + b', desc: '文字ごとに整理' },
      { expr: '2x + 3 - x + 4', desc: '項を並べ替えて計算' },
      { expr: '5y - 2y + 7 - 3', desc: '文字と数の整理' },
    ],
    expand: [
      { expr: '2(x + 3)', desc: '分配法則の基本' },
      { expr: '3(2a - 4)', desc: '係数の分配' },
      { expr: '-(x - 5)', desc: 'マイナスの分配' },
      { expr: '4(x + 2) + 3(x - 1)', desc: '複数の展開' },
    ],
    factorize: [
      { expr: '2x + 4', desc: '共通因数をくくり出す' },
      { expr: '3a - 6b', desc: '異なる文字の因数分解' },
      { expr: '5x + 10y', desc: '係数の最大公約数' },
      { expr: '4x - 8', desc: '負の項を含む' },
    ],
  };
  
  // 式の簡略化（同類項の整理）
  const simplifyExpression = (expr: string): Step[] => {
    const steps: Step[] = [];
    const current = expr.replace(/\s/g, '');
    
    // ステップ1: 元の式
    steps.push({
      expression: expr,
      explanation: '元の式',
    });
    
    // ステップ2: 項の分解
    const terms = current.match(/[+-]?[^+-]+/g) || [];
    const termMap: { [key: string]: number[] } = {};
    const constants: number[] = [];
    
    terms.forEach(term => {
      const match = term.match(/([+-]?\d*)([a-z]?)/);
      if (match) {
        const coefficient = match[1] === '' || match[1] === '+' ? 1 : 
                           match[1] === '-' ? -1 : parseInt(match[1]);
        const variable = match[2];
        
        if (variable) {
          if (!termMap[variable]) termMap[variable] = [];
          termMap[variable].push(coefficient);
        } else {
          constants.push(coefficient);
        }
      }
    });
    
    // ステップ3: 同類項の識別
    let identifyStr = expr;
    Object.keys(termMap).forEach(variable => {
      const regex = new RegExp(`[+-]?\\d*${variable}`, 'g');
      identifyStr = identifyStr.replace(regex, match => `[${match}]`);
    });
    
    steps.push({
      expression: identifyStr,
      explanation: '同類項を識別',
      highlight: Object.keys(termMap),
    });
    
    // ステップ4: 同類項の計算
    const simplifiedTerms: string[] = [];
    Object.keys(termMap).sort().forEach(variable => {
      const sum = termMap[variable].reduce((a, b) => a + b, 0);
      if (sum !== 0) {
        const sign = sum > 0 && simplifiedTerms.length > 0 ? '+' : '';
        const coef = Math.abs(sum) === 1 ? (sum < 0 ? '-' : sign) : sign + sum;
        simplifiedTerms.push(coef + variable);
      }
    });
    
    const constantSum = constants.reduce((a, b) => a + b, 0);
    if (constantSum !== 0) {
      const sign = constantSum > 0 && simplifiedTerms.length > 0 ? '+' : '';
      simplifiedTerms.push(sign + constantSum);
    }
    
    // ステップ5: 最終結果
    const result = simplifiedTerms.join('') || '0';
    steps.push({
      expression: result,
      explanation: '同類項をまとめた結果',
    });
    
    return steps;
  };
  
  // 式の展開
  const expandExpression = (expr: string): Step[] => {
    const steps: Step[] = [];
    
    // ステップ1: 元の式
    steps.push({
      expression: expr,
      explanation: '元の式',
    });
    
    // 基本的な展開パターンのマッチング
    const basicPattern = /([+-]?\d*)\s*\(\s*([^)]+)\s*\)/;
    const match = expr.match(basicPattern);
    
    if (match) {
      const coefficient = match[1] === '' || match[1] === '+' ? '1' : 
                         match[1] === '-' ? '-1' : match[1];
      const innerExpr = match[2];
      
      // ステップ2: 分配法則の適用
      steps.push({
        expression: `${coefficient} × (${innerExpr})`,
        explanation: '分配法則を適用する準備',
      });
      
      // ステップ3: 各項に分配
      const terms = innerExpr.match(/[+-]?[^+-]+/g) || [];
      const expandedTerms = terms.map((_term, index) => {
        const term = terms[index];
        const trimmedTerm = term.trim();
        const sign = trimmedTerm.startsWith('+') ? '+' : 
                    trimmedTerm.startsWith('-') ? '-' : '+';
        const termWithoutSign = trimmedTerm.replace(/^[+-]/, '');
        
        // 係数の計算
        const termMatch = termWithoutSign.match(/(\d*)([a-z]?)/);
        if (termMatch) {
          const termCoef = termMatch[1] === '' ? 1 : parseInt(termMatch[1]);
          const variable = termMatch[2];
          const resultCoef = parseInt(coefficient) * termCoef * (sign === '-' ? -1 : 1);
          
          return resultCoef >= 0 && index > 0 ? 
            `+${resultCoef}${variable}` : `${resultCoef}${variable}`;
        }
        return term;
      });
      
      steps.push({
        expression: expandedTerms.join(' '),
        explanation: '各項に分配した結果',
      });
      
      // ステップ4: 整理（必要な場合）
      const simplified = expandedTerms.join('').replace(/\+\-/g, '-');
      steps.push({
        expression: simplified,
        explanation: '最終結果',
      });
    } else {
      steps.push({
        expression: expr,
        explanation: '展開できる形式ではありません',
      });
    }
    
    return steps;
  };
  
  // 因数分解
  const factorizeExpression = (expr: string): Step[] => {
    const steps: Step[] = [];
    
    // ステップ1: 元の式
    steps.push({
      expression: expr,
      explanation: '元の式',
    });
    
    // 項の抽出
    const terms = expr.match(/[+-]?[^+-]+/g) || [];
    const coefficients: number[] = [];
    const variables: string[] = [];
    
    terms.forEach(term => {
      const match = term.match(/([+-]?\d+)([a-z]?)/);
      if (match) {
        coefficients.push(parseInt(match[1]));
        variables.push(match[2] || '1');
      }
    });
    
    // 最大公約数を求める
    const gcd = (a: number, b: number): number => {
      return b === 0 ? Math.abs(a) : gcd(b, a % b);
    };
    
    const commonFactor = coefficients.reduce(gcd);
    
    if (commonFactor > 1) {
      // ステップ2: 共通因数の識別
      steps.push({
        expression: `共通因数: ${commonFactor}`,
        explanation: '各項の最大公約数を見つける',
      });
      
      // ステップ3: 因数分解
      const factorizedTerms = terms.map((_term, index) => {
        const newCoef = coefficients[index] / commonFactor;
        const sign = newCoef >= 0 && index > 0 ? '+' : '';
        return sign + newCoef + variables[index].replace('1', '');
      });
      
      const innerExpr = factorizedTerms.join('');
      steps.push({
        expression: `${commonFactor}(${innerExpr})`,
        explanation: '共通因数でくくり出した結果',
      });
    } else {
      steps.push({
        expression: expr,
        explanation: '共通因数がないため、これ以上因数分解できません',
      });
    }
    
    return steps;
  };
  
  // 操作モードの変更時に記録
  const handleOperationChange = (_event: React.MouseEvent<HTMLElement>, newOperation: 'simplify' | 'expand' | 'factorize' | null) => {
    if (newOperation && newOperation !== operation) {
      setOperation(newOperation);
      recordInteraction('click');
    }
  };
  
  // 式の処理
  const processExpression = () => {
    setError('');
    setSteps([]);
    setShowSteps(false);
    
    if (!expression.trim()) {
      setError('式を入力してください');
      return;
    }
    
    try {
      let result: Step[] = [];
      
      switch (operation) {
        case 'simplify':
          result = simplifyExpression(expression);
          break;
        case 'expand':
          result = expandExpression(expression);
          break;
        case 'factorize':
          result = factorizeExpression(expression);
          break;
      }
      
      setSteps(result);
      setShowSteps(true);
      
      // 学習履歴に記録
      const isCorrect = result.length > 0 && result[result.length - 1].expression !== expression;
      recordAnswer(isCorrect, {
        problem: `${expression} を ${operation === 'simplify' ? '簡略化' : operation === 'expand' ? '展開' : '因数分解'}`,
        userAnswer: result[result.length - 1]?.expression || '',
        correctAnswer: result[result.length - 1]?.expression || ''
      });
    } catch (err) {
      setError('式の処理中にエラーが発生しました');
    }
  };
  
  // サンプル問題の選択
  const selectSample = (sample: { expr: string; desc: string }) => {
    setExpression(sample.expr);
    setSteps([]);
    setShowSteps(false);
    setError('');
  };
  
  return (
    <Container maxWidth="lg">
      <Card sx={{ backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FunctionsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              文字式変形ツール
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              文字式の展開、因数分解、同類項の整理をステップごとに学習しよう！
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Box sx={{ mb: 3 }}>
                <ToggleButtonGroup
                  value={operation}
                  exclusive
                  onChange={handleOperationChange}
                  aria-label="操作の種類"
                  size={isMobile ? 'small' : 'medium'}
                  fullWidth
                >
                  <ToggleButton value="simplify" aria-label="同類項の整理">
                    同類項の整理
                  </ToggleButton>
                  <ToggleButton value="expand" aria-label="展開">
                    展開
                  </ToggleButton>
                  <ToggleButton value="factorize" aria-label="因数分解">
                    因数分解
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="式を入力"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  variant="outlined"
                  placeholder={
                    operation === 'simplify' ? '例: 3x + 2x + 5' :
                    operation === 'expand' ? '例: 2(x + 3)' :
                    '例: 2x + 4'
                  }
                  error={!!error}
                  helperText={error}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={processExpression}
                    fullWidth
                  >
                    計算する
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={() => {
                      setExpression('');
                      setSteps([]);
                      setShowSteps(false);
                      setError('');
                    }}
                  >
                    クリア
                  </Button>
                </Box>
              </Box>
              
              {showSteps && steps.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArrowForwardIcon />
                    計算の手順
                  </Typography>
                  
                  {steps.map((step, index) => (
                    <StepBox key={index}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        ステップ {index + 1}: {step.explanation}
                      </Typography>
                      <ExpressionBox elevation={1}>
                        <Typography variant="h6" component="div" sx={{ fontFamily: 'monospace' }}>
                          {step.expression}
                        </Typography>
                      </ExpressionBox>
                      {index === steps.length - 1 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <CheckCircleIcon color="success" />
                          <Typography variant="body2" color="success.main">
                            完成！
                          </Typography>
                        </Box>
                      )}
                    </StepBox>
                  ))}
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HelpOutlineIcon />
                  練習問題
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  {sampleProblems[operation].map((sample, index) => (
                    <ListItem
                      key={index}
                      component="div"
                      onClick={() => selectSample(sample)}
                      sx={{
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                            {sample.expr}
                          </Typography>
                        }
                        secondary={sample.desc}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
              
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {operation === 'simplify' ? '同類項の整理' :
                   operation === 'expand' ? '式の展開' : 
                   '因数分解'}のポイント
                </Typography>
                {operation === 'simplify' && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      • 同じ文字を含む項をまとめます
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 係数（数字の部分）を足し算・引き算します
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 定数項（数字だけの項）も忘れずにまとめます
                    </Typography>
                  </>
                )}
                {operation === 'expand' && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      • かっこの外の数を、中のすべての項にかけます
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 符号（プラス・マイナス）に注意します
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 分配法則: a(b + c) = ab + ac
                    </Typography>
                  </>
                )}
                {operation === 'factorize' && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      • すべての項に共通する因数を見つけます
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 最大公約数でくくり出します
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 展開の逆の操作です
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* 学習支援コンポーネント */}
      <LearningAssistant
        materialId="algebraic-expression"
        concept={operation === 'simplify' ? '同類項' : operation === 'expand' ? '分配法則' : '因数分解'}
        currentProblem={expression}
        concepts={algebraicExpressionConcepts}
        onHintRequest={() => {
          setHintsUsed((prev) => prev + 1);
          recordHintUsed();
          // ヒントを表示する処理
        }}
      />
      
      {/* 学習指標表示 */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <LearningMetrics materialId="algebraic-expression" />
      </Box>
    </Container>
  );
};

// 文字式変形ツール（MaterialWrapperでラップ）
const AlgebraicExpressionTool: React.FC<AlgebraicExpressionToolProps> = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="algebraic-expression"
      materialName="文字式変形ツール"
      showMetricsButton={true}
      showAssistant={true}
    >
      <AlgebraicExpressionToolContent onClose={onClose} />
    </MaterialWrapper>
  );
};

export default AlgebraicExpressionTool;