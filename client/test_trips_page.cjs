const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\GANESH K S\\.gemini\\antigravity-ide\\brain\\2b3e4310-27ab-4df6-9bfc-f2450a1a92fd';

async function testTripsPage() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });

  console.log('Logging in as Admin...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'ganeshkshassan@gmail.com');
  await page.type('input[type="password"]', 'Ganesh212002#');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1200));

  console.log('Navigating to Admin Bookings Manager...');
  await page.goto('http://localhost:5173/admin/trips', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Desktop Screenshot
  const desktopOut = path.join(ARTIFACT_DIR, 'admin_bookings_desktop.png');
  await page.screenshot({ path: desktopOut, fullPage: true });
  console.log('Saved desktop screenshot to:', desktopOut);

  // Click on the first row to test opening the details drawer
  console.log('Testing Drawer click...');
  const firstRow = await page.$('.booking-table-row');
  if (firstRow) {
    await firstRow.click();
    await new Promise(r => setTimeout(r, 600));
    const drawerOut = path.join(ARTIFACT_DIR, 'admin_bookings_drawer.png');
    await page.screenshot({ path: drawerOut, fullPage: true });
    console.log('Saved drawer screenshot to:', drawerOut);
  }

  // Mobile Screenshot
  console.log('Capturing mobile view...');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/admin/trips', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  const mobileOut = path.join(ARTIFACT_DIR, 'admin_bookings_mobile.png');
  await page.screenshot({ path: mobileOut, fullPage: true });
  console.log('Saved mobile screenshot to:', mobileOut);

  await browser.close();
  console.log('All tests completed successfully!');
}

testTripsPage().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
