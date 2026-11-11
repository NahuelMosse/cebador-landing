import { test } from 'node:test';
import assert from 'node:assert/strict';
import S from '../src/modules/stage/presentation/stage-state.js';

test('the can and the bubbles rest after 3 s without input @CEB-2-S3 @CEB-2-ASM-07', () => {
  assert.equal(S.resting({ lastInput: 1000, now: 3999 }), false);
  assert.equal(S.resting({ lastInput: 1000, now: 4000 }), true);
  assert.equal(S.resting({ lastInput: 1000, now: 4001 }), true);
  assert.equal(S.resting({ lastInput: 1000, now: 1000 }), false);
  assert.equal(S.resting({ lastInput: 0, now: 2999 }), false);
  assert.equal(S.resting({ lastInput: 0, now: 3000 }), true);
  assert.equal(S.resting({ lastInput: 500, now: 1500, after: 1000 }), true);
  assert.equal(S.resting({ lastInput: 500, now: 1499, after: 1000 }), false);
  assert.equal(S.resting({ lastInput: 5000, now: 1000 }), false);
});
