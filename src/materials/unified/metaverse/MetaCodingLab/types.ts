// MetaCodingLab型定義

import { ReactNode } from 'react';

// 基本的な3D位置・回転・スケール
export interface Transform3D {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

// プログラミングブロックの基本型
export interface ProgrammingBlock {
  id: string;
  type: BlockType;
  parameters: BlockParameters;
  connections: {
    input?: string;
    output?: string;
  };
  position: [number, number];
}

// ブロックタイプ定義
export type BlockType = 
  | 'start'
  | 'move'
  | 'rotate'
  | 'scale'
  | 'create_cube'
  | 'create_sphere'
  | 'set_color'
  | 'wait'
  | 'repeat'
  | 'if_condition'
  | 'variable'
  | 'function';

// ブロックパラメータ
export interface BlockParameters {
  [key: string]: number | string | boolean;
}

// 3Dオブジェクト
export interface Object3D {
  id: string;
  type: '3d_object';
  geometry: 'cube' | 'sphere' | 'cylinder' | 'cone';
  material: {
    color: string;
    opacity: number;
    wireframe: boolean;
  };
  transform: Transform3D;
  physics?: {
    mass: number;
    friction: number;
    restitution: number;
  };
}

// 3D世界の状態
export interface World3DState {
  objects: Object3D[];
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  lighting: {
    ambient: string;
    directional: {
      color: string;
      intensity: number;
      position: [number, number, number];
    };
  };
  physics: {
    gravity: [number, number, number];
    enabled: boolean;
  };
}

// ブロックプログラミングエンジンの状態
export interface ProgrammingState {
  blocks: ProgrammingBlock[];
  selectedBlock?: string;
  draggingBlock?: string;
  executionState: 'idle' | 'running' | 'paused' | 'error';
  generatedCode: string;
  variables: Record<string, any>;
}

// メタコーディングラボのメイン状態
export interface MetaCodingLabState {
  world3D: World3DState;
  programming: ProgrammingState;
  ui: {
    showBlockPalette: boolean;
    showCodePreview: boolean;
    showWorld3D: boolean;
    selectedTool: 'select' | 'move' | 'rotate' | 'scale';
  };
  collaboration?: {
    sessionId: string;
    participants: Array<{
      id: string;
      name: string;
      cursor: [number, number];
      selectedBlocks: string[];
    }>;
  };
}

// コンポーネントProps
export interface MetaCodingLabProps {
  onClose?: () => void;
  initialState?: Partial<MetaCodingLabState>;
  collaborationMode?: boolean;
}

export interface CodingWorldProps {
  world3D: World3DState;
  onObjectSelect: (objectId: string) => void;
  onWorldChange: (newState: World3DState) => void;
}

export interface BlockPaletteProps {
  availableBlocks: BlockType[];
  onBlockDrag: (blockType: BlockType) => void;
  onBlockSelect: (blockType: BlockType) => void;
}

export interface BlockWorkspaceProps {
  blocks: ProgrammingBlock[];
  onBlockAdd: (block: ProgrammingBlock) => void;
  onBlockRemove: (blockId: string) => void;
  onBlockConnect: (sourceId: string, targetId: string) => void;
  onBlocksChange: (blocks: ProgrammingBlock[]) => void;
}

// ブロック定義
export interface BlockDefinition {
  type: BlockType;
  name: string;
  description: string;
  category: 'motion' | 'objects' | 'control' | 'sensing' | 'variables' | 'functions';
  color: string;
  icon: ReactNode;
  parameters: Array<{
    name: string;
    type: 'number' | 'string' | 'boolean' | 'dropdown';
    defaultValue: any;
    options?: string[];
  }>;
  connections: {
    hasInput: boolean;
    hasOutput: boolean;
  };
}

// イベント型
export type MetaCodingLabEvent = 
  | { type: 'BLOCK_ADDED'; payload: ProgrammingBlock }
  | { type: 'BLOCK_REMOVED'; payload: { blockId: string } }
  | { type: 'BLOCKS_CONNECTED'; payload: { sourceId: string; targetId: string } }
  | { type: 'CODE_EXECUTED'; payload: { code: string } }
  | { type: 'OBJECT_CREATED'; payload: Object3D }
  | { type: 'OBJECT_UPDATED'; payload: { objectId: string; changes: Partial<Object3D> } }
  | { type: 'CAMERA_MOVED'; payload: { position: [number, number, number]; target: [number, number, number] } };

// エラー型
export interface MetaCodingLabError {
  type: 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR';
  message: string;
  details?: any;
  timestamp: Date;
}