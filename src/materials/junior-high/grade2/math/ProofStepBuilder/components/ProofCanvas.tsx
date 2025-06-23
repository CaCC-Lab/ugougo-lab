// 証明構築エリアのコンポーネント
import React, { useState, type DragEvent } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Card,
  CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AddIcon from '@mui/icons-material/Add';
import type { ProofStep, DragItem } from '../types';

interface ProofCanvasProps {
  steps: ProofStep[];
  onAddStep: (content: string, reason?: string, reasonType?: ProofStep['reasonType']) => void;
  onRemoveStep: (stepId: string) => void;
  onUpdateStep: (stepId: string, updates: Partial<ProofStep>) => void;
  onReorderSteps: (sourceIndex: number, destinationIndex: number) => void;
}

export const ProofCanvas: React.FC<ProofCanvasProps> = ({
  steps,
  onAddStep,
  onRemoveStep,
  onUpdateStep,
  onReorderSteps
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newStepContent, setNewStepContent] = useState('');
  const [newStepReason, setNewStepReason] = useState('');
  const [newStepReasonType, setNewStepReasonType] = useState<ProofStep['reasonType']>('given');

  // ドラッグ開始
  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    const dragData: DragItem = {
      type: 'step',
      id: steps[index].id,
      content: steps[index].content,
      sourceIndex: index
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  // ドラッグオーバー
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // ドロップ
  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json')) as DragItem;
      
      if (data.type === 'step' && data.sourceIndex !== undefined) {
        onReorderSteps(data.sourceIndex, dropIndex);
      }
    } catch (error) {
      console.error('Drop error:', error);
    }
    
    setDraggedIndex(null);
  };

  // ドラッグ終了
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // 新しいステップを追加
  const handleAddStep = () => {
    if (newStepContent.trim()) {
      onAddStep(newStepContent, newStepReason, newStepReasonType);
      setNewStepContent('');
      setNewStepReason('');
      setNewStepReasonType('given');
    }
  };

  const reasonTypeLabels = {
    given: '仮定',
    definition: '定義',
    theorem: '定理',
    assumption: '推論',
    conclusion: '結論'
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        証明の構築
      </Typography>

      {/* 既存のステップ */}
      <Box sx={{ mb: 3 }}>
        {steps.map((step, index) => (
          <Card
            key={step.id}
            sx={{
              mb: 2,
              opacity: draggedIndex === index ? 0.5 : 1,
              cursor: 'move',
              '&:hover': { boxShadow: 3 }
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <DragHandleIcon sx={{ color: 'text.secondary', cursor: 'grab', mt: 1 }} />
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ステップ {index + 1}
                  </Typography>
                  
                  <TextField
                    fullWidth
                    multiline
                    size="small"
                    value={step.content}
                    onChange={(e) => onUpdateStep(step.id, { content: e.target.value })}
                    sx={{ mb: 1 }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>理由</InputLabel>
                      <Select
                        value={step.reasonType || ''}
                        label="理由"
                        onChange={(e) => onUpdateStep(step.id, { reasonType: e.target.value as ProofStep['reasonType'] })}
                      >
                        {Object.entries(reasonTypeLabels).map(([value, label]) => (
                          <MenuItem key={value} value={value}>{label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <TextField
                      size="small"
                      placeholder="理由の詳細"
                      value={step.reason || ''}
                      onChange={(e) => onUpdateStep(step.id, { reason: e.target.value })}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Box>
                
                <IconButton
                  size="small"
                  onClick={() => onRemoveStep(step.id)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}

        {/* ドロップゾーン（最後） */}
        {steps.length > 0 && (
          <Box
            sx={{
              height: 40,
              border: '2px dashed #ccc',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary'
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, steps.length)}
          >
            ここにドロップ
          </Box>
        )}
      </Box>

      {/* 新しいステップの追加 */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          新しいステップを追加
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="証明のステップを入力..."
          value={newStepContent}
          onChange={(e) => setNewStepContent(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>理由の種類</InputLabel>
            <Select
              value={newStepReasonType}
              label="理由の種類"
              onChange={(e) => setNewStepReasonType(e.target.value as ProofStep['reasonType'])}
            >
              {Object.entries(reasonTypeLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            size="small"
            placeholder="理由の詳細（任意）"
            value={newStepReason}
            onChange={(e) => setNewStepReason(e.target.value)}
            sx={{ flex: 1 }}
          />
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddStep}
          disabled={!newStepContent.trim()}
          fullWidth
        >
          ステップを追加
        </Button>
      </Box>
    </Paper>
  );
};