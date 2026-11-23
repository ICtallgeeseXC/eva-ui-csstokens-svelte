interface Props {
    variant?: 'pill' | 'striped' | 'stacked';
    jpLabel?: string;
    label?: string;
    color?: string;
    inverted?: boolean;
    critical?: boolean;
    align?: 'left' | 'center';
    outlined?: boolean;
    glow?: boolean;
    size?: 'sm' | 'md';
    minWidth?: string;
}
declare const EvaStatusTag: import("svelte").Component<Props, {}, "">;
type EvaStatusTag = ReturnType<typeof EvaStatusTag>;
export default EvaStatusTag;
