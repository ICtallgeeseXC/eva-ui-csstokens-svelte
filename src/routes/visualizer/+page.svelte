<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		EvaAudioController,
		EvaCircuitVisualizer,
		EvaEnergyVisualizer,
		EvaEqPillars,
		EvaHudBox,
		EvaHudOverlay,
		EvaLedIndicator,
		EvaPanel,
		EvaPatternMatrix,
		EvaPhaseScope,
		EvaTitleCard
	} from '$lib';

	interface VizChannel {
		idx: number;
		code: string;
		camCode: string;
		title: string;
	}

	const DEFAULT_CHANNELS: VizChannel[] = [
		{ idx: 0, code: 'SEQ_125:B', camCode: 'X00', title: 'ENERGY OBSERVATIONAL DATA' },
		{ idx: 1, code: 'SEQ_009:R', camCode: 'X01', title: '7-BAND NEURAL EQ PILLARS' },
		{ idx: 2, code: 'SEQ_010:R', camCode: 'X02', title: 'PHASE CONTOUR SCOPE' },
		{ idx: 3, code: 'SEQ_008:R', camCode: 'X03', title: 'CIRCUIT RELAY MATRIX' },
		{ idx: 4, code: 'SPEC-02', camCode: 'X04', title: 'AT-FIELD SPECTRUM BARS' }
	];

	let channels = $state<VizChannel[]>([...DEFAULT_CHANNELS]);
	let activePos = $state(0);
	let disabledIds = $state<number[]>([]);
	let shuffleMode = $state(false);
	let camPaused = $state(true);
	let dragPos = $state<number | null>(null);
	let dragOverPos = $state<number | null>(null);

	function isChannelDisabled(id: number): boolean {
		return disabledIds.includes(id);
	}

	const disabledPositions = $derived(
		channels.map((ch, pos) => (disabledIds.includes(ch.idx) ? pos : -1)).filter((pos) => pos !== -1)
	);

	const slideCodes = $derived(channels.map((ch) => ch.camCode));

	function toggleChannelDisabled(pos: number) {
		const ch = channels[pos];
		if (!ch) return;
		if (disabledIds.includes(ch.idx)) {
			disabledIds = disabledIds.filter((i) => i !== ch.idx);
			return;
		}
		// Keep at least one visualizer active
		if (disabledIds.length >= channels.length - 1) return;
		const nextDisabled = [...disabledIds, ch.idx];
		disabledIds = nextDisabled;
		if (activePos === pos) {
			for (let offset = 1; offset <= channels.length; offset++) {
				const candidatePos = (pos + offset) % channels.length;
				const candidate = channels[candidatePos];
				if (candidate && !nextDisabled.includes(candidate.idx)) {
					activePos = candidatePos;
					break;
				}
			}
		}
	}

	function moveChannel(fromPos: number | null, toPos: number) {
		if (fromPos === null || fromPos === toPos) return;
		if (fromPos < 0 || fromPos >= channels.length || toPos < 0 || toPos >= channels.length) return;
		const currentActiveId = channels[activePos]?.idx;
		const next = [...channels];
		const [moved] = next.splice(fromPos, 1);
		next.splice(toPos, 0, moved);
		channels = next;
		if (currentActiveId !== undefined) {
			const updatedPos = next.findIndex((c) => c.idx === currentActiveId);
			if (updatedPos !== -1) activePos = updatedPos;
		}
	}

	let controllerPlaying = $state(false);
	let controllerAnalyser = $state<AnalyserNode | null>(null);
	let controllerTrack = $state('NERV-PULSE.MP3');
	let controllerTime = $state(0);
	let controllerDuration = $state(0);

	let sysPlaying = $state(false);
	let sysAnalyser = $state<AnalyserNode | null>(null);
	let sysTrackLabel = $state('SYSTEM AUDIO // LIVE');
	let sysError = $state('');

	let sysStream: MediaStream | null = null;
	let sysCtx: AudioContext | null = null;
	let sysSource: MediaStreamAudioSourceNode | null = null;

	const activePlaying = $derived(sysPlaying || controllerPlaying);
	const activeAnalyser = $derived(sysPlaying && sysAnalyser ? sysAnalyser : controllerAnalyser);
	const activeTrack = $derived(sysPlaying ? sysTrackLabel : controllerTrack);

	function stopSystemAudio() {
		try {
			sysSource?.disconnect();
		} catch {}
		sysSource = null;
		if (sysStream) {
			for (const t of sysStream.getTracks()) t.stop();
			sysStream = null;
		}
		if (sysCtx && sysCtx.state !== 'closed') {
			sysCtx.close().catch(() => {});
		}
		sysCtx = null;
		sysAnalyser = null;
		sysPlaying = false;
	}

	async function toggleSystemAudio() {
		if (sysPlaying) {
			stopSystemAudio();
			sysError = '';
			return;
		}
		sysError = '';
		if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
			sysError = 'SYSTEM AUDIO CAPTURE NOT SUPPORTED IN THIS BROWSER';
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
					autoGainControl: false
				}
			});
			// Stop video track immediately; we only need the audio feed
			for (const vt of stream.getVideoTracks()) {
				vt.stop();
				stream.removeTrack(vt);
			}
			const audioTracks = stream.getAudioTracks();
			if (audioTracks.length === 0) {
				for (const t of stream.getTracks()) t.stop();
				sysError = 'NO AUDIO TRACK — CHECK "SHARE SYSTEM AUDIO" IN THE BROWSER PROMPT';
				return;
			}
			const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			const ctx = new Ctx();
			if (ctx.state === 'suspended') await ctx.resume();
			const analyserNode = ctx.createAnalyser();
			analyserNode.fftSize = 2048;
			analyserNode.smoothingTimeConstant = 0.72;
			const source = ctx.createMediaStreamSource(stream);
			source.connect(analyserNode);

			const label = audioTracks[0].label?.trim();
			sysStream = stream;
			sysCtx = ctx;
			sysSource = source;
			sysAnalyser = analyserNode;
			sysTrackLabel = label ? `SYSTEM AUDIO // ${label.toUpperCase()}` : 'SYSTEM AUDIO // LIVE';
			sysPlaying = true;

			audioTracks[0].addEventListener('ended', () => {
				stopSystemAudio();
			});
		} catch (err) {
			stopSystemAudio();
			const name = err instanceof DOMException ? err.name : '';
			if (name !== 'NotAllowedError' && name !== 'AbortError') {
				sysError = 'FAILED TO CAPTURE SYSTEM AUDIO';
			}
		}
	}

	onDestroy(() => {
		stopSystemAudio();
	});

	const currentChannel = $derived(channels[activePos] ?? channels[0]);

	function formatTime(sec: number): string {
		if (!Number.isFinite(sec) || sec < 0) return '00:00';
		const whole = Math.floor(sec);
		const m = Math.floor(whole / 60);
		const s = whole % 60;
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	const songLines = $derived.by(() => {
		const clean = activeTrack.replace(/\.[A-Z0-9]{2,5}$/i, '').trim() || 'UNTITLED';
		const dashIdx = clean.indexOf(' - ');
		if (dashIdx > 0) {
			return {
				line1: clean.slice(0, dashIdx).trim(),
				line2: clean.slice(dashIdx + 3).trim()
			};
		}
		const parts = clean.split(/[\s_-]+/).filter(Boolean);
		if (parts.length >= 2) {
			const mid = Math.ceil(parts.length / 2);
			return {
				line1: parts.slice(0, mid).join(' '),
				line2: parts.slice(mid).join(' ')
			};
		}
		return { line1: clean, line2: '' };
	});

	const songSubtitle = $derived.by(() => {
		const timePart = sysPlaying
			? 'LIVE INPUT STREAM'
			: `${formatTime(controllerTime)} / ${formatTime(controllerDuration)}`;
		const base = `${activeTrack} // ${timePart} // ${currentChannel.title}`;
		if (activeAnalyser) {
			const khz = Math.round(activeAnalyser.context.sampleRate / 1000);
			return `${base} // ${khz}KHZ FFT:${activeAnalyser.fftSize}`;
		}
		return base;
	});
</script>

<div class="viz-page">
	<div class="viz-deck">
		<EvaPanel title={`OPTICAL AUDIO DECK // ${currentChannel.title}`} code={currentChannel.code}>
			{#snippet actions()}
				<button
					type="button"
					class="viz-chip-btn"
					onclick={toggleSystemAudio}
					aria-pressed={sysPlaying}
					title="Capture PC / tab system audio (enable 'Share system audio' in browser prompt)"
				>
					<EvaHudBox size="sm" color={sysPlaying ? '#46f76a' : '#ff941a'}>
						<span class="viz-dual">
							<span>SYS AUDIO</span>
							<span class="viz-dual__opt" class:is-lit={sysPlaying}>ON</span>
							<span class="viz-dual__sep">/</span>
							<span class="viz-dual__opt" class:is-lit={!sysPlaying}>OFF</span>
						</span>
					</EvaHudBox>
				</button>
				<button
					type="button"
					class="viz-chip-btn"
					onclick={() => (shuffleMode = !shuffleMode)}
					aria-pressed={shuffleMode}
					title="Toggle shuffle order for cycling / next"
				>
					<EvaHudBox size="sm" color={shuffleMode ? '#72f7ff' : '#ff941a'}>
						<span class="viz-dual">
							<span>SHUF</span>
							<span class="viz-dual__opt" class:is-lit={shuffleMode}>ON</span>
							<span class="viz-dual__sep">/</span>
							<span class="viz-dual__opt" class:is-lit={!shuffleMode}>OFF</span>
						</span>
					</EvaHudBox>
				</button>
				<EvaHudBox
					size="sm"
					color={activePlaying ? '#46f76a' : '#ff941a'}
					text={`CAM: ${currentChannel.camCode}`}
					width="68px"
					mono
				/>
				<EvaLedIndicator
					label="AUDIO BUS"
					state={activePlaying ? 'on' : 'off'}
					pulse={activePlaying}
					minWidth="86px"
				/>
			{/snippet}

			<!-- Zero-indexed channel selector buttons (PHIL-06 static placement + color highlight, PHIL-07 00-indexed) -->
			<div class="viz-tabs" role="tablist" aria-label="Visualizer feed selector">
				{#each channels as ch, pos (ch.idx)}
					{@const disabled = isChannelDisabled(ch.idx)}
					<button
						type="button"
						role="tab"
						draggable="true"
						aria-selected={activePos === pos}
						aria-disabled={disabled}
						class="eva-btn viz-tab"
						class:is-active={activePos === pos && !disabled}
						class:is-disabled={disabled}
						class:is-dragging={dragPos === pos}
						class:is-drag-over={dragOverPos === pos && dragPos !== pos}
						title={disabled
							? 'Disabled (skipped) — Middle-click to re-enable · Drag to reorder'
							: 'Click to select · Middle-click to disable/skip · Drag to reorder'}
						onclick={() => {
							if (!disabled) activePos = pos;
						}}
						onmousedown={(e) => {
							if (e.button === 1) e.preventDefault();
						}}
						onauxclick={(e) => {
							if (e.button === 1) {
								e.preventDefault();
								toggleChannelDisabled(pos);
							}
						}}
						ondragstart={(e) => {
							dragPos = pos;
							if (e.dataTransfer) {
								e.dataTransfer.effectAllowed = 'move';
								e.dataTransfer.setData('text/plain', String(pos));
							}
						}}
						ondragover={(e) => {
							e.preventDefault();
							if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
							dragOverPos = pos;
						}}
						ondragleave={() => {
							if (dragOverPos === pos) dragOverPos = null;
						}}
						ondrop={(e) => {
							e.preventDefault();
							moveChannel(dragPos, pos);
							dragPos = null;
							dragOverPos = null;
						}}
						ondragend={() => {
							dragPos = null;
							dragOverPos = null;
						}}
					>
						<span class="eva-num">{String(ch.idx).padStart(2, '0')}</span>
						<span>//</span>
						<span class="viz-tab__label">{ch.title}</span>
					</button>
				{/each}
			</div>

			{#if sysError}
				<div class="viz-sys-err eva-display" role="alert">{sysError}</div>
			{/if}

			<!-- Song details title bar above the camcorder container -->
			<div class="viz-title-bar">
				<EvaTitleCard
					variant="banner"
					kicker={`AUDIO DECK // ${currentChannel.camCode} // ${activePlaying ? (sysPlaying ? 'SYS AUDIO LIVE' : 'LIVE SIGNAL') : 'STANDBY'}`}
					line1={songLines.line1}
					line2={songLines.line2}
					subtitle={songSubtitle}
				/>
			</div>

			<!-- Camcorder optical OSD housing all switchable live visualizers -->
			<EvaHudOverlay
				recLabel=""
				bind:paused={camPaused}
				bind:activeIndex={activePos}
				disabledIndices={disabledPositions}
				{slideCodes}
				shuffle={shuffleMode}
				slideCount={channels.length}
				intervalMs={6000}
				interactive={true}
				aspectRatio="460 / 236"
			>
				<div class="viz-stage">
					{#if currentChannel.idx === 0}
						<EvaEnergyVisualizer
							showControls={false}
							externalPlaying={activePlaying}
							externalAnalyser={activeAnalyser}
							externalTrackLabel={activeTrack}
						/>
					{:else if currentChannel.idx === 1}
						<EvaEqPillars
							showControls={false}
							externalPlaying={activePlaying}
							externalAnalyser={activeAnalyser}
							externalTrackLabel={activeTrack}
						/>
					{:else if currentChannel.idx === 2}
						<EvaPhaseScope
							showControls={false}
							externalPlaying={activePlaying}
							externalAnalyser={activeAnalyser}
							externalTrackLabel={activeTrack}
						/>
					{:else if currentChannel.idx === 3}
						<EvaCircuitVisualizer
							showControls={false}
							externalPlaying={activePlaying}
							externalAnalyser={activeAnalyser}
							externalTrackLabel={activeTrack}
						/>
					{:else}
						<EvaPatternMatrix
							showControls={false}
							externalPlaying={activePlaying}
							externalAnalyser={activeAnalyser}
							externalTrackLabel={activeTrack}
						/>
					{/if}
				</div>
			</EvaHudOverlay>
		</EvaPanel>
	</div>

	<!-- Fixed bottom audio transport & seek bar (title bar off) -->
	<div class="viz-dock">
		<div class="viz-dock__inner">
			<EvaAudioController
				bind:playing={controllerPlaying}
				bind:analyser={controllerAnalyser}
				bind:trackLabel={controllerTrack}
				bind:currentTime={controllerTime}
				bind:duration={controllerDuration}
				titleMode="bar"
				showTitleToggle={false}
			/>
		</div>
	</div>
</div>

<style>
	.viz-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-bottom: 10.5rem;
	}

	.viz-deck {
		width: 100%;
		max-width: 1080px;
		margin: 0 auto;
	}

	.viz-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.42rem;
		margin-bottom: 0.72rem;
	}

	.viz-title-bar {
		margin-bottom: 0.72rem;
	}

	.viz-sys-err {
		margin-bottom: 0.55rem;
		padding: 0.35rem 0.65rem;
		border: 1px solid #ff4747;
		background: rgba(255, 34, 34, 0.12);
		color: #ff6b6b;
		font-size: 0.78rem;
		letter-spacing: 0.05em;
		border-radius: 3px;
	}

	.viz-tab {
		padding: 0.28rem 0.68rem;
		min-height: 1.9rem;
		font-size: 0.76rem;
		gap: 0.35rem;
	}

	.viz-tab.is-active {
		--btn-c: #46f76a;
		background: rgba(70, 247, 106, 0.14);
	}

	.viz-tab.is-disabled {
		--btn-c: #ff4747;
		opacity: 0.36;
		border-style: dashed;
		cursor: not-allowed;
	}

	.viz-tab.is-disabled:hover {
		background: #000000;
		color: var(--btn-c);
		text-shadow: none;
	}

	.viz-tab.is-disabled .viz-tab__label {
		text-decoration: line-through;
	}

	.viz-tab.is-dragging {
		opacity: 0.45;
	}

	.viz-tab.is-drag-over {
		--btn-c: #72f7ff;
		background: rgba(114, 247, 255, 0.14);
	}

	.viz-chip-btn {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
	}

	.viz-dual {
		display: inline-flex;
		align-items: center;
		gap: 0.24rem;
		font-family: var(--eva-font-display);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	.viz-dual__opt {
		opacity: 0.35;
	}

	.viz-dual__opt.is-lit {
		opacity: 1;
	}

	.viz-dual__sep {
		opacity: 0.45;
	}

	.viz-stage {
		width: 100%;
		height: 100%;
		background: #000000;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	/* Strip outer wrapper frame inside camcorder viewport so EvaHudOverlay forms the single bezel */
	.viz-stage :global(.ev-wrap),
	.viz-stage :global(.eq-wrap),
	.viz-stage :global(.ps-wrap),
	.viz-stage :global(.cv-wrap),
	.viz-stage :global(.eva-pattern) {
		width: 100%;
		height: 100%;
		border: none;
		outline: none;
		box-shadow: none;
		border-radius: 0;
		box-sizing: border-box;
		justify-content: center;
	}

	.viz-stage :global(.ev-stage),
	.viz-stage :global(.eq-svg),
	.viz-stage :global(.ps-canvas),
	.viz-stage :global(.cv-svg) {
		max-height: 100%;
		width: 100%;
		object-fit: contain;
	}

	.viz-dock {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 35;
		padding: 0.5rem 1.25rem 0.65rem;
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, #000000 18%);
		border-top: 1px solid color-mix(in srgb, var(--eva-border) 65%, transparent);
		box-shadow: 0 -8px 26px rgba(0, 0, 0, 0.92);
	}

	.viz-dock__inner {
		max-width: 1400px;
		margin: 0 auto;
	}
</style>
