import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Paper,
  Grid,
  Button,
  Collapse,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  VolumeUp as SoundIcon,
  Warning as WarningIcon,
  Lightbulb as TipIcon
} from '@mui/icons-material';
import { pronunciationTips } from '../data/dialogueScenarios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

export const PronunciationGuide: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          発音ガイド
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          英語の正しい発音を身につけよう！カタカナ読みとの違いに注意しましょう。
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="子音" />
          <Tab label="母音" />
          <Tab label="リンキング" />
        </Tabs>

        {/* 子音タブ */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            {Object.entries(pronunciationTips.consonants).map(([key, consonant]) => (
              <Grid item xs={12} md={6} key={key}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="h6" component="div">
                        {consonant.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => toggleExpand(`consonant-${key}`)}
                      >
                        <ExpandIcon
                          sx={{
                            transform: expandedItems[`consonant-${key}`]
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                          }}
                        />
                      </IconButton>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {consonant.description}
                    </Typography>

                    <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                      {consonant.examples.map((example, index) => (
                        <Chip
                          key={index}
                          label={example}
                          size="small"
                          icon={<SoundIcon />}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>

                    <Collapse in={expandedItems[`consonant-${key}`]}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'warning.light' }}>
                        <Box display="flex" alignItems="flex-start">
                          <WarningIcon
                            color="warning"
                            sx={{ mr: 1, fontSize: 20 }}
                          />
                          <Typography variant="body2">
                            {consonant.katakanaWarning}
                          </Typography>
                        </Box>
                      </Paper>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* 母音タブ */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            {Object.entries(pronunciationTips.vowels).map(([key, vowel]) => (
              <Grid item xs={12} key={key}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {vowel.title}
                    </Typography>
                    
                    <List>
                      {vowel.variations.map((variation, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Chip
                                    label={`/${variation.sound}/`}
                                    color="secondary"
                                    size="small"
                                  />
                                  <Typography variant="body2">
                                    {variation.description}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box display="flex" gap={1} mt={1}>
                                  {variation.examples.map((ex, i) => (
                                    <Chip
                                      key={i}
                                      label={ex}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < vowel.variations.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* リンキングタブ */}
        <TabPanel value={tabValue} index={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {pronunciationTips.linking.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                英語では単語と単語がつながって発音されることがよくあります。
              </Typography>

              <List>
                {pronunciationTips.linking.rules.map((rule, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="bold">
                            {rule.rule}
                          </Typography>
                        }
                        secondary={
                          <Box mt={1}>
                            <Typography variant="body2" paragraph>
                              {rule.description}
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                bgcolor: 'primary.light',
                                display: 'inline-block'
                              }}
                            >
                              <Typography variant="body1" fontWeight="medium">
                                {rule.example}
                              </Typography>
                            </Paper>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < pronunciationTips.linking.rules.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          <Box mt={3} p={2} bgcolor="info.light" borderRadius={1}>
            <Box display="flex" alignItems="flex-start">
              <TipIcon sx={{ mr: 1, color: 'info.main' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  練習のコツ
                </Typography>
                <Typography variant="body2">
                  リンキングは自然な英語を話すために重要です。
                  最初はゆっくり、慣れてきたら徐々にスピードを上げて練習しましょう。
                </Typography>
              </Box>
            </Box>
          </Box>
        </TabPanel>
      </CardContent>
    </Card>
  );
};