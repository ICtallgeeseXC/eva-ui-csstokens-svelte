export interface BreadcrumbItem {
    id: string;
    label: string;
}
interface Props {
    items?: BreadcrumbItem[];
    activeId?: string;
    startIndex?: number;
    onNavigate?: (id: string) => void;
}
declare const EvaBreadcrumb: import("svelte").Component<Props, {}, "activeId">;
type EvaBreadcrumb = ReturnType<typeof EvaBreadcrumb>;
export default EvaBreadcrumb;
