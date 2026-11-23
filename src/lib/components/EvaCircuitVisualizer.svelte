<svelte:options customElement={{ tag: 'eva-circuit-visualizer', shadow: 'none' }} />

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
	const DEG = 34;
	const RAD = (DEG * Math.PI) / 180;
	const COS = Math.cos(RAD);
	const SIN = Math.sin(RAD);
	const LANE_COUNT = 16;
	const RELAY_SLOTS = LANE_COUNT * 2;

	interface LaneSpec {
		idx: number;
		leftId: string;
		rightId: string;
		xStart: number;
		yStart: number;
		xBend: number;
		yBend: number;
		hasDiag: boolean;
		diagX: number;
		diagY: number;
		beadDiagX: number;
		beadDiagY: number;
		rightX: number;
		beadRightX: number;
	}

	const lanes: LaneSpec[] = Array.from({ length: LANE_COUNT }, (_, i) => {
		const yBend = 13 + i * 13.4;
		const xBend = 335 - i * 14.5;
		const backLen = 440;
		const xStart = xBend - backLen * COS;
		const yStart = yBend - backLen * SIN;

		// Staggered diagonal relay distance backwards along the uniform 34deg trace
		const prefD = i % 2 === 0 ? 58 : 108;
		const altD = 54;
		const testDiag = (d: number) => ({
			d,
			x: xBend - d * COS,
			y: yBend - d * SIN
		});
		let diag = testDiag(prefD);
		if (diag.y < 11 || diag.x < 28) {
			diag = testDiag(altD);
		}
		const hasDiag = diag.y >= 6 && diag.x >= 26 && diag.x <= xBend - 32;

		const beadD = 18;
		const beadDiagX = xBend - beadD * COS;
		const beadDiagY = yBend - beadD * SIN;

		// Horizontal right relays swept neatly down-left alongside the bend slope
		const minRightX = xBend + 50;
		const maxRightX = W - 34;
		const span = Math.max(20, maxRightX - minRightX);
		const rightX = minRightX + ((i * 29 + 11) % Math.floor(span));
		const beadRightX = xBend + 11;

		const leftNum = 124 + i;
		const rightNum = 223 + i;

		return {
			idx: i,
			leftId: String(leftNum).padStart(5, '0'),
			rightId: String(rightNum).padStart(5, '0'),
			xStart,
			yStart,
			xBend,
			yBend,
			hasDiag,
			diagX: diag.x,
			diagY: diag.y,
			beadDiagX,
			beadDiagY,
			rightX,
			beadRightX
		};
	});

	let isPlaying = $state(false);
	let trackLabel = $state('NERV-PULSE.MP3');
	const isLive = $derived(isPlaying || (externalPlaying && !!externalAnalyser));
	const activeTrack = $derived(
		!isPlaying && externalPlaying && externalTrackLabel ? externalTrackLabel : trackLabel
	);
	let litState = $state<boolean[]>(Array(RELAY_SLOTS).fill(true));
	let disconnectLevel = $state<number[]>(Array(RELAY_SLOTS).fill(0));

	let audioEl: HTMLAudioElement | null = null;
	let audioCtx: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let sourceNode: MediaElementAudioSourceNode | null = null;
	let freqBuf: Uint8Array<ArrayBuffer> | null = null;
	let rafId = 0;
	let objectUrl: string | null = null;

	// Per-band envelope state to detect significant amplitude drops
	const bandEma = new Float32Array(RELAY_SLOTS).fill(0.45);
	const holdUntil = new Float64Array(RELAY_SLOTS).fill(0);
	const curDisc = new Float32Array(RELAY_SLOTS).fill(0);
	const curLit = Array<boolean>(RELAY_SLOTS).fill(true);

	onMount(() => {
		let startAt = performance.now();
		let prevTime = startAt;

		const tick = (now: number) => {
			const dt = Math.min(0.05, Math.max(0.004, (now - prevTime) / 1000));
			prevTime = now;

			const activeNode = isPlaying ? analyser : externalPlaying ? externalAnalyser : null;
			if (activeNode) {
				if (!freqBuf || freqBuf.length !== activeNode.frequencyBinCount) {
					freqBuf = new Uint8Array(new ArrayBuffer(activeNode.frequencyBinCount));
				}
				activeNode.getByteFrequencyData(freqBuf);
			}

			for (let s = 0; s < RELAY_SLOTS; s++) {
				let amp: number;
				if (activeNode && freqBuf) {
					const bin = 1 + Math.floor((s / RELAY_SLOTS) * 76);
					amp = (freqBuf[bin] ?? 0) / 255;
				} else {
					// Expressive idle harmonic sweeps + occasional sharp notch drops
					const t = (now - startAt) * 0.001;
					const carrier = 0.52 + 0.34 * Math.sin(t * 1.45 + s * 0.42);
					const harmonic = 0.16 * Math.cos(t * 2.9 - s * 0.77);
					const notch = Math.sin(t * 0.62 + s * 1.73) < -0.9 ? -0.45 : 0;
					amp = Math.max(0, Math.min(1, carrier + harmonic + notch));
				}

				const prevEma = bandEma[s];
				bandEma[s] = prevEma * 0.92 + amp * 0.08;

				// Significant amplitude drop from recent energy triggers relay disconnect
				const sharpDrop = prevEma - amp > 0.17 || (prevEma > 0.32 && amp < 0.15);
				if (sharpDrop && now > holdUntil[s] + 220) {
					holdUntil[s] = now + 520 + ((s * 97) % 380);
				}

				const isDisconnected = now < holdUntil[s];
				const targetDisc = isDisconnected ? 1 : 0;
				const speed = isDisconnected ? 14 : 9.5;
				curDisc[s] += (targetDisc - curDisc[s]) * Math.min(1, dt * speed);
				if (Math.abs(targetDisc - curDisc[s]) < 0.005) curDisc[s] = targetDisc;

				curLit[s] = !isDisconnected && amp > 0.24;
			}

			litState = [...curLit];
			disconnectLevel = Array.from(curDisc);
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
			analyser.smoothingTimeConstant = 0.66;
			freqBuf = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
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

	const HW = 26;
	const HH = 5.2;
</script>

{#snippet relayNode(id: string, isLit: boolean, disc: number)}
	{#if disc > 0.03}
		{@const sep = disc * 8.5}
		{@const amp = disc * 3.8}
		<!-- Mask straight trace behind separated socket to render spring slack kink -->
		<line x1={-(HW + 18)} y1="0" x2={-(HW + 5)} y2="0" stroke="#a84100" stroke-width="2.8" />
		<path
			d="M {-(HW + 18)},0 Q {-(HW + 14.5)},{(-amp).toFixed(2)} {-(HW + 11.5)},0 T {-(HW + 5)},0"
			class="cv-trace"
		/>
		<!-- Female left socket half -->
		<path
			transform="translate({(-sep).toFixed(2)}, 0)"
			d="M -{HW},-{HH} L -0.5,-{HH} L -0.5,-2.1 L -5.5,-2.1 L -5.5,2.1 L -0.5,2.1 L -0.5,{HH} L -{HW},{HH} Z"
			class="cv-casing is-disc"
		/>
		<!-- Male right plug half -->
		<path
			transform="translate({sep.toFixed(2)}, 0)"
			d="M 0.5,-{HH} L {HW},-{HH} L {HW},{HH} L 0.5,{HH} L 0.5,1.9 L -4.2,1.9 L -4.2,-1.9 L 0.5,-1.9 Z"
			class="cv-casing is-disc"
		/>
	{:else}
		<rect
			x={-HW}
			y={-HH}
			width={HW * 2}
			height={HH * 2}
			class="cv-casing"
			class:is-on={isLit}
		/>
		<text x={-HW + 5} y="2.6" text-anchor="start" class="cv-id" class:is-on={isLit}>
			{id}
		</text>
	{/if}
{/snippet}

<div class="cv-wrap">
	<svg viewBox="0 0 {W} {H}" class="cv-svg" role="img" aria-label="SEQ_008 Circuit Audio Visualizer">
		<rect x="0" y="0" width={W} height={H} fill="#a84100" />

		{#each lanes as lane (lane.idx)}
			{@const diagSlot = lane.idx}
			{@const rightSlot = LANE_COUNT + lane.idx}
			{@const diagDisc = disconnectLevel[diagSlot] ?? 0}
			{@const rightDisc = disconnectLevel[rightSlot] ?? 0}

			<!-- Primary trace line passing cleanly through exact center of both diagonal & horizontal blocks -->
			<polyline
				points="{lane.xStart.toFixed(1)},{lane.yStart.toFixed(1)} {lane.xBend.toFixed(1)},{lane.yBend.toFixed(1)} {W},{lane.yBend.toFixed(1)}"
				class="cv-trace"
			/>

			<!-- Small inline junction beads along the circuit traces matching SEQ_008 -->
			<rect
				x="-2.4"
				y="-1.5"
				width="4.8"
				height="3"
				rx="0.6"
				transform="translate({lane.beadDiagX.toFixed(2)}, {lane.beadDiagY.toFixed(2)}) rotate({DEG})"
				class="cv-bead"
			/>
			<rect
				x={(lane.beadRightX - 2.4).toFixed(2)}
				y={(lane.yBend - 1.5).toFixed(2)}
				width="4.8"
				height="3"
				rx="0.6"
				class="cv-bead"
			/>

			<!-- Left diagonal relay centered mathematically at (diagX, diagY) along the 34deg line -->
			{#if lane.hasDiag}
				<g transform="translate({lane.diagX.toFixed(2)}, {lane.diagY.toFixed(2)}) rotate({DEG})">
					{@render relayNode(lane.leftId, litState[diagSlot], diagDisc)}
				</g>
			{/if}

			<!-- Right horizontal relay centered mathematically at (rightX, yBend) -->
			<g transform="translate({lane.rightX.toFixed(2)}, {lane.yBend.toFixed(2)})">
				{@render relayNode(lane.rightId, litState[rightSlot], rightDisc)}
			</g>
		{/each}
	</svg>

	{#if showControls}
		<div class="cv-controls">
			<EvaTransportButton playing={isPlaying} label="AUDIO" minWidth="96px" onToggle={togglePlay} />
			<label class="eva-btn">
				LOAD MP3
				<input type="file" accept="audio/*" onchange={handleFile} hidden />
			</label>
			<span class="cv-track">{activeTrack}</span>
		</div>
	{/if}
</div>

<style>
	.cv-wrap {
		background: #140800;
		border: 1.5px solid var(--eva-border);
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.cv-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.cv-trace {
		fill: none;
		stroke: #2a0c01;
		stroke-width: 1.15;
	}

	.cv-bead {
		fill: #1b0501;
	}

	.cv-casing {
		fill: #240602;
		stroke: #3d0b04;
		stroke-width: 0.75;
	}

	.cv-casing.is-on {
		fill: #130201;
		stroke: #380904;
	}

	.cv-casing.is-disc {
		fill: #2b0702;
		stroke: #460e05;
	}

	.cv-id {
		font-family: var(--eva-font-mono);
		font-size: 7.4px;
		font-weight: 700;
		letter-spacing: 0.04em;
		fill: #541607;
	}

	.cv-id.is-on {
		fill: #7dffb8;
		filter: drop-shadow(0 0 2.5px rgba(125, 255, 184, 0.7));
	}

	.cv-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.45rem;
	}

	.cv-track {
		font-family: var(--eva-font-mono);
		font-size: 0.62rem;
		color: var(--eva-text-muted);
		margin-left: auto;
	}
</style>
