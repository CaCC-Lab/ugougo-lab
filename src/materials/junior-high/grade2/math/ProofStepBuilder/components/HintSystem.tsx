// ヒント表示システムのコンポーネント
import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  Stepper,
  Step,
  StepLabel,
  Collapse,
  IconButton,
  Fade
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import type { ProofProblem } from '../types';

interface HintSystemProps {
  problem: ProofProblem | null;
  showHint: boolean;
  currentHintIndex: number;
  onShowNextHint: () => void;
  onReset: () => void;
}

export const HintSystem: React.FC<HintSystemProps> = ({
  problem,
  showHint,
  currentHintIndex,
  onShowNextHint,
  onReset
}) => {
  const [showHintPanel, setShowHintPanel] = React.useState(false);

  if (!problem) {
    return null;
  }

  const hasMoreHints = currentHintIndex < problem.hints.length - 1;

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightbulbIcon color="warning" />
          ヒント・サポート
        </Typography>
        {showHintPanel && (
          <IconButton size="small" onClick={() => setShowHintPanel(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* ヒントボタン */}
      {!showHintPanel && (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<LightbulbIcon />}
            onClick={() => {
              setShowHintPanel(true);
              if (!showHint) onShowNextHint();
            }}
            sx={{ mb: 2 }}
          >
            ヒントを表示
          </Button>
        </Box>
      )}

      {/* ヒントパネル */}
      <Collapse in={showHintPanel}>
        {showHint && (
          <>
            {/* ヒントステッパー */}
            <Stepper activeStep={currentHintIndex} sx={{ mb: 3 }}>
              {problem.hints.map((_, index) => (
                <Step key={index} completed={index <= currentHintIndex}>
                  <StepLabel>ヒント {index + 1}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* 現在のヒント */}
            <Alert 
              severity="info" 
              icon={<LightbulbIcon />}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                {problem.hints[currentHintIndex]}
              </Typography>
            </Alert>

            {/* ナビゲーションボタン */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              {hasMoreHints && (
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<NavigateNextIcon />}
                  onClick={onShowNextHint}
                  size="small"
                >
                  次のヒント
                </Button>
              )}
              {!hasMoreHints && (
                <Typography variant="caption" color="text.secondary">
                  すべてのヒントを表示しました
                </Typography>
              )}
            </Box>
          </>
        )}
      </Collapse>

      {/* よくある間違い */}
      {problem.commonMistakes.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="error" gutterBottom>
            よくある間違い
          </Typography>
          <Box sx={{ pl: 2 }}>
            {problem.commonMistakes.map((mistake, index) => (
              <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                • {mistake}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      {/* リセットボタン */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="text"
          color="secondary"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          size="small"
        >
          証明をリセット
        </Button>
      </Box>

      {/* 学習のポイント（段階的表示） */}
      <ProofTips 
        currentHintIndex={currentHintIndex}
        showHint={showHint}
      />
    </Paper>
  );
};

// 証明のコツを段階的に表示するコンポーネント
interface ProofTipsProps {
  currentHintIndex: number;
  showHint: boolean;
}

const ProofTips: React.FC<ProofTipsProps> = ({ currentHintIndex, showHint }) => {
  const [tipsLevel, setTipsLevel] = React.useState(0);

  // 証明のコツを段階的に定義
  const proofTips = [
    {
      level: 0,
      tip: "証明を始める前に、問題文をよく読んで理解しましょう"
    },
    {
      level: 1,
      tip: "1. まず「仮定」と「結論」を明確にしましょう"
    },
    {
      level: 2,
      tip: "2. 図形を見て、使える定理や性質を探しましょう"
    },
    {
      level: 3,
      tip: "3. 結論から逆算して、必要な条件を考えましょう"
    },
    {
      level: 4,
      tip: "4. 各ステップに理由を付けて、論理的につなげましょう"
    }
  ];

  // ヒントが表示されるたびにコツのレベルを上げる
  React.useEffect(() => {
    if (showHint && currentHintIndex >= 0) {
      // ヒントインデックスに応じてコツのレベルを設定（最大4）
      const newLevel = Math.min(currentHintIndex + 1, proofTips.length - 1);
      setTipsLevel(newLevel);
    }
  }, [currentHintIndex, showHint]);

  return (
    <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        💡 証明のコツ
      </Typography>
      
      {/* 現在のレベルまでのコツを表示 */}
      {proofTips.slice(0, tipsLevel + 1).map((tipItem, index) => (
        <Fade in={true} key={index} timeout={600 * (index + 1)}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: index < tipsLevel ? 1 : 0,
              opacity: index === tipsLevel ? 1 : 0.7
            }}
          >
            {tipItem.tip}
          </Typography>
        </Fade>
      ))}

      {/* まだ表示されていないコツがある場合の表示 */}
      {tipsLevel < proofTips.length - 1 && (
        <Typography 
          variant="caption" 
          color="text.disabled" 
          sx={{ 
            display: 'block',
            mt: 1,
            fontStyle: 'italic'
          }}
        >
          ヒントを使うと、より多くのコツが表示されます...
        </Typography>
      )}
    </Box>
  );
};