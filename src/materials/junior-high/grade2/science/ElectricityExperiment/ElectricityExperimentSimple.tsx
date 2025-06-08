import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';

const ElectricityExperiment: React.FC = () => {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4">電流・電圧・抵抗の関係実験器</Typography>
          <Typography>このコンポーネントは正常に表示されています。</Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default ElectricityExperiment;