<svelte:options customElement={{ tag: 'eva-clock-timer', shadow: 'none' }} />

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import EvaModeStrip from './EvaModeStrip.svelte';
	import EvaSegmentDisplay from './EvaSegmentDisplay.svelte';
	import EvaStatusTag from './EvaStatusTag.svelte';
	import EvaTransportButton from './EvaTransportButton.svelte';

	interface Props {
		mode?: 'countdown' | 'clock';
		initialSeconds?: number;
		label?: string;
		running?: boolean;
	}

	let {
		mode = 'countdown',
		initialSeconds = 300,
		label = 'ACTIVE TIME REMAINING:',
		running = $bindable(true)
	}: Props = $props();

	let remainingMs = $state(untrack(() => initialSeconds * 1000));
	let now = $state(new Date());

	onMount(() => {
		let last = performance.now();
		let raf = 0;
		const tick = (t: number) => {
			const dt = t - last;
			last = t;
			if (mode === 'countdown' && running && remainingMs > 0) {
				remainingMs = Math.max(0, remainingMs - dt);
				if (remainingMs === 0) {
					running = false;
				}
			} else if (mode === 'clock') {
				now = new Date();
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	const timeString = $derived.by(() => {
		if (mode === 'clock') {
			const h = String(now.getHours()).padStart(2, '0');
			const m = String(now.getMinutes()).padStart(2, '0');
			const s = String(now.getSeconds()).padStart(2, '0');
			return `${h}:${m}:${s}`;
		}
		const totalSec = Math.floor(remainingMs / 1000);
		const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
		const secs = String(totalSec % 60).padStart(2, '0');
		const cs = String(Math.floor((remainingMs % 1000) / 10)).padStart(2, '0');
		return `${mins}:${secs}:${cs}`;
	});

	const isCritical = $derived(mode === 'countdown' && remainingMs <= 60_000);
	const isDepleted = $derived(mode === 'countdown' && remainingMs === 0);
	const speedMode = $derived(
		mode === 'clock' ? 'NORMAL' : !running || remainingMs === 0 ? 'STOP' : 'RACING'
	);

	function reset() {
		remainingMs = initialSeconds * 1000;
	}
</script>

<div class="eva-timer" class:is-critical={isCritical}>
	<div class="eva-timer__main-row">
		<div class="eva-timer__left">
			<EvaStatusTag variant="pill" jpLabel="活動限界まで あと" {label} critical={isCritical} />
			<EvaSegmentDisplay value={timeString} critical={isCritical} flash={isDepleted} />
		</div>

		<div class="eva-timer__right">
			<EvaStatusTag
				variant="striped"
				jpLabel="内部"
				label={mode === 'clock' ? 'LOCAL' : 'INTERNAL'}
				critical={isCritical}
			/>
			<EvaStatusTag
				variant="stacked"
				jpLabel="主電源供給システム"
				label="MAIN ENERGY SUPPLY SYSTEM"
				critical={isCritical}
			/>
		</div>
	</div>

	<div class="eva-timer__footer">
		<EvaModeStrip active={speedMode} critical={isCritical} />

		{#if mode === 'countdown'}
			<div class="eva-timer__controls">
				<EvaTransportButton bind:playing={running} label="RUN / PAUSE" minWidth="118px" />
				<button type="button" class="eva-btn reset-btn" onclick={reset}>RESET 05:00</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.eva-timer {
		--t-color: #ff941a;
		background: #000000;
		border: 1.5px solid var(--t-color);
		outline: 1px solid color-mix(in srgb, var(--t-color) 55%, transparent);
		outline-offset: 2px;
		border-radius: 5px;
		padding: 0.7rem 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		box-shadow: 0 0 14px rgba(255, 148, 26, 0.14);
	}

	.eva-timer.is-critical {
		--t-color: #ff2222;
		box-shadow:
			inset 0 0 26px rgba(255, 34, 34, 0.24),
			0 0 16px rgba(255, 34, 34, 0.3);
	}

	.eva-timer__main-row {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.85rem;
		align-items: stretch;
	}

	@media (max-width: 560px) {
		.eva-timer__main-row {
			grid-template-columns: 1fr;
		}
	}

	.eva-timer__left {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.4rem;
		min-width: 0;
	}

	.eva-timer__right {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		min-width: 165px;
	}

	.eva-timer__footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.65rem;
		border-top: 1.5px solid var(--t-color);
		padding-top: 0.5rem;
	}

	.eva-timer__controls {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		flex-shrink: 0;
	}

	.reset-btn {
		min-width: 96px;
	}
</style>
