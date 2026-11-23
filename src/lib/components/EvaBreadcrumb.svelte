<svelte:options customElement={{ tag: 'eva-breadcrumb', shadow: 'none' }} />

<script lang="ts">
	export interface BreadcrumbItem {
		id: string;
		label: string;
	}

	interface Props {
		items?: BreadcrumbItem[];
		activeId?: string;
		startIndex?: number;
		onNavigate?: (id: string) => void;
	}

	const defaultItems: BreadcrumbItem[] = [
		{ id: 'hq', label: 'NERV HQ' },
		{ id: 'dogma', label: 'CENTRAL DOGMA' },
		{ id: 'cage', label: 'CAGE BAY 01' },
		{ id: 'plug', label: 'ENTRY PLUG' }
	];

	let {
		items = defaultItems,
		activeId = $bindable(items[items.length - 1]?.id ?? ''),
		startIndex = 1,
		onNavigate
	}: Props = $props();

	function go(id: string) {
		activeId = id;
		onNavigate?.(id);
	}
</script>

<nav class="eva-bc" aria-label="Breadcrumb">
	{#each items as item, idx (item.id)}
		{@const active = activeId === item.id}
		<button
			type="button"
			class="eva-bc__step"
			class:is-active={active}
			aria-current={active ? 'page' : undefined}
			onclick={() => go(item.id)}
		>
			<span class="eva-bc__idx">{String(idx + startIndex).padStart(2, '0')}</span>
			<span class="eva-bc__lbl">{item.label}</span>
		</button>
	{/each}
</nav>

<style>
	.eva-bc {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 0.38rem 0.45rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		box-shadow: 0 0 10px var(--eva-primary-dim);
	}

	.eva-bc__step {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.2rem 0.7rem;
		background: #000000;
		border: 1.5px solid var(--eva-border);
		border-radius: 4px;
		font-family: var(--eva-font-display);
		font-size: 0.84rem;
		font-weight: 700;
		color: var(--eva-primary);
		letter-spacing: 0.03em;
		text-transform: uppercase;
		cursor: pointer;
	}

	.eva-bc__step:hover {
		color: var(--eva-gold, #fff275);
		border-color: var(--eva-border-strong);
		box-shadow: 0 0 8px var(--eva-primary-dim);
	}

	.eva-bc__step.is-active {
		background: var(--eva-primary);
		border-color: var(--eva-primary);
		color: #000000;
		box-shadow: 0 0 10px var(--eva-primary-dim);
	}

	.eva-bc__idx {
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.78rem;
		color: var(--eva-gold, #fff275);
	}

	.eva-bc__step.is-active .eva-bc__idx {
		color: #000000;
	}
</style>
