<svelte:options customElement={{ tag: 'eva-chamfer-box', shadow: 'none' }} />

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		cut?: number;
		borderWidth?: number;
		color?: string;
		bg?: string;
		filled?: boolean;
		hatched?: boolean;
		clickable?: boolean;
		disabled?: boolean;
		minHeight?: string;
		padding?: string;
		eyebrow?: string;
		title?: string;
		subtitle?: string;
		onclick?: () => void;
		children?: Snippet;
	}

	let {
		cut = 12,
		borderWidth = 2,
		color = 'var(--eva-border-strong, #ff941a)',
		bg = '#000000',
		filled = false,
		hatched = false,
		clickable = false,
		disabled = false,
		minHeight = 'auto',
		padding = '0.6rem 0.75rem',
		eyebrow = '',
		title = '',
		subtitle = '',
		onclick,
		children
	}: Props = $props();

	const innerCut = $derived(Math.max(2, cut - 1));
	const outerPoly = $derived(
		`polygon(${cut}px 0%, calc(100% - ${cut}px) 0%, 100% ${cut}px, 100% calc(100% - ${cut}px), calc(100% - ${cut}px) 100%, ${cut}px 100%, 0% calc(100% - ${cut}px), 0% ${cut}px)`
	);
	const innerPoly = $derived(
		`polygon(${innerCut}px 0%, calc(100% - ${innerCut}px) 0%, 100% ${innerCut}px, 100% calc(100% - ${innerCut}px), calc(100% - ${innerCut}px) 100%, ${innerCut}px 100%, 0% calc(100% - ${innerCut}px), 0% ${innerCut}px)`
	);
</script>

{#if clickable}
	<button
		type="button"
		class="eva-chbox is-clickable"
		class:is-filled={filled}
		class:is-hatched={hatched}
		{disabled}
		{onclick}
		style="--ch-c: {color}; --ch-bg: {bg}; --ch-bw: {borderWidth}px; --ch-mh: {minHeight}; --ch-pad: {padding}; clip-path: {outerPoly};"
	>
		<span class="eva-chbox__in" style="clip-path: {innerPoly};">
			{#if eyebrow}
				<span class="eva-chbox__eyebrow">{eyebrow}</span>
			{/if}
			{#if title}
				<span class="eva-chbox__title eva-display">{title}</span>
			{/if}
			{#if subtitle}
				<span class="eva-chbox__sub">{subtitle}</span>
			{/if}
			{#if children}
				{@render children()}
			{/if}
		</span>
	</button>
{:else}
	<div
		class="eva-chbox"
		class:is-filled={filled}
		class:is-hatched={hatched}
		style="--ch-c: {color}; --ch-bg: {bg}; --ch-bw: {borderWidth}px; --ch-mh: {minHeight}; --ch-pad: {padding}; clip-path: {outerPoly};"
	>
		<div class="eva-chbox__in" style="clip-path: {innerPoly};">
			{#if eyebrow}
				<span class="eva-chbox__eyebrow">{eyebrow}</span>
			{/if}
			{#if title}
				<span class="eva-chbox__title eva-display">{title}</span>
			{/if}
			{#if subtitle}
				<span class="eva-chbox__sub">{subtitle}</span>
			{/if}
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>
{/if}

<style>
	.eva-chbox {
		width: 100%;
		padding: var(--ch-bw);
		border: none;
		background: var(--ch-c);
		box-sizing: border-box;
		text-align: center;
		display: block;
	}

	.eva-chbox.is-clickable {
		cursor: pointer;
		transition:
			transform 90ms ease,
			filter 120ms ease;
	}

	.eva-chbox.is-clickable:hover:not(:disabled) {
		filter: brightness(1.12);
		transform: scale(1.015);
	}

	.eva-chbox.is-clickable:disabled {
		cursor: default;
	}

	.eva-chbox__in {
		width: 100%;
		min-height: var(--ch-mh);
		padding: var(--ch-pad);
		background: var(--ch-bg);
		color: var(--ch-c);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.2rem;
		box-sizing: border-box;
	}

	.eva-chbox.is-filled .eva-chbox__in {
		background: var(--ch-c);
		color: #050507;
	}

	.eva-chbox.is-hatched .eva-chbox__in {
		background: repeating-linear-gradient(
			-45deg,
			color-mix(in srgb, var(--ch-c) 16%, transparent),
			color-mix(in srgb, var(--ch-c) 16%, transparent) 8px,
			#090b10 8px,
			#090b10 16px
		);
		background-size: 22.6px 22.6px;
		animation: eva-chbox-hatch 1.1s linear infinite;
	}

	@keyframes eva-chbox-hatch {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 22.6px 0;
		}
	}

	.eva-chbox__eyebrow {
		font-family: var(--eva-font-display);
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		opacity: 0.78;
		line-height: 1;
	}

	.eva-chbox__title {
		font-size: 1.15rem;
		letter-spacing: 0.04em;
		line-height: 1;
		text-shadow: none;
	}

	.eva-chbox__sub {
		font-family: var(--eva-font-display);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		opacity: 0.96;
	}
</style>
