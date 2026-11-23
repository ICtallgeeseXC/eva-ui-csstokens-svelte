<svelte:options customElement={{ tag: 'eva-frame', shadow: 'none' }} />

<script lang="ts">
	import type { Snippet } from 'svelte';
	import EvaCapsulePill from './EvaCapsulePill.svelte';

	interface Props {
		variant?: 'double' | 'flanked' | 'single';
		color?: string;
		scanlines?: boolean;
		padding?: string;
		gap?: string;
		children?: Snippet;
	}

	let {
		variant = 'double',
		color = 'var(--eva-border-strong, #ff941a)',
		scanlines = false,
		padding = '0.68rem 0.82rem',
		gap = '0.45rem',
		children
	}: Props = $props();
</script>

<div
	class="eva-frame is-{variant}"
	class:eva-scanlines={scanlines}
	style="--frm-c: {color}; --frm-pad: {padding}; --frm-gap: {gap};"
>
	{#if variant === 'flanked'}
		<EvaCapsulePill {color} width="5px" />
	{/if}
	<div class="eva-frame__inner">
		{#if children}
			{@render children()}
		{/if}
	</div>
	{#if variant === 'flanked'}
		<EvaCapsulePill {color} width="5px" />
	{/if}
</div>

<style>
	.eva-frame {
		position: relative;
		display: flex;
		align-items: stretch;
		gap: 0.45rem;
		background: #000000;
		border-radius: var(--eva-radius-frame, 5px);
		color: var(--eva-text-hi);
	}

	.eva-frame.is-single .eva-frame__inner {
		border: 1.5px solid var(--frm-c);
	}

	.eva-frame.is-double .eva-frame__inner,
	.eva-frame.is-flanked .eva-frame__inner {
		border: 1.5px solid var(--frm-c);
		outline: 1px solid color-mix(in srgb, var(--frm-c) 55%, transparent);
		outline-offset: 2px;
		box-shadow:
			0 0 12px color-mix(in srgb, var(--frm-c) 22%, transparent),
			inset 0 0 14px color-mix(in srgb, var(--frm-c) 6%, transparent);
	}

	.eva-frame__inner {
		position: relative;
		z-index: 1;
		flex: 1;
		min-width: 0;
		padding: var(--frm-pad);
		border-radius: var(--eva-radius-frame, 5px);
		background: #000000;
		display: flex;
		flex-direction: column;
		gap: var(--frm-gap);
	}
</style>
