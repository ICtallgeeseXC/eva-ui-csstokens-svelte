<svelte:options customElement={{ tag: 'eva-radio-group', shadow: 'none' }} />

<script lang="ts">
	export interface RadioOption {
		value: string;
		label: string;
		code?: string;
	}

	interface Props {
		options?: RadioOption[];
		value?: string;
		name?: string;
	}

	const defaultOptions: RadioOption[] = [
		{ value: 'plug-01', label: 'ENTRY PLUG 01 // IKARI', code: 'P-01' },
		{ value: 'plug-02', label: 'ENTRY PLUG 02 // LANGLEY', code: 'P-02' },
		{ value: 'dummy', label: 'DUMMY SYSTEM // REI-00', code: 'DMY' }
	];

	let {
		options = defaultOptions,
		value = $bindable(options[0]?.value ?? ''),
		name = 'eva-radio'
	}: Props = $props();
</script>

<div class="eva-radio-group" role="radiogroup">
	{#each options as opt (opt.value)}
		{@const active = value === opt.value}
		<label class="eva-radio" class:is-active={active}>
			<input type="radio" {name} value={opt.value} bind:group={value} class="eva-radio__native" />
			<span class="eva-radio__diamond" aria-hidden="true">
				{#if active}
					<span class="eva-radio__core"></span>
				{/if}
			</span>
			{#if opt.code}
				<span class="eva-radio__code">{opt.code}</span>
			{/if}
			<span class="eva-radio__lbl">{opt.label}</span>
		</label>
	{/each}
</div>

<style>
	.eva-radio-group {
		display: flex;
		flex-direction: column;
		gap: 0.42rem;
	}

	.eva-radio {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.4rem 0.65rem;
		background: #000000;
		border: 1.5px solid var(--eva-border);
		border-radius: 5px;
		cursor: pointer;
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--eva-text-muted);
		transition: all 100ms ease;
	}

	.eva-radio:hover {
		border-color: var(--eva-border-strong);
		color: var(--eva-primary);
	}

	.eva-radio.is-active {
		border-color: var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 1px;
		background: rgba(255, 148, 26, 0.1);
		color: var(--eva-primary);
		box-shadow: 0 0 10px var(--eva-primary-dim);
		text-shadow: var(--eva-bloom);
	}

	.eva-radio__native {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.eva-radio__diamond {
		width: 14px;
		height: 14px;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 3px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transform: rotate(45deg);
		flex-shrink: 0;
	}

	.eva-radio__core {
		width: 7px;
		height: 7px;
		background: var(--eva-border-strong);
		box-shadow: var(--eva-bloom);
	}

	.eva-radio__code {
		font-family: var(--eva-font-num);
		font-size: 0.76rem;
		font-weight: 700;
		padding: 0.04rem 0.36rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 3px;
		color: var(--eva-gold, #fff275);
	}

	.eva-radio__lbl {
		letter-spacing: 0.03em;
	}
</style>
