interface Props {
    label?: string;
    jpLabel?: string;
    value?: string;
    placeholder?: string;
    type?: 'text' | 'password' | 'email' | 'number' | 'search';
    code?: string;
    error?: string;
    disabled?: boolean;
}
declare const EvaInput: import("svelte").Component<Props, {}, "value">;
type EvaInput = ReturnType<typeof EvaInput>;
export default EvaInput;
