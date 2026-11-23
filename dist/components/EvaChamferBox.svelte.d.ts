import type { Snippet } from 'svelte';
interface Props {
    cut?: number;
    borderWidth?: number;
    color?: string;
    bg?: string;
    filled?: boolean;
    hatched?: boolean;
    clickable?: boolean;
    disabled?: boolean;
    minHeight?: string;
    padding?: string;
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    onclick?: () => void;
    children?: Snippet;
}
declare const EvaChamferBox: import("svelte").Component<Props, {}, "">;
type EvaChamferBox = ReturnType<typeof EvaChamferBox>;
export default EvaChamferBox;
