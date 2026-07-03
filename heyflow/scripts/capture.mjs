import puppeteer from 'puppeteer';
import path from 'path';

async function captureScreenshots() {
  const url = 'https://www.yglogis.co.kr/';
  const artifactsDir = '/Users/myeon/.gemini/antigravity/brain/ff98ceaf-6bb4-485c-bc10-4dbd9c285620/';
  
  console.log(`Launching browser to capture ${url}...`);
  const browser = await puppeteer.launch();
  
  try {
    const page = await browser.newPage();
    
    // PC Version
    console.log('Capturing PC version...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000)); // 5초 추가 대기 (애니메이션 등)
    await page.screenshot({ path: path.join(artifactsDir, 'yglogis-pc.png'), fullPage: true });
    
    // Mobile Version
    console.log('Capturing Mobile version...');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000)); // 5초 추가 대기
    await page.screenshot({ path: path.join(artifactsDir, 'yglogis-mobile.png'), fullPage: true });

    console.log('Screenshots captured successfully.');
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
