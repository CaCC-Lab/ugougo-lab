/**
 * 教材ソートのテストスクリプト
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// materialMetadata.tsファイルを読み込む
const filePath = path.join(__dirname, '../src/utils/materialMetadata.ts');
const content = fs.readFileSync(filePath, 'utf8');

// 教材情報を抽出
const materials = [];
let currentMaterial = null;

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.includes('id:')) {
    currentMaterial = { id: line.match(/'([^']+)'/)?.[1] };
  } else if (line.includes('title:') && currentMaterial) {
    currentMaterial.title = line.match(/'([^']+)'/)?.[1];
  } else if (line.includes('gradeJapanese:') && currentMaterial) {
    currentMaterial.gradeJapanese = line.match(/'([^']+)'/)?.[1];
  } else if (line.includes('subjectJapanese:') && currentMaterial) {
    currentMaterial.subjectJapanese = line.match(/'([^']+)'/)?.[1];
  } else if (line.includes('status:') && currentMaterial) {
    currentMaterial.status = line.match(/'([^']+)'/)?.[1];
    materials.push(currentMaterial);
    currentMaterial = null;
  }
}

// ソート前の表示
console.log('=== ソート前（元の順序） ===\n');
materials.slice(0, 10).forEach((m, i) => {
  console.log(`${i + 1}. ${m.gradeJapanese} - ${m.subjectJapanese}: ${m.title}`);
});
console.log('...');

// 学年の並び順
const gradeOrder = {
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
const subjectOrder = {
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

// ソート実行
const sortedMaterials = [...materials].sort((a, b) => {
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

// ソート後の表示
console.log('\n=== ソート後（学年順→教科順） ===\n');

let currentGrade = '';
let currentSubject = '';

sortedMaterials.forEach((m, i) => {
  if (m.gradeJapanese !== currentGrade) {
    currentGrade = m.gradeJapanese;
    currentSubject = '';
    console.log(`\n【${currentGrade}】`);
  }
  
  if (m.subjectJapanese !== currentSubject) {
    currentSubject = m.subjectJapanese;
    console.log(`  《${currentSubject}》`);
  }
  
  console.log(`    ${m.title} (${m.status})`);
});

// 統計情報
console.log('\n=== 統計情報 ===');
const gradeCount = {};
const subjectCount = {};

sortedMaterials.forEach(m => {
  gradeCount[m.gradeJapanese] = (gradeCount[m.gradeJapanese] || 0) + 1;
  const key = `${m.gradeJapanese} - ${m.subjectJapanese}`;
  subjectCount[key] = (subjectCount[key] || 0) + 1;
});

console.log('\n学年別教材数:');
Object.entries(gradeCount).forEach(([grade, count]) => {
  console.log(`  ${grade}: ${count}個`);
});

console.log('\n学年・教科別教材数（2個以上のみ表示）:');
Object.entries(subjectCount)
  .filter(([_, count]) => count >= 2)
  .forEach(([key, count]) => {
    console.log(`  ${key}: ${count}個`);
  });