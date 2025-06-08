// 定理・定義リストのコンポーネント
import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Collapse,
  IconButton,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import type { Theorem } from '../types';

interface TheoremListProps {
  theorems: Theorem[];
}

export const TheoremList: React.FC<TheoremListProps> = ({ theorems }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['congruence', 'parallel']));
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // カテゴリーごとに定理を分類
  const categorizedTheorems = theorems.reduce((acc, theorem) => {
    if (!acc[theorem.category]) {
      acc[theorem.category] = [];
    }
    acc[theorem.category].push(theorem);
    return acc;
  }, {} as Record<string, Theorem[]>);

  // 検索フィルタリング
  const filterTheorems = (theoremList: Theorem[]) => {
    if (!searchTerm) return theoremList;
    
    const term = searchTerm.toLowerCase();
    return theoremList.filter(theorem => 
      theorem.name.toLowerCase().includes(term) ||
      theorem.content.toLowerCase().includes(term) ||
      theorem.keywords.some(keyword => keyword.toLowerCase().includes(term))
    );
  };

  // カテゴリーの展開/折りたたみ
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // 定理をコピー
  const handleCopy = (theorem: Theorem) => {
    navigator.clipboard.writeText(theorem.content);
    setCopiedId(theorem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categoryLabels: Record<string, string> = {
    congruence: '合同',
    parallel: '平行線',
    angle: '角度',
    triangle: '三角形',
    basic: '基本定義'
  };

  const categoryColors: Record<string, 'primary' | 'secondary' | 'error' | 'warning' | 'info'> = {
    congruence: 'primary',
    parallel: 'secondary',
    angle: 'error',
    triangle: 'warning',
    basic: 'info'
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        定理・定義
      </Typography>

      {/* 検索フィールド */}
      <TextField
        fullWidth
        size="small"
        placeholder="定理を検索..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        sx={{ mb: 2 }}
      />

      {/* カテゴリー別定理リスト */}
      {Object.entries(categorizedTheorems).map(([category, theoremList]) => {
        const filteredTheorems = filterTheorems(theoremList);
        if (filteredTheorems.length === 0 && searchTerm) return null;

        return (
          <Box key={category} sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                p: 1,
                borderRadius: 1
              }}
              onClick={() => toggleCategory(category)}
            >
              <IconButton size="small">
                {expandedCategories.has(category) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <Typography variant="subtitle1" sx={{ flex: 1 }}>
                {categoryLabels[category] || category}
              </Typography>
              <Chip
                label={filteredTheorems.length}
                size="small"
                color={categoryColors[category] || 'default'}
              />
            </Box>

            <Collapse in={expandedCategories.has(category)}>
              <List dense sx={{ pl: 2 }}>
                {filteredTheorems.map((theorem) => (
                  <ListItem
                    key={theorem.id}
                    sx={{
                      borderLeft: 3,
                      borderColor: `${categoryColors[category] || 'grey'}.main`,
                      mb: 1,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {theorem.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {theorem.content}
                        </Typography>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(theorem)}
                      sx={{ 
                        color: copiedId === theorem.id ? 'success.main' : 'action.active',
                        transition: 'color 0.3s'
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        );
      })}

      {/* 検索結果なし */}
      {searchTerm && Object.values(categorizedTheorems).every(list => filterTheorems(list).length === 0) && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          「{searchTerm}」に該当する定理が見つかりません
        </Typography>
      )}
    </Paper>
  );
};