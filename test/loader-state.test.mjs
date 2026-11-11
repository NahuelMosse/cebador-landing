import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loaderState } from '../src/modules/loader/presentation/loader-state.js';

test("shows the share of the first can's frames loaded @CEB-1-S1", () => {
  const cases = [
    [{ loaded: 0, total: 10 }, 0],
    [{ loaded: 1, total: 3 }, 33],
    [{ loaded: 2, total: 3 }, 67],
    [{ loaded: 5, total: 10 }, 50],
    [{ loaded: 10, total: 10 }, 100],
    [{ loaded: 1, total: 8 }, 13],
    [{ loaded: 0, total: 0 }, 0],
    [{ loaded: 5, total: 0 }, 0],
    [{ loaded: 12, total: 10 }, 100],
    [{ loaded: -4, total: 10 }, 0],
    [{ loaded: NaN, total: 10 }, 0],
    [{ loaded: 5, total: NaN }, 0],
    [{ loaded: Infinity, total: 10 }, 0],
    [{ loaded: 5, total: Infinity }, 0],
    [{ loaded: undefined, total: undefined }, 0],
  ];
  for (const [input, pct] of cases) {
    assert.equal(loaderState(input).pct, pct, JSON.stringify(input));
  }
  assert.equal(loaderState().pct, 0);
  assert.equal(loaderState({}).pct, 0);
});

test('announces the wait and its end as text @CEB-1-ASM-01', () => {
  assert.equal(loaderState({ loaded: 0, total: 10 }).label, 'Cargando 0 %');
  assert.equal(loaderState({ loaded: 1, total: 3 }).label, 'Cargando 33 %');
  assert.equal(loaderState({ loaded: 10, total: 10 }).label, 'Cargando 100 %');
  assert.equal(loaderState({ loaded: 4, total: 10, ready: false }).label, 'Cargando 40 %');
  assert.equal(loaderState().label, 'Cargando 0 %');
  assert.equal(loaderState({ loaded: 4, total: 10, ready: true }).label, 'Listo');
  assert.equal(loaderState({ loaded: 4, total: 10, timedOut: true }).label, 'Listo');
  assert.equal(loaderState({ ready: true }).label, 'Listo');
});

test('leaves when the can is ready or the fallback fires @CEB-1-ASM-02', () => {
  assert.equal(loaderState({ loaded: 0, total: 10, ready: true }).done, true);
  assert.equal(loaderState({ loaded: 3, total: 10, timedOut: true }).done, true);
  assert.equal(loaderState({ loaded: 10, total: 10, ready: true, timedOut: true }).done, true);
  assert.equal(loaderState({ ready: true }).done, true);
  assert.equal(loaderState({ timedOut: true }).done, true);
  assert.equal(loaderState({ loaded: 10, total: 10 }).done, false);
  assert.equal(loaderState({ loaded: 5, total: 10 }).done, false);
  assert.equal(loaderState().done, false);
  assert.equal(loaderState({}).done, false);
});

test('leaves with no exit animation under reduced motion @CEB-1-ASM-03', () => {
  assert.equal(loaderState({ ready: true, reduced: true }).exit, 'none');
  assert.equal(loaderState({ timedOut: true, reduced: true }).exit, 'none');
  assert.equal(loaderState({ ready: true, reduced: false }).exit, 'animate');
  assert.equal(loaderState({ timedOut: true }).exit, 'animate');
  assert.equal(loaderState({ loaded: 5, total: 10, reduced: true }).exit, null);
  assert.equal(loaderState({ loaded: 5, total: 10, reduced: false }).exit, null);
  assert.equal(loaderState({ reduced: true }).exit, null);
  assert.equal(loaderState().exit, null);
});
