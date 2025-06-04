import { useRef, useCallback, useState, useEffect } from 'react';

// なぜこのフックが必要か：
// 1. ドラッグ&ドロップなどのインタラクションロジックを再利用可能にする
// 2. タッチとマウスの両方のイベントを統一的に処理
// 3. 教材開発時の実装を簡素化

interface InteractiveElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // その他のカスタムプロパティ
  [key: string]: any;
}

interface UseInteractiveOptions {
  // ドラッグ可能かどうか
  draggable?: boolean;
  // スナップグリッドのサイズ（0で無効）
  snapGrid?: number;
  // 境界制限
  bounds?: {
    minX?: number;
    minY?: number;
    maxX?: number;
    maxY?: number;
  };
  // ドラッグ開始時のコールバック
  onDragStart?: (element: InteractiveElement) => void;
  // ドラッグ中のコールバック
  onDrag?: (element: InteractiveElement, deltaX: number, deltaY: number) => void;
  // ドラッグ終了時のコールバック
  onDragEnd?: (element: InteractiveElement) => void;
  // クリック時のコールバック
  onClick?: (element: InteractiveElement) => void;
}

export const useInteractive = <T extends InteractiveElement>(
  elements: T[],
  options: UseInteractiveOptions = {}
) => {
  const {
    draggable = true,
    snapGrid = 0,
    bounds,
    onDragStart,
    onDrag,
    onDragEnd,
    onClick,
  } = options;

  const [activeElement, setActiveElement] = useState<T | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });

  // 座標をグリッドにスナップ
  const snapToGrid = useCallback((value: number) => {
    if (snapGrid <= 0) return value;
    return Math.round(value / snapGrid) * snapGrid;
  }, [snapGrid]);

  // 境界内に座標を制限
  const constrainToBounds = useCallback((x: number, y: number, element: T) => {
    let constrainedX = x;
    let constrainedY = y;

    if (bounds) {
      if (bounds.minX !== undefined) {
        constrainedX = Math.max(bounds.minX, constrainedX);
      }
      if (bounds.maxX !== undefined) {
        constrainedX = Math.min(bounds.maxX - element.width, constrainedX);
      }
      if (bounds.minY !== undefined) {
        constrainedY = Math.max(bounds.minY, constrainedY);
      }
      if (bounds.maxY !== undefined) {
        constrainedY = Math.min(bounds.maxY - element.height, constrainedY);
      }
    }

    return { x: constrainedX, y: constrainedY };
  }, [bounds]);

  // 座標から要素を検出
  const getElementAtPoint = useCallback((x: number, y: number): T | null => {
    // 逆順で検索（上にある要素を優先）
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (
        x >= element.x &&
        x <= element.x + element.width &&
        y >= element.y &&
        y <= element.y + element.height
      ) {
        return element;
      }
    }
    return null;
  }, [elements]);

  // ポインターダウン（マウスダウン/タッチスタート）
  const handlePointerDown = useCallback((x: number, y: number) => {
    const element = getElementAtPoint(x, y);
    if (!element || !draggable) {
      onClick?.(element!);
      return;
    }

    setActiveElement(element);
    setIsDragging(true);
    dragStartPos.current = { x, y };
    elementStartPos.current = { x: element.x, y: element.y };
    onDragStart?.(element);
  }, [getElementAtPoint, draggable, onClick, onDragStart]);

  // ポインタームーブ（マウスムーブ/タッチムーブ）
  const handlePointerMove = useCallback((x: number, y: number) => {
    if (!isDragging || !activeElement) return;

    const deltaX = x - dragStartPos.current.x;
    const deltaY = y - dragStartPos.current.y;

    let newX = elementStartPos.current.x + deltaX;
    let newY = elementStartPos.current.y + deltaY;

    // グリッドにスナップ
    newX = snapToGrid(newX);
    newY = snapToGrid(newY);

    // 境界制限を適用
    const constrained = constrainToBounds(newX, newY, activeElement);
    
    // 要素の位置を更新（実際の更新は親コンポーネントで行う）
    onDrag?.(activeElement, constrained.x - activeElement.x, constrained.y - activeElement.y);
  }, [isDragging, activeElement, snapToGrid, constrainToBounds, onDrag]);

  // ポインターアップ（マウスアップ/タッチエンド）
  const handlePointerUp = useCallback(() => {
    if (isDragging && activeElement) {
      onDragEnd?.(activeElement);
    } else if (activeElement && !isDragging) {
      onClick?.(activeElement);
    }
    
    setIsDragging(false);
    setActiveElement(null);
  }, [isDragging, activeElement, onDragEnd, onClick]);

  // イベントハンドラーを返す
  return {
    activeElement,
    isDragging,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
    // ユーティリティ関数
    getElementAtPoint,
  };
};