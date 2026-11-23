interface Props {
    label?: string;
    jpLabel?: string;
    value?: string;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
}
declare const EvaTextarea: import("svelte").Component<Props, {}, "value">;
type EvaTextarea = ReturnType<typeof EvaTextarea>;
export default EvaTextarea;
