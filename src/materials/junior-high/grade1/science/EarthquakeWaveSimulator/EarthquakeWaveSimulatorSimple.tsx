import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const EarthquakeWaveSimulator: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">地震波シミュレーター</Typography>
        <Typography>このコンポーネントは正常に表示されています。</Typography>
      </Paper>
    </Box>
  );
};

export default EarthquakeWaveSimulator;