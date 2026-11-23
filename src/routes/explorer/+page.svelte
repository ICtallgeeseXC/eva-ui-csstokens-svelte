<script lang="ts">
	import { onMount } from 'svelte';
	import { EvaPanel } from '$lib';

	interface FrameEntry {
		id: string;
		frameIndex: number;
		timestamp: number;
		timecode: string;
		path: string;
		sequenceId: string;
		motifId: string;
		phash: string;
		edgeDensity: number;
		dominantColors: string[];
		reappearances: number[];
	}

	interface SequenceEntry {
		id: string;
		motifId: string;
		startTime: number;
		endTime: number;
		frameCount: number;
		frameIds: string[];
		representativeFrameId: string;
		audioPath?: string | null;
	}

	interface MotifEntry {
		id: string;
		label: string;
		description: string;
		sequenceCount: number;
		frameCount: number;
		sequenceIds: string[];
		frameIds: string[];
		representativeFrameId: string;
		palette: {
			bg: string;
			surface: string;
			primary: string;
			accent: string;
			text: string;
			swatches: string[];
		};
		cssTokens: Record<string, string>;
	}

	interface Manifest {
		video: {
			title: string;
			url: string;
			duration: number;
			width: number;
			height: number;
			native_fps: number;
			sampled_frames: number;
			unique_frames: number;
		};
		stats: {
			uniqueFrames: number;
			temporalSequences: number;
			motifGroups: number;
		};
		motifs: MotifEntry[];
		sequences: SequenceEntry[];
		frames: FrameEntry[];
	}

	const DATASETS = [
		{ id: 'resound', label: 'RE-SOUND-DESIGN PT.1 (37S + AUDIO)', url: '/analysis-resound/manifest.json' },
		{ id: 'breakcore', label: 'BREAKCORE EDITION (305S)', url: '/analysis/manifest.json' }
	] as const;

	let activeDataset = $state<'resound' | 'breakcore'>('resound');
	let manifest = $state<Manifest | null>(null);
	let error = $state('');
	let viewMode = $state<'motifs' | 'sequences' | 'frames'>('sequences');
	let selectedMotifId = $state<string>('all');
	let selectedFrame = $state<FrameEntry | null>(null);
	let appliedMotifId = $state<string>('');
	let frameLimit = $state(120);
	let playingSeqId = $state('');
	let seqAudio: HTMLAudioElement | null = null;

	async function loadDataset(id: 'resound' | 'breakcore') {
		activeDataset = id;
		manifest = null;
		error = '';
		selectedMotifId = 'all';
		playingSeqId = '';
		seqAudio?.pause();
		const target = DATASETS.find((d) => d.id === id) ?? DATASETS[0];
		try {
			const res = await fetch(target.url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			manifest = await res.json();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load analysis manifest';
		}
	}

	function toggleSeqAudio(seq: SequenceEntry) {
		if (!seq.audioPath) return;
		if (playingSeqId === seq.id) {
			seqAudio?.pause();
			playingSeqId = '';
			return;
		}
		if (!seqAudio) {
			seqAudio = new Audio();
			seqAudio.addEventListener('ended', () => {
				playingSeqId = '';
			});
		}
		seqAudio.src = seq.audioPath;
		seqAudio.play();
		playingSeqId = seq.id;
	}

	onMount(() => {
		loadDataset('resound');
		return () => {
			seqAudio?.pause();
		};
	});

	const frameMap = $derived.by(() => {
		const map = new Map<string, FrameEntry>();
		if (manifest) {
			for (const f of manifest.frames) map.set(f.id, f);
		}
		return map;
	});

	const matchingFrames = $derived.by(() => {
		if (!manifest) return [];
		return selectedMotifId === 'all'
			? manifest.frames
			: manifest.frames.filter((f) => f.motifId === selectedMotifId);
	});

	const filteredFrames = $derived(matchingFrames.slice(0, frameLimit));

	const filteredSequences = $derived.by(() => {
		if (!manifest) return [];
		return selectedMotifId === 'all'
			? manifest.sequences
			: manifest.sequences.filter((s) => s.motifId === selectedMotifId);
	});

	function applyMotifTheme(motifId: string) {
		appliedMotifId = motifId;
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-eva-motif', motifId);
		}
	}

	function clearMotifTheme() {
		appliedMotifId = '';
		if (typeof document !== 'undefined') {
			document.documentElement.removeAttribute('data-eva-motif');
		}
	}
</script>

<div class="explorer">
	<div class="toolbar">
		<div class="toolbar__group">
			<span class="eva-mono-label" style="align-self: center;">SOURCE VIDEO:</span>
			{#each DATASETS as ds}
				<button
					type="button"
					class="eva-btn"
					class:eva-btn-danger={activeDataset === ds.id}
					onclick={() => loadDataset(ds.id)}
				>
					{ds.label}
				</button>
			{/each}
		</div>
	</div>

	{#if error}
		<EvaPanel title="ANALYSIS MANIFEST ERROR" code="ERR-404" variant="alert">
			<p>Could not load <code>/analysis/manifest.json</code>: {error}</p>
		</EvaPanel>
	{:else if !manifest}
		<EvaPanel title="LOADING VIDEO ANALYSIS" code="SYS-LOAD">
			<p class="eva-mono-label">DECODING MANIFEST & MOTIF CLUSTERS...</p>
		</EvaPanel>
	{:else}
		<EvaPanel
			title={manifest.video.title}
			code="VIDEO-SRC"
			status="{manifest.video.width}x{manifest.video.height} // {manifest.video.duration}s"
			hazardTop
		>
			<div class="stats-row">
				<div class="stat-box">
					<span class="eva-mono-label">SAMPLED FRAMES</span>
					<strong class="eva-display">{manifest.video.sampled_frames}</strong>
				</div>
				<div class="stat-box">
					<span class="eva-mono-label">UNIQUE FRAMES</span>
					<strong class="eva-display">{manifest.stats.uniqueFrames}</strong>
				</div>
				<div class="stat-box">
					<span class="eva-mono-label">TEMPORAL SEQUENCES</span>
					<strong class="eva-display">{manifest.stats.temporalSequences}</strong>
				</div>
				<div class="stat-box">
					<span class="eva-mono-label">INTERCONNECTED MOTIFS</span>
					<strong class="eva-display">{manifest.stats.motifGroups}</strong>
				</div>
			</div>
		</EvaPanel>

		<div class="toolbar">
			<div class="toolbar__group">
				<button
					type="button"
					class="eva-btn"
					onclick={() => (viewMode = 'motifs')}
				>
					MOTIF CLUSTERS ({manifest.stats.motifGroups})
				</button>
				<button
					type="button"
					class="eva-btn"
					onclick={() => (viewMode = 'sequences')}
				>
					SEQUENCES ({filteredSequences.length})
				</button>
				<button
					type="button"
					class="eva-btn"
					onclick={() => (viewMode = 'frames')}
				>
					UNIQUE FRAMES ({selectedMotifId === 'all'
						? manifest.stats.uniqueFrames
						: manifest.frames.filter((f) => f.motifId === selectedMotifId).length})
				</button>
			</div>

			<div class="toolbar__group">
				{#if selectedMotifId !== 'all'}
					<button type="button" class="eva-btn" onclick={() => (selectedMotifId = 'all')}>
						CLEAR FILTER ({selectedMotifId})
					</button>
				{/if}
				{#if appliedMotifId}
					<button type="button" class="eva-btn eva-btn-danger" onclick={clearMotifTheme}>
						RESET MOTIF PALETTE
					</button>
				{/if}
			</div>
		</div>

		{#if viewMode === 'motifs'}
			<div class="motif-grid">
				{#each manifest.motifs as motif (motif.id)}
					{@const rep = frameMap.get(motif.representativeFrameId)}
					<article class="motif-card eva-chamfer">
						{#if rep}
							<div class="motif-card__thumb">
								<img src={rep.path} alt={motif.label} loading="lazy" />
								<span class="motif-card__badge">{motif.id.toUpperCase()}</span>
							</div>
						{/if}
						<div class="motif-card__body">
							<h3 class="motif-card__title eva-display">{motif.label}</h3>
							<p class="motif-card__desc">{motif.description}</p>
							<div class="motif-card__counts">
								<span class="eva-badge">{motif.sequenceCount} SEQS</span>
								<span class="eva-badge">{motif.frameCount} FRAMES</span>
							</div>

							<div class="swatches" aria-label="Extracted Palette">
								{#each motif.palette.swatches as hex}
									<span class="swatch" style="background: {hex}" title={hex}></span>
								{/each}
							</div>

							<div class="motif-card__actions">
								<button
									type="button"
									class="eva-btn"
									onclick={() => {
										selectedMotifId = motif.id;
										viewMode = 'frames';
									}}
								>
									INSPECT FRAMES
								</button>
								<button
									type="button"
									class="eva-btn"
									onclick={() => applyMotifTheme(motif.id)}
								>
									{appliedMotifId === motif.id ? 'PALETTE ACTIVE' : 'APPLY PALETTE'}
								</button>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else if viewMode === 'sequences'}
			<div class="seq-list">
				{#each filteredSequences as seq (seq.id)}
					{@const rep = frameMap.get(seq.representativeFrameId)}
					<div class="seq-row">
						{#if rep}
							<img src={rep.path} alt={seq.id} class="seq-row__rep" loading="lazy" />
						{/if}
						<div class="seq-row__meta">
							<div class="seq-row__head">
								<strong class="eva-display">{seq.id.toUpperCase()}</strong>
								<span class="eva-badge">{seq.motifId}</span>
								<span class="eva-mono-label">
									{seq.startTime.toFixed(2)}s → {seq.endTime.toFixed(2)}s ({seq.frameCount} unique)
								</span>
								{#if seq.audioPath}
									<button
										type="button"
										class="eva-btn"
										class:eva-btn-danger={playingSeqId === seq.id}
										style="padding: 0.15rem 0.5rem; font-size: 0.66rem;"
										onclick={() => toggleSeqAudio(seq)}
									>
										{playingSeqId === seq.id ? '■ STOP AUDIO' : '▶ PLAY SCENE AUDIO'}
									</button>
								{/if}
							</div>
							<div class="seq-row__strip">
								{#each seq.frameIds.slice(0, 10) as fid}
									{@const f = frameMap.get(fid)}
									{#if f}
										<button type="button" class="strip-thumb" onclick={() => (selectedFrame = f)}>
											<img src={f.path} alt={f.id} loading="lazy" />
										</button>
									{/if}
								{/each}
								{#if seq.frameIds.length > 10}
									<span class="eva-badge">+{seq.frameIds.length - 10} MORE</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="frames-grid">
				{#each filteredFrames as frame (frame.id)}
					<button type="button" class="frame-card" onclick={() => (selectedFrame = frame)}>
						<img src={frame.path} alt={frame.id} loading="lazy" />
						<div class="frame-card__meta">
							<span>{frame.timecode}</span>
							<span>{frame.motifId}</span>
						</div>
					</button>
				{/each}
			</div>
			{#if matchingFrames.length > frameLimit}
				<div class="load-more">
					<button type="button" class="eva-btn" onclick={() => (frameLimit += 120)}>
						LOAD MORE FRAMES ({filteredFrames.length} / {matchingFrames.length} SHOWN)
					</button>
				</div>
			{/if}
		{/if}
	{/if}
</div>

{#if selectedFrame}
	<div
		class="modal-backdrop"
		role="dialog"
		aria-modal="true"
		aria-label="Frame Details"
		onclick={(e) => e.target === e.currentTarget && (selectedFrame = null)}
		onkeydown={(e) => e.key === 'Escape' && (selectedFrame = null)}
		tabindex="-1"
	>
		<div class="modal-card eva-chamfer">
			<div class="modal-head">
				<strong class="eva-display">
					FRAME {selectedFrame.id.toUpperCase()} // {selectedFrame.timecode}
				</strong>
				<button type="button" class="eva-btn eva-btn-danger" onclick={() => (selectedFrame = null)}>
					CLOSE
				</button>
			</div>
			<img src={selectedFrame.path} alt={selectedFrame.id} class="modal-img" />
			<div class="modal-info">
				<div><span class="eva-mono-label">SEQUENCE:</span> {selectedFrame.sequenceId}</div>
				<div><span class="eva-mono-label">MOTIF:</span> {selectedFrame.motifId}</div>
				<div><span class="eva-mono-label">PHASH:</span> <code>{selectedFrame.phash}</code></div>
				<div><span class="eva-mono-label">EDGE DENSITY:</span> {selectedFrame.edgeDensity}</div>
				{#if selectedFrame.reappearances.length > 0}
					<div>
						<span class="eva-mono-label">REAPPEARS AT:</span>
						{selectedFrame.reappearances.map((t) => `${t}s`).join(', ')}
					</div>
				{/if}
				<div class="swatches">
					{#each selectedFrame.dominantColors as hex}
						<span class="swatch-labeled">
							<span class="swatch" style="background: {hex}"></span>
							<code>{hex}</code>
						</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.explorer {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.stats-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 0.75rem;
	}

	.stat-box {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.58rem 0.85rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		box-shadow: 0 0 10px var(--eva-primary-dim);
	}

	.stat-box strong {
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 1.95rem;
		line-height: 1;
		color: var(--eva-primary);
		text-shadow: var(--eva-bloom);
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.7rem 0.9rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
	}

	.toolbar__group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.motif-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 310px), 1fr));
		gap: 1rem;
	}

	.motif-card {
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.motif-card__thumb {
		position: relative;
		aspect-ratio: 16 / 9;
		background: #000;
		overflow: hidden;
		border-bottom: 1.5px solid var(--eva-border-strong);
	}

	.motif-card__thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.motif-card__badge {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		padding: 0.1rem 0.5rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 1px;
		border-radius: 4px;
		color: var(--eva-primary);
		font-family: var(--eva-font-num);
		font-size: 0.8rem;
		font-weight: 700;
		text-shadow: var(--eva-bloom);
	}

	.motif-card__body {
		padding: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		flex: 1;
	}

	.motif-card__title {
		margin: 0;
		font-size: 1.18rem;
		color: var(--eva-primary);
	}

	.motif-card__desc {
		margin: 0;
		font-family: var(--eva-font-sans);
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--eva-text-muted);
	}

	.motif-card__counts {
		display: flex;
		gap: 0.45rem;
	}

	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		align-items: center;
	}

	.swatch {
		width: 22px;
		height: 14px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 2px;
		display: inline-block;
	}

	.swatch-labeled {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-family: var(--eva-font-num);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.motif-card__actions {
		margin-top: auto;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding-top: 0.35rem;
	}

	.seq-list {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.seq-row {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 1rem;
		padding: 0.78rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	@media (max-width: 700px) {
		.seq-row {
			grid-template-columns: 1fr;
		}
	}

	.seq-row__rep {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 4px;
	}

	.seq-row__meta {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		min-width: 0;
	}

	.seq-row__head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
	}

	.seq-row__strip {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		align-items: center;
	}

	.strip-thumb {
		padding: 0;
		border: 1.5px solid var(--eva-border);
		border-radius: 3px;
		background: #000;
		cursor: pointer;
		width: 84px;
		aspect-ratio: 16 / 9;
		overflow: hidden;
	}

	.strip-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.frames-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.85rem;
	}

	.frame-card {
		padding: 0;
		background: #000000;
		border: 1.5px solid var(--eva-border);
		border-radius: 5px;
		color: var(--eva-primary);
		cursor: pointer;
		text-align: left;
		overflow: hidden;
	}

	.frame-card:hover {
		border-color: var(--eva-border-strong);
		box-shadow: 0 0 12px var(--eva-primary-dim);
	}

	.frame-card img {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		display: block;
	}

	.frame-card__meta {
		display: flex;
		justify-content: space-between;
		padding: 0.35rem 0.55rem;
		font-family: var(--eva-font-num);
		font-variant-numeric: tabular-nums;
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--eva-primary);
		border-top: 1px solid var(--eva-border);
	}

	.load-more {
		display: flex;
		justify-content: center;
		padding: 1rem;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgba(0, 0, 0, 0.88);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal-card {
		max-width: 680px;
		width: 100%;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		box-shadow: 0 0 24px var(--eva-primary-dim);
	}

	.modal-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-img {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: contain;
		background: #000;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 4px;
	}

	.modal-info {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		font-family: var(--eva-font-num);
		font-size: 0.92rem;
	}
</style>
