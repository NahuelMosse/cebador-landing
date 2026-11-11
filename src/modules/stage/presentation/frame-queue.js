/* Frame scheduling shared by the scroll and layout-measure code: a callback queued many times in a frame runs once on the next one. Loaded as a classic script (window.FrameQueue) and by the tests (CommonJS). */
(function (root) {
  function once(fn, schedule = requestAnimationFrame) {
    let queued = false;
    return () => {
      if (queued) return;
      queued = true;
      schedule(() => { queued = false; fn(); });
    };
  }

  // measure runs on load, when the fonts arrive, and once per frame on resize or when the body changes size
  function watchGeometry(measure, env = root) {
    const queueMeasure = once(measure, env.requestAnimationFrame);
    env.addEventListener('load', measure);
    env.addEventListener('resize', queueMeasure);
    env.document.fonts.ready.then(measure);
    new env.ResizeObserver(queueMeasure).observe(env.document.body);
  }

  const api = { once, watchGeometry };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FrameQueue = api;
})(this);
