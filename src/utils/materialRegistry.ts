// 教材のメタデータを管理するレジストリ

export interface MaterialMetadata {
  id: string;
  name: string;
  subject: string;
  grade: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

// 教材一覧（TODO.mdから抽出）
const materials: MaterialMetadata[] = [
  // 小学1年生
  { id: 'number-blocks', name: '数の合成・分解ブロック', subject: '算数', grade: '小学1年' },
  { id: 'addition-subtraction', name: 'たし算・ひき算ビジュアライザー', subject: '算数', grade: '小学1年' },
  { id: 'clock-learning', name: '時計の読み方学習ツール', subject: '算数', grade: '小学1年' },
  { id: 'hiragana-stroke', name: 'ひらがな書き順アニメーション', subject: '国語', grade: '小学1年' },
  { id: 'word-picture-match', name: '絵と言葉のマッチングゲーム', subject: '国語', grade: '小学1年' },
  
  // 小学2年生
  { id: 'multiplication-table', name: 'かけ算九九の視覚化', subject: '算数', grade: '小学2年' },
  { id: 'unit-converter', name: '長さ・かさの単位変換ツール', subject: '算数', grade: '小学2年' },
  { id: 'plant-growth', name: '植物の成長シミュレーター', subject: '生活科', grade: '小学2年' },
  { id: 'town-exploration', name: '町たんけんマップ', subject: '生活科', grade: '小学2年' },
  
  // 小学3年生
  { id: 'fraction-visualizer', name: '分数の視覚化', subject: '算数', grade: '小学3年' },
  { id: 'fraction-pizza', name: '分数ピザカッター', subject: '算数', grade: '小学3年' },
  { id: 'fraction-master', name: '分数マスターツール', subject: '算数', grade: '小学3年' },
  { id: 'magnet-simulator', name: '磁石の実験シミュレーター', subject: '理科', grade: '小学3年' },
  { id: 'insect-metamorphosis', name: '昆虫の変態シミュレーター', subject: '理科', grade: '小学3年' },
  { id: 'compass-simulator', name: '方位磁針シミュレーター', subject: '社会', grade: '小学3年' },
  
  // 小学4年生
  { id: 'area-calculator', name: '面積計算ツール', subject: '算数', grade: '小学4年' },
  { id: 'angle-measurement', name: '角度測定器', subject: '算数', grade: '小学4年' },
  { id: 'water-state', name: '水の三態変化アニメーション', subject: '理科', grade: '小学4年' },
  { id: 'electric-circuit', name: '電気回路シミュレーター', subject: '理科', grade: '小学4年' },
  { id: 'prefecture-puzzle', name: '都道府県パズル', subject: '社会', grade: '小学4年' },
  { id: 'abstract-thinking', name: '抽象的思考への橋', subject: '総合', grade: '小学4年' },
  
  // 小学5年生
  { id: 'speed-calculator', name: '速さ・時間・距離の関係シミュレーター', subject: '算数', grade: '小学5年' },
  { id: 'pendulum-lab', name: '振り子の実験装置', subject: '理科', grade: '小学5年' },
  { id: 'weather-simulator', name: '天気の変化シミュレーター', subject: '理科', grade: '小学5年' },
  { id: 'industrial-map', name: '工業地帯マップ', subject: '社会', grade: '小学5年' },
  
  // 小学6年生
  { id: 'proportion-graph', name: '比例・反比例グラフツール', subject: '算数', grade: '小学6年' },
  { id: 'combination-counter', name: '場合の数シミュレーター', subject: '算数', grade: '小学6年' },
  { id: 'lever-principle', name: 'てこの原理実験器', subject: '理科', grade: '小学6年' },
  { id: 'human-body', name: '人体の仕組みアニメーション', subject: '理科', grade: '小学6年' },
  
  // 中学1年生
  { id: 'number-line', name: '正負の数の数直線', subject: '数学', grade: '中学1年' },
  { id: 'moving-point', name: '動く点P - 三角形の面積変化', subject: '数学', grade: '中学1年' },
  { id: 'algebraic-expression', name: '文字式変形ツール', subject: '数学', grade: '中学1年' },
  { id: 'algebra-intro', name: '代数入門システム', subject: '数学', grade: '中学1年' },
  { id: 'light-refraction', name: '光の屈折実験器', subject: '理科', grade: '中学1年' },
  { id: 'seismic-wave', name: '地震波シミュレーター', subject: '理科', grade: '中学1年' },
  { id: 'speaking-practice', name: '英語スピーキング練習システム', subject: '英語', grade: '中学1年' },
  { id: 'pronunciation', name: '発音練習ツール', subject: '英語', grade: '中学1年' },
  { id: 'time-difference', name: '時差計算ツール', subject: '社会', grade: '中学1年' },
  
  // 中学2年生
  { id: 'linear-function', name: '一次関数グラフ描画ツール', subject: '数学', grade: '中学2年' },
  { id: 'proof-builder', name: '証明ステップビルダー', subject: '数学', grade: '中学2年' },
  { id: 'molecular-structure', name: '原子・分子構造シミュレーション', subject: '理科', grade: '中学2年' },
  { id: 'chemical-reaction', name: '化学反応シミュレーター', subject: '理科', grade: '中学2年' },
  { id: 'element-puzzle', name: '元素記号パズルゲーム', subject: '理科', grade: '中学2年' },
  { id: 'circuit-ohm', name: '電流・電圧・抵抗の関係実験器', subject: '理科', grade: '中学2年' },
  
  // 中学3年生
  { id: 'quadratic-function', name: '二次関数グラフ変形ツール', subject: '数学', grade: '中学3年' },
  { id: 'sorting-algorithm', name: 'ソートアルゴリズム可視化', subject: '情報', grade: '中学3年' },
  { id: 'inertia-simulation', name: '慣性の法則シミュレーション', subject: '理科', grade: '中学3年' },
  { id: 'celestial-motion', name: '天体の動きシミュレーター', subject: '理科', grade: '中学3年' },
  
  // 高校1年生
  { id: 'function-graph', name: '関数グラフ動的描画ツール', subject: '数学', grade: '高校1年' },
  { id: 'trigonometric-graph', name: '三角関数グラフ描画ツール', subject: '数学', grade: '高校1年' },
  { id: 'typing-game', name: 'ぷよぷよ風タイピングゲーム', subject: '情報', grade: '高校1年' },
  
  // 高校2年生
  { id: 'calculus-visualizer', name: '微分積分ビジュアライザー', subject: '数学', grade: '高校2年' },
];

// マテリアルレジストリクラス
class MaterialRegistry {
  private materialsMap: Map<string, MaterialMetadata>;
  
  constructor() {
    this.materialsMap = new Map();
    materials.forEach(material => {
      this.materialsMap.set(material.id, material);
    });
  }
  
  // IDから教材メタデータを取得
  getMaterial(id: string): MaterialMetadata | undefined {
    return this.materialsMap.get(id);
  }
  
  // すべての教材を取得
  getAllMaterials(): MaterialMetadata[] {
    return Array.from(this.materialsMap.values());
  }
  
  // 学年で絞り込み
  getMaterialsByGrade(grade: string): MaterialMetadata[] {
    return Array.from(this.materialsMap.values()).filter(m => m.grade === grade);
  }
  
  // 教科で絞り込み
  getMaterialsBySubject(subject: string): MaterialMetadata[] {
    return Array.from(this.materialsMap.values()).filter(m => m.subject === subject);
  }
  
  // 教材の総数
  getTotalCount(): number {
    return this.materialsMap.size;
  }
}

// シングルトンインスタンスをエクスポート
export const materialRegistry = new MaterialRegistry();