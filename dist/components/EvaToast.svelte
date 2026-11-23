<svelte:options customElement={{ tag: 'eva-toast', shadow: 'none' }} />

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { evaTransition, type EvaTransitionOption } from '../transitions';
	import EvaHazardStrip from './EvaHazardStrip.svelte';

	export interface ToastItem {
		id: string;
		title: string;
		message?: string;
		severity?: 'info' | 'warning' | 'emergency' | 'nominal';
		phosphor?: boolean | 'gold' | 'severity';
		duration?: number;
		transition?: EvaTransitionOption;
	}

	interface Props {
		toasts?: ToastItem[];
		phosphor?: boolean | 'gold' | 'severity';
		defaultDuration?: number;
		transition?: EvaTransitionOption;
		onDismiss?: (id: string) => void;
	}

	let {
		toasts = $bindable([]),
		phosphor,
		defaultDuration = 5000,
		transition = 'glitch',
		onDismiss
	}: Props = $props();

	const timers = new Map<string, ReturnType<typeof setTimeout>>();

	function phosphorMode(toast: ToastItem): 'gold' | 'severity' | false {
		const p = toast.phosphor ?? phosphor ?? (toast.severity === 'emergency' ? 'gold' : false);
		if (p === true || p === 'gold') return 'gold';
		if (p === 'severity') return 'severity';
		return false;
	}

	function dismiss(id: string) {
		const timer = timers.get(id);
		if (timer) {
			clearTimeout(timer);
			timers.delete(id);
		}
		toasts = toasts.filter((t) => t.id !== id);
		onDismiss?.(id);
	}

	$effect(() => {
		const activeIds = new Set(toasts.map((t) => t.id));
		for (const [id, timer] of timers) {
			if (!activeIds.has(id)) {
				clearTimeout(timer);
				timers.delete(id);
			}
		}
		for (const toast of toasts) {
			if (!timers.has(toast.id)) {
				const ms = toast.duration ?? defaultDuration;
				if (ms > 0) {
					const id = toast.id;
					timers.set(
						id,
						setTimeout(() => dismiss(id), ms)
					);
				}
			}
		}
	});

	onDestroy(() => {
		for (const timer of timers.values()) clearTimeout(timer);
		timers.clear();
	});
</script>

<div class="eva-toast-stack" role="status" aria-live="polite">
	{#each toasts as toast (toast.id)}
		{@const pMode = phosphorMode(toast)}
		<div
			class="eva-toast is-{toast.severity ?? 'info'}"
			transition:evaTransition={toast.transition ?? transition}
		>
				<EvaHazardStrip direction="chevron" color="var(--tc)" height="6px" stripeWidth={6} />
				<div class="eva-toast__row">
					<div class="eva-toast__body">
						<strong class="eva-display">{toast.title}</strong>
						{#if toast.message}
							<span
								class="eva-toast__msg"
								class:is-phosphor-gold={pMode === 'gold'}
								class:is-phosphor-severity={pMode === 'severity'}
							>
								{toast.message}
							</span>
						{/if}
					</div>
					<button type="button" class="eva-toast__close" onclick={() => dismiss(toast.id)} aria-label="Dismiss">
						×
					</button>
				</div>
			</div>
		{/each}
</div>

<style>
	.eva-toast-stack {
		position: fixed;
		bottom: 1.25rem;
		right: 1.25rem;
		z-index: 9995;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		max-width: 360px;
		width: calc(100vw - 2.5rem);
		pointer-events: none;
	}

	.eva-toast {
		pointer-events: auto;
		--tc: var(--eva-primary);
		background: #000000;
		border: 1.5px solid var(--tc);
		outline: 1px solid color-mix(in srgb, var(--tc) 55%, transparent);
		outline-offset: 2px;
		border-radius: 5px;
		color: var(--eva-text-hi);
		box-shadow: 0 0 18px color-mix(in srgb, var(--tc) 25%, transparent);
	}

	.eva-toast.is-info {
		--tc: #72f7ff;
	}
	.eva-toast.is-warning {
		--tc: #ff941a;
	}
	.eva-toast.is-emergency {
		--tc: #ff2222;
	}
	.eva-toast.is-nominal {
		--tc: #46f76a;
	}

	.eva-toast__row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.55rem 0.75rem;
	}

	.eva-toast__body {
		display: flex;
		flex-direction: column;
		gap: 0.16rem;
	}

	.eva-toast__body strong {
		font-family: var(--eva-font-display);
		font-size: 1.05rem;
		color: var(--tc);
		text-shadow: 0 0 8px color-mix(in srgb, var(--tc) 45%, transparent);
	}

	.eva-toast__msg {
		font-family: var(--eva-font-sans);
		font-size: 0.84rem;
		font-weight: 600;
		color: var(--eva-text-muted);
	}

	.eva-toast__msg.is-phosphor-gold {
		color: var(--eva-gold, #fff275);
		text-shadow:
			0 0 8px rgba(255, 242, 117, 0.55),
			0 0 2px rgba(255, 249, 184, 0.75);
	}

	.eva-toast__msg.is-phosphor-severity {
		color: color-mix(in srgb, var(--tc) 55%, #ffffff);
		text-shadow:
			0 0 6px color-mix(in srgb, var(--tc) 85%, transparent),
			0 0 14px color-mix(in srgb, var(--tc) 45%, transparent);
	}

	.eva-toast__close {
		background: #000000;
		border: 1.5px solid var(--tc);
		border-radius: 3px;
		color: var(--tc);
		font-family: var(--eva-font-num);
		font-size: 0.9rem;
		font-weight: 700;
		padding: 0 0.42rem;
		cursor: pointer;
	}

	.eva-toast__close:hover {
		background: var(--tc);
		color: #000000;
	}
</style>
