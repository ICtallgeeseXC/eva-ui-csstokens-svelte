import type { Snippet } from 'svelte';
interface Props {
    text?: string;
    subtext?: string;
    eyebrow?: string;
    color?: string;
    borderColor?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    bg?: string;
    width?: string;
    minWidth?: string;
    align?: 'left' | 'center' | 'right';
    mono?: boolean;
    children?: Snippet;
}
declare const EvaHudBox: import("svelte").Component<Props, {}, "">;
type EvaHudBox = ReturnType<typeof EvaHudBox>;
export default EvaHudBox;
