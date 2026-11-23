<svelte:options customElement={{ tag: 'eva-reticle', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		target?: string;
		distance?: string;
		locked?: boolean;
		size?: number;
	}

	let {
		target = 'TARGET: ANGEL-04',
		distance = '1,420m',
		locked = true,
		size = 180
	}: Props = $props();
</script>

<div class="eva-reticle" class:is-locked={locked} style="--reticle-size: {size}px;">
	<svg viewBox="0 0 200 200" class="eva-reticle__svg" role="img" aria-label={target}>
		<circle cx="100" cy="100" r="84" class="reticle-ring-outer" />
		<circle cx="100" cy="100" r="52" class="reticle-ring-inner" />
		<circle cx="100" cy="100" r="6" class="reticle-core" />

		<!-- Crosshairs -->
		<line x1="100" y1="6" x2="100" y2="42" class="reticle-axis" />
		<line x1="100" y1="158" x2="100" y2="194" class="reticle-axis" />
		<line x1="6" y1="100" x2="42" y2="100" class="reticle-axis" />
		<line x1="158" y1="100" x2="194" y2="100" class="reticle-axis" />

		<!-- Corner brackets -->
		<polyline points="24,48 24,24 48,24" class="reticle-bracket" />
		<polyline points="152,24 176,24 176,48" class="reticle-bracket" />
		<polyline points="24,152 24,176 48,176" class="reticle-bracket" />
		<polyline points="152,176 176,176 176,152" class="reticle-bracket" />
	</svg>
	<div class="eva-reticle__meta">
		<span>{target}</span>
		<span>{locked ? 'LOCKED' : 'SCANNING'} // {distance}</span>
	</div>
</div>

<style>
	.eva-reticle {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		padding: 0.75rem;
		background: var(--eva-bg);
		border: 1px solid var(--eva-border);
		--ret-color: var(--eva-primary);
	}

	.eva-reticle.is-locked {
		--ret-color: var(--eva-accent);
	}

	.eva-reticle__svg {
		width: var(--reticle-size);
		height: var(--reticle-size);
	}

	.reticle-ring-outer {
		fill: none;
		stroke: var(--ret-color);
		stroke-width: 1.5;
		stroke-dasharray: 10 6;
		transform-origin: 100px 100px;
		animation: eva-spin 18s linear infinite;
	}

	.reticle-ring-inner {
		fill: none;
		stroke: var(--eva-primary);
		stroke-width: 1.25;
	}

	.reticle-core {
		fill: var(--ret-color);
	}

	.reticle-axis,
	.reticle-bracket {
		fill: none;
		stroke: var(--ret-color);
		stroke-width: 1.75;
	}

	.eva-reticle__meta {
		display: flex;
		width: 100%;
		justify-content: space-between;
		gap: 0.75rem;
		font-family: var(--eva-font-mono);
		font-size: 0.7rem;
		color: var(--ret-color);
		letter-spacing: 0.08em;
	}

	@keyframes eva-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
