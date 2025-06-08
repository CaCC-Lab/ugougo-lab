// 世界地図コンポーネント
import React from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { City } from '../data/cityData';

interface WorldMapProps {
  cities: City[];
  selectedBaseCity: City | null;
  selectedTargetCity: City | null;
  onCityClick: (city: City) => void;
}

const MapContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 800,
  height: 400,
  margin: '0 auto',
  padding: theme.spacing(2),
  backgroundColor: '#e3f2fd',
  overflow: 'hidden'
}));

const WorldMapSvg = styled('svg')({
  width: '100%',
  height: '100%',
  cursor: 'pointer'
});

const CityMarker = styled('g')<{ 
  selected: boolean; 
  isBase: boolean;
  isTarget: boolean;
}>(({ theme, selected, isBase, isTarget }) => ({
  cursor: 'pointer',
  '& circle': {
    fill: isBase ? '#ff5722' : isTarget ? '#4caf50' : selected ? '#2196f3' : '#666',
    stroke: '#fff',
    strokeWidth: 2,
    transition: 'all 0.3s ease'
  },
  '& text': {
    fill: '#333',
    fontSize: '12px',
    fontWeight: selected ? 'bold' : 'normal',
    pointerEvents: 'none',
    userSelect: 'none'
  },
  '&:hover circle': {
    transform: 'scale(1.2)',
    transformOrigin: 'center'
  }
}));

const DateLine = styled('line')(({ theme }) => ({
  stroke: '#f44336',
  strokeWidth: 2,
  strokeDasharray: '5,5',
  opacity: 0.7
}));

export const WorldMap: React.FC<WorldMapProps> = ({
  cities,
  selectedBaseCity,
  selectedTargetCity,
  onCityClick
}) => {
  return (
    <MapContainer elevation={3}>
      <Typography variant="h6" gutterBottom align="center">
        世界地図 - 都市をクリックして選択
      </Typography>
      
      <WorldMapSvg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* 簡略化された世界地図の背景 */}
        <rect x="0" y="0" width="100" height="100" fill="#87ceeb" opacity="0.3" />
        
        {/* 大陸の簡略表現 */}
        {/* アジア */}
        <ellipse cx="75" cy="35" rx="15" ry="20" fill="#f5deb3" opacity="0.6" />
        {/* ヨーロッパ */}
        <ellipse cx="50" cy="25" rx="8" ry="10" fill="#f5deb3" opacity="0.6" />
        {/* アフリカ */}
        <ellipse cx="52" cy="50" rx="10" ry="15" fill="#f5deb3" opacity="0.6" />
        {/* 北アメリカ */}
        <ellipse cx="25" cy="30" rx="12" ry="15" fill="#f5deb3" opacity="0.6" />
        {/* 南アメリカ */}
        <ellipse cx="35" cy="60" rx="8" ry="12" fill="#f5deb3" opacity="0.6" />
        {/* オーストラリア */}
        <ellipse cx="85" cy="70" rx="8" ry="6" fill="#f5deb3" opacity="0.6" />
        
        {/* 日付変更線（太平洋上、経度180度付近） */}
        <DateLine x1="92" y1="0" x2="92" y2="100" />
        <text x="94" y="10" fontSize="10" fill="#f44336">
          日付変更線
        </text>
        
        {/* 都市マーカー */}
        {cities.map((city) => {
          const isBase = selectedBaseCity?.id === city.id;
          const isTarget = selectedTargetCity?.id === city.id;
          const isSelected = isBase || isTarget;
          
          return (
            <Tooltip
              key={city.id}
              title={
                <Box>
                  <Typography variant="body2">
                    {city.nameJa}（{city.name}）
                  </Typography>
                  <Typography variant="caption">
                    {city.countryJa} UTC{city.timezone >= 0 ? '+' : ''}{city.timezone}
                  </Typography>
                </Box>
              }
              arrow
            >
              <CityMarker
                selected={isSelected}
                isBase={isBase}
                isTarget={isTarget}
                onClick={() => onCityClick(city)}
              >
                <circle
                  cx={city.mapX}
                  cy={city.mapY}
                  r={isSelected ? 4 : 3}
                />
                <text
                  x={city.mapX}
                  y={city.mapY - 6}
                  textAnchor="middle"
                >
                  {city.nameJa}
                </text>
              </CityMarker>
            </Tooltip>
          );
        })}
        
        {/* 凡例 */}
        <g transform="translate(5, 85)">
          <circle cx="0" cy="0" r="3" fill="#ff5722" />
          <text x="8" y="3" fontSize="10">基準都市</text>
          
          <circle cx="0" cy="10" r="3" fill="#4caf50" />
          <text x="8" y="13" fontSize="10">比較都市</text>
        </g>
      </WorldMapSvg>
      
      {selectedBaseCity && selectedTargetCity && (
        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          時差: {Math.abs(selectedTargetCity.timezone - selectedBaseCity.timezone)}時間
          （{selectedTargetCity.nameJa}は{selectedBaseCity.nameJa}より
          {selectedTargetCity.timezone > selectedBaseCity.timezone ? '進んで' : '遅れて'}います）
        </Typography>
      )}
    </MapContainer>
  );
};