<svelte:options customElement={{ tag: 'eva-waveform', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		label?: string;
		syncRate?: number;
		animated?: boolean;
		dynamic?: boolean;
		dynamicMinMs?: number;
		dynamicMaxMs?: number;
		height?: number;
		ribbonTrails?: number;
	}

	let {
		label = 'HARMONICS // SYNC WAVEFORM',
		syncRate = $bindable(74.2),
		animated = true,
		dynamic = $bindable(false),
		dynamicMinMs = 3000,
		dynamicMaxMs = 8000,
		height = 190,
		ribbonTrails = 6
	}: Props = $props();

	let phase = $state(0);

	onMount(() => {
		let raf = 0;
		let lastTime = performance.now();
		let liveSync = Math.max(0, Math.min(100, syncRate));
		let lastWritten = liveSync;
		let driftTarget = liveSync >= 95 ? 0 : liveSync <= 5 ? 100 : Math.random() < 0.5 ? 100 : 0;
		let driftRate = 18;
		let nextSwitchAt = lastTime + dynamicMinMs + Math.random() * Math.max(0, dynamicMaxMs - dynamicMinMs);
		let wasDynamic = dynamic;

		const pickNextTarget = (now: number) => {
			const span = Math.max(0, dynamicMaxMs - dynamicMinMs);
			const interval = dynamicMinMs + Math.random() * span;
			driftTarget =
				liveSync >= 95 ? 0 : liveSync <= 5 ? 100 : Math.random() < 0.5 ? 100 : 0;
			const dist = Math.abs(driftTarget - liveSync);
			driftRate = Math.max(12, (dist / Math.max(1, interval / 1000)) * 1.15);
			nextSwitchAt = now + interval;
		};

		const tick = (now: number) => {
			const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
			lastTime = now;

			if (animated) {
				phase += 0.014;
			}

			if (dynamic) {
				if (!wasDynamic) {
					liveSync = Math.max(0, Math.min(100, syncRate));
					lastWritten = liveSync;
					pickNextTarget(now);
				} else if (Math.abs(syncRate - lastWritten) > 0.35) {
					// Preserve manual slider scrubbing seamlessly while dynamic is enabled
					liveSync = Math.max(0, Math.min(100, syncRate));
				}

				if (now >= nextSwitchAt) {
					pickNextTarget(now);
				}

				if (liveSync < driftTarget) {
					liveSync = Math.min(driftTarget, liveSync + driftRate * dt);
				} else if (liveSync > driftTarget) {
					liveSync = Math.max(driftTarget, liveSync - driftRate * dt);
				}

				const rounded = Number(liveSync.toFixed(1));
				lastWritten = rounded;
				if (rounded !== syncRate) {
					syncRate = rounded;
				}
			}
			wasDynamic = dynamic;

			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	const clampedSync = $derived(Math.max(0, Math.min(100, syncRate)));
	const convergence = $derived(clampedSync / 100);
	const isConverged = $derived(clampedSync >= 99);

	// Phase & frequency mismatch shrink to 0 as syncRate -> 100%
	const phaseGap = $derived((1 - convergence) * 2.35);
	const freqGap = $derived((1 - convergence) * 0.28);

	// Format ±0:01:970 style delta readout (0.000 when converged at 100%)
	const deltaReadout = $derived.by(() => {
		const err = (1 - convergence) * 3.85;
		const secs = Math.floor(err);
		const ms = String(Math.floor((err - secs) * 1000)).padStart(3, '0');
		return `±0:${String(secs).padStart(2, '0')}:${ms}`;
	});

	const plotW = 460;
	const plotTop = 14;
	const plotBottom = $derived(height - 26);
	const plotMid = $derived((plotTop + plotBottom) / 2);
	const plotAmp = $derived((plotBottom - plotTop) * 0.42);

	function buildWavePath(
		trailIdx: number,
		isSecondary: boolean
	): string {
		const trailOffset = trailIdx * 0.16;
		const pOffset = (isSecondary ? phaseGap : 0) + trailOffset;
		const fMult = isSecondary ? 1 + freqGap : 1;
		const pts: string[] = [];

		for (let x = 14; x <= plotW - 14; x += 5) {
			const norm = (x - 14) / (plotW - 28);
			const y =
				plotMid +
				Math.sin(norm * Math.PI * 2.6 * fMult + phase + pOffset) * plotAmp;
			pts.push(`${x === 14 ? 'M' : 'L'}${x},${y.toFixed(1)}`);
		}
		return pts.join(' ');
	}

	const primaryTrails = $derived(
		Array.from({ length: ribbonTrails }, (_, i) => ({
			idx: i,
			d: buildWavePath(i, false),
			opacity: 0.92 - i * 0.12
		}))
	);

	const secondaryTrails = $derived(
		Array.from({ length: ribbonTrails }, (_, i) => ({
			idx: i,
			d: buildWavePath(i, true),
			opacity: 0.92 - i * 0.12
		}))
	);

	const axisLabels = ['-5', '-4', '-3', '-2', '-1', '0', '+1', '+2', '+3', '+4', '+5'];
	const crosshairXs = [72, 152, 232, 312, 392];
</script>

<div class="eva-wave" class:is-converged={isConverged}>
	<div class="eva-wave__head">
		<span class="eva-mono-label">{label}</span>
		<div class="eva-wave__metrics">
			<span class="eva-wave__delta">{deltaReadout} ||</span>
			<span class="eva-wave__rate eva-display">
				<span class="eva-wave__pct">{clampedSync.toFixed(1)}%</span>
				<span class="eva-wave__tag" class:is-active={isConverged}>
					{isConverged ? 'CONVERGED' : 'HARMONIC'}
				</span>
			</span>
		</div>
	</div>

	<svg viewBox="0 0 {plotW} {height}" class="eva-wave__svg" preserveAspectRatio="none">
		<!-- Outer instrument frame -->
		<rect
			x="10"
			y="8"
			width={plotW - 20}
			height={plotBottom - 8}
			class="wave-frame"
		/>

		<!-- Calibration '+' crosshairs -->
		{#each crosshairXs as cx}
			{#each [plotTop + 18, plotMid, plotBottom - 16] as cy}
				<g class="wave-crosshair">
					<line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} />
					<line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} />
				</g>
			{/each}
		{/each}

		<!-- Vertical left scanline marker -->
		<line x1="68" y1="10" x2="68" y2={plotBottom} class="wave-scanbar" />

		<!-- Right-side vertical scale ticks -->
		{#each Array.from({ length: 11 }) as _, i}
			{@const ty = 14 + (i * (plotBottom - 20)) / 10}
			<line
				x1={plotW - 18}
				y1={ty}
				x2={plotW - (i % 5 === 0 ? 10 : 14)}
				y2={ty}
				class="wave-tick"
			/>
		{/each}

		<!-- Ribbon A (Cyan-Blue) & Ribbon B (Red-Orange) -> Converge to Unified Violet-White at 100% -->
		<g class="wave-ribbons">
			{#each primaryTrails as t (t.idx)}
				<path
					d={t.d}
					class="wave-trace-a"
					class:is-converged={isConverged}
					style="opacity: {t.opacity}"
				/>
			{/each}

			{#each secondaryTrails as t (t.idx)}
				<path
					d={t.d}
					class="wave-trace-b"
					class:is-converged={isConverged}
					style="opacity: {t.opacity}"
				/>
			{/each}

			{#if isConverged}
				<path d={primaryTrails[0].d} class="wave-converged-core" />
			{/if}
		</g>

		<!-- Bottom axis ruler (-5 to +5) -->
		{#each axisLabels as lbl, i}
			{@const ax = 28 + (i * (plotW - 56)) / (axisLabels.length - 1)}
			<line x1={ax} y1={plotBottom} x2={ax} y2={plotBottom + 5} class="wave-tick" />
			<text x={ax} y={height - 6} text-anchor="middle" class="wave-axis-lbl">{lbl}</text>
		{/each}
	</svg>
</div>

<style>
	.eva-wave {
		background: #030305;
		border: 1px solid var(--eva-border);
		padding: 0.65rem 0.75rem;
	}

	.eva-wave.is-converged {
		border-color: #ffd97d;
		box-shadow: inset 0 0 22px rgba(255, 217, 125, 0.22);
	}

	.eva-wave__head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.4rem;
	}

	.eva-wave__metrics {
		display: flex;
		align-items: baseline;
		gap: 0.65rem;
	}

	.eva-wave__delta {
		font-family: var(--eva-font-mono);
		font-size: 0.78rem;
		color: var(--eva-text);
		letter-spacing: 0.08em;
	}

	.eva-wave__rate {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 1.15rem;
		font-variant-numeric: tabular-nums;
		color: var(--eva-primary);
	}

	.eva-wave__pct {
		display: inline-block;
		min-width: 5.2ch;
		text-align: right;
	}

	.eva-wave.is-converged .eva-wave__rate {
		color: #fff2cc;
	}

	.eva-wave__tag {
		font-family: var(--eva-font-mono);
		font-size: 0.62rem;
		min-width: 76px;
		text-align: center;
		padding: 0.1rem 0.35rem;
		border: 1px solid var(--eva-border);
		background: transparent;
		color: var(--eva-text-muted);
		letter-spacing: 0.08em;
	}

	.eva-wave__tag.is-active {
		border-color: #ffe399;
		background: #ffe399;
		color: #07050a;
	}

	.eva-wave__svg {
		width: 100%;
		height: auto;
		display: block;
		background: #020204;
	}

	.wave-frame {
		fill: none;
		stroke: rgba(255, 255, 255, 0.7);
		stroke-width: 1.2;
	}

	.wave-crosshair line {
		stroke: rgba(255, 255, 255, 0.42);
		stroke-width: 1;
	}

	.wave-scanbar {
		stroke: rgba(255, 255, 255, 0.35);
		stroke-width: 2;
		stroke-dasharray: 2 2;
	}

	.wave-tick {
		stroke: rgba(255, 255, 255, 0.65);
		stroke-width: 1;
	}

	.wave-axis-lbl {
		font-family: var(--eva-font-mono);
		font-size: 8.5px;
		fill: rgba(255, 255, 255, 0.75);
	}

	.wave-ribbons {
		mix-blend-mode: screen;
	}

	.wave-trace-a {
		fill: none;
		stroke: #2c8cff;
		stroke-width: 2.6;
		transition: stroke 180ms ease;
	}

	.wave-trace-b {
		fill: none;
		stroke: #ff4422;
		stroke-width: 2.6;
		transition: stroke 180ms ease;
	}

	.wave-trace-a.is-converged,
	.wave-trace-b.is-converged {
		stroke: #ffe29a;
	}

	.wave-converged-core {
		fill: none;
		stroke: #fff9e6;
		stroke-width: 3.2;
		filter: drop-shadow(0 0 8px #ffd266);
	}
</style>
