import React, { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  Environment, 
  PerspectiveCamera,
  Text3D,
  Center,
  useHelper
} from '@react-three/drei';
import { DirectionalLightHelper, GridHelper } from 'three';
import * as THREE from 'three';
import { Box, Typography, Alert } from '@mui/material';
import type { CodingWorldProps, Object3D as Object3DType } from '../types';

// 3Dオブジェクトコンポーネント
interface Object3DComponentProps {
  object: Object3DType;
  isSelected: boolean;
  onSelect: (objectId: string) => void;
}

const Object3DComponent: React.FC<Object3DComponentProps> = ({ 
  object, 
  isSelected, 
  onSelect 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // クリックハンドラー
  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(object.id);
  }, [object.id, onSelect]);

  // ホバーエフェクト
  const handlePointerOver = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  // アニメーション（選択時の強調表示）
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  // ジオメトリの生成
  const getGeometry = () => {
    switch (object.geometry) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'cone':
        return <coneGeometry args={[0.5, 1, 32]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  // マテリアルの設定
  const material = {
    color: isSelected ? '#ffaa00' : hovered ? '#ff6600' : object.material.color,
    opacity: object.material.opacity,
    transparent: object.material.opacity < 1,
    wireframe: object.material.wireframe,
  };

  return (
    <mesh
      ref={meshRef}
      position={object.transform.position}
      rotation={object.transform.rotation}
      scale={object.transform.scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {getGeometry()}
      <meshStandardMaterial {...material} />
    </mesh>
  );
};

// 照明コンポーネント
const Lighting: React.FC<{ lightingConfig: any }> = ({ lightingConfig }) => {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  
  // デバッグモード時のライトヘルパー
  useHelper(directionalLightRef, DirectionalLightHelper, 1, 'red');

  return (
    <>
      {/* 環境光 */}
      <ambientLight color={lightingConfig.ambient} intensity={0.4} />
      
      {/* メインの指向性ライト */}
      <directionalLight
        ref={directionalLightRef}
        position={lightingConfig.directional.position}
        color={lightingConfig.directional.color}
        intensity={lightingConfig.directional.intensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* 補助光 */}
      <directionalLight
        position={[-5, 5, 5]}
        color="#ffffff"
        intensity={0.3}
      />
    </>
  );
};

// グリッドとガイド
const WorldGrid: React.FC = () => {
  return (
    <>
      {/* 床グリッド */}
      <Grid
        infiniteGrid
        size={1}
        cellSize={1}
        cellThickness={0.5}
        sectionSize={10}
        sectionThickness={1}
        fadeDistance={50}
        fadeStrength={1}
        position={[0, -0.01, 0]}
      />
      
      {/* 座標軸の表示 */}
      <group>
        {/* X軸（赤） */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([0, 0, 0, 5, 0, 0])}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="red" />
        </line>
        
        {/* Y軸（緑） */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([0, 0, 0, 0, 5, 0])}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="green" />
        </line>
        
        {/* Z軸（青） */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([0, 0, 0, 0, 0, 5])}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="blue" />
        </line>
      </group>
      
      {/* 原点マーカー */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#ffff00" />
      </mesh>
    </>
  );
};

// インストラクションテキスト
const InstructionText: React.FC = () => {
  return (
    <Center position={[0, 3, 0]}>
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.5}
        height={0.1}
        curveSegments={12}
      >
        MetaCodingLab
        <meshStandardMaterial color="#4A90E2" />
      </Text3D>
    </Center>
  );
};

// メインコンポーネント
const CodingWorld: React.FC<CodingWorldProps> = ({ 
  world3D, 
  onObjectSelect, 
  onWorldChange 
}) => {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // オブジェクト選択ハンドラー
  const handleObjectSelect = useCallback((objectId: string) => {
    setSelectedObjectId(objectId);
    onObjectSelect(objectId);
  }, [onObjectSelect]);

  // 背景クリックでのオブジェクト選択解除
  const handleBackgroundClick = useCallback(() => {
    setSelectedObjectId(null);
    onObjectSelect('');
  }, [onObjectSelect]);

  // エラーハンドラー
  const handleError = useCallback((error: any) => {
    console.error('3D World Error:', error);
    setError('3D環境の初期化に失敗しました。ブラウザがWebGLをサポートしているか確認してください。');
  }, []);

  if (error) {
    return (
      <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>3D環境エラー</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', position: 'relative' }} data-testid="3d-canvas">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#f0f0f0');
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        onError={handleError}
        onClick={handleBackgroundClick}
      >
        {/* カメラ */}
        <PerspectiveCamera
          makeDefault
          position={world3D.camera.position}
          fov={75}
          near={0.1}
          far={1000}
        />

        {/* カメラコントロール */}
        <OrbitControls
          target={world3D.camera.target}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
        />

        {/* 照明 */}
        <Lighting lightingConfig={world3D.lighting} />

        {/* 環境とグリッド */}
        <Environment preset="warehouse" />
        <WorldGrid />

        {/* インストラクションテキスト */}
        <InstructionText />

        {/* 3Dオブジェクトの描画 */}
        {world3D.objects.map((object) => (
          <Object3DComponent
            key={object.id}
            object={object}
            isSelected={selectedObjectId === object.id}
            onSelect={handleObjectSelect}
          />
        ))}

        {/* デバッグ情報（開発時のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#ff00ff" opacity={0.5} transparent />
          </mesh>
        )}
      </Canvas>

      {/* 3D世界の情報表示 */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          p: 1,
          borderRadius: 1,
          fontSize: '0.75rem',
        }}
      >
        <Typography variant="caption" display="block">
          オブジェクト数: {world3D.objects.length}
        </Typography>
        <Typography variant="caption" display="block">
          選択中: {selectedObjectId || 'なし'}
        </Typography>
        <Typography variant="caption" display="block">
          物理演算: {world3D.physics.enabled ? 'ON' : 'OFF'}
        </Typography>
      </Box>

      {/* 操作ヘルプ */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          p: 1,
          borderRadius: 1,
          fontSize: '0.7rem',
        }}
      >
        <Typography variant="caption" display="block">
          マウス: 回転・ズーム
        </Typography>
        <Typography variant="caption" display="block">
          オブジェクトクリック: 選択
        </Typography>
        <Typography variant="caption" display="block">
          背景クリック: 選択解除
        </Typography>
      </Box>
    </Box>
  );
};

export default CodingWorld;