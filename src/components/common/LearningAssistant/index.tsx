import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  Collapse,
  Fab,
  Badge,
  Divider,
} from '@mui/material';
import {
  Help as HelpIcon,
  Lightbulb as LightbulbIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useLearningStore } from '../../../stores/learningStore';
import {
  generateEncouragement,
  analyzeErrorPattern,
} from '../../../utils/learningSupport';
import type {
  LearningHint,
  ConceptExplanation,
} from '../../../utils/learningSupport';

interface LearningAssistantProps {
  materialId: string;
  concept: string;
  currentProblem?: string;
  onHintRequest?: (hint: LearningHint) => void;
  concepts?: ConceptExplanation[];
}

export const LearningAssistant: React.FC<LearningAssistantProps> = ({
  materialId,
  concept,
  currentProblem,
  onHintRequest,
  concepts = [],
}) => {
  const [open, setOpen] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const {
    getProgress,
    getRecordsByMaterial,
    getStreakDays,
  } = useLearningStore();
  
  const progress = getProgress(materialId);
  const records = getRecordsByMaterial(materialId);
  const streakDays = getStreakDays();
  
  // 最近のエラーパターンを分析
  const recentMistakes = records
    .slice(-10)
    .flatMap((r) => r.mistakes);
  const errorPatterns = analyzeErrorPattern(recentMistakes);
  
  // 現在の概念の説明を取得
  const currentConcept = concepts.find((c) => c.concept === concept);
  
  // ヒントの段階的表示
  const getProgressiveHint = (): LearningHint | null => {
    if (!currentProblem || !currentConcept) return null;
    
    const hints: LearningHint[] = [
      {
        level: 'beginner',
        hint: currentConcept.explanations.concrete,
        example: currentConcept.practiceProblems[0]?.problem,
      },
      {
        level: 'intermediate',
        hint: '問題をステップに分けて考えてみましょう',
        visualAid: currentConcept.explanations.visual,
      },
      {
        level: 'advanced',
        hint: currentConcept.practiceProblems[0]?.explanation || '',
      },
    ];
    
    return hints[Math.min(currentHintLevel, hints.length - 1)];
  };
  
  const handleHintRequest = () => {
    const hint = getProgressiveHint();
    if (hint && onHintRequest) {
      onHintRequest(hint);
      setCurrentHintLevel((prev) => Math.min(prev + 1, 2));
    }
    setShowHints(true);
  };
  
  // 励ましメッセージ
  const encouragement = generateEncouragement(
    progress?.masteryLevel || 0,
    records.length > 0 && records[records.length - 1]?.score >= 80,
    streakDays
  );
  
  return (
    <>
      {/* フローティングアクションボタン */}
      <Fab
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Badge badgeContent={errorPatterns.length} color="error">
          <PsychologyIcon />
        </Badge>
      </Fab>
      
      {/* メインダイアログ */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">学習アシスタント</Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {/* 進捗状況 */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">学習進捗</Typography>
              </Box>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">習熟度</Typography>
                  <Typography variant="body2">
                    {progress?.masteryLevel || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress?.masteryLevel || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  icon={<TrophyIcon />}
                  label={`${streakDays}日連続`}
                  size="small"
                  color="success"
                />
                <Chip
                  icon={<StarIcon />}
                  label={`平均スコア: ${progress?.averageScore.toFixed(0) || 0}点`}
                  size="small"
                />
                <Chip
                  label={`挑戦回数: ${progress?.attemptCount || 0}回`}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
          
          {/* 励ましメッセージ */}
          <Alert severity="success" sx={{ mb: 2 }}>
            {encouragement}
          </Alert>
          
          {/* エラーパターン分析 */}
          {errorPatterns.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <LightbulbIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">改善ポイント</Typography>
                  <IconButton
                    size="small"
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    sx={{ ml: 'auto' }}
                  >
                    {showAnalysis ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                
                <Collapse in={showAnalysis}>
                  <List dense>
                    {errorPatterns.map((pattern, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <SchoolIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={pattern.pattern}
                          secondary={pattern.suggestion}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </CardContent>
            </Card>
          )}
          
          {/* ヒントセクション */}
          {currentProblem && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <HelpIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">ヒント</Typography>
                </Box>
                
                {!showHints ? (
                  <Button
                    variant="outlined"
                    onClick={handleHintRequest}
                    fullWidth
                  >
                    ヒントを見る
                  </Button>
                ) : (
                  <>
                    <Alert severity="info" sx={{ mb: 1 }}>
                      {getProgressiveHint()?.hint}
                    </Alert>
                    {currentHintLevel < 2 && (
                      <Button
                        variant="text"
                        onClick={handleHintRequest}
                        size="small"
                      >
                        もっと詳しいヒント
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* 概念説明 */}
          {currentConcept && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {currentConcept.concept}の説明
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" paragraph>
                  {currentConcept.explanations.concrete}
                </Typography>
                
                {currentConcept.commonMistakes.length > 0 && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      よくある間違い:
                    </Typography>
                    <List dense>
                      {currentConcept.commonMistakes.map((mistake, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`・${mistake}`}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};