import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Fade,
  Paper,
  Avatar
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Person as PersonIcon,
  SmartToy as BotIcon,
  VolumeUp as SpeakIcon,
  Help as HelpIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowForward as NextIcon,
  Lightbulb as TipIcon
} from '@mui/icons-material';
import type { DialogueTurn, DialogueOption } from '../data/dialogueScenarios';

interface DialogueInterfaceProps {
  turn: DialogueTurn;
  onSelectOption?: (optionId: string) => void;
  onArrangeWords?: (words: string[]) => void;
  onNext: () => void;
  selectedOption?: string;
  arrangedWords?: string[];
  feedback?: string;
  progress: number;
  showPronunciationHelp: boolean;
  onToggleHelp: () => void;
}

export const DialogueInterface: React.FC<DialogueInterfaceProps> = ({
  turn,
  onSelectOption,
  onArrangeWords,
  onNext,
  selectedOption,
  arrangedWords = [],
  feedback,
  progress,
  showPronunciationHelp,
  onToggleHelp
}) => {
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (turn.words) {
      // 並び替え用の単語をシャッフル
      const shuffled = [...turn.words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled.filter(word => !arrangedWords.includes(word)));
    }
  }, [turn.words, arrangedWords]);

  const handleDragStart = (word: string) => {
    setDraggedWord(word);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedWord && onArrangeWords) {
      onArrangeWords([...arrangedWords, draggedWord]);
      setAvailableWords(prev => prev.filter(w => w !== draggedWord));
      setDraggedWord(null);
    }
  };

  const handleRemoveWord = (index: number) => {
    const word = arrangedWords[index];
    const newArranged = arrangedWords.filter((_, i) => i !== index);
    if (onArrangeWords) {
      onArrangeWords(newArranged);
    }
    setAvailableWords(prev => [...prev, word]);
  };

  const handleReset = () => {
    if (turn.words && onArrangeWords) {
      onArrangeWords([]);
      setAvailableWords([...turn.words].sort(() => Math.random() - 0.5));
    }
  };

  const renderSpeaker = () => {
    const isSystem = turn.speaker === 'system';
    return (
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar
          sx={{
            bgcolor: isSystem ? 'primary.main' : 'secondary.main',
            mr: 2
          }}
        >
          {isSystem ? <BotIcon /> : <PersonIcon />}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="bold">
          {isSystem ? '先生' : 'あなた'}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      {/* 進捗バー */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="caption" color="text.secondary">
            進捗状況
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} />
      </Box>

      <Card elevation={3}>
        <CardContent>
          {renderSpeaker()}

          {/* システムの発話 */}
          {turn.speaker === 'system' && (
            <Box>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  position: 'relative'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {turn.text}
                </Typography>
                {turn.translation && (
                  <Typography variant="body2" color="text.secondary">
                    {turn.translation}
                  </Typography>
                )}
                
                <Tooltip title="発音のヒント">
                  <IconButton
                    size="small"
                    onClick={onToggleHelp}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </Paper>

              {/* 発音のヒント */}
              <AnimatePresence>
                {showPronunciationHelp && turn.pronunciationTips && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Box mt={2} p={2} bgcolor="info.light" borderRadius={1}>
                      <Typography variant="subtitle2" gutterBottom>
                        <TipIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        発音のポイント
                      </Typography>
                      {turn.pronunciationTips.map((tip, index) => (
                        <Typography key={index} variant="body2" sx={{ ml: 3 }}>
                          • {tip}
                        </Typography>
                      ))}
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          )}

          {/* ユーザーの発話 - 選択式 */}
          {turn.speaker === 'user' && turn.options && (
            <Box>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                適切な返答を選んでください：
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                {turn.options.map((option) => {
                  const isSelected = selectedOption === option.id;
                  const isCorrect = option.isCorrect;
                  const showResult = isSelected && feedback;

                  return (
                    <motion.div
                      key={option.id}
                      whileHover={!isSelected ? { scale: 1.02 } : {}}
                      whileTap={!isSelected ? { scale: 0.98 } : {}}
                    >
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: !isSelected ? 'pointer' : 'default',
                          borderColor: showResult
                            ? isCorrect
                              ? 'success.main'
                              : 'error.main'
                            : 'divider',
                          borderWidth: showResult ? 2 : 1,
                          bgcolor: showResult
                            ? isCorrect
                              ? 'success.light'
                              : 'error.light'
                            : 'background.paper',
                          transition: 'all 0.3s'
                        }}
                        onClick={() => !isSelected && onSelectOption && onSelectOption(option.id)}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                            <Box flex={1}>
                              <Typography variant="body1" fontWeight={isSelected ? 'bold' : 'normal'}>
                                {option.text}
                              </Typography>
                              {option.phonetics && (
                                <Typography variant="caption" color="text.secondary">
                                  /{option.phonetics}/
                                </Typography>
                              )}
                              {option.katakanaHint && showPronunciationHelp && (
                                <Typography variant="caption" display="block" color="info.main">
                                  ({option.katakanaHint})
                                </Typography>
                              )}
                            </Box>
                            {showResult && (
                              <Box ml={2}>
                                {isCorrect ? (
                                  <CheckIcon color="success" />
                                ) : (
                                  <CloseIcon color="error" />
                                )}
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </Box>

              {/* フィードバック表示 */}
              {feedback && (
                <Fade in>
                  <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
                    <Typography variant="body2" color="text.primary">
                      {feedback}
                    </Typography>
                  </Box>
                </Fade>
              )}
            </Box>
          )}

          {/* ユーザーの発話 - 並び替え式 */}
          {turn.speaker === 'user' && turn.words && (
            <Box>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                単語を正しい順番に並び替えてください：
              </Typography>

              {/* 並び替えエリア */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  minHeight: 60,
                  mt: 2,
                  bgcolor: 'grey.50',
                  border: '2px dashed',
                  borderColor: 'grey.300'
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {arrangedWords.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    ここに単語をドラッグ＆ドロップ
                  </Typography>
                ) : (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {arrangedWords.map((word, index) => (
                      <Chip
                        key={`${word}-${index}`}
                        label={word}
                        color="primary"
                        onDelete={() => handleRemoveWord(index)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                )}
              </Paper>

              {/* 選択可能な単語 */}
              <Box mt={3}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  使える単語：
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {availableWords.map((word, index) => (
                    <motion.div
                      key={`${word}-${index}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Chip
                        label={word}
                        variant="outlined"
                        draggable
                        onDragStart={() => handleDragStart(word)}
                        onClick={() => {
                          if (onArrangeWords) {
                            onArrangeWords([...arrangedWords, word]);
                            setAvailableWords(prev => prev.filter(w => w !== word));
                          }
                        }}
                        sx={{
                          cursor: 'grab',
                          '&:active': { cursor: 'grabbing' }
                        }}
                      />
                    </motion.div>
                  ))}
                </Box>
              </Box>

              {/* コントロールボタン */}
              <Box display="flex" gap={2} mt={3}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleReset}
                  disabled={arrangedWords.length === 0}
                >
                  リセット
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  {showAnswer ? '答えを隠す' : '答えを見る'}
                </Button>
              </Box>

              {/* 正解表示 */}
              <AnimatePresence>
                {showAnswer && turn.correctOrder && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Box mt={2} p={2} bgcolor="info.light" borderRadius={1}>
                      <Typography variant="body2">
                        正解: {turn.correctOrder.join(' ')}
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* フィードバック */}
              {feedback && (
                <Fade in>
                  <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
                    <Typography variant="body2" color="text.primary">
                      {feedback}
                    </Typography>
                  </Box>
                </Fade>
              )}

              {/* 発音のヒント */}
              {turn.pronunciationTips && showPronunciationHelp && (
                <Box mt={3} p={2} bgcolor="info.light" borderRadius={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    <TipIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    発音のポイント
                  </Typography>
                  {turn.pronunciationTips.map((tip, index) => (
                    <Typography key={index} variant="body2" sx={{ ml: 3 }}>
                      • {tip}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* 次へボタン */}
          {((turn.options && selectedOption) || (turn.words && feedback)) && (
            <Box display="flex" justifyContent="flex-end" mt={3}>
              <Button
                variant="contained"
                color="primary"
                endIcon={<NextIcon />}
                onClick={onNext}
              >
                次へ進む
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};