interface Props {
    label?: string;
    syncRate?: number;
    animated?: boolean;
    dynamic?: boolean;
    dynamicMinMs?: number;
    dynamicMaxMs?: number;
    height?: number;
    ribbonTrails?: number;
}
declare const EvaWaveform: import("svelte").Component<Props, {}, "syncRate" | "dynamic">;
type EvaWaveform = ReturnType<typeof EvaWaveform>;
export default EvaWaveform;
