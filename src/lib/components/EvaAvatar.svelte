<svelte:options customElement={{ tag: 'eva-avatar', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		initials?: string;
		label?: string;
		status?: 'online' | 'alert' | 'offline';
		size?: 'sm' | 'md' | 'lg';
	}

	let {
		initials = 'IK',
		label = 'IKARI, SHINJI',
		status = 'online',
		size = 'md'
	}: Props = $props();
</script>

<div class="eva-av-wrap">
	<div class="eva-av is-{size}" aria-label={label}>
		<span class="eva-av__in eva-display">{initials}</span>
		<span class="eva-av__dot is-{status}" title={status}></span>
	</div>
	{#if label}
		<span class="eva-av__lbl">{label}</span>
	{/if}
</div>

<style>
	.eva-av-wrap {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
	}

	.eva-av {
		position: relative;
		padding: 1.5px;
		background: var(--eva-primary);
		clip-path: polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%);
		flex-shrink: 0;
	}

	.eva-av.is-sm { width: 30px; height: 30px; font-size: 0.72rem; }
	.eva-av.is-md { width: 42px; height: 42px; font-size: 0.95rem; }
	.eva-av.is-lg { width: 56px; height: 56px; font-size: 1.25rem; }

	.eva-av__in {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #040508;
		color: var(--eva-primary);
		clip-path: polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%);
	}

	.eva-av__dot {
		position: absolute;
		bottom: 2px;
		right: 2px;
		width: 8px;
		height: 8px;
		border: 1px solid #000000;
		border-radius: 2px;
		background: #46f76a;
	}

	.eva-av__dot.is-alert { background: #ff2222; }
	.eva-av__dot.is-offline { background: #666; }

	.eva-av__lbl {
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--eva-primary);
		letter-spacing: 0.03em;
		text-shadow: var(--eva-bloom);
	}
</style>
