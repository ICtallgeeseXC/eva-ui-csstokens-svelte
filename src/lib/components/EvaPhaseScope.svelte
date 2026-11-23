<svelte:options customElement={{ tag: 'eva-phase-scope', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';
	import EvaTransportButton from './EvaTransportButton.svelte';

	interface Props {
		audioSrc?: string;
		showControls?: boolean;
		externalAnalyser?: AnalyserNode | null;
		externalPlaying?: boolean;
		externalTrackLabel?: string;
	}

	let {
		audioSrc = '/audio/nerv-pulse.mp3',
		showControls = true,
		externalAnalyser = null,
		externalPlaying = false,
		externalTrackLabel = ''
	}: Props = $props();

	const W = 460;
	const H = 224;
	const MID_Y = 112;
	const SCALE_Y = 1.02;
	const RAIL_TOP = MID_Y - 86 * SCALE_Y; // +86
	const RAIL_BOT = MID_Y + 86 * SCALE_Y; // -86
	const CENTER_X = 216;
	const CURVE_COUNT = 8;

	// Marching-squares scalar field grid resolution
	const COLS = 112;
	const ROWS = 64;
	const field = new Float32Array((COLS + 1) * (ROWS + 1));

	// 8 iso-contour levels spanning inner seam outward to edges
	const LEVELS = [0.06, 0.16, 0.26, 0.36, 0.46, 0.56, 0.66, 0.76];

	let canvasEl: HTMLCanvasElement | null = null;
	let isPlaying = $state(false);
	let trackLabel = $state('NERV-PULSE.MP3');
	const isLive = $derived(isPlaying || (externalPlaying && !!externalAnalyser));
	const activeTrack = $derived(
		!isPlaying && externalPlaying && externalTrackLabel ? externalTrackLabel : trackLabel
	);

	let audioEl: HTMLAudioElement | null = null;
	let audioCtx: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let sourceNode: MediaElementAudioSourceNode | null = null;
	let freqBuf: Uint8Array<ArrayBuffer> | null = null;
	let timeBuf: Uint8Array<ArrayBuffer> | null = null;
	let rafId = 0;
	let objectUrl: string | null = null;

	let energy = 0;
	let peakFlux = 0;
	let slowFloor = 0;
	let phaseT = 0;
	const bands = new Float32Array(8);

	function getCurveColor(e: number): string {
		if (e < 0.08) return '#ff8c1a';
		if (e < 0.22) return '#d4ea2a';
		if (e < 0.36) return '#9cf748';
		if (e < 0.52) return '#5ef792';
		if (e < 0.68) return '#26dcff';
		if (e < 0.83) return '#3b6dff';
		return '#8c42ff';
	}

	function drawFrame() {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		const dpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1;
		const targetW = Math.round(W * dpr);
		const targetH = Math.round(H * dpr);
		if (canvasEl.width !== targetW || canvasEl.height !== targetH) {
			canvasEl.width = targetW;
			canvasEl.height = targetH;
		}

		ctx.save();
		ctx.scale(dpr, dpr);

		// 1. Deep CRT black backdrop
		ctx.fillStyle = '#020203';
		ctx.fillRect(0, 0, W, H);

		// 2. Evaluate 2D scalar potential field F(u, v) with bounded vertical repulsion & free in-between modulation
		const b0 = bands[0];
		const b1 = bands[1];
		const b2 = bands[2];
		const b3 = bands[3];
		const b4 = bands[4];
		const b5 = bands[5];
		const b6 = bands[6];
		const b7 = bands[7];
		const lowBand = (b0 + b1) * 0.5;
		const midBand = (b2 + b3 + b4) * (1 / 3);
		const hiBand = (b5 + b6 + b7) * (1 / 3);

		// Mid-range dynamic baseline (~0.35-0.55) + transient pump boost up to 1.0 on beats/drops
		const midBase = Math.pow(Math.max(0, energy), 1.35) * 0.62;
		const pumpBoost = Math.pow(lowBand, 1.45) * 0.28 + peakFlux * 0.48;
		const repNorm = energy > 0.002 || peakFlux > 0.01 ? Math.min(1, midBase + pumpBoost) : 0;
		const repAmp = repNorm * 0.85;
		const repSigmaV = 0.21 + repNorm * 0.15;
		const repSigmaU = 0.42 + repNorm * 0.52;
		// Greater freedom in the in-between: center drifts & tilts dynamically with spectral balance
		const baseCenterU =
			repNorm > 0
				? repNorm * (0.14 + 0.14 * Math.sin(phaseT * 0.92)) + (hiBand - lowBand) * 0.22
				: 0;
		const topPhase = phaseT * 1.45 + (b2 - b4) * 2.1 + midBand * 1.3;
		const botPhase = -phaseT * 1.15 + (b1 - b5) * 2.3 + lowBand * 1.4;
		const smoothEps = 0.01 + repNorm * 0.16;

		// Traveling organic harmonic pockets for asymmetric in-between freedom
		const pockAU = -0.32 + 0.45 * Math.sin(phaseT * 0.83) + (b1 - b5) * 0.25;
		const pockAV = -0.34 + 0.22 * Math.cos(phaseT * 1.07);
		const pockBU = 0.36 + 0.42 * Math.cos(phaseT * 0.69) + (b6 - b2) * 0.25;
		const pockBV = 0.36 + 0.22 * Math.sin(phaseT * 1.21);
		const pockAAmp = (b2 * 0.14 + b4 * 0.12 - b0 * 0.08) * (0.4 + 0.85 * repNorm);
		const pockBAmp = (b3 * 0.14 + b6 * 0.12 - b1 * 0.08) * (0.4 + 0.85 * repNorm);

		const kTop = 9.8 + b3 * 4.4;
		const kBot = 9.4 + b2 * 4.2;

		const stride = COLS + 1;
		for (let r = 0; r <= ROWS; r++) {
			const v = (r / ROWS) * 2 - 1; // -1 at RAIL_TOP, +1 at RAIL_BOT
			const absV = Math.abs(v);
			// Uniform shallow corner perspective: straight vertical through ±70, tight uniform corner flare at ±70..±86
			const depthBend = absV > 0.8 ? Math.pow((absV - 0.8) / 0.2, 1.85) * 0.24 : 0;

			// C∞-smooth top/bottom blend avoids any crease/kink along y = 0
			const topBlend = 0.5 * (1 - Math.tanh(v / 0.14));
			const vAsym =
				v +
				(0.018 * topBlend - 0.022 * (1 - topBlend)) * repNorm +
				(b5 - b0) * 0.045 * Math.sin(phaseT * 1.3 + v * 2.2);
			const vRepEnv =
				repAmp > 0 ? Math.exp(-Math.pow(Math.abs(vAsym) / repSigmaV, 1.55)) : 0;
			const vCorridorEnv = repAmp > 0 ? Math.exp(-(v * v) / 0.11) : 0;
			const vWaveEnv =
				repAmp > 0 ? Math.exp(-(v * v) / 0.72) * Math.tanh((v * v) / 0.045) : 0;
			const rLobeVEnv =
				repAmp > 0 ? Math.exp(-Math.pow(absV, 3.6) * 0.9) * Math.tanh((v * v) / 0.035) : 0;
			const rLobeTop = Math.cos(kTop * v + 3.4 + Math.sin(topPhase) * 0.95);
			const rLobeBot = Math.cos(kBot * v - 2.6 + Math.cos(botPhase) * 0.95);
			const vFanWidth = 1.05 * topBlend + 1.55 * (1 - topBlend);

			const dvA = v - pockAV;
			const dvB = v - pockBV;
			const pockAVEnv = Math.exp(-(dvA * dvA) / 0.12) * Math.tanh((v * v) / 0.04);
			const pockBVEnv = Math.exp(-(dvB * dvB) / 0.12) * Math.tanh((v * v) / 0.04);

			for (let c = 0; c <= COLS; c++) {
				const x = (c / COLS) * W;
				const u = (x - CENTER_X) / (W * 0.46);

				if (repAmp === 0) {
					field[r * stride + c] = Math.abs(u) - depthBend;
					continue;
				}

				// Smooth asymmetric horizontal metric: left fans smoothly out past Y-axis; right loops stay in bounds
				const leftWeight = 0.5 * (1 - Math.tanh((u - 0.02) / 0.32));
				const leftExpand = leftWeight * repNorm * 0.44 * Math.exp(-(v * v) / vFanWidth);
				const uEff = u * (1 - leftExpand);
				const absUEff = Math.sqrt(uEff * uEff + smoothEps * smoothEps);

				const rowCenterU =
					baseCenterU + (0.055 * topBlend - 0.055 * (1 - topBlend)) * repNorm;
				const du = u - rowCenterU;
				const repel = repAmp * vRepEnv * Math.exp(-(du * du) / (2 * repSigmaU * repSigmaU));
				const corridor = 0.38 * repNorm * repNorm * leftWeight * vCorridorEnv;

				// Asymmetric right-side multi-lobed fingers/waists with dynamic frequency & phase freedom
				const rightWeight = 0.5 * (1 + Math.tanh((u - 0.16) / 0.24));
				const rightOuter = Math.exp(-Math.pow(u - 0.72, 2) / 0.24);
				const rEnv = rightWeight * rightOuter * rLobeVEnv;
				const waveTop =
					-0.33 * rLobeTop + 0.13 * Math.sin(6.4 * v - topPhase * 0.9 + u * 2.6) - 0.07;
				const waveBot =
					0.32 * rLobeBot - 0.13 * Math.sin(6.0 * v + botPhase * 0.95 - u * 2.4) - 0.06;
				const modTop = waveTop * (0.65 + 0.48 * midBand + 0.2 * b6);
				const modBot = waveBot * (0.65 + 0.48 * lowBand + 0.2 * b4);
				const rightMod = repNorm * rEnv * (topBlend * modTop + (1 - topBlend) * modBot);

				// Left-side organic mid-range undulation so both sides breathe freely in the in-between
				const leftMod =
					leftWeight *
					repNorm *
					vWaveEnv *
					(b1 * 0.13 * Math.sin(7.2 * v + phaseT * 1.8 - u * 2.4) +
						b4 * 0.1 * Math.cos(10.5 * v - phaseT * 2.3 + u * 3.1));

				// Traveling pockets + multi-band serpentine ripples
				const duA = u - pockAU;
				const duB = u - pockBU;
				const pockets =
					pockAAmp * pockAVEnv * Math.exp(-(duA * duA) / 0.14) -
					pockBAmp * pockBVEnv * Math.exp(-(duB * duB) / 0.14);

				const freqWave =
					(b0 * 0.11 * Math.sin(u * 3.3 - phaseT * 2.2 + (0.6 * topBlend - 0.7 * (1 - topBlend))) +
						b3 * 0.095 * Math.cos(u * 5.8 + phaseT * 2.9 + v * 2.4) +
						b6 * 0.075 * Math.sin(u * 9.4 - phaseT * 3.7 - v * 3.1) +
						b7 * 0.055 * Math.cos(u * 13.0 + phaseT * 4.4 + v * 3.6)) *
					vWaveEnv;

				let timeRipple = 0;
				if (timeBuf) {
					const tIdx = Math.min(timeBuf.length - 1, Math.floor((c / COLS) * timeBuf.length));
					timeRipple =
						((timeBuf[tIdx] - 128) / 128) * (0.08 + repNorm * 0.14) * vWaveEnv;
				}

				field[r * stride + c] =
					absUEff -
					depthBend +
					repel +
					corridor +
					rightMod +
					leftMod +
					pockets +
					freqWave +
					timeRipple;
			}
		}

		// 3. Render Marching-Squares iso-contours & rails BEHIND the horizontal green/red gridlines
		const color = getCurveColor(repNorm);
		ctx.strokeStyle = color;
		ctx.lineWidth = 1.05;
		ctx.lineCap = 'round';
		ctx.shadowColor = color;
		ctx.shadowBlur = 1.6;

		// Top & bottom asymptotic bounding rails
		ctx.beginPath();
		ctx.moveTo(0, RAIL_TOP);
		ctx.lineTo(W, RAIL_TOP + 1);
		ctx.moveTo(0, RAIL_BOT);
		ctx.lineTo(W, RAIL_BOT + 1);
		ctx.stroke();

		const dx = W / COLS;
		const dy = (RAIL_BOT - RAIL_TOP) / ROWS;

		ctx.beginPath();
		for (let li = 0; li < CURVE_COUNT; li++) {
			const iso = LEVELS[li];
			for (let r = 0; r < ROWS; r++) {
				const y0 = RAIL_TOP + r * dy;
				const y1 = y0 + dy;
				const row0 = r * stride;
				const row1 = row0 + stride;

				for (let c = 0; c < COLS; c++) {
					const v00 = field[row0 + c];
					const v10 = field[row0 + c + 1];
					const v11 = field[row1 + c + 1];
					const v01 = field[row1 + c];

					const idx =
						(v00 >= iso ? 8 : 0) |
						(v10 >= iso ? 4 : 0) |
						(v11 >= iso ? 2 : 0) |
						(v01 >= iso ? 1 : 0);

					if (idx === 0 || idx === 15) continue;

					const x0 = c * dx;
					const x1 = x0 + dx;

					const topX = x0 + ((iso - v00) / (v10 - v00 || 1e-6)) * dx;
					const rightY = y0 + ((iso - v10) / (v11 - v10 || 1e-6)) * dy;
					const botX = x0 + ((iso - v01) / (v11 - v01 || 1e-6)) * dx;
					const leftY = y0 + ((iso - v00) / (v01 - v00 || 1e-6)) * dy;

					const seg = (ax: number, ay: number, bx: number, by: number) => {
						ctx.moveTo(ax, ay);
						ctx.lineTo(bx, by);
					};

					switch (idx) {
						case 1:
						case 14:
							seg(x0, leftY, botX, y1);
							break;
						case 2:
						case 13:
							seg(botX, y1, x1, rightY);
							break;
						case 3:
						case 12:
							seg(x0, leftY, x1, rightY);
							break;
						case 4:
						case 11:
							seg(topX, y0, x1, rightY);
							break;
						case 5:
							seg(x0, leftY, topX, y0);
							seg(botX, y1, x1, rightY);
							break;
						case 6:
						case 9:
							seg(topX, y0, botX, y1);
							break;
						case 7:
						case 8:
							seg(x0, leftY, topX, y0);
							break;
						case 10:
							seg(topX, y0, x1, rightY);
							seg(x0, leftY, botX, y1);
							break;
					}
				}
			}
		}
		ctx.stroke();

		// 4. Horizontal green (+10..+100), white (0), red (-10..-100) gridlines IN FRONT OF contours
		//    Segmented at [208..224] & [360..371] so vertical gaps break ONLY the gridlines cleanly.
		ctx.shadowBlur = 0;
		ctx.font = '700 6.4px "Helvetica Neue", Helvetica, Arial, sans-serif';
		ctx.textBaseline = 'middle';

		for (let val = 100; val >= -100; val -= 10) {
			const y = MID_Y - val * SCALE_Y;
			ctx.beginPath();
			if (val === 0) {
				ctx.moveTo(0, y);
				ctx.lineTo(W, y);
				ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
				ctx.lineWidth = 1.2;
			} else {
				ctx.moveTo(58, y);
				ctx.lineTo(208, y);
				ctx.moveTo(224, y);
				ctx.lineTo(360, y);
				ctx.moveTo(371, y);
				ctx.lineTo(W, y);
				ctx.strokeStyle = val > 0 ? 'rgba(62, 232, 134, 0.78)' : 'rgba(205, 36, 20, 0.78)';
				ctx.lineWidth = 0.85;
			}
			ctx.stroke();

			// White tick on Y-axis spine
			ctx.beginPath();
			ctx.moveTo(32, y);
			ctx.lineTo(36.5, y);
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 0.95;
			ctx.stroke();

			ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
			ctx.textAlign = 'right';
			ctx.fillText(String(val), 53, y + 0.5);
		}

		// Left vertical white Y-axis spine
		ctx.beginPath();
		ctx.moveTo(32, 0);
		ctx.lineTo(32, H);
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 1.3;
		ctx.stroke();

		// 6. Four crisp glowing white 8-digit telemetry counters (00000000 in base state)
		const mag = repNorm < 0.01 ? 0 : Math.pow(repNorm, 1.45) * 34000000;
		const vA = `+ ${String(Math.round(mag * (0.62 + lowBand * 0.3))).padStart(8, '0')}`;
		const vB = `- ${String(Math.round(mag * (0.48 + midBand * 0.25))).padStart(8, '0')}`;
		const vC = `- ${String(Math.round(mag * (0.34 + hiBand * 0.35))).padStart(8, '0')}`;
		const vD = `+ ${String(Math.round(mag * (0.95 + midBand * 0.2))).padStart(8, '0')}`;

		ctx.font = '700 13px "Helvetica Neue", Helvetica, Arial, sans-serif';
		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'alphabetic';
		ctx.shadowColor = 'rgba(255, 255, 255, 0.72)';
		ctx.shadowBlur = 5;

		ctx.fillText(vA, 172, 29);
		ctx.fillText(vB, 318, 29);
		ctx.fillText(vC, 172, 206);
		ctx.fillText(vD, 318, 206);

		ctx.restore();
	}

	onMount(() => {
		drawFrame();
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
				resetToBase();
			});
		}
		if (!audioCtx) {
			audioCtx = new AudioContext();
			analyser = audioCtx.createAnalyser();
			analyser.fftSize = 256;
			analyser.smoothingTimeConstant = 0.42;
			freqBuf = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
			timeBuf = new Uint8Array(new ArrayBuffer(analyser.fftSize));
			sourceNode = audioCtx.createMediaElementSource(audioEl);
			sourceNode.connect(analyser);
			analyser.connect(audioCtx.destination);
		}
	}

	function resetToBase() {
		cancelAnimationFrame(rafId);
		energy = 0;
		peakFlux = 0;
		slowFloor = 0;
		bands.fill(0);
		drawFrame();
	}

	$effect(() => {
		if (externalPlaying && externalAnalyser && !isPlaying) {
			cancelAnimationFrame(rafId);
			pump();
		} else if (!externalPlaying && !isPlaying) {
			resetToBase();
		}
	});

	function pump() {
		const activeNode = isPlaying ? analyser : externalPlaying ? externalAnalyser : null;
		if (!activeNode) {
			resetToBase();
			return;
		}
		if (!freqBuf || freqBuf.length !== activeNode.frequencyBinCount) {
			freqBuf = new Uint8Array(new ArrayBuffer(activeNode.frequencyBinCount));
		}
		if (!timeBuf || timeBuf.length !== activeNode.fftSize) {
			timeBuf = new Uint8Array(new ArrayBuffer(activeNode.fftSize));
		}
		const fBuf = freqBuf;
		const tBuf = timeBuf;
		activeNode.getByteFrequencyData(fBuf);
		activeNode.getByteTimeDomainData(tBuf);

		let sumBands = 0;
		for (let idx = 0; idx < CURVE_COUNT; idx++) {
			const b0 = Math.max(1, Math.floor(Math.pow(idx / CURVE_COUNT, 1.45) * 72));
			const b1 = Math.max(b0 + 1, Math.floor(Math.pow((idx + 1) / CURVE_COUNT, 1.45) * 72));
			let sum = 0;
			let peak = 0;
			for (let b = b0; b < b1 && b < fBuf.length; b++) {
				const v = fBuf[b] ?? 0;
				sum += v;
				if (v > peak) peak = v;
			}
			const avg = sum / Math.max(1, b1 - b0) / 255;
			const peakNorm = peak / 255;
			const tilt = 1.0 + idx * 0.08;
			const raw = Math.max(0, Math.min(1, (avg * 0.6 + peakNorm * 0.4) * tilt * 0.85));
			const bAlpha = raw > bands[idx] ? 0.68 : 0.28;
			bands[idx] = bands[idx] * (1 - bAlpha) + raw * bAlpha;
			sumBands += bands[idx];
		}

		let sumSq = 0;
		for (let i = 0; i < tBuf.length; i++) {
			const s = ((tBuf[i] ?? 128) - 128) / 128;
			sumSq += s * s;
		}
		const rms = Math.sqrt(sumSq / tBuf.length);

		const avgEnergy = sumBands / CURVE_COUNT;
		slowFloor = slowFloor * 0.94 + avgEnergy * 0.06;
		const eAlpha = avgEnergy > energy ? 0.62 : 0.24;
		energy = energy * (1 - eAlpha) + avgEnergy * eAlpha;

		const instantPunch = Math.max(0, (avgEnergy - slowFloor) * 2.4) + Math.max(0, rms - 0.14) * 1.15;
		const pAlpha = instantPunch > peakFlux ? 0.78 : 0.18;
		peakFlux = Math.min(1, peakFlux * (1 - pAlpha) + instantPunch * pAlpha);
		phaseT += 0.028 + energy * 0.03 + peakFlux * 0.04;

		drawFrame();
		rafId = requestAnimationFrame(pump);
	}

	async function togglePlay() {
		ensureAudio();
		if (!audioEl || !audioCtx) return;
		if (audioCtx.state === 'suspended') await audioCtx.resume();
		if (isPlaying) {
			audioEl.pause();
			isPlaying = false;
			resetToBase();
		} else {
			await audioEl.play();
			isPlaying = true;
			pump();
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
		cancelAnimationFrame(rafId);
		pump();
	}
</script>

<div class="ps-wrap" class:is-live={isLive}>
	<canvas
		bind:this={canvasEl}
		width={W}
		height={H}
		class="ps-canvas"
		aria-label="SEQ_010 Phase Contour Scope"
	></canvas>

	{#if showControls}
		<div class="ps-controls">
			<EvaTransportButton playing={isPlaying} label="AUDIO" minWidth="96px" onToggle={togglePlay} />
			<label class="eva-btn">
				LOAD MP3
				<input type="file" accept="audio/*" onchange={handleFile} hidden />
			</label>
			<span class="ps-track">{activeTrack}</span>
		</div>
	{/if}
</div>

<style>
	.ps-wrap {
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

	.ps-wrap.is-live {
		border-color: #46f76a;
		outline-color: rgba(70, 247, 106, 0.55);
	}

	.ps-canvas {
		width: 100%;
		height: auto;
		display: block;
		aspect-ratio: 460 / 224;
	}

	.ps-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.45rem;
	}

	.ps-track {
		font-family: var(--eva-font-display);
		font-size: 0.76rem;
		font-weight: 700;
		color: var(--eva-text-muted);
		margin-left: auto;
	}
</style>
