interface Props {
    audioSrc?: string;
    showControls?: boolean;
    externalAnalyser?: AnalyserNode | null;
    externalPlaying?: boolean;
    externalTrackLabel?: string;
}
declare const EvaCircuitVisualizer: import("svelte").Component<Props, {}, "">;
type EvaCircuitVisualizer = ReturnType<typeof EvaCircuitVisualizer>;
export default EvaCircuitVisualizer;
