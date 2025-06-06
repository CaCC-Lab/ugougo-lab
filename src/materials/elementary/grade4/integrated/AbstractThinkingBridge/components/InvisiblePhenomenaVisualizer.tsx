import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
  Slider,
  Grid,
  Paper,
  Button,
  Alert,
  Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Stage, Layer, Circle, Line, Rect, Text as KonvaText, Arrow } from 'react-konva';
import { 
  Bolt, 
  Science,
  Lightbulb,
  Battery3Bar,
  PowerOff
} from '@mui/icons-material';
import type { ModuleComponentProps, ElectricCircuit, MagneticField, CircuitComponent } from '../types';

const ElectricityVisualization: React.FC<{ 
  circuit: ElectricCircuit;
  isOn: boolean;
  currentSpeed: number;
}> = ({ circuit, isOn, currentSpeed }) => {
  const [electronPositions, setElectronPositions] = useState<{ x: number; y: number }[]>([]);
  
  useEffect(() => {
    if (!isOn) {
      setElectronPositions([]);
      return;
    }

    // 電子の初期位置を設定
    const positions = Array.from({ length: 8 }, (_, i) => ({
      x: 100 + i * 50,
      y: 100
    }));
    setElectronPositions(positions);

    // 電子の移動アニメーション
    const interval = setInterval(() => {
      setElectronPositions(prev => 
        prev.map(pos => {
          let newX = pos.x + currentSpeed * 2;
          let newY = pos.y;
          
          // 回路に沿って移動
          if (pos.y === 100 && newX > 300) {
            newX = 300;
            newY = pos.y + currentSpeed * 2;
          } else if (pos.x === 300 && newY > 200) {
            newY = 200;
            newX = pos.x - currentSpeed * 2;
          } else if (pos.y === 200 && newX < 100) {
            newX = 100;
            newY = pos.y - currentSpeed * 2;
          } else if (pos.x === 100 && newY < 100) {
            newY = 100;
            newX = 100;
          }
          
          return { x: newX, y: newY };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [isOn, currentSpeed]);

  return (
    <Stage width={400} height={300}>
      <Layer>
        {/* 回路の配線 */}
        <Line
          points={[100, 100, 300, 100, 300, 200, 100, 200, 100, 100]}
          stroke={isOn ? '#FFC107' : '#9E9E9E'}
          strokeWidth={4}
        />
        
        {/* バッテリー */}
        <Rect
          x={90}
          y={140}
          width={20}
          height={40}
          fill="#F44336"
          stroke="#D32F2F"
          strokeWidth={2}
        />
        <KonvaText
          x={95}
          y={155}
          text="+"
          fontSize={16}
          fill="white"
        />
        <KonvaText
          x={95}
          y={165}
          text="-"
          fontSize={16}
          fill="white"
        />
        
        {/* 電球 */}
        <Circle
          x={200}
          y={100}
          radius={25}
          fill={isOn ? '#FFEB3B' : '#E0E0E0'}
          stroke="#F57F17"
          strokeWidth={2}
        />
        {isOn && (
          <>
            {/* 光の放射 */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
              <Line
                key={angle}
                points={[
                  200 + Math.cos(angle * Math.PI / 180) * 30,
                  100 + Math.sin(angle * Math.PI / 180) * 30,
                  200 + Math.cos(angle * Math.PI / 180) * 40,
                  100 + Math.sin(angle * Math.PI / 180) * 40
                ]}
                stroke="#FFEB3B"
                strokeWidth={2}
                opacity={0.6}
              />
            ))}
          </>
        )}
        
        {/* スイッチ */}
        <Line
          points={isOn ? [290, 140, 290, 160] : [290, 140, 280, 155]}
          stroke="#424242"
          strokeWidth={6}
          lineCap="round"
        />
        
        {/* 電子の流れ */}
        <AnimatePresence>
          {isOn && electronPositions.map((pos, index) => (
            <motion.circle
              key={index}
              x={pos.x}
              y={pos.y}
              r={5}
              fill="#2196F3"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            />
          ))}
        </AnimatePresence>
        
        {/* ラベル */}
        <KonvaText
          x={180}
          y={130}
          text="電球"
          fontSize={12}
        />
        <KonvaText
          x={60}
          y={185}
          text="電池"
          fontSize={12}
        />
        <KonvaText
          x={260}
          y={170}
          text="スイッチ"
          fontSize={12}
        />
        
        {/* 電流の向き */}
        {isOn && (
          <Arrow
            x={150}
            y={90}
            points={[0, 0, 30, 0]}
            pointerLength={10}
            pointerWidth={10}
            fill="#F44336"
            stroke="#F44336"
          />
        )}
      </Layer>
    </Stage>
  );
};

const MagnetismVisualization: React.FC<{
  magnetStrength: number;
  showFieldLines: boolean;
}> = ({ magnetStrength, showFieldLines }) => {
  const generateFieldLines = () => {
    const lines = [];
    const centerX = 200;
    const centerY = 150;
    
    // 磁力線を生成
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45) * Math.PI / 180;
      const startRadius = 30;
      const endRadius = 100 + magnetStrength * 20;
      
      const points = [];
      for (let r = startRadius; r <= endRadius; r += 5) {
        const curve = Math.sin((r - startRadius) / 30) * 20;
        const x = centerX + Math.cos(angle) * r + Math.sin(angle) * curve;
        const y = centerY + Math.sin(angle) * r - Math.cos(angle) * curve;
        points.push(x, y);
      }
      
      lines.push(points);
    }
    
    return lines;
  };

  return (
    <Stage width={400} height={300}>
      <Layer>
        {/* 磁石 */}
        <Rect
          x={150}
          y={120}
          width={100}
          height={60}
          fill="url(#magnetGradient)"
          stroke="#424242"
          strokeWidth={2}
          cornerRadius={5}
        />
        
        {/* N極 */}
        <Rect
          x={150}
          y={120}
          width={50}
          height={60}
          fill="#F44336"
          cornerRadius={[5, 0, 0, 5]}
        />
        <KonvaText
          x={165}
          y={140}
          text="N"
          fontSize={24}
          fill="white"
          fontStyle="bold"
        />
        
        {/* S極 */}
        <Rect
          x={200}
          y={120}
          width={50}
          height={60}
          fill="#2196F3"
          cornerRadius={[0, 5, 5, 0]}
        />
        <KonvaText
          x={215}
          y={140}
          text="S"
          fontSize={24}
          fill="white"
          fontStyle="bold"
        />
        
        {/* 磁力線 */}
        {showFieldLines && generateFieldLines().map((points, index) => (
          <Line
            key={index}
            points={points}
            stroke="#9C27B0"
            strokeWidth={2}
            opacity={0.6}
            tension={0.5}
          />
        ))}
        
        {/* 鉄粉 */}
        {showFieldLines && Array.from({ length: 50 }, (_, i) => {
          const angle = Math.random() * Math.PI * 2;
          const distance = 40 + Math.random() * 80;
          const x = 200 + Math.cos(angle) * distance;
          const y = 150 + Math.sin(angle) * distance;
          const rotation = angle * 180 / Math.PI;
          
          return (
            <Rect
              key={i}
              x={x - 5}
              y={y - 1}
              width={10}
              height={2}
              fill="#616161"
              rotation={rotation}
              offsetX={5}
              offsetY={1}
            />
          );
        })}
        
        {/* 説明テキスト */}
        <KonvaText
          x={50}
          y={250}
          text={showFieldLines ? "磁力線が見えるよ！" : "磁石の周りには見えない力があるよ"}
          fontSize={16}
          fill="#666"
        />
      </Layer>
    </Stage>
  );
};

export const InvisiblePhenomenaVisualizer: React.FC<ModuleComponentProps> = ({ onConceptMastered, progress }) => {
  const [phenomenon, setPhenomenon] = useState<'electricity' | 'magnetism'>('electricity');
  const [isCircuitOn, setIsCircuitOn] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(5);
  const [magnetStrength, setMagnetStrength] = useState(3);
  const [showMagneticField, setShowMagneticField] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  const circuit: ElectricCircuit = {
    components: [
      { id: 'battery', type: 'battery', position: { x: 100, y: 160 }, properties: { voltage: 1.5 } },
      { id: 'bulb', type: 'bulb', position: { x: 200, y: 100 }, properties: {} },
      { id: 'switch', type: 'switch', position: { x: 290, y: 150 }, properties: { isOn: isCircuitOn } }
    ],
    connections: [],
    current: isCircuitOn ? currentSpeed : 0,
    voltage: 1.5
  };

  const handlePhenomenonChange = (_event: React.MouseEvent<HTMLElement>, newPhenomenon: 'electricity' | 'magnetism' | null) => {
    if (newPhenomenon !== null) {
      setPhenomenon(newPhenomenon);
      setShowExplanation(true);
    }
  };

  const handleConceptCheck = () => {
    onConceptMastered(`${phenomenon}-visualization`);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* 現象選択 */}
        <Grid item xs={12}>
          <ToggleButtonGroup
            value={phenomenon}
            exclusive
            onChange={handlePhenomenonChange}
            fullWidth
          >
            <ToggleButton value="electricity">
              <Bolt sx={{ mr: 1 }} />
              電気の流れ
            </ToggleButton>
            <ToggleButton value="magnetism">
              <Science sx={{ mr: 1 }} />
              磁石の力
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        {/* コントロールパネル */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {phenomenon === 'electricity' ? '電気回路の実験' : '磁石の実験'}
              </Typography>

              {phenomenon === 'electricity' ? (
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isCircuitOn}
                        onChange={(e) => setIsCircuitOn(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isCircuitOn ? <Lightbulb color="warning" /> : <PowerOff />}
                        スイッチ
                      </Box>
                    }
                    sx={{ mb: 3 }}
                  />

                  <Typography gutterBottom>
                    電流の速さ: {currentSpeed}
                  </Typography>
                  <Slider
                    value={currentSpeed}
                    onChange={(_, value) => setCurrentSpeed(value as number)}
                    min={1}
                    max={10}
                    marks
                    valueLabelDisplay="auto"
                    disabled={!isCircuitOn}
                    sx={{ mb: 3 }}
                  />

                  <Alert severity="info" icon={<Battery3Bar />}>
                    <Typography variant="body2">
                      電池から出た電気（電子）が、導線を通って電球を光らせます。
                      青い点が電子の流れを表しています。
                    </Typography>
                  </Alert>
                </Box>
              ) : (
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showMagneticField}
                        onChange={(e) => setShowMagneticField(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="磁力線を表示"
                    sx={{ mb: 3 }}
                  />

                  <Typography gutterBottom>
                    磁力の強さ: {magnetStrength}
                  </Typography>
                  <Slider
                    value={magnetStrength}
                    onChange={(_, value) => setMagnetStrength(value as number)}
                    min={1}
                    max={5}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ mb: 3 }}
                  />

                  <Alert severity="info">
                    <Typography variant="body2">
                      磁石の周りには目に見えない磁力線があります。
                      鉄粉を使うと、その形が見えるようになります。
                    </Typography>
                  </Alert>
                </Box>
              )}

              <Button
                variant="contained"
                color="secondary"
                onClick={handleConceptCheck}
                fullWidth
                sx={{ mt: 2 }}
                startIcon={progress[`${phenomenon}-visualization`] && '✓'}
              >
                理解できた！
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* ビジュアライゼーション */}
        <Grid item xs={12} md={6}>
          <motion.div
            key={phenomenon}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  実験の様子
                </Typography>
                
                {phenomenon === 'electricity' ? (
                  <ElectricityVisualization
                    circuit={circuit}
                    isOn={isCircuitOn}
                    currentSpeed={currentSpeed}
                  />
                ) : (
                  <MagnetismVisualization
                    magnetStrength={magnetStrength}
                    showFieldLines={showMagneticField}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* 説明セクション */}
        {showExplanation && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                どうして見えないの？
              </Typography>
              
              {phenomenon === 'electricity' ? (
                <Box>
                  <Typography paragraph>
                    電気は電子という、とても小さな粒子の流れです。
                    電子は原子よりも小さいので、目で見ることはできません。
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip label="電子は10⁻¹⁵メートル" color="primary" />
                    <Chip label="髪の毛の1億分の1" color="secondary" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    でも、電球が光ったり、モーターが回ったりすることで、
                    電気が流れていることがわかります。
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography paragraph>
                    磁力は空間を通じて働く力で、物質ではありません。
                    重力と同じように、目には見えませんが確かに存在します。
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip label="磁界" color="primary" />
                    <Chip label="遠隔作用" color="secondary" />
                    <Chip label="力の場" color="success" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    コンパスが北を指したり、磁石同士が引き合ったり反発したりすることで、
                    磁力の存在を確認できます。
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};