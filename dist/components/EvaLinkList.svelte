<svelte:options customElement={{ tag: 'eva-link-list', shadow: 'none' }} />

<script lang="ts">
	export interface LinkEntry {
		href: string;
		code: string;
		label: string;
		tag?: string;
	}

	interface Props {
		links?: LinkEntry[];
	}

	const defaultLinks: LinkEntry[] = [
		{ href: '#sec-01', code: 'L-01', label: 'SEQUENCE RECREATIONS', tag: 'CORE' },
		{ href: '/explorer', code: 'L-02', label: 'VIDEO FRAME EXPLORER', tag: 'APP' },
		{ href: '#sec-02', code: 'L-03', label: '40 ESSENTIAL UI PRIMITIVES', tag: 'LIB' }
	];

	let { links = defaultLinks }: Props = $props();
</script>

<ul class="eva-ll">
	{#each links as link (link.code)}
		<li>
			<a href={link.href} class="eva-ll__row">
				<span class="ll-left">
					<span class="ll-code">{link.code}</span>
					<span class="ll-lbl">{link.label}</span>
				</span>
				{#if link.tag}
					<span class="ll-tag">{link.tag} ▸</span>
				{/if}
			</a>
		</li>
	{/each}
</ul>

<style>
	.eva-ll {
		list-style: none;
		margin: 0;
		padding: 0;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		background: #000000;
		box-shadow: 0 0 10px var(--eva-primary-dim);
	}

	.eva-ll__row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		padding: 0.42rem 0.68rem;
		text-decoration: none;
		border-bottom: 1px solid rgba(255, 148, 26, 0.22);
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		color: var(--eva-primary);
		text-shadow: var(--eva-bloom);
		transition: background-color 100ms ease;
	}

	.eva-ll__row:hover {
		background: var(--eva-primary);
		color: #000000;
		text-shadow: none;
	}

	.ll-left {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}

	.ll-code {
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.76rem;
		font-weight: 700;
		padding: 0.02rem 0.34rem;
		border: 1px solid var(--eva-border-strong);
		border-radius: 3px;
		color: var(--eva-gold, #fff275);
	}

	.eva-ll__row:hover .ll-code {
		color: #000000;
		border-color: #000000;
	}

	.ll-tag {
		font-family: var(--eva-font-display);
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--eva-gold, #fff275);
	}

	.eva-ll__row:hover .ll-tag {
		color: #000000;
	}
</style>
