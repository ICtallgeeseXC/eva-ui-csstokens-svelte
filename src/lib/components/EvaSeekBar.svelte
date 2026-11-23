<svelte:options customElement={{ tag: 'eva-seek-bar', shadow: 'none' }} />

<script lang="ts">
	import EvaRulerScale from './EvaRulerScale.svelte';

	interface Props {
		value?: number;
		max?: number;
		buffered?: number;
		active?: boolean;
		color?: string;
		segments?: number;
		showRuler?: boolean;
		compact?: boolean;
		disabled?: boolean;
		glowAtFull?: boolean;
		label?: string;
		formatValue?: (val: number) => string;
		onSeek?: (next: number) => void;
	}

	let {
		value = $bindable(0),
		max = 100,
		buffered = 0,
		active = false,
		color = '',
		segments = 44,
		showRuler = true,
		compact = false,
		disabled = false,
		glowAtFull = true,
		label = 'Audio seek position',
		formatValue,
		onSeek
	}: Props = $props();

	let trackEl: HTMLDivElement | null = null;
	let dragging = $state(false);
	let hoverRatio = $state<number | null>(null);

	const safeMax = $derived(max > 0 ? max : 1);
	const ratio = $derived(Math.max(0, Math.min(1, value / safeMax)));
	const isFull = $derived(glowAtFull && ratio >= 0.999);
	const bufferedRatio = $derived(Math.max(0, Math.min(1, buffered / safeMax)));
	const accentColor = $derived(
		color || (active ? '#46f76a' : 'var(--eva-border-strong, #ff941a)')
	);
	const activeSegments = $derived(Math.round(ratio * segments));
	const hoverSegments = $derived(hoverRatio !== null ? Math.round(hoverRatio * segments) : -1);
	const bufferedSegments = $derived(Math.round(bufferedRatio * segments));

	const previewLabel = $derived.by(() => {
		if (hoverRatio === null) return '';
		const v = hoverRatio * safeMax;
		if (formatValue) return formatValue(v);
		return `${Math.round(hoverRatio * 100)}%`;
	});

	function ratioFromClientX(clientX: number): number {
		if (!trackEl) return 0;
		const rect = trackEl.getBoundingClientRect();
		if (rect.width <= 0) return 0;
		return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
	}

	function commitRatio(nextRatio: number) {
		if (disabled) return;
		const nextVal = nextRatio * safeMax;
		value = nextVal;
		onSeek?.(nextVal);
	}

	function handlePointerDown(e: PointerEvent) {
		if (disabled) return;
		dragging = true;
		trackEl?.setPointerCapture(e.pointerId);
		const r = ratioFromClientX(e.clientX);
		hoverRatio = r;
		commitRatio(r);
	}

	function handlePointerMove(e: PointerEvent) {
		if (disabled) return;
		const r = ratioFromClientX(e.clientX);
		hoverRatio = r;
		if (dragging) {
			commitRatio(r);
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		if (trackEl?.hasPointerCapture(e.pointerId)) {
			trackEl.releasePointerCapture(e.pointerId);
		}
	}

	function handlePointerLeave() {
		if (!dragging) {
			hoverRatio = null;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;
		const step = safeMax * 0.05;
		const fineStep = safeMax * 0.01;
		let next = value;
		if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			next = Math.min(safeMax, value + (e.shiftKey ? fineStep : step));
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
			next = Math.max(0, value - (e.shiftKey ? fineStep : step));
		} else if (e.key === 'Home') {
			next = 0;
		} else if (e.key === 'End') {
			next = safeMax;
		} else {
			return;
		}
		e.preventDefault();
		value = next;
		onSeek?.(next);
	}
</script>

<div
	class="eva-seek"
	class:is-active={active}
	class:is-compact={compact}
	class:is-dragging={dragging}
	class:is-disabled={disabled}
	class:is-full={isFull}
	style="--sk-c: {accentColor};"
>
	<div
		bind:this={trackEl}
		class="eva-seek__track"
		role="slider"
		tabindex={disabled ? -1 : 0}
		aria-label={label}
		aria-valuemin={0}
		aria-valuemax={Math.round(safeMax)}
		aria-valuenow={Math.round(value)}
		aria-valuetext={formatValue ? formatValue(value) : `${Math.round(ratio * 100)}%`}
		aria-disabled={disabled}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
		onpointerleave={handlePointerLeave}
		onkeydown={handleKeyDown}
	>
		{#if hoverRatio !== null && previewLabel && !compact}
			<span
				class="eva-seek__tooltip eva-num"
				style="left: {Math.max(5, Math.min(95, hoverRatio * 100))}%;"
			>
				{previewLabel}
			</span>
		{/if}

		<div class="eva-seek__segs" style="grid-template-columns: repeat({segments}, minmax(0, 1fr));">
			{#each Array.from({ length: segments }) as _, idx (idx)}
				<span
					class="sk-seg"
					class:is-lit={idx < activeSegments}
					class:is-buf={idx >= activeSegments && idx < bufferedSegments}
					class:is-hover={hoverSegments >= 0 && idx >= activeSegments && idx < hoverSegments}
				></span>
			{/each}
		</div>

		<span class="eva-seek__head" style="left: {ratio * 100}%;" aria-hidden="true"></span>
	</div>

	{#if showRuler && !compact}
		<div class="eva-seek__ruler">
			<EvaRulerScale
				ticks={Math.min(48, Math.max(20, segments))}
				majorEvery={4}
				color={accentColor}
				height={8}
			/>
		</div>
	{/if}
</div>

<style>
	.eva-seek {
		display: flex;
		flex-direction: column;
		gap: 0.22rem;
		width: 100%;
		min-width: 0;
		user-select: none;
		touch-action: none;
	}

	.eva-seek.is-disabled {
		opacity: 0.45;
		pointer-events: none;
	}

	.eva-seek__track {
		position: relative;
		height: 22px;
		padding: 3px 4px;
		box-sizing: border-box;
		background: #000000;
		border: 1.5px solid var(--sk-c);
		outline: 1px solid color-mix(in srgb, var(--sk-c) 45%, transparent);
		outline-offset: 1px;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: stretch;
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease;
	}

	.eva-seek.is-compact .eva-seek__track {
		height: 16px;
		padding: 2px 3px;
	}

	.eva-seek__track:hover,
	.eva-seek.is-dragging .eva-seek__track {
		box-shadow: 0 0 12px color-mix(in srgb, var(--sk-c) 35%, transparent);
	}

	.eva-seek__track:focus-visible {
		box-shadow: 0 0 0 2px var(--sk-c);
		outline: none;
	}

	.eva-seek__segs {
		display: grid;
		gap: 2px;
		width: 100%;
		height: 100%;
		align-items: stretch;
	}

	.eva-seek.is-compact .eva-seek__segs {
		gap: 1.5px;
	}

	.sk-seg {
		border-radius: 1px;
		background: color-mix(in srgb, var(--sk-c) 14%, #090602);
		transition:
			background-color 70ms ease,
			box-shadow 70ms ease;
	}

	.sk-seg.is-buf {
		background: color-mix(in srgb, var(--sk-c) 28%, #0d0802);
	}

	.sk-seg.is-hover {
		background: color-mix(in srgb, var(--sk-c) 48%, transparent);
	}

	.sk-seg.is-lit {
		background: var(--sk-c);
		box-shadow: 0 0 6px color-mix(in srgb, var(--sk-c) 65%, transparent);
	}

	.eva-seek.is-full .eva-seek__track {
		box-shadow:
			0 0 8px color-mix(in srgb, var(--sk-c) 45%, transparent),
			0 0 16px color-mix(in srgb, var(--sk-c) 22%, transparent);
	}

	.eva-seek.is-full .sk-seg.is-lit {
		background: color-mix(in srgb, var(--sk-c) 88%, #ffffff);
		box-shadow: 0 0 5px color-mix(in srgb, var(--sk-c) 60%, transparent);
	}

	.eva-seek.is-full .eva-seek__head {
		box-shadow:
			0 0 5px #ffffff,
			0 0 11px color-mix(in srgb, var(--sk-c) 75%, transparent);
	}

	.eva-seek__head {
		position: absolute;
		top: -3px;
		bottom: -3px;
		width: 3px;
		transform: translateX(-50%);
		background: #ffffff;
		border-radius: 1px;
		box-shadow:
			0 0 4px #ffffff,
			0 0 10px var(--sk-c);
		pointer-events: none;
	}

	.eva-seek.is-compact .eva-seek__head {
		top: -2px;
		bottom: -2px;
		width: 2px;
	}

	.eva-seek__tooltip {
		position: absolute;
		bottom: calc(100% + 6px);
		transform: translateX(-50%);
		padding: 0.08rem 0.36rem;
		background: #000000;
		border: 1px solid var(--sk-c);
		border-radius: 3px;
		color: #ffffff;
		font-size: 0.68rem;
		line-height: 1.15;
		letter-spacing: 0.04em;
		white-space: nowrap;
		pointer-events: none;
		z-index: 4;
		box-shadow: 0 0 8px color-mix(in srgb, var(--sk-c) 45%, transparent);
	}

	.eva-seek__ruler {
		padding: 0 2px;
		opacity: 0.85;
	}
</style>
