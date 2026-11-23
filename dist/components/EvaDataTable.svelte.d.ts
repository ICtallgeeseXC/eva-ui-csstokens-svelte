export interface TableColumn {
    key: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    sortable?: boolean;
    type?: 'text' | 'number';
}
interface Props {
    columns?: TableColumn[];
    rows?: Record<string, string | number>[];
    searchable?: boolean;
    editable?: boolean;
    selectedIndex?: number | null;
    onRowSelect?: (row: Record<string, string | number>, index: number) => void;
    onRowsChange?: (rows: Record<string, string | number>[]) => void;
}
declare const EvaDataTable: import("svelte").Component<Props, {}, "rows" | "selectedIndex">;
type EvaDataTable = ReturnType<typeof EvaDataTable>;
export default EvaDataTable;
