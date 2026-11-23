interface Props {
    label?: string;
    value?: number;
    max?: number;
    segments?: number;
    dangerThreshold?: number;
    dangerMode?: 'low' | 'high';
    unit?: string;
}
declare const EvaProgressBar: import("svelte").Component<Props, {}, "">;
type EvaProgressBar = ReturnType<typeof EvaProgressBar>;
export default EvaProgressBar;
