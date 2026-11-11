import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = name => readFileSync(new URL(name, root), 'utf8');
const size = name => statSync(new URL(name, root)).size;
const KB = 1024;

test('the grain is a small tile with no blend mode @CEB-2-S4 @CEB-2-ASM-03', () => {
  const rule = /\.grain\s*\{([^}]*)\}/.exec(read('styles.css'));
  assert.ok(rule, 'styles.css has a .grain rule');
  assert.doesNotMatch(rule[1], /mix-blend-mode/);
  assert.match(rule[1], /background[^;]*assets\/grain\.webp/);
  assert.ok(existsSync(new URL('assets/grain.webp', root)), 'assets/grain.webp exists');
  assert.ok(size('assets/grain.webp') <= 20 * KB, 'assets/grain.webp is at most 20 KB');
});

test('no backdrop blur over the animated stage @CEB-2-S6 @CEB-2-ASM-04', () => {
  for (const file of ['styles.css', 'cta.css']) assert.doesNotMatch(read(file), /backdrop-filter/, file);
});

test('the fonts are subset and preloaded @CEB-2-S7 @CEB-2-ASM-06', () => {
  const total = ['fonts/Fraunces.woff2', 'fonts/Fraunces-Italic.woff2', 'fonts/SchibstedGrotesk.woff2'].reduce((sum, f) => sum + size(f), 0);
  assert.ok(total <= 250 * KB, `the three fonts total ${Math.round(total / KB)} KB, at most 250 KB`);
  const links = read('index.html').match(/<link\b[^>]*>/g) || [];
  for (const font of ['fonts/Fraunces.woff2', 'fonts/SchibstedGrotesk.woff2']) {
    const link = links.find(l => /rel="preload"/.test(l) && l.includes(`href="${font}"`));
    assert.ok(link, `${font} is preloaded`);
    assert.match(link, /as="font"/);
    assert.match(link, /type="font\/woff2"/);
    assert.match(link, /\bcrossorigin\b/);
  }
});
