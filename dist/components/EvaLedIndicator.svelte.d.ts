interface Props {
    label?: string;
    jpTag?: string;
    state?: 'on' | 'off' | 'warn' | 'crit' | 'info';
    pulse?: boolean;
    minWidth?: string;
}
declare const EvaLedIndicator: import("svelte").Component<Props, {}, "">;
type EvaLedIndicator = ReturnType<typeof EvaLedIndicator>;
export default EvaLedIndicator;
