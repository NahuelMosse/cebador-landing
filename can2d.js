/* Escena de la lata: secuencia pre-renderizada de 48 cuadros por sabor (lata 3D de Blender). No gira con el scroll: gira al cambiar de sabor y, en la seccion de sabores, al arrastrarla con inercia. En el inicio las latas forman un carrusel: se arrastran 1:1 (la del centro se corre, la del costado entra), al soltar se acomodan a la mas cercana con un resorte corto; tocar una lata del costado la trae al centro; flechas con la lata enfocada. En reposo la lata del centro siempre mira de frente. Burbujas planas en canvas 2D. Expone window.CanStage. */
(function () {
  const F = window.FLAVORS, ORDER = window.FLAVOR_ORDER;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TURN_DIR = 'assets/turn-b4';
  const TAU = Math.PI * 2, NF = 48;
  const S = { drop: 1, spin: 0, fruit: 0, bub: 0, pop: 1, open: 0, burst: 0 };
  const stage = { S, openQ: 0, jolt: 0, geom: null, thumbs: {}, flavor: 'pomelo', ready: null, hasGL: false, pose: { x: 0, y: 0, h: 0 }, setCanVisible() { } };
  window.CanStage = stage;
  let BF = .9, WR = 760 / 900, CYF = .5; // alto de la lata / alto del cuadro, ancho / alto, centro de la lata
  ORDER.forEach(k => { stage.thumbs[k] = `assets/can-${k}.webp`; });

  // cinco ranuras de lata (-2..2): la del centro y las vecinas, todas de frente; las de |u|>1 solo existen durante el deslizamiento
  const NS = 5, slots = [];
  for (let i = 0; i < NS; i++) {
    const el = document.createElement('div'); if (i === 2) el.id = 'canimg'; el.className = 'canslot'; el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;left:0;top:0;z-index:1;pointer-events:none;will-change:transform,opacity;transform-origin:50% 50%;visibility:hidden;';
    const c = document.createElement('canvas'); const side = i !== 2; c.width = side ? 456 : 760; c.height = side ? 540 : 900; c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    el.appendChild(c); document.body.insertBefore(el, document.getElementById('stage'));
    slots.push({ el, c, g: c.getContext('2d'), key: '' });
  }
  const holder = slots[2].el;
  fetch(`${TURN_DIR}/meta.json`).then(r => r.json()).then(m => { BF = m.BF; WR = m.WR; CYF = m.CYF; slots.forEach(o => { o.el.style.transformOrigin = `50% ${CYF * 100}%`; }); }).catch(() => { });

  // zona tactil sobre la lata: desliza en horizontal para girar, el scroll vertical sigue siendo del navegador
  const hit = document.createElement('div'); hit.id = 'canhit'; hit.tabIndex = 0; hit.setAttribute('role', 'group');
  hit.setAttribute('aria-label', 'Latas Cebador: arrastralas o usa las flechas izquierda y derecha para cambiar de sabor');
  hit.style.cssText = 'position:fixed;left:0;top:0;z-index:3;touch-action:pan-y;cursor:grab;pointer-events:none;outline-offset:-4px;-webkit-user-select:none;user-select:none;';
  document.body.insertBefore(hit, slots[NS - 1].el.nextSibling);

  // cuadros: 0, 24, 12, 36... para que haya giro usable desde el primer momento
  const seq = {}, got = {}; ORDER.forEach(k => { seq[k] = new Array(NF).fill(null); got[k] = 0; });
  const ord = []; for (const st of [24, 12, 6, 3, 1]) for (let i = 0; i < NF; i += st) if (!ord.includes(i)) ord.push(i);
  function loadFlavor(k) {
    return new Promise(res => {
      if (reduced) { const im = new Image(); im.onload = () => { seq[k][0] = im; res(); }; im.onerror = res; im.src = stage.thumbs[k]; return; }
      let n = 0, pos = 0, inflight = 0;
      const next = () => {
        while (inflight < 3 && pos < ord.length) {
          const i = ord[pos++]; inflight++;
          const im = new Image(); im.decoding = 'async';
          im.onload = im.onerror = () => { if (im.naturalWidth) { seq[k][i] = im; got[k]++; } inflight--; if (++n === NF) res(); else next(); };
          im.src = `${TURN_DIR}/${k}-${String(i).padStart(2, '0')}.webp`;
        }
      };
      next();
    });
  }
  const first = () => loadFlavor(stage.flavor);
  stage.ready = first().then(() => true);
  stage.ready.then(() => loadOpen(stage.flavor));
  stage.ready.then(() => ORDER.filter(k => k !== stage.flavor).reduce((p, k) => p.then(() => loadFlavor(k)), Promise.resolve()));
  function nearest(k, idx) { const a = seq[k]; for (let d = 0; d < NF / 2; d++) { const x = a[(idx + d) % NF] || a[(idx - d + NF) % NF]; if (x) return x; } return null; }
  // el cuadro 0 de cada sabor primero: las vecinas del carrusel lo necesitan desde el arranque
  ORDER.forEach(k => { const im = new Image(); im.onload = () => { if (!seq[k][0]) seq[k][0] = im; }; im.src = reduced ? stage.thumbs[k] : `${TURN_DIR}/${k}-00.webp`; });
  // apertura: 24 cuadros por sabor en lienzo 760x1160 (130 px mas arriba y abajo que el giro, misma escala); el cuadro sale del progreso del riel
  const NO = 24, OP = {}; let OM = null;
  fetch('assets/open/meta.json').then(r => r.json()).then(m => { OM = m; }).catch(() => { });
  function loadOpen(k) {
    if (reduced || OP[k]) return; const arr = new Array(NO).fill(null); OP[k] = arr;
    for (let i = 0; i < NO; i++) { const im = new Image(); im.decoding = 'async'; im.onload = () => { arr[i] = im; }; im.src = `assets/open/${k}-${String(i).padStart(2, '0')}.webp`; }
  }
  stage.preloadOpen = () => loadOpen(stage.flavor);
  stage.apt = () => { const g = stage.geom; if (!OM || !g) return null; const a = OM.ap[Math.round(Math.min(1, stage.openQ) * (NO - 1))]; return { x: g.l + a[0] * g.W, y: g.t - .1444 * g.H + a[1] * 1.2889 * g.H, s: g.H / 900 }; };
  function drawOpen(o, k, q) {
    const arr = OP[k]; if (!arr) { loadOpen(k); return false; }
    const f = Math.min(1, Math.max(0, q)) * (NO - 1), a = Math.floor(f), b = Math.min(NO - 1, a + 1), t = f - a;
    const near = i => { for (let d = 0; d < NO; d++) { const x = arr[i - d] || arr[i + d]; if (x) return x; } return null; };
    const A = near(a), B = near(b); if (!A) return false;
    if (o.mode !== 'open') { o.mode = 'open'; o.c.width = 760; o.c.height = 1160; o.c.style.top = '-14.44%'; o.c.style.height = '128.89%'; o.key = ''; }
    const key = A.src + (B ? B.src : '') + Math.round(t * 12); if (key === o.key) return true; o.key = key;
    o.g.clearRect(0, 0, 760, 1160); o.g.drawImage(A, 0, 0);
    if (B && B !== A && t > .01) { o.g.globalAlpha = t; o.g.drawImage(B, 0, 0); o.g.globalAlpha = 1; }
    return true;
  }
  function draw(o, k, idx) {
    if (o.mode) { o.mode = ''; o.c.height = 900; o.c.style.top = '0'; o.c.style.height = '100%'; o.key = ''; }
    const im = nearest(k, idx); if (!im) return;
    const key = k + im.src; if (key === o.key) return; o.key = key;
    o.g.clearRect(0, 0, o.c.width, o.c.height); o.g.drawImage(im, 0, 0, o.c.width, o.c.height);
  }

  const canvas = document.getElementById('stage'), cx2 = canvas.getContext('2d');
  const rnd = seed => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const NB = 34, bd = Array.from({ length: NB }, (_, i) => { const R = rnd(100 + i * 13); return { x: (R(), R(), R()), y: R(), s: 2.5 + R() * R() * 15, v: .03 + R() * .06, w: R() * TAU }; });
  let W = 0, H = 0, mobile = false, dpr = 1, flavTop = 1, sabEnd = 1;
  function resize() {
    W = innerWidth; H = innerHeight; mobile = W < 760; dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }
  resize(); addEventListener('resize', resize);
  function measure() { const s = document.getElementById('sabores'); flavTop = s.offsetTop; sabEnd = s.offsetTop + s.offsetHeight; }
  stage.measure = measure; addEventListener('load', measure); addEventListener('resize', measure); measure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  new ResizeObserver(measure).observe(document.body);

  // off: posicion del carrusel en ranuras (0 = la lata del sabor actual al centro; >0 = arrastrado hacia el siguiente)
  let off = 0, offV = 0, dragX = false, spCur = 400;
  stage.setFlavor = function (k) {
    const old = stage.flavor; stage.flavor = k;
    if (!got[k] && !seq[k][0]) loadFlavor(k);
    loadOpen(k);
    if (reduced || !window.gsap) { if (k !== old) { off = 0; offV = 0; } return; }
    if (k === old) { gsap.killTweensOf(S); gsap.fromTo(S, { spin: 0 }, { spin: 1, duration: 1.0, ease: 'power3.inOut' }); return; }
    const d = (ORDER.indexOf(k) - ORDER.indexOf(old) + ORDER.length) % ORDER.length === 1 ? 1 : -1;
    off -= d; // la lata que entra ya esta donde estaba; el resorte la lleva al centro
  };

  // inicio: las latas siguen al dedo (direccion fijada tras 8 px; el scroll vertical sigue siendo del navegador).
  // sabores: arrastre que gira la lata con inercia y vuelve a quedar de frente.
  const heroMode = () => scrollY < flavTop * .6;
  let dragF = 0, vel = 0, dragging = false, px = 0, pw = 300, sx = 0, sy0 = 0, lock = '', swipeMode = false, pid = -1, bx = 0, off0 = 0, smp = [];
  const step = d => { stage.flavorStep = d; document.dispatchEvent(new CustomEvent('canflavor', { detail: d })); };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t, ss = t => t * t * (3 - 2 * t);
  hit.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (stage.openQ > 0) return;
    swipeMode = heroMode(); if (!swipeMode && reduced) return;
    dragging = true; pid = e.pointerId; px = sx = e.clientX; sy0 = e.clientY; lock = ''; vel = 0; smp = [];
    if (!swipeMode) { hit.setPointerCapture(e.pointerId); hit.style.cursor = 'grabbing'; }
  });
  hit.addEventListener('pointermove', e => {
    if (!dragging || e.pointerId !== pid) return;
    const dx = e.clientX - px; px = e.clientX;
    if (swipeMode) {
      if (!lock) {
        const ax = Math.abs(e.clientX - sx), ay = Math.abs(e.clientY - sy0);
        if (ax > 8 || ay > 8) { lock = ax > ay * 1.2 ? 'x' : 'y'; if (lock === 'x') { hit.setPointerCapture(e.pointerId); hit.style.cursor = 'grabbing'; dragX = true; bx = e.clientX; off0 = off; offV = 0; } }
      }
      if (lock === 'x') { off = clamp(off0 - (e.clientX - bx) / spCur, -1.15, 1.15); const t = performance.now(); smp.push({ t, o: off }); while (smp.length > 2 && t - smp[0].t > 100) smp.shift(); }
      return;
    }
    const df = -dx / pw * NF; dragF += df; vel = df;
  });
  const end = e => {
    if (!dragging || (e && e.pointerId !== pid)) return;
    dragging = false; hit.style.cursor = 'grab';
    if (!swipeMode) return;
    if (lock === 'x') {
      dragX = false;
      let v = 0; if (smp.length > 1) { const a = smp[0], b = smp[smp.length - 1]; if (b.t > a.t) v = (b.o - a.o) / ((b.t - a.t) / 1000); }
      const proj = off + v * .2, d = e && e.type === 'pointerup' ? (proj > .5 || (off > .18 && v > .8) ? 1 : proj < -.5 || (off < -.18 && v < -.8) ? -1 : 0) : 0;
      offV = v; if (d) step(d);
    } else if (lock === '' && e && e.type === 'pointerup') {
      const u = (e.clientX - stage.pose.x) / spCur; if (Math.abs(u) > .45) step(u > 0 ? 1 : -1); // tocar una lata del costado la trae al centro
    }
  };
  hit.addEventListener('pointerup', end); hit.addEventListener('pointercancel', end);
  hit.addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return; e.preventDefault(); step(d); });

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  const t0 = performance.now(); let last = t0;
  const root = document.documentElement;
  function frame(now) {
    requestAnimationFrame(frame);
    const sy = scrollY, hide = sy > sabEnd + H * .1 || document.hidden;
    slots.forEach(o => { if (hide) o.el.style.visibility = 'hidden'; });
    hit.style.pointerEvents = (hide || (reduced && !heroMode())) ? 'none' : 'auto'; hit.tabIndex = hide ? -1 : 0;
    if (hide) return;
    const t = (now - t0) / 1000, dt = Math.min((now - last) / 1000, .05); last = now;
    mouse.sx += (mouse.x - mouse.sx) * .06; mouse.sy += (mouse.y - mouse.sy) * .06;
    // sabores: giro con inercia y, en reposo, vuelve a quedar de frente
    if (!dragging && Math.abs(vel) > .005) { dragF += vel; vel *= Math.pow(.92, dt * 60); }
    else if (!dragging) { vel = 0; const tg = Math.round(dragF / NF) * NF; if (tg !== dragF) { dragF += (tg - dragF) * (1 - Math.exp(-dt * 5)); if (Math.abs(tg - dragF) < .02) dragF = tg; } }
    // hero: resorte corto del carrusel hacia la lata mas cercana
    if (!dragX) { if (reduced) { off = 0; offV = 0; } else if (off || offV) { offV += (-190 * off - 2 * Math.sqrt(190) * .82 * offV) * dt; off += offV * dt; if (Math.abs(off) < .0008 && Math.abs(offV) < .01) { off = 0; offV = 0; } } }
    const f = reduced ? 0 : 1, heroEnd = Math.max(1, flavTop), p = ss(clamp(sy / heroEnd, 0, 1));
    const hero = mobile ? { x: 0, y: .035, s: .52, z: -.2 } : { x: .04, y: -.01, s: .69, z: -.3 };
    const sab = mobile ? { x: 0, y: .21, s: .31, z: .05 } : { x: .205, y: 0, s: .61, z: .06 };
    const fq = reduced ? 0 : (stage.fq || 0) * (1 - p); // foco de la apertura: la lata se acerca por la tapa
    const bodyH = lerp(hero.s, sab.s, p) * H * S.pop * (1 + stage.jolt * (reduced ? 0 : .035)) * (1 + fq * (mobile ? .46 : .26));
    const op = S.open, shk = Math.max(0, op - .45) * 1.8 * f;
    const cx = lerp(W * (.5 + lerp(hero.x, sab.x, p)), W * .5, fq) + Math.sin(t * 95) * shk * 5 + mouse.sx * 8 * f * (1 - fq);
    const cy = H * (.5 - lerp(hero.y, sab.y, p)) + S.drop * H * 1.1 + Math.sin(t * 1.1) * H * .008 * f * (1 - fq) + Math.cos(t * 83) * shk * 4 + fq * H * (mobile ? .115 : .105);
    const rz = -(lerp(hero.z, sab.z, p) + S.drop * .5) * 180 / Math.PI * .35 + op * 4;
    const total = reduced ? 0 : S.spin * NF + dragF;
    const ci = ORDER.indexOf(stage.flavor), n = ORDER.length;
    const sp = (mobile ? .5 : .34) * W, SS = mobile ? .6 : .5, vis = 1 - ss(clamp(p * 4, 0, 1)), lift = (mobile ? .03 : .08) * H;
    spCur = sp;
    for (let i = 0; i < NS; i++) {
      const s = i - 2, u = s - off, au = Math.abs(u), m = Math.min(au, 1), o = slots[i];
      const al = lerp(1, .55 * vis, m) * (1 - clamp(au - 1, 0, 1)) * (m > 0 ? 1 - fq : 1);
      if (al < .01) { o.el.style.visibility = 'hidden'; continue; }
      const k = ORDER[(((ci + s) % n) + n) % n], front = s === 0 && k === stage.flavor;
      if (!(front && stage.openQ > 0 && drawOpen(o, k, stage.openQ))) draw(o, k, front ? ((Math.round(total) % NF) + NF) % NF : 0);
      const bh = bodyH * lerp(1, SS, m), Hi = bh / BF, Wi = Hi * WR, x = cx + u * sp * (1 + fq * .45), y = cy - m * lift;
      const st = o.el.style;
      st.visibility = 'visible'; st.opacity = al.toFixed(3); st.zIndex = au < .5 ? 2 : 1;
      st.filter = m > .01 ? `brightness(${lerp(1, .72, m).toFixed(3)})` : 'none';
      st.width = Wi + 'px'; st.height = Hi + 'px'; if (front) stage.geom = { l: x - Wi / 2, t: y - Hi * CYF, W: Wi, H: Hi };
      st.transform = `translate3d(${x - Wi / 2}px,${y - Hi * CYF}px,0) rotate(${rz + clamp(u, -1.5, 1.5) * 4}deg)`;
    }
    const Hi0 = bodyH / BF, Wi = Hi0 * WR, hm = heroMode();
    pw = Math.max(200, Wi * 1.1);
    hit.style.width = (hm ? W : Math.max(44, Wi * .8)) + 'px'; hit.style.height = Math.max(44, bodyH) + 'px';
    hit.style.transform = `translate3d(${hm ? 0 : cx - Wi * .4}px,${cy - bodyH / 2}px,0)`;
    stage.pose.x = cx; stage.pose.y = cy; stage.pose.h = bodyH;
    root.style.setProperty('--gx', (cx / W * 100).toFixed(1) + '%'); root.style.setProperty('--gy', (cy / H * 100).toFixed(1) + '%');
    // burbujas planas
    cx2.setTransform(dpr, 0, 0, dpr, 0, 0); cx2.clearRect(0, 0, W, H);
    const ink = F[stage.flavor].label.ink; cx2.strokeStyle = ink; cx2.fillStyle = ink; cx2.lineWidth = 1.4;
    for (let i = 0; i < NB; i++) {
      const b = bd[i]; b.y = (b.y - b.v * .012 * (reduced ? 0 : 1) * (1 + S.burst * 9) + 1) % 1;
      const r = b.s * S.bub * (1 + S.burst * 1.6); if (r < .5) continue;
      const x = b.x * W + Math.sin(t * .8 + b.w) * 10 * f, y = b.y * H;
      cx2.globalAlpha = .45; cx2.beginPath(); cx2.arc(x, y, r, 0, TAU); cx2.stroke();
      cx2.globalAlpha = .08; cx2.fill();
    }
    cx2.globalAlpha = 1;
  }
  requestAnimationFrame(frame);
})();
