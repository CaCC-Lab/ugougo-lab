import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, IconButton, Toolbar, AppBar } from '@mui/material';
import { 
  PlayArrow, 
  Stop, 
  Settings, 
  Visibility, 
  VisibilityOff,
  Code,
  ThreeDRotation,
  Extension 
} from '@mui/icons-material';
import { MaterialWrapper } from '../../../../components/wrappers/MaterialWrapper';
import CodingWorld from './components/CodingWorld';
import BlockPalette from './components/BlockPalette';
import BlockWorkspace from './components/BlockWorkspace';
import { useMetaCodingLabStore } from './hooks/useMetaCodingLabStore';
import type { 
  MetaCodingLabProps, 
  MetaCodingLabState,
  ProgrammingBlock,
  BlockType,
  Object3D 
} from './types';

// デフォルト状態
const defaultState: MetaCodingLabState = {
  world3D: {
    objects: [],
    camera: {
      position: [5, 5, 5],
      target: [0, 0, 0],
    },
    lighting: {
      ambient: '#404040',
      directional: {
        color: '#ffffff',
        intensity: 1,
        position: [10, 10, 5],
      },
    },
    physics: {
      gravity: [0, -9.81, 0],
      enabled: true,
    },
  },
  programming: {
    blocks: [],
    selectedBlock: undefined,
    draggingBlock: undefined,
    executionState: 'idle',
    generatedCode: '',
    variables: {},
  },
  ui: {
    showBlockPalette: true,
    showCodePreview: false,
    showWorld3D: true,
    selectedTool: 'select',
  },
};

const MetaCodingLab: React.FC<MetaCodingLabProps> = ({ 
  onClose, 
  initialState = {},
  collaborationMode = false 
}) => {
  // Store から状態とアクションを取得
  const {
    world3D,
    programming,
    ui,
    setState,
    addBlock,
    removeBlock,
    connectBlocks,
    updateWorld3D,
    executeCode,
    generateCode,
  } = useMetaCodingLabStore();

  // 初期化（初回のみ実行）
  useEffect(() => {
    const mergedState = { ...defaultState, ...initialState };
    setState(mergedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 依存配列を空にして初回のみ実行

  // 利用可能なブロックタイプ
  const availableBlocks: BlockType[] = [
    'start',
    'move',
    'rotate',
    'scale',
    'create_cube',
    'create_sphere',
    'set_color',
    'wait',
    'repeat',
    'if_condition',
    'variable',
    'function',
  ];

  // イベントハンドラー
  const handleBlockAdd = useCallback((block: ProgrammingBlock) => {
    addBlock(block);
  }, [addBlock]);

  const handleBlockRemove = useCallback((blockId: string) => {
    removeBlock(blockId);
  }, [removeBlock]);

  const handleBlockConnect = useCallback((sourceId: string, targetId: string) => {
    connectBlocks(sourceId, targetId);
  }, [connectBlocks]);

  const handleBlocksChange = useCallback((blocks: ProgrammingBlock[]) => {
    setState((prevState) => ({
      ...prevState,
      programming: {
        ...prevState.programming,
        blocks,
      },
    }));
  }, [setState]);

  const handleObjectSelect = useCallback((objectId: string) => {
    // 3Dオブジェクト選択時の処理
    console.log('Object selected:', objectId);
  }, []);

  const handleWorldChange = useCallback((newWorldState: any) => {
    updateWorld3D(newWorldState);
  }, [updateWorld3D]);

  const handleBlockDrag = useCallback((blockType: BlockType) => {
    setState((prevState) => ({
      ...prevState,
      programming: {
        ...prevState.programming,
        draggingBlock: blockType,
      },
    }));
  }, [setState]);

  const handleBlockSelect = useCallback((blockType: BlockType) => {
    setState((prevState) => ({
      ...prevState,
      programming: {
        ...prevState.programming,
        selectedBlock: blockType,
      },
    }));
  }, [setState]);

  const handleExecuteCode = useCallback(async () => {
    try {
      const code = generateCode(programming.blocks);
      await executeCode(code);
    } catch (error) {
      console.error('Code execution failed:', error);
    }
  }, [programming.blocks, generateCode, executeCode]);

  const handleStopExecution = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      programming: {
        ...prevState.programming,
        executionState: 'idle',
      },
    }));
  }, [setState]);

  const togglePanel = useCallback((panel: 'blockPalette' | 'codePreview' | 'world3D') => {
    setState((prevState) => {
      const capitalizedPanel = `show${panel.charAt(0).toUpperCase() + panel.slice(1)}`;
      return {
        ...prevState,
        ui: {
          ...prevState.ui,
          [capitalizedPanel]: !prevState.ui[capitalizedPanel as keyof typeof prevState.ui],
        },
      };
    });
  }, [setState]);

  const isExecuting = programming.executionState === 'running';

  return (
    <MaterialWrapper
      materialId="meta-coding-lab"
      materialName="MetaCodingLab - メタバース協働プログラミング空間"
      showMetricsButton={true}
      showAssistant={true}
    >
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* ツールバー */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar variant="dense">
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              MetaCodingLab
            </Typography>
            
            {/* 実行コントロール */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={handleExecuteCode as any}
              disabled={isExecuting || programming.blocks.length === 0}
              sx={{ mr: 1 }}
            >
              実行
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Stop />}
              onClick={handleStopExecution as any}
              disabled={!isExecuting}
              sx={{ mr: 2 }}
            >
              停止
            </Button>

            {/* パネル表示切り替え */}
            <IconButton
              onClick={(() => togglePanel('blockPalette')) as any}
              color={ui.showBlockPalette ? 'primary' : 'default'}
              title="ブロックパレット"
            >
              <Extension />
            </IconButton>
            
            <IconButton
              onClick={(() => togglePanel('world3D')) as any}
              color={ui.showWorld3D ? 'primary' : 'default'}
              title="3D世界"
            >
              <ThreeDRotation />
            </IconButton>
            
            <IconButton
              onClick={(() => togglePanel('codePreview')) as any}
              color={ui.showCodePreview ? 'primary' : 'default'}
              title="コードプレビュー"
            >
              <Code />
            </IconButton>

            {onClose && (
              <IconButton onClick={onClose as any}>
                <Settings />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>

        {/* メインコンテンツ */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Grid container spacing={0} sx={{ height: '100%' }}>
            {/* 左パネル: ブロックパレット */}
            {ui.showBlockPalette && (
              <Grid item xs={12} md={3} sx={{ borderRight: 1, borderColor: 'divider' }}>
                <Card sx={{ height: '100%', borderRadius: 0 }} elevation={0}>
                  <CardContent sx={{ height: '100%', p: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      プログラミングブロック
                    </Typography>
                    <BlockPalette
                      availableBlocks={availableBlocks}
                      onBlockDrag={handleBlockDrag}
                      onBlockSelect={handleBlockSelect}
                    />
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* 中央: 3D世界 */}
            {ui.showWorld3D && (
              <Grid item xs={12} md={ui.showBlockPalette ? 6 : 9}>
                <Card sx={{ height: '100%', borderRadius: 0 }} elevation={0}>
                  <CardContent sx={{ height: '100%', p: 0 }}>
                    <CodingWorld
                      world3D={world3D}
                      onObjectSelect={handleObjectSelect}
                      onWorldChange={handleWorldChange}
                    />
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* 右パネル: ブロックワークスペース */}
            <Grid item xs={12} md={3} sx={{ borderLeft: 1, borderColor: 'divider' }}>
              <Card sx={{ height: '100%', borderRadius: 0 }} elevation={0}>
                <CardContent sx={{ height: '100%', p: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    プログラム組み立て
                  </Typography>
                  <BlockWorkspace
                    blocks={programming.blocks}
                    onBlockAdd={handleBlockAdd}
                    onBlockRemove={handleBlockRemove}
                    onBlockConnect={handleBlockConnect}
                    onBlocksChange={handleBlocksChange}
                  />
                  
                  {/* コードプレビュー */}
                  {ui.showCodePreview && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        生成されたコード
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: 'grey.100',
                          p: 1,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: 200,
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {programming.generatedCode || '// ブロックを組み立ててコードを生成'}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* ステータスバー */}
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            p: 1,
            bgcolor: 'grey.50',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption">
            ブロック数: {programming.blocks.length} | 
            3Dオブジェクト数: {world3D.objects.length}
          </Typography>
          
          <Box>
            <Typography 
              variant="caption" 
              color={
                programming.executionState === 'running' ? 'primary' :
                programming.executionState === 'error' ? 'error' : 'textSecondary'
              }
            >
              状態: {
                programming.executionState === 'idle' ? '待機中' :
                programming.executionState === 'running' ? '実行中' :
                programming.executionState === 'paused' ? '一時停止' :
                programming.executionState === 'error' ? 'エラー' : '不明'
              }
            </Typography>
          </Box>
        </Box>
      </Box>
    </MaterialWrapper>
  );
};

export default MetaCodingLab;