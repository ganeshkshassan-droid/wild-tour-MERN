const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\GANESH K S\\.gemini\\antigravity-ide\\brain\\2b3e4310-27ab-4df6-9bfc-f2450a1a92fd';

async function testMyTrips() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('Logging in as user...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'ganeshkshassan@gmail.com');
  await page.type('input[type="password"]', 'Ganesh212002#');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1200));

  console.log('Navigating to My Trips (/trips)...');
  await page.goto('http://localhost:5173/trips', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Desktop Screenshot
  const desktopOut = path.join(ARTIFACT_DIR, 'my_trips_desktop.png');
  await page.screenshot({ path: desktopOut, fullPage: true });
  console.log('Saved desktop screenshot to:', desktopOut);

  // 2. Click "View Boarding Pass" on the first card
  console.log('Testing Boarding Pass modal...');
  const passBtn = await page.$('.trip-action-btn.primary');
  if (passBtn) {
    await passBtn.click();
    await new Promise(r => setTimeout(r, 600));
    const passOut = path.join(ARTIFACT_DIR, 'my_trips_pass_modal.png');
    await page.screenshot({ path: passOut, fullPage: true });
    console.log('Saved pass modal screenshot to:', passOut);

    // Close modal
    const closeBtn = await page.$('.modal-close-btn, .btn-close, button[aria-label="Close"]');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 300));
  }

  // 3. Mobile Screenshot
  console.log('Capturing mobile view...');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/trips', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  const mobileOut = path.join(ARTIFACT_DIR, 'my_trips_mobile.png');
  await page.screenshot({ path: mobileOut, fullPage: true });
  console.log('Saved mobile screenshot to:', mobileOut);

  await browser.close();
  console.log('All MyTrips tests completed successfully!');
}

testMyTrips().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
