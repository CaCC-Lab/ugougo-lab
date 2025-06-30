/**
 * マウストラッカーコンポーネント
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  LinearProgress,
  Chip,
  Stack,
  Alert,
  Collapse,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  TouchApp,
  Timeline as SmoothnessIcon,
  PanTool as DragIcon,
  Timer as TimingIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useMouseTracker } from '../../hooks/useMouseTracker';
import { useMouseSkillStore } from '../../stores/mouseSkillStore';
import { MouseSkillLevel } from '../../types/mouse-practice';
import type { MouseMetrics, MousePracticeProps } from '../../types/mouse-practice';

/**
 * メトリクスカード
 */
const MetricCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <Paper
    elevation={1}
    sx={{
      p: 2,
      textAlign: 'center',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      borderTop: `3px solid ${color}`,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
      {icon}
      <Typography variant="caption" sx={{ ml: 1 }}>
        {label}
      </Typography>
    </Box>
    <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
      {value}%
    </Typography>
    <LinearProgress
      variant="determinate"
      value={value}
      sx={{
        mt: 1,
        height: 6,
        borderRadius: 3,
        backgroundColor: `${color}20`,
        '& .MuiLinearProgress-bar': {
          backgroundColor: color,
          borderRadius: 3,
        },
      }}
    />
  </Paper>
);

/**
 * スキルレベルバッジ
 */
const SkillLevelBadge: React.FC<{ level: MouseSkillLevel }> = ({ level }) => {
  const levelInfo = {
    [MouseSkillLevel.BEGINNER]: { label: '初心者', color: '#4CAF50' },
    [MouseSkillLevel.INTERMEDIATE]: { label: '中級者', color: '#2196F3' },
    [MouseSkillLevel.ADVANCED]: { label: '上級者', color: '#FF9800' },
    [MouseSkillLevel.EXPERT]: { label: 'エキスパート', color: '#9C27B0' },
  };

  const info = levelInfo[level];

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Chip
        icon={<TrophyIcon />}
        label={info.label}
        sx={{
          backgroundColor: info.color,
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1rem',
          py: 2,
        }}
      />
    </motion.div>
  );
};

/**
 * マウストラッカーコンポーネント
 */
export const MouseTracker: React.FC<MousePracticeProps> = ({
  taskType = 'mixed',
  difficulty = 'easy',
  onComplete,
  onProgress,
  showMetrics = true,
  adaptiveUI = true,
  gamificationEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [showInfo, setShowInfo] = useState(false);
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [sessionScore, setSessionScore] = useState(0);

  const {
    startTracking,
    stopTracking,
    resetTracking,
    isTracking,
    metrics,
    skillLevel,
    trackingData,
    updateMetrics,
  } = useMouseTracker();

  const {
    updateMetrics: updateStoreMetrics,
    updateSkillLevel,
    startSession,
    endSession,
    unlockedBadges,
    badges,
    checkBadgeUnlocks,
    gamificationEnabled: globalGamification,
    soundEnabled,
    getAdaptiveUIConfig,
  } = useMouseSkillStore();

  const showGamification = gamificationEnabled && globalGamification;
  const adaptiveConfig = useMemo(() => getAdaptiveUIConfig(), [getAdaptiveUIConfig]);

  /**
   * キャンバスの初期化
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズ設定
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  /**
   * マウストラジェクトリの描画
   */
  useEffect(() => {
    if (!isTracking || !adaptiveConfig.showTrajectory) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawTrajectory = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // マウスの軌跡を描画
      if (trackingData.positions.length > 1) {
        ctx.strokeStyle = 'rgba(33, 150, 243, 0.5)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const rect = canvas.getBoundingClientRect();
        
        trackingData.positions.forEach((pos, index) => {
          const x = pos.x - rect.left;
          const y = pos.y - rect.top;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();
      }

      // クリック位置を描画
      trackingData.clicks.forEach(click => {
        const rect = canvas.getBoundingClientRect();
        const x = click.x - rect.left;
        const y = click.y - rect.top;

        ctx.fillStyle = 'rgba(76, 175, 80, 0.6)';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(drawTrajectory);
    };

    drawTrajectory();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTracking, trackingData, adaptiveConfig.showTrajectory]);

  /**
   * トラッキング開始
   */
  const handleStart = () => {
    resetTracking();
    startTracking();
    const sessionId = `session-${Date.now()}`;
    startSession(sessionId, taskType);
  };

  /**
   * トラッキング停止
   */
  const handleStop = () => {
    stopTracking();
    updateMetrics();

    // スコア計算
    const score = Math.round(
      (metrics.accuracy + metrics.smoothness + metrics.dragControl + metrics.clickTiming) / 4
    );
    setSessionScore(score);

    // Store更新
    updateStoreMetrics(metrics);
    updateSkillLevel(skillLevel);
    endSession(metrics, score);

    // バッジチェック
    const previousUnlocked = [...unlockedBadges];
    checkBadgeUnlocks(metrics);
    
    // 新しく解除されたバッジを検出
    const newlyUnlocked = unlockedBadges.filter(id => previousUnlocked.indexOf(id) === -1);
    if (newlyUnlocked.length > 0) {
      setNewBadges(newlyUnlocked);
      setShowBadgeDialog(true);
      
      // 祝福エフェクト
      if (showGamification) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }

    // コールバック
    if (onComplete) {
      onComplete({
        sessionId: `session-${Date.now()}`,
        startTime: new Date(),
        taskType,
        difficulty,
        score,
        metrics,
        improvements: [],
      });
    }
  };

  /**
   * リセット
   */
  const handleReset = () => {
    resetTracking();
    setSessionScore(0);
  };

  /**
   * 進捗更新（定期的に呼ばれる）
   */
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      updateMetrics();
      if (onProgress) {
        onProgress(metrics);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, metrics, updateMetrics, onProgress]);

  return (
    <Box sx={{ p: 3 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          マウス練習トラッカー
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {showGamification && <SkillLevelBadge level={skillLevel} />}
          <Tooltip title="使い方">
            <IconButton onClick={() => setShowInfo(!showInfo)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* 使い方情報 */}
      <Collapse in={showInfo}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            マウスの動きを追跡して、操作スキルを測定します。
            開始ボタンを押してから、画面上でマウスを動かしたり、クリックしたり、ドラッグしたりしてください。
            停止ボタンを押すと、あなたのマウススキルが評価されます。
          </Typography>
        </Alert>
      </Collapse>

      {/* トラッキングエリア */}
      <Paper
        elevation={3}
        sx={{
          position: 'relative',
          height: 400,
          mb: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: isTracking ? 'auto' : 'none',
          }}
        />
        
        {!isTracking && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              練習を開始するには開始ボタンを押してください
            </Typography>
            {sessionScore > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h3" color="primary" sx={{ mt: 2 }}>
                  スコア: {sessionScore}点
                </Typography>
              </motion.div>
            )}
          </Box>
        )}
      </Paper>

      {/* コントロール */}
      <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<PlayIcon />}
          onClick={handleStart}
          disabled={isTracking}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: adaptiveUI ? adaptiveConfig.buttonSize === 'large' ? '1.2rem' : '1rem' : '1rem',
          }}
        >
          開始
        </Button>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<StopIcon />}
          onClick={handleStop}
          disabled={!isTracking}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: adaptiveUI ? adaptiveConfig.buttonSize === 'large' ? '1.2rem' : '1rem' : '1rem',
          }}
        >
          停止
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<RefreshIcon />}
          onClick={handleReset}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: adaptiveUI ? adaptiveConfig.buttonSize === 'large' ? '1.2rem' : '1rem' : '1rem',
          }}
        >
          リセット
        </Button>
      </Stack>

      {/* メトリクス表示 */}
      {showMetrics && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Typography variant="h6" gutterBottom>
              パフォーマンスメトリクス
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 2,
              }}
            >
              <MetricCard
                label="クリック精度"
                value={Math.round(metrics.accuracy)}
                icon={<TouchApp sx={{ color: '#4CAF50' }} />}
                color="#4CAF50"
              />
              <MetricCard
                label="移動速度"
                value={Math.min(100, Math.round(metrics.speed / 4))}
                icon={<SpeedIcon sx={{ color: '#2196F3' }} />}
                color="#2196F3"
              />
              <MetricCard
                label="滑らかさ"
                value={Math.round(metrics.smoothness)}
                icon={<SmoothnessIcon sx={{ color: '#FF9800' }} />}
                color="#FF9800"
              />
              <MetricCard
                label="ドラッグ制御"
                value={Math.round(metrics.dragControl)}
                icon={<DragIcon sx={{ color: '#9C27B0' }} />}
                color="#9C27B0"
              />
              <MetricCard
                label="タイミング"
                value={Math.round(metrics.clickTiming)}
                icon={<TimingIcon sx={{ color: '#F44336' }} />}
                color="#F44336"
              />
              <MetricCard
                label="ダブルクリック"
                value={Math.round(metrics.doubleClickRate)}
                icon={<TouchApp sx={{ color: '#00BCD4' }} />}
                color="#00BCD4"
              />
            </Box>
          </motion.div>
        </AnimatePresence>
      )}

      {/* バッジ獲得ダイアログ */}
      <Dialog open={showBadgeDialog} onClose={() => setShowBadgeDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrophyIcon sx={{ color: '#FFD700' }} />
            <Typography variant="h6">新しいバッジを獲得！</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {newBadges.map(badgeId => {
              const badge = badges.find(b => b.id === badgeId);
              if (!badge) return null;
              
              return (
                <Paper key={badge.id} elevation={1} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4">{badge.icon}</Typography>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {badge.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {badge.description}
                      </Typography>
                      <Chip
                        label={badge.rarity}
                        size="small"
                        sx={{
                          mt: 1,
                          backgroundColor: 
                            badge.rarity === 'legendary' ? '#9C27B0' :
                            badge.rarity === 'epic' ? '#FF9800' :
                            badge.rarity === 'rare' ? '#2196F3' : '#4CAF50',
                          color: 'white',
                        }}
                      />
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBadgeDialog(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};