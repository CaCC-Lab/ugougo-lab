import { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Button, Card, CardContent, Typography, Box } from '@mui/material';

// MUIの動作確認用アプリ
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

function AppMuiTest() {
  const [count, setCount] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          動く教材プロジェクト - MUI動作確認
        </Typography>
        
        <Card sx={{ mb: 3, maxWidth: 600 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              MUIコンポーネントのテスト
            </Typography>
            
            <Typography variant="body1" paragraph>
              Material-UIが正常に動作しています！
            </Typography>
            
            <Button 
              variant="contained" 
              onClick={() => setCount(count + 1)}
              sx={{ mr: 2 }}
            >
              カウント: {count}
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => setCount(0)}
            >
              リセット
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, maxWidth: 600 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              実装状況
            </Typography>
            <ul>
              <li>✅ React基本動作</li>
              <li>✅ MUI基本コンポーネント</li>
              <li>⏳ 教材システム</li>
              <li>⏳ インタラクティブ機能</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}

export default AppMuiTest;