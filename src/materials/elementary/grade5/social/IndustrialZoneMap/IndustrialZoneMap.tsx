import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Button, Chip } from '@mui/material';
import { 
  Factory, 
  DirectionsCar, 
  Computer, 
  LocalShipping,
  Agriculture,
  Checkroom,
  Science,
  Build
} from '@mui/icons-material';
import { MaterialBase } from '@components/educational';
import { JapanMap } from './components/JapanMap';
import { IndustrialZoneDetail } from './components/IndustrialZoneDetail';
import { ProductionChart } from './components/ProductionChart';
import { QuizMode } from './components/QuizMode';
import { industrialZonesData } from './data/industrialZonesData';

export interface IndustrialZone {
  id: string;
  name: string;
  region: string;
  position: { x: number; y: number };
  cities: string[];
  mainProducts: string[];
  characteristics: string[];
  productionValue: number; // 兆円
  industries: {
    automobile?: number;
    machinery?: number;
    chemical?: number;
    steel?: number;
    electronics?: number;
    textile?: number;
    food?: number;
    shipbuilding?: number;
  };
}

const IndustrialZoneMap: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<IndustrialZone | null>(null);
  const [compareZones, setCompareZones] = useState<IndustrialZone[]>([]);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [highlightedZones, setHighlightedZones] = useState<string[]>([]);

  const handleZoneClick = (zoneId: string) => {
    const zone = industrialZonesData.find(z => z.id === zoneId);
    if (zone) {
      setSelectedZone(zone);
      setHighlightedZones([zoneId]);
    }
  };

  const handleCompareToggle = (zone: IndustrialZone) => {
    if (compareZones.find(z => z.id === zone.id)) {
      setCompareZones(compareZones.filter(z => z.id !== zone.id));
      setHighlightedZones(highlightedZones.filter(id => id !== zone.id));
    } else if (compareZones.length < 3) {
      setCompareZones([...compareZones, zone]);
      setHighlightedZones([...highlightedZones, zone.id]);
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    setIsQuizMode(false);
    console.log(`クイズ終了: ${score}/${total}`);
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case 'automobile': return <DirectionsCar />;
      case 'machinery': return <Build />;
      case 'chemical': return <Science />;
      case 'electronics': return <Computer />;
      case 'textile': return <Checkroom />;
      case 'food': return <Agriculture />;
      case 'shipbuilding': return <LocalShipping />;
      default: return <Factory />;
    }
  };

  const getTopIndustries = (zone: IndustrialZone) => {
    return Object.entries(zone.industries)
      .sort(([, a], [, b]) => (b || 0) - (a || 0))
      .slice(0, 3)
      .map(([industry]) => industry);
  };

  return (
    <MaterialBase
      title="日本の工業地帯マップ"
      description="日本の主要な工業地帯の位置と特徴を学ぼう"
    >
      {isQuizMode ? (
        <QuizMode
          zones={industrialZonesData}
          onComplete={handleQuizComplete}
          onExit={() => setIsQuizMode(false)}
        />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">日本の工業地帯</Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => setIsQuizMode(true)}
                >
                  クイズに挑戦
                </Button>
              </Box>
              
              <JapanMap
                zones={industrialZonesData}
                selectedZone={selectedZone}
                highlightedZones={highlightedZones}
                onZoneClick={handleZoneClick}
              />

              {compareZones.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    生産額の比較
                  </Typography>
                  <ProductionChart zones={compareZones} />
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            {selectedZone ? (
              <IndustrialZoneDetail
                zone={selectedZone}
                onCompareToggle={handleCompareToggle}
                isComparing={compareZones.some(z => z.id === selectedZone.id)}
              />
            ) : (
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  工業地帯を選択してください
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  地図上の工業地帯をクリックすると、詳しい情報が表示されます。
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    主な工業地帯：
                  </Typography>
                  <Stack spacing={1}>
                    {industrialZonesData.map((zone) => (
                      <Paper
                        key={zone.id}
                        elevation={1}
                        sx={{ 
                          p: 1.5, 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => handleZoneClick(zone.id)}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {zone.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {getTopIndustries(zone).map((industry) => (
                            <Chip
                              key={industry}
                              icon={getIndustryIcon(industry)}
                              label={industry === 'automobile' ? '自動車' :
                                     industry === 'machinery' ? '機械' :
                                     industry === 'chemical' ? '化学' :
                                     industry === 'electronics' ? '電子' :
                                     industry === 'textile' ? '繊維' :
                                     industry === 'food' ? '食品' :
                                     industry === 'shipbuilding' ? '造船' : industry}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
    </MaterialBase>
  );
};

export default IndustrialZoneMap;