<svelte:options customElement={{ tag: 'eva-date-picker', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';
	import { evaTransition, type EvaTransitionOption } from '../transitions';

	interface Props {
		label?: string;
		value?: string;
		transition?: EvaTransitionOption;
	}

	let {
		label = 'OPERATION DATE',
		value = $bindable('2015-06-22'),
		transition = 'glitch'
	}: Props = $props();

	let open = $state(false);
	let rootEl: HTMLDivElement | null = null;
	let triggerEl: HTMLButtonElement | null = null;
	let pos = $state({ top: 0, left: 0 });

	let viewYear = $state(2015);
	let viewMonth = $state(5); // 0-indexed (5 = June)

	const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

	const daysInMonth = $derived(new Date(viewYear, viewMonth + 1, 0).getDate());
	const startOffset = $derived(new Date(viewYear, viewMonth, 1).getDay());

	function toggle() {
		if (!open && triggerEl) {
			const r = triggerEl.getBoundingClientRect();
			pos = { top: r.bottom + 4, left: Math.max(8, Math.min(window.innerWidth - 260, r.left)) };
		}
		open = !open;
	}

	function selectDay(day: number) {
		const m = String(viewMonth + 1).padStart(2, '0');
		const d = String(day).padStart(2, '0');
		value = `${viewYear}-${m}-${d}`;
		open = false;
	}

	function shiftMonth(delta: number) {
		const dt = new Date(viewYear, viewMonth + delta, 1);
		viewYear = dt.getFullYear();
		viewMonth = dt.getMonth();
	}

	onMount(() => {
		const onDoc = (e: MouseEvent) => {
			if (open && rootEl && !rootEl.contains(e.target as Node)) open = false;
		};
		document.addEventListener('click', onDoc);
		return () => document.removeEventListener('click', onDoc);
	});
</script>

<div class="eva-dp" bind:this={rootEl}>
	{#if label}
		<span class="eva-mono-label">{label}</span>
	{/if}
	<button type="button" class="eva-dp__btn" bind:this={triggerEl} onclick={toggle}>
		<span>{value}</span>
		<span class="dp-tag">CALENDAR ▾</span>
	</button>

	{#if open}
		<div
			class="eva-dp__pop"
			style="top: {pos.top}px; left: {pos.left}px;"
			transition:evaTransition={transition}
		>
			<div class="dp-head">
				<button type="button" class="dp-nav" onclick={() => shiftMonth(-1)}>◄</button>
				<span>{viewYear} // {monthNames[viewMonth]}</span>
				<button type="button" class="dp-nav" onclick={() => shiftMonth(1)}>►</button>
			</div>
			<div class="dp-grid">
				{#each ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as wd}
					<span class="dp-wd">{wd}</span>
				{/each}
				{#each Array.from({ length: startOffset }) as _}
					<span></span>
				{/each}
				{#each Array.from({ length: daysInMonth }) as _, i}
					{@const day = i + 1}
					{@const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
					<button
						type="button"
						class="dp-day"
						class:is-selected={value === iso}
						onclick={() => selectDay(day)}
					>
						{day}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.eva-dp {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.eva-dp__btn {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.42rem 0.65rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		color: var(--eva-primary);
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.95rem;
		font-weight: 700;
		text-shadow: var(--eva-bloom);
		cursor: pointer;
	}

	.dp-tag {
		font-family: var(--eva-font-display);
		font-size: 0.76rem;
		color: var(--eva-gold, #fff275);
	}

	.eva-dp__pop {
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

	.dp-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.35rem 0.5rem;
		background: #000000;
		border-bottom: 1.5px solid var(--eva-border-strong);
		color: var(--eva-primary);
		font-family: var(--eva-font-num);
		font-size: 0.9rem;
		font-weight: 700;
	}

	.dp-nav {
		background: #000000;
		color: var(--eva-primary);
		border: 1px solid var(--eva-border-strong);
		border-radius: 3px;
		padding: 0.08rem 0.42rem;
		cursor: pointer;
	}

	.dp-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 3px;
		padding: 6px;
		text-align: center;
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
	}

	.dp-wd {
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--eva-gold, #fff275);
		padding-bottom: 3px;
	}

	.dp-day {
		padding: 0.22rem 0;
		background: #000000;
		border: 1px solid rgba(255, 148, 26, 0.25);
		border-radius: 3px;
		color: var(--eva-primary);
		font-family: var(--eva-font-num);
		font-size: 0.84rem;
		font-weight: 700;
		cursor: pointer;
	}

	.dp-day:hover {
		border-color: var(--eva-border-strong);
		background: var(--eva-primary-dim);
	}

	.dp-day.is-selected {
		background: var(--eva-primary);
		color: #000000;
		font-weight: 700;
	}
</style>
