<svelte:options customElement={{ tag: 'eva-alert-banner', shadow: 'none' }} />

<script lang="ts">
	import EvaHazardStrip from './EvaHazardStrip.svelte';

	interface Props {
		headline?: string;
		subtext?: string;
		jpLabel?: string;
		severity?: 'emergency' | 'warning' | 'info' | 'nominal';
		animatedStripes?: boolean;
	}

	let {
		headline = 'EMERGENCY',
		subtext = '',
		jpLabel = '非常事態',
		severity = 'emergency',
		animatedStripes = true
	}: Props = $props();

	const isEmergency = $derived(severity === 'emergency');
</script>

<div
	class="eva-alert"
	class:is-emergency={isEmergency}
	class:is-warning={severity === 'warning'}
	class:is-info={severity === 'info'}
	class:is-nominal={severity === 'nominal'}
	role="alert"
>
	<!-- Top mirrored chevron hazard bar -->
	<EvaHazardStrip
		direction="chevron"
		color="var(--alert-red)"
		bg="var(--alert-bg)"
		height="18px"
		stripeWidth={12}
		animated={isEmergency && animatedStripes}
		centerTag={isEmergency ? jpLabel : ''}
	/>

	<div class="eva-alert__rule" aria-hidden="true"></div>

	{#if isEmergency}
		<!-- Smooth GPU-composited seamless marquee ONLY for emergency -->
		<div class="marquee-viewport">
			<div class="marquee-track">
				{#each [0, 1] as _}
					<div class="marquee-group">
						{#each Array.from({ length: 10 }) as __}
							<span class="marquee-item eva-display">{headline}</span>
							{#if subtext}
								<span class="marquee-sub">{subtext}</span>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<!-- Static crisp readout for warning / info / nominal -->
		<div class="static-band">
			<strong class="static-headline eva-display">{headline}</strong>
			{#if subtext}
				<span class="static-sub">{subtext}</span>
			{/if}
		</div>
	{/if}

	<div class="eva-alert__rule" aria-hidden="true"></div>

	<!-- Bottom mirrored chevron hazard bar -->
	<EvaHazardStrip
		direction="chevron"
		color="var(--alert-red)"
		bg="var(--alert-bg)"
		height="18px"
		stripeWidth={12}
		animated={isEmergency && animatedStripes}
		centerTag={isEmergency ? jpLabel : ''}
	/>
</div>

<style>
	.eva-alert {
		--alert-red: #b80d0d;
		--alert-rule: #ef1c14;
		--alert-glow: #ff8c2a;
		--alert-bg: #070101;
		border: 2px solid var(--alert-rule);
		background: var(--alert-bg);
		overflow: hidden;
	}

	.eva-alert.is-warning {
		--alert-red: #ff9900;
		--alert-rule: #ff9900;
		--alert-glow: #ff9900;
		--alert-bg: #080602;
	}

	.eva-alert.is-info {
		--alert-red: #00d9ff;
		--alert-rule: #00d9ff;
		--alert-glow: #00d9ff;
		--alert-bg: #03080c;
	}

	.eva-alert.is-nominal {
		--alert-red: #26f78b;
		--alert-rule: #26f78b;
		--alert-glow: #26f78b;
		--alert-bg: #030a06;
	}

	.eva-alert__rule {
		height: 2px;
		background: var(--alert-rule);
	}

	.eva-alert.is-emergency .eva-alert__rule {
		box-shadow: 0 0 8px var(--alert-rule);
	}

	.marquee-viewport {
		overflow: hidden;
		padding: 0.45rem 0;
		min-height: calc(2.15rem + 0.9rem);
		box-sizing: border-box;
		display: flex;
		align-items: center;
		background: radial-gradient(ellipse at center, rgba(184, 13, 13, 0.16), var(--alert-bg) 75%);
	}

	.marquee-track {
		display: flex;
		width: max-content;
		will-change: transform;
		animation: eva-marquee 26s linear infinite;
	}

	.marquee-group {
		display: flex;
		align-items: baseline;
		gap: 2.5rem;
		padding-right: 2.5rem;
		flex-shrink: 0;
	}

	@keyframes eva-marquee {
		from {
			transform: translate3d(0, 0, 0);
		}
		to {
			transform: translate3d(-50%, 0, 0);
		}
	}

	.marquee-item {
		font-size: 2.15rem;
		line-height: 1;
		letter-spacing: 0.12em;
		color: var(--alert-glow);
		text-shadow:
			0 0 10px rgba(255, 110, 20, 0.85),
			0 0 22px rgba(255, 70, 10, 0.55);
		animation: eva-emergency-flash 0.9s infinite;
	}

	@keyframes eva-emergency-flash {
		0%,
		48% {
			opacity: 1;
			text-shadow:
				0 0 12px rgba(255, 140, 42, 0.95),
				0 0 26px rgba(255, 70, 10, 0.72);
		}
		55%,
		88% {
			opacity: 0.2;
			text-shadow: 0 0 4px rgba(239, 28, 20, 0.35);
		}
		100% {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee-item {
			animation: none;
		}
	}

	.marquee-sub {
		font-family: var(--eva-font-display);
		font-size: 0.92rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--alert-rule);
		opacity: 0.92;
	}

	.static-band {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.45rem 1rem;
		min-height: calc(2.15rem + 0.9rem);
		box-sizing: border-box;
		background: var(--alert-bg);
	}

	.static-headline {
		font-size: 2.15rem;
		line-height: 1;
		letter-spacing: 0.05em;
		color: var(--alert-rule);
	}

	.static-sub {
		font-family: var(--eva-font-display);
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		color: var(--eva-text);
	}
</style>
