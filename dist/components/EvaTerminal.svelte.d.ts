export interface TerminalLog {
    time: string;
    level?: 'info' | 'warn' | 'crit';
    message: string;
}
interface Props {
    logs?: TerminalLog[];
    streaming?: boolean;
    intervalMs?: number;
    visibleLines?: number;
}
declare const EvaTerminal: import("svelte").Component<Props, {}, "">;
type EvaTerminal = ReturnType<typeof EvaTerminal>;
export default EvaTerminal;
