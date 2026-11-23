<svelte:options customElement={{ tag: 'eva-tooltip', shadow: 'none' }} />

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		text?: string;
		position?: 'top' | 'bottom';
		children?: Snippet;
	}

	let {
		text = 'MAGI SECURITY CLEARANCE REQUIRED',
		position = 'top',
		children
	}: Props = $props();
</script>

<span class="eva-tt-wrap">
	{#if children}
		{@render children()}
	{:else}
		<span class="eva-badge">HOVER FOR INFO</span>
	{/if}
	<span class="eva-tt-bubble is-{position}" role="tooltip">{text}</span>
</span>

<style>
	.eva-tt-wrap {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.eva-tt-bubble {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		white-space: nowrap;
		padding: 0.22rem 0.6rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 1px;
		border-radius: 4px;
		color: var(--eva-primary);
		font-family: var(--eva-font-display);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-shadow: var(--eva-bloom);
		box-shadow: 0 0 12px var(--eva-primary-dim);
		opacity: 0;
		pointer-events: none;
		z-index: 80;
		transition: opacity 100ms ease;
	}

	.eva-tt-bubble.is-top {
		bottom: calc(100% + 6px);
	}

	.eva-tt-bubble.is-bottom {
		top: calc(100% + 6px);
	}

	.eva-tt-wrap:hover .eva-tt-bubble,
	.eva-tt-wrap:focus-within .eva-tt-bubble {
		opacity: 1;
	}
</style>
