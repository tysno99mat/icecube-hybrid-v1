# Performance delta — Visual Polish RC1

**PASS for the local browser cost gate.** No substantial sustained regression was observed in these six controlled samples. No post-processing was added; each RC1 sample used one fewer draw call. Worst FPS change was Cascade desktop −5.16%; all RC1 samples were 59.01–62.39 FPS. Frame pacing and JS heap remain environment-sensitive.

| Scene | Enrichment FPS | RC1 FPS | Delta | Draw calls | GPU geometry objects | Used JS heap MiB |
|---|---:|---:|---:|---|---|---|
| Through | 63.01 | 60.38 | -4.18% | 28 → 27 | 52 → 52 | 17.18 → 23.43 |
| Starting | 60.78 | 62.39 | +2.65% | 26 → 25 | 52 → 52 | 17.14 → 19.04 |
| Cascade | 62.22 | 59.01 | -5.16% | 17 → 16 | 48 → 47 | 16.26 → 17.34 |
| Cherenkov Story | 61.08 | 61.19 | +0.18% | 21 → 20 | 50 → 50 | 27.11 → 27.47 |
| Mobile 390 Light | 60.80 | 60.61 | -0.31% | 19 → 18 | 50 → 50 | 16.92 → 16.52 |
| Mobile 390 Cascade | 59.42 | 61.41 | +3.35% | 17 → 16 | 48 → 47 | 21.58 → 21.81 |

Method: one foreground desktop Codex in-app browser tab, same returned EventInput/model time/UI state and declared viewport per fixture. DPR 1, full effects tier, 2-second warm-up followed by at least 10 seconds of foreground requestAnimationFrame cadence. FPS = counted frames / elapsed seconds, not the renderer's startup rolling estimate. Desktop 1400×1000; mobile-sized 390×980. Cascade uses the declared nearer RC1 camera while preserving the same vertex target and world geometry. Each scene was reloaded before measurement. Every interval retained unchanged simulation-call count, WebGL available, one texture, effectTier=1 and postProcessing=0. Raw frame medians/p95, triangles, heap and durations are in `qa/results/performance-delta-rc1.json`.

The same cone/shell/head material code was sampled before the final compact-legend synchronization fix. That fix executes only on camera/input actions, outside the measured interval; it adds no animation/render loop work. The final material, core, visual mapping and geometry are unchanged from these samples.

The few-percent FPS differences are not controlled GPU microbenchmarks or a speedup claim. JS heap values include startup, snapshot serialization and GC; no forced-GC or GPU-byte measurement was available. Three.js geometry/texture object counts are included rather than invented VRAM totals. No per-photon mesh, dynamic-light field, bloom, shadow pass or additional render target exists.

**Physical-phone FPS / thermal / GPU memory: UNKNOWN — not tested.** Mobile numbers are desktop viewport measurements. A physical safe-area and on-device battery/thermal check remains part of later Preview release QA, not a completed gate here. No deployment performed.
