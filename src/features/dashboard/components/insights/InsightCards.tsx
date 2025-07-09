import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  Warning as WarningIcon,
  TipsAndUpdates as TipsIcon,
  EmojiObjects as IdeaIcon,
  CheckCircle as SuccessIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { type LearningInsight } from '../../types';

interface InsightCardsProps {
  insights: LearningInsight[];
}

const InsightCards: React.FC<InsightCardsProps> = ({ insights }) => {
  const theme = useTheme();
  const [expandedCards, setExpandedCards] = React.useState<Set<number>>(new Set());
  
  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };
  
  const getInsightIcon = (type: LearningInsight['type']) => {
    switch (type) {
      case 'weakness':
        return <WarningIcon />;
      case 'strength':
        return <SuccessIcon />;
      case 'pattern':
        return <TipsIcon />;
      case 'recommendation':
        return <IdeaIcon />;
      default:
        return <TipsIcon />;
    }
  };
  
  const getInsightColor = (type: LearningInsight['type'], priority: LearningInsight['priority']) => {
    if (priority === 'high') {
      return type === 'weakness' ? theme.palette.error.main : theme.palette.warning.main;
    }
    if (type === 'strength') {
      return theme.palette.success.main;
    }
    return theme.palette.info.main;
  };
  
  const getPriorityLabel = (priority: LearningInsight['priority']) => {
    switch (priority) {
      case 'high':
        return '重要';
      case 'medium':
        return '推奨';
      case 'low':
        return '参考';
      default:
        return '';
    }
  };
  
  if (!insights || insights.length === 0) {
    return null;
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        学習インサイト
      </Typography>
      
      <Grid container spacing={2}>
        {insights.map((insight, index) => {
          const isExpanded = expandedCards.has(index);
          const insightColor = getInsightColor(insight.type, insight.priority);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderLeft: `4px solid ${insightColor}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Box
                        sx={{
                          color: insightColor,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {getInsightIcon(insight.type)}
                      </Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {insight.title}
                      </Typography>
                    </Box>
                    
                    <Chip
                      size="small"
                      label={getPriorityLabel(insight.priority)}
                      sx={{
                        backgroundColor: alpha(insightColor, 0.1),
                        color: insightColor,
                        fontWeight: 'bold',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'none' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {insight.description}
                  </Typography>
                  
                  {(insight.actionItems && insight.actionItems.length > 0) && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => toggleExpand(index)}
                        sx={{ p: 0.5, mb: 1 }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                      
                      <Collapse in={isExpanded}>
                        <Box mt={1}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            推奨アクション:
                          </Typography>
                          {insight.actionItems.map((action, actionIndex) => (
                            <Box
                              key={actionIndex}
                              display="flex"
                              alignItems="center"
                              gap={0.5}
                              mt={0.5}
                            >
                              <ArrowIcon
                                sx={{
                                  fontSize: 14,
                                  color: theme.palette.text.secondary
                                }}
                              />
                              <Typography variant="caption">
                                {action}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                        
                        {insight.relatedMaterials && insight.relatedMaterials.length > 0 && (
                          <Box mt={2}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ArrowIcon />}
                              sx={{
                                borderColor: insightColor,
                                color: insightColor,
                                '&:hover': {
                                  borderColor: insightColor,
                                  backgroundColor: alpha(insightColor, 0.05)
                                }
                              }}
                            >
                              関連教材を見る
                            </Button>
                          </Box>
                        )}
                      </Collapse>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default InsightCards;