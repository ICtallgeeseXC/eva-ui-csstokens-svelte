export interface SidebarItem {
    id: string;
    code: string;
    label: string;
}
interface Props {
    title?: string;
    items?: SidebarItem[];
    activeId?: string;
    collapsed?: boolean;
}
declare const EvaSidebar: import("svelte").Component<Props, {}, "activeId" | "collapsed">;
type EvaSidebar = ReturnType<typeof EvaSidebar>;
export default EvaSidebar;
