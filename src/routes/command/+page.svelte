<script lang="ts">
	import {
		EvaAlertBanner,
		EvaBreadcrumb,
		EvaDataTable,
		EvaFilterChips,
		EvaHexGrid,
		EvaInput,
		EvaModal,
		EvaPanel,
		EvaProgressBar,
		EvaStatCard,
		EvaStatusTag,
		EvaTerminal,
		EvaToast,
		EvaToggle,
		type BreadcrumbItem,
		type HexCell,
		type TableColumn,
		type TerminalLog,
		type ToastItem
	} from '$lib';

	type IncidentStatus = 'ACTIVE' | 'CONTAINING' | 'NEUTRALIZED';

	interface Incident {
		id: string;
		angel: string;
		sector: string;
		threat: number;
		status: IncidentStatus;
		containment: number;
		unit: string;
		atField: boolean;
	}

	const STATUSES: IncidentStatus[] = ['ACTIVE', 'CONTAINING', 'NEUTRALIZED'];

	const UNIT_BREADCRUMBS: BreadcrumbItem[] = [
		{ id: 'EVA-00', label: 'PROTOTYPE' },
		{ id: 'EVA-01', label: 'TEST TYPE' },
		{ id: 'EVA-02', label: 'PRODUCTION' }
	];

	const HEX_COORDS: Record<string, string> = {
		'A-03': '0-2',
		'A-04': '1-2',
		'A-05': '0-4',
		'A-06': '2-4',
		'A-07': '1-1',
		'A-08': '2-1',
		'A-09': '1-3'
	};

	const COLUMNS: TableColumn[] = [
		{ key: 'id', label: 'ID', sortable: true },
		{ key: 'angel', label: 'DESIGNATION', sortable: true },
		{ key: 'sector', label: 'SECTOR', sortable: true },
		{ key: 'threat', label: 'THREAT', sortable: true, type: 'number', align: 'right' },
		{ key: 'status', label: 'STATUS', sortable: true }
	];

	let incidents = $state<Incident[]>([
		{ id: 'A-03', angel: 'SACHIEL', sector: 'TOKYO-3', threat: 62, status: 'ACTIVE', containment: 8, unit: 'EVA-01', atField: true },
		{ id: 'A-04', angel: 'SHAMSHEL', sector: 'GEOFRONT', threat: 48, status: 'ACTIVE', containment: 20, unit: 'EVA-02', atField: false },
		{ id: 'A-05', angel: 'RAMIEL', sector: 'HAKONE', threat: 91, status: 'ACTIVE', containment: 4, unit: 'EVA-00', atField: true },
		{ id: 'A-06', angel: 'GAGHIEL', sector: 'PACIFIC', threat: 55, status: 'CONTAINING', containment: 58, unit: 'EVA-02', atField: true },
		{ id: 'A-07', angel: 'ISRAFEL', sector: 'TOKYO-3', threat: 73, status: 'ACTIVE', containment: 15, unit: 'EVA-01', atField: false },
		{ id: 'A-08', angel: 'SANDALPHON', sector: 'MAGMA', threat: 84, status: 'CONTAINING', containment: 41, unit: 'EVA-00', atField: true },
		{ id: 'A-09', angel: 'MATARAEL', sector: 'GEOFRONT', threat: 36, status: 'NEUTRALIZED', containment: 100, unit: 'EVA-02', atField: false }
	]);

	let query = $state('');
	let activeStatuses = $state<string[]>([...STATUSES]);
	let selectedId = $state<string>('A-03');
	let confirmOpen = $state(false);
	let toasts = $state<ToastItem[]>([]);
	let toastSeq = 0;
	let logs = $state<TerminalLog[]>([
		{ time: stamp(), level: 'info', message: `[${stamp()}] COMMAND CONSOLE ONLINE // MAGI SYNC OK` }
	]);

	function stamp(): string {
		return new Date().toTimeString().slice(0, 8);
	}

	function log(message: string, level: TerminalLog['level'] = 'info') {
		logs = [...logs, { time: stamp(), level, message: `[${stamp()}] ${message}` }].slice(-40);
	}

	function toast(title: string, message: string, severity: ToastItem['severity'] = 'info') {
		toastSeq += 1;
		toasts = [...toasts, { id: `t${toastSeq}`, title, message, severity, duration: 3800 }];
	}

	const filtered = $derived(
		incidents.filter((i) => {
			const q = query.trim().toLowerCase();
			const matchesQuery =
				!q || i.id.toLowerCase().includes(q) || i.angel.toLowerCase().includes(q) || i.sector.toLowerCase().includes(q);
			return matchesQuery && activeStatuses.includes(i.status);
		})
	);

	const rows = $derived(
		filtered.map((i) => ({
			id: i.id,
			angel: i.angel,
			sector: i.sector,
			threat: i.threat,
			status: i.status
		}))
	);

	const selected = $derived(incidents.find((i) => i.id === selectedId) ?? null);
	const selectedIndex = $derived.by(() => {
		const idx = filtered.findIndex((i) => i.id === selectedId);
		return idx >= 0 ? idx : null;
	});

	const openIncidents = $derived(incidents.filter((i) => i.status !== 'NEUTRALIZED'));
	const topThreat = $derived(openIncidents.reduce((m, i) => Math.max(m, i.threat), 0));
	const avgContainment = $derived(
		openIncidents.length
			? Math.round(openIncidents.reduce((s, i) => s + i.containment, 0) / openIncidents.length)
			: 100
	);

	const bannerSeverity = $derived(
		openIncidents.length === 0 ? 'nominal' : topThreat >= 80 ? 'emergency' : topThreat >= 50 ? 'warning' : 'info'
	);
	const bannerHeadline = $derived(
		openIncidents.length === 0
			? 'ALL CLEAR'
			: bannerSeverity === 'emergency'
				? 'EMERGENCY'
				: bannerSeverity === 'warning'
					? 'WARNING'
					: 'ADVISORY'
	);

	function update(id: string, patch: Partial<Incident>) {
		incidents = incidents.map((i) => (i.id === id ? { ...i, ...patch } : i));
	}

	function deploy() {
		if (!selected || selected.status === 'NEUTRALIZED') return;
		const containment = Math.min(100, selected.containment + 25);
		update(selected.id, { containment, status: containment >= 100 ? 'NEUTRALIZED' : 'CONTAINING' });
		log(`${selected.unit} DEPLOYED -> ${selected.angel} @ ${selected.sector} // CONTAINMENT ${containment}%`);
		toast('UNIT DEPLOYED', `${selected.unit} engaging ${selected.angel}`, 'info');
	}

	function resolve() {
		if (!selected) return;
		update(selected.id, { containment: 100, status: 'NEUTRALIZED' });
		log(`${selected.angel} PATTERN BLUE LOST // MARKED NEUTRALIZED`, 'warn');
		toast('TARGET NEUTRALIZED', `${selected.angel} // ${selected.sector}`, 'nominal');
		confirmOpen = false;
	}

	function reset() {
		incidents = incidents.map((i) =>
			i.id === 'A-09' ? i : { ...i, status: 'ACTIVE', containment: Math.round(i.containment / 4) }
		);
		query = '';
		activeStatuses = [...STATUSES];
		log('CONSOLE RESET // INCIDENT STATES RESTORED', 'crit');
	}

	function statusColor(s: IncidentStatus): string {
		return s === 'ACTIVE' ? '#ff4747' : s === 'CONTAINING' ? '#ff941a' : '#46f76a';
	}

	function incidentHexState(s: IncidentStatus): HexCell['state'] {
		return s === 'ACTIVE' ? 'alert' : s === 'CONTAINING' ? 'active' : 'nominal';
	}

	const hexCells = $derived.by(() => {
		const map: Record<string, HexCell> = {};
		for (const inc of incidents) {
			const coord = HEX_COORDS[inc.id];
			if (!coord) continue;
			map[coord] = {
				id: coord,
				label: inc.id,
				state: incidentHexState(inc.status)
			};
		}
		return map;
	});

	const selectedHexId = $derived(HEX_COORDS[selectedId] ?? '');

	function handleHexClick(coord: string) {
		const match = incidents.find((inc) => HEX_COORDS[inc.id] === coord);
		if (match) selectedId = match.id;
	}
</script>

<div class="cmd-page">
	<EvaAlertBanner
		severity={bannerSeverity}
		headline={bannerHeadline}
		subtext={`${openIncidents.length} OPEN INCIDENT(S) // PEAK THREAT ${topThreat}`}
		animatedStripes={bannerSeverity === 'emergency'}
	/>

	<div class="cmd-stats">
		<EvaStatCard
			label="OPEN INCIDENTS"
			value={openIncidents.length}
			unit=""
			delta={`${incidents.length} TOTAL`}
			trend="neutral"
			sentiment={openIncidents.length > 0 ? 'negative' : 'positive'}
			code="INC-00"
		/>
		<EvaStatCard
			label="PEAK THREAT"
			value={topThreat}
			unit="PT"
			delta={topThreat >= 80 ? 'CRITICAL' : topThreat >= 50 ? 'ELEVATED' : 'NOMINAL'}
			trend={topThreat >= 50 ? 'up' : 'neutral'}
			sentiment={topThreat >= 80 ? 'negative' : topThreat >= 50 ? 'neutral' : 'positive'}
			code="THR-01"
		/>
		<EvaStatCard
			label="AVG CONTAINMENT"
			value={avgContainment}
			unit="%"
			delta="OPEN ONLY"
			trend={avgContainment >= 75 ? 'up' : avgContainment < 50 ? 'down' : 'neutral'}
			sentiment={avgContainment >= 75 ? 'positive' : avgContainment < 50 ? 'negative' : 'neutral'}
			code="CON-02"
		/>
	</div>

	<div class="cmd-grid">
		<EvaPanel title="INCIDENT QUEUE" code="Q-00" status={`${filtered.length}/${incidents.length} SHOWN`}>
			<div class="cmd-filters">
				<EvaInput
					label="SEARCH"
					jpLabel="検索"
					type="search"
					placeholder="ID / ANGEL / SECTOR"
					code="IN-00"
					bind:value={query}
				/>
				<EvaFilterChips chips={STATUSES} bind:active={activeStatuses} />
			</div>
			<EvaDataTable
				columns={COLUMNS}
				{rows}
				searchable={false}
				{selectedIndex}
				onRowSelect={(row) => (selectedId = String(row.id))}
			/>
			{#if rows.length === 0}
				<p class="cmd-empty">NO INCIDENTS MATCH CURRENT FILTERS</p>
			{/if}
		</EvaPanel>

		<EvaPanel
			title={selected ? `${selected.angel} // ${selected.sector}` : 'NO TARGET'}
			code="TGT-01"
			variant={selected && selected.status === 'ACTIVE' ? 'alert' : 'default'}
		>
			{#if selected}
				<div class="cmd-detail">
					<EvaStatusTag
						variant="pill"
						jpLabel="状態"
						label={selected.status}
						color={statusColor(selected.status)}
						glow
					/>
					<EvaProgressBar label="CONTAINMENT" value={selected.containment} max={100} dangerThreshold={25} />
					<EvaProgressBar
						label="THREAT LEVEL"
						value={selected.threat}
						max={100}
						dangerMode="high"
						dangerThreshold={70}
						unit="PT"
					/>
					<div class="cmd-field">
						<span class="cmd-field__label eva-display">ASSIGNED UNIT</span>
						<EvaBreadcrumb
							items={UNIT_BREADCRUMBS}
							startIndex={0}
							activeId={selected.unit}
							onNavigate={(unit) => update(selected.id, { unit })}
						/>
					</div>
					<EvaToggle
						label="A.T. FIELD NEUTRALIZER"
						onLabel="ENGAGED"
						offLabel="STANDBY"
						bind:checked={() => selected.atField, (v) => update(selected.id, { atField: v })}
					/>
					<div class="cmd-actions">
						<button
							type="button"
							class="eva-btn"
							disabled={selected.status === 'NEUTRALIZED'}
							onclick={deploy}
						>
							DEPLOY UNIT
						</button>
						<button
							type="button"
							class="eva-btn eva-btn-danger"
							disabled={selected.status === 'NEUTRALIZED'}
							onclick={() => (confirmOpen = true)}
						>
							MARK NEUTRALIZED
						</button>
						<button type="button" class="eva-btn" onclick={reset}>RESET</button>
					</div>
				</div>
			{:else}
				<p class="cmd-empty">SELECT AN INCIDENT FROM THE QUEUE</p>
			{/if}
		</EvaPanel>
	</div>

	<div class="cmd-bottom">
		<EvaPanel
			title="TACTICAL HEX MAP // INCIDENT QUEUE"
			code="HEX-00"
			status={selected ? `LOCK: ${selected.id}` : ''}
		>
			<div class="cmd-hex-wrap">
				<EvaHexGrid
					rows={3}
					cols={6}
					hexSize={28}
					cells={hexCells}
					interactive={true}
					autoCycle={false}
					selectedId={selectedHexId}
					onCellClick={(coord) => handleHexClick(coord)}
				/>
			</div>
		</EvaPanel>

		<EvaPanel title="OPERATIONS LOG" code="LOG-00">
			<EvaTerminal {logs} streaming={false} visibleLines={8} />
		</EvaPanel>
	</div>
</div>

<EvaModal bind:open={confirmOpen} title="CONFIRM NEUTRALIZATION" code="DLG-04" variant="alert">
	<p>
		Mark <strong>{selected?.angel}</strong> at <strong>{selected?.sector}</strong> as neutralized? This
		sets containment to 100%.
	</p>
	{#snippet footer()}
		<button type="button" class="eva-btn" onclick={() => (confirmOpen = false)}>CANCEL</button>
		<button type="button" class="eva-btn eva-btn-danger" onclick={resolve}>CONFIRM</button>
	{/snippet}
</EvaModal>

<EvaToast bind:toasts phosphor="gold" />

<style>
	.cmd-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.cmd-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
		gap: 1rem;
	}

	.cmd-grid {
		display: grid;
		grid-template-columns: minmax(0, 3fr) minmax(300px, 2fr);
		gap: 1rem;
		align-items: start;
	}

	.cmd-filters {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		margin-bottom: 0.8rem;
	}

	.cmd-detail {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.cmd-field {
		display: flex;
		flex-direction: column;
		gap: 0.32rem;
	}

	.cmd-field__label {
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		color: var(--eva-text-muted);
	}

	.cmd-bottom {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1rem;
		align-items: stretch;
	}

	.cmd-hex-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cmd-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.cmd-actions .eva-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.cmd-empty {
		margin: 0.8rem 0 0;
		font-family: var(--eva-font-display);
		letter-spacing: 0.06em;
		color: var(--eva-text-muted);
	}

	@media (max-width: 900px) {
		.cmd-grid,
		.cmd-bottom {
			grid-template-columns: 1fr;
		}
	}
</style>
