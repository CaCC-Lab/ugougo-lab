import React, { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';

// 重いコンポーネントを動的インポート
const LeverPrincipleExperiment = lazy(() => import('./LeverPrincipleExperiment'));

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
    <p>てこの原理実験ツールを読み込んでいます...</p>
  </Box>
);

// 動的ロード対応のラッパーコンポーネント
const LeverPrincipleExperimentLazy: React.FC<any> = (props) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LeverPrincipleExperiment {...props} />
    </Suspense>
  );
};

export default LeverPrincipleExperimentLazy;