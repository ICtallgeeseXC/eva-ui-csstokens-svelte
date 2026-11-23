<svelte:options customElement={{ tag: 'eva-combo-box', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';
	import { evaTransition, type EvaTransitionOption } from '../transitions';

	interface Props {
		label?: string;
		options?: string[];
		value?: string;
		placeholder?: string;
		transition?: EvaTransitionOption;
	}

	let {
		label = 'ANGEL DESIGNATION // COMBO',
		options = ['SACHIEL-03', 'SHAMSHEL-04', 'RAMIEL-05', 'GAGHIEL-06', 'ISRAFEL-07', 'MATARAEL-09'],
		value = $bindable('RAMIEL-05'),
		placeholder = 'TYPE OR SELECT...',
		transition = 'glitch'
	}: Props = $props();

	let open = $state(false);
	let rootEl: HTMLDivElement | null = null;
	let boxEl: HTMLDivElement | null = null;
	let pos = $state({ top: 0, left: 0, width: 200 });

	const filtered = $derived(
		options.filter((o) => o.toLowerCase().includes(value.trim().toLowerCase()))
	);

	function updatePos() {
		if (!boxEl) return;
		const r = boxEl.getBoundingClientRect();
		pos = { top: r.bottom + 2, left: r.left, width: r.width };
	}

	onMount(() => {
		const onDoc = (e: MouseEvent) => {
			if (open && rootEl && !rootEl.contains(e.target as Node)) open = false;
		};
		document.addEventListener('click', onDoc);
		return () => document.removeEventListener('click', onDoc);
	});
</script>

<div class="eva-cbx" bind:this={rootEl}>
	{#if label}
		<span class="eva-mono-label">{label}</span>
	{/if}
	<div class="eva-cbx__box" bind:this={boxEl}>
		<input
			type="text"
			class="eva-cbx__input"
			{placeholder}
			bind:value
			onfocus={() => {
				updatePos();
				open = true;
			}}
			oninput={() => {
				updatePos();
				open = true;
			}}
		/>
		<button
			type="button"
			class="eva-cbx__btn"
			aria-label="Toggle options"
			onclick={() => {
				updatePos();
				open = !open;
			}}
		>
			{open ? '▲' : '▼'}
		</button>
	</div>

	{#if open && filtered.length > 0}
		<ul
			class="eva-cbx__menu"
			style="top: {pos.top}px; left: {pos.left}px; width: {pos.width}px;"
			role="listbox"
			transition:evaTransition={transition}
		>
			{#each filtered as opt}
				<li role="option" aria-selected={value === opt}>
					<button
						type="button"
						class="eva-cbx__opt"
						class:is-selected={value === opt}
						onclick={() => {
							value = opt;
							open = false;
						}}
					>
						{opt}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.eva-cbx {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.eva-cbx__box {
		display: flex;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		overflow: hidden;
		background: #000000;
	}

	.eva-cbx__input {
		flex: 1;
		min-width: 0;
		padding: 0.42rem 0.65rem;
		background: #000000;
		border: none;
		outline: none;
		font-family: var(--eva-font-display);
		font-size: 0.92rem;
		font-weight: 700;
		color: var(--eva-primary);
	}

	.eva-cbx__btn {
		padding: 0 0.65rem;
		background: #000000;
		border: none;
		border-left: 1.5px solid var(--eva-border-strong);
		color: var(--eva-primary);
		font-size: 0.7rem;
		cursor: pointer;
	}

	.eva-cbx__menu {
		position: fixed;
		z-index: 9999;
		margin: 0;
		padding: 0;
		list-style: none;
		max-height: 180px;
		overflow-y: auto;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 1px;
		border-radius: 5px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.92);
	}

	.eva-cbx__opt {
		width: 100%;
		padding: 0.4rem 0.65rem;
		background: #000000;
		border: none;
		border-bottom: 1px solid rgba(255, 148, 26, 0.22);
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--eva-primary);
		text-align: left;
		cursor: pointer;
	}

	.eva-cbx__opt:hover,
	.eva-cbx__opt.is-selected {
		background: var(--eva-primary);
		color: #000000;
		font-weight: 700;
	}
</style>
