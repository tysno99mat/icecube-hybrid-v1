# IceCube Hybrid V1 — Visual Polish RC1 changelog

Local candidate. No deployment performed. This is the narrow follow-up to the accepted Renderer Enrichment direction.

1. **Cherenkov material / light hierarchy.** The existing open cone geometry, angle, orientation, extent and event-clock mapping remain unchanged. A low-opacity interior, soft propagation-front band, Fresnel boundary and restrained depth fade replace the uniformly filled material. The head sprite is smaller/dimmer (44 display units, .65 opacity). Sphere interiors are quieter and their edges are clearer. Cascade great-circle rings are suppressed to avoid an axis-like cue. No new mesh pass, photon population, light, bloom or post-processing.
2. **Cascade framing and time.** Story views use the actual unchanged envelope to locate 120 ns interaction, 400 ns light and 1100 ns sensor snapshots despite negative noise pre-roll. Camera approaches the returned vertex, then widens for sensor/interpretation context. It never reads cascade truth direction. Event positions, shell radius, flashes' time/extent and DOM activation are unchanged.
3. **Mobile density.** The 360/390/430 px first-level legend follows actual rendered layers, with solid/diamond, band, circular-front and dashed-arrow/centroid glyphs. Full meanings are accessible in the existing Event controls sheet. The complete first-contact warning is unchanged and stays visible. Mobile bottom readouts retain three useful metrics at 11 px; energy remains editable in controls. Desktop retains its full legend and four readouts. Invalid-input clearing and manual camera interruptions also resynchronize the new compact legend.

Runtime diffs: `src/renderer/light-layers.mjs`, `src/renderer/scene.mjs`, `src/story/index.mjs`, `src/ui/app.mjs`, `src/ui/styles.css`, and mobile markup in `index.html`. `package.json` and `build/build.mjs` change only the candidate version stamp to `1.0.0-visual-polish-rc.1`. QA scripts, evidence and documentation are added/updated. The adapter and diagnostics are byte-identical; no unrelated architecture change was needed.

Core SHA-256: `b130dcf5ed8db225420bb92070206d96b5c782e9baf35fc9b300589f372882f9`.

Metadata head, production-origin configuration, canonical behavior, title/description, social image and all public assets are preserved. Renderer aids remain schematic; quantitative IceCube physics baseline remains NO.
