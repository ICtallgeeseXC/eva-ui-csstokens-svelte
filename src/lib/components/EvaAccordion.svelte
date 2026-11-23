<svelte:options customElement={{ tag: 'eva-accordion', shadow: 'none' }} />

<script lang="ts">
	import { evaTransition, type EvaTransitionOption } from '../transitions';

	export interface AccordionItem {
		id: string;
		code?: string;
		title: string;
		content: string;
	}

	interface Props {
		items?: AccordionItem[];
		openId?: string;
		transition?: EvaTransitionOption;
	}

	const defaultItems: AccordionItem[] = [
		{
			id: 'sec-1',
			code: '01',
			title: 'UMBILICAL CABLE POWER SPECIFICATIONS',
			content: 'Primary external feed rated at 1,400 MW; internal battery reserve provides 05:00 active combat time.'
		},
		{
			id: 'sec-2',
			code: '02',
			title: 'MAGI SUPERCOMPUTER CONSENSUS PROTOCOL',
			content: 'Requires majority agreement across MELCHIOR-1, BALTHASAR-2, and CASPER-3 before authorizing Level-A overrides.'
		},
		{
			id: 'sec-3',
			code: '03',
			title: 'A.T. FIELD PHASE HARMONICS',
			content: 'Synchronization rate above 99.0% induces golden-white phase convergence between pilot and unit.'
		}
	];

	let {
		items = defaultItems,
		openId = $bindable(items[0]?.id ?? ''),
		transition = 'glitch'
	}: Props = $props();

	function toggle(id: string) {
		openId = openId === id ? '' : id;
	}
</script>

<div class="eva-acc">
	{#each items as item (item.id)}
		{@const isOpen = openId === item.id}
		<div class="eva-acc__item" class:is-open={isOpen}>
			<button
				type="button"
				class="eva-acc__btn"
				aria-expanded={isOpen}
				onclick={() => toggle(item.id)}
			>
				<span class="eva-acc__left">
					<span class="eva-acc__led" aria-hidden="true"></span>
					{#if item.code}
						<span class="eva-acc__code">SEC-{item.code}</span>
					{/if}
					<span class="eva-acc__title">{item.title}</span>
				</span>
				<span class="eva-acc__icon">{isOpen ? 'OPEN ▼' : 'SHUT ►'}</span>
			</button>
			{#if isOpen}
				<div class="eva-acc__panel" transition:evaTransition={transition}>
					<div class="eva-acc__ticks" aria-hidden="true"></div>
					<div class="eva-acc__body">{item.content}</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.eva-acc {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.eva-acc__item {
		background: #000000;
		border: 1.5px solid var(--eva-border);
		outline: 1px solid rgba(255, 148, 26, 0.28);
		outline-offset: 1px;
		border-radius: 5px;
	}

	.eva-acc__item.is-open {
		border-color: var(--eva-border-strong);
		outline-color: var(--eva-border);
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.eva-acc__btn {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.48rem 0.72rem;
		background: transparent;
		border: none;
		color: var(--eva-primary);
		font-family: var(--eva-font-display);
		font-size: 0.92rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		text-align: left;
		cursor: pointer;
		text-shadow: var(--eva-bloom);
	}

	.eva-acc__item.is-open .eva-acc__btn {
		background: rgba(255, 148, 26, 0.08);
	}

	.eva-acc__left {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}

	.eva-acc__led {
		width: 4px;
		height: 18px;
		border-radius: 999px;
		background: rgba(255, 148, 26, 0.35);
	}

	.eva-acc__item.is-open .eva-acc__led {
		background: #46f76a;
		box-shadow: 0 0 8px rgba(70, 247, 106, 0.65);
	}

	.eva-acc__code {
		padding: 0.04rem 0.4rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 3px;
		color: var(--eva-gold, #fff275);
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.78rem;
	}

	.eva-acc__icon {
		min-width: 58px;
		text-align: right;
		font-family: var(--eva-font-display);
		font-variant-numeric: tabular-nums;
		font-size: 0.76rem;
		color: var(--eva-primary);
		flex-shrink: 0;
	}

	.eva-acc__ticks {
		height: 2px;
		background: var(--eva-border-strong);
		box-shadow: var(--eva-bloom);
	}

	.eva-acc__body {
		padding: 0.65rem 0.85rem;
		font-family: var(--eva-font-sans);
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--eva-text-hi);
		line-height: 1.38;
		letter-spacing: 0.015em;
	}
</style>
