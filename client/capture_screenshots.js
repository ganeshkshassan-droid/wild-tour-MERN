const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\GANESH K S\\.gemini\\antigravity-ide\\brain\\2b3e4310-27ab-4df6-9bfc-f2450a1a92fd';

const viewports = [
  { name: 'login_desktop_1440x900', width: 1440, height: 900 },
  { name: 'login_laptop_1366x768', width: 1366, height: 768 },
  { name: 'login_tablet_768x1024', width: 768, height: 1024 },
  { name: 'login_mobile_375x812', width: 375, height: 812 },
];

async function capture() {
  console.log('Launching browser with Edge...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  for (const vp of viewports) {
    console.log(`Setting viewport ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600)); // Allow entrance animation to complete

    const outPath = path.join(ARTIFACT_DIR, `${vp.name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved screenshot to: ${outPath}`);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
