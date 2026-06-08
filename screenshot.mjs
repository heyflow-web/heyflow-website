import { chromium, devices } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  
  // 1. PC 스크린샷
  console.log("PC 스크린샷 찍는 중...");
  const page = await browser.newPage();
  // 이미지가 로드될 때까지(networkidle) 대기, 추가로 3초 더 대기
  await page.goto('https://aurora-dermatology.vercel.app/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000); // 레이지 로딩 고려 대기
  await page.screenshot({ path: 'public/images/aurora_pc.png', fullPage: true });

  // 2. 모바일 스크린샷 (iPhone 13)
  console.log("모바일 스크린샷 찍는 중...");
  const iPhone13 = devices['iPhone 13'];
  const mobilePage = await browser.newPage({
    ...iPhone13
  });
  await mobilePage.goto('https://aurora-dermatology.vercel.app/', { waitUntil: 'networkidle', timeout: 60000 });
  await mobilePage.waitForTimeout(3000); // 레이지 로딩 고려 대기
  await mobilePage.screenshot({ path: 'public/images/aurora_mobile.png', fullPage: true });

  await browser.close();
  console.log("스크린샷 성공!");
})();
