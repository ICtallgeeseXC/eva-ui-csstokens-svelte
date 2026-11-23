<svelte:options customElement={{ tag: 'eva-status-tag', shadow: 'none' }} />

<script lang="ts">
	import EvaHazardStrip from './EvaHazardStrip.svelte';

	interface Props {
		variant?: 'pill' | 'striped' | 'stacked';
		jpLabel?: string;
		label?: string;
		color?: string;
		inverted?: boolean;
		critical?: boolean;
		align?: 'left' | 'center';
		outlined?: boolean;
		glow?: boolean;
		size?: 'sm' | 'md';
		minWidth?: string;
	}

	let {
		variant = 'pill',
		jpLabel = '活動限界まで あと',
		label = 'ACTIVE TIME REMAINING:',
		color = 'var(--eva-tag-color, #ff941a)',
		inverted = false,
		critical = false,
		align = 'left',
		outlined = false,
		glow = false,
		size = 'sm',
		minWidth = ''
	}: Props = $props();
</script>

{#if variant === 'striped'}
	<div
		class="eva-st-striped"
		class:is-critical={critical}
		style="--st-c: {color}; {minWidth ? `min-width: ${minWidth}` : ''}"
	>
		<div class="st-striped__text">
			{#if jpLabel}
				<span class="st-striped__jp">{jpLabel}</span>
			{/if}
			{#if label}
				<span class="st-striped__en">{label}</span>
			{/if}
		</div>
		<div class="st-striped__hazard" aria-hidden="true">
			<EvaHazardStrip direction="right" color="var(--st-red)" height="100%" stripeWidth={7} />
		</div>
	</div>
{:else if variant === 'stacked'}
	<div
		class="eva-st-stacked"
		class:is-critical={critical}
		class:is-inverted={inverted}
		class:is-centered={align === 'center'}
		class:is-outlined={outlined}
		class:is-glow={glow}
		class:is-md={size === 'md'}
		style="--st-c: {color}; {minWidth ? `min-width: ${minWidth}` : ''}"
	>
		{#if jpLabel}
			<span class="st-stacked__jp">{jpLabel}</span>
		{/if}
		{#if label}
			<span class="st-stacked__en" class:eva-display={size === 'md'}>{label}</span>
		{/if}
	</div>
{:else}
	<div
		class="eva-st-pill"
		class:is-critical={critical}
		style="--st-c: {color}; {minWidth ? `min-width: ${minWidth}` : ''}"
	>
		{#if jpLabel}
			<span class="st-pill__jp">{jpLabel}</span>
		{/if}
		{#if label}
			<span class="st-pill__en">{label}</span>
		{/if}
	</div>
{/if}

<style>
	.eva-st-pill,
	.eva-st-striped,
	.eva-st-stacked {
		--st-color: var(--st-c, #ff941a);
		--st-red: #ff2222;
	}

	.is-critical {
		--st-color: #ff2222;
	}

	.eva-st-pill {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.st-pill__jp {
		background: #000000;
		color: var(--st-color);
		border: 1px solid var(--st-color);
		border-radius: 3px;
		font-weight: 800;
		font-size: 0.74rem;
		padding: 0.08rem 0.45rem;
		letter-spacing: 0.04em;
	}

	.st-pill__en {
		font-family: var(--eva-font-display);
		font-size: 0.84rem;
		font-weight: 700;
		color: var(--st-color);
		letter-spacing: 0.04em;
		text-shadow: 0 0 8px color-mix(in srgb, var(--st-color) 40%, transparent);
	}

	.eva-st-striped {
		display: grid;
		grid-template-columns: 1fr 44px;
		border: 1.5px solid var(--st-color);
		border-radius: 4px;
		overflow: hidden;
		background: #000000;
		flex: 1;
	}

	.st-striped__text {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0.25rem 0.5rem;
		color: var(--st-color);
	}

	.st-striped__jp {
		font-size: 1.25rem;
		font-weight: 900;
		line-height: 1.05;
		letter-spacing: 0.08em;
	}

	.st-striped__en {
		font-family: var(--eva-font-display);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	.st-striped__hazard {
		border-left: 1.5px solid var(--st-color);
	}

	.eva-st-stacked {
		border: 1.5px solid var(--st-color);
		border-radius: 4px;
		background: #000000;
		padding: 0.25rem 0.55rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		color: var(--st-color);
	}

	.eva-st-stacked.is-inverted {
		background: var(--st-color);
		color: #000000;
	}

	.eva-st-stacked.is-centered {
		align-items: center;
		text-align: center;
		flex-shrink: 0;
	}

	.eva-st-stacked.is-outlined {
		padding: 0.24rem 0.65rem;
		outline: 1px solid color-mix(in srgb, var(--st-color) 60%, transparent);
		outline-offset: 1px;
	}

	.eva-st-stacked.is-glow:not(.is-inverted) {
		background: color-mix(in srgb, var(--st-color) 13%, #000000);
		box-shadow: 0 0 12px color-mix(in srgb, var(--st-color) 28%, transparent);
	}

	.st-stacked__jp {
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.04em;
	}

	.eva-st-stacked.is-md .st-stacked__jp {
		font-family: var(--eva-font-display);
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	.st-stacked__en {
		font-family: var(--eva-font-display);
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		opacity: 0.94;
	}

	.eva-st-stacked.is-md .st-stacked__en {
		font-size: 1.02rem;
		letter-spacing: 0.04em;
		opacity: 1;
	}

	.eva-st-stacked.is-md.is-inverted .st-stacked__en {
		text-shadow: none;
	}
</style>
