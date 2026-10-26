/* CTA: riel de aluminio con anilla real. La anilla desliza y la lata del hero se abre cuadro a cuadro con el progreso (CanStage.openQ).
   Al pasar el umbral la tapa revienta: chasquido y siseo (WebAudio, solo tras el gesto), vibracion, rafaga de niebla y burbujas.
   Soltar antes del umbral revierte; Enter, Espacio o un toque reproducen la secuencia entera. Con movimiento reducido no hay barrido: un solo cambio de estado. */
(function () {
  const $ = s => document.querySelector(s), html = document.documentElement, clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wrap = $('#ctaWrap'), srcEl = $('#ctaSrc'); if (!wrap || !srcEl) return;
  const rail = document.createElement('div'); rail.className = 'rail';
  rail.innerHTML = '<img class="rail-bg" src="assets/rail/rail.webp" alt="" aria-hidden="true" draggable="false"><i class="rail-fill" aria-hidden="true"></i><div class="rail-txt" aria-hidden="true"><b></b><small></small></div><button class="rail-tab" type="button" aria-describedby="ctaHint"><img src="assets/rail/tab.webp" alt="" draggable="false"></button>';
  wrap.prepend(rail);
  const tab = rail.querySelector('.rail-tab'), tb = rail.querySelector('.rail-txt b'), ts = rail.querySelector('.rail-txt small');
  const fz = document.createElement('canvas'); fz.id = 'fizz'; fz.setAttribute('aria-hidden', 'true'); document.body.appendChild(fz);
  const stage = () => window.CanStage;
  const X0 = .274, X1 = .726, POPQ = 15.5 / 23;
  let q = 0, drag = false, sx = 0, q0 = 0, moved = 0, anim = 0, busy = false, tick = 0, popped = false;

  /* ---------- sonido: chasquido de la tapa y siseo del gas ---------- */
  let ac = null;
  const audio = () => { if (reduced) return null; if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; } } if (ac.state === 'suspended') ac.resume().catch(() => { }); return ac; };
  function noiseSrc(a, dur) { const b = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = a.createBufferSource(); s.buffer = b; return s; }
  function sound() {
    const a = audio(); if (!a || document.hidden) return; const t = a.currentTime;
    const out = a.createGain(); out.gain.value = .8; out.connect(a.destination);
    const ck = noiseSrc(a, .12), bp = a.createBiquadFilter(), g1 = a.createGain(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = .9;
    g1.gain.setValueAtTime(1, t); g1.gain.exponentialRampToValueAtTime(.001, t + .07); ck.connect(bp); bp.connect(g1); g1.connect(out); ck.start(t);
    const o = a.createOscillator(), g2 = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(70, t + .1);
    g2.gain.setValueAtTime(.55, t); g2.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(g2); g2.connect(out); o.start(t); o.stop(t + .14);
    const hs = noiseSrc(a, 1.8), hp = a.createBiquadFilter(), lp = a.createBiquadFilter(), g3 = a.createGain(); hp.type = 'highpass'; hp.frequency.value = 4200; lp.type = 'lowpass'; lp.frequency.value = 11000;
    g3.gain.setValueAtTime(0, t + .03); g3.gain.linearRampToValueAtTime(.2, t + .06); g3.gain.setValueAtTime(.2, t + .35); g3.gain.exponentialRampToValueAtTime(.0008, t + 1.7);
    hs.connect(hp); hp.connect(lp); lp.connect(g3); g3.connect(out); hs.start(t + .03);
  }

  /* ---------- niebla y burbujas desde la abertura ---------- */
  const fx = fz.getContext('2d'); let ps = [], fxRaf = 0, emit = 0, fw = 0, fh = 0, dpr = 1;
  function fitFx() { dpr = Math.min(devicePixelRatio || 1, 2); fw = innerWidth; fh = innerHeight; fz.width = Math.round(fw * dpr); fz.height = Math.round(fh * dpr); }
  fitFx(); addEventListener('resize', fitFx);
  function spawn(n) {
    const st = stage(), p = st && st.apt && st.apt(); if (!p) return; const col = getComputedStyle(html).getPropertyValue('--c4').trim() || '#fff';
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - .5) * 1.5, v = (3 + Math.random() * 7) * Math.max(.5, p.s); ps.push({ x: p.x + (Math.random() - .5) * 30 * p.s, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: (3 + Math.random() * 9) * Math.max(.6, p.s), age: 0, life: 700 + Math.random() * 600, ring: Math.random() < .55, col }); }
  }
  function fxLoop(t) {
    fxRaf = 0; const dt = Math.min(40, t - (fxLoop.l || t)); fxLoop.l = t;
    if (emit > 0) { emit -= dt; spawn(Math.ceil(dt / 16 * 2)); }
    fx.setTransform(dpr, 0, 0, dpr, 0, 0); fx.clearRect(0, 0, fw, fh);
    ps = ps.filter(p => (p.age += dt) < p.life);
    for (const p of ps) {
      const k = dt / 16.7; p.x += p.vx * k; p.y += p.vy * k; p.vx *= Math.pow(.96, k); p.vy = p.vy * Math.pow(.955, k) - .04 * k; const u = p.age / p.life, al = (1 - u) * (1 - u);
      if (p.ring) { fx.globalAlpha = al * .85; fx.strokeStyle = '#fff'; fx.lineWidth = 2; fx.beginPath(); fx.arc(p.x, p.y, p.r * (1 + u * .5), 0, 6.3); fx.stroke(); }
      else { const r = p.r * (2 + u * 5), gr = fx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); fx.globalAlpha = al * .7; fx.fillStyle = gr; fx.beginPath(); fx.arc(p.x, p.y, r, 0, 6.3); fx.fill(); }
    }
    fx.globalAlpha = 1;
    if (ps.length || emit > 0) fxRaf = requestAnimationFrame(fxLoop); else fxLoop.l = 0;
  }
  function pop() {
    if (reduced) return;
    sound(); if (navigator.vibrate) try { navigator.vibrate([18, 22, 34]); } catch (_) { }
    const st = stage(); if (st) st.jolt = 1;
    const g = window.gsap, s = st && st.S; if (g && s) { g.killTweensOf(s, 'burst'); g.fromTo(s, { burst: 0 }, { burst: 1, duration: .3, ease: 'power2.out', yoyo: true, repeat: 1 }); }
    spawn(34); emit = 650; if (!fxRaf) fxRaf = requestAnimationFrame(fxLoop);
  }

  /* ---------- estado ---------- */
  /* foco: con el progreso la lata se acerca por la tapa, las palabras y las latas vecinas se apartan; al abrirse la caja se asienta (settle) */
  let settle = 0, settleTw = null;
  const focusOf = v => { const u = clamp((v - .04) / .5, 0, 1); return u * u * (3 - 2 * u); };
  const applyFocus = () => {
    const st = stage(), fq = reduced ? 0 : focusOf(q) * (1 - settle);
    if (st) st.fq = fq; html.style.setProperty('--fq', fq.toFixed(3));
  };
  const setQ = v => {
    q = clamp(v, 0, 1); rail.style.setProperty('--q', q.toFixed(4));
    const st = stage(); if (st && !reduced) st.openQ = q;
    applyFocus();
    if (!reduced) { if (q >= POPQ && !popped) { popped = true; pop(); } else if (q < POPQ - .05 && popped) popped = false; }
    const t = Math.floor(q * 6); if (t !== tick) { tick = t; if (drag && !reduced && navigator.vibrate) try { navigator.vibrate(5); } catch (_) { } }
  };
  const tween = (to, ms, done, ease) => {
    cancelAnimationFrame(anim); const a = q, t0 = performance.now();
    if (reduced) { setQ(to); done && done(); return; }
    const e = ease || (u => 1 - Math.pow(1 - u, 3));
    (function f(t) { const u = clamp((t - t0) / ms, 0, 1); setQ(a + (to - a) * e(u)); if (u < 1) anim = requestAnimationFrame(f); else done && done(); })(t0);
  };
  const sync = () => {
    const t = ($('#ctaL1').textContent || ''), price = (t.match(/\$[\d.]+/) || ['$16.400'])[0], name = t.replace(/^Abrir /, '').replace(/ ·.*$/, ''), n = ((($('.cta-l2').textContent || '').match(/Caja x(\d+)/)) || [0, 6])[1];
    tb.textContent = price; ts.textContent = `Abrir ${name} · caja x${n}`;
    tab.setAttribute('aria-label', `Abrir ${name}, caja x${n}, ${price}. Deslizá la anilla o presioná Enter`);
  };
  new MutationObserver(sync).observe(srcEl, { childList: true, subtree: true, characterData: true }); sync();
  function complete() {
    if (busy) return; busy = true; rail.classList.remove('press');
    const st = stage();
    if (reduced) { if (st) st.openQ = 1; setQ(1); window.CanShop.open(); return; }
    tween(1, 260 + (1 - q) * 1500, () => { setTimeout(() => window.CanShop.open(), 160); }, u => u * u * (3 - 2 * u));
  }
  const press = on => rail.classList.toggle('press', on);
  rail.addEventListener('pointerdown', e => { if (busy || e.button > 0) return; e.preventDefault(); audio(); rail.setPointerCapture(e.pointerId); drag = true; sx = e.clientX; q0 = q; moved = 0; press(true); cancelAnimationFrame(anim); });
  rail.addEventListener('pointermove', e => { if (!drag) return; moved = Math.max(moved, Math.abs(e.clientX - sx)); if (moved >= 8 || q0 > 0) setQ(q0 + (e.clientX - sx) / (rail.offsetWidth * (X1 - X0))); });
  const up = () => { if (!drag) return; drag = false; press(false); if (moved < 8 || q >= POPQ) complete(); else tween(0, 260 + q * 500); };
  rail.addEventListener('pointerup', up);
  rail.addEventListener('pointercancel', () => { if (!drag) return; drag = false; press(false); tween(0, 300); });
  tab.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); audio(); press(true); } });
  tab.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') { press(false); complete(); } });
  new MutationObserver(() => {
    const open = wrap.classList.contains('open'); rail.inert = open;
    if (open) {
      tab.blur();
      if (reduced) { settle = 1; applyFocus(); }
      else { const o = { v: settle }, t0 = performance.now(), from = settle; cancelAnimationFrame(settleTw); (function f(t) { const u = clamp((t - t0) / 800, 0, 1); settle = from + (1 - from) * (1 - Math.pow(1 - u, 3)); applyFocus(); if (u < 1) settleTw = requestAnimationFrame(f); })(t0); }
    } else {
      busy = false; cancelAnimationFrame(settleTw);
      if (settle > 0) { const from = settle, t0 = performance.now(); (function f(t) { const u = clamp((t - t0) / 700, 0, 1); settle = from * (1 - u); applyFocus(); if (u < 1) settleTw = requestAnimationFrame(f); })(t0); }
      tween(0, 700, () => { popped = false; settle = 0; const st = stage(); if (st) st.openQ = 0; applyFocus(); });
    }
  }).observe(wrap, { attributes: true, attributeFilter: ['class'] });
  const st0 = stage(); if (st0 && st0.preloadOpen) { rail.addEventListener('pointerenter', () => st0.preloadOpen(), { once: true }); }
})();
