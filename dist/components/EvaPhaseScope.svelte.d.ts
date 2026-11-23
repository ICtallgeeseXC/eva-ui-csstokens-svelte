interface Props {
    audioSrc?: string;
    showControls?: boolean;
    externalAnalyser?: AnalyserNode | null;
    externalPlaying?: boolean;
    externalTrackLabel?: string;
}
declare const EvaPhaseScope: import("svelte").Component<Props, {}, "">;
type EvaPhaseScope = ReturnType<typeof EvaPhaseScope>;
export default EvaPhaseScope;
