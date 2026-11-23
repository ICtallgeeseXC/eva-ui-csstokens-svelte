<svelte:options customElement={{ tag: 'eva-nerv-status-wall', shadow: 'none' }} />

<script lang="ts">
	export interface StatusCell {
		code: string;
		label: string;
		state: 'normal' | 'caution' | 'lock' | 'open';
	}

	interface Props {
		title?: string;
		cells?: StatusCell[];
		interactive?: boolean;
	}

	const defaultCells: StatusCell[] = [
		{ code: 'SEC-01', label: 'CENTRAL DOGMA', state: 'lock' },
		{ code: 'SEC-02', label: 'TERMINAL DOGMA', state: 'lock' },
		{ code: 'SEC-03', label: 'CAGE BAY 01', state: 'open' },
		{ code: 'SEC-04', label: 'CAGE BAY 02', state: 'normal' },
		{ code: 'SEC-05', label: 'UMBILICAL BUS', state: 'normal' },
		{ code: 'SEC-06', label: 'LCL PLANT', state: 'caution' },
		{ code: 'SEC-07', label: 'MAGI COOLING', state: 'normal' },
		{ code: 'SEC-08', label: 'BLAST GATE A', state: 'lock' },
		{ code: 'SEC-09', label: 'GEO-FRONT LIFT', state: 'open' }
	];

	let {
		title = 'NERV HQ // SECTOR LOCKDOWN MATRIX',
		cells = $bindable(defaultCells),
		interactive = true
	}: Props = $props();

	const order: StatusCell['state'][] = ['normal', 'open', 'caution', 'lock'];

	function cycleCell(idx: number) {
		if (!interactive) return;
		const cur = cells[idx].state;
		const next = order[(order.indexOf(cur) + 1) % order.length];
		cells = cells.map((c, i) => (i === idx ? { ...c, state: next } : c));
	}
</script>

<div class="wall-frame">
	<div class="wall-head">
		<span class="wall-head__title">{title}</span>
		<span class="wall-head__sub">CLICK SECTOR TO TOGGLE</span>
	</div>

	<div class="wall-grid">
		{#each cells as cell, idx (cell.code)}
			<button
				type="button"
				class="wall-cell is-{cell.state}"
				disabled={!interactive}
				onclick={() => cycleCell(idx)}
			>
				<div class="wall-cell__top">
					<span class="wall-cell__code">{cell.code}</span>
					<span class="wall-cell__state">{cell.state.toUpperCase()}</span>
				</div>
				<div class="wall-cell__lbl eva-display">{cell.label}</div>
			</button>
		{/each}
	</div>
</div>

<style>
	.wall-frame {
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		padding: 0.7rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.wall-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1.5px solid var(--eva-border-strong);
		padding-bottom: 0.4rem;
		font-family: var(--eva-font-display);
	}

	.wall-head__title {
		font-size: 0.92rem;
		font-weight: 700;
		color: var(--eva-primary);
		letter-spacing: 0.04em;
		text-shadow: var(--eva-bloom);
	}

	.wall-head__sub {
		font-size: 0.74rem;
		color: var(--eva-gold, #fff275);
	}

	.wall-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.5rem;
	}

	.wall-cell {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.42rem 0.55rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 1px;
		border-radius: 4px;
		color: var(--eva-primary);
		text-align: left;
		cursor: pointer;
	}

	.wall-cell.is-lock {
		background: #ff2222;
		border-color: #ff2222;
		outline-color: rgba(255, 34, 34, 0.55);
		color: #000000;
	}

	.wall-cell.is-caution {
		background: #fff275;
		border-color: #fff275;
		outline-color: rgba(255, 242, 117, 0.55);
		color: #000000;
	}

	.wall-cell.is-open {
		border-color: #46f76a;
		outline-color: rgba(70, 247, 106, 0.55);
		color: #46f76a;
		background: rgba(70, 247, 106, 0.08);
		text-shadow: 0 0 6px rgba(70, 247, 106, 0.45);
	}

	.wall-cell__top {
		display: flex;
		justify-content: space-between;
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.74rem;
		font-weight: 700;
		border-bottom: 1px solid currentColor;
		padding-bottom: 0.14rem;
	}

	.wall-cell__lbl {
		font-size: 0.96rem;
		letter-spacing: 0.03em;
	}
</style>
