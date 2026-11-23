<svelte:options customElement={{ tag: 'eva-stepper', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		label?: string;
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		unit?: string;
	}

	let {
		label = 'LCL COOLANT FLOW',
		value = $bindable(4),
		min = 0,
		max = 12,
		step = 1,
		unit = 'L/s'
	}: Props = $props();

	function adjust(delta: number) {
		value = Math.max(min, Math.min(max, value + delta));
	}
</script>

<div class="eva-stp">
	{#if label}
		<span class="eva-display stp-lbl">{label}</span>
	{/if}
	<div class="eva-stp__box">
		<button type="button" class="stp-btn" disabled={value <= min} onclick={() => adjust(-step)}>
			−
		</button>
		<span class="stp-val eva-num">{String(value).padStart(2, '0')} <small>{unit}</small></span>
		<button type="button" class="stp-btn" disabled={value >= max} onclick={() => adjust(step)}>
			+
		</button>
	</div>
</div>

<style>
	.eva-stp {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.stp-lbl {
		font-size: 0.78rem;
		color: var(--eva-text-muted);
	}

	.eva-stp__box {
		display: inline-grid;
		grid-template-columns: 36px 1fr 36px;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		overflow: hidden;
		background: #000000;
		box-shadow: 0 0 10px var(--eva-primary-dim);
	}

	.stp-btn {
		background: #000000;
		border: none;
		color: var(--eva-primary);
		font-family: var(--eva-font-num);
		font-size: 1.25rem;
		font-weight: 700;
		cursor: pointer;
	}

	.stp-btn:hover:not(:disabled) {
		background: var(--eva-primary);
		color: #000000;
	}

	.stp-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.stp-val {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 0.3rem;
		padding: 0.35rem 0.75rem;
		border-left: 1.5px solid var(--eva-border-strong);
		border-right: 1.5px solid var(--eva-border-strong);
		color: var(--eva-primary);
		font-size: 1.35rem;
	}

	.stp-val small {
		font-family: var(--eva-font-num);
		font-size: 0.78rem;
		color: var(--eva-gold, #fff275);
	}
</style>
