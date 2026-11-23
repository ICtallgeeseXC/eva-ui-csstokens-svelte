<svelte:options customElement={{ tag: 'eva-energy-visualizer', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';
	import EvaHudBox from './EvaHudBox.svelte';
	import EvaTransportButton from './EvaTransportButton.svelte';

	interface Props {
		audioSrc?: string;
		bars?: number;
		showControls?: boolean;
		externalAnalyser?: AnalyserNode | null;
		externalPlaying?: boolean;
		externalTrackLabel?: string;
	}

	let {
		audioSrc = '/audio/nerv-pulse.mp3',
		bars = 20,
		showControls = true,
		externalAnalyser = null,
		externalPlaying = false,
		externalTrackLabel = ''
	}: Props = $props();

	let isPlaying = $state(false);
	let tick = $state(0);
	let peakHz = $state(0);
	let centroidHz = $state(0);
	let rmsDb = $state(-48.0);
	let fluxPct = $state(0);
	let bassPct = $state(0);
	let trackLabel = $state('NERV-PULSE.MP3 (138 BPM)');
	let liveBins = $state<number[] | null>(null);
	let liveL = $state(0);
	let liveR = $state(0);
	const isLive = $derived(isPlaying || (externalPlaying && !!externalAnalyser));
	const activeTrack = $derived(
		!isPlaying && externalPlaying && externalTrackLabel ? externalTrackLabel : trackLabel
	);

	let audioEl: HTMLAudioElement | null = null;
	let audioCtx: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let analyserL: AnalyserNode | null = null;
	let analyserR: AnalyserNode | null = null;
	let sourceNode: MediaElementAudioSourceNode | null = null;
	let rafId = 0;
	let objectUrl: string | null = null;

	onMount(() => {
		const id = setInterval(() => {
			if (!isLive) tick += 1;
		}, 140);

		return () => {
			clearInterval(id);
			cancelAnimationFrame(rafId);
			audioEl?.pause();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
			audioCtx?.close().catch(() => {});
		};
	});

	function ensureAudio() {
		if (!audioEl) {
			audioEl = new Audio(audioSrc);
			audioEl.loop = true;
			audioEl.crossOrigin = 'anonymous';
			audioEl.addEventListener('ended', () => {
				isPlaying = false;
				liveBins = null;
				liveL = 0;
				liveR = 0;
			});
		}
		if (!audioCtx) {
			audioCtx = new AudioContext();
			analyser = audioCtx.createAnalyser();
			analyser.fftSize = 256;
			analyser.smoothingTimeConstant = 0.72;

			const splitter = audioCtx.createChannelSplitter(2);
			analyserL = audioCtx.createAnalyser();
			analyserL.fftSize = 128;
			analyserL.smoothingTimeConstant = 0.68;

			analyserR = audioCtx.createAnalyser();
			analyserR.fftSize = 128;
			analyserR.smoothingTimeConstant = 0.68;

			sourceNode = audioCtx.createMediaElementSource(audioEl);
			sourceNode.connect(analyser);
			sourceNode.connect(splitter);
			splitter.connect(analyserL, 0);
			splitter.connect(analyserR, 1);
			analyser.connect(audioCtx.destination);
		}
	}

	function channelLevel(node: AnalyserNode | null): number {
		if (!node) return 0;
		const buf = new Uint8Array(node.fftSize);
		node.getByteTimeDomainData(buf);
		let sumSq = 0;
		for (let i = 0; i < buf.length; i++) {
			const centered = (buf[i] - 128) / 128;
			sumSq += centered * centered;
		}
		const rms = Math.sqrt(sumSq / buf.length);
		return Math.max(0.08, Math.min(1, rms * 2.8));
	}

	$effect(() => {
		if (externalPlaying && externalAnalyser && !isPlaying) {
			cancelAnimationFrame(rafId);
			pump();
		} else if (!externalPlaying && !isPlaying) {
			cancelAnimationFrame(rafId);
			liveBins = null;
			liveL = 0;
			liveR = 0;
			peakHz = 0;
			centroidHz = 0;
			rmsDb = -48.0;
			fluxPct = 0;
			bassPct = 0;
		}
	});

	function pump() {
		const activeNode = isPlaying ? analyser : externalPlaying ? externalAnalyser : null;
		if (!activeNode) {
			liveBins = null;
			return;
		}
		const binCount = activeNode.frequencyBinCount;
		const data = new Uint8Array(binCount);
		activeNode.getByteFrequencyData(data);

		const next: number[] = [];
		let maxVal = 0;
		let maxBin = 1;
		let totalWeight = 0;
		let weightedBinSum = 0;
		let bassSum = 0;

		for (let i = 0; i < bars; i++) {
			const t0 = Math.pow(i / bars, 1.35);
			const t1 = Math.pow((i + 1) / bars, 1.35);
			const b0 = Math.max(1, Math.floor(t0 * 88));
			const b1 = Math.max(b0 + 1, Math.floor(t1 * 88));
			let sum = 0;
			for (let b = b0; b < b1 && b < binCount; b++) {
				const v = data[b];
				sum += v;
				totalWeight += v;
				weightedBinSum += b * v;
				if (v > maxVal) {
					maxVal = v;
					maxBin = b;
				}
			}
			const avg = sum / Math.max(1, b1 - b0);
			if (i < 4) bassSum += avg / 255;
			next.push(Math.max(0.14, Math.min(0.95, avg / 255)));
		}

		const sampleRate = activeNode.context.sampleRate || 48000;
		const nyquist = sampleRate / 2;
		peakHz = Math.round((maxBin / binCount) * nyquist);
		centroidHz =
			totalWeight > 0 ? Math.round(((weightedBinSum / totalWeight) / binCount) * nyquist) : 0;
		const avgNorm = next.reduce((a, b) => a + b, 0) / Math.max(1, next.length);
		fluxPct = avgNorm * 100;
		bassPct = (bassSum / 4) * 100;
		liveBins = next;
		if (isPlaying) {
			liveL = channelLevel(analyserL);
			liveR = channelLevel(analyserR);
		} else {
			const mono = channelLevel(activeNode);
			liveL = mono;
			liveR = mono;
		}
		const avgRms = Math.max(0.004, (liveL + liveR) * 0.5);
		rmsDb = Math.max(-48, Math.min(0, 20 * Math.log10(avgRms)));
		rafId = requestAnimationFrame(pump);
	}

	async function togglePlay() {
		ensureAudio();
		if (!audioEl || !audioCtx) return;
		if (audioCtx.state === 'suspended') await audioCtx.resume();

		if (isPlaying) {
			audioEl.pause();
			isPlaying = false;
			cancelAnimationFrame(rafId);
			liveBins = null;
			liveL = 0;
			liveR = 0;
		} else {
			await audioEl.play();
			isPlaying = true;
			pump();
		}
	}

	async function handleFile(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		ensureAudio();
		if (!audioEl || !audioCtx) return;
		if (objectUrl) URL.revokeObjectURL(objectUrl);
		objectUrl = URL.createObjectURL(file);
		audioEl.src = objectUrl;
		trackLabel = file.name.toUpperCase();
		if (audioCtx.state === 'suspended') await audioCtx.resume();
		await audioEl.play();
		isPlaying = true;
		cancelAnimationFrame(rafId);
		pump();
	}

	const idleBins = $derived(
		Array.from({ length: bars }, (_, i) => {
			const n = i / bars;
			const v =
				0.5 +
				Math.sin(n * 8.4 + tick * 0.14) * 0.18 +
				Math.cos(n * 19 - tick * 0.09) * 0.12;
			return Math.max(0.18, Math.min(0.9, v));
		})
	);

	const activeBins = $derived(isLive && liveBins ? liveBins : idleBins);

	const W = 480;
	const H = 168;
	const plotTop = 32;
	const plotBottom = 160;
	const plotH = plotBottom - plotTop;
	const slantTotal = 72; // Diagonal slant across full plotH
	const slope = slantTotal / plotH; // dx per unit dy

	// Each green/teal bar is a slanted parallelogram aligned to the diagonal perspective grid
	const slantedBars = $derived.by(() => {
		const stepW = (W - 24) / bars;
		return activeBins.map((amp, i) => {
			const x0 = i * stepW - 14;
			const x1 = x0 + stepW + 0.6;
			const h = amp * plotH;
			const yTop = plotBottom - h;
			const dx = h * slope;
			return `${x0.toFixed(1)},${plotBottom} ${(x0 + dx).toFixed(1)},${yTop.toFixed(1)} ${(x1 + dx).toFixed(1)},${yTop.toFixed(1)} ${x1.toFixed(1)},${plotBottom}`;
		});
	});

	// Stereo L & R overlay ladder levels (0..11 rungs)
	const rungs = 11;
	const idleL = $derived(0.54 + Math.sin(tick * 0.22) * 0.2 + Math.cos(tick * 0.09) * 0.1);
	const idleR = $derived(0.46 + Math.cos(tick * 0.19 + 0.8) * 0.22 + Math.sin(tick * 0.11) * 0.08);
	const levelL = $derived(Math.max(1, Math.min(rungs, Math.round((isLive ? liveL : idleL) * rungs))));
	const levelR = $derived(Math.max(1, Math.min(rungs, Math.round((isLive ? liveR : idleR) * rungs))));
</script>

<div class="ev-wrap" class:is-live={isLive}>
	<div class="ev-stage">
		<svg viewBox="0 0 {W} {H}" class="ev-svg" role="img" aria-label="Energy Observational Data Visualizer">
		<defs>
			<linearGradient id="ev-spec-grad" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#22d645" />
				<stop offset="52%" stop-color="#1ec877" />
				<stop offset="100%" stop-color="#1bb4a2" />
			</linearGradient>
			<linearGradient id="ev-ladder-grad" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#ffca28" />
				<stop offset="100%" stop-color="#ff8c00" />
			</linearGradient>
			<clipPath id="ev-plot-clip">
				<rect x="0" y={plotTop} width={W} height={plotH} />
			</clipPath>
		</defs>

		<rect x="0" y="0" width={W} height={H} fill="#000000" />

		<!-- Diagonal perspective grid lines matching exact bar slant -->
		<g clip-path="url(#ev-plot-clip)">
			{#each Array.from({ length: 14 }) as _, i}
				{@const x0 = -50 + i * 44}
				<line
					x1={x0}
					y1={plotBottom}
					x2={x0 + slantTotal}
					y2={plotTop}
					stroke="#1c3b24"
					stroke-width="0.75"
				/>
			{/each}

			<!-- Horizontal amber level dashed ticks -->
			{#each [plotBottom - 36, plotBottom - 72, plotBottom - 108] as yGuide}
				{#each Array.from({ length: 12 }) as _, gi}
					{@const gx = gi * 44 - 6 + (plotBottom - yGuide) * slope}
					<line x1={gx} y1={yGuide} x2={gx + 5} y2={yGuide} stroke="#ff941a" stroke-width="1" opacity="0.55" />
				{/each}
			{/each}

			<!-- Slanted diagonal green/teal spectrum bars -->
			{#each slantedBars as poly}
				<polygon points={poly} fill="url(#ev-spec-grad)" opacity="0.96" />
			{/each}

			<!-- Slanted scale ticks inside the bottom edge of the green bars (matching SEQ_125) -->
			{#each Array.from({ length: 64 }) as _, ti}
				{@const tx = ti * 7.5}
				{@const isMajor = ti % 4 === 0}
				{@const tickH = isMajor ? 13 : 6}
				<line
					x1={tx}
					y1={plotBottom}
					x2={tx + tickH * slope}
					y2={plotBottom - tickH}
					stroke="#f5f0c8"
					stroke-width={isMajor ? 1.6 : 0.9}
					opacity={isMajor ? 0.88 : 0.65}
				/>
			{/each}

			<!-- Two slanted golden-orange overlay ladders showcasing Stereo L & R -->
			{#each [
				{ ch: 'L', xBase: 14, lvl: levelL },
				{ ch: 'R', xBase: 212, lvl: levelR }
			] as col}
				{#each Array.from({ length: rungs }) as _, r}
					{@const frac0 = r / rungs}
					{@const frac1 = (r + 0.8) / rungs}
					{@const yBot = plotBottom - frac0 * (plotH - 8) - 2}
					{@const yTop = plotBottom - frac1 * (plotH - 8) - 2}
					{@const dx0 = (plotBottom - yBot) * slope}
					{@const dx1 = (plotBottom - yTop) * slope}
					{@const xBL = col.xBase + dx0}
					{@const xTL = col.xBase + dx1}
					{@const w = 31}
					{@const isOn = r < col.lvl}
					<polygon
						points="{xBL.toFixed(1)},{yBot.toFixed(1)} {(xBL + w).toFixed(1)},{yBot.toFixed(1)} {(xTL + w).toFixed(1)},{yTop.toFixed(1)} {xTL.toFixed(1)},{yTop.toFixed(1)}"
						fill={isOn ? 'url(#ev-ladder-grad)' : 'rgba(255, 148, 26, 0.06)'}
						stroke="#000000"
						stroke-width="1.35"
					/>
				{/each}
				<!-- Channel tag at base of each stereo ladder -->
				<rect x={col.xBase + 8} y={plotBottom - 13} width="15" height="11" rx="2" fill="#000000" stroke="#ffaa22" stroke-width="1" />
				<text x={col.xBase + 15.5} y={plotBottom - 4.8} text-anchor="middle" class="ev-ch-txt">{col.ch}</text>
			{/each}
		</g>

		<!-- Double phosphor-green & amber ruler along bottom edge -->
		<line x1="0" y1={plotBottom} x2={W} y2={plotBottom} stroke="#46f76a" stroke-width="1.4" />
		{#each Array.from({ length: 80 }) as _, i}
			{@const tx = 4 + i * 6}
			{@const major = i % 4 === 0}
			<line
				x1={tx}
				y1={plotBottom - (major ? 4.5 : 2)}
				x2={tx}
				y2={plotBottom + (major ? 3.5 : 2)}
				stroke="#46f76a"
				stroke-width={major ? 1.3 : 0.8}
			/>
		{/each}
		<line x1="0" y1={plotBottom + 5} x2={W} y2={plotBottom + 5} stroke="#ff941a" stroke-width="1" opacity="0.85" />
		</svg>

		<!-- Asymmetric, multi-scale floating HUD telemetry overlays inspired by Israfel HUD -->
		<div class="ev-hud-tl">
			<EvaHudBox
				size="sm"
				color="#fff275"
				borderColor="#ff941a"
				text="ENERGY OBSERVATIONAL DATA"
			/>
		</div>

		<div class="ev-hud-mid-l">
			<EvaHudBox
				size="sm"
				eyebrow="FFT // PEAK BAND"
				color={isLive ? '#fff275' : '#ff941a'}
				borderColor={isLive ? '#46f76a' : '#ff941a'}
				text="PEAK FREQ:"
				subtext={`${String(peakHz).padStart(5, '0')} Hz`}
				width="102px"
				mono
			/>
		</div>

		<div class="ev-hud-mid-r">
			<EvaHudBox
				size="lg"
				eyebrow="SPECTRAL FLUX // MAGI"
				color={isLive ? '#ffca4a' : '#ff941a'}
				borderColor="#ff5e1a"
				text="%ENERGY DENSITY:"
				subtext={`${fluxPct.toFixed(4).padStart(7, '0')}%`}
				width="162px"
				mono
			/>
		</div>

		<div class="ev-hud-tr">
			<EvaHudBox
				size="xs"
				color={isLive ? '#46f76a' : '#fff275'}
				borderColor={isLive ? '#46f76a' : '#ff941a'}
				text="SIGNAL: LIVE FFT"
				width="108px"
				mono
			/>
			<EvaHudBox
				size="xs"
				color="#ff941a"
				text={`GAIN: -${Math.abs(rmsDb).toFixed(1).padStart(4, '0')} dB`}
				width="108px"
				mono
			/>
		</div>
	</div>

	<!-- Separate focused bottom HUD telemetry boxes (strict monospace + non-truncating widths) -->
	<div class="ev-ftr">
		<EvaHudBox
			size="xs"
			color="#ff941a"
			text={`BASS: ${String(Math.round(bassPct)).padStart(3, '0')}%`}
			width="82px"
			mono
		/>
		<EvaHudBox
			size="xs"
			color="#fff275"
			borderColor="#ff941a"
			text={`CH-L: ${String(Math.round(liveL * 100)).padStart(3, '0')}%`}
			subtext={`CH-R: ${String(Math.round(liveR * 100)).padStart(3, '0')}%`}
			width="84px"
			mono
		/>
		<EvaHudBox
			size="xs"
			color="#fff275"
			borderColor="#ff941a"
			text="CENTROID:"
			subtext={`${String(centroidHz).padStart(5, '0')} Hz`}
			width="86px"
			mono
		/>
		<EvaHudBox size="md" color="#ff941a" text="OBSERVED BY MAGI" />
	</div>

	{#if showControls}
		<div class="ev-controls">
			<EvaTransportButton playing={isPlaying} label="AUDIO" minWidth="96px" onToggle={togglePlay} />
			<label class="eva-btn static-btn">
				LOAD MP3
				<input type="file" accept="audio/*" onchange={handleFile} hidden />
			</label>
			<span class="ev-track">{isLive ? `PLAYING: ${activeTrack}` : `READY: ${activeTrack}`}</span>
		</div>
	{/if}
</div>

<style>
	.ev-wrap {
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		padding: 0.55rem;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.ev-wrap.is-live {
		border-color: #46f76a;
		outline-color: rgba(70, 247, 106, 0.55);
		box-shadow: inset 0 0 18px rgba(70, 247, 106, 0.14);
	}

	.ev-stage {
		position: relative;
	}

	.ev-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.ev-hud-tl {
		position: absolute;
		top: 0.25rem;
		left: 0.35rem;
		pointer-events: none;
	}

	.ev-hud-mid-l {
		position: absolute;
		top: 29%;
		left: 11%;
		pointer-events: none;
	}

	.ev-hud-mid-r {
		position: absolute;
		top: 34%;
		right: 17%;
		pointer-events: none;
	}

	.ev-hud-tr {
		position: absolute;
		top: 0.25rem;
		right: 0.35rem;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.2rem;
		pointer-events: none;
	}

	.ev-ftr {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 0.45rem;
	}

	.ev-ch-txt {
		font-family: var(--eva-font-num);
		font-size: 8.2px;
		font-weight: 700;
		fill: #fff275;
	}

	.ev-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.ev-track {
		font-family: var(--eva-font-display);
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--eva-text-muted);
		margin-left: auto;
	}
</style>
