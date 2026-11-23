interface Props {
    patternName?: string;
    classification?: string;
    bars?: number;
    animated?: boolean;
    audioSrc?: string;
    showControls?: boolean;
    externalAnalyser?: AnalyserNode | null;
    externalPlaying?: boolean;
    externalTrackLabel?: string;
}
declare const EvaPatternMatrix: import("svelte").Component<Props, {}, "">;
type EvaPatternMatrix = ReturnType<typeof EvaPatternMatrix>;
export default EvaPatternMatrix;
