import type { Snippet } from 'svelte';
interface Props {
    variant?: 'double' | 'flanked' | 'single';
    color?: string;
    scanlines?: boolean;
    padding?: string;
    gap?: string;
    children?: Snippet;
}
declare const EvaFrame: import("svelte").Component<Props, {}, "">;
type EvaFrame = ReturnType<typeof EvaFrame>;
export default EvaFrame;
