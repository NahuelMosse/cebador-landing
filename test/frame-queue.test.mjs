import { test } from 'node:test';
import assert from 'node:assert/strict';
import F from '../src/modules/stage/presentation/frame-queue.js';

test('a callback queued many times in a frame runs once on the next one @CEB-2-S5', () => {
  const frames = [];
  let runs = 0;
  const queue = F.once(() => { runs++; }, cb => frames.push(cb));
  queue(); queue(); queue();
  assert.equal(frames.length, 1);
  assert.equal(runs, 0);
  frames.shift()();
  assert.equal(runs, 1);
  queue();
  assert.equal(frames.length, 1);
  frames.shift()();
  assert.equal(runs, 2);
});

test('watchGeometry measures on load and fonts, and queues resize and body changes @CEB-2-S5', async () => {
  const listeners = {}, frames = [];
  let observed = null, onResize = null, measures = 0;
  const env = {
    requestAnimationFrame: cb => frames.push(cb),
    addEventListener: (type, fn) => { listeners[type] = fn; },
    document: { body: 'body', fonts: { ready: Promise.resolve() } },
    ResizeObserver: class { constructor(fn) { onResize = fn; } observe(el) { observed = el; } },
  };
  F.watchGeometry(() => { measures++; }, env);
  await env.document.fonts.ready;
  assert.equal(measures, 1);
  listeners.load();
  assert.equal(measures, 2);
  listeners.resize(); onResize();
  assert.equal(frames.length, 1);
  frames.shift()();
  assert.equal(measures, 3);
  assert.equal(observed, 'body');
});
