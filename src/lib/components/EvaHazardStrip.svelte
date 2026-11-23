<svelte:options customElement={{ tag: 'eva-hazard-strip', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		direction?: 'left' | 'right' | 'chevron';
		color?: string;
		bg?: string;
		height?: string;
		stripeWidth?: number;
		animated?: boolean;
		centerTag?: string;
	}

	let {
		direction = 'chevron',
		color = 'var(--eva-accent, #ff2222)',
		bg = '#000000',
		height = '10px',
		stripeWidth = 8,
		animated = false,
		centerTag = ''
	}: Props = $props();

	const tileSize = $derived((stripeWidth * 2 * Math.SQRT2).toFixed(2));
</script>

<div
	class="eva-hz-strip is-{direction}"
	class:is-animated={animated}
	style="--hz-c: {color}; --hz-bg: {bg}; --hz-h: {height}; --hz-w: {stripeWidth}px; --hz-tile: {tileSize}px;"
	aria-hidden="true"
>
	{#if direction === 'chevron'}
		<div class="hz-half is-l"></div>
		<div class="hz-half is-r"></div>
		{#if centerTag}
			<span class="hz-cutout">{centerTag}</span>
		{/if}
	{:else}
		<div class="hz-single is-{direction}"></div>
	{/if}
</div>

<style>
	.eva-hz-strip {
		position: relative;
		display: grid;
		grid-template-columns: 1fr;
		height: var(--hz-h);
		width: 100%;
		background: var(--hz-bg);
		overflow: hidden;
		flex-shrink: 0;
	}

	.eva-hz-strip.is-chevron {
		grid-template-columns: 1fr 1fr;
	}

	.hz-half,
	.hz-single {
		width: 100%;
		height: 100%;
	}

	/* Seamless full-element repeating gradients when static (any angle renders cleanly without tile seams) */
	.hz-half.is-l,
	.hz-single.is-left {
		background: repeating-linear-gradient(
			45deg,
			var(--hz-c),
			var(--hz-c) var(--hz-w),
			var(--hz-bg) var(--hz-w),
			var(--hz-bg) calc(var(--hz-w) * 2)
		);
	}

	.hz-single.is-right {
		background: repeating-linear-gradient(
			-55deg,
			var(--hz-c),
			var(--hz-c) var(--hz-w),
			var(--hz-bg) var(--hz-w),
			var(--hz-bg) calc(var(--hz-w) * 2)
		);
	}

	.eva-hz-strip.is-chevron .hz-half.is-r {
		background: repeating-linear-gradient(
			-45deg,
			var(--hz-c),
			var(--hz-c) var(--hz-w),
			var(--hz-bg) var(--hz-w),
			var(--hz-bg) calc(var(--hz-w) * 2)
		);
	}

	/* Apply square 45deg tile ONLY when scrolling animation is active */
	.eva-hz-strip.is-animated .hz-half.is-l,
	.eva-hz-strip.is-animated .hz-single.is-left {
		background-size: var(--hz-tile) var(--hz-tile);
		animation: hz-scroll-r 1.6s linear infinite;
	}

	.eva-hz-strip.is-animated .hz-half.is-r {
		background-size: var(--hz-tile) var(--hz-tile);
		animation: hz-scroll-l 1.6s linear infinite;
	}

	.eva-hz-strip.is-animated .hz-single.is-right {
		background: repeating-linear-gradient(
			-45deg,
			var(--hz-c),
			var(--hz-c) var(--hz-w),
			var(--hz-bg) var(--hz-w),
			var(--hz-bg) calc(var(--hz-w) * 2)
		);
		background-size: var(--hz-tile) var(--hz-tile);
		animation: hz-scroll-l 1.6s linear infinite;
	}

	@keyframes hz-scroll-r {
		from {
			background-position: 0 0;
		}
		to {
			background-position: var(--hz-tile) 0;
		}
	}

	@keyframes hz-scroll-l {
		from {
			background-position: 0 0;
		}
		to {
			background-position: calc(var(--hz-tile) * -1) 0;
		}
	}

	.hz-cutout {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		padding: 0.05rem 0.72rem;
		background: var(--hz-bg);
		color: var(--hz-c);
		font-weight: 900;
		font-size: 0.76rem;
		letter-spacing: 0.14em;
		text-shadow: 0 0 8px color-mix(in srgb, var(--hz-c) 55%, transparent);
		border-left: 2px solid var(--hz-bg);
		border-right: 2px solid var(--hz-bg);
		white-space: nowrap;
	}
</style>
