import { Card as MuiCard, CardContent, CardActions } from '@mui/material';
import type { CardProps as MuiCardProps } from '@mui/material';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';

// なぜ独自のCardコンポーネントを作るか：
// 1. 教材カードとして統一的なデザインを提供
// 2. ホバー時の視覚的フィードバックで選択可能であることを示す
// 3. 学年に応じたアニメーション速度の調整が可能

interface CardProps extends Omit<MuiCardProps, 'component'> {
  children: ReactNode;
  // カードのアクション（ボタンなど）を配置するエリア
  actions?: ReactNode;
  // インタラクティブなカード（クリック可能）かどうか
  interactive?: boolean;
  // アニメーションを無効化
  disableAnimation?: boolean;
}

type MotionCardProps = HTMLMotionProps<'div'> & Omit<MuiCardProps, 'onDrag' | 'onDragStart' | 'onDragEnd'>;

const MotionCard = motion(MuiCard as any) as any;

export const Card = ({ 
  children, 
  actions,
  interactive = false,
  disableAnimation = false,
  onClick,
  ...props 
}: CardProps) => {
  // インタラクティブなカードの場合のアニメーション設定
  // なぜこの設定か：小さな動きで「触れる」ことができることを示唆
  const interactiveProps = interactive && !disableAnimation ? {
    whileHover: { 
      y: -4,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      y: 0,
      transition: { duration: 0.1 }
    },
    style: { cursor: 'pointer' }
  } : {};

  // アクセシビリティ：インタラクティブなカードの場合、
  // キーボード操作も可能にする
  const handleKeyDown = interactive && onClick ? (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e as any);
    }
  } : undefined;

  return (
    <MotionCard
      component={motion.div}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      aria-pressed={interactive ? 'false' : undefined}
      {...interactiveProps}
      {...props}
    >
      <CardContent>
        {children}
      </CardContent>
      {actions && (
        <CardActions>
          {actions}
        </CardActions>
      )}
    </MotionCard>
  );
};