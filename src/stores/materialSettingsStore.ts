/**
 * 教材表示設定管理Store
 * Phase 2: 教材表示設定システム
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  MaterialMetadata, 
  MaterialDisplaySettings, 
  MaterialFilter,
  MaterialGrade,
  MaterialSubject,
  MaterialStatus,
  MaterialCategory,
  MaterialSettingsSchema,
  MaterialPreset
} from '../types/material';
import { materialMetadataList } from '../utils/materialMetadata';

interface MaterialSettingsState {
  // 教材メタデータ
  materials: MaterialMetadata[];
  
  // 表示設定
  displaySettings: MaterialDisplaySettings;
  
  // フィルタ設定
  currentFilter: MaterialFilter;
  
  // プリセット
  presets: Record<string, MaterialPreset>;
  
  // 設定の最終更新日時
  lastUpdated: string;
  
  // === アクション ===
  
  // 個別教材の切り替え
  toggleMaterial: (id: string) => void;
  
  // 学年別の一括切り替え
  toggleGrade: (grade: MaterialGrade) => void;
  
  // 教科別の一括切り替え
  toggleSubject: (subject: MaterialSubject) => void;
  
  // ステータス別の一括切り替え
  toggleStatus: (status: MaterialStatus) => void;
  
  // カテゴリー別の一括切り替え
  toggleCategory: (category: MaterialCategory) => void;
  
  // 教材のステータス更新
  updateMaterialStatus: (id: string, status: MaterialStatus) => void;
  
  // 教材の有効/無効切り替え
  setMaterialEnabled: (id: string, enabled: boolean) => void;
  
  // === 一括操作 ===
  
  // 全教材を有効化
  enableAll: () => void;
  
  // 全教材を無効化
  disableAll: () => void;
  
  // プリセットを適用
  applyPreset: (presetId: 'all' | 'elementary' | 'juniorHigh' | 'highSchool' | string) => void;
  
  // === 設定の保存/読み込み ===
  
  // 設定をJSON形式でエクスポート
  exportSettings: () => string;
  
  // JSON形式の設定をインポート
  importSettings: (json: string) => void;
  
  // プリセットを保存
  savePreset: (preset: MaterialPreset) => void;
  
  // プリセットを削除
  deletePreset: (presetId: string) => void;
  
  // === フィルタリング ===
  
  // フィルタを設定
  setFilter: (filter: MaterialFilter) => void;
  
  // フィルタをクリア
  clearFilter: () => void;
  
  // 表示可能な教材を取得（フィルタと設定を適用）
  getVisibleMaterials: () => MaterialMetadata[];
  
  // === グローバル設定 ===
  
  // グローバル有効/無効を切り替え
  toggleGlobalEnabled: () => void;
  
  // 開発中教材の表示を切り替え
  toggleShowDevelopment: () => void;
  
  // 無効化された教材の表示を切り替え
  toggleShowDisabled: () => void;
  
  // === 初期化 ===
  
  // 設定を初期状態にリセット
  resetSettings: () => void;
  
  // 教材メタデータを再読み込み
  reloadMaterials: () => void;
}

// 初期表示設定
const initialDisplaySettings: MaterialDisplaySettings = {
  byMaterial: materialMetadataList.reduce((acc, material) => {
    acc[material.id] = material.enabled;
    return acc;
  }, {} as Record<string, boolean>),
  byGrade: {
    '小学1年生': true,
    '小学2年生': true,
    '小学3年生': true,
    '小学4年生': true,
    '小学5年生': true,
    '小学6年生': true,
    '中学1年生': true,
    '中学2年生': true,
    '中学3年生': true,
    '高校1年生': true,
    '高校2年生': true,
    '高校3年生': true,
  },
  bySubject: {
    '算数': true,
    '数学': true,
    '理科': true,
    '物理': true,
    '化学': true,
    '生物': true,
    '国語': true,
    '英語': true,
    '社会': true,
    '地理': true,
    '歴史': true,
    '公民': true,
    '生活科': true,
    '情報': true,
    '総合': true,
  },
  byStatus: {
    development: false,
    testing: true,
    published: true,
  },
  byCategory: {
    visualization: true,
    simulation: true,
    game: true,
    practice: true,
    interactive: true,
    tool: true,
  },
  globalEnabled: true,
  showDevelopment: false,
  showDisabled: false,
};

// デフォルトプリセット
const defaultPresets: Record<string, MaterialPreset> = {
  all: {
    id: 'all',
    name: '全教材',
    description: 'すべての教材を表示',
    filter: {},
    displaySettings: {
      globalEnabled: true,
      showDevelopment: false,
      showDisabled: false,
    },
  },
  elementary: {
    id: 'elementary',
    name: '小学生向け',
    description: '小学生向けの教材のみ表示',
    filter: {
      grades: ['小学1年生', '小学2年生', '小学3年生', '小学4年生', '小学5年生', '小学6年生'],
    },
    displaySettings: {
      byGrade: {
        '小学1年生': true,
        '小学2年生': true,
        '小学3年生': true,
        '小学4年生': true,
        '小学5年生': true,
        '小学6年生': true,
        '中学1年生': false,
        '中学2年生': false,
        '中学3年生': false,
        '高校1年生': false,
        '高校2年生': false,
        '高校3年生': false,
      },
    },
  },
  juniorHigh: {
    id: 'juniorHigh',
    name: '中学生向け',
    description: '中学生向けの教材のみ表示',
    filter: {
      grades: ['中学1年生', '中学2年生', '中学3年生'],
    },
    displaySettings: {
      byGrade: {
        '小学1年生': false,
        '小学2年生': false,
        '小学3年生': false,
        '小学4年生': false,
        '小学5年生': false,
        '小学6年生': false,
        '中学1年生': true,
        '中学2年生': true,
        '中学3年生': true,
        '高校1年生': false,
        '高校2年生': false,
        '高校3年生': false,
      },
    },
  },
  highSchool: {
    id: 'highSchool',
    name: '高校生向け',
    description: '高校生向けの教材のみ表示',
    filter: {
      grades: ['高校1年生', '高校2年生', '高校3年生'],
    },
    displaySettings: {
      byGrade: {
        '小学1年生': false,
        '小学2年生': false,
        '小学3年生': false,
        '小学4年生': false,
        '小学5年生': false,
        '小学6年生': false,
        '中学1年生': false,
        '中学2年生': false,
        '中学3年生': false,
        '高校1年生': true,
        '高校2年生': true,
        '高校3年生': true,
      },
    },
  },
};

export const useMaterialSettingsStore = create<MaterialSettingsState>()(
  persist(
    (set, get) => ({
      // === 初期状態 ===
      materials: [...materialMetadataList],
      displaySettings: initialDisplaySettings,
      currentFilter: {},
      presets: defaultPresets,
      lastUpdated: new Date().toISOString(),

      // === アクション実装 ===
      
      toggleMaterial: (id) => {
        set((state) => {
          const newByMaterial = { ...state.displaySettings.byMaterial };
          newByMaterial[id] = !newByMaterial[id];
          
          return {
            displaySettings: {
              ...state.displaySettings,
              byMaterial: newByMaterial,
            },
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      toggleGrade: (grade) => {
        set((state) => {
          const newByGrade = { ...state.displaySettings.byGrade };
          newByGrade[grade] = !newByGrade[grade];
          
          return {
            displaySettings: {
              ...state.displaySettings,
              byGrade: newByGrade,
            },
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      toggleSubject: (subject) => {
        set((state) => {
          const newBySubject = { ...state.displaySettings.bySubject };
          newBySubject[subject] = !newBySubject[subject];
          
          return {
            displaySettings: {
              ...state.displaySettings,
              bySubject: newBySubject,
            },
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      toggleStatus: (status) => {
        set((state) => {
          const newByStatus = { ...state.displaySettings.byStatus };
          newByStatus[status] = !newByStatus[status];
          
          return {
            displaySettings: {
              ...state.displaySettings,
              byStatus: newByStatus,
            },
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      toggleCategory: (category) => {
        set((state) => {
          const newByCategory = { ...state.displaySettings.byCategory };
          newByCategory[category] = !newByCategory[category];
          
          return {
            displaySettings: {
              ...state.displaySettings,
              byCategory: newByCategory,
            },
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      updateMaterialStatus: (id, status) => {
        set((state) => {
          const newMaterials = state.materials.map(material =>
            material.id === id
              ? { ...material, status, updatedAt: new Date().toISOString() }
              : material
          );
          
          return {
            materials: newMaterials,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      setMaterialEnabled: (id, enabled) => {
        set((state) => {
          const newMaterials = state.materials.map(material =>
            material.id === id
              ? { ...material, enabled, updatedAt: new Date().toISOString() }
              : material
          );
          
          const newByMaterial = { ...state.displaySettings.byMaterial };
          newByMaterial[id] = enabled;
          
          return {
            materials: newMaterials,
            displaySettings: {
              ...state.displaySettings,
              byMaterial: newByMaterial,
            },
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      enableAll: () => {
        set((state) => {
          const newByMaterial = state.materials.reduce((acc, material) => {
            acc[material.id] = true;
            return acc;
          }, {} as Record<string, boolean>);
          
          return {
            displaySettings: {
              ...state.displaySettings,
              byMaterial: newByMaterial,
              globalEnabled: true,
            },
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      disableAll: () => {
        set((state) => {
          const newByMaterial = state.materials.reduce((acc, material) => {
            acc[material.id] = false;
            return acc;
          }, {} as Record<string, boolean>);
          
          return {
            displaySettings: {
              ...state.displaySettings,
              byMaterial: newByMaterial,
              globalEnabled: false,
            },
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      applyPreset: (presetId) => {
        const preset = get().presets[presetId];
        if (!preset) return;
        
        set((state) => {
          let newDisplaySettings = { ...state.displaySettings };
          
          // プリセットの表示設定を適用
          if (preset.displaySettings) {
            newDisplaySettings = { ...newDisplaySettings, ...preset.displaySettings };
          }
          
          return {
            displaySettings: newDisplaySettings,
            currentFilter: preset.filter || {},
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      exportSettings: () => {
        const state = get();
        const settings: MaterialSettingsSchema = {
          version: '1.0.0',
          lastUpdated: state.lastUpdated,
          materials: state.materials.reduce((acc, material) => {
            acc[material.id] = {
              enabled: state.displaySettings.byMaterial[material.id] || false,
              status: material.status,
            };
            return acc;
          }, {} as MaterialSettingsSchema['materials']),
          displaySettings: state.displaySettings,
          presets: state.presets,
          metadata: {
            environment: 'production',
            createdBy: 'MaterialSettingsSystem',
            notes: 'Exported from Phase 2 Material Display Settings',
          },
        };
        
        return JSON.stringify(settings, null, 2);
      },

      importSettings: (json) => {
        try {
          const settings: MaterialSettingsSchema = JSON.parse(json);
          
          // バージョンチェック
          if (settings.version !== '1.0.0') {
            console.warn('設定ファイルのバージョンが異なります');
          }
          
          set((state) => {
            // 教材のステータスと有効/無効を更新
            const newMaterials = state.materials.map(material => {
              const imported = settings.materials[material.id];
              if (imported) {
                return {
                  ...material,
                  status: imported.status,
                  enabled: imported.enabled,
                  updatedAt: new Date().toISOString(),
                };
              }
              return material;
            });
            
            return {
              materials: newMaterials,
              displaySettings: settings.displaySettings,
              presets: settings.presets || state.presets,
              lastUpdated: new Date().toISOString(),
            };
          });
        } catch (error) {
          console.error('設定のインポートに失敗しました:', error);
          throw new Error('無効な設定ファイルです');
        }
      },

      savePreset: (preset) => {
        set((state) => ({
          presets: {
            ...state.presets,
            [preset.id]: preset,
          },
          lastUpdated: new Date().toISOString(),
        }));
      },

      deletePreset: (presetId) => {
        // デフォルトプリセットは削除不可
        if (['all', 'elementary', 'juniorHigh', 'highSchool'].includes(presetId)) {
          console.warn('デフォルトプリセットは削除できません');
          return;
        }
        
        set((state) => {
          const newPresets = { ...state.presets };
          delete newPresets[presetId];
          
          return {
            presets: newPresets,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      setFilter: (filter) => {
        set({
          currentFilter: filter,
          lastUpdated: new Date().toISOString(),
        });
      },

      clearFilter: () => {
        set({
          currentFilter: {},
          lastUpdated: new Date().toISOString(),
        });
      },

      getVisibleMaterials: () => {
        const state = get();
        const { displaySettings, currentFilter, materials } = state;
        
        // グローバル無効の場合は空配列を返す
        if (!displaySettings.globalEnabled) {
          return [];
        }
        
        // 学年の並び順
        const gradeOrder: Record<string, number> = {
          '小学1年生': 1,
          '小学2年生': 2,
          '小学3年生': 3,
          '小学4年生': 4,
          '小学5年生': 5,
          '小学6年生': 6,
          '中学1年生': 7,
          '中学2年生': 8,
          '中学3年生': 9,
          '高校1年生': 10,
          '高校2年生': 11,
          '高校3年生': 12,
        };
        
        // 教科の並び順
        const subjectOrder: Record<string, number> = {
          '算数': 1,
          '数学': 1,  // 算数と数学は同じ扱い
          '国語': 2,
          '理科': 3,
          '社会': 4,
          '英語': 5,
          '生活科': 6,
          '物理': 7,
          '化学': 8,
          '生物': 9,
          '地理': 10,
          '歴史': 11,
          '公民': 12,
          '情報': 13,
          '総合': 14,
        };
        
        const filteredMaterials = materials.filter(material => {
          // 個別の有効/無効チェック
          if (!displaySettings.byMaterial[material.id]) {
            return false;
          }
          
          // 学年チェック
          if (!displaySettings.byGrade[material.gradeJapanese]) {
            return false;
          }
          
          // 教科チェック
          if (!displaySettings.bySubject[material.subjectJapanese]) {
            return false;
          }
          
          // ステータスチェック
          // 開発中の教材は showDevelopment の設定に従う
          if (material.status === 'development') {
            if (!displaySettings.showDevelopment) {
              return false;
            }
          } else if (!displaySettings.byStatus[material.status]) {
            return false;
          }
          
          // カテゴリーチェック
          if (!displaySettings.byCategory[material.category]) {
            return false;
          }
          
          // 無効化された教材の表示設定
          if (!material.enabled && !displaySettings.showDisabled) {
            return false;
          }
          
          // フィルタ適用
          if (currentFilter.grades && currentFilter.grades.length > 0) {
            if (!currentFilter.grades.includes(material.gradeJapanese)) {
              return false;
            }
          }
          
          if (currentFilter.subjects && currentFilter.subjects.length > 0) {
            if (!currentFilter.subjects.includes(material.subjectJapanese)) {
              return false;
            }
          }
          
          if (currentFilter.categories && currentFilter.categories.length > 0) {
            if (!currentFilter.categories.includes(material.category)) {
              return false;
            }
          }
          
          if (currentFilter.statuses && currentFilter.statuses.length > 0) {
            if (!currentFilter.statuses.includes(material.status)) {
              return false;
            }
          }
          
          if (currentFilter.tags && currentFilter.tags.length > 0) {
            const materialTags = material.tags || [];
            const hasTag = currentFilter.tags.some(tag => materialTags.includes(tag));
            if (!hasTag) {
              return false;
            }
          }
          
          if (currentFilter.searchText) {
            const searchLower = currentFilter.searchText.toLowerCase();
            const titleMatch = material.title.toLowerCase().includes(searchLower);
            const descMatch = material.description.toLowerCase().includes(searchLower);
            const tagMatch = (material.tags || []).some(tag => 
              tag.toLowerCase().includes(searchLower)
            );
            
            if (!titleMatch && !descMatch && !tagMatch) {
              return false;
            }
          }
          
          if (currentFilter.enabled !== undefined) {
            if (material.enabled !== currentFilter.enabled) {
              return false;
            }
          }
          
          return true;
        });
        
        // 学年順→教科順でソート
        const sortedMaterials = filteredMaterials.sort((a, b) => {
          // まず学年で比較
          const gradeA = gradeOrder[a.gradeJapanese] || 999;
          const gradeB = gradeOrder[b.gradeJapanese] || 999;
          
          if (gradeA !== gradeB) {
            return gradeA - gradeB;
          }
          
          // 学年が同じ場合は教科で比較
          const subjectA = subjectOrder[a.subjectJapanese] || 999;
          const subjectB = subjectOrder[b.subjectJapanese] || 999;
          
          if (subjectA !== subjectB) {
            return subjectA - subjectB;
          }
          
          // 学年も教科も同じ場合はタイトルで比較
          return a.title.localeCompare(b.title, 'ja');
        });
        
        return sortedMaterials;
      },

      toggleGlobalEnabled: () => {
        set((state) => ({
          displaySettings: {
            ...state.displaySettings,
            globalEnabled: !state.displaySettings.globalEnabled,
          },
          lastUpdated: new Date().toISOString(),
        }));
      },

      toggleShowDevelopment: () => {
        set((state) => ({
          displaySettings: {
            ...state.displaySettings,
            showDevelopment: !state.displaySettings.showDevelopment,
          },
          lastUpdated: new Date().toISOString(),
        }));
      },

      toggleShowDisabled: () => {
        set((state) => ({
          displaySettings: {
            ...state.displaySettings,
            showDisabled: !state.displaySettings.showDisabled,
          },
          lastUpdated: new Date().toISOString(),
        }));
      },

      resetSettings: () => {
        set({
          materials: [...materialMetadataList],
          displaySettings: initialDisplaySettings,
          currentFilter: {},
          presets: defaultPresets,
          lastUpdated: new Date().toISOString(),
        });
      },

      reloadMaterials: () => {
        set((state) => {
          // 新しい教材が追加されているかチェック
          const newMaterials = [...materialMetadataList];
          const currentIds = new Set(state.materials.map(m => m.id));
          const newIds = newMaterials.filter(m => !currentIds.has(m.id));
          
          // 新しい教材のbyMaterial設定を追加
          const updatedByMaterial = { ...state.displaySettings.byMaterial };
          newIds.forEach(material => {
            updatedByMaterial[material.id] = material.enabled;
          });
          
          return {
            materials: newMaterials,
            displaySettings: {
              ...state.displaySettings,
              byMaterial: updatedByMaterial,
            },
            lastUpdated: new Date().toISOString(),
          };
        });
      },
    }),
    {
      name: 'material-settings-storage',
      version: 1,
      // ストレージから読み込んだ後の処理
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 新しい教材が追加されているかチェック
          const currentIds = new Set(state.materials.map(m => m.id));
          const newMaterials = materialMetadataList.filter(m => !currentIds.has(m.id));
          
          if (newMaterials.length > 0) {
            // 新しい教材を追加
            const updatedMaterials = [...state.materials, ...newMaterials];
            const updatedByMaterial = { ...state.displaySettings.byMaterial };
            
            newMaterials.forEach(material => {
              updatedByMaterial[material.id] = material.enabled;
            });
            
            state.materials = updatedMaterials;
            state.displaySettings.byMaterial = updatedByMaterial;
            state.lastUpdated = new Date().toISOString();
            
            console.log(`新しい教材が${newMaterials.length}個追加されました:`, newMaterials.map(m => m.id));
          }
        }
      },
    }
  )
);