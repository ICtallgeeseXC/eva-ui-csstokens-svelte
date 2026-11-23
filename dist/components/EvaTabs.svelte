<svelte:options customElement={{ tag: 'eva-tabs', shadow: 'none' }} />

<script lang="ts">
	export interface EvaTabItem {
		id: string;
		label: string;
		badge?: string | number;
	}

	interface Props {
		tabs?: EvaTabItem[];
		activeId?: string;
		onChange?: (id: string) => void;
	}

	const defaultTabs: EvaTabItem[] = [
		{ id: 'overview', label: 'TELEMETRY', badge: 'LIVE' },
		{ id: 'magi', label: 'MAGI LOGS', badge: 3 },
		{ id: 'power', label: 'POWER GRID' }
	];

	let {
		tabs = defaultTabs,
		activeId = $bindable(tabs[0]?.id ?? ''),
		onChange
	}: Props = $props();

	function selectTab(id: string) {
		activeId = id;
		onChange?.(id);
	}
</script>

<div class="eva-tabs" role="tablist">
	{#each tabs as tab (tab.id)}
		<button
			type="button"
			role="tab"
			aria-selected={activeId === tab.id}
			class="eva-tab"
			class:is-active={activeId === tab.id}
			onclick={() => selectTab(tab.id)}
		>
			<span>{tab.label}</span>
			{#if tab.badge !== undefined}
				<span class="eva-tab__badge eva-num">{tab.badge}</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.eva-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		border-bottom: 1.5px solid var(--eva-border-strong);
		padding-bottom: 0.4rem;
	}

	.eva-tab {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.34rem 0.82rem;
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		background: #000000;
		color: var(--eva-primary);
		border: 1.5px solid var(--eva-border);
		outline: 1px solid rgba(255, 148, 26, 0.25);
		outline-offset: 1px;
		border-radius: 4px;
		text-shadow: var(--eva-bloom);
		cursor: pointer;
		transition: all 100ms ease;
	}

	.eva-tab:hover {
		border-color: var(--eva-border-strong);
		background: var(--eva-primary-dim);
	}

	.eva-tab.is-active {
		background: var(--eva-primary);
		color: #000000;
		border-color: var(--eva-primary);
		outline-color: var(--eva-primary);
		text-shadow: none;
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.eva-tab__badge {
		font-size: 0.74rem;
		padding: 0.04rem 0.38rem;
		border-radius: 3px;
		background: #000000;
		color: var(--eva-gold, #fff275);
		border: 1px solid var(--eva-gold, #fff275);
		text-shadow: none;
	}

	.eva-tab.is-active .eva-tab__badge {
		background: #000000;
		color: var(--eva-primary);
		border-color: #000000;
	}
</style>
