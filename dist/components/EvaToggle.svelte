<svelte:options customElement={{ tag: 'eva-toggle', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		checked?: boolean;
		label?: string;
		onLabel?: string;
		offLabel?: string;
	}

	let {
		checked = $bindable(true),
		label = 'UMBILICAL LOCK',
		onLabel = 'ENGAGED',
		offLabel = 'RELEASED'
	}: Props = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	class="eva-switch"
	class:is-on={checked}
	onclick={() => (checked = !checked)}
>
	<span class="eva-switch__lbl">{label}</span>
	<!-- SEQ_085 STOP/RACING style dual indicator cells with bottom bars -->
	<span class="eva-switch__cells">
		<span class="sw-cell" class:is-active={!checked} class:is-off={!checked}>
			<span class="sw-cell__lbl">{offLabel}</span>
			<span class="sw-cell__bar"></span>
		</span>
		<span class="sw-cell" class:is-active={checked} class:is-on={checked}>
			<span class="sw-cell__lbl">{onLabel}</span>
			<span class="sw-cell__bar"></span>
		</span>
	</span>
</button>

<style>
	.eva-switch {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		width: 100%;
		padding: 0.36rem 0.6rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		color: var(--eva-primary);
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		cursor: pointer;
	}

	.eva-switch__lbl {
		letter-spacing: 0.04em;
		font-weight: 700;
		text-shadow: var(--eva-bloom);
	}

	.eva-switch__cells {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 5px;
	}

	.sw-cell {
		min-width: 68px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 0.1rem 0.5rem;
		border: 1.5px solid rgba(255, 148, 26, 0.28);
		border-radius: 4px;
		opacity: 0.38;
	}

	.sw-cell.is-active {
		opacity: 1;
		border-color: var(--eva-border-strong);
	}

	.sw-cell.is-active.is-on {
		border-color: #46f76a;
		box-shadow: 0 0 8px rgba(70, 247, 106, 0.4);
	}

	.sw-cell.is-active.is-off {
		border-color: #ff2222;
		box-shadow: 0 0 8px rgba(255, 34, 34, 0.4);
	}

	.sw-cell__lbl {
		font-family: var(--eva-font-display);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--eva-text-hi);
	}

	.sw-cell.is-active.is-on .sw-cell__lbl {
		color: #46f76a;
	}

	.sw-cell.is-active.is-off .sw-cell__lbl {
		color: #ff2222;
	}

	.sw-cell__bar {
		height: 3px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.15);
	}

	.sw-cell.is-active.is-on .sw-cell__bar {
		background: #46f76a;
	}

	.sw-cell.is-active.is-off .sw-cell__bar {
		background: #ff2222;
	}
</style>
