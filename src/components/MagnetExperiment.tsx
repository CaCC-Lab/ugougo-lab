import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  Container,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import GrainIcon from '@mui/icons-material/Grain';
import ExploreIcon from '@mui/icons-material/Explore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// 実験エリアのスタイル
const ExperimentArea = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '500px',
  backgroundColor: '#f5f5f5',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
  [theme.breakpoints.down('sm')]: {
    height: '400px',
  },
}));

// 磁石のスタイル
const Magnet = styled(Box)<{ isDragging?: boolean }>(({ isDragging }) => ({
  position: 'absolute',
  cursor: isDragging ? 'grabbing' : 'grab',
  userSelect: 'none',
  transition: isDragging ? 'none' : 'transform 0.3s ease',
  zIndex: isDragging ? 1000 : 100,
}));

// 物体のスタイル
const MaterialObject = styled(Box)(({ theme }) => ({
  position: 'absolute',
  cursor: 'pointer',
  userSelect: 'none',
  borderRadius: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '0.8rem',
  transition: 'transform 0.3s ease',
}));

// コンパスの針のスタイル
const CompassNeedle = styled(Box)<{ rotation: number }>(({ rotation }) => ({
  position: 'absolute',
  width: '4px',
  height: '40px',
  backgroundColor: '#333',
  transformOrigin: 'center bottom',
  transform: `rotate(${rotation}deg)`,
  transition: 'transform 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: '16px solid #ff0000',
  },
}));

interface MagnetData {
  id: string;
  type: 'bar' | 'horseshoe';
  x: number;
  y: number;
  rotation: number;
}

interface MaterialData {
  id: string;
  type: 'iron' | 'aluminum' | 'plastic';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MagnetExperimentProps {
  onClose?: () => void;
}

const MagnetExperiment: React.FC<MagnetExperimentProps> = ({ onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const experimentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  
  const [magnets, setMagnets] = useState<MagnetData[]>([
    { id: 'magnet1', type: 'bar', x: 100, y: 200, rotation: 0 },
    { id: 'magnet2', type: 'horseshoe', x: 500, y: 200, rotation: 0 },
  ]);
  
  const [materials, setMaterials] = useState<MaterialData[]>([
    { id: 'iron1', type: 'iron', x: 300, y: 100, width: 60, height: 40 },
    { id: 'aluminum1', type: 'aluminum', x: 300, y: 200, width: 60, height: 40 },
    { id: 'plastic1', type: 'plastic', x: 300, y: 300, width: 60, height: 40 },
  ]);
  
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showIronFilings, setShowIronFilings] = useState(false);
  const [showCompass, setShowCompass] = useState(false);
  const [compassPosition, setCompassPosition] = useState({ x: 400, y: 350 });
  
  // 磁力の計算（簡易版）
  const calculateMagneticForce = (magnetX: number, magnetY: number, objectX: number, objectY: number) => {
    const dx = objectX - magnetX;
    const dy = objectY - magnetY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 150; // 磁力の影響範囲
    
    if (distance > maxDistance) return { fx: 0, fy: 0, strength: 0 };
    
    const strength = 1 - (distance / maxDistance);
    const force = strength * strength * 50; // 磁力の強さ
    
    return {
      fx: -(dx / distance) * force,
      fy: -(dy / distance) * force,
      strength,
    };
  };
  
  // 物体への磁力の影響を計算
  useEffect(() => {
    if (draggedItem) return;
    
    const updateMaterialPositions = () => {
      setMaterials(prevMaterials => 
        prevMaterials.map(material => {
          if (material.type !== 'iron') return material;
          
          let totalFx = 0;
          let totalFy = 0;
          
          // 各磁石からの力を計算
          magnets.forEach(magnet => {
            const magnetCenterX = magnet.x + (magnet.type === 'bar' ? 60 : 50);
            const magnetCenterY = magnet.y + (magnet.type === 'bar' ? 10 : 30);
            const { fx, fy } = calculateMagneticForce(
              magnetCenterX,
              magnetCenterY,
              material.x + material.width / 2,
              material.y + material.height / 2
            );
            totalFx += fx;
            totalFy += fy;
          });
          
          // 力に基づいて位置を更新（境界チェック付き）
          const newX = Math.max(0, Math.min(material.x + totalFx * 0.1, 700 - material.width));
          const newY = Math.max(0, Math.min(material.y + totalFy * 0.1, 450 - material.height));
          
          return {
            ...material,
            x: newX,
            y: newY,
          };
        })
      );
    };
    
    const animate = () => {
      updateMaterialPositions();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [magnets, draggedItem]);
  
  // ドラッグ処理
  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setDraggedItem(itemId);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedItem || !experimentRef.current) return;
    
    const rect = experimentRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (draggedItem.startsWith('magnet')) {
      setMagnets(prev =>
        prev.map(magnet =>
          magnet.id === draggedItem
            ? { ...magnet, x: x - 60, y: y - 20 }
            : magnet
        )
      );
    } else if (draggedItem === 'compass') {
      setCompassPosition({ x: x - 30, y: y - 30 });
    }
  };
  
  const handleMouseUp = () => {
    setDraggedItem(null);
  };
  
  // 磁石の極性に基づく反発・引力の計算
  const calculateMagnetInteraction = () => {
    if (magnets.length < 2) return;
    
    const [mag1, mag2] = magnets;
    const dx = mag2.x - mag1.x;
    const dy = mag2.y - mag1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 100 && distance > 20) {
      // 簡易的な反発効果
      const force = (100 - distance) * 0.5;
      setMagnets(prev => [
        prev[0],
        {
          ...prev[1],
          x: prev[1].x + (dx / distance) * force,
          y: prev[1].y + (dy / distance) * force,
        },
      ]);
    }
  };
  
  // コンパスの針の向きを計算
  const getCompassRotation = () => {
    let totalX = 0;
    let totalY = 0;
    
    magnets.forEach(magnet => {
      const magnetCenterX = magnet.x + (magnet.type === 'bar' ? 60 : 50);
      const magnetCenterY = magnet.y + (magnet.type === 'bar' ? 10 : 30);
      const dx = magnetCenterX - compassPosition.x;
      const dy = magnetCenterY - compassPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 200) {
        const strength = 1 - (distance / 200);
        totalX += (dx / distance) * strength;
        totalY += (dy / distance) * strength;
      }
    });
    
    return Math.atan2(totalY, totalX) * (180 / Math.PI) + 90;
  };
  
  // リセット機能
  const handleReset = () => {
    setMagnets([
      { id: 'magnet1', type: 'bar', x: 100, y: 200, rotation: 0 },
      { id: 'magnet2', type: 'horseshoe', x: 500, y: 200, rotation: 0 },
    ]);
    setMaterials([
      { id: 'iron1', type: 'iron', x: 300, y: 100, width: 60, height: 40 },
      { id: 'aluminum1', type: 'aluminum', x: 300, y: 200, width: 60, height: 40 },
      { id: 'plastic1', type: 'plastic', x: 300, y: 300, width: 60, height: 40 },
    ]);
    setCompassPosition({ x: 400, y: 350 });
  };
  
  // 棒磁石の描画
  const renderBarMagnet = (magnet: MagnetData) => (
    <Magnet
      key={magnet.id}
      isDragging={draggedItem === magnet.id}
      style={{ left: magnet.x, top: magnet.y }}
      onMouseDown={(e) => handleMouseDown(e, magnet.id)}
    >
      <svg width="120" height="40" viewBox="0 0 120 40">
        <rect x="0" y="0" width="60" height="40" fill="#ff4444" rx="5" />
        <rect x="60" y="0" width="60" height="40" fill="#4444ff" rx="5" />
        <text x="25" y="25" fill="white" fontSize="20" fontWeight="bold" textAnchor="middle">N</text>
        <text x="95" y="25" fill="white" fontSize="20" fontWeight="bold" textAnchor="middle">S</text>
      </svg>
    </Magnet>
  );
  
  // U字磁石の描画
  const renderHorseshoeMagnet = (magnet: MagnetData) => (
    <Magnet
      key={magnet.id}
      isDragging={draggedItem === magnet.id}
      style={{ left: magnet.x, top: magnet.y }}
      onMouseDown={(e) => handleMouseDown(e, magnet.id)}
    >
      <svg width="100" height="80" viewBox="0 0 100 80">
        <path
          d="M 20 10 L 20 50 Q 20 70 40 70 L 60 70 Q 80 70 80 50 L 80 10"
          fill="none"
          stroke="#666"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <rect x="10" y="0" width="20" height="20" fill="#ff4444" rx="5" />
        <rect x="70" y="0" width="20" height="20" fill="#4444ff" rx="5" />
        <text x="20" y="15" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">N</text>
        <text x="80" y="15" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">S</text>
      </svg>
    </Magnet>
  );
  
  // 磁力線の描画（砂鉄モード）
  const renderMagneticFieldLines = () => {
    if (!showIronFilings) return null;
    
    const lines = [];
    const gridSize = 30;
    
    for (let x = 0; x < 800; x += gridSize) {
      for (let y = 0; y < 500; y += gridSize) {
        let fieldX = 0;
        let fieldY = 0;
        
        magnets.forEach(magnet => {
          const magnetCenterX = magnet.x + (magnet.type === 'bar' ? 60 : 50);
          const magnetCenterY = magnet.y + (magnet.type === 'bar' ? 10 : 30);
          const { fx, fy, strength } = calculateMagneticForce(magnetCenterX, magnetCenterY, x, y);
          
          if (strength > 0.1) {
            fieldX += fx;
            fieldY += fy;
          }
        });
        
        const magnitude = Math.sqrt(fieldX * fieldX + fieldY * fieldY);
        if (magnitude > 5) {
          const angle = Math.atan2(fieldY, fieldX) * (180 / Math.PI);
          lines.push(
            <Box
              key={`line-${x}-${y}`}
              sx={{
                position: 'absolute',
                left: x - 10,
                top: y - 1,
                width: '20px',
                height: '2px',
                backgroundColor: '#666',
                opacity: Math.min(magnitude / 50, 0.8),
                transform: `rotate(${angle}deg)`,
                transformOrigin: 'center',
              }}
            />
          );
        }
      }
    }
    
    return <>{lines}</>;
  };
  
  return (
    <Container maxWidth="lg">
      <Card sx={{ backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ExploreIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              磁石の実験シミュレーター
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              磁石をドラッグして動かして、磁力の働きを観察しよう！
            </Typography>
          </Box>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={8}>
              <ButtonGroup variant="outlined" size={isMobile ? 'small' : 'medium'}>
                <Button
                  startIcon={<GrainIcon />}
                  onClick={() => setShowIronFilings(!showIronFilings)}
                  variant={showIronFilings ? 'contained' : 'outlined'}
                >
                  砂鉄モード
                </Button>
                <Button
                  startIcon={<ExploreIcon />}
                  onClick={() => setShowCompass(!showCompass)}
                  variant={showCompass ? 'contained' : 'outlined'}
                >
                  コンパス
                </Button>
                <Button
                  startIcon={<RestartAltIcon />}
                  onClick={handleReset}
                >
                  リセット
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
              <Tooltip title="磁石をドラッグして動かせます。鉄は磁石に引き寄せられます。">
                <IconButton size="small">
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          
          <ExperimentArea
            ref={experimentRef}
            elevation={3}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* 磁力線（砂鉄） */}
            {renderMagneticFieldLines()}
            
            {/* 磁石 */}
            {magnets.map(magnet =>
              magnet.type === 'bar' ? renderBarMagnet(magnet) : renderHorseshoeMagnet(magnet)
            )}
            
            {/* 物体 */}
            {materials.map(material => (
              <MaterialObject
                key={material.id}
                sx={{
                  left: material.x,
                  top: material.y,
                  width: material.width,
                  height: material.height,
                  backgroundColor:
                    material.type === 'iron' ? '#9e9e9e' :
                    material.type === 'aluminum' ? '#e0e0e0' :
                    '#fff3e0',
                  border: '2px solid',
                  borderColor:
                    material.type === 'iron' ? '#616161' :
                    material.type === 'aluminum' ? '#bdbdbd' :
                    '#ffb74d',
                }}
              >
                {material.type === 'iron' ? '鉄' :
                 material.type === 'aluminum' ? 'アルミ' :
                 'プラスチック'}
              </MaterialObject>
            ))}
            
            {/* コンパス */}
            {showCompass && (
              <Box
                sx={{
                  position: 'absolute',
                  left: compassPosition.x - 30,
                  top: compassPosition.y - 30,
                  width: 60,
                  height: 60,
                  cursor: draggedItem === 'compass' ? 'grabbing' : 'grab',
                }}
                onMouseDown={(e) => handleMouseDown(e, 'compass')}
              >
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="28" fill="white" stroke="#333" strokeWidth="2" />
                  <circle cx="30" cy="30" r="3" fill="#333" />
                </svg>
                <CompassNeedle
                  rotation={getCompassRotation()}
                  sx={{
                    left: '28px',
                    bottom: '10px',
                  }}
                />
              </Box>
            )}
          </ExperimentArea>
          
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              実験のポイント
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 磁石のN極（赤）とS極（青）は、異なる極同士は引き合い、同じ極同士は反発します
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 鉄は磁石に引き寄せられますが、アルミニウムやプラスチックは引き寄せられません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 砂鉄モードで磁力線の様子を観察できます
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • コンパスの針は磁石の方向を指します
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MagnetExperiment;