import React, { useRef, useState, useCallback } from 'react';
import { Stage, Layer, Group, Line, Circle, Text, Rect } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Box, IconButton, Tooltip, Paper } from '@mui/material';
import {
  Battery80 as BatteryIcon,
  Memory as ResistorIcon,
  Speed as AmmeterIcon,
  ElectricalServices as VoltmeterIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import type { CircuitComponent, ComponentType } from '../types';
import { componentDefinitions } from '../data/circuitComponents';

interface CircuitEditorProps {
  width: number;
  height: number;
  components: CircuitComponent[];
  selectedComponent: CircuitComponent | null;
  onAddComponent: (type: ComponentType, position: { x: number; y: number }) => void;
  onMoveComponent: (id: string, position: { x: number; y: number }) => void;
  onSelectComponent: (component: CircuitComponent | null) => void;
  onRemoveComponent: (id: string) => void;
  onAddWire: (from: string, to: string, fromPort: string, toPort: string) => void;
  isSimulating: boolean;
}

// 部品の描画
const ComponentShape: React.FC<{
  component: CircuitComponent;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
}> = ({ component, isSelected, onSelect, onDragEnd }) => {
  const definition = componentDefinitions[component.type];
  
  // 部品ごとの描画
  const renderComponent = () => {
    switch (component.type) {
      case 'battery':
        return (
          <>
            {/* 電池の記号 */}
            <Line
              points={[-20, 0, -10, 0]}
              stroke="black"
              strokeWidth={2}
            />
            <Line
              points={[-10, -15, -10, 15]}
              stroke="black"
              strokeWidth={3}
            />
            <Line
              points={[10, -10, 10, 10]}
              stroke="black"
              strokeWidth={2}
            />
            <Line
              points={[10, 0, 20, 0]}
              stroke="black"
              strokeWidth={2}
            />
            {/* プラス記号 */}
            <Text
              x={-25}
              y={-20}
              text="+"
              fontSize={14}
              fill="red"
            />
          </>
        );
        
      case 'resistor':
        return (
          <>
            {/* 抵抗の記号（ジグザグ） */}
            <Line
              points={[
                -30, 0, -20, 0,
                -18, -5, -14, 5,
                -10, -5, -6, 5,
                -2, -5, 2, 5,
                6, -5, 10, 5,
                14, -5, 18, 5,
                20, 0, 30, 0
              ]}
              stroke="black"
              strokeWidth={2}
            />
          </>
        );
        
      case 'ammeter':
        return (
          <>
            {/* 電流計の記号（円にA） */}
            <Circle
              x={0}
              y={0}
              radius={20}
              stroke="black"
              strokeWidth={2}
              fill="white"
            />
            <Text
              x={-8}
              y={-8}
              text="A"
              fontSize={16}
              fill="black"
              fontStyle="bold"
            />
            <Line
              points={[-30, 0, -20, 0]}
              stroke="black"
              strokeWidth={2}
            />
            <Line
              points={[20, 0, 30, 0]}
              stroke="black"
              strokeWidth={2}
            />
          </>
        );
        
      case 'voltmeter':
        return (
          <>
            {/* 電圧計の記号（円にV） */}
            <Circle
              x={0}
              y={0}
              radius={20}
              stroke="black"
              strokeWidth={2}
              fill="white"
            />
            <Text
              x={-8}
              y={-8}
              text="V"
              fontSize={16}
              fill="black"
              fontStyle="bold"
            />
            {/* 並列接続用の線 */}
            <Line
              points={[0, -20, 0, -30]}
              stroke="black"
              strokeWidth={2}
            />
            <Line
              points={[0, 20, 0, 30]}
              stroke="black"
              strokeWidth={2}
            />
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Group
      x={component.position.x}
      y={component.position.y}
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    >
      {/* 選択時の枠 */}
      {isSelected && (
        <Rect
          x={-40}
          y={-30}
          width={80}
          height={60}
          stroke="#1976d2"
          strokeWidth={2}
          dash={[5, 5]}
          fill="transparent"
        />
      )}
      
      {/* 部品の描画 */}
      {renderComponent()}
      
      {/* 値の表示 */}
      {component.value !== undefined && component.value !== 0 && (
        <Text
          x={-20}
          y={25}
          text={`${component.value}${definition.unit || ''}`}
          fontSize={12}
          fill="#666"
        />
      )}
      
      {/* 接続ポイント */}
      <Circle
        x={-30}
        y={0}
        radius={3}
        fill="blue"
        opacity={0.5}
      />
      <Circle
        x={30}
        y={0}
        radius={3}
        fill="blue"
        opacity={0.5}
      />
    </Group>
  );
};

export const CircuitEditor: React.FC<CircuitEditorProps> = ({
  width,
  height,
  components,
  selectedComponent,
  onAddComponent,
  onMoveComponent,
  onSelectComponent,
  onRemoveComponent,
  onAddWire,
  isSimulating
}) => {
  const stageRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isDrawingWire, setIsDrawingWire] = useState(false);
  const [wireStart, setWireStart] = useState<{ componentId: string; port: string } | null>(null);
  
  // 部品パレット
  const componentTypes: Array<{ type: ComponentType; icon: React.ReactNode; label: string }> = [
    { type: 'battery', icon: <BatteryIcon />, label: '電池' },
    { type: 'resistor', icon: <ResistorIcon />, label: '抵抗' },
    { type: 'ammeter', icon: <AmmeterIcon />, label: '電流計' },
    { type: 'voltmeter', icon: <VoltmeterIcon />, label: '電圧計' }
  ];
  
  // ステージクリック
  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    // 空白部分をクリックしたら選択解除
    if (e.target === e.target.getStage()) {
      onSelectComponent(null);
    }
  }, [onSelectComponent]);
  
  // 部品のドラッグ終了
  const handleDragEnd = useCallback((componentId: string) => (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onMoveComponent(componentId, {
      x: node.x(),
      y: node.y()
    });
  }, [onMoveComponent]);
  
  // 部品の追加（ボタンからドラッグ）
  const handleComponentAdd = useCallback((type: ComponentType) => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const stageBox = stage.container().getBoundingClientRect();
    const x = stageBox.width / 2;
    const y = stageBox.height / 2;
    
    onAddComponent(type, { x, y });
  }, [onAddComponent]);
  
  return (
    <Box sx={{ position: 'relative', bgcolor: 'background.paper', borderRadius: 1 }}>
      {/* 部品パレット */}
      <Paper
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
        elevation={3}
      >
        {componentTypes.map(({ type, icon, label }) => (
          <Tooltip key={type} title={label} placement="right">
            <IconButton
              onClick={() => handleComponentAdd(type)}
              disabled={isSimulating}
              sx={{
                bgcolor: 'background.default',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              {icon}
            </IconButton>
          </Tooltip>
        ))}
        
        {selectedComponent && (
          <>
            <Box sx={{ borderTop: 1, borderColor: 'divider', my: 0.5 }} />
            <Tooltip title="削除" placement="right">
              <IconButton
                onClick={() => onRemoveComponent(selectedComponent.id)}
                disabled={isSimulating}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Paper>
      
      {/* キャンバス */}
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onClick={handleStageClick}
        style={{ backgroundColor: '#f5f5f5' }}
      >
        <Layer>
          {/* グリッド背景 */}
          {Array.from({ length: Math.floor(height / 20) }).map((_, i) => (
            <Line
              key={`h-${i}`}
              points={[0, i * 20, width, i * 20]}
              stroke="#e0e0e0"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: Math.floor(width / 20) }).map((_, i) => (
            <Line
              key={`v-${i}`}
              points={[i * 20, 0, i * 20, height]}
              stroke="#e0e0e0"
              strokeWidth={1}
            />
          ))}
          
          {/* 部品の描画 */}
          {components.map(component => (
            <ComponentShape
              key={component.id}
              component={component}
              isSelected={selectedComponent?.id === component.id}
              onSelect={() => onSelectComponent(component)}
              onDragEnd={handleDragEnd(component.id)}
            />
          ))}
        </Layer>
      </Stage>
    </Box>
  );
};