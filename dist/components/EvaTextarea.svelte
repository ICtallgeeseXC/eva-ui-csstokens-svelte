<svelte:options customElement={{ tag: 'eva-textarea', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		label?: string;
		jpLabel?: string;
		value?: string;
		placeholder?: string;
		rows?: number;
		maxLength?: number;
	}

	let {
		label = 'MISSION BRIEFING // LOG',
		jpLabel = '記録',
		value = $bindable(''),
		placeholder = 'ENTER TACTICAL LOG...',
		rows = 3,
		maxLength = 240
	}: Props = $props();
</script>

<label class="eva-ta">
	<div class="eva-ta__bar">
		<div class="eva-ta__left">
			<span class="eva-ta__jp">{jpLabel}</span>
			<span class="eva-ta__lbl">{label}</span>
		</div>
		<span class="eva-ta__count">{String(value.length).padStart(3, '0')} / {maxLength}</span>
	</div>
	<textarea class="eva-ta__field" {rows} {placeholder} maxlength={maxLength} bind:value></textarea>
	<div class="eva-ta__ticks" aria-hidden="true"></div>
</label>

<style>
	.eva-ta {
		display: flex;
		flex-direction: column;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		background: #000000;
		box-shadow: 0 0 10px var(--eva-primary-dim);
	}

	.eva-ta__bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.24rem 0.5rem;
		border-bottom: 1.5px solid var(--eva-border-strong);
		background: #000000;
	}

	.eva-ta__left {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.eva-ta__jp {
		background: #000000;
		color: var(--eva-primary);
		border: 1px solid var(--eva-border-strong);
		border-radius: 3px;
		font-weight: 800;
		font-size: 0.66rem;
		padding: 0.04rem 0.35rem;
	}

	.eva-ta__lbl {
		font-family: var(--eva-font-display);
		font-size: 0.84rem;
		font-weight: 700;
		color: var(--eva-primary);
		letter-spacing: 0.04em;
		text-shadow: var(--eva-bloom);
	}

	.eva-ta__count {
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.84rem;
		font-weight: 700;
		color: var(--eva-gold, #fff275);
	}

	.eva-ta__field {
		padding: 0.55rem 0.65rem;
		background: #000000;
		border: none;
		color: var(--eva-text-hi);
		font-family: var(--eva-font-sans);
		font-size: 0.92rem;
		font-weight: 600;
		line-height: 1.35;
		resize: vertical;
		outline: none;
	}

	.eva-ta__ticks {
		height: 3px;
		border-top: 1px solid var(--eva-border-strong);
		background: repeating-linear-gradient(
			to right,
			var(--eva-primary) 0px,
			var(--eva-primary) 1px,
			transparent 1px,
			transparent 12px
		);
		opacity: 0.45;
	}
</style>
