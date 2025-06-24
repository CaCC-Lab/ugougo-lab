import React, { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';

// 重いコンポーネントを動的インポート
const ProportionGraphTool = lazy(() => import('./ProportionGraphTool'));

// ローディング表示コンポーネント
const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 400,
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress />
    <p>比例・反比例グラフツールを読み込んでいます...</p>
  </Box>
);

// 動的ロード対応のラッパーコンポーネント
const ProportionGraphToolLazy: React.FC<any> = (props) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProportionGraphTool {...props} />
    </Suspense>
  );
};

export default ProportionGraphToolLazy;