# Frozen-core adapter

`src/adapter/index.mjs` is the only product module importing the core. Its TypeScript shapes are in `src/adapter/types.d.ts`.

- `controlledInput({type,energy,directionMode,seed})`: checks primitive, bounded UI parameters before using the core sampler. Direction mode is up/down/any. It is never used to replace an exact regression fixture.
- `createEvent(input)`: invokes `simulateEvent(input)` with no options argument. Invalid inputs retain the frozen INVALID_INPUT response. Valid UI/fixture inputs retain exact raw EventInput, seed and the authoritative returned object. The core-validated normalized EventInput is separately available in that result.
- `geometry` and `metadata`: deep-frozen copies; no mutable core export reference is passed to the renderer. `_internal`, RNG helpers, constants overrides and `_counters` are not exposed by the adapter.
- `visualContext`: immutable C, BEDROCK and indices() outputs for schematic display geometry. No transport/reconstruction function or override is exposed.
- `inspectDOM(session,idx)`: copied sensor identity/depth and the actual returned hit, or null for an unhit sensor. It does not synthesize charge or timestamps.
- `eventRecord(session)`: exports exact input plus every authoritative result field; Map entries are serialized as an array.
- `getSimulationCount()`: counts calls to the public simulation entry point, including rejected attempts. It is not the engine's internal physics-run counter.

The display time range is derived from returned hit timestamps, including noise and jitter; it is a playback envelope, not an additional photon timing model. Negative times remain visible. Display layers do not filter the event result or alter cleaning, energy or reconstruction. The returned Map is retained for exact provenance; product code treats it as read-only. The adapter freezes input, event, ledger, hit and reconstruction records it reads; it never mutates core geometry/contracts.

The public controls create ordinary plain EventInputs. Arbitrary JavaScript objects are not exposed by the UI or WebMCP. Invalid revoked-proxy cases were checked directly against the adapter/frozen rejection path. QA metrics never decide whether a candidate is reliable; the frozen FIT_RENDERABLE state permits a track candidate, disclosure is shown first, and the renderer waits until the last returned non-noise hit before showing the selected line.
