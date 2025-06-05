import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

interface Item {
  id: string;
  label: string;
  color: string;
  emoji: string;
}

interface TreeDiagramProps {
  items: Item[];
  selectCount: number;
  problemType: 'permutation' | 'combination';
}

interface TreeNode {
  item: Item | null;
  children: TreeNode[];
  path: Item[];
  x?: number;
  y?: number;
}

export const TreeDiagram: React.FC<TreeDiagramProps> = ({
  items,
  selectCount,
  problemType
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const progressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // アニメーションをリセット
    progressRef.current = 0;
    
    const animate = () => {
      progressRef.current += 0.02;
      if (progressRef.current > 1) progressRef.current = 1;

      drawTree(ctx, canvas.width, canvas.height);

      if (progressRef.current < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [items, selectCount, problemType]);

  const buildTree = (): TreeNode => {
    const root: TreeNode = { item: null, children: [], path: [] };
    
    const buildBranch = (node: TreeNode, remainingItems: Item[], depth: number) => {
      if (depth >= selectCount) return;

      remainingItems.forEach((item, index) => {
        const newPath = [...node.path, item];
        const child: TreeNode = {
          item,
          children: [],
          path: newPath
        };

        if (problemType === 'permutation') {
          // 順列: 使用済みアイテムを除外
          const nextItems = remainingItems.filter((_, i) => i !== index);
          buildBranch(child, nextItems, depth + 1);
        } else {
          // 組み合わせ: 現在のアイテム以降のみ使用
          const nextItems = remainingItems.slice(index + 1);
          buildBranch(child, nextItems, depth + 1);
        }

        node.children.push(child);
      });
    };

    buildBranch(root, items, 0);
    return root;
  };

  const calculateNodePositions = (root: TreeNode, width: number, height: number) => {
    const levelHeight = height / (selectCount + 1);
    
    const assignPositions = (node: TreeNode, x: number, y: number, xRange: number) => {
      node.x = x;
      node.y = y;

      if (node.children.length > 0) {
        const childXRange = xRange / node.children.length;
        const startX = x - xRange / 2 + childXRange / 2;

        node.children.forEach((child, index) => {
          const childX = startX + index * childXRange;
          const childY = y + levelHeight;
          assignPositions(child, childX, childY, childXRange * 0.8);
        });
      }
    };

    assignPositions(root, width / 2, 50, width * 0.8);
  };

  const drawTree = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    const tree = buildTree();
    calculateNodePositions(tree, width, height);

    // 線を描画
    const drawConnections = (node: TreeNode) => {
      if (!node.x || !node.y) return;

      node.children.forEach(child => {
        if (!child.x || !child.y) return;

        const progress = Math.min(progressRef.current * 2, 1);
        ctx.strokeStyle = `rgba(200, 200, 200, ${progress})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(child.x, child.y);
        ctx.stroke();

        drawConnections(child);
      });
    };

    drawConnections(tree);

    // ノードを描画
    const drawNodes = (node: TreeNode, depth: number = 0) => {
      if (!node.x || !node.y) return;

      if (node.item) {
        const nodeProgress = Math.max(0, Math.min(1, (progressRef.current - depth * 0.2) * 2));
        
        // 円を描画
        ctx.fillStyle = node.item.color;
        ctx.globalAlpha = nodeProgress;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // 絵文字とラベルを描画
        ctx.fillStyle = 'white';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.item.emoji, node.x, node.y - 5);
        ctx.font = '12px sans-serif';
        ctx.fillText(node.item.label, node.x, node.y + 10);
        ctx.globalAlpha = 1;
      }

      node.children.forEach(child => drawNodes(child, depth + 1));
    };

    drawNodes(tree);

    // 葉ノードに結果を表示
    const drawResults = (node: TreeNode) => {
      if (node.children.length === 0 && node.path.length === selectCount) {
        if (!node.x || !node.y) return;

        const resultProgress = Math.max(0, Math.min(1, (progressRef.current - 0.5) * 2));
        ctx.globalAlpha = resultProgress;
        
        // 結果の背景
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(node.x - 40, node.y + 35, 80, 25);
        
        // 結果のテキスト
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          node.path.map(item => item.label).join(''),
          node.x,
          node.y + 48
        );
        ctx.globalAlpha = 1;
      }

      node.children.forEach(drawResults);
    };

    drawResults(tree);
  };

  return (
    <Box sx={{ width: '100%', height: 400, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #e0e0e0',
          borderRadius: 4
        }}
      />
    </Box>
  );
};