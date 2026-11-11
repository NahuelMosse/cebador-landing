import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loaderState } from '../src/modules/loader/presentation/loader-state.js';

test('counts nothing loaded until a frame arrives @CEB-1-S1', () => {
  const state = loaderState({ total: 4 });
  assert.equal(state.pct, 0);
  assert.equal(state.label, 'Cargando 0 %');
});
