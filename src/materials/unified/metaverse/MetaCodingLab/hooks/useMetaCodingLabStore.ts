import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { evaluate } from 'mathjs';
import type { 
  MetaCodingLabState, 
  ProgrammingBlock, 
  Object3D, 
  World3DState,
  MetaCodingLabError 
} from '../types';

// ストアのアクション型定義
interface MetaCodingLabActions {
  // 状態管理
  setState: (newState: Partial<MetaCodingLabState>) => void;
  resetState: () => void;
  
  // ブロック管理
  addBlock: (block: ProgrammingBlock) => void;
  removeBlock: (blockId: string) => void;
  updateBlock: (blockId: string, updates: Partial<ProgrammingBlock>) => void;
  connectBlocks: (sourceId: string, targetId: string) => void;
  disconnectBlock: (blockId: string) => void;
  
  // 3D世界管理
  updateWorld3D: (updates: Partial<World3DState>) => void;
  addObject3D: (object: Object3D) => void;
  removeObject3D: (objectId: string) => void;
  updateObject3D: (objectId: string, updates: Partial<Object3D>) => void;
  
  // コード生成・実行
  generateCode: (blocks: ProgrammingBlock[]) => string;
  executeCode: (code: string) => Promise<void>;
  pauseExecution: () => void;
  stopExecution: () => void;
  
  // エラーハンドリング
  setError: (error: MetaCodingLabError | null) => void;
  clearError: () => void;
}

// ストア型
type MetaCodingLabStore = MetaCodingLabState & MetaCodingLabActions;

// デフォルト状態
const defaultState: MetaCodingLabState = {
  world3D: {
    objects: [],
    camera: {
      position: [5, 5, 5],
      target: [0, 0, 0],
    },
    lighting: {
      ambient: '#404040',
      directional: {
        color: '#ffffff',
        intensity: 1,
        position: [10, 10, 5],
      },
    },
    physics: {
      gravity: [0, -9.81, 0],
      enabled: true,
    },
  },
  programming: {
    blocks: [],
    selectedBlock: undefined,
    draggingBlock: undefined,
    executionState: 'idle',
    generatedCode: '',
    variables: {},
  },
  ui: {
    showBlockPalette: true,
    showCodePreview: false,
    showWorld3D: true,
    selectedTool: 'select',
  },
};

// コード生成ユーティリティ
class CodeGenerator {
  private variables: Record<string, any> = {};
  private functions: Record<string, string> = {};

  generateFromBlocks(blocks: ProgrammingBlock[]): string {
    this.variables = {};
    this.functions = {};

    // ブロックを実行順序でソート
    const sortedBlocks = this.sortBlocksByExecution(blocks);
    
    // コード生成
    const codeLines: string[] = [
      '// Generated MetaCodingLab Code',
      '// このコードは自動生成されました',
      '',
      'class MetaCodingProgram {',
      '  constructor() {',
      '    this.objects = [];',
      '    this.currentObject = null;',
      '    this.variables = {};',
      '  }',
      '',
    ];

    // メソッド生成
    codeLines.push('  async execute() {');
    codeLines.push('    try {');
    
    for (const block of sortedBlocks) {
      const blockCode = this.generateBlockCode(block);
      if (blockCode) {
        codeLines.push(`      ${blockCode}`);
      }
    }
    
    codeLines.push('    } catch (error) {');
    codeLines.push('      console.error("Execution error:", error);');
    codeLines.push('      throw error;');
    codeLines.push('    }');
    codeLines.push('  }');
    codeLines.push('');

    // ユーティリティメソッド
    codeLines.push(...this.generateUtilityMethods());
    
    codeLines.push('}');
    codeLines.push('');
    codeLines.push('// プログラムの実行');
    codeLines.push('const program = new MetaCodingProgram();');
    codeLines.push('program.execute();');

    return codeLines.join('\n');
  }

  private sortBlocksByExecution(blocks: ProgrammingBlock[]): ProgrammingBlock[] {
    const startBlocks = blocks.filter(block => block.type === 'start');
    const connectedBlocks: ProgrammingBlock[] = [];
    const visited = new Set<string>();

    // スタートブロックから実行順序を追跡
    for (const startBlock of startBlocks) {
      this.traverseConnections(startBlock, blocks, connectedBlocks, visited);
    }

    // 未接続のブロックを追加
    const unconnectedBlocks = blocks.filter(block => !visited.has(block.id));
    
    return [...connectedBlocks, ...unconnectedBlocks];
  }

  private traverseConnections(
    currentBlock: ProgrammingBlock,
    allBlocks: ProgrammingBlock[],
    result: ProgrammingBlock[],
    visited: Set<string>
  ): void {
    if (visited.has(currentBlock.id)) return;
    
    visited.add(currentBlock.id);
    result.push(currentBlock);

    // 出力接続を追跡
    if (currentBlock.connections.output) {
      const nextBlock = allBlocks.find(block => block.id === currentBlock.connections.output);
      if (nextBlock) {
        this.traverseConnections(nextBlock, allBlocks, result, visited);
      }
    }
  }

  private generateBlockCode(block: ProgrammingBlock): string {
    switch (block.type) {
      case 'start':
        return '// プログラム開始';

      case 'move':
        const distance = block.parameters.distance || 1;
        const direction = block.parameters.direction || 'forward';
        return `await this.moveObject(${distance}, "${direction}");`;

      case 'rotate':
        const angle = block.parameters.angle || 90;
        const axis = block.parameters.axis || 'y';
        return `await this.rotateObject(${angle}, "${axis}");`;

      case 'scale':
        const scale = block.parameters.scale || 1.5;
        return `await this.scaleObject(${scale});`;

      case 'create_cube':
        const cubeSize = block.parameters.size || 1;
        const cubeX = block.parameters.x || 0;
        const cubeY = block.parameters.y || 0;
        const cubeZ = block.parameters.z || 0;
        return `this.createCube(${cubeSize}, [${cubeX}, ${cubeY}, ${cubeZ}]);`;

      case 'create_sphere':
        const radius = block.parameters.radius || 0.5;
        const sphereX = block.parameters.x || 0;
        const sphereY = block.parameters.y || 1;
        const sphereZ = block.parameters.z || 0;
        return `this.createSphere(${radius}, [${sphereX}, ${sphereY}, ${sphereZ}]);`;

      case 'set_color':
        const color = block.parameters.color || 'red';
        return `this.setObjectColor("${color}");`;

      case 'wait':
        const seconds = block.parameters.seconds || 1;
        return `await this.wait(${seconds * 1000});`;

      case 'repeat':
        const times = block.parameters.times || 3;
        return `for (let i = 0; i < ${times}; i++) {`;

      case 'if_condition':
        const condition = block.parameters.condition || 'true';
        return `if (${this.sanitizeCondition(condition)}) {`;

      case 'variable':
        const varName = block.parameters.name || 'myVariable';
        const varValue = block.parameters.value || 0;
        this.variables[varName] = varValue;
        return `this.variables["${varName}"] = ${varValue};`;

      case 'function':
        const funcName = block.parameters.name || 'myFunction';
        return `// カスタム関数: ${funcName}`;

      default:
        return `// 未実装ブロック: ${block.type}`;
    }
  }

  private sanitizeCondition(condition: string): string {
    // セキュリティのため、条件式を安全な形に変換
    const safeConditions: Record<string, string> = {
      'true': 'true',
      'false': 'false',
      'collision': 'this.checkCollision()',
      'distance < 5': 'this.getDistance() < 5',
    };

    return safeConditions[condition] || 'true';
  }

  private generateUtilityMethods(): string[] {
    return [
      '  // ユーティリティメソッド',
      '  async moveObject(distance, direction) {',
      '    console.log(`Moving ${distance} units ${direction}`);',
      '    // 3Dオブジェクトの移動処理',
      '  }',
      '',
      '  async rotateObject(angle, axis) {',
      '    console.log(`Rotating ${angle} degrees around ${axis} axis`);',
      '    // 3Dオブジェクトの回転処理',
      '  }',
      '',
      '  async scaleObject(scale) {',
      '    console.log(`Scaling object by ${scale}`);',
      '    // 3Dオブジェクトのスケール処理',
      '  }',
      '',
      '  createCube(size, position) {',
      '    console.log(`Creating cube: size=${size}, position=[${position.join(", ")}]`);',
      '    // 立方体作成処理',
      '  }',
      '',
      '  createSphere(radius, position) {',
      '    console.log(`Creating sphere: radius=${radius}, position=[${position.join(", ")}]`);',
      '    // 球体作成処理',
      '  }',
      '',
      '  setObjectColor(color) {',
      '    console.log(`Setting object color to ${color}`);',
      '    // 色設定処理',
      '  }',
      '',
      '  async wait(milliseconds) {',
      '    return new Promise(resolve => setTimeout(resolve, milliseconds));',
      '  }',
      '',
      '  checkCollision() {',
      '    // 衝突検出処理',
      '    return false;',
      '  }',
      '',
      '  getDistance() {',
      '    // 距離計算処理',
      '    return 0;',
      '  }',
    ];
  }
}

// ストア作成
export const useMetaCodingLabStore = create<MetaCodingLabStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,

        // 状態管理
        setState: (newState) => {
          set((state) => ({ ...state, ...newState }), false, 'setState');
        },

        resetState: () => {
          set(defaultState, false, 'resetState');
        },

        // ブロック管理
        addBlock: (block) => {
          set((state) => ({
            programming: {
              ...state.programming,
              blocks: [...state.programming.blocks, block],
            },
          }), false, 'addBlock');
        },

        removeBlock: (blockId) => {
          set((state) => ({
            programming: {
              ...state.programming,
              blocks: state.programming.blocks.filter(block => block.id !== blockId),
              selectedBlock: state.programming.selectedBlock === blockId 
                ? undefined 
                : state.programming.selectedBlock,
            },
          }), false, 'removeBlock');
        },

        updateBlock: (blockId, updates) => {
          set((state) => ({
            programming: {
              ...state.programming,
              blocks: state.programming.blocks.map(block =>
                block.id === blockId ? { ...block, ...updates } : block
              ),
            },
          }), false, 'updateBlock');
        },

        connectBlocks: (sourceId, targetId) => {
          set((state) => {
            const updatedBlocks = state.programming.blocks.map(block => {
              if (block.id === sourceId) {
                return { ...block, connections: { ...block.connections, output: targetId } };
              }
              if (block.id === targetId) {
                return { ...block, connections: { ...block.connections, input: sourceId } };
              }
              return block;
            });

            return {
              programming: {
                ...state.programming,
                blocks: updatedBlocks,
              },
            };
          }, false, 'connectBlocks');
        },

        disconnectBlock: (blockId) => {
          set((state) => {
            const updatedBlocks = state.programming.blocks.map(block => {
              if (block.id === blockId || block.connections.input === blockId || block.connections.output === blockId) {
                return {
                  ...block,
                  connections: {
                    input: block.connections.input === blockId ? undefined : block.connections.input,
                    output: block.connections.output === blockId ? undefined : block.connections.output,
                  },
                };
              }
              return block;
            });

            return {
              programming: {
                ...state.programming,
                blocks: updatedBlocks,
              },
            };
          }, false, 'disconnectBlock');
        },

        // 3D世界管理
        updateWorld3D: (updates) => {
          set((state) => ({
            world3D: { ...state.world3D, ...updates },
          }), false, 'updateWorld3D');
        },

        addObject3D: (object) => {
          set((state) => ({
            world3D: {
              ...state.world3D,
              objects: [...state.world3D.objects, object],
            },
          }), false, 'addObject3D');
        },

        removeObject3D: (objectId) => {
          set((state) => ({
            world3D: {
              ...state.world3D,
              objects: state.world3D.objects.filter(obj => obj.id !== objectId),
            },
          }), false, 'removeObject3D');
        },

        updateObject3D: (objectId, updates) => {
          set((state) => ({
            world3D: {
              ...state.world3D,
              objects: state.world3D.objects.map(obj =>
                obj.id === objectId ? { ...obj, ...updates } : obj
              ),
            },
          }), false, 'updateObject3D');
        },

        // コード生成・実行
        generateCode: (blocks) => {
          const generator = new CodeGenerator();
          const code = generator.generateFromBlocks(blocks);
          
          set((state) => ({
            programming: {
              ...state.programming,
              generatedCode: code,
            },
          }), false, 'generateCode');
          
          return code;
        },

        executeCode: async (code) => {
          const state = get();
          
          set((prevState) => ({
            programming: {
              ...prevState.programming,
              executionState: 'running',
            },
          }), false, 'executeCode:start');

          try {
            // セキュアな実行環境でコードを実行
            // eval()の代わりに制限された実行環境を使用
            console.log('Executing code:', code);
            
            // 実際の実行処理（簡単な実装例）
            const executionContext = {
              objects: state.world3D.objects,
              variables: state.programming.variables,
              log: console.log,
            };

            // math.jsを使用した安全な数式評価（必要に応じて）
            // 実際の3Dオブジェクトの操作は別途実装

            await new Promise(resolve => setTimeout(resolve, 1000)); // 実行シミュレーション

            set((prevState) => ({
              programming: {
                ...prevState.programming,
                executionState: 'idle',
              },
            }), false, 'executeCode:success');

          } catch (error) {
            console.error('Code execution failed:', error);
            
            set((prevState) => ({
              programming: {
                ...prevState.programming,
                executionState: 'error',
              },
            }), false, 'executeCode:error');

            throw error;
          }
        },

        pauseExecution: () => {
          set((state) => ({
            programming: {
              ...state.programming,
              executionState: 'paused',
            },
          }), false, 'pauseExecution');
        },

        stopExecution: () => {
          set((state) => ({
            programming: {
              ...state.programming,
              executionState: 'idle',
            },
          }), false, 'stopExecution');
        },

        // エラーハンドリング
        setError: (error) => {
          set((state) => ({ ...state, error }), false, 'setError');
        },

        clearError: () => {
          set((state) => ({ ...state, error: undefined }), false, 'clearError');
        },
      }),
      {
        name: 'meta-coding-lab-store',
        version: 1,
        partialize: (state) => ({
          // 永続化する状態を選択
          programming: {
            blocks: state.programming.blocks,
            variables: state.programming.variables,
          },
          world3D: {
            objects: state.world3D.objects,
          },
          ui: state.ui,
        }),
      }
    ),
    {
      name: 'MetaCodingLab Store',
    }
  )
);