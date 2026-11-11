import { loaderState } from './loader-state.js';

const html = document.documentElement;
const curtain = document.querySelector('.curtain');
const bar = curtain.querySelector('.curtain-bar');
const status = curtain.querySelector('.curtain-status');

function render(extra = {}) {
  const { loaded, total } = window.CanStage ? window.CanStage.progress : {};
  const state = loaderState({ loaded, total, ...extra });
  bar.value = state.pct;
  status.textContent = state.label;
  return state;
}

function remove() {
  curtain.style.display = 'none';
  curtain.setAttribute('aria-hidden', 'true');
  html.dataset.loaded = '1';
}

function leave({ reduced }) {
  const { exit } = render({ ready: true, reduced });
  if (exit === 'none' || !window.gsap) { remove(); return Promise.resolve(); }
  return new Promise(resolve => {
    gsap.timeline({ onComplete() { remove(); resolve(); } })
      .to([status, bar], { opacity: 0, duration: .25, ease: 'power2.out' }, 0)
      .to(curtain, { yPercent: -100, duration: .8, ease: 'expo.inOut' }, .15);
  });
}

window.addEventListener('can:progress', () => render());
render();
window.CebadorLoader = { leave };
