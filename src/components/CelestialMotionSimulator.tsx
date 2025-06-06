import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Slider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface CelestialMotionSimulatorProps {
  onClose?: () => void;
}

const CelestialMotionSimulator: React.FC<CelestialMotionSimulatorProps> = ({ onClose }) => {
  const theme = useTheme();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number | null>(null);
  
  // 天体オブジェクト
  const sunRef = useRef<THREE.Mesh | null>(null);
  const earthRef = useRef<THREE.Group | null>(null);
  const moonRef = useRef<THREE.Mesh | null>(null);
  const earthOrbitRef = useRef<THREE.Line | null>(null);
  const moonOrbitRef = useRef<THREE.Line | null>(null);
  
  // 状態
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeSpeed, setTimeSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'space' | 'earth'>('space');
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [observationPoint, setObservationPoint] = useState<'tokyo' | 'equator' | 'pole'>('tokyo');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [moonPhase, setMoonPhase] = useState<string>('新月');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  
  // 時間経過による角度
  const [earthRotation, setEarthRotation] = useState<number>(0);
  const [earthOrbitAngle, setEarthOrbitAngle] = useState<number>(0);
  const [moonOrbitAngle, setMoonOrbitAngle] = useState<number>(0);
  
  // 定数
  const EARTH_ORBIT_RADIUS = 30;
  const MOON_ORBIT_RADIUS = 8;
  const EARTH_TILT = 23.5 * Math.PI / 180;
  const EARTH_ROTATION_SPEED = 0.1;
  const EARTH_ORBIT_SPEED = 0.001;
  const MOON_ORBIT_SPEED = 0.013;
  
  // Three.jsの初期化
  useEffect(() => {
    if (!mountRef.current) return;
    
    // シーン
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000020);
    sceneRef.current = scene;
    
    // カメラ
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(50, 30, 50);
    cameraRef.current = camera;
    
    // レンダラー
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // コントロール
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;
    
    // ライト
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const sunLight = new THREE.PointLight(0xffffff, 2, 100);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);
    
    // 太陽
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    sunRef.current = sun;
    
    // 地球グループ（地球と地軸）
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    earthRef.current = earthGroup;
    
    // 地球
    const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2233ff,
      emissive: 0x112244,
      shininess: 10,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.castShadow = true;
    earth.receiveShadow = true;
    earthGroup.add(earth);
    
    // 地軸
    const axisGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6);
    const axisMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const axis = new THREE.Mesh(axisGeometry, axisMaterial);
    earthGroup.add(axis);
    
    // 地球を傾ける
    earthGroup.rotation.z = EARTH_TILT;
    
    // 月
    const moonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const moonMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xcccccc,
      emissive: 0x222222,
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.castShadow = true;
    moon.receiveShadow = true;
    scene.add(moon);
    moonRef.current = moon;
    
    // 軌道線
    const earthOrbitCurve = new THREE.EllipseCurve(
      0, 0,
      EARTH_ORBIT_RADIUS, EARTH_ORBIT_RADIUS,
      0, 2 * Math.PI,
      false,
      0
    );
    const earthOrbitPoints = earthOrbitCurve.getPoints(100);
    const earthOrbitGeometry = new THREE.BufferGeometry().setFromPoints(
      earthOrbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
    );
    const earthOrbitMaterial = new THREE.LineBasicMaterial({ 
      color: 0x444444,
      transparent: true,
      opacity: 0.5,
    });
    const earthOrbitLine = new THREE.Line(earthOrbitGeometry, earthOrbitMaterial);
    scene.add(earthOrbitLine);
    earthOrbitRef.current = earthOrbitLine;
    
    // 星空
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // リサイズハンドラ
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  // 軌道線の表示切り替え
  useEffect(() => {
    if (earthOrbitRef.current) {
      earthOrbitRef.current.visible = showOrbits;
    }
    if (moonOrbitRef.current) {
      moonOrbitRef.current.visible = showOrbits;
    }
  }, [showOrbits]);
  
  // アニメーションループ
  const animate = () => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;
    
    frameIdRef.current = requestAnimationFrame(animate);
    
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    
    // 時間経過
    if (isPlaying) {
      const deltaTime = timeSpeed * 0.016;
      setCurrentTime(prev => prev + deltaTime);
      
      // 地球の自転
      setEarthRotation(prev => prev + EARTH_ROTATION_SPEED * timeSpeed);
      
      // 地球の公転
      setEarthOrbitAngle(prev => prev + EARTH_ORBIT_SPEED * timeSpeed);
      
      // 月の公転
      setMoonOrbitAngle(prev => prev + MOON_ORBIT_SPEED * timeSpeed);
    }
    
    // 地球の位置と回転を更新
    if (earthRef.current) {
      earthRef.current.position.x = Math.cos(earthOrbitAngle) * EARTH_ORBIT_RADIUS;
      earthRef.current.position.z = Math.sin(earthOrbitAngle) * EARTH_ORBIT_RADIUS;
      earthRef.current.rotation.y = earthRotation;
    }
    
    // 月の位置を更新（地球の周りを公転）
    if (moonRef.current && earthRef.current) {
      const moonX = earthRef.current.position.x + Math.cos(moonOrbitAngle) * MOON_ORBIT_RADIUS;
      const moonZ = earthRef.current.position.z + Math.sin(moonOrbitAngle) * MOON_ORBIT_RADIUS;
      moonRef.current.position.set(moonX, 0, moonZ);
    }
    
    // 月の満ち欠けを計算
    const phase = (moonOrbitAngle - earthOrbitAngle + Math.PI * 2) % (Math.PI * 2);
    let phaseText = '新月';
    if (phase < Math.PI / 4) phaseText = '新月';
    else if (phase < Math.PI * 3 / 4) phaseText = '上弦';
    else if (phase < Math.PI * 5 / 4) phaseText = '満月';
    else if (phase < Math.PI * 7 / 4) phaseText = '下弦';
    else phaseText = '新月';
    setMoonPhase(phaseText);
    
    // 視点モード
    if (viewMode === 'earth' && earthRef.current) {
      const earthPos = earthRef.current.position;
      cameraRef.current.position.set(
        earthPos.x + 10,
        earthPos.y + 5,
        earthPos.z + 10
      );
      cameraRef.current.lookAt(earthPos);
    }
    
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };
  
  useEffect(() => {
    animate();
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [isPlaying, timeSpeed, earthRotation, earthOrbitAngle, moonOrbitAngle, viewMode]);
  
  // リセット
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setEarthRotation(0);
    setEarthOrbitAngle(0);
    setMoonOrbitAngle(0);
    setTimeSpeed(1);
  };
  
  // 日食・月食の判定
  const checkEclipse = () => {
    const earthSunAngle = earthOrbitAngle;
    const moonEarthAngle = moonOrbitAngle;
    const angleDiff = Math.abs((moonEarthAngle - earthSunAngle) % (Math.PI * 2));
    
    if (angleDiff < 0.1 || angleDiff > Math.PI * 2 - 0.1) {
      return '日食の可能性';
    } else if (Math.abs(angleDiff - Math.PI) < 0.1) {
      return '月食の可能性';
    }
    return null;
  };
  
  const eclipse = checkEclipse();
  
  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          天体の動きシミュレーター
        </Typography>
        <Tooltip title="使い方">
          <IconButton onClick={() => setShowExplanation(!showExplanation)}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {showExplanation && (
        <Alert severity="info" sx={{ mb: 3 }}>
          地球・月・太陽の位置関係と動きを3Dで観察できます。
          マウスドラッグで視点を変更し、時間の速さを調整して
          日食・月食の条件や月の満ち欠けを学習しましょう。
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* 左側：コントロール */}
        <Box sx={{ flex: '0 0 300px', minWidth: 300 }}>
          {/* 再生コントロール */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              時間の制御
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant="contained"
                onClick={() => setIsPlaying(!isPlaying)}
                startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              >
                {isPlaying ? '停止' : '再生'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                startIcon={<RefreshIcon />}
              >
                リセット
              </Button>
            </Box>
            
            <Typography gutterBottom>
              時間の速さ: {timeSpeed}倍速
            </Typography>
            <Slider
              value={timeSpeed}
              onChange={(_, value) => setTimeSpeed(value as number)}
              min={0.1}
              max={100}
              step={0.1}
              marks={[
                { value: 1, label: '1x' },
                { value: 10, label: '10x' },
                { value: 100, label: '100x' },
              ]}
              valueLabelDisplay="auto"
            />
          </Paper>

          {/* 表示設定 */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              表示設定
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              fullWidth
              sx={{ mb: 2 }}
            >
              <ToggleButton value="space">宇宙視点</ToggleButton>
              <ToggleButton value="earth">地球視点</ToggleButton>
            </ToggleButtonGroup>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>観測地点</InputLabel>
              <Select
                value={observationPoint}
                onChange={(e) => setObservationPoint(e.target.value as any)}
                label="観測地点"
              >
                <MenuItem value="tokyo">東京（北緯35度）</MenuItem>
                <MenuItem value="equator">赤道</MenuItem>
                <MenuItem value="pole">北極</MenuItem>
              </Select>
            </FormControl>
            
            <Box>
              <ToggleButton
                value="orbits"
                selected={showOrbits}
                onChange={() => setShowOrbits(!showOrbits)}
                fullWidth
                sx={{ mb: 1 }}
              >
                軌道線を表示
              </ToggleButton>
              <ToggleButton
                value="axes"
                selected={showAxes}
                onChange={() => setShowAxes(!showAxes)}
                fullWidth
              >
                地軸を表示
              </ToggleButton>
            </Box>
          </Paper>

          {/* 天体情報 */}
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              天体情報
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              経過日数: {Math.floor(currentTime).toFixed(0)}日
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              月の満ち欠け: {moonPhase}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              季節: {(() => {
                const angle = earthOrbitAngle % (Math.PI * 2);
                if (angle < Math.PI / 2) return '春';
                else if (angle < Math.PI) return '夏';
                else if (angle < Math.PI * 3 / 2) return '秋';
                else return '冬';
              })()}
            </Typography>
            {eclipse && (
              <Chip
                label={eclipse}
                color="warning"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
        </Box>

        {/* 右側：3Dビュー */}
        <Box sx={{ flex: '1 1 600px', minHeight: 500 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box
              ref={mountRef}
              sx={{
                width: '100%',
                height: '100%',
                minHeight: 500,
                position: 'relative',
                cursor: 'grab',
                '&:active': {
                  cursor: 'grabbing',
                },
              }}
            />
          </Paper>

          {/* 現象の説明 */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="地球の自転：1日"
              color="primary"
              size="small"
            />
            <Chip
              label="月の公転：約27.3日"
              color="secondary"
              size="small"
            />
            <Chip
              label="地球の公転：365.25日"
              size="small"
            />
            <Chip
              label={`地軸の傾き：23.5°`}
              size="small"
            />
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default CelestialMotionSimulator;