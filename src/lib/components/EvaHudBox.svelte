<svelte:options customElement={{ tag: 'eva-hud-box', shadow: 'none' }} />

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		text?: string;
		subtext?: string;
		eyebrow?: string;
		color?: string;
		borderColor?: string;
		size?: 'xs' | 'sm' | 'md' | 'lg';
		bg?: string;
		width?: string;
		minWidth?: string;
		align?: 'left' | 'center' | 'right';
		mono?: boolean;
		children?: Snippet;
	}

	let {
		text = '',
		subtext = '',
		eyebrow = '',
		color = '#ff941a',
		borderColor,
		size = 'md',
		bg = 'rgba(12, 4, 0, 0.56)',
		width = '',
		minWidth = '',
		align = 'left',
		mono = false,
		children
	}: Props = $props();

	const resolvedBorder = $derived(borderColor ?? color);
</script>

<span
	class="eva-hud-wrap is-{size} align-{align}"
	class:is-fixed={Boolean(width)}
	class:is-mono={mono}
	style="--hb-c: {color}; --hb-bc: {resolvedBorder}; --hb-bg: {bg}; {width ? `--hb-w: ${width};` : ''}"
>
	{#if eyebrow}
		<span class="eva-hud-eyebrow">{eyebrow}</span>
	{/if}
	<span
		class="eva-hud-box"
		class:is-multi={Boolean(subtext)}
		style={minWidth && !width ? `min-width: ${minWidth};` : undefined}
	>
		{#if children}
			{@render children()}
		{:else}
			<span class="eva-hud-line">{text}</span>
			{#if subtext}
				<span class="eva-hud-sub">{subtext}</span>
			{/if}
		{/if}
	</span>
</span>

<style>
	.eva-hud-wrap {
		display: inline-flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.1rem;
		width: fit-content;
		max-width: 100%;
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
		font-feature-settings: 'tnum' 1;
	}

	.eva-hud-wrap.is-fixed {
		width: var(--hb-w);
	}

	.eva-hud-wrap.align-right {
		align-items: flex-end;
	}

	.eva-hud-wrap.align-center {
		align-items: center;
	}

	.eva-hud-eyebrow {
		font-family: "Oswald", "Archivo Narrow", "Arial Narrow", "Barlow Condensed", sans-serif;
		font-size: 0.64rem;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.04em;
		color: var(--hb-c);
		padding-left: 0.14rem;
		text-shadow:
			0 0 4px color-mix(in srgb, var(--hb-c) 90%, transparent),
			0 0 10px color-mix(in srgb, var(--hb-c) 55%, transparent);
		white-space: nowrap;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.eva-hud-box {
		display: inline-flex;
		flex-direction: column;
		align-items: flex-start;
		width: fit-content;
		max-width: 100%;
		box-sizing: border-box;
		background: var(--hb-bg);
		border: 1.8px solid var(--hb-bc);
		border-radius: 5px;
		padding: 0.14rem 0.38rem;
		font-family: "Oswald", "Archivo Narrow", "Arial Narrow", "Barlow Condensed", sans-serif;
		font-size: 0.78rem;
		font-weight: 400;
		line-height: 1.06;
		letter-spacing: 0.02em;
		color: var(--hb-c);
		text-shadow:
			0 0 4px color-mix(in srgb, var(--hb-c) 90%, transparent),
			0 0 10px color-mix(in srgb, var(--hb-c) 55%, transparent);
		box-shadow:
			0 0 7px color-mix(in srgb, var(--hb-bc) 62%, transparent),
			inset 0 0 4px color-mix(in srgb, var(--hb-bc) 24%, transparent);
		white-space: nowrap;
		overflow: hidden;
	}

	.eva-hud-wrap.is-fixed .eva-hud-box {
		width: 100%;
	}

	.eva-hud-wrap.is-mono .eva-hud-box {
		font-family: var(--eva-font-mono, "IBM Plex Mono", ui-monospace, monospace);
		letter-spacing: -0.02em;
	}

	.eva-hud-wrap.align-right .eva-hud-box {
		align-items: flex-end;
	}

	.eva-hud-wrap.align-center .eva-hud-box {
		align-items: center;
	}

	.eva-hud-box.is-multi {
		gap: 0.08rem;
		padding: 0.18rem 0.44rem;
	}

	.eva-hud-line,
	.eva-hud-sub {
		display: block;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
		font-feature-settings: 'tnum' 1;
	}

	.eva-hud-sub {
		font-size: 1.08em;
		font-weight: 700;
		letter-spacing: 0.03em;
	}

	.eva-hud-wrap.is-xs .eva-hud-eyebrow {
		font-size: 0.56rem;
	}

	.eva-hud-wrap.is-xs .eva-hud-box {
		padding: 0.08rem 0.28rem;
		font-size: 0.62rem;
		border-width: 1.4px;
		border-radius: 4px;
	}

	.eva-hud-wrap.is-sm .eva-hud-eyebrow {
		font-size: 0.6rem;
	}

	.eva-hud-wrap.is-sm .eva-hud-box {
		padding: 0.1rem 0.32rem;
		font-size: 0.7rem;
	}

	.eva-hud-wrap.is-lg .eva-hud-eyebrow {
		font-size: 0.7rem;
	}

	.eva-hud-wrap.is-lg .eva-hud-box {
		padding: 0.22rem 0.54rem;
		font-size: 0.9rem;
		border-width: 2px;
	}
</style>
