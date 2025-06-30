#!/usr/bin/env node

/**
 * 教材分析スクリプト
 * materialMetadata.tsの内容を分析して統計情報を出力
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// materialMetadata.tsを読み込み
const metadataPath = path.join(__dirname, '../src/utils/materialMetadata.ts');
const content = fs.readFileSync(metadataPath, 'utf-8');

// 教材データを抽出（簡易的なパース）
const materials = [];
const lines = content.split('\n');
let currentMaterial = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line === '{') {
    currentMaterial = {};
  } else if (line === '},') {
    if (currentMaterial && currentMaterial.id) {
      materials.push(currentMaterial);
    }
    currentMaterial = null;
  } else if (currentMaterial && line.includes(':')) {
    const match = line.match(/(\w+):\s*'([^']*)'|(\w+):\s*"([^"]*)"|(\w+):\s*(\w+),?/);
    if (match) {
      const key = match[1] || match[3] || match[5];
      const value = match[2] || match[4] || match[6];
      if (key && value) {
        currentMaterial[key] = value;
      }
    }
  }
}

// 統計情報を集計
const stats = {
  total: materials.length,
  byStatus: {},
  byGrade: {},
  bySubject: {},
  byCategory: {},
  byModuleType: {}
};

// ステータス別、学年別、教科別、カテゴリー別、モジュールタイプ別に集計
materials.forEach(material => {
  // ステータス別
  stats.byStatus[material.status] = (stats.byStatus[material.status] || 0) + 1;
  
  // 学年別
  stats.byGrade[material.gradeJapanese] = (stats.byGrade[material.gradeJapanese] || 0) + 1;
  
  // 教科別
  stats.bySubject[material.subjectJapanese] = (stats.bySubject[material.subjectJapanese] || 0) + 1;
  
  // カテゴリー別
  stats.byCategory[material.category] = (stats.byCategory[material.category] || 0) + 1;
  
  // モジュールタイプ別
  stats.byModuleType[material.moduleType] = (stats.byModuleType[material.moduleType] || 0) + 1;
});

// 重複・類似教材の分析
const duplicateGroups = {
  fraction: [],
  graph: [],
  electric: [],
  english: [],
  calculation: [],
  science: [],
  chemistry: [],
  geography: []
};

materials.forEach(material => {
  const id = material.id;
  const title = material.title;
  
  // 分数関連
  if (id.includes('fraction') || title.includes('分数')) {
    duplicateGroups.fraction.push({ id, title, grade: material.gradeJapanese });
  }
  
  // グラフ関連
  if (id.includes('graph') || id.includes('function') || title.includes('グラフ') || title.includes('関数')) {
    duplicateGroups.graph.push({ id, title, grade: material.gradeJapanese });
  }
  
  // 電気関連
  if (id.includes('electric') || id.includes('circuit') || title.includes('電気') || title.includes('回路')) {
    duplicateGroups.electric.push({ id, title, grade: material.gradeJapanese });
  }
  
  // 英語関連
  if (id.includes('english') || id.includes('pronunciation') || id.includes('speaking')) {
    duplicateGroups.english.push({ id, title, grade: material.gradeJapanese });
  }
  
  // 計算関連
  if (id.includes('addition') || id.includes('subtraction') || id.includes('multiplication') || 
      id.includes('number') || title.includes('計算') || title.includes('たし算') || 
      title.includes('ひき算') || title.includes('かけ算')) {
    duplicateGroups.calculation.push({ id, title, grade: material.gradeJapanese });
  }
  
  // 理科実験関連
  if ((material.subjectJapanese === '理科' && material.category === 'simulation') || 
      title.includes('実験') || title.includes('シミュレーター')) {
    duplicateGroups.science.push({ id, title, grade: material.gradeJapanese });
  }
  
  // 化学関連
  if (id.includes('atom') || id.includes('molecule') || id.includes('chemical') || 
      id.includes('element') || title.includes('原子') || title.includes('分子') || 
      title.includes('化学') || title.includes('元素')) {
    duplicateGroups.chemistry.push({ id, title, grade: material.gradeJapanese });
  }
  
  // 地理関連
  if (material.subjectJapanese === '社会' || material.subjectJapanese === '生活科' || 
      title.includes('地図') || title.includes('マップ') || title.includes('地帯')) {
    duplicateGroups.geography.push({ id, title, grade: material.gradeJapanese });
  }
});

// 結果を出力
console.log('=== 教材統計情報 ===\n');
console.log(`総教材数: ${stats.total}`);

console.log('\n## ステータス別');
Object.entries(stats.byStatus).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
  console.log(`- ${status}: ${count}教材`);
});

console.log('\n## 学年別');
Object.entries(stats.byGrade).sort((a, b) => {
  const gradeOrder = ['小学1年生', '小学2年生', '小学3年生', '小学4年生', '小学5年生', '小学6年生',
                      '中学1年生', '中学2年生', '中学3年生', '高校1年生', '高校2年生', '高校3年生'];
  return gradeOrder.indexOf(a[0]) - gradeOrder.indexOf(b[0]);
}).forEach(([grade, count]) => {
  console.log(`- ${grade}: ${count}教材`);
});

console.log('\n## 教科別');
Object.entries(stats.bySubject).sort((a, b) => b[1] - a[1]).forEach(([subject, count]) => {
  console.log(`- ${subject}: ${count}教材`);
});

console.log('\n## カテゴリー別');
Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
  console.log(`- ${category}: ${count}教材`);
});

console.log('\n## モジュールタイプ別');
Object.entries(stats.byModuleType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
  console.log(`- ${type}: ${count}教材`);
});

console.log('\n=== 重複・類似教材グループ ===\n');
Object.entries(duplicateGroups).forEach(([group, materials]) => {
  if (materials.length > 1) {
    console.log(`## ${group}関連 (${materials.length}教材)`);
    materials.forEach(m => {
      console.log(`- ${m.id}: ${m.title} (${m.grade})`);
    });
    console.log('');
  }
});

// 詳細レポートをファイルに出力
const report = {
  timestamp: new Date().toISOString(),
  stats,
  duplicateGroups,
  materials: materials.map(m => ({
    id: m.id,
    title: m.title,
    grade: m.gradeJapanese,
    subject: m.subjectJapanese,
    category: m.category,
    status: m.status,
    moduleType: m.moduleType
  }))
};

fs.writeFileSync(
  path.join(__dirname, 'material-analysis-detail.json'),
  JSON.stringify(report, null, 2),
  'utf-8'
);

console.log('\n詳細レポートを material-analysis-detail.json に出力しました。');