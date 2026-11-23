import type { Snippet } from 'svelte';
interface Props {
    text?: string;
    position?: 'top' | 'bottom';
    children?: Snippet;
}
declare const EvaTooltip: import("svelte").Component<Props, {}, "">;
type EvaTooltip = ReturnType<typeof EvaTooltip>;
export default EvaTooltip;
