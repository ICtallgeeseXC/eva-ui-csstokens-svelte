export interface EvaTabItem {
    id: string;
    label: string;
    badge?: string | number;
}
interface Props {
    tabs?: EvaTabItem[];
    activeId?: string;
    onChange?: (id: string) => void;
}
declare const EvaTabs: import("svelte").Component<Props, {}, "activeId">;
type EvaTabs = ReturnType<typeof EvaTabs>;
export default EvaTabs;
