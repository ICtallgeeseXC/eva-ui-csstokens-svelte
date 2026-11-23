<svelte:options customElement={{ tag: 'eva-mode-strip', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		modes?: string[];
		active?: string;
		dangerMode?: string;
		critical?: boolean;
		interactive?: boolean;
		onSelect?: (mode: string) => void;
	}

	let {
		modes = ['STOP', 'SLOW', 'NORMAL', 'RACING'],
		active = $bindable('RACING'),
		dangerMode = 'RACING',
		critical = false,
		interactive = false,
		onSelect
	}: Props = $props();

	function pick(mode: string) {
		if (!interactive) return;
		active = mode;
		onSelect?.(mode);
	}
</script>

<div
	class="eva-mode-strip"
	class:is-critical={critical}
	role={interactive ? 'radiogroup' : 'group'}
	aria-label="Power Draw Mode"
>
	{#each modes as m (m)}
		{@const isOn = active === m}
		{@const isDanger = m === dangerMode}
		{#if interactive}
			<button
				type="button"
				role="radio"
				aria-checked={isOn}
				class="mode-cell is-clickable"
				class:is-active={isOn}
				class:is-racing={isDanger}
				onclick={() => pick(m)}
			>
				<span class="mode-cell__lbl">{m}</span>
				<span class="mode-cell__bar"></span>
			</button>
		{:else}
			<div class="mode-cell" class:is-active={isOn} class:is-racing={isDanger}>
				<span class="mode-cell__lbl">{m}</span>
				<span class="mode-cell__bar"></span>
			</div>
		{/if}
	{/each}
</div>

<style>
	.eva-mode-strip {
		--m-color: var(--eva-mode-color, #ff941a);
		--m-red: #ff2222;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(56px, 1fr));
		gap: 0.45rem;
		flex: 1;
	}

	.eva-mode-strip.is-critical {
		--m-color: #ff2222;
	}

	.mode-cell {
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: #000000;
		border: 1.5px solid rgba(255, 148, 26, 0.35);
		border-radius: 4px;
		padding: 0.14rem 0.35rem;
		opacity: 0.42;
		text-align: center;
	}

	.mode-cell.is-clickable {
		cursor: pointer;
		transition:
			opacity 100ms ease,
			border-color 100ms ease,
			box-shadow 100ms ease;
	}

	.mode-cell.is-clickable:hover {
		opacity: 0.85;
		border-color: var(--m-color);
	}

	.mode-cell.is-active {
		opacity: 1;
		border-color: var(--m-color);
		box-shadow: 0 0 8px color-mix(in srgb, var(--m-color) 28%, transparent);
	}

	.mode-cell.is-active.is-racing {
		border-color: var(--m-red);
		box-shadow: 0 0 8px rgba(255, 34, 34, 0.4);
	}

	.mode-cell__lbl {
		font-family: var(--eva-font-display);
		font-size: 0.76rem;
		font-weight: 700;
		color: var(--m-color);
		text-align: center;
	}

	.mode-cell__bar {
		width: 100%;
		height: 4px;
		border-radius: 999px;
		background: rgba(255, 148, 26, 0.18);
	}

	.mode-cell.is-active .mode-cell__bar {
		background: var(--m-color);
	}

	.mode-cell.is-active.is-racing .mode-cell__bar {
		background: var(--m-red);
	}
</style>
