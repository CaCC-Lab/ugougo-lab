import { useRef, useEffect, forwardRef } from 'react';
import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material';

// なぜこのコンポーネントが必要か：
// 1. 教材で共通して使用するCanvas要素のラッパー
// 2. レスポンシブ対応とRetina対応を統一的に処理
// 3. 描画のパフォーマンス最適化を一元管理

interface CanvasProps extends Omit<BoxProps, 'ref'> {
  width: number;
  height: number;
  // Canvas要素への参照を親コンポーネントに渡すためのコールバック
  onCanvasReady?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
  // リサイズ時の処理
  onResize?: (width: number, height: number) => void;
  // 背景色（デフォルトは白）
  backgroundColor?: string;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(function Canvas({
  width,
  height,
  onCanvasReady,
  onResize,
  backgroundColor = '#FFFFFF',
  sx,
  ...boxProps
}, ref) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // refを統合（外部refと内部refの両方をサポート）
  const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalRef;

  // Canvasの初期設定とRetina対応
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // デバイスピクセル比を取得（Retina対応）
    const dpr = window.devicePixelRatio || 1;

    // 実際のCanvasサイズを設定
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // CSSサイズを設定
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // コンテキストをスケール（Retina対応）
    ctx.scale(dpr, dpr);

    // 背景色を設定
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // 親コンポーネントにCanvasとコンテキストを通知
    onCanvasReady?.(canvas, ctx);
  }, [width, height, backgroundColor, onCanvasReady]);

  // リサイズ処理
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = rect.width;
      const newHeight = rect.height;

      // アスペクト比を保持してリサイズ
      const aspectRatio = width / height;
      let finalWidth = newWidth;
      let finalHeight = newWidth / aspectRatio;

      if (finalHeight > newHeight) {
        finalHeight = newHeight;
        finalWidth = newHeight * aspectRatio;
      }

      onResize?.(finalWidth, finalHeight);
    };

    // ResizeObserverでコンテナのサイズ変更を監視
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [width, height, onResize]);

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        ...sx,
      }}
      {...boxProps}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          maxWidth: '100%',
          maxHeight: '100%',
          touchAction: 'none', // タッチデバイスでのスクロール防止
        }}
      />
    </Box>
  );
});