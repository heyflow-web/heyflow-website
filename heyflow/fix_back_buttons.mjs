import fs from 'fs';

// 1. Fix BoardDetailClient
const boardTsx = 'src/app/board/[id]/BoardDetailClient.tsx';
let boardContent = fs.readFileSync(boardTsx, 'utf-8');
boardContent = boardContent.replace(
  '<Link href="/board" className={styles.backBtn}>\n            &larr; Back to List\n          </Link>',
  '<Link href="/board" className={styles.backBtn}>\n            &larr; Back\n          </Link>'
);
boardContent = boardContent.replace(
  '<Link href="/board" className={styles.backBtn}>\n          &larr; Back to List\n        </Link>',
  '<Link href="/board" className={styles.backBtn}>\n          &larr; Back\n        </Link>'
);
fs.writeFileSync(boardTsx, boardContent);

// 2. Fix Board detail CSS
const boardCss = 'src/app/board/[id]/detail.module.css';
let boardCssContent = fs.readFileSync(boardCss, 'utf-8');
boardCssContent = boardCssContent.replace('border-bottom: 1px solid var(--text-primary);\n', '');
boardCssContent = boardCssContent.replace('padding-bottom: 0.2rem;\n', '');
fs.writeFileSync(boardCss, boardCssContent);

// 3. Fix Project detail CSS
const projectCss = 'src/app/projects/[id]/detail.module.css';
let projectCssContent = fs.readFileSync(projectCss, 'utf-8');
projectCssContent = projectCssContent.replace('border-bottom: 1px solid var(--text-primary);\n', '');
projectCssContent = projectCssContent.replace('padding-bottom: 0.2rem;\n', '');
fs.writeFileSync(projectCss, projectCssContent);

console.log('Back buttons unified.');
