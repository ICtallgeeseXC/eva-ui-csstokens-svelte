<svelte:options customElement={{ tag: 'eva-split-readout', shadow: 'none' }} />

<script lang="ts">
	import EvaCapsulePill from './EvaCapsulePill.svelte';

	interface Props {
		value?: string;
		unit?: string;
		subtitle?: string;
		subtitlePosition?: 'bottom' | 'top';
		color?: string;
		flanked?: boolean;
	}

	let {
		value = 'PROTECT NO. 666',
		unit = '',
		subtitle = 'on MAGI-01 ORIGINAL',
		subtitlePosition = 'bottom',
		color = 'var(--eva-border-strong, #ff941a)',
		flanked = true
	}: Props = $props();
</script>

<div class="eva-sr" style="--sr-c: {color};">
	{#if flanked}
		<EvaCapsulePill {color} width="5px" />
	{/if}
	<div class="eva-sr__box">
		{#if subtitle && subtitlePosition === 'top'}
			<div class="sr-sub is-top">{subtitle}</div>
		{/if}
		<div class="sr-main">
			<strong class="sr-val eva-num">{value}</strong>
			{#if unit}
				<span class="sr-unit eva-display">{unit}</span>
			{/if}
		</div>
		{#if subtitle && subtitlePosition === 'bottom'}
			<div class="sr-sub is-bottom">{subtitle}</div>
		{/if}
	</div>
	{#if flanked}
		<EvaCapsulePill {color} width="5px" />
	{/if}
</div>

<style>
	.eva-sr {
		display: flex;
		align-items: stretch;
		gap: 0.45rem;
		background: #000000;
	}

	.eva-sr__box {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		border: 1.5px solid var(--sr-c);
		outline: 1px solid color-mix(in srgb, var(--sr-c) 60%, transparent);
		outline-offset: 2px;
		border-radius: 5px;
		background: #000000;
		box-shadow: 0 0 12px color-mix(in srgb, var(--sr-c) 24%, transparent);
	}

	.sr-main {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.32rem 0.65rem;
	}

	.sr-val {
		font-size: 1.68rem;
		color: var(--sr-c);
		line-height: 0.98;
		letter-spacing: 0.015em;
		text-shadow: 0 0 8px color-mix(in srgb, var(--sr-c) 45%, transparent);
	}

	.sr-unit {
		font-size: 1.05rem;
		color: var(--sr-c);
	}

	.sr-sub {
		padding: 0.14rem 0.55rem;
		text-align: center;
		font-family: var(--eva-font-display);
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--sr-c);
	}

	.sr-sub.is-top {
		border-bottom: 1.5px solid var(--sr-c);
	}

	.sr-sub.is-bottom {
		border-top: 1.5px solid var(--sr-c);
	}
</style>
