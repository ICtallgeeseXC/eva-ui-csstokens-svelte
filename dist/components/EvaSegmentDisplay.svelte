<svelte:options customElement={{ tag: 'eva-segment-display', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		value?: string;
		critical?: boolean;
		flash?: boolean;
		digitWidth?: number;
		digitHeight?: number;
		skew?: number;
	}

	let {
		value = '05:00:00',
		critical = false,
		flash = false,
		digitWidth = 32,
		digitHeight = 54,
		skew = -6
	}: Props = $props();

	// 7-segment bitmask: [a, b, c, d, e, f, g]
	const SEGMENTS: Record<string, number[]> = {
		'0': [1, 1, 1, 1, 1, 1, 0],
		'1': [0, 1, 1, 0, 0, 0, 0],
		'2': [1, 1, 0, 1, 1, 0, 1],
		'3': [1, 1, 1, 1, 0, 0, 1],
		'4': [0, 1, 1, 0, 0, 1, 1],
		'5': [1, 0, 1, 1, 0, 1, 1],
		'6': [1, 0, 1, 1, 1, 1, 1],
		'7': [1, 1, 1, 0, 0, 0, 0],
		'8': [1, 1, 1, 1, 1, 1, 1],
		'9': [1, 1, 1, 1, 0, 1, 1],
		'-': [0, 0, 0, 0, 0, 0, 1],
		' ': [0, 0, 0, 0, 0, 0, 0]
	};

	const SEG_POLYS = [
		'8,3 34,3 30,9 12,9', // a (top)
		'35,5 39,9 37,33 32,30 33,10', // b (top-right)
		'32,39 37,36 35,61 30,65 29,43', // c (bottom-right)
		'10,61 28,61 32,67 6,67', // d (bottom)
		'5,36 10,39 9,60 4,64 3,40', // e (bottom-left)
		'6,9 11,12 10,31 5,34 4,11', // f (top-left)
		'11,32 31,32 34,35 31,38 11,38 8,35' // g (middle)
	];

	const chars = $derived(value.split(''));
</script>

<div
	class="eva-seg-row"
	class:is-critical={critical}
	class:is-flash={flash}
	style="transform: skewX({skew}deg)"
	aria-label={value}
>
	{#each chars as ch, idx (idx)}
		{#if ch === ':'}
			<svg
				viewBox="0 0 14 70"
				class="seg-colon"
				style="width: {Math.round(digitWidth * 0.31)}px; height: {digitHeight}px;"
				aria-hidden="true"
			>
				<rect x="4" y="20" width="6" height="7" />
				<rect x="4" y="45" width="6" height="7" />
			</svg>
		{:else if ch === '.'}
			<svg
				viewBox="0 0 14 70"
				class="seg-colon"
				style="width: {Math.round(digitWidth * 0.31)}px; height: {digitHeight}px;"
				aria-hidden="true"
			>
				<rect x="4" y="58" width="6" height="7" />
			</svg>
		{:else}
			{@const mask = SEGMENTS[ch] ?? SEGMENTS[' ']}
			<svg
				viewBox="0 0 42 70"
				class="seg-digit"
				style="width: {digitWidth}px; height: {digitHeight}px;"
				aria-hidden="true"
			>
				{#each SEG_POLYS as pts, sIdx}
					<polygon points={pts} class:is-on={mask[sIdx] === 1} />
				{/each}
			</svg>
		{/if}
	{/each}
</div>

<style>
	.eva-seg-row {
		--seg-color: var(--eva-seg-color, #ff941a);
		display: inline-flex;
		align-items: center;
		gap: 2px;
		padding: 0.25rem 0.2rem;
	}

	.eva-seg-row.is-critical {
		--seg-color: #ff2222;
	}

	.eva-seg-row.is-flash {
		animation: eva-seg-flash 0.8s steps(2, start) infinite;
	}

	@keyframes eva-seg-flash {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0.16;
		}
	}

	.seg-digit,
	.seg-colon {
		flex-shrink: 0;
	}

	.seg-digit polygon {
		fill: rgba(255, 148, 26, 0.09);
	}

	.seg-digit polygon.is-on {
		fill: var(--seg-color);
		filter: drop-shadow(0 0 4px color-mix(in srgb, var(--seg-color) 45%, transparent));
	}

	.seg-colon rect {
		fill: var(--seg-color);
	}
</style>
