interface Props {
    headline?: string;
    subtext?: string;
    jpLabel?: string;
    severity?: 'emergency' | 'warning' | 'info' | 'nominal';
    animatedStripes?: boolean;
}
declare const EvaAlertBanner: import("svelte").Component<Props, {}, "">;
type EvaAlertBanner = ReturnType<typeof EvaAlertBanner>;
export default EvaAlertBanner;
