<svelte:options customElement={{ tag: 'eva-pattern-matrix', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';
	import EvaTransportButton from './EvaTransportButton.svelte';

	interface Props {
		patternName?: string;
		classification?: string;
		bars?: number;
		animated?: boolean;
		audioSrc?: string;
		showControls?: boolean;
		externalAnalyser?: AnalyserNode | null;
		externalPlaying?: boolean;
		externalTrackLabel?: string;
	}

	let {
		patternName = 'PATTERN: BLUE',
		classification = 'AT-FIELD SPECTRUM // 48.2 Hz',
		bars = 24,
		animated = true,
		audioSrc = '/audio/nerv-pulse.mp3',
		showControls = true,
		externalAnalyser = null,
		externalPlaying = false,
		externalTrackLabel = ''
	}: Props = $props();

	let tick = $state(0);
	let isPlaying = $state(false);
	let peakHz = $state(48.2);
	let trackLabel = $state('NERV-PULSE.MP3 (138 BPM)');
	let liveHeights = $state<number[] | null>(null);
	const isLive = $derived(isPlaying || (externalPlaying && !!externalAnalyser));
	const activeTrack = $derived(
		!isPlaying && externalPlaying && externalTrackLabel ? externalTrackLabel : trackLabel
	);

	let audioEl: HTMLAudioElement | null = null;
	let audioCtx: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let sourceNode: MediaElementAudioSourceNode | null = null;
	let rafId = 0;
	let objectUrl: string | null = null;

	onMount(() => {
		const id = animated
			? setInterval(() => {
					if (!isLive) tick += 1;
				}, 120)
			: null;

		return () => {
			if (id) clearInterval(id);
			cancelAnimationFrame(rafId);
			audioEl?.pause();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
			audioCtx?.close().catch(() => {});
		};
	});

	function ensureAudioGraph() {
		if (!audioEl) {
			audioEl = new Audio(audioSrc);
			audioEl.loop = true;
			audioEl.crossOrigin = 'anonymous';
			audioEl.addEventListener('ended', () => {
				isPlaying = false;
				liveHeights = null;
			});
		}
		if (!audioCtx) {
			audioCtx = new AudioContext();
			analyser = audioCtx.createAnalyser();
			analyser.fftSize = 256;
			analyser.smoothingTimeConstant = 0.72;
			sourceNode = audioCtx.createMediaElementSource(audioEl);
			sourceNode.connect(analyser);
			analyser.connect(audioCtx.destination);
		}
	}

	$effect(() => {
		if (externalPlaying && externalAnalyser && !isPlaying) {
			cancelAnimationFrame(rafId);
			pumpSpectrum();
		} else if (!externalPlaying && !isPlaying) {
			cancelAnimationFrame(rafId);
			liveHeights = null;
		}
	});

	function pumpSpectrum() {
		const activeNode = isPlaying ? analyser : externalPlaying ? externalAnalyser : null;
		if (!activeNode) {
			liveHeights = null;
			return;
		}
		const binCount = activeNode.frequencyBinCount; // 128 bins
		const data = new Uint8Array(binCount);
		activeNode.getByteFrequencyData(data);

		const next: number[] = [];
		let maxVal = 0;
		let maxBin = 1;

		// Logarithmic-ish mapping across bins 1..90 so bass, mids, and highs all react
		for (let i = 0; i < bars; i++) {
			const t0 = Math.pow(i / bars, 1.45);
			const t1 = Math.pow((i + 1) / bars, 1.45);
			const b0 = Math.max(1, Math.floor(t0 * 84));
			const b1 = Math.max(b0 + 1, Math.floor(t1 * 84));

			let sum = 0;
			for (let b = b0; b < b1 && b < binCount; b++) {
				sum += data[b];
				if (data[b] > maxVal) {
					maxVal = data[b];
					maxBin = b;
				}
			}
			const avg = sum / Math.max(1, b1 - b0);
			next.push(Math.max(8, Math.min(98, Math.round((avg / 255) * 100))));
		}

		const sampleRate = activeNode.context.sampleRate || 48000;
		const nyquist = sampleRate / 2;
		peakHz = Math.round((maxBin / binCount) * nyquist);
		liveHeights = next;
		rafId = requestAnimationFrame(pumpSpectrum);
	}

	async function togglePlay() {
		ensureAudioGraph();
		if (!audioEl || !audioCtx) return;

		if (audioCtx.state === 'suspended') {
			await audioCtx.resume();
		}

		if (isPlaying) {
			audioEl.pause();
			isPlaying = false;
			cancelAnimationFrame(rafId);
			liveHeights = null;
		} else {
			await audioEl.play();
			isPlaying = true;
			pumpSpectrum();
		}
	}

	async function handleFileUpload(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		ensureAudioGraph();
		if (!audioEl || !audioCtx) return;

		if (objectUrl) URL.revokeObjectURL(objectUrl);
		objectUrl = URL.createObjectURL(file);
		audioEl.src = objectUrl;
		trackLabel = file.name.toUpperCase();

		if (audioCtx.state === 'suspended') {
			await audioCtx.resume();
		}
		await audioEl.play();
		isPlaying = true;
		cancelAnimationFrame(rafId);
		pumpSpectrum();
	}

	const placeholderHeights = $derived(
		Array.from({ length: bars }, (_, i) => {
			const wave =
				Math.sin((i + tick * 0.6) * 0.45) * 0.4 + Math.cos(i * 1.3 - tick * 0.35) * 0.25;
			return Math.max(12, Math.min(98, Math.round(52 + wave * 45)));
		})
	);

	const heights = $derived(isLive && liveHeights ? liveHeights : placeholderHeights);
</script>

<div class="eva-pattern" class:is-live={isLive}>
	<div class="eva-pattern__head">
		<strong class="eva-display eva-pattern__title">{patternName}</strong>
		<span class="eva-mono-label">
			{isLive ? `LIVE FFT // PEAK ${peakHz} Hz` : classification}
		</span>
	</div>

	<div class="eva-pattern__bars" aria-hidden="true">
		{#each heights as h, idx}
			<div class="bar-col">
				<div class="bar-fill" class:is-peak={h > 80} style="height: {h}%"></div>
				<span class="bar-idx">{String(idx + 1).padStart(2, '0')}</span>
			</div>
		{/each}
	</div>

	{#if showControls}
		<div class="eva-pattern__controls">
			<EvaTransportButton playing={isPlaying} label="AUDIO" minWidth="96px" onToggle={togglePlay} />

			<label class="eva-btn upload-btn">
				LOAD MP3
				<input type="file" accept="audio/*" onchange={handleFileUpload} hidden />
			</label>

			<span class="track-name">{isLive ? `PLAYING: ${activeTrack}` : `READY: ${activeTrack}`}</span>
		</div>
	{/if}
</div>

<style>
	.eva-pattern {
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		padding: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.eva-pattern.is-live {
		border-color: #72f7ff;
		outline-color: rgba(114, 247, 255, 0.55);
		box-shadow: inset 0 0 18px rgba(114, 247, 255, 0.14);
	}

	.eva-pattern__head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
	}

	.eva-pattern__title {
		color: #72f7ff;
		font-size: 1.15rem;
		letter-spacing: 0.04em;
		text-shadow: 0 0 8px rgba(114, 247, 255, 0.45);
	}

	.eva-pattern__bars {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8px, 1fr));
		gap: 4px;
		height: 110px;
		align-items: end;
		padding: 0.5rem;
		background-image:
			linear-gradient(to right, var(--eva-grid) 1px, transparent 1px),
			linear-gradient(to bottom, var(--eva-grid) 1px, transparent 1px);
		background-size: 20px 20px;
		border: 1px solid var(--eva-border);
		border-radius: 4px;
	}

	.bar-col {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		gap: 3px;
	}

	.bar-fill {
		width: 100%;
		background: #72f7ff;
		transition: height 75ms linear;
	}

	.bar-fill.is-peak {
		background: #ff2222;
	}

	.bar-idx {
		font-family: var(--eva-font-num);
		font-size: 0.64rem;
		font-weight: 700;
		color: var(--eva-text-muted);
	}

	.eva-pattern__controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		padding-top: 0.2rem;
	}

	.upload-btn {
		position: relative;
	}

	.track-name {
		font-family: var(--eva-font-display);
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--eva-text-muted);
		margin-left: auto;
	}
</style>
