export interface HexCell {
    id: string;
    label?: string;
    state?: 'idle' | 'active' | 'alert' | 'nominal';
}
interface Props {
    rows?: number;
    cols?: number;
    hexSize?: number;
    cells?: Record<string, HexCell>;
    interactive?: boolean;
    autoCycle?: boolean;
    selectedId?: string;
    onCellClick?: (id: string, cell: HexCell) => void;
}
declare const EvaHexGrid: import("svelte").Component<Props, {}, "cells">;
type EvaHexGrid = ReturnType<typeof EvaHexGrid>;
export default EvaHexGrid;
