interface Props {
    audioSrc?: string;
    bands?: number;
    channels?: string[];
    showControls?: boolean;
    externalAnalyser?: AnalyserNode | null;
    externalPlaying?: boolean;
    externalTrackLabel?: string;
}
declare const EvaEqPillars: import("svelte").Component<Props, {}, "">;
type EvaEqPillars = ReturnType<typeof EvaEqPillars>;
export default EvaEqPillars;
