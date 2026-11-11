import { test } from 'node:test';
import assert from 'node:assert/strict';
import S from '../src/modules/stage/presentation/stage-state.js';

test('the curtain waits for frames 0, 24, 12, 36, 6, 18, 30 and 42 only (8 frames) @CEB-2-S1 @CEB-2-ASM-01', () => {
  assert.deepEqual(S.READY_FRAMES, [0, 24, 12, 36, 6, 18, 30, 42]);
  const order = S.turnOrder(48);
  assert.equal(order.length, 48);
  assert.equal(new Set(order).size, 48);
  assert.deepEqual(order.slice(0, 8), S.READY_FRAMES);
  assert.deepEqual(order.slice(8, 12), [3, 9, 15, 21]);
  assert.equal(order[47], 47);
  assert.deepEqual(S.turnOrder(), order);
  assert.deepEqual(S.turnOrder(12), [0, 6, 3, 9, 1, 2, 4, 5, 7, 8, 10, 11]);
  assert.deepEqual(S.turnOrder(1), [0]);
  assert.deepEqual(S.turnOrder(0), []);
  assert.deepEqual(S.readyFrames(order), S.READY_FRAMES);
  assert.deepEqual(S.readyFrames([5, 4, 3]), [5, 4, 3]);
  assert.deepEqual(S.readyFrames([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]), [9, 8, 7, 6, 5, 4, 3, 2]);
  assert.deepEqual(S.readyFrames([]), []);
});

test('the glow is written only when it moves @CEB-2-S2', () => {
  assert.equal(S.glowChanged(null, { x: '54.0%', y: '50.0%' }), true);
  assert.equal(S.glowChanged(undefined, { x: '54.0%', y: '50.0%' }), true);
  assert.equal(S.glowChanged({ x: '54.0%', y: '50.0%' }, { x: '54.0%', y: '50.0%' }), false);
  assert.equal(S.glowChanged({ x: '54.0%', y: '50.0%' }, { x: '54.1%', y: '50.0%' }), true);
  assert.equal(S.glowChanged({ x: '54.0%', y: '50.0%' }, { x: '54.0%', y: '50.1%' }), true);
  assert.equal(S.glowChanged({ x: '54.0%', y: '50.0%' }, { x: '10.0%', y: '90.0%' }), true);
});

test('a loop stops once it has settled @CEB-2-S3', () => {
  assert.equal(S.settled({ x: 10, y: 20 }, { x: 10, y: 20 }), true);
  assert.equal(S.settled({ x: 10, y: 20 }, { x: 10.05, y: 19.95 }), true);
  assert.equal(S.settled({ x: 10, y: 20 }, { x: 10.2, y: 20 }), false);
  assert.equal(S.settled({ x: 10, y: 20 }, { x: 10, y: 20.2 }), false);
  assert.equal(S.settled({ x: 10, y: 20 }, { x: 9.8, y: 20 }), false);
  assert.equal(S.settled({ x: 10, y: 20 }, { x: 10, y: 19.8 }), false);
  assert.equal(S.settled({ x: 10, y: 20 }, { x: 10.125, y: 20 }), false);
  assert.equal(S.settled({ x: 10, y: 20 }, { x: 10.0625, y: 20 }), true);
  assert.equal(S.settled({ x: 0, y: 0 }, { x: 0.5, y: 0 }, 0.5), false);
  assert.equal(S.settled({ x: 0, y: 0 }, { x: 0, y: 0.5 }, 0.5), false);
  assert.equal(S.settled({ x: 10, y: 20 }, { x: 10.5, y: 20 }, 1), true);
  assert.equal(S.settled({ x: 10, y: 20 }, { x: 11.5, y: 20 }, 1), false);
});

test('the extras wait for idle or the first interaction @CEB-2-S8 @CEB-2-ASM-02', () => {
  assert.equal(S.extrasDue(), false);
  assert.equal(S.extrasDue({}), false);
  assert.equal(S.extrasDue({ idle: false, interacted: false }), false);
  assert.equal(S.extrasDue({ idle: true, interacted: false }), true);
  assert.equal(S.extrasDue({ idle: false, interacted: true }), true);
  assert.equal(S.extrasDue({ idle: true, interacted: true }), true);
  assert.equal(S.extrasDue({ idle: true }), true);
  assert.equal(S.extrasDue({ interacted: true }), true);
});

test('the small frames serve when they cover the drawn can @CEB-2-S9 @CEB-2-ASM-05', () => {
  assert.equal(S.frameSet(400, 1), 'sm');
  assert.equal(S.frameSet(600, 1), 'sm');
  assert.equal(S.frameSet(600.5, 1), 'full');
  assert.equal(S.frameSet(621, 1), 'full');
  assert.equal(S.frameSet(300, 2), 'sm');
  assert.equal(S.frameSet(301, 2), 'full');
  assert.equal(S.frameSet(200, 3), 'sm');
  assert.equal(S.frameSet(201, 3), 'full');
  assert.equal(S.frameSet(900, 1), 'full');
  assert.equal(S.frameSet(900, 1, 1000), 'sm');
  assert.equal(S.frameSet(500, 1, 400), 'full');
  assert.equal(S.frameSet(400, 1, 400), 'sm');
});
