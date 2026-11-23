<svelte:options customElement={{ tag: 'eva-modal', shadow: 'none' }} />

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { evaTransition, type EvaTransitionOption } from '../transitions';
	import EvaCapsulePill from './EvaCapsulePill.svelte';
	import EvaHazardStrip from './EvaHazardStrip.svelte';

	interface Props {
		open?: boolean;
		title?: string;
		code?: string;
		variant?: 'default' | 'alert';
		transition?: EvaTransitionOption;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		open = $bindable(false),
		title = 'MAGI OVERRIDE CONFIRMATION',
		code = 'DLG-01',
		variant = 'default',
		transition = 'glitch',
		children,
		footer
	}: Props = $props();

	function close() {
		open = false;
	}
</script>

{#if open}
	<div
		class="eva-modal-backdrop"
		role="dialog"
		aria-modal="true"
		aria-label={title}
		tabindex="-1"
		transition:evaTransition={{ preset: 'fade', duration: 150 }}
		onclick={(e) => e.target === e.currentTarget && close()}
		onkeydown={(e) => e.key === 'Escape' && close()}
	>
		<div class="eva-modal" class:is-alert={variant === 'alert'} transition:evaTransition={transition}>
			<EvaHazardStrip
				direction="chevron"
				color={variant === 'alert' ? '#ff2222' : 'var(--eva-primary)'}
				height="12px"
				stripeWidth={8}
				centerTag={variant === 'alert' ? '非常事態' : ''}
			/>

			<div class="eva-modal__head">
				<EvaCapsulePill color="var(--mc)" width="5px" />
				<div class="eva-modal__title-wrap">
					<span class="eva-modal__code eva-num">{code}</span>
					<strong class="eva-display modal-title">{title}</strong>
				</div>
				<button type="button" class="eva-btn eva-btn-danger" onclick={close}>CLOSE</button>
				<EvaCapsulePill color="var(--mc)" width="5px" />
			</div>

			<div class="eva-modal__body">
				{#if children}
					{@render children()}
				{/if}
			</div>

			{#if footer}
				<div class="eva-modal__footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.eva-modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 9998;
		background: rgba(0, 0, 0, 0.88);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.eva-modal {
		--mc: var(--eva-primary);
		width: 100%;
		max-width: 520px;
		background: #000000;
		border: 1.5px solid var(--mc);
		outline: 1px solid color-mix(in srgb, var(--mc) 55%, transparent);
		outline-offset: 2px;
		border-radius: 5px;
		box-shadow: 0 0 28px color-mix(in srgb, var(--mc) 24%, transparent);
	}

	.eva-modal.is-alert {
		--mc: #ff2222;
	}

	.eva-modal__head {
		display: flex;
		justify-content: space-between;
		align-items: stretch;
		gap: 0.6rem;
		padding: 0.55rem 0.65rem;
		background: #000000;
		border-bottom: 1.5px solid var(--mc);
	}

	.eva-modal__title-wrap {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--mc);
	}

	.modal-title {
		font-size: 1.15rem;
		letter-spacing: 0.03em;
	}

	.eva-modal__code {
		font-size: 0.8rem;
		padding: 0.08rem 0.42rem;
		background: #000000;
		border: 1.5px solid var(--mc);
		border-radius: 3px;
		color: var(--mc);
	}

	.eva-modal__body {
		padding: 1rem;
		font-family: var(--eva-font-sans);
		font-size: 0.94rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--eva-text-hi);
	}

	.eva-modal__footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.55rem;
		padding: 0.7rem 1rem;
		border-top: 1.5px solid var(--mc);
	}
</style>
