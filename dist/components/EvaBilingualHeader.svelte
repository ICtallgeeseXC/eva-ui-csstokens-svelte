<svelte:options customElement={{ tag: 'eva-bilingual-header', shadow: 'none' }} />

<script lang="ts">
	import type { Snippet } from 'svelte';
	import EvaCapsulePill from './EvaCapsulePill.svelte';

	interface Props {
		jp?: string;
		title?: string;
		code?: string;
		color?: string;
		flanked?: boolean;
		ruled?: boolean;
		right?: Snippet;
	}

	let {
		jp = 'MAGI // 決議',
		title = 'SYSTEM DIRECTIVE',
		code = '',
		color = 'var(--eva-border-strong, #ff941a)',
		flanked = false,
		ruled = true,
		right
	}: Props = $props();
</script>

<div class="eva-bh" class:is-ruled={ruled} style="--bh-c: {color}">
	{#if flanked}
		<EvaCapsulePill {color} width="4px" />
	{/if}
	<div class="eva-bh__main">
		<div class="eva-bh__left">
			{#if code}
				<span class="bh-code eva-num">{code}</span>
			{/if}
			<div class="bh-titles">
				{#if jp}
					<span class="bh-jp">{jp}</span>
				{/if}
				{#if title}
					<span class="bh-en eva-display">{title}</span>
				{/if}
			</div>
		</div>
		{#if right}
			<div class="eva-bh__right">
				{@render right()}
			</div>
		{/if}
	</div>
	{#if flanked}
		<EvaCapsulePill {color} width="4px" />
	{/if}
</div>

<style>
	.eva-bh {
		display: flex;
		align-items: stretch;
		gap: 0.45rem;
		padding-bottom: 0.48rem;
	}

	.eva-bh.is-ruled {
		border-bottom: 1.5px solid var(--bh-c);
	}

	.eva-bh__main {
		flex: 1;
		min-width: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.65rem;
	}

	.eva-bh__left {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		min-width: 0;
	}

	.bh-code {
		padding: 0.08rem 0.42rem;
		font-size: 0.78rem;
		border: 1.5px solid var(--bh-c);
		border-radius: 3px;
		color: var(--eva-gold, #fff275);
		background: #000000;
		flex-shrink: 0;
	}

	.bh-titles {
		display: flex;
		flex-direction: column;
		gap: 0.08rem;
		min-width: 0;
	}

	.bh-jp {
		font-family: var(--eva-font-display);
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--eva-gold, #fff275);
		letter-spacing: 0.05em;
		line-height: 1.05;
	}

	.bh-en {
		font-size: 1rem;
		color: var(--bh-c);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-shadow: 0 0 8px color-mix(in srgb, var(--bh-c) 40%, transparent);
	}

	.eva-bh__right {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		flex-shrink: 0;
	}
</style>
