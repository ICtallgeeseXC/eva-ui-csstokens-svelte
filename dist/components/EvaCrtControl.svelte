<svelte:options customElement={{ tag: 'eva-crt-control', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';

	export type CrtMode = 'fine' | 'trinitron' | 'shadow' | 'wide';

	interface Props {
		enabled?: boolean;
		level?: number;
		mode?: CrtMode;
		compact?: boolean;
		applyToRoot?: boolean;
		syncGlobal?: boolean;
		label?: string;
		onChange?: (state: { enabled: boolean; level: number; mode: CrtMode }) => void;
	}

	let {
		enabled = $bindable(true),
		level = $bindable(48),
		mode = $bindable<CrtMode>('trinitron'),
		compact = false,
		applyToRoot = true,
		syncGlobal = true,
		label = 'CRT SCANLINES',
		onChange
	}: Props = $props();

	const modes: { id: CrtMode; label: string }[] = [
		{ id: 'fine', label: 'FINE' },
		{ id: 'trinitron', label: 'TRINITRON' },
		{ id: 'shadow', label: 'SHADOW' },
		{ id: 'wide', label: 'WIDE' }
	];

	const presets = [
		{ id: 'LOW', val: 25 },
		{ id: 'NERV', val: 48 },
		{ id: 'MAX', val: 95 }
	];

	const instanceId = Math.random().toString(36).slice(2);

	function applyRoot(nextEnabled: boolean, nextLevel: number, nextMode: CrtMode) {
		if (!applyToRoot || typeof document === 'undefined') return;
		const clamped = Math.max(0, Math.min(100, nextLevel));
		const opacity = nextEnabled ? clamped / 100 : 0;
		const vignette = nextEnabled ? (clamped / 100) * 0.45 : 0;
		document.documentElement.style.setProperty('--eva-crt-opacity', opacity.toFixed(3));
		document.documentElement.style.setProperty('--eva-crt-vignette', vignette.toFixed(3));
		document.documentElement.setAttribute('data-eva-crt-mode', nextMode);
	}

	function broadcast() {
		applyRoot(enabled, level, mode);
		onChange?.({ enabled, level, mode });
		if (syncGlobal && typeof window !== 'undefined') {
			window.dispatchEvent(
				new CustomEvent('eva-crt-sync', {
					detail: { source: instanceId, enabled, level, mode }
				})
			);
		}
	}

	onMount(() => {
		applyRoot(enabled, level, mode);
		if (!syncGlobal) return;
		const handler = (e: Event) => {
			const detail = (e as CustomEvent).detail;
			if (!detail || detail.source === instanceId) return;
			enabled = detail.enabled;
			level = detail.level;
			mode = detail.mode;
			applyRoot(enabled, level, mode);
		};
		window.addEventListener('eva-crt-sync', handler);
		return () => window.removeEventListener('eva-crt-sync', handler);
	});

	function toggle() {
		enabled = !enabled;
		broadcast();
	}

	function setPreset(val: number) {
		enabled = true;
		level = val;
		broadcast();
	}

	function setMode(next: CrtMode) {
		enabled = true;
		mode = next;
		broadcast();
	}

	function cycleMode() {
		const idx = modes.findIndex((m) => m.id === mode);
		setMode(modes[(idx + 1) % modes.length].id);
	}
</script>

<div class="eva-crt-ctrl" class:is-compact={compact} class:is-off={!enabled}>
	<div class="crt-head">
		{#if !compact}
			<span class="crt-lbl eva-display">{label}</span>
		{/if}
		<button
			type="button"
			class="crt-toggle"
			class:is-on={enabled}
			aria-pressed={enabled}
			onclick={toggle}
			title="Toggle CRT Scanline Effect"
		>
			<svg viewBox="0 0 5 13" class="crt-led" aria-hidden="true">
				<rect x="0" y="0" width="5" height="13" rx="1" fill="currentColor" />
			</svg>
			<span>CRT {enabled ? 'ON' : 'OFF'}</span>
		</button>
		{#if compact}
			<button
				type="button"
				class="crt-mode-cycle"
				onclick={cycleMode}
				title="Cycle CRT Mask Variation"
			>
				{mode.toUpperCase()}
			</button>
		{/if}
		<span class="crt-pct eva-num">{enabled ? `${Math.round(level)}%` : '00%'}</span>
	</div>

	<div class="crt-controls">
		<input
			type="range"
			class="crt-slider"
			min="0"
			max="100"
			step="2"
			bind:value={level}
			aria-label="CRT Effect Level"
			oninput={() => {
				if (!enabled && level > 0) enabled = true;
				broadcast();
			}}
		/>
		{#if !compact}
			<div class="crt-presets" role="group" aria-label="CRT Intensity Presets">
				{#each presets as p}
					<button
						type="button"
						class="crt-opt"
						class:is-active={enabled && Math.abs(level - p.val) <= 4}
						onclick={() => setPreset(p.val)}
					>
						{p.id}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	{#if !compact}
		<div class="crt-modes" role="group" aria-label="CRT Pattern Variations">
			<span class="crt-modes__lbl">PATTERN:</span>
			{#each modes as m}
				<button
					type="button"
					class="crt-opt"
					class:is-active={enabled && mode === m.id}
					onclick={() => setMode(m.id)}
				>
					{m.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.eva-crt-ctrl {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		padding: 0.55rem 0.72rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.eva-crt-ctrl.is-compact {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		padding: 0.2rem 0.5rem;
		outline-offset: 1px;
		border-radius: 4px;
	}

	.crt-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.45rem;
	}

	.crt-lbl {
		font-size: 0.84rem;
		color: var(--eva-primary);
		margin-right: auto;
	}

	.crt-toggle,
	.crt-mode-cycle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.14rem 0.48rem;
		background: #000000;
		border: 1.5px solid var(--eva-border);
		border-radius: 4px;
		color: var(--eva-text-muted);
		font-family: var(--eva-font-display);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		white-space: nowrap;
		flex-shrink: 0;
		cursor: pointer;
	}

	.crt-toggle {
		min-width: 72px;
	}

	.crt-mode-cycle {
		min-width: 78px;
		color: var(--eva-primary);
		border-color: var(--eva-border-strong);
	}

	.crt-mode-cycle:hover {
		background: var(--eva-primary);
		color: #000000;
	}

	.crt-toggle.is-on {
		border-color: var(--eva-border-strong);
		color: var(--eva-primary-bright, #ffb833);
		background: rgba(255, 148, 26, 0.14);
		text-shadow: var(--eva-bloom);
	}

	.crt-led {
		width: 4px;
		height: 11px;
		display: block;
		flex-shrink: 0;
	}

	.crt-toggle.is-on .crt-led {
		color: var(--eva-gold, #fff275);
		filter: drop-shadow(0 0 4px #fff275);
	}

	.crt-pct {
		min-width: 2.4rem;
		text-align: right;
		font-size: 0.9rem;
		color: var(--eva-gold, #fff275);
	}

	.eva-crt-ctrl.is-off .crt-pct {
		color: var(--eva-text-muted);
		text-shadow: none;
	}

	.crt-controls {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}

	.crt-slider {
		min-width: 74px;
		flex: 1;
		accent-color: var(--eva-primary);
	}

	.eva-crt-ctrl.is-compact .crt-slider {
		width: 68px;
		height: 10px;
	}

	.crt-presets,
	.crt-modes {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem;
		flex-shrink: 0;
	}

	.crt-modes {
		padding-top: 0.25rem;
		border-top: 1px solid rgba(255, 148, 26, 0.22);
	}

	.crt-modes__lbl {
		font-family: var(--eva-font-display);
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--eva-text-muted);
		margin-right: 0.2rem;
	}

	.crt-opt {
		padding: 0.12rem 0.45rem;
		background: #000000;
		border: 1px solid var(--eva-border);
		border-radius: 3px;
		color: var(--eva-text-muted);
		font-family: var(--eva-font-display);
		font-size: 0.72rem;
		font-weight: 700;
		cursor: pointer;
	}

	.crt-opt:hover,
	.crt-opt.is-active {
		border-color: var(--eva-border-strong);
		background: var(--eva-primary);
		color: #000000;
	}
</style>
