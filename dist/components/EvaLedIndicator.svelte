<svelte:options customElement={{ tag: 'eva-led-indicator', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		label?: string;
		jpTag?: string;
		state?: 'on' | 'off' | 'warn' | 'crit' | 'info';
		pulse?: boolean;
		minWidth?: string;
	}

	let {
		label = 'NOMINAL',
		jpTag = '',
		state = 'on',
		pulse = false,
		minWidth = ''
	}: Props = $props();

	const colorMap: Record<NonNullable<Props['state']>, string> = {
		on: '#46f76a',
		off: 'rgba(255, 148, 26, 0.45)',
		warn: '#fff275',
		crit: '#ff2222',
		info: '#72f7ff'
	};

	const activeColor = $derived(colorMap[state]);
</script>

<span
	class="eva-led is-{state}"
	class:is-pulse={pulse && state !== 'off'}
	style="--led-c: {activeColor}; {minWidth ? `min-width: ${minWidth}; justify-content: center;` : ''}"
>
	<svg viewBox="0 0 5 13" class="led-bar" aria-hidden="true">
		<rect x="0" y="0" width="5" height="13" rx="1" fill="currentColor" />
	</svg>
	{#if jpTag}
		<span class="led-jp">{jpTag}</span>
	{/if}
	<span class="led-txt eva-display">{label}</span>
</span>

<style>
	.eva-led {
		display: inline-flex;
		align-items: center;
		gap: 0.38rem;
		padding: 0.16rem 0.56rem;
		background: #000000;
		border: 1.5px solid var(--led-c);
		outline: 1px solid color-mix(in srgb, var(--led-c) 45%, transparent);
		outline-offset: 1px;
		border-radius: 4px;
		color: var(--led-c);
		white-space: nowrap;
	}

	.eva-led:not(.is-off) {
		box-shadow: 0 0 10px color-mix(in srgb, var(--led-c) 30%, transparent);
	}

	.led-bar {
		width: 4px;
		height: 11px;
		display: block;
		flex-shrink: 0;
	}

	.eva-led:not(.is-off) .led-bar {
		filter: drop-shadow(0 0 4px var(--led-c));
	}

	.eva-led.is-pulse .led-bar {
		animation: eva-led-blink 1.1s steps(2, start) infinite;
	}

	@keyframes eva-led-blink {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0.25;
		}
	}

	.led-jp {
		font-size: 0.68rem;
		font-weight: 800;
		opacity: 0.9;
	}

	.led-txt {
		font-size: 0.78rem;
		letter-spacing: 0.04em;
		color: inherit;
		text-shadow: 0 0 6px color-mix(in srgb, var(--led-c) 45%, transparent);
	}

	.eva-led.is-off .led-txt {
		text-shadow: none;
	}
</style>
