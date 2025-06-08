// 日付変更線の説明コンポーネント
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Public as PublicIcon,
  FlightTakeoff as FlightIcon,
  Today as TodayIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const IllustrationContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 600,
  height: 300,
  margin: '0 auto',
  backgroundColor: '#e3f2fd',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden'
}));

const DateLineSvg = styled('svg')({
  width: '100%',
  height: '100%'
});

export const DateLineExplanation: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const steps = [
    {
      label: '日付変更線とは',
      content: (
        <Box>
          <Typography paragraph>
            日付変更線は、太平洋上のほぼ経度180度に沿って設定された、日付が変わる境界線です。
            この線を越えると、日付が1日進んだり戻ったりします。
          </Typography>
          <IllustrationContainer>
            <DateLineSvg viewBox="0 0 600 300">
              {/* 地球のイメージ */}
              <circle cx="300" cy="150" r="120" fill="#87ceeb" opacity="0.3" />
              
              {/* 大陸の簡略表現 */}
              <ellipse cx="200" cy="150" rx="40" ry="60" fill="#8b7355" opacity="0.6" />
              <ellipse cx="400" cy="150" rx="40" ry="60" fill="#8b7355" opacity="0.6" />
              
              {/* 日付変更線 */}
              <line
                x1="300"
                y1="30"
                x2="300"
                y2="270"
                stroke="#ff0000"
                strokeWidth="3"
                strokeDasharray="10,5"
              />
              
              {/* ラベル */}
              <text x="310" y="50" fontSize="16" fill="#ff0000">
                日付変更線
              </text>
              <text x="310" y="70" fontSize="14" fill="#666">
                （経度180度付近）
              </text>
              
              {/* 東西の表示 */}
              <text x="150" y="150" fontSize="20" fill="#333" textAnchor="middle">
                西側
              </text>
              <text x="450" y="150" fontSize="20" fill="#333" textAnchor="middle">
                東側
              </text>
            </DateLineSvg>
          </IllustrationContainer>
        </Box>
      )
    },
    {
      label: '西から東へ越える場合',
      content: (
        <Box>
          <Typography paragraph>
            西から東へ日付変更線を越えると、日付が1日戻ります。
            例：月曜日 → 日曜日
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    出発地（西側）
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <TodayIcon />
                    <Typography>月曜日 午後3時</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={2} display="flex" alignItems="center" justifyContent="center">
              <ArrowForwardIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Grid>
            <Grid item xs={5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="secondary">
                    到着地（東側）
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <TodayIcon />
                    <Typography>日曜日 午後3時</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: '東から西へ越える場合',
      content: (
        <Box>
          <Typography paragraph>
            東から西へ日付変更線を越えると、日付が1日進みます。
            例：日曜日 → 月曜日
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="secondary">
                    出発地（東側）
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <TodayIcon />
                    <Typography>日曜日 午前10時</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={2} display="flex" alignItems="center" justifyContent="center">
              <ArrowBackIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            </Grid>
            <Grid item xs={5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    到着地（西側）
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <TodayIcon />
                    <Typography>月曜日 午前10時</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: '実際の例',
      content: (
        <Box>
          <Typography paragraph>
            実際の航空便での例を見てみましょう。
          </Typography>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FlightIcon color="primary" />
                <Typography variant="h6">東京 → ホノルル</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                東京を月曜日の夜に出発すると、ホノルルには月曜日の朝に到着します。
                飛行時間は約7時間ですが、日付変更線を東へ越えるため、同じ日の朝に「戻る」ことになります。
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FlightIcon color="secondary" />
                <Typography variant="h6">ホノルル → 東京</Typography>
              </Box>
              <Typography variant="body2">
                ホノルルを日曜日の午後に出発すると、東京には月曜日の夕方に到着します。
                日付変更線を西へ越えるため、1日進んだ次の日に到着することになります。
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PublicIcon />
        日付変更線について学ぼう
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                {step.content}
              </Box>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={index === steps.length - 1}
                >
                  {index === steps.length - 1 ? '完了' : '次へ'}
                </Button>
                <Button
                  disabled={index === 0}
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  戻る
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === steps.length - 1 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            日付変更線の学習が完了しました！
          </Typography>
          <Button onClick={handleReset}>最初から見る</Button>
        </Box>
      )}
    </Paper>
  );
};