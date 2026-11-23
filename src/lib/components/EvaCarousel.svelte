<svelte:options customElement={{ tag: 'eva-carousel', shadow: 'none' }} />

<script lang="ts">
	export interface CarouselSlide {
		src: string;
		caption: string;
		code?: string;
	}

	interface Props {
		slides?: CarouselSlide[];
	}

	const defaultSlides: CarouselSlide[] = [
		{ src: '/analysis/frames/f_0633.webp', caption: 'CAMCORDER OSD // SEQ_146', code: 'SEQ_146' },
		{ src: '/analysis/frames/f_0456.webp', caption: 'ROUTING BUS // SEQ_101', code: 'SEQ_101' },
		{ src: '/analysis/frames/f_0125.webp', caption: 'TELEMETRY DUMP // SEQ_031', code: 'SEQ_031' },
		{ src: '/analysis/frames/f_0382.webp', caption: 'CHEVRON CASCADE // SEQ_087', code: 'SEQ_087' }
	];

	let { slides = defaultSlides }: Props = $props();
	let index = $state(0);

	function step(delta: number) {
		index = (index + delta + slides.length) % slides.length;
	}
</script>

<div class="eva-car">
	<div class="eva-car__stage">
		{#if slides[index]}
			<img src={slides[index].src} alt={slides[index].caption} class="eva-car__img" />
			<div class="eva-car__overlay">
				{#if slides[index].code}
					<span class="car-code">{slides[index].code}</span>
				{/if}
				<span class="car-cap">{slides[index].caption}</span>
			</div>
		{/if}
		<button type="button" class="car-nav is-prev" onclick={() => step(-1)} aria-label="Previous">
			◄
		</button>
		<button type="button" class="car-nav is-next" onclick={() => step(1)} aria-label="Next">
			►
		</button>
	</div>

	<div class="eva-car__dots">
		{#each slides as s, i}
			<button
				type="button"
				class="car-dot"
				class:is-active={i === index}
				onclick={() => (index = i)}
				aria-label="Slide {i + 1}"
			>
				0{i + 1}
			</button>
		{/each}
	</div>
</div>

<style>
	.eva-car {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.eva-car__stage {
		position: relative;
		aspect-ratio: 16 / 9;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		overflow: hidden;
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.eva-car__img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.eva-car__overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.32rem 0.65rem;
		background: rgba(0, 0, 0, 0.88);
		border-top: 1.5px solid var(--eva-border-strong);
		font-family: var(--eva-font-display);
		font-size: 0.86rem;
		font-weight: 700;
	}

	.car-code {
		padding: 0.04rem 0.4rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 3px;
		color: var(--eva-gold, #fff275);
		font-family: var(--eva-font-num);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.car-cap {
		color: var(--eva-primary);
		text-shadow: var(--eva-bloom);
	}

	.car-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		padding: 0.32rem 0.55rem;
		background: rgba(0, 0, 0, 0.88);
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 4px;
		color: var(--eva-primary);
		cursor: pointer;
	}

	.car-nav.is-prev { left: 0.5rem; }
	.car-nav.is-next { right: 0.5rem; }

	.car-nav:hover {
		background: var(--eva-primary);
		color: #000000;
	}

	.eva-car__dots {
		display: flex;
		gap: 0.4rem;
	}

	.car-dot {
		flex: 1;
		padding: 0.2rem;
		background: #000000;
		border: 1.5px solid var(--eva-border);
		border-radius: 4px;
		color: var(--eva-text-muted);
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.84rem;
		font-weight: 700;
		cursor: pointer;
	}

	.car-dot.is-active {
		background: var(--eva-primary);
		color: #000000;
		border-color: var(--eva-border-strong);
	}
</style>
