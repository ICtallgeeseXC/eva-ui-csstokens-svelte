import type { Snippet } from 'svelte';
interface Props {
    jp?: string;
    title?: string;
    code?: string;
    color?: string;
    flanked?: boolean;
    ruled?: boolean;
    right?: Snippet;
}
declare const EvaBilingualHeader: import("svelte").Component<Props, {}, "">;
type EvaBilingualHeader = ReturnType<typeof EvaBilingualHeader>;
export default EvaBilingualHeader;
