<svelte:options customElement={{ tag: 'eva-capsule-pill', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		orientation?: 'vertical' | 'horizontal';
		color?: string;
		width?: string;
		height?: string;
		active?: boolean;
		pulse?: boolean;
	}

	let {
		orientation = 'vertical',
		color = 'var(--eva-border-strong, #ff941a)',
		width,
		height,
		active = true,
		pulse = false
	}: Props = $props();

	const w = $derived(width ?? (orientation === 'vertical' ? '5px' : '24px'));
	const h = $derived(height ?? (orientation === 'vertical' ? '100%' : '4px'));
</script>

<span
	class="eva-cap-pill"
	class:is-active={active}
	class:is-pulse={pulse && active}
	style="--pill-c: {color}; width: {w}; height: {h};"
	aria-hidden="true"
></span>

<style>
	.eva-cap-pill {
		display: inline-block;
		flex-shrink: 0;
		min-height: 4px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--pill-c) 30%, transparent);
		transition:
			background-color 120ms ease,
			box-shadow 120ms ease;
	}

	.eva-cap-pill.is-active {
		background: var(--pill-c);
		box-shadow:
			0 0 6px var(--pill-c),
			0 0 12px color-mix(in srgb, var(--pill-c) 45%, transparent);
	}

	.eva-cap-pill.is-pulse {
		animation: eva-pill-pulse 1.4s ease-in-out infinite;
	}

	@keyframes eva-pill-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.45;
		}
	}
</style>
