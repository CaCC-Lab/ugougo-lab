// MetaCodingLab - メタバース協働プログラミング空間
// エクスポート用インデックスファイル

import MetaCodingLab from './MetaCodingLab';

export default MetaCodingLab;

// 関連する型とコンポーネントもエクスポート
export type {
  MetaCodingLabProps,
  MetaCodingLabState,
  ProgrammingBlock,
  BlockType,
  Object3D,
  World3DState,
  Transform3D,
  BlockDefinition,
  MetaCodingLabError,
  MetaCodingLabEvent,
} from './types';

export { useMetaCodingLabStore } from './hooks/useMetaCodingLabStore';

// 子コンポーネント（必要に応じて）
export { default as CodingWorld } from './components/CodingWorld';
export { default as BlockPalette } from './components/BlockPalette';
export { default as BlockWorkspace } from './components/BlockWorkspace';