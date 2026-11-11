import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loaderState } from '../src/modules/loader/presentation/loader-state.js';

test('a single item counts as the whole load @CEB-1-S1', () => {
  const whole = loaderState({ loaded: 1, total: 1 });
  assert.equal(whole.pct, 100);
  assert.equal(whole.label, 'Cargando 100 %');
  assert.equal(loaderState({ loaded: 0, total: 1 }).pct, 0);
});
