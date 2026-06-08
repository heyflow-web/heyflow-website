import { chromium, devices } from 'playwright';

// 스크롤을 맨 아래까지 서서히 내리면서 레이지 로딩(Lazy Loading) 및 스크롤 애니메이션 이미지를 강제로 불러오는 함수
async function autoScroll(page){
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      let distance = 300;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if(totalHeight >= scrollHeight - window.innerHeight){
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

(async () => {
  const browser = await chromium.launch();
  
  // 1. PC 스크린샷
  console.log("PC 스크린샷 찍는 중 (스크롤 로딩 포함)...");
  const page = await browser.newPage();
  await page.goto('https://aurora-dermatology.vercel.app/', { waitUntil: 'networkidle', timeout: 60000 });
  await autoScroll(page);
  await page.waitForTimeout(3000); // 이미지 파싱 추가 대기
  await page.evaluate(() => window.scrollTo(0, 0)); // 스샷 퀄리티를 위해 맨 위로 복귀
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/images/aurora_pc.png', fullPage: true });

  // 2. 모바일 스크린샷 (iPhone 13)
  console.log("모바일 스크린샷 찍는 중 (스크롤 로딩 포함)...");
  const iPhone13 = devices['iPhone 13'];
  const mobilePage = await browser.newPage({ ...iPhone13 });
  await mobilePage.goto('https://aurora-dermatology.vercel.app/', { waitUntil: 'networkidle', timeout: 60000 });
  await autoScroll(mobilePage);
  await mobilePage.waitForTimeout(3000); // 이미지 파싱 추가 대기
  await mobilePage.evaluate(() => window.scrollTo(0, 0)); // 스샷 퀄리티를 위해 맨 위로 복귀
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: 'public/images/aurora_mobile.png', fullPage: true });

  await browser.close();
  console.log("스크린샷 성공!");
})();
