const share = (loaded, total) => {
  if (!Number.isFinite(loaded) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round(loaded / total * 100)));
};

export function loaderState({ loaded = 0, total = 0, ready = false, timedOut = false, reduced = false } = {}) {
  const pct = share(loaded, total);
  const done = ready === true || timedOut === true;
  const exit = !done ? null : reduced ? 'none' : 'animate';
  return { pct, label: done ? 'Listo' : `Cargando ${pct} %`, done, exit };
}
