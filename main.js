(function () {
  const F = window.FLAVORS, ORDER = window.FLAVOR_ORDER;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const g = window.gsap;
  let cur = 'pomelo', metersOn = false, stageOk = false;

  /* ---------- scroll suave ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: .1, wheelMultiplier: .95 });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault();
    if (lenis) lenis.scrollTo(t, { duration: 1.5, easing: x => 1 - Math.pow(1 - x, 4), offset: a.getAttribute('href') === '#inicio' ? 0 : 0 });
    else t.scrollIntoView();
  }));

  /* ---------- helpers de texto ---------- */
  function splitChars(el) {
    const txt = el.textContent; el.textContent = '';
    const wrap = document.createElement('span'); wrap.className = 'mask'; wrap.style.display = 'block';
    [...txt].forEach(ch => { const s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; s.style.display = 'inline-block'; wrap.appendChild(s); });
    el.appendChild(wrap); return [...wrap.children];
  }
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/); el.textContent = '';
    return words.map((w, i) => {
      const m = document.createElement('span'); m.className = 'mask'; m.style.display = 'inline-block';
      const s = document.createElement('span'); s.textContent = w; m.appendChild(s);
      el.appendChild(m); if (i < words.length - 1) el.appendChild(document.createTextNode(' ')); return s;
    });
  }
  function swapText(el, text) {
    if (el.textContent === text) return;
    if (reduced || !g) { el.textContent = text; return; }
    if (!el._m) { el.innerHTML = '<span class="mask"><span></span></span>'; el._m = el.firstChild.firstChild; el._m.textContent = el.dataset.cur || ''; }
    const inner = el._m; inner.getAnimations().forEach(a => a.cancel());
    const out = inner.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-115%)' }], { duration: 350, easing: 'cubic-bezier(.55,.06,.68,.19)', fill: 'forwards' });
    out.onfinish = () => { inner.textContent = text; out.cancel(); inner.animate([{ transform: 'translateY(115%)' }, { transform: 'translateY(0)' }], { duration: 800, easing: 'cubic-bezier(.16,1,.3,1)' }); };
  }
  $$('[data-swap]').forEach(el => { el.dataset.cur = el.textContent; });

  /* ---------- sabor ---------- */
  function applyMeters(k) {
    $$('[data-m]').forEach((b, i) => { b.style.transitionDelay = (i * 90) + 'ms'; b.style.setProperty('--v', metersOn ? F[k].meters[b.dataset.m] / 100 : 0); });
  }
  function radios() { return $$('[role=radio][data-flavor]'); }
  function setFlavor(k) {
    if (!F[k]) return;
    if (k === cur) { const n = String(+(html.dataset.tap || 0) + 1); html.dataset.tap = n; radios().forEach(r => { if (r.dataset.flavor === k) r.dataset.tap = n; }); if (stageOk) CanStage.setFlavor(k); return; }
    cur = k; html.dataset.flavor = k;
    document.dispatchEvent(new CustomEvent('flavor', { detail: k }));
    radios().forEach(r => { const on = r.dataset.flavor === k; r.setAttribute('aria-checked', on); r.tabIndex = on ? 0 : -1; });
    const f = F[k];
    $$('[data-f]').forEach(el => { const v = f[el.dataset.f]; el.dataset.cur = v; swapText(el, v); });
    applyMeters(k);
    if (stageOk) CanStage.setFlavor(k);
  }
  radios().forEach(r => { r.tabIndex = r.getAttribute('aria-checked') === 'true' ? 0 : -1; r.addEventListener('click', () => setFlavor(r.dataset.flavor)); });
  $$('[role=radiogroup]').forEach(grp => grp.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return; e.preventDefault();
    const k = ORDER[(ORDER.indexOf(cur) + d + 3) % 3]; setFlavor(k);
    const next = $(`[role=radio][data-flavor=${k}]`, grp); if (next) next.focus();
  }));
  document.addEventListener('canflavor', e => setFlavor(ORDER[(ORDER.indexOf(cur) + e.detail + 3) % 3]));

  /* ---------- nav ---------- */
  const pill = $('.pill'), ind = $('.pill-ind'), links = $$('a', pill);
  let active = links[0];
  // la copia de las etiquetas en el color "sobre la pastilla" va recortada al rectangulo actual de la pastilla:
  // el resaltado y el color se mueven en el mismo cuadro, letra por letra
  const onLayer = document.createElement('div'); onLayer.className = 'pill-on'; onLayer.setAttribute('aria-hidden', 'true');
  links.forEach(a => { const s = document.createElement('span'); s.textContent = a.textContent; onLayer.appendChild(s); });
  pill.appendChild(onLayer);
  const pi = { x: 0, w: 0, v: 0, vw: 0, tx: 0, tw: 0, run: false, init: false };
  function paintInd() {
    ind.style.width = pi.w + 'px'; ind.style.transform = `translateX(${pi.x}px)`;
    const r = Math.max(0, pill.clientWidth - pi.x - pi.w);
    onLayer.style.clipPath = `inset(6px ${r}px 6px ${Math.max(0, pi.x)}px round 999px)`;
  }
  function stepInd(t) {
    const dt = Math.min(.034, (t - (pi.t || t)) / 1000); pi.t = t;
    const K = 330, C = 2 * Math.sqrt(K) * .78;
    pi.v += ((pi.tx - pi.x) * K - pi.v * C) * dt; pi.x += pi.v * dt;
    pi.vw += ((pi.tw - pi.w) * K - pi.vw * C) * dt; pi.w += pi.vw * dt;
    if (Math.abs(pi.tx - pi.x) < .1 && Math.abs(pi.tw - pi.w) < .1 && Math.abs(pi.v) < .5 && Math.abs(pi.vw) < .5) { pi.x = pi.tx; pi.w = pi.tw; pi.v = pi.vw = 0; pi.run = false; pi.t = 0; }
    paintInd(); if (pi.run) requestAnimationFrame(stepInd);
  }
  function moveInd(a, snap) {
    if (!a || !pill.offsetWidth) return;
    pi.tx = a.offsetLeft; pi.tw = a.offsetWidth;
    if (snap || reduced || !pi.init) { pi.init = true; pi.x = pi.tx; pi.w = pi.tw; pi.v = pi.vw = 0; paintInd(); return; }
    if (!pi.run) { pi.run = true; pi.t = 0; requestAnimationFrame(stepInd); }
  }
  window.__navPill = pi;
  links.forEach(a => { a.addEventListener('pointerenter', () => moveInd(a)); a.addEventListener('focus', () => moveInd(a)); a.addEventListener('pointerleave', () => moveInd(active)); a.addEventListener('blur', () => moveInd(active)); });
  const secs = ['inicio', 'sabores', 'origen', 'resenas', 'comprar'].map(id => document.getElementById(id));
  function updActive() {
    let idx = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= innerHeight * .45) idx = i; });
    if (links[idx] !== active) { active.classList.remove('is-active'); active = links[idx]; active.classList.add('is-active'); moveInd(active); }
  }
  moveInd(active, true); document.fonts.ready.then(() => moveInd(active, true)); addEventListener('resize', () => moveInd(active, true));

  /* ---------- scroll: parallax y marquee ---------- */
  const marq = $('[data-marquee]'), sab = $('#sabores'), hb = $('.h-back'), hf = $('.h-front');
  const par = [[$('.rv-acc'), -.07], [$('.rv-glass'), .05], [$('.pack-cans'), -.04]];
  function onScroll() {
    const y = scrollY;
    if (reduced) { updActive(); return; }
    marq.style.transform = `translate3d(${-(y - sab.offsetTop + innerHeight) * .32}px,0,0)`;
    hb.style.translate = `0 ${y * .22}px`; hf.style.translate = `${y * -.08}px ${y * -.1}px`;
    par.forEach(([el, s]) => { if (!el) return; const r = el.getBoundingClientRect(); el.style.translate = `0 ${(r.top + r.height / 2 - innerHeight / 2 - (parseFloat((el.style.translate || '0 0').split(' ')[1]) || 0)) * s}px`; });
    updActive();
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- cursor y magnéticos ---------- */
  if (fine && !reduced) {
    const ring = $('.ring'); let tx = 0, ty = 0, rx = 0, ry = 0;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; ring.classList.add('on'); const hot = e.target.closest('a,button,input,.rv'); ring.classList.toggle('big', !!hot); }, { passive: true });
    document.addEventListener('pointerleave', () => ring.classList.remove('on'));
    (function loop() { rx += (tx - rx) * .2; ry += (ty - ry) * .2; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
    $$('[data-magnet]').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); g.to(el, { x: (e.clientX - r.left - r.width / 2) * .22, y: (e.clientY - r.top - r.height / 2) * .32, duration: .4, ease: 'power3.out' }); });
      el.addEventListener('pointerleave', () => g.to(el, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1,.45)' }));
    });
    $$('.rv').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; g.to(el, { rotationY: px * 7, rotationX: -py * 7, transformPerspective: 900, y: -6, duration: .5, ease: 'power3.out', overwrite: 'auto' }); });
      el.addEventListener('pointerleave', () => g.to(el, { rotationY: 0, rotationX: 0, y: 0, duration: .9, ease: 'elastic.out(1,.55)', overwrite: 'auto' }));
    });
  }

  /* ---------- reveals ---------- */
  const CT = 'M380 40C430 70 470 110 462 160C455 200 410 215 400 255C392 290 410 320 380 360C350 400 300 410 262 450C230 482 200 520 150 524C110 526 70 500 80 460C90 420 140 410 170 380C200 350 190 310 210 270C230 230 290 215 300 170C310 125 270 100 290 70C305 48 345 25 380 40Z';
  [[0, 1, 1], [-3, .84, .9], [4, .68, .8], [-5, .53, .7], [6, .39, .6], [-4, .26, .5]].forEach(([r, k, o]) => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('class', 'ct'); p.setAttribute('d', CT); p.setAttribute('transform', `translate(292 312) rotate(${r}) scale(${k}) translate(-292 -312)`); p.setAttribute('opacity', o); $('#ctg').appendChild(p); });
  $$('.ct').forEach(p => p.setAttribute('pathLength', '1'));
  const pre = new Map();
  $$('[data-reveal=mask]').forEach(h => { const w = splitWords(h); if (g && !reduced) g.set(w, { yPercent: 115 }); pre.set(h, w); });
  $$('.foot-word span').forEach(s => { if (g && !reduced) g.set(s, { yPercent: 70 }); });
  const doReveal = {
    mask(el) { g.to(pre.get(el), { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: .07 }); },
    rise(el) { g.fromTo(el, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: .25 }); },
    meters() { metersOn = true; applyMeters(cur); },
    draw(el) {
      g.fromTo($$('.ct', el), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: .22 });
      g.fromTo($('.pin', el), { scale: 0, transformOrigin: '292px 312px' }, { scale: 1, duration: .8, ease: 'back.out(3)', delay: 1.6 });
      g.fromTo($$('text', el), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: .9, ease: 'expo.out', delay: 2, stagger: .12 });
    },
    stat(el) {
      g.fromTo(el, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'expo.out' });
      const n = $('[data-count]', el), to = +n.dataset.count, from = to === 0 ? 24 : 0, o = { v: from };
      g.to(o, { v: to, duration: 1.8, ease: 'power3.out', delay: .1, onUpdate() { n.textContent = Math.round(o.v); } });
    },
    card(el) {
      const l = el.dataset.from === 'left';
      g.fromTo(el, { x: l ? -140 : 140, rotation: l ? -7 : 7, opacity: 0, y: 40 }, { x: 0, rotation: 0, opacity: 1, y: 0, duration: 1.3, ease: 'expo.out', clearProps: 'rotation' });
    },
    row(el) { const i = $$('.stores li').indexOf(el); g.fromTo(el, { x: -70, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: i * .08 }); const s = $('.sweep', el); g.fromTo(s, { scaleX: 0 }, { scaleX: 1, duration: .5, ease: 'power3.out', delay: i * .08 + .1, yoyo: true, repeat: 1, repeatDelay: 0 }); },
    pack(el) {
      g.fromTo(el, { y: 90, scale: .88, rotation: 3, opacity: 0 }, { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 1.3, ease: 'back.out(1.3)' });
      g.fromTo($$('.pack-cans img', el), { y: 160, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: .12, delay: .3, clearProps: 'y' });
    }
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const el = e.target; io.unobserve(el);
    el.classList.add('in');
    if (g && !reduced) (doReveal[el.dataset.reveal] || (() => { }))(el);
    else if (el.dataset.reveal === 'meters') { metersOn = true; applyMeters(cur); }
  }), { threshold: .2, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach(el => { if (reduced) { el.classList.add('in'); if (el.dataset.reveal === 'draw') $$('.ct', el).forEach(p => p.style.strokeDashoffset = 0); } io.observe(el); });
  const fw = $('.foot-word span');
  new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { o.disconnect(); if (g && !reduced) g.to(fw, { yPercent: 0, duration: 1.4, ease: 'expo.out' }); } }), { threshold: .3 }).observe($('.foot-word'));

  /* ---------- carga ---------- */
  let started = false;
  function intro() {
    if (started) return; started = true;
    window.__introStart = performance.now();
    const S = window.CanStage.S;
    if (!g || reduced) {
      S.drop = 0; S.fruit = 1; S.bub = 1;
      $('.curtain').style.display = 'none'; $$('[data-in], .hw').forEach(e => e.style.opacity = 1); html.dataset.ready = '1'; return;
    }
    const hw = $$('[data-hw]'); const chars = hw.map(splitChars);
    g.set(chars.flat(), { yPercent: 34, rotation: 5, transformOrigin: '0 100%' });
    const tl = g.timeline({ defaults: { ease: 'power3.out' }, onComplete() { html.dataset.ready = '1'; } });
    tl.to(chars[0], { yPercent: 0, rotation: 0, duration: .8, stagger: .035 }, 0)
      .to(chars[1], { yPercent: 0, rotation: 0, duration: .8, stagger: .03 }, .25)
      .to(S, { drop: 0, duration: 1.2, ease: 'power3.out' }, 0)
      .to(S, { fruit: 1, duration: 1.1, ease: 'power3.out' }, .5)
      .to(S, { bub: 1, duration: 1, ease: 'power2.out' }, .5)
      .fromTo('.nav', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .35)
      .fromTo('.dock', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, .75)
      .fromTo('.h-scroll', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, 1);
    tl.timeScale(1.2);
  }
  function boot(ok) {
    stageOk = ok;
    if (ok) {
      $$('[data-thumb]').forEach(i => { i.src = CanStage.thumbs[i.dataset.thumb]; });
      applyMeters(cur);
    } else { html.classList.add('no-gl'); $('#stage').style.display = 'none'; }
    intro();
  }
  window.CanStage.ready.then(boot);
  setTimeout(() => { if (!started) boot(false); }, 9000);
})();
