const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\GANESH K S\\.gemini\\antigravity-ide\\brain\\2b3e4310-27ab-4df6-9bfc-f2450a1a92fd';

async function testPerformanceRanges() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('Logging in as Admin...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'ganeshkshassan@gmail.com');
  await page.type('input[type="password"]', 'Ganesh212002#');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1200));

  console.log('Navigating to Admin Dashboard...');
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Capture 30 Days (Default)
  console.log('Capturing 30 Days view...');
  const out30d = path.join(ARTIFACT_DIR, 'perf_30d_view.png');
  await page.screenshot({ path: out30d, fullPage: true });
  console.log('Saved 30D screenshot to:', out30d);

  // 2. Click "7 Days" button
  console.log('Clicking 7 Days range button...');
  const btn7d = (await page.$$('.timeframe-btn'))[0];
  if (btn7d) {
    await btn7d.click();
    await new Promise(r => setTimeout(r, 1000));
    const out7d = path.join(ARTIFACT_DIR, 'perf_7d_view.png');
    await page.screenshot({ path: out7d, fullPage: true });
    console.log('Saved 7D screenshot to:', out7d);
  }

  // 3. Click "6 Months" button
  console.log('Clicking 6 Months range button...');
  const btn6m = (await page.$$('.timeframe-btn'))[2];
  if (btn6m) {
    await btn6m.click();
    await new Promise(r => setTimeout(r, 1000));
    const out6m = path.join(ARTIFACT_DIR, 'perf_6m_view.png');
    await page.screenshot({ path: out6m, fullPage: true });
    console.log('Saved 6M screenshot to:', out6m);
  }

  await browser.close();
  console.log('All performance range tests completed successfully!');
}

testPerformanceRanges().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
