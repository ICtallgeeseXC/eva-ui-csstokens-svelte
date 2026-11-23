<svelte:options customElement={{ tag: 'eva-pagination', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		page?: number;
		totalPages?: number;
		onChange?: (page: number) => void;
	}

	let { page = $bindable(1), totalPages = 6, onChange }: Props = $props();

	function setPage(p: number) {
		const clamped = Math.max(1, Math.min(totalPages, p));
		page = clamped;
		onChange?.(clamped);
	}
</script>

<div class="eva-pag" role="navigation" aria-label="Pagination">
	<button
		type="button"
		class="eva-pag__btn"
		disabled={page <= 1}
		onclick={() => setPage(page - 1)}
	>
		◄ PREV
	</button>

	<div class="eva-pag__pages">
		{#each Array.from({ length: totalPages }) as _, i}
			{@const p = i + 1}
			<button
				type="button"
				class="eva-pag__num"
				class:is-active={page === p}
				aria-current={page === p ? 'page' : undefined}
				onclick={() => setPage(p)}
			>
				<span class="num-lbl">{String(p).padStart(2, '0')}</span>
				<span class="num-bar"></span>
			</button>
		{/each}
	</div>

	<button
		type="button"
		class="eva-pag__btn"
		disabled={page >= totalPages}
		onclick={() => setPage(page + 1)}
	>
		NEXT ►
	</button>
</div>

<style>
	.eva-pag {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: stretch;
		gap: 0.45rem;
	}

	.eva-pag__pages {
		display: flex;
		gap: 5px;
	}

	.eva-pag__btn {
		padding: 0.25rem 0.65rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 1px;
		border-radius: 4px;
		color: var(--eva-primary);
		font-family: var(--eva-font-display);
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-shadow: var(--eva-bloom);
		cursor: pointer;
	}

	.eva-pag__btn:hover:not(:disabled) {
		background: var(--eva-primary);
		color: #000000;
		text-shadow: none;
	}

	.eva-pag__btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.eva-pag__num {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 0.18rem 0.5rem;
		background: #000000;
		border: 1.5px solid var(--eva-border);
		border-radius: 4px;
		color: var(--eva-text-muted);
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.92rem;
		font-weight: 700;
		cursor: pointer;
	}

	.num-bar {
		width: 100%;
		height: 3px;
		border-radius: 999px;
		background: rgba(255, 148, 26, 0.22);
	}

	.eva-pag__num.is-active {
		border-color: var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 1px;
		color: var(--eva-primary);
		text-shadow: var(--eva-bloom);
		box-shadow: 0 0 8px var(--eva-primary-dim);
	}

	.eva-pag__num.is-active .num-bar {
		background: var(--eva-primary);
		box-shadow: var(--eva-bloom);
	}
</style>
