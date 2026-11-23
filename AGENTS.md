# EVA-UI Core Philosophies (Always Check Before Building Components)

Before creating or modifying components in `eva-ui`, verify your design against these core principles (also documented live at `/philosophies`):

0. **Composable Atomics & Component Reuse First (`PHIL-00`)**
   - Build reusable single-purpose primitives (`EvaFrame`, `EvaCapsulePill`, `EvaHazardStrip`, `EvaRulerScale`, `EvaLedIndicator`, `EvaChamferBox`, `EvaHudBox`, `EvaBilingualHeader`, `EvaTransportButton`, `EvaSeekBar`) and compose complex widgets (`EvaClockTimer`, `EvaMagiPanel`, `EvaAudioController`) out of them.
   - Reuse signature higher-level components like `EvaTitleCard` wherever appropriate (e.g. optional episodic track title display in `EvaAudioController`) instead of duplicating their styling.
   - Export all public components/types from `src/lib/index.ts` and include `<svelte:options customElement={{ tag: 'eva-...', shadow: 'none' }} />`.

1. **Sequence-Accurate Visual Fidelity & `:B` / `:R` Attribution (`PHIL-01`)**
   - Pure `#000000` CRT backdrops, crisp phosphor accents (`#ff941a`, `#46f76a`, `#ff2222`, `#72f7ff`), double-rule borders, and graduated scales.
   - Put the source sequence badge on the left-hand code pill using `:B` (Breaker) or `:R` (Re-Sound), e.g. `SEQ_008:R`, `SEQ_010:R`, `SEQ_085:B`.
   - Maintain proper canvas/SVG layering (e.g. contours behind gridlines, circuit boxes centered directly on diagonal traces).

2. **Authentic Rest & Zero-Signal Baselines (`PHIL-02`)**
   - When paused or when an audio frequency range has zero amplitude, settle to a true baseline (`00000000` counters, straight `0` waveform lines, resting base contours, dimmed relays) with no fake idle motion.

3. **High-Dynamic-Range Audio Reactivity & Freedom (`PHIL-03`)**
   - Avoid over-smoothed envelopes that peg at `1.0`. Use fast-attack / crisp-release FFT bands + time-domain RMS flux (`peakFlux`) so visualizers ride in the mid-range and pump sharply on beats.
   - Allow border-to-border swings at peak volume while keeping structural bounds clean (e.g. bounded vertical repulsion gap, circuit disconnect/reconnect drops on sharp amplitude drops).

4. **Overflow Motion, Accessibility & Showcase Organization (`PHIL-04`)**
   - Animate overflowing titles/track labels with smooth marquee scrolling instead of leaving clipped ellipsis text static.
   - Include ARIA roles and keyboard support on interactive controls (`EvaSeekBar`, `EvaTransportButton`, etc.).
   - Place audio visualizers in the dedicated `Audio & Harmonic Visualizers` section in `src/routes/+page.svelte` and verify with `npm run check`, `npm run package`, and `npm run build`.

5. **Optional Deep Component Configurability (`PHIL-05`)**
   - Always ship working defaults so components can be called as-is with zero required props (e.g. `<EvaAudioController />`, `<EvaPhaseScope />`).
   - Expose optional props, `$bindable` state, snippets, and callbacks for deep customization without imposing boilerplate on basic usage.

6. **Static Interactor Placement & Internal Highlighting (`PHIL-06`)**
   - Keep buttons, toggles, and status interactors at fixed positions and constant dimensions across state changes so the UI never shifts.
   - Communicate active/inactive state via phosphor color changes, glow, or highlighting the active side of a fixed dual-glyph/label (like `EvaTransportButton` lighting `▶` vs `❚❚`) instead of swapping variable-width text strings. Lock exact `width` + `overflow: hidden` on dynamic containers (like `EvaHudBox`) with `tabular-nums` and zero-padding—overflow is strictly preferable to layout resize/jitter.

7. **Zero-Indexed & Programmatic Library Ergonomics (`PHIL-07`)**
   - Use zero-indexed numbering (`00`, `01`, `02`...) for navigation items, sections, and channel indices.
   - Expose clean TypeScript `Props`, `$bindable` state, and CSS custom properties so every component is scriptable and composable.
