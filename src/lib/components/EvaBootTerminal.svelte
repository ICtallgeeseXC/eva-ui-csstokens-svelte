<svelte:options customElement={{ tag: 'eva-boot-terminal', shadow: 'none' }} />

<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		soundEnabled?: boolean;
		audioSrc?: string;
		errorAudioSrc?: string;
	}

	let {
		soundEnabled = $bindable(true),
		audioSrc = '/analysis-resound/audio/seq_019.mp3',
		errorAudioSrc = '/analysis-resound/audio/seq_035.mp3'
	}: Props = $props();

	const bootScript = [
		'JA HI-SIS RE-BOOT',
		'ジェット・アローン再起動用オペレーティングシステム Ver.2.1.1b',
		'Copyright(C) 2014,2015 日本重化学工業共同体、通産省、防衛庁',
		'',
		'CO-CPU            Check                 OK',
		'I/O SECTORS       Check     256seg      OK',
		'CONSOLE DRIVERS   Check                 OK',
		'BOOTING KERNEL    Check                 OK',
		'MAGI LINK STATUS  Check     SLAVE       OK',
		'VIRUS PROTECTION  Check     GREEN       OK',
		'',
		'********** SYSTEM CONFIGURATION **********',
		'addr  PSP  blks   size   owner/parameters',
		'------------------------------------------',
		'0280  sys     1   2256   mosaic',
		'0340  sys     1   4112   eradic',
		'0470  sys     1  10784   smalldrv',
		'0710  --      1  21712   <free>',
		'DE02  E800    1   8160   <free>',
		'                  --- UMB total: 53 TB ---',
		'===== MEMS ver14.0 (frame: C000h) =====',
		'TYPE "help", "status", "reboot", "error", or "clear"'
	];

	let lines = $state<string[]>(bootScript);
	let cmd = $state('');
	let isErrorFlash = $state(false);
	let vanishedRows = $state(0);
	let isBooting = $state(false);
	let audioEl: HTMLAudioElement | null = null;
	let errorAudioEl: HTMLAudioElement | null = null;
	let bootTimer: ReturnType<typeof setInterval> | null = null;
	let bootEndTimer: ReturnType<typeof setTimeout> | null = null;
	let errorTimer: ReturnType<typeof setInterval> | null = null;
	let errorEndTimer: ReturnType<typeof setTimeout> | null = null;
	let viewportEl: HTMLDivElement | null = null;

	onMount(() => {
		audioEl = new Audio(audioSrc);
		audioEl.preload = 'metadata';
		errorAudioEl = new Audio(errorAudioSrc);
		errorAudioEl.preload = 'metadata';
		return () => {
			if (bootTimer) clearInterval(bootTimer);
			if (bootEndTimer) clearTimeout(bootEndTimer);
			if (errorTimer) clearInterval(errorTimer);
			if (errorEndTimer) clearTimeout(errorEndTimer);
			audioEl?.pause();
			errorAudioEl?.pause();
		};
	});

	function toggleSound() {
		soundEnabled = !soundEnabled;
		if (!soundEnabled) {
			audioEl?.pause();
			errorAudioEl?.pause();
		}
	}

	function runBoot() {
		if (bootTimer) clearInterval(bootTimer);
		if (bootEndTimer) clearTimeout(bootEndTimer);

		const startBootSequence = () => {
			if (bootTimer) clearInterval(bootTimer);
			if (bootEndTimer) clearTimeout(bootEndTimer);

			const dur = audioEl && Number.isFinite(audioEl.duration) ? audioEl.duration : 0.68;
			const soundMs = Math.max(300, Math.round(dur * 1000));
			const stepMs = Math.max(12, Math.floor((soundMs * 0.92) / bootScript.length));

			isErrorFlash = false;
			isBooting = true;
			lines = [];

			const finishBoot = () => {
				if (bootTimer) {
					clearInterval(bootTimer);
					bootTimer = null;
				}
				if (bootEndTimer) {
					clearTimeout(bootEndTimer);
					bootEndTimer = null;
				}
				if (lines.length < bootScript.length) {
					lines = [...bootScript];
					requestAnimationFrame(() => {
						if (viewportEl) viewportEl.scrollTop = viewportEl.scrollHeight;
					});
				}
				isBooting = false;
			};

			if (soundEnabled && audioEl) {
				audioEl.currentTime = 0;
				audioEl.addEventListener('ended', finishBoot, { once: true });
				audioEl.play().catch(() => {});
				bootEndTimer = setTimeout(finishBoot, soundMs + 100);
			} else {
				bootEndTimer = setTimeout(finishBoot, soundMs);
			}

			let i = 0;
			bootTimer = setInterval(() => {
				if (i < bootScript.length) {
					lines = [...lines, bootScript[i]];
					i += 1;
					requestAnimationFrame(() => {
						if (viewportEl) viewportEl.scrollTop = viewportEl.scrollHeight;
					});
				} else if (bootTimer) {
					clearInterval(bootTimer);
					bootTimer = null;
				}
			}, stepMs);
		};

		if (!audioEl) {
			audioEl = new Audio(audioSrc);
		}
		if (audioEl.readyState >= 1) {
			startBootSequence();
		} else {
			audioEl.addEventListener('loadedmetadata', startBootSequence, { once: true });
			audioEl.load();
		}
	}

	function triggerError() {
		if (errorTimer) clearInterval(errorTimer);
		if (errorEndTimer) clearTimeout(errorEndTimer);

		const startErrorSequence = () => {
			if (errorTimer) clearInterval(errorTimer);
			if (errorEndTimer) clearTimeout(errorEndTimer);

			const dur = errorAudioEl && Number.isFinite(errorAudioEl.duration) ? errorAudioEl.duration : 3.28;
			const half = dur * 0.5;
			const soundMs = Math.max(800, Math.round((dur - half) * 1000));
			const totalRows = 8;
			const stepMs = Math.max(50, Math.floor((soundMs * 0.72) / (totalRows - 1)));

			isErrorFlash = true;
			vanishedRows = 1;

			const finishError = () => {
				if (errorTimer) {
					clearInterval(errorTimer);
					errorTimer = null;
				}
				if (errorEndTimer) {
					clearTimeout(errorEndTimer);
					errorEndTimer = null;
				}
				isErrorFlash = false;
				vanishedRows = 0;
			};

			if (soundEnabled && errorAudioEl) {
				errorAudioEl.currentTime = half;
				errorAudioEl.addEventListener('ended', finishError, { once: true });
				errorAudioEl.play().catch(() => {});
				errorEndTimer = setTimeout(finishError, soundMs + 120);
			} else {
				errorEndTimer = setTimeout(finishError, soundMs);
			}

			errorTimer = setInterval(() => {
				if (vanishedRows < totalRows) {
					vanishedRows += 1;
				} else if (errorTimer) {
					clearInterval(errorTimer);
					errorTimer = null;
				}
			}, stepMs);
		};

		if (!errorAudioEl) {
			errorAudioEl = new Audio(errorAudioSrc);
		}
		if (errorAudioEl.readyState >= 1) {
			startErrorSequence();
		} else {
			errorAudioEl.addEventListener('loadedmetadata', startErrorSequence, { once: true });
			errorAudioEl.load();
		}
	}

	function submitCommand(e: SubmitEvent) {
		e.preventDefault();
		const trimmed = cmd.trim();
		if (!trimmed) return;
		cmd = '';

		const lower = trimmed.toLowerCase();
		if (lower === 'clear') {
			lines = [];
			return;
		}
		if (lower === 'reboot') {
			runBoot();
			return;
		}
		if (lower === 'error' || /^malloc(\s|$)/.test(lower)) {
			triggerError();
			return;
		}

		let reply: string[] = [];
		if (lower === 'help') {
			reply = ['CMDS: help | status | config | reboot | error | malloc <arg> | clear'];
		} else if (lower === 'status') {
			reply = ['CO-CPU: OK | KERNEL: ACTIVE | MAGI: SLAVE | VIRUS: GREEN'];
		} else if (lower === 'config') {
			reply = ['UMB TOTAL: 53 TB | MEMS: ver14.0 (frame C000h) | 256seg OK'];
		} else {
			reply = [`EXEC "${trimmed}" -> 0x00 OK`];
		}

		lines = [...lines, `JA> ${trimmed}`, ...reply];
		requestAnimationFrame(() => {
			if (viewportEl) viewportEl.scrollTop = viewportEl.scrollHeight;
		});
	}
</script>

<div class="bt-wrap">
	<div class="bt-bar">
		<span class="bt-bar__lbl">JA HI-SIS // INTERACTIVE TERMINAL</span>
		<div class="bt-bar__btns">
			<button
				type="button"
				class="eva-btn bt-mini"
				class:eva-btn-danger={soundEnabled}
				onclick={toggleSound}
			>
				{soundEnabled ? 'SOUND: ON' : 'SOUND: OFF'}
			</button>
			<button type="button" class="eva-btn bt-mini" onclick={runBoot} disabled={isBooting}>
				{isBooting ? 'BOOTING...' : 'RE-BOOT'}
			</button>
			<button type="button" class="eva-btn eva-btn-danger bt-mini" onclick={triggerError}>
				ERROR
			</button>
		</div>
	</div>

	<div class="bt-screen" bind:this={viewportEl}>
		{#if isErrorFlash}
			<div class="bt-vanished-screen" aria-label="ERROR">
				{#each Array.from({ length: vanishedRows }) as _, idx (idx)}
					<div class="bt-vanished-row eva-display">
						<span>ERROR</span>
						<span>ERROR</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="bt-lines">
				{#each lines as line}
					<div class="bt-line">{line || '\u00A0'}</div>
				{/each}
			</div>
		{/if}
	</div>

	<form class="bt-prompt" onsubmit={submitCommand}>
		<span class="bt-prompt__prefix">JA&gt;</span>
		<input
			type="text"
			class="bt-prompt__input"
			placeholder="enter command (help, status, reboot, error)..."
			bind:value={cmd}
		/>
	</form>
</div>

<style>
	.bt-wrap {
		background: #020302;
		border: 1.5px solid #35f258;
		display: flex;
		flex-direction: column;
	}

	.bt-bar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.6rem;
		background: #061208;
		border-bottom: 1px solid rgba(53, 242, 88, 0.35);
	}

	.bt-bar__lbl {
		font-family: var(--eva-font-display);
		font-size: 0.88rem;
		font-weight: 700;
		color: #46f76a;
		letter-spacing: 0.04em;
		text-shadow: 0 0 8px rgba(70, 247, 106, 0.45);
	}

	.bt-bar__btns {
		display: flex;
		gap: 0.35rem;
	}

	.bt-mini {
		min-width: 82px;
		padding: 0.15rem 0.45rem;
		font-size: 0.68rem;
		justify-content: center;
	}

	.bt-screen {
		height: 240px;
		overflow-y: auto;
		padding: 0.55rem 0.65rem;
		background: #010201;
		position: relative;
	}

	.bt-lines {
		font-family: var(--eva-font-mono);
		font-size: 0.7rem;
		line-height: 1.18;
		color: #46f76a;
		text-shadow: 0 0 4px rgba(70, 247, 106, 0.35);
	}

	.bt-line {
		white-space: pre;
		overflow-x: auto;
	}

	.bt-vanished-screen {
		position: absolute;
		inset: 0;
		background: #000000;
		display: flex;
		flex-direction: column-reverse;
		justify-content: flex-start;
		padding: 0.3rem 1.25rem;
		gap: 0.06rem;
		overflow: hidden;
	}

	.bt-vanished-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		text-align: center;
		font-size: 1.95rem;
		line-height: 0.94;
		letter-spacing: 0.08em;
		color: #ff2222;
		text-shadow: 0 0 10px rgba(255, 34, 34, 0.6);
		animation: vanished-flash 0.21s steps(2, start) 1;
	}

	@keyframes vanished-flash {
		0% {
			opacity: 0.25;
		}
		100% {
			opacity: 1;
		}
	}

	.bt-prompt {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.35rem 0.65rem;
		background: #050a06;
		border-top: 1px solid rgba(53, 242, 88, 0.35);
	}

	.bt-prompt__prefix {
		font-family: var(--eva-font-mono);
		font-size: 0.76rem;
		font-weight: 700;
		color: #46f76a;
	}

	.bt-prompt__input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-family: var(--eva-font-mono);
		font-size: 0.75rem;
		color: #46f76a;
	}
</style>
