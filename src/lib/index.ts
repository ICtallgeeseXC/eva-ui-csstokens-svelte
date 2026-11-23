export { default as EvaPanel } from './components/EvaPanel.svelte';
export { default as EvaAlertBanner } from './components/EvaAlertBanner.svelte';
export { default as EvaClockTimer } from './components/EvaClockTimer.svelte';
export { default as EvaEnergyVisualizer } from './components/EvaEnergyVisualizer.svelte';
export { default as EvaEqPillars } from './components/EvaEqPillars.svelte';
export { default as EvaPhaseScope } from './components/EvaPhaseScope.svelte';
export { default as EvaCircuitVisualizer } from './components/EvaCircuitVisualizer.svelte';
export { default as EvaAudioController } from './components/EvaAudioController.svelte';
export { default as EvaWaveform } from './components/EvaWaveform.svelte';
export { default as EvaMagiPanel, type MagiNode } from './components/EvaMagiPanel.svelte';
export { default as EvaMagiNode, type MagiVote } from './components/EvaMagiNode.svelte';
export {
	default as EvaMagiResolution,
	type MagiResolutionStatus
} from './components/EvaMagiResolution.svelte';
export { default as EvaHudOverlay } from './components/EvaHudOverlay.svelte';
export { default as EvaTerminal, type TerminalLog } from './components/EvaTerminal.svelte';
export { default as EvaBootTerminal } from './components/EvaBootTerminal.svelte';

// Functional / Application UI
export { default as EvaDataTable, type TableColumn } from './components/EvaDataTable.svelte';
export { default as EvaTabs, type EvaTabItem } from './components/EvaTabs.svelte';
export { default as EvaStatCard } from './components/EvaStatCard.svelte';
export { default as EvaProgressBar } from './components/EvaProgressBar.svelte';
export { default as EvaCheckbox } from './components/EvaCheckbox.svelte';
export { default as EvaRadioGroup, type RadioOption } from './components/EvaRadioGroup.svelte';
export { default as EvaToggle } from './components/EvaToggle.svelte';
export { default as EvaSelect } from './components/EvaSelect.svelte';
export { default as EvaInput } from './components/EvaInput.svelte';
export { default as EvaTextarea } from './components/EvaTextarea.svelte';
export { default as EvaModal } from './components/EvaModal.svelte';
export { default as EvaAccordion, type AccordionItem } from './components/EvaAccordion.svelte';
export { default as EvaToast, type ToastItem } from './components/EvaToast.svelte';
export { default as EvaBreadcrumb, type BreadcrumbItem } from './components/EvaBreadcrumb.svelte';
export { default as EvaPagination } from './components/EvaPagination.svelte';
export { default as EvaTooltip } from './components/EvaTooltip.svelte';
export { default as EvaSpinner } from './components/EvaSpinner.svelte';

// Extended 40 Essential UI Elements
export { default as EvaBentoMenu, type BentoItem } from './components/EvaBentoMenu.svelte';
export { default as EvaActionMenu } from './components/EvaActionMenu.svelte';
export { default as EvaSidebar, type SidebarItem } from './components/EvaSidebar.svelte';
export { default as EvaLinkList, type LinkEntry } from './components/EvaLinkList.svelte';
export { default as EvaComboBox } from './components/EvaComboBox.svelte';
export { default as EvaMultiSelect } from './components/EvaMultiSelect.svelte';
export { default as EvaDatePicker } from './components/EvaDatePicker.svelte';
export { default as EvaStepper } from './components/EvaStepper.svelte';
export { default as EvaFilterChips } from './components/EvaFilterChips.svelte';
export { default as EvaAvatar } from './components/EvaAvatar.svelte';
export { default as EvaIcon, type EvaIconName } from './components/EvaIcon.svelte';
export { default as EvaCommentThread, type CommentEntry } from './components/EvaCommentThread.svelte';
export { default as EvaCarousel, type CarouselSlide } from './components/EvaCarousel.svelte';

// Additional HUD & Typography Elements
export { default as EvaHexGrid, type HexCell } from './components/EvaHexGrid.svelte';
export { default as EvaPatternMatrix } from './components/EvaPatternMatrix.svelte';
export { default as EvaPatternBlue } from './components/EvaPatternBlue.svelte';
export { default as EvaNervStatusWall, type StatusCell } from './components/EvaNervStatusWall.svelte';
export { default as EvaTitleCard } from './components/EvaTitleCard.svelte';
export { default as EvaStampBadge } from './components/EvaStampBadge.svelte';
export { default as EvaCrtControl, type CrtMode } from './components/EvaCrtControl.svelte';
export { default as EvaTransportButton } from './components/EvaTransportButton.svelte';
export { default as EvaSegmentDisplay } from './components/EvaSegmentDisplay.svelte';
export { default as EvaStatusTag } from './components/EvaStatusTag.svelte';
export { default as EvaModeStrip } from './components/EvaModeStrip.svelte';

// Atomic Building Blocks
export { default as EvaFrame } from './components/EvaFrame.svelte';
export { default as EvaCapsulePill } from './components/EvaCapsulePill.svelte';
export { default as EvaHazardStrip } from './components/EvaHazardStrip.svelte';
export { default as EvaRulerScale } from './components/EvaRulerScale.svelte';
export { default as EvaLedIndicator } from './components/EvaLedIndicator.svelte';
export { default as EvaChamferBox } from './components/EvaChamferBox.svelte';
export { default as EvaBilingualHeader } from './components/EvaBilingualHeader.svelte';
export { default as EvaSplitReadout } from './components/EvaSplitReadout.svelte';
export { default as EvaTriadGrid } from './components/EvaTriadGrid.svelte';
export { default as EvaHudBox } from './components/EvaHudBox.svelte';
export { default as EvaSeekBar } from './components/EvaSeekBar.svelte';
export {
	evaGlitch,
	evaTransition,
	type EvaTransitionConfig,
	type EvaTransitionOption,
	type EvaTransitionPreset
} from './transitions';

export type EvaTheme = 'nerv' | 'emergency' | 'magi-cyan' | 'sync' | 'mono';

export const EVA_THEMES: { id: EvaTheme; label: string; primary: string }[] = [
	{ id: 'nerv', label: 'NERV AMBER', primary: '#ff8c00' },
	{ id: 'emergency', label: 'EMERGENCY', primary: '#ff2222' },
	{ id: 'magi-cyan', label: 'MAGI CYAN', primary: '#00e1ff' },
	{ id: 'sync', label: 'SYNC GREEN', primary: '#26f78b' },
	{ id: 'mono', label: 'WIREFRAME', primary: '#f5f5f5' }
];
