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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MaterialWrapper, useLearningTrackerContext } from './wrappers/MaterialWrapper';

interface CelestialMotionSimulatorProps {
  onClose?: () => void;
}

// 天体の動きシミュレーター（内部コンポーネント）
const CelestialMotionSimulatorContent: React.FC<CelestialMotionSimulatorProps> = ({ onClose: _onClose }) => {
  const { recordAnswer, recordInteraction } = useLearningTrackerContext();
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
    recordInteraction('click');
    
    // リセット実行を記録
    recordAnswer(true, {
      problem: '天体シミュレーターのリセット',
      userAnswer: `システムを初期状態に戻す`,
      correctAnswer: 'リセット完了'
    });
    
    // リセット詳細情報を別途記録
    console.log('Reset data:', {
      previousTimeSpeed: timeSpeed,
      previousViewMode: viewMode,
      previousCurrentTime: currentTime,
      previousEarthRotation: earthRotation,
      previousEarthOrbitAngle: earthOrbitAngle,
      previousMoonOrbitAngle: moonOrbitAngle,
      wasPlaying: isPlaying,
      observationPoint: observationPoint,
      displaySettings: {
        showOrbits: showOrbits,
        showAxes: showAxes
      }
    });
    
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
          <IconButton onClick={() => {
            const newShowExplanation = !showExplanation;
            setShowExplanation(newShowExplanation);
            recordInteraction('click');
            
            // ヘルプ表示切り替えを記録
            recordAnswer(true, {
              problem: 'ヘルプ・使い方の表示',
              userAnswer: `ヘルプを${newShowExplanation ? '表示' : '非表示'}`,
              correctAnswer: 'ツールの使用方法理解'
            });
            
            // ヘルプ操作の詳細を別途記録
            console.log('Help action:', {
              isShowing: newShowExplanation,
              currentSettings: {
                viewMode: viewMode,
                timeSpeed: timeSpeed,
                observationPoint: observationPoint,
                isPlaying: isPlaying
              }
            });
          }}>
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
                onClick={() => {
                  const newIsPlaying = !isPlaying;
                  recordInteraction('click');
                  
                  // シミュレーション制御を記録
                  recordAnswer(true, {
                    problem: '天体シミュレーションの制御',
                    userAnswer: `シミュレーション${newIsPlaying ? '開始' : '停止'} - 速度: ${timeSpeed}倍速, 視点: ${viewMode}`,
                    correctAnswer: 'シミュレーション制御の理解'
                  });
                  
                  // シミュレーション制御の詳細を別途記録
                  console.log('Simulation control:', {
                    action: newIsPlaying ? 'start' : 'stop',
                    timeSpeed: timeSpeed,
                    viewMode: viewMode,
                    earthRotation: earthRotation,
                    earthOrbitAngle: earthOrbitAngle,
                    moonOrbitAngle: moonOrbitAngle,
                    currentTime: currentTime,
                    showSettings: {
                      showOrbits: showOrbits,
                      showAxes: showAxes
                    }
                  });
                  
                  setIsPlaying(newIsPlaying);
                }}
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
              onChange={(_, value) => {
                const newTimeSpeed = value as number;
                setTimeSpeed(newTimeSpeed);
                recordInteraction('drag');
                
                // 時間速度変更を記録（主要な値で）
                if ([0.1, 0.5, 1, 5, 10, 50, 100].includes(Math.round(newTimeSpeed * 10) / 10)) {
                  recordAnswer(true, {
                    problem: '時間速度の調整',
                    userAnswer: `時間速度を${newTimeSpeed}倍速に設定`,
                    correctAnswer: '天体運動の時間スケール理解'
                  });
                  
                  // 時間速度調整の詳細を別途記録
                  console.log('Time speed adjustment:', {
                    newSpeed: newTimeSpeed,
                    isRealTime: newTimeSpeed === 1,
                    isFastForward: newTimeSpeed > 1,
                    isSlowMotion: newTimeSpeed < 1,
                    currentSimulationState: {
                      earthRotation: earthRotation,
                      earthOrbitAngle: earthOrbitAngle,
                      moonOrbitAngle: moonOrbitAngle,
                      currentTime: currentTime
                    }
                  });
                }
              }}
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
              onChange={(_, value) => {
                if (value) {
                  setViewMode(value);
                  recordInteraction('click');
                  
                  // 視点変更を記録
                  recordAnswer(true, {
                    problem: '視点モードの切り替え',
                    userAnswer: `${value === 'space' ? '宇宙視点' : '地球視点'}に変更`,
                    correctAnswer: '異なる視点からの天体観察理解'
                  });
                  
                  // 視点変更の詳細を別途記録
                  console.log('View mode change:', {
                    from: viewMode,
                    to: value,
                    description: value === 'space' ? '太陽系全体を俯瞰する視点' : '地球から見た視点',
                    currentState: {
                      earthPosition: { earthOrbitAngle: earthOrbitAngle },
                      moonPosition: { moonOrbitAngle: moonOrbitAngle },
                      timeSpeed: timeSpeed
                    }
                  });
                }
              }}
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
                onChange={(e) => {
                  const newObservationPoint = e.target.value as any;
                  setObservationPoint(newObservationPoint);
                  recordInteraction('click');
                  
                  // 観測地点変更を記録
                  recordAnswer(true, {
                    problem: '観測地点の選択',
                    userAnswer: `観測地点を${newObservationPoint === 'tokyo' ? '東京（北緯35度）' : newObservationPoint === 'equator' ? '赤道' : '北極'}に設定`,
                    correctAnswer: '地球上の位置による天体観測の違い理解'
                  });
                  
                  // 観測地点変更の詳細を別途記録
                  console.log('Observation point change:', {
                    from: observationPoint,
                    to: newObservationPoint,
                    latitude: newObservationPoint === 'tokyo' ? 35 : newObservationPoint === 'equator' ? 0 : 90,
                    description: newObservationPoint === 'tokyo' ? '中緯度地域の観測' : 
                                newObservationPoint === 'equator' ? '赤道での観測' : '極地での観測',
                    astronomicalFeatures: newObservationPoint === 'pole' ? '白夜・極夜の現象' : 
                                         newObservationPoint === 'equator' ? '年中安定した日照' : '四季の変化明確'
                  });
                }}
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
                onChange={() => {
                  const newShowOrbits = !showOrbits;
                  setShowOrbits(newShowOrbits);
                  recordInteraction('click');
                  
                  // 軌道線表示切り替えを記録
                  recordAnswer(true, {
                    problem: '軌道線表示の切り替え',
                    userAnswer: newShowOrbits ? '軌道線を表示' : '軌道線を非表示',
                    correctAnswer: '天体軌道の視覚化理解'
                  });
                  
                  // 軌道線表示の詳細を別途記録
                  console.log('Orbit display:', {
                    isVisible: newShowOrbits,
                    purpose: '地球と月の公転軌道の可視化',
                    educationalValue: newShowOrbits ? '軌道の形と大きさの理解' : 'シンプルな表示'
                  });
                }}
                fullWidth
                sx={{ mb: 1 }}
              >
                軌道線を表示
              </ToggleButton>
              <ToggleButton
                value="axes"
                selected={showAxes}
                onChange={() => {
                  const newShowAxes = !showAxes;
                  setShowAxes(newShowAxes);
                  recordInteraction('click');
                  
                  // 地軸表示切り替えを記録
                  recordAnswer(true, {
                    problem: '地軸表示の切り替え',
                    userAnswer: newShowAxes ? '地軸を表示' : '地軸を非表示',
                    correctAnswer: '地軸の傾きと季節変化の理解'
                  });
                  
                  // 地軸表示の詳細を別途記録
                  console.log('Axis display:', {
                    isVisible: newShowAxes,
                    earthTilt: EARTH_TILT * 180 / Math.PI, // 度数に変換
                    seasonalEffect: '23.5度の傾きによる季節の変化',
                    educationalValue: newShowAxes ? '地軸の傾きが季節に与える影響の理解' : 'シンプルな表示'
                  });
                }}
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

// 天体の動きシミュレーター（MaterialWrapperでラップ）
const CelestialMotionSimulator: React.FC<CelestialMotionSimulatorProps> = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="celestial-motion-simulator"
      materialName="天体の動きシミュレーター"
      showMetricsButton={true}
      showAssistant={true}
    >
      <CelestialMotionSimulatorContent onClose={onClose} />
    </MaterialWrapper>
  );
};

export default CelestialMotionSimulator;