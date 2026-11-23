<svelte:options customElement={{ tag: 'eva-filter-chips', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		chips?: string[];
		active?: string[];
	}

	let {
		chips = ['MAGI-01', 'PATTERN BLUE', 'A.T. FIELD', 'LCL NOMINAL', 'DUMMY PLUG'],
		active = $bindable(['MAGI-01', 'A.T. FIELD'])
	}: Props = $props();

	function toggle(chip: string) {
		active = active.includes(chip) ? active.filter((c) => c !== chip) : [...active, chip];
	}
</script>

<div class="eva-chips" role="group" aria-label="Filter Chips">
	{#each chips as chip (chip)}
		{@const isOn = active.includes(chip)}
		<button type="button" class="eva-chip" class:is-on={isOn} onclick={() => toggle(chip)}>
			<svg viewBox="0 0 5 13" class="chip-dot" aria-hidden="true">
				<rect x="0" y="0" width="5" height="13" rx="1" fill="currentColor" />
			</svg>
			<span>{chip}</span>
		</button>
	{/each}
</div>

<style>
	.eva-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.eva-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.2rem 0.65rem;
		background: #000000;
		border: 1.5px solid var(--eva-border);
		border-radius: 4px;
		color: var(--eva-text-muted);
		font-family: var(--eva-font-display);
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		cursor: pointer;
	}

	.eva-chip.is-on {
		border-color: var(--eva-border-strong);
		outline: 1px solid var(--eva-border-strong);
		outline-offset: 1px;
		background: rgba(255, 148, 26, 0.16);
		color: var(--eva-primary-bright, #ffb833);
		box-shadow:
			0 0 12px rgba(255, 148, 26, 0.34),
			inset 0 0 10px rgba(255, 148, 26, 0.14);
		text-shadow:
			0 0 8px rgba(255, 148, 26, 0.75),
			0 0 2px rgba(255, 210, 120, 0.65);
	}

	.chip-dot {
		position: relative;
		z-index: 3;
		display: block;
		width: 5px;
		height: 13px;
		flex-shrink: 0;
		color: inherit;
		overflow: visible;
	}

	.eva-chip.is-on .chip-dot {
		filter: drop-shadow(0 0 4px var(--eva-primary));
	}

	:global([data-eva-theme='nerv']) .eva-chip.is-on .chip-dot,
	:global(:root:not([data-eva-theme])) .eva-chip.is-on .chip-dot {
		color: var(--eva-gold, #fff275);
		filter: drop-shadow(0 0 3px #fff275) drop-shadow(0 0 7px rgba(255, 242, 117, 0.75));
	}
</style>
