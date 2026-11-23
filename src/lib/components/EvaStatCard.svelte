<svelte:options customElement={{ tag: 'eva-stat-card', shadow: 'none' }} />

<script lang="ts">
	import EvaCapsulePill from './EvaCapsulePill.svelte';
	import EvaRulerScale from './EvaRulerScale.svelte';

	interface Props {
		label?: string;
		value?: string | number;
		unit?: string;
		delta?: string;
		trend?: 'up' | 'down' | 'neutral';
		sentiment?: 'auto' | 'positive' | 'negative' | 'neutral';
		code?: string;
	}

	let {
		label = 'LCL PURITY',
		value = '99.42',
		unit = '%',
		delta = '+0.18%',
		trend = 'up',
		sentiment = 'auto',
		code = 'BIO-02'
	}: Props = $props();

	const resolvedTone = $derived(
		sentiment === 'auto'
			? trend === 'up'
				? 'positive'
				: trend === 'down'
					? 'negative'
					: 'neutral'
			: sentiment
	);
</script>

<div class="eva-stat">
	<EvaCapsulePill width="5px" />
	<div class="eva-stat__inner">
		<div class="eva-stat__top">
			<span class="eva-stat__label eva-display">{label}</span>
			<span class="eva-stat__code eva-num">{code}</span>
		</div>
		<EvaRulerScale ticks={24} majorEvery={4} height={6} />
		<div class="eva-stat__main">
			<strong class="eva-stat__value eva-num">{value}</strong>
			{#if unit}
				<span class="eva-stat__unit eva-num">{unit}</span>
			{/if}
		</div>
		{#if delta}
			<div class="eva-stat__delta eva-num is-{resolvedTone}">
				{trend === 'up' ? '▲' : trend === 'down' ? '▼' : '■'} {delta}
			</div>
		{/if}
	</div>
	<EvaCapsulePill width="5px" />
</div>

<style>
	.eva-stat {
		display: flex;
		align-items: stretch;
		gap: 0.45rem;
		background: #000000;
		padding: 0.35rem 0.2rem;
	}

	.eva-stat__inner {
		flex: 1;
		min-width: 0;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		padding: 0.48rem 0.72rem;
		display: flex;
		flex-direction: column;
		gap: 0.28rem;
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.eva-stat__top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.eva-stat__label {
		font-size: 0.74rem;
		color: var(--eva-primary);
		letter-spacing: 0.04em;
	}

	.eva-stat__code {
		font-size: 0.72rem;
		color: var(--eva-gold, #fff275);
		border: 1px solid var(--eva-border-strong);
		border-radius: 3px;
		padding: 0.04rem 0.36rem;
		text-shadow: 0 0 6px rgba(255, 242, 117, 0.35);
	}

	.eva-stat__main {
		display: flex;
		align-items: baseline;
		gap: 0.35rem;
		padding-top: 0.1rem;
	}

	.eva-stat__value {
		font-size: 2.3rem;
		line-height: 0.96;
		letter-spacing: 0.01em;
		color: var(--eva-primary);
	}

	.eva-stat__unit {
		font-size: 1rem;
		color: var(--eva-primary);
		opacity: 0.9;
	}

	.eva-stat__delta {
		font-size: 0.8rem;
		color: var(--eva-text-muted);
		letter-spacing: 0.03em;
	}

	.eva-stat__delta.is-positive {
		color: var(--eva-green, #46f76a);
		text-shadow: 0 0 8px rgba(70, 247, 106, 0.45);
	}

	.eva-stat__delta.is-negative {
		color: var(--eva-accent, #ff2222);
		text-shadow: 0 0 8px rgba(255, 34, 34, 0.45);
	}
</style>
