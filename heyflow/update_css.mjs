import fs from 'fs';

const filePath = 'src/app/page.module.css';
let content = fs.readFileSync(filePath, 'utf-8');

// Colors & Backgrounds
content = content.replace(/var\(--background\)/g, 'var(--bg-main)');
content = content.replace(/var\(--foreground\)/g, 'var(--text-primary)');
content = content.replace(/var\(--border-color\)/g, 'var(--border-default)');
content = content.replace(/background-color:\s*#ffffff;/gi, 'background-color: var(--bg-surface-elevated);');
content = content.replace(/background-color:\s*#F8F9FA;/gi, 'background-color: var(--bg-surface);');
content = content.replace(/background-color:\s*#FAFAFA;/gi, 'background-color: var(--bg-surface);');
content = content.replace(/color:\s*#ffffff;/gi, 'color: var(--bg-main);');

// Typography
content = content.replace(/font-size:\s*4rem;/g, 'font-size: var(--font-hero);');
content = content.replace(/font-size:\s*3\.5rem;/g, 'font-size: var(--font-hero);');
content = content.replace(/font-size:\s*2\.5rem;/g, 'font-size: var(--font-h1);');
content = content.replace(/font-size:\s*2rem;/g, 'font-size: var(--font-h2);');
content = content.replace(/font-size:\s*1\.5rem;/g, 'font-size: var(--font-h3);');

// Spacing
content = content.replace(/var\(--section-padding\)/g, 'var(--space-xl)');
content = content.replace(/border-radius:\s*12px;/g, 'border-radius: var(--radius-md);');
content = content.replace(/border-radius:\s*8px;/g, 'border-radius: var(--radius-sm);');

fs.writeFileSync(filePath, content);
console.log('page.module.css updated.');
