<svelte:options customElement={{ tag: 'eva-multi-select', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';
	import { evaTransition, type EvaTransitionOption } from '../transitions';

	interface Props {
		label?: string;
		options?: string[];
		selected?: string[];
		transition?: EvaTransitionOption;
	}

	let {
		label = 'ASSIGNED EVA UNITS // MULTISELECT',
		options = ['UNIT-00', 'UNIT-01', 'UNIT-02', 'UNIT-03', 'UNIT-04', 'MP-SERIES'],
		selected = $bindable(['UNIT-01', 'UNIT-02']),
		transition = 'glitch'
	}: Props = $props();

	let open = $state(false);
	let rootEl: HTMLDivElement | null = null;
	let boxEl: HTMLDivElement | null = null;
	let pos = $state({ top: 0, left: 0, width: 200 });

	function toggleOpen() {
		if (!open && boxEl) {
			const r = boxEl.getBoundingClientRect();
			pos = { top: r.bottom + 2, left: r.left, width: r.width };
		}
		open = !open;
	}

	function toggleItem(item: string) {
		selected = selected.includes(item)
			? selected.filter((x) => x !== item)
			: [...selected, item];
	}

	onMount(() => {
		const onDoc = (e: MouseEvent) => {
			if (open && rootEl && !rootEl.contains(e.target as Node)) open = false;
		};
		document.addEventListener('click', onDoc);
		return () => document.removeEventListener('click', onDoc);
	});
</script>

<div class="eva-ms" bind:this={rootEl}>
	{#if label}
		<span class="eva-mono-label">{label}</span>
	{/if}
	<div
		class="eva-ms__box"
		bind:this={boxEl}
		role="button"
		tabindex="0"
		onclick={toggleOpen}
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleOpen()}
	>
		<div class="eva-ms__chips">
			{#if selected.length === 0}
				<span class="eva-ms__empty">SELECT UNITS...</span>
			{:else}
				{#each selected as item}
					<span class="eva-ms__chip">
						<span>{item}</span>
						<button
							type="button"
							class="chip-x"
							onclick={(e) => {
								e.stopPropagation();
								toggleItem(item);
							}}
						>
							×
						</button>
					</span>
				{/each}
			{/if}
		</div>
		<span class="eva-ms__arrow">{open ? '▲' : '▼'}</span>
	</div>

	{#if open}
		<ul
			class="eva-ms__menu"
			style="top: {pos.top}px; left: {pos.left}px; width: {pos.width}px;"
			role="listbox"
			transition:evaTransition={transition}
		>
			{#each options as opt}
				{@const isOn = selected.includes(opt)}
				<li>
					<button
						type="button"
						class="eva-ms__opt"
						class:is-on={isOn}
						onclick={() => toggleItem(opt)}
					>
						<span>{isOn ? '[■]' : '[ ]'} {opt}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.eva-ms {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.eva-ms__box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.35rem 0.6rem;
		min-height: 36px;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		cursor: pointer;
	}

	.eva-ms__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.32rem;
	}

	.eva-ms__empty {
		font-family: var(--eva-font-display);
		font-size: 0.84rem;
		color: var(--eva-text-muted);
	}

	.eva-ms__chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.08rem 0.44rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 4px;
		color: var(--eva-primary);
		font-family: var(--eva-font-num);
		font-size: 0.78rem;
		font-weight: 700;
		text-shadow: var(--eva-bloom);
	}

	.chip-x {
		background: transparent;
		border: none;
		color: var(--eva-accent);
		font-weight: 700;
		cursor: pointer;
		padding: 0;
	}

	.eva-ms__arrow {
		font-size: 0.66rem;
		color: var(--eva-gold, #fff275);
	}

	.eva-ms__menu {
		position: fixed;
		z-index: 9999;
		margin: 0;
		padding: 0;
		list-style: none;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 1px;
		border-radius: 5px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.92), 0 0 12px var(--eva-primary-dim);
	}

	.eva-ms__opt {
		width: 100%;
		padding: 0.42rem 0.65rem;
		background: #000000;
		border: none;
		border-bottom: 1px solid rgba(255, 148, 26, 0.22);
		font-family: var(--eva-font-display);
		font-size: 0.86rem;
		font-weight: 700;
		color: var(--eva-primary);
		text-align: left;
		cursor: pointer;
	}

	.eva-ms__opt.is-on {
		color: #46f76a;
		background: rgba(70, 247, 106, 0.1);
		text-shadow: 0 0 6px rgba(70, 247, 106, 0.45);
	}

	.eva-ms__opt:hover {
		background: var(--eva-primary-dim);
	}
</style>
