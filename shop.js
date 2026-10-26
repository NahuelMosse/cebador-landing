/* Compra: armador de caja, carrito, cajón, locales, newsletter, barra pegajosa. */
(function () {
  const F = window.FLAVORS, boxPrice = window.boxPrice;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement, g = window.gsap;
  const fmt = n => '$' + n.toLocaleString('es-AR');
  const COL = { pomelo: '#ff6b6b', menta: '#4fd69c', maracuya: '#ffb81f', mix: '#ffc2b3' };
  const SIZES = [6, 12, 24];
  let flavor = 'pomelo', size = 6, state = 'rest', cart = [];
  const S = () => (window.CanStage && window.CanStage.S) || null;

  /* ---------- aviso ---------- */
  const toastEl = $('#toast'); let tt;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 2200); }

  /* ---------- selección ---------- */
  const sizesEl = $('#sizes'), odo = $('#odo');
  sizesEl.innerHTML = SIZES.map(n => `<button class="sz" type="button" role="radio" data-n="${n}" aria-checked="${n === size}" tabindex="${n === size ? 0 : -1}"><b>${n}</b><small></small></button>`).join('');
  let odoLen = 0;
  function setOdo(p, fromZero) {
    const s = fmt(p).slice(1), ds = [...s].filter(x => /\d/.test(x));
    const go = () => $$('.col', odo).forEach((c, i) => { c.style.transform = `translateY(-${ds[i]}em)`; });
    if (fromZero || odoLen !== s.length) {
      odo.innerHTML = '<span class="sym">$</span>' + [...s].map(ch => /\d/.test(ch) ? '<span class="d"><span class="col">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<i>${d}</i>`).join('') + '</span></span>' : `<span>${ch}</span>`).join('');
      odoLen = s.length;
      if (fromZero && !reduced) requestAnimationFrame(() => requestAnimationFrame(go)); else go();
    } else go();
  }
  function refresh(fromZero) {
    const P = boxPrice(flavor, size), name = F[flavor].short;
    $('#ctaL1').textContent = `Abrir ${name} · ${fmt(P)}`;
    $('.cta-l2').textContent = `Caja x${size}`;
    $$('.sz', sizesEl).forEach(b => {
      const n = +b.dataset.n, on = n === size;
      b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1;
      $('small', b).textContent = fmt(Math.round(boxPrice(flavor, n) / n / 10) * 10) + ' c/u';
    });
    setOdo(P, fromZero);
    $('#odoSr').textContent = `${size} latas de ${name}, ${fmt(P)}`;
    $('#addL').textContent = `Sumar ${size} de ${name}`;
    $('#stickyL').textContent = `${name} · ${size} latas`;
    $('#stickyP').textContent = `Sumar · ${fmt(P)}`;
    $('#sticky').style.setProperty('--dot', COL[flavor]);
  }
  document.addEventListener('flavor', e => { flavor = e.detail; refresh(); });
  function setSize(n) { size = n; refresh(); }
  sizesEl.addEventListener('click', e => { const b = e.target.closest('.sz'); if (b) setSize(+b.dataset.n); });
  sizesEl.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return; e.preventDefault();
    setSize(SIZES[(SIZES.indexOf(size) + d + 3) % 3]); $('.sz[aria-checked=true]', sizesEl).focus();
  });
  $('#stickySize').addEventListener('click', () => setSize(SIZES[(SIZES.indexOf(size) + 1) % 3]));

  /* ---------- abrir la lata: el riel de cta.js llama a open() ---------- */
  const wrap = $('#ctaWrap'), build = $('#build');
  function open() {
    state = 'open'; html.dataset.can = 'open';
    const s = S();
    if (s && g && !reduced) g.fromTo(s, { burst: 0 }, { burst: 1, duration: .3, ease: 'power2.out', yoyo: true, repeat: 1 });
    wrap.classList.add('open'); build.inert = false;
    refresh(true);
    setTimeout(() => { state = 'purchase'; const c = $('.sz[aria-checked=true]', sizesEl); if (c) c.focus({ preventScroll: true }); }, reduced ? 0 : 600);
  }
  window.CanShop = { open };
  $('#closeCan').addEventListener('click', () => {
    wrap.classList.remove('open'); build.inert = true; state = 'rest'; delete html.dataset.can;
    const t = $('.rail-tab'); if (t) t.focus({ preventScroll: true });
  });

  /* ---------- caja ---------- */
  const lines = $('#lines'), cartN = $('#cartN'), cartBtn = $('#cartBtn');
  function renderCart() {
    lines.innerHTML = cart.map((l, i) => `<li><i class="dot" style="background:${COL[l.flavor]}"></i><span><b>${l.label}</b><small>${fmt(l.price)}</small></span><button class="rm" type="button" data-i="${i}" aria-label="Quitar ${l.label}">Quitar</button></li>`).join('');
    $('#total').textContent = fmt(cart.reduce((a, l) => a + l.price, 0));
    cartN.textContent = cart.length; $('#empty').hidden = cart.length > 0;
    $('#checkout').hidden = !cart.length; $('#goHero').hidden = cart.length > 0;
    cartBtn.setAttribute('aria-label', `Mi caja, ${cart.length} ${cart.length === 1 ? 'ítem' : 'ítems'}`);
  }
  function fly(el, k) {
    const th = window.CanStage && window.CanStage.thumbs[k === 'mix' ? 'pomelo' : k];
    if (reduced || !el || !th) return;
    const a = el.getBoundingClientRect(), b = cartBtn.getBoundingClientRect();
    const x0 = a.left + a.width / 2 - 14, y0 = a.top + a.height / 2 - 26, x1 = b.left + b.width / 2 - 14, y1 = b.top + b.height / 2 - 26;
    const im = new Image(); im.src = th; im.className = 'fly'; im.alt = ''; im.style.left = x0 + 'px'; im.style.top = y0 + 'px'; document.body.appendChild(im);
    const mx = (x0 + x1) / 2 - x0, my = Math.min(y0, y1) - 120 - y0;
    im.animate([{ transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 }, { transform: `translate(${mx}px,${my}px) scale(.85) rotate(160deg)`, opacity: 1, offset: .5 }, { transform: `translate(${x1 - x0}px,${y1 - y0}px) scale(.25) rotate(340deg)`, opacity: .25 }], { duration: 700, easing: 'cubic-bezier(.3,.7,.4,1)' }).onfinish = () => im.remove();
  }
  function add(line, el, btn) {
    cart.push(line); renderCart(); fly(el, line.flavor); toast(`${line.label} sumada a tu caja`);
    cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump');
    if (btn) { const l = $('b', btn) || $('span', btn); const t0 = l.textContent; btn.dataset.done = 'true'; l.textContent = 'Sumada ✓'; setTimeout(() => { btn.dataset.done = 'false'; l.textContent = t0 === 'Sumada ✓' ? t0 : t0; refresh(); }, 1400); }
  }
  const selLine = () => ({ flavor, n: size, price: boxPrice(flavor, size), label: `${F[flavor].short} · caja x${size}` });
  $('#addBox').addEventListener('click', e => add(selLine(), e.currentTarget, e.currentTarget));
  $('#stickyAdd').addEventListener('click', e => add(selLine(), e.currentTarget, e.currentTarget));
  $('#addOne').addEventListener('click', e => add({ flavor, n: 1, price: F[flavor].unit, label: `${F[flavor].short} · 1 lata` }, e.currentTarget, e.currentTarget));
  $('#addMix').addEventListener('click', e => add({ flavor: 'mix', n: 6, price: 16900, label: 'Pack x6 · tres sabores' }, e.currentTarget, e.currentTarget));
  lines.addEventListener('click', e => { const b = e.target.closest('.rm'); if (!b) return; cart.splice(+b.dataset.i, 1); renderCart(); });

  /* ---------- cajón ---------- */
  const drawer = $('#drawer'), scrim = $('#scrim'), done = $('#done'); let lastFocus = null;
  function openDrawer() { lastFocus = document.activeElement; done.hidden = true; drawer.inert = false; drawer.classList.add('on'); scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('on')); $('#drawerX').focus({ preventScroll: true }); }
  function closeDrawer() { drawer.classList.remove('on'); scrim.classList.remove('on'); drawer.inert = true; setTimeout(() => { scrim.hidden = true; }, 260); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  cartBtn.addEventListener('click', openDrawer);
  $('#drawerX').addEventListener('click', closeDrawer); scrim.addEventListener('click', closeDrawer); $('#doneX').addEventListener('click', closeDrawer);
  addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('on')) closeDrawer(); });
  $('#goHero').addEventListener('click', () => { lastFocus = null; closeDrawer(); $('a.logo').click(); setTimeout(() => { const t = $('.rail-tab'); if (t) t.focus({ preventScroll: true }); }, 900); });
  $('#checkout').addEventListener('click', () => {
    const tot = cart.reduce((a, l) => a + l.price, 0);
    $('#doneMsg').textContent = `Tu caja de ${cart.length} ${cart.length === 1 ? 'ítem' : 'ítems'} por ${fmt(tot)} quedó reservada. Pedido CB-${Math.floor(1000 + Math.random() * 9000)}.`;
    cart = []; renderCart(); done.hidden = false; $('#doneX').focus({ preventScroll: true });
  });

  /* ---------- dónde comprar ---------- */
  const CITIES = {
    'Buenos Aires': [['Almacén La Ronda', 'Calle del Mate 1420, Palermo', 'Almacén · 9 a 21'], ['Dietética Monte Verde', 'Av. de los Naranjos 5210, Villa Crespo', 'Dietética · 10 a 20'], ['Kiosco El Tranvía', 'Pasaje Tranvía 980, San Telmo', 'Kiosco · 24 hs'], ['Café Bombilla', 'Av. Bombilla 2230, Belgrano', 'Café · 8 a 22']],
    'Córdoba': [['Almacén Nueva Córdoba', 'Calle Yerbal 740', 'Almacén · 9 a 22'], ['Feria Güemes', 'Calle Los Ceibos 1150, Güemes', 'Feria · sáb y dom'], ['Dietética La Cañada', 'Av. del Cebador 380', 'Dietética · 9 a 20'], ['Kiosco Cañada', 'Calle Cañada Chica 120', 'Kiosco · 24 hs']],
    'Rosario': [['Café Pichincha', 'Av. Los Aromos 1100, Pichincha', 'Café · 8 a 21'], ['Almacén del Centro', 'Calle Plaza Mayor 1650', 'Almacén · 8 a 20'], ['Cervecería Oroño', 'Bv. Los Álamos 1200', 'Bar · desde las 18'], ['Almacén Fisherton', 'Calle Costanera Chica 450', 'Almacén · 9 a 21']],
    'Montevideo': [['Despensa Pocitos', 'Calle Los Jazmines 900, Pocitos', 'Despensa · 9 a 21'], ['Café Ciudad Vieja', 'Calle del Puerto Viejo 450', 'Café · 8 a 19'], ['Despensa Cordón', 'Av. Las Palmeras 1850', 'Despensa · 9 a 20'], ['Kiosco Rambla', 'Rambla de los Pescadores 5500', 'Kiosco · 7 a 23']]
  };
  const tabs = $('#cityTabs'), list = $('#storeList'); let city = 'Buenos Aires', tick = 0;
  tabs.innerHTML = Object.keys(CITIES).map(c => `<button class="tab" type="button" role="radio" data-c="${c}" aria-checked="${c === city}" tabindex="${c === city ? 0 : -1}">${c}</button>`).join('');
  function renderStores() {
    tick++; list.dataset.tick = tick;
    if (!list.children.length) list.innerHTML = [0, 1, 2, 3].map(() => '<li><span class="s-n"><b></b><small></small></span><span class="s-a"></span><button class="copy" type="button">Copiar dirección</button></li>').join('');
    CITIES[city].forEach((s, i) => { const li = list.children[i]; $('b', li).textContent = s[0]; $('small', li).textContent = s[2]; $('.s-a', li).textContent = s[1]; $('.copy', li).dataset.a = `${s[1]}, ${city}`; });
    $$('.tab', tabs).forEach(b => { const on = b.dataset.c === city; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
  }
  tabs.addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) { city = b.dataset.c; renderStores(); } });
  tabs.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return; e.preventDefault();
    const ks = Object.keys(CITIES); city = ks[(ks.indexOf(city) + d + ks.length) % ks.length]; renderStores(); $('.tab[aria-checked=true]', tabs).focus();
  });
  list.addEventListener('click', e => {
    const b = e.target.closest('.copy'); if (!b) return;
    try { navigator.clipboard && navigator.clipboard.writeText(b.dataset.a).catch(() => { }); } catch (_) { }
    b.textContent = 'Copiada ✓'; b.dataset.done = 'true'; toast('Dirección copiada');
    setTimeout(() => { b.textContent = 'Copiar dirección'; b.dataset.done = 'false'; }, 1600);
  });
  renderStores();

  /* ---------- newsletter ---------- */
  const news = $('#news'), mail = $('#mail'), msg = $('#newsMsg');
  news.addEventListener('submit', e => {
    e.preventDefault(); const val = mail.value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) { msg.dataset.s = 'err'; msg.textContent = 'Ese mail no parece completo. Revisalo y probá de nuevo.'; mail.setAttribute('aria-invalid', 'true'); mail.focus(); return; }
    mail.removeAttribute('aria-invalid'); msg.dataset.s = 'ok'; msg.textContent = `Listo, te avisamos a ${val} cuando salga el próximo sabor ✓`; news.classList.add('sent'); mail.value = '';
  });

  /* ---------- ingredientes: eligen sabor y bajan ---------- */
  $$('[data-ing]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.ing;
    if (k) { const r = $(`.sl[data-flavor=${k}]`); if (r) r.click(); } else toast('Va en las tres latas.');
    $('a.h-scroll').click();
  }));

  /* ---------- barra pegajosa: solo dentro de #comprar ---------- */
  const sticky = $('#sticky'); sticky.inert = true;
  new IntersectionObserver(([e]) => { const on = e.isIntersecting; sticky.classList.toggle('show', on); sticky.inert = !on; sticky.setAttribute('aria-hidden', !on); }, { threshold: .15 }).observe($('#comprar'));

  /* ---------- cinta y arco ---------- */
  const rib = $('[data-ribbon]'), sab = $('#sabores'), arch = $('#arch');
  function onScroll() {
    const y = scrollY, H = innerHeight;
    if (!reduced) rib.style.transform = `translate3d(${-(y - sab.offsetTop + H) * .5}px,0,0)`;
    const a = Math.min(1, Math.max(0, (y - (sab.offsetTop - H * .55)) / (H * .45)));
    const b = 1 - Math.min(1, Math.max(0, (y - (sab.offsetTop + sab.offsetHeight - H * 1.05)) / (H * .35)));
    arch.style.opacity = (a * b).toFixed(3);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  renderCart(); refresh();
})();
