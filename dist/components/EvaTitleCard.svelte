<svelte:options customElement={{ tag: 'eva-title-card', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		kicker?: string;
		line1?: string;
		line2?: string;
		subtitle?: string;
		inverted?: boolean;
		variant?: 'card' | 'banner' | 'compact';
	}

	let {
		kicker = 'EPISODE:01',
		line1 = 'ANGEL',
		line2 = 'ATTACK',
		subtitle = 'NEON GENESIS EVANGELION // NERV ARCHIVE',
		inverted = false,
		variant = 'card'
	}: Props = $props();
</script>

<div class="eva-title-card is-{variant}" class:is-inverted={inverted}>
	{#if kicker}
		<div class="tc-kicker">{kicker}</div>
	{/if}
	<div class="tc-main">
		<div class="tc-line">{line1}</div>
		{#if line2}
			<div class="tc-line">{line2}</div>
		{/if}
	</div>
	{#if subtitle}
		<div class="tc-sub">{subtitle}</div>
	{/if}
</div>

<style>
	.eva-title-card {
		--tc-bg: #000000;
		--tc-fg: #f4f2ec;
		background: var(--tc-bg);
		color: var(--tc-fg);
		border: 1px solid rgba(255, 255, 255, 0.22);
		padding: 1.35rem 1.5rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.35rem;
		min-height: 155px;
	}

	.eva-title-card.is-inverted {
		--tc-bg: #f4f2ec;
		--tc-fg: #050505;
		border-color: #050505;
	}

	.tc-kicker {
		font-family: var(--eva-font-display);
		font-variant-numeric: tabular-nums;
		font-size: 0.92rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		opacity: 0.9;
	}

	.tc-main {
		font-family: "Times New Roman", "Georgia", serif;
		font-weight: 900;
		font-size: 2.6rem;
		line-height: 0.88;
		letter-spacing: -0.04em;
		text-transform: uppercase;
		transform: scaleX(0.84);
		transform-origin: left center;
	}

	.tc-sub {
		margin-top: 0.55rem;
		padding-top: 0.45rem;
		border-top: 1px solid currentColor;
		font-family: var(--eva-font-display);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		opacity: 0.85;
	}

	/* Section / page divider banner variant */
	.eva-title-card.is-banner {
		min-height: 0;
		padding: 0.72rem 1.05rem;
		gap: 0.22rem;
	}

	.eva-title-card.is-banner .tc-kicker {
		font-size: 0.78rem;
		letter-spacing: 0.08em;
	}

	.eva-title-card.is-banner .tc-main {
		font-size: clamp(1.32rem, 2.25vw, 1.82rem);
		line-height: 0.94;
	}

	.eva-title-card.is-banner .tc-sub {
		margin-top: 0.28rem;
		padding-top: 0.26rem;
		font-size: 0.72rem;
	}

	/* Navbar / brand compact emblem variant */
	.eva-title-card.is-compact {
		min-height: 0;
		padding: 0.26rem 0.65rem;
		gap: 0.12rem;
	}

	.eva-title-card.is-compact .tc-kicker {
		font-size: 0.6rem;
		line-height: 1.05;
		letter-spacing: 0.06em;
	}

	.eva-title-card.is-compact .tc-main {
		font-size: 1.3rem;
		line-height: 0.9;
		white-space: nowrap;
	}

	.eva-title-card.is-compact .tc-sub {
		margin-top: 0.12rem;
		padding-top: 0.12rem;
		font-size: 0.54rem;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}
</style>
