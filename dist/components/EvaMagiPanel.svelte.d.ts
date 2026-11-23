import { type MagiVote } from './EvaMagiNode.svelte';
export interface MagiNode {
    id: string;
    name: string;
    role?: string;
    vote: MagiVote;
}
interface Props {
    title?: string;
    issue?: string;
    nodes?: MagiNode[];
    interactive?: boolean;
    onNodeClick?: (node: MagiNode, index: number) => void;
}
declare const EvaMagiPanel: import("svelte").Component<Props, {}, "nodes">;
type EvaMagiPanel = ReturnType<typeof EvaMagiPanel>;
export default EvaMagiPanel;
