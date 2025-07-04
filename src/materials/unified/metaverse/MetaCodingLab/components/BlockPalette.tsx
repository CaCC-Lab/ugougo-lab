import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Chip,
  Grid,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  PlayArrow,
  RotateRight,
  Transform,
  Add,
  Circle,
  Palette,
  Timer,
  Loop,
  QuestionMark,
  DataObject,
  Functions,
} from '@mui/icons-material';
import type { BlockPaletteProps, BlockType, BlockDefinition } from '../types';

// ブロック定義データ
const blockDefinitions: BlockDefinition[] = [
  // モーション系
  {
    type: 'start',
    name: 'スタート',
    description: 'プログラムの開始点',
    category: 'control',
    color: '#4CAF50',
    icon: <PlayArrow />,
    parameters: [],
    connections: { hasInput: false, hasOutput: true },
  },
  {
    type: 'move',
    name: '移動',
    description: 'オブジェクトを指定した距離だけ移動',
    category: 'motion',
    color: '#2196F3',
    icon: <PlayArrow />,
    parameters: [
      { name: 'distance', type: 'number', defaultValue: 1 },
      { name: 'direction', type: 'dropdown', defaultValue: 'forward', options: ['forward', 'backward', 'left', 'right', 'up', 'down'] },
    ],
    connections: { hasInput: true, hasOutput: true },
  },
  {
    type: 'rotate',
    name: '回転',
    description: 'オブジェクトを指定した角度だけ回転',
    category: 'motion',
    color: '#2196F3',
    icon: <RotateRight />,
    parameters: [
      { name: 'angle', type: 'number', defaultValue: 90 },
      { name: 'axis', type: 'dropdown', defaultValue: 'y', options: ['x', 'y', 'z'] },
    ],
    connections: { hasInput: true, hasOutput: true },
  },
  {
    type: 'scale',
    name: 'サイズ変更',
    description: 'オブジェクトのサイズを変更',
    category: 'motion',
    color: '#2196F3',
    icon: <Transform />,
    parameters: [
      { name: 'scale', type: 'number', defaultValue: 1.5 },
    ],
    connections: { hasInput: true, hasOutput: true },
  },

  // オブジェクト作成系
  {
    type: 'create_cube',
    name: '立方体を作成',
    description: '新しい立方体オブジェクトを作成',
    category: 'objects',
    color: '#FF9800',
    icon: <Add />,
    parameters: [
      { name: 'size', type: 'number', defaultValue: 1 },
      { name: 'x', type: 'number', defaultValue: 0 },
      { name: 'y', type: 'number', defaultValue: 0 },
      { name: 'z', type: 'number', defaultValue: 0 },
    ],
    connections: { hasInput: true, hasOutput: true },
  },
  {
    type: 'create_sphere',
    name: '球体を作成',
    description: '新しい球体オブジェクトを作成',
    category: 'objects',
    color: '#FF9800',
    icon: <Circle />,
    parameters: [
      { name: 'radius', type: 'number', defaultValue: 0.5 },
      { name: 'x', type: 'number', defaultValue: 0 },
      { name: 'y', type: 'number', defaultValue: 1 },
      { name: 'z', type: 'number', defaultValue: 0 },
    ],
    connections: { hasInput: true, hasOutput: true },
  },
  {
    type: 'set_color',
    name: '色を設定',
    description: 'オブジェクトの色を変更',
    category: 'objects',
    color: '#FF9800',
    icon: <Palette />,
    parameters: [
      { name: 'color', type: 'dropdown', defaultValue: 'red', options: ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'cyan'] },
    ],
    connections: { hasInput: true, hasOutput: true },
  },

  // 制御系
  {
    type: 'wait',
    name: '待つ',
    description: '指定した時間だけ待機',
    category: 'control',
    color: '#4CAF50',
    icon: <Timer />,
    parameters: [
      { name: 'seconds', type: 'number', defaultValue: 1 },
    ],
    connections: { hasInput: true, hasOutput: true },
  },
  {
    type: 'repeat',
    name: '繰り返す',
    description: '指定した回数だけ繰り返し実行',
    category: 'control',
    color: '#4CAF50',
    icon: <Loop />,
    parameters: [
      { name: 'times', type: 'number', defaultValue: 3 },
    ],
    connections: { hasInput: true, hasOutput: true },
  },
  {
    type: 'if_condition',
    name: 'もし〜なら',
    description: '条件に応じて処理を分岐',
    category: 'control',
    color: '#4CAF50',
    icon: <QuestionMark />,
    parameters: [
      { name: 'condition', type: 'dropdown', defaultValue: 'true', options: ['true', 'false', 'collision', 'distance < 5'] },
    ],
    connections: { hasInput: true, hasOutput: true },
  },

  // 変数・関数系
  {
    type: 'variable',
    name: '変数',
    description: '値を保存・取得',
    category: 'variables',
    color: '#9C27B0',
    icon: <DataObject />,
    parameters: [
      { name: 'name', type: 'string', defaultValue: 'myVariable' },
      { name: 'value', type: 'number', defaultValue: 0 },
    ],
    connections: { hasInput: true, hasOutput: true },
  },
  {
    type: 'function',
    name: '関数',
    description: 'カスタム関数を定義',
    category: 'functions',
    color: '#795548',
    icon: <Functions />,
    parameters: [
      { name: 'name', type: 'string', defaultValue: 'myFunction' },
    ],
    connections: { hasInput: true, hasOutput: true },
  },
];

// カテゴリ名とアイコンのマッピング
const categoryInfo = {
  motion: { name: '動き', icon: <PlayArrow />, color: '#2196F3' },
  objects: { name: 'オブジェクト', icon: <Add />, color: '#FF9800' },
  control: { name: '制御', icon: <Loop />, color: '#4CAF50' },
  sensing: { name: 'センサー', icon: <QuestionMark />, color: '#E91E63' },
  variables: { name: '変数', icon: <DataObject />, color: '#9C27B0' },
  functions: { name: '関数', icon: <Functions />, color: '#795548' },
};

// ブロックアイテムコンポーネント
interface BlockItemProps {
  definition: BlockDefinition;
  onDragStart: (blockType: BlockType) => void;
  onSelect: (blockType: BlockType) => void;
}

const BlockItem: React.FC<BlockItemProps> = ({ definition, onDragStart, onSelect }) => {
  const handleDragStart = useCallback((event: React.DragEvent) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: definition.type,
      name: definition.name,
    }));
    onDragStart(definition.type);
  }, [definition.type, definition.name, onDragStart]);

  const handleClick = useCallback(() => {
    onSelect(definition.type);
  }, [definition.type, onSelect]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(definition.type);
    }
  }, [definition.type, onSelect]);

  return (
    <Tooltip title={definition.description} placement="right">
      <Card
        sx={{
          cursor: 'grab',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: 4,
          },
          '&:active': {
            cursor: 'grabbing',
            transform: 'scale(0.98)',
          },
          borderLeft: 4,
          borderLeftColor: definition.color,
        }}
        draggable
        onDragStart={handleDragStart}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${definition.name} ブロック: ${definition.description}`}
      >
        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                color: definition.color,
                display: 'flex',
                alignItems: 'center',
                minWidth: 20,
              }}
            >
              {definition.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight="medium"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {definition.name}
              </Typography>
              {definition.parameters.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  パラメータ: {definition.parameters.length}個
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
};

// メインコンポーネント
const BlockPalette: React.FC<BlockPaletteProps> = ({ 
  availableBlocks, 
  onBlockDrag, 
  onBlockSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string>('motion');

  // 検索フィルタリング
  const filteredDefinitions = useMemo(() => {
    let filtered = blockDefinitions.filter(def => 
      availableBlocks.includes(def.type)
    );

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(def =>
        def.name.toLowerCase().includes(query) ||
        def.description.toLowerCase().includes(query) ||
        def.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [availableBlocks, searchQuery]);

  // カテゴリ別グループ化
  const groupedBlocks = useMemo(() => {
    return filteredDefinitions.reduce((groups, definition) => {
      const category = definition.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(definition);
      return groups;
    }, {} as Record<string, BlockDefinition[]>);
  }, [filteredDefinitions]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleCategoryToggle = useCallback((category: string) => {
    setExpandedCategory(prev => prev === category ? '' : category);
  }, []);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} data-testid="block-palette">
      {/* 検索バー */}
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          size="small"
          fullWidth
          placeholder="ブロックを検索..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* ブロック統計 */}
      <Box sx={{ p: 1, bgcolor: 'grey.50' }}>
        <Typography variant="caption" display="block">
          利用可能: {availableBlocks.length}種類
        </Typography>
        <Typography variant="caption" display="block">
          表示中: {filteredDefinitions.length}種類
        </Typography>
      </Box>

      {/* カテゴリ別ブロック一覧 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {Object.entries(groupedBlocks).map(([category, definitions]) => {
          const categoryData = categoryInfo[category as keyof typeof categoryInfo];
          
          return (
            <Accordion
              key={category}
              expanded={expandedCategory === category}
              onChange={() => handleCategoryToggle(category)}
              disableGutters
              sx={{
                '&:before': { display: 'none' },
                '&.Mui-expanded': { margin: 0 },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  minHeight: 48,
                  '&.Mui-expanded': { minHeight: 48 },
                  bgcolor: `${categoryData.color}10`,
                  borderLeft: 3,
                  borderLeftColor: categoryData.color,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: categoryData.color }}>
                    {categoryData.icon}
                  </Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {categoryData.name}
                  </Typography>
                  <Chip
                    label={definitions.length}
                    size="small"
                    sx={{
                      height: 20,
                      bgcolor: categoryData.color,
                      color: 'white',
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ p: 1 }}>
                <Grid container spacing={1}>
                  {definitions.map((definition) => (
                    <Grid item xs={12} key={definition.type}>
                      <BlockItem
                        definition={definition}
                        onDragStart={onBlockDrag}
                        onSelect={onBlockSelect}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* ヘルプテキスト */}
      <Box sx={{ p: 1, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          💡 ブロックをドラッグして作業エリアに配置
        </Typography>
      </Box>
    </Box>
  );
};

export default BlockPalette;