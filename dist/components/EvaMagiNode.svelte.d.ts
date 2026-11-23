export type MagiVote = 'approved' | 'denied' | 'pending' | 'override' | 'rejected';
interface Props {
    name?: string;
    role?: string;
    vote?: MagiVote;
    flashPhase?: boolean;
    interactive?: boolean;
    onSelect?: () => void;
}
declare const EvaMagiNode: import("svelte").Component<Props, {}, "">;
type EvaMagiNode = ReturnType<typeof EvaMagiNode>;
export default EvaMagiNode;
