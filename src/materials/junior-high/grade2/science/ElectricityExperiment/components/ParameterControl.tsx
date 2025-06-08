import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  TextField,
  Stack,
  Chip,
  Button,
  Divider
} from '@mui/material';
import {
  Battery80 as BatteryIcon,
  Memory as ResistorIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';
import type { CircuitComponent } from '../types';
import { componentDefinitions } from '../data/circuitComponents';

interface ParameterControlProps {
  components: CircuitComponent[];
  selectedComponent: CircuitComponent | null;
  onUpdateValue: (id: string, value: number) => void;
  onSelectComponent: (component: CircuitComponent) => void;
  isSimulating: boolean;
}

export const ParameterControl: React.FC<ParameterControlProps> = ({
  components,
  selectedComponent,
  onUpdateValue,
  onSelectComponent,
  isSimulating
}) => {
  // コンポーネントタイプごとにグループ化
  const groupedComponents = components.reduce((acc, component) => {
    if (component.type === 'battery' || component.type === 'resistor') {
      if (!acc[component.type]) {
        acc[component.type] = [];
      }
      acc[component.type].push(component);
    }
    return acc;
  }, {} as Record<string, CircuitComponent[]>);
  
  // 値の変更ハンドラー
  const handleValueChange = (componentId: string, value: number) => {
    if (!isSimulating) return;
    onUpdateValue(componentId, value);
  };
  
  // アイコンの取得
  const getIcon = (type: string) => {
    switch (type) {
      case 'battery': return <BatteryIcon fontSize="small" />;
      case 'resistor': return <ResistorIcon fontSize="small" />;
      default: return null;
    }
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        パラメータ調整
      </Typography>
      
      {!isSimulating && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="body2">
            測定モードに切り替えてパラメータを調整できます
          </Typography>
        </Paper>
      )}
      
      <Stack spacing={2}>
        {/* 電池のセクション */}
        {groupedComponents.battery && groupedComponents.battery.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {getIcon('battery')}
              電池
            </Typography>
            
            <Stack spacing={2}>
              {groupedComponents.battery.map((component, index) => {
                const definition = componentDefinitions[component.type];
                const isSelected = selectedComponent?.id === component.id;
                
                return (
                  <Box
                    key={component.id}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: isSelected ? 'action.selected' : 'background.default',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: isSelected ? 'action.selected' : 'action.hover'
                      }
                    }}
                    onClick={() => onSelectComponent(component)}
                  >
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          電池 {index + 1}
                        </Typography>
                        <Chip
                          label={`${component.value || 0} ${definition.unit}`}
                          size="small"
                          color={isSelected ? 'primary' : 'default'}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Slider
                          value={component.value || 0}
                          onChange={(_, value) => handleValueChange(component.id, value as number)}
                          min={definition.valueRange?.min || 0}
                          max={definition.valueRange?.max || 10}
                          step={definition.valueRange?.step || 0.1}
                          marks
                          disabled={!isSimulating}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          value={component.value || 0}
                          onChange={(e) => handleValueChange(component.id, parseFloat(e.target.value) || 0)}
                          type="number"
                          size="small"
                          disabled={!isSimulating}
                          sx={{ width: 80 }}
                          inputProps={{
                            min: definition.valueRange?.min || 0,
                            max: definition.valueRange?.max || 10,
                            step: definition.valueRange?.step || 0.1
                          }}
                        />
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        )}
        
        {/* 抵抗のセクション */}
        {groupedComponents.resistor && groupedComponents.resistor.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {getIcon('resistor')}
              抵抗
            </Typography>
            
            <Stack spacing={2}>
              {groupedComponents.resistor.map((component, index) => {
                const definition = componentDefinitions[component.type];
                const isSelected = selectedComponent?.id === component.id;
                
                return (
                  <Box
                    key={component.id}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: isSelected ? 'action.selected' : 'background.default',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: isSelected ? 'action.selected' : 'action.hover'
                      }
                    }}
                    onClick={() => onSelectComponent(component)}
                  >
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          抵抗 {index + 1}
                        </Typography>
                        <Chip
                          label={`${component.value || 0} ${definition.unit}`}
                          size="small"
                          color={isSelected ? 'primary' : 'default'}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Slider
                          value={component.value || 0}
                          onChange={(_, value) => handleValueChange(component.id, value as number)}
                          min={definition.valueRange?.min || 1}
                          max={definition.valueRange?.max || 100}
                          step={definition.valueRange?.step || 1}
                          marks
                          disabled={!isSimulating}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          value={component.value || 0}
                          onChange={(e) => handleValueChange(component.id, parseFloat(e.target.value) || 0)}
                          type="number"
                          size="small"
                          disabled={!isSimulating}
                          sx={{ width: 80 }}
                          inputProps={{
                            min: definition.valueRange?.min || 1,
                            max: definition.valueRange?.max || 100,
                            step: definition.valueRange?.step || 1
                          }}
                        />
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        )}
        
        {/* プリセット値 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            よく使う値
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ width: '100%', mb: 1 }}>
              電池:
            </Typography>
            {[1.5, 3.0, 4.5, 6.0, 9.0].map(value => (
              <Button
                key={`battery-${value}`}
                size="small"
                variant="outlined"
                disabled={!isSimulating || !selectedComponent || selectedComponent.type !== 'battery'}
                onClick={() => selectedComponent && handleValueChange(selectedComponent.id, value)}
              >
                {value}V
              </Button>
            ))}
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ width: '100%', mb: 1 }}>
              抵抗:
            </Typography>
            {[5, 10, 20, 50, 100].map(value => (
              <Button
                key={`resistor-${value}`}
                size="small"
                variant="outlined"
                disabled={!isSimulating || !selectedComponent || selectedComponent.type !== 'resistor'}
                onClick={() => selectedComponent && handleValueChange(selectedComponent.id, value)}
              >
                {value}Ω
              </Button>
            ))}
          </Box>
        </Paper>
        
        {/* リセットボタン */}
        <Button
          variant="outlined"
          startIcon={<ResetIcon />}
          disabled={!isSimulating}
          onClick={() => {
            components.forEach(component => {
              const definition = componentDefinitions[component.type];
              if (definition.defaultValue !== undefined) {
                handleValueChange(component.id, definition.defaultValue);
              }
            });
          }}
        >
          すべての値をリセット
        </Button>
      </Stack>
    </Box>
  );
};