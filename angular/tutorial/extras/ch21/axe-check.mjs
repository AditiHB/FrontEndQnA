// Usage:  node axe-check.mjs [/,/cart,/login] [http://localhost:4200]
// Needs:  npm install --save-dev playwright-core axe-core   (and a Chrome/Chromium browser)
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
const base = process.argv[3] || 'http://localhost:4200';
const axeSrc = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const pages = (process.argv[2] || '/,/cart,/login,/product/1,/wishlist').split(',');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
let total = 0;
for (const path of pages) {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.evaluate(axeSrc);
  const res = await page.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] }));
  console.log(`\n${path}: ${res.violations.length} problem(s)`);
  for (const v of res.violations) {
    total += v.nodes.length;
    console.log(`  - [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} place(s))`);
    for (const n of v.nodes.slice(0, 2)) console.log(`      ${n.target.join(' ')}  ${(n.failureSummary || '').split('\n')[1] || ''}`);
  }
}
console.log('\nTOTAL places:', total);
await browser.close();
