# CEB-1 · loading screen

status: proposed
cap: 60 min
sources: the requester's message in the session (text, no Jira card)
not_read: none (no attachments or links)

## Specs

- S1 · "le pongas una pantalla de carga" · state: loading
- CEB-1-ASM-01 · the loading screen shows how much of the first can's turn has loaded, as a percentage, and tells screen readers that the page is loading and when it is ready · S1
- CEB-1-ASM-02 · the loading screen leaves when the can is ready, or when the landing's existing 9 s fallback fires, and the landing's intro plays after it · S1
- CEB-1-ASM-03 · with reduced motion the loading screen leaves at once, with no exit animation · S1

## Tasks

- T1 · S1, CEB-1-ASM-01, CEB-1-ASM-02, CEB-1-ASM-03 · src/modules/loader/presentation/loader-state.js (presentation), test/loader-state.test.mjs · tests: test/loader-state.test.mjs "shows the share of the first can's frames loaded @CEB-1-S1"; test/loader-state.test.mjs "announces the wait and its end as text @CEB-1-ASM-01"; test/loader-state.test.mjs "leaves when the can is ready or the fallback fires @CEB-1-ASM-02"; test/loader-state.test.mjs "leaves with no exit animation under reduced motion @CEB-1-ASM-03"
  new: no loading logic exists (Grep progress|loaded|curtain in *.js: only the hidden .curtain stub and main.js boot)
- T2 · S1, CEB-1-ASM-02 · src/modules/loader/presentation/loader.js (presentation), index.html (presentation), styles.css (presentation), can2d.js (presentation), main.js (presentation) · tests: test/loader-state.test.mjs "shows the share of the first can's frames loaded @CEB-1-S1"
  reuses: index.html .curtain and .curtain-mark, styles.css tokens --c4 --bg2 --out --inout, can2d.js loadFlavor, main.js intro and boot

## Changes to existing behavior

- index.html · the hidden .curtain becomes the visible loading screen, with a status line and a progress bar
- main.js · intro() takes the curtain away before the headline enters
- can2d.js · CanStage exposes the frames loaded of the first flavor

## Look

- plain: the requirement names no look; the loading screen takes the landing's own tokens and the Cebador wordmark the hidden curtain already draws

## Gate

```
suite: node --test --test-force-exit test/loader-state.test.mjs test/loader-state-defaults.test.mjs
lint: node --check src/modules/loader/presentation/loader-state.js
mutate src/modules/loader/presentation/loader-state.js: node --test --test-force-exit test/loader-state.test.mjs test/loader-state-defaults.test.mjs
app: python -c "import os,http.server as h; h.ThreadingHTTPServer(('127.0.0.1', int(os.environ['PORT'])), h.SimpleHTTPRequestHandler).serve_forever()"
probe loading: node .claude/tools/app.mjs probe specs/CEB-1-loading-screen/steps/loading.json --axe --contrast ".curtain-status" --route "GET /assets/turn-b4/meta.json=hold" --out .validation/probe/loading
overflow: node .claude/tools/overflow.mjs --only .curtain
```

- declared · mutate · src/modules/loader/presentation/loader.js · DOM wiring only: every decision it shows comes from loader-state.js
- declared · mutate · can2d.js · one counter of frames loaded, read through loader-state.js
- declared · mutate · main.js · calls the curtain exit at the start of the intro; the decision is loader-state.js's

## Log

- L1 · quiero que usando el kit de mi gh sobre debador le pongas una pantalla de carga
