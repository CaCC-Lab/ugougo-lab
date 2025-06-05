import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Stack, 
  Button,
  Divider,
  LinearProgress
} from '@mui/material';
import { 
  LocationCity, 
  Factory, 
  TrendingUp,
  CompareArrows
} from '@mui/icons-material';
import { IndustrialZone } from '../IndustrialZoneMap';

interface IndustrialZoneDetailProps {
  zone: IndustrialZone;
  onCompareToggle: (zone: IndustrialZone) => void;
  isComparing: boolean;
}

export const IndustrialZoneDetail: React.FC<IndustrialZoneDetailProps> = ({
  zone,
  onCompareToggle,
  isComparing
}) => {
  const getIndustryLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      automobile: '自動車',
      machinery: '機械',
      chemical: '化学',
      steel: '鉄鋼',
      electronics: '電子機器',
      textile: '繊維',
      food: '食品',
      shipbuilding: '造船'
    };
    return labels[key] || key;
  };

  const getProductEmoji = (product: string): string => {
    const emojis: { [key: string]: string } = {
      '自動車': '🚗',
      '電子機器': '💻',
      '機械': '⚙️',
      '化学製品': '🧪',
      '鉄鋼': '🏗️',
      '繊維': '🧵',
      '食品': '🍱',
      '造船': '🚢',
      '航空機': '✈️',
      '陶磁器': '🏺',
      '石油化学': '🛢️',
      '楽器': '🎹',
      'オートバイ': '🏍️',
      '製紙': '📜',
      '医薬品': '💊',
      '眼鏡': '👓'
    };
    return emojis[product] || '🏭';
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {zone.name}
        </Typography>
        <Button
          variant={isComparing ? 'contained' : 'outlined'}
          size="small"
          startIcon={<CompareArrows />}
          onClick={() => onCompareToggle(zone)}
        >
          {isComparing ? '比較中' : '比較する'}
        </Button>
      </Box>

      <Stack spacing={2}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationCity sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">
              主要都市
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {zone.cities.map(city => (
              <Chip 
                key={city} 
                label={city} 
                size="small" 
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        <Divider />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Factory sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">
              主な生産品
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {zone.mainProducts.map(product => (
              <Chip 
                key={product} 
                label={`${getProductEmoji(product)} ${product}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        <Divider />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUp sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">
              生産額: {zone.productionValue}兆円
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary" gutterBottom>
            産業別構成
          </Typography>
          {Object.entries(zone.industries).map(([industry, percentage]) => (
            <Box key={industry} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">
                  {getIndustryLabel(industry)}
                </Typography>
                <Typography variant="caption">
                  {percentage}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={percentage || 0} 
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>
          ))}
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            特徴
          </Typography>
          <Stack spacing={1}>
            {zone.characteristics.map((characteristic, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  •
                </Typography>
                <Typography variant="body2">
                  {characteristic}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};