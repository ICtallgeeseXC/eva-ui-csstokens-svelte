<svelte:options customElement={{ tag: 'eva-checkbox', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		checked?: boolean;
		label?: string;
		code?: string;
		disabled?: boolean;
	}

	let {
		checked = $bindable(true),
		label = 'A.T. FIELD NEUTRALIZER',
		code = 'CHK-01',
		disabled = false
	}: Props = $props();
</script>

<label class="eva-chk" class:is-checked={checked} class:is-disabled={disabled}>
	<input type="checkbox" bind:checked {disabled} class="eva-chk__native" />
	<span class="eva-chk__oct" aria-hidden="true">
		<span class="eva-chk__oct-in">
			{checked ? 'ON' : 'OFF'}
		</span>
	</span>
	<span class="eva-chk__lbl">{label}</span>
	{#if code}
		<span class="eva-chk__code">{code}</span>
	{/if}
</label>

<style>
	.eva-chk {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.38rem 0.6rem;
		background: #000000;
		border: 1.5px solid var(--eva-border);
		border-radius: 5px;
		cursor: pointer;
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--eva-text-muted);
	}

	.eva-chk.is-checked {
		border-color: var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 1px;
		color: var(--eva-primary);
		box-shadow: 0 0 10px var(--eva-primary-dim);
		text-shadow: var(--eva-bloom);
	}

	.eva-chk.is-disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.eva-chk__native {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.eva-chk__oct {
		flex-shrink: 0;
	}

	.eva-chk__oct-in {
		display: block;
		padding: 0.1rem 0.45rem;
		font-family: var(--eva-font-num);
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		background: #000000;
		color: var(--eva-primary);
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 4px;
	}

	.eva-chk.is-checked .eva-chk__oct-in {
		background: #000000;
		border-color: #46f76a;
		color: #46f76a;
		box-shadow: 0 0 8px rgba(70, 247, 106, 0.45);
		text-shadow: 0 0 6px rgba(70, 247, 106, 0.5);
	}

	.eva-chk__lbl {
		flex: 1;
		letter-spacing: 0.03em;
	}

	.eva-chk__code {
		font-family: var(--eva-font-num);
		font-size: 0.74rem;
		font-weight: 700;
		padding: 0.04rem 0.36rem;
		border: 1px solid var(--eva-border);
		border-radius: 3px;
		color: var(--eva-gold, #fff275);
	}
</style>
