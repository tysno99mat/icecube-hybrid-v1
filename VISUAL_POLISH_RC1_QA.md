# Visual Polish RC1 QA

**HYBRID V1 VISUAL POLISH RC1 — READY FOR PREVIEW RELEASE QA**

Local reviewer judgment: the three requested P1s are resolved in this candidate. This is readiness for the next Preview release QA decision, not deployment authorization or Production readiness. No site was deployed.

RC1 build: `52e17f35b1b83c6f61cdf16ea72982d0f0e12500cb9d3de24056c4ab1967694d`. Baseline Enrichment build: `7370390a3f0f0ee3f44713b6682f74bbe8542c8e976f80072d8fa77513ff203c`.

| Gate | Result | Evidence |
|---|---|---|
| Frozen core | PASS | Expected SHA in source, dist and archived Enrichment; integrity guard |
| Complete event identity | PASS — 309 / 309 | 306 controlled events plus all three exact fixtures; existing 10-gate suite |
| Existing renderer checks | PASS — 4 / 4 | Same visual mappings, arrival timing, PE bounds and source selection |
| P1-A cone / front | PASS — local visual review | Through and Cherenkov pairs: softer interior, luminous boundary/front; DOM halos remain distinct from the smaller head |
| P1-B cascade | PASS — local visual review | Vertex-centered approach, one spherical shell without axis/rings, 120/400/1100 ns progression, then wider context; no geometry enlargement |
| P1-C mobile density | PASS — local viewport QA | 360/390/430 px Through and Cascade Stage 3/4; state-aware keys, 11 px complete metrics, full warning retained |
| Desktop | PASS | 1280/1400/1920 px light and first-contact LineFit; full legend and four readouts retained |
| Performance | PASS — local sampled cost gate | Six before/after 10-second samples; no substantial sustained regression, one fewer draw call per RC1 sample |
| Exact browser failures | PASS | 123.19798699753869°, 98.00973157529418°, 122.23324681446098°; all flips |
| Context recovery | PASS | LOST → RESTORED; simulation-call count unchanged |
| DOM inspector / diagnostics | PASS | Visible returned depth/hit/PE/charge/time/clean fields; exact fixtures loaded through diagnostics |
| Reduced motion / manual interruption | PASS for UI + source wiring | Existing immediate-camera path exercised; Reduce motion pressed, body class set; keyboard orbit returns Free and stops Story |
| Metadata / assets | PASS | Served head, social image, config and public assets preserved |
| Physical phone / notch safe-area / OS preference switching | UNKNOWN — not tested | Desktop viewport QA and existing media-query source wiring only |
| Deployment / Production | NOT PERFORMED / NOT CLAIMED | Local candidate only |

The three fixes were reviewed separately from the frozen scientific outputs. Cones remain **SCHEMATIC / geometry-informed**; luminous intensity, thickness and alpha are not calibrated photon density. Spherical fronts are schematic; positions/times and DOM activations use the returned event. Cascade retains `NOT_IDENTIFIABLE_IN_PEDAGOGICAL_CASCADE_MODEL`, null fitDirection/fitSpeed/angularError, zero head/cone/ghost and only an optional charge-centroid diamond. Through still traverses the array; Starting retains the compact truth vertex/flash plus outgoing track (see updated Starting interaction screenshot).

Mobile first contact: selecting LineFit early displays the unchanged warning immediately, while the compact candidate key stays absent until the candidate is actually rendered. Hidden light/truth layers remove their keys; cascade never uses a LineFit key; invalid input clears all new keys. The full detail disclosure is within the existing sheet and has a 44 px summary. Conservative rectangular overlay estimates at Stage 4 are 42.7–48.9% of canvas area, including heading, camera bar, legend, full warning and readouts; there is no warning/legend overlap (minimum gap 16.6 px), Story collision or document horizontal overflow. Physical safe-area padding is present in CSS but remains unverified on a phone.

Five matched pairs use identical EventInput, model time, viewport, candidate-off state, FOV and canvas dimensions. Camera targets are equal. Through/Story/mobile Light camera positions are equal; cascade positions deliberately change from target+[650,300,720] to target+[340,155,395] m. Exact arrays and result digests are recorded in `qa/comparison-fixtures.json` and `qa/results/matched-browser-records.json`. Complete result digests match across every pair. All 10 raw captures and five paired images are bundled; the final captures keep the entire canvas visible and explicitly disable full-page capture to avoid a browser crop offset.

39 browser records include 34 successfully read event snapshots. After a reload, the in-app WebMCP registry returned stale tool registrations; final invalid-input/interrupt/reduced-motion checks used the visible DOM. The read-only tool implementation was preserved. This tooling limitation is recorded rather than treating an unavailable read call as a pass. The final core/build/renderer guards and affected DOM checks passed after the legend fix.

Review artifacts: [five-pair gallery](VISUAL_COMPARISON.html), [release screenshots](SCREENSHOTS.html), [changelog](VISUAL_POLISH_RC1_CHANGELOG.md), [performance](PERFORMANCE_DELTA_RC1.md), [frozen core](FROZEN_CORE_INTEGRITY.md), [semantics](RENDERER_SEMANTICS.md). Executed validation is under `qa/results`; the small runtime patch is `qa/runtime-diff.patch`. ZIP integrity and SHA manifests are checked before handoff. Quantitative IceCube physics baseline remains **NO**.
