<svelte:options customElement={{ tag: 'eva-sidebar', shadow: 'none' }} />

<script lang="ts">
	export interface SidebarItem {
		id: string;
		code: string;
		label: string;
	}

	interface Props {
		title?: string;
		items?: SidebarItem[];
		activeId?: string;
		collapsed?: boolean;
	}

	const defaultItems: SidebarItem[] = [
		{ id: 'cmd', code: '01', label: 'COMMAND BRIDGE' },
		{ id: 'magi', code: '02', label: 'MAGI SUPERCOMP' },
		{ id: 'cage', code: '03', label: 'EVA CAGE BAYS' },
		{ id: 'dogma', code: '04', label: 'TERMINAL DOGMA' }
	];

	let {
		title = 'NERV NAV',
		items = defaultItems,
		activeId = $bindable(items[0]?.id ?? ''),
		collapsed = $bindable(false)
	}: Props = $props();
</script>

<aside class="eva-sb" class:is-collapsed={collapsed}>
	<div class="eva-sb__head">
		{#if !collapsed}
			<span class="eva-sb__title">{title}</span>
		{/if}
		<button type="button" class="eva-sb__toggle" onclick={() => (collapsed = !collapsed)}>
			{collapsed ? '»' : '«'}
		</button>
	</div>
	<nav class="eva-sb__nav">
		{#each items as item (item.id)}
			<button
				type="button"
				class="eva-sb__item"
				class:is-active={activeId === item.id}
				onclick={() => (activeId = item.id)}
				title={item.label}
			>
				<span class="sb-code">{item.code}</span>
				{#if !collapsed}
					<span class="sb-lbl">{item.label}</span>
				{/if}
			</button>
		{/each}
	</nav>
</aside>

<style>
	.eva-sb {
		width: 215px;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		display: flex;
		flex-direction: column;
		transition: width 140ms ease;
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.eva-sb.is-collapsed {
		width: 54px;
	}

	.eva-sb__head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.4rem 0.55rem;
		background: #000000;
		border-bottom: 1.5px solid var(--eva-border-strong);
		color: var(--eva-primary);
		font-family: var(--eva-font-display);
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-shadow: var(--eva-bloom);
	}

	.eva-sb__toggle {
		background: #000000;
		color: var(--eva-primary);
		border: 1px solid var(--eva-border-strong);
		border-radius: 3px;
		padding: 0.04rem 0.42rem;
		font-family: var(--eva-font-num);
		font-weight: 700;
		cursor: pointer;
	}

	.eva-sb__toggle:hover {
		background: var(--eva-primary);
		color: #000000;
	}

	.eva-sb__nav {
		display: flex;
		flex-direction: column;
	}

	.eva-sb__item {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.48rem 0.6rem;
		background: transparent;
		border: none;
		border-bottom: 1px solid rgba(255, 148, 26, 0.22);
		color: var(--eva-text-muted);
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		text-align: left;
		text-transform: uppercase;
		cursor: pointer;
	}

	.eva-sb__item:hover {
		background: var(--eva-primary-dim);
		color: var(--eva-primary);
	}

	.eva-sb__item.is-active {
		background: rgba(255, 148, 26, 0.14);
		color: var(--eva-primary);
		text-shadow: var(--eva-bloom);
		border-left: 5px solid var(--eva-border-strong);
	}

	.sb-code {
		padding: 0.04rem 0.34rem;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 3px;
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.78rem;
		color: var(--eva-gold, #fff275);
	}
</style>
