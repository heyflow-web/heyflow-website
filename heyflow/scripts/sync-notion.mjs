import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import dotenv from 'dotenv';

// ESM 환경에서 __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// .env 또는 .env.local 로드
dotenv.config({ path: path.resolve(rootDir, '.env.local') });
dotenv.config({ path: path.resolve(rootDir, '.env') });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!DATABASE_ID) {
  console.error("❌ NOTION_DATABASE_ID가 설정되지 않았습니다.");
  process.exit(1);
}

// 파일 다운로드 헬퍼 함수
async function downloadMedia(url, id, prefix) {
  if (!url) return '';
  
  try {
    // 임베드 또는 Lottie JSON URL 등 외부 URL일 경우 확장자를 파싱
    let ext = '.png';
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    
    if (pathname.endsWith('.mp4')) ext = '.mp4';
    else if (pathname.endsWith('.mov')) ext = '.mov';
    else if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) ext = '.jpg';
    else if (pathname.endsWith('.gif')) ext = '.gif';
    else if (pathname.endsWith('.json')) ext = '.json'; // Lottie 등
    
    const fileName = `proj-${id}-${prefix}${ext}`;
    const localPath = path.join(rootDir, 'public', 'images', 'projects', fileName);
    const publicPath = `/images/projects/${fileName}`;

    console.log(`📥 다운로드 중: ${prefix} (${url.substring(0, 30)}...)`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`다운로드 실패: ${res.statusText}`);

    const fileStream = fs.createWriteStream(localPath);
    await pipeline(res.body, fileStream);
    console.log(`✅ 완료: ${publicPath}`);

    return publicPath;
  } catch (err) {
    console.error(`❌ 파일 다운로드 에러 (${prefix}):`, err.message);
    return url; // 실패 시 기존 URL 유지
  }
}

// Notion Property 파서
const getPropertyValue = (property, type) => {
  if (!property) return '';
  switch (type) {
    case 'title':
      return property.title?.[0]?.plain_text || '';
    case 'rich_text':
      return property.rich_text?.[0]?.plain_text || '';
    case 'url':
      return property.url || '';
    case 'files':
      if (property.files && property.files.length > 0) {
        const file = property.files[0];
        return file.type === 'external' ? file.external.url : file.file.url;
      }
      return '';
    case 'checkbox':
      return property.checkbox ?? true;
    default:
      return '';
  }
};

async function syncNotion() {
  console.log("🚀 노션 데이터 동기화를 시작합니다...");
  
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sorts: [{ property: 'Order', direction: 'ascending' }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Notion API error: ${res.statusText}`);
    }

    const data = await res.json();
    const projects = [];

    for (const page of data.results) {
      const id = page.id.split('-').join(''); // 고유한 전체 ID 사용
      const title = getPropertyValue(page.properties['Name'], 'title');
      const slug = title ? title.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9가-힣\-]/g, '').toLowerCase() : id;
      console.log(`\n📦 프로젝트 분석 중: ${title || id}`);

      const rawPcImage = getPropertyValue(page.properties['PC Image'], 'files');
      const rawMobileImage = getPropertyValue(page.properties['Mobile Image'], 'files');
      let rawHeroImage = getPropertyValue(page.properties['Hero Image'], 'files');
      
      // Hero Image가 없으면 PC Image로 대체 (기존 notion.ts 로직)
      if (!rawHeroImage && rawPcImage) rawHeroImage = rawPcImage;

      // 파일 다운로드 (병렬 처리)
      const [pcImage, mobileImage, heroImage] = await Promise.all([
        downloadMedia(rawPcImage, slug, 'pc'),
        downloadMedia(rawMobileImage, slug, 'mobile'),
        downloadMedia(rawHeroImage, slug, 'hero')
      ]);

      // 컨텐츠 마크다운 변환
      const mdblocks = await n2m.pageToMarkdown(page.id);
      const mdString = n2m.toMarkdownString(mdblocks);

      const showInHero = page.properties['Hero'] ? getPropertyValue(page.properties['Hero'], 'checkbox') : true;

      projects.push({
        id: page.id,
        title,
        description: getPropertyValue(page.properties['Description'], 'rich_text'),
        pcImage,
        mobileImage,
        heroImage,
        link: getPropertyValue(page.properties['Link'], 'url'),
        content: mdString.parent || '',
        showInHero,
      });
    }

    // data.json 저장
    const dataPath = path.join(rootDir, 'src', 'data.json');
    fs.writeFileSync(dataPath, JSON.stringify(projects, null, 2));
    console.log(`\n🎉 모든 다운로드가 완료되었습니다. 데이터가 ${dataPath} 에 저장되었습니다.`);

  } catch (error) {
    console.error("❌ 노션 동기화 중 에러 발생:", error);
  }
}

syncNotion();
