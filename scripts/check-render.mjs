import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`PAGE: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`CON: ${m.text()}`);
});

await page.goto('http://localhost:5199/', { waitUntil: 'networkidle', timeout: 20000 });
await page.evaluate(() => {
  sessionStorage.setItem('amplify-demo-access-granted', '1');
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const snap = await page.evaluate(() => {
  const root = document.getElementById('root');
  const dialogs = document.querySelectorAll('[data-slot="dialog-content"]');
  const overlays = document.querySelectorAll('[data-slot="dialog-overlay"]');
  return {
    url: location.href,
    rootLen: root?.innerHTML?.length ?? 0,
    rootText: root?.innerText?.slice(0, 300) ?? '',
    dialogCount: dialogs.length,
    overlayCount: overlays.length,
    dialogs: Array.from(dialogs).map((d) => ({
      state: d.getAttribute('data-state'),
      display: getComputedStyle(d).display,
      visibility: getComputedStyle(d).visibility,
      opacity: getComputedStyle(d).opacity,
      rect: d.getBoundingClientRect(),
    })),
    header: document.querySelector('header')?.innerText?.slice(0, 80),
    main: document.querySelector('main')?.innerText?.slice(0, 80),
  };
});

console.log(JSON.stringify(snap, null, 2));
if (errors.length) console.log('ERRORS:\n', errors.join('\n'));
await page.screenshot({ path: '/tmp/amplify-check.png', fullPage: true });
console.log('screenshot /tmp/amplify-check.png');
await browser.close();
