import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { MaterialBase } from '../../../../../components/educational/MaterialBase';
import { KonvaCanvas, DraggableObject } from '../../../../../components/educational';
import { MaterialComponentProps } from '../../../../../types/material';

// なぜこの教材が必要か：
// 1. 小学1年生の「10までの数の合成・分解」を視覚的に学習
// 2. ドラッグ操作で能動的な学習体験を提供
// 3. 具体物（ブロック）から抽象的な数概念への橋渡し

interface NumberBlock {
  id: string;
  value: number;
  x: number;
  y: number;
  color: string;
  inBox: boolean; // 10の箱に入っているかどうか
}

// 10の箱の位置とサイズ
const BOX_CONFIG = {
  x: 200,
  y: 150,
  width: 300,
  height: 80,
  color: '#E3F2FD',
};

// 初期ブロックの設定
const createInitialBlocks = (): NumberBlock[] => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: `block-${i + 1}`,
    value: i + 1,
    x: 50 + (i % 5) * 70,
    y: 50 + Math.floor(i / 5) * 70,
    color: colors[i % colors.length],
    inBox: false,
  }));
};

export const NumberBlocks = (props: MaterialComponentProps) => {
  const [blocks, setBlocks] = useState<NumberBlock[]>(createInitialBlocks());
  const [targetNumber, setTargetNumber] = useState(10);
  const [currentSum, setCurrentSum] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

  // 箱内のブロックの合計を計算
  const calculateSum = useCallback((blockList: NumberBlock[]) => {
    return blockList.filter(block => block.inBox).reduce((sum, block) => sum + block.value, 0);
  }, []);

  // ブロックが箱内にあるかチェック
  const isInBox = useCallback((x: number, y: number) => {
    return (
      x >= BOX_CONFIG.x &&
      x <= BOX_CONFIG.x + BOX_CONFIG.width - 60 && // ブロックサイズを考慮
      y >= BOX_CONFIG.y &&
      y <= BOX_CONFIG.y + BOX_CONFIG.height - 60
    );
  }, []);

  // ブロックのドラッグ終了処理
  const handleBlockDragEnd = useCallback((id: string, x: number, y: number) => {
    setBlocks(prevBlocks => {
      const newBlocks = prevBlocks.map(block => {
        if (block.id === id) {
          const inBox = isInBox(x, y);
          return { ...block, x, y, inBox };
        }
        return block;
      });

      // 合計を更新
      const newSum = calculateSum(newBlocks);
      setCurrentSum(newSum);

      // 正解チェック
      if (newSum === targetNumber) {
        setSuccessCount(prev => prev + 1);
        // 次の問題への準備
        setTimeout(() => {
          // 新しい目標数字を設定（1-10の範囲）
          setTargetNumber(Math.floor(Math.random() * 10) + 1);
          // ブロックをリセット
          setBlocks(createInitialBlocks());
          setCurrentSum(0);
        }, 2000);
      }

      return newBlocks;
    });

    setAttempts(prev => prev + 1);
  }, [isInBox, calculateSum, targetNumber]);

  // 教材のリセット
  const handleReset = useCallback(() => {
    setBlocks(createInitialBlocks());
    setCurrentSum(0);
    setAttempts(0);
    setSuccessCount(0);
    setTargetNumber(10);
  }, []);

  // 進捗計算（成功回数に基づく）
  const progress = Math.min((successCount / 5) * 100, 100); // 5回成功で100%

  // 成功メッセージ
  const getSuccessMessage = () => {
    if (currentSum === targetNumber) {
      return `すばらしい！ ${targetNumber} ができました！`;
    }
    return '';
  };

  // ヘルプメッセージ
  const helpMessage = `目標の数字 ${targetNumber} を作るために、ブロックを青い箱の中にドラッグしてください。箱の中のブロックの数を合計して目標の数字になるようにしましょう！`;

  return (
    <MaterialBase
      {...props}
      progress={progress}
      helpMessage={helpMessage}
      successMessage={getSuccessMessage()}
      onReset={handleReset}
    >
      <Box sx={{ p: 2, height: '100%' }}>
        {/* 目標と現在の状況表示 */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip 
            label={`目標: ${targetNumber}`} 
            color="primary" 
            size="large"
          />
          <Chip 
            label={`現在: ${currentSum}`} 
            color={currentSum === targetNumber ? 'success' : 'default'} 
            size="large"
          />
          <Chip 
            label={`成功回数: ${successCount}`} 
            color="secondary" 
            size="medium"
          />
        </Box>

        {/* メインキャンバス */}
        <KonvaCanvas
          width={600}
          height={400}
          backgroundColor="#F9F9F9"
          sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
        >
          {/* 10の箱 */}
          <DraggableObject
            id="target-box"
            x={BOX_CONFIG.x}
            y={BOX_CONFIG.y}
            width={BOX_CONFIG.width}
            height={BOX_CONFIG.height}
            color={BOX_CONFIG.color}
            draggable={false}
            label={`目標: ${targetNumber}`}
            shape="rectangle"
          />

          {/* 数ブロック */}
          {blocks.map(block => (
            <DraggableObject
              key={block.id}
              id={block.id}
              x={block.x}
              y={block.y}
              width={60}
              height={60}
              color={block.color}
              label={block.value.toString()}
              onDragEnd={handleBlockDragEnd}
              selected={block.inBox}
              snapToGrid={10}
            />
          ))}
        </KonvaCanvas>

        {/* 説明テキスト */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 2, textAlign: 'center' }}
        >
          数字のブロックを青い箱にドラッグして、目標の数字を作ってみましょう！
        </Typography>
      </Box>
    </MaterialBase>
  );
};