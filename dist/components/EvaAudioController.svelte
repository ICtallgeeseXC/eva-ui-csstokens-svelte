<svelte:options customElement={{ tag: 'eva-audio-controller', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';
	import EvaFrame from './EvaFrame.svelte';
	import EvaLedIndicator from './EvaLedIndicator.svelte';
	import EvaHudBox from './EvaHudBox.svelte';
	import EvaSegmentDisplay from './EvaSegmentDisplay.svelte';
	import EvaSeekBar from './EvaSeekBar.svelte';
	import EvaTitleCard from './EvaTitleCard.svelte';
	import EvaTransportButton from './EvaTransportButton.svelte';

	interface Props {
		audioSrc?: string;
		trackLabel?: string;
		playing?: boolean;
		currentTime?: number;
		duration?: number;
		volume?: number;
		muted?: boolean;
		loop?: boolean;
		showLoad?: boolean;
		showVolume?: boolean;
		titleMode?: 'bar' | 'episode';
		showTitleToggle?: boolean;
		episodeKicker?: string;
		episodeSubtitle?: string;
		episodeInverted?: boolean;
		analyser?: AnalyserNode | null;
		onPlayChange?: (playing: boolean) => void;
		onSeek?: (time: number) => void;
		onTrackLoad?: (info: { name: string; url: string }) => void;
	}

	let {
		audioSrc = '/audio/nerv-pulse.mp3',
		trackLabel = $bindable('NERV-PULSE.MP3'),
		playing = $bindable(false),
		currentTime = $bindable(0),
		duration = $bindable(0),
		volume = $bindable(0.85),
		muted = $bindable(false),
		loop = $bindable(true),
		showLoad = true,
		showVolume = true,
		titleMode = $bindable<'bar' | 'episode'>('bar'),
		showTitleToggle = true,
		episodeKicker = 'AUDIO DECK // TRACK',
		episodeSubtitle = '',
		episodeInverted = false,
		analyser = $bindable<AnalyserNode | null>(null),
		onPlayChange,
		onSeek,
		onTrackLoad
	}: Props = $props();

	let audioEl: HTMLAudioElement | null = null;
	let audioCtx: AudioContext | null = null;
	let gainNode: GainNode | null = null;
	let sourceNode: MediaElementAudioSourceNode | null = null;
	let objectUrl: string | null = null;
	let buffered = $state(0);
	let trackViewportEl = $state<HTMLDivElement | null>(null);
	let trackTextEl = $state<HTMLSpanElement | null>(null);
	let isTrackOverflowing = $state(false);
	let trackShiftPx = $state(0);

	const frameColor = $derived(playing ? '#46f76a' : 'var(--eva-border-strong, #ff941a)');
	const effectiveVol = $derived(muted ? 0 : volume);

	function formatTime(sec: number): string {
		if (!Number.isFinite(sec) || sec < 0) return '00:00';
		const total = Math.floor(sec);
		const m = Math.floor(total / 60);
		const s = total % 60;
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	const elapsedStr = $derived(formatTime(currentTime));
	const durationStr = $derived(formatTime(duration));

	const episodeLines = $derived.by(() => {
		const clean = trackLabel.replace(/\.[A-Z0-9]{2,5}$/i, '').trim() || 'UNTITLED';
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

	const resolvedEpisodeSub = $derived(
		episodeSubtitle || `${playing ? 'LIVE SIGNAL' : 'STANDBY'} // ${trackLabel}`
	);

	function toggleTitleMode() {
		titleMode = titleMode === 'bar' ? 'episode' : 'bar';
	}

	function measureTrackOverflow() {
		if (!trackViewportEl || !trackTextEl) return;
		const diff = trackTextEl.scrollWidth - trackViewportEl.clientWidth;
		isTrackOverflowing = diff > 2;
		trackShiftPx = diff > 2 ? diff + 12 : 0;
	}

	$effect(() => {
		void trackLabel;
		if (typeof requestAnimationFrame !== 'undefined') {
			requestAnimationFrame(measureTrackOverflow);
		}
	});

	function syncAudioState() {
		const clampedVol = Math.max(0, Math.min(1, volume));
		if (audioEl) {
			audioEl.volume = clampedVol;
			audioEl.muted = muted;
			audioEl.loop = loop;
		}
		if (gainNode && audioCtx) {
			const target = muted ? 0 : clampedVol;
			gainNode.gain.setTargetAtTime(target, audioCtx.currentTime, 0.015);
		}
	}

	$effect(() => {
		void volume;
		void muted;
		void loop;
		syncAudioState();
	});

	function ensureAudio() {
		if (audioEl) return audioEl;
		const el = new Audio(audioSrc);
		el.crossOrigin = 'anonymous';
		el.preload = 'metadata';
		el.loop = loop;
		el.volume = volume;
		el.muted = muted;

		el.addEventListener('loadedmetadata', () => {
			duration = Number.isFinite(el.duration) ? el.duration : 0;
		});
		el.addEventListener('durationchange', () => {
			duration = Number.isFinite(el.duration) ? el.duration : 0;
		});
		el.addEventListener('timeupdate', () => {
			currentTime = el.currentTime;
		});
		el.addEventListener('progress', () => {
			if (el.buffered.length > 0) {
				buffered = el.buffered.end(el.buffered.length - 1);
			}
		});
		el.addEventListener('ended', () => {
			if (!el.loop) {
				playing = false;
				onPlayChange?.(false);
			}
		});
		audioEl = el;
		return el;
	}

	function ensureAudioGraph() {
		const el = ensureAudio();
		if (!audioCtx) {
			audioCtx = new AudioContext();
			const gain = audioCtx.createGain();
			gain.gain.value = muted ? 0 : Math.max(0, Math.min(1, volume));
			const node = audioCtx.createAnalyser();
			node.fftSize = 256;
			node.smoothingTimeConstant = 0.45;
			sourceNode = audioCtx.createMediaElementSource(el);
			sourceNode.connect(gain);
			gain.connect(node);
			node.connect(audioCtx.destination);
			gainNode = gain;
			analyser = node;
		}
		syncAudioState();
		return el;
	}

	onMount(() => {
		ensureAudio();
		measureTrackOverflow();
		const ro =
			typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measureTrackOverflow) : null;
		if (ro && trackViewportEl) ro.observe(trackViewportEl);
		return () => {
			ro?.disconnect();
			audioEl?.pause();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
			audioCtx?.close().catch(() => {});
		};
	});

	async function togglePlay() {
		const el = ensureAudioGraph();
		if (audioCtx?.state === 'suspended') await audioCtx.resume();
		if (playing) {
			el.pause();
			playing = false;
			onPlayChange?.(false);
		} else {
			await el.play();
			playing = true;
			onPlayChange?.(true);
		}
	}

	function stopAudio() {
		const el = ensureAudio();
		el.pause();
		el.currentTime = 0;
		currentTime = 0;
		playing = false;
		onPlayChange?.(false);
		onSeek?.(0);
	}

	function handleSeek(nextTime: number) {
		const el = ensureAudio();
		const clamped = Math.max(0, Math.min(duration || 0, nextTime));
		el.currentTime = clamped;
		currentTime = clamped;
		onSeek?.(clamped);
	}

	function skipBy(delta: number) {
		handleSeek(currentTime + delta);
	}

	function toggleLoop() {
		loop = !loop;
		syncAudioState();
	}

	function toggleMute() {
		muted = !muted;
		syncAudioState();
	}

	function handleVolumeSeek(nextVol: number) {
		const clamped = Math.max(0, Math.min(1, nextVol));
		volume = clamped;
		if (clamped > 0 && muted) muted = false;
		syncAudioState();
	}

	async function handleFile(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		const el = ensureAudioGraph();
		if (audioCtx?.state === 'suspended') await audioCtx.resume();
		if (objectUrl) URL.revokeObjectURL(objectUrl);
		objectUrl = URL.createObjectURL(file);
		el.src = objectUrl;
		el.load();
		trackLabel = file.name.toUpperCase();
		currentTime = 0;
		buffered = 0;
		onTrackLoad?.({ name: trackLabel, url: objectUrl });
		await el.play();
		playing = true;
		onPlayChange?.(true);
	}
</script>

<div class="ac-root" class:is-live={playing}>
	<EvaFrame variant="flanked" color={frameColor} padding="0.65rem 0.8rem" gap="0.58rem">
		<!-- Top telemetry & timecode bar -->
		<div class="ac-top">
			<div class="ac-status">
				<EvaLedIndicator
					label="AUDIO BUS"
					state={playing ? 'on' : 'off'}
					pulse={playing}
					minWidth="92px"
				/>
				<button type="button" class="ac-chip-btn" onclick={toggleLoop} aria-pressed={loop}>
					<EvaHudBox size="sm" color={loop ? '#46f76a' : '#ff941a'}>
						<span class="ac-dual">
							<span>LOOP</span>
							<span class="ac-dual__opt" class:is-lit={loop}>ON</span>
							<span class="ac-dual__sep">/</span>
							<span class="ac-dual__opt" class:is-lit={!loop}>OFF</span>
						</span>
					</EvaHudBox>
				</button>
				{#if showTitleToggle}
					<button
						type="button"
						class="ac-chip-btn"
						onclick={toggleTitleMode}
						aria-pressed={titleMode === 'episode'}
						title="Toggle Episode Title Card display"
					>
						<EvaHudBox size="sm" color={titleMode === 'episode' ? '#72f7ff' : '#ff941a'}>
							<span class="ac-dual">
								<span>TITLE</span>
								<span class="ac-dual__opt" class:is-lit={titleMode === 'bar'}>BAR</span>
								<span class="ac-dual__sep">/</span>
								<span class="ac-dual__opt" class:is-lit={titleMode === 'episode'}>EP</span>
							</span>
						</EvaHudBox>
					</button>
				{/if}
			</div>

			{#if titleMode === 'bar'}
				<div
					bind:this={trackViewportEl}
					class="ac-track-wrap"
					class:is-overflow={isTrackOverflowing}
					style="--ac-shift: -{trackShiftPx}px;"
					title={trackLabel}
				>
					<span bind:this={trackTextEl} class="ac-track">{trackLabel}</span>
				</div>
			{/if}

			<div class="ac-timecode" aria-label="Playback timecode {elapsedStr} of {durationStr}">
				<div class="ac-seg-wrap" style="--eva-seg-color: {playing ? '#46f76a' : '#ff941a'};">
					<EvaSegmentDisplay value={elapsedStr} digitWidth={10} digitHeight={18} skew={-5} />
				</div>
				<span class="ac-time-sep">/</span>
				<div class="ac-seg-wrap is-total" style="--eva-seg-color: rgba(255, 148, 26, 0.72);">
					<EvaSegmentDisplay value={durationStr} digitWidth={10} digitHeight={18} skew={-5} />
				</div>
			</div>
		</div>

		{#if titleMode === 'episode'}
			<div class="ac-episode-wrap">
				<EvaTitleCard
					variant="banner"
					kicker={episodeKicker}
					line1={episodeLines.line1}
					line2={episodeLines.line2}
					subtitle={resolvedEpisodeSub}
					inverted={episodeInverted}
				/>
			</div>
		{/if}

		<!-- Scrubbable segmented seek bar + graduated ruler -->
		<div class="ac-seek-row">
			<EvaSeekBar
				value={currentTime}
				max={duration > 0 ? duration : 100}
				{buffered}
				active={playing}
				segments={48}
				showRuler={true}
				disabled={duration <= 0}
				label="Audio playback position"
				formatValue={formatTime}
				onSeek={handleSeek}
			/>
		</div>

		<!-- Bottom transport & volume controls -->
		<div class="ac-bottom">
			<div class="ac-transport">
				<EvaTransportButton
					{playing}
					label="AUDIO"
					minWidth="96px"
					onToggle={togglePlay}
				/>
				<button type="button" class="eva-btn ac-btn" onclick={() => skipBy(-10)} title="Rewind 10s">
					-10S
				</button>
				<button type="button" class="eva-btn ac-btn" onclick={() => skipBy(10)} title="Forward 10s">
					+10S
				</button>
				<button type="button" class="eva-btn ac-btn" onclick={stopAudio} title="Stop and reset">
					STOP
				</button>
				{#if showLoad}
					<label class="eva-btn ac-btn">
						LOAD MP3
						<input type="file" accept="audio/*" onchange={handleFile} hidden />
					</label>
				{/if}
				{#if showTitleToggle}
					<button
						type="button"
						class="eva-btn ac-btn ac-title-btn"
						class:is-ep={titleMode === 'episode'}
						onclick={toggleTitleMode}
						aria-pressed={titleMode === 'episode'}
						title="Switch between track bar and Episode Title Card"
					>
						<span class="ac-dual">
							<span>TITLE</span>
							<span class="ac-dual__opt" class:is-lit={titleMode === 'bar'}>BAR</span>
							<span class="ac-dual__sep">/</span>
							<span class="ac-dual__opt" class:is-lit={titleMode === 'episode'}>EP</span>
						</span>
					</button>
				{/if}
			</div>

			{#if showVolume}
				<div class="ac-vol">
					<button
						type="button"
						class="eva-btn ac-btn ac-mute"
						class:is-muted={muted || volume === 0}
						class:is-full={!muted && effectiveVol >= 0.999}
						onclick={toggleMute}
						aria-pressed={muted}
						aria-label={muted ? 'Unmute audio' : 'Mute audio'}
					>
						VOL {String(Math.round(effectiveVol * 100)).padStart(3, '0')}%
					</button>
					<div class="ac-vol-bar">
						<EvaSeekBar
							value={effectiveVol}
							max={1}
							active={playing && !muted}
							color={muted
								? '#ff2222'
								: effectiveVol >= 0.999
									? '#fff275'
									: playing
										? '#46f76a'
										: '#ff941a'}
							segments={14}
							showRuler={false}
							compact={true}
							label="Audio volume"
							formatValue={(v) => `${Math.round(v * 100)}%`}
							onSeek={handleVolumeSeek}
						/>
					</div>
				</div>
			{/if}
		</div>
	</EvaFrame>
</div>

<style>
	.ac-root {
		width: 100%;
	}

	.ac-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.65rem;
		flex-wrap: wrap;
	}

	.ac-status {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.42rem;
		max-width: 100%;
	}

	.ac-chip-btn {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: inline-flex;
	}

	.ac-dual {
		display: inline-flex;
		align-items: center;
		gap: 0.24rem;
	}

	.ac-dual__sep {
		opacity: 0.45;
	}

	.ac-dual__opt {
		opacity: 0.35;
		transition:
			opacity 120ms ease,
			text-shadow 120ms ease;
	}

	.ac-dual__opt.is-lit {
		opacity: 1;
	}

	.ac-track-wrap {
		flex: 1;
		min-width: 110px;
		overflow: hidden;
		white-space: nowrap;
		text-align: center;
	}

	.ac-track {
		display: inline-block;
		font-family: var(--eva-font-display);
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--eva-text-hi);
		text-shadow: 0 0 8px rgba(255, 148, 26, 0.35);
	}

	.ac-root.is-live .ac-track {
		color: #b8ffc8;
		text-shadow: 0 0 8px rgba(70, 247, 106, 0.45);
	}

	.ac-track-wrap.is-overflow {
		text-align: left;
		mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%);
	}

	.ac-track-wrap.is-overflow .ac-track {
		animation: ac-marquee 8s ease-in-out infinite alternate;
	}

	@keyframes ac-marquee {
		0%,
		16% {
			transform: translateX(0);
		}
		84%,
		100% {
			transform: translateX(var(--ac-shift, 0px));
		}
	}

	.ac-timecode {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		padding: 0.06rem 0.4rem;
		background: #000000;
		border: 1px solid color-mix(in srgb, var(--eva-border) 80%, transparent);
		border-radius: 4px;
		flex-shrink: 0;
	}

	.ac-seg-wrap {
		display: inline-flex;
		align-items: center;
	}

	.ac-seg-wrap :global(.eva-seg-row) {
		padding: 0.08rem 0.05rem;
	}

	.ac-time-sep {
		font-family: var(--eva-font-num);
		font-size: 0.82rem;
		color: var(--eva-text-muted);
		opacity: 0.65;
		padding: 0 0.08rem;
	}

	.ac-seek-row {
		width: 100%;
	}

	.ac-bottom {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.55rem;
	}

	.ac-transport {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.42rem;
	}

	.ac-btn {
		padding: 0.34rem 0.62rem;
		font-size: 0.78rem;
		min-height: 2.1rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.ac-vol {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		margin-left: auto;
	}

	.ac-mute {
		min-width: 74px;
		font-variant-numeric: tabular-nums;
	}

	.ac-mute.is-muted {
		--btn-c: #ff2222;
	}

	.ac-mute.is-full,
	.ac-mute.is-full:hover {
		--btn-c: #fff275;
		background: rgba(255, 224, 90, 0.1);
		color: #fff275;
		text-shadow:
			0 0 5px rgba(255, 242, 117, 0.78),
			0 0 11px rgba(255, 184, 51, 0.45);
		box-shadow:
			0 0 8px rgba(255, 242, 117, 0.42),
			0 0 16px rgba(255, 184, 51, 0.24);
	}

	.ac-vol-bar {
		width: 112px;
	}

	.ac-title-btn.is-ep {
		--btn-c: #72f7ff;
	}
</style>
