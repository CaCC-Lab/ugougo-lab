/**
 * 教材のステータス一覧を表示するスクリプト
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
    currentMaterial.grade = line.match(/'([^']+)'/)?.[1];
  } else if (line.includes('subjectJapanese:') && currentMaterial) {
    currentMaterial.subject = line.match(/'([^']+)'/)?.[1];
  } else if (line.includes('status:') && currentMaterial) {
    currentMaterial.status = line.match(/'([^']+)'/)?.[1];
    materials.push(currentMaterial);
    currentMaterial = null;
  }
}

// ステータス別に集計
const statusCount = {
  published: 0,
  testing: 0,
  development: 0
};

// ステータス別表示
console.log('=== 教材ステータス一覧 ===\n');

// 開発中の教材
console.log('【開発中】');
materials.filter(m => m.status === 'development').forEach(m => {
  console.log(`  ${m.title} (${m.grade} ${m.subject})`);
  statusCount.development++;
});

console.log('\n【テスト中】');
materials.filter(m => m.status === 'testing').forEach(m => {
  console.log(`  ${m.title} (${m.grade} ${m.subject})`);
  statusCount.testing++;
});

console.log('\n【公開中】');
materials.filter(m => m.status === 'published').forEach(m => {
  console.log(`  ${m.title} (${m.grade} ${m.subject})`);
  statusCount.published++;
});

console.log('\n=== 集計 ===');
console.log(`開発中: ${statusCount.development}個`);
console.log(`テスト中: ${statusCount.testing}個`);
console.log(`公開中: ${statusCount.published}個`);
console.log(`合計: ${materials.length}個`);