import fs from 'fs';

const tsxPath = 'src/components/GlobalContact.tsx';
let tsxContent = fs.readFileSync(tsxPath, 'utf-8');

tsxContent = tsxContent.replace(
  /<Link href="\/" className=\{styles\.modalBrand\} onClick=\{.*?\}\>\s*<Logo \/>\s*<\/Link>/,
  ''
);
fs.writeFileSync(tsxPath, tsxContent);

const cssPath = 'src/components/GlobalContact.module.css';
let cssContent = fs.readFileSync(cssPath, 'utf-8');

cssContent = cssContent.replace(
  'padding: 10vw;',
  'padding: 2vw;'
);

cssContent = cssContent.replace(
  'max-height: calc(100vh - 10vw);',
  'max-height: calc(100vh - 4vw);'
);

cssContent = cssContent.replace(
  'justify-content: space-between;',
  'justify-content: flex-end;'
);

cssContent = cssContent.replace(
  'padding: 5vw;',
  'padding: 2vw;'
);

fs.writeFileSync(cssPath, cssContent);

console.log('Update completed.');
