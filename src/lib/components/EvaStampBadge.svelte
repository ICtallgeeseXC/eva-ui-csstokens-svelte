<svelte:options customElement={{ tag: 'eva-stamp-badge', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		label?: string;
		sublabel?: string;
		variant?: 'alert' | 'amber' | 'cyan' | 'mono';
		filled?: boolean;
		tilt?: number;
	}

	let {
		label = 'REFUSED',
		sublabel = 'MAGI // 01-03',
		variant = 'alert',
		filled = false,
		tilt = 0
	}: Props = $props();
</script>

<span
	class="eva-stamp is-{variant}"
	class:is-filled={filled}
	style="transform: rotate({tilt}deg)"
>
	{#if sublabel}
		<span class="eva-stamp__sub">{sublabel}</span>
	{/if}
	<strong class="eva-stamp__main eva-display">{label}</strong>
</span>

<style>
	.eva-stamp {
		--st-color: #ff2222;
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 0.34rem 0.88rem;
		border: 2px solid var(--st-color);
		outline: 1px solid var(--st-color);
		outline-offset: 2px;
		border-radius: 5px;
		color: var(--st-color);
		background: #000000;
		line-height: 1;
		box-shadow: 0 0 12px color-mix(in srgb, var(--st-color) 42%, transparent);
		text-shadow: 0 0 8px color-mix(in srgb, var(--st-color) 55%, transparent);
	}

	.eva-stamp.is-amber {
		--st-color: #ff941a;
	}

	.eva-stamp.is-cyan {
		--st-color: #72f7ff;
	}

	.eva-stamp.is-mono {
		--st-color: #fff275;
	}

	.eva-stamp.is-filled {
		background: var(--st-color);
		color: #000000;
		text-shadow: none;
	}

	.eva-stamp__sub {
		font-family: var(--eva-font-display);
		font-size: 0.66rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.08em;
		padding-bottom: 0.16rem;
		margin-bottom: 0.18rem;
		border-bottom: 1px solid var(--st-color);
		width: 100%;
		text-align: center;
	}

	.eva-stamp__main {
		font-family: var(--eva-font-display);
		font-size: 1.45rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.04em;
	}
</style>
