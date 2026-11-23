import type { Snippet } from 'svelte';
interface Props {
    gap?: string;
    top?: Snippet;
    bottomLeft?: Snippet;
    bottomRight?: Snippet;
    children?: Snippet;
}
declare const EvaTriadGrid: import("svelte").Component<Props, {}, "">;
type EvaTriadGrid = ReturnType<typeof EvaTriadGrid>;
export default EvaTriadGrid;
