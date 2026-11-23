<svelte:options customElement={{ tag: 'eva-ruler-scale', shadow: 'none' }} />

<script lang="ts">
	interface Props {
		ticks?: number;
		majorEvery?: number;
		color?: string;
		height?: number;
	}

	let {
		ticks = 40,
		majorEvery = 5,
		color = 'var(--eva-border-strong, #ff941a)',
		height = 10
	}: Props = $props();
</script>

<div class="eva-ruler" style="--rul-c: {color}; height: {height}px;" aria-hidden="true">
	<div class="eva-ruler__base"></div>
	<div class="eva-ruler__ticks" style="grid-template-columns: repeat({ticks}, 1fr);">
		{#each Array.from({ length: ticks }) as _, i}
			<span class="r-tick" class:is-major={i % majorEvery === 0}></span>
		{/each}
	</div>
</div>

<style>
	.eva-ruler {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.eva-ruler__base {
		height: 1.5px;
		width: 100%;
		background: var(--rul-c);
		box-shadow: 0 0 6px color-mix(in srgb, var(--rul-c) 45%, transparent);
	}

	.eva-ruler__ticks {
		display: grid;
		align-items: start;
		width: 100%;
		flex: 1;
	}

	.r-tick {
		width: 1px;
		height: 45%;
		background: color-mix(in srgb, var(--rul-c) 65%, transparent);
	}

	.r-tick.is-major {
		width: 1.5px;
		height: 95%;
		background: var(--rul-c);
	}
</style>
