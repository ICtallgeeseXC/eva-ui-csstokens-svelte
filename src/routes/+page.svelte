<script lang="ts">
	import { onMount } from 'svelte';
	import {
		EvaAccordion,
		EvaActionMenu,
		EvaAlertBanner,
		EvaAudioController,
		EvaAvatar,
		EvaBentoMenu,
		EvaBilingualHeader,
		EvaBootTerminal,
		EvaBreadcrumb,
		EvaCapsulePill,
		EvaCarousel,
		EvaChamferBox,
		EvaCheckbox,
		EvaCircuitVisualizer,
		EvaClockTimer,
		EvaComboBox,
		EvaCommentThread,
		EvaCrtControl,
		EvaDataTable,
		EvaDatePicker,
		EvaEnergyVisualizer,
		EvaEqPillars,
		EvaFilterChips,
		EvaFrame,
		EvaHazardStrip,
		EvaHexGrid,
		EvaHudBox,
		EvaHudOverlay,
		EvaIcon,
		EvaInput,
		EvaLedIndicator,
		EvaLinkList,
		EvaMagiPanel,
		EvaModal,
		EvaModeStrip,
		EvaMultiSelect,
		EvaNervStatusWall,
		EvaPagination,
		EvaPanel,
		EvaPatternBlue,
		EvaPatternMatrix,
		EvaPhaseScope,
		EvaProgressBar,
		EvaRadioGroup,
		EvaRulerScale,
		EvaSeekBar,
		EvaSegmentDisplay,
		EvaSelect,
		EvaSidebar,
		EvaSpinner,
		EvaSplitReadout,
		EvaStampBadge,
		EvaStatCard,
		EvaStatusTag,
		EvaStepper,
		EvaTabs,
		EvaTerminal,
		EvaTextarea,
		EvaTitleCard,
		EvaToast,
		EvaToggle,
		EvaTooltip,
		EvaTransportButton,
		EvaTriadGrid,
		EvaWaveform,
		evaTransition,
		type MagiNode,
		type MagiResolutionStatus,
		type ToastItem
	} from '$lib';

	import EvaAlertBannerRaw from '$lib/components/EvaAlertBanner.svelte?raw';
	import EvaClockTimerRaw from '$lib/components/EvaClockTimer.svelte?raw';
	import EvaEnergyVisualizerRaw from '$lib/components/EvaEnergyVisualizer.svelte?raw';
	import EvaEqPillarsRaw from '$lib/components/EvaEqPillars.svelte?raw';
	import EvaPhaseScopeRaw from '$lib/components/EvaPhaseScope.svelte?raw';
	import EvaCircuitVisualizerRaw from '$lib/components/EvaCircuitVisualizer.svelte?raw';
	import EvaAudioControllerRaw from '$lib/components/EvaAudioController.svelte?raw';
	import EvaWaveformRaw from '$lib/components/EvaWaveform.svelte?raw';
	import EvaMagiPanelRaw from '$lib/components/EvaMagiPanel.svelte?raw';
	import EvaHudOverlayRaw from '$lib/components/EvaHudOverlay.svelte?raw';
	import EvaTerminalRaw from '$lib/components/EvaTerminal.svelte?raw';
	import EvaBootTerminalRaw from '$lib/components/EvaBootTerminal.svelte?raw';
	import EvaDataTableRaw from '$lib/components/EvaDataTable.svelte?raw';
	import EvaTabsRaw from '$lib/components/EvaTabs.svelte?raw';
	import EvaPatternMatrixRaw from '$lib/components/EvaPatternMatrix.svelte?raw';
	import EvaPatternBlueRaw from '$lib/components/EvaPatternBlue.svelte?raw';
	import EvaNervStatusWallRaw from '$lib/components/EvaNervStatusWall.svelte?raw';
	import EvaHexGridRaw from '$lib/components/EvaHexGrid.svelte?raw';
	import EvaTitleCardRaw from '$lib/components/EvaTitleCard.svelte?raw';
	import EvaStampBadgeRaw from '$lib/components/EvaStampBadge.svelte?raw';
	import EvaCheckboxRaw from '$lib/components/EvaCheckbox.svelte?raw';
	import EvaRadioGroupRaw from '$lib/components/EvaRadioGroup.svelte?raw';
	import EvaInputRaw from '$lib/components/EvaInput.svelte?raw';
	import EvaAccordionRaw from '$lib/components/EvaAccordion.svelte?raw';
	import EvaModalRaw from '$lib/components/EvaModal.svelte?raw';
	import EvaBreadcrumbRaw from '$lib/components/EvaBreadcrumb.svelte?raw';
	import EvaBentoMenuRaw from '$lib/components/EvaBentoMenu.svelte?raw';
	import EvaComboBoxRaw from '$lib/components/EvaComboBox.svelte?raw';
	import EvaCarouselRaw from '$lib/components/EvaCarousel.svelte?raw';
	import EvaCommentThreadRaw from '$lib/components/EvaCommentThread.svelte?raw';
	import EvaPanelRaw from '$lib/components/EvaPanel.svelte?raw';
	import EvaFrameRaw from '$lib/components/EvaFrame.svelte?raw';

	let alertSeverity = $state<'emergency' | 'warning' | 'info' | 'nominal'>('emergency');
	let syncRate = $state(74.2);
	let waveformDynamic = $state(false);
	let battery = $state(68);
	let activeTab = $state('overview');
	let usageTab = $state<'svelte' | 'webcomponent' | 'css'>('svelte');
	let chkA = $state(true);
	let chkB = $state(false);
	let umbilical = $state(true);
	let plugMode = $state('plug-01');
	let sector = $state('cage-01');
	let callsign = $state('UNIT-01');
	let missionNotes = $state('A.T. Field resonance within nominal parameters.');
	let modalOpen = $state(false);
	let currentPage = $state(1);
	let toasts = $state<ToastItem[]>([]);
	let flowStepper = $state(4);
	let opDate = $state('2015-06-22');
	let searchQuery = $state('');
	let formSubmitted = $state('');

	// Composable SEQ_085-C Timer assembled purely from primitive building blocks
	let compMs = $state(300_000);
	let compRunning = $state(true);
	let compLastSpeed = $state<'SLOW' | 'NORMAL' | 'RACING'>('RACING');

	const compMode = $derived(!compRunning || compMs === 0 ? 'STOP' : compLastSpeed);
	const compRate = $derived(compMode === 'SLOW' ? 0.25 : compMode === 'NORMAL' ? 1 : compMode === 'RACING' ? 3 : 0);
	const compCritical = $derived(compMs <= 60_000);
	const compDepleted = $derived(compMs === 0);
	const compTimeStr = $derived.by(() => {
		const totalSec = Math.floor(compMs / 1000);
		const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
		const secs = String(totalSec % 60).padStart(2, '0');
		const cs = String(Math.floor((compMs % 1000) / 10)).padStart(2, '0');
		return `${mins}:${secs}:${cs}`;
	});

	onMount(() => {
		let last = performance.now();
		let raf = 0;
		const tick = (t: number) => {
			const dt = t - last;
			last = t;
			if (compRunning && compMs > 0) {
				compMs = Math.max(0, compMs - dt * compRate);
				if (compMs === 0) compRunning = false;
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	function onCompModeSelect(m: string) {
		if (m === 'STOP') {
			compRunning = false;
		} else {
			compLastSpeed = m as 'SLOW' | 'NORMAL' | 'RACING';
			compRunning = true;
		}
	}

	// Composable MAGI-SEQ-C Matrix (Episode 13 "Lilliputian Hitcher" unanimity veto)
	let compMagiFlash = $state(true);
	let compMagiNodes = $state<MagiNode[]>([
		{ id: 'balthasar', name: 'BALTHASAR-2', role: 'MOTHER', vote: 'approved' },
		{ id: 'casper', name: 'CASPER-3', role: 'WOMAN', vote: 'denied' },
		{ id: 'melchior', name: 'MELCHIOR-1', role: 'SCIENTIST', vote: 'approved' }
	]);

	const compMagiStatus = $derived.by<MagiResolutionStatus>(() => {
		if (compMagiNodes.some((n) => n.vote === 'denied' || n.vote === 'rejected')) return 'DENIED';
		if (compMagiNodes.every((n) => n.vote === 'approved' || n.vote === 'override')) {
			return 'APPROVED';
		}
		return 'DELIBERATING';
	});
	const compMagiJp = $derived(
		compMagiStatus === 'APPROVED' ? '可決' : compMagiStatus === 'DENIED' ? '否定' : '審議中'
	);
	const compMagiColor = $derived(
		compMagiStatus === 'APPROVED'
			? '#00c8ff'
			: compMagiStatus === 'DENIED'
				? '#ff2222'
				: 'var(--eva-border-strong, #ff941a)'
	);

	function magiVoteColor(vote: MagiNode['vote']) {
		return vote === 'approved'
			? '#00c8ff'
			: vote === 'denied' || vote === 'rejected'
				? '#ff2222'
				: vote === 'override'
					? '#ff8c00'
					: '#ff9900';
	}

	function magiVoteSubtitle(vote: MagiNode['vote']) {
		return vote === 'pending'
			? 'COMPUTING...'
			: vote === 'denied' || vote === 'rejected'
				? 'DENIED // 否定'
				: vote === 'approved'
					? 'APPROVED // 可決'
					: 'OVERRIDE';
	}

	function cycleCompMagi(idx: number) {
		const order: MagiNode['vote'][] = ['approved', 'denied', 'pending', 'override'];
		compMagiNodes = compMagiNodes.map((n, i) => {
			if (i !== idx) return n;
			const cur = n.vote === 'rejected' ? 'denied' : n.vote;
			return { ...n, vote: order[(order.indexOf(cur) + 1) % order.length] };
		});
	}

	// Live Composable SEQ_033-C MAGI Defense Screen counters
	let defCollapseSec = $state(223231);
	let defElapsedSec = $state(7);
	let defActive = $state(true);

	// Shared audio controller bus feeding all Section 02 visualizers
	let controllerPlaying = $state(false);
	let controllerAnalyser = $state<AnalyserNode | null>(null);
	let controllerTrack = $state('NERV-PULSE.MP3');

	onMount(() => {
		const fid = setInterval(() => {
			compMagiFlash = !compMagiFlash;
		}, 425);
		const sid = setInterval(() => {
			if (defActive && defCollapseSec > 0) {
				defCollapseSec -= 1;
				defElapsedSec += 1;
			}
		}, 1000);
		return () => {
			clearInterval(fid);
			clearInterval(sid);
		};
	});

	function pushToast(severity: ToastItem['severity']) {
		const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
		toasts = [
			...toasts,
			{
				id,
				title: `SYSTEM ${severity?.toUpperCase() ?? 'INFO'}`,
				message: 'MAGI telemetry packet acknowledged.',
				severity
			}
		];
	}

	const hudSlides = [
		'/analysis/frames/f_0456.webp',
		'/analysis/frames/f_0382.webp',
		'/analysis/frames/f_0125.webp',
		'/analysis/frames/f_0042.webp'
	];

	let openCode = $state<Record<string, boolean>>({});
	let codeMode = $state<Record<string, 'usage' | 'source'>>({});
	let copiedId = $state<string>('');

	function toggleCode(id: string) {
		openCode[id] = !openCode[id];
		if (!codeMode[id]) codeMode[id] = 'usage';
	}

	async function copyCode(id: string, text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedId = id;
			setTimeout(() => {
				if (copiedId === id) copiedId = '';
			}, 1400);
		} catch {
			// clipboard unavailable
		}
	}

	const SNIPPETS: Record<string, { usage: string; source: string }> = {
		alert: {
			usage: `<!-- Inspired by SEQ_190..193 (非常事態 / EMERGENCY) -->\n<EvaAlertBanner severity="emergency" headline="EMERGENCY" />`,
			source: EvaAlertBannerRaw
		},
		atoms: {
			usage: `<EvaFrame variant="flanked">\n  <EvaBilingualHeader jp="基礎UI要素" title="ATOMIC PRIMITIVES" code="ATOM-01" />\n  <EvaLedIndicator state="on" label="NOMINAL" />\n  <EvaHazardStrip direction="chevron" centerTag="非常事態" animated />\n  <EvaRulerScale ticks={36} majorEvery={4} />\n  <EvaChamferBox color="#72f7ff">MELCHIOR-1</EvaChamferBox>\n</EvaFrame>`,
			source: EvaFrameRaw
		},
		defenseHud: {
			usage: `<!-- Composed SEQ_033 Defense HUD using EvaSplitReadout + EvaFrame + EvaLedIndicator -->\n<EvaSplitReadout value="DANANG TYPE-B" subtitle="on MAGI-01 ORIGINAL" />\n<EvaSplitReadout value="223,231" unit="sec." subtitle="TIME REMAINING TO COLLAPSE" subtitlePosition="top" />\n<EvaSplitReadout value="PROTECT NO. 666" subtitle="on MAGI-01 ORIGINAL" />\n<EvaSplitReadout value="000,007" unit="sec." subtitle="TIME SINCE SCREEN RAISED" subtitlePosition="top" />`,
			source: EvaFrameRaw
		},
		clock: {
			usage: `<!-- Drop-in parent element (internally composed of smaller blocks) -->\n<EvaClockTimer mode="countdown" initialSeconds={300} />`,
			source: EvaClockTimerRaw
		},
		clockComposed: {
			usage: `<!-- Composable assembly from atomic EVA-UI building blocks -->\n<EvaStatusTag variant="pill" jpLabel="活動限界まで あと" label="ACTIVE TIME REMAINING:" critical={isCritical} />\n<EvaSegmentDisplay value={timeStr} critical={isCritical} flash={isDepleted} />\n<EvaStatusTag variant="striped" jpLabel="内部" label="INTERNAL" critical={isCritical} />\n<EvaStatusTag variant="stacked" jpLabel="主電源供給システム" label="MAIN ENERGY SUPPLY SYSTEM" critical={isCritical} />\n<EvaModeStrip interactive active={mode} critical={isCritical} onSelect={handleMode} />\n<EvaTransportButton bind:playing={running} label="RUN / PAUSE" minWidth="118px" />`,
			source: EvaClockTimerRaw
		},
		energyViz: {
			usage: `<!-- Inspired by SEQ_125 (ENERGY OBSERVATIONAL DATA) -->\n<EvaEnergyVisualizer audioSrc="/audio/nerv-pulse.mp3" />`,
			source: EvaEnergyVisualizerRaw
		},
		eqPillars: {
			usage: `<!-- Inspired by SEQ_009 (Re-Sound-Design Pt.1 7-Band EQ Pillars) -->\n<EvaEqPillars audioSrc="/audio/nerv-pulse.mp3" />`,
			source: EvaEqPillarsRaw
		},
		phaseScope: {
			usage: `<!-- Inspired by SEQ_010 (Re-Sound-Design Pt.1 Phase Contour Scope) -->\n<EvaPhaseScope audioSrc="/audio/nerv-pulse.mp3" />`,
			source: EvaPhaseScopeRaw
		},
		circuitViz: {
			usage: `<!-- Inspired by SEQ_008 (Re-Sound-Design Pt.1 Circuit Audio Matrix) -->\n<EvaCircuitVisualizer audioSrc="/audio/nerv-pulse.mp3" />`,
			source: EvaCircuitVisualizerRaw
		},
		audioController: {
			usage: `<!-- Standalone audio deck composed from EvaFrame, EvaTransportButton, EvaSeekBar, EvaSegmentDisplay, EvaLedIndicator & EvaHudBox -->\n<EvaAudioController audioSrc="/audio/nerv-pulse.mp3" />`,
			source: EvaAudioControllerRaw
		},
		waveform: {
			usage: `<!-- Inspired by SEQ_221 (Harmonics / Sync Convergence) -->\n<EvaWaveform bind:syncRate bind:dynamic={waveformDynamic} dynamicMinMs={3000} dynamicMaxMs={8000} />`,
			source: EvaWaveformRaw
		},
		magi: {
			usage: `<!-- Drop-in parent element (Episode 13 Unanimous Agreement) -->\n<EvaMagiPanel title="MAGI // 決議" issue="MULTI ARTIFICIAL GENERAL INTELLIGENCE" />`,
			source: EvaMagiPanelRaw
		},
		magiComposed: {
			usage: `<!-- Composed purely from general-purpose atomic EVA-UI building blocks -->\n<EvaFrame variant="double" padding="0.75rem" gap="0.75rem">\n  <EvaBilingualHeader jp="MAGI // 決議" title="MULTI ARTIFICIAL GENERAL INTELLIGENCE">\n    {#snippet right()}\n      <EvaStatusTag variant="stacked" jpLabel="UNANIMOUS RESOLUTION" label={statusText} color={statusColor} inverted={isDeniedFlash} align="center" outlined glow size="md" minWidth="176px" />\n    {/snippet}\n  </EvaBilingualHeader>\n  <EvaTriadGrid>\n    <EvaChamferBox clickable color="#00c8ff" filled minHeight="74px" eyebrow="MOTHER" title="BALTHASAR-2" subtitle="APPROVED // 可決" />\n    <EvaChamferBox clickable color="#ff2222" bg="#240404" filled={flash} minHeight="74px" eyebrow="WOMAN" title="CASPER-3" subtitle="DENIED // 否定" />\n    <EvaChamferBox clickable color="#00c8ff" filled minHeight="74px" eyebrow="SCIENTIST" title="MELCHIOR-1" subtitle="APPROVED // 可決" />\n  </EvaTriadGrid>\n</EvaFrame>`,
			source: EvaMagiPanelRaw
		},
		hudOverlay: {
			usage: `<!-- Inspired by SEQ_146 (REC || / X00..X0N; pass showReticles to enable center boxes) -->\n<EvaHudOverlay recLabel="REC" showReticles={false} slides={['/analysis/frames/f_0456.webp']} />`,
			source: EvaHudOverlayRaw
		},
		terminal: {
			usage: `<!-- Inspired by SEQ_031 (Amber Telemetry Data Dump) -->\n<EvaTerminal />`,
			source: EvaTerminalRaw
		},
		bootTerminal: {
			usage: `<!-- Inspired by Re-Sound-Design SEQ_019 (JA HI-SIS RE-BOOT Terminal + Audio) -->\n<EvaBootTerminal />`,
			source: EvaBootTerminalRaw
		},
		table: {
			usage: `<EvaDataTable searchable editable />`,
			source: EvaDataTableRaw
		},
		tabs: {
			usage: `<EvaTabs bind:activeId={activeTab} />\n<EvaProgressBar label="POWER" value={battery} />`,
			source: EvaTabsRaw
		},
		spectrum: {
			usage: `<EvaPatternMatrix bars={24} audioSrc="/audio/nerv-pulse.mp3" />`,
			source: EvaPatternMatrixRaw
		},
		patternBlue: {
			usage: `<EvaPatternBlue pattern="BLUE" confidence={99.8} />`,
			source: EvaPatternBlueRaw
		},
		statusWall: {
			usage: `<EvaNervStatusWall interactive />`,
			source: EvaNervStatusWallRaw
		},
		hex: {
			usage: `<EvaHexGrid rows={4} cols={6} interactive />`,
			source: EvaHexGridRaw
		},
		titleCard: {
			usage: `<EvaTitleCard kicker="EPISODE:01" line1="ANGEL" line2="ATTACK" />`,
			source: EvaTitleCardRaw
		},
		stamp: {
			usage: `<EvaStampBadge label="REFUSED" sublabel="MAGI // 01-03" variant="alert" />`,
			source: EvaStampBadgeRaw
		},
		controls: {
			usage: `<EvaCheckbox bind:checked={chkA} label="A.T. FIELD NEUTRALIZER" code="AT-01" />\n<EvaToggle bind:checked={umbilical} label="UMBILICAL LOCK" />\n<EvaSelect bind:value={sector} />`,
			source: EvaCheckboxRaw
		},
		radios: {
			usage: `<EvaRadioGroup bind:value={plugMode} />`,
			source: EvaRadioGroupRaw
		},
		inputs: {
			usage: `<EvaInput bind:value={callsign} label="PILOT CALLSIGN" code="IN-01" />\n<EvaTextarea bind:value={missionNotes} />`,
			source: EvaInputRaw
		},
		accordion: {
			usage: `<!-- transition defaults to 'glitch'; supports 'glitch' | 'fade' | 'slide' | 'none' or { preset, duration } -->\n<EvaAccordion transition="glitch" />`,
			source: EvaAccordionRaw
		},
		overlays: {
			usage: `<!-- Standard 'glitch' transition on overlays (selectable: 'glitch' | 'fade' | 'slide' | 'none' | { preset, duration }) -->\n<EvaModal bind:open={modalOpen} title="MAGI OVERRIDE" transition="glitch">\n  <p>Confirm Level-A authorization?</p>\n</EvaModal>\n\n<!-- Auto-expires after 5000ms by default (set defaultDuration={0} to disable) -->\n<EvaToast bind:toasts defaultDuration={5000} transition="glitch" />\n\n<!-- Emergency toast (defaults to phosphorus gold text; explicit phosphor="gold" also supported) -->\nconst emergencyToast = {\n  id: 't-emerg',\n  title: 'SYSTEM EMERGENCY',\n  message: 'MAGI telemetry packet acknowledged.',\n  severity: 'emergency',\n  phosphor: 'gold', // default for emergency; set false to disable or 'severity' for red glow\n  duration: 6000,   // auto-expire in ms (0 = stay until dismissed)\n  transition: 'glitch'\n};\n\n<!-- Info / Warning / Nominal toasts (opt into phosphorus gold via phosphor: 'gold' or phosphor: true) -->\nconst infoToast    = { id: 't-info', title: 'SYSTEM INFO',    message: 'MAGI telemetry packet acknowledged.', severity: 'info',    phosphor: 'gold', duration: 4000, transition: 'glitch' };\nconst warningToast = { id: 't-warn', title: 'SYSTEM WARNING', message: 'Sync harmonic drift detected.',       severity: 'warning', phosphor: true,   duration: 5000, transition: 'slide' };\nconst nominalToast = { id: 't-nom',  title: 'SYSTEM NOMINAL', message: 'Umbilical power nominal.',           severity: 'nominal', phosphor: false,  duration: 0,    transition: { preset: 'glitch', duration: 360 } };`,
			source: EvaModalRaw
		},
		navFeedback: {
			usage: `<EvaBreadcrumb />\n<EvaPagination bind:page={currentPage} totalPages={6} />\n<EvaSpinner label="SYNCHRONIZING..." />`,
			source: EvaBreadcrumbRaw
		},
		navMenus: {
			usage: `<EvaBentoMenu />\n<EvaActionMenu variant="hamburger" />\n<EvaActionMenu variant="kebab" />\n<EvaActionMenu variant="meatballs" />\n<EvaSidebar />\n<EvaLinkList />`,
			source: EvaBentoMenuRaw
		},
		advancedInputs: {
			usage: `<EvaComboBox />\n<EvaMultiSelect />\n<EvaDatePicker bind:value={opDate} />\n<EvaStepper bind:value={flowStepper} />\n<EvaFilterChips />\n<EvaCrtControl />`,
			source: EvaComboBoxRaw
		},
		displayElements: {
			usage: `<EvaCarousel />\n<EvaAvatar initials="IK" label="IKARI, SHINJI" />\n<EvaIcon name="magi" />`,
			source: EvaCarouselRaw
		},
		comments: {
			usage: `<EvaCommentThread />`,
			source: EvaCommentThreadRaw
		},
		panel: {
			usage: `<EvaPanel title="CONTAINER" code="SYS-01" status="ACTIVE" hazardTop scanlines>\n  <!-- Any child elements -->\n</EvaPanel>`,
			source: EvaPanelRaw
		}
	};

	const svelteSnippet = `import { EvaAlertBanner, EvaClockTimer, EvaEnergyVisualizer, EvaDataTable } from 'eva-ui';
import 'eva-ui/tokens.css';
import 'eva-ui/base.css';

<EvaAlertBanner severity="emergency" headline="EMERGENCY" />
<EvaClockTimer mode="countdown" initialSeconds={300} />`;

	const wcSnippet = `<!-- Works in React, Vue, Vanilla HTML, or any framework -->
<link rel="stylesheet" href="eva-ui/tokens.css" />
<link rel="stylesheet" href="eva-ui/base.css" />

<eva-alert-banner severity="emergency" headline="EMERGENCY"></eva-alert-banner>
<eva-clock-timer mode="countdown"></eva-clock-timer>
<eva-energy-visualizer></eva-energy-visualizer>`;

	const cssSnippet = `<!-- Zero-JS pure CSS primitives -->
<div class="eva-root" data-eva-theme="nerv">
  <div class="eva-chamfer eva-scanlines" style="border: 1px solid var(--eva-border)">
    <span class="eva-badge">SEQ_190 // EMERGENCY</span>
    <button class="eva-btn">EXECUTE</button>
  </div>
</div>`;
</script>

{#snippet codeBtn(id: string)}
	<button
		type="button"
		class="eva-btn code-toggle-btn"
		class:is-open={openCode[id]}
		onclick={() => toggleCode(id)}
	>
		{openCode[id] ? 'HIDE CODE' : '</> CODE'}
	</button>
{/snippet}

{#snippet codeDrawer(id: string)}
	{#if openCode[id]}
		{@const mode = codeMode[id] ?? 'usage'}
		{@const content = mode === 'usage' ? SNIPPETS[id].usage : SNIPPETS[id].source}
		<div class="code-drawer" transition:evaTransition>
			<div class="code-drawer__bar">
				<div class="code-drawer__tabs">
					<button
						type="button"
						class="mini-btn"
						class:is-active={mode === 'usage'}
						onclick={() => (codeMode[id] = 'usage')}
					>
						USAGE
					</button>
					<button
						type="button"
						class="mini-btn"
						class:is-active={mode === 'source'}
						onclick={() => (codeMode[id] = 'source')}
					>
						SOURCE (.SVELTE)
					</button>
				</div>
				<button type="button" class="mini-btn copy-btn" class:is-copied={copiedId === id} onclick={() => copyCode(id, content)}>
					{copiedId === id ? 'COPIED ✓' : 'COPY'}
				</button>
			</div>
			<pre class="code-drawer__pre"><code>{content}</code></pre>
		</div>
	{/if}
{/snippet}

<div class="playground">
	<EvaPanel title="EMERGENCY MARQUEE BANNER" code="SEQ_190..193:B">
		{#snippet actions()}
			{@render codeBtn('alert')}
		{/snippet}
		<EvaAlertBanner
			severity={alertSeverity}
			headline={alertSeverity === 'emergency'
				? 'EMERGENCY'
				: alertSeverity === 'warning'
					? 'CAUTION // UNSTABLE'
					: alertSeverity === 'info'
						? 'MAGI DIAGNOSTIC'
						: 'ALL SYSTEMS NOMINAL'}
			subtext={alertSeverity === 'emergency' ? '' : 'STATIC STATUS MODE'}
		/>
		<div class="hero-controls">
			<div class="control-group">
				<span class="eva-mono-label">ALERT SEVERITY:</span>
				{#each ['emergency', 'warning', 'info', 'nominal'] as sev}
					<button
						type="button"
						class="eva-btn"
						class:eva-btn-danger={sev === 'emergency'}
						onclick={() => (alertSeverity = sev as typeof alertSeverity)}
					>
						{sev}
					</button>
				{/each}
			</div>
			<a href="/explorer" class="eva-btn">OPEN VIDEO FRAME EXPLORER →</a>
		</div>
		{@render codeDrawer('alert')}
	</EvaPanel>

	<EvaTitleCard
		variant="banner"
		kicker="SECTION 00"
		line1="ATOMIC PRIMITIVES &"
		line2="COMPOSABLE BUILDING BLOCKS"
		subtitle="BASE UI ATOMS // COMPOSABLE TELEMETRY ARCHITECTURE"
	/>

	<div class="grid-2">
		<EvaPanel title="ATOMIC PRIMITIVE PALETTE" code="ATOM-01" status="8 BASE BLOCKS">
			{#snippet actions()}
				{@render codeBtn('atoms')}
			{/snippet}
			<div class="stack">
				<EvaFrame variant="flanked" padding="0.6rem 0.75rem">
					<EvaBilingualHeader jp="基礎UI要素" title="COMPOSABLE ATOMS" code="AT-01" />
					<div class="atom-row">
						<EvaLedIndicator state="on" jpTag="稼働" label="NOMINAL" pulse />
						<EvaLedIndicator state="warn" jpTag="解析" label="ANALYZING" />
						<EvaLedIndicator state="crit" jpTag="否定" label="DENIED" pulse />
						<EvaLedIndicator state="info" jpTag="情報" label="MAGI-01" />
						<EvaLedIndicator state="off" label="STANDBY" />
					</div>
					<div class="atom-pills">
						<EvaCapsulePill height="20px" width="5px" color="#ff941a" />
						<EvaCapsulePill height="20px" width="5px" color="#fff275" />
						<EvaCapsulePill height="20px" width="5px" color="#46f76a" pulse />
						<EvaCapsulePill height="20px" width="5px" color="#ff2222" />
						<EvaCapsulePill height="20px" width="5px" color="#72f7ff" />
						<EvaCapsulePill orientation="horizontal" width="44px" height="5px" color="#ff941a" />
						<EvaCapsulePill orientation="horizontal" width="44px" height="5px" color="#46f76a" />
					</div>
					<EvaHazardStrip direction="chevron" color="#ff2222" height="14px" stripeWidth={9} centerTag="非常事態" animated />
					<EvaRulerScale ticks={36} majorEvery={4} color="#46f76a" height={10} />
					<EvaSeekBar value={62} max={100} buffered={84} segments={32} showRuler={false} label="Atom seek bar preview" />
					<div class="atom-chamfers">
						<EvaChamferBox color="#72f7ff" padding="0.35rem 0.5rem">
							<span class="eva-display" style="font-size: 0.85rem;">CHAMFER // MAGI-01</span>
						</EvaChamferBox>
						<EvaChamferBox color="#46f76a" padding="0.35rem 0.5rem">
							<span class="eva-display" style="font-size: 0.85rem;">CHAMFER // SUPPORT</span>
						</EvaChamferBox>
					</div>
					<div class="atom-row">
						<EvaHudBox color="#ff941a" text="OBSERVED BY MAGI" />
						<EvaHudBox color="#fff275" text="CAPACITY: NOMINAL" />
						<EvaHudBox color="#46f76a" text="SYNC: 100.0%" />
						<EvaHudBox color="#72f7ff" text="PATTERN BLUE" />
						<EvaHudBox color="#ff2222" text="EMERGENCY // 01" />
					</div>
				</EvaFrame>
			</div>
			{@render codeDrawer('atoms')}
		</EvaPanel>

		<EvaPanel title="DEFENSE SCREEN HUD (COMPOSED)" code="SEQ_033-C:B" status="SPLIT READOUTS">
			{#snippet actions()}
				{@render codeBtn('defenseHud')}
			{/snippet}
			<div class="stack">
				<div class="def-grid">
					<EvaSplitReadout value="DANANG TYPE-B" subtitle="on MAGI-01 ORIGINAL" />
					<EvaSplitReadout
						value={defCollapseSec.toLocaleString()}
						unit="sec."
						subtitle="TIME REMAINING TO COLLAPSE"
						subtitlePosition="top"
					/>
				</div>
				<EvaFrame variant="double" scanlines padding="0.5rem 0.7rem">
					<div class="def-mid">
						<EvaLedIndicator
							state={defActive ? 'on' : 'crit'}
							label={defActive ? 'SCREEN RAISED' : 'SCREEN PAUSED'}
							pulse={defActive}
							minWidth="136px"
						/>
						<EvaTransportButton bind:playing={defActive} label="SHIELD" minWidth="98px" />
						<button
							type="button"
							class="eva-btn"
							onclick={() => {
								defCollapseSec = 223231;
								defElapsedSec = 7;
							}}
						>
							RESET
						</button>
					</div>
					<EvaRulerScale ticks={40} majorEvery={5} height={8} />
				</EvaFrame>
				<div class="def-grid">
					<EvaSplitReadout value="PROTECT NO. 666" subtitle="on MAGI-01 ORIGINAL" />
					<EvaSplitReadout
						value={String(defElapsedSec).padStart(6, '0').replace(/(\d{3})(\d{3})/, '$1,$2')}
						unit="sec."
						subtitle="TIME SINCE SCREEN RAISED"
						subtitlePosition="top"
					/>
				</div>
			</div>
			{@render codeDrawer('defenseHud')}
		</EvaPanel>
	</div>

	<EvaTitleCard
		variant="banner"
		kicker="SECTION 01"
		line1="SEQUENCE-ACCURATE"
		line2="RECREATIONS"
		subtitle="NEON GENESIS EVANGELION // NERV & MAGI HUD MODULES"
	/>

	<div class="grid-2">
		<EvaPanel title="05:00 INTERNAL BATTERY TIMER" code="SEQ_085:B" status="PARENT ELEMENT">
			{#snippet actions()}
				{@render codeBtn('clock')}
			{/snippet}
			<EvaClockTimer mode="countdown" initialSeconds={300} />
			{@render codeDrawer('clock')}
		</EvaPanel>

		<EvaPanel title="COMPOSABLE TIMER (CLICKABLE MODES)" code="SEQ_085-C:B" status="COMPOSED BLOCKS">
			{#snippet actions()}
				{@render codeBtn('clockComposed')}
			{/snippet}
			<EvaFrame
				variant="double"
				padding="0.7rem 0.85rem"
				gap="0.65rem"
				color={compCritical ? '#ff2222' : '#ff941a'}
			>
				<div class="comp-timer__main">
					<div class="comp-timer__left">
						<EvaStatusTag
							variant="pill"
							jpLabel="活動限界まで あと"
							label={`RATE ${compRate}x // ${compMode}`}
							critical={compCritical}
						/>
						<EvaSegmentDisplay
							value={compTimeStr}
							critical={compCritical}
							flash={compDepleted}
						/>
					</div>
					<div class="comp-timer__right">
						<EvaStatusTag
							variant="striped"
							jpLabel="内部"
							label="INTERNAL"
							critical={compCritical}
						/>
						<EvaStatusTag
							variant="stacked"
							jpLabel="主電源供給システム"
							label="MAIN ENERGY SUPPLY SYSTEM"
							critical={compCritical}
						/>
					</div>
				</div>
				<div class="comp-timer__footer" class:is-critical={compCritical}>
					<EvaModeStrip
						interactive
						active={compMode}
						critical={compCritical}
						onSelect={onCompModeSelect}
					/>
					<div class="comp-timer__acts">
						<EvaTransportButton bind:playing={compRunning} label="RUN / PAUSE" minWidth="118px" />
						<button type="button" class="eva-btn comp-rst" onclick={() => (compMs = 300_000)}>
							RESET 05:00
						</button>
					</div>
				</div>
			</EvaFrame>
			{@render codeDrawer('clockComposed')}
		</EvaPanel>
	</div>

	<div class="grid-2">
		<EvaPanel title="MAGI VOTING MATRIX" code="MAGI-SEQ" status="EP.13 // UNANIMOUS">
			{#snippet actions()}
				{@render codeBtn('magi')}
			{/snippet}
			<EvaMagiPanel />
			{@render codeDrawer('magi')}
		</EvaPanel>

		<EvaPanel title="COMPOSABLE MAGI MATRIX" code="MAGI-SEQ-C" status="COMPOSED BLOCKS">
			{#snippet actions()}
				{@render codeBtn('magiComposed')}
			{/snippet}
			<EvaFrame variant="double" padding="0.75rem" gap="0.75rem">
				<EvaBilingualHeader jp="MAGI // 決議" title="MULTI ARTIFICIAL GENERAL INTELLIGENCE">
					{#snippet right()}
						<EvaStatusTag
							variant="stacked"
							jpLabel="UNANIMOUS RESOLUTION"
							label={`${compMagiStatus} · ${compMagiJp}`}
							color={compMagiColor}
							inverted={compMagiStatus === 'DENIED' && !compMagiFlash}
							align="center"
							outlined
							glow
							size="md"
							minWidth="176px"
						/>
					{/snippet}
				</EvaBilingualHeader>
				<EvaTriadGrid>
					{#each compMagiNodes as node, idx (node.id)}
						{@const isDenied = node.vote === 'denied' || node.vote === 'rejected'}
						<EvaChamferBox
							clickable
							color={magiVoteColor(node.vote)}
							bg={isDenied ? '#240404' : '#000000'}
							filled={node.vote === 'approved' ||
								node.vote === 'override' ||
								(isDenied && compMagiFlash)}
							hatched={node.vote === 'pending'}
							minHeight="74px"
							padding="0.65rem 0.6rem"
							eyebrow={node.role}
							title={node.name}
							subtitle={magiVoteSubtitle(node.vote)}
							onclick={() => cycleCompMagi(idx)}
						/>
					{/each}
				</EvaTriadGrid>
			</EvaFrame>
			{@render codeDrawer('magiComposed')}
		</EvaPanel>
	</div>

	<div class="grid-2">
		<EvaPanel title="CAMCORDER / TRACKING OVERLAY" code="SEQ_146:B">
			{#snippet actions()}
				{@render codeBtn('hudOverlay')}
			{/snippet}
			<EvaHudOverlay slides={hudSlides} />
			{@render codeDrawer('hudOverlay')}
		</EvaPanel>

		<EvaPanel title="RAW TELEMETRY DATA STREAM" code="SEQ_031:B">
			{#snippet actions()}
				{@render codeBtn('terminal')}
			{/snippet}
			<EvaTerminal />
			{@render codeDrawer('terminal')}
		</EvaPanel>
	</div>

	<EvaPanel title="JA HI-SIS BOOT TERMINAL" code="SEQ_019:R">
		{#snippet actions()}
			{@render codeBtn('bootTerminal')}
		{/snippet}
		<EvaBootTerminal />
		{@render codeDrawer('bootTerminal')}
	</EvaPanel>

	<EvaTitleCard
		variant="banner"
		kicker="SECTION 02"
		line1="AUDIO & HARMONIC"
		line2="VISUALIZERS"
		subtitle="AUDIO DECK, ENERGY OBSERVATIONAL, FFT SPECTRUM, PHASE CONTOURS & CIRCUIT RELAYS"
	/>

	<EvaPanel title="AUDIO TRANSPORT & SEEK CONTROLLER" code="AUD-01" status="COMPOSED ATOMICS">
		{#snippet actions()}
			{@render codeBtn('audioController')}
		{/snippet}
		<EvaAudioController
			bind:playing={controllerPlaying}
			bind:analyser={controllerAnalyser}
			bind:trackLabel={controllerTrack}
		/>
		{@render codeDrawer('audioController')}
	</EvaPanel>

	<div class="grid-2">
		<EvaPanel title="ENERGY OBSERVATIONAL VISUALIZER" code="SEQ_125:B">
			{#snippet actions()}
				{@render codeBtn('energyViz')}
			{/snippet}
			<EvaEnergyVisualizer
				externalPlaying={controllerPlaying}
				externalAnalyser={controllerAnalyser}
				externalTrackLabel={controllerTrack}
			/>
			{@render codeDrawer('energyViz')}
		</EvaPanel>
		<EvaPanel title="CIRCUIT RELAY AUDIO VISUALIZER" code="SEQ_008:R">
			{#snippet actions()}
				{@render codeBtn('circuitViz')}
			{/snippet}
			<EvaCircuitVisualizer
				externalPlaying={controllerPlaying}
				externalAnalyser={controllerAnalyser}
				externalTrackLabel={controllerTrack}
			/>
			{@render codeDrawer('circuitViz')}
		</EvaPanel>
	</div>

	<div class="grid-2">
		<EvaPanel title="7-BAND EQ PILLARS VISUALIZER" code="SEQ_009:R">
			{#snippet actions()}
				{@render codeBtn('eqPillars')}
			{/snippet}
			<EvaEqPillars
				externalPlaying={controllerPlaying}
				externalAnalyser={controllerAnalyser}
				externalTrackLabel={controllerTrack}
			/>
			{@render codeDrawer('eqPillars')}
		</EvaPanel>

		<EvaPanel title="PHASE CONTOUR SCOPE VISUALIZER" code="SEQ_010:R">
			{#snippet actions()}
				{@render codeBtn('phaseScope')}
			{/snippet}
			<EvaPhaseScope
				externalPlaying={controllerPlaying}
				externalAnalyser={controllerAnalyser}
				externalTrackLabel={controllerTrack}
			/>
			{@render codeDrawer('phaseScope')}
		</EvaPanel>
	</div>

	<div class="grid-2">
		<EvaPanel title="HARMONICS / SYNC WAVEFORM" code="SEQ_221:B">
			{#snippet actions()}
				{@render codeBtn('waveform')}
			{/snippet}
			<div class="stack">
				<EvaWaveform bind:syncRate bind:dynamic={waveformDynamic} />
				<label class="slider-row">
					<span class="eva-mono-label" style="min-width: 17ch; font-variant-numeric: tabular-nums;">
						SYNC RATE ({syncRate.toFixed(1)}%)
					</span>
					<input type="range" min="0" max="100" step="0.5" bind:value={syncRate} />
				</label>
				<EvaToggle
					bind:checked={waveformDynamic}
					label="DYNAMIC DRIFT (3–8S RANDOM)"
					onLabel="AUTO"
					offLabel="MANUAL"
				/>
			</div>
			{@render codeDrawer('waveform')}
		</EvaPanel>

		<EvaPanel title="AT-FIELD SPECTRUM BARS" code="SPEC-02" status="AUDIO FFT">
			{#snippet actions()}
				{@render codeBtn('spectrum')}
			{/snippet}
			<EvaPatternMatrix
				externalPlaying={controllerPlaying}
				externalAnalyser={controllerAnalyser}
				externalTrackLabel={controllerTrack}
			/>
			{@render codeDrawer('spectrum')}
		</EvaPanel>
	</div>

	<EvaTitleCard
		variant="banner"
		kicker="SECTION 03"
		line1="FUNCTIONAL / APPLICATION"
		line2="UI COMPONENTS"
		subtitle="INTERACTIVE CONTROLS // TABLES, FORMS & TELEMETRY WORKFLOWS"
	/>

	<div class="stats-grid">
		<EvaStatCard label="LCL PURITY" value="99.42" unit="%" delta="+0.18%" trend="up" code="BIO-01" />
		<EvaStatCard label="CORE TEMP" value="312.4" unit="K" delta="+4.2K" trend="down" code="THM-04" />
		<EvaStatCard label="MAGI CONSENSUS" value="2 / 3" unit="NODES" delta="NOMINAL" trend="neutral" code="CPU-01" />
		<EvaStatCard label="SYNC RATIO" value={syncRate.toFixed(1)} unit="%" delta="+6.4%" trend="up" code="SYN-01" />
	</div>

	<div class="grid-2">
		<EvaPanel title="FILTERABLE & EDITABLE DATA TABLE" code="OPS-01" status="FUNCTIONAL" hazardTop>
			{#snippet actions()}
				{@render codeBtn('table')}
			{/snippet}
			<EvaDataTable editable />
			{@render codeDrawer('table')}
		</EvaPanel>

		<EvaPanel title="TACTICAL TABS & POWER METERS" code="SYS-02" status="FUNCTIONAL">
			{#snippet actions()}
				{@render codeBtn('tabs')}
			{/snippet}
			<div class="stack">
				<EvaTabs bind:activeId={activeTab} />
				{#if activeTab === 'overview'}
					<EvaProgressBar label="UMBILICAL / INTERNAL POWER" value={battery} />
					<label class="slider-row">
						<span class="eva-mono-label">ADJUST POWER LEVEL ({battery}%)</span>
						<input type="range" min="0" max="100" step="1" bind:value={battery} />
					</label>
				{:else if activeTab === 'magi'}
					<EvaTerminal />
				{:else}
					<EvaProgressBar label="PRIMARY COOLANT" value={88} />
					<EvaProgressBar label="AUXILIARY CAPACITOR" value={22} />
				{/if}
			</div>
			{@render codeDrawer('tabs')}
		</EvaPanel>
	</div>

	<div class="grid-2">
		<EvaPanel title="CHECKBOXES, SWITCHES & SELECT" code="CTL-01" status="FUNCTIONAL">
			{#snippet actions()}
				{@render codeBtn('controls')}
			{/snippet}
			<div class="stack">
				<EvaCheckbox bind:checked={chkA} label="A.T. FIELD NEUTRALIZER" code="AT-01" />
				<EvaCheckbox bind:checked={chkB} label="LCL OVERPRESSURE PURGE" code="LCL-2" />
				<EvaToggle bind:checked={umbilical} label="UMBILICAL CABLE LOCK" />
				<EvaSelect bind:value={sector} />
			</div>
			{@render codeDrawer('controls')}
		</EvaPanel>

		<EvaPanel title="DIAMOND RADIO SELECTOR" code="CTL-02" status="FUNCTIONAL">
			{#snippet actions()}
				{@render codeBtn('radios')}
			{/snippet}
			<div class="stack">
				<EvaRadioGroup bind:value={plugMode} />
				<span class="eva-mono-label">ACTIVE SELECTION: {plugMode.toUpperCase()}</span>
			</div>
			{@render codeDrawer('radios')}
		</EvaPanel>
	</div>

	<div class="grid-2">
		<EvaPanel title="TEXT INPUT & TEXTAREA" code="FRM-01" status="FUNCTIONAL">
			{#snippet actions()}
				{@render codeBtn('inputs')}
			{/snippet}
			<div class="stack">
				<EvaInput bind:value={callsign} label="PILOT CALLSIGN" code="IN-01" />
				<EvaInput label="ACCESS KEY" type="password" value="nerv-00" error="CLEARANCE EXPIRED" code="ERR" />
				<EvaTextarea bind:value={missionNotes} />
			</div>
			{@render codeDrawer('inputs')}
		</EvaPanel>

		<EvaPanel title="ACCORDION / SYSTEM SPECS" code="INF-01" status="FUNCTIONAL">
			{#snippet actions()}
				{@render codeBtn('accordion')}
			{/snippet}
			<EvaAccordion />
			{@render codeDrawer('accordion')}
		</EvaPanel>
	</div>

	<div class="grid-2">
		<EvaPanel title="BREADCRUMB, PAGINATION & LOADERS" code="NAV-01" status="FUNCTIONAL">
			{#snippet actions()}
				{@render codeBtn('navFeedback')}
			{/snippet}
			<div class="stack">
				<EvaBreadcrumb />
				<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem;">
					<EvaPagination bind:page={currentPage} totalPages={6} />
					<EvaTooltip text="SECTOR CLEARANCE: LEVEL-A">
						<span class="eva-badge">PAGE 0{currentPage}</span>
					</EvaTooltip>
				</div>
				<EvaSpinner label="MAGI LINK SYNCHRONIZING..." />
				<div class="eva-skeleton" style="width: 100%"></div>
				<div class="eva-skeleton" style="width: 72%"></div>
			</div>
			{@render codeDrawer('navFeedback')}
		</EvaPanel>

		<EvaPanel title="MODAL DIALOG & TOAST NOTIFICATIONS" code="DLG-01" status="FUNCTIONAL">
			{#snippet actions()}
				{@render codeBtn('overlays')}
			{/snippet}
			<div class="stack">
				<p class="eva-mono-label">TRIGGER INTERACTIVE DIALOGS OR FLOATING TOAST ALERTS:</p>
				<div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
					<button type="button" class="eva-btn" onclick={() => (modalOpen = true)}>
						OPEN MODAL DIALOG
					</button>
					<button type="button" class="eva-btn" onclick={() => pushToast('info')}>
						TOAST: INFO
					</button>
					<button type="button" class="eva-btn" onclick={() => pushToast('warning')}>
						TOAST: WARNING
					</button>
					<button type="button" class="eva-btn" onclick={() => pushToast('nominal')}>
						TOAST: NOMINAL
					</button>
					<button type="button" class="eva-btn eva-btn-danger" onclick={() => pushToast('emergency')}>
						TOAST: EMERGENCY
					</button>
				</div>
			</div>
			{@render codeDrawer('overlays')}
		</EvaPanel>
	</div>

	<div class="grid-2">
		<EvaPanel title="NAVIGATION: BENTO, DRAWER & MENUS" code="NAV-02" status="40-ELEMENTS">
			{#snippet actions()}
				{@render codeBtn('navMenus')}
			{/snippet}
			<div class="stack">
				<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;">
					<EvaBentoMenu />
					<EvaActionMenu variant="hamburger" />
					<EvaActionMenu variant="kebab" />
					<EvaActionMenu variant="meatballs" />
				</div>
				<div style="display: flex; flex-wrap: wrap; gap: 0.85rem; align-items: flex-start;">
					<EvaSidebar />
					<div style="flex: 1; min-width: 180px;">
						<EvaLinkList />
					</div>
				</div>
			</div>
			{@render codeDrawer('navMenus')}
		</EvaPanel>

		<EvaPanel title="ADVANCED INPUTS & FORM" code="FRM-02" status="40-ELEMENTS">
			{#snippet actions()}
				{@render codeBtn('advancedInputs')}
			{/snippet}
			<form
				class="stack"
				onsubmit={(e) => {
					e.preventDefault();
					formSubmitted = `FORM DISPATCHED // DATE=${opDate} FLOW=${flowStepper} L/s`;
				}}
			>
				<EvaInput type="search" label="SEARCH RECORDS" jpLabel="検索" bind:value={searchQuery} placeholder="SEARCH..." code="SRC" />
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem;">
					<EvaComboBox />
					<EvaDatePicker bind:value={opDate} />
				</div>
				<EvaMultiSelect />
				<div style="display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 0.75rem;">
					<EvaStepper bind:value={flowStepper} />
					<button type="submit" class="eva-btn">SUBMIT FORM</button>
				</div>
				<EvaFilterChips />
				<EvaCrtControl />
				{#if formSubmitted}
					<span class="eva-badge">{formSubmitted}</span>
				{/if}
			</form>
			{@render codeDrawer('advancedInputs')}
		</EvaPanel>
	</div>

	<div class="grid-2">
		<EvaPanel title="DISPLAY: CAROUSEL, AVATARS & ICONS" code="DSP-01" status="40-ELEMENTS">
			{#snippet actions()}
				{@render codeBtn('displayElements')}
			{/snippet}
			<div class="stack">
				<EvaCarousel />
				<div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
					<EvaAvatar initials="IK" label="IKARI, SHINJI" status="online" />
					<EvaAvatar initials="AR" label="AYANAMI, REI" status="alert" />
					<EvaAvatar initials="LA" label="LANGLEY, ASUKA" status="offline" size="sm" />
				</div>
				<div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
					{#each ['warning', 'magi', 'lock', 'power', 'radar', 'terminal', 'audio', 'search'] as const as ic}
						<EvaTooltip text={ic.toUpperCase()}>
							<EvaIcon name={ic} size={22} />
						</EvaTooltip>
					{/each}
				</div>
			</div>
			{@render codeDrawer('displayElements')}
		</EvaPanel>

		<EvaPanel title="OPERATOR COMMENT THREAD" code="FDB-01" status="40-ELEMENTS">
			{#snippet actions()}
				{@render codeBtn('comments')}
			{/snippet}
			<EvaCommentThread />
			{@render codeDrawer('comments')}
		</EvaPanel>
	</div>

	<EvaModal bind:open={modalOpen} title="MAGI OVERRIDE AUTHORIZATION" code="DLG-01" variant="alert">
		<p>Authorize Level-A manual override for Central Dogma blast gates?</p>
		{#snippet footer()}
			<button type="button" class="eva-btn" onclick={() => (modalOpen = false)}>CANCEL</button>
			<button
				type="button"
				class="eva-btn eva-btn-danger"
				onclick={() => {
					modalOpen = false;
					pushToast('emergency');
				}}
			>
				EXECUTE OVERRIDE
			</button>
		{/snippet}
	</EvaModal>

	<EvaToast bind:toasts />

	<EvaTitleCard
		variant="banner"
		kicker="SECTION 04"
		line1="ADDITIONAL HUD"
		line2="& TYPOGRAPHY"
		subtitle="STATUS MATRICES, HEX GRIDS & TITLE CARDS"
	/>

	<div class="grid-2">
		<EvaPanel title="BLOOD TYPE: BLUE // SPECTRUM" code="PAT-BLUE" status="HUD">
			{#snippet actions()}
				{@render codeBtn('patternBlue')}
			{/snippet}
			<EvaPatternBlue />
			{@render codeDrawer('patternBlue')}
		</EvaPanel>

		<EvaPanel title="SECTOR LOCKDOWN MATRIX" code="HQ-09" status="INTERACTIVE">
			{#snippet actions()}
				{@render codeBtn('statusWall')}
			{/snippet}
			<EvaNervStatusWall />
			{@render codeDrawer('statusWall')}
		</EvaPanel>
	</div>

	<div class="grid-2">
		<EvaPanel title="TACTICAL HEX GRID" code="GEO-07" status="CLICKABLE">
			{#snippet actions()}
				{@render codeBtn('hex')}
			{/snippet}
			<EvaHexGrid rows={4} cols={6} />
			{@render codeDrawer('hex')}
		</EvaPanel>

		<EvaPanel title="EPISODE TITLE CARD" code="TXT-01" status="TYPOGRAPHY">
			{#snippet actions()}
				{@render codeBtn('titleCard')}
			{/snippet}
			<EvaTitleCard />
			{@render codeDrawer('titleCard')}
		</EvaPanel>
	</div>

	<EvaPanel title="BOXED STATUS STAMPS" code="TXT-02" status="BADGES">
		{#snippet actions()}
			{@render codeBtn('stamp')}
		{/snippet}
		<div class="stamp-showcase">
			<EvaStampBadge label="REFUSED" sublabel="MAGI // 01-03" variant="alert" tilt={-3} />
			<EvaStampBadge label="ACCEPTED" sublabel="MAGI // CONSENSUS" variant="cyan" filled />
			<EvaStampBadge label="TOP SECRET" sublabel="NERV // EYES ONLY" variant="amber" />
			<EvaStampBadge label="CONFIRMED" sublabel="PATTERN BLUE" variant="mono" filled />
		</div>
		{@render codeDrawer('stamp')}
	</EvaPanel>

	<EvaPanel title="REUSE & INTEGRATION GUIDE (CONTAINER: EvaPanel)" code="PKG-01" status="SVELTE 5 + WC + CSS">
		{#snippet actions()}
			{@render codeBtn('panel')}
		{/snippet}
		<div class="usage-tabs">
			<button type="button" class="eva-btn" onclick={() => (usageTab = 'svelte')}>SVELTE 5</button>
			<button type="button" class="eva-btn" onclick={() => (usageTab = 'webcomponent')}>
				WEB COMPONENTS
			</button>
			<button type="button" class="eva-btn" onclick={() => (usageTab = 'css')}>PURE CSS TOKENS</button>
		</div>
		<pre class="code-block"><code>{usageTab === 'svelte'
					? svelteSnippet
					: usageTab === 'webcomponent'
						? wcSnippet
						: cssSnippet}</code></pre>
		{@render codeDrawer('panel')}
	</EvaPanel>
</div>

<style>
	.playground {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.hero-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-top: 0.75rem;
		padding: 0.65rem 0.85rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 2px;
		border-radius: 5px;
	}

	.control-group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
		gap: 0.85rem;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
		gap: 1.25rem;
	}

	@media (max-width: 1000px) {
		.grid-2 {
			grid-template-columns: 1fr;
		}
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.slider-row {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.slider-row input {
		accent-color: var(--eva-primary);
	}

	.code-toggle-btn {
		min-width: 88px;
		padding: 0.14rem 0.52rem;
		font-size: 0.72rem;
	}

	.code-toggle-btn.is-open {
		border-color: #46f76a;
		color: #46f76a;
		text-shadow: 0 0 8px rgba(70, 247, 106, 0.5);
	}

	.copy-btn {
		min-width: 76px;
		text-align: center;
	}

	.copy-btn.is-copied {
		border-color: #46f76a;
		color: #46f76a;
	}

	.code-drawer {
		margin-top: 0.85rem;
		border: 1.5px solid var(--eva-border-strong);
		outline: 1px solid var(--eva-border);
		outline-offset: 1px;
		border-radius: 5px;
		background: #000000;
	}

	.code-drawer__bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.55rem;
		background: #000000;
		border-bottom: 1.5px solid var(--eva-border-strong);
	}

	.code-drawer__tabs {
		display: flex;
		gap: 0.35rem;
	}

	.mini-btn {
		padding: 0.14rem 0.52rem;
		font-family: var(--eva-font-display);
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		background: #000000;
		color: var(--eva-primary);
		border: 1.5px solid var(--eva-border);
		border-radius: 4px;
		cursor: pointer;
	}

	.mini-btn.is-active,
	.mini-btn:hover {
		color: #000000;
		background: var(--eva-primary);
		border-color: var(--eva-border-strong);
	}

	.code-drawer__pre {
		margin: 0;
		padding: 0.75rem;
		max-height: 280px;
		overflow: auto;
		font-family: var(--eva-font-mono);
		font-size: 0.73rem;
		line-height: 1.45;
		color: var(--eva-text-hi);
	}

	.stamp-showcase {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 1.1rem;
		padding: 0.9rem 0.5rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 5px;
		min-height: 155px;
	}

	.usage-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.code-block {
		margin: 0;
		padding: 1rem;
		background: #000000;
		border: 1.5px solid var(--eva-border-strong);
		border-radius: 5px;
		color: var(--eva-text-hi);
		font-family: var(--eva-font-mono);
		font-size: 0.8rem;
		overflow-x: auto;
	}

	.comp-timer__main {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.85rem;
		align-items: stretch;
	}

	@media (max-width: 560px) {
		.comp-timer__main {
			grid-template-columns: 1fr;
		}
	}

	.comp-timer__left {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.4rem;
		min-width: 0;
	}

	.comp-timer__right {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		min-width: 165px;
	}

	.comp-timer__footer {
		--t-color: #ff941a;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.65rem;
		border-top: 1.5px solid var(--t-color);
		padding-top: 0.5rem;
	}

	.comp-timer__footer.is-critical {
		--t-color: #ff2222;
	}

	.comp-timer__acts {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		flex-shrink: 0;
	}

	.comp-rst {
		min-width: 96px;
	}

	.atom-row,
	.atom-pills {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.45rem;
	}

	.atom-chamfers,
	.def-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 175px), 1fr));
		gap: 0.55rem;
	}

	.def-mid {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
</style>
