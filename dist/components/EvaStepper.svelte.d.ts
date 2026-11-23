interface Props {
    label?: string;
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
}
declare const EvaStepper: import("svelte").Component<Props, {}, "value">;
type EvaStepper = ReturnType<typeof EvaStepper>;
export default EvaStepper;
