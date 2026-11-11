import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const playwrightRoot = process.env.KIT_PLAYWRIGHT_ROOT;
const baseUrl = process.env.APP_URL;
if (!playwrightRoot) throw new Error('KIT_PLAYWRIGHT_ROOT is not set: it must point at the folder whose node_modules has playwright');
if (!baseUrl) throw new Error('APP_URL is not set: it must point at the running landing');
const { chromium } = createRequire(import.meta.url)(`${playwrightRoot}/node_modules/playwright`);

const LOADED = 'document.documentElement.dataset.loaded === "1"';
const KB = 1024;

async function withPage(run) {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 20e6 / 8, uploadThroughput: 5e6 / 8 });
    return await run(page, cdp);
  } finally {
    await browser.close();
  }
}

test('the curtain leaves sooner with fewer bytes @CEB-2-S1', async t => {
  await withPage(async page => {
    let bytes = 0;
    const pending = [];
    page.on('requestfinished', r => {
      pending.push(r.sizes().then(s => { bytes += s.responseBodySize; }).catch(() => { }));
    });
    const start = Date.now();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(LOADED, null, { timeout: 30000 });
    const ms = Date.now() - start;
    await Promise.all(pending);
    t.diagnostic(`curtain gone at ${ms} ms with ${Math.round(bytes / KB)} KB fetched`);
    assert.ok(bytes <= 1500 * KB, `${Math.round(bytes / KB)} KB fetched before the curtain left, at most 1500 KB`);
    assert.ok(ms <= 2000, `${ms} ms until the curtain left, at most 2000 ms`);
  });
});

test('the opening frames are not fetched before the first interaction or idle @CEB-2-S8', async () => {
  await withPage(async page => {
    const early = [];
    let loaded = false;
    page.on('request', r => { if (!loaded && r.url().includes('/assets/open/')) early.push(r.url()); });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(LOADED, null, { timeout: 30000 });
    loaded = true;
    assert.deepEqual(early, []);
  });
});

test('the page recalculates no styles while idle @CEB-2-S2 @CEB-2-S3', async t => {
  await withPage(async (page, cdp) => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(LOADED, null, { timeout: 30000 });
    await page.waitForTimeout(4000);
    await cdp.send('Performance.enable');
    const count = async () => (await cdp.send('Performance.getMetrics')).metrics.find(m => m.name === 'RecalcStyleCount').value;
    const before = await count();
    await page.waitForTimeout(3000);
    const grown = (await count()) - before;
    t.diagnostic(`${grown} style recalcs in 3 s idle`);
    assert.ok(grown <= 10, `${grown} style recalculations in 3 s with no input, at most 10`);
  });
});

test('scrolling keeps frames under 50 ms @CEB-2-S5', async t => {
  await withPage(async page => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(LOADED, null, { timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.mouse.move(720, 450);
    await page.evaluate(() => {
      window.__gaps = []; window.__stop = false;
      let last = performance.now();
      (function tick(now) { window.__gaps.push(now - last); last = now; if (!window.__stop) requestAnimationFrame(tick); })(last);
    });
    for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, 200); await page.waitForTimeout(100); }
    const gaps = await page.evaluate(() => { window.__stop = true; return window.__gaps; });
    const slow = gaps.filter(g => g > 50).length;
    const sorted = [...gaps].sort((a, b) => a - b);
    t.diagnostic(`${gaps.length} frames, p95 ${Math.round(sorted[Math.floor(sorted.length * .95)])} ms, ${slow} over 50 ms`);
    assert.ok(slow <= 5, `${slow} frames over 50 ms while scrolling, at most 5`);
  });
});
