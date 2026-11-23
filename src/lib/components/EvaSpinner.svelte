<svelte:options customElement={{ tag: 'eva-spinner', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		label?: string;
		sublabel?: string;
		size?: number;
	}

	let {
		label = 'MAGI // PROTECT NO. 666',
		sublabel = 'MELCHIOR · BALTHASAR · CASPER',
		size = 64
	}: Props = $props();
</script>

<div class="eva-spin-wrap" role="status" aria-label={label}>
	<svg viewBox="0 0 80 80" class="eva-spin-svg" style="width: {size}px; height: {size}px;">
		<rect x="0" y="0" width="80" height="80" fill="#020302" />

		<!-- Outer mint-green concentric segmented radar rings (SEQ_033) -->
		<circle
			cx="40"
			cy="40"
			r="36"
			fill="none"
			stroke="#4ff7ad"
			stroke-width="2"
			stroke-dasharray="3 2.5"
			class="ring-ccw"
		/>
		<circle
			cx="40"
			cy="40"
			r="30"
			fill="none"
			stroke="#4ff7ad"
			stroke-width="1.5"
			stroke-dasharray="5 3"
			class="ring-cw"
		/>

		<!-- Inner crimson-orange concentric rings -->
		<circle
			cx="40"
			cy="40"
			r="24"
			fill="none"
			stroke="#ff5a1f"
			stroke-width="1.2"
			stroke-dasharray="4 2.5"
			class="ring-ccw"
		/>
		<circle cx="40" cy="40" r="18" fill="none" stroke="#ff5a1f" stroke-width="0.9" opacity="0.7" />

		<!-- 4-way crosshair axes -->
		<line x1="40" y1="2" x2="40" y2="78" stroke="#ff5a1f" stroke-width="0.7" opacity="0.55" />
		<line x1="2" y1="40" x2="78" y2="40" stroke="#ff5a1f" stroke-width="0.7" opacity="0.55" />

		<!-- Rotating 3-blade MAGI-01 pinwheel matching SEQ_033 exact geometry -->
		<g class="magi-blades">
			{#each [0, 120, 240] as angle}
				<g transform="rotate({angle}, 40, 40)">
					<!-- Tangential parallelogram blade with 4 internal bands -->
					<polygon
						points="46.5,36.25 66.5,36.25 60,47.5 40,47.5"
						fill="#1a0902"
						stroke="#ff7b14"
						stroke-width="1.15"
					/>
					<line x1="44.88" y1="39.06" x2="64.88" y2="39.06" stroke="#ff7b14" stroke-width="0.7" />
					<line x1="43.25" y1="41.88" x2="63.25" y2="41.88" stroke="#ff7b14" stroke-width="0.7" />
					<line x1="41.62" y1="44.69" x2="61.62" y2="44.69" stroke="#ff7b14" stroke-width="0.7" />
					<!-- Inner divider separating node name (BALTHASAR-2 / MELCHIOR-1 / CASPER-3) -->
					<line x1="49.5" y1="36.25" x2="43" y2="47.5" stroke="#ff7b14" stroke-width="0.9" />
				</g>
			{/each}

			<!-- Central inverted equilateral triangle (MAGI 01) -->
			<polygon
				points="33.5,36.25 46.5,36.25 40,47.5"
				fill="#040201"
				stroke="#ff7b14"
				stroke-width="1.25"
			/>
		</g>
	</svg>

	{#if label}
		<div class="eva-spin-meta">
			<span class="eva-spin-lbl">{label}</span>
			{#if sublabel}
				<span class="eva-spin-sub">{sublabel}</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.eva-spin-wrap {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
	}

	.eva-spin-svg {
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		flex-shrink: 0;
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.ring-cw {
		transform-origin: 40px 40px;
		animation: eva-spin-cw 8s linear infinite;
	}

	.ring-ccw {
		transform-origin: 40px 40px;
		animation: eva-spin-ccw 10s linear infinite;
	}

	.magi-blades {
		transform-origin: 40px 40px;
		animation: eva-spin-cw 3.2s linear infinite;
	}

	@keyframes eva-spin-cw {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	@keyframes eva-spin-ccw {
		from { transform: rotate(360deg); }
		to { transform: rotate(0deg); }
	}

	.eva-spin-meta {
		display: flex;
		flex-direction: column;
		gap: 0.16rem;
		padding: 0.28rem 0.65rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 4px;
	}

	.eva-spin-lbl {
		font-family: var(--eva-font-num);
		font-size: 0.94rem;
		font-weight: 700;
		color: var(--eva-primary);
		letter-spacing: 0.03em;
		text-shadow: var(--eva-bloom);
	}

	.eva-spin-sub {
		font-family: var(--eva-font-display);
		font-size: 0.72rem;
		font-weight: 700;
		color: #46f76a;
		letter-spacing: 0.05em;
		border-top: 1px solid var(--eva-border);
		padding-top: 0.12rem;
	}
</style>
