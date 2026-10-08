# Renderer semantics

No new scientific engine exists. `src/adapter/index.mjs` remains the sole importer of the frozen core. Its existing read-only `visualContext` exposes C, BEDROCK and the accepted index constants for display geometry; it exposes no timing, scattering or reconstruction solver and accepts no overrides. Every event is generated once by the unchanged public API.

| Visual | Classification | Source / display rule | Limit |
|---|---|---|---|
| Detector positions and sensor identity | DATA-DRIVEN | Frozen core DOM/string coordinates | Displayed sensor radius is enlarged; coordinates are not compressed |
| DOM activation | DATA-DRIVEN | A returned hit becomes visible at its returned h.t | GPU attributes use Float32; inspector/export retain full result precision |
| Arrival color | DERIVED VISUAL | Continuous blue → violet → pink, normalized from first to last non-noise h.t; noise is gray | Relative modeled arrival time; no scientific color bins or calibrated measurement |
| Arrival halo | DERIVED VISUAL | 180 ns display pulse after h.t, peaking at arrival | A visual emphasis window, not detector electronics or a new timing distribution |
| PE diameter | DERIVED VISUAL | `10 + min(24, 6*log1p(max(0,n)))` using returned h.n | 10–34 view units; projected diameter capped at 48 CSS px before DPR; no PE/charge mutation |
| Charged-secondary head | DERIVED VISUAL / animation aid | Clamp s0 + max(0,eventTime)*frozen C to returned [s0,s1], along returned p0/dir | 44 view-unit sprite at .65 display opacity; a position marker, not a new simulated particle; it never uses fitSpeed |
| Recent secondary segment | DERIVED VISUAL | Up to 180 m behind the displayed marker | Pale local emphasis, distinct from the yellow full truth path |
| Cherenkov cone | SCHEMATIC, geometry-informed | Backward open cone at the charged head; angle from frozen COS_TC; length ≤260 m | Unchanged open-cone geometry with a soft base/front band, Fresnel edge, low-opacity interior and restrained view-depth fade; opacity/thickness/luminous intensity/extent are not calibrated photon density; never attached to neutrino ghost |
| Deposit origin | DATA-DRIVEN position/time; SCHEMATIC flash | Returned event.points pos/t/E; primary origin first, then strongest returned deposits | Flash diameter 32–108 view units; 500 ns emphasis decay; faint retained origin cue is not sustained physical emission |
| Expanding sphere/rings | SCHEMATIC, time-informed | Radius=max(0,eventTime−source.t)*frozen V_LIGHT, centered on returned source | Edge-prioritized sphere; cascade has no great-circle rings or axis; idealized light-front aid, not photon transport, scattering prediction or explanation of individual hit delays; disappears at 900 m |
| Incoming neutrino ghost | SCHEMATIC truth context | Thin violet dashed 1100 m segment ending at returned nuEnd; follows returned truth direction | Low opacity .24; no glow/cone/light emission. Hidden for cascade, including Story stage 1 |
| Truth path / vertex | DATA-DRIVEN | Returned tracks / vertex, yellow solid + arrow for tracks; yellow vertex diamond for cascade | Simulation truth, not detector knowledge |
| Candidate LineFit | DATA-DRIVEN output, illustrative semantics | Returned fitPosition/fitDirection only when frozen FIT_RENDERABLE permits it; cyan dashed + arrow | Selected candidate waits until last returned non-noise signal. Warning appears immediately on selection; no reliability gate |
| Cascade interpretation | DATA-DRIVEN output, illustrative semantics | Returned charge-centroid diamond only | No direction, axis, arrow, fitSpeed or angular QA; incoming ghost is also absent |
| Dust context | SCHEMATIC CONTEXT | 2000–2100 m slab, .038 opacity, subdued boundary | Display opacity is not scattering density; layer is optional |
| Depth / scale | DERIVED VISUAL context | World-space ticks at 1450,2000,2100,2450 m; 1 km bracket; projected labels | Coordinates stay in meters. Label overlap/offscreen suppression can hide a label in a particular camera |
| Bedrock | SCHEMATIC CONTEXT | Subdued plane at frozen BEDROCK=2820 m | Finite-volume orientation aid, not terrain survey |
| DeepCore | DATA-DRIVEN sensor highlighting; SCHEMATIC envelope/label | Existing Hybrid sensor colors and box retained | Envelope is context, not new fiducial/physics geometry |
| Surface station / tanks | SCHEMATIC CONTEXT | Existing station retained; 52 enlarged tank glyphs at 26 sampled non-DeepCore string sites | Not the surveyed IceTop layout or an architectural replica |
| Story camera | DERIVED VISUAL | Existing camera transition architecture; track interaction focus at vertex/nuEnd and Light focus near returned-track head; cascade stays centered on the returned vertex and widens by stage | No coordinate modification; manual camera/timeline actions interrupt auto Story; reduced motion removes interpolation |

## One clock, unchanged event

Timeline time is the unchanged adapter envelope tMin + progress*(tMax−tMin), including returned jitter/noise. Negative timestamps are preserved. Head, cone, source flashes, shells, pulse and activation all read that same time. Story stages 2–4 advance the existing playback progress during the existing nine-second stage period. There is no independent effect clock, RNG, photon population or physics call per frame. Scrubbing backward is deterministic.

Through events show a charged track produced outside the array. Starting events retain both the local origin and the outgoing track; the origin cue persists after the brief flash. Cascade renders a local origin and spherical light distribution. Its direction status remains `NOT_IDENTIFIABLE_IN_PEDAGOGICAL_CASCADE_MODEL`, and fitDirection, fitSpeed and angularError_deg remain null.

Light blue volume and pale moving marker do not reuse the candidate's cyan dashed-line-plus-arrow encoding. Arrival colors avoid truth yellow. Yellow remains simulation truth; cyan dashed plus arrow remains candidate LineFit. Optical/color/size aids never certify direction, estimate real energy or calibrate light yield.

## Bounded rendering

One InstancedMesh for 5,160 sensors; one point buffer for all returned hits; no mesh per photon, dynamic point lights, shadows, bloom or post-processing. At most six selected shell sources, three in mobile-width views, two at the adaptive effects tier. Cone/sphere/ring geometry is shared within an event; one 64×64 glow texture per event is disposed on replacement. View toggles and GPU quality changes do not alter the result, cleaning or reconstruction. DPR is capped at 1.75 desktop / 1.25 mobile; the existing low-FPS adaptation reduces DPR and now reduces shell count too.

The complete LineFit warning remains unchanged:

> LineFit 是簡化的初步重建，只作示意；可能失敗，甚至反向。內部數值／幾何檢查不證明方向正確。擬合斜率是回歸參數，不是粒子或光子的速度。

QUANTITATIVE ICECUBE PHYSICS BASELINE = NO.

## Visual Polish RC1 boundaries

The cone stays **SCHEMATIC / geometry-informed**. Only its material and the charged-head sprite's display scale/opacity changed. The open ConeGeometry, COS_TC angle, track orientation, 260 m extent and moving-head time mapping are byte-preserved. Shell radius, source selection, source position/time/E, 500 ns flash decay, 900 m cutoff, hit shader, PE mapping and activation timing are unchanged. Display alpha now emphasizes shell edges; it does not estimate photon density. No bloom, post-processing, extra emitter or photon population was added.

Cascade Story interaction/light/sensors are placed at **120 / 400 / 1100 ns** on the existing adapter envelope; final interpretation still uses its existing end time. This accounts for negative noise pre-roll without altering it. Stage 0 retains detector context. Stage 1 approaches a compact flash, stage 2 shows an outward spherical front, and stages 3/4 widen. Camera target is the returned vertex and offsets are fixed view choices, never derived from cascade input direction. Cascade has zero cone, head, incoming ghost or direction arrow. Desktop offsets (m) are [235,105,275], [340,155,395], [700,330,820], [1400,660,1650]; mobile stage 4 uses 1.35× the last view offset so the spherical context fits. These change framing only, not world geometry. Reduced-motion uses the existing immediate-camera path; event time/data do not change.

On mobile, the first-level legend follows **actually rendered** truth, arrived signal, light aids and interpretation geometry. An early selected LineFit can already show the mandatory warning while its legend remains absent until the candidate line is rendered. Cascade labels only the charge centroid, never LineFit. Solid line/diamond, arrival band, circular front and dashed-arrow/centroid glyphs accompany words. Full PE/noise/head/ghost/light semantics are in `What am I seeing?` within the existing Event controls sheet. The full LineFit warning remains byte-identical and immediately visible outside that disclosure. Energy remains editable in controls; mobile bottom readouts show MODELED HITS, CLEAN HITS and VISIBLE NOW at 11 px with safe-area padding. Desktop full legend/readouts remain unchanged.
