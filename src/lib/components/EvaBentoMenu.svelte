<svelte:options customElement={{ tag: 'eva-bento-menu', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';
	import { evaTransition, type EvaTransitionOption } from '../transitions';

	export interface BentoItem {
		id: string;
		code: string;
		label: string;
	}

	interface Props {
		items?: BentoItem[];
		transition?: EvaTransitionOption;
		onSelect?: (item: BentoItem) => void;
	}

	const defaultItems: BentoItem[] = [
		{ id: 'magi', code: 'M-01', label: 'MAGI CORE' },
		{ id: 'sync', code: 'S-02', label: 'SYNC TEST' },
		{ id: 'power', code: 'P-03', label: 'POWER GRID' },
		{ id: 'radar', code: 'R-04', label: 'AT-RADAR' },
		{ id: 'bio', code: 'B-05', label: 'LCL PLANT' },
		{ id: 'cage', code: 'C-06', label: 'CAGE BAY' }
	];

	let { items = defaultItems, transition = 'glitch', onSelect }: Props = $props();

	let open = $state(false);
	let rootEl: HTMLDivElement | null = null;
	let btnEl: HTMLButtonElement | null = null;
	let pos = $state({ top: 0, left: 0 });

	function updatePos() {
		if (!btnEl) return;
		const r = btnEl.getBoundingClientRect();
		pos = { top: r.bottom + 4, left: Math.max(8, Math.min(window.innerWidth - 260, r.left)) };
	}

	function toggle() {
		if (!open) updatePos();
		open = !open;
	}

	onMount(() => {
		const onDoc = (e: MouseEvent) => {
			if (open && rootEl && !rootEl.contains(e.target as Node)) open = false;
		};
		document.addEventListener('click', onDoc);
		return () => document.removeEventListener('click', onDoc);
	});
</script>

<div class="eva-bento" bind:this={rootEl}>
	<button
		type="button"
		class="eva-bento__btn"
		bind:this={btnEl}
		aria-expanded={open}
		aria-label="Bento Menu"
		onclick={toggle}
	>
		<svg viewBox="0 0 18 18" class="eva-bento__ico" aria-hidden="true">
			{#each [0, 1, 2] as r}
				{#each [0, 1, 2] as c}
					<rect x={1 + c * 6} y={1 + r * 6} width="4" height="4" fill="currentColor" />
				{/each}
			{/each}
		</svg>
		<span>MODULES</span>
	</button>

	{#if open}
		<div
			class="eva-bento__pop"
			style="top: {pos.top}px; left: {pos.left}px;"
			transition:evaTransition={transition}
		>
			<div class="eva-bento__head">NERV // MODULE MATRIX</div>
			<div class="eva-bento__grid">
				{#each items as item (item.id)}
					<button
						type="button"
						class="eva-bento__tile"
						onclick={() => {
							open = false;
							onSelect?.(item);
						}}
					>
						<span class="tile-code">{item.code}</span>
						<span class="tile-lbl">{item.label}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.eva-bento {
		display: inline-block;
	}

	.eva-bento__btn {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.34rem 0.72rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		color: var(--eva-primary);
		font-family: var(--eva-font-display);
		font-size: 0.84rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-shadow: var(--eva-bloom);
		cursor: pointer;
	}

	.eva-bento__btn:hover {
		background: var(--eva-primary);
		color: #000000;
		text-shadow: none;
	}

	.eva-bento__ico {
		width: 14px;
		height: 14px;
	}

	.eva-bento__pop {
		position: fixed;
		z-index: 9999;
		width: 248px;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		box-shadow: 0 10px 28px rgba(0, 0, 0, 0.92), 0 0 14px var(--eva-primary-dim);
	}

	.eva-bento__head {
		padding: 0.32rem 0.6rem;
		background: #000000;
		border-bottom: 1.5px solid var(--eva-border-strong);
		color: var(--eva-primary);
		font-family: var(--eva-font-display);
		font-size: 0.84rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-shadow: var(--eva-bloom);
	}

	.eva-bento__grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 5px;
		padding: 7px;
	}

	.eva-bento__tile {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.16rem;
		padding: 0.42rem 0.5rem;
		background: #000000;
		border: 1.5px solid var(--eva-border);
		border-radius: 4px;
		color: var(--eva-primary);
		font-family: var(--eva-font-display);
		cursor: pointer;
		text-align: left;
	}

	.eva-bento__tile:hover {
		border-color: var(--eva-border-strong);
		background: var(--eva-primary-dim);
	}

	.tile-code {
		font-family: var(--eva-font-num);
		font-size: 0.72rem;
		color: var(--eva-gold, #fff275);
		font-weight: 700;
	}

	.tile-lbl {
		font-size: 0.84rem;
		font-weight: 700;
	}
</style>
