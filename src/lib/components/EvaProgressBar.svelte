<svelte:options customElement={{ tag: 'eva-progress-bar', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		label?: string;
		value?: number;
		max?: number;
		segments?: number;
		dangerThreshold?: number;
		dangerMode?: 'low' | 'high';
		unit?: string;
	}

	let {
		label = 'INTERNAL BATTERY',
		value = 68,
		max = 100,
		segments = 20,
		dangerThreshold = 25,
		dangerMode = 'low',
		unit = '%'
	}: Props = $props();

	const pct = $derived(Math.max(0, Math.min(100, (value / max) * 100)));
	const activeSegments = $derived(Math.round((pct / 100) * segments));
	const isDanger = $derived(dangerMode === 'high' ? pct >= dangerThreshold : pct <= dangerThreshold);
</script>

<div class="eva-meter" class:is-danger={isDanger}>
	<div class="eva-meter__head">
		<span class="eva-display eva-meter__lbl">{label}</span>
		<span class="eva-meter__val eva-num">{Math.round(value)}{unit}</span>
	</div>
	<div class="eva-meter__track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
		{#each Array.from({ length: segments }) as _, i}
			<span class="eva-meter__seg" class:is-filled={i < activeSegments}></span>
		{/each}
	</div>
</div>

<style>
	.eva-meter {
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		padding: 0.5rem 0.7rem;
		display: flex;
		flex-direction: column;
		gap: 0.36rem;
		box-shadow: 0 0 10px var(--eva-primary-dim);
	}

	.eva-meter.is-danger {
		border-color: #ff2222;
		outline-color: rgba(255, 34, 34, 0.55);
		box-shadow: 0 0 14px rgba(255, 34, 34, 0.3);
	}

	.eva-meter__head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding-bottom: 0.22rem;
		border-bottom: 1px solid var(--eva-border);
	}

	.eva-meter.is-danger .eva-meter__head {
		border-bottom-color: rgba(255, 34, 34, 0.55);
	}

	.eva-meter__lbl {
		font-size: 0.82rem;
		color: var(--eva-primary);
	}

	.eva-meter.is-danger .eva-meter__lbl {
		color: #ff2222;
		text-shadow: 0 0 8px rgba(255, 34, 34, 0.5);
	}

	.eva-meter__val {
		font-size: 1.25rem;
		color: var(--eva-primary);
	}

	.eva-meter.is-danger .eva-meter__val {
		color: #ff2222;
		text-shadow: 0 0 8px rgba(255, 34, 34, 0.55);
	}

	.eva-meter__track {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(4px, 1fr));
		gap: 3px;
		padding: 4px;
		background: #000000;
		border: 1px solid var(--eva-border-strong);
		border-radius: 3px;
	}

	.eva-meter.is-danger .eva-meter__track {
		border-color: #ff2222;
	}

	.eva-meter__seg {
		height: 16px;
		border-radius: 2px;
		background: rgba(255, 148, 26, 0.14);
		transition: background-color 100ms ease;
	}

	.eva-meter__seg.is-filled {
		background: var(--eva-primary);
		box-shadow: var(--eva-bloom);
	}

	.eva-meter.is-danger .eva-meter__seg.is-filled {
		background: #ff2222;
		box-shadow: 0 0 8px rgba(255, 34, 34, 0.55);
	}
</style>
