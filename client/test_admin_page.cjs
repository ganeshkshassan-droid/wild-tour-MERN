const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\GANESH K S\\.gemini\\antigravity-ide\\brain\\2b3e4310-27ab-4df6-9bfc-f2450a1a92fd';

async function testAdminPage() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // Listen to console errors in browser
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });

  console.log('Navigating to Login...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

  // Fill in login form
  await page.type('input[type="email"]', 'ganeshkshassan@gmail.com');
  await page.type('input[type="password"]', 'Ganesh212002#');

  console.log('Submitting login...');
  await page.click('button[type="submit"]');

  // Wait for navigation / dashboard load
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  console.log('Current URL:', page.url());

  const outPath = path.join(ARTIFACT_DIR, 'admin_dashboard_preview.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved admin preview screenshot to:', outPath);

  await browser.close();
}

testAdminPage().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
