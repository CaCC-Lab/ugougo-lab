/**
 * マウス練習機能を既存教材に統合するHOC
 */

import React, { useState, useEffect, ComponentType } from 'react';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Alert,
  Collapse,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Mouse as MouseIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  School as PracticeIcon,
  EmojiEvents as TrophyIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMouseTracker } from '../../hooks/useMouseTracker';
import { useMouseSkillStore } from '../../stores/mouseSkillStore';
import { MouseTracker } from './MouseTracker';
import { MouseSkillLevel } from '../../types/mouse-practice';
import type { AdaptiveUIConfig } from '../../types/mouse-practice';

/**
 * マウス練習対応教材のProps
 */
export interface WithMousePracticeProps {
  mousePracticeEnabled?: boolean;
  mousePracticeMode?: 'embedded' | 'overlay' | 'standalone';
  showPracticeButton?: boolean;
  adaptiveUI?: boolean;
}

/**
 * 練習モード設定
 */
interface PracticeModeSettings {
  enabled: boolean;
  mode: 'embedded' | 'overlay' | 'standalone';
  showMetrics: boolean;
  adaptiveUI: boolean;
  autoStart: boolean;
}

/**
 * スキルレベル表示
 */
const SkillLevelIndicator: React.FC<{ level: MouseSkillLevel }> = ({ level }) => {
  const levelInfo = {
    [MouseSkillLevel.BEGINNER]: { label: '初級', color: '#4CAF50' },
    [MouseSkillLevel.INTERMEDIATE]: { label: '中級', color: '#2196F3' },
    [MouseSkillLevel.ADVANCED]: { label: '上級', color: '#FF9800' },
    [MouseSkillLevel.EXPERT]: { label: '達人', color: '#9C27B0' },
  };

  const info = levelInfo[level];

  return (
    <Chip
      icon={<MouseIcon />}
      label={info.label}
      size="small"
      sx={{
        backgroundColor: info.color,
        color: 'white',
        fontWeight: 'bold',
      }}
    />
  );
};

/**
 * アダプティブUIラッパー
 */
const AdaptiveUIWrapper: React.FC<{
  children: React.ReactNode;
  config: AdaptiveUIConfig;
  enabled: boolean;
}> = ({ children, config, enabled }) => {
  if (!enabled) return <>{children}</>;

  return (
    <Box
      sx={{
        '& button, & .MuiButton-root': {
          minWidth: config.buttonSize === 'large' ? 120 : config.buttonSize === 'medium' ? 90 : 60,
          minHeight: config.buttonSize === 'large' ? 48 : config.buttonSize === 'medium' ? 36 : 32,
          fontSize: config.buttonSize === 'large' ? '1.1rem' : config.buttonSize === 'medium' ? '1rem' : '0.9rem',
        },
        '& .MuiIconButton-root': {
          padding: config.clickAreaPadding,
        },
        '& [data-clickable="true"]': {
          position: 'relative',
          '&::before': config.visualHints ? {
            content: '""',
            position: 'absolute',
            top: -config.clickAreaPadding,
            left: -config.clickAreaPadding,
            right: -config.clickAreaPadding,
            bottom: -config.clickAreaPadding,
            border: '2px dashed rgba(33, 150, 243, 0.3)',
            borderRadius: '8px',
            pointerEvents: 'none',
          } : {},
        },
      }}
    >
      {children}
    </Box>
  );
};

/**
 * マウス練習HOC
 */
export function withMousePractice<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: {
    requiredSkillLevel?: MouseSkillLevel;
    practiceTaskType?: 'click' | 'drag' | 'trace' | 'mixed';
    customPracticeComponent?: ComponentType;
  }
) {
  return React.forwardRef<any, P & WithMousePracticeProps>((props, ref) => {
    const {
      mousePracticeEnabled = true,
      mousePracticeMode = 'overlay',
      showPracticeButton = true,
      adaptiveUI = true,
      ...componentProps
    } = props;

    const [showPracticeDialog, setShowPracticeDialog] = useState(false);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showSkillAlert, setShowSkillAlert] = useState(false);
    const [practiceSettings, setPracticeSettings] = useState<PracticeModeSettings>({
      enabled: mousePracticeEnabled,
      mode: mousePracticeMode,
      showMetrics: true,
      adaptiveUI: adaptiveUI,
      autoStart: false,
    });

    const {
      currentLevel,
      metrics,
      getAdaptiveUIConfig,
      adaptiveUIEnabled,
      gamificationEnabled,
    } = useMouseSkillStore();

    const { startTracking, stopTracking, isTracking } = useMouseTracker();

    const adaptiveConfig = getAdaptiveUIConfig();

    // スキルレベルチェック
    useEffect(() => {
      if (options?.requiredSkillLevel && currentLevel < options.requiredSkillLevel) {
        setShowSkillAlert(true);
      }
    }, [currentLevel, options?.requiredSkillLevel]);

    // 練習モードの自動開始
    useEffect(() => {
      if (practiceSettings.autoStart && practiceSettings.enabled) {
        startTracking();
      }
      return () => {
        if (isTracking) {
          stopTracking();
        }
      };
    }, [practiceSettings.autoStart, practiceSettings.enabled, startTracking, stopTracking, isTracking]);

    /**
     * 練習ダイアログを開く
     */
    const handleOpenPractice = () => {
      setShowPracticeDialog(true);
    };

    /**
     * 設定変更
     */
    const handleSettingChange = (key: keyof PracticeModeSettings, value: any) => {
      setPracticeSettings(prev => ({ ...prev, [key]: value }));
    };

    /**
     * カスタム練習コンポーネント
     */
    const PracticeComponent = options?.customPracticeComponent || MouseTracker;

    return (
      <>
        {/* アダプティブUIラッパー */}
        <AdaptiveUIWrapper
          config={adaptiveConfig}
          enabled={practiceSettings.adaptiveUI && adaptiveUIEnabled}
        >
          {/* ラップされたコンポーネント */}
          <Box sx={{ position: 'relative' }}>
            <WrappedComponent {...(componentProps as P)} ref={ref} />

            {/* 埋め込みモードの場合の練習UI */}
            {practiceSettings.enabled && practiceSettings.mode === 'embedded' && (
              <Paper
                elevation={2}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  p: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    マウス練習モード
                  </Typography>
                  <SkillLevelIndicator level={currentLevel} />
                  <Typography variant="caption">
                    精度: {Math.round(metrics.accuracy)}%
                  </Typography>
                </Stack>
              </Paper>
            )}

            {/* オーバーレイモードの場合の視覚的ヒント */}
            {practiceSettings.enabled && 
             practiceSettings.mode === 'overlay' && 
             adaptiveConfig.visualHints && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(33, 150, 243, 0.1) 0%, transparent 30%)',
                  },
                }}
              />
            )}
          </Box>
        </AdaptiveUIWrapper>

        {/* 練習ボタン（FAB） */}
        {showPracticeButton && mousePracticeEnabled && (
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1000,
              }}
            >
              <Fab
                color="primary"
                onClick={handleOpenPractice}
                sx={{
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)',
                }}
              >
                <MouseIcon />
              </Fab>
            </motion.div>
          </AnimatePresence>
        )}

        {/* スキルレベル警告 */}
        <Collapse in={showSkillAlert}>
          <Alert
            severity="warning"
            sx={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 1100 }}
            action={
              <IconButton size="small" onClick={() => setShowSkillAlert(false)}>
                <CloseIcon />
              </IconButton>
            }
          >
            この教材は{options?.requiredSkillLevel}レベル以上のマウススキルが推奨されます。
            練習モードで上達してから挑戦しましょう！
          </Alert>
        </Collapse>

        {/* 練習ダイアログ */}
        <Dialog
          open={showPracticeDialog}
          onClose={() => setShowPracticeDialog(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { minHeight: '80vh' }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PracticeIcon />
                <Typography variant="h6">マウス練習モード</Typography>
                {gamificationEnabled && <SkillLevelIndicator level={currentLevel} />}
              </Box>
              <Stack direction="row" spacing={1}>
                <Tooltip title="設定">
                  <IconButton onClick={() => setShowSettingsDialog(true)}>
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
                <IconButton onClick={() => setShowPracticeDialog(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {React.createElement(PracticeComponent as any, {
              taskType: options?.practiceTaskType || 'mixed',
              difficulty: "easy",
              showMetrics: practiceSettings.showMetrics,
              adaptiveUI: practiceSettings.adaptiveUI,
              gamificationEnabled: gamificationEnabled,
            })}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPracticeDialog(false)}>閉じる</Button>
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={() => {
                setShowPracticeDialog(false);
                setPracticeSettings(prev => ({ ...prev, enabled: true, autoStart: true }));
              }}
            >
              教材で練習を続ける
            </Button>
          </DialogActions>
        </Dialog>

        {/* 設定ダイアログ */}
        <Dialog open={showSettingsDialog} onClose={() => setShowSettingsDialog(false)}>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">練習モード設定</Typography>
              <IconButton onClick={() => setShowSettingsDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={practiceSettings.enabled}
                    onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  />
                }
                label="マウス練習を有効化"
              />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  練習モード
                </Typography>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={practiceSettings.mode === 'embedded'}
                        onChange={() => handleSettingChange('mode', 'embedded')}
                      />
                    }
                    label="埋め込み（教材内に表示）"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={practiceSettings.mode === 'overlay'}
                        onChange={() => handleSettingChange('mode', 'overlay')}
                      />
                    }
                    label="オーバーレイ（視覚的ヒント）"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={practiceSettings.mode === 'standalone'}
                        onChange={() => handleSettingChange('mode', 'standalone')}
                      />
                    }
                    label="スタンドアロン（別画面）"
                  />
                </Stack>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={practiceSettings.showMetrics}
                    onChange={(e) => handleSettingChange('showMetrics', e.target.checked)}
                  />
                }
                label="メトリクスを表示"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={practiceSettings.adaptiveUI}
                    onChange={(e) => handleSettingChange('adaptiveUI', e.target.checked)}
                  />
                }
                label="アダプティブUI（スキルに応じてUI調整）"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={practiceSettings.autoStart}
                    onChange={(e) => handleSettingChange('autoStart', e.target.checked)}
                  />
                }
                label="自動的に練習を開始"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettingsDialog(false)}>閉じる</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  });
}