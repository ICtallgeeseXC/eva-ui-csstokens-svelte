<svelte:options customElement={{ tag: 'eva-data-table', shadow: 'none' }} />

<script lang="ts">
	export interface TableColumn {
		key: string;
		label: string;
		align?: 'left' | 'right' | 'center';
		sortable?: boolean;
		type?: 'text' | 'number';
	}

	interface Props {
		columns?: TableColumn[];
		rows?: Record<string, string | number>[];
		searchable?: boolean;
		editable?: boolean;
		selectedIndex?: number | null;
		onRowSelect?: (row: Record<string, string | number>, index: number) => void;
		onRowsChange?: (rows: Record<string, string | number>[]) => void;
	}

	const defaultColumns: TableColumn[] = [
		{ key: 'id', label: 'UNIT', sortable: true },
		{ key: 'pilot', label: 'PILOT', sortable: true },
		{ key: 'sync', label: 'SYNC %', align: 'right', sortable: true, type: 'number' },
		{ key: 'status', label: 'STATUS', sortable: true }
	];

	const defaultRows: Record<string, string | number>[] = [
		{ id: 'EVA-00', pilot: 'AYANAMI, REI', sync: 64.8, status: 'STANDBY' },
		{ id: 'EVA-01', pilot: 'IKARI, SHINJI', sync: 78.4, status: 'ACTIVE' },
		{ id: 'EVA-02', pilot: 'LANGLEY, ASUKA', sync: 81.2, status: 'ACTIVE' },
		{ id: 'EVA-03', pilot: 'SUZUHARA, TOJI', sync: 12.1, status: 'CRITICAL' }
	];

	let {
		columns = defaultColumns,
		rows = $bindable(defaultRows),
		searchable = true,
		editable = false,
		selectedIndex = $bindable<number | null>(1),
		onRowSelect,
		onRowsChange
	}: Props = $props();

	let query = $state('');
	let sortKey = $state<string>('');
	let sortAsc = $state(true);
	let editingCell = $state<{ row: Record<string, string | number>; key: string } | null>(null);
	let editValue = $state('');

	function toggleSort(col: TableColumn) {
		if (!col.sortable) return;
		if (sortKey === col.key) {
			sortAsc = !sortAsc;
		} else {
			sortKey = col.key;
			sortAsc = true;
		}
	}

	function startEdit(row: Record<string, string | number>, col: TableColumn) {
		if (!editable) return;
		editingCell = { row, key: col.key };
		editValue = String(row[col.key] ?? '');
	}

	function commitEdit(col: TableColumn) {
		if (!editingCell) return;
		const { row, key } = editingCell;
		const parsed = col.type === 'number' ? Number(editValue) || 0 : editValue;
		rows = rows.map((r) => (r === row ? { ...r, [key]: parsed } : r));
		editingCell = null;
		onRowsChange?.(rows);
	}

	function addRow() {
		const blank: Record<string, string | number> = {};
		for (const col of columns) {
			blank[col.key] = col.type === 'number' ? 0 : col.key === 'status' ? 'STANDBY' : 'NEW';
		}
		rows = [...rows, blank];
		onRowsChange?.(rows);
	}

	function deleteRow(row: Record<string, string | number>) {
		rows = rows.filter((r) => r !== row);
		onRowsChange?.(rows);
	}

	const processedRows = $derived.by(() => {
		const q = query.trim().toLowerCase();
		let list = q
			? rows.filter((r) =>
					Object.values(r).some((v) => String(v).toLowerCase().includes(q))
				)
			: [...rows];

		if (sortKey) {
			list.sort((a, b) => {
				const va = a[sortKey];
				const vb = b[sortKey];
				if (typeof va === 'number' && typeof vb === 'number') {
					return sortAsc ? va - vb : vb - va;
				}
				return sortAsc
					? String(va).localeCompare(String(vb))
					: String(vb).localeCompare(String(va));
			});
		}
		return list;
	});
</script>

<div class="eva-table-wrap">
	{#if searchable || editable}
		<div class="eva-table-toolbar">
			{#if searchable}
				<input
					type="search"
					class="eva-table-search"
					placeholder="FILTER RECORDS..."
					bind:value={query}
				/>
			{/if}
			<span class="eva-mono-label">{processedRows.length} / {rows.length} ROWS</span>
			{#if editable}
				<button type="button" class="eva-btn add-btn" onclick={addRow}>+ ADD ROW</button>
			{/if}
		</div>
	{/if}

	<div class="eva-table-scroll">
		<table class="eva-table">
			<thead>
				<tr>
					{#each columns as col}
						<th style="text-align: {col.align ?? 'left'}">
							{#if col.sortable}
								<button type="button" class="sort-btn" onclick={() => toggleSort(col)}>
									<span>{col.label}</span>
									<span class="sort-ind" aria-hidden="true">
										{sortKey === col.key ? (sortAsc ? '▲' : '▼') : ''}
									</span>
								</button>
							{:else}
								{col.label}
							{/if}
						</th>
					{/each}
					{#if editable}
						<th style="text-align: right">ACT</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each processedRows as row, idx}
					<tr
						class:is-selected={selectedIndex === idx}
						onclick={() => {
							selectedIndex = idx;
							onRowSelect?.(row, idx);
						}}
					>
						{#each columns as col}
							{@const val = row[col.key]}
							{@const isEditing = editingCell?.row === row && editingCell?.key === col.key}
							<td
								style="text-align: {col.align ?? 'left'}"
								ondblclick={() => startEdit(row, col)}
								title={editable ? 'Double-click to edit' : undefined}
							>
								{#if isEditing}
									<input
										class="cell-input"
										type={col.type === 'number' ? 'number' : 'text'}
										step="any"
										bind:value={editValue}
										onblur={() => commitEdit(col)}
										onkeydown={(e) => {
											if (e.key === 'Enter') commitEdit(col);
											if (e.key === 'Escape') editingCell = null;
										}}
									/>
								{:else if col.key === 'status'}
									<span
										class="status-pill"
										class:is-crit={String(val).toUpperCase() === 'CRITICAL'}
										class:is-active={String(val).toUpperCase() === 'ACTIVE'}
									>
										{val}
									</span>
								{:else}
									{val}
								{/if}
							</td>
						{/each}
						{#if editable}
							<td style="text-align: right">
								<button
									type="button"
									class="del-btn"
									onclick={(e) => {
										e.stopPropagation();
										deleteRow(row);
									}}
									title="Delete row"
								>
									×
								</button>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	{#if editable}
		<div class="eva-mono-label">TIP: DOUBLE-CLICK ANY CELL TO EDIT INLINE</div>
	{/if}
</div>

<style>
	.eva-table-wrap {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.eva-table-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.65rem;
	}

	.eva-table-search {
		flex: 1;
		min-width: 140px;
		padding: 0.34rem 0.65rem;
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		background: #000000;
		color: var(--eva-primary);
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 4px;
		outline: none;
	}

	.eva-table-search:focus {
		border-color: var(--eva-primary);
		box-shadow: 0 0 10px var(--eva-primary-dim);
	}

	.add-btn {
		padding: 0.26rem 0.65rem;
		font-size: 0.78rem;
	}

	.eva-table-scroll {
		overflow-x: auto;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 1px;
		border-radius: 5px;
		background: #000000;
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.eva-table {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.94rem;
		font-weight: 700;
		letter-spacing: 0.025em;
	}

	.eva-table th {
		padding: 0.38rem 0.75rem;
		background: #000000;
		border-bottom: 1.5px solid var(--eva-border-strong);
		color: var(--eva-gold, #fff275);
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		text-shadow: 0 0 6px rgba(255, 242, 117, 0.35);
	}

	.sort-btn {
		all: unset;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.sort-ind {
		display: inline-block;
		width: 0.9em;
		text-align: center;
	}

	.eva-table td {
		padding: 0.42rem 0.75rem;
		border-bottom: 1px solid rgba(255, 148, 26, 0.22);
		color: var(--eva-primary);
		text-shadow: var(--eva-bloom);
	}

	.eva-table tbody tr {
		cursor: pointer;
		transition: background-color 100ms ease;
	}

	.eva-table tbody tr:hover {
		background: rgba(255, 148, 26, 0.12);
	}

	.eva-table tbody tr.is-selected {
		background: rgba(255, 148, 26, 0.18);
		outline: 1.5px solid var(--eva-border-strong);
		outline-offset: -1px;
	}

	.cell-input {
		width: 100%;
		min-width: 60px;
		padding: 0.15rem 0.35rem;
		font-family: var(--eva-font-num);
		font-size: 0.9rem;
		font-weight: 700;
		background: #000000;
		color: var(--eva-primary);
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 3px;
		outline: none;
	}

	.del-btn {
		background: #000000;
		border: 1.5px solid var(--eva-accent);
		border-radius: 3px;
		color: var(--eva-accent);
		font-family: var(--eva-font-num);
		font-size: 0.85rem;
		font-weight: 700;
		padding: 0.02rem 0.42rem;
		cursor: pointer;
	}

	.del-btn:hover {
		background: var(--eva-accent);
		color: #000000;
	}

	.status-pill {
		display: inline-block;
		padding: 0.08rem 0.5rem;
		font-family: var(--eva-font-display);
		font-size: 0.78rem;
		font-weight: 700;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 4px;
		background: #000000;
		color: var(--eva-gold, #fff275);
		border-color: var(--eva-gold, #fff275);
		letter-spacing: 0.04em;
		text-shadow: 0 0 6px rgba(255, 242, 117, 0.45);
	}

	.status-pill.is-active {
		background: #000000;
		border-color: #46f76a;
		color: #46f76a;
		text-shadow: 0 0 8px rgba(70, 247, 106, 0.5);
	}

	.status-pill.is-crit {
		background: #000000;
		border-color: #ff2222;
		color: #ff2222;
		box-shadow: 0 0 8px rgba(255, 34, 34, 0.45);
		text-shadow: 0 0 8px rgba(255, 34, 34, 0.55);
	}
</style>
