<svelte:options customElement={{ tag: 'eva-panel', shadow: 'none' }} />

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import EvaCapsulePill from './EvaCapsulePill.svelte';
	import EvaHazardStrip from './EvaHazardStrip.svelte';

	interface Props {
		title?: string;
		code?: string;
		status?: string;
		variant?: 'default' | 'alert' | 'elevated';
		scanlines?: boolean;
		hazardTop?: boolean;
		children?: Snippet;
		actions?: Snippet;
	}

	let {
		title = '',
		code = 'NERV-00',
		status = '',
		variant = 'default',
		scanlines = true,
		hazardTop = false,
		children,
		actions
	}: Props = $props();

	let titleBoxEl = $state<HTMLHeadingElement | null>(null);
	let titleTextEl = $state<HTMLSpanElement | null>(null);
	let overflowDist = $state(0);

	function measureTitleOverflow() {
		if (!titleBoxEl || !titleTextEl) {
			overflowDist = 0;
			return;
		}
		const diff = Math.ceil(titleTextEl.scrollWidth - titleBoxEl.clientWidth);
		overflowDist = diff > 2 ? diff + 8 : 0;
	}

	onMount(() => {
		measureTitleOverflow();
		const ro = new ResizeObserver(measureTitleOverflow);
		if (titleBoxEl) ro.observe(titleBoxEl);
		if (titleTextEl) ro.observe(titleTextEl);
		return () => ro.disconnect();
	});

	$effect(() => {
		title;
		requestAnimationFrame(measureTitleOverflow);
	});
</script>

<section
	class="eva-panel"
	class:eva-scanlines={scanlines}
	class:is-alert={variant === 'alert'}
	class:is-elevated={variant === 'elevated'}
>
	{#if hazardTop}
		<div class="eva-panel__hazard">
			<EvaHazardStrip
				direction="left"
				color={variant === 'alert' ? 'var(--eva-accent)' : 'var(--eva-border-strong)'}
				height="7px"
				stripeWidth={10}
				animated
			/>
		</div>
	{/if}

	{#if title || code || status || actions}
		<header class="eva-panel__header">
			<EvaCapsulePill color={variant === 'alert' ? 'var(--eva-accent)' : 'var(--eva-border-strong)'} width="5px" />
			<div class="eva-panel__frame">
				<div class="eva-panel__title-row">
					<div class="eva-panel__title-group">
						{#if code}
							<span class="eva-panel__code">{code}</span>
						{/if}
						{#if title}
							<h3
								class="eva-panel__title eva-display"
								class:is-overflow={overflowDist > 0}
								bind:this={titleBoxEl}
								style={overflowDist > 0
									? `--pan-dist: -${overflowDist}px; --pan-dur: ${Math.max(4.5, overflowDist * 0.055 + 2.4).toFixed(2)}s;`
									: ''}
								title={overflowDist > 0 ? title : undefined}
							>
								<span class="eva-panel__title-text" bind:this={titleTextEl}>{title}</span>
							</h3>
						{/if}
					</div>
					<div class="eva-panel__right">
						{#if status}
							<span class="eva-badge">{status}</span>
						{/if}
						{#if actions}
							{@render actions()}
						{/if}
					</div>
				</div>
			</div>
			<EvaCapsulePill color={variant === 'alert' ? 'var(--eva-accent)' : 'var(--eva-border-strong)'} width="5px" />
		</header>
	{/if}

	<div class="eva-panel__body">
		{#if children}
			{@render children()}
		{/if}
	</div>
</section>

<style>
	.eva-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: var(--eva-radius-frame);
		box-shadow:
			0 0 14px var(--eva-primary-dim),
			inset 0 0 18px rgba(255, 148, 26, 0.05);
		color: var(--eva-text-hi);
		overflow: visible;
	}

	.eva-panel.is-elevated {
		background: #040507;
	}

	.eva-panel.is-alert {
		border-color: var(--eva-accent);
		outline-color: rgba(255, 34, 34, 0.65);
		box-shadow:
			0 0 18px rgba(255, 34, 34, 0.28),
			inset 0 0 24px var(--eva-accent-dim);
	}

	.eva-panel__hazard {
		height: 7px;
		width: 100%;
		border-bottom: 1.5px solid var(--eva-border-strong);
	}

	.eva-panel__header {
		position: relative;
		display: flex;
		align-items: stretch;
		gap: 0.45rem;
		padding: 0.5rem 0.65rem;
		background: #000000;
		border-bottom: 1.5px solid var(--eva-border-strong);
	}

	.eva-panel.is-alert .eva-panel__header {
		border-bottom-color: var(--eva-accent);
	}

	.eva-panel__frame {
		flex: 1;
		min-width: 0;
		border: 1px solid var(--eva-border);
		border-radius: 4px;
		padding: 0.3rem 0.6rem;
		background: linear-gradient(180deg, rgba(255, 148, 26, 0.06) 0%, #000000 100%);
	}

	.eva-panel.is-alert .eva-panel__frame {
		border-color: rgba(255, 34, 34, 0.65);
		background: linear-gradient(180deg, rgba(255, 34, 34, 0.1) 0%, #000000 100%);
	}

	.eva-panel__title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
	}

	.eva-panel__title-group {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		min-width: 0;
	}

	.eva-panel__code {
		font-family: var(--eva-font-num);
		font-size: 0.85rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		padding: 0.08rem 0.45rem;
		background: #000000;
		color: var(--eva-primary);
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 3px;
		letter-spacing: 0.04em;
		text-shadow: var(--eva-bloom);
		flex-shrink: 0;
	}

	.eva-panel.is-alert .eva-panel__code {
		color: var(--eva-accent);
		border-color: var(--eva-accent);
		text-shadow: 0 0 8px rgba(255, 34, 34, 0.5);
	}

	.eva-panel__title {
		margin: 0;
		flex: 1;
		min-width: 0;
		font-size: 1.12rem;
		color: var(--eva-primary);
		white-space: nowrap;
		overflow: hidden;
		letter-spacing: 0.025em;
	}

	.eva-panel__title-text {
		display: inline-block;
		white-space: nowrap;
	}

	.eva-panel__title.is-overflow {
		mask-image: linear-gradient(90deg, #000000 0%, #000000 calc(100% - 14px), transparent 100%);
	}

	.eva-panel__title.is-overflow .eva-panel__title-text {
		will-change: transform;
		animation: eva-title-pan var(--pan-dur, 6s) ease-in-out infinite;
	}

	.eva-panel__title.is-overflow:hover .eva-panel__title-text {
		animation-play-state: paused;
	}

	@keyframes eva-title-pan {
		0%,
		18% {
			transform: translate3d(0, 0, 0);
		}
		48%,
		68% {
			transform: translate3d(var(--pan-dist, 0px), 0, 0);
		}
		96%,
		100% {
			transform: translate3d(0, 0, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.eva-panel__title.is-overflow {
			mask-image: none;
			text-overflow: ellipsis;
		}
		.eva-panel__title.is-overflow .eva-panel__title-text {
			animation: none;
		}
	}

	.eva-panel.is-alert .eva-panel__title {
		color: var(--eva-accent);
		text-shadow: 0 0 10px rgba(255, 34, 34, 0.5);
	}

	.eva-panel__right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.eva-panel__body {
		position: relative;
		z-index: 1;
		padding: 0.9rem;
		flex: 1;
		display: flex;
		flex-direction: column;
	}
</style>
