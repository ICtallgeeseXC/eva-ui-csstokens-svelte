interface Props {
    audioSrc?: string;
    bars?: number;
    showControls?: boolean;
    externalAnalyser?: AnalyserNode | null;
    externalPlaying?: boolean;
    externalTrackLabel?: string;
}
declare const EvaEnergyVisualizer: import("svelte").Component<Props, {}, "">;
type EvaEnergyVisualizer = ReturnType<typeof EvaEnergyVisualizer>;
export default EvaEnergyVisualizer;
