<svelte:options customElement={{ tag: 'eva-select', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';
	import { evaTransition, type EvaTransitionOption } from '../transitions';

	interface Props {
		label?: string;
		options?: { value: string; label: string }[];
		value?: string;
		transition?: EvaTransitionOption;
	}

	const defaultOptions = [
		{ value: 'cage-01', label: 'CAGE BAY 01 // UNIT-01' },
		{ value: 'cage-02', label: 'CAGE BAY 02 // UNIT-02' },
		{ value: 'dogma', label: 'TERMINAL DOGMA // LILITH' }
	];

	let {
		label = 'DEPLOYMENT SECTOR',
		options = defaultOptions,
		value = $bindable(options[0]?.value ?? ''),
		transition = 'glitch'
	}: Props = $props();

	let open = $state(false);
	let rootEl: HTMLDivElement | null = null;
	let triggerEl: HTMLButtonElement | null = null;
	let menuPos = $state({ top: 0, left: 0, width: 200 });

	const currentLabel = $derived(
		options.find((o) => o.value === value)?.label ?? options[0]?.label ?? ''
	);

	function updatePosition() {
		if (!triggerEl) return;
		const r = triggerEl.getBoundingClientRect();
		menuPos = { top: r.bottom + 2, left: r.left, width: r.width };
	}

	function toggleOpen() {
		if (!open) updatePosition();
		open = !open;
	}

	onMount(() => {
		const onDocClick = (e: MouseEvent) => {
			if (open && rootEl && !rootEl.contains(e.target as Node)) {
				open = false;
			}
		};
		const onScrollOrResize = () => {
			if (open) updatePosition();
		};
		document.addEventListener('click', onDocClick);
		window.addEventListener('scroll', onScrollOrResize, true);
		window.addEventListener('resize', onScrollOrResize);
		return () => {
			document.removeEventListener('click', onDocClick);
			window.removeEventListener('scroll', onScrollOrResize, true);
			window.removeEventListener('resize', onScrollOrResize);
		};
	});

	function selectOption(val: string) {
		value = val;
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		} else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			const idx = options.findIndex((o) => o.value === value);
			const nextIdx =
				e.key === 'ArrowDown'
					? (idx + 1) % options.length
					: (idx - 1 + options.length) % options.length;
			value = options[nextIdx].value;
		}
	}
</script>

<div class="eva-sel" bind:this={rootEl}>
	{#if label}
		<span class="eva-mono-label">{label}</span>
	{/if}
	<button
		type="button"
		class="eva-sel__trigger"
		bind:this={triggerEl}
		aria-haspopup="listbox"
		aria-expanded={open}
		onclick={toggleOpen}
		onkeydown={handleKeydown}
	>
		<span class="eva-sel__val">{currentLabel}</span>
		<span class="eva-sel__arrow" aria-hidden="true">{open ? '▲' : '▼'}</span>
	</button>

	{#if open}
		<ul
			class="eva-sel__menu"
			role="listbox"
			style="top: {menuPos.top}px; left: {menuPos.left}px; width: {menuPos.width}px;"
			transition:evaTransition={transition}
		>
			{#each options as opt (opt.value)}
				{@const selected = opt.value === value}
				<li role="option" aria-selected={selected}>
					<button
						type="button"
						class="eva-sel__opt"
						class:is-selected={selected}
						onclick={() => selectOption(opt.value)}
					>
						<span>{opt.label}</span>
						{#if selected}
							<span class="eva-sel__mark">■</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.eva-sel {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.eva-sel__trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		width: 100%;
		padding: 0.42rem 0.65rem;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		background: #000000;
		font-family: var(--eva-font-display);
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--eva-primary);
		letter-spacing: 0.03em;
		text-shadow: var(--eva-bloom);
		cursor: pointer;
		text-align: left;
	}

	.eva-sel__trigger:hover {
		background: var(--eva-primary-dim);
	}

	.eva-sel__arrow {
		font-size: 0.68rem;
		color: var(--eva-gold, #fff275);
	}

	.eva-sel__menu {
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

	.eva-sel__opt {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.42rem 0.65rem;
		background: #000000;
		border: none;
		border-bottom: 1px solid rgba(255, 148, 26, 0.22);
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--eva-primary);
		letter-spacing: 0.03em;
		cursor: pointer;
		text-align: left;
	}

	.eva-sel__opt:hover {
		background: var(--eva-primary-dim);
	}

	.eva-sel__opt.is-selected {
		background: var(--eva-primary);
		color: #000000;
		font-weight: 700;
	}

	.eva-sel__mark {
		font-size: 0.6rem;
	}
</style>
