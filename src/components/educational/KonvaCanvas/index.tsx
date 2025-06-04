import { useRef, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import { Box, BoxProps } from '@mui/material';
import Konva from 'konva';

// なぜKonvaCanvasが必要か：
// 1. 複雑なアニメーションとインタラクションを効率的に処理
// 2. パフォーマンスが重要な教材（多数のオブジェクト）に対応
// 3. 豊富な図形描画機能とフィルター効果

interface KonvaCanvasProps extends Omit<BoxProps, 'children'> {
  width: number;
  height: number;
  children: React.ReactNode;
  // ステージへの参照を親コンポーネントに渡すためのコールバック
  onStageReady?: (stage: Konva.Stage) => void;
  // 背景色
  backgroundColor?: string;
  // スケーリング設定
  scaleMode?: 'fit' | 'fill' | 'none';
}

export const KonvaCanvas = ({
  width,
  height,
  children,
  onStageReady,
  backgroundColor = '#FFFFFF',
  scaleMode = 'fit',
  sx,
  ...boxProps
}: KonvaCanvasProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ステージの参照を親に通知
  const handleStageMount = useCallback(() => {
    if (stageRef.current) {
      onStageReady?.(stageRef.current);
    }
  }, [onStageReady]);

  // レスポンシブスケーリングの計算
  const getScaleAndOffset = useCallback(() => {
    if (!containerRef.current || scaleMode === 'none') {
      return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    let scaleX = containerWidth / width;
    let scaleY = containerHeight / height;

    if (scaleMode === 'fit') {
      // アスペクト比を保持して縮小
      const scale = Math.min(scaleX, scaleY);
      scaleX = scaleY = scale;
    }
    // 'fill'の場合はそのまま使用

    const offsetX = (containerWidth - width * scaleX) / 2;
    const offsetY = (containerHeight - height * scaleY) / 2;

    return { scaleX, scaleY, offsetX, offsetY };
  }, [width, height, scaleMode]);

  const { scaleX, scaleY, offsetX, offsetY } = getScaleAndOffset();

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor,
        ...sx,
      }}
      {...boxProps}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={scaleX}
        scaleY={scaleY}
        offsetX={-offsetX / scaleX}
        offsetY={-offsetY / scaleY}
        onMount={handleStageMount}
      >
        <Layer>
          {children}
        </Layer>
      </Stage>
    </Box>
  );
};