import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let count = 0;
walkDir('src', function(filePath) {
  if (filePath.endsWith('.css') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    content = content.replace(/var\(--bg\)/g, 'var(--bg-main)');
    content = content.replace(/var\(--text\)/g, 'var(--text-primary)');
    content = content.replace(/var\(--gray\)/g, 'var(--text-muted)');
    content = content.replace(/var\(--border\)/g, 'var(--border-default)');
    content = content.replace(/var\(--logo-color\)/g, 'var(--primary)');

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      count++;
    }
  }
});
console.log(`Updated legacy CSS vars in ${count} files.`);
