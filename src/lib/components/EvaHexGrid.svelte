<svelte:options customElement={{ tag: 'eva-hex-grid', shadow: 'none' }} />

<script lang="ts">
	export interface HexCell {
		id: string;
		label?: string;
		state?: 'idle' | 'active' | 'alert' | 'nominal';
	}

	interface Props {
		rows?: number;
		cols?: number;
		hexSize?: number;
		cells?: Record<string, HexCell>;
		interactive?: boolean;
		autoCycle?: boolean;
		selectedId?: string;
		onCellClick?: (id: string, cell: HexCell) => void;
	}

	let {
		rows = 4,
		cols = 7,
		hexSize = 26,
		cells = $bindable<Record<string, HexCell>>({
			'1-2': { id: '1-2', label: 'A1', state: 'active' },
			'1-3': { id: '1-3', label: 'A2', state: 'alert' },
			'2-3': { id: '2-3', label: 'B1', state: 'alert' },
			'2-4': { id: '2-4', label: 'B2', state: 'nominal' }
		}),
		interactive = true,
		autoCycle = true,
		selectedId = '',
		onCellClick
	}: Props = $props();

	const dx = $derived(hexSize * Math.sqrt(3));
	const dy = $derived(hexSize * 1.5);
	const svgWidth = $derived(Math.ceil(cols * dx + dx * 0.6 + 8));
	const svgHeight = $derived(Math.ceil(rows * dy + hexSize * 0.8 + 8));

	function hexPoints(cx: number, cy: number, r: number): string {
		const pts: string[] = [];
		for (let i = 0; i < 6; i++) {
			const angle = (Math.PI / 180) * (60 * i - 30);
			pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
		}
		return pts.join(' ');
	}

	const cycle: NonNullable<HexCell['state']>[] = ['idle', 'active', 'alert', 'nominal'];

	function toggleCell(id: string) {
		const existing = cells[id] ?? { id, state: 'idle' };
		if (interactive && autoCycle) {
			const nextState = cycle[(cycle.indexOf(existing.state ?? 'idle') + 1) % cycle.length];
			cells = { ...cells, [id]: { ...existing, state: nextState } };
		}
		onCellClick?.(id, cells[id] ?? existing);
	}
</script>

<div class="eva-hex-wrap">
	<svg
		viewBox="0 0 {svgWidth} {svgHeight}"
		class="eva-hex-svg"
		role="img"
		aria-label="Tactical Hex Grid"
	>
		{#each Array.from({ length: rows }) as _, r}
			{#each Array.from({ length: cols }) as _, c}
				{@const id = `${r}-${c}`}
				{@const cell = cells[id]}
				{@const state = cell?.state ?? 'idle'}
				{@const cx = 4 + dx * 0.55 + c * dx + (r % 2 === 1 ? dx / 2 : 0)}
				{@const cy = 4 + hexSize + r * dy}
				{#if interactive}
					<g
						class="eva-hex-cell is-{state} is-interactive"
						class:is-selected={selectedId === id}
						role="button"
						tabindex="0"
						onclick={() => toggleCell(id)}
						onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleCell(id)}
					>
						<polygon points={hexPoints(cx, cy, hexSize - 2)} />
						{#if cell?.label}
							<text x={cx} y={cy + 3.5} text-anchor="middle">{cell.label}</text>
						{/if}
					</g>
				{:else}
					<g class="eva-hex-cell is-{state}">
						<polygon points={hexPoints(cx, cy, hexSize - 2)} />
						{#if cell?.label}
							<text x={cx} y={cy + 3.5} text-anchor="middle">{cell.label}</text>
						{/if}
					</g>
				{/if}
			{/each}
		{/each}
	</svg>
</div>

<style>
	.eva-hex-wrap {
		display: inline-block;
		width: 100%;
	}

	.eva-hex-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.eva-hex-cell polygon {
		fill: #000000;
		stroke: var(--eva-border);
		stroke-width: 1.5;
		transition: fill 140ms ease, stroke 140ms ease;
	}

	.eva-hex-cell.is-interactive {
		cursor: pointer;
	}

	.eva-hex-cell.is-interactive:hover polygon {
		stroke: var(--eva-primary);
		fill: var(--eva-primary-dim);
	}

	.eva-hex-cell.is-active polygon {
		fill: var(--eva-primary-dim);
		stroke: var(--eva-border-strong);
	}

	.eva-hex-cell.is-alert polygon {
		fill: var(--eva-accent-dim);
		stroke: #ff2222;
	}

	.eva-hex-cell.is-nominal polygon {
		fill: rgba(70, 247, 106, 0.16);
		stroke: #46f76a;
	}

	.eva-hex-cell.is-selected polygon {
		stroke: var(--eva-gold, #fff275);
		stroke-width: 2.3;
		filter: drop-shadow(0 0 6px rgba(255, 242, 117, 0.55));
	}

	.eva-hex-cell text {
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 10.5px;
		font-weight: 700;
		fill: var(--eva-primary);
		pointer-events: none;
	}
</style>
