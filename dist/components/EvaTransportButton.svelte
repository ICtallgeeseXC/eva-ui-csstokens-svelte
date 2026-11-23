<svelte:options customElement={{ tag: 'eva-transport-button', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		playing?: boolean;
		label?: string;
		showLabel?: boolean;
		minWidth?: string;
		onToggle?: (next: boolean) => void;
	}

	let {
		playing = $bindable(false),
		label = 'PLAY / PAUSE',
		showLabel = true,
		minWidth = '112px',
		onToggle
	}: Props = $props();

	function handleClick() {
		if (onToggle) {
			onToggle(!playing);
		} else {
			playing = !playing;
		}
	}
</script>

<button
	type="button"
	class="eva-tx"
	class:is-playing={playing}
	class:is-paused={!playing}
	style={minWidth ? `min-width: ${minWidth}` : undefined}
	aria-pressed={playing}
	aria-label={label}
	onclick={handleClick}
>
	<span class="tx-icons" aria-hidden="true">
		<svg viewBox="0 0 12 14" class="tx-ico is-play">
			<polygon points="1,1 11,7 1,13" fill="currentColor" />
		</svg>
		<span class="tx-sep">/</span>
		<svg viewBox="0 0 12 14" class="tx-ico is-pause">
			<rect x="1.5" y="1" width="3.2" height="12" rx="0.6" fill="currentColor" />
			<rect x="7.3" y="1" width="3.2" height="12" rx="0.6" fill="currentColor" />
		</svg>
	</span>
	{#if showLabel && label}
		<span class="tx-lbl eva-display">{label}</span>
	{/if}
</button>

<style>
	.eva-tx {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.48rem;
		min-height: 2.1rem;
		padding: 0.36rem 0.95rem;
		box-sizing: border-box;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: var(--eva-radius-frame, 5px);
		color: var(--eva-primary);
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		line-height: 1.15;
		font-weight: 700;
		letter-spacing: 0.04em;
		white-space: nowrap;
		flex-shrink: 0;
		cursor: pointer;
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease,
			background-color 120ms ease;
	}

	.eva-tx.is-playing {
		border-color: #46f76a;
		outline-color: rgba(70, 247, 106, 0.55);
		background: rgba(70, 247, 106, 0.09);
		box-shadow: 0 0 12px rgba(70, 247, 106, 0.25);
	}

	.eva-tx.is-paused {
		border-color: #ff941a;
		outline-color: rgba(255, 34, 34, 0.45);
		background: rgba(255, 34, 34, 0.08);
		box-shadow: 0 0 10px rgba(255, 34, 34, 0.2);
	}

	.eva-tx:hover {
		background: rgba(255, 148, 26, 0.16);
	}

	.eva-tx.is-playing:hover {
		background: rgba(70, 247, 106, 0.16);
	}

	.eva-tx.is-paused:hover {
		background: rgba(255, 34, 34, 0.16);
	}

	.tx-icons {
		display: inline-flex;
		align-items: center;
		gap: 0.22rem;
	}

	.tx-ico {
		width: 11px;
		height: 12px;
		display: block;
		flex-shrink: 0;
		overflow: visible;
		transition:
			opacity 120ms ease,
			filter 120ms ease,
			color 120ms ease;
	}

	.tx-sep {
		font-family: var(--eva-font-num);
		font-size: 0.82rem;
		opacity: 0.45;
		line-height: 1;
	}

	/* Play glowing green when playing; Pause glowing crimson/red-amber when paused */
	.eva-tx.is-playing .tx-ico.is-play {
		color: #46f76a;
		opacity: 1;
		filter: drop-shadow(0 0 3px #b8ffc8) drop-shadow(0 0 7px rgba(70, 247, 106, 0.9));
	}

	.eva-tx.is-playing .tx-ico.is-pause {
		color: var(--eva-text-muted);
		opacity: 0.26;
		filter: none;
	}

	.eva-tx.is-paused .tx-ico.is-play {
		color: var(--eva-text-muted);
		opacity: 0.26;
		filter: none;
	}

	.eva-tx.is-paused .tx-ico.is-pause {
		color: #ff2222;
		opacity: 1;
		filter: drop-shadow(0 0 3px #ff8888) drop-shadow(0 0 7px rgba(255, 34, 34, 0.9));
	}

	.tx-lbl {
		font-size: 0.88rem;
		line-height: 1.15;
		color: var(--eva-text-hi);
	}

	.eva-tx.is-playing .tx-lbl {
		color: #8cff9f;
		text-shadow: 0 0 8px rgba(70, 247, 106, 0.45);
	}

	.eva-tx.is-paused .tx-lbl {
		color: #ffb833;
		text-shadow: 0 0 8px rgba(255, 148, 26, 0.45);
	}
</style>
