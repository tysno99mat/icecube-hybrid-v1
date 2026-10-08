# ICECUBE HYBRID V1 — RENDERER ENRICHMENT PASS

## Mission

The current Hybrid V1 successfully productized the frozen RC0.7.1 simulation, but it lost some of the strongest visual-science storytelling that existed in the Claude RC0.7.1 renderer.

This task is NOT a redesign.

This task is NOT a physics change.

This task is a focused **Renderer Enrichment Pass**:

> Restore the strongest scientific visual behaviors from the Claude RC0.7.1 presentation while preserving the stronger Hybrid V1 product architecture, UI, Story Mode, diagnostics, responsiveness and release semantics.

The desired result is:

**Claude visual-science richness**
+
**GPT Hybrid product quality**

---

# 0. ABSOLUTE RULE — PHYSICS CORE FROZEN

The authoritative core remains:

`src/core.mjs`

Expected SHA-256:

`b130dcf5ed8db225420bb92070206d96b5c782e9baf35fc9b300589f372882f9`

Do not edit it.

Do not reimplement it.

Do not copy formulas out of it and make a second physics engine.

Do not modify:

- detector geometry
- event generation
- RNG
- photon timing
- scattering
- jitter
- PE / charge sampling
- cleaning
- ice transport
- stochastic losses
- energy ledger
- LineFit
- cascade identifiability
- QA angular calculations

At the end of this task:

the core SHA must remain exactly unchanged.

If core hash changes:

**STOP — FAIL THE BUILD.**

---

# 1. FIRST TASK — VISUAL GAP AUDIT

Before changing code, compare:

## A. Claude RC0.7.1 visual implementation

Use the original candidate preserved in provenance:

`Claude_IceCube_RC0.7.1_Candidate_1.zip`

Inspect:

- renderer code
- animation logic
- DOM visualization
- Cherenkov visualization
- depth layers
- surface context
- cascade visualization
- screenshots

## B. Current Hybrid V1

Inspect:

- `src/renderer/`
- `src/story/`
- `src/ui/`
- current desktop/mobile screenshots

Produce:

`VISUAL_GAP_AUDIT.md`

Use a table:

| Feature | Claude RC0.7.1 | Hybrid V1 | Lost / Retained | Restore? |
|---|---|---|---|---|

At minimum compare:

- Cherenkov cone
- propagating light shells
- muon head / moving event focus
- neutrino ghost track
- DOM arrival-time animation
- DOM PE/intensity encoding
- dust layer
- bedrock
- depth markers
- DeepCore context
- surface / IceTop context
- scale reference
- cascade light topology
- detector depth readability

Do not assume Claude is automatically better.

Restore only features that materially improve:

- scientific comprehension
- event readability
- spatial scale
- visual storytelling

---

# 2. DO NOT THROW AWAY HYBRID V1

Keep all strong Hybrid product work.

Preserve:

- current site structure
- current controls
- current camera system
- current Story Mode structure
- current diagnostics
- current DOM inspector
- current responsive layout
- current mobile bottom sheet
- current WebGL fallback
- context-loss handling
- exact LineFit semantics
- truth / candidate differentiation
- social metadata
- accessibility improvements

This is an enrichment pass, not a rollback to Claude UI.

---

# 3. RESTORE CHERENKOV VISUALIZATION

The current Hybrid track event is visually too abstract.

Restore a visually meaningful Cherenkov-light layer.

Required behavior:

charged secondary track
→ light cone / expanding optical visualization
→ DOM activation

The visualization must help the user immediately understand:

> IceCube does not see the neutrino directly.
> It detects light produced after a neutrino interaction creates charged secondary particles.

Do NOT visually depict:

neutrino directly emitting Cherenkov light.

---

# 4. CHERENKOV CONE

For track-like events:

add a clear but restrained Cherenkov cone.

It should:

- originate from the charged track
- follow track orientation
- visually communicate the cone geometry
- use translucent cyan / electric blue
- remain subordinate to detector geometry

Avoid giant opaque cones.

Avoid science-fiction laser aesthetics.

Add a subtle label when educational context requires it:

`切倫科夫光示意`

or equivalent.

The cone is a **schematic visualization**.

Do not claim that its rendered opacity / thickness / extent represents quantitatively calibrated photon density.

---

# 5. PROPAGATING LIGHT FRONT

Restore the sense that light moves through the detector.

Create one or more animated light-front representations.

Possible implementation:

- expanding shells
- translucent wavefronts
- moving rings / surfaces
- GPU particles
- depth-aware light pulses

But the timing must be driven from authoritative event timing wherever possible.

Do not invent an unrelated animation clock.

The purpose is to show:

event time
→ light propagation
→ DOM arrival

Avoid particle spam.

---

# 6. DOM TIME-OF-ARRIVAL VISUALIZATION

This is a major priority.

DOMs should not simply appear as generic hit points.

Use existing authoritative modeled hit timing to visually encode activation order.

Desired effect:

early DOMs
→ activate first

later DOMs
→ activate later

The user should be able to pause the timeline and understand the spatial timing pattern.

Possible visual variables:

- activation
- glow
- pulse
- temporary halo
- color progression

Do not create scientific meaning from arbitrary color bins.

Provide legend text describing what the visual encoding means.

For example:

`顏色表示模擬到達時間`

Do not say:

`實際 IceCube 光子到達時間`

unless explicitly qualified as model output.

---

# 7. MODEL PE / CHARGE ENCODING

Restore some of Claude's intuitive hit-strength visualization.

Where authoritative modeled PE / charge exists:

allow DOM visual intensity or halo size to respond to it.

But cap display scaling.

Do not let one large modeled value destroy the scene.

Use a clearly view-only transform:

`visualSize = f(modelPE)`

Document the transform.

Do NOT change underlying model PE.

UI wording should say:

`模擬光量`

or:

`modeled PE`

not detector-calibrated energy.

---

# 8. MOVING EVENT FOCUS

For track events:

restore a moving event focal point / charged-particle head if it improves comprehension.

It should travel along the authoritative track geometry.

The visual head is not a new physical object.

It is an animation marker.

If shown, label/document it as a visualization aid.

Do not confuse it with the neutrino itself.

---

# 9. NEUTRINO GHOST TRACK

A subtle pre-interaction neutrino path can be useful.

Use:

- thin
- subdued
- dashed
- low opacity

It should visually terminate / transition around the interaction region.

The user must understand:

neutrino path ≠ charged secondary track.

Do not make it visually brighter than the Cherenkov-producing secondary.

---

# 10. ICE DEPTH CONTEXT

Restore the sense of kilometer-scale depth.

Add restrained depth context:

- 1450 m
- 2000 m
- 2100 m
- 2450 m

or the exact frozen geometry-relevant depth labels already represented in the accepted product.

Show:

- top detector region
- DeepCore region
- dust-layer context
- bottom detector extent
- bedrock context where appropriate

These are context layers.

They should be switchable or visually subdued.

Do not visually compress physics coordinates in a way that users could mistake for true spacing.

If visual compression is ever used:

label it.

---

# 11. DUST LAYER

Claude's original visual context included the dustier ice region.

Restore this carefully.

This should be:

- subtle
- translucent
- visually distinguishable
- optional in detector / diagnostics view

Do not imply that its displayed opacity is quantitatively calibrated unless directly supported.

Use wording such as:

`Dust layer / optical-property context`

rather than:

`exact scattering density`

unless exact data supports it.

---

# 12. BEDROCK / BOTTOM CONTEXT

Restore a subtle detector-bottom reference.

Purpose:

help users understand that the array occupies a finite deep-ice volume.

Do not make bedrock visually dominate the detector.

---

# 13. SURFACE CONTEXT

Preserve or enrich:

- Antarctic surface
- minimal IceCube surface station context
- detector entering deep ice

Avoid building an inaccurate architectural replica if no exact geometry exists.

Surface context is primarily for:

scale
+
orientation.

---

# 14. SCALE REFERENCE

Claude's original visual system had a useful scale-comparison concept.

Hybrid may restore a restrained scale cue.

Possible:

`~1 km instrumented ice`

or a vertical scale bar.

Do not necessarily restore Taipei 101 unless it fits the visual language.

Prefer a clean scientific scale marker over novelty.

If a familiar-object comparison is retained:

make it secondary.

---

# 15. THROUGH EVENT VISUAL LANGUAGE

A through event should immediately read as:

**track-like**

Desired sequence:

1. faint incoming neutrino path
2. charged secondary enters detector
3. Cherenkov cone / light front
4. DOMs activate in time sequence
5. truth trajectory visible if enabled
6. candidate LineFit appears later if enabled

Do not show candidate LineFit at the start.

It is an interpretation layer, not part of the physical event.

---

# 16. STARTING EVENT VISUAL LANGUAGE

A starting event must visually communicate:

interaction begins inside detector
+
cascade component
+
outgoing charged track

Desired sequence:

1. neutrino enters
2. localized interaction
3. compact cascade flash
4. outgoing charged track
5. Cherenkov propagation
6. DOM activation
7. illustrative LineFit only afterward

Do not let the outgoing track erase the cascade origin.

---

# 17. CASCADE EVENT VISUAL LANGUAGE

This is especially important.

The current Hybrid cascade is scientifically safer but visually too weak.

Improve its visual identity.

A cascade should immediately look different from a track.

Desired characteristics:

- localized luminous origin
- approximately expanding / volumetric light distribution
- DOM activation spreading outward
- no dominant directional arrow
- no track-like truth line implying reconstructed direction
- charge-centroid visualization only where already allowed

Maintain:

`NOT_IDENTIFIABLE_IN_PEDAGOGICAL_CASCADE_MODEL`

Do NOT invent:

- direction reconstruction
- axis
- directional confidence
- angular error UI

The visual should make the absence of directional information intuitive.

---

# 18. STORY MODE SHOULD SHOW, NOT JUST TELL

Strengthen Story Mode visually.

## Stage 1
The Ghost Particle

Show the detector and subtle incoming neutrino path.

## Stage 2
A Rare Interaction

Move camera toward interaction region.

Clearly show the transition:

neutrino
→ interaction
→ secondary particles.

## Stage 3
Cherenkov Light

This must become one of the strongest scenes.

Show:

- charged secondary
- Cherenkov cone
- moving light front

The user should understand Cherenkov radiation without needing to read the paragraph first.

## Stage 4
5,160 Optical Sensors

Shift attention to DOM response.

Show time-sequenced sensor activation.

Allow timeline scrubbing.

## Stage 5
Event Interpretation

Only here introduce:

truth
vs
candidate LineFit

For cascade:

use vertex / light-distribution interpretation instead.

---

# 19. CAMERA CHOREOGRAPHY

Use existing Hybrid camera architecture.

Do not replace it.

Improve Story Mode camera choreography.

Priorities:

- kilometer-scale establishing shot
- interaction-region close-up
- light-propagation view
- DOM-response view
- interpretation view

Avoid excessive cinematic motion.

Reduced-motion mode must remain supported.

Manual user camera input must still interrupt automated movement.

---

# 20. VISUAL HIERARCHY

At any moment the viewer should understand what is most important.

Recommended hierarchy:

1. event
2. detector response
3. detector geometry
4. environmental context
5. UI chrome

Do not allow glass cards and panels to compete with the event.

The website should feel less like:

`dashboard observing a simulation`

and more like:

`being inside the detector while retaining scientific controls`.

---

# 21. COLOR SYSTEM

Maintain existing truth / LineFit semantics.

Mandatory:

yellow solid
=
simulation truth

cyan dashed + arrow
=
candidate LineFit

Do not reuse these exact encodings for unrelated data.

Cherenkov light may use cyan / blue,
but it must remain visually distinguishable from the candidate LineFit.

Achieve separation using:

- transparency
- spatial volume
- glow
- line style
- animation

not just color.

---

# 22. PERFORMANCE

Do not achieve visual richness by destroying performance.

Use:

- InstancedMesh
- shared materials
- capped particle counts
- shader-based effects where useful
- bounded light-shell count
- capped DPR
- adaptive effects

Avoid:

- one mesh per photon
- one DOM React component per DOM
- thousands of dynamic lights
- huge transparent overdraw

Profile desktop and mobile-sized viewport.

---

# 23. NO FAKE PHYSICS

Every new visual element must be classified.

For each renderer feature, document:

### DATA-DRIVEN
Uses authoritative core output.

### DERIVED VISUAL
Deterministically derived from authoritative output but not a core scientific output.

### SCHEMATIC
Educational visual aid only.

Create:

`RENDERER_SEMANTICS.md`

Example:

| Visual | Classification |
|---|---|
| DOM hit activation time | DATA-DRIVEN |
| DOM halo size from PE transform | DERIVED VISUAL |
| translucent Cherenkov cone surface | SCHEMATIC / geometry-informed |
| dust-layer opacity | SCHEMATIC CONTEXT |
| candidate LineFit | DATA-DRIVEN output, illustrative semantics |

This distinction is important.

---

# 24. DO NOT CHANGE LINEFIT SEMANTICS

Keep all current warnings.

Track:

`⑤ 方向重建示意`

checkbox:

`顯示 LineFit 示意（可能失敗／反向）`

Truth:

`模擬真值來向`

`模擬真值路徑`

Legend:

yellow solid
=
simulation truth

cyan dashed
=
candidate LineFit

Permanent warning:

`LineFit 是簡化的初步重建，只作示意；可能失敗，甚至反向。內部數值／幾何檢查不證明方向正確。擬合斜率是回歸參數，不是粒子或光子的速度。`

Do not weaken it.

---

# 25. EXACT BAD FIXTURES

After renderer work, verify:

40003618
≈ 123.197987°

7006668
≈ 98.009732°

7003149
≈ 122.233247°

remain numerically unchanged.

Do not tune the renderer to visually hide their wrong-direction LineFit.

They are useful pedagogical failure examples.

---

# 26. BEFORE / AFTER VISUAL QA

Create matched screenshots.

Same EventInput.

Same camera.

Same timeline position.

Compare:

### Claude RC0.7.1
### Current Hybrid V1
### Enriched Hybrid V1

At minimum:

1. through event
2. starting event
3. cascade
4. Cherenkov Story stage
5. DOM activation stage

The review must make it possible to answer:

> Did we restore the useful visual-science richness without losing Hybrid product quality?

---

# 27. MOBILE CHECK

After enrichment, specifically verify:

- 360 px
- 390 px
- 430 px

Ensure richer renderer does not make mobile unreadable.

Check:

- Story Mode
- scrubber
- warning
- legend
- bottom sheet
- GPU load
- event visibility
- touch target sizes

Do not claim real-device PASS unless actually tested.

---

# 28. CORE INTEGRITY GATE

Before build:

record frozen core SHA.

After build:

record frozen core SHA again.

Must equal:

`b130dcf5ed8db225420bb92070206d96b5c782e9baf35fc9b300589f372882f9`

Run existing event comparison suite.

Expected:

309 complete event comparisons still identical.

If not:

FAIL.

---

# 29. DO NOT DEPLOY

This task ends with a new local candidate.

Do NOT:

- deploy Preview
- deploy Production
- assign canonical domain
- change production metadata origin

Deployment happens only after visual review accepts this pass.

---

# 30. DELIVERABLES

Produce:

1. enriched Hybrid V1 source
2. `VISUAL_GAP_AUDIT.md`
3. `RENDERER_SEMANTICS.md`
4. `RENDERER_ENRICHMENT_CHANGELOG.md`
5. `FROZEN_CORE_INTEGRITY.md`
6. `PERFORMANCE_DELTA.md`
7. matched before / after screenshots
8. updated five release screenshots
9. complete candidate ZIP
10. SHA256 manifest

Also include a concise table:

| Claude feature | Restored? | Hybrid implementation | Semantics |
|---|---|---|---|

---

# 31. FINAL VERDICT

If renderer enrichment succeeds and core remains frozen:

`HYBRID V1 RENDERER ENRICHMENT — READY FOR VISUAL QA`

Do NOT write:

`READY FOR PRODUCTION`

Do NOT deploy.

---

# 32. PRODUCT GOAL

The final site should combine two strengths.

Claude contributed:

- physical-process visibility
- detector-scale context
- event animation
- intuitive scientific storytelling

Hybrid V1 contributed:

- cleaner product architecture
- stronger controls
- responsive UX
- diagnostics
- accessibility
- release discipline

The target is not to choose one.

The target is:

# Claude scientific visualization
# +
# Hybrid product design

A visitor should feel:

> I can finally see how IceCube observes something that is fundamentally invisible.

while still understanding:

> this is a physics-informed educational simulation, not a quantitatively calibrated IceCube detector simulation.