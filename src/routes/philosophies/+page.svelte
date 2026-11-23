<script lang="ts">
	import {
		EvaBilingualHeader,
		EvaChamferBox,
		EvaCheckbox,
		EvaFrame,
		EvaHudBox,
		EvaLedIndicator,
		EvaPanel,
		EvaRulerScale,
		EvaStatusTag,
		EvaTitleCard
	} from '$lib';

	interface PhilosophyPrinciple {
		id: string;
		code: string;
		jp: string;
		title: string;
		tag: string;
		color: string;
		summary: string;
		rules: string[];
		references: string[];
	}

	const PRINCIPLES: PhilosophyPrinciple[] = [
		{
			id: 'atomics',
			code: 'PHIL-00',
			jp: '基礎構造 // ATOMIC COMPOSITION',
			title: 'COMPOSABLE ATOMICS FIRST',
			tag: 'ARCHITECTURE',
			color: '#ff941a',
			summary:
				'Build small, single-purpose UI atoms before assembling complex widgets or controllers. Avoid monolithic one-off markup when an existing or new atomic can be reused across panels.',
			rules: [
				'Compose parent components (e.g. EvaClockTimer, EvaMagiPanel, EvaAudioController) from shared atoms (EvaFrame, EvaHudBox, EvaLedIndicator, EvaRulerScale, EvaSeekBar, EvaTransportButton).',
				'Reuse signature higher-level components like EvaTitleCard wherever appropriate (e.g. optional episodic track title mode inside EvaAudioController) instead of duplicating their styling.',
				'Export every public component and TypeScript type from src/lib/index.ts and register custom element tags (<svelte:options customElement={{ tag: "eva-...", shadow: "none" }} />).'
			],
			references: ['EvaFrame', 'EvaSeekBar', 'EvaTitleCard', 'EvaHudBox', 'EvaAudioController']
		},
		{
			id: 'fidelity',
			code: 'PHIL-01',
			jp: '映像準拠 // SEQUENCE FIDELITY',
			title: 'SOURCE-ACCURATE VISUALS & :B / :R CODES',
			tag: 'VISUAL',
			color: '#72f7ff',
			summary:
				'Recreate NERV and MAGI interfaces directly from Breaker (:B) and Re-Sound (:R) sequence material on pure #000000 CRT backdrops with crisp phosphor glow and zero muddy gray cards.',
			rules: [
				'Use the single left-hand source code pill with :B (Breaker) or :R (Re-Sound) suffix (e.g. SEQ_008:R, SEQ_010:R, SEQ_085:B) without redundant right-hand duplicate tags.',
				'Maintain authentic z-index layering: e.g. contour curves behind segmented green/red gridlines with clean gap breaks.',
				'Keep geometric elements aligned with their paths (e.g. circuit junction boxes centered directly on diagonal traces).'
			],
			references: ['EvaPanel', 'EvaCircuitVisualizer', 'EvaPhaseScope', 'EvaEqPillars']
		},
		{
			id: 'baseline',
			code: 'PHIL-02',
			jp: '基準状態 // TRUE ZERO BASELINE',
			title: 'AUTHENTIC REST & ZERO-SIGNAL BASELINES',
			tag: 'TELEMETRY',
			color: '#fff275',
			summary:
				'Visualizers and scopes must settle cleanly to an authentic zero/rest state when paused or when a frequency band has no amplitude—never faking idle animation.',
			rules: [
				'Render 00000000 telemetry counters and straight orange base contours in EvaPhaseScope when energy is zero.',
				'Drop silent frequency ranges cleanly to a flat 0 baseline waveform in EvaWaveform instead of oscillating artificially.',
				'Dim relay LEDs and stop transient flux smoothly when playback pauses or ends.'
			],
			references: ['EvaPhaseScope', 'EvaWaveform', 'EvaCircuitVisualizer']
		},
		{
			id: 'reactivity',
			code: 'PHIL-03',
			jp: '音響反応 // DYNAMIC AUDIO PUMP',
			title: 'HIGH-DYNAMIC-RANGE REACTIVITY & FREEDOM',
			tag: 'AUDIO DSP',
			color: '#46f76a',
			summary:
				'Avoid over-smoothed envelopes that peg at 100%. Visualizers should breathe in the mid-range, punch sharply on transients, and let individual frequency bands sculpt distinct visual behavior.',
			rules: [
				'Use fast-attack / crisp-release band envelopes plus RMS + slow-floor flux detection (peakFlux) so beats pump noticeably without pinning at max.',
				'Give waveforms and contours freedom across the in-between range, hitting border-to-border scale at peak volume while bounding runaway expansion (e.g. EvaPhaseScope vertical gap cap).',
				'Drive expressive state transitions from real signal drops—such as circuit node disconnects on sharp amplitude drops in EvaCircuitVisualizer.'
			],
			references: ['EvaEqPillars', 'EvaPhaseScope', 'EvaCircuitVisualizer', 'EvaEnergyVisualizer']
		},
		{
			id: 'ergonomics',
			code: 'PHIL-04',
			jp: '表示制御 // OVERFLOW & INTERACTION',
			title: 'OVERFLOW MOTION, KEYBOARD ACCESS & CLEAN SECTIONS',
			tag: 'UX / LAYOUT',
			color: '#ff2222',
			summary:
				'Prevent clipped labels and crowded grids. Components should stay readable at narrow widths, support accessible pointer/keyboard control, and live in organized showcase sections.',
			rules: [
				'Animate overflowing titles and track names with smooth marquee scrolling (EvaPanel, EvaAudioController) rather than leaving text permanently cut off with ellipsis.',
				'Ensure interactive controls (EvaSeekBar, EvaTransportButton, EvaToggle) include proper ARIA roles, keyboard navigation, and focus states.',
				'Place visualizers in the dedicated Audio & Harmonic Visualizers section with live USAGE/SOURCE code drawers and verify with svelte-check, package, and build.'
			],
			references: ['EvaPanel', 'EvaAudioController', 'EvaSeekBar', '+page.svelte']
		},
		{
			id: 'configurability',
			code: 'PHIL-05',
			jp: '拡張設定 // ZERO-CONFIG DEFAULTS',
			title: 'OPTIONAL DEEP COMPONENT CONFIGURABILITY',
			tag: 'API DESIGN',
			color: '#72f7ff',
			summary:
				'Every component should render cleanly out of the box with sensible defaults so it can be called as-is, while exposing optional deep configurability for advanced composition and overrides.',
			rules: [
				'Provide working defaults for all props so components can be dropped in with minimal or zero configuration (e.g. <EvaPhaseScope />, <EvaAudioController />, <EvaClockTimer />).',
				'Expose optional props, $bindable state, Svelte snippets, and event callbacks so callers can customize colors, sizes, behaviors, audio sources, or external state wiring when needed.',
				'Avoid forcing boilerplate setup on simple use cases while never hardcoding away power-user customization.'
			],
			references: ['EvaAudioController', 'EvaSeekBar', 'EvaFrame', 'EvaWaveform', 'EvaStatusTag']
		},
		{
			id: 'static-interactors',
			code: 'PHIL-06',
			jp: '固定配置 // ZERO-SHIFT INTERACTORS',
			title: 'STATIC INTERACTOR PLACEMENT & INTERNAL HIGHLIGHTING',
			tag: 'STABILITY',
			color: '#ff941a',
			summary:
				'Interactive controls must maintain static placement and constant dimensions across state changes. Communicate state through phosphor color shifts, borders, and internal glyph/text highlighting rather than swapping variable-width labels.',
			rules: [
				'Model state changes after EvaTransportButton (▶ / ❚❚ AUDIO): keep all glyphs and text fixed in place and highlight the active state via color and glow instead of mutating text content.',
				'Never let toggling a button, badge, or indicator resize neighboring elements or cause horizontal layout shift.',
				'When dynamic numeric readouts are required, lock exact container dimensions (e.g. EvaHudBox width + overflow: hidden) alongside tabular-nums and fixed zero-padding—overflow clipping is strictly preferable to dynamic resizing or layout jitter.'
			],
			references: ['EvaTransportButton', 'EvaLedIndicator', 'EvaToggle', 'EvaModeStrip']
		},
		{
			id: 'programmatic',
			code: 'PHIL-07',
			jp: '零起点 // PROGRAMMATIC CONVENTIONS',
			title: 'ZERO-INDEXED & PROGRAMMATIC LIBRARY ERGONOMICS',
			tag: 'CONVENTIONS',
			color: '#46f76a',
			summary:
				'Treat EVA-UI as a deeply programmatic UI library: use zero-indexed numbering (00, 01, 02...) for navigation, sections, and channels, and keep APIs, types, and CSS custom properties clean and scriptable.',
			rules: [
				'Start numbered navigation items, section kickers, and channel indices from 00 (e.g. 00 // UI LIBRARY, 01 // FRAME & MOTIF EXPLORER, 02 // CORE PHILOSOPHIES, SECTION 00..04).',
				'Expose clean TypeScript Props, $bindable state, and CSS custom properties (--btn-c, --eva-*) so every component can be driven programmatically.',
				'Keep component behavior deterministic and composable across Svelte 5 and Custom Elements.'
			],
			references: ['+layout.svelte', 'EvaEqPillars', 'EvaAudioController', 'tokens.css']
		}
	];

	let checklist = $state<Record<string, boolean>>({
		atomics: true,
		srcCode: true,
		zeroRest: true,
		dynamicDsp: true,
		overflowUx: true,
		zeroConfig: true,
		staticUi: true,
		verified: true
	});

	const checkedCount = $derived(Object.values(checklist).filter(Boolean).length);
	const totalChecks = $derived(Object.keys(checklist).length);
</script>

<div class="phil-page">
	<EvaTitleCard
		variant="banner"
		kicker="DESIGN SYSTEM DOCTRINE // CHECK BEFORE BUILDING"
		line1="EVA-UI CORE"
		line2="PHILOSOPHIES"
		subtitle="ARCHITECTURAL STANDARDS, SEQUENCE FIDELITY & AUDIO DSP PRINCIPLES"
	/>

	<div class="phil-summary">
		<EvaFrame variant="flanked" color="#46f76a" padding="0.7rem 0.9rem" gap="0.65rem">
			<EvaBilingualHeader
				jp="設計指針 // PRE-BUILD VERIFICATION"
				title="COMPONENT DESIGN CHECKLIST"
				code="DOC-01"
				color="#46f76a"
			>
				{#snippet right()}
					<EvaLedIndicator
						label={`${checkedCount} / ${totalChecks} VERIFIED`}
						state={checkedCount === totalChecks ? 'on' : 'warn'}
						pulse={checkedCount === totalChecks}
					/>
				{/snippet}
			</EvaBilingualHeader>

			<div class="check-grid">
				<EvaCheckbox bind:checked={checklist.atomics} label="Composed from reusable EVA atomics & exported in index.ts" />
				<EvaCheckbox bind:checked={checklist.srcCode} label="Sequence code uses single left pill (:B / :R convention)" />
				<EvaCheckbox bind:checked={checklist.zeroRest} label="Clean zero-signal / pause baseline with no fake idle motion" />
				<EvaCheckbox bind:checked={checklist.dynamicDsp} label="Mid-range rest + snappy transient pump & multi-band freedom" />
				<EvaCheckbox bind:checked={checklist.overflowUx} label="Ellipsis overflow marquee & full keyboard/ARIA support" />
				<EvaCheckbox bind:checked={checklist.zeroConfig} label="Zero-config defaults with optional deep configurability" />
				<EvaCheckbox bind:checked={checklist.staticUi} label="Static interactor placement (color/highlight state, no text-shift reflow)" />
				<EvaCheckbox bind:checked={checklist.verified} label="Verified via npm run check, package & build" />
			</div>
			<EvaRulerScale ticks={48} majorEvery={6} color="#46f76a" height={8} />
		</EvaFrame>
	</div>

	<div class="phil-grid">
		{#each PRINCIPLES as item (item.id)}
			<EvaPanel title={item.title} code={item.code}>
				<div class="phil-card">
					<div class="phil-card__head">
						<span class="phil-jp">{item.jp}</span>
						<EvaHudBox text={item.tag} size="sm" color={item.color} />
					</div>

					<p class="phil-summary-text">{item.summary}</p>

					<EvaRulerScale ticks={32} majorEvery={4} color={item.color} height={7} />

					<ul class="phil-rules">
						{#each item.rules as rule}
							<li>{rule}</li>
						{/each}
					</ul>

					<div class="phil-refs">
						<EvaStatusTag variant="pill" jpLabel="参照" label="COMPONENTS:" color={item.color} />
						<div class="phil-ref-chips">
							{#each item.references as refName}
								<EvaChamferBox color={item.color} padding="0.22rem 0.5rem" minHeight="0">
									<span class="eva-mono-label" style="color: {item.color}; font-size: 0.72rem;">
										{refName}
									</span>
								</EvaChamferBox>
							{/each}
						</div>
					</div>
				</div>
			</EvaPanel>
		{/each}
	</div>
</div>

<style>
	.phil-page {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.phil-summary {
		width: 100%;
	}

	.check-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 0.55rem 1rem;
	}

	.phil-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
		gap: 1.15rem;
	}

	@media (max-width: 560px) {
		.phil-grid {
			grid-template-columns: 1fr;
		}
	}

	.phil-card {
		display: flex;
		flex-direction: column;
		gap: 0.72rem;
		height: 100%;
	}

	.phil-card__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.phil-jp {
		font-family: var(--eva-font-display);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--eva-text-muted);
	}

	.phil-summary-text {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.48;
		color: var(--eva-text-hi);
	}

	.phil-rules {
		margin: 0;
		padding-left: 1.15rem;
		display: flex;
		flex-direction: column;
		gap: 0.42rem;
		font-size: 0.84rem;
		line-height: 1.42;
		color: var(--eva-text-mid, #ffd6a0);
	}

	.phil-rules li::marker {
		color: var(--eva-primary);
	}

	.phil-refs {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.45rem;
		margin-top: auto;
		padding-top: 0.35rem;
	}

	.phil-ref-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.38rem;
	}

	.phil-ref-chips :global(.eva-chamfer) {
		width: auto;
	}
</style>
