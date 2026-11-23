<svelte:options customElement={{ tag: 'eva-pattern-blue', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		pattern?: 'BLUE' | 'ORANGE' | 'RED';
		code?: string;
		confidence?: number;
		animated?: boolean;
	}

	let {
		pattern = 'BLUE',
		code = '使徒 // ANGEL-04',
		confidence = 99.8,
		animated = true
	}: Props = $props();

	let tick = $state(0);

	onMount(() => {
		if (!animated) return;
		const id = setInterval(() => {
			tick += 1;
		}, 140);
		return () => clearInterval(id);
	});

	const colorMap = {
		BLUE: '#00c8ff',
		ORANGE: '#ff9900',
		RED: '#ff2222'
	};

	const activeColor = $derived(colorMap[pattern]);

	const bars = $derived(
		Array.from({ length: 18 }, (_, i) => {
			const v = Math.sin((i + tick * 0.5) * 0.55) * 0.38 + Math.cos((i * 1.1 - tick * 0.4)) * 0.28;
			return Math.max(14, Math.min(96, Math.round(54 + v * 42)));
		})
	);
</script>

<div class="pb-frame" style="--pb-color: {activeColor}">
	<div class="pb-top">
		<div class="pb-top__left">
			<span class="pb-jp">パターン{pattern === 'BLUE' ? '青' : pattern === 'ORANGE' ? '橙' : '赤'}</span>
			<strong class="pb-title eva-display">BLOOD TYPE: {pattern}</strong>
		</div>
		<span class="pb-code">{code}</span>
	</div>

	<div class="pb-body">
		<div class="pb-spectrum">
			<div class="pb-spectrum__head">
				<span>WAVELENGTH // SPECTRUM</span>
				<span>CONFIDENCE {confidence.toFixed(1)}%</span>
			</div>
			<div class="pb-bars" aria-hidden="true">
				{#each bars as h, i}
					<div class="pb-bar-col">
						<div class="pb-bar-fill" class:is-peak={h > 78} style="height: {h}%"></div>
						<span class="pb-bar-idx">{String(i + 1).padStart(2, '0')}</span>
					</div>
				{/each}
			</div>
		</div>

		<div class="pb-side">
			<div class="pb-box">
				<span class="pb-box__lbl">ANALYSIS</span>
				<strong class="pb-box__val eva-display">PATTERN {pattern}</strong>
			</div>
			<div class="pb-box is-alert">
				<span class="pb-box__lbl">A.T. FIELD</span>
				<strong class="pb-box__val eva-display">DETECTED</strong>
			</div>
			<div class="pb-hazard" aria-hidden="true"></div>
		</div>
	</div>
</div>

<style>
	.pb-frame {
		background: #000000;
		border: 1.5px solid var(--pb-color);
		outline: 1px solid color-mix(in srgb, var(--pb-color) 55%, transparent);
		outline-offset: 2px;
		border-radius: 5px;
		padding: 0.7rem;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		box-shadow: 0 0 14px color-mix(in srgb, var(--pb-color) 20%, transparent);
	}

	.pb-top {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 1.5px solid var(--pb-color);
		padding-bottom: 0.45rem;
	}

	.pb-top__left {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}

	.pb-jp {
		background: var(--pb-color);
		color: #000000;
		border-radius: 3px;
		font-weight: 800;
		font-size: 0.78rem;
		padding: 0.08rem 0.44rem;
	}

	.pb-title {
		font-size: 1.25rem;
		color: var(--pb-color);
		letter-spacing: 0.04em;
	}

	.pb-code {
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.84rem;
		font-weight: 700;
		color: var(--eva-gold, #fff275);
		border: 1.5px solid var(--pb-color);
		border-radius: 4px;
		padding: 0.06rem 0.45rem;
	}

	.pb-body {
		display: grid;
		grid-template-columns: 1fr 148px;
		gap: 0.65rem;
	}

	@media (max-width: 520px) {
		.pb-body {
			grid-template-columns: 1fr;
		}
	}

	.pb-spectrum {
		border: 1.5px solid var(--pb-color);
		border-radius: 4px;
		padding: 0.45rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		background: #000000;
	}

	.pb-spectrum__head {
		display: flex;
		justify-content: space-between;
		font-family: var(--eva-font-display);
		font-size: 0.76rem;
		font-weight: 700;
		color: var(--pb-color);
	}

	.pb-bars {
		display: grid;
		grid-template-columns: repeat(18, 1fr);
		gap: 3px;
		height: 92px;
		align-items: end;
	}

	.pb-bar-col {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		gap: 2px;
	}

	.pb-bar-fill {
		width: 100%;
		background: var(--pb-color);
		transition: height 120ms linear;
	}

	.pb-bar-fill.is-peak {
		background: #ff2222;
	}

	.pb-bar-idx {
		font-family: var(--eva-font-num);
		font-size: 0.62rem;
		font-weight: 700;
		color: var(--eva-text-muted);
	}

	.pb-side {
		display: flex;
		flex-direction: column;
		gap: 0.42rem;
	}

	.pb-box {
		border: 1.5px solid var(--pb-color);
		outline: 1px solid color-mix(in srgb, var(--pb-color) 45%, transparent);
		outline-offset: 1px;
		border-radius: 4px;
		padding: 0.32rem 0.5rem;
		display: flex;
		flex-direction: column;
		background: #000000;
		color: var(--pb-color);
	}

	.pb-box.is-alert {
		border-color: #ff2222;
		outline-color: rgba(255, 34, 34, 0.55);
		background: #000000;
		color: #ff2222;
		box-shadow: 0 0 10px rgba(255, 34, 34, 0.35);
		text-shadow: 0 0 8px rgba(255, 34, 34, 0.55);
	}

	.pb-box__lbl {
		font-family: var(--eva-font-display);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.04em;
	}

	.pb-box__val {
		font-size: 1.08rem;
		letter-spacing: 0.03em;
	}

	.pb-hazard {
		flex: 1;
		min-height: 14px;
		background: repeating-linear-gradient(
			-55deg,
			#ff2222,
			#ff2222 6px,
			#000000 6px,
			#000000 12px
		);
		border: 1.5px solid #ff2222;
		border-radius: 3px;
	}
</style>
