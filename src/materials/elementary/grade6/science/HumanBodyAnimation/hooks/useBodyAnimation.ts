import { Organ } from '../HumanBodyAnimation';

export const useBodyAnimation = () => {
  const organs: Organ[] = [
    // 循環器系
    {
      id: 'heart',
      name: '心臓',
      system: 'circulatory',
      position: { x: 50, y: 35 },
      description: '血液を全身に送り出すポンプの役割をする臓器です。',
      function: '血液を動脈に送り出し、全身に酸素と栄養を届けます。'
    },
    {
      id: 'arteries',
      name: '動脈',
      system: 'circulatory',
      position: { x: 50, y: 50 },
      description: '心臓から送り出された血液を全身に運ぶ血管です。',
      function: '酸素を多く含んだ血液を体の各部分に届けます。'
    },
    {
      id: 'veins',
      name: '静脈',
      system: 'circulatory',
      position: { x: 50, y: 60 },
      description: '全身から心臓に血液を戻す血管です。',
      function: '二酸化炭素を含んだ血液を心臓に戻します。'
    },
    
    // 呼吸器系
    {
      id: 'lungs',
      name: '肺',
      system: 'respiratory',
      position: { x: 50, y: 45 },
      description: '呼吸によって酸素を取り込み、二酸化炭素を出す臓器です。',
      function: '空気中の酸素を血液に取り込み、二酸化炭素を体外に出します。'
    },
    {
      id: 'trachea',
      name: '気管',
      system: 'respiratory',
      position: { x: 50, y: 30 },
      description: '鼻や口から肺へ空気を通す管です。',
      function: '空気を肺に送り、肺から出る空気を外に出します。'
    },
    {
      id: 'diaphragm',
      name: '横隔膜',
      system: 'respiratory',
      position: { x: 50, y: 60 },
      description: '呼吸を助ける筋肉で、胸腔と腹腔を分けています。',
      function: '収縮・弛緩することで肺を膨らませたり縮めたりします。'
    },
    
    // 消化器系
    {
      id: 'stomach',
      name: '胃',
      system: 'digestive',
      position: { x: 45, y: 42 },
      description: '食べ物を一時的にためて、胃液で消化する臓器です。',
      function: '胃液を分泌して食べ物を溶かし、小腸での消化を助けます。'
    },
    {
      id: 'smallIntestine',
      name: '小腸',
      system: 'digestive',
      position: { x: 50, y: 58 },
      description: '食べ物から栄養を吸収する最も重要な臓器です。',
      function: '消化された食べ物から栄養分を吸収し、血液に送ります。'
    },
    {
      id: 'largeIntestine',
      name: '大腸',
      system: 'digestive',
      position: { x: 50, y: 65 },
      description: '水分を吸収し、便を作る臓器です。',
      function: '残った食べ物から水分を吸収し、便として体外に出す準備をします。'
    },
    {
      id: 'liver',
      name: '肝臓',
      system: 'digestive',
      position: { x: 60, y: 42 },
      description: '体の中で最も大きな臓器で、様々な働きをします。',
      function: '栄養の貯蔵、毒素の分解、胆汁の生成など500以上の働きがあります。'
    }
  ];

  const getSystemOrgans = (system: 'circulatory' | 'respiratory' | 'digestive'): Organ[] => {
    return organs.filter(organ => organ.system === system);
  };

  const getOrganById = (id: string): Organ | undefined => {
    return organs.find(organ => organ.id === id);
  };

  return {
    organs,
    getSystemOrgans,
    getOrganById
  };
};