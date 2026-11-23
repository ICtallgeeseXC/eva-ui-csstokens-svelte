interface Props {
    label?: string;
    value?: string | number;
    unit?: string;
    delta?: string;
    trend?: 'up' | 'down' | 'neutral';
    sentiment?: 'auto' | 'positive' | 'negative' | 'neutral';
    code?: string;
}
declare const EvaStatCard: import("svelte").Component<Props, {}, "">;
type EvaStatCard = ReturnType<typeof EvaStatCard>;
export default EvaStatCard;
