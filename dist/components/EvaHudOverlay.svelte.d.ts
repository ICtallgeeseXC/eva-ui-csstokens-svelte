import { type Snippet } from 'svelte';
interface Props {
    recLabel?: string;
    paused?: boolean;
    zoomLabel?: string;
    slides?: string[];
    slideCount?: number;
    activeIndex?: number;
    disabledIndices?: number[];
    slideCodes?: string[];
    shuffle?: boolean;
    intervalMs?: number;
    showControls?: boolean;
    showReticles?: boolean;
    interactive?: boolean;
    aspectRatio?: string;
    onSelect?: (index: number) => void;
    children?: Snippet;
}
declare const EvaHudOverlay: import("svelte").Component<Props, {}, "paused" | "activeIndex">;
type EvaHudOverlay = ReturnType<typeof EvaHudOverlay>;
export default EvaHudOverlay;
