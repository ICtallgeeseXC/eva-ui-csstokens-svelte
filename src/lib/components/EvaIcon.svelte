<svelte:options customElement={{ tag: 'eva-icon', shadow: 'none' }} />

<script lang="ts">
	export type EvaIconName =
		| 'warning'
		| 'magi'
		| 'lock'
		| 'power'
		| 'radar'
		| 'terminal'
		| 'audio'
		| 'search';

	interface Props {
		name?: EvaIconName;
		size?: number;
	}

	let { name = 'warning', size = 20 }: Props = $props();
</script>

<svg
	viewBox="0 0 24 24"
	class="eva-ico"
	style="width: {size}px; height: {size}px;"
	aria-hidden="true"
>
	{#if name === 'warning'}
		<polygon points="12,3 22,20 2,20" fill="none" stroke="currentColor" stroke-width="2" />
		<rect x="11" y="9" width="2" height="6" fill="currentColor" />
		<rect x="11" y="16.5" width="2" height="2" fill="currentColor" />
	{:else if name === 'magi'}
		<polygon points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8" fill="none" stroke="currentColor" stroke-width="1.8" />
		<polygon points="12,7 16.5,15 7.5,15" fill="currentColor" />
	{:else if name === 'lock'}
		<rect x="5" y="10" width="14" height="11" fill="none" stroke="currentColor" stroke-width="2" />
		<path d="M8,10 V7 a4,4 0 0 1 8,0 V10" fill="none" stroke="currentColor" stroke-width="2" />
	{:else if name === 'power'}
		<path d="M12,3 V11" stroke="currentColor" stroke-width="2.2" />
		<path d="M7.5,6.5 A7,7 0 1 0 16.5,6.5" fill="none" stroke="currentColor" stroke-width="2" />
	{:else if name === 'radar'}
		<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8" />
		<circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.4" />
		<line x1="12" y1="12" x2="18" y2="6" stroke="currentColor" stroke-width="2" />
	{:else if name === 'terminal'}
		<rect x="3" y="4" width="18" height="16" fill="none" stroke="currentColor" stroke-width="1.8" />
		<polyline points="7,9 11,12 7,15" fill="none" stroke="currentColor" stroke-width="2" />
		<line x1="12" y1="15" x2="17" y2="15" stroke="currentColor" stroke-width="2" />
	{:else if name === 'audio'}
		<rect x="3" y="10" width="3" height="8" fill="currentColor" />
		<rect x="8" y="6" width="3" height="12" fill="currentColor" />
		<rect x="13" y="4" width="3" height="14" fill="currentColor" />
		<rect x="18" y="8" width="3" height="10" fill="currentColor" />
	{:else}
		<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2" />
		<line x1="15.5" y1="15.5" x2="20.5" y2="20.5" stroke="currentColor" stroke-width="2.2" />
	{/if}
</svg>

<style>
	.eva-ico {
		display: inline-block;
		color: var(--eva-primary);
		flex-shrink: 0;
	}
</style>
