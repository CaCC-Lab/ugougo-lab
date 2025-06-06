import { useState } from 'react';
import { CssBaseline, Container, Typography, Box, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

export default function App() {
  const [error, setError] = useState<string | null>(null);
  
  try {
    // 各コンポーネントを動的にインポートしてエラーを特定
    const testImports = async () => {
      try {
        const module1 = await import('./materials/elementary/grade3/math/FractionMasterTool');
        console.log('FractionMasterTool loaded:', module1);
      } catch (err) {
        console.error('FractionMasterTool error:', err);
        setError(`FractionMasterTool: ${err}`);
      }
      
      try {
        const module2 = await import('./materials/elementary/grade4/integrated/AbstractThinkingBridge');
        console.log('AbstractThinkingBridge loaded:', module2);
      } catch (err) {
        console.error('AbstractThinkingBridge error:', err);
        setError(`AbstractThinkingBridge: ${err}`);
      }
      
      try {
        const module3 = await import('./materials/junior-high/grade1/english/EnglishSpeakingPractice');
        console.log('EnglishSpeakingPractice loaded:', module3);
      } catch (err) {
        console.error('EnglishSpeakingPractice error:', err);
        setError(`EnglishSpeakingPractice: ${err}`);
      }
      
      try {
        const module4 = await import('./materials/junior-high/grade1/math/AlgebraIntroductionSystem');
        console.log('AlgebraIntroductionSystem loaded:', module4);
      } catch (err) {
        console.error('AlgebraIntroductionSystem error:', err);
        setError(`AlgebraIntroductionSystem: ${err}`);
      }
    };
    
    testImports();
    
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <Box sx={{ py: 4 }}>
            <Typography variant="h1">Debug App</Typography>
            <Typography>React is working! Check console for import status.</Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Container>
      </ThemeProvider>
    );
  } catch (err) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <Box sx={{ py: 4 }}>
            <Alert severity="error">
              Critical Error: {String(err)}
            </Alert>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }
}