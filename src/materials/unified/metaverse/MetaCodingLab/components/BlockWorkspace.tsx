import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Menu,
  MenuItem as MenuItemComponent,
} from '@mui/material';
import {
  Delete,
  Edit,
  Link,
  LinkOff,
  MoreVert,
  PlayArrow,
  Add,
} from '@mui/icons-material';
import type { 
  BlockWorkspaceProps, 
  ProgrammingBlock, 
  BlockType, 
  BlockParameters 
} from '../types';

// ブロック表示コンポーネント
interface BlockDisplayProps {
  block: ProgrammingBlock;
  isSelected: boolean;
  isConnected: boolean;
  onSelect: (blockId: string) => void;
  onEdit: (block: ProgrammingBlock) => void;
  onDelete: (blockId: string) => void;
  onConnect: (blockId: string) => void;
  onContextMenu: (event: React.MouseEvent, blockId: string) => void;
}

const BlockDisplay: React.FC<BlockDisplayProps> = ({
  block,
  isSelected,
  isConnected,
  onSelect,
  onEdit,
  onDelete,
  onConnect,
  onContextMenu,
}) => {
  const getBlockColor = (type: BlockType): string => {
    const colorMap: Record<BlockType, string> = {
      start: '#4CAF50',
      move: '#2196F3',
      rotate: '#2196F3',
      scale: '#2196F3',
      create_cube: '#FF9800',
      create_sphere: '#FF9800',
      set_color: '#FF9800',
      wait: '#4CAF50',
      repeat: '#4CAF50',
      if_condition: '#4CAF50',
      variable: '#9C27B0',
      function: '#795548',
    };
    return colorMap[type] || '#607D8B';
  };

  const getBlockIcon = (type: BlockType) => {
    const iconMap: Record<BlockType, React.ReactNode> = {
      start: <PlayArrow fontSize="small" />,
      move: <PlayArrow fontSize="small" />,
      rotate: <PlayArrow fontSize="small" />,
      scale: <PlayArrow fontSize="small" />,
      create_cube: <Add fontSize="small" />,
      create_sphere: <Add fontSize="small" />,
      set_color: <Add fontSize="small" />,
      wait: <PlayArrow fontSize="small" />,
      repeat: <PlayArrow fontSize="small" />,
      if_condition: <PlayArrow fontSize="small" />,
      variable: <PlayArrow fontSize="small" />,
      function: <PlayArrow fontSize="small" />,
    };
    return iconMap[type] || <PlayArrow fontSize="small" />;
  };

  const formatParameters = (params: BlockParameters): string => {
    return Object.entries(params)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const handleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(block.id);
  }, [block.id, onSelect]);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit(block);
  }, [block, onEdit]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onContextMenu(event, block.id);
  }, [block.id, onContextMenu]);

  return (
    <Card
      sx={{
        minWidth: 200,
        cursor: 'pointer',
        border: 2,
        borderColor: isSelected ? 'primary.main' : 'transparent',
        borderStyle: isConnected ? 'dashed' : 'solid',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
        bgcolor: isSelected ? 'primary.50' : 'background.paper',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* ブロックヘッダー */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              bgcolor: getBlockColor(block.type),
              color: 'white',
              borderRadius: 1,
              p: 0.5,
              mr: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {getBlockIcon(block.type)}
          </Box>
          <Typography variant="subtitle2" sx={{ flex: 1 }}>
            {block.type.replace('_', ' ')}
          </Typography>
          <Chip
            label={block.id.slice(-4)}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>

        {/* パラメータ表示 */}
        {Object.keys(block.parameters).length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              パラメータ:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              {formatParameters(block.parameters)}
            </Typography>
          </Box>
        )}

        {/* 接続情報 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {block.connections.input && (
              <Chip
                label="入力"
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.6rem', height: 20 }}
              />
            )}
            {block.connections.output && (
              <Chip
                label="出力"
                size="small"
                variant="outlined"
                color="secondary"
                sx={{ fontSize: '0.6rem', height: 20 }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="編集">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(block);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="接続">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onConnect(block.id);
                }}
              >
                <Link fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="削除">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(block.id);
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ブロック編集ダイアログ
interface BlockEditDialogProps {
  open: boolean;
  block: ProgrammingBlock | null;
  onClose: () => void;
  onSave: (block: ProgrammingBlock) => void;
}

const BlockEditDialog: React.FC<BlockEditDialogProps> = ({
  open,
  block,
  onClose,
  onSave,
}) => {
  const [parameters, setParameters] = useState<BlockParameters>({});

  React.useEffect(() => {
    if (block) {
      setParameters({ ...block.parameters });
    }
  }, [block]);

  const handleParameterChange = useCallback((key: string, value: any) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    if (block) {
      onSave({
        ...block,
        parameters,
      });
    }
    onClose();
  }, [block, parameters, onSave, onClose]);

  if (!block) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        ブロック編集: {block.type.replace('_', ' ')}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {Object.entries(block.parameters).map(([key, value]) => {
            const paramType = typeof value;
            
            if (paramType === 'number') {
              return (
                <TextField
                  key={key}
                  label={key}
                  type="number"
                  value={parameters[key] || value}
                  onChange={(e) => handleParameterChange(key, parseFloat(e.target.value) || 0)}
                  fullWidth
                  size="small"
                />
              );
            }
            
            if (paramType === 'string') {
              return (
                <TextField
                  key={key}
                  label={key}
                  value={parameters[key] || value}
                  onChange={(e) => handleParameterChange(key, e.target.value)}
                  fullWidth
                  size="small"
                />
              );
            }
            
            if (paramType === 'boolean') {
              return (
                <FormControl key={key} fullWidth size="small">
                  <InputLabel>{key}</InputLabel>
                  <Select
                    value={parameters[key] !== undefined ? parameters[key] : value}
                    onChange={(e) => handleParameterChange(key, e.target.value === 'true')}
                    label={key}
                  >
                    <MenuItem value="true">はい</MenuItem>
                    <MenuItem value="false">いいえ</MenuItem>
                  </Select>
                </FormControl>
              );
            }
            
            return null;
          })}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} variant="contained">保存</Button>
      </DialogActions>
    </Dialog>
  );
};

// メインコンポーネント
const BlockWorkspace: React.FC<BlockWorkspaceProps> = ({
  blocks,
  onBlockAdd,
  onBlockRemove,
  onBlockConnect,
  onBlocksChange,
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<ProgrammingBlock | null>(null);
  const [connectingBlockId, setConnectingBlockId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    blockId: string;
  } | null>(null);
  
  const workspaceRef = useRef<HTMLDivElement>(null);

  // ドロップハンドラー
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      if (data.type) {
        const rect = workspaceRef.current?.getBoundingClientRect();
        if (rect) {
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          
          const newBlock: ProgrammingBlock = {
            id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: data.type,
            parameters: getDefaultParameters(data.type),
            connections: { input: undefined, output: undefined },
            position: [x, y],
          };
          
          onBlockAdd(newBlock);
        }
      }
    } catch (error) {
      console.error('Failed to parse dropped data:', error);
    }
  }, [onBlockAdd]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // デフォルトパラメータの取得
  const getDefaultParameters = (blockType: BlockType): BlockParameters => {
    const defaults: Record<BlockType, BlockParameters> = {
      start: {},
      move: { distance: 1, direction: 'forward' },
      rotate: { angle: 90, axis: 'y' },
      scale: { scale: 1.5 },
      create_cube: { size: 1, x: 0, y: 0, z: 0 },
      create_sphere: { radius: 0.5, x: 0, y: 1, z: 0 },
      set_color: { color: 'red' },
      wait: { seconds: 1 },
      repeat: { times: 3 },
      if_condition: { condition: 'true' },
      variable: { name: 'myVariable', value: 0 },
      function: { name: 'myFunction' },
    };
    return defaults[blockType] || {};
  };

  // イベントハンドラー
  const handleBlockSelect = useCallback((blockId: string) => {
    setSelectedBlockId(blockId);
  }, []);

  const handleBlockEdit = useCallback((block: ProgrammingBlock) => {
    setEditingBlock(block);
  }, []);

  const handleBlockSave = useCallback((updatedBlock: ProgrammingBlock) => {
    const updatedBlocks = blocks.map(block =>
      block.id === updatedBlock.id ? updatedBlock : block
    );
    onBlocksChange(updatedBlocks);
    setEditingBlock(null);
  }, [blocks, onBlocksChange]);

  const handleBlockDelete = useCallback((blockId: string) => {
    onBlockRemove(blockId);
    setSelectedBlockId(null);
    setContextMenu(null);
  }, [onBlockRemove]);

  const handleBlockConnect = useCallback((blockId: string) => {
    if (connectingBlockId && connectingBlockId !== blockId) {
      onBlockConnect(connectingBlockId, blockId);
      setConnectingBlockId(null);
    } else {
      setConnectingBlockId(blockId);
    }
  }, [connectingBlockId, onBlockConnect]);

  const handleContextMenu = useCallback((event: React.MouseEvent, blockId: string) => {
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      blockId,
    });
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleWorkspaceClick = useCallback(() => {
    setSelectedBlockId(null);
    setConnectingBlockId(null);
  }, []);

  // ブロックの接続チェック
  const isBlockConnected = useCallback((blockId: string): boolean => {
    return blocks.some(block => 
      block.connections.input === blockId || 
      block.connections.output === blockId
    );
  }, [blocks]);

  // ブロックの並び替え（実行順序）
  const sortedBlocks = useMemo(() => {
    const startBlocks = blocks.filter(block => block.type === 'start');
    const otherBlocks = blocks.filter(block => block.type !== 'start');
    return [...startBlocks, ...otherBlocks];
  }, [blocks]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ワークスペースヘッダー */}
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" gutterBottom>
          プログラム組み立てエリア
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={`${blocks.length}個のブロック`}
            size="small"
            variant="outlined"
          />
          {connectingBlockId && (
            <Chip
              label="接続モード"
              size="small"
              color="primary"
              onDelete={() => setConnectingBlockId(null)}
            />
          )}
        </Box>
      </Box>

      {/* メインワークスペース */}
      <Box
        ref={workspaceRef}
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'auto',
          bgcolor: 'grey.50',
          backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleWorkspaceClick}
      >
        {blocks.length === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6" gutterBottom>
              ブロックをここにドラッグ
            </Typography>
            <Typography variant="body2">
              左のパレットからブロックをドラッグして<br />
              プログラムを組み立てよう！
            </Typography>
          </Box>
        )}

        {/* ブロック表示 */}
        {sortedBlocks.map((block, index) => (
          <Box
            key={block.id}
            sx={{
              position: 'absolute',
              left: block.position[0],
              top: block.position[1],
              zIndex: selectedBlockId === block.id ? 10 : 1,
            }}
          >
            <BlockDisplay
              block={block}
              isSelected={selectedBlockId === block.id}
              isConnected={isBlockConnected(block.id)}
              onSelect={handleBlockSelect}
              onEdit={handleBlockEdit}
              onDelete={handleBlockDelete}
              onConnect={handleBlockConnect}
              onContextMenu={handleContextMenu}
            />
            
            {/* 接続線の描画（簡単な実装） */}
            {block.connections.output && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '100%',
                  width: 20,
                  height: 2,
                  bgcolor: 'primary.main',
                  zIndex: 0,
                }}
              />
            )}
          </Box>
        ))}
      </Box>

      {/* ブロック編集ダイアログ */}
      <BlockEditDialog
        open={!!editingBlock}
        block={editingBlock}
        onClose={() => setEditingBlock(null)}
        onSave={handleBlockSave}
      />

      {/* コンテキストメニュー */}
      <Menu
        open={!!contextMenu}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItemComponent
          onClick={() => {
            if (contextMenu) {
              const block = blocks.find(b => b.id === contextMenu.blockId);
              if (block) handleBlockEdit(block);
            }
            handleContextMenuClose();
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} />
          編集
        </MenuItemComponent>
        
        <MenuItemComponent
          onClick={() => {
            if (contextMenu) {
              handleBlockConnect(contextMenu.blockId);
            }
            handleContextMenuClose();
          }}
        >
          <Link fontSize="small" sx={{ mr: 1 }} />
          接続
        </MenuItemComponent>
        
        <MenuItemComponent
          onClick={() => {
            if (contextMenu) {
              handleBlockDelete(contextMenu.blockId);
            }
            handleContextMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          削除
        </MenuItemComponent>
      </Menu>

      {/* ワークスペース統計 */}
      <Box sx={{ p: 1, bgcolor: 'grey.100', borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          💡 ダブルクリックで編集、右クリックでメニュー
        </Typography>
      </Box>
    </Box>
  );
};

export default BlockWorkspace;