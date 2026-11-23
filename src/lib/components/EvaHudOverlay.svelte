<svelte:options customElement={{ tag: 'eva-hud-overlay', shadow: 'none' }} />

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import EvaTransportButton from './EvaTransportButton.svelte';

	interface Props {
		recLabel?: string;
		paused?: boolean;
		zoomLabel?: string;
		slides?: string[];
		slideCount?: number;
		activeIndex?: number;
		disabledIndices?: number[];
		slideCodes?: string[];
		shuffle?: boolean;
		intervalMs?: number;
		showControls?: boolean;
		showReticles?: boolean;
		interactive?: boolean;
		aspectRatio?: string;
		onSelect?: (index: number) => void;
		children?: Snippet;
	}

	let {
		recLabel = 'REC',
		paused = $bindable(false),
		zoomLabel = 'X05',
		slides = [],
		slideCount = 0,
		activeIndex = $bindable(0),
		disabledIndices = [],
		slideCodes = [],
		shuffle = false,
		intervalMs = 2200,
		showControls = true,
		showReticles = false,
		interactive = false,
		aspectRatio = '16 / 9',
		onSelect,
		children
	}: Props = $props();

	const totalSlides = $derived(slides.length > 0 ? slides.length : Math.max(0, slideCount));
	const disabledSet = $derived(new Set(disabledIndices));

	function findNextEnabled(from: number, delta: number): number {
		if (totalSlides === 0) return 0;
		if (shuffle) {
			const pool: number[] = [];
			for (let i = 0; i < totalSlides; i++) {
				if (i !== from && !disabledSet.has(i)) pool.push(i);
			}
			if (pool.length > 0) {
				return pool[Math.floor(Math.random() * pool.length)];
			}
		}
		const dir = delta >= 0 ? 1 : -1;
		for (let i = 1; i <= totalSlides; i++) {
			const candidate = (from + dir * i + totalSlides * 2) % totalSlides;
			if (!disabledSet.has(candidate)) {
				return candidate;
			}
		}
		return from;
	}

	onMount(() => {
		const id = setInterval(() => {
			if (!paused && totalSlides > 1) {
				const next = findNextEnabled(activeIndex, 1);
				if (next !== activeIndex) {
					activeIndex = next;
					onSelect?.(activeIndex);
				}
			}
		}, intervalMs);
		return () => clearInterval(id);
	});

	function step(delta: number) {
		if (totalSlides === 0) return;
		const next = findNextEnabled(activeIndex, delta);
		if (next !== activeIndex) {
			activeIndex = next;
			onSelect?.(activeIndex);
		}
	}

	const activeCode = $derived(
		slideCodes.length > 0 && slideCodes[activeIndex]
			? slideCodes[activeIndex]
			: totalSlides > 0
				? `X${String(activeIndex % totalSlides).padStart(2, '0')}`
				: zoomLabel
	);
	const playX = $derived(recLabel ? 98 : 18);
</script>

<div class="hud-wrap">
	<div class="hud-frame" style="aspect-ratio: {aspectRatio};">
		<!-- Background slot or built-in slideshow -->
		<div class="hud-bg" class:is-interactive={interactive} aria-hidden={!interactive}>
			{#if slides.length > 0}
				<img src={slides[activeIndex % slides.length]} alt="" class="hud-slide" />
			{:else if children}
				{@render children()}
			{/if}
		</div>

		<!-- Crisp white SVG Camcorder OSD matching SEQ_146 -->
		<svg viewBox="0 0 480 270" class="hud-osd" preserveAspectRatio="none" aria-hidden="true">
			<defs>
				<filter id="osd-glow" x="-15%" y="-15%" width="130%" height="130%">
					<feDropShadow dx="0" dy="0" stdDeviation="1.4" flood-color="#ffffff" flood-opacity="0.7" />
				</filter>
			</defs>

			<!-- Top-left: optional REC box + reactive || pause bars or ▶ play triangle -->
			<g filter="url(#osd-glow)">
				{#if recLabel}
					<rect x="18" y="16" width="66" height="28" fill="none" stroke="#ffffff" stroke-width="2.6" />
					<text
						x="51"
						y="36"
						text-anchor="middle"
						fill="#ffffff"
						font-family="'Archivo Narrow', 'Barlow Condensed', sans-serif"
						font-weight="700"
						font-size="20"
						letter-spacing="1.5"
					>
						{recLabel}
					</text>
				{/if}

				{#if paused}
					<rect x={playX} y="20" width="5" height="20" fill="#ffffff" />
					<rect x={playX + 10} y="20" width="5" height="20" fill="#ffffff" />
				{:else}
					<polygon points="{playX},20 {playX},40 {playX + 18},30" fill="#ffffff" />
				{/if}
			</g>

			{#if showReticles}
				<!-- Optional center 3 focus/tracking reticles -->
				<g filter="url(#osd-glow)">
					<rect x="116" y="124" width="22" height="28" fill="none" stroke="#ffffff" stroke-width="2.8" />
					<rect x="125" y="136" width="4" height="4" fill="#ffffff" />

					<rect x="224" y="114" width="32" height="44" fill="none" stroke="#ffffff" stroke-width="3" />

					<rect x="342" y="124" width="22" height="28" fill="none" stroke="#ffffff" stroke-width="2.8" />
					<rect x="351" y="136" width="4" height="4" fill="#ffffff" />
				</g>
			{/if}

			<!-- Bottom-right: X00, X01, X02... tracking slide index -->
			<g filter="url(#osd-glow)">
				<rect x="382" y="222" width="80" height="30" fill="none" stroke="#ffffff" stroke-width="2.6" />
				<text
					x="422"
					y="245"
					text-anchor="middle"
					fill="#ffffff"
					font-family="'Archivo Narrow', 'Barlow Condensed', sans-serif"
					font-weight="700"
					font-size="22"
					letter-spacing="1.5"
				>
					{activeCode}
				</text>
			</g>
		</svg>
	</div>

	{#if showControls && totalSlides > 0}
		<div class="hud-controls">
			<button type="button" class="eva-btn hud-btn" onclick={() => step(-1)}>◄ PREV</button>
			<EvaTransportButton playing={!paused} label="CYCLE" minWidth="112px" onToggle={(next) => (paused = !next)} />
			<button type="button" class="eva-btn hud-btn" onclick={() => step(1)}>NEXT ►</button>
		</div>
	{/if}
</div>

<style>
	.hud-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.hud-frame {
		position: relative;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		aspect-ratio: 16 / 9;
		width: 100%;
		overflow: hidden;
	}

	.hud-bg {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}

	.hud-bg.is-interactive {
		pointer-events: auto;
	}

	.hud-bg:not(.is-interactive)::after {
		content: "";
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.14);
	}

	.hud-slide {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.hud-osd {
		position: relative;
		z-index: 5;
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: none;
	}

	.hud-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.45rem;
	}

	.hud-btn {
		min-width: 82px;
		padding: 0.25rem 0.6rem;
		justify-content: center;
		font-size: 0.78rem;
	}

	@media (max-width: 640px) {
		.hud-frame:has(.hud-bg.is-interactive) {
			aspect-ratio: auto !important;
			min-height: 210px;
		}

		.hud-bg.is-interactive {
			position: relative;
			inset: auto;
		}

		.hud-frame:has(.hud-bg.is-interactive) .hud-osd {
			position: absolute;
			inset: 0;
		}
	}
</style>
