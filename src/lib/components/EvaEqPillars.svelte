<svelte:options customElement={{ tag: 'eva-eq-pillars', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';
	import EvaTransportButton from './EvaTransportButton.svelte';

	interface Props {
		audioSrc?: string;
		bands?: number;
		channels?: string[];
		showControls?: boolean;
		externalAnalyser?: AnalyserNode | null;
		externalPlaying?: boolean;
		externalTrackLabel?: string;
	}

	const defaultChannels = [
		'TEMPORAL LOBE',
		'AMYGDALA',
		'HIPPOCAMPUS',
		'PARIETAL LOBE',
		'MOTOR CORTEX',
		'SENSORY CORTEX',
		'FRONTAL LOBE'
	];

	let {
		audioSrc = '/audio/nerv-pulse.mp3',
		bands = 7,
		channels = defaultChannels,
		showControls = true,
		externalAnalyser = null,
		externalPlaying = false,
		externalTrackLabel = ''
	}: Props = $props();

	const W = 460;
	const H = 224;
	const Y_AXIS = 72;

	let isPlaying = $state(false);
	let timeSec = $state(0);
	let trackLabel = $state('NERV-PULSE.MP3');
	const isLive = $derived(isPlaying || (externalPlaying && !!externalAnalyser));
	const activeTrack = $derived(
		!isPlaying && externalPlaying && externalTrackLabel ? externalTrackLabel : trackLabel
	);
	let bandLevels = $state<number[]>(Array(7).fill(0));
	let bandEnergy = $state<number[]>(Array(7).fill(0));
	let bandRoughness = $state<number[]>(Array(7).fill(0));
	let bandPitch = $state<number[]>(Array(7).fill(0.5));

	let audioEl: HTMLAudioElement | null = null;
	let audioCtx: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let sourceNode: MediaElementAudioSourceNode | null = null;
	let freqBuf: Uint8Array<ArrayBuffer> | null = null;
	let timeBuf: Uint8Array<ArrayBuffer> | null = null;
	let rafId = 0;
	let objectUrl: string | null = null;

	const prevRaw = new Float32Array(16).fill(0);
	const slowFloor = new Float32Array(16).fill(0);
	const smoothLvl = new Float32Array(16).fill(0);
	const smoothExcite = new Float32Array(16).fill(0);
	const smoothRough = new Float32Array(16).fill(0);
	const smoothPitch = new Float32Array(16).fill(0.5);

	onMount(() => {
		const t0 = performance.now();
		let prevTime = t0;

		const tick = (now: number) => {
			const dt = Math.min(0.05, Math.max(0.004, (now - prevTime) / 1000));
			prevTime = now;
			const t = (now - t0) * 0.001;
			timeSec = t;

			const activeNode = isPlaying ? analyser : externalPlaying ? externalAnalyser : null;
			if (activeNode) {
				if (!freqBuf || freqBuf.length !== activeNode.frequencyBinCount) {
					freqBuf = new Uint8Array(new ArrayBuffer(activeNode.frequencyBinCount));
				}
				if (!timeBuf || timeBuf.length !== activeNode.fftSize) {
					timeBuf = new Uint8Array(new ArrayBuffer(activeNode.fftSize));
				}
				activeNode.getByteFrequencyData(freqBuf);
				activeNode.getByteTimeDomainData(timeBuf);
			}

			const count = Math.max(2, bands);
			const nextLvls = new Array<number>(count);
			const nextExc = new Array<number>(count);
			const nextRough = new Array<number>(count);
			const nextPitch = new Array<number>(count);

			for (let i = 0; i < count; i++) {
				let raw = 0;
				let targetRough = 0;
				let localPitch = 0.5;

				if (activeNode && freqBuf) {
					const binCount = freqBuf.length;
					const b0 = Math.max(1, Math.floor(Math.pow(i / count, 1.55) * 84));
					const b1 = Math.max(b0 + 1, Math.floor(Math.pow((i + 1) / count, 1.55) * 84));
					let sum = 0;
					let peak = 0;
					let weightedIdx = 0;
					let diffSum = 0;
					let prevBinVal = freqBuf[b0] ?? 0;

					for (let b = b0; b < b1 && b < binCount; b++) {
						const v = freqBuf[b] ?? 0;
						sum += v;
						weightedIdx += (b - b0) * v;
						diffSum += Math.abs(v - prevBinVal);
						prevBinVal = v;
						if (v > peak) peak = v;
					}
					const span = Math.max(1, b1 - b0);
					const avg = sum / span / 255;
					const peakNorm = peak / 255;
					// Balanced perceptual tilt without crushing dynamic range
					const tilt = 1.0 + i * 0.14;
					const dBVal = (avg * 0.5 + peakNorm * 0.5) * tilt;
					const noiseFloor = 0.08;
					const gated = dBVal <= noiseFloor ? 0 : (dBVal - noiseFloor) / (1 - noiseFloor);
					// Moderate expansion preserves dynamic range while reaching near-max power like SEQ_009
					raw = gated === 0 ? 0 : Math.min(1.15, Math.pow(gated, 1.45));

					if (sum > 0 && span > 1) {
						localPitch = Math.max(0, Math.min(1, weightedIdx / sum / Math.max(1, span - 1)));
					}
					const crest = peakNorm > 0.03 ? (peakNorm - avg) / peakNorm : 0;
					const binJagged = diffSum / span / 128;
					targetRough = Math.min(1, crest * 0.85 + binJagged * 1.1 + (i / count) * 0.18);
				}

				const attackDelta = Math.max(0, raw - prevRaw[i]);
				prevRaw[i] = raw;

				slowFloor[i] = slowFloor[i] * 0.94 + raw * 0.06;
				const transientFlux = Math.max(0, raw - slowFloor[i]) * 2.1 + attackDelta * 2.5;

				const lvlRate = raw > smoothLvl[i] ? 18 : 8.5;
				smoothLvl[i] += (raw - smoothLvl[i]) * Math.min(1, dt * lvlRate);

				const targetExcite =
					raw < 0.008 ? 0 : Math.min(1.38, raw * 0.96 + transientFlux * 0.72);
				const excRate = targetExcite > smoothExcite[i] ? 24 : targetExcite === 0 ? 11 : 9.5;
				smoothExcite[i] += (targetExcite - smoothExcite[i]) * Math.min(1, dt * excRate);
				if (targetExcite === 0 && smoothExcite[i] < 0.01) {
					smoothExcite[i] = 0;
				}

				const roughWithFlux =
					raw < 0.008 ? 0 : Math.min(1, targetRough * 0.65 + transientFlux * 0.9 + raw * 0.35);
				smoothRough[i] += (roughWithFlux - smoothRough[i]) * Math.min(1, dt * 14);
				smoothPitch[i] += (localPitch - smoothPitch[i]) * Math.min(1, dt * 10);

				nextLvls[i] = smoothLvl[i];
				nextExc[i] = smoothExcite[i];
				nextRough[i] = smoothRough[i];
				nextPitch[i] = smoothPitch[i];
			}

			bandLevels = nextLvls;
			bandEnergy = nextExc;
			bandRoughness = nextRough;
			bandPitch = nextPitch;
			rafId = requestAnimationFrame(tick);
		};

		rafId = requestAnimationFrame(tick);

		return () => {
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
			});
		}
		if (!audioCtx) {
			audioCtx = new AudioContext();
			analyser = audioCtx.createAnalyser();
			analyser.fftSize = 256;
			analyser.smoothingTimeConstant = 0.7;
			freqBuf = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
			timeBuf = new Uint8Array(new ArrayBuffer(analyser.fftSize));
			sourceNode = audioCtx.createMediaElementSource(audioEl);
			sourceNode.connect(analyser);
			analyser.connect(audioCtx.destination);
		}
	}

	async function togglePlay() {
		ensureAudio();
		if (!audioEl || !audioCtx) return;
		if (audioCtx.state === 'suspended') await audioCtx.resume();
		if (isPlaying) {
			audioEl.pause();
			isPlaying = false;
		} else {
			await audioEl.play();
			isPlaying = true;
		}
	}

	async function handleFile(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
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
	}

	function buildNeuralTrace(
		xBase: number,
		maxHalfW: number,
		idx: number,
		energy: number,
		roughness: number,
		pitch: number,
		t: number
	): string {
		if (energy <= 0.01) {
			return `M${xBase.toFixed(1)},0 L${xBase.toFixed(1)},${H}`;
		}

		const pts: string[] = [];
		const steps = 160;
		// Allow genuine clipping spikes to punch past lane borders (up to +24%)
		const amp = Math.min(1.24, energy) * maxHalfW;
		const clipBound = maxHalfW * 1.24;
		const pitchShift = 0.72 + pitch * 0.78;
		const roughMix = Math.max(0.25, Math.min(1.15, 0.45 + roughness * 0.75));
		const wander = Math.sin(t * 0.55 + idx * 1.7) * 0.45;
		// 3 same (1,5,6: dense bursty spikes), 1 sameish (2: tight upper/lower packet burst), 2 diff (3: sparse needle bursts, 4: sweeping smooth S-curve)
		const mode = idx % 6;

		for (let s = 0; s <= steps; s++) {
			const ny = s / steps;
			const y = ny * H;
			const warp = ny + 0.04 * Math.sin(ny * 7.1 + t * (1.15 + idx * 0.14));
			let shape = 0;

			if (mode === 4) {
				// Diff #2 (MOTOR CORTEX): sweeping smooth low-frequency S-curves driven by pitch & energy
				const freq = (3.8 + pitch * 2.4 + wander * 1.2);
				const slow = Math.sin(warp * Math.PI * freq - t * 3.4 + idx) * 0.86;
				const med = Math.sin(warp * Math.PI * (freq * 2.05) + t * 5.1) * (0.28 + roughness * 0.25);
				const swell = 0.55 + 0.45 * Math.sin(ny * Math.PI * 2.3 + t * 1.3 + idx);
				shape = (slow + med) * swell;
			} else if (mode === 3) {
				// Diff #1 (PARIETAL LOBE): taut baseline punctuated by razor-sharp isolated needle packets
				const c1 = (0.22 + pitch * 0.35 + t * 0.09 + 0.1 * Math.sin(t * 0.9)) % 1;
				const c2 = (0.64 - pitch * 0.28 + t * 0.07 + 0.11 * Math.cos(t * 0.7)) % 1;
				const p1 = Math.exp(-Math.pow((ny - c1) / 0.06, 2));
				const p2 = Math.exp(-Math.pow((ny - c2) / 0.075, 2));
				const env = 0.08 + Math.max(p1, p2) * (1.15 + roughness * 0.35);
				const spike =
					Math.sin(warp * 105 * pitchShift - t * 31 + idx) * 0.6 +
					Math.cos(warp * 195 * pitchShift + t * 44) * 0.48 +
					Math.sin(warp * 48 + t * 14) * 0.22;
				shape = spike * env;
			} else if (mode === 2) {
				// Sameish (HIPPOCAMPUS): similar burst family with localized high-energy pocket + calmer tail
				const c1 = 0.35 + 0.28 * Math.sin(t * 0.85 + pitch * 2.1);
				const env = 0.16 + 1.05 * Math.exp(-Math.pow((ny - c1) / 0.16, 2));
				const jagged =
					Math.sin(warp * 78 * pitchShift + t * 25 + idx) * 0.54 +
					Math.cos(warp * 152 * pitchShift - t * 37) * 0.42 * roughMix;
				shape = jagged * env;
			} else {
				// 3 Same (1: AMYGDALA, 5: SENSORY CORTEX, 6: FRONTAL LOBE): full-height energetic neural burst waves
				const c1 = 0.46 + 0.28 * Math.sin(t * (0.75 + idx * 0.1) + idx + pitch);
				const c2 = 0.52 + 0.32 * Math.cos(t * 0.58 + idx * 2.1);
				const burstEnv =
					0.24 +
					0.95 * Math.exp(-Math.pow((ny - c1) / 0.19, 2)) +
					0.74 * Math.exp(-Math.pow((ny - c2) / 0.13, 2));
				const env = Math.min(1.32, burstEnv);
				const jagged =
					Math.sin(warp * (84 + pitch * 28) + t * 27 + idx * 1.9) * 0.52 +
					Math.sin(warp * (166 + pitch * 34) - t * 40 + idx * 0.8) * 0.42 * roughMix +
					Math.cos(warp * 255 + t * 54) * 0.26 * roughness;
				shape = jagged * env;
			}

			let wave = shape * amp;

			// Band-filtered live time-domain audio waveform injection
			if (isLive && timeBuf) {
				const bufLen = timeBuf.length;
				const baseIdx = Math.min(
					bufLen - 1,
					Math.floor((((s + idx * 19) % steps) / steps) * bufLen)
				);
				let liveSample = 0;
				if (idx <= 2) {
					let acc = 0;
					for (let k = -2; k <= 2; k++) {
						const bi = Math.max(0, Math.min(bufLen - 1, baseIdx + k * 2));
						acc += (timeBuf[bi] - 128) / 128;
					}
					liveSample = acc / 5;
				} else if (idx <= 4) {
					const bi2 = Math.max(0, baseIdx - 3);
					liveSample = ((timeBuf[baseIdx] - 128) - (timeBuf[bi2] - 128)) / 128;
				} else {
					const bi1 = Math.max(0, baseIdx - 1);
					liveSample = (((timeBuf[baseIdx] - 128) - (timeBuf[bi1] - 128)) / 128) * 1.45;
				}
				wave = wave * 0.56 + liveSample * amp * (0.95 + roughness * 0.55);
			}

			const x = xBase + Math.max(-clipBound, Math.min(clipBound, wave));
			pts.push(`${s === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
		}
		return pts.join(' ');
	}

	const rightCount = $derived(Math.max(1, bands - 1));
	const rightColW = $derived((W - 56) / rightCount);
</script>

<div class="eq-wrap" class:is-live={isLive}>
	<svg viewBox="0 0 {W} {H}" class="eq-svg" role="img" aria-label="SEQ_009 Neural EQ Pillars Visualizer">
		<defs>
			<!-- Amber-olive upper zone sweeping into deep indigo-blue lower zone matching SEQ_009 bursts -->
			<linearGradient id="eq-pillar-grad" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#c99c18" />
				<stop offset="32%" stop-color="#6b7e15" />
				<stop offset="60%" stop-color="#283d58" />
				<stop offset="84%" stop-color="#2738a6" />
				<stop offset="100%" stop-color="#0b1038" />
			</linearGradient>

			<filter id="eq-phosphor" x="-20%" y="-15%" width="140%" height="130%">
				<feGaussianBlur stdDeviation="1.5" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<rect x="0" y="0" width={W} height={H} fill="#020302" />

		<!-- Left Column 00 (TEMPORAL LOBE) before the double red ruler -->
		<rect
			x="18"
			y="0"
			width="22"
			height={H}
			fill="url(#eq-pillar-grad)"
			opacity={0.55 + (bandLevels[0] ?? 0.4) * 0.45}
		/>
		<g filter="url(#eq-phosphor)">
			<text
				x="9"
				y={Y_AXIS - 6}
				text-anchor="start"
				transform="rotate(-90, 9, {Y_AXIS - 6})"
				class="eq-vtag"
			>
				{channels[0] ?? 'TEMPORAL LOBE'}
			</text>
			<text x="9" y={Y_AXIS + 12} text-anchor="middle" class="eq-idx">00</text>
			<text x="8" y={H - 12} text-anchor="middle" class="eq-idx">-00</text>
		</g>

		<!-- Double-rail red graduated ruler (SEQ_009) -->
		<g filter="url(#eq-phosphor)">
			<line x1="47" y1="0" x2="47" y2={H} stroke="#ff2222" stroke-width="1.35" />
			<line x1="54" y1="0" x2="54" y2={H} stroke="#ff2222" stroke-width="1.35" />
			{#each Array.from({ length: 56 }) as _, i}
				{@const ty = 2 + i * 4}
				{@const isMajor = i % 4 === 0}
				{@const isMid = i % 2 === 0}
				<line
					x1={isMajor ? 39 : isMid ? 42 : 44}
					y1={ty}
					x2="47"
					y2={ty}
					stroke="#ff2222"
					stroke-width={isMajor ? 1.2 : 0.85}
				/>
				<line
					x1="54"
					y1={ty}
					x2={isMajor ? 58 : 56.5}
					y2={ty}
					stroke="#ff2222"
					stroke-width={isMajor ? 1.1 : 0.8}
				/>
			{/each}
		</g>

		<!-- Right Columns 01..0N: [Vertical Green Trace + Neural Label | Full-Height Gradient Pillar] -->
		{#each Array.from({ length: rightCount }) as _, k}
			{@const i = k + 1}
			{@const cx = 56 + k * rightColW}
			{@const blackW = Math.max(26, rightColW * 0.64)}
			{@const traceX = cx + blackW * 0.5}
			{@const maxHalfW = blackW * 0.49}
			{@const textX = cx + blackW - 5.5}
			{@const pillarX = cx + blackW}
			{@const pillarW = Math.max(14, rightColW - blackW)}
			{@const lvl = bandLevels[i] ?? 0}
			{@const energy = bandEnergy[i] ?? 0}
			{@const roughness = bandRoughness[i] ?? 0}
			{@const pitch = bandPitch[i] ?? 0.5}
			{@const code = String(i).padStart(2, '0')}
			{@const label = channels[i] ?? `CH-${code}`}

			<!-- Full-height olive-green to indigo-amber pillar modulated by band level -->
			<rect
				x={pillarX}
				y="0"
				width={pillarW}
				height={H}
				fill="url(#eq-pillar-grad)"
				opacity={0.42 + lvl * 0.58}
			/>

			<!-- Vertical neon-green oscilloscope trace swinging border-to-border on peaks -->
			<path
				d={buildNeuralTrace(traceX, maxHalfW, i, energy, roughness, pitch, timeSec)}
				class="eq-trace"
				filter="url(#eq-phosphor)"
			/>

			<!-- Channel region name (rotated vertically above crosshair) & +/- index -->
			<g filter="url(#eq-phosphor)">
				<text
					x={textX}
					y={Y_AXIS - 6}
					text-anchor="start"
					transform="rotate(-90, {textX}, {Y_AXIS - 6})"
					class="eq-vtag"
				>
					{label}
				</text>
				<text x={textX} y={Y_AXIS + 12} text-anchor="middle" class="eq-idx">{code}</text>
				<text x={textX - 1} y={H - 12} text-anchor="middle" class="eq-idx">-{code}</text>
			</g>
		{/each}

		<!-- Horizontal glowing red crosshair line across full width -->
		<line x1="0" y1={Y_AXIS} x2={W} y2={Y_AXIS} stroke="rgba(255, 34, 34, 0.45)" stroke-width="3.6" />
		<line x1="0" y1={Y_AXIS} x2={W} y2={Y_AXIS} stroke="#ff2b1a" stroke-width="1.5" filter="url(#eq-phosphor)" />
	</svg>

	{#if showControls}
		<div class="eq-controls">
			<EvaTransportButton playing={isPlaying} label="AUDIO" minWidth="96px" onToggle={togglePlay} />
			<label class="eva-btn">
				LOAD MP3
				<input type="file" accept="audio/*" onchange={handleFile} hidden />
			</label>
			<span class="eq-track">{activeTrack}</span>
		</div>
	{/if}
</div>

<style>
	.eq-wrap {
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.eq-wrap.is-live {
		border-color: #46f76a;
		outline-color: rgba(70, 247, 106, 0.55);
	}

	.eq-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.eq-trace {
		fill: none;
		stroke: #b8ffec;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.eq-idx {
		font-family: var(--eva-font-mono);
		font-size: 7.4px;
		fill: #ff2b1a;
		font-weight: 700;
		letter-spacing: 0.04em;
	}

	.eq-vtag {
		font-family: "Oswald", var(--eva-font-display), sans-serif;
		font-size: 7.1px;
		fill: #ff2b1a;
		font-weight: 500;
		letter-spacing: 0.04em;
	}

	.eq-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.45rem;
	}

	.eq-track {
		font-family: var(--eva-font-display);
		font-size: 0.76rem;
		font-weight: 700;
		color: var(--eva-text-muted);
		margin-left: auto;
	}
</style>
