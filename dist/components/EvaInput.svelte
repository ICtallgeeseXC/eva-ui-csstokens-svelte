<svelte:options customElement={{ tag: 'eva-input', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		label?: string;
		jpLabel?: string;
		value?: string;
		placeholder?: string;
		type?: 'text' | 'password' | 'email' | 'number' | 'search';
		code?: string;
		error?: string;
		disabled?: boolean;
	}

	let {
		label = 'PILOT IDENTIFIER',
		jpLabel = '入力',
		value = $bindable(''),
		placeholder = 'ENTER CALLSIGN...',
		type = 'text',
		code = 'IN-01',
		error = '',
		disabled = false
	}: Props = $props();

	let showPassword = $state(false);
	const effectiveType = $derived(type === 'password' && showPassword ? 'text' : type);
</script>

<label class="eva-inp" class:has-error={Boolean(error)} class:is-disabled={disabled}>
	<div class="eva-inp__bar">
		<div class="eva-inp__left">
			{#if jpLabel}
				<span class="eva-inp__jp">{jpLabel}</span>
			{/if}
			{#if label}
				<span class="eva-inp__lbl">{label}</span>
			{/if}
		</div>
		<div class="eva-inp__right">
			{#if code}
				<span class="eva-inp__code">{code}</span>
			{/if}
			{#if error}
				<span class="eva-inp__hazard" aria-hidden="true"></span>
			{/if}
		</div>
	</div>

	<div class="eva-inp__box">
		<div class="eva-inp__row">
			<input class="eva-inp__field" type={effectiveType} {placeholder} {disabled} bind:value />
			{#if type === 'password'}
				<button
					type="button"
					class="eva-inp__act"
					onclick={() => (showPassword = !showPassword)}
				>
					{showPassword ? 'MASK' : 'REVEAL'}
				</button>
			{:else if type === 'search' && value}
				<button type="button" class="eva-inp__act" onclick={() => (value = '')}>CLR</button>
			{/if}
		</div>
		<div class="eva-inp__ticks" aria-hidden="true"></div>
	</div>

	{#if error}
		<span class="eva-inp__err">警告 // {error}</span>
	{/if}
</label>

<style>
	.eva-inp {
		--ic: var(--eva-border-strong);
		display: flex;
		flex-direction: column;
		border: 1.5px solid var(--ic);
		outline: 1px solid color-mix(in srgb, var(--ic) 55%, transparent);
		outline-offset: 2px;
		border-radius: 5px;
		background: #000000;
		box-shadow: 0 0 10px color-mix(in srgb, var(--ic) 18%, transparent);
	}

	.eva-inp.has-error {
		--ic: #ff2222;
	}

	.eva-inp.is-disabled {
		opacity: 0.45;
	}

	.eva-inp__bar {
		display: flex;
		justify-content: space-between;
		align-items: stretch;
		border-bottom: 1.5px solid var(--ic);
		background: #000000;
	}

	.eva-inp__left {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.2rem 0.5rem;
	}

	.eva-inp__jp {
		background: #000000;
		color: var(--ic);
		border: 1px solid var(--ic);
		border-radius: 3px;
		font-weight: 800;
		font-size: 0.66rem;
		padding: 0.04rem 0.35rem;
	}

	.eva-inp__lbl {
		font-family: var(--eva-font-display);
		font-size: 0.84rem;
		font-weight: 700;
		color: var(--ic);
		letter-spacing: 0.04em;
		text-shadow: var(--eva-bloom);
	}

	.eva-inp__right {
		display: flex;
		align-items: stretch;
	}

	.eva-inp__code {
		display: flex;
		align-items: center;
		padding: 0 0.5rem;
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--eva-gold, #fff275);
		border-left: 1.5px solid var(--ic);
	}

	.eva-inp__hazard {
		width: 28px;
		border-left: 1.5px solid var(--ic);
		background: repeating-linear-gradient(
			-55deg,
			#ff2222,
			#ff2222 5px,
			#000000 5px,
			#000000 10px
		);
	}

	.eva-inp__box {
		display: flex;
		flex-direction: column;
	}

	.eva-inp__row {
		display: flex;
		align-items: stretch;
	}

	.eva-inp__field {
		flex: 1;
		min-width: 0;
		padding: 0.46rem 0.65rem;
		background: #000000;
		border: none;
		color: var(--eva-text-hi);
		font-family: var(--eva-font-num);
		font-size: 0.96rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		outline: none;
	}

	.eva-inp__act {
		min-width: 62px;
		padding: 0 0.6rem;
		background: #000000;
		border: none;
		border-left: 1.5px solid var(--ic);
		color: var(--ic);
		font-family: var(--eva-font-display);
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-align: center;
		flex-shrink: 0;
		cursor: pointer;
	}

	.eva-inp__act:hover {
		background: var(--ic);
		color: #000000;
	}

	.eva-inp__ticks {
		height: 3px;
		border-top: 1px solid var(--ic);
		background: repeating-linear-gradient(
			to right,
			var(--ic) 0px,
			var(--ic) 1px,
			transparent 1px,
			transparent 12px
		);
		opacity: 0.5;
	}

	.eva-inp__err {
		padding: 0.2rem 0.55rem;
		background: #ff2222;
		color: #000000;
		font-family: var(--eva-font-display);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.05em;
	}
</style>
