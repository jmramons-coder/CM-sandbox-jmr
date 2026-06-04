/**
 * Renders Empire document previews with highlight overlays for visual calibration.
 * Usage: node scripts/verify-empire-document-highlights.mjs
 * Requires dev server at http://localhost:5173
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.PREVIEW_BASE_URL ?? 'http://localhost:5173';
const CASE_ID = 'NB-2026-4401';
const DOC_IDS = [
  'doc_emp_nb_app',
  'doc_emp_nb_needs',
  'doc_emp_nb_mib',
  'doc_emp_nb_lab_req',
  'doc_emp_nb_rx',
  'doc_emp_nb_scuba_sent',
  'doc_emp_nb_scuba_reminder',
  'doc_emp_nb_aps_request',
  'doc_emp_nb_add_ins_decline',
];

mkdirSync('scripts/empire-highlight-proofs', { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  sessionStorage.setItem('amplify-demo-access-granted', '1');
  sessionStorage.removeItem('amplify-global-copilot-case-focus');
});
const page = await context.newPage();

await page.goto(`${BASE}/cases/${CASE_ID}#tab=documents`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

for (const docId of DOC_IDS) {
  await page.goto(`${BASE}/cases/${CASE_ID}#tab=documents&doc=${docId}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const highlight = page.locator('button[aria-label*="flag:"]').first();
  if (await highlight.isVisible().catch(() => false)) {
    await highlight.click();
    await page.waitForTimeout(400);
  }
  await page.screenshot({
    path: `scripts/empire-highlight-proofs/${docId}.png`,
    fullPage: false,
  });
  console.log('captured', docId);
}

await browser.close();
