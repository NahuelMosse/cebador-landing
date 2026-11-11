/* Decisions of the can stage that do not touch the DOM: which frames the loading screen waits for, when the extras load, when a write or a loop can be skipped. Loaded as a classic script (window.StageState) and by the tests (CommonJS). */
(function (root) {
  const TURN_STEPS = [24, 12, 6, 3, 1];
  const READY_COUNT = 8;
  const POINTER_EPS = .1;
  const SMALL_FRAME_HEIGHT = 600;

  // load order of the turn: 0, 24, 12, 36... so there is a usable spin from the first moment
  function turnOrder(nf = 48) {
    const order = [];
    for (const step of TURN_STEPS) for (let i = 0; i < nf; i += step) if (!order.includes(i)) order.push(i);
    return order;
  }

  const readyFrames = order => order.slice(0, READY_COUNT);
  const READY_FRAMES = readyFrames(turnOrder(48));

  const glowChanged = (prev, next) => !prev || prev.x !== next.x || prev.y !== next.y;

  const settled = (cur, target, eps = POINTER_EPS) => Math.abs(cur.x - target.x) < eps && Math.abs(cur.y - target.y) < eps;

  const extrasDue = ({ idle = false, interacted = false } = {}) => idle || interacted;

  const frameSet = (drawnHeightCss, dpr, smallHeight = SMALL_FRAME_HEIGHT) => (drawnHeightCss * dpr <= smallHeight ? 'sm' : 'full');

  const api = { turnOrder, READY_FRAMES, readyFrames, glowChanged, settled, extrasDue, frameSet };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StageState = api;
})(this);
