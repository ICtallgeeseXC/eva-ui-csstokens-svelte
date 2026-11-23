<svelte:options customElement={{ tag: 'eva-triad-grid', shadow: 'none' }} />

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		gap?: string;
		top?: Snippet;
		bottomLeft?: Snippet;
		bottomRight?: Snippet;
		children?: Snippet;
	}

	let {
		gap = '0.65rem',
		top,
		bottomLeft,
		bottomRight,
		children
	}: Props = $props();
</script>

<div class="eva-triad" style="--tri-gap: {gap}">
	{#if top || bottomLeft || bottomRight}
		{#if top}
			<div class="tri-slot is-top">
				{@render top()}
			</div>
		{/if}
		{#if bottomLeft}
			<div class="tri-slot">
				{@render bottomLeft()}
			</div>
		{/if}
		{#if bottomRight}
			<div class="tri-slot">
				{@render bottomRight()}
			</div>
		{/if}
	{:else if children}
		{@render children()}
	{/if}
</div>

<style>
	.eva-triad {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto;
		gap: var(--tri-gap);
	}

	.tri-slot {
		width: 100%;
	}

	.tri-slot.is-top {
		grid-column: 1 / -1;
		width: calc((100% - var(--tri-gap)) / 2);
		justify-self: center;
	}

	.eva-triad > :global(:first-child:nth-last-child(3)) {
		grid-column: 1 / -1;
		width: calc((100% - var(--tri-gap)) / 2);
		justify-self: center;
	}
</style>
