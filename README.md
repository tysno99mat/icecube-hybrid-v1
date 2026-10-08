# IceCube Hybrid V1 — Visual Polish RC1

Local candidate for review. No deployment or Production readiness claim.

Requires Node.js 20+; no package installation is needed. In this extracted folder:

```sh
npm run build
PORT=4176 npm start
```

Open http://127.0.0.1:4176/ . Build defaults to preview metadata with no canonical or invented production origin; this local build setting does not publish a Preview.

Validation:

```sh
npm test
npm run test:renderer
node qa/integrity-check.mjs
```

Open `VISUAL_COMPARISON.html` directly for the five paired comparisons. All 10 raw screenshots, 5 paired images, fixtures, recorded browser evidence, performance samples and release screenshots are in this package. Comparison capture uses QA-only controls in a scratch copy, never in the product `dist`.

Optional comparison replay:

```sh
node qa/prepare-polish-comparison.mjs /tmp/icecube-rc1-comparison
PORT=4177 node qa/serve-comparison.mjs /tmp/icecube-rc1-comparison
```

Use `/before/` and `/after/`, select the same named fixture, match the viewport in `qa/comparison-fixtures.json`, then Load matched scene. QA profiler warms up for 2 s and measures 10 s in the foreground; it is a desktop browser test, not a physical-phone benchmark. Exact frozen core and metadata gates stop packaging on drift. The full prior Renderer Enrichment runtime is archived in `provenance/renderer-enrichment-before`.

Review `VISUAL_POLISH_RC1_QA.md`, `PERFORMANCE_DELTA_RC1.md`, `FROZEN_CORE_INTEGRITY.md` and `RENDERER_SEMANTICS.md` before any later release decision.
