interface Props {
    direction?: 'left' | 'right' | 'chevron';
    color?: string;
    bg?: string;
    height?: string;
    stripeWidth?: number;
    animated?: boolean;
    centerTag?: string;
}
declare const EvaHazardStrip: import("svelte").Component<Props, {}, "">;
type EvaHazardStrip = ReturnType<typeof EvaHazardStrip>;
export default EvaHazardStrip;
