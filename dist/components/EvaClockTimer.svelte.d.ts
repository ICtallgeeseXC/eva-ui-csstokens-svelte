interface Props {
    mode?: 'countdown' | 'clock';
    initialSeconds?: number;
    label?: string;
    running?: boolean;
}
declare const EvaClockTimer: import("svelte").Component<Props, {}, "running">;
type EvaClockTimer = ReturnType<typeof EvaClockTimer>;
export default EvaClockTimer;
