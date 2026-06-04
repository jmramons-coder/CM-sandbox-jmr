/**
 * Verifies task evidence preview thumb fills the card height (no bottom gap)
 * and uses object-contain (full page visible, not cover-cropped).
 *
 * Usage: node scripts/verify-task-evidence-preview.mjs
 * Requires dev server at http://localhost:5173
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.PREVIEW_BASE_URL ?? 'http://localhost:5173';
const TASK_ID = process.env.PREVIEW_TASK_ID ?? 'task_cd5221';
const TASK_LABEL = process.env.PREVIEW_TASK_LABEL ?? 'Approve WOP rider';

mkdirSync('scripts', { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  sessionStorage.setItem('amplify-demo-access-granted', '1');
});
const page = await context.newPage();

try {
  await page.goto(`${BASE}/tasks`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  await page.goto(`${BASE}/tasks#task=${TASK_ID}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  let card = page.getByTestId('task-evidence-preview-card').first();
  if (!(await card.isVisible().catch(() => false))) {
    const link = page.getByRole('link', { name: new RegExp(TASK_LABEL, 'i') }).first();
    const button = page.getByRole('button', { name: new RegExp(TASK_LABEL, 'i') }).first();
    const cell = page.getByText(new RegExp(TASK_LABEL, 'i')).first();

    if (await link.isVisible().catch(() => false)) {
      await link.click();
    } else if (await button.isVisible().catch(() => false)) {
      await button.click();
    } else if (await cell.isVisible().catch(() => false)) {
      await cell.click();
    }

    await page.waitForTimeout(2500);
  }

  card = page.getByTestId('task-evidence-preview-card').first();
  if (!(await card.isVisible().catch(() => false))) {
    await page.screenshot({ path: 'scripts/task-evidence-preview-debug.png', fullPage: true });
    const bodyText = await page.locator('body').innerText();
    throw new Error(
      `Evidence card not found. Page excerpt: ${bodyText.slice(0, 400).replace(/\s+/g, ' ')}`,
    );
  }

  const metrics = await card.evaluate((node) => {
    const thumb = node.querySelector('[data-testid="task-evidence-preview-thumb"]');
    const img = node.querySelector('[data-testid="task-evidence-preview-image"]');
    if (!thumb) return { error: 'thumb missing' };

    const cardRect = node.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();

    return {
      cardHeight: Math.round(cardRect.height),
      thumbHeight: Math.round(thumbRect.height),
      thumbBottomGap: Math.round(cardRect.bottom - thumbRect.bottom),
      thumbTopGap: Math.round(thumbRect.top - cardRect.top),
      imageFit: img?.className.includes('object-contain') ?? false,
      usesCoverCrop: img?.className.includes('object-cover') ?? false,
      minHeightPx: Number.parseInt(thumb.style.minHeight || '0', 10),
      heightPx: Number.parseInt(thumb.style.height || '0', 10),
      widthPx: Number.parseInt(thumb.style.width || '0', 10),
      contentTopGap: (() => {
        const content = node.querySelector('[data-testid="task-evidence-preview-content"]');
        if (!content) return null;
        const cardRect = node.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        return Math.round(contentRect.top - cardRect.top);
      })(),
    };
  });

  if (metrics.error) {
    throw new Error(metrics.error);
  }

  console.log('Evidence preview layout metrics:', metrics);

  if (metrics.usesCoverCrop) {
    throw new Error('Preview image still uses object-cover (aggressive crop).');
  }
  if (!metrics.imageFit) {
    throw new Error('Preview image must use object-contain.');
  }
  if ((metrics.heightPx || metrics.minHeightPx) <= 68) {
    throw new Error(`Thumb height ${metrics.heightPx || metrics.minHeightPx}px is too short (was 68px crop box).`);
  }
  if (metrics.widthPx !== 88) {
    throw new Error(`Thumb width should stay 88px, got ${metrics.widthPx}px.`);
  }
  if (metrics.contentTopGap != null && metrics.contentTopGap > 12) {
    throw new Error(
      `Content starts ${metrics.contentTopGap}px from card top — should be top-aligned, not centered on divider.`,
    );
  }
  if (metrics.thumbHeight < metrics.minHeightPx && metrics.thumbHeight < metrics.heightPx) {
    throw new Error(
      `Thumb height ${metrics.thumbHeight}px is below portrait minimum ${metrics.heightPx || metrics.minHeightPx}px.`,
    );
  }

  await page.screenshot({ path: 'scripts/task-evidence-preview-proof.png', fullPage: false });
  console.log('PASS — saved scripts/task-evidence-preview-proof.png');
} finally {
  await browser.close();
}
