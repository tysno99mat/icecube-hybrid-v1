# Frozen core integrity — Visual Polish RC1

**PASS.** Authoritative source, RC1 dist and archived Enrichment dist share SHA-256:

`b130dcf5ed8db225420bb92070206d96b5c782e9baf35fc9b300589f372882f9`

The existing regression suite passed all 10 gates: **306 controlled complete-event comparisons + 3 exact bad fixtures = 309 / 309**. It compares the entire returned result, not just rendered summaries. Geometry/contracts, immutable adapter copies, invalid-input rejection, inspector fields, sole core importer and metadata gates passed. Four existing renderer mapping checks also passed.

| Protected item | RC1 result |
|---|---|
| Core simulation/geometry/RNG/timing/scattering/PE/cleaning/energy/LineFit/QA | Byte-identical frozen core |
| Adapter index + types; diagnostics | Byte-identical |
| Renderer visual-mapping functions | Byte-identical |
| Full DOM hit GPU shader | Byte-identical |
| ConeGeometry + orientation/extent/time mapping | Unchanged |
| DepthContext implementation | Byte-identical |
| Exact fixtures asset | Byte-identical |
| Full LineFit / cascade warning text | Byte-identical |
| Served HTML metadata head | Byte-identical to Enrichment |
| Social image / metadata config / public assets | Byte-identical |

| Exact bad fixture | Node angular error (degrees) |
|---|---:|
| 40003618 | 123.19798699753869 |
| 7006668 | 98.00973157529418 |
| 7003149 | 122.23324681446097 |

All remain hemisphere flips. No tuning or replacement seed/direction/energy occurred. Browser results are recorded separately in `qa/results/rc1-browser-qa.json`; the last decimal of 7003149 can differ across JS environments without a fixture change.

Runtime changes are limited to five view/story source files plus mobile markup. Adapter files were not modified. Package/build edits are release identifier changes only. `qa/results/frozen-core-integrity.json` records the executed source/served/archive guards, individual protected hashes and the exact source change list; `qa/results/hybrid-regression.json` and `enrichment-mapping.json` retain the existing executed checks.

Core mismatch is a STOP condition in build, integrity and packaging. Quantitative IceCube physics baseline remains **NO**. No deployment performed.
