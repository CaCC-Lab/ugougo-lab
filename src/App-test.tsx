import { CssBaseline, Container, Typography, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Box sx={{ py: 4 }}>
          <Typography variant="h1">Test App</Typography>
          <Typography>If you can see this, React is working!</Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}