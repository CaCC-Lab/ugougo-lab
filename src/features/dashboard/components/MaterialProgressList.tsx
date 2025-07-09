import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Collapse,
  useTheme,
  alpha,
  Button,
  Grid
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

interface MaterialProgress {
  materialId: string;
  materialTitle: string;
  category: string;
  proficiency: number;
  lastAccessed: Date;
  totalTime: number;
  accuracy: number;
  attemptCount: number;
  trend: number; // 前週比
}

interface MaterialProgressListProps {
  topMaterials: MaterialProgress[];
  bottomMaterials: MaterialProgress[];
}

const MaterialProgressList: React.FC<MaterialProgressListProps> = ({
  topMaterials,
  bottomMaterials
}) => {
  const theme = useTheme();
  const [expandedTop, setExpandedTop] = React.useState(true);
  const [expandedBottom, setExpandedBottom] = React.useState(true);
  const [selectedMaterial, setSelectedMaterial] = React.useState<string | null>(null);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}分`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins > 0 ? `${mins}分` : ''}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今日';
    if (days === 1) return '昨日';
    if (days < 7) return `${days}日前`;
    if (days < 30) return `${Math.floor(days / 7)}週間前`;
    return `${Math.floor(days / 30)}ヶ月前`;
  };

  const getProficiencyColor = (proficiency: number) => {
    if (proficiency >= 80) return theme.palette.success.main;
    if (proficiency >= 60) return theme.palette.primary.main;
    if (proficiency >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getProficiencyLabel = (proficiency: number) => {
    if (proficiency >= 80) return '習熟';
    if (proficiency >= 60) return '良好';
    if (proficiency >= 40) return '要復習';
    return '要学習';
  };

  const MaterialItem: React.FC<{
    material: MaterialProgress;
    isTop: boolean;
    index: number;
  }> = ({ material, isTop, index }) => {
    const isSelected = selectedMaterial === material.materialId;
    const proficiencyColor = getProficiencyColor(material.proficiency);

    return (
      <>
        <ListItem
          sx={{
            py: 2,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05)
            }
          }}
          onClick={() => setSelectedMaterial(isSelected ? null : material.materialId)}
        >
          <ListItemIcon>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isTop 
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.warning.main, 0.1),
                color: isTop ? theme.palette.success.main : theme.palette.warning.main,
                fontWeight: 'bold',
                fontSize: 14
              }}
            >
              {index + 1}
            </Box>
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body1" fontWeight="medium">
                  {material.materialTitle}
                </Typography>
                <Chip
                  size="small"
                  label={material.category}
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            }
            secondary={
              <Box mt={1}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    習熟度: {material.proficiency}%
                  </Typography>
                  <Chip
                    size="small"
                    label={getProficiencyLabel(material.proficiency)}
                    sx={{
                      backgroundColor: alpha(proficiencyColor, 0.1),
                      color: proficiencyColor,
                      fontWeight: 'bold',
                      fontSize: '0.65rem',
                      height: 18
                    }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={material.proficiency}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(proficiencyColor, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: proficiencyColor,
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            }
          />
          
          <Box display="flex" alignItems="center" gap={0.5}>
            {material.trend !== 0 && (
              <Box display="flex" alignItems="center">
                {material.trend > 0 ? (
                  <TrendingUpIcon
                    sx={{
                      fontSize: 18,
                      color: theme.palette.success.main
                    }}
                  />
                ) : (
                  <TrendingDownIcon
                    sx={{
                      fontSize: 18,
                      color: theme.palette.error.main
                    }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: material.trend > 0 
                      ? theme.palette.success.main 
                      : theme.palette.error.main
                  }}
                >
                  {Math.abs(material.trend)}%
                </Typography>
              </Box>
            )}
            <IconButton size="small">
              {isSelected ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </ListItem>
        
        <Collapse in={isSelected}>
          <Box
            sx={{
              px: 7,
              py: 2,
              backgroundColor: alpha(theme.palette.grey[100], 0.5)
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TimelineIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                  <Typography variant="caption" color="text.secondary">
                    正答率
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {material.accuracy}%
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <SchoolIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                  <Typography variant="caption" color="text.secondary">
                    学習回数
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {material.attemptCount}回
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  総学習時間
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatTime(material.totalTime)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  最終学習日
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatDate(material.lastAccessed)}
                </Typography>
              </Grid>
            </Grid>
            
            <Box mt={2} display="flex" gap={1}>
              <Button
                size="small"
                variant="contained"
                startIcon={<ArrowIcon />}
                sx={{ textTransform: 'none' }}
              >
                教材を開く
              </Button>
              {!isTop && (
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  sx={{ textTransform: 'none' }}
                >
                  復習する
                </Button>
              )}
            </Box>
          </Box>
        </Collapse>
      </>
    );
  };

  return (
    <Box>
      {/* トップ教材 */}
      <Box mb={3}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
          onClick={() => setExpandedTop(!expandedTop)}
          sx={{ cursor: 'pointer' }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <StarIcon sx={{ color: theme.palette.warning.main }} />
            <Typography variant="subtitle1" fontWeight="bold">
              得意な教材
            </Typography>
            <Chip
              size="small"
              label={`${topMaterials.length}件`}
              color="success"
              variant="filled"
            />
          </Box>
          <IconButton size="small">
            {expandedTop ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={expandedTop}>
          <List disablePadding>
            {topMaterials.map((material, index) => (
              <React.Fragment key={material.materialId}>
                <MaterialItem material={material} isTop={true} index={index} />
                {index < topMaterials.length - 1 && <Divider variant="inset" />}
              </React.Fragment>
            ))}
          </List>
        </Collapse>
      </Box>
      
      {/* ボトム教材 */}
      <Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
          onClick={() => setExpandedBottom(!expandedBottom)}
          sx={{ cursor: 'pointer' }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon sx={{ color: theme.palette.warning.main }} />
            <Typography variant="subtitle1" fontWeight="bold">
              苦手な教材
            </Typography>
            <Chip
              size="small"
              label={`${bottomMaterials.length}件`}
              color="warning"
              variant="filled"
            />
          </Box>
          <IconButton size="small">
            {expandedBottom ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={expandedBottom}>
          <List disablePadding>
            {bottomMaterials.map((material, index) => (
              <React.Fragment key={material.materialId}>
                <MaterialItem material={material} isTop={false} index={index} />
                {index < bottomMaterials.length - 1 && <Divider variant="inset" />}
              </React.Fragment>
            ))}
          </List>
        </Collapse>
      </Box>
      
      {/* アクションボタン */}
      <Box mt={3} display="flex" justifyContent="center">
        <Button
          variant="outlined"
          startIcon={<ArrowIcon />}
          sx={{ textTransform: 'none' }}
        >
          すべての教材を見る
        </Button>
      </Box>
    </Box>
  );
};

export default MaterialProgressList;