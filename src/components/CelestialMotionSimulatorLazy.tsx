import React, { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';

// 重いコンポーネントを動的インポート
const CelestialMotionSimulator = lazy(() => import('./CelestialMotionSimulator'));

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
    <p>天体シミュレーターを読み込んでいます...</p>
  </Box>
);

// 動的ロード対応のラッパーコンポーネント
const CelestialMotionSimulatorLazy: React.FC<any> = (props) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CelestialMotionSimulator {...props} />
    </Suspense>
  );
};

export default CelestialMotionSimulatorLazy;