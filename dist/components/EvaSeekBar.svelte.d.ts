interface Props {
    value?: number;
    max?: number;
    buffered?: number;
    active?: boolean;
    color?: string;
    segments?: number;
    showRuler?: boolean;
    compact?: boolean;
    disabled?: boolean;
    glowAtFull?: boolean;
    label?: string;
    formatValue?: (val: number) => string;
    onSeek?: (next: number) => void;
}
declare const EvaSeekBar: import("svelte").Component<Props, {}, "value">;
type EvaSeekBar = ReturnType<typeof EvaSeekBar>;
export default EvaSeekBar;
