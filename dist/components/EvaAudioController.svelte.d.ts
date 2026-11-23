interface Props {
    audioSrc?: string;
    trackLabel?: string;
    playing?: boolean;
    currentTime?: number;
    duration?: number;
    volume?: number;
    muted?: boolean;
    loop?: boolean;
    showLoad?: boolean;
    showVolume?: boolean;
    titleMode?: 'bar' | 'episode';
    showTitleToggle?: boolean;
    episodeKicker?: string;
    episodeSubtitle?: string;
    episodeInverted?: boolean;
    analyser?: AnalyserNode | null;
    onPlayChange?: (playing: boolean) => void;
    onSeek?: (time: number) => void;
    onTrackLoad?: (info: {
        name: string;
        url: string;
    }) => void;
}
declare const EvaAudioController: import("svelte").Component<Props, {}, "playing" | "trackLabel" | "currentTime" | "duration" | "volume" | "muted" | "loop" | "titleMode" | "analyser">;
type EvaAudioController = ReturnType<typeof EvaAudioController>;
export default EvaAudioController;
