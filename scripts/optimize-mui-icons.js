#!/usr/bin/env node

/**
 * MUIアイコンのバレルインポートを個別インポートに変換するスクリプト
 * 
 * 変換前: import { Add, Remove } from '@mui/icons-material';
 * 変換後: import Add from '@mui/icons-material/Add';
 *         import Remove from '@mui/icons-material/Remove';
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ファイルパターン
const filePattern = 'src/**/*.{ts,tsx}';

// インポート文のパターン
const importPattern = /import\s*{([^}]+)}\s*from\s*['"]@mui\/icons-material['"]/g;

// 変換統計
let totalFiles = 0;
let modifiedFiles = 0;
let totalIcons = 0;

// ファイルを処理
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let newContent = content;

  // インポート文を探して変換
  newContent = newContent.replace(importPattern, (match, icons) => {
    modified = true;
    const iconList = icons.split(',').map(icon => {
      const parts = icon.trim().split(/\s+as\s+/);
      const importName = parts[0].trim();
      const alias = parts[1] ? parts[1].trim() : importName;
      totalIcons++;
      
      if (importName !== alias) {
        return `import ${alias} from '@mui/icons-material/${importName}';`;
      } else {
        return `import ${importName} from '@mui/icons-material/${importName}';`;
      }
    });
    
    return iconList.join('\n');
  });

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    modifiedFiles++;
    console.log(`✓ ${filePath}`);
  }
}

// メイン処理
console.log('🎨 MUIアイコン最適化開始...\n');

glob(filePattern, (err, files) => {
  if (err) {
    console.error('エラー:', err);
    process.exit(1);
  }

  totalFiles = files.length;
  
  files.forEach(file => {
    processFile(file);
  });

  console.log('\n📊 最適化結果:');
  console.log(`  - 処理ファイル数: ${totalFiles}`);
  console.log(`  - 変更ファイル数: ${modifiedFiles}`);
  console.log(`  - 変換アイコン数: ${totalIcons}`);
});