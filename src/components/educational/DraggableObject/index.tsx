import { useRef, useCallback } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import Konva from 'konva';

// なぜDraggableObjectが必要か：
// 1. 教材で頻繁に使用されるドラッグ可能オブジェクトの共通実装
// 2. 小学生向けの大きなタッチターゲットを考慮した設計
// 3. アクセシビリティ（色覚多様性、視覚的フィードバック）への配慮

interface DraggableObjectProps {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number; // 円形の場合
  shape?: 'rectangle' | 'circle';
  color?: string;
  label?: string;
  // ドラッグ可能かどうか
  draggable?: boolean;
  // 選択されているかどうか
  selected?: boolean;
  // イベントハンドラー
  onDragStart?: (id: string, x: number, y: number) => void;
  onDragMove?: (id: string, x: number, y: number) => void;
  onDragEnd?: (id: string, x: number, y: number) => void;
  onClick?: (id: string) => void;
  // スナップ機能
  snapToGrid?: number;
}

export const DraggableObject = ({
  id,
  x,
  y,
  width = 60,
  height = 60,
  radius = 30,
  shape = 'rectangle',
  color = '#FF6B6B',
  label,
  draggable = true,
  selected = false,
  onDragStart,
  onDragMove,
  onDragEnd,
  onClick,
  snapToGrid = 0,
}: DraggableObjectProps) => {
  const groupRef = useRef<Konva.Group>(null);

  // スナップ処理
  const snapPosition = useCallback((pos: { x: number; y: number }) => {
    if (snapToGrid <= 0) return pos;
    
    return {
      x: Math.round(pos.x / snapToGrid) * snapToGrid,
      y: Math.round(pos.y / snapToGrid) * snapToGrid,
    };
  }, [snapToGrid]);

  // ドラッグ開始
  const handleDragStart = useCallback(() => {
    if (!groupRef.current) return;
    const pos = groupRef.current.position();
    onDragStart?.(id, pos.x, pos.y);
  }, [id, onDragStart]);

  // ドラッグ中
  const handleDragMove = useCallback(() => {
    if (!groupRef.current) return;
    const pos = snapPosition(groupRef.current.position());
    groupRef.current.position(pos);
    onDragMove?.(id, pos.x, pos.y);
  }, [id, onDragMove, snapPosition]);

  // ドラッグ終了
  const handleDragEnd = useCallback(() => {
    if (!groupRef.current) return;
    const pos = snapPosition(groupRef.current.position());
    groupRef.current.position(pos);
    onDragEnd?.(id, pos.x, pos.y);
  }, [id, onDragEnd, snapPosition]);

  // クリック処理
  const handleClick = useCallback(() => {
    onClick?.(id);
  }, [id, onClick]);

  // 選択時のエフェクト
  const strokeWidth = selected ? 3 : 1;
  const strokeColor = selected ? '#FFD700' : '#333';
  const shadowEnabled = selected;

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick} // タッチデバイス対応
    >
      {/* 図形の描画 */}
      {shape === 'rectangle' ? (
        <Rect
          width={width}
          height={height}
          fill={color}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          cornerRadius={8}
          shadowColor="black"
          shadowBlur={shadowEnabled ? 5 : 0}
          shadowOffset={{ x: shadowEnabled ? 2 : 0, y: shadowEnabled ? 2 : 0 }}
          shadowOpacity={shadowEnabled ? 0.3 : 0}
        />
      ) : (
        <Circle
          radius={radius}
          fill={color}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          shadowColor="black"
          shadowBlur={shadowEnabled ? 5 : 0}
          shadowOffset={{ x: shadowEnabled ? 2 : 0, y: shadowEnabled ? 2 : 0 }}
          shadowOpacity={shadowEnabled ? 0.3 : 0}
        />
      )}

      {/* ラベルテキスト */}
      {label && (
        <Text
          text={label}
          x={shape === 'rectangle' ? width / 2 : 0}
          y={shape === 'rectangle' ? height / 2 : 0}
          offsetX={label.length * 6} // 文字数に応じた中央揃え（概算）
          offsetY={8}
          fontSize={16}
          fontFamily="Noto Sans JP, Arial"
          fill="white"
          fontStyle="bold"
        />
      )}
    </Group>
  );
};