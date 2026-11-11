# CEB-2 · performance

status: proposed
cap: 120 min
sources: the requester's message in the session ("arregla todo lo de cebador porfa"), which points at the list of causes of slowness given to them in the same session, quoted in Specs
not_read: none (no attachments or links)

## Specs

- S1 · "La pantalla de carga espera demasiado"
- S2 · "El fondo se repinta 60 veces por segundo"
- S3 · "Hay animaciones que nunca paran"
- S4 · "La capa de grano es cara"
- S5 · "El scroll lee el layout en cada evento"
- S6 · "Blur de fondo sobre contenido animado"
- S7 · "500 KB de fuentes sin recortar ni precargar"
- S8 · "Las imágenes de \"abrir la lata\" (3.7 MB) se bajan apenas carga"
- S9 · "Los cuadros de la lata son más grandes de lo que se muestran"
- CEB-2-ASM-01 · the loading screen leaves once the first 8 frames of the turn (0, 24, 12, 36, 6, 18, 30, 42) and the can's geometry are in; the other frames keep loading behind it · S1
- CEB-2-ASM-02 · the opening frames and the other flavors load when the browser is idle after the intro, or at the first interaction with the flavors or the buy button, whichever comes first · S8
- CEB-2-ASM-03 · the grain is a pre-rendered noise tile of 256 px with no blend mode, at an opacity that keeps the same look · S4
- CEB-2-ASM-04 · the nav pill, the box builder and the sticky bar drop the backdrop blur and get a more opaque background of the same color · S6
- CEB-2-ASM-05 · a second set of turn frames at two thirds of the size is used when the can's drawn height times the device pixel ratio fits in it · S9
- CEB-2-ASM-06 · the fonts are subset to the Latin characters the page uses, keeping the axes the CSS uses, and the faces above the fold are preloaded · S7
- CEB-2-ASM-07 · the can's idle sway and the bubbles rest after 3 s with no scroll, pointer, wheel, touch or key input (counted from the end of the intro), and resume on the next input · S3

## Tasks

- T1 · S1, CEB-2-ASM-01, S2, S3, CEB-2-ASM-07, S8, CEB-2-ASM-02, S9, CEB-2-ASM-05 · src/modules/stage/presentation/stage-state.js (presentation), test/stage-state.test.mjs, test/stage-rest.test.mjs · tests: test/stage-state.test.mjs "the curtain waits for frames 0, 24, 12, 36, 6, 18, 30 and 42 only (8 frames) @CEB-2-S1 @CEB-2-ASM-01"; test/stage-state.test.mjs "the glow is written only when it moves @CEB-2-S2"; test/stage-state.test.mjs "a loop stops once it has settled @CEB-2-S3"; test/stage-state.test.mjs "the extras wait for idle or the first interaction @CEB-2-S8 @CEB-2-ASM-02"; test/stage-state.test.mjs "the small frames serve when they cover the drawn can @CEB-2-S9 @CEB-2-ASM-05"; test/stage-rest.test.mjs "the can and the bubbles rest after 3 s without input @CEB-2-S3 @CEB-2-ASM-07"
  new: no rule module for the stage exists (Grep ready|loadOpen|setProperty|requestAnimationFrame: the decisions live inline in can2d.js and main.js)
- T2 · S1, S8, S9 · can2d.js (presentation), assets/turn-sm/maracuya-00.webp (presentation), assets/turn-sm/maracuya-01.webp (presentation), assets/turn-sm/maracuya-02.webp (presentation), assets/turn-sm/maracuya-03.webp (presentation), assets/turn-sm/maracuya-04.webp (presentation), assets/turn-sm/maracuya-05.webp (presentation), assets/turn-sm/maracuya-06.webp (presentation), assets/turn-sm/maracuya-07.webp (presentation), assets/turn-sm/maracuya-08.webp (presentation), assets/turn-sm/maracuya-09.webp (presentation), assets/turn-sm/maracuya-10.webp (presentation), assets/turn-sm/maracuya-11.webp (presentation), assets/turn-sm/maracuya-12.webp (presentation), assets/turn-sm/maracuya-13.webp (presentation), assets/turn-sm/maracuya-14.webp (presentation), assets/turn-sm/maracuya-15.webp (presentation), assets/turn-sm/maracuya-16.webp (presentation), assets/turn-sm/maracuya-17.webp (presentation), assets/turn-sm/maracuya-18.webp (presentation), assets/turn-sm/maracuya-19.webp (presentation), assets/turn-sm/maracuya-20.webp (presentation), assets/turn-sm/maracuya-21.webp (presentation), assets/turn-sm/maracuya-22.webp (presentation), assets/turn-sm/maracuya-23.webp (presentation), assets/turn-sm/maracuya-24.webp (presentation), assets/turn-sm/maracuya-25.webp (presentation), assets/turn-sm/maracuya-26.webp (presentation), assets/turn-sm/maracuya-27.webp (presentation), assets/turn-sm/maracuya-28.webp (presentation), assets/turn-sm/maracuya-29.webp (presentation), assets/turn-sm/maracuya-30.webp (presentation), assets/turn-sm/maracuya-31.webp (presentation), assets/turn-sm/maracuya-32.webp (presentation), assets/turn-sm/maracuya-33.webp (presentation), assets/turn-sm/maracuya-34.webp (presentation), assets/turn-sm/maracuya-35.webp (presentation), assets/turn-sm/maracuya-36.webp (presentation), assets/turn-sm/maracuya-37.webp (presentation), assets/turn-sm/maracuya-38.webp (presentation), assets/turn-sm/maracuya-39.webp (presentation), assets/turn-sm/maracuya-40.webp (presentation), assets/turn-sm/maracuya-41.webp (presentation), assets/turn-sm/maracuya-42.webp (presentation), assets/turn-sm/maracuya-43.webp (presentation), assets/turn-sm/maracuya-44.webp (presentation), assets/turn-sm/maracuya-45.webp (presentation), assets/turn-sm/maracuya-46.webp (presentation), assets/turn-sm/maracuya-47.webp (presentation), assets/turn-sm/menta-00.webp (presentation), assets/turn-sm/menta-01.webp (presentation), assets/turn-sm/menta-02.webp (presentation), assets/turn-sm/menta-03.webp (presentation), assets/turn-sm/menta-04.webp (presentation), assets/turn-sm/menta-05.webp (presentation), assets/turn-sm/menta-06.webp (presentation), assets/turn-sm/menta-07.webp (presentation), assets/turn-sm/menta-08.webp (presentation), assets/turn-sm/menta-09.webp (presentation), assets/turn-sm/menta-10.webp (presentation), assets/turn-sm/menta-11.webp (presentation), assets/turn-sm/menta-12.webp (presentation), assets/turn-sm/menta-13.webp (presentation), assets/turn-sm/menta-14.webp (presentation), assets/turn-sm/menta-15.webp (presentation), assets/turn-sm/menta-16.webp (presentation), assets/turn-sm/menta-17.webp (presentation), assets/turn-sm/menta-18.webp (presentation), assets/turn-sm/menta-19.webp (presentation), assets/turn-sm/menta-20.webp (presentation), assets/turn-sm/menta-21.webp (presentation), assets/turn-sm/menta-22.webp (presentation), assets/turn-sm/menta-23.webp (presentation), assets/turn-sm/menta-24.webp (presentation), assets/turn-sm/menta-25.webp (presentation), assets/turn-sm/menta-26.webp (presentation), assets/turn-sm/menta-27.webp (presentation), assets/turn-sm/menta-28.webp (presentation), assets/turn-sm/menta-29.webp (presentation), assets/turn-sm/menta-30.webp (presentation), assets/turn-sm/menta-31.webp (presentation), assets/turn-sm/menta-32.webp (presentation), assets/turn-sm/menta-33.webp (presentation), assets/turn-sm/menta-34.webp (presentation), assets/turn-sm/menta-35.webp (presentation), assets/turn-sm/menta-36.webp (presentation), assets/turn-sm/menta-37.webp (presentation), assets/turn-sm/menta-38.webp (presentation), assets/turn-sm/menta-39.webp (presentation), assets/turn-sm/menta-40.webp (presentation), assets/turn-sm/menta-41.webp (presentation), assets/turn-sm/menta-42.webp (presentation), assets/turn-sm/menta-43.webp (presentation), assets/turn-sm/menta-44.webp (presentation), assets/turn-sm/menta-45.webp (presentation), assets/turn-sm/menta-46.webp (presentation), assets/turn-sm/menta-47.webp (presentation), assets/turn-sm/meta.json (presentation), assets/turn-sm/pomelo-00.webp (presentation), assets/turn-sm/pomelo-01.webp (presentation), assets/turn-sm/pomelo-02.webp (presentation), assets/turn-sm/pomelo-03.webp (presentation), assets/turn-sm/pomelo-04.webp (presentation), assets/turn-sm/pomelo-05.webp (presentation), assets/turn-sm/pomelo-06.webp (presentation), assets/turn-sm/pomelo-07.webp (presentation), assets/turn-sm/pomelo-08.webp (presentation), assets/turn-sm/pomelo-09.webp (presentation), assets/turn-sm/pomelo-10.webp (presentation), assets/turn-sm/pomelo-11.webp (presentation), assets/turn-sm/pomelo-12.webp (presentation), assets/turn-sm/pomelo-13.webp (presentation), assets/turn-sm/pomelo-14.webp (presentation), assets/turn-sm/pomelo-15.webp (presentation), assets/turn-sm/pomelo-16.webp (presentation), assets/turn-sm/pomelo-17.webp (presentation), assets/turn-sm/pomelo-18.webp (presentation), assets/turn-sm/pomelo-19.webp (presentation), assets/turn-sm/pomelo-20.webp (presentation), assets/turn-sm/pomelo-21.webp (presentation), assets/turn-sm/pomelo-22.webp (presentation), assets/turn-sm/pomelo-23.webp (presentation), assets/turn-sm/pomelo-24.webp (presentation), assets/turn-sm/pomelo-25.webp (presentation), assets/turn-sm/pomelo-26.webp (presentation), assets/turn-sm/pomelo-27.webp (presentation), assets/turn-sm/pomelo-28.webp (presentation), assets/turn-sm/pomelo-29.webp (presentation), assets/turn-sm/pomelo-30.webp (presentation), assets/turn-sm/pomelo-31.webp (presentation), assets/turn-sm/pomelo-32.webp (presentation), assets/turn-sm/pomelo-33.webp (presentation), assets/turn-sm/pomelo-34.webp (presentation), assets/turn-sm/pomelo-35.webp (presentation), assets/turn-sm/pomelo-36.webp (presentation), assets/turn-sm/pomelo-37.webp (presentation), assets/turn-sm/pomelo-38.webp (presentation), assets/turn-sm/pomelo-39.webp (presentation), assets/turn-sm/pomelo-40.webp (presentation), assets/turn-sm/pomelo-41.webp (presentation), assets/turn-sm/pomelo-42.webp (presentation), assets/turn-sm/pomelo-43.webp (presentation), assets/turn-sm/pomelo-44.webp (presentation), assets/turn-sm/pomelo-45.webp (presentation), assets/turn-sm/pomelo-46.webp (presentation), assets/turn-sm/pomelo-47.webp (presentation), index.html (presentation) · tests: test/perf.e2e.mjs "the curtain leaves sooner with fewer bytes @CEB-2-S1"; test/perf.e2e.mjs "the opening frames are not fetched before the first interaction or idle @CEB-2-S8"
  reuses: can2d.js loadFlavor nearest loadOpen, src/modules/stage/presentation/stage-state.js
- T3 · S2, S3, S5 · can2d.js (presentation), main.js (presentation), shop.js (presentation), src/modules/stage/presentation/frame-queue.js (presentation), index.html (presentation), test/frame-queue.test.mjs · tests: test/perf.e2e.mjs "the page recalculates no styles while idle @CEB-2-S2 @CEB-2-S3"; test/perf.e2e.mjs "scrolling keeps frames under 50 ms @CEB-2-S5"
  new: src/modules/stage/presentation/frame-queue.js (main.js and shop.js scheduled the scroll paint and the geometry measure with the same rAF code)
  reuses: main.js onScroll updActive, shop.js onScroll, can2d.js frame, src/modules/stage/presentation/stage-state.js
- T4 · S4, CEB-2-ASM-03, S6, CEB-2-ASM-04 · styles.css (presentation), cta.css (presentation), assets/grain.webp (presentation) · tests: test/static-budget.test.mjs "the grain is a small tile with no blend mode @CEB-2-S4 @CEB-2-ASM-03"; test/static-budget.test.mjs "no backdrop blur over the animated stage @CEB-2-S6 @CEB-2-ASM-04"
  reuses: styles.css .grain .pill .build .sticky, cta.css .bg (the opening darkening moves from a filter on the glow to the color of its gradient)
- T5 · S7, CEB-2-ASM-06 · fonts/Fraunces.woff2 (presentation), fonts/Fraunces-Italic.woff2 (presentation), fonts/SchibstedGrotesk.woff2 (presentation), fonts.css (presentation), index.html (presentation) · tests: test/static-budget.test.mjs "the fonts are subset and preloaded @CEB-2-S7 @CEB-2-ASM-06"
  reuses: fonts.css @font-face rules

## Changes to existing behavior

- can2d.js · CanStage.ready resolves after the first eight frames and the geometry; the progress of the loading screen counts those nine
- can2d.js · the opening frames and the other flavors load later (idle or first interaction)
- styles.css · the grain, the nav pill, the box builder and the sticky bar look slightly different: no blend mode, no blur
- fonts/ · the three faces are subset; characters outside the subset fall back to the system font

## Look

- plain: the requirement asks for speed, not a new look; every surface keeps the landing's own tokens

## Gate

```
suite: node --test --test-force-exit test/stage-state.test.mjs test/stage-rest.test.mjs test/static-budget.test.mjs test/loader-state.test.mjs test/loader-state-defaults.test.mjs test/loader-state-loaded-default.test.mjs test/loader-state-single.test.mjs test/frame-queue.test.mjs
lint: node --check src/modules/stage/presentation/stage-state.js
lint: node --check src/modules/stage/presentation/frame-queue.js
mutate src/modules/stage/presentation/stage-state.js: node --test --test-force-exit test/stage-state.test.mjs test/stage-rest.test.mjs
app: python -c "import os,http.server as h; h.ThreadingHTTPServer(('127.0.0.1', int(os.environ['PORT'])), h.SimpleHTTPRequestHandler).serve_forever()"
perf: node --test --test-force-exit --test-concurrency=1 test/perf.e2e.mjs
probe loading: node .claude/tools/app.mjs probe specs/CEB-1-loading-screen/steps/loading.json --axe --contrast ".curtain-status" --route "GET /assets/turn-b4/meta.json=hold" --out .validation/probe/loading
```

- declared · mutate · can2d.js · DOM and canvas wiring: its decisions (when ready, which frames, when to write, when to stop) come from stage-state.js
- declared · mutate · main.js · DOM wiring of scroll and cursor; the stop rule comes from stage-state.js
- declared · mutate · shop.js · reads cached offsets on scroll; no decision of its own

## Log

- L1 · arregla todo lo de cebador porfa
- L2 · 2026-11-11 · T1 · node --test test/stage-state.test.mjs + loader-state*: 12 pass; mutate stage-state.js 30/31, 1 equivalent declared
- L3 · 2026-11-11 · T2/T3 · perf.e2e.mjs on 1440x900: S1 1333 KB at ~1.8-2.2 s (fonts still unsubset), S8 pass, S2/S3 71 recalcs idle (idle bob of the can writes styles each frame; 0 without it), S5 108-116 frames over 50 ms (waits on T4 grain/blur)
- L4 · 2026-11-11 · ASM-07 · the idle sway and bubbles kept the page recalculating styles every frame (72 in 3 s); they rest after 3 s without input, the cheapest reading to undo
- L5 · 2026-11-11 · T4 · grain.webp 17.9 KB 256 px sin blend, 0 backdrop-filter; node --test static-budget: grano y blur pasan; perf S5 3 y 8 frames >50 ms en 2 corridas (limite 5)
- L6 · 2026-11-11 · T5 · fuentes 113+140+44 = 289 KB (pedido 250) con wght/SOFT/WONK/opsz intactos, preload de las 3 en index.html; static-budget falla solo en el tope de 250 KB
- L7 · 2026-11-11 · T3 · .glow propio (will-change + translate3d) en vez de --gx/--gy sobre .bg; capturas antes/despues a 1440 y 390 (tope y scroll 450) iguales
- L8 · 2026-11-11 · T5 · Fraunces roman solo en .odo .col i (digitos 0-9); subset a U+0030-0039 con los 4 ejes: 9,5 KB, total 188,5 KB; static-budget pasa
- L9 · 2026-11-11 · T3 · filter sobre .glow costaba ~2 s de DrawFrame por scroll en el compositor por software; el brightness de --fq pasa al color del degradado (mismo resultado en pixeles de fondo)
- L10 · 2026-11-11 · kit: mutate.mjs ignores every equivalents line written with CRLF (its LINE regex ends in (.+)$ and . does not match \r); the file was converted to LF
