# ICECUBE HYBRID V1 — VISUAL POLISH RC1

## Status entering this pass

Previous verdict:

`HYBRID V1 RENDERER ENRICHMENT — VISUAL QA CONDITIONAL PASS`

The renderer enrichment direction is accepted.

Do NOT open another broad redesign cycle.

This is a narrow polish pass before Preview deployment.

Only three P1 visual issues are in scope:

1. Cherenkov cone / light-front material quality
2. Cascade visual framing and camera choreography
3. Mobile legend / viewport density

Everything else is frozen unless a direct regression is discovered.

---

# 0. ABSOLUTE CORE FREEZE

Authoritative physics core:

`src/core.mjs`

Required SHA-256:

`b130dcf5ed8db225420bb92070206d96b5c782e9baf35fc9b300589f372882f9`

Do not modify:

- physics core
- detector geometry
- event generation
- timing
- scattering
- PE / charge
- cleaning
- energy ledger
- cascade identifiability
- LineFit
- QA calculations
- exact fixtures

Expected physics identity after this pass:

`309 / 309`

Exact bad LineFit fixtures must remain unchanged.

If core hash changes:

# STOP

Do not continue polishing.

---

# 1. DO NOT REDESIGN THE PRODUCT

Preserve the current enriched Hybrid architecture and visual direction.

Do not redesign:

- page layout
- navigation
- event controls
- diagnostics
- Story structure
- camera mode architecture
- typography system
- color system
- OG/social integration
- responsive structure

Do not revert to Claude UI.

Do not rebuild the site.

This pass should produce small renderer/UI diffs.

---

# 2. P1-A — CHERENKOV CONE MATERIAL

Current issue:

The restored cone successfully communicates Cherenkov geometry, but at some angles it still reads as a translucent geometric primitive rather than propagating light.

Keep the existing cone geometry.

Do NOT change the underlying event geometry or timing.

Improve only the rendering.

## Desired result

The viewer should read:

`light spreading through ice`

not:

`blue transparent cone mesh`

### Adjust

Reduce broad filled-surface dominance.

Prefer:

- lower interior opacity
- softer volumetric falloff
- brighter cone edge
- brighter propagation front
- restrained depth fade
- soft additive glow where appropriate
- subtle temporal breathing only if driven by event playback

The front / boundary should be more visually important than the full filled surface.

### Avoid

- opaque cyan geometry
- neon laser beam
- oversized bloom
- sci-fi weapon effect
- thick uniform cone
- particle spam

Maintain visual distinction from:

`青色虛線＋箭頭 = 候選 LineFit`

Cherenkov light and LineFit may both use cyan family colors, but they must remain unmistakably different through:

- volume vs line
- opacity
- animation
- line pattern
- spatial extent

---

# 3. CHERENKOV SEMANTICS

The cone remains:

`SCHEMATIC / geometry-informed`

Do not change it to DATA-DRIVEN merely because its orientation follows the track.

Its visual thickness, opacity and luminous intensity are not calibrated photon density.

Keep that explicit in:

`RENDERER_SEMANTICS.md`

Do not add claims such as:

- exact photon density
- detector-calibrated Cherenkov field
- realistic photon propagation

---

# 4. LIGHT FRONT

Review the existing light shells / fronts.

Their purpose should be immediately understandable:

event progresses
→ optical front expands
→ DOMs activate

Polish the light-front hierarchy so the viewer can distinguish:

1. moving charged-particle focus
2. Cherenkov emission region
3. expanding optical front
4. DOM response

Do not make all four equally bright.

Recommended priority:

DOM activation + propagation front
>
moving marker
>
persistent cone body

---

# 5. P1-B — CASCADE VISUAL IDENTITY

Current issue:

Cascade semantics are correct, but the event is still visually small relative to the detector.

Do NOT solve this by inventing a larger physical cascade.

Do NOT scale core event data.

Solve it primarily with:

# CAMERA + TEMPORAL CHOREOGRAPHY

---

# 6. CASCADE STORY CHOREOGRAPHY

For Cascade Story Mode:

### Stage before interaction

Show detector context briefly.

### Interaction

Camera should move meaningfully closer to the cascade origin.

Show a compact initial flash.

### Propagation

Show one or two restrained spherical light fronts expanding from the interaction region.

DOM activation should visibly propagate outward.

### Interpretation

Then widen slightly to restore detector-scale context.

The sequence should communicate:

localized interaction
→ approximately spherical light distribution
→ surrounding DOM response

without implying a direction.

---

# 7. CASCADE MUST NOT BECOME TRACK-LIKE

Maintain:

`NOT_IDENTIFIABLE_IN_PEDAGOGICAL_CASCADE_MODEL`

Do not add:

- directional arrow
- principal axis
- LineFit candidate
- direction cone
- reconstructed direction
- angular confidence
- angular error UI

Avoid any camera angle or elongated effect that accidentally makes the cascade look like a track.

The user should understand visually:

> There is a localized event and an expanding response, but this pedagogical model does not contain incoming-direction information.

---

# 8. CASCADE LIGHT FIELD

You may improve the local visual field with:

- compact origin bloom
- bounded spherical shell
- mild local volumetric glow
- DOM pulses
- time-dependent radial reveal

But classify these correctly.

Examples:

Origin location:
`DATA-DRIVEN`

DOM hit timing:
`DATA-DRIVEN`

DOM PE mapping:
`DERIVED VISUAL`

Spherical light shell:
`SCHEMATIC`

Do not visually imply the shell is calibrated photon transport.

---

# 9. THROUGH / STARTING REGRESSION CHECK

Cascade polish must not damage the other two event types.

Verify:

### Through

still reads unmistakably as a traversing track.

### Starting

still reads as:

localized interaction
+
outgoing track

Do not allow new cascade glow to obscure the starting-event origin or outgoing secondary.

---

# 10. P1-C — MOBILE LEGEND DENSITY

Current issue:

At approximately 390 px width, the enriched visual legend + bottom readouts consume too much vertical space and reduce the 3D viewport.

Fix mobile presentation only.

Do not degrade desktop.

Target:

- 360 px
- 390 px
- 430 px

---

# 11. MOBILE COMPACT LEGEND

Create a compact first-level legend.

When relevant, prioritize only:

`黃色實線 = 模擬真值`

`時間色帶 = 模擬到達時間`

`藍色光錐／光殼 = 示意`

`青色虛線 = 候選 LineFit`

But do not show every item simultaneously if it is not visible.

Make legend state-aware.

Examples:

If LineFit is hidden:

do not reserve space for LineFit legend.

If cascade:

do not show LineFit legend.

If Cherenkov layer is hidden:

do not show cone legend.

---

# 12. MOBILE DETAIL DISCLOSURE

Keep scientific semantics available without permanently occupying the viewport.

Use:

- compact info affordance
- bottom-sheet expansion
- collapsible `What am I seeing?`
- existing details surface

Do not hide mandatory LineFit warning when candidate LineFit is actually visible.

The LineFit warning remains a special case:

it must still be visible at first contact.

Do not collapse it behind an info button before the user has seen it.

---

# 13. MOBILE BOTTOM READOUT

Inspect the current bottom metrics.

Ensure:

- no clipped labels
- no truncated `VISIBLE NOW`
- no overlap with browser safe-area
- no collision with Story controls
- no horizontal overflow

Reduce nonessential simultaneous text before shrinking font too aggressively.

Prefer hierarchy over tiny typography.

---

# 14. 3D VIEWPORT PRIORITY

On mobile the 3D event must remain the dominant visual object.

After polish, at Story Stage 3 / 4:

the user should still have enough vertical space to clearly see:

- event origin / track
- Cherenkov front
- DOM response

Do not let overlays consume the majority of the viewport.

---

# 15. DESKTOP MUST NOT REGRESS

Re-test desktop at approximately:

- 1280 px
- 1400 px
- 1920 px if available

Check:

- cone readability
- depth context
- DOM timing
- cascade choreography
- legends
- Story panels
- LineFit disclosure
- diagnostics

Do not optimize mobile by making desktop overly sparse.

---

# 16. PERFORMANCE BUDGET

This polish pass must not introduce major performance regression.

Compare against current Renderer Enrichment candidate.

Measure at least:

- through event
- starting event
- cascade
- Cherenkov Story stage
- mobile-sized viewport

Record:

before FPS

after FPS

draw calls if available

memory if available

Do not claim real-device mobile performance from viewport emulation.

### Gate

A small renderer-cost change is acceptable.

A substantial sustained regression requires justification or rollback.

Do not add heavy post-processing just to improve cone aesthetics.

---

# 17. REDUCED MOTION

Ensure new camera choreography and light-front polish respect:

`prefers-reduced-motion`

Reduced-motion mode may:

- reduce transitions
- reduce pulse intensity
- shorten camera travel
- replace repeated animation with static state

It must NOT change:

- event data
- hit timing
- scientific outputs

---

# 18. ACCESSIBILITY

Ensure the event remains understandable without relying only on color.

Maintain:

Truth:
yellow + solid line

LineFit:
cyan + dashed line + arrow

Light front:
volumetric / animated surface

DOM response:
point / halo / temporal activation

Legend text must remain readable.

---

# 19. VISUAL COMPARISON

Create a focused RC1 comparison.

No need for another huge 15-image research set.

Produce matched:

1. Through — current enrichment vs Polish RC1
2. Cascade — current enrichment vs Polish RC1
3. Cherenkov Story — current vs RC1
4. Mobile 390 Light — current vs RC1
5. Mobile 390 Cascade — current vs RC1

Same:

- EventInput
- camera target where practical
- playback time
- viewport
- UI state

This is necessary to determine whether each P1 was actually fixed.

---

# 20. REGRESSION TESTS

Run existing:

- frozen-core integrity
- 309 event comparison
- exact fixtures
- UI semantic QA
- renderer enrichment checks
- mobile layout checks

Ensure exact bad fixtures remain:

40003618
≈ 123.197987°

7006668
≈ 98.009732°

7003149
≈ 122.233247°

Do not tune them.

---

# 21. SOCIAL / METADATA

Do not modify:

- social image
- canonical
- production origin
- metadata title
- metadata description

This pass has no SEO task.

---

# 22. NO DEPLOYMENT

Do not deploy:

- Preview
- Production
- ChatGPT Site
- Vercel

This is still local candidate review.

Deployment authorization comes only after RC1 visual review passes.

---

# 23. FILE SCOPE

Expected modifications should mainly be limited to:

- renderer
- story camera choreography
- mobile UI/CSS
- renderer semantics documentation
- QA screenshots / reports

If adapter or unrelated architecture files change:

explain why.

`src/core.mjs` must not change.

---

# 24. DELIVERABLES

Return:

1. `IceCube_Hybrid_V1_Visual_Polish_RC1_Candidate.zip`
2. `VISUAL_POLISH_RC1_CHANGELOG.md`
3. `VISUAL_POLISH_RC1_QA.md`
4. `PERFORMANCE_DELTA_RC1.md`
5. `FROZEN_CORE_INTEGRITY.md`
6. focused comparison HTML
7. five matched comparison images
8. updated release screenshots if materially changed
9. SHA256 manifest

---

# 25. FINAL VERDICT

If all three P1 issues are resolved:

`HYBRID V1 VISUAL POLISH RC1 — READY FOR PREVIEW RELEASE QA`

If one remains:

`HYBRID V1 VISUAL POLISH RC1 — CONDITIONAL / FIX LIST REQUIRED`

Do not declare Production readiness.

---

# 26. SUCCESS CRITERIA

This pass succeeds when:

### Cherenkov

looks like propagating light rather than a transparent mesh primitive.

### Cascade

feels unmistakably different from a track without inventing direction information.

### Mobile

keeps the event visually dominant while retaining required scientific disclosure.

And throughout:

**the frozen physics core remains completely unchanged.**