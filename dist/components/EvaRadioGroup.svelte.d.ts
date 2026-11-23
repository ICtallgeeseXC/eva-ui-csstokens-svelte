export interface RadioOption {
    value: string;
    label: string;
    code?: string;
}
interface Props {
    options?: RadioOption[];
    value?: string;
    name?: string;
}
declare const EvaRadioGroup: import("svelte").Component<Props, {}, "value">;
type EvaRadioGroup = ReturnType<typeof EvaRadioGroup>;
export default EvaRadioGroup;
