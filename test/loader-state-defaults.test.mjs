import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loaderState } from '../src/modules/loader/presentation/loader-state.js';

test('counts nothing while the total is unknown @CEB-1-S1', () => {
  const partial = loaderState({ loaded: 3 });
  assert.equal(partial.pct, 0);
  assert.equal(partial.label, 'Cargando 0 %');
  const empty = loaderState();
  assert.equal(empty.pct, 0);
  assert.equal(empty.done, false);
  assert.equal(empty.exit, null);
});
