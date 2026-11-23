<svelte:options customElement={{ tag: 'eva-action-menu', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';
	import { evaTransition, type EvaTransitionOption } from '../transitions';

	interface Props {
		variant?: 'hamburger' | 'kebab' | 'meatballs';
		items?: string[];
		transition?: EvaTransitionOption;
		onSelect?: (item: string) => void;
	}

	let {
		variant = 'hamburger',
		items = ['INSPECT TELEMETRY', 'LOCK SECTOR', 'EXPORT LOGS', 'PURGE CACHE'],
		transition = 'glitch',
		onSelect
	}: Props = $props();

	let open = $state(false);
	let rootEl: HTMLDivElement | null = null;
	let btnEl: HTMLButtonElement | null = null;
	let pos = $state({ top: 0, left: 0 });

	function toggle() {
		if (!open && btnEl) {
			const r = btnEl.getBoundingClientRect();
			pos = { top: r.bottom + 4, left: Math.max(8, Math.min(window.innerWidth - 190, r.left)) };
		}
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

<div class="eva-act-menu" bind:this={rootEl}>
	<button
		type="button"
		class="eva-act-menu__btn"
		bind:this={btnEl}
		aria-expanded={open}
		aria-label="{variant} menu"
		onclick={toggle}
	>
		{#if variant === 'hamburger'}
			<svg viewBox="0 0 18 18" class="ico" aria-hidden="true">
				<rect x="2" y="3" width="14" height="2.2" fill="currentColor" />
				<rect x="2" y="8" width="14" height="2.2" fill="currentColor" />
				<rect x="2" y="13" width="14" height="2.2" fill="currentColor" />
			</svg>
		{:else if variant === 'kebab'}
			<svg viewBox="0 0 18 18" class="ico" aria-hidden="true">
				<rect x="7.5" y="2" width="3" height="3" fill="currentColor" />
				<rect x="7.5" y="7.5" width="3" height="3" fill="currentColor" />
				<rect x="7.5" y="13" width="3" height="3" fill="currentColor" />
			</svg>
		{:else}
			<svg viewBox="0 0 18 18" class="ico" aria-hidden="true">
				<rect x="2" y="7.5" width="3" height="3" fill="currentColor" />
				<rect x="7.5" y="7.5" width="3" height="3" fill="currentColor" />
				<rect x="13" y="7.5" width="3" height="3" fill="currentColor" />
			</svg>
		{/if}
	</button>

	{#if open}
		<ul
			class="eva-act-menu__list"
			style="top: {pos.top}px; left: {pos.left}px;"
			role="menu"
			transition:evaTransition={transition}
		>
			{#each items as item}
				<li role="menuitem">
					<button
						type="button"
						class="eva-act-menu__item"
						onclick={() => {
							open = false;
							onSelect?.(item);
						}}
					>
						<span>▸</span>
						<span>{item}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.eva-act-menu {
		display: inline-block;
	}

	.eva-act-menu__btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 32px;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		color: var(--eva-primary);
		cursor: pointer;
	}

	.eva-act-menu__btn:hover {
		background: var(--eva-primary);
		color: #000000;
	}

	.ico {
		width: 16px;
		height: 16px;
	}

	.eva-act-menu__list {
		position: fixed;
		z-index: 9999;
		margin: 0;
		padding: 0;
		list-style: none;
		min-width: 185px;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 1px;
		border-radius: 5px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.92), 0 0 12px var(--eva-primary-dim);
	}

	.eva-act-menu__item {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		width: 100%;
		padding: 0.42rem 0.65rem;
		background: #000000;
		border: none;
		border-bottom: 1px solid rgba(255, 148, 26, 0.22);
		color: var(--eva-primary);
		font-family: var(--eva-font-display);
		font-size: 0.84rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		text-align: left;
		cursor: pointer;
	}

	.eva-act-menu__item:hover {
		background: var(--eva-primary);
		color: #000000;
	}
</style>
